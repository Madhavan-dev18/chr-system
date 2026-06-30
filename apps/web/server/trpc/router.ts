import { createTRPCRouter } from './_base';
import { authRouter } from './auth';
import { userRouter } from './user';
import { patientRouter } from './patient';
import { vitalsRouter } from './vitals';
import { recordsRouter } from './records';
import { aiRouter } from './ai';
import { appointmentRouter } from './appointment';
import { prescriptionRouter } from './prescription';
import { labRouter } from './lab';
import { notificationRouter } from './notification';
import { adminRouter } from './admin';

export const appRouter = createTRPCRouter({
  auth: authRouter,
  user: userRouter,
  patients: patientRouter,
  vitals: vitalsRouter,
  records: recordsRouter,
  ai: aiRouter,
  appointments: appointmentRouter,
  prescriptions: prescriptionRouter,
  labs: labRouter,
  notifications: notificationRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
