import { beforeAll, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import { errorHandler } from '../middleware/errorHandler';

type RouteLayer = {
  route?: {
    path: string;
    methods: Record<string, boolean>;
    stack: Array<{ handle: (req: Request, res: Response, next: NextFunction) => unknown | Promise<unknown> }>;
  };
};

function createMockRequest(overrides: Partial<Request> = {}) {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    method: 'GET',
    originalUrl: '/test',
    url: '/test',
    ...overrides,
  } as Request;
}

function createMockResponse() {
  const response = {
    statusCode: 200,
    body: null as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };

  return response as unknown as Response & { statusCode: number; body: unknown };
}

function findFirstRouteHandler(router: { stack?: RouteLayer[] }, path: string, method: 'get' | 'post' | 'put' | 'patch') {
  const routeLayer = router.stack?.find((layer) => layer.route?.path === path && layer.route.methods[method]);

  if (!routeLayer?.route?.stack.length) {
    throw new Error(`Missing route handler for ${method.toUpperCase()} ${path}`);
  }

  return routeLayer.route.stack[0].handle;
}

describe('Admin smoke tests', () => {
  let adminRoutes: Awaited<typeof import('../routes/admin')>['default'];

  beforeAll(async () => {
    process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY =
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key';
    ({ default: adminRoutes } = await import('../routes/admin'));
  });

  it('rejects unauthenticated admin access', async () => {
    const requireAuth = findFirstRouteHandler(adminRoutes as unknown as { stack?: RouteLayer[] }, '/users', 'get');
    const req = createMockRequest({
      originalUrl: '/admin/users',
      url: '/admin/users',
    });
    const res = createMockResponse();
    const next = vi.fn();

    await requireAuth(req, res, next as NextFunction);
    errorHandler(next.mock.calls[0]?.[0], req, res, vi.fn() as NextFunction);

    expect(res.statusCode).toBe(401);
    expect((res.body as any).error.code).toBe('AUTH_TOKEN_MISSING');
  });

  it('rejects unauthenticated onboarding review access', async () => {
    const requireAuth = findFirstRouteHandler(
      adminRoutes as unknown as { stack?: RouteLayer[] },
      '/onboarding-requests',
      'get'
    );
    const req = createMockRequest({
      originalUrl: '/admin/onboarding-requests',
      url: '/admin/onboarding-requests',
    });
    const res = createMockResponse();
    const next = vi.fn();

    await requireAuth(req, res, next as NextFunction);
    errorHandler(next.mock.calls[0]?.[0], req, res, vi.fn() as NextFunction);

    expect(res.statusCode).toBe(401);
    expect((res.body as any).error.code).toBe('AUTH_TOKEN_MISSING');
  });
});
