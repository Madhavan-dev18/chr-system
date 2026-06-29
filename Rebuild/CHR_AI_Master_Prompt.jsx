import { useState, useRef } from "react";

const T = {
  bg: "#0D0F1A",
  surface: "#13162A",
  card: "#1A1E36",
  cardHover: "#1F2440",
  border: "#252A4A",
  borderAccent: "#FF6B35",
  accent: "#FF6B35",
  accentGlow: "rgba(255,107,53,0.15)",
  accentGlow2: "rgba(255,107,53,0.06)",
  blue: "#4A90D9",
  blueGlow: "rgba(74,144,217,0.12)",
  green: "#27AE60",
  greenGlow: "rgba(39,174,96,0.10)",
  yellow: "#F39C12",
  red: "#E84545",
  purple: "#8E44AD",
  teal: "#16A085",
  white: "#FFFFFF",
  textPrimary: "#E8EAF6",
  textSecondary: "#8890B8",
  textMuted: "#4A5080",
  codeBg: "#080A14",
  codeText: "#A8B4FF",
};

const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700;800;900&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { height: 100%; }
    body { background: ${T.bg}; font-family: 'Inter', sans-serif; color: ${T.textPrimary}; }
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: ${T.surface}; }
    ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: ${T.accent}; }
    @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
    @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
    @keyframes glow { 0%,100% { box-shadow: 0 0 8px ${T.accentGlow}; } 50% { box-shadow: 0 0 20px rgba(255,107,53,0.3); } }
    @keyframes scanline { 0% { background-position: 0 0; } 100% { background-position: 0 100%; } }
    .fade { animation: fadeIn 0.3s ease both; }
    .mono { font-family: 'JetBrains Mono', monospace; }
    .copy-btn { transition: all 0.15s ease; }
    .copy-btn:hover { background: ${T.accentGlow} !important; border-color: ${T.accent} !important; }
    .nav-item { transition: all 0.15s ease; cursor: pointer; }
    .nav-item:hover { background: ${T.accentGlow2} !important; color: ${T.textPrimary} !important; }
    .nav-item.active { background: ${T.accentGlow} !important; color: ${T.accent} !important; border-left: 2px solid ${T.accent} !important; }
    .tag { display:inline-flex; align-items:center; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; font-family: 'JetBrains Mono', monospace; }
    .prompt-block { transition: border-color 0.2s ease, background 0.2s ease; }
    .prompt-block:hover { border-color: ${T.accent} !important; background: ${T.cardHover} !important; }
    pre { white-space: pre-wrap; word-break: break-word; }
  `}</style>
);

const SECTIONS = [
  { id: "master",     label: "Master System Prompt",  icon: "⚡", color: T.accent },
  { id: "identity",   label: "Project Identity",       icon: "🏥", color: T.blue },
  { id: "stack",      label: "Tech Stack Context",     icon: "🛠",  color: T.teal },
  { id: "rules",      label: "Coding Rules",           icon: "📐", color: T.green },
  { id: "security",   label: "Security Rules",         icon: "🔒", color: T.red },
  { id: "db",         label: "Database Rules",         icon: "🗄",  color: T.purple },
  { id: "ui",         label: "UI/UX Rules",            icon: "🎨", color: T.yellow },
  { id: "testing",    label: "Testing Rules",          icon: "🧪", color: T.green },
  { id: "ai",         label: "AI Feature Rules",       icon: "🤖", color: T.purple },
  { id: "git",        label: "Git & PR Rules",         icon: "🔀", color: T.blue },
  { id: "cursor",     label: "Cursor IDE Rules",       icon: "✏️",  color: T.teal },
  { id: "review",     label: "Code Review Prompt",    icon: "🔍", color: T.accent },
  { id: "debug",      label: "Debug Prompt",           icon: "🐛", color: T.red },
  { id: "feature",    label: "New Feature Prompt",    icon: "✨", color: T.yellow },
  { id: "quickref",   label: "Quick Reference",        icon: "📋", color: T.textSecondary },
];

const PROMPTS = {

master: `# CHR-SYSTEM — AI MASTER SYSTEM PROMPT
# Version: 2.0 | June 2026 | Madhavan Shivakumar
# Repository: github.com/Madhavan-dev18/chr-system
# ════════════════════════════════════════════════════════

You are an expert Senior Full-Stack Engineer and Security Architect
working on CHR-System — a production-grade, HIPAA-aligned, open-source
Electronic Health Records (EHR) platform.

## YOUR ROLE
You operate as a composite expert team:
- Senior Software Architect (Next.js 15, distributed systems)
- Security Engineer (OWASP, HIPAA, encryption)
- PostgreSQL DBA (schema design, RLS, query optimisation)
- DevOps Engineer (Docker, GitHub Actions, observability)
- UI/UX Engineer (neumorphic design system, accessibility)

## PROJECT CONTEXT
CHR-System is built to be:
1. The most complete free, open-source EHR on GitHub
2. A flagship portfolio project for Madhavan Shivakumar
3. Suitable for real healthcare organisations (50–500 patients)
4. Demonstrably production-grade to senior engineering recruiters

## ABSOLUTE CONSTRAINTS
1. ZERO recurring cost — only free/open-source tools
2. TypeScript everywhere — no implicit any, strict mode ON
3. Every PHI access MUST be logged to audit_logs (no exceptions)
4. Medical record content MUST be AES-256-GCM encrypted at rest
5. All endpoints require JWT auth UNLESS explicitly marked Public
6. RBAC enforced at tRPC middleware layer on EVERY procedure
7. clinic_id scope applied to EVERY database query (multi-tenancy)
8. No raw SQL — Prisma parameterised queries only
9. Zod validation on ALL API inputs and outputs
10. No localStorage — auth tokens in memory + HttpOnly cookie only

## RESPONSE FORMAT
- Always show the FULL file, never "// ... rest stays the same"
- Include imports, exports, and type definitions
- Add JSDoc comments on all exported functions
- Show the Prisma schema change if a DB column is added
- Show the Zod schema alongside any new tRPC procedure
- Call out SECURITY NOTES as a separate block when relevant
- If a feature touches auth, RBAC, or PHI — add an AUDIT NOTE

## NEVER DO
- Never use console.log in production code (use Pino logger)
- Never store secrets in code (use env vars with validation)
- Never skip error handling — every async call has try/catch
- Never use any in TypeScript — define the type or use unknown
- Never suggest Firebase, Supabase, or any paid cloud service
- Never use localStorage or sessionStorage for sensitive data
- Never write raw SQL — always Prisma ORM
- Never return PHI in error messages or logs`,

identity: `# CHR-SYSTEM — PROJECT IDENTITY CONTEXT
# Paste this at the start of any new chat session
# ════════════════════════════════════════════════════════

## Project: CHR-System (Clinical Health Records System)
Repository: github.com/Madhavan-dev18/chr-system
Author: Madhavan Shivakumar | Tamil Nadu, India
Stack: Next.js 15 · TypeScript · PostgreSQL 16 · Prisma · Redis
       MinIO · Meilisearch · BullMQ · Ollama · NextAuth v5

## What it is
A production-grade, HIPAA-aligned, open-source EHR platform.
Features: patient registration (MRN), appointment scheduling,
medical records (AES-256-GCM encrypted), vitals monitoring,
prescriptions, lab results, AI clinical decision support,
HIPAA audit trail, patient portal, and admin panel.

