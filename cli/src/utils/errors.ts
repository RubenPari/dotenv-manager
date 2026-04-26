/**
 * CLI error utilities
 * @module cli/utils/errors
 * @description Helpers for turning unknown errors into user-friendly messages.
 */
import { AxiosError } from 'axios';

/**
 * Extract a meaningful message from an unknown error.
 * Prefers API error payloads when the error is an Axios error.
 * @param error - Unknown thrown error.
 * @param fallback - Fallback message to use when nothing better is available.
 * @returns A user-facing error message.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object') {
    const axiosErr = error as AxiosError<{ error?: string }>;
    const apiMsg = axiosErr.response?.data?.error;
    if (apiMsg) return apiMsg;
  }

  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
