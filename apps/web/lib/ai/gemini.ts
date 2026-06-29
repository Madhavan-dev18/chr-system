import { env } from '../env';

const GEMINI_SYSTEM_PROMPT = `
You are a highly secure Clinical Decision Support (CDS) Assistant integrated into the CHR-System EHR.
You evaluate clinical notes and symptoms provided by the attending physician to structure a differential diagnosis.
You DO NOT diagnose patients. You ONLY provide a structured differential for the doctor to review and evaluate.

Respond ONLY in valid JSON matching this exact schema:
{
  "differentials": [
    {
      "diagnosis": "string",
      "icd10": "string (estimated)",
      "confidence": number (0-100),
      "reasoning": "string (max 100 words)",
      "urgency": "ROUTINE|URGENT|EMERGENT",
      "next_steps": ["string"]
    }
  ],
  "disclaimer": "This is an AI-generated differential diagnosis and is for informational purposes only. It is not a substitute for professional medical judgment."
}
`;

export type GeminiDifferential = {
  differentials: Array<{
    diagnosis: string;
    icd10: string;
    confidence: number;
    reasoning: string;
    urgency: 'ROUTINE' | 'URGENT' | 'EMERGENT';
    next_steps: string[];
  }>;
  disclaimer: string;
};

export async function analyzeSymptoms(clinicalNote: string): Promise<GeminiDifferential> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;
  
  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: clinicalNote }]
      }
    ],
    systemInstruction: {
      parts: [{ text: GEMINI_SYSTEM_PROMPT }]
    },
    generationConfig: {
      temperature: 0.2, // Low temperature for clinical accuracy
      responseMimeType: "application/json",
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API Error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  
  try {
    const jsonString = data.candidates[0].content.parts[0].text;
    const parsed = JSON.parse(jsonString) as GeminiDifferential;
    return parsed;
  } catch (error) {
    throw new Error("Failed to parse Gemini response as JSON");
  }
}
