import { redis } from './redis';

/** How long a window lasts before the counter resets (seconds) */
const WINDOW_SECONDS = 15 * 60; // 15 minutes
/** Max failures before the key is considered rate-limited */
const MAX_FAILURES = 5;

function getRateLimitKey(email: string): string {
  return `auth:fail:${email.toLowerCase().trim()}`;
}

export async function checkRateLimit(
  email: string
): Promise<{ limited: boolean; remaining: number }> {
  const key = getRateLimitKey(email);
  const current = (await redis.get<number>(key)) ?? 0;
  const remaining = Math.max(0, MAX_FAILURES - current);
  return { limited: current >= MAX_FAILURES, remaining };
}

/**
 * Increment the failure counter using a Lua script to ensure the EXPIRE
 * is set atomically on first increment (avoids counter-without-TTL bug).
 */
export async function incrementRateLimit(email: string): Promise<void> {
  const key = getRateLimitKey(email);
  const script = `
    local current = redis.call("INCR", KEYS[1])
    if current == 1 then
      redis.call("EXPIRE", KEYS[1], ARGV[1])
    end
    return current
  `;
  await redis.eval(script, [key], [WINDOW_SECONDS]);
}

/** Clear the failure counter after a successful login. */
export async function resetRateLimit(email: string): Promise<void> {
  await redis.del(getRateLimitKey(email));
}
