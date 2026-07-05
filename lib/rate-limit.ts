import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { logWarn, logInfo } from "./logger";

const MAX_REQUESTS = 20;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

// Initialize Upstash Redis if environment variables are provided
let redisClient: Redis | null = null;
let redisRatelimit: Ratelimit | null = null;

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (redisUrl && redisToken) {
  try {
    redisClient = new Redis({
      url: redisUrl,
      token: redisToken,
    });
    
    redisRatelimit = new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(MAX_REQUESTS, "1 h"),
      analytics: true,
      prefix: "amortix:ratelimit",
    });
    logInfo("redis_rate_limiter_initialized", { message: "Upstash Redis rate limiter successfully configured." });
  } catch (error) {
    console.error("Failed to initialize Upstash Redis rate limiter:", error);
  }
} else {
  console.warn("Upstash Redis credentials not found in env. Falling back to Postgres database rate limiting.");
}

/**
 * Primary: Upstash Redis Rate Limiter.
 * Fallback: DB-based rate limiter using PostgreSQL.
 * Window: 1 hour. Max: 20 requests per user per endpoint.
 */
export async function checkRateLimit(
  userId: string,
  endpoint: string
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  // If Redis is configured, try using it first
  if (redisRatelimit) {
    try {
      const identifier = `${userId}:${endpoint}`;
      const result = await redisRatelimit.limit(identifier);
      
      const resetInMinutes = Math.max(0, Math.ceil((result.reset - Date.now()) / 60000));
      
      return {
        allowed: result.success,
        remaining: result.remaining,
        resetIn: resetInMinutes,
      };
    } catch (error) {
      logWarn("redis_rate_limit_failed", {
        userId,
        endpoint,
        error: error instanceof Error ? error.message : String(error),
        message: "Upstash Redis lookup failed. Falling back to Postgres database rate limiter.",
      });
      // Fall through to database limiter below
    }
  }

  // Database-backed rate limiter (Fallback)
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

