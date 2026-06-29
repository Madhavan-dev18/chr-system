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
  prisma: PrismaClient,
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
    // Audit logging MUST NOT fail the main transaction if possible,
    // but we need to alert loudly.
    logger.error({ err: error, params }, 'FAILED TO WRITE AUDIT LOG - THIS IS A SEVERE SECURITY EVENT');
    
    // If strict mode is enforced, we might throw here in a real production environment.
    // For Phase 1, logging the error is sufficient.
    if (env.NODE_ENV === 'production') {
      throw new Error('Audit log failed to persist');
    }
  }
}
