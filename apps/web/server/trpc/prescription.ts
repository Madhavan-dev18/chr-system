import { z } from 'zod';
import { createTRPCRouter, clinicScopedProcedure } from './_base';
import { TRPCError } from '@trpc/server';
import { auditLog } from '@/lib/audit';

const CreatePrescriptionSchema = z.object({
  patientId: z.string().uuid(),
  medicationName: z.string().min(1).max(200),
  dosage: z.string().min(1).max(100),
  unit: z.string().min(1).max(50),
  frequency: z.string().min(1).max(100),
  route: z.enum(['ORAL', 'IV', 'IM', 'SC', 'TOPICAL', 'INHALED', 'SUBLINGUAL', 'OTHER']).default('ORAL'),
  durationDays: z.number().int().min(1).max(365),
  diagnosis: z.string().min(1).max(500),
  notes: z.string().max(2000).optional(),
});

export const prescriptionRouter = createTRPCRouter({
  create: clinicScopedProcedure
    .input(CreatePrescriptionSchema)
    .mutation(async ({ ctx, input }) => {
      const { role, id: userId, clinicId } = ctx.session!.user;
      if (role !== 'DOCTOR') throw new TRPCError({ code: 'FORBIDDEN', message: 'Only doctors can prescribe medications.' });

      const patient = await ctx.db.patient.findUnique({ where: { id: input.patientId } });
      if (!patient || patient.clinicId !== clinicId || patient.deletedAt) throw new TRPCError({ code: 'NOT_FOUND' });
      if (patient.assignedDoctorId !== userId) throw new TRPCError({ code: 'FORBIDDEN' });

      // Allergy cross-check
      const allergyHits = patient.allergies.filter((a: string) => input.medicationName.toLowerCase().includes(a.toLowerCase()));
      if (allergyHits.length > 0) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: `Allergy conflict detected for: ${input.medicationName}. Override requires explicit confirmation.`,
        });
      }

      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + input.durationDays);

      const prescription = await ctx.db.prescription.create({
        data: {
          patientId: input.patientId,
          doctorId: userId,
          clinicId,
          medicationName: input.medicationName,
          dosage: input.dosage,
          unit: input.unit,
          frequency: input.frequency,
          route: input.route,
          startDate,
          endDate,
          isActive: true,
          notes: input.notes,
          icd10Code: input.diagnosis,
        },
      });

      // Notify patient
      const patient2 = await ctx.db.patient.findUnique({
        where: { id: input.patientId },
        select: { userId: true },
      });
      if (patient2?.userId) {
        await ctx.db.notification.create({
          data: {
            userId: patient2.userId,
            clinicId,
            type: 'SYSTEM',
            title: 'New Prescription',
            message: `Your doctor has issued a new prescription: ${input.medicationName}.`,
            link: '/patient/records',
          },
        });
      }

      await auditLog(ctx.db, {
        userId, clinicId,
        action: 'CREATE', resource: 'Prescription',
        resourceId: prescription.id,
        ipAddress: ctx.ip, userAgent: ctx.userAgent, requestId: ctx.requestId,
        metadata: { medicationName: input.medicationName, diagnosis: input.diagnosis },
      });

      return prescription;
    }),

  listByPatient: clinicScopedProcedure
    .input(z.object({ patientId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { role, id: userId, clinicId } = ctx.session!.user;

      const patient = await ctx.db.patient.findUnique({ where: { id: input.patientId } });
      if (!patient || patient.clinicId !== clinicId || patient.deletedAt) throw new TRPCError({ code: 'NOT_FOUND' });
      if (role === 'DOCTOR' && patient.assignedDoctorId !== userId) throw new TRPCError({ code: 'FORBIDDEN' });
      if (role === 'PATIENT' && patient.userId !== userId) throw new TRPCError({ code: 'FORBIDDEN' });

      await auditLog(ctx.db, {
        userId, clinicId,
        action: 'VIEW', resource: 'Prescription(list)',
        resourceId: input.patientId,
        ipAddress: ctx.ip, userAgent: ctx.userAgent, requestId: ctx.requestId,
      });

      return ctx.db.prescription.findMany({
        where: { patientId: input.patientId, clinicId },
        orderBy: { createdAt: 'desc' },
        include: { doctor: { select: { id: true, email: true } } },
      });
    }),

  updateStatus: clinicScopedProcedure
    .input(z.object({
      id: z.string().uuid(),
      status: z.enum(['ACTIVE', 'CANCELLED']),
    }))
    .mutation(async ({ ctx, input }) => {
      const { role, id: userId, clinicId } = ctx.session!.user;
      if (!['DOCTOR', 'ADMIN'].includes(role)) throw new TRPCError({ code: 'FORBIDDEN' });

      const prescription = await ctx.db.prescription.findUnique({ where: { id: input.id } });
      if (!prescription || prescription.clinicId !== clinicId) throw new TRPCError({ code: 'NOT_FOUND' });
      if (role === 'DOCTOR' && prescription.doctorId !== userId) throw new TRPCError({ code: 'FORBIDDEN' });

      const updated = await ctx.db.prescription.update({
        where: { id: input.id },
        data: { 
          isActive: input.status === 'ACTIVE',
          ...(input.status === 'CANCELLED' && {
            discontinuedAt: new Date(),
            discontinuedById: userId
          })
        },
      });

      await auditLog(ctx.db, {
        userId, clinicId,
        action: 'UPDATE', resource: 'Prescription',
        resourceId: input.id,
        ipAddress: ctx.ip, userAgent: ctx.userAgent, requestId: ctx.requestId,
        metadata: { newStatus: input.status },
      });

      return updated;
    }),
});
