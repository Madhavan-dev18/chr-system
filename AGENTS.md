# CHR-System — AGENTS.md
# Persistent context for AI agents working on this repository.
# Update "Active Task" at the start of each sprint.

> ⚠️ AGENT RULE: Before generating any file, read this document in full.
> Never modify anything under `src/`. Never use Firebase, Supabase, or any paid API.
> When in doubt, ask — do not hallucinate missing context.

## Project
- **Name**: CHR-System (Clinical Health Records System)
- **Author**: Madhavan Shivakumar
- **Repo**: github.com/Madhavan-dev18/chr-system

## Current Phase: Phase 1 (Foundation)

## Active Task: FS-001 — Auth System (NextAuth v5 + PostgreSQL)

## Reference Documents
- **Feature Specs**: `Rebuild/CHR_Feature_Specification.docx`
- **PRD**: `Rebuild/CHR_System_PRD.pdf`
- **SDD (Architecture)**: `Rebuild/CHR_System_SDD.pdf`
- **AI Prompts**: `Rebuild/CHR_AI_Master_Prompt.jsx` (15 sections — copy relevant section for task)
- **Design Wireframes**: `Rebuild/CHR_Design_System.jsx` (7 screens, neumorphic tokens)

## Critical Constraints (non-negotiable)
1. **Don't touch `src/`** — that is legacy MediSafe code, scheduled for removal
2. Build everything fresh under `apps/web/` + `packages/db/`
3. **Stack**: Next.js 15 · TypeScript strict · PostgreSQL 16 · Prisma · tRPC · NextAuth v5 · Redis · Ollama
4. `strict: true` — no `@ts-nocheck`, no `ignoreBuildErrors`, no implicit `any`
5. **Zero recurring cost** — only free/open-source tools, no Firebase/Supabase/paid cloud
6. Every tRPC procedure: `protectedProcedure` + RBAC role check + `clinic_id` scope + `auditLog()`
7. All PHI: AES-256-GCM encrypted at rest, never in logs or error messages
8. Auth tokens: memory + HttpOnly cookie only — never `localStorage`
9. No `console.log` — use Pino structured logger
10. No raw SQL — Prisma parameterised queries only
11. `src/` removal: delete in a single commit AFTER `apps/web/` auth flow is verified working end-to-end

## RBAC Roles (6)
`ADMIN` · `DOCTOR` · `NURSE` · `PATIENT` · `RECEPTIONIST` · `LAB_TECH`

## Design System
- **Style**: Neumorphic (light, `#EEF0F5` background)
- **Accent**: `#FF6B35`
- **Fonts**: DM Sans (UI), DM Mono (IDs/timestamps)
- **Components**: shadcn/ui base + neumorphic overrides
- **Shadow formula**: `6px 6px 12px #C8CAD4, -6px -6px 12px #FFFFFF`

## Phase 1 Checklist
- [ ] FS-001: Auth system (NextAuth v5, JWT + Redis refresh, MFA, rate limiting)
- [ ] FS-002: RBAC middleware (6 roles, protectedProcedure, clinic_id scope)
- [ ] INFRA-001: PostgreSQL setup (Prisma schema, all 8 tables, RLS policies, seed)
- [ ] INFRA-002: Docker Compose (postgres, redis, minio, meilisearch, ollama, pgbouncer, prometheus, grafana)
- [ ] INFRA-003: OWASP hardening (security headers, CSP, rate limiting, input validation)
- [ ] INFRA-004: CI/CD pipeline (GitHub Actions — lint, typecheck, test, build)
- [ ] INFRA-005: README rewrite (showcase quality, architecture diagram, screenshots)

## Environment Variables (required)
`DATABASE_URL`, `REDIS_URL`, `NEXTAUTH_SECRET`, `ACCESS_TOKEN_SECRET`,
`RECORD_ENCRYPTION_KEY` (exactly 32 bytes), `MINIO_ROOT_USER`,
`MINIO_ROOT_PASSWORD`, `MEILISEARCH_API_KEY`, `OLLAMA_BASE_URL`,
`OLLAMA_MODEL` (default: `llama3.2:3b`), `SMTP_HOST`, `SMTP_PASSWORD`,
`NEXTAUTH_URL`

## Folder Structure Target

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
    └── migrations/           ← Prisma migration history
