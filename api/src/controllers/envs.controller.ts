/**
 * Environments controller
 * @module api/controllers/envs.controller
 * @description Contains the environments controller functions
 */
import { Response } from 'express';
import { CreateEnvRequestSchema } from '@dotenv-manager/shared';
import { AuthRequest } from '../middleware/auth.middleware';
import * as envsService from '../services/envs.service';
import { getParam } from '../utils/params';
import { asyncAuthHandler } from '../utils/asyncHandler';

export const listEnvs = asyncAuthHandler(async (req: AuthRequest, res: Response) => {
  const projectId = getParam(req.params.id);

  const envs = await envsService.listProjectEnvs(req.userId!, projectId);

  res.json(envs);
});

export const createEnv = asyncAuthHandler(async (req: AuthRequest, res: Response) => {
  const projectId = getParam(req.params.id);

  const { name } = CreateEnvRequestSchema.parse(req.body);

  const env = await envsService.createEnv(req.userId!, projectId, name);

  res.status(201).json(env);
});

export const deleteEnv = asyncAuthHandler(async (req: AuthRequest, res: Response) => {
  const projectId = getParam(req.params.id);

  const envName = getParam(req.params.env);

  await envsService.deleteEnv(req.userId!, projectId, envName);

  res.json({ message: 'Environment deleted' });
});
