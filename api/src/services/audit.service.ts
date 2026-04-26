import prisma from '../prisma/client';

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
