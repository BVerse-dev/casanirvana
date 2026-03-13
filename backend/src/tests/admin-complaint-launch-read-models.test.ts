import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';

import {
  createComplaintComment,
  getComplaint,
  getComplaintStats,
  listComplaints,
  updateComplaint,
} from '../controllers/adminComplaints';
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
  let updatePayload: Record<string, any> | null = null;
  let insertPayload: Record<string, any>[] = [];
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
        created_at: payload.created_at || `2026-03-12T10:0${index}:00.000Z`,
        id: payload.id || `${table}-${currentRows.length + index + 1}`,
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

describe('Admin complaint launch read models', () => {
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

  it('returns scoped complaints with reporter and community enrichment', async () => {
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'facility_manager',
      profileId: 'profile-admin',
      email: 'manager@example.com',
      isGlobal: false,
      communityIds: ['community-1'],
      agencyIds: [],
    });

    supabaseState.tables = {
      complaints: [
        {
          id: 'complaint-1',
          subject: 'Noise complaint',
          details: 'Generator noise overnight',
          title: null,
          description: null,
          status: 'pending',
          priority: 'high',
          category: 'noise',
          complaint_type: 'community',
          unit_id: 'unit-1',
          raised_by: 'resident-profile-1',
          created_by: 'auth-admin',
          created_by_profile_id: 'profile-admin',
          resolved_by_profile_id: null,
          created_at: '2026-03-12T08:00:00.000Z',
          updated_at: '2026-03-12T08:00:00.000Z',
        },
        {
          id: 'complaint-2',
          subject: 'Out of scope',
          details: 'Should not be visible',
          status: 'pending',
          priority: 'low',
          category: 'security',
          complaint_type: 'community',
          unit_id: 'unit-2',
          raised_by: 'resident-profile-2',
          created_at: '2026-03-11T08:00:00.000Z',
        },
      ],
      units: [
        { id: 'unit-1', block: 'A', number: '101', unit_number: 'A101', community_id: 'community-1' },
        { id: 'unit-2', block: 'B', number: '202', unit_number: 'B202', community_id: 'community-2' },
      ],
      communities: [
        { id: 'community-1', name: 'Casa One', agency_id: 'agency-1' },
        { id: 'community-2', name: 'Casa Two', agency_id: 'agency-1' },
      ],
      profiles: [
        {
          id: 'resident-profile-1',
          user_id: 'resident-user-1',
          first_name: 'Naa',
          last_name: 'Mensah',
          full_name: 'Naa Mensah',
          email: 'naa@example.com',
          avatar_url: null,
          role: 'resident',
          community_id: 'community-1',
        },
        {
          id: 'profile-admin',
          user_id: 'auth-admin',
          first_name: 'Ama',
          last_name: 'Admin',
          full_name: 'Ama Admin',
          email: 'admin@example.com',
          avatar_url: null,
          role: 'facility_manager',
          community_id: 'community-1',
        },
      ],
      users_with_preference_stats: [],
    };

    const req = createMockRequest();
    const res = createMockResponse();
    const next = vi.fn();

    await listComplaints(req, res, next as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      data: [
        expect.objectContaining({
          id: 'complaint-1',
          reporter_name: 'Naa Mensah',
          unit_label: 'A-101',
          community: expect.objectContaining({ id: 'community-1', name: 'Casa One' }),
        }),
      ],
    });
  });

  it('returns an empty complaint list when scope has no visible units', async () => {
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'facility_manager',
      profileId: 'profile-admin',
      email: 'manager@example.com',
      isGlobal: false,
      communityIds: ['community-9'],
      agencyIds: [],
    });

    supabaseState.tables = {
      complaints: [
        {
          id: 'complaint-1',
          subject: 'Noise complaint',
          details: 'Generator noise overnight',
          status: 'pending',
          priority: 'high',
          unit_id: 'unit-1',
          created_at: '2026-03-12T08:00:00.000Z',
        },
      ],
      units: [{ id: 'unit-1', block: 'A', number: '101', unit_number: 'A101', community_id: 'community-1' }],
      communities: [{ id: 'community-1', name: 'Casa One', agency_id: 'agency-1' }],
      profiles: [],
      users_with_preference_stats: [],
    };

    const req = createMockRequest();
    const res = createMockResponse();
    const next = vi.fn();

    await listComplaints(req, res, next as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect(res.body).toEqual({ data: [] });
  });

  it('denies complaint detail access outside the admin scope', async () => {
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'facility_manager',
      profileId: 'profile-admin',
      email: 'manager@example.com',
      isGlobal: false,
      communityIds: ['community-1'],
      agencyIds: [],
    });

    supabaseState.tables = {
      complaints: [
        {
          id: 'complaint-2',
          subject: 'Gate issue',
          details: 'Back gate stuck',
          status: 'pending',
          priority: 'medium',
          unit_id: 'unit-2',
          created_at: '2026-03-11T08:00:00.000Z',
        },
      ],
      units: [{ id: 'unit-2', block: 'B', number: '202', unit_number: 'B202', community_id: 'community-2' }],
      communities: [{ id: 'community-2', name: 'Casa Two', agency_id: 'agency-1' }],
      profiles: [],
      users_with_preference_stats: [],
    };

    const req = createMockRequest({ params: { id: 'complaint-2' } });
    const res = createMockResponse();
    const next = vi.fn();

    await getComplaint(req, res, next as NextFunction);
    errorHandler(next.mock.calls[0]?.[0], req, res, vi.fn() as NextFunction);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'COMPLAINT_SCOPE_VIOLATION',
        }),
      })
    );
  });

  it('stamps lifecycle fields when resolving a complaint', async () => {
    supabaseState.tables = {
      complaints: [
        {
          id: 'complaint-1',
          subject: 'Water leak',
          details: 'Bathroom ceiling leaking',
          status: 'pending',
          priority: 'medium',
          unit_id: 'unit-1',
          created_at: '2026-03-10T08:00:00.000Z',
          updated_at: '2026-03-10T08:00:00.000Z',
          in_progress_at: null,
          resolved_at: null,
          resolved_by_profile_id: null,
          resolution_notes: null,
        },
      ],
      units: [{ id: 'unit-1', block: 'A', number: '101', unit_number: 'A101', community_id: 'community-1' }],
      communities: [{ id: 'community-1', name: 'Casa One', agency_id: 'agency-1' }],
      profiles: [
        {
          id: 'profile-admin',
          user_id: 'auth-admin',
          first_name: 'Ama',
          last_name: 'Admin',
          full_name: 'Ama Admin',
          email: 'admin@example.com',
          avatar_url: null,
          role: 'superadmin',
          community_id: 'community-1',
        },
      ],
      users_with_preference_stats: [],
    };

    const req = createMockRequest({
      params: { id: 'complaint-1' },
      body: { status: 'resolved', resolution_notes: 'Leak fixed and ceiling patched.' },
    });
    const res = createMockResponse();
    const next = vi.fn();

    await updateComplaint(req, res, next as NextFunction);

    expect(next).not.toHaveBeenCalled();
    const updatedComplaint = (res.body as any).data;
    expect(updatedComplaint.status).toBe('resolved');
    expect(updatedComplaint.in_progress_at).toBeTruthy();
    expect(updatedComplaint.resolved_at).toBeTruthy();
    expect(updatedComplaint.resolved_by_profile_id).toBe('profile-admin');
    expect(updatedComplaint.resolution_notes).toBe('Leak fixed and ceiling patched.');
  });

  it('creates complaint comments through the backend actor and enriches the author profile', async () => {
    supabaseState.tables = {
      complaints: [
        {
          id: 'complaint-1',
          subject: 'Water leak',
          details: 'Bathroom ceiling leaking',
          status: 'pending',
          priority: 'medium',
          unit_id: 'unit-1',
          created_at: '2026-03-10T08:00:00.000Z',
        },
      ],
      complaint_comments: [],
      units: [{ id: 'unit-1', block: 'A', number: '101', unit_number: 'A101', community_id: 'community-1' }],
      communities: [{ id: 'community-1', name: 'Casa One', agency_id: 'agency-1' }],
      profiles: [
        {
          id: 'profile-admin',
          user_id: 'auth-admin',
          first_name: 'Ama',
          last_name: 'Admin',
          full_name: 'Ama Admin',
          email: 'admin@example.com',
          avatar_url: null,
          role: 'superadmin',
          community_id: 'community-1',
        },
      ],
      users_with_preference_stats: [
        {
          id: 'auth-admin',
          user_name: 'Ama Admin',
          email: 'admin@example.com',
          user_role: 'superadmin',
        },
      ],
    };

    const req = createMockRequest({
      params: { id: 'complaint-1' },
      body: { comment: 'Assigned technician and informed resident.' },
    });
    const res = createMockResponse();
    const next = vi.fn();

    await createComplaintComment(req, res, next as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(201);
    expect((res.body as any).data).toEqual(
      expect.objectContaining({
        complaint_id: 'complaint-1',
        created_by: 'auth-admin',
        created_by_profile: expect.objectContaining({
          full_name: 'Ama Admin',
          role: 'superadmin',
        }),
      })
    );
  });

  it('returns complaint stats for the scoped dataset only', async () => {
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'facility_manager',
      profileId: 'profile-admin',
      email: 'manager@example.com',
      isGlobal: false,
      communityIds: ['community-1'],
      agencyIds: [],
    });

    supabaseState.tables = {
      complaints: [
        {
          id: 'complaint-1',
          subject: 'Leak',
          details: 'Pipe leak',
          status: 'resolved',
          priority: 'high',
          category: 'plumbing',
          unit_id: 'unit-1',
          created_at: '2026-03-12T08:00:00.000Z',
        },
        {
          id: 'complaint-2',
          subject: 'Noise',
          details: 'Loud music',
          status: 'pending',
          priority: 'medium',
          category: 'noise',
          unit_id: 'unit-1',
          created_at: '2026-03-11T08:00:00.000Z',
        },
        {
          id: 'complaint-3',
          subject: 'Out of scope',
          details: 'Should not count',
          status: 'pending',
          priority: 'high',
          category: 'security',
          unit_id: 'unit-2',
          created_at: '2026-03-11T08:00:00.000Z',
        },
      ],
      units: [
        { id: 'unit-1', block: 'A', number: '101', unit_number: 'A101', community_id: 'community-1' },
        { id: 'unit-2', block: 'B', number: '202', unit_number: 'B202', community_id: 'community-2' },
      ],
      communities: [
        { id: 'community-1', name: 'Casa One', agency_id: 'agency-1' },
        { id: 'community-2', name: 'Casa Two', agency_id: 'agency-1' },
      ],
      profiles: [],
      users_with_preference_stats: [],
    };

    const req = createMockRequest();
    const res = createMockResponse();
    const next = vi.fn();

    await getComplaintStats(req, res, next as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect(res.body).toEqual({
      data: {
        total: 2,
        pending: 1,
        inProgress: 0,
        resolved: 1,
        high: 1,
        medium: 1,
        low: 0,
        categories: {
          plumbing: 1,
          noise: 1,
        },
        recentComplaints: 2,
        resolutionRate: 50,
      },
    });
  });

  it('rejects malformed admin complaint update payloads', async () => {
    const validationMiddleware = findRouteHandler(adminRoutes, '/complaints/:id', 'patch', 2);
    const req = createMockRequest({
      params: { id: 'complaint-1' },
      body: { status: 42 },
    });

    const res = await runValidationMiddleware(validationMiddleware, req);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'VALIDATION_ERROR',
        }),
      })
    );
  });
});
