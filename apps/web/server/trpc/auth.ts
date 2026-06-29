import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from './_base';
import { TRPCError } from '@trpc/server';
import { generateRefreshTokensV2, storeRefreshToken, consumeRefreshToken } from '@/lib/tokens';
import { auditLog } from '@/lib/audit';

export const authRouter = createTRPCRouter({
  logout: protectedProcedure.mutation(async ({ ctx }) => {
    // Audit log the logout
    await auditLog(ctx.prisma, {
      userId: ctx.session.user.id,
      clinicId: ctx.session.user.clinicId || undefined,
      action: 'LOGOUT',
      resource: 'Auth',
      ipAddress: ctx.ip,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    return { success: true };
  }),

  refresh: publicProcedure
    .input(z.object({
      refreshToken: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const payload = await consumeRefreshToken(input.refreshToken);

      if (!payload) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired refresh token',
        });
      }

      // Generate new token pair (Rotation)
      const { raw, hash } = generateRefreshTokensV2();
      await storeRefreshToken(hash, payload.userId, payload.clinicId);

      // In a full implementation, we'd also generate a new NextAuth session JWT here,
      // but since NextAuth handles its own session cookie via the Next.js API route, 
      // the actual refresh flow often involves calling signIn again or a custom handler
      // that updates the JWT cookie. For now, we return the new refresh token.

      return {
        refreshToken: raw,
      };
    }),
});
