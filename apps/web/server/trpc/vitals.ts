import { z } from 'zod';
import { createTRPCRouter, clinicScopedProcedure } from './_base';
import { TRPCError } from '@trpc/server';
import { auditLog } from '@/lib/audit';

const RecordVitalsSchema = z.object({
  patientId: z.string().uuid(),
  bpSystolic: z.number().int().min(40).max(300).optional(),
  bpDiastolic: z.number().int().min(20).max(200).optional(),
  heartRate: z.number().int().min(20).max(300).optional(),
  spo2: z.number().int().min(50).max(100).optional(),
  temperatureF: z.number().min(85).max(115).optional(),
  respiratoryRate: z.number().int().min(4).max(60).optional(),
  weightKg: z.number().min(0.5).max(600).optional(),
  heightCm: z.number().min(30).max(250).optional(),
  notes: z.string().max(2000).optional(),
});

export const vitalsRouter = createTRPCRouter({
  record: clinicScopedProcedure
    .input(RecordVitalsSchema)
    .mutation(async ({ ctx, input }) => {
      const { role, id: userId, clinicId } = ctx.session!.user;

      if (!['DOCTOR', 'NURSE', 'ADMIN'].includes(role)) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Unauthorized to record vitals.' });
      }

      const patient = await ctx.db.patient.findUnique({ where: { id: input.patientId } });
      if (!patient || patient.clinicId !== clinicId || patient.deletedAt) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Patient not found.' });
      }
      if (role === 'DOCTOR' && patient.assignedDoctorId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Patient not assigned to you.' });
      }
      if (role === 'NURSE' && patient.assignedNurseId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Patient not assigned to you.' });
      }

      // Critical vital threshold detection
      const criticalFlags: string[] = [];
      if (input.spo2 && input.spo2 < 90) criticalFlags.push(`SpO2 critically low: ${input.spo2}%`);
      if (input.heartRate && input.heartRate > 150) criticalFlags.push(`HR critically high: ${input.heartRate} bpm`);
      if (input.bpSystolic && input.bpSystolic > 180) criticalFlags.push(`BP critically high: ${input.bpSystolic}/${input.bpDiastolic}`);
      if (input.temperatureF && input.temperatureF > 104) criticalFlags.push(`Temp critically high: ${input.temperatureF}°F`);

      const vitals = await ctx.db.vitals.create({
        data: { ...input, recordedById: userId, clinicId },
      });

      await auditLog(ctx.db, {
        userId, clinicId,
        action: 'CREATE', resource: 'Vitals',
        resourceId: vitals.id,
        ipAddress: ctx.ip, userAgent: ctx.userAgent, requestId: ctx.requestId,
        metadata: { criticalFlags },
      });

      // Create critical alert notification if needed
      if (criticalFlags.length > 0 && patient.assignedDoctorId) {
        await ctx.db.notification.create({
          data: {
            userId: patient.assignedDoctorId,
            clinicId,
            type: 'VITAL_ALERT',
            title: '⚠️ Critical Vitals Recorded',
            message: criticalFlags.join('; '),
            link: `/doctor/patients/${patient.id}`,
          },
        });
      }

      return { ...vitals, criticalFlags };
    }),

  listByPatient: clinicScopedProcedure
    .input(z.object({
      patientId: z.string().uuid(),
      limit: z.number().min(1).max(100).default(30),
    }))
    .query(async ({ ctx, input }) => {
      const { role, id: userId, clinicId } = ctx.session!.user;

      const patient = await ctx.db.patient.findUnique({ where: { id: input.patientId } });
      if (!patient || patient.clinicId !== clinicId || patient.deletedAt) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }
      if (role === 'DOCTOR' && patient.assignedDoctorId !== userId) throw new TRPCError({ code: 'FORBIDDEN' });
      if (role === 'NURSE' && patient.assignedNurseId !== userId) throw new TRPCError({ code: 'FORBIDDEN' });
      if (role === 'PATIENT' && patient.userId !== userId) throw new TRPCError({ code: 'FORBIDDEN' });

      const vitals = await ctx.db.vitals.findMany({
        where: { patientId: input.patientId },
        orderBy: { recordedAt: 'desc' },
        take: input.limit,
        include: { recordedBy: { select: { id: true, email: true } } },
      });

      await auditLog(ctx.db, {
        userId, clinicId,
        action: 'VIEW', resource: 'Vitals',
        resourceId: input.patientId,
        ipAddress: ctx.ip, userAgent: ctx.userAgent, requestId: ctx.requestId,
      });

      return vitals;
    }),
});
