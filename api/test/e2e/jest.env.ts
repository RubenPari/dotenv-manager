process.env.NODE_ENV ??= 'test';

// Required by api/src/config.ts
process.env.JWT_SECRET ??= 'test-jwt-secret';
process.env.REFRESH_TOKEN_SECRET ??= 'test-refresh-secret';

// Optional by api/src/config.ts (but keep stable)
process.env.CLIENT_URL ??= 'http://localhost:4200';

// Prisma
process.env.DATABASE_URL ??=
  'postgresql://dotenv_user:dotenv_password@localhost:5432/dotenv_manager_test?schema=public';

