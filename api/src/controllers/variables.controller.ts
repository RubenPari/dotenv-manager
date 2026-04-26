import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as envsService from '../services/envs.service';
import * as varsService from '../services/variables.service';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';
import prisma from '../prisma/client';
import { getParam } from '../utils/params';

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

export async function exportEnv(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const projectId = getParam(req.params.id);
    const envName = getParam(req.params.env);
    const env = await envsService.getEnv(req.userId!, projectId, envName);

    const format = (req.query.format as string | undefined) ?? 'env';
    if (format !== 'env' && format !== 'json' && format !== 'shell') {
      throw new AppError(400, 'Invalid format. Use: env, json, shell');
    }

    const output = await varsService.exportEnv({ envId: env.id, format });
    res.setHeader('Content-Type', format === 'json' ? 'application/json' : 'text/plain');
    res.send(output);
  } catch (e) {
    next(e);
  }
}

export async function diffEnvs(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const projectId = getParam(req.params.id);
    const env1Name = getParam(req.params.env);
    const env2Name = getParam(req.params.env2);

    const [env1, env2] = await Promise.all([
      envsService.getEnv(req.userId!, projectId, env1Name),
      envsService.getEnv(req.userId!, projectId, env2Name),
    ]);

    const diff = await varsService.diffEnvs({ envId1: env1.id, envId2: env2.id });
    res.json(diff);
  } catch (e) {
    next(e);
  }
}

export async function importEnv(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const projectId = getParam(req.params.id);
    const envName = getParam(req.params.env);
    const env = await envsService.getEnv(req.userId!, projectId, envName);
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

export async function envHistory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const projectId = getParam(req.params.id);
    const envName = getParam(req.params.env);
    const limit = parseInt(req.query.limit as string) || 20;

    const env = await prisma.env.findFirst({
      where: {
        name: envName,
        project: { id: projectId, userId: req.userId },
      },
      include: {
        auditLogs: {
          orderBy: { createdAt: 'desc' },
          take: limit,
        },
      },
    });

    if (!env) throw new AppError(404, 'Environment not found');
    res.json(env.auditLogs);
  } catch (e) {
    next(e);
  }
}
