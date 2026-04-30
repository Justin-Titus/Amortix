"use server";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { logInfo, logWarn, reportError } from "@/lib/logger";
import { withServerAction } from "@/lib/server-action-wrapper";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  getFirstZodError,
} from "@/lib/validations/auth.schema";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email";
import { after } from "next/server";

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function registerUser(formData: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}) {
  return await withServerAction("registerUser", async () => {
    const validated = registerSchema.safeParse(formData);
    if (!validated.success) {
      return { error: getFirstZodError(validated.error) };
    }

    const { name, email, password } = validated.data;

    if (!process.env.DATABASE_URL) {
      return { error: "Database connection is not configured. Please set DATABASE_URL." };
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "An account with this email already exists" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Generate verification token
    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = hashToken(token);
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token: hashedToken,
        type: "EMAIL_VERIFICATION",
        expires,
      },
    });

    // Send verification email after the response so signup still succeeds.
    after(() => {
      sendVerificationEmail(email, token, name).catch((err) => {
        reportError(err, { email, userId: user.id, flow: "email_verification" });
      });
    });

    logInfo("register_success", { userId: user.id, email });
    return { success: true };
  });
}

export async function loginUser(formData: {
  email: string;
  password: string;
  callbackUrl?: string;
}) {
  const validated = loginSchema.safeParse(formData);
  if (!validated.success) {
    return { error: getFirstZodError(validated.error) };
  }

  const user = await prisma.user.findUnique({ where: { email: formData.email } });

  if (user) {
    const rateLimit = await checkRateLimit(user.id, "login");
    if (!rateLimit.allowed) {
      logWarn("rate_limit_exceeded", {
        userId: user.id,
        endpoint: "login",
        remaining: rateLimit.remaining,
        resetIn: rateLimit.resetIn,
      });
      return { error: "Too many login attempts. Please try again later." };
    }
  }

  let result;
  try {
    result = await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      redirect: false,
    });
  } catch (error) {
    reportError(error, { flow: "login", email: formData.email });
    logWarn("login_failed", {
      email: formData.email,
      userId: user?.id,
      error: "Auth provider error",
    });
    return { error: "Invalid email or password" };
  }

  if (!result || typeof result !== "object") {
    logWarn("login_failed", {
      email: formData.email,
      userId: user?.id,
      error: "Unexpected response from auth provider",
      resultType: typeof result,
    });
    return { error: "Invalid login response. Please try again later." };
  }

  if (!result.ok || result.error) {
    logWarn("login_failed", {
      email: formData.email,
      userId: user?.id,
      error: "Invalid credentials",
    });
    return { error: "Invalid email or password" };
  }

  if (user && !user.emailVerified) {
    return {
      error:
        "Your email address is not verified yet. Please check your inbox and verify your account before signing in.",
    };
  }

  logInfo("login_success", { email: formData.email, userId: user?.id });
  return {
    success: true,
    redirectTo: formData.callbackUrl || "/dashboard",
  };
}

export async function forgotPassword(formData: { email: string }) {
  return await withServerAction("forgotPassword", async () => {
    const validated = forgotPasswordSchema.safeParse(formData);
    if (!validated.success) {
      return { error: getFirstZodError(validated.error) };
    }

    const { email } = validated.data;
    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return { success: true };
    }

    const rateLimit = await checkRateLimit(user.id, "forgot-password");
    if (!rateLimit.allowed) {
      logWarn("rate_limit_exceeded", {
        userId: user.id,
        endpoint: "forgot-password",
        remaining: rateLimit.remaining,
        resetIn: rateLimit.resetIn,
      });
      return { success: true };
    }

    // Delete any existing reset tokens
    await prisma.verificationToken.deleteMany({
      where: { userId: user.id, type: "PASSWORD_RESET" },
    });

    // Generate new token
    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = hashToken(token);
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token: hashedToken,
        type: "PASSWORD_RESET",
        expires,
      },
    });

    after(() => {
      sendPasswordResetEmail(email, token).catch((err) => {
        reportError(err, { userId: user.id, email, flow: "password_reset_email" });
      });
    });

    logInfo("forgot_password_requested", { userId: user.id, email });
    return { success: true };
  });
}

export async function resetPassword(formData: {
  password: string;
  confirmPassword: string;
  token: string;
}) {
  const validated = resetPasswordSchema.safeParse(formData);
  if (!validated.success) {
    return { error: getFirstZodError(validated.error) };
  }

  const { token, password } = validated.data;
  const hashedToken = hashToken(token);

  // Find valid token
  const tokenRecord = await prisma.verificationToken.findUnique({
    where: { token: hashedToken },
  });

  if (!tokenRecord || tokenRecord.type !== "PASSWORD_RESET") {
    logWarn("password_reset_invalid", { token: hashedToken });
    return { error: "Invalid or expired reset link" };
  }

  if (tokenRecord.userId) {
    const rateLimit = await checkRateLimit(tokenRecord.userId, "reset-password");
    if (!rateLimit.allowed) {
      logWarn("rate_limit_exceeded", {
        userId: tokenRecord.userId,
        endpoint: "reset-password",
        remaining: rateLimit.remaining,
        resetIn: rateLimit.resetIn,
      });
      return { error: "Too many password reset attempts. Please try again later." };
    }
  }

  if (tokenRecord.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { id: tokenRecord.id } });
    return { error: "Reset link has expired. Please request a new one." };
  }

  if (!tokenRecord.userId) {
    return { error: "Invalid reset link" };
  }

  // Update password
  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: tokenRecord.userId },
    data: { password: hashedPassword },
  });

  // Delete used token
  await prisma.verificationToken.delete({ where: { id: tokenRecord.id } });

  logInfo("password_reset_success", { userId: tokenRecord.userId });
  return { success: true };
}
