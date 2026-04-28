/**
 * API server startup
 * @module api/server
 * @description Starts the HTTP server (separated from app creation for testability).
 */
import type { Server } from 'http';
import { createApp } from './app';
import { getConfig } from './config';
import { logger } from './utils/logger';

export function startServer(): Server {
  const app = createApp();
  const config = getConfig();

  return app.listen(config.PORT, () => {
    logger.info(`API server running on port ${config.PORT}`);
  });
}
