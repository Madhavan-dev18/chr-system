import { z } from 'zod';
import { createTRPCRouter, clinicScopedProcedure } from './_base';
import { LabStatus, Role } from '@chr/db';
import { TRPCError } from '@trpc/server';

export const labRouter = createTRPCRouter({
  
  // List lab orders/results
  list: clinicScopedProcedure
    .input(z.object({
      patientId: z.string().uuid().optional(),
      status: z.nativeEnum(LabStatus).optional(),
    }))
    .query(async ({ ctx, input }) => {
      // Patients can only see their own labs
      if (ctx.session.user.role === 'PATIENT') {
        const patientRecord = await ctx.prisma.patient.findUnique({
          where: { userId: ctx.session.user.id },
        });
        if (!patientRecord) return [];
        input.patientId = patientRecord.id;
      }

      const where = {
        clinicId: ctx.session.user.clinicId,
        ...(input.patientId ? { patientId: input.patientId } : {}),
        ...(input.status ? { status: input.status } : {}),
      };

      return ctx.prisma.labResult.findMany({
        where,
        include: {
          patient: { select: { id: true, firstName: true, lastName: true, mrn: true } },
          orderedBy: { select: { id: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }),

  // Order a new lab test
  orderTest: clinicScopedProcedure
    .input(z.object({
      patientId: z.string().uuid(),
      testName: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      // Only Doctors can order labs
      if (ctx.session.user.role !== 'DOCTOR') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only Doctors can order lab tests.' });
      }

      return ctx.prisma.labResult.create({
        data: {
          patientId: input.patientId,
          orderedById: ctx.session.user.id,
          clinicId: ctx.session.user.clinicId,
          testName: input.testName,
          status: 'PENDING',
        }
      });
    }),

  // Enter lab results
  enterResults: clinicScopedProcedure
    .input(z.object({
      id: z.string().uuid(),
      resultValue: z.string(),
      unit: z.string().optional(),
      referenceRangeLow: z.number().optional(),
      referenceRangeHigh: z.number().optional(),
      isAbnormal: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      // Only Lab Techs (or Doctors) can enter results
      if (!['LAB_TECH', 'DOCTOR'].includes(ctx.session.user.role)) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only Lab Techs or Doctors can enter results.' });
      }

      const lab = await ctx.prisma.labResult.findUnique({
        where: { id: input.id, clinicId: ctx.session.user.clinicId }
      });

      if (!lab) throw new TRPCError({ code: 'NOT_FOUND' });

      const updatedLab = await ctx.prisma.labResult.update({
        where: { id: input.id },
        data: {
          resultValue: input.resultValue,
          unit: input.unit,
          referenceRangeLow: input.referenceRangeLow,
          referenceRangeHigh: input.referenceRangeHigh,
          isAbnormal: input.isAbnormal,
          status: 'RESULTED',
          resultedAt: new Date(),
          resultedById: ctx.session.user.id,
        }
      });

      // Optionally: Trigger an in-app notification to the ordering doctor here.
      // E.g., await ctx.prisma.notification.create(...)

      return updatedLab;
    }),
});
