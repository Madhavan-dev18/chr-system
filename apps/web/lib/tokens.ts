import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { redis } from './redis';

const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

export function generateRefreshToken(): { raw: string; hash: string } {
  const raw = crypto.randomBytes(32).toString('hex');
  const hash = bcrypt.hashSync(raw, 12);
  return { raw, hash };
}

export async function storeRefreshToken(
  hash: string,
  userId: string,
  clinicId: string | null
): Promise<void> {
  const key = `auth:rt:${hash}`;
  const payload = JSON.stringify({ userId, clinicId });
  
  // Store the hash with a 7 day TTL
  await redis.set(key, payload, 'EX', REFRESH_TOKEN_TTL);
}

export async function consumeRefreshToken(
  rawToken: string
): Promise<{ userId: string; clinicId: string | null } | null> {
  // In a real app we'd scan or verify the hash, but since we don't have the hash in the cookie,
  // we actually need to look up by hash. 
  // Wait, if we hash the raw token, we can just hash it again to find the Redis key?
  // No, bcrypt uses random salts, so bcrypt.hashSync(raw) produces a DIFFERENT hash every time!
  // Oh, that means we CANNOT use bcrypt for Redis key lookups directly unless we scan all keys, which is O(N).
  // Instead, we can use SHA-256 for the Redis key (which is deterministic) to allow O(1) lookup,
  // while still preventing plain-text tokens in Redis.
  
  const deterministicHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const key = `auth:rt:${deterministicHash}`;
  
  const data = await redis.get(key);
  if (!data) return null;
  
  // SINGLE USE: Delete the token immediately upon use (rotation)
  await redis.del(key);
  
  try {
    const payload = JSON.parse(data);
    return {
      userId: payload.userId,
      clinicId: payload.clinicId || null,
    };
  } catch {
    return null;
  }
}

// Updated generator to use SHA-256 for Redis O(1) lookup
export function generateRefreshTokensV2(): { raw: string; hash: string } {
  const raw = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  return { raw, hash };
}
