import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { Role } from '@chr/db';
import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '@/lib/redis';
import { auditLog } from '@/lib/audit';
import { tenantStorage } from '@/lib/prisma';
import type { TRPCContext } from './context';

// ── Rate limiters ────────────────────────────────────────────────

/** Standard API: 20 req / 10 s per IP */
const standardLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '10 s'),
  analytics: true,
  prefix: 'chr:trpc:standard',
});

/** Strict: 5 req / 1 min per IP (auth, AI) */
const strictLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  analytics: true,
  prefix: 'chr:trpc:strict',
});

// ── tRPC init ────────────────────────────────────────────────────

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    // In production, scrub INTERNAL_SERVER_ERROR details from the client.
    // Sentry would capture the original error on the server side.
    if (error.code === 'INTERNAL_SERVER_ERROR') {
      console.error('[tRPC] Unhandled server error:', error.cause ?? error);
      return {
        ...shape,
        message: 'An internal server error occurred.',
        data: { ...shape.data, stack: undefined },
      };
    }
    return shape;
  },
});

// ── Middleware ───────────────────────────────────────────────────

/** Apply IP-based rate limiting. isStrict=true for auth/AI routes. */
const rateLimitMiddleware = (isStrict = false) =>
  t.middleware(async ({ ctx, path, next }) => {
    const ip = ctx.ip;
    const limiter = isStrict ? strictLimiter : standardLimiter;
    const { success, limit, remaining } = await limiter.limit(ip);

    if (!success) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: `Rate limit exceeded (${limit} req / window). Please try again later.`,
      });
    }

    void remaining; // available for future use in response headers
    return next();
  });

/** Require a valid session. */
const authMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You must be logged in.' });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session as NonNullable<typeof ctx.session>,
    },
  });
});

/** Scope all DB queries to the user's clinic via AsyncLocalStorage. */
const clinicIsolationMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  if (!ctx.session!.user.clinicId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'This action requires a clinic context.',
    });
  }

  return tenantStorage.run(ctx.session!.user.clinicId, () =>
    next({
      ctx: {
        ...ctx,
        session: ctx.session as NonNullable<typeof ctx.session> & {
          user: NonNullable<typeof ctx.session>['user'] & { clinicId: string };
        },
      },
    })
  );
});

/** Auto-audit mutations after they succeed. */
const auditMiddleware = t.middleware(async ({ ctx, path, type, next }) => {
  const result = await next();

  if (type === 'mutation' && result.ok && ctx.session?.user) {
    const user = ctx.session!.user;
    await auditLog(ctx.db, {
      userId: user.id,
      clinicId: user.clinicId,
      action: 'UPDATE',
      resource: path,
      ipAddress: ctx.ip,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });
  }

  return result;
});

// ── RBAC helper ──────────────────────────────────────────────────

export function requireRoles(allowed: Role[]) {
  return t.middleware(({ ctx, next }) => {
    if (!ctx.session?.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
    if (!allowed.includes(ctx.session!.user.role as Role)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Access requires one of: ${allowed.join(', ')}.`,
      });
    }
    return next();
  });
}

// ── Exported procedure builders ──────────────────────────────────

export const createTRPCRouter = t.router;

/** Public — rate-limited, no auth required */
export const publicProcedure = t.procedure.use(rateLimitMiddleware());

/** Protected — requires auth, auto-audits mutations */
export const protectedProcedure = t.procedure
  .use(rateLimitMiddleware())
  .use(authMiddleware)
  .use(auditMiddleware);

/** Clinic-scoped — requires auth + clinicId, row-level isolation via tenantStorage */
export const clinicScopedProcedure = t.procedure
  .use(rateLimitMiddleware())
  .use(authMiddleware)
  .use(clinicIsolationMiddleware)
  .use(auditMiddleware);

/** Strict-rate-limited (auth routes, AI) */
export const strictProcedure = t.procedure
  .use(rateLimitMiddleware(true))
  .use(authMiddleware)
  .use(clinicIsolationMiddleware)
  .use(auditMiddleware);

// Role-specific shortcuts
export const adminProcedure = clinicScopedProcedure.use(requireRoles([Role.ADMIN]));
export const doctorProcedure = clinicScopedProcedure.use(requireRoles([Role.DOCTOR]));
export const nurseProcedure = clinicScopedProcedure.use(requireRoles([Role.NURSE]));
export const patientProcedure = clinicScopedProcedure.use(requireRoles([Role.PATIENT]));
export const receptionistProcedure = clinicScopedProcedure.use(requireRoles([Role.RECEPTIONIST]));
export const labTechProcedure = clinicScopedProcedure.use(requireRoles([Role.LAB_TECH]));
export const doctorOrNurseProcedure = clinicScopedProcedure.use(
  requireRoles([Role.DOCTOR, Role.NURSE])
);
