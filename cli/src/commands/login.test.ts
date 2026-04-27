import { describe, expect, it, jest } from '@jest/globals';

jest.mock('inquirer', () => ({
  __esModule: true,
  default: {
    prompt: jest.fn(async () => ({ email: 'a@example.com', password: 'pw' })),
  },
}));

jest.mock('chalk', () => ({
  __esModule: true,
  default: {
    green: (s: string) => s,
    red: (s: string) => s,
    bold: (s: string) => s,
  },
}));

jest.mock('ora', () => ({
  __esModule: true,
  default: () => ({
    start: () => ({
      succeed: jest.fn(),
      fail: jest.fn(),
    }),
  }),
}));

const writeCredentials = jest.fn();
jest.mock('../config', () => {
  const actual = jest.requireActual('../config') as Record<string, unknown>;
  return { ...(actual as Record<string, unknown>), writeCredentials };
});

const post = jest.fn(async () => ({ data: { accessToken: 'token-123' } }));
jest.mock('../api/client', () => ({
  getPublicClient: () => ({
    defaults: { baseURL: 'http://localhost:3000' },
    post,
  }),
}));

describe('loginAction', () => {
  it('stores credentials after successful login', async () => {
    const { loginAction } = await import('./login');

    await loginAction();

    expect(post).toHaveBeenCalled();
    expect(writeCredentials).toHaveBeenCalledWith({
      apiUrl: 'http://localhost:3000',
      accessToken: 'token-123',
    });
  });
});

