import { z } from 'zod';
import { createTRPCRouter, clinicScopedProcedure } from './_base';
import { TRPCError } from '@trpc/server';
import { auditLog } from '@/lib/audit';
import { encryptRecord, decryptRecord } from '@/lib/crypto';

const CreateRecordSchema = z.object({
  patientId: z.string().uuid(),
  recordType: z.enum(['SOAP_NOTE', 'CONSULTATION', 'PROGRESS_NOTE', 'DISCHARGE_SUMMARY', 'REFERRAL', 'PROCEDURE_NOTE']),
  content: z.string().min(10).max(50000),
  diagnosisCodes: z.array(z.string().regex(/^[A-Z]\d{2}(?:\.\d{1,4})?$/, 'Must be valid ICD-10 code')).max(20).default([]),
});

export const recordsRouter = createTRPCRouter({
  create: clinicScopedProcedure
    .input(CreateRecordSchema)
    .mutation(async ({ ctx, input }) => {
      const { role, id: userId, clinicId } = ctx.session!.user;
      if (role !== 'DOCTOR') throw new TRPCError({ code: 'FORBIDDEN', message: 'Only doctors can author clinical records.' });

      const patient = await ctx.db.patient.findUnique({ where: { id: input.patientId } });
      if (!patient || patient.clinicId !== clinicId || patient.deletedAt) throw new TRPCError({ code: 'NOT_FOUND' });
      if (patient.assignedDoctorId !== userId) throw new TRPCError({ code: 'FORBIDDEN', message: 'Patient not assigned to you.' });

      const { ciphertext, iv, authTag } = encryptRecord(input.content);

      const record = await ctx.db.$transaction(async (tx: any) => {
        return tx.medicalRecord.create({
          data: {
            patientId: input.patientId,
            doctorId: userId,
            recordType: input.recordType,
            encryptedContent: new Uint8Array(ciphertext),
            iv: new Uint8Array(iv),
            authTag: new Uint8Array(authTag),
            diagnosisCodes: input.diagnosisCodes,
            clinicId,
          },
        });
      });

      await auditLog(ctx.db, {
        userId, clinicId,
        action: 'CREATE', resource: 'MedicalRecord',
        resourceId: record.id,
        ipAddress: ctx.ip, userAgent: ctx.userAgent, requestId: ctx.requestId,
        metadata: { recordType: input.recordType, diagnosisCodes: input.diagnosisCodes },
      });

      return { id: record.id, createdAt: record.createdAt };
    }),

  listByPatient: clinicScopedProcedure
    .input(z.object({ patientId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { role, id: userId, clinicId } = ctx.session!.user;

      const patient = await ctx.db.patient.findUnique({ where: { id: input.patientId } });
      if (!patient || patient.clinicId !== clinicId || patient.deletedAt) throw new TRPCError({ code: 'NOT_FOUND' });
      if (role === 'DOCTOR' && patient.assignedDoctorId !== userId) throw new TRPCError({ code: 'FORBIDDEN' });
      if (role === 'PATIENT' && patient.userId !== userId) throw new TRPCError({ code: 'FORBIDDEN' });

      const records = await ctx.db.medicalRecord.findMany({
        where: { patientId: input.patientId, clinicId, deletedAt: null },
        select: {
          id: true, recordType: true, diagnosisCodes: true, createdAt: true, version: true,
          doctor: { select: { id: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      await auditLog(ctx.db, {
        userId, clinicId,
        action: 'VIEW', resource: 'MedicalRecord(list)',
        resourceId: input.patientId,
        ipAddress: ctx.ip, userAgent: ctx.userAgent, requestId: ctx.requestId,
      });

      return records;
    }),

  getDecryptedContent: clinicScopedProcedure
    .input(z.object({ recordId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { role, id: userId, clinicId } = ctx.session!.user;

      const record = await ctx.db.medicalRecord.findUnique({
        where: { id: input.recordId },
        include: { patient: true },
      });

      if (!record || record.clinicId !== clinicId || record.deletedAt) throw new TRPCError({ code: 'NOT_FOUND' });

      if (role === 'DOCTOR' && record.patient.assignedDoctorId !== userId) throw new TRPCError({ code: 'FORBIDDEN' });
      if (role === 'NURSE' && record.patient.assignedNurseId !== userId) throw new TRPCError({ code: 'FORBIDDEN' });
      if (role === 'PATIENT' && record.patient.userId !== userId) throw new TRPCError({ code: 'FORBIDDEN' });

      let plaintext: string;
      try {
        plaintext = decryptRecord(Buffer.from(record.encryptedContent), Buffer.from(record.iv), Buffer.from(record.authTag));
      } catch {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Decryption failed — record may be corrupted.' });
      }

      await auditLog(ctx.db, {
        userId, clinicId,
        action: 'VIEW', resource: 'MedicalRecord(decrypt)',
        resourceId: record.id,
        ipAddress: ctx.ip, userAgent: ctx.userAgent, requestId: ctx.requestId,
      });

      return {
        id: record.id,
        recordType: record.recordType,
        content: plaintext,
        diagnosisCodes: record.diagnosisCodes,
        createdAt: record.createdAt,
        doctor: { id: record.doctorId },
      };
    }),
});
