import { z } from 'zod';

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const AuthUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
});

export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  user: AuthUserSchema,
});

export const RefreshResponseSchema = z.object({
  accessToken: z.string(),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type AuthUser = z.infer<typeof AuthUserSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type RefreshResponse = z.infer<typeof RefreshResponseSchema>;

