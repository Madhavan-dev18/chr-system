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
        const patientRecord = await ctx.db.patient.findUnique({
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

      return ctx.db.appointment.findMany({
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
      const appointment = await ctx.db.appointment.findUnique({
        where: { id: input.id, clinicId: ctx.session.user.clinicId },
        include: {
          patient: true,
          doctor: { select: { id: true, email: true } },
        }
      });

      if (!appointment) throw new TRPCError({ code: 'NOT_FOUND' });

      // Enforce PATIENT privacy
      if (ctx.session.user.role === 'PATIENT') {
        const patientRecord = await ctx.db.patient.findUnique({
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
      // Use Prisma transactions to prevent double booking race conditions.
      const result = await ctx.db.$transaction(async (tx) => {
        // Raw SQL for row-level locking on the doctor's existing appointments
        // to serialize overlapping checks.
        await tx.$executeRaw`
          SELECT id FROM "Appointment"
          WHERE "doctorId" = ${input.doctorId}
            AND "clinicId" = ${ctx.session.user.clinicId}
            AND "status" IN ('PENDING', 'CONFIRMED')
          FOR UPDATE
        `;

        const overlapping = await tx.appointment.findFirst({
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

        const appointment = await tx.appointment.create({
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

        return appointment;
      });

      const { auditLog } = await import('@/lib/audit');
      await auditLog(ctx.db, {
        userId: ctx.session.user.id,
        clinicId: ctx.session.user.clinicId,
        action: 'CREATE',
        resource: 'Appointment',
        resourceId: result.id,
        ipAddress: ctx.ip,
        userAgent: ctx.userAgent,
        requestId: ctx.requestId,
      });

      return result;
    }),

  // Update status (Confirm, Cancel, Complete)
  updateStatus: clinicScopedProcedure
    .input(z.object({
      id: z.string().uuid(),
      status: z.nativeEnum(AppointmentStatus),
      cancelReason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.$transaction(async (tx) => {
        // Raw SQL for row-level locking on the appointment to prevent concurrent updates
        const lockedRows = await tx.$queryRaw<{ id: string }[]>`
          SELECT id FROM "Appointment"
          WHERE "id" = ${input.id}
            AND "clinicId" = ${ctx.session.user.clinicId}
          FOR UPDATE
        `;

        if (lockedRows.length === 0) {
          throw new TRPCError({ code: 'NOT_FOUND' });
        }

        const appointment = await tx.appointment.findUnique({
          where: { id: input.id, clinicId: ctx.session.user.clinicId }
        });

        if (!appointment) throw new TRPCError({ code: 'NOT_FOUND' });

        // Only Doctor, Admin, Receptionist can confirm/complete. Patients can only cancel.
        if (ctx.session.user.role === 'PATIENT' && input.status !== 'CANCELLED') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Patients can only cancel appointments.' });
        }

        const updated = await tx.appointment.update({
          where: { id: input.id },
          data: {
            status: input.status,
            cancelReason: input.cancelReason,
          }
        });

        return updated;
      });

      const { auditLog } = await import('@/lib/audit');
      await auditLog(ctx.db, {
        userId: ctx.session.user.id,
        clinicId: ctx.session.user.clinicId,
        action: 'UPDATE',
        resource: 'Appointment',
        resourceId: result.id,
        ipAddress: ctx.ip,
        userAgent: ctx.userAgent,
        requestId: ctx.requestId,
        metadata: { status: input.status }
      });

      return result;
    }),
});

