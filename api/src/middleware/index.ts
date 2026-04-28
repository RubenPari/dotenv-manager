/**
 * Middleware barrel
 * @module api/middleware/index
 * @description Re-exports all middleware modules.
 */
export { errorHandler, AppError } from './errorHandler';
export { authMiddleware, type AuthRequest } from './auth.middleware';
