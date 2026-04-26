import { Router } from 'express';
import { register, login, logout, refresh } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { rateLimit } from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  max: parseInt(process.env.RATE_LIMIT_MAX || '10'),
  message: 'Too many authentication attempts, please try again later.',
});

export const authRouter = Router();

authRouter.post('/register', authLimiter, register);
authRouter.post('/login', authLimiter, login);
authRouter.post('/logout', authMiddleware, logout);
authRouter.post('/refresh', refresh);
