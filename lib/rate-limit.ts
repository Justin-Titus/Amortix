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
