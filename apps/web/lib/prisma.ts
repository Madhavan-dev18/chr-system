import { PrismaClient } from '@chr/db';
import { AsyncLocalStorage } from 'async_hooks';
import { env } from './env';
import { getLogger } from './logger';

const log = getLogger('prisma');

declare global {
  // eslint-disable-next-line no-var
  var __prisma: ReturnType<typeof buildPrismaClient> | undefined;
}

/** Carries the current clinic_id for automatic multi-tenant row scoping. */
export const tenantStorage = new AsyncLocalStorage<string>();

/**
 * Models that are always scoped to a clinic.
 * ADMIN-level queries that need cross-clinic access must bypass
 * the tenantStorage context (i.e. be called outside a tenanted procedure).
 */
const TENANT_MODELS = new Set([
  'Patient',
  'MedicalRecord',
  'Vitals',
  'Appointment',
  'Prescription',
  'LabResult',
  'User',
  'Notification',
  'AuditLog',
]);

const WRITE_OPS = new Set(['create', 'createMany', 'update', 'updateMany', 'upsert']);
const FILTER_OPS = new Set(['findMany', 'findFirst', 'count', 'deleteMany', 'updateMany']);

function buildPrismaClient() {
  // Ensure pgbouncer/Supavisor pooling params are always present
  let dbUrl = env.DATABASE_URL;
  if (!dbUrl.includes('pgbouncer=true')) {
    dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'pgbouncer=true&connection_limit=5';
  }

  const client = new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'event', level: 'error' },
            { emit: 'event', level: 'warn' },
          ]
        : [{ emit: 'event', level: 'error' }],
    datasources: { db: { url: dbUrl } },
  });

  // Dev: log slow queries > 500ms
  if (env.NODE_ENV === 'development') {
    // Prisma event types
    client.$on('query', (e: { duration: number; query: string }) => {
      if (e.duration > 500) {
        log.warn({ duration: e.duration, query: e.query }, 'Slow query detected');
      }
    });
  }

  // Global multi-tenant isolation extension
  return client.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }: any) {
          const clinicId = tenantStorage.getStore();

          if (clinicId && model && TENANT_MODELS.has(model)) {
            const a = args as Record<string, unknown>;

            // Inject clinicId into WHERE clause for read/delete operations
            if (FILTER_OPS.has(operation)) {
              a.where = { ...(a.where as object), clinicId };
            } else if (a.where && typeof a.where === 'object') {
              a.where = { ...(a.where as object), clinicId };
            }

            // Inject clinicId into data for writes
            if (WRITE_OPS.has(operation) && a.data) {
              if (Array.isArray(a.data)) {
                a.data = (a.data as object[]).map((d) => ({ ...d, clinicId }));
              } else {
                a.data = { ...(a.data as object), clinicId };
              }
            }
          }

          return query(args);
        },
      },
    },
  });
}

export type ExtendedPrismaClient = ReturnType<typeof buildPrismaClient>;

export const prisma: ExtendedPrismaClient =
  global.__prisma ?? buildPrismaClient();

if (env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}
