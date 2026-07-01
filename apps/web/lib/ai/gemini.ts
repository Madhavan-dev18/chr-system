import { env } from '../env';
import { getLogger } from '../logger';

const log = getLogger('gemini');

const SYSTEM_PROMPT = `
You are a Clinical Decision Support (CDS) Assistant integrated into a HIPAA-aligned EHR.
You evaluate de-identified clinical notes to structure a differential diagnosis list.
You NEVER diagnose patients. You ONLY provide a structured differential for the attending physician to review.
All PHI has been scrubbed before reaching you.

Respond ONLY in valid JSON matching this exact schema — no markdown, no prose, no code fences:
{
  "differentials": [
    {
      "diagnosis": "string",
      "icd10": "string (estimated code e.g. I21.9)",
      "confidence": number (0-100),
      "reasoning": "string (max 100 words, purely clinical)",
      "urgency": "ROUTINE" | "URGENT" | "EMERGENT",
      "next_steps": ["string"]
    }
  ],
  "red_flags": ["string"],
  "suggested_labs": ["string"]
}
`.trim();

export interface ClinicalDifferential {
  differentials: Array<{
    diagnosis: string;
    icd10: string;
    confidence: number;
    reasoning: string;
    urgency: 'ROUTINE' | 'URGENT' | 'EMERGENT';
    next_steps: string[];
  }>;
  red_flags: string[];
  suggested_labs: string[];
}

/** Exponential back-off for transient Gemini errors */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 600
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        log.warn({ attempt, delayMs: delay }, 'Gemini call failed, retrying...');
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

/**
 * Call Gemini CDS with a PHI-scrubbed clinical note.
 * Returns a structured differential diagnosis.
 */
export async function analyzeSymptoms(
  scrubbedNote: string
): Promise<ClinicalDifferential> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;

  const payload = {
    contents: [{ role: 'user', parts: [{ text: scrubbedNote }] }],
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    generationConfig: {
      temperature: 0.15, // Low temperature for clinical precision
      responseMimeType: 'application/json',
      maxOutputTokens: 2048,
    },
  };

  return withRetry(async () => {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15_000), // 15 s hard timeout
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Gemini API error ${response.status}: ${errorBody.slice(0, 200)}`
      );
    }

    const data = (await response.json()) as {
      candidates: Array<{
        content: { parts: Array<{ text: string }> };
        finishReason: string;
      }>;
    };

    if (!data.candidates?.length) {
      throw new Error('Gemini returned no candidates');
    }

    const rawJson = data.candidates[0].content.parts[0].text;

    try {
      const parsed = JSON.parse(rawJson) as ClinicalDifferential;
      if (!parsed.differentials || !Array.isArray(parsed.differentials)) {
        throw new Error('Missing differentials array in Gemini response');
      }
      return parsed;
    } catch {
      throw new Error(`Failed to parse Gemini JSON: ${rawJson.slice(0, 300)}`);
    }
  });
}
