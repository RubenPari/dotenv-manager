/**
 * Async handler wrapper
 * @module api/utils/asyncHandler
 * @description Wraps Express route handlers to automatically catch rejected promises.
 */
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const asyncAuthHandler = (
  fn: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>,
) => {
  return asyncHandler(async (req, res, next) => {
    await fn(req as AuthRequest, res, next);
  });
};
