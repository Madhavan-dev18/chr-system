import { z } from 'zod';
import { createTRPCRouter } from './_base';
import { strictProcedure } from './_base';
import { TRPCError } from '@trpc/server';
import { auditLog } from '@/lib/audit';
import { scrubPHI } from '@/lib/ai/phi-scrubber';
import { analyzeSymptoms } from '@/lib/ai/gemini';

export const aiRouter = createTRPCRouter({
  analyzeClinicalNote: strictProcedure
    .input(z.object({
      patientId: z.string().uuid(),
      clinicalNote: z.string().min(50).max(10000),
    }))
    .mutation(async ({ ctx, input }) => {
      const { role, id: userId, clinicId } = ctx.session!.user;

      if (!['DOCTOR', 'ADMIN'].includes(role)) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only doctors can request CDS analysis.' });
      }

      const patient = await ctx.db.patient.findUnique({ where: { id: input.patientId } });
      if (!patient || patient.clinicId !== clinicId || patient.deletedAt) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Patient not found.' });
      }
      if (role === 'DOCTOR' && patient.assignedDoctorId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Patient not assigned to you.' });
      }

      // PHI scrub before sending to external AI
      const scrubbedNote = scrubPHI(input.clinicalNote);

      let result;
      try {
        result = await analyzeSymptoms(scrubbedNote);
      } catch (err) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: err instanceof Error ? err.message : 'AI analysis failed. Please try again.',
        });
      }

      await auditLog(ctx.db, {
        userId, clinicId,
        action: 'AI_CALL', resource: 'ClinicalDecisionSupport',
        resourceId: input.patientId,
        ipAddress: ctx.ip, userAgent: ctx.userAgent, requestId: ctx.requestId,
        metadata: {
          model: process.env.GEMINI_MODEL ?? 'gemini-1.5-flash',
          differentialCount: result.differentials.length,
          redFlagCount: result.red_flags.length,
        },
      });

      return {
        ...result,
        disclaimer:
          'This AI-generated differential is intended to support, not replace, clinical judgment. All decisions remain the responsibility of the treating physician.',
      };
    }),
});
