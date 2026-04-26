import prisma from '../prisma/client';
import { AppError } from '../middleware/errorHandler';

export async function listProjectEnvs(userId: string, projectId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    include: { envs: true },
  });
  if (!project) throw new AppError(404, 'Project not found');
  return project.envs;
}

export async function createEnv(userId: string, projectId: string, name: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
  if (!project) throw new AppError(404, 'Project not found');
  return prisma.env.create({ data: { projectId, name } });
}

export async function deleteEnv(userId: string, projectId: string, envName: string) {
  const env = await prisma.env.findFirst({
    where: {
      name: envName,
      project: { id: projectId, userId },
    },
  });
  if (!env) throw new AppError(404, 'Environment not found');
  await prisma.env.delete({ where: { id: env.id } });
}

export async function getEnvWithVariables(userId: string, projectId: string, envName: string) {
  const env = await prisma.env.findFirst({
    where: {
      name: envName,
      project: { id: projectId, userId },
    },
    include: { variables: { orderBy: { key: 'asc' } } },
  });
  if (!env) throw new AppError(404, 'Environment not found');
  return env;
}

export async function getEnv(userId: string, projectId: string, envName: string) {
  const env = await prisma.env.findFirst({
    where: {
      name: envName,
      project: { id: projectId, userId },
    },
  });
  if (!env) throw new AppError(404, 'Environment not found');
  return env;
}
