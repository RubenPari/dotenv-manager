/**
 * Authentication controller
 * @module controllers/auth.controller
 * @description Contains the authentication controller functions
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import { AppError } from '../middleware/errorHandler';
import { getConfig } from '../config';
import { LoginRequestSchema, RegisterRequestSchema } from '@dotenv-manager/shared';

const config = getConfig();

/**
 * Register a new user
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 * @returns The access token and the user object
 * @throws {AppError} If the email is already registered
 */
const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = RegisterRequestSchema.parse(req.body);

    // Check if the email is already registered
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError(409, 'Email already registered');
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash },
    });

    // Generate access and refresh tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Create the refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    setRefreshTokenCookie(res, refreshToken);

    res.status(201).json({
      accessToken,
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login a user
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 * @returns The access token and the user object
 * @throws {AppError} If the email is invalid or the password is incorrect
 */
const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = LoginRequestSchema.parse(req.body);

    // Check if the user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError(401, 'Invalid credentials');
    }

    // Check if the password is valid
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid credentials');
    }

    // Generate access and refresh tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Create the refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    setRefreshTokenCookie(res, refreshToken);

    res.json({
      accessToken,
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout a user
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 * @returns A message indicating that the user has been logged out
 * @throws {AppError} If the refresh token is not found
 */
const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.refreshToken;
    // Delete the refresh token
    if (token) {
      await prisma.refreshToken.delete({ where: { token } });
    }

    // Clear the refresh token cookie
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh a user's access token
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 * @returns The new access token
 * @throws {AppError} If the refresh token is not found or is invalid
 */
const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.refreshToken;
    // Check if the refresh token is found
    if (!token) {
      throw new AppError(401, 'Refresh token not found');
    }

    // Check if the refresh token is valid
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    // Check if the refresh token is expired
    if (!storedToken || storedToken.expiresAt < new Date()) {
      if (storedToken) {
        await prisma.refreshToken.delete({ where: { token } });
      }
      throw new AppError(401, 'Invalid or expired refresh token');
    }

    const decoded = jwt.verify(token, config.REFRESH_TOKEN_SECRET) as { userId: string };

    await prisma.refreshToken.delete({ where: { token } });

    // Generate a new access token and refresh token
    const newAccessToken = generateAccessToken(decoded.userId);
    const newRefreshToken = generateRefreshToken(decoded.userId);

    // Create the new refresh token
    await prisma.refreshToken.create({
      data: {
        userId: decoded.userId,
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    setRefreshTokenCookie(res, newRefreshToken);

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate an access token
 * @param userId - The user ID
 * @returns The access token
 */
const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

/**
 * Generate a refresh token
 * @param userId - The user ID
 * @returns The refresh token
 */
const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, config.REFRESH_TOKEN_SECRET, {
    expiresIn: '30d',
  } as jwt.SignOptions);
}

/**
 * Set the refresh token cookie
 * @param res - The response object
 * @param token - The refresh token
 */
const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

export { register, login, logout, refresh };