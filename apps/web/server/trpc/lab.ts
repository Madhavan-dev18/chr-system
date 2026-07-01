import { z } from 'zod';
import { createTRPCRouter, clinicScopedProcedure } from './_base';
import { TRPCError } from '@trpc/server';
import { auditLog } from '@/lib/audit';

export const labRouter = createTRPCRouter({
  createOrder: clinicScopedProcedure
    .input(z.object({
      patientId: z.string().uuid(),
      testName: z.string().min(1).max(200),
    }))
    .mutation(async ({ ctx, input }) => {
      const { role, id: userId, clinicId } = ctx.session!.user;
      if (!['DOCTOR', 'ADMIN'].includes(role)) throw new TRPCError({ code: 'FORBIDDEN', message: 'Only doctors can order labs.' });

      const patient = await ctx.db.patient.findUnique({ where: { id: input.patientId } });
      if (!patient || patient.clinicId !== clinicId || patient.deletedAt) throw new TRPCError({ code: 'NOT_FOUND' });
      if (role === 'DOCTOR' && patient.assignedDoctorId !== userId) throw new TRPCError({ code: 'FORBIDDEN' });

      const order = await ctx.db.labResult.create({
        data: {
          patientId: input.patientId,
          orderedById: userId,
          clinicId,
          testName: input.testName,
          status: 'PENDING',
        },
      });

      // Notify lab tech
      const labTechs = await ctx.db.user.findMany({
        where: { clinicId, role: 'LAB_TECH', deletedAt: null },
        select: { id: true },
      });
      if (labTechs.length > 0) {
        await ctx.db.notification.createMany({
          data: labTechs.map((lt: any) => ({
            userId: lt.id,
            clinicId,
            type: 'SYSTEM' as const,
            title: `Routine Lab Order`,
            message: `Test: ${input.testName} for patient MRN ${patient.mrn}.`,
            link: `/lab/orders`,
          })),
        });
      }

      await auditLog(ctx.db, {
        userId, clinicId,
        action: 'CREATE', resource: 'LabOrder',
        resourceId: order.id,
        ipAddress: ctx.ip, userAgent: ctx.userAgent, requestId: ctx.requestId,
        metadata: { testName: input.testName },
      });

      return order;
    }),

  listOrders: clinicScopedProcedure
    .input(z.object({
      status: z.enum(['PENDING', 'RESULTED', 'REVIEWED']).optional(),
      patientId: z.string().uuid().optional(),
      limit: z.number().int().min(1).max(200).default(50),
    }).optional())
    .query(async ({ ctx, input }) => {
      const { role, id: userId, clinicId } = ctx.session!.user;

      const where: Record<string, unknown> = {
        clinicId,
        ...(input?.status && { status: input.status }),
        ...(input?.patientId && { patientId: input.patientId }),
      };

      if (role === 'DOCTOR') where.orderedById = userId;
      else if (role === 'PATIENT') {
        const patient = await ctx.db.patient.findFirst({ where: { userId, clinicId } });
        if (!patient) return { orders: [] };
        where.patientId = patient.id;
      } else if (!['ADMIN', 'LAB_TECH', 'NURSE'].includes(role)) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const orders = await ctx.db.labResult.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: input?.limit ?? 50,
        include: {
          patient: { select: { id: true, firstName: true, lastName: true, mrn: true } },
          orderedBy: { select: { id: true, email: true } },
        },
      });

      return { orders };
    }),

  recordResult: clinicScopedProcedure
    .input(z.object({
      orderId: z.string().uuid(),
      resultValue: z.string().min(1).max(500),
      unit: z.string().max(50).optional(),
      referenceRangeLow: z.number().optional(),
      referenceRangeHigh: z.number().optional(),
      isAbnormal: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const { role, id: userId, clinicId } = ctx.session!.user;
      if (!['LAB_TECH', 'DOCTOR', 'ADMIN'].includes(role)) throw new TRPCError({ code: 'FORBIDDEN' });

      const order = await ctx.db.labResult.findUnique({
        where: { id: input.orderId },
        include: { patient: { select: { assignedDoctorId: true, userId: true, mrn: true } } },
      });
      if (!order || order.clinicId !== clinicId) throw new TRPCError({ code: 'NOT_FOUND' });

      const updated = await ctx.db.labResult.update({
        where: { id: input.orderId },
        data: {
          resultValue: input.resultValue,
          unit: input.unit,
          referenceRangeLow: input.referenceRangeLow,
          referenceRangeHigh: input.referenceRangeHigh,
          isAbnormal: input.isAbnormal,
          status: 'RESULTED',
          resultedAt: new Date(),
          resultedById: userId,
        },
      });

      // Notify ordering doctor of critical results
      if (input.isAbnormal && order.patient.assignedDoctorId) {
        await ctx.db.notification.create({
          data: {
            userId: order.patient.assignedDoctorId,
            clinicId,
            type: 'LAB_ABNORMAL',
            title: '🚨 Abnormal Lab Result',
            message: `Abnormal values for MRN ${order.patient.mrn}: ${order.testName}`,
            link: `/doctor/labs/${input.orderId}`,
          },
        });
      }

      await auditLog(ctx.db, {
        userId, clinicId,
        action: 'UPDATE', resource: 'LabResult',
        resourceId: input.orderId,
        ipAddress: ctx.ip, userAgent: ctx.userAgent, requestId: ctx.requestId,
        metadata: { abnormal: input.isAbnormal },
      });

      return updated;
    }),
});
