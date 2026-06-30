import { z } from 'zod';
import { createTRPCRouter, clinicScopedProcedure } from './_base';
import { AppointmentStatus, AppointmentType, Role } from '@chr/db';
import { TRPCError } from '@trpc/server';

export const appointmentRouter = createTRPCRouter({
  
  // List appointments (filterable by date range, doctor, status)
  list: clinicScopedProcedure
    .input(z.object({
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
      doctorId: z.string().uuid().optional(),
      patientId: z.string().uuid().optional(),
      status: z.nativeEnum(AppointmentStatus).optional(),
    }))
    .query(async ({ ctx, input }) => {
      // Patients can only see their own appointments
      if (ctx.session.user.role === 'PATIENT') {
        const patientRecord = await ctx.prisma.patient.findUnique({
          where: { userId: ctx.session.user.id },
        });
        if (!patientRecord) return [];
        input.patientId = patientRecord.id;
      }

      const where: any = { clinicId: ctx.session.user.clinicId };
      
      if (input.doctorId) where.doctorId = input.doctorId;
      if (input.patientId) where.patientId = input.patientId;
      if (input.status) where.status = input.status;
      if (input.startDate || input.endDate) {
        where.scheduledStart = {};
        if (input.startDate) where.scheduledStart.gte = new Date(input.startDate);
        if (input.endDate) where.scheduledStart.lte = new Date(input.endDate);
      }

      return ctx.prisma.appointment.findMany({
        where,
        include: {
          patient: { select: { id: true, firstName: true, lastName: true, mrn: true, dob: true } },
          doctor: { select: { id: true, email: true } }, // In a real app we'd have a Provider profile
        },
        orderBy: { scheduledStart: 'asc' },
      });
    }),

  // Get single appointment
  getById: clinicScopedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const appointment = await ctx.prisma.appointment.findUnique({
        where: { id: input.id, clinicId: ctx.session.user.clinicId },
        include: {
          patient: true,
          doctor: { select: { id: true, email: true } },
        }
      });

      if (!appointment) throw new TRPCError({ code: 'NOT_FOUND' });

      // Enforce PATIENT privacy
      if (ctx.session.user.role === 'PATIENT') {
        const patientRecord = await ctx.prisma.patient.findUnique({
          where: { userId: ctx.session.user.id },
        });
        if (appointment.patientId !== patientRecord?.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
      }

      return appointment;
    }),

  // Book new appointment
  create: clinicScopedProcedure
    .input(z.object({
      patientId: z.string().uuid(),
      doctorId: z.string().uuid(),
      scheduledStart: z.string().datetime(),
      scheduledEnd: z.string().datetime(),
      type: z.nativeEnum(AppointmentType).default(AppointmentType.CONSULTATION),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // In a real production system, use Prisma transactions to prevent double booking.
      // For this spec, we simulate optimistic locking.
      
      const overlapping = await ctx.prisma.appointment.findFirst({
        where: {
          doctorId: input.doctorId,
          status: { in: ['PENDING', 'CONFIRMED'] },
          clinicId: ctx.session.user.clinicId,
          OR: [
            {
              scheduledStart: { lt: new Date(input.scheduledEnd) },
              scheduledEnd: { gt: new Date(input.scheduledStart) },
            }
          ]
        }
      });

      if (overlapping) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'This time slot is already booked for the selected doctor.',
        });
      }

      return ctx.prisma.appointment.create({
        data: {
          patientId: input.patientId,
          doctorId: input.doctorId,
          clinicId: ctx.session.user.clinicId,
          scheduledStart: new Date(input.scheduledStart),
          scheduledEnd: new Date(input.scheduledEnd),
          type: input.type,
          reason: input.reason,
          status: 'PENDING',
        }
      });
    }),

  // Update status (Confirm, Cancel, Complete)
  updateStatus: clinicScopedProcedure
    .input(z.object({
      id: z.string().uuid(),
      status: z.nativeEnum(AppointmentStatus),
      cancelReason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const appointment = await ctx.prisma.appointment.findUnique({
        where: { id: input.id, clinicId: ctx.session.user.clinicId }
      });

      if (!appointment) throw new TRPCError({ code: 'NOT_FOUND' });

      // Only Doctor, Admin, Receptionist can confirm/complete. Patients can only cancel.
      if (ctx.session.user.role === 'PATIENT' && input.status !== 'CANCELLED') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Patients can only cancel appointments.' });
      }

      return ctx.prisma.appointment.update({
        where: { id: input.id },
        data: {
          status: input.status,
          cancelReason: input.cancelReason,
        }
      });
    }),
});
