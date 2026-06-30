import { createTRPCRouter, protectedProcedure } from './_base';
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
});
