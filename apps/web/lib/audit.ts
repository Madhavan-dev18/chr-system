import { AuditAction, PrismaClient } from '@chr/db';
import { env } from './env';
import { logger } from './logger';

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

export async function auditLog(
  prisma: any,
  params: AuditLogParams
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        clinicId: params.clinicId,
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        requestId: params.requestId,
        metadata: params.metadata ? JSON.stringify(params.metadata) : undefined,
      },
    });
  } catch (error) {
    logger.error({ err: error, params }, 'FAILED TO WRITE AUDIT LOG TO DB - ATTEMPTING REDIS DLQ FALLBACK');
    
    // Fallback to Upstash Redis as a Dead Letter Queue (DLQ)
    try {
      const { redis } = await import('./redis');
      const dlqKey = `audit:dlq:${Date.now()}:${Math.random().toString(36).substring(7)}`;
      await redis.set(dlqKey, JSON.stringify({ ...params, error: String(error) }));
      
      logger.info({ dlqKey }, 'Audit log successfully persisted to Redis DLQ');
    } catch (redisError) {
      // Both DB and Redis failed. This is a severe observability failure.
      // We log it, and an external system like Sentry must capture this.
      logger.error({ err: redisError, params }, 'CRITICAL: AUDIT LOG COMPLETELY LOST (DB & REDIS FAILED)');
      
      // In a real Sentry setup:
      // Sentry.captureException(new Error('Audit Log Lost'), { extra: params });
      console.error('[Sentry] captureException: Audit Log completely lost', redisError);
    }
    
    // We intentionally DO NOT throw here to preserve clinical availability.
    // The "Slow-Log" DoS is mitigated by making this a soft-fail.
  }
}
