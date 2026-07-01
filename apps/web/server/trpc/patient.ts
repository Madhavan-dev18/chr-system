import { z } from 'zod';
import { createTRPCRouter, clinicScopedProcedure } from './_base';
import { TRPCError } from '@trpc/server';
import { auditLog } from '@/lib/audit';
import { generateMRN } from '@/lib/utils';
import type { Prisma } from '@chr/db';

const CreatePatientSchema = z.object({
  firstName: z.string().min(1).max(100).trim(),
  lastName: z.string().min(1).max(100).trim(),
  dob: z
    .string()
    .refine((v) => !isNaN(Date.parse(v)) && new Date(v) < new Date(), {
      message: 'Date of birth must be a valid past date',
    }),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  bloodType: z
    .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .optional(),
  allergies: z.array(z.string().max(100)).max(50).default([]),
  phone: z
    .string()
    .regex(/^[\d\s\-+().]+$/, 'Invalid phone number')
    .optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().max(500).optional(),
  emergencyContact: z.string().max(300).optional(),
  assignedDoctorId: z.string().uuid().optional(),
  assignedNurseId: z.string().uuid().optional(),
});

const UpdatePatientSchema = CreatePatientSchema.partial().extend({
  id: z.string().uuid(),
});

export const patientRouter = createTRPCRouter({
  /** Register a new patient (Admin or Receptionist) */
  create: clinicScopedProcedure
    .input(CreatePatientSchema)
    .mutation(async ({ ctx, input }) => {
      const { role, clinicId, id: userId } = ctx.session!.user;
      if (role !== 'ADMIN' && role !== 'RECEPTIONIST') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only Admins and Receptionists can register patients.',
        });
      }

      const mrn = generateMRN();

      const patient = await ctx.db.$transaction(async (tx: any) => {
        return tx.patient.create({
          data: {
            ...input,
            email: input.email || undefined,
            dob: new Date(input.dob),
            mrn,
            clinicId,
          },
        });
      });

      await auditLog(ctx.db, {
        userId,
        clinicId,
        action: 'CREATE',
        resource: 'Patient',
        resourceId: patient.id,
        ipAddress: ctx.ip,
        userAgent: ctx.userAgent,
        requestId: ctx.requestId,
        metadata: { mrn },
      });

      return patient;
    }),

  /** List patients — RBAC-scoped to role */
  list: clinicScopedProcedure
    .input(
      z.object({
        search: z.string().max(100).optional(),
        limit: z.number().min(1).max(200).default(50),
        cursor: z.string().uuid().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const { role, id: userId, clinicId } = ctx.session!.user;

      const where: any = {
        clinicId,
        deletedAt: null,
        ...(input?.search
          ? {
              OR: [
                { firstName: { contains: input.search, mode: 'insensitive' } },
                { lastName: { contains: input.search, mode: 'insensitive' } },
                { mrn: { contains: input.search, mode: 'insensitive' } },
                { email: { contains: input.search, mode: 'insensitive' } },
                { phone: { contains: input.search } },
              ],
            }
          : {}),
      };

      // RBAC scoping
      if (role === 'DOCTOR') where.assignedDoctorId = userId;
      else if (role === 'NURSE') where.assignedNurseId = userId;
      else if (role !== 'ADMIN' && role !== 'RECEPTIONIST') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const limit = input?.limit ?? 50;
      const patients = await ctx.db.patient.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit + 1,
        ...(input?.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
        include: {
          vitals: {
            orderBy: { recordedAt: 'desc' },
            take: 1,
            select: {
              bpSystolic: true,
              bpDiastolic: true,
              heartRate: true,
              spo2: true,
              temperatureF: true,
              recordedAt: true,
            },
          },
          assignedDoctor: { select: { id: true, email: true } },
        },
      });

      let nextCursor: string | undefined;
      if (patients.length > limit) {
        const next = patients.pop();
        nextCursor = next?.id;
      }

      return { patients, nextCursor };
    }),

  /** Get a single patient by ID */
  getById: clinicScopedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { role, id: userId, clinicId } = ctx.session!.user;

      const patient = await ctx.db.patient.findUnique({
        where: { id: input.id },
        include: {
          assignedDoctor: { select: { id: true, email: true } },
          assignedNurse: { select: { id: true, email: true } },
        },
      });

      if (!patient || patient.clinicId !== clinicId || patient.deletedAt) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Patient not found.' });
      }

      // RBAC
      if (role === 'DOCTOR' && patient.assignedDoctorId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Patient not assigned to you.' });
      }
      if (role === 'NURSE' && patient.assignedNurseId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Patient not assigned to you.' });
      }

      await auditLog(ctx.db, {
        userId,
        clinicId,
        action: 'VIEW',
        resource: 'Patient',
        resourceId: patient.id,
        ipAddress: ctx.ip,
        userAgent: ctx.userAgent,
        requestId: ctx.requestId,
      });

      return patient;
    }),

  /** Patient portal: get own profile */
  getMyProfile: clinicScopedProcedure.query(async ({ ctx }) => {
    const { role, id: userId, clinicId } = ctx.session!.user;
    if (role !== 'PATIENT') throw new TRPCError({ code: 'FORBIDDEN' });

    const patient = await ctx.db.patient.findUnique({ where: { userId } });
    if (!patient || patient.clinicId !== clinicId || patient.deletedAt) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Profile not found.' });
    }
    return patient;
  }),

  /** Soft-delete a patient (Admin only) */
  softDelete: clinicScopedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session!.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const patient = await ctx.db.patient.update({
        where: { id: input.id, clinicId: ctx.session!.user.clinicId },
        data: { deletedAt: new Date() },
      });

      await auditLog(ctx.db, {
        userId: ctx.session!.user.id,
        clinicId: ctx.session!.user.clinicId,
        action: 'DELETE',
        resource: 'Patient',
        resourceId: patient.id,
        ipAddress: ctx.ip,
        userAgent: ctx.userAgent,
        requestId: ctx.requestId,
      });

      return { success: true };
    }),
});
