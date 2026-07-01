import { z } from 'zod';

const envSchema = z.object({
  // ── Database ──────────────────────────────────────────────────
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),

  // ── Cache ─────────────────────────────────────────────────────
  UPSTASH_REDIS_REST_URL: z.string().url('UPSTASH_REDIS_REST_URL must be a valid URL'),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1, 'UPSTASH_REDIS_REST_TOKEN is required'),

  // ── Auth ──────────────────────────────────────────────────────
  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET must be at least 32 characters'),
  AUTH_URL: z.string().url().optional(),
  AUTH_TRUST_HOST: z.string().optional(),

  // ── Secrets ───────────────────────────────────────────────────
  ACCESS_TOKEN_SECRET: z.string().min(32, 'ACCESS_TOKEN_SECRET must be at least 32 characters'),
  /**
   * Must be exactly 32 bytes when base64-decoded.
   * Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   */
  RECORD_ENCRYPTION_KEY: z
    .string()
    .min(44)
    .max(44)
    .refine(
      (v) => {
        try {
          return Buffer.from(v, 'base64').length === 32;
        } catch {
          return false;
        }
      },
      { message: 'RECORD_ENCRYPTION_KEY must be a base64-encoded 32-byte value (44 chars)' }
    ),

  // ── AI ────────────────────────────────────────────────────────
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  GEMINI_MODEL: z.string().default('gemini-1.5-flash'),

  // ── Email ─────────────────────────────────────────────────────
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),

  // ── Observability ─────────────────────────────────────────────
  SENTRY_DSN: z.string().url().optional(),

  // ── Runtime ───────────────────────────────────────────────────
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  const formatted = _env.error.format();
  console.error('❌ Invalid environment variables:');
  console.error(JSON.stringify(formatted, null, 2));
  throw new Error(
    `Invalid environment variables:\n${_env.error.issues
      .map((i) => `  • ${i.path.join('.')}: ${i.message}`)
      .join('\n')}`
  );
}

export const env = _env.data;
