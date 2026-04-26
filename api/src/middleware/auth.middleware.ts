/**
 * Authentication middleware
 * @module api/middleware/auth.middleware
 * @description Express middleware to authenticate requests via Bearer JWT access tokens.
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';
import { getConfig } from '../config';

const config = getConfig();

export interface AuthRequest extends Request {
  userId?: string;
}

/**
 * Authenticate request using `Authorization: Bearer <token>`.
 * On success, attaches `userId` to the request.
 */
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    throw new AppError(401, 'Authentication required');
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch {
    throw new AppError(401, 'Invalid or expired token');
  }
};
