/**
 * Express app factory
 * @module api/app
 * @description Creates a configured Express application without starting a server.
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth.routes';
import { projectsRouter } from './routes/projects.routes';
import { errorHandler } from './middleware/errorHandler';
import { getConfig } from './config';

export function createApp() {
  const app = express();
  const config = getConfig();

  app.use(helmet());
  app.use(
    cors({
      origin: config.CLIENT_URL,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParser());

  app.get('/api/v1/healthz', (_req, res) => {
    res.status(200).json({ ok: true });
  });

  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/projects', projectsRouter);

  app.use(errorHandler);

  return app;
}

