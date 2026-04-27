import request from 'supertest';
import { describe, expect, it } from '@jest/globals';
import { createApp } from './app';

describe('API validation', () => {
  it('returns 400 on invalid login payload (zod)', async () => {
    const app = createApp();

    const res = await request(app).post('/api/v1/auth/login').send({});

    expect(res.status).toBe(400);
    expect(res.body?.error).toBe('Validation error');
  });
});

