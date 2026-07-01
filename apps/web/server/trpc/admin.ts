import { z } from 'zod';
import { createTRPCRouter, adminProcedure } from './_base';
import { auditLog } from '@/lib/audit';
import { Role } from '@chr/db';

export const adminRouter = createTRPCRouter({
  getDashboardStats: adminProcedure.query(async ({ ctx }) => {
    const { clinicId } = ctx.session!.user;
    const [patients, appointments, users, pendingLabs] = await Promise.all([
      ctx.db.patient.count({ where: { clinicId, deletedAt: null } }),
      ctx.db.appointment.count({ where: { clinicId, status: { in: ['PENDING', 'CONFIRMED'] } } }),
      ctx.db.user.count({ where: { clinicId, deletedAt: null } }),
      ctx.db.labResult.count({ where: { clinicId, status: 'PENDING' } }),
    ]);
    return { patients, appointments, users, pendingLabs };
  }),

  getAuditLogs: adminProcedure
    .input(z.object({
      resource: z.string().optional(),
      userId: z.string().uuid().optional(),
      action: z.string().optional(),
      from: z.string().optional(),
      to: z.string().optional(),
      limit: z.number().int().min(1).max(500).default(100),
      cursor: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const { clinicId } = ctx.session!.user;
      const logs = await ctx.db.auditLog.findMany({
        where: {
          clinicId,
          ...(input?.resource && { resource: { contains: input.resource } }),
          ...(input?.userId && { userId: input.userId }),
          ...(input?.action && { action: input.action as any }),
          ...(input?.from || input?.to
            ? { timestamp: { ...(input.from && { gte: new Date(input.from) }), ...(input.to && { lte: new Date(input.to) }) } }
            : {}),
          ...(input?.cursor ? { id: { lt: BigInt(input.cursor) } } : {}),
        },
        orderBy: { timestamp: 'desc' },
        take: (input?.limit ?? 100) + 1,
        include: { user: { select: { email: true, role: true } } },
      });

      const hasMore = logs.length > (input?.limit ?? 100);
      if (hasMore) logs.pop();

      return { logs, hasMore, nextCursor: hasMore ? logs.at(-1)?.id.toString() : undefined };
    }),

  listUsers: adminProcedure
    .input(z.object({ role: z.enum(['ADMIN', 'DOCTOR', 'NURSE', 'PATIENT', 'RECEPTIONIST', 'LAB_TECH']).optional() }).optional())
    .query(async ({ ctx, input }) => {
      return ctx.db.user.findMany({
        where: {
          clinicId: ctx.session!.user.clinicId,
          deletedAt: null,
          ...(input?.role ? { role: input.role } : {}),
        },
        select: {
          id: true, email: true, role: true,
          mfaEnabled: true, lastLoginAt: true,
          failedLogins: true, lockedUntil: true, createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }),

  deactivateUser: adminProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: actorId, clinicId } = ctx.session!.user;
      if (input.userId === actorId) {
        throw new Error('Cannot deactivate your own account.');
      }
      const user = await ctx.db.user.update({
        where: { id: input.userId, clinicId },
        data: { deletedAt: new Date() },
      });
      await auditLog(ctx.db, {
        userId: actorId, clinicId,
        action: 'DELETE', resource: 'User',
        resourceId: user.id,
        ipAddress: ctx.ip, userAgent: ctx.userAgent, requestId: ctx.requestId,
      });
      return { success: true };
    }),

  unlockUser: adminProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: actorId, clinicId } = ctx.session!.user;
      const user = await ctx.db.user.update({
        where: { id: input.userId, clinicId },
        data: { failedLogins: 0, lockedUntil: null },
      });
      await auditLog(ctx.db, {
        userId: actorId, clinicId,
        action: 'UPDATE', resource: 'User.Unlock',
        resourceId: user.id,
        ipAddress: ctx.ip, userAgent: ctx.userAgent, requestId: ctx.requestId,
      });
      return { success: true };
    }),
});
