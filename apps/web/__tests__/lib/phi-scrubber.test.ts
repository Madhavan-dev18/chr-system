import { describe, it, expect } from 'vitest';
import { scrubPHI, hasSuspectedPHI } from '@/lib/ai/phi-scrubber';

describe('PHI Scrubber', () => {
  it('redacts phone numbers', () => {
    const result = scrubPHI('Call me at (555) 867-5309 or 555-123-4567.');
    expect(result).not.toContain('555');
    expect(result).toContain('[PHONE]');
  });

  it('redacts email addresses', () => {
    const result = scrubPHI('Email: patient@example.com for results.');
    expect(result).toContain('[EMAIL]');
    expect(result).not.toContain('patient@example.com');
  });

  it('redacts MRN identifiers', () => {
    const result = scrubPHI('Patient MRN-202406-1A2B presents with headache.');
    expect(result).toContain('[MRN]');
    expect(result).not.toContain('1A2B');
  });

  it('redacts SSN patterns', () => {
    const result = scrubPHI('SSN: 123-45-6789');
    expect(result).toContain('[SSN]');
  });

  it('preserves purely clinical content', () => {
    const clinical = 'Patient presents with chest pain, dyspnea on exertion. BP elevated at admission.';
    const result = scrubPHI(clinical);
    expect(result).toContain('chest pain');
    expect(result).toContain('dyspnea');
  });

  it('hasSuspectedPHI returns false on clean text', () => {
    const clean = 'Fever 102°F, cough, fatigue for three days. Assess for influenza.';
    expect(hasSuspectedPHI(clean)).toBe(false);
  });
});
