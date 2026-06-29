import { createTRPCRouter } from './_base';
import { authRouter } from './auth';
import { userRouter } from './user';
import { patientRouter } from './patient';
import { vitalsRouter } from './vitals';
import { recordsRouter } from './records';
import { aiRouter } from './ai';

export const appRouter = createTRPCRouter({
  auth: authRouter,
  user: userRouter,
  patients: patientRouter,
  vitals: vitalsRouter,
  records: recordsRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
