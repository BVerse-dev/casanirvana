import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';

import {
  createVisitorPass,
  getVisitorPass,
  listVisitorPasses,
  updateVisitorPass,
} from '../controllers/adminVisitors';
import { errorHandler } from '../middleware/errorHandler';

const scopeMocks = vi.hoisted(() => ({
  resolveAdminScope: vi.fn(),
}));

const supabaseState = vi.hoisted(() => ({
  tables: {} as Record<string, any[]>,
  idCounter: 1,
}));

function createQueryBuilder(table: string) {
  const filters: Array<(row: Record<string, any>) => boolean> = [];
  let selectedColumns = '*';
  let operation: 'read' | 'insert' | 'update' | 'delete' = 'read';
  let insertPayload: Record<string, any>[] = [];
  let updatePayload: Record<string, any> | null = null;
  let sortColumn: string | null = null;
  let sortAscending = true;

  const getRows = () => [...(supabaseState.tables[table] || [])];
  const setRows = (rows: Record<string, any>[]) => {
    supabaseState.tables[table] = rows;
  };

  const applyFilters = (rows: Record<string, any>[]) => {
    let filtered = rows.filter((row) => filters.every((filter) => filter(row)));

    if (sortColumn) {
      filtered = [...filtered].sort((left, right) => {
        const leftValue = left[sortColumn as string];
        const rightValue = right[sortColumn as string];
        if (leftValue === rightValue) return 0;
        if (leftValue === undefined || leftValue === null) return 1;
        if (rightValue === undefined || rightValue === null) return -1;
        return sortAscending
          ? leftValue < rightValue
            ? -1
            : 1
          : leftValue > rightValue
            ? -1
            : 1;
      });
    }

    return filtered;
  };

  const execute = () => {
    if (operation === 'insert') {
      const nextRows = getRows();
      const insertedRows = insertPayload.map((row) => ({
        ...row,
        id: row.id && String(row.id).trim().length > 0 ? row.id : `visitor-${supabaseState.idCounter++}`,
      }));
      setRows([...nextRows, ...insertedRows]);
      return { data: insertedRows, error: null };
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
      const deletedRows = currentRows.filter((row) => filters.every((filter) => filter(row)));
      const nextRows = currentRows.filter((row) => !filters.every((filter) => filter(row)));
      setRows(nextRows);
      return { data: deletedRows, error: null };
    }

    return { data: applyFilters(getRows()), error: null };
  };

  const builder: any = {
    select(columns?: string) {
      selectedColumns = columns || '*';
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
      sortColumn = column;
      sortAscending = options?.ascending ?? true;
      return builder;
    },
    insert(payload: Record<string, any> | Array<Record<string, any>>) {
      operation = 'insert';
      insertPayload = Array.isArray(payload) ? payload : [payload];
      return builder;
    },
    update(payload: Record<string, any>) {
      operation = 'update';
      updatePayload = payload;
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
      const result = execute();
      return Promise.resolve({
        data: selectedColumns === '*' ? result.data : result.data,
        error: result.error,
      }).then(resolve, reject);
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
    userProfile: { id: 'profile-admin', role: 'superadmin', email: 'admin@example.com' },
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

function findRouteHandler(
  router: { stack?: RouteLayer[] },
  path: string,
  method: 'get' | 'post' | 'patch',
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

describe('Admin visitor launch read models', () => {
  let adminRoutes: Awaited<typeof import('../routes/admin')>['default'];

  beforeAll(async () => {
    ({ default: adminRoutes } = await import('../routes/admin'));
  });

  beforeEach(() => {
    vi.clearAllMocks();
    supabaseState.tables = {};
    supabaseState.idCounter = 1;
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'superadmin',
      profileId: 'profile-admin',
      email: 'admin@example.com',
      isGlobal: true,
      communityIds: [],
      agencyIds: [],
    });
  });

  it('returns scoped visitor passes with derived unit, community, agency, and actor context', async () => {
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'facility_manager',
      profileId: 'profile-admin',
      email: 'admin@example.com',
      isGlobal: false,
      communityIds: ['community-1'],
      agencyIds: ['agency-1'],
    });

    supabaseState.tables = {
      visitor_passes: [
        {
          id: 'visitor-1',
          visitor_name: 'Ama Guest',
          visitor_phone: '2330000001',
          visitor_type: 'guest',
          purpose: 'Dinner',
          status: 'approved',
          unit_id: 'unit-1',
          community_id: 'community-1',
          created_by: 'auth-admin',
          approved_by: 'auth-admin',
          from_date: '2026-03-12T09:00:00.000Z',
          to_date: '2026-03-12T18:00:00.000Z',
          visit_date: '2026-03-12',
          entry_code: 'ABCD1234',
          qr_code_data: '{"type":"visitor_pass"}',
          created_at: '2026-03-12T08:00:00.000Z',
          updated_at: '2026-03-12T08:30:00.000Z',
        },
        {
          id: 'visitor-2',
          visitor_name: 'Kojo Guest',
          visitor_phone: '2330000002',
          visitor_type: 'guest',
          purpose: 'Meeting',
          status: 'pending',
          unit_id: 'unit-2',
          community_id: 'community-2',
          created_by: 'auth-other',
          from_date: '2026-03-12T09:00:00.000Z',
          to_date: '2026-03-12T18:00:00.000Z',
          visit_date: '2026-03-12',
          entry_code: 'WXYZ9876',
          qr_code_data: '{"type":"visitor_pass"}',
          created_at: '2026-03-12T09:00:00.000Z',
          updated_at: '2026-03-12T09:00:00.000Z',
        },
      ],
      units: [
        { id: 'unit-1', block: 'A', number: '101', unit_number: 'A-101', community_id: 'community-1' },
        { id: 'unit-2', block: 'B', number: '202', unit_number: 'B-202', community_id: 'community-2' },
      ],
      communities: [
        { id: 'community-1', name: 'Palm Residences', agency_id: 'agency-1' },
        { id: 'community-2', name: 'Harbor View', agency_id: 'agency-2' },
      ],
      agencies: [
        { id: 'agency-1', name: 'Casa Agency' },
        { id: 'agency-2', name: 'Other Agency' },
      ],
      profiles: [
        {
          id: 'profile-admin',
          user_id: 'auth-admin',
          first_name: 'Admin',
          last_name: 'User',
          full_name: 'Admin User',
          email: 'admin@example.com',
          phone: '2331111111',
          avatar_url: null,
        },
      ],
      users_with_preference_stats: [
        { id: 'auth-admin', user_name: 'Admin User', email: 'admin@example.com', user_role: 'admin' },
      ],
    };

    const req = createMockRequest();
    const res = createMockResponse();
    const next = vi.fn();

    await listVisitorPasses(req, res, next as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect((res.body as any).data).toHaveLength(1);
    expect((res.body as any).data[0]).toEqual(
      expect.objectContaining({
        id: 'visitor-1',
        community_name: 'Palm Residences',
        agency_name: 'Casa Agency',
        unit_label: 'A-101',
        created_by_display: 'Admin User',
        approved_by_display: 'Admin User',
      })
    );
  });

  it('returns an empty visitor list when the scoped admin has no accessible communities', async () => {
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'facility_manager',
      profileId: 'profile-admin',
      email: 'admin@example.com',
      isGlobal: false,
      communityIds: [],
      agencyIds: [],
    });

    supabaseState.tables = {
      visitor_passes: [
        {
          id: 'visitor-1',
          visitor_name: 'Ama Guest',
          visitor_phone: '2330000001',
          unit_id: 'unit-1',
          community_id: 'community-1',
          from_date: '2026-03-12T09:00:00.000Z',
          to_date: '2026-03-12T18:00:00.000Z',
          created_at: '2026-03-12T08:00:00.000Z',
        },
      ],
    };

    const req = createMockRequest();
    const res = createMockResponse();
    const next = vi.fn();

    await listVisitorPasses(req, res, next as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect((res.body as any).data).toEqual([]);
  });

  it('denies visitor detail access outside the scoped admin community set', async () => {
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'facility_manager',
      profileId: 'profile-admin',
      email: 'admin@example.com',
      isGlobal: false,
      communityIds: ['community-1'],
      agencyIds: [],
    });

    supabaseState.tables = {
      visitor_passes: [
        {
          id: 'visitor-2',
          visitor_name: 'Kojo Guest',
          visitor_phone: '2330000002',
          unit_id: 'unit-2',
          community_id: 'community-2',
          from_date: '2026-03-12T09:00:00.000Z',
          to_date: '2026-03-12T18:00:00.000Z',
          created_at: '2026-03-12T08:00:00.000Z',
        },
      ],
    };

    const req = createMockRequest({ params: { id: 'visitor-2' } });
    const res = createMockResponse();
    const next = vi.fn();

    await getVisitorPass(req, res, next as NextFunction);
    errorHandler(next.mock.calls[0]?.[0], req, res, vi.fn() as NextFunction);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'VISITOR_SCOPE_VIOLATION',
        }),
      })
    );
  });

  it('creates scoped visitor passes with canonical actor and community fields', async () => {
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'facility_manager',
      profileId: 'profile-admin',
      email: 'admin@example.com',
      isGlobal: false,
      communityIds: ['community-1'],
      agencyIds: ['agency-1'],
    });

    supabaseState.tables = {
      visitor_passes: [],
      units: [
        { id: 'unit-1', block: 'A', number: '101', unit_number: 'A-101', community_id: 'community-1' },
      ],
      communities: [
        { id: 'community-1', name: 'Palm Residences', agency_id: 'agency-1' },
      ],
      agencies: [
        { id: 'agency-1', name: 'Casa Agency' },
      ],
      profiles: [
        {
          id: 'profile-admin',
          user_id: 'auth-admin',
          first_name: 'Admin',
          last_name: 'User',
          full_name: 'Admin User',
          email: 'admin@example.com',
          phone: '2331111111',
          avatar_url: null,
        },
      ],
      users_with_preference_stats: [
        { id: 'auth-admin', user_name: 'Admin User', email: 'admin@example.com', user_role: 'admin' },
      ],
    };

    const req = createMockRequest({
      body: {
        visitor_name: 'Ama Guest',
        visitor_phone: '2330000001',
        purpose: 'Dinner',
        visitor_type: 'guest',
        visit_date: '2026-03-12',
        from_date: '2026-03-12T09:00:00.000Z',
        to_date: '2026-03-12T18:00:00.000Z',
        unit_id: 'unit-1',
        entry_code: 'ABCD1234',
        qr_code_data: '{"type":"visitor_pass"}',
        send_gate_pass_notification: true,
      },
    });
    const res = createMockResponse();
    const next = vi.fn();

    await createVisitorPass(req, res, next as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(201);
    expect((res.body as any).data).toEqual(
      expect.objectContaining({
        community_id: 'community-1',
        created_by_display: 'Admin User',
        unit_label: 'A-101',
      })
    );
    expect(supabaseState.tables.visitor_passes).toHaveLength(1);
    expect(supabaseState.tables.visitor_passes[0]).toEqual(
      expect.objectContaining({
        created_by: 'auth-admin',
        community_id: 'community-1',
        unit_id: 'unit-1',
      })
    );
    expect(JSON.parse(supabaseState.tables.visitor_passes[0].qr_code_data)).toEqual(
      expect.objectContaining({
        created_by: 'auth-admin',
        community_id: 'community-1',
        unit_id: 'unit-1',
      })
    );
  });

  it('applies lifecycle updates through the backend instead of browser-side direct row mutation', async () => {
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'facility_manager',
      profileId: 'profile-admin',
      email: 'admin@example.com',
      isGlobal: false,
      communityIds: ['community-1'],
      agencyIds: ['agency-1'],
    });

    supabaseState.tables = {
      visitor_passes: [
        {
          id: 'visitor-1',
          visitor_name: 'Ama Guest',
          visitor_phone: '2330000001',
          status: 'pending',
          unit_id: 'unit-1',
          community_id: 'community-1',
          created_by: 'auth-admin',
          from_date: '2026-03-12T09:00:00.000Z',
          to_date: '2026-03-12T18:00:00.000Z',
          created_at: '2026-03-12T08:00:00.000Z',
          updated_at: '2026-03-12T08:00:00.000Z',
        },
      ],
      units: [
        { id: 'unit-1', block: 'A', number: '101', unit_number: 'A-101', community_id: 'community-1' },
      ],
      communities: [
        { id: 'community-1', name: 'Palm Residences', agency_id: 'agency-1' },
      ],
      agencies: [
        { id: 'agency-1', name: 'Casa Agency' },
      ],
      profiles: [
        {
          id: 'profile-admin',
          user_id: 'auth-admin',
          first_name: 'Admin',
          last_name: 'User',
          full_name: 'Admin User',
          email: 'admin@example.com',
          phone: '2331111111',
          avatar_url: null,
        },
      ],
      users_with_preference_stats: [
        { id: 'auth-admin', user_name: 'Admin User', email: 'admin@example.com', user_role: 'admin' },
      ],
    };

    const req = createMockRequest({
      params: { id: 'visitor-1' },
      body: { status: 'approved' },
    });
    const res = createMockResponse();
    const next = vi.fn();

    await updateVisitorPass(req, res, next as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect((res.body as any).data).toEqual(
      expect.objectContaining({
        status: 'approved',
        approved_by_display: 'Admin User',
      })
    );
    expect(supabaseState.tables.visitor_passes[0]).toEqual(
      expect.objectContaining({
        status: 'approved',
        approved_by: 'auth-admin',
      })
    );
  });

  it('rejects malformed admin visitor list queries through route validation', async () => {
    const validationMiddleware = findRouteHandler(adminRoutes, '/visitor-passes', 'get', 2);

    const response = await runValidationMiddleware(
      validationMiddleware,
      createMockRequest({ query: { status: 'not-a-real-status' } })
    );

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'VALIDATION_ERROR',
        }),
      })
    );
  });
});
