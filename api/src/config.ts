/**
 * API configuration
 * @module api/config
 * @description Validates and exposes runtime configuration derived from environment variables.
 */
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  CLIENT_URL: z.string().default('http://localhost:4200'),

  JWT_SECRET: z.string().min(1),
  REFRESH_TOKEN_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().default('15m'),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),

  MASTER_KEY_PEPPER: z.string().min(16).optional(),
  MASTER_KEY_SALT: z.string().optional(),
});

type Env = z.infer<typeof EnvSchema>;

let cached: Env | null = null;

/**
 * Get validated API configuration (cached).
 * @returns The validated configuration object.
 * @throws If required environment variables are missing or invalid.
 */
export function getConfig(): Env {
  if (cached) return cached;

  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    // Keep message concise but actionable (do not leak secrets).
    const message = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Invalid environment configuration: ${message}`);
  }

  cached = parsed.data;
  return cached;
}
