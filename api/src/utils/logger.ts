/**
 * Minimal logger
 * @module api/utils/logger
 * @description Thin wrapper around console for structured logging.
 * Allows future replacement with a real logger without touching call sites.
 */

export const logger = {
  info: (message: string, ...meta: unknown[]) => {
    console.log(message, ...meta);
  },
  error: (message: string, ...meta: unknown[]) => {
    console.error(message, ...meta);
  },
  warn: (message: string, ...meta: unknown[]) => {
    console.warn(message, ...meta);
  },
};
