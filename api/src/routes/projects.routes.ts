/**
 * Projects routes
 * @module api/routes/projects.routes
 * @description Defines project, environment, and variable HTTP routes under an authenticated router.
 */
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as projectsController from '../controllers/projects.controller';
import * as envsController from '../controllers/envs.controller';
import * as varsController from '../controllers/variables.controller';

export const projectsRouter = Router();
projectsRouter.use(authMiddleware);

projectsRouter.get('/', projectsController.listProjects);
projectsRouter.post('/', projectsController.createProject);
projectsRouter.get('/:id', projectsController.getProject);
projectsRouter.put('/:id', projectsController.updateProject);
projectsRouter.delete('/:id', projectsController.deleteProject);

projectsRouter.get('/:id/envs', envsController.listEnvs);
projectsRouter.post('/:id/envs', envsController.createEnv);
projectsRouter.delete('/:id/envs/:env', envsController.deleteEnv);

projectsRouter.get('/:id/envs/:env', varsController.listEnvVariables);
projectsRouter.put('/:id/envs/:env', varsController.upsertEnvVariables);
projectsRouter.get('/:id/envs/:env/export', varsController.exportEnv);
projectsRouter.get('/:id/envs/:env/diff/:env2', varsController.diffEnvs);
projectsRouter.post('/:id/envs/:env/import', varsController.importEnv);
projectsRouter.get('/:id/envs/:env/history', varsController.envHistory);