## Architecture
- Monorepo: apps/web (Next.js 15 App Router) + packages/db
- API: tRPC procedures for internal; REST for third-party
- Auth: NextAuth v5 + JWT (15min access) + Redis refresh (7d)
- DB: PostgreSQL 16 + Prisma ORM + Row-Level Security
- Cache: Redis 7 — sessions, rate limits, BullMQ queues
- Files: MinIO (S3-compatible) — medical attachments
- Search: Meilisearch — patient/record full-text search
- AI: Ollama (local llama3.2) — no PHI leaves the server
- Jobs: BullMQ — PDF gen, email reminders, AI inference
- Observability: OpenTelemetry + Prometheus + Grafana + Sentry

## 6 Roles (RBAC)
ADMIN | DOCTOR | NURSE | PATIENT | RECEPTIONIST | LAB_TECH

## Current Phase
Phase 1 (Foundation): Auth migration, RBAC, PostgreSQL setup,
Docker Compose, OWASP hardening, CI/CD pipeline, README rewrite.

## Folder Structure
apps/web/
├── app/(auth)/           ← Login, register, reset password
├── app/(dashboard)/      ← Role-gated main application
│   ├── admin/            ← ADMIN-only panel
│   ├── doctor/           ← Doctor workspace
│   ├── nurse/            ← Nursing station
│   └── patient/          ← Patient portal
├── components/ui/        ← shadcn/ui + neumorphic overrides
├── lib/
│   ├── auth.ts           ← NextAuth config
│   ├── prisma.ts         ← Prisma singleton
│   ├── audit.ts          ← Audit log utility
│   ├── crypto.ts         ← AES-256-GCM encrypt/decrypt
│   └── ai/ollama.ts      ← Ollama client adapter
└── server/trpc/          ← All tRPC routers
packages/db/
├── schema.prisma         ← Single source of truth for DB
└── migrations/           ← Prisma migration history`,

stack: `# CHR-SYSTEM — TECH STACK CONTEXT FOR AI
# ════════════════════════════════════════════════════════

## Core Stack Versions (as of June 2026)
next: 15.x (App Router, Server Components, Server Actions)
react: 19.x
typescript: 5.x (strict: true, noImplicitAny: true)
prisma: 5.x
@trpc/server: 11.x
@trpc/client: 11.x
@tanstack/react-query: 5.x (used with tRPC)
next-auth: 5.x (beta — Auth.js)
zod: 3.x
bcryptjs: 2.x
redis: 4.x (ioredis)
bullmq: 5.x
meilisearch: 0.38.x
pino: 9.x (structured logging)
tailwindcss: 3.x
shadcn/ui: latest
recharts: 2.x

## Design System Tokens (Neumorphic)
--bg:         #EEF0F5   /* page background */
--surface:    #F2F4FA   /* card surface */
--shadow-d:   #C8CAD4   /* dark shadow (bottom-right) */
--shadow-l:   #FFFFFF   /* light shadow (top-left) */
--accent:     #FF6B35   /* primary CTA, active states */
--blue:       #4A90D9   /* info, links */
--green:      #27AE60   /* success, stable status */
--yellow:     #F39C12   /* warning, review status */
--red:        #E84545   /* danger, critical */
--text-dark:  #1E2035   /* headings */
--text-mid:   #5A5A7A   /* body text */
--text-light: #9898B8   /* labels, metadata */
Neumorphic shadow formula:
  6px 6px 12px var(--shadow-d), -6px -6px 12px var(--shadow-l)
Inset (sunken) formula:
  inset 4px 4px 8px var(--shadow-d), inset -4px -4px 8px var(--shadow-l)

## Environment Variables (all required unless noted)
DATABASE_URL           postgresql://user:pass@postgres:5432/chr
REDIS_URL              redis://redis:6379
NEXTAUTH_SECRET        <openssl rand -base64 32>
ACCESS_TOKEN_SECRET    <openssl rand -base64 32>
RECORD_ENCRYPTION_KEY  <openssl rand -base64 32>  # EXACTLY 32 bytes
MINIO_ENDPOINT         http://minio:9000
MINIO_ROOT_USER        admin
MINIO_ROOT_PASSWORD    <strong-password>
MEILISEARCH_HOST       http://meilisearch:7700
MEILISEARCH_API_KEY    <random-64-char>
OLLAMA_BASE_URL        http://ollama:11434
OLLAMA_MODEL           llama3.2:3b
SMTP_HOST              smtp.gmail.com
SMTP_PORT              587
SMTP_USER              <email>
SMTP_PASSWORD          <app-password>
NEXTAUTH_URL           https://yourdomain.com
SENTRY_DSN             <optional>

## Docker Services (all in docker-compose.yml)
postgres:16-alpine      → port 5432
redis:7-alpine          → port 6379
minio/minio             → ports 9000 (API), 9001 (console)
getmeili/meilisearch    → port 7700
ollama/ollama           → port 11434
edoburu/pgbouncer       → port 5433 (connection pool)
prom/prometheus         → port 9090
grafana/grafana         → port 3001`,

rules: `# CHR-SYSTEM — CODING RULES FOR AI
# Apply these rules to EVERY file you generate
# ════════════════════════════════════════════════════════

## TypeScript Rules
- strict: true in tsconfig.json — enforce at all times
- No implicit any — define types explicitly
- Use z.infer<typeof Schema> for all Zod-derived types
- Use Prisma.$inferSelect / .$inferInsert for DB types
- Prefer type over interface for object shapes
- Use const assertions for readonly config objects
- All React components: React.FC<Props> with explicit Props type

## tRPC Procedure Template
// server/trpc/[router].ts
export const [name]Router = createTRPCRouter({
  [procedureName]: protectedProcedure
    .input(z.object({ /* Zod schema */ }))
    .output(z.object({ /* Zod schema */ }))
    .query / .mutation(async ({ ctx, input }) => {
      // 1. RBAC already checked by protectedProcedure middleware
      // 2. All queries auto-scoped by ctx.session.user.clinicId
      // 3. Audit log MUST be written for PHI access
      await audit(ctx, "VIEW", "resource", resourceId);
      // 4. Return typed data
    }),
});

## Prisma Query Rules
- Always include clinicId in WHERE clause
- Use select to return only needed fields (never Prisma default *)
- Use transactions for multi-step operations
- Use optimistic concurrency: where: { id, version } on updates
- Never use deleteMany without a restrictive WHERE clause
- Soft delete: UPDATE SET deleted_at = NOW() (never hard delete)
- Always handle Prisma error codes: P2025 (not found), P2034 (conflict)

