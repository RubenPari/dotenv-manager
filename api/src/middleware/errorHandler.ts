/**
 * Error handling middleware
 * @module api/middleware/errorHandler
 * @description Centralized error types and Express error handler implementation.
 */
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

function isDatabaseUnavailableError(err: Error): boolean {
  // Prisma initialization errors (connection issues at startup/runtime)
  if (err.name === 'PrismaClientInitializationError') return true;
  // Prisma known request errors for connection failures
  if (err.name === 'PrismaClientKnownRequestError') {
    const code = (err as Error & { code?: string }).code;
    if (code === 'P1001' || code === 'P1003') return true;
  }
  const msg = err.message ?? '';
  return msg.includes("Can't reach database server") || msg.includes('ECONNREFUSED');
}

/**
 * Application error with an HTTP status code.
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Express error handler.
 * @param err - The thrown error.
 * @param req - The request object.
 * @param res - The response object.
 * @param _next - The next function (unused; Express recognizes this as an error handler).
 */
export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation error',
      details: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  if (isDatabaseUnavailableError(err)) {
    logger.error('Database unavailable:', err);
    res.status(503).json({
      error: 'Database unavailable',
      hint: 'Start Postgres (docker compose up -d) and ensure DATABASE_URL points to it.',
    });
    return;
  }

  logger.error('Unexpected error:', err);
  res.status(500).json({ error: 'Internal server error' });
};
