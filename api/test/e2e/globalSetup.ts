import { PrismaClient } from '@prisma/client';

export default async function globalSetup() {
  const prisma = new PrismaClient();

  try {
    // Best-effort cleanup for deterministic E2E runs.
    await prisma.refreshToken.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.variable.deleteMany();
    await prisma.env.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();
  } finally {
    await prisma.$disconnect();
  }
}

