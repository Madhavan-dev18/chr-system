import { PrismaClient } from '@chr/db';
import { env } from './env';
import { logger } from './logger';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

import { AsyncLocalStorage } from 'async_hooks';

export const tenantStorage = new AsyncLocalStorage<string>();

const instantiatePrisma = () => {
  const start = performance.now();
  
  // Ensure pooling parameters are present for Supavisor
  let dbUrl = env.DATABASE_URL;
  if (!dbUrl.includes('pgbouncer=true')) {
    dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'pgbouncer=true&connection_limit=5';
  }

  const client = new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: { url: dbUrl }
    }
  });

  // Attempt a dummy query or just rely on instantiation time if lazy
  // For Supabase pooler latency check, let's fire a tiny ping.
  client.$queryRaw`SELECT 1`.then(() => {
    const elapsed = performance.now() - start;
    if (elapsed > 500) {
      logger.warn({ ms: elapsed.toFixed(2) }, `[HealthCheck] Prisma connection pool instantiation took > 500ms`);
    }
  }).catch((err) => {
    logger.error({ err }, `[HealthCheck] Failed to ping Prisma database pool`);
  });

  // Global Tenant Enforcement Middleware
  return client.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const tenantModels = ['Patient', 'MedicalRecord', 'Vitals', 'Appointment', 'Prescription', 'LabResult', 'User'];
          const clinicId = tenantStorage.getStore();
          
          if (clinicId && tenantModels.includes(model as string)) {
            const anyArgs = args as any;
            if (anyArgs.where) {
              anyArgs.where = { ...anyArgs.where, clinicId };
            } else if (['findMany', 'findFirst', 'count', 'deleteMany', 'updateMany'].includes(operation)) {
              anyArgs.where = { clinicId };
            }
            if (['create', 'createMany', 'update', 'updateMany'].includes(operation) && anyArgs.data) {
              if (Array.isArray(anyArgs.data)) {
                anyArgs.data = anyArgs.data.map((d: any) => ({ ...d, clinicId }));
              } else {
                anyArgs.data = { ...anyArgs.data, clinicId };
              }
            }
          }
          return query(args);
        }
      }
    }
  });
};

export const prisma = globalForPrisma.prisma ?? instantiatePrisma();

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
