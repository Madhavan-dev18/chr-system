import { z } from 'zod';
import { createTRPCRouter, clinicScopedProcedure } from './_base';
import { TRPCError } from '@trpc/server';
import { auditLog } from '@/lib/audit';
import { analyzeSymptoms } from '@/lib/ai/gemini';

export const aiRouter = createTRPCRouter({
  getDifferential: clinicScopedProcedure
    .input(z.object({
      clinicalNote: z.string().min(10).max(5000),
    }))
    .mutation(async ({ ctx, input }) => {
      const { role, id: userId, clinicId } = ctx.session.user;

      // Only Doctors should be generating differential diagnoses
      if (role !== 'DOCTOR') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only Doctors can access the AI Clinical Decision Support system.' });
      }

      // Log the AI invocation BEFORE calling the external service (for accounting/audit)
      await auditLog(ctx.prisma, {
        userId,
        clinicId,
        action: 'AI_CALL',
        resource: 'Gemini CDS',
        ipAddress: ctx.ip,
        userAgent: ctx.userAgent,
        requestId: ctx.requestId,
      });

      try {
        const result = await analyzeSymptoms(input.clinicalNote);
        return result;
      } catch (error) {
        // Fallback gracefully if Gemini is down or errors
        throw new TRPCError({
          code: 'SERVICE_UNAVAILABLE',
          message: 'The AI service is currently unavailable. Please proceed with manual diagnosis.',
        });
      }
    }),
});
