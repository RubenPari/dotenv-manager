/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec|test).ts'],
  setupFiles: ['<rootDir>/test/jest.env.ts'],
  clearMocks: true,
};
