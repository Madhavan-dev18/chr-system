import crypto from 'crypto';
import { env } from './env';

// The key is loaded once at module init and cached.
const encryptionKey: Buffer = (() => {
  const key = Buffer.from(env.RECORD_ENCRYPTION_KEY, 'base64');
  if (key.length !== 32) {
    throw new Error(
      '[crypto] RECORD_ENCRYPTION_KEY must decode to exactly 32 bytes. ' +
        `Got ${key.length} bytes.`
    );
  }
  return key;
})();

// ── AES-256-GCM helpers ──────────────────────────────────────────

export interface EncryptedBlob {
  ciphertext: Buffer;
  iv: Buffer;
  authTag: Buffer;
}

/**
 * Encrypt a UTF-8 plaintext string using AES-256-GCM.
 * The auth tag provides tamper-detection (AEAD).
 */
export function encryptRecord(plaintext: string): EncryptedBlob {
  const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv);

  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag(); // 128-bit auth tag

  return { ciphertext, iv, authTag };
}

/**
 * Decrypt a blob produced by `encryptRecord`.
 * Throws if the auth tag fails (tampered data).
 */
export function decryptRecord(ciphertext: Buffer, iv: Buffer, authTag: Buffer): string {
  const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey, iv);
  decipher.setAuthTag(authTag);

  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext.toString('utf8');
}

/**
 * Pack IV + AuthTag + Ciphertext into a single Buffer for compact storage.
 * Layout: [12 bytes IV][16 bytes AuthTag][N bytes Ciphertext]
 */
export function packEncryptedBlob({ ciphertext, iv, authTag }: EncryptedBlob): Buffer {
  return Buffer.concat([iv, authTag, ciphertext]);
}

/**
 * Unpack a packed encrypted blob into components.
 */
export function unpackEncryptedBlob(blob: Buffer): EncryptedBlob {
  const iv = Buffer.from(blob.subarray(0, 12));
  const authTag = Buffer.from(blob.subarray(12, 28));
  const ciphertext = Buffer.from(blob.subarray(28));
  return { iv, authTag, ciphertext };
}

// Alias for MFA secrets (same algorithm, kept separate for semantic clarity)
export const encryptMfaSecret = encryptRecord;
export const decryptMfaSecret = decryptRecord;

// ── Secure comparison ────────────────────────────────────────────

/**
 * Constant-time string comparison to prevent timing attacks.
 */
export function secureCompare(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) return false;
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

// ── Token generation ─────────────────────────────────────────────

/** Generate a cryptographically random hex token. */
export function generateToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}
