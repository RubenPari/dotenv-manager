/**
 * Audit log service
 * @module api/services/audit.service
 * @description Creates audit log entries for variable changes.
 */
import prisma from '../prisma/client';

/**
 * Create an audit log entry.
 * @param envId - The environment ID the change belongs to.
 * @param action - The performed action (e.g. CREATE, UPDATE, IMPORT).
 * @param key - The affected variable key.
 * @param actorId - The user ID that performed the change.
 */
export async function createAuditLog(
  envId: string,
  action: string,
  key: string,
  actorId: string,
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      envId,
      action,
      key,
      actorId,
    },
  });
}
