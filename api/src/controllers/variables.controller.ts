/**
 * Variables controller
 * @module controllers/variables.controller
 * @description Contains the variables controller functions
 */
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as envsService from '../services/envs.service';
import * as varsService from '../services/variables.service';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';
import { getParam } from '../utils/params';

/**
 * List the variables for an environment
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 * @returns The variables
 */
export async function listEnvVariables(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const projectId = getParam(req.params.id);
    const envName = getParam(req.params.env);
    
    const env = await envsService.getEnvWithVariables(req.userId!, projectId, envName);
    
    res.json(env.variables.map(varsService.toVariableResponse));
  } catch (e) {
    next(e);
  }
}

/**
 * Upsert the variables for an environment
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 * @returns The variables
 */
export async function upsertEnvVariables(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const projectId = getParam(req.params.id);
    const envName = getParam(req.params.env);
    
    const env = await envsService.getEnv(req.userId!, projectId, envName);
    
    const variables = varsService.parseVariableInputs(req.body);
    
    const results = await varsService.upsertEnvVariables({
      envId: env.id,
      userId: req.userId!,
      variables,
    });
    
    res.json(results);
  } catch (e) {
    next(e);
  }
}

/**
 * Export the variables for an environment
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 * @returns The variables
 */
export async function exportEnv(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const projectId = getParam(req.params.id);
    const envName = getParam(req.params.env);
    
    const env = await envsService.getEnv(req.userId!, projectId, envName);

    // Check if the format is valid
    const format = (req.query.format as string | undefined) ?? 'env';
    if (format !== 'env' && format !== 'json' && format !== 'shell') {
      throw new AppError(400, 'Invalid format. Use: env, json, shell');
    }

    // Export the variables
    const output = await varsService.exportEnv({ envId: env.id, format });
    
    res.setHeader('Content-Type', format === 'json' ? 'application/json' : 'text/plain');
    res.send(output);
  } catch (e) {
    next(e);
  }
}

/**
 * Diff the variables for two environments
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 * @returns The diff
 */
export async function diffEnvs(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const projectId = getParam(req.params.id);
    const env1Name = getParam(req.params.env);
    const env2Name = getParam(req.params.env2);

    // Check if the environments exist
    const [env1, env2] = await Promise.all([
      envsService.getEnv(req.userId!, projectId, env1Name),
      envsService.getEnv(req.userId!, projectId, env2Name),
    ]);

    // Diff the variables
    const diff = await varsService.diffEnvs({ envId1: env1.id, envId2: env2.id });
    
    res.json(diff);
  } catch (e) {
    next(e);
  }
}

/**
 * Import the variables for an environment
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 * @returns The variables
 */
export async function importEnv(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const projectId = getParam(req.params.id);
    const envName = getParam(req.params.env);

    // Check if the environment exists
    const env = await envsService.getEnv(req.userId!, projectId, envName);

    // Parse the content
    const { content } = z.object({ content: z.string() }).parse(req.body);

    const result = await varsService.importEnvContent({
      envId: env.id,
      userId: req.userId!,
      content,
    });
    
    res.json(result);
  } catch (e) {
    next(e);
  }
}

/**
 * Get the history of an environment
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 * @returns The history
 */
export async function envHistory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const projectId = getParam(req.params.id);
    const envName = getParam(req.params.env);
    const limit = parseInt(req.query.limit as string) || 20;

    const history = await envsService.getEnvHistory(req.userId!, projectId, envName, limit);
    
    res.json(history);
  } catch (e) {
    next(e);
  }
}
