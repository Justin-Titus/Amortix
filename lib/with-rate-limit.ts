import { checkRateLimit } from "./rate-limit";
import { logWarn, maskUserId } from "./logger";


export async function enforceRateLimit(userId: string, endpoint: string) {
  const rl = await checkRateLimit(userId, endpoint);
  if (!rl.allowed) {
    const maskedUserId = maskUserId(userId);
    logWarn("rate_limit_exceeded", { userId: maskedUserId, endpoint, remaining: rl.remaining, resetIn: rl.resetIn });

    return {
      allowed: false,
      message: `Rate limit exceeded for ${endpoint}`,
      resetIn: rl.resetIn,
    } as const;
  }

  return { allowed: true } as const;
}
