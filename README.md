# CHR System — Clinical Health Records

A **production-grade, HIPAA-aligned** Electronic Health Record (EHR) platform built with Next.js 15, tRPC, Prisma, NextAuth v5, Upstash Redis, and Google Gemini AI.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, RSC) |
| API | tRPC v11 + React Query v5 |
| Database | PostgreSQL via Supabase + Prisma ORM |
| Auth | NextAuth v5 (JWT, Credentials, MFA/TOTP) |
| Cache / Rate Limit | Upstash Redis |
| AI | Google Gemini 1.5 Flash (CDS) |
| Encryption | AES-256-GCM (medical records + MFA secrets) |
| Styling | Tailwind CSS v3 + neumorphic design system |

---

## Roles

| Role | Access |
|---|---|
| `ADMIN` | Full clinic management, audit logs, user CRUD |
| `DOCTOR` | Own patients, records, prescriptions, lab orders, AI CDS |
| `NURSE` | Assigned patients, vital signs recording |
| `RECEPTIONIST` | Patient registration, appointment booking |
| `LAB_TECH` | Lab queue, result recording |
| `PATIENT` | Own appointments, records (read-only portal) |

---

## Security Architecture

- **Encryption**: All `MedicalRecord` content encrypted at rest with AES-256-GCM. IV and AuthTag stored alongside ciphertext. MFA secrets encrypted with the same key.
- **Auth**: JWT sessions (4-hour max age), account lockout after 5 failed attempts (15-minute window), Redis-backed rate limiting per email.
- **MFA**: TOTP via `otplib`, compatible with Google Authenticator / Authy.
- **Multi-tenant isolation**: Prisma Client Extension enforces `clinicId` on every query via `AsyncLocalStorage`.
- **PHI Scrubbing**: Regex-based PHI scrubber strips names, phones, emails, SSNs, addresses before any AI API call.
- **Audit Trail**: Every login, view, create, update, delete is written to `AuditLog`. On DB failure, falls back to Upstash Redis DLQ.
- **Rate limiting**: Edge middleware (Upstash Ratelimit) + tRPC-layer (20 req/10s standard, 5 req/min for strict routes).
- **Security headers**: `next.config.ts` sets CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.

---

## Local Development

### Prerequisites
- Node.js ≥ 20
- A Supabase project (free tier works)
- An Upstash Redis database (free tier works)
- A Google AI Studio API key

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy env template
cp apps/web/.env.example apps/web/.env.local

# 3. Fill in .env.local with your values

# 4. Generate Prisma client
npm run db:generate

# 5. Push schema to database
npm run db:push

# 6. Seed with demo data
npm run db:seed

# 7. Start dev server
npm run dev
```

App runs at `http://localhost:3000`.

### Demo credentials (after seed)

| Role | Email | Password |
|---|---|---|
| Admin | admin@clinic.local | Admin1234! |
| Doctor | doctor@clinic.local | Doctor1234! |
| Nurse | nurse@clinic.local | Nurse1234! |
| Receptionist | reception@clinic.local | Reception1234! |
| Lab Tech | lab@clinic.local | LabTech1234! |

---

## Tests

```bash
npm run test            # run once
npm run test:watch      # watch mode
npm run test:coverage   # with coverage report
```

---

## Deployment

### Vercel (recommended)

```bash
vercel deploy
```

Set all env vars in Vercel dashboard. Set `AUTH_TRUST_HOST=true` and `AUTH_URL=https://your-domain.com`.

### Docker / Railway / Fly

Set `NEXT_OUTPUT=standalone` in env, then:

```bash
npm run build
node apps/web/.next/standalone/server.js
```

---

## Generating Secrets

```bash
# AUTH_SECRET / ACCESS_TOKEN_SECRET
openssl rand -base64 32

# RECORD_ENCRYPTION_KEY (must be 44 chars, decodes to 32 bytes)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Project Structure

```
chr-system/
├── apps/web/               # Next.js 15 application
│   ├── app/                # App router pages
│   │   ├── (auth)/         # Login page
│   │   ├── (dashboard)/    # Role-scoped dashboards
│   │   └── api/            # tRPC + NextAuth handlers
│   ├── components/         # UI components
│   ├── lib/                # Core utilities (auth, crypto, redis, ai)
│   ├── server/trpc/        # All tRPC routers
│   └── types/              # TypeScript augmentations
└── packages/db/            # Prisma schema + seed
```

---

Built by Madhavan Shivakumar · [Portfolio](https://madhavan-shivakumar-dev.vercel.app) · [GitHub](https://github.com/Madhavan-dev18)