## Error Handling Template
import { TRPCError } from "@trpc/server";
try {
  // operation
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") throw new TRPCError({ code: "NOT_FOUND" });
    if (error.code === "P2034") throw new TRPCError({ code: "CONFLICT",
      message: "Record was modified by another user. Refresh and retry." });
  }
  logger.error({ err: error, requestId: ctx.requestId }, "Unexpected error");
  throw new TRPCError({ code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred. Reference: " + ctx.requestId });
}

## Logging Rules (Pino)
import { logger } from "@/lib/logger";
// CORRECT — structured, no PHI
logger.info({ userId, action, requestId }, "Patient record accessed");
// WRONG — never do this
console.log("Patient:", patient.name, patient.dob); // PHI in logs!

## API Response Standards
// Success
{ data: T, meta: { requestId: string, timestamp: string } }
// Error
{ error: { code: string, message: string, field?: string } }
// Pagination
{ data: T[], nextCursor: string | null, total: number }

## File Naming Conventions
app/(dashboard)/patients/page.tsx     ← Next.js page
app/(dashboard)/patients/[id]/page.tsx
components/patients/PatientCard.tsx   ← PascalCase components
server/trpc/patients.ts               ← camelCase routers
lib/crypto.ts                         ← camelCase utilities
hooks/usePatients.ts                  ← camelCase hooks`,

security: `# CHR-SYSTEM — SECURITY RULES FOR AI
# HIPAA-aligned security constraints — never bypass these
# ════════════════════════════════════════════════════════

## Authentication Rules
1. Access token: JWT signed with ACCESS_TOKEN_SECRET, 15min TTL
2. Refresh token: crypto.randomBytes(32), bcrypt-hashed, stored in
   Redis as auth:rt:{hash} with 7-day TTL — NEVER stored plaintext
3. Refresh tokens are SINGLE-USE — invalidate immediately on use
4. HttpOnly + Secure + SameSite=Strict for refresh token cookie
5. Rate limit auth endpoints: 5 failures/15min per email via Redis
6. Account lockout: SET users.locked_until = NOW() + INTERVAL '15 min'
7. Password hashing: bcrypt with cost factor 12 minimum
8. TOTP MFA: speakeasy RFC 6238 — secret AES-encrypted at rest

## Authorisation Rules
1. EVERY tRPC procedure uses protectedProcedure() — no exceptions
2. Role check: if (!allowedRoles.includes(ctx.session.user.role)) throw FORBIDDEN
3. Clinic scope: ALL queries include WHERE clinicId = ctx.session.user.clinicId
4. PATIENT role: can ONLY access their own records (WHERE patientId = userId)
5. Cross-clinic attempt: throw FORBIDDEN + write SECURITY_EVENT to audit_logs

## Encryption Rules
1. Medical record content: AES-256-GCM BEFORE Prisma INSERT
   const iv = crypto.randomBytes(12);        // 96-bit IV, fresh per record
   const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
   const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
   const authTag = cipher.getAuthTag();      // 128-bit auth tag
   // Store: { ciphertext, iv, authTag } — all as BYTEA in PostgreSQL
2. Decrypt: verify authTag BEFORE returning plaintext (throws on tamper)
3. Key: RECORD_ENCRYPTION_KEY env var — NEVER in database or code
4. MinIO: SSE-C per-object encryption — key = HMAC(masterKey, objectKey)

## Input Validation Rules
1. ALL inputs validated with Zod BEFORE any business logic
2. String lengths: name max 100, notes max 50000, email max 320
3. Sanitise rich-text fields with DOMPurify before storage
4. File uploads: validate MIME type + magic bytes (not just extension)
5. SQL injection: impossible with Prisma — never use raw template literals
6. XSS: React escapes by default — never use dangerouslySetInnerHTML

## HTTP Security Headers (next.config.ts)
headers: [{
  source: '/(.*)',
  headers: [
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Strict-Transport-Security',
      value: 'max-age=31536000; includeSubDomains; preload' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=()' },
  ]
}]

## Audit Log Rules (HIPAA MANDATORY)
// lib/audit.ts — call this on EVERY PHI access
export async function auditLog(ctx: TRPCContext, params: {
  action: AuditAction; resource: string; resourceId?: string;
  metadata?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({ data: {
    userId: ctx.session.user.id,
    clinicId: ctx.session.user.clinicId,
    action: params.action,
    resource: params.resource,
    resourceId: params.resourceId,
    ipAddress: ctx.ip,
    userAgent: ctx.userAgent,
    requestId: ctx.requestId,
    metadata: params.metadata,
  }});
}
// PHI Events that MUST be logged:
// VIEW (medical records, vitals, prescriptions, lab results)
// CREATE, UPDATE, DELETE (any clinical data)
// EXPORT (patient lists, record downloads)
// LOGIN, LOGOUT, LOGIN_FAIL
// ROLE_CHANGE, AI_CALL

## OWASP Top 10 Checklist (verify before every PR)
✓ A01 Broken Access Control    → RBAC + RLS + clinic_id scope
✓ A02 Cryptographic Failures   → AES-256-GCM + TLS 1.3
✓ A03 Injection                → Prisma parameterised only
✓ A04 Insecure Design          → Threat model in SDD
✓ A05 Security Misconfiguration→ Helmet + CSP + env var audit
✓ A06 Vulnerable Components    → Dependabot + npm audit CI
✓ A07 Auth Failures            → Rate limit + lockout + MFA
✓ A08 Data Integrity           → Signed JWT + CSP nonce
✓ A09 Logging Failures         → Append-only audit_logs table
✓ A10 SSRF                     → Allowlist outbound domains`,

db: `# CHR-SYSTEM — DATABASE RULES FOR AI
# ════════════════════════════════════════════════════════

## Schema Conventions
- Primary keys: UUID v7 (time-sortable, RFC 9562) — use uuidv7 package
- All timestamps: TIMESTAMPTZ (not TIMESTAMP — always timezone-aware)
- Soft deletes: deleted_at TIMESTAMPTZ (NULL = active, NOT NULL = deleted)
- All clinical tables include: clinic_id UUID (FK → clinics.id)
- Version column: INTEGER DEFAULT 1 on mutable entities (optimistic lock)
- Enums: define as PostgreSQL ENUM via Prisma enum {} blocks

## Core Tables Quick Reference
users:            id, email, password_hash, role, clinic_id,
                  is_active, mfa_secret, last_login_at,
                  failed_logins, locked_until, deleted_at

patients:         id, mrn, first_name, last_name, dob, gender,
                  blood_type, allergies[], phone, email, address,
                  emergency_contact, clinic_id, user_id, deleted_at

medical_records:  id, patient_id, doctor_id, record_type,
                  encrypted_content, iv, auth_tag,
                  diagnosis_codes[], attachments, version,
                  clinic_id, created_at, deleted_at

vitals:           id, patient_id, recorded_by, recorded_at,
                  bp_systolic, bp_diastolic, heart_rate, spo2,
                  temperature_f, respiratory_rate, weight_kg,
                  height_cm, notes, clinic_id

appointments:     id, patient_id, doctor_id, type, status,
                  scheduled_at, duration_min, notes, room,
                  cancelled_at, cancel_reason, clinic_id

prescriptions:    id, patient_id, doctor_id, medication_name,
                  dosage, unit, frequency, route,
                  start_date, end_date, is_active,
                  discontinued_at, discontinued_by, clinic_id

lab_results:      id, patient_id, ordered_by, resulted_by,
                  test_name, result_value, unit,
                  ref_range_low, ref_range_high, is_abnormal,
                  status, ordered_at, resulted_at, clinic_id

audit_logs:       id BIGSERIAL, user_id, action, resource,
                  resource_id, clinic_id, ip_address INET,
                  user_agent, request_id, metadata, timestamp
                  ← APPEND-ONLY: no UPDATE/DELETE ever

## Required Indexes (add to every new table)
-- Always add these for every clinical table:
CREATE INDEX idx_{table}_clinic ON {table}(clinic_id, deleted_at);
CREATE INDEX idx_{table}_created ON {table}(created_at DESC);
-- Add for specific query patterns:
CREATE INDEX idx_records_patient ON medical_records(patient_id, created_at DESC);
CREATE INDEX idx_vitals_time ON vitals(patient_id, recorded_at DESC);
CREATE INDEX idx_audit_ts ON audit_logs USING BRIN (timestamp);

## Migration Rules
1. NEVER edit existing migration files — always create new ones
2. Destructive changes: add column nullable first, migrate data, then NOT NULL
3. Enum changes: create new enum, migrate column, drop old enum
4. Always include a rollback migration file alongside every forward migration
5. Seed data in packages/db/seed.ts — include test users for all 6 roles

## Row-Level Security Template
-- Apply on all clinical tables:
ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;
CREATE POLICY {table}_clinic_isolation ON {table}
  USING (clinic_id = current_setting('app.current_clinic_id')::uuid);
CREATE POLICY {table}_soft_delete ON {table}
  USING (deleted_at IS NULL);
-- Prisma middleware to set session variable before each query:
prisma.$use(async (params, next) => {
  await prisma.$executeRaw\`
    SET LOCAL app.current_clinic_id = \${clinicId}\`;
  return next(params);
});`,

ui: `# CHR-SYSTEM — UI/UX RULES FOR AI
# ════════════════════════════════════════════════════════

## Design System: Neumorphic (matches CHR reference image)
The UI uses a soft, extruded neumorphic design on a light ice-blue
background (#EEF0F5). Cards appear to rise from the surface.
Interactive elements press inward when activated.

## Neumorphic CSS Utilities
/* Card — rises from background */
.neu-card {
  background: #F2F4FA;
  border-radius: 16px;
  box-shadow: 6px 6px 12px #C8CAD4, -6px -6px 12px #FFFFFF;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}
.neu-card:hover {
  box-shadow: 8px 8px 16px #C8CAD4, -8px -8px 16px #FFFFFF;
  transform: translateY(-1px);
}

/* Button — neumorphic default */
.neu-btn {
  background: #F2F4FA;
  box-shadow: 4px 4px 8px #C8CAD4, -4px -4px 8px #FFFFFF;
  border-radius: 10px; border: none; cursor: pointer;
  transition: all 0.15s ease;
}
.neu-btn:active {
  box-shadow: inset 3px 3px 7px #C8CAD4, inset -3px -3px 7px #FFFFFF;
  transform: scale(0.98);
}

/* Input — sunken into surface */
.neu-input {
  background: #EEF0F5;
  box-shadow: inset 4px 4px 8px #C8CAD4, inset -4px -4px 8px #FFFFFF;
  border-radius: 12px; border: none; outline: none;
  padding: 10px 14px;
}
.neu-input:focus {
  box-shadow: inset 4px 4px 8px #C8CAD4,
              inset -4px -4px 8px #FFFFFF,
              0 0 0 2px #FF6B35;
}

/* Toggle (matches reference OFF/ON pill) */
.neu-toggle {
  width: 48px; height: 26px; border-radius: 999px;
  background: var(--off-color, #EEF0F5);
  box-shadow: inset 2px 2px 5px #C8CAD4, inset -2px -2px 5px #FFFFFF;
  position: relative; cursor: pointer; transition: all 0.25s ease;
}
.neu-toggle.on { background: #FF6B35; box-shadow: 0 2px 8px rgba(255,107,53,0.4); }
.neu-toggle-knob {
  position: absolute; top: 3px; left: 3px;
  width: 20px; height: 20px; border-radius: 50%;
  background: #FFFFFF; box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  transition: left 0.25s ease;
}
.neu-toggle.on .neu-toggle-knob { left: 25px; }

## Typography Scale
Font families:
  Display/UI:  'DM Sans' (weights: 400, 500, 600, 700, 800)
  Monospace:   'DM Mono'  (for MRNs, IDs, code, times)

Scale:
  --text-4xl: 32px/40px bold   ← page hero titles
  --text-3xl: 24px/32px bold   ← section headers
  --text-2xl: 20px/28px 700    ← card titles, stat numbers
  --text-xl:  16px/24px 600    ← sub-headers
  --text-base:14px/22px 400    ← body text
  --text-sm:  12px/18px 400    ← secondary info
  --text-xs:  10px/16px 500    ← labels, badges (UPPERCASE)
  --text-mono:13px/20px 400    ← MRN, timestamps, IDs

## Status Badge System
Stable/Normal/Confirmed → green  (#27AE60) bg-opacity-10
Review/Warning/Pending  → yellow (#F39C12) bg-opacity-10
Critical/Error/Urgent   → red    (#E84545) bg-opacity-10
Info/Active/Confirmed   → blue   (#4A90D9) bg-opacity-10
Discharged/Completed    → purple (#8E44AD) bg-opacity-10

## Component Checklist
Every component must:
✓ Accept className prop for composition
✓ Have keyboard navigation (tabIndex, onKeyDown)
✓ Have aria-label or aria-labelledby
✓ Work at 375px mobile viewport
✓ Support reduced motion (prefers-reduced-motion: reduce)
✓ Show loading state (skeleton or spinner)
✓ Show empty state with actionable message
✓ Show error state with retry option

## Chart Standards (Recharts)
- Use SparkLine for trends in dashboard cards
- Use RadialBar/Gauge for single-value vitals (HR, SpO2)
- Use LineChart for time-series vitals (30-day view)
- Use PieChart/RadialPieChart for department breakdowns
- Always provide data-table alternative for accessibility
- Color scheme: accent→blue→green→yellow→purple (in order)
- Tooltips: neumorphic styled, show value + timestamp
- Responsive: ResponsiveContainer width="100%" height={height}`,

testing: `# CHR-SYSTEM — TESTING RULES FOR AI
# ════════════════════════════════════════════════════════

## Test Coverage Targets
Unit tests (Vitest):      90%+ on lib/, utils/, validators/
Integration tests:        80%+ on server/trpc/ procedures
E2E tests (Playwright):   100% of critical user journeys
Security tests (ZAP):     OWASP Top 10 endpoints covered
Performance (k6):         SLA targets: p95 < 150ms

## Vitest Unit Test Template
// __tests__/lib/crypto.test.ts
import { describe, it, expect } from 'vitest';
import { encryptRecord, decryptRecord } from '@/lib/crypto';

describe('encryptRecord', () => {
  it('produces ciphertext different from plaintext', () => {
    const plain = JSON.stringify({ notes: 'Patient presents with...' });
    const { ciphertext, iv, authTag } = encryptRecord(plain);
    expect(ciphertext.toString()).not.toBe(plain);
    expect(iv).toHaveLength(12);
    expect(authTag).toHaveLength(16);
  });

  it('decrypts back to original plaintext', () => {
    const plain = 'Clinical note content';
    const encrypted = encryptRecord(plain);
    expect(decryptRecord(encrypted)).toBe(plain);
  });

  it('throws on tampered auth tag', () => {
    const encrypted = encryptRecord('note');
    const tampered = { ...encrypted, authTag: Buffer.alloc(16) };
    expect(() => decryptRecord(tampered)).toThrow();
  });
});

## tRPC Integration Test Template
// __tests__/trpc/patients.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestCaller, createTestContext } from '../helpers';
import { db } from '@/lib/prisma';

describe('patientRouter', () => {
  let tx: typeof db;

  beforeEach(async () => {
    // Wrap each test in a transaction that rolls back
    tx = await db.$begin();
  });

  afterEach(async () => {
    await tx.$rollback();
  });

  it('RBAC: NURSE cannot create medical record', async () => {
    const ctx = createTestContext({ role: 'NURSE', tx });
    const caller = createTestCaller(ctx);
    await expect(
      caller.records.create({ patientId: 'uuid', content: 'note' })
    ).rejects.toThrow('FORBIDDEN');
  });

  it('clinic scope: doctor cannot access other clinic patient', async () => {
    const ctx = createTestContext({ role: 'DOCTOR', clinicId: 'clinic-A', tx });
    const caller = createTestCaller(ctx);
    await expect(
      caller.patients.getById({ id: 'patient-from-clinic-B' })
    ).rejects.toThrow('NOT_FOUND'); // not FORBIDDEN — don't leak existence
  });
});

## Playwright E2E Test Template
// e2e/patient-flow.spec.ts
import { test, expect } from '@playwright/test';

test('doctor creates and views patient record', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'doctor@test.chr');
  await page.fill('[name="password"]', 'TestPass123!');
  await page.click('[type="submit"]');
  await expect(page).toHaveURL('/dashboard');

  // Create patient
  await page.click('[data-testid="new-patient"]');
  await page.fill('[name="firstName"]', 'Test');
  await page.fill('[name="lastName"]', 'Patient');
  await page.fill('[name="dob"]', '1990-01-01');
  await page.click('[data-testid="submit-patient"]');
  await expect(page.locator('[data-testid="mrn"]')).toContainText('MRN-');

  // Verify audit log created
  await page.goto('/admin/audit');
  await expect(page.locator('text=CREATE')).toBeVisible();
});

## Security Test Checklist (run before every PR)
[ ] SQL injection: pass "'; DROP TABLE patients; --" as patient name
[ ] XSS: pass "<script>alert(1)</script>" in all text fields
[ ] IDOR: access /api/patients/{other-clinic-patient-id}
[ ] Auth bypass: call protected endpoint without Authorization header
[ ] Rate limit: POST /api/auth/login 6 times → expect 429
[ ] Role escalation: NURSE calling POST /api/records → expect 403
[ ] Expired JWT: use 16-min-old token → expect 401

## Test Data Factories (use Faker)
import { faker } from '@faker-js/faker';

export const patientFactory = () => ({
  firstName:  faker.person.firstName(),
  lastName:   faker.person.lastName(),
  dob:        faker.date.birthdate({ min: 18, max: 90, mode: 'age' }),
  gender:     faker.helpers.arrayElement(['MALE', 'FEMALE', 'OTHER']),
  bloodType:  faker.helpers.arrayElement(['A+','A-','B+','B-','O+','O-','AB+','AB-']),
  phone:      faker.phone.number('+91 ##########'),
  clinicId:   'test-clinic-id',
});`,

ai: `# CHR-SYSTEM — AI FEATURE RULES FOR AI
# Rules governing the Ollama/AI integration
# ════════════════════════════════════════════════════════

## Core AI Principles
1. ALL AI inference runs via Ollama — PHI NEVER sent to external API
2. AI outputs are SUGGESTIONS ONLY — never auto-applied to records
3. Every AI call is audit logged: { model, promptHash, duration, userId }
4. AI is DOCTOR-role only — NURSE/PATIENT/ADMIN get 403
5. Circuit breaker: 3 failures in 60s → open; check every 30s
6. Always show confidence scores + disclaimer on all AI outputs
7. Degrade gracefully: if Ollama down, return { suggestions: [], unavailable: true }

## Ollama Client Template
// lib/ai/ollama.ts
import { createCircuitBreaker } from './circuit-breaker';

const breaker = createCircuitBreaker({ threshold: 3, resetTimeout: 30000 });

export async function ollamaChat(params: {
  systemPrompt: string;
  userPrompt: string;
  responseFormat?: 'json' | 'text';
  timeout?: number;
}): Promise<OllamaResponse> {
  return breaker.fire(async () => {
    const controller = new AbortController();
    const timer = setTimeout(
      () => controller.abort(),
      params.timeout ?? 30000
    );
    try {
      const res = await fetch(\`\${process.env.OLLAMA_BASE_URL}/api/chat\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: process.env.OLLAMA_MODEL ?? 'llama3.2:3b',
          messages: [
            { role: 'system', content: params.systemPrompt },
            { role: 'user',   content: params.userPrompt },
          ],
          format: params.responseFormat === 'json' ? 'json' : undefined,
          stream: false,
        }),
      });
      if (!res.ok) throw new Error(\`Ollama error: \${res.status}\`);
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  });
}

## Symptom Check Prompt Template
const SYMPTOM_CHECK_SYSTEM = \`
You are a clinical decision support assistant. You help doctors structure
their clinical reasoning. You do NOT diagnose — you provide a structured
differential for the doctor to evaluate.

Respond ONLY in valid JSON matching this exact schema:
{
  "differentials": [
    {
      "diagnosis": "string",
      "icd10": "string",
      "confidence": number (0-100),
      "reasoning": "string (max 100 words)",
      "urgency": "ROUTINE|URGENT|EMERGENT",
      "next_steps": ["string"]
    }
  ],
  "disclaimer": "string"
}
\`;

// PRIVACY: Never include patient name/surname in prompt
// Use: age, gender, symptoms, relevant labs — no identifiers
const userPrompt = \`
Patient context:
- Age: \${patient.age} | Gender: \${patient.gender}
- Allergies: \${patient.allergies.join(', ') || 'None known'}
- Active conditions: \${conditions.join(', ') || 'None'}
- Current medications: \${meds.join(', ') || 'None'}

Presenting symptoms: \${input.symptoms}

Provide a differential diagnosis list (3-5 options).
\`;

## AI Audit Log Entry
await auditLog(ctx, {
  action: 'AI_CALL',
  resource: 'symptom_check',
  metadata: {
    model: process.env.OLLAMA_MODEL,
    promptHash: crypto
      .createHash('sha256')
      .update(userPrompt)
      .digest('hex'),       // Hash prompt, not PHI content
    durationMs: Date.now() - startTime,
    differentialCount: result.differentials.length,
  }
});

## AI UI Disclaimer (always render)
<div role="alert" aria-live="polite" className="ai-disclaimer">
  ⚠️ AI-generated suggestion — not a clinical diagnosis.
  Requires doctor review and clinical judgment before use.
  Model: {modelName} | Confidence values are indicative only.
</div>`,

git: `# CHR-SYSTEM — GIT & PR RULES FOR AI
# Follow these when generating commits, PRs, or changelogs
# ════════════════════════════════════════════════════════

## Conventional Commits Format
<type>(<scope>): <description>

[optional body]

[optional footer(s)]

## Types
feat:     New feature (FS-XXX reference recommended)
fix:      Bug fix
security: Security fix or hardening (ALWAYS use for auth/crypto changes)
perf:     Performance improvement
refactor: Code restructure without behaviour change
test:     Adding or updating tests
docs:     Documentation only
chore:    Build, deps, CI changes
style:    Formatting only (no logic change)

## Scopes
auth, patients, records, vitals, appointments, prescriptions,
labs, ai, audit, notifications, search, admin, portal,
db, api, ui, ci, docker, deps

## Example Commits
feat(records): implement AES-256-GCM encryption for medical records
  - Add encryptRecord/decryptRecord utilities in lib/crypto.ts
  - Store iv, authTag, ciphertext as separate BYTEA columns
  - Update Prisma schema: add iv and authTag columns
  - Add unit tests for encryption round-trip and tamper detection

  FS-005 | Security: PHI now encrypted at application layer
  Closes #47

security(auth): add account lockout after 5 failed login attempts
  - Redis INCR on auth:fail:{email} with 900s TTL
  - Check locked_until before credential verification
  - Audit log LOGIN_FAIL action on each failure

  OWASP A07 | Mitigates brute-force attacks

fix(vitals): correct SpO2 alert threshold comparison
  Was using >= instead of <= for low SpO2 detection.
  Critical bug: alerts were not firing for dangerously low SpO2.

  Closes #52 | Severity: HIGH

## Branch Naming
feature/fs-001-auth-system
feature/fs-005-encrypted-records
fix/vitals-spo2-alert-threshold
security/owasp-a07-account-lockout
refactor/prisma-rls-policies
docs/readme-showcase-rewrite
chore/update-nextjs-15-3

## PR Template
## Summary
Brief description of what this PR does and why.

## Feature Spec Reference
FS-XXX — Feature Name

## Changes
- [ ] New/modified files listed
- [ ] Schema changes (Prisma migration included?)
- [ ] Environment variables added?

## Security Checklist
- [ ] RBAC checked on all new endpoints
- [ ] Clinic scope applied to all DB queries
- [ ] PHI access audit logged
- [ ] No secrets in code or logs
- [ ] Input validated with Zod
- [ ] No new npm packages with known CVEs (npm audit clean)

## Tests
- [ ] Unit tests added/updated
- [ ] Integration tests cover the new procedure
- [ ] E2E test added for user-facing flow
- [ ] Manual testing steps documented

## Screenshots (if UI change)
[Attach screenshot of the neumorphic component]

## Breaking Changes
None / List any

## Related Issues
Closes #XXX`,

cursor: `# CHR-SYSTEM — CURSOR IDE RULES
# Save as .cursorrules in project root
# ════════════════════════════════════════════════════════

You are working on CHR-System, a production-grade open-source EHR
platform built with Next.js 15, TypeScript, PostgreSQL, and tRPC.

## Core Identity
- Author: Madhavan Shivakumar
- Stack: Next.js 15 · tRPC · PostgreSQL 16 · Prisma · Redis · Ollama
- Every feature must follow the CHR coding standards
- PHI (Protected Health Information) must always be encrypted

## Auto-Apply These Rules on Every Code Generation

### TypeScript
- strict: true always; no implicit any
- Infer types from Zod and Prisma — do not duplicate type definitions
- Prefer functional patterns; avoid classes except for error types

### tRPC
- All procedures: use protectedProcedure (never publicProcedure for PHI)
- Always include .input(zodSchema) and .output(zodSchema)
- Call auditLog() for every PHI access inside the procedure
- Scope all queries with ctx.session.user.clinicId

### Database (Prisma)
- Never use deleteMany or delete on clinical tables — use soft delete
- Always include clinicId in WHERE conditions
- Use select to limit returned fields — never return whole rows
- Handle P2025 (not found) and P2034 (conflict) explicitly

### UI Components
- Design system: neumorphic (#EEF0F5 background, shadow cards)
- Accent colour: #FF6B35
- Fonts: 'DM Sans' for UI, 'DM Mono' for IDs/timestamps
- All components: keyboard nav + aria attributes + mobile-first
- shadcn/ui as base, extended with custom neumorphic classes

### Security (non-negotiable)
- Never console.log PHI — use Pino structured logger
- Never store tokens in localStorage — memory + HttpOnly cookie
- Rate limit: wrap auth endpoints with checkRateLimit(email, ctx.ip)
- Encryption: always use lib/crypto.ts encryptRecord() — never roll own

### File Structure
server/trpc/[feature].ts    ← tRPC router
lib/[utility].ts            ← shared utilities
components/[Feature]/       ← feature components
app/(dashboard)/[feature]/  ← pages

### When Asked to Add a Feature
1. Check packages/db/schema.prisma for existing tables first
2. Add migration if schema changes needed
3. Write the tRPC router with RBAC + audit log
4. Write the React component with neumorphic design
5. Write unit + integration tests
6. Update README if it's a new module

### When Asked to Fix a Bug
1. Identify the root cause, not just the symptom
2. Check if it's a security issue — if yes, flag immediately
3. Write a failing test that reproduces the bug first
4. Fix the code until the test passes
5. Check if similar bugs exist in related code

### Code Quality Gates (before marking done)
- [ ] TypeScript compiles with 0 errors
- [ ] ESLint passes with 0 warnings
- [ ] Unit tests pass
- [ ] No console.log statements
- [ ] No hardcoded strings (use constants or i18n)
- [ ] No secrets in code`,

review: `# CHR-SYSTEM — CODE REVIEW PROMPT
# Paste this when asking AI to review a PR or file
# ════════════════════════════════════════════════════════

Please review the following CHR-System code against these criteria:

## 1. Security Review
[ ] Are all tRPC procedures using protectedProcedure?
[ ] Is RBAC (role check) applied before any data access?
[ ] Is clinicId scope applied to ALL database queries?
[ ] Is PHI access audit logged with auditLog()?
[ ] Are there any console.log() calls with PHI data?
[ ] Are inputs validated with Zod before use?
[ ] Are any secrets hardcoded or leaked to client?
[ ] Is any new medical record content encrypted?

## 2. Database Review
[ ] Are all queries soft-delete-aware (WHERE deleted_at IS NULL)?
[ ] Are there any N+1 query problems (missing include/select)?
[ ] Is the clinicId filter present on every query?
[ ] Are transactions used for multi-step operations?
[ ] Are new columns nullable-first if adding to existing table?

## 3. TypeScript Review
[ ] Are there any implicit any types?
[ ] Are Zod schemas defined for all inputs and outputs?
[ ] Are Prisma types inferred (not manually duplicated)?
[ ] Are all async functions awaited correctly?
[ ] Are errors properly typed and handled?

## 4. Performance Review
[ ] Are there any queries inside loops (N+1)?
[ ] Should any data be cached in Redis?
[ ] Are pagination cursors used (not OFFSET)?
[ ] Are indexes used for the query patterns in this PR?

## 5. UI/UX Review (if frontend code)
[ ] Are neumorphic design tokens used correctly?
[ ] Does the component have keyboard navigation?
[ ] Are aria labels present on interactive elements?
[ ] Is the component mobile-responsive (min 375px)?
[ ] Are loading, error, and empty states handled?

## 6. Testing Review
[ ] Are unit tests included for new utility functions?
[ ] Are integration tests included for new tRPC procedures?
[ ] Do tests cover the unhappy path (auth failure, not found)?
[ ] Is a RBAC boundary test included?

## Output Format
Provide your review as:
CRITICAL: [issues that block merge — security/data loss]
HIGH:     [issues that should be fixed before merge]
MEDIUM:   [improvements to make in a follow-up PR]
LOW:      [suggestions and style notes]
APPROVED: [confirm if code is ready to merge]`,

debug: `# CHR-SYSTEM — DEBUG PROMPT
# Paste this when asking AI to debug an issue
# ════════════════════════════════════════════════════════

I need help debugging a CHR-System issue.

## Environment
- Next.js 15 App Router + tRPC + PostgreSQL + Prisma
- Docker Compose (all services running)
- Role attempting action: [DOCTOR/NURSE/ADMIN/PATIENT]
- Feature area: [auth/patients/records/vitals/appointments/...]

## Issue Description
[Describe what is happening vs. what should happen]

## Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Error Output
[Paste the full error message, stack trace, or console output]
[Include HTTP status code and response body if API issue]

## Relevant Code
[Paste the tRPC procedure, component, or API route]

## What I've Already Tried
[List any fixes attempted]

## Debug Checklist — Please Verify Each:
1. Is the JWT token present and valid? (check Network tab → Authorization header)
2. Is the user's role correct for this action? (check ctx.session.user.role)
3. Is clinicId present on the query? (check Prisma query log)
4. Did the Zod validation pass? (check for ZodError in response)
5. Is the audit_logs write succeeding? (check DB directly)
6. Is Redis available? (check docker compose logs redis)
7. Is the Prisma migration up to date? (npx prisma db push --dry-run)
8. Are environment variables set? (check docker compose exec web env)

## Expected Output Format
Please provide:
1. Root cause identification
2. The minimal code fix
3. A test case that would catch this bug in future
4. Any related security implications`,

feature: `# CHR-SYSTEM — NEW FEATURE DEVELOPMENT PROMPT
# Paste this when asking AI to implement a new feature
# ════════════════════════════════════════════════════════

Please implement the following CHR-System feature:

## Feature Reference
Feature Spec: FS-[XXX] — [Feature Name]
Phase: [1/2/3/4]
Priority: [Critical/High/Medium/Low]

## Feature Description
[Describe what the feature does in 2-3 sentences]

## Roles That Can Access This Feature
[e.g., DOCTOR, NURSE — not PATIENT, RECEPTIONIST]

## Required Deliverables

### 1. Prisma Schema Changes
- New tables or columns needed
- Include migration SQL
- Add required indexes
- Note any RLS policies needed

### 2. tRPC Router (server/trpc/[feature].ts)
- All procedures with RBAC guards
- Zod input + output schemas
- auditLog() calls for PHI access
- Error handling for all edge cases
- Redis caching where appropriate

### 3. React Components (components/[Feature]/)
- Neumorphic design (use CHR design tokens)
- Mobile-responsive (min 375px)
- Keyboard navigation + aria labels
- Loading, error, and empty states
- TypeScript props interface

### 4. Next.js Page (app/(dashboard)/[feature]/page.tsx)
- Server Component for data fetch
- Pass data to Client Components
- Role guard in middleware

### 5. Tests
- Unit tests for business logic (Vitest)
- Integration test for tRPC procedure (Vitest)
- E2E test for main user journey (Playwright)
- Security test: RBAC boundary check

## Constraints
- Zero recurring cost — no paid APIs
- TypeScript strict mode
- All PHI must be audit logged
- Follow CHR neumorphic design system
- Add conventional commit message for each file

## Please Implement in This Order
1. Prisma schema → 2. tRPC router → 3. Tests → 4. UI Component → 5. Page`,

quickref: `# CHR-SYSTEM — QUICK REFERENCE CARD
# ════════════════════════════════════════════════════════

## Most-Used Commands
# Start full stack (first time)
docker compose up -d
npx prisma migrate dev
npx prisma db seed
npm run dev

# Reset database (dev only)
npx prisma migrate reset --force

# Run tests
npm run test              # Vitest unit + integration
npm run test:e2e          # Playwright
npm run test:coverage     # Coverage report

# Type check + lint
npm run typecheck
npm run lint

# Generate Prisma client after schema change
npx prisma generate

## Key File Locations
lib/auth.ts              ← NextAuth v5 config
lib/prisma.ts            ← Prisma singleton (with middleware)
lib/audit.ts             ← auditLog() utility
lib/crypto.ts            ← encryptRecord / decryptRecord
lib/logger.ts            ← Pino logger instance
server/trpc/index.ts     ← tRPC app router (combines all routers)
server/trpc/_base.ts     ← protectedProcedure, createTRPCRouter
middleware.ts            ← Next.js Edge middleware (auth + role)
packages/db/schema.prisma← Single source of truth for DB schema

## tRPC Boilerplate (copy-paste)
// server/trpc/[feature].ts
import { createTRPCRouter, protectedProcedure } from './_base';
import { z } from 'zod';
import { auditLog } from '@/lib/audit';
import { TRPCError } from '@trpc/server';

export const [feature]Router = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ cursor: z.string().optional(), limit: z.number().default(20) }))
    .output(z.object({ items: z.array(ItemSchema), nextCursor: z.string().nullable() }))
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.[table].findMany({
        where: { clinicId: ctx.session.user.clinicId, deletedAt: null },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' },
      });
      await auditLog(ctx, { action: 'VIEW', resource: '[feature]' });
      const nextCursor = items.length > input.limit ? items.pop()!.id : null;
      return { items, nextCursor };
    }),
});

## Role Checks Quick Reference
allowedRoles(['ADMIN'])                   ← admin panel only
allowedRoles(['DOCTOR'])                  ← clinical actions
allowedRoles(['DOCTOR', 'NURSE'])         ← clinical read
allowedRoles(['DOCTOR', 'NURSE', 'ADMIN'])← most clinical views
allowedRoles(['PATIENT'])                 ← patient portal only
allowedRoles(['LAB_TECH', 'DOCTOR'])      ← lab results

## Redis Key Patterns
auth:fail:{email}          → failed login count (900s TTL)
auth:rt:{tokenHash}        → refresh token (7d TTL)
patient:{id}               → patient profile cache (5min TTL)
vitals:{patientId}:latest  → latest vitals (30s TTL)
appointments:dr:{id}:{date}→ day schedule cache (2min TTL)
notify:unread:{userId}     → unread notification count (60s TTL)
ratelimit:api:{ip}         → sliding window counter (60s TTL)

## Common Errors + Fixes
P2025 → Record not found: return NOT_FOUND TRPCError
P2034 → Optimistic lock: return CONFLICT "Refresh and retry"
401   → JWT expired: client should call /api/auth/refresh
403   → Wrong role or wrong clinic: log as security event
429   → Rate limited: check Redis auth:fail:{email} key
503   → DB connection pool: check PgBouncer pool status`,
};

const CopyButton = ({ text, label = "Copy" }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="copy-btn" style={{
      display: "flex", alignItems: "center", gap: 6,
      padding: "5px 12px", borderRadius: 6, border: `1px solid ${T.border}`,
      background: "transparent", cursor: "pointer", color: T.textSecondary,
      fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
      transition: "all 0.15s ease",
    }}>
      {copied ? (
        <><span style={{ color: T.green }}>✓</span> <span style={{ color: T.green }}>Copied!</span></>
      ) : (
        <><span>⎘</span> {label}</>
      )}
    </button>
  );
};

const Tag = ({ text, color }) => (
  <span className="tag" style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
    {text}
  </span>
);

const StatCard = ({ label, value, color }) => (
  <div style={{
    background: T.card, borderRadius: 12, padding: "14px 18px",
    border: `1px solid ${T.border}`, display: "flex", flexDirection: "column", gap: 4,
  }}>
    <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
    <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 500 }}>{label}</div>
  </div>
);

