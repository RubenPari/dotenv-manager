/**
 * Prisma client singleton
 * @module api/prisma/client
 * @description Shared PrismaClient instance for the API process.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;
