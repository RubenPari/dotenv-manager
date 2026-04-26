import { Router } from 'express';
import { register, login, logout, refresh } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { rateLimit } from 'express-rate-limit';
import { getConfig } from '../config';

const config = getConfig();

const authLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX,
  message: 'Too many authentication attempts, please try again later.',
});

export const authRouter = Router();

authRouter.post('/register', authLimiter, register);
authRouter.post('/login', authLimiter, login);
authRouter.post('/logout', authMiddleware, logout);
authRouter.post('/refresh', refresh);
