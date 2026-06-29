import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  
  UPSTASH_REDIS_REST_URL: z.string().min(1),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  
  AUTH_SECRET: z.string().min(1),
  AUTH_URL: z.string().url().optional(), // Optional in Vercel, required locally
  AUTH_TRUST_HOST: z.string().optional(),
  
  ACCESS_TOKEN_SECRET: z.string().min(1),
  RECORD_ENCRYPTION_KEY: z.string().min(44).max(44), // Base64 encoded 32 bytes (44 chars)
  
  GEMINI_API_KEY: z.string().min(1),
  GEMINI_MODEL: z.string().min(1).default('gemini-1.5-flash'),
  
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  SENTRY_DSN: z.string().optional(),
  
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:", _env.error.format());
  throw new Error("Invalid environment variables");
}

export const env = _env.data;
