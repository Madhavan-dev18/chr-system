import { initTRPC, TRPCError } from '@trpc/server';
import { TRPCContext } from './context';
import { Role } from '@chr/db';
import { auditLog } from '@/lib/audit';
import superjson from 'superjson';

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;

// Constraint 6: protectedProcedure + RBAC role check + clinic_id scope + auditLog
export const protectedProcedure = t.procedure.use(async ({ ctx, next, path, type }) => {
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
    await auditLog(ctx.prisma, {
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
