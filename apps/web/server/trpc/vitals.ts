import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { createTRPCRouter, clinicScopedProcedure } from './_base';
import { TRPCError } from '@trpc/server';
import { auditLog } from '@/lib/audit';

const RecordVitalsSchema = z.object({
  patientId: z.string().uuid(),
  bpSystolic: z.number().min(0).max(300).optional(),
  bpDiastolic: z.number().min(0).max(200).optional(),
  heartRate: z.number().min(0).max(300).optional(),
  spo2: z.number().min(0).max(100).optional(),
  temperatureF: z.number().min(70).max(110).optional(),
  respiratoryRate: z.number().min(0).max(60).optional(),
  weightKg: z.number().min(0).max(500).optional(),
  heightCm: z.number().min(0).max(300).optional(),
  notes: z.string().max(5000).optional(),
});

export const vitalsRouter = createTRPCRouter({
  record: clinicScopedProcedure
    .input(RecordVitalsSchema)
    .mutation(async ({ ctx, input }) => {
      const { role, id: userId, clinicId } = ctx.session.user;

      if (role !== 'DOCTOR' && role !== 'NURSE' && role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Unauthorized to record vitals.' });
      }

      // Verify patient exists and user has access
      const patient = await prisma.patient.findUnique({
        where: { id: input.patientId },
      });

      if (!patient || patient.clinicId !== clinicId || patient.deletedAt) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Patient not found.' });
      }

      if (role === 'DOCTOR' && patient.assignedDoctorId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Patient is not assigned to you.' });
      }

      if (role === 'NURSE' && patient.assignedNurseId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Patient is not assigned to you.' });
      }

      const vitals = await prisma.vitals.create({
        data: {
          ...input,
          recordedById: userId,
          clinicId,
        },
      });

      await auditLog(prisma, {
        userId,
        clinicId,
        action: 'CREATE',
        resource: 'Vitals',
        resourceId: vitals.id,
        ipAddress: ctx.ip,
        userAgent: ctx.userAgent,
        requestId: ctx.requestId,
      });

      return vitals;
    }),

  listByPatient: clinicScopedProcedure
    .input(z.object({ patientId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { role, id: userId, clinicId } = ctx.session.user;

      // Access checks
      const patient = await prisma.patient.findUnique({
        where: { id: input.patientId },
      });

      if (!patient || patient.clinicId !== clinicId || patient.deletedAt) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Patient not found.' });
      }

      if (role === 'DOCTOR' && patient.assignedDoctorId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Patient is not assigned to you.' });
      }

      if (role === 'NURSE' && patient.assignedNurseId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Patient is not assigned to you.' });
      }

      if (role === 'PATIENT' && patient.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only view your own vitals.' });
      }

      const vitalsList = await prisma.vitals.findMany({
        where: { patientId: input.patientId },
        orderBy: { recordedAt: 'desc' },
      });

      await auditLog(prisma, {
        userId,
        clinicId,
        action: 'VIEW',
        resource: 'Vitals (List)',
        resourceId: input.patientId,
        ipAddress: ctx.ip,
        userAgent: ctx.userAgent,
        requestId: ctx.requestId,
      });

      return vitalsList;
    }),
});

