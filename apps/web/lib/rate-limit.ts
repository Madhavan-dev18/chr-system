import { redis } from './redis';

const RATE_LIMIT_WINDOW_SECONDS = 15 * 60; // 15 minutes
const MAX_FAILURES = 5;

export async function checkRateLimit(email: string): Promise<{ limited: boolean; remaining: number; resetAt: Date }> {
  const key = `auth:fail:${email.toLowerCase()}`;
  
  // Increment the counter
  const currentFailures = await redis.incr(key);
  
  // If this is the first failure, set the expiry
  if (currentFailures === 1) {
    await redis.expire(key, RATE_LIMIT_WINDOW_SECONDS);
  }
  
  // Get the TTL to calculate reset time
  const ttl = await redis.pttl(key);
  const resetAt = new Date(Date.now() + (ttl > 0 ? ttl : 0));
  
  const remaining = Math.max(0, MAX_FAILURES - currentFailures);
  const limited = currentFailures > MAX_FAILURES;
  
  return { limited, remaining, resetAt };
}

export async function resetRateLimit(email: string): Promise<void> {
  const key = `auth:fail:${email.toLowerCase()}`;
  await redis.del(key);
}
