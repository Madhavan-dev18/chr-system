import { z } from 'zod';
import { createTRPCRouter, clinicScopedProcedure } from './_base';
import { Role } from '@chr/db';
import { TRPCError } from '@trpc/server';

// Ensure the caller is an ADMIN
const adminProcedure = clinicScopedProcedure.use(async ({ ctx, next }) => {
  if (ctx.session.user.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin privileges required' });
  }
  return next({ ctx });
});

export const adminRouter = createTRPCRouter({
  
  // Get system metrics
  getMetrics: adminProcedure
    .query(async ({ ctx }) => {
      const clinicId = ctx.session.user.clinicId;

      const [totalUsers, totalPatients, totalAppointments, totalLabs] = await Promise.all([
        ctx.prisma.user.count({ where: { clinicId } }),
        ctx.prisma.patient.count({ where: { clinicId } }),
        ctx.prisma.appointment.count({ where: { clinicId } }),
        ctx.prisma.labResult.count({ where: { clinicId } }),
      ]);

      return {
        totalUsers,
        totalPatients,
        totalAppointments,
        totalLabs,
      };
    }),

  // Get Audit Logs
  getAuditLogs: adminProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      action: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const where: any = { clinicId: ctx.session.user.clinicId };
      if (input.action) where.action = input.action;

      const [logs, total] = await Promise.all([
        ctx.prisma.auditLog.findMany({
          where,
          include: { user: { select: { email: true, role: true } } },
          orderBy: { timestamp: 'desc' },
          take: input.limit,
          skip: input.offset,
        }),
        ctx.prisma.auditLog.count({ where })
      ]);

      return { logs, total };
    }),

  // Manage Users
  listUsers: adminProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.user.findMany({
        where: { clinicId: ctx.session.user.clinicId },
        select: { id: true, email: true, role: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      });
    }),

  updateUserRole: adminProcedure
    .input(z.object({
      userId: z.string().uuid(),
      role: z.nativeEnum(Role),
    }))
    .mutation(async ({ ctx, input }) => {
      // Prevent self-demotion
      if (input.userId === ctx.session.user.id) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot change your own role.' });
      }

      return ctx.prisma.user.update({
        where: { id: input.userId, clinicId: ctx.session.user.clinicId },
        data: { role: input.role },
      });
    }),
});
