"use server";

import { createClient } from "@/lib/supabase/server";

import { prisma } from "@/lib/prisma";
import { logInfo } from "@/lib/logger";
import { withServerAction } from "@/lib/server-action-wrapper";

/**
 * Creates a record in the Prisma User table for a user that just signed up via Supabase.
 * This ensures that existing relations (loans, etc.) still work.
 */
export async function syncUserWithPrisma(data: {
  id: string;
  email: string;
  name?: string;
}) {
  return await withServerAction("syncUserWithPrisma", async () => {
    const { id, email, name } = data;

    // Check if user already exists in Prisma
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (existingUser) {
      return { success: true, userId: existingUser.id };
    }

    // Create user in Prisma using the Supabase UUID as the ID
    const user = await prisma.user.create({
      data: {
        id,
        email,
        name,
        emailVerified: new Date(), // Supabase handles verification
      },
    });

    logInfo("user_prisma_sync_success", { userId: user.id, email });
    return { success: true, userId: user.id };
  });
}


/**
 * Sends a password reset email using Supabase.
 */
export async function forgotPassword(data: { email: string; captchaToken?: string }) {
  return await withServerAction("forgotPassword", async () => {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      captchaToken: data.captchaToken || undefined,
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/callback?next=/reset-password`,
    });

    if (error) {
      return { error: error.message };
    }

    return { success: true };
  });
}

/**
 * Resets the password using the current session (Supabase handles the token automatically if redirected correctly).
 */
export async function resetPassword(data: { password: string }) {
  return await withServerAction("resetPassword", async () => {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      return { error: error.message };
    }

    return { success: true };
  });
}

import crypto from "crypto";

const FALLBACK_LEAKED_PASSWORDS = new Set([
  "123456", "password", "12345678", "qwerty", "123456789", "12345", "1234567",
  "password1", "1234567890", "welcome", "admin", "1234567890a", "p@ssword",
  "admin123", "password123", "pass1234", "letmein", "monkey", "dragon"
]);

/**
 * Checks if a password was previously leaked using the HaveIBeenPwned API range check.
 * Falls back to local common weak password check if HIBP is unreachable.
 */
export async function isPasswordLeaked(password: string): Promise<boolean> {
  if (!password) return false;
  
  const hash = crypto.createHash("sha1").update(password).digest("hex").toUpperCase();
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      signal: controller.signal,
      next: { revalidate: 86400 } // Cache for 24 hours
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return FALLBACK_LEAKED_PASSWORDS.has(password.toLowerCase());
    }

    const data = await response.text();
    const hashes = data.split("\n");

    return hashes.some((h) => h.trim().split(":")[0] === suffix);
  } catch (err) {
    console.warn("HIBP password check timed out or failed. Falling back to local dictionary check:", err);
    return FALLBACK_LEAKED_PASSWORDS.has(password.toLowerCase());
  }
}

