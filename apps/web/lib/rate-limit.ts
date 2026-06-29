import { redis } from './redis';

const RATE_LIMIT_WINDOW_SECONDS = 15 * 60; // 15 minutes
const MAX_FAILURES = 5;

export async function checkRateLimit(email: string): Promise<{ limited: boolean; remaining: number }> {
  const key = `auth:fail:${email.toLowerCase()}`;
  const current = await redis.get<number>(key) || 0;
  
  const remaining = Math.max(0, MAX_FAILURES - current);
  const limited = current >= MAX_FAILURES;
  
  return { limited, remaining };
}

export async function incrementRateLimit(email: string): Promise<void> {
  const key = `auth:fail:${email.toLowerCase()}`;
  const script = `
    local current = redis.call("INCR", KEYS[1])
    if current == 1 then
      redis.call("EXPIRE", KEYS[1], ARGV[1])
    end
    return current
  `;
  await redis.eval(script, [key], [RATE_LIMIT_WINDOW_SECONDS]);
}

export async function resetRateLimit(email: string): Promise<void> {
  const key = `auth:fail:${email.toLowerCase()}`;
  await redis.del(key);
}
