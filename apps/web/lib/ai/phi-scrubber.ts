export function scrubPHI(clinicalText: string): string {
  let scrubbed = clinicalText;

  // 1. Redact explicit Names (basic heuristic for common patterns, a real NLP model is better)
  // For safety in this implementation, we redact titles and capitalized words following them.
  scrubbed = scrubbed.replace(/(?:Mr\.|Mrs\.|Ms\.|Dr\.)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?/g, '[NAME_REDACTED]');

  // 2. Redact Dates of Birth and ages
  // Matches "DOB: 10/12/1990", "Date of birth 1990-12-10", "age 35", "35 year old", "35 yo"
  scrubbed = scrubbed.replace(/(?:dob|date of birth)[\s:]*[\d]{1,4}[-/][\d]{1,2}[-/][\d]{1,4}/gi, '[DOB_REDACTED]');
  scrubbed = scrubbed.replace(/\b(?:age\s*\d+|\d+\s*(?:year(?:s)?\s*old|yo|y\.o\.))\b/gi, '[AGE_REDACTED]');

  // 3. Redact Contact Information (Phone numbers, Emails)
  // Phone: (555) 555-5555 or 555-555-5555
  scrubbed = scrubbed.replace(/\b(?:\+?1[-.\s]?)?\(?[2-9]\d{2}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '[PHONE_REDACTED]');
  // Email:
  scrubbed = scrubbed.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_REDACTED]');

  // 4. Redact Social Security Numbers (SSN)
  scrubbed = scrubbed.replace(/\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g, '[SSN_REDACTED]');

  // 5. Redact Medical Record Numbers (MRN) or obvious IDs
  // Basic heuristic: MRN followed by numbers
  scrubbed = scrubbed.replace(/\bMRN[\s:#-]*[A-Z0-9]+\b/gi, '[MRN_REDACTED]');

  // 6. Redact Addresses (basic heuristic for street addresses)
  // Matches "123 Main St", "456 Oak Avenue", etc.
  scrubbed = scrubbed.replace(/\b\d+\s+[A-Z][a-z]+\s+(?:St|Street|Ave|Avenue|Blvd|Boulevard|Rd|Road|Ln|Lane|Ct|Court)\b/gi, '[ADDRESS_REDACTED]');

  return scrubbed;
}
