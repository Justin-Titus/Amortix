import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const MAX_REQUESTS = 20;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

/**
 * DB-based rate limiter using Neon PostgreSQL.
 * Window: 1 hour. Max: 20 requests per user per endpoint.
 */
export async function checkRateLimit(
  userId: string,
  endpoint: string
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  // Just-in-Time sync of the user into Prisma if they don't exist
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user && user.id === userId) {
        await prisma.user.create({
          data: {
            id: user.id,
            email: user.email || `${user.id}@placeholder.com`,
            name: user.user_metadata?.full_name || user.user_metadata?.name || null,
            emailVerified: user.email_confirmed_at ? new Date(user.email_confirmed_at) : new Date(),
          },
        });
      }
    } catch (err) {
      console.error("Just-in-time user sync failed in rate limiter:", err);
    }
  }

  const now = new Date();
  // Floor to current hour
  const windowStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    0,
    0,
    0
  );

  // Find or create rate limit record
  const rateLimit = await prisma.rateLimit.upsert({
    where: {
      userId_endpoint_windowStart: {
        userId,
        endpoint,
        windowStart,
      },
    },
    update: {
      count: { increment: 1 },
    },
    create: {
      userId,
      endpoint,
      windowStart,
      count: 1,
    },
  });

  // Calculate time until next window
  const nextWindow = new Date(windowStart.getTime() + WINDOW_MS);
  const resetIn = Math.max(0, Math.ceil((nextWindow.getTime() - now.getTime()) / 60000)); // minutes

  if (rateLimit.count > MAX_REQUESTS) {
    // Revert the increment since request is denied
    await prisma.rateLimit.update({
      where: { id: rateLimit.id },
      data: { count: { decrement: 1 } },
    });

    return {
      allowed: false,
      remaining: 0,
      resetIn,
    };
  }

  return {
    allowed: true,
    remaining: MAX_REQUESTS - rateLimit.count,
    resetIn,
  };
}
