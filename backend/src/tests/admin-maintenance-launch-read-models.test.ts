import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';

import {
  getMaintenanceRequest,
  listMaintenanceRequests,
  updateMaintenanceRequest,
} from '../controllers/adminMaintenanceRequests';
import { errorHandler } from '../middleware/errorHandler';

const scopeMocks = vi.hoisted(() => ({
  resolveAdminScope: vi.fn(),
}));

const supabaseState = vi.hoisted(() => ({
  tables: {} as Record<string, any[]>,
}));

function createQueryBuilder(table: string) {
  const filters: Array<(row: Record<string, any>) => boolean> = [];
  let operation: 'read' | 'update' | 'delete' = 'read';
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

    return { data: applyFilters(getRows()), error: null };
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
      sortColumn = column;
      sortAscending = options?.ascending ?? true;
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
      return Promise.resolve(result).then(resolve, reject);
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
  };

  return response as unknown as Response & { statusCode: number; body: unknown };
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

describe('Admin maintenance launch read models', () => {
  let adminRoutes: Awaited<typeof import('../routes/admin')>['default'];

  beforeAll(async () => {
    ({ default: adminRoutes } = await import('../routes/admin'));
  });

  beforeEach(() => {
    vi.clearAllMocks();
    supabaseState.tables = {};
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'superadmin',
      profileId: 'profile-admin',
      email: 'admin@example.com',
      isGlobal: true,
      communityIds: [],
      agencyIds: [],
    });
  });

  it('returns scoped maintenance requests with requester and unit enrichment', async () => {
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'facility_manager',
      profileId: 'profile-admin',
      email: 'admin@example.com',
      isGlobal: false,
      communityIds: ['community-1'],
      agencyIds: [],
    });

    supabaseState.tables = {
      maintenance_requests: [
        {
          id: 14,
          title: 'Leak Repair',
          description: 'Kitchen sink leak',
          request_type: 'plumbing',
          priority: 'high',
          status: 'pending',
          requested_by: 'resident-1',
          assigned_to: null,
          resolved_by_profile_id: null,
          unit_id: 'unit-1',
          estimated_cost: 120,
          actual_cost: null,
          images: null,
          created_at: '2026-03-12T08:00:00.000Z',
          updated_at: '2026-03-12T08:00:00.000Z',
          completed_at: null,
          resolved_at: null,
        },
        {
          id: 15,
          title: 'Broken AC',
          description: 'Living room AC',
          request_type: 'hvac',
          priority: 'medium',
          status: 'pending',
          requested_by: 'resident-2',
          assigned_to: null,
          resolved_by_profile_id: null,
          unit_id: 'unit-2',
          estimated_cost: 80,
          actual_cost: null,
          images: null,
          created_at: '2026-03-12T09:00:00.000Z',
          updated_at: '2026-03-12T09:00:00.000Z',
          completed_at: null,
          resolved_at: null,
        },
      ],
      units: [
        { id: 'unit-1', block: 'A', number: '101', unit_number: 'A-101', community_id: 'community-1' },
        { id: 'unit-2', block: 'B', number: '202', unit_number: 'B-202', community_id: 'community-2' },
      ],
      profiles: [
        {
          id: 'resident-1',
          first_name: 'Ama',
          last_name: 'Mensah',
          full_name: 'Ama Mensah',
          email: 'ama@example.com',
          avatar_url: null,
          phone: '2330000001',
          role: 'resident',
        },
        {
          id: 'resident-2',
          first_name: 'Kojo',
          last_name: 'Owusu',
          full_name: 'Kojo Owusu',
          email: 'kojo@example.com',
          avatar_url: null,
          phone: '2330000002',
          role: 'resident',
        },
      ],
    };

    const req = createMockRequest();
    const res = createMockResponse();
    const next = vi.fn();

    await listMaintenanceRequests(req, res, next as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect((res.body as any).data).toHaveLength(1);
    expect((res.body as any).data[0]).toEqual(
      expect.objectContaining({
        id: 14,
        requester_profile: expect.objectContaining({ full_name: 'Ama Mensah' }),
        unit: expect.objectContaining({ unit_number: 'A-101' }),
      })
    );
  });

  it('returns an empty maintenance list when the scoped admin has no accessible communities', async () => {
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'facility_manager',
      profileId: 'profile-admin',
      email: 'admin@example.com',
      isGlobal: false,
      communityIds: [],
      agencyIds: [],
    });

    supabaseState.tables = {
      maintenance_requests: [
        {
          id: 14,
          title: 'Leak Repair',
          description: 'Kitchen sink leak',
          request_type: 'plumbing',
          priority: 'high',
          status: 'pending',
          requested_by: 'resident-1',
          unit_id: 'unit-1',
          created_at: '2026-03-12T08:00:00.000Z',
        },
      ],
    };

    const req = createMockRequest();
    const res = createMockResponse();
    const next = vi.fn();

    await listMaintenanceRequests(req, res, next as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect((res.body as any).data).toEqual([]);
  });

  it('denies maintenance detail access outside the scoped admin community set', async () => {
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'facility_manager',
      profileId: 'profile-admin',
      email: 'admin@example.com',
      isGlobal: false,
      communityIds: ['community-1'],
      agencyIds: [],
    });

    supabaseState.tables = {
      maintenance_requests: [
        {
          id: 15,
          title: 'Broken AC',
          description: 'Living room AC',
          request_type: 'hvac',
          priority: 'medium',
          status: 'pending',
          requested_by: 'resident-2',
          unit_id: 'unit-2',
          created_at: '2026-03-12T09:00:00.000Z',
        },
      ],
      units: [
        { id: 'unit-2', block: 'B', number: '202', unit_number: 'B-202', community_id: 'community-2' },
      ],
    };

    const req = createMockRequest({ params: { id: '15' } });
    const res = createMockResponse();
    const next = vi.fn();

    await getMaintenanceRequest(req, res, next as NextFunction);
    errorHandler(next.mock.calls[0]?.[0], req, res, vi.fn() as NextFunction);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'MAINTENANCE_SCOPE_VIOLATION',
        }),
      })
    );
  });

  it('applies lifecycle updates through the backend and stamps the resolving profile', async () => {
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'facility_manager',
      profileId: 'profile-admin',
      email: 'admin@example.com',
      isGlobal: false,
      communityIds: ['community-1'],
      agencyIds: [],
    });

    supabaseState.tables = {
      maintenance_requests: [
        {
          id: 14,
          title: 'Leak Repair',
          description: 'Kitchen sink leak',
          request_type: 'plumbing',
          priority: 'high',
          status: 'pending',
          requested_by: 'resident-1',
          unit_id: 'unit-1',
          created_at: '2026-03-12T08:00:00.000Z',
          updated_at: '2026-03-12T08:00:00.000Z',
          completed_at: null,
          resolved_at: null,
          resolved_by_profile_id: null,
        },
      ],
      units: [
        { id: 'unit-1', block: 'A', number: '101', unit_number: 'A-101', community_id: 'community-1' },
      ],
      profiles: [
        {
          id: 'resident-1',
          first_name: 'Ama',
          last_name: 'Mensah',
          full_name: 'Ama Mensah',
          email: 'ama@example.com',
          avatar_url: null,
          phone: '2330000001',
          role: 'resident',
        },
        {
          id: 'profile-admin',
          first_name: 'Admin',
          last_name: 'User',
          full_name: 'Admin User',
          email: 'admin@example.com',
          avatar_url: null,
          phone: '2331111111',
          role: 'admin',
        },
      ],
    };

    const req = createMockRequest({
      params: { id: '14' },
      body: { status: 'completed' },
    });
    const res = createMockResponse();
    const next = vi.fn();

    await updateMaintenanceRequest(req, res, next as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect((res.body as any).data).toEqual(
      expect.objectContaining({
        status: 'completed',
        resolved_by_profile: expect.objectContaining({ full_name: 'Admin User' }),
      })
    );
    expect(supabaseState.tables.maintenance_requests[0]).toEqual(
      expect.objectContaining({
        status: 'completed',
        resolved_by_profile_id: 'profile-admin',
      })
    );
  });

  it('rejects malformed maintenance list queries through route validation', async () => {
    const validationMiddleware = findRouteHandler(adminRoutes, '/maintenance-requests', 'get', 2);

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
