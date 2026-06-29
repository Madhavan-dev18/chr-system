import { createTRPCRouter } from './_base';
import { authRouter } from './auth';

export const appRouter = createTRPCRouter({
  auth: authRouter,
  // Add other routers here in future phases (e.g., patients: patientRouter)
});

export type AppRouter = typeof appRouter;
