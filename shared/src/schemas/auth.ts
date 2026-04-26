/**
 * Authentication schemas
 * @module shared/schemas/auth
 * @description Zod schemas and TS types for authentication requests/responses.
 */
import { z } from 'zod';

/**
 * Request body for user registration.
 */
export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

/**
 * Request body for user login.
 */
export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

/**
 * Authenticated user payload returned by the API.
 */
export const AuthUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
});

/**
 * Response body for login endpoint.
 */
export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  user: AuthUserSchema,
});

/**
 * Response body for refresh endpoint.
 */
export const RefreshResponseSchema = z.object({
  accessToken: z.string(),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type AuthUser = z.infer<typeof AuthUserSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type RefreshResponse = z.infer<typeof RefreshResponseSchema>;
