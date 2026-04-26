/**
 * Projects service
 * @module api/services/projects.service
 * @description Contains the projects service functions
 */
import prisma from '../prisma/client';
import { AppError } from '../middleware/errorHandler';

/**
 * Get the projects for a user
 * @param userId - The user ID
 * @returns The projects
 */
export async function getUserProjects(userId: string) {
  return prisma.project.findMany({
    where: { userId },
    include: {
      envs: {
        include: {
          _count: { select: { variables: true } },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });
}

/**
 * Create a project
 * @param userId - The user ID
 * @param data - The data of the project
 * @returns The project
 */
export async function createProject(
  userId: string,
  data: { name: string; slug: string; description?: string },
) {
  // Check if the project with this slug already exists
  const existing = await prisma.project.findUnique({ where: { slug: data.slug } });
  if (existing) throw new AppError(409, 'Project with this name already exists');

  // Create the project
  const project = await prisma.project.create({
    data: {
      userId,
      name: data.name,
      slug: data.slug,
      description: data.description,
    },
  });

  // Create the default environments
  for (const envName of ['dev', 'staging', 'prod']) {
    await prisma.env.create({ data: { projectId: project.id, name: envName } });
  }

  return project;
}

/**
 * Get a project by its ID
 * @param userId - The user ID
 * @param projectId - The project ID
 * @returns The project
 */
export async function getProjectById(userId: string, projectId: string) {
  // Check if the project exists
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    include: { envs: true },
  });
  
  if (!project) throw new AppError(404, 'Project not found');
  
  return project;
}

/**
 * Update a project
 * @param userId - The user ID
 * @param projectId - The project ID
 * @param data - The data of the project
 * @returns The project
 */
export async function updateProject(
  userId: string,
  projectId: string,
  data: { name: string; description?: string },
) {
  await getProjectById(userId, projectId);
  
  return prisma.project.update({
    where: { id: projectId },
    data: { name: data.name, description: data.description },
  });
}

/**
 * Delete a project
 * @param userId - The user ID
 * @param projectId - The project ID
 * @returns The project
 */
export async function deleteProject(userId: string, projectId: string) {
  // Check if the project exists
  await getProjectById(userId, projectId);

  // Delete the project
  await prisma.project.delete({ where: { id: projectId } });
}
