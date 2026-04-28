/**
 * Projects controller
 * @module api/controllers/projects.controller
 * @description Contains the projects controller functions
 */
import { Response } from 'express';
import { generateSlug } from '@dotenv-manager/shared';
import { CreateProjectRequestSchema, UpdateProjectRequestSchema } from '@dotenv-manager/shared';
import { AuthRequest } from '../middleware/auth.middleware';
import * as projectsService from '../services/projects.service';
import { getParam } from '../utils/params';
import { asyncAuthHandler } from '../utils/asyncHandler';

export const listProjects = asyncAuthHandler(async (req: AuthRequest, res: Response) => {
  const projects = await projectsService.getUserProjects(req.userId!);

  res.json(projects);
});

export const createProject = asyncAuthHandler(async (req: AuthRequest, res: Response) => {
  const { name, description } = CreateProjectRequestSchema.parse(req.body);

  const slug = generateSlug(name);

  const project = await projectsService.createProject(req.userId!, { name, slug, description });

  res.status(201).json(project);
});

export const getProject = asyncAuthHandler(async (req: AuthRequest, res: Response) => {
  const projectId = getParam(req.params.id);

  const project = await projectsService.getProjectById(req.userId!, projectId);

  res.json(project);
});

export const updateProject = asyncAuthHandler(async (req: AuthRequest, res: Response) => {
  const projectId = getParam(req.params.id);

  const data = UpdateProjectRequestSchema.parse(req.body);

  const project = await projectsService.updateProject(req.userId!, projectId, data);

  res.json(project);
});

export const deleteProject = asyncAuthHandler(async (req: AuthRequest, res: Response) => {
  const projectId = getParam(req.params.id);

  await projectsService.deleteProject(req.userId!, projectId);

  res.json({ message: 'Project deleted' });
});
