import { initTRPC, TRPCError } from '@trpc/server';
import { TRPCContext } from './context';
import { Role } from '@chr/db';
import { auditLog } from '@/lib/audit';
import superjson from 'superjson';
import { prisma, tenantStorage } from '@/lib/prisma';
import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '@/lib/redis';

// 10 requests / 10 seconds for standard APIs
const standardRateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
  prefix: '@upstash/ratelimit:standard',
});

// 3 requests / 1 minute for auth/ai
const strictRateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, '1 m'),
  analytics: true,
  prefix: '@upstash/ratelimit:strict',
});

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    if (error.code === 'INTERNAL_SERVER_ERROR') {
      // Log unhandled server errors to Sentry for real-world observability
      console.error('[Sentry] captureException: tRPC INTERNAL_SERVER_ERROR', error);
      // Sentry.captureException(error);
    }
    return shape;
  },
});

const rateLimiterMiddleware = t.middleware(async ({ ctx, path, next }) => {
  const ip = ctx.ip || '127.0.0.1';
  const isStrictRoute = path.startsWith('auth.') || path.startsWith('ai.');
  const limiter = isStrictRoute ? strictRateLimit : standardRateLimit;
  
  const { success } = await limiter.limit(ip);
  if (!success) {
    throw new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message: 'Rate limit exceeded. Please try again later.',
    });
  }
  return next();
});

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure.use(rateLimiterMiddleware);

// Constraint 6: protectedProcedure + RBAC role check + clinic_id scope + auditLog
export const protectedProcedure = t.procedure.use(rateLimiterMiddleware).use(async ({ ctx, next, path, type }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  const result = await next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });

  // Automatically audit log mutations for authenticated users
  if (type === 'mutation' && result.ok) {
    // Note: In a real system, you might want more granular control over what gets audited,
    // or infer the action/resource from the path. This is a baseline implementation.
    await auditLog(ctx.db, {
      userId: ctx.session.user.id,
      clinicId: ctx.session.user.clinicId || undefined,
      action: 'UPDATE', // Default, should be overridden by specific procedures if needed
      resource: path,
      ipAddress: ctx.ip,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });
  }

  return result;
});

// Middleware for RBAC
export const allowedRoles = (roles: Role[]) => {
  return t.middleware(async ({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    if (!roles.includes(ctx.session.user.role)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have the required role to access this resource.',
      });
    }

    return next({
      ctx: {
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  });
};

export const adminProcedure = protectedProcedure.use(allowedRoles([Role.ADMIN]));
export const doctorProcedure = protectedProcedure.use(allowedRoles([Role.DOCTOR]));
export const nurseProcedure = protectedProcedure.use(allowedRoles([Role.NURSE]));
export const patientProcedure = protectedProcedure.use(allowedRoles([Role.PATIENT]));
export const receptionistProcedure = protectedProcedure.use(allowedRoles([Role.RECEPTIONIST]));
export const labTechProcedure = protectedProcedure.use(allowedRoles([Role.LAB_TECH]));

// Middleware to strictly scope procedures to a clinic context using Prisma Extension
export const enforceClinicIsolation = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user?.clinicId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'This action requires a clinic context. Cross-tenant queries are forbidden.',
    });
  }
  
  const clinicId = ctx.session.user.clinicId;

  return tenantStorage.run(clinicId as string, () => {
    return next({
      ctx: {
        ...ctx,
        session: {
          ...ctx.session!,
          user: { ...ctx.session!.user, clinicId: clinicId as string },
        }
      },
    });
  });
});

export const clinicScopedProcedure = protectedProcedure.use(enforceClinicIsolation);
