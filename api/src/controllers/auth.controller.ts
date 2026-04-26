/**
 * Authentication controller
 * @module controllers/auth.controller
 * @description Contains the authentication controller functions
 */

import { Request, Response, NextFunction } from 'express';
import { LoginRequestSchema, RegisterRequestSchema } from '@dotenv-manager/shared';
import * as authService from '../services/auth.service';
import { setRefreshTokenCookie } from '../utils/authCookies';

/**
 * Register a new user
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 * @returns The access token and the user object
 * @throws {AppError} If the email is already registered
 */
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = RegisterRequestSchema.parse(req.body);
    
    const result = await authService.register({ email, password });
    
    setRefreshTokenCookie(res, result.refreshToken);
    
    res.status(201).json({ accessToken: result.accessToken, user: result.user });
  } catch (error) {
    next(error);
  }
}

/**
 * Login a user
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 * @returns The access token and the user object
 * @throws {AppError} If the email is invalid or the password is incorrect
 */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = LoginRequestSchema.parse(req.body);
    
    const result = await authService.login({ email, password });
    
    setRefreshTokenCookie(res, result.refreshToken);
    
    res.json({ accessToken: result.accessToken, user: result.user });
  } catch (error) {
    next(error);
  }
}

/**
 * Logout a user
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 * @returns A message indicating that the user has been logged out
 * @throws {AppError} If the refresh token is not found
 */
export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.refreshToken;
    
    await authService.logout({ refreshToken: token });

    res.clearCookie('refreshToken');
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
}

/**
 * Refresh a user's access token
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 * @returns The new access token
 * @throws {AppError} If the refresh token is not found or is invalid
 */
export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.refreshToken;
    
    const result = await authService.refresh({ refreshToken: token });
    
    setRefreshTokenCookie(res, result.refreshToken);
    
    res.json({ accessToken: result.accessToken });
  } catch (error) {
    next(error);
  }
}