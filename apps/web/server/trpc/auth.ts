import { createTRPCRouter, protectedProcedure } from './_base';
import { auditLog } from '@/lib/audit';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

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

  generateMfa: protectedProcedure.mutation(async ({ ctx }) => {
    const { authenticator } = require('otplib');
    const qrcode = require('qrcode');
    const { encryptMfaSecret } = await import('@/lib/crypto');

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(ctx.session.user.email, 'CHR System', secret);
    const qrCodeUrl = await qrcode.toDataURL(otpauth);

    const { ciphertext, iv, authTag } = encryptMfaSecret(secret);
    const encryptedBlob = Buffer.concat([iv, authTag, ciphertext]);

    await ctx.prisma.user.update({
      where: { id: ctx.session.user.id },
      data: { mfaSecret: encryptedBlob, mfaEnabled: false },
    });

    return { qrCodeUrl };
  }),

  verifyAndEnableMfa: protectedProcedure
    .input(z.object({ token: z.string().min(6).max(6) }))
    .mutation(async ({ ctx, input }) => {
      const { authenticator } = require('otplib');
      const { decryptMfaSecret } = await import('@/lib/crypto');

      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { mfaSecret: true },
      });

      if (!user?.mfaSecret) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'MFA not generated yet.' });
      }

      // Extract IV (12 bytes) and AuthTag (16 bytes)
      const secretBlob = user.mfaSecret;
      const iv = Buffer.from(secretBlob.subarray(0, 12));
      const authTag = Buffer.from(secretBlob.subarray(12, 28));
      const ciphertext = Buffer.from(secretBlob.subarray(28));

      const secret = decryptMfaSecret(ciphertext, iv, authTag);

      const isValid = authenticator.verify({ token: input.token, secret });

      if (!isValid) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid TOTP token.' });
      }

      await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: { mfaEnabled: true },
      });

      await auditLog(ctx.prisma, {
        userId: ctx.session.user.id,
        clinicId: ctx.session.user.clinicId || undefined,
        action: 'UPDATE',
        resource: 'User.MFA',
        ipAddress: ctx.ip,
        userAgent: ctx.userAgent,
        requestId: ctx.requestId,
      });

      return { success: true };
    }),
});
