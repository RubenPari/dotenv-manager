/**
 * Authentication cookies
 * @module api/utils/authCookies
 * @description Helpers for setting authentication-related cookies.
 */
import { Response } from 'express';
import { getConfig } from '../config';

const config = getConfig();
const REFRESH_TOKEN_COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Set the refresh token cookie
 * @param res - The response object
 * @param token - The refresh token
 */
export function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE_MS,
  });
}

