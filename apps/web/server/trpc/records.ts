import { z } from 'zod';
import { createTRPCRouter, clinicScopedProcedure } from './_base';
import { TRPCError } from '@trpc/server';
import { auditLog } from '@/lib/audit';
import { encryptRecord, decryptRecord } from '@/lib/crypto';

const CreateRecordSchema = z.object({
  patientId: z.string().uuid(),
  recordType: z.string().min(1),
  content: z.string().min(1), // Plaintext from UI, will be encrypted before DB
  diagnosisCodes: z.array(z.string()).optional(),
});

export const recordsRouter = createTRPCRouter({
  create: clinicScopedProcedure
    .input(CreateRecordSchema)
    .mutation(async ({ ctx, input }) => {
      const { role, id: userId, clinicId } = ctx.session.user;

      if (role !== 'DOCTOR') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only doctors can author clinical records.' });
      }

      // Verify patient access
      const patient = await ctx.prisma.patient.findUnique({
        where: { id: input.patientId },
      });

      if (!patient || patient.clinicId !== clinicId || patient.deletedAt) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Patient not found.' });
      }

      if (patient.assignedDoctorId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Patient is not assigned to you.' });
      }

      // ** MILITARY GRADE ENCRYPTION **
      // The clinical note is encrypted in Node.js memory. The DB only ever sees random bytes.
      const { ciphertext, iv, authTag } = encryptRecord(input.content);

      const record = await ctx.prisma.medicalRecord.create({
        data: {
          patientId: input.patientId,
          doctorId: userId,
          recordType: input.recordType,
          encryptedContent: new Uint8Array(ciphertext),
          iv: new Uint8Array(iv),
          authTag: new Uint8Array(authTag),
          diagnosisCodes: input.diagnosisCodes || [],
          clinicId,
        },
      });

      await auditLog(ctx.prisma, {
        userId,
        clinicId,
        action: 'CREATE',
        resource: 'MedicalRecord',
        resourceId: record.id,
        ipAddress: ctx.ip,
        userAgent: ctx.userAgent,
        requestId: ctx.requestId,
      });

      return { id: record.id, createdAt: record.createdAt };
    }),

  listByPatient: clinicScopedProcedure
    .input(z.object({ patientId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { role, id: userId, clinicId } = ctx.session.user;

      // Access checks
      const patient = await ctx.prisma.patient.findUnique({
        where: { id: input.patientId },
      });

      if (!patient || patient.clinicId !== clinicId || patient.deletedAt) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Patient not found.' });
      }

      if (role === 'DOCTOR' && patient.assignedDoctorId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Patient is not assigned to you.' });
      }

      // Note: We deliberately exclude `encryptedContent`, `iv`, and `authTag` from the SELECT
      // to save massive amounts of bandwidth on the list view.
      const recordsList = await ctx.prisma.medicalRecord.findMany({
        where: { patientId: input.patientId },
        select: {
          id: true,
          recordType: true,
          diagnosisCodes: true,
          createdAt: true,
          doctor: { select: { email: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      await auditLog(ctx.prisma, {
        userId,
        clinicId,
        action: 'VIEW',
        resource: 'MedicalRecord (List)',
        resourceId: input.patientId,
        ipAddress: ctx.ip,
        userAgent: ctx.userAgent,
        requestId: ctx.requestId,
      });

      return recordsList;
    }),

  getDecryptedContent: clinicScopedProcedure
    .input(z.object({ recordId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { role, id: userId, clinicId } = ctx.session.user;

      const record = await ctx.prisma.medicalRecord.findUnique({
        where: { id: input.recordId },
        include: { patient: true },
      });

      if (!record || record.clinicId !== clinicId || record.deletedAt) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Record not found.' });
      }

      // Access Check
      if (role === 'DOCTOR' && record.patient.assignedDoctorId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Patient is not assigned to you.' });
      }
      if (role === 'PATIENT' && record.patient.userId !== userId) {
         throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only view your own records.' });
      }
      if (role === 'NURSE' && record.patient.assignedNurseId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Patient is not assigned to you.' });
      }

      // ** DECRYPTION **
      let plaintext = "";
      try {
        plaintext = decryptRecord(
          Buffer.from(record.encryptedContent), 
          Buffer.from(record.iv), 
          Buffer.from(record.authTag)
        );
      } catch (e) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Decryption failed or record was tampered with.' });
      }

      await auditLog(ctx.prisma, {
        userId,
        clinicId,
        action: 'VIEW',
        resource: 'MedicalRecord (Decrypted)',
        resourceId: record.id,
        ipAddress: ctx.ip,
        userAgent: ctx.userAgent,
        requestId: ctx.requestId,
      });

      return {
        id: record.id,
        recordType: record.recordType,
        content: plaintext,
        diagnosisCodes: record.diagnosisCodes,
        createdAt: record.createdAt,
      };
    }),
});
