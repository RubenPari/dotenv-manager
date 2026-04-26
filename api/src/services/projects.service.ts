import prisma from '../prisma/client';
import { AppError } from '../middleware/errorHandler';

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

export async function createProject(
  userId: string,
  data: { name: string; slug: string; description?: string },
) {
  const existing = await prisma.project.findUnique({ where: { slug: data.slug } });
  if (existing) throw new AppError(409, 'Project with this name already exists');

  const project = await prisma.project.create({
    data: {
      userId,
      name: data.name,
      slug: data.slug,
      description: data.description,
    },
  });

  for (const envName of ['dev', 'staging', 'prod']) {
    await prisma.env.create({ data: { projectId: project.id, name: envName } });
  }

  return project;
}

export async function getProjectById(userId: string, projectId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    include: { envs: true },
  });
  if (!project) throw new AppError(404, 'Project not found');
  return project;
}

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

export async function deleteProject(userId: string, projectId: string) {
  await getProjectById(userId, projectId);
  await prisma.project.delete({ where: { id: projectId } });
}
