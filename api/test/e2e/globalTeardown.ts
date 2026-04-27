import { PrismaClient } from '@prisma/client';

export default async function globalTeardown() {
  // Ensure no hanging connections from setup (and be a no-op if DB is down).
  const prisma = new PrismaClient();
  await prisma.$disconnect();
}

