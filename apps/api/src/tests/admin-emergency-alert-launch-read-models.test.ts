import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';

import {
  createEmergencyAlert,
  getEmergencyAlert,
  listEmergencyAlerts,
  updateEmergencyAlert,
} from '../controllers/adminEmergencyAlerts';
import { errorHandler } from '../middleware/errorHandler';

const scopeMocks = vi.hoisted(() => ({
  resolveAdminScope: vi.fn(),
}));

const supabaseState = vi.hoisted(() => ({
  tables: {} as Record<string, Record<string, any>[]>,
}));

function createQueryBuilder(table: string) {
  const filters: Array<(row: Record<string, any>) => boolean> = [];
  const sortRules: Array<{ column: string; ascending: boolean }> = [];
  let limitValue: number | null = null;
  let operation: 'read' | 'insert' | 'update' | 'delete' = 'read';
  let insertRows: Record<string, any>[] = [];
  let updatePayload: Record<string, any> | null = null;

  const getRows = () => [...(supabaseState.tables[table] || [])];
  const setRows = (rows: Record<string, any>[]) => {
    supabaseState.tables[table] = rows;
  };

  const applyFilters = (rows: Record<string, any>[]) => rows.filter((row) => filters.every((filter) => filter(row)));

  const applySorts = (rows: Record<string, any>[]) => {
    if (!sortRules.length) return rows;

    return [...rows].sort((left, right) => {
      for (const rule of sortRules) {
        const leftValue = left[rule.column];
        const rightValue = right[rule.column];

        if (leftValue === rightValue) continue;
        if (leftValue === undefined || leftValue === null) return 1;
        if (rightValue === undefined || rightValue === null) return -1;

        const comparison = leftValue < rightValue ? -1 : 1;
        return rule.ascending ? comparison : comparison * -1;
      }

      return 0;
    });
  };

  const applyLimit = (rows: Record<string, any>[]) => {
    if (limitValue === null) return rows;
    return rows.slice(0, limitValue);
  };

  const execute = () => {
    if (operation === 'insert') {
      const currentRows = getRows();
      const nextRows = [...currentRows, ...insertRows];
      setRows(nextRows);
      return { data: insertRows, error: null };
    }

    if (operation === 'update') {
      const currentRows = getRows();
      const updatedRows: Record<string, any>[] = [];
      const nextRows = currentRows.map((row) => {
        if (!filters.every((filter) => filter(row))) return row;
        const updated = { ...row, ...(updatePayload || {}) };
        updatedRows.push(updated);
        return updated;
      });
      setRows(nextRows);
      return { data: updatedRows, error: null };
    }

    if (operation === 'delete') {
      const currentRows = getRows();
      const nextRows = currentRows.filter((row) => !filters.every((filter) => filter(row)));
      setRows(nextRows);
      return { data: [], error: null };
    }

    return { data: applyLimit(applySorts(applyFilters(getRows()))), error: null };
  };

  const builder: any = {
    select() {
      return builder;
    },
    eq(column: string, value: unknown) {
      filters.push((row) => row[column] === value);
      return builder;
    },
    in(column: string, values: unknown[]) {
      filters.push((row) => values.includes(row[column]));
      return builder;
    },
    order(column: string, options?: { ascending?: boolean }) {
      sortRules.push({ column, ascending: options?.ascending ?? true });
      return builder;
    },
    limit(value: number) {
      limitValue = value;
      return builder;
    },
    insert(payload: Record<string, unknown> | Record<string, unknown>[]) {
      const currentCount = (supabaseState.tables[table] || []).length;
      insertRows = (Array.isArray(payload) ? payload : [payload]).map((entry, index) => ({
        id: typeof entry.id === 'string' ? entry.id : `${table}-${currentCount + index + 1}`,
        created_at: entry.created_at || '2026-03-13T10:00:00.000Z',
        updated_at: entry.updated_at || '2026-03-13T10:00:00.000Z',
        ...entry,
      })) as Record<string, any>[];
      operation = 'insert';
      return builder;
    },
    update(payload: Record<string, unknown>) {
      updatePayload = {
        ...payload,
        updated_at: (payload as Record<string, unknown>).updated_at || '2026-03-13T11:00:00.000Z',
      } as Record<string, any>;
      operation = 'update';
      return builder;
    },
    delete() {
      operation = 'delete';
      return builder;
    },
    maybeSingle() {
      const result = execute();
      const row = Array.isArray(result.data) ? result.data[0] || null : null;
      return Promise.resolve({ data: row, error: result.error });
    },
    single() {
      const result = execute();
      const row = Array.isArray(result.data) ? result.data[0] || null : null;
      return Promise.resolve({
        data: row,
        error: row ? result.error : { code: 'PGRST116' },
      });
    },
    then(resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) {
      return Promise.resolve(execute()).then(resolve, reject);
    },
  };

  return builder;
}

