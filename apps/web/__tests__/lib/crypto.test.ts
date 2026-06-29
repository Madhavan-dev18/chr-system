import { describe, it, expect } from 'vitest';
import { encryptRecord, decryptRecord } from '@/lib/crypto';
import crypto from 'crypto';

describe('AES-256-GCM Crypto Utilities', () => {
  const plaintext = JSON.stringify({ patientId: '123', notes: 'Patient is doing well.' });

  it('should successfully encrypt and decrypt a record', () => {
    const { ciphertext, iv, authTag } = encryptRecord(plaintext);
    
    expect(ciphertext).toBeDefined();
    expect(iv).toBeDefined();
    expect(authTag).toBeDefined();
    
    // IV should be 12 bytes for GCM
    expect(iv.length).toBe(12);
    // AuthTag is 16 bytes
    expect(authTag.length).toBe(16);

    const decrypted = decryptRecord(ciphertext, iv, authTag);
    expect(decrypted).toBe(plaintext);
  });

  it('should generate different ciphertexts for the same plaintext (unique IV)', () => {
    const res1 = encryptRecord(plaintext);
    const res2 = encryptRecord(plaintext);

    expect(res1.iv).not.toEqual(res2.iv);
    expect(res1.ciphertext).not.toEqual(res2.ciphertext);
  });

  it('should throw an error if the authTag is tampered with', () => {
    const { ciphertext, iv, authTag } = encryptRecord(plaintext);
    
    // Tamper with auth tag
    const tamperedAuthTag = Buffer.from(authTag);
    tamperedAuthTag[0] ^= 1; // Flip a bit

    expect(() => {
      decryptRecord(ciphertext, iv, tamperedAuthTag);
    }).toThrow(/Unsupported state or unable to authenticate data/);
  });

  it('should throw an error if the ciphertext is tampered with', () => {
    const { ciphertext, iv, authTag } = encryptRecord(plaintext);
    
    // Tamper with ciphertext
    const tamperedCiphertext = Buffer.from(ciphertext);
    tamperedCiphertext[0] ^= 1;

    expect(() => {
      decryptRecord(tamperedCiphertext, iv, authTag);
    }).toThrow(/Unsupported state or unable to authenticate data/);
  });
});
