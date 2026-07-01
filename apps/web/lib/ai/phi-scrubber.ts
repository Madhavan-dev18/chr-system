/**
 * PHI (Protected Health Information) Scrubber
 *
 * Removes common PHI patterns from clinical text before sending to an
 * external AI service. This is a defence-in-depth layer; the primary
 * protection is that we only send doctor-authored notes, never raw patient
 * records with identifiers.
 *
 * A production system would use a dedicated NLP model (e.g. AWS Comprehend
 * Medical or a fine-tuned NER model) for higher recall. This regex approach
 * provides a best-effort baseline.
 */

const PHI_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  // Named titles (Mr. / Mrs. / Dr. followed by surname)
  {
    pattern: /(?:Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?/g,
    replacement: '[NAME]',
  },
  // Date of birth
  {
    pattern: /(?:dob|date\s+of\s+birth)[\s:]*\d{1,4}[-/]\d{1,2}[-/]\d{1,4}/gi,
    replacement: '[DOB]',
  },
  // Age expressions: "age 35", "35 yo", "35-year-old"
  {
    pattern: /\b(?:age\s*\d+|\d+\s*(?:years?\s*old|yo|y\.o\.)|\d+-year-old)\b/gi,
    replacement: '[AGE]',
  },
  // Phone numbers: (555) 555-5555, 555-555-5555, +91 98765 43210
  {
    pattern: /\b(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{4}\b/g,
    replacement: '[PHONE]',
  },
  // Email addresses
  {
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    replacement: '[EMAIL]',
  },
  // US Social Security Numbers
  {
    pattern: /\b\d{3}[- ]?\d{2}[- ]?\d{4}\b/g,
    replacement: '[SSN]',
  },
  // Medical Record Numbers (MRN-YYYYMM-XXXX format)
  {
    pattern: /\bMRN[-:\s#]*[A-Z0-9]+\b/gi,
    replacement: '[MRN]',
  },
  // Street addresses: "123 Main St", "456 Oak Avenue"
  {
    pattern:
      /\b\d+\s+[A-Z][a-z]+\s+(?:St|Street|Ave|Avenue|Blvd|Boulevard|Rd|Road|Ln|Lane|Ct|Court|Dr|Drive)\b/gi,
    replacement: '[ADDRESS]',
  },
  // ZIP codes
  {
    pattern: /\b\d{5}(?:-\d{4})?\b/g,
    replacement: '[ZIP]',
  },
];

/**
 * Scrub PHI from a clinical text string.
 * Returns the sanitised version with redaction tags.
 */
export function scrubPHI(text: string): string {
  let scrubbed = text;
  for (const { pattern, replacement } of PHI_PATTERNS) {
    scrubbed = scrubbed.replace(pattern, replacement);
  }
  return scrubbed;
}

/** Return true if the text contains any likely PHI that could not be scrubbed. */
export function hasSuspectedPHI(text: string): boolean {
  return PHI_PATTERNS.some(({ pattern }) => {
    pattern.lastIndex = 0; // reset stateful regex
    return pattern.test(text);
  });
}
