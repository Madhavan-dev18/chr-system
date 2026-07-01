import { z } from 'zod';
import { createTRPCRouter, adminProcedure, protectedProcedure } from './_base';
import { TRPCError } from '@trpc/server';
import { Role } from '@chr/db';
import bcrypt from 'bcryptjs';
import { auditLog } from '@/lib/audit';

const PasswordSchema = z
  .string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'Must contain uppercase letter')
  .regex(/[a-z]/, 'Must contain lowercase letter')
  .regex(/[0-9]/, 'Must contain number')
  .regex(/[^A-Za-z0-9]/, 'Must contain special character');

const CreateStaffSchema = z.object({
  email: z.string().email(),
  password: PasswordSchema,
  role: z.enum(['ADMIN', 'DOCTOR', 'NURSE', 'PATIENT', 'RECEPTIONIST', 'LAB_TECH']),
});

export const userRouter = createTRPCRouter({
  /** Create a staff account (Admin only) */
  createStaff: adminProcedure
    .input(CreateStaffSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.user.findUnique({
        where: { email: input.email.toLowerCase() },
      });
      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Email already in use.' });
      }

      const passwordHash = await bcrypt.hash(input.password, 12);

      const user = await ctx.db.user.create({
        data: {
          email: input.email.toLowerCase(),
          passwordHash,
          role: input.role,
          clinicId: ctx.session!.user.clinicId,
        },
        select: { id: true, email: true, role: true, createdAt: true },
      });

      await auditLog(ctx.db, {
        userId: ctx.session!.user.id,
        clinicId: ctx.session!.user.clinicId,
        action: 'CREATE',
        resource: 'User',
        resourceId: user.id,
        ipAddress: ctx.ip,
        userAgent: ctx.userAgent,
        requestId: ctx.requestId,
        metadata: { role: input.role },
      });

      return user;
    }),

  /** Get the current user's own profile */
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session!.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        clinicId: true,
        mfaEnabled: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found.' });
    return user;
  }),

  /** Change own password */
  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1),
        newPassword: PasswordSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session!.user.id },
        select: { passwordHash: true },
      });

      if (!user) throw new TRPCError({ code: 'NOT_FOUND' });

      const valid = await bcrypt.compare(input.currentPassword, user.passwordHash);
      if (!valid) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Current password is incorrect.' });
      }

      const newHash = await bcrypt.hash(input.newPassword, 12);
      await ctx.db.user.update({
        where: { id: ctx.session!.user.id },
        data: { passwordHash: newHash, version: { increment: 1 } },
      });

      await auditLog(ctx.db, {
        userId: ctx.session!.user.id,
        clinicId: ctx.session!.user.clinicId,
        action: 'UPDATE',
        resource: 'User.Password',
        ipAddress: ctx.ip,
        userAgent: ctx.userAgent,
        requestId: ctx.requestId,
      });

      return { success: true };
    }),
});
