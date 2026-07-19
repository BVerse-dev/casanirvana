import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';

import { deleteSettingsAsset, uploadSettingsAsset } from '../controllers/adminSettingsAssets';
import { getSystemSettings, upsertSystemSettings } from '../controllers/systemSettings';
import { errorHandler } from '../middleware/errorHandler';

const supabaseState = vi.hoisted(() => ({
  systemSettings: [] as Record<string, any>[],
  uploaded: [] as Array<{ bucket: string; path: string; contentType?: string }>,
  removed: [] as Array<{ bucket: string; paths: string[] }>,
}));

function createSystemSettingsQueryBuilder() {
  const filters: Array<(row: Record<string, any>) => boolean> = [];
  let upsertRows: Record<string, any>[] | null = null;

  const applyFilters = (rows: Record<string, any>[]) => rows.filter((row) => filters.every((filter) => filter(row)));

  const builder: any = {
    select() {
      return builder;
    },
    eq(column: string, value: unknown) {
      filters.push((row) => row[column] === value);
      return builder;
    },
    order() {
      return builder;
    },
    upsert(payload: Record<string, unknown> | Record<string, unknown>[]) {
      upsertRows = (Array.isArray(payload) ? payload : [payload]).map((row) => ({ ...row })) as Record<string, any>[];

      supabaseState.systemSettings = upsertRows.reduce<Record<string, any>[]>((rows, incoming) => {
        const existingIndex = rows.findIndex(
          (row) =>
            row.category === incoming.category &&
            row.subcategory === incoming.subcategory &&
            row.key === incoming.key
        );

        if (existingIndex >= 0) {
          const nextRows = [...rows];
          nextRows[existingIndex] = { ...nextRows[existingIndex], ...incoming };
          return nextRows;
        }

        return [...rows, incoming];
      }, supabaseState.systemSettings);

      return builder;
    },
    then(resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) {
      const data = upsertRows ? upsertRows : applyFilters(supabaseState.systemSettings);
      return Promise.resolve({ data, error: null, count: Array.isArray(data) ? data.length : 0 }).then(resolve, reject);
    },
  };

  return builder;
}

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: (table: string) => {
      if (table === 'system_settings') {
        return createSystemSettingsQueryBuilder();
      }

      throw new Error(`Unexpected table access: ${table}`);
    },
    storage: {
      from(bucket: string) {
        return {
          upload: vi.fn(async (path: string, _buffer: Buffer, options?: { contentType?: string }) => {
            supabaseState.uploaded.push({ bucket, path, contentType: options?.contentType });
            return { data: { path }, error: null };
          }),
          getPublicUrl: vi.fn((path: string) => ({
            data: { publicUrl: `https://cdn.casanirvana.test/${bucket}/${path}` },
          })),
          remove: vi.fn(async (paths: string[]) => {
            supabaseState.removed.push({ bucket, paths });
            return { error: null };
          }),
        };
      },
    },
  },
  adminSupabase: {
    from: () => createSystemSettingsQueryBuilder(),
    storage: {
      from(bucket: string) {
        return {
          upload: vi.fn(async (path: string, _buffer: Buffer, options?: { contentType?: string }) => {
            supabaseState.uploaded.push({ bucket, path, contentType: options?.contentType });
            return { data: { path }, error: null };
          }),
          getPublicUrl: vi.fn((path: string) => ({
            data: { publicUrl: `https://cdn.casanirvana.test/${bucket}/${path}` },
          })),
          remove: vi.fn(async (paths: string[]) => {
            supabaseState.removed.push({ bucket, paths });
            return { error: null };
          }),
        };
      },
    },
  },
  createPublicClient: vi.fn(),
  default: {
    from: () => createSystemSettingsQueryBuilder(),
  },
}));

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
    user: { id: 'auth-admin' },
    userProfile: {
      id: 'profile-admin',
      role: 'superadmin',
      email: 'admin@example.com',
      community_id: null,
    },
    permissions: ['manage:settings'],
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
    send(payload?: unknown) {
      this.body = payload ?? null;
      return this;
    },
  };

  return response as unknown as Response & { statusCode: number; body: unknown };
}

async function runController(
  handler: (req: Request, res: Response, next: NextFunction) => unknown | Promise<unknown>,
  req: Request
) {
  const res = createMockResponse();
  const next = vi.fn();

  await handler(req, res, next as NextFunction);

  if (next.mock.calls[0]?.[0]) {
    errorHandler(next.mock.calls[0][0], req, res, vi.fn() as NextFunction);
  }

  return { res, next };
}

function findRouteHandler(
  router: { stack?: RouteLayer[] },
  path: string,
  method: 'post' | 'delete',
  index: number
) {
  const routeLayer = router.stack?.find((layer) => layer.route?.path === path && layer.route.methods[method]);

  if (!routeLayer?.route?.stack[index]) {
    throw new Error(`Missing route middleware #${index} for ${method.toUpperCase()} ${path}`);
  }

  return routeLayer.route.stack[index].handle;
}

