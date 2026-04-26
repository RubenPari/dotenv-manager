import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { z } from 'zod';
import prisma from '../prisma/client';
import { AppError } from '../middleware/errorHandler';
import { encryptVariable, decryptVariable } from '../services/crypto.service';
import { createAuditLog } from '../services/audit.service';

function getParam(req: Request, name: string): string {
  const val = req.params[name];
  return Array.isArray(val) ? val[0] : val;
}

const projectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

const envSchema = z.object({
  name: z.string().min(1).max(50),
});

const variableSchema = z.object({
  key: z.string().min(1).max(200),
  value: z.string().optional(),
  isSecret: z.boolean().default(false),
  isRequired: z.boolean().default(false),
  description: z.string().max(500).optional(),
});

export const projectsRouter = Router();
projectsRouter.use(authMiddleware);

// GET /api/v1/projects
projectsRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.userId },
      include: {
        envs: {
          include: {
            _count: { select: { variables: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/projects
projectsRouter.post('/', async (req: AuthRequest, res, next) => {
  try {
    const { name, description } = projectSchema.parse(req.body);
    const slug = generateSlug(name);

    const existing = await prisma.project.findUnique({ where: { slug } });
    if (existing) {
      throw new AppError(409, 'Project with this name already exists');
    }

    const project = await prisma.project.create({
      data: {
        name,
        slug,
        description,
        userId: req.userId!,
      },
    });

    // Create default environments
    for (const envName of ['dev', 'staging', 'prod']) {
      await prisma.env.create({
        data: { projectId: project.id, name: envName },
      });
    }

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/projects/:id
projectsRouter.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const projectId = getParam(req, 'id');
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: req.userId },
      include: { envs: true },
    });

    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/projects/:id
projectsRouter.put('/:id', async (req: AuthRequest, res, next) => {
  try {
    const projectId = getParam(req, 'id');
    const { name, description } = projectSchema.parse(req.body);

    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: req.userId },
    });

    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: { name, description },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/projects/:id
projectsRouter.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const projectId = getParam(req, 'id');
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: req.userId },
    });

    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    await prisma.project.delete({ where: { id: projectId } });
    res.json({ message: 'Project deleted' });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/projects/:id/envs
projectsRouter.get('/:id/envs', async (req: AuthRequest, res, next) => {
  try {
    const projectId = getParam(req, 'id');
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: req.userId },
      include: { envs: true },
    });

    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    res.json(project.envs);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/projects/:id/envs
projectsRouter.post('/:id/envs', async (req: AuthRequest, res, next) => {
  try {
    const projectId = getParam(req, 'id');
    const { name } = envSchema.parse(req.body);

    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: req.userId },
    });

    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    const env = await prisma.env.create({
      data: { projectId, name },
    });

    res.status(201).json(env);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/projects/:id/envs/:env
projectsRouter.delete('/:id/envs/:env', async (req: AuthRequest, res, next) => {
  try {
    const projectId = getParam(req, 'id');
    const envName = getParam(req, 'env');
    const env = await prisma.env.findFirst({
      where: {
        name: envName,
        project: { id: projectId, userId: req.userId },
      },
    });

    if (!env) {
      throw new AppError(404, 'Environment not found');
    }

    await prisma.env.delete({ where: { id: env.id } });
    res.json({ message: 'Environment deleted' });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/projects/:id/envs/:env
projectsRouter.get('/:id/envs/:env', async (req: AuthRequest, res, next) => {
  try {
    const projectId = getParam(req, 'id');
    const envName = getParam(req, 'env');
    const env = await prisma.env.findFirst({
      where: {
        name: envName,
        project: { id: projectId, userId: req.userId },
      },
      include: { variables: { orderBy: { key: 'asc' } } },
    });

    if (!env) {
      throw new AppError(404, 'Environment not found');
    }

    const variables = env.variables.map((v: any) => ({
      id: v.id,
      key: v.key,
      value: v.isSecret ? null : v.value,
      isSecret: v.isSecret,
      isRequired: v.isRequired,
      description: v.description,
    }));

    res.json(variables);
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/projects/:id/envs/:env
projectsRouter.put('/:id/envs/:env', async (req: AuthRequest, res, next) => {
  try {
    const projectId = getParam(req, 'id');
    const envName = getParam(req, 'env');
    const env = await prisma.env.findFirst({
      where: {
        name: envName,
        project: { id: projectId, userId: req.userId },
      },
    });

    if (!env) {
      throw new AppError(404, 'Environment not found');
    }

    const variables = z.array(variableSchema).parse(req.body);

    const newKeys = new Set(variables.map(v => v.key));
    await prisma.variable.deleteMany({
      where: { envId: env.id, key: { notIn: [...newKeys] } },
    });

    const results = [];
    for (const v of variables) {
      const existing = await prisma.variable.findUnique({
        where: { envId_key: { envId: env.id, key: v.key } },
      });

      let valueEncrypted = existing?.valueEncrypted;
      let value = v.value;

      if (v.isSecret && v.value) {
        valueEncrypted = encryptVariable(v.value);
        value = undefined;
      }

      const action = existing ? 'UPDATE' : 'CREATE';
      const variable = await prisma.variable.upsert({
        where: { envId_key: { envId: env.id, key: v.key } },
        create: {
          envId: env.id,
          key: v.key,
          value,
          valueEncrypted,
          isSecret: v.isSecret,
          isRequired: v.isRequired,
          description: v.description,
        },
        update: {
          value,
          valueEncrypted,
          isSecret: v.isSecret,
          isRequired: v.isRequired,
          description: v.description,
        },
      });

      await createAuditLog(env.id, action, v.key, req.userId!);
      results.push(variable);
    }

    res.json(results);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/projects/:id/envs/:env/export
projectsRouter.get('/:id/envs/:env/export', async (req: AuthRequest, res, next) => {
  try {
    const projectId = getParam(req, 'id');
    const envName = getParam(req, 'env');
    const format = (req.query.format as string) || 'env';

    const env = await prisma.env.findFirst({
      where: {
        name: envName,
        project: { id: projectId, userId: req.userId },
      },
      include: { variables: { orderBy: { key: 'asc' } } },
    });

    if (!env) {
      throw new AppError(404, 'Environment not found');
    }

    const variables = await Promise.all(
      env.variables.map(async (v: any) => ({
        key: v.key,
        value: v.isSecret && v.valueEncrypted
          ? decryptVariable(v.valueEncrypted)
          : v.value || '',
      }))
    );

    let output = '';
    switch (format) {
      case 'env':
        output = variables.map(v => `${v.key}=${v.value}`).join('\n');
        break;
      case 'json':
        output = JSON.stringify(Object.fromEntries(variables.map(v => [v.key, v.value])), null, 2);
        break;
      case 'shell':
        output = variables.map(v => `export ${v.key}="${v.value}"`).join('\n');
        break;
      default:
        throw new AppError(400, 'Invalid format. Use: env, json, shell');
    }

    res.setHeader('Content-Type', format === 'json' ? 'application/json' : 'text/plain');
    res.send(output);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/projects/:id/envs/:env/diff/:env2
projectsRouter.get('/:id/envs/:env/diff/:env2', async (req: AuthRequest, res, next) => {
  try {
    const projectId = getParam(req, 'id');
    const env1Name = getParam(req, 'env');
    const env2Name = getParam(req, 'env2');
    const [env1, env2] = await Promise.all([
      prisma.env.findFirst({
        where: { name: env1Name, project: { id: projectId, userId: req.userId } },
        include: { variables: true },
      }),
      prisma.env.findFirst({
        where: { name: env2Name, project: { id: projectId, userId: req.userId } },
        include: { variables: true },
      }),
    ]);

    if (!env1 || !env2) {
      throw new AppError(404, 'One or both environments not found');
    }

    const vars1 = new Map(env1.variables.map((v: any) => [v.key, v]));
    const vars2 = new Map(env2.variables.map((v: any) => [v.key, v]));

    const allKeys = new Set([...vars1.keys(), ...vars2.keys()]);
    const diff = [];

    for (const key of allKeys) {
      const v1 = vars1.get(key);
      const v2 = vars2.get(key);

      if (!v1) {
        diff.push({ key, status: 'added', env1: undefined, env2: v2.value || '[secret]' });
      } else if (!v2) {
        diff.push({ key, status: 'removed', env1: v1.value || '[secret]', env2: undefined });
      } else if (v1.value !== v2.value || v1.valueEncrypted !== v2.valueEncrypted) {
        diff.push({ key, status: 'modified', env1: v1.value || '[secret]', env2: v2.value || '[secret]' });
      } else {
        diff.push({ key, status: 'unchanged', env1: v1.value || '[secret]', env2: v2.value || '[secret]' });
      }
    }

    res.json(diff);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/projects/:id/envs/:env/import
projectsRouter.post('/:id/envs/:env/import', async (req: AuthRequest, res, next) => {
  try {
    const projectId = getParam(req, 'id');
    const envName = getParam(req, 'env');
    const { content } = z.object({ content: z.string() }).parse(req.body);

    const env = await prisma.env.findFirst({
      where: {
        name: envName,
        project: { id: projectId, userId: req.userId },
      },
    });

    if (!env) {
      throw new AppError(404, 'Environment not found');
    }

    const variables: Array<{ key: string; value: string }> = [];
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [key, ...rest] = trimmed.split('=');
      const value = rest.join('=').replace(/^["']|["']$/g, '');
      if (key && value) {
        variables.push({ key: key.trim(), value });
      }
    }

    for (const v of variables) {
      await prisma.variable.upsert({
        where: { envId_key: { envId: env.id, key: v.key } },
        create: {
          envId: env.id,
          key: v.key,
          value: v.value,
          isSecret: false,
        },
        update: { value: v.value },
      });
      await createAuditLog(env.id, 'IMPORT', v.key, req.userId!);
    }

    res.json({ imported: variables.length });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/projects/:id/envs/:env/history
projectsRouter.get('/:id/envs/:env/history', async (req: AuthRequest, res, next) => {
  try {
    const projectId = getParam(req, 'id');
    const envName = getParam(req, 'env');
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

    if (!env) {
      throw new AppError(404, 'Environment not found');
    }

    res.json(env.auditLogs);
  } catch (error) {
    next(error);
  }
});

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || `project-${Date.now()}`;
}
