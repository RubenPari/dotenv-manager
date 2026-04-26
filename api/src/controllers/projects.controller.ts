/**
 * Projects controller
 * @module api/controllers/projects.controller
 * @description Contains the projects controller functions
 */
import { Response, NextFunction } from 'express';
import { generateSlug } from '@dotenv-manager/shared';
import { CreateProjectRequestSchema, UpdateProjectRequestSchema } from '@dotenv-manager/shared';
import { AuthRequest } from '../middleware/auth.middleware';
import * as projectsService from '../services/projects.service';
import { getParam } from '../utils/params';

/**
 * List the projects for a user
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 * @returns The projects
 */
export async function listProjects(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const projects = await projectsService.getUserProjects(req.userId!);
    
    res.json(projects);
  } catch (e) {
    next(e);
  }
}

/**
 * Create a project
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 * @returns The project
 */
export async function createProject(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { name, description } = CreateProjectRequestSchema.parse(req.body);
    
    const slug = generateSlug(name);

    const project = await projectsService.createProject(req.userId!, { name, slug, description });
    
    res.status(201).json(project);
  } catch (e) {
    next(e);
  }
}

/**
 * Get a project
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 * @returns The project
 */
export async function getProject(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const projectId = getParam(req.params.id);
    
    const project = await projectsService.getProjectById(req.userId!, projectId);
    
    res.json(project);
  } catch (e) {
    next(e);
  }
}

/**
 * Update a project
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 * @returns The project
 */
export async function updateProject(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const projectId = getParam(req.params.id);
    
    const { name, description } = UpdateProjectRequestSchema.parse(req.body);
    
    const updated = await projectsService.updateProject(req.userId!, projectId, {
      name,
      description,
    });
    
    res.json(updated);
  } catch (e) {
    next(e);
  }
}

/**
 * Delete a project
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 * @returns The project
 */
export async function deleteProject(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const projectId = getParam(req.params.id);
    
    await projectsService.deleteProject(req.userId!, projectId);
    
    res.json({ message: 'Project deleted' });
  } catch (e) {
    next(e);
  }
}