export default function App() {
  const [active, setActive] = useState("master");

  const current = SECTIONS.find(s => s.id === active);
  const prompt = PROMPTS[active] || "";

  return (
    <div style={{ display: "flex", height: "100vh", background: T.bg, overflow: "hidden" }}>
      <G />

      {/* Sidebar */}
      <div style={{
        width: 230, background: T.surface, borderRight: `1px solid ${T.border}`,
        display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden",
      }}>
        {/* Logo */}
        <div style={{
          padding: "18px 16px 14px", borderBottom: `1px solid ${T.border}`,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: T.accent,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 900, color: T.white, fontFamily: "'Inter',sans-serif",
            boxShadow: `0 0 12px rgba(255,107,53,0.4)`,
          }}>⚕</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.textPrimary, letterSpacing: -0.3 }}>CHR-System</div>
            <div style={{ fontSize: 9, color: T.textMuted, fontWeight: 500, letterSpacing: 0.8, fontFamily: "'JetBrains Mono',monospace" }}>AI MASTER PROMPTS</div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }}>
          {SECTIONS.map(sec => (
            <div key={sec.id}
              className={`nav-item ${active === sec.id ? "active" : ""}`}
              onClick={() => setActive(sec.id)}
              style={{
                display: "flex", alignItems: "center", gap: 9,
                padding: "8px 10px", borderRadius: 8, marginBottom: 1,
                borderLeft: "2px solid transparent", color: T.textMuted,
                fontSize: 12, fontWeight: 500,
              }}>
              <span style={{ fontSize: 14 }}>{sec.icon}</span>
              <span style={{ flex: 1, fontSize: 11.5 }}>{sec.label}</span>
              {active === sec.id && (
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: sec.color }} />
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 14px", borderTop: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 10, color: T.textMuted, fontFamily: "'JetBrains Mono',monospace" }}>
            Madhavan Shivakumar<br />
            <span style={{ color: T.accent }}>github.com/Madhavan-dev18</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Top bar */}
        <div style={{
          height: 56, background: T.surface, borderBottom: `1px solid ${T.border}`,
          display: "flex", alignItems: "center", padding: "0 24px", gap: 12, flexShrink: 0,
        }}>
          <span style={{ fontSize: 18, }}>{current?.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary }}>{current?.label}</div>
            <div style={{ fontSize: 11, color: T.textMuted, fontFamily: "'JetBrains Mono',monospace" }}>
              {prompt.split('\n').length} lines · {prompt.length.toLocaleString()} chars
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Tag text="v2.0" color={T.accent} />
            <Tag text="June 2026" color={T.blue} />
            <CopyButton text={prompt} label="Copy Prompt" />
          </div>
        </div>

        {/* Prompt display */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }} className="fade">

            {/* Info banner for master prompt */}
            {active === "master" && (
              <div style={{
                background: `${T.accent}10`, border: `1px solid ${T.accent}30`,
                borderRadius: 10, padding: "12px 16px", marginBottom: 16,
                display: "flex", gap: 12, alignItems: "flex-start",
              }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>⚡</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.accent, marginBottom: 3 }}>
                    Master System Prompt — Use This First
                  </div>
                  <div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.6 }}>
                    Paste this at the start of every new AI chat session about CHR-System.
                    It establishes your role, constraints, and output format. Then add the
                    relevant sub-prompt (Stack Context, Coding Rules, etc.) for the specific task.
                  </div>
                </div>
              </div>
            )}

            {/* Usage guide */}
            {active === "quickref" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
                <StatCard label="Prompt Sections" value="15" color={T.accent} />
                <StatCard label="Features Covered" value="15" color={T.blue} />
                <StatCard label="RBAC Roles" value="6" color={T.green} />
                <StatCard label="OWASP Rules" value="10" color={T.red} />
              </div>
            )}

            {/* How to use row */}
            {active === "master" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
                {[
                  { step: "1", title: "Start every session", desc: "Paste Master System Prompt → sets AI role, constraints, and output format", color: T.accent },
                  { step: "2", title: "Add context prompts", desc: "Add Project Identity + Stack Context for the AI to understand the codebase", color: T.blue },
                  { step: "3", title: "Use task prompts", desc: "Use Code Review / Debug / New Feature prompt for specific tasks", color: T.green },
                ].map(item => (
                  <div key={item.step} style={{
                    background: T.card, borderRadius: 10, padding: "14px 16px",
                    border: `1px solid ${T.border}`,
                  }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: 6, background: item.color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 800, color: T.white, marginBottom: 8,
                    }}>{item.step}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.textPrimary, marginBottom: 4 }}>{item.title}</div>
                    <div style={{ fontSize: 11, color: T.textSecondary, lineHeight: 1.5 }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            )}

            {/* The prompt block */}
            <div className="prompt-block" style={{
              background: T.codeBg, borderRadius: 12,
              border: `1px solid ${T.border}`,
              overflow: "hidden",
            }}>
              {/* Code header */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 16px", borderBottom: `1px solid ${T.border}`,
                background: T.surface,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", gap: 5 }}>
                    {[T.red, T.yellow, T.green].map((c, i) => (
                      <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 11, color: T.textMuted, fontFamily: "'JetBrains Mono',monospace" }}>
                    chr-system-{active}-prompt.txt
                  </span>
                </div>
                <CopyButton text={prompt} />
              </div>

              {/* Code content */}
              <pre style={{
                padding: "20px 24px", margin: 0,
                fontSize: 11.5, lineHeight: 1.75,
                color: T.codeText, fontFamily: "'JetBrains Mono', monospace",
                overflow: "auto", maxHeight: "calc(100vh - 260px)",
              }}>
                {prompt.split('\n').map((line, i) => {
                  // comment lines
                  if (line.startsWith('#')) return (
                    <span key={i} style={{ color: T.textMuted, display: "block" }}>
                      {line}{'\n'}
                    </span>
                  );
                  // section headers (## or ###)
                  if (line.startsWith('## ') || line.startsWith('### ')) return (
                    <span key={i} style={{ color: T.accent, fontWeight: 700, display: "block" }}>
                      {line}{'\n'}
                    </span>
                  );
                  // checkboxes
                  if (line.includes('[ ]') || line.includes('[x]') || line.includes('✓') || line.includes('✗')) return (
                    <span key={i} style={{
                      color: line.includes('✓') ? T.green : line.includes('✗') ? T.red : T.textSecondary,
                      display: "block",
                    }}>
                      {line}{'\n'}
                    </span>
                  );
                  // numbered items
                  if (/^\d+\.\s/.test(line.trim())) return (
                    <span key={i} style={{ color: T.blue, display: "block" }}>
                      {line}{'\n'}
                    </span>
                  );
                  // code-like lines
                  if (line.includes('const ') || line.includes('async ') || line.includes('export ') ||
                      line.includes('import ') || line.includes('await ') || line.includes('=>')) return (
                    <span key={i} style={{ color: "#C3B1E1", display: "block" }}>
                      {line}{'\n'}
                    </span>
                  );
                  // key: value pairs
                  if (/^[A-Z_]+:\s/.test(line) || /^-{1,3}\s/.test(line)) return (
                    <span key={i} style={{ color: T.textPrimary, display: "block" }}>
                      {line}{'\n'}
                    </span>
                  );
                  return <span key={i} style={{ display: "block" }}>{line}{'\n'}</span>;
                })}
              </pre>
            </div>

            {/* Bottom copy CTA */}
            <div style={{
              marginTop: 16, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12,
            }}>
              <span style={{ fontSize: 11, color: T.textMuted }}>
                {prompt.split('\n').length} lines ready to paste
              </span>
              <button onClick={() => { navigator.clipboard.writeText(prompt); }}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 20px", borderRadius: 8, border: "none",
                  background: T.accent, color: T.white, cursor: "pointer",
                  fontSize: 13, fontWeight: 700, fontFamily: "'Inter',sans-serif",
                  boxShadow: `0 4px 14px rgba(255,107,53,0.35)`,
                  transition: "all 0.15s ease",
                }}>
                ⎘ Copy Full Prompt
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
