import { describe, expect, it, jest } from '@jest/globals';

describe('cli/config', () => {
  it('readCredentials falls back to DM_API_URL when file missing', async () => {
    const prevEnv = { ...process.env };
    try {
      process.env.DM_API_URL = 'http://example.test:1234';
      jest.resetModules();

      jest.doMock('fs', () => {
        const actual = jest.requireActual('fs') as Record<string, unknown>;
        return {
          ...(actual as Record<string, unknown>),
          readFileSync: () => {
            throw new Error('missing');
          },
        };
      });

      const { readCredentials } = await import('./index');
      expect(readCredentials()).toEqual({ apiUrl: 'http://example.test:1234' });
    } finally {
      process.env = prevEnv;
      jest.dontMock('fs');
    }
  });

  it('getActiveEnv prefers flag > localConfig > default', async () => {
    const { getActiveEnv } = await import('./index');

    expect(getActiveEnv({ projectSlug: 'x', env: 'staging' }, 'prod')).toBe('prod');
    expect(getActiveEnv({ projectSlug: 'x', env: 'staging' })).toBe('staging');
    expect(getActiveEnv({ projectSlug: 'x' })).toBe('dev');
    expect(getActiveEnv(null)).toBe('dev');
  });
});