async function runValidationMiddleware(
  middleware: (req: Request, res: Response, next: NextFunction) => unknown | Promise<unknown>,
  req: Request
) {
  const res = createMockResponse();
  const next = vi.fn();

  await middleware(req, res, next as NextFunction);
  errorHandler(next.mock.calls[0]?.[0], req, res, vi.fn() as NextFunction);

  return res;
}

describe('Admin system settings launch read models', () => {
  let adminRoutes: Awaited<typeof import('../routes/admin')>['default'];

  beforeAll(async () => {
    ({ default: adminRoutes } = await import('../routes/admin'));
  });

  beforeEach(() => {
    vi.clearAllMocks();
    supabaseState.systemSettings = [];
    supabaseState.uploaded = [];
    supabaseState.removed = [];
  });

  it('stores system settings by category and subcategory without overwriting sibling scopes', async () => {
    await runController(
      upsertSystemSettings,
      createMockRequest({
        body: {
          category: 'application',
          subcategory: 'splash',
          settings: { splash_title: 'Casa Nirvana Splash' },
        },
      })
    );

    await runController(
      upsertSystemSettings,
      createMockRequest({
        body: {
          category: 'application',
          subcategory: 'onboarding',
          settings: { splash_title: 'Casa Nirvana Onboarding' },
        },
      })
    );

    const { res } = await runController(
      getSystemSettings,
      createMockRequest({
        query: {
          category: 'application',
          subcategory: 'splash',
        },
      })
    );

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      settings: {
        splash_title: 'Casa Nirvana Splash',
      },
    });
    expect(supabaseState.systemSettings).toHaveLength(2);
  });

  it('treats category-only reads as root settings scope', async () => {
    supabaseState.systemSettings = [
      { category: 'system', subcategory: '', key: 'debug_mode', value: 'false', data_type: 'boolean' },
      { category: 'system', subcategory: 'advanced', key: 'debug_mode', value: 'true', data_type: 'boolean' },
    ];

    const { res } = await runController(
      getSystemSettings,
      createMockRequest({
        query: { category: 'system' },
      })
    );

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      settings: {
        debug_mode: false,
      },
    });
  });

  it('uploads scoped settings assets through the backend storage contract', async () => {
    const { res } = await runController(
      uploadSettingsAsset,
      createMockRequest({
        params: { assetType: 'splash' },
        file: {
          originalname: 'hero.png',
          mimetype: 'image/png',
          buffer: Buffer.from('image'),
        } as Express.Multer.File,
      })
    );

    expect(res.statusCode).toBe(201);
    expect(res.body).toMatchObject({
      data: {
        assetType: 'splash',
        bucket: 'splash-images',
      },
    });
    expect(supabaseState.uploaded[0]?.path.startsWith('settings/splash/')).toBe(true);
  });

  it('rejects asset deletion outside the allowed settings prefix', async () => {
    const { res } = await runController(
      deleteSettingsAsset,
      createMockRequest({
        method: 'DELETE',
        params: { assetType: 'splash' },
        body: { path: 'settings/onboarding/foreign.png' },
      })
    );

    expect(res.statusCode).toBe(400);
    expect(res.body).toMatchObject({
      error: {
        code: 'SETTINGS_ASSET_PATH_INVALID',
      },
    });
  });

  it('validates settings asset route params and delete payloads', async () => {
    const uploadValidation = findRouteHandler(adminRoutes, '/system-settings/assets/:assetType', 'post', 2);
    const deleteValidation = findRouteHandler(adminRoutes, '/system-settings/assets/:assetType', 'delete', 2);

    const invalidUploadResponse = await runValidationMiddleware(
      uploadValidation,
      createMockRequest({
        method: 'POST',
        params: { assetType: 'unknown' },
        originalUrl: '/admin/system-settings/assets/unknown',
        url: '/admin/system-settings/assets/unknown',
      })
    );

    expect(invalidUploadResponse.statusCode).toBe(400);
    expect(invalidUploadResponse.body).toMatchObject({
      error: {
        code: 'VALIDATION_ERROR',
      },
    });

    const invalidDeleteResponse = await runValidationMiddleware(
      deleteValidation,
      createMockRequest({
        method: 'DELETE',
        params: { assetType: 'splash' },
        body: { path: '' },
        originalUrl: '/admin/system-settings/assets/splash',
        url: '/admin/system-settings/assets/splash',
      })
    );

    expect(invalidDeleteResponse.statusCode).toBe(400);
    expect(invalidDeleteResponse.body).toMatchObject({
      error: {
        code: 'VALIDATION_ERROR',
      },
    });
  });
});
