/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.e2e.test.ts'],
  setupFiles: ['<rootDir>/test/e2e/jest.env.ts'],
  globalSetup: '<rootDir>/test/e2e/globalSetup.ts',
  globalTeardown: '<rootDir>/test/e2e/globalTeardown.ts',
  clearMocks: true,
};

