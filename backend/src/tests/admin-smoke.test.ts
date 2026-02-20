import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';

describe('Admin smoke tests', () => {
  let app: typeof import('../app').default;

  beforeAll(async () => {
    process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY =
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key';
    ({ default: app } = await import('../app'));
  });

  it('rejects unauthenticated admin access', async () => {
    const res = await request(app).get('/admin/users');
    expect(res.status).toBe(401);
  });

  it('rejects unauthenticated onboarding review access', async () => {
    const res = await request(app).get('/admin/onboarding-requests');
    expect(res.status).toBe(401);
  });
});
