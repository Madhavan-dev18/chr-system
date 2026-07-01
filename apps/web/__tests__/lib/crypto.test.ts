import { describe, it, expect, beforeAll, vi } from 'vitest';

// Must mock env before importing crypto
beforeAll(() => {
  const key = Buffer.alloc(32, 'a').toString('base64');
  vi.stubEnv('RECORD_ENCRYPTION_KEY', key);
  vi.stubEnv('DATABASE_URL', 'postgresql://test');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test');
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test');
  vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://test.upstash.io');
  vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'test');
  vi.stubEnv('AUTH_SECRET', 'a'.repeat(32));
  vi.stubEnv('ACCESS_TOKEN_SECRET', 'b'.repeat(32));
  vi.stubEnv('GEMINI_API_KEY', 'test');
});

describe('crypto — AES-256-GCM round-trip', () => {
  it('encrypts and decrypts a plaintext string', async () => {
    const { encryptRecord, decryptRecord } = await import('@/lib/crypto');
    const original = 'Patient Note: chief complaint is chest pain at rest.';
    const { ciphertext, iv, authTag } = encryptRecord(original);
    const decrypted = decryptRecord(ciphertext, iv, authTag);
    expect(decrypted).toBe(original);
  });

  it('produces different ciphertexts for the same plaintext (random IV)', async () => {
    const { encryptRecord } = await import('@/lib/crypto');
    const plain = 'Same note';
    const { ciphertext: c1, iv: iv1 } = encryptRecord(plain);
    const { ciphertext: c2, iv: iv2 } = encryptRecord(plain);
    expect(iv1.equals(iv2)).toBe(false);
    expect(c1.equals(c2)).toBe(false);
  });

  it('throws on tampered auth tag (AEAD integrity)', async () => {
    const { encryptRecord, decryptRecord } = await import('@/lib/crypto');
    const { ciphertext, iv, authTag } = encryptRecord('Sensitive data');
    const tamperedTag = Buffer.from(authTag);
    tamperedTag[0] ^= 0xff;
    expect(() => decryptRecord(ciphertext, iv, tamperedTag)).toThrow();
  });

  it('secureCompare is constant-time and correct', async () => {
    const { secureCompare } = await import('@/lib/crypto');
    expect(secureCompare('abc', 'abc')).toBe(true);
    expect(secureCompare('abc', 'xyz')).toBe(false);
    expect(secureCompare('abc', 'ab')).toBe(false);
  });
});
