import { z } from 'zod';
import { createTRPCRouter, clinicScopedProcedure } from './_base';
import { TRPCError } from '@trpc/server';
import { auditLog } from '@/lib/audit';

const AppointmentStatus = z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']);

const CreateAppointmentSchema = z.object({
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  scheduledStart: z.string().refine((v) => new Date(v) > new Date(), {
    message: 'Appointment must be scheduled in the future',
  }),
  durationMinutes: z.number().int().min(5).max(480).default(30),
  appointmentType: z.enum(['CONSULTATION', 'FOLLOW_UP', 'PROCEDURE', 'EMERGENCY', 'LAB_REVIEW']),
  chiefComplaint: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
});

export const appointmentRouter = createTRPCRouter({
  create: clinicScopedProcedure
    .input(CreateAppointmentSchema)
    .mutation(async ({ ctx, input }) => {
      const { role, id: userId, clinicId } = ctx.session!.user;

      if (!['ADMIN', 'RECEPTIONIST', 'DOCTOR'].includes(role)) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      // Conflict check: doctor already has appointment within the window
      const scheduledStart = new Date(input.scheduledStart);
      const scheduledEnd = new Date(scheduledStart.getTime() + input.durationMinutes * 60_000);

      const conflict = await ctx.db.appointment.findFirst({
        where: {
          clinicId,
          doctorId: input.doctorId,
          status: { in: ['PENDING', 'CONFIRMED'] },
          OR: [
            { scheduledStart: { gte: scheduledStart, lt: scheduledEnd } },
            {
              AND: [
                { scheduledStart: { lt: scheduledStart } },
                { scheduledEnd: { gt: scheduledStart } },
              ],
            },
          ],
        },
      });

      if (conflict) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Doctor already has an appointment during this time slot.',
        });
      }

      const appointment = await ctx.db.appointment.create({
        data: {
          patientId: input.patientId,
          doctorId: input.doctorId,
          scheduledStart,
          scheduledEnd,
          type: input.appointmentType,
          reason: input.chiefComplaint,
          notes: input.notes,
          status: 'PENDING',
          clinicId,
        },
      });

      // Notify patient
      const patient = await ctx.db.patient.findUnique({
        where: { id: input.patientId },
        select: { userId: true, firstName: true },
      });
      if (patient?.userId) {
        await ctx.db.notification.create({
          data: {
            userId: patient.userId,
            clinicId,
            type: 'APPOINTMENT_REMINDER',
            title: 'Appointment Scheduled',
            message: `Your appointment is scheduled for ${scheduledStart.toLocaleString()}.`,
            link: `/patient/appointments`,
          },
        });
      }

      await auditLog(ctx.db, {
        userId, clinicId,
        action: 'CREATE', resource: 'Appointment',
        resourceId: appointment.id,
        ipAddress: ctx.ip, userAgent: ctx.userAgent, requestId: ctx.requestId,
        metadata: { type: input.appointmentType, scheduledStart: input.scheduledStart },
      });

      return appointment;
    }),

  list: clinicScopedProcedure
    .input(z.object({
      patientId: z.string().uuid().optional(),
      doctorId: z.string().uuid().optional(),
      status: AppointmentStatus.optional(),
      from: z.string().optional(),
      to: z.string().optional(),
      limit: z.number().min(1).max(200).default(50),
    }).optional())
    .query(async ({ ctx, input }) => {
      const { role, id: userId, clinicId } = ctx.session!.user;

      const where: Record<string, unknown> = {
        clinicId,
        ...(input?.status && { status: input.status }),
        ...(input?.patientId && { patientId: input.patientId }),
        ...(input?.from || input?.to
          ? {
              scheduledStart: {
                ...(input?.from && { gte: new Date(input.from) }),
                ...(input?.to && { lte: new Date(input.to) }),
              },
            }
          : {}),
      };

      if (role === 'DOCTOR') where.doctorId = userId;
      else if (role === 'PATIENT') {
        const patient = await ctx.db.patient.findFirst({ where: { userId, clinicId } });
        if (!patient) return { appointments: [] };
        where.patientId = patient.id;
      } else if (role === 'NURSE') {
        where.doctor = { assignedNurseId: userId };
      } else if (!['ADMIN', 'RECEPTIONIST'].includes(role)) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const appointments = await ctx.db.appointment.findMany({
        where,
        orderBy: { scheduledStart: 'asc' },
        take: input?.limit ?? 50,
        include: {
          patient: { select: { id: true, firstName: true, lastName: true, mrn: true } },
          doctor: { select: { id: true, email: true } },
        },
      });

      return { appointments };
    }),

  updateStatus: clinicScopedProcedure
    .input(z.object({
      id: z.string().uuid(),
      status: AppointmentStatus,
      cancellationReason: z.string().max(500).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { role, id: userId, clinicId } = ctx.session!.user;

      const appt = await ctx.db.appointment.findUnique({ where: { id: input.id } });
      if (!appt || appt.clinicId !== clinicId) throw new TRPCError({ code: 'NOT_FOUND' });

      if (role === 'DOCTOR' && appt.doctorId !== userId) throw new TRPCError({ code: 'FORBIDDEN' });
      if (!['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE'].includes(role)) throw new TRPCError({ code: 'FORBIDDEN' });

      const updated = await ctx.db.appointment.update({
        where: { id: input.id },
        data: {
          status: input.status,
          ...(input.cancellationReason && { cancelReason: input.cancellationReason }),
        },
      });

      await auditLog(ctx.db, {
        userId, clinicId,
        action: 'UPDATE', resource: 'Appointment',
        resourceId: input.id,
        ipAddress: ctx.ip, userAgent: ctx.userAgent, requestId: ctx.requestId,
        metadata: { newStatus: input.status },
      });

      return updated;
    }),
});
