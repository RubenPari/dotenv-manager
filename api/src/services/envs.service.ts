/**
 * Environments service
 * @module services/envs.service
 * @description Contains the environments service functions
 */
import prisma from '../prisma/client';
import { AppError } from '../middleware/errorHandler';

/**
 * List the environments for a project
 * @param userId - The user ID
 * @param projectId - The project ID
 * @returns The environments
 */
export async function listProjectEnvs(userId: string, projectId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    include: { envs: true },
  });
  
  if (!project) throw new AppError(404, 'Project not found');
  
  return project.envs;
}

/**
 * Create an environment for a project
 * @param userId - The user ID
 * @param projectId - The project ID
 * @param name - The name of the environment
 * @returns The environment
 */
export async function createEnv(userId: string, projectId: string, name: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
  
  if (!project) throw new AppError(404, 'Project not found');
  
  return prisma.env.create({ data: { projectId, name } });
}

/**
 * Delete an environment for a project
 * @param userId - The user ID
 * @param projectId - The project ID
 * @param envName - The name of the environment
 * @returns The environment
 */
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

/**
 * Get an environment with its variables
 * @param userId - The user ID
 * @param projectId - The project ID
 * @param envName - The name of the environment
 * @returns The environment
 */
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

/**
 * Get an environment
 * @param userId - The user ID
 * @param projectId - The project ID
 * @param envName - The name of the environment
 * @returns The environment
 */
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

/**
 * Get the history of an environment
 * @param userId - The user ID
 * @param projectId - The project ID
 * @param envName - The name of the environment
 * @param limit - The limit of the history
 * @returns The history
 */
export async function getEnvHistory(
  userId: string,
  projectId: string,
  envName: string,
  limit: number,
) {
  const env = await prisma.env.findFirst({
    where: {
      name: envName,
      project: { id: projectId, userId },
    },
    include: {
      auditLogs: {
        orderBy: { createdAt: 'desc' },
        take: limit,
      },
    },
  });

  if (!env) throw new AppError(404, 'Environment not found');
  
  return env.auditLogs;
}
