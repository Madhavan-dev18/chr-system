import crypto from 'crypto';
import { env } from './env';

// The key must be exactly 32 bytes.
// env.RECORD_ENCRYPTION_KEY is a 44-character base64 string
const encryptionKey = Buffer.from(env.RECORD_ENCRYPTION_KEY, 'base64');
if (encryptionKey.length !== 32) {
  throw new Error('RECORD_ENCRYPTION_KEY must be exactly 32 bytes when decoded from base64.');
}

export function encryptRecord(plaintext: string): { ciphertext: Buffer; iv: Buffer; authTag: Buffer } {
  // AES-256-GCM recommends a 96-bit (12-byte) IV
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv);
  
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return { ciphertext, iv, authTag };
}

export function decryptRecord(ciphertext: Buffer, iv: Buffer, authTag: Buffer): string {
  const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey, iv);
  decipher.setAuthTag(authTag);
  
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext.toString('utf8');
}

export function encryptMfaSecret(secret: string): { ciphertext: Buffer; iv: Buffer; authTag: Buffer } {
  // We can use the same key for MFA secrets, or derive a different one in a real production system.
  // For Phase 1, using the same robust AES-256-GCM setup.
  return encryptRecord(secret);
}

export function decryptMfaSecret(ciphertext: Buffer, iv: Buffer, authTag: Buffer): string {
  return decryptRecord(ciphertext, iv, authTag);
}
