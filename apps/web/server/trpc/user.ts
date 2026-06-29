import { z } from 'zod';
import { createTRPCRouter, clinicScopedProcedure } from './_base';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';

// OWASP: Strict Input Validation Schema
const CreateUserSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  role: z.enum(['ADMIN', 'DOCTOR', 'NURSE', 'PATIENT', 'RECEPTIONIST', 'LAB_TECH']),
});

export const userRouter = createTRPCRouter({
  
  // Demonstration of clinic-scoped access and rigid input validation
  createStaff: clinicScopedProcedure
    .input(CreateUserSchema)
    .mutation(async ({ ctx, input }) => {
      
      // Enforce that only ADMINs can create staff
      if (ctx.session.user.role !== 'ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only Administrators can provision new staff accounts',
        });
      }

      // Check if user already exists
      const existingUser = await ctx.prisma.user.findUnique({
        where: { email: input.email.toLowerCase() },
      });

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A user with this email already exists',
        });
      }

      // Securely hash the password (OWASP standard 12 rounds)
      const passwordHash = await bcrypt.hash(input.password, 12);

      // Create the user inherently tied to the invoking Admin's clinicId
      const newUser = await ctx.prisma.user.create({
        data: {
          email: input.email.toLowerCase(),
          passwordHash,
          role: input.role,
          clinicId: ctx.session.user.clinicId, // Forced scope from clinicScopedProcedure
        },
        select: {
          id: true,
          email: true,
          role: true,
          clinicId: true,
          createdAt: true,
        },
      });

      return newUser;
    }),

});
