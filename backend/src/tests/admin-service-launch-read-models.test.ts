import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';

import {
  createService,
  getServiceRequest,
  listServices,
  updateServiceRequest,
} from '../controllers/adminServices';
import { errorHandler } from '../middleware/errorHandler';

const scopeMocks = vi.hoisted(() => ({
  resolveAdminScope: vi.fn(),
}));

const supabaseState = vi.hoisted(() => ({
  tables: {} as Record<string, any[]>,
}));

function createQueryBuilder(table: string) {
  const filters: Array<(row: Record<string, any>) => boolean> = [];
  let operation: 'read' | 'update' | 'delete' | 'insert' = 'read';
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
      const currentRows = getRows();
      const createdRows = insertPayload.map((payload, index) => ({
        created_at: payload.created_at || `2026-03-12T11:0${index}:00.000Z`,
        id:
          payload.id ||
          (table === 'services' ? currentRows.length + index + 1 : `${table}-${currentRows.length + index + 1}`),
        ...payload,
      }));
      setRows([...currentRows, ...createdRows]);
      return { data: createdRows, error: null };
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
    insert(payload: Record<string, any> | Record<string, any>[]) {
      operation = 'insert';
      insertPayload = Array.isArray(payload) ? payload : [payload];
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

  return response as unknown as Response & { statusCode: number; body: any };
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

describe('Admin service launch read models', () => {
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

  it('returns scoped services with community enrichment and request counts', async () => {
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'facility_manager',
      profileId: 'profile-facility',
      email: 'facility@example.com',
      isGlobal: false,
      communityIds: ['community-1'],
      agencyIds: [],
    });

    supabaseState.tables = {
      services: [
        {
          id: 26,
          name: 'Plumbing',
          community_id: 'community-1',
          is_active: true,
          created_at: '2026-03-12T08:00:00.000Z',
        },
        {
          id: 27,
          name: 'Cleaning',
          community_id: 'community-2',
          is_active: true,
          created_at: '2026-03-11T08:00:00.000Z',
        },
      ],
      service_requests: [
        {
          id: 'request-1',
          community_id: 'community-1',
          service_id: 26,
          request_details: 'Fix the kitchen sink',
          created_by: 'user-1',
          status: 'pending',
          total_amount: 45,
        },
        {
          id: 'request-2',
          community_id: 'community-1',
          service_id: 26,
          request_details: 'Repair shower',
          created_by: 'user-1',
          status: 'completed',
          total_amount: 60,
        },
        {
          id: 'request-3',
          community_id: 'community-2',
          service_id: 27,
          request_details: 'Housekeeping',
          created_by: 'user-2',
          status: 'completed',
          total_amount: 20,
        },
      ],
      communities: [
        { id: 'community-1', name: 'Casa Nirvana One', agency_id: 'agency-1' },
        { id: 'community-2', name: 'Other Community', agency_id: 'agency-2' },
      ],
    };

    const req = createMockRequest();
    const res = createMockResponse();
    const next = vi.fn();

    await listServices(req, res, next as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0]).toMatchObject({
      id: 26,
      communityName: 'Casa Nirvana One',
      request_counts: {
        total: 2,
        pending: 1,
        completed: 1,
        completedRevenue: 60,
      },
    });
  });

  it('returns an empty list when a scoped admin has no accessible communities', async () => {
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'facility_manager',
      profileId: 'profile-facility',
      email: 'facility@example.com',
      isGlobal: false,
      communityIds: [],
      agencyIds: [],
    });

    supabaseState.tables = {
      services: [
        {
          id: 26,
          name: 'Plumbing',
          community_id: 'community-1',
          is_active: true,
        },
      ],
    };

    const req = createMockRequest();
    const res = createMockResponse();
    const next = vi.fn();

    await listServices(req, res, next as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect(res.body.data).toEqual([]);
  });

  it('rejects service creation outside the admin scope', async () => {
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'facility_manager',
      profileId: 'profile-facility',
      email: 'facility@example.com',
      isGlobal: false,
      communityIds: ['community-1'],
      agencyIds: [],
    });

    const req = createMockRequest({
      body: {
        name: 'Laundry',
        community_id: 'community-2',
        category: 'cleaning',
      },
      method: 'POST',
    });
    const res = createMockResponse();
    const next = vi.fn();

    await createService(req, res, next as NextFunction);
    errorHandler(next.mock.calls[0]?.[0], req, res, vi.fn() as NextFunction);

    expect(res.statusCode).toBe(403);
    expect(res.body.error.code).toBe('SERVICE_SCOPE_VIOLATION');
  });

  it('returns enriched service request detail with service, unit, and profile context', async () => {
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'facility_manager',
      profileId: 'profile-facility',
      email: 'facility@example.com',
      isGlobal: false,
      communityIds: ['community-1'],
      agencyIds: [],
    });

    supabaseState.tables = {
      service_requests: [
        {
          id: '11111111-1111-1111-1111-111111111111',
          community_id: 'community-1',
          service_id: 26,
          unit_id: 'unit-1',
          user_id: 'user-1',
          created_by: 'user-1',
          assigned_to: 'profile-tech',
          request_details: 'Fix the kitchen sink',
          status: 'pending',
          title: 'Sink repair',
          total_amount: 75,
          created_at: '2026-03-12T08:00:00.000Z',
        },
      ],
      services: [
        {
          id: 26,
          name: 'Plumbing',
          community_id: 'community-1',
          is_active: true,
        },
      ],
      units: [
        {
          id: 'unit-1',
          block: 'A',
          number: '101',
          community_id: 'community-1',
        },
      ],
      profiles: [
        {
          id: 'profile-user',
          user_id: 'user-1',
          first_name: 'Ada',
          last_name: 'Stone',
          email: 'resident@example.com',
        },
        {
          id: 'profile-tech',
          user_id: 'tech-user',
          first_name: 'Max',
          last_name: 'Rivera',
          email: 'tech@example.com',
        },
      ],
      communities: [
        {
          id: 'community-1',
          name: 'Casa Nirvana One',
          address: 'Accra',
          agency_id: 'agency-1',
        },
      ],
    };

    const req = createMockRequest({
      params: { id: '11111111-1111-1111-1111-111111111111' },
    });
    const res = createMockResponse();
    const next = vi.fn();

    await getServiceRequest(req, res, next as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect(res.body.data).toMatchObject({
      id: '11111111-1111-1111-1111-111111111111',
      services: {
        id: 26,
        name: 'Plumbing',
      },
      units: {
        id: 'unit-1',
        community: {
          name: 'Casa Nirvana One',
        },
      },
      user_profile: {
        email: 'resident@example.com',
      },
      assigned_profile: {
        email: 'tech@example.com',
      },
    });
  });

  it('updates service request lifecycle fields on the backend when completing a request', async () => {
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'facility_manager',
      profileId: 'profile-facility',
      email: 'facility@example.com',
      isGlobal: false,
      communityIds: ['community-1'],
      agencyIds: [],
    });

    supabaseState.tables = {
      service_requests: [
        {
          id: '11111111-1111-1111-1111-111111111111',
          community_id: 'community-1',
          service_id: 26,
          created_by: 'user-1',
          request_details: 'Fix the kitchen sink',
          status: 'in_progress',
          created_at: '2026-03-12T08:00:00.000Z',
          updated_at: '2026-03-12T09:00:00.000Z',
        },
      ],
      services: [
        {
          id: 26,
          name: 'Plumbing',
          community_id: 'community-1',
          is_active: true,
        },
      ],
      communities: [
        {
          id: 'community-1',
          name: 'Casa Nirvana One',
          address: 'Accra',
        },
      ],
    };

    const req = createMockRequest({
      body: { status: 'completed' },
      method: 'PATCH',
      params: { id: '11111111-1111-1111-1111-111111111111' },
    });
    const res = createMockResponse();
    const next = vi.fn();

    await updateServiceRequest(req, res, next as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect(res.body.data.status).toBe('completed');
    expect(res.body.data.completion_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(res.body.data.updated_at).toBeTruthy();
  });

  it('rejects malformed service request updates at route validation', async () => {
    const validationMiddleware = findRouteHandler(adminRoutes, '/service-requests/:id', 'patch', 2);
    const req = createMockRequest({
      params: { id: '11111111-1111-1111-1111-111111111111' },
      body: { status: 'paused' },
      method: 'PATCH',
    });

    const res = await runValidationMiddleware(validationMiddleware, req);

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
