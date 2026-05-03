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
export async function forgotPassword(data: { email: string }) {
  return await withServerAction("forgotPassword", async () => {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
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

/**
 * Checks if a password was previously leaked using the HaveIBeenPwned API range check.
 */
export async function isPasswordLeaked(password: string): Promise<boolean> {
  if (!password) return false;
  
  const hash = crypto.createHash("sha1").update(password).digest("hex").toUpperCase();
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);

  try {
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      next: { revalidate: 86400 } // Cache for 24 hours
    });
    if (!response.ok) return false;

    const data = await response.text();
    const hashes = data.split("\n");

    return hashes.some((h) => h.trim().split(":")[0] === suffix);
  } catch (err) {
    console.error("Password check failed:", err);
    return false; // Fail open to not block signups
  }
}

// Deprecated actions that were for NextAuth
export async function registerUser() {
  return { error: "This action is deprecated. Please use Supabase Auth on the client." };
}

export async function loginUser() {
  return { error: "This action is deprecated. Please use Supabase Auth on the client." };
}
