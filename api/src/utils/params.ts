/**
 * Route params utilities
 * @module api/utils/params
 * @description Helpers to safely normalize values coming from `req.params`.
 */
import { AppError } from '../middleware/errorHandler';

/**
 * Normalize an Express route param to a non-empty string.
 * @param value - The raw route param value (string, string[] or undefined).
 * @returns The normalized string value.
 * @throws {AppError} 400 if the param is missing or empty.
 */
export function getParam(value: string | string[] | undefined): string {
  const normalized = Array.isArray(value) ? value[0] : value;
  if (!normalized || normalized.trim().length === 0) {
    throw new AppError(400, 'Missing route parameter');
  }
  return normalized;
}
