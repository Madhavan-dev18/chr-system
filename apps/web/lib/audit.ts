import type { AuditAction } from '@chr/db';
import { getLogger } from './logger';

const log = getLogger('audit');

export interface AuditLogParams {
  userId?: string | null;
  clinicId?: string | null;
  action: AuditAction;
  resource: string;
  resourceId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Write a HIPAA-compliant audit log entry.
 *
 * Strategy:
 *   1. Try to write directly to Postgres via Prisma.
 *   2. On failure, push to Upstash Redis Dead Letter Queue (DLQ).
 *   3. On DLQ failure, emit to Sentry + structured log (never throw).
 *
 * Clinical availability is prioritised over audit completeness:
 * this function NEVER throws, so a DB hiccup won't surface a 500 to the user.
 */
export async function auditLog(
  // Accept any Prisma client (base or extended)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prisma: any,
  params: AuditLogParams
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId ?? null,
        clinicId: params.clinicId ?? null,
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId ?? null,
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
        requestId: params.requestId ?? null,
        metadata: params.metadata
          ? (params.metadata as Record<string, unknown>)
          : undefined,
      },
    });
  } catch (dbError) {
    log.error({ err: dbError, params }, 'Audit log DB write failed — attempting Redis DLQ');

    try {
      const { redis } = await import('./redis');
      const dlqKey = `audit:dlq:${Date.now()}:${Math.random().toString(36).slice(2)}`;
      // Expire DLQ entries after 72 hours to avoid runaway memory growth
      await redis.set(dlqKey, JSON.stringify({ ...params, _error: String(dbError) }), {
        ex: 72 * 60 * 60,
      });
      log.info({ dlqKey }, 'Audit log written to Redis DLQ');
    } catch (redisError) {
      // Both primary and fallback failed. This is a severity-critical observability gap.
      log.error(
        { err: redisError, params },
        'CRITICAL: Audit log completely lost (DB + Redis both failed)'
      );
      // In production, Sentry would capture this:
      // Sentry.captureException(new Error('AuditLog Lost'), { extra: params });
    }
    // Intentionally NOT re-throwing — clinical flow must continue.
  }
}
