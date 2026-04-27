process.env.NODE_ENV ??= 'test';

// Required by api/src/config.ts
process.env.JWT_SECRET ??= 'test-jwt-secret';
process.env.REFRESH_TOKEN_SECRET ??= 'test-refresh-secret';

// Keep defaults stable in tests
process.env.CLIENT_URL ??= 'http://localhost:4200';

