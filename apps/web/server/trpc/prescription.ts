import { z } from 'zod';
import { createTRPCRouter, clinicScopedProcedure } from './_base';
import { TRPCError } from '@trpc/server';

export const prescriptionRouter = createTRPCRouter({
  
  // List prescriptions for a patient
  list: clinicScopedProcedure
    .input(z.object({
      patientId: z.string().uuid(),
      activeOnly: z.boolean().default(false),
    }))
    .query(async ({ ctx, input }) => {
      // Enforce PATIENT privacy
      if (ctx.session.user.role === 'PATIENT') {
        const patientRecord = await ctx.db.patient.findUnique({
          where: { userId: ctx.session.user.id },
        });
        if (input.patientId !== patientRecord?.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
      }

      const where: any = { 
        clinicId: ctx.session.user.clinicId,
        patientId: input.patientId 
      };
      
      if (input.activeOnly) {
        where.isActive = true;
      }

      return ctx.db.prescription.findMany({
        where,
        include: {
          doctor: { select: { id: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }),

  // Create a new prescription
  create: clinicScopedProcedure
    .input(z.object({
      patientId: z.string().uuid(),
      medicationName: z.string().min(2),
      dosage: z.string(),
      unit: z.string(),
      frequency: z.string(),
      route: z.string().optional(),
      startDate: z.string().datetime(),
      endDate: z.string().datetime().optional(),
      notes: z.string().optional(),
      icd10Code: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Only Doctors can prescribe
      if (ctx.session.user.role !== 'DOCTOR') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only Doctors can create prescriptions.' });
      }

      // Check allergies
      const patient = await ctx.db.patient.findUnique({
        where: { id: input.patientId, clinicId: ctx.session.user.clinicId }
      });

      if (!patient) throw new TRPCError({ code: 'NOT_FOUND', message: 'Patient not found' });

      // Basic case-insensitive allergy check
      const medNameLower = input.medicationName.toLowerCase();
      const hasAllergy = patient.allergies.some(a => medNameLower.includes(a.toLowerCase()));
      
      if (hasAllergy) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: `CONTRAINDICATED: Patient has an allergy matching ${input.medicationName}.`
        });
      }

      return ctx.db.prescription.create({
        data: {
          patientId: input.patientId,
          doctorId: ctx.session.user.id,
          clinicId: ctx.session.user.clinicId,
          medicationName: input.medicationName,
          dosage: input.dosage,
          unit: input.unit,
          frequency: input.frequency,
          route: input.route,
          startDate: new Date(input.startDate),
          endDate: input.endDate ? new Date(input.endDate) : undefined,
          notes: input.notes,
          icd10Code: input.icd10Code,
          isActive: true,
        }
      });
    }),

  // Discontinue a prescription
  discontinue: clinicScopedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== 'DOCTOR') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only Doctors can discontinue prescriptions.' });
      }

      const prescription = await ctx.db.prescription.findUnique({
        where: { id: input.id, clinicId: ctx.session.user.clinicId }
      });

      if (!prescription) throw new TRPCError({ code: 'NOT_FOUND' });

      return ctx.db.prescription.update({
        where: { id: input.id },
        data: {
          isActive: false,
          discontinuedAt: new Date(),
          discontinuedById: ctx.session.user.id,
        }
      });
    }),
});