vi.mock('../lib/supabase', () => {
  const client = {
    from: (table: string) => createQueryBuilder(table),
  };

  return {
    supabase: client,
    adminSupabase: client,
    createPublicClient: vi.fn(() => client),
    default: client,
  };
});

vi.mock('../services/adminScope', () => ({
  resolveAdminScope: scopeMocks.resolveAdminScope,
  canAccessCommunity: (scope: { isGlobal: boolean; communityIds: string[] }, communityId: string) =>
    scope.isGlobal || scope.communityIds.includes(communityId),
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
      role: 'facility_manager',
      community_id: 'community-1',
      email: 'manager@example.com',
    },
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
  method: 'get' | 'patch',
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

describe('Admin emergency alert launch read models', () => {
  let adminRoutes: Awaited<typeof import('../routes/admin')>['default'];

  beforeAll(async () => {
    ({ default: adminRoutes } = await import('../routes/admin'));
  });

  beforeEach(() => {
    vi.clearAllMocks();
    supabaseState.tables = {};
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'facility_manager',
      profileId: 'profile-admin',
      email: 'manager@example.com',
      isGlobal: false,
      communityIds: ['community-1'],
      agencyIds: [],
    });
  });

  it('returns scoped emergency alerts with community, unit, and profile enrichment', async () => {
    supabaseState.tables = {
      emergency_alerts: [
        {
          id: 'alert-1',
          title: 'Smoke in Block A',
          description: 'Smoke detected in the hallway.',
          alert_type: 'fire',
          priority: 'high',
          status: 'active',
          community_id: 'community-1',
          unit_id: 'unit-1',
          user_id: 'profile-reporter',
          resolved_by: null,
          resolved_at: null,
          created_at: '2026-03-13T08:00:00.000Z',
          updated_at: '2026-03-13T08:05:00.000Z',
        },
        {
          id: 'alert-2',
          title: 'Outside scope',
          description: 'Should not be visible',
          alert_type: 'security',
          priority: 'medium',
          status: 'pending',
          community_id: 'community-2',
          unit_id: 'unit-2',
          user_id: 'profile-outside',
          resolved_by: null,
          resolved_at: null,
          created_at: '2026-03-13T09:00:00.000Z',
          updated_at: '2026-03-13T09:00:00.000Z',
        },
      ],
      profiles: [
        {
          id: 'profile-reporter',
          first_name: 'Ama',
          last_name: 'Mensah',
          email: 'ama@example.com',
          phone: '0240000000',
          avatar_url: null,
          user_id: 'resident-user-1',
          community_id: 'community-1',
        },
        {
          id: 'profile-outside',
          first_name: 'Outside',
          last_name: 'Resident',
          email: 'outside@example.com',
          phone: '0240000001',
          avatar_url: null,
          user_id: 'resident-user-2',
          community_id: 'community-2',
        },
      ],
      communities: [
        { id: 'community-1', name: 'Palm Estate' },
        { id: 'community-2', name: 'Outside Estate' },
      ],
      units: [
        { id: 'unit-1', community_id: 'community-1', block: 'A', number: '12', unit_number: 'A-12' },
        { id: 'unit-2', community_id: 'community-2', block: 'B', number: '4', unit_number: 'B-4' },
      ],
    };

    const req = createMockRequest();
    const { res } = await runController(listEmergencyAlerts, req);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      data: [
        expect.objectContaining({
          id: 'alert-1',
          communities: expect.objectContaining({ id: 'community-1', name: 'Palm Estate' }),
          units: expect.objectContaining({ id: 'unit-1', block: 'A', number: '12' }),
          user_profile: expect.objectContaining({ id: 'profile-reporter', first_name: 'Ama', last_name: 'Mensah' }),
        }),
      ],
    });
  });

  it('returns a truthful empty state when a scoped admin has no communities', async () => {
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'facility_manager',
      profileId: 'profile-admin',
      email: 'manager@example.com',
      isGlobal: false,
      communityIds: [],
      agencyIds: [],
    });

    const req = createMockRequest();
    const { res } = await runController(listEmergencyAlerts, req);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ data: [] });
  });

  it('denies emergency alert detail access outside the scoped community set', async () => {
    supabaseState.tables = {
      emergency_alerts: [
        {
          id: 'alert-outside',
          title: 'Outside scope',
          description: 'Should not be visible',
          alert_type: 'security',
          priority: 'medium',
          status: 'pending',
          community_id: 'community-2',
          unit_id: 'unit-2',
          user_id: 'profile-outside',
          resolved_by: null,
          resolved_at: null,
          created_at: '2026-03-13T09:00:00.000Z',
          updated_at: '2026-03-13T09:00:00.000Z',
        },
      ],
      profiles: [
        {
          id: 'profile-outside',
          first_name: 'Outside',
          last_name: 'Resident',
          email: 'outside@example.com',
          phone: '0240000001',
          avatar_url: null,
          user_id: 'resident-user-2',
          community_id: 'community-2',
        },
      ],
      communities: [{ id: 'community-2', name: 'Outside Estate' }],
      units: [{ id: 'unit-2', community_id: 'community-2', block: 'B', number: '4', unit_number: 'B-4' }],
    };

    const req = createMockRequest({ params: { id: 'alert-outside' } });
    const { res } = await runController(getEmergencyAlert, req);

    expect(res.statusCode).toBe(403);
    expect(res.body).toMatchObject({
      error: expect.objectContaining({
        code: 'EMERGENCY_ALERT_SCOPE_VIOLATION',
      }),
    });
  });

  it('creates scoped alerts and stamps resolution server-side on update', async () => {
    supabaseState.tables = {
      emergency_alerts: [
        {
          id: 'alert-1',
          title: 'Smoke in Block A',
          description: 'Smoke detected in the hallway.',
          alert_type: 'fire',
          priority: 'high',
          status: 'active',
          community_id: 'community-1',
          unit_id: null,
          user_id: 'profile-admin',
          resolved_by: null,
          resolved_at: null,
          created_at: '2026-03-13T08:00:00.000Z',
          updated_at: '2026-03-13T08:05:00.000Z',
        },
      ],
      profiles: [
        {
          id: 'profile-admin',
          first_name: 'Admin',
          last_name: 'Manager',
          email: 'manager@example.com',
          phone: '0240000009',
          avatar_url: null,
          user_id: 'auth-admin',
          community_id: 'community-1',
        },
      ],
      communities: [{ id: 'community-1', name: 'Palm Estate' }],
      units: [],
    };

    const createReq = createMockRequest({
      method: 'POST',
      body: {
        title: 'Medical response needed',
        description: 'Resident requested urgent assistance.',
        alert_type: 'medical',
        priority: 'critical',
      },
    });

    const { res: createRes } = await runController(createEmergencyAlert, createReq);

    expect(createRes.statusCode).toBe(201);
    expect(createRes.body).toMatchObject({
      data: expect.objectContaining({
        title: 'Medical response needed',
        community_id: 'community-1',
        user_id: 'profile-admin',
        priority: 'critical',
        status: 'active',
        resolved_at: null,
        resolved_by: null,
      }),
    });

    const updateReq = createMockRequest({
      method: 'PATCH',
      params: { id: 'alert-1' },
      body: { status: 'resolved' },
    });

    const { res: updateRes } = await runController(updateEmergencyAlert, updateReq);

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body).toMatchObject({
      data: expect.objectContaining({
        id: 'alert-1',
        status: 'resolved',
        resolved_by: 'profile-admin',
      }),
    });
    expect((supabaseState.tables.emergency_alerts || []).find((row) => row.id === 'alert-1')).toMatchObject({
      status: 'resolved',
      resolved_by: 'profile-admin',
    });
  });

  it('rejects malformed emergency alert list and update payloads at validation time', async () => {
    const validateList = findRouteHandler(adminRoutes, '/emergency-alerts', 'get', 2);
    const listRes = await runValidationMiddleware(
      validateList,
      createMockRequest({
        query: { status: 'closed', limit: '0' },
      })
    );

    expect(listRes.statusCode).toBe(400);
    expect(listRes.body).toMatchObject({
      error: expect.objectContaining({
        code: 'VALIDATION_ERROR',
      }),
    });

    const validateUpdate = findRouteHandler(adminRoutes, '/emergency-alerts/:id', 'patch', 2);
    const updateRes = await runValidationMiddleware(
      validateUpdate,
      createMockRequest({
        method: 'PATCH',
        params: { id: 'alert-1' },
        body: { priority: 'urgent' },
      })
    );

    expect(updateRes.statusCode).toBe(400);
    expect(updateRes.body).toMatchObject({
      error: expect.objectContaining({
        code: 'VALIDATION_ERROR',
      }),
    });
  });
});
