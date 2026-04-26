/**
 * Environments controller
 * @module controllers/envs.controller
 * @description Contains the environments controller functions
 */
import { Response, NextFunction } from 'express';
import { CreateEnvRequestSchema } from '@dotenv-manager/shared';
import { AuthRequest } from '../middleware/auth.middleware';
import * as envsService from '../services/envs.service';
import { getParam } from '../utils/params';

/**
 * List the environments for a project
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 * @returns The environments
 */
export async function listEnvs(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const projectId = getParam(req.params.id);
    
    const envs = await envsService.listProjectEnvs(req.userId!, projectId);
    
    res.json(envs);
  } catch (e) {
    next(e);
  }
}

/**
 * Create an environment for a project
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 * @returns The environment
 */
export async function createEnv(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const projectId = getParam(req.params.id);
    
    const { name } = CreateEnvRequestSchema.parse(req.body);
    
    const env = await envsService.createEnv(req.userId!, projectId, name);
    
    res.status(201).json(env);
  } catch (e) {
    next(e);
  }
}

/**
 * Delete an environment for a project
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 * @returns The environment
 */
export async function deleteEnv(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const projectId = getParam(req.params.id);
    
    const envName = getParam(req.params.env);
    
    await envsService.deleteEnv(req.userId!, projectId, envName);
    
    res.json({ message: 'Environment deleted' });
  } catch (e) {
    next(e);
  }
}
