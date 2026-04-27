import request from 'supertest';
import { describe, expect, it, afterAll } from '@jest/globals';
import { createApp } from '../../src/app';
import prisma from '../../src/prisma/client';

describe('auth e2e', () => {
  const app = createApp();

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('registers and logs in a user', async () => {
    const email = `e2e_${Date.now()}@example.com`;
    const password = 'password123';

    const registerRes = await request(app).post('/api/v1/auth/register').send({ email, password });
    expect(registerRes.status).toBe(201);
    expect(registerRes.body?.accessToken).toEqual(expect.any(String));
    expect(registerRes.body?.user?.email).toBe(email);

    const loginRes = await request(app).post('/api/v1/auth/login').send({ email, password });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body?.accessToken).toEqual(expect.any(String));
    expect(loginRes.body?.user?.email).toBe(email);
  });
});

