/**
 * Authentication service
 * @module api/services/auth.service
 * @description Contains the authentication service functions
 */
import bcrypt from 'bcryptjs';
import prisma from '../prisma/client';
import { AppError } from '../middleware/errorHandler';
import jwt from 'jsonwebtoken';
import { generateAccessToken, generateRefreshToken, persistRefreshToken } from './auth.tokens';
import { getConfig } from '../config';

const config = getConfig();

/**
 * Register a new user
 * @param params - The parameters object
 * @param params.email - The email
 * @param params.password - The password
 * @returns The access token and the refresh token and the user object
 */
export async function register(params: { email: string; password: string }) {
  const existingUser = await prisma.user.findUnique({ where: { email: params.email } });
  // Check if the user already exists
  if (existingUser) {
    throw new AppError(409, 'Email already registered');
  }

  // Hash the password
  const passwordHash = await bcrypt.hash(params.password, 12);
  
  // Create the user
  const user = await prisma.user.create({
    data: { email: params.email, passwordHash },
  });

  // Generate access and refresh tokens
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await persistRefreshToken({ userId: user.id, refreshToken });

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email },
  };
}

/**
 * Login a user
 * @param params - The parameters object
 * @param params.email - The email
 * @param params.password - The password
 * @returns The access token and the refresh token and the user object
 */
export async function login(params: { email: string; password: string }) {
  // Check if the user exists
  const user = await prisma.user.findUnique({ where: { email: params.email } });
  if (!user) {
    throw new AppError(401, 'Invalid credentials');
  }

  // Check if the password is valid
  const isPasswordValid = await bcrypt.compare(params.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError(401, 'Invalid credentials');
  }

  // Generate access and refresh tokens
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await persistRefreshToken({ userId: user.id, refreshToken });

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email },
  };
}

/**
 * Logout a user
 * @param params - The parameters object
 * @param params.refreshToken - The refresh token
 * @returns The access token and the refresh token and the user object
 */
export async function logout(params: { refreshToken?: string | null }) {
  // Check if the refresh token is found
  if (!params.refreshToken) return;
  
  // Delete the refresh token
  await prisma.refreshToken.deleteMany({ where: { token: params.refreshToken } });
}

/**
 * Refresh a user's access token
 * @param params - The parameters object
 * @param params.refreshToken - The refresh token
 * @returns The access token and the refresh token and the user object
 */
export async function refresh(params: { refreshToken?: string | null }) {
  // Check if the refresh token is found
  if (!params.refreshToken) {
    throw new AppError(401, 'Refresh token not found');
  }

  // Check if the refresh token is valid
  const token = params.refreshToken;
  // Find the refresh token
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true },
  });

  // Check if the refresh token is expired
  if (!storedToken || storedToken.expiresAt < new Date()) {
    // Delete the refresh token if it is expired
    if (storedToken) {
      await prisma.refreshToken.deleteMany({ where: { token } });
    }
    throw new AppError(401, 'Invalid or expired refresh token');
  }

  // Decode the refresh token
  let decoded: { userId: string };
  try {
    decoded = jwt.verify(token, config.REFRESH_TOKEN_SECRET) as { userId: string };
  } catch {
    await prisma.refreshToken.deleteMany({ where: { token } });
    throw new AppError(401, 'Invalid or expired refresh token');
  }

  // Delete the refresh token
  await prisma.refreshToken.deleteMany({ where: { token } });

  // Generate a new access token and refresh token
  const accessToken = generateAccessToken(decoded.userId);
  const newRefreshToken = generateRefreshToken(decoded.userId);
  await persistRefreshToken({ userId: decoded.userId, refreshToken: newRefreshToken });

  return { accessToken, refreshToken: newRefreshToken };
}
