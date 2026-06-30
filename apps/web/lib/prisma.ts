import { PrismaClient } from '@chr/db';
import { env } from './env';
import { logger } from './logger';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const instantiatePrisma = () => {
  const start = performance.now();
  const client = new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
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

  return client;
};

export const prisma = globalForPrisma.prisma ?? instantiatePrisma();

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
