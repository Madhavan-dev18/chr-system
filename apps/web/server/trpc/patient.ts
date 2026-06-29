import { z } from 'zod';
import { createTRPCRouter, clinicScopedProcedure } from './_base';
import { TRPCError } from '@trpc/server';
import { auditLog } from '@/lib/audit';

// Input Schemas
const CreatePatientSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format" }),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  bloodType: z.string().optional(),
  allergies: z.array(z.string()),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  assignedDoctorId: z.string().uuid().optional(),
  assignedNurseId: z.string().uuid().optional(),
});

export const patientRouter = createTRPCRouter({
  
  create: clinicScopedProcedure
    .input(CreatePatientSchema)
    .mutation(async ({ ctx, input }) => {
      // Only Admin can create patients
      if (ctx.session.user.role !== 'ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only Administrators can register new patients.',
        });
      }

      // Generate MRN (Medical Record Number): MRN-YYYYMM-[4 random hex chars]
      const dateStr = new Date().toISOString().slice(0, 7).replace('-', '');
      const randomHex = Math.floor(Math.random() * 65536).toString(16).padStart(4, '0').toUpperCase();
      const mrn = `MRN-${dateStr}-${randomHex}`;

      const patient = await ctx.prisma.patient.create({
        data: {
          ...input,
          dob: new Date(input.dob),
          mrn,
          clinicId: ctx.session.user.clinicId,
        },
      });

      await auditLog(ctx.prisma, {
        userId: ctx.session.user.id,
        clinicId: ctx.session.user.clinicId,
        action: 'CREATE',
        resource: 'Patient',
        resourceId: patient.id,
        ipAddress: ctx.ip,
        userAgent: ctx.userAgent,
        requestId: ctx.requestId,
      });

      return patient;
    }),

  list: clinicScopedProcedure
    .query(async ({ ctx }) => {
      const { role, id: userId, clinicId } = ctx.session.user;

      // Base query scoped to clinic and active records
      let whereClause: any = {
        clinicId,
        deletedAt: null,
      };

      // RBAC filtering
      if (role === 'DOCTOR') {
        whereClause.assignedDoctorId = userId;
      } else if (role === 'NURSE') {
        whereClause.assignedNurseId = userId;
      } else if (role !== 'ADMIN') {
        // Receptionist, Lab Tech, etc., might need different access, but for now stick to strict bounds
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Unauthorized role for listing patients.' });
      }

      const patients = await ctx.prisma.patient.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
      });

      return patients;
    }),

  getById: clinicScopedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { role, id: userId, clinicId } = ctx.session.user;

      const patient = await ctx.prisma.patient.findUnique({
        where: { id: input.id },
      });

      if (!patient || patient.clinicId !== clinicId || patient.deletedAt) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Patient not found' });
      }

      // RBAC check
      if (role === 'DOCTOR' && patient.assignedDoctorId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Patient is not assigned to you.' });
      }
      if (role === 'NURSE' && patient.assignedNurseId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Patient is not assigned to you.' });
      }

      await auditLog(ctx.prisma, {
        userId: ctx.session.user.id,
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

  getMyProfile: clinicScopedProcedure
    .query(async ({ ctx }) => {
      const { role, id: userId, clinicId } = ctx.session.user;

      if (role !== 'PATIENT') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only patients can access their own profile.' });
      }

      const patient = await ctx.prisma.patient.findUnique({
        where: { userId },
      });

      if (!patient || patient.clinicId !== clinicId || patient.deletedAt) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Patient profile not found.' });
      }

      return patient;
    }),
});
