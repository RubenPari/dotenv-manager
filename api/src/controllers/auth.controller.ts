/**
 * Authentication controller
 * @module api/controllers/auth.controller
 * @description Contains the authentication controller functions
 */
import { Request, Response } from 'express';
import { LoginRequestSchema, RegisterRequestSchema } from '@dotenv-manager/shared';
import * as authService from '../services/auth.service';
import { setRefreshTokenCookie } from '../utils/authCookies';
import { asyncHandler } from '../utils/asyncHandler';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = RegisterRequestSchema.parse(req.body);

  const result = await authService.register({ email, password });

  setRefreshTokenCookie(res, result.refreshToken);

  res.status(201).json({ accessToken: result.accessToken, user: result.user });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = LoginRequestSchema.parse(req.body);

  const result = await authService.login({ email, password });

  setRefreshTokenCookie(res, result.refreshToken);

  res.json({ accessToken: result.accessToken, user: result.user });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;

  await authService.logout({ refreshToken: token });

  res.clearCookie('refreshToken');

  res.json({ message: 'Logged out successfully' });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;

  const result = await authService.refresh({ refreshToken: token });

  setRefreshTokenCookie(res, result.refreshToken);

  res.json({ accessToken: result.accessToken });
});
