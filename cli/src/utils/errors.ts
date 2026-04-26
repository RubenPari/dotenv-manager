import { AxiosError } from 'axios';

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object') {
    const axiosErr = error as AxiosError<{ error?: string }>;
    const apiMsg = axiosErr.response?.data?.error;
    if (apiMsg) return apiMsg;
  }

  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

