import { describe, expect, it, jest } from '@jest/globals';

describe('getConfig', () => {
  it('throws when required env vars are missing', async () => {
    const prev = { ...process.env };
    try {
      delete process.env.JWT_SECRET;
      delete process.env.REFRESH_TOKEN_SECRET;

      jest.resetModules();
      const { getConfig } = await import('./config');

      expect(() => getConfig()).toThrow(/Invalid environment configuration/i);
    } finally {
      process.env = prev;
    }
  });

  it('caches values until module reload', async () => {
    const prev = { ...process.env };
    try {
      process.env.JWT_SECRET = 'secret-a';
      process.env.REFRESH_TOKEN_SECRET = 'refresh-a';
      process.env.PORT = '4001';

      jest.resetModules();
      const { getConfig } = await import('./config');

      const c1 = getConfig();
      process.env.PORT = '4999';
      const c2 = getConfig();

      expect(c1.PORT).toBe(4001);
      expect(c2.PORT).toBe(4001);

      jest.resetModules();
      const { getConfig: getConfig2 } = await import('./config');
      expect(getConfig2().PORT).toBe(4999);
    } finally {
      process.env = prev;
    }
  });
});

