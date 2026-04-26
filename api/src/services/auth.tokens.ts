import jwt, { type SignOptions } from 'jsonwebtoken';
import prisma from '../prisma/client';
import { getConfig } from '../config';

const config = getConfig();

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Get the refresh token TTL in milliseconds
 * @returns The refresh token TTL in milliseconds
 */
export function refreshTokenTtlMs() {
  return REFRESH_TOKEN_TTL_MS;
}

/**
 * Generate an access token
 * @param userId - The user ID
 * @returns The access token
 */
export function generateAccessToken(userId: string): string {
  const options: SignOptions = { expiresIn: config.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign({ userId }, config.JWT_SECRET, options);
}

/**
 * Generate a refresh token
 * @param userId - The user ID
 * @returns The refresh token
 */
export function generateRefreshToken(userId: string): string {
  const options: SignOptions = { expiresIn: '30d' };
  return jwt.sign({ userId }, config.REFRESH_TOKEN_SECRET, options);
}

/**
 * Persist a refresh token
 * @param params - The parameters object
 * @param params.userId - The user ID
 * @param params.refreshToken - The refresh token
 */
export async function persistRefreshToken(params: { userId: string; refreshToken: string }) {
  await prisma.refreshToken.create({
    data: {
      userId: params.userId,
      token: params.refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });
}

