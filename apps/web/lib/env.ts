import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),
  ACCESS_TOKEN_SECRET: z.string().min(1),
  RECORD_ENCRYPTION_KEY: z.string().min(44).max(44), // Base64 encoded 32 bytes (44 chars)
  NEXTAUTH_URL: z.string().url().optional(), // Optional in Vercel, required locally
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  // Add other env vars as needed for future phases
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:", _env.error.format());
  throw new Error("Invalid environment variables");
}

export const env = _env.data;
