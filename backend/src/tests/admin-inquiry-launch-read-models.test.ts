import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';

import {
  getInquiry,
  listAssignableInquiryAdmins,
  listInquiries,
  updateInquiry,
} from '../controllers/adminInquiries';
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

describe('Admin inquiry launch read models', () => {
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

  it('returns scoped inquiries with user and community enrichment', async () => {
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'facility_manager',
      profileId: 'profile-facility',
      email: 'facility@example.com',
      isGlobal: false,
      communityIds: ['community-1'],
      agencyIds: [],
    });

    supabaseState.tables = {
      inquiries: [
        {
          id: 'inq-1',
          user_id: 'resident-user-1',
          user_name: 'Resident One',
          user_email: 'resident@example.com',
          user_phone: '0240000000',
          community_id: 'community-1',
          inquiry_type: 'general_inquiry',
          subject: 'Gate light issue',
          description: 'The gate light is not working.',
          priority: 'high',
          status: 'open',
          assigned_to: 'admin-user-1',
          created_at: '2026-03-12T08:00:00.000Z',
        },
        {
          id: 'inq-2',
          user_id: 'resident-user-2',
          user_name: 'Resident Two',
          community_id: 'community-2',
          inquiry_type: 'feedback',
          subject: 'Out of scope',
          description: 'Should not be visible.',
          priority: 'low',
          status: 'open',
          created_at: '2026-03-11T08:00:00.000Z',
        },
      ],
      profiles: [
        {
          id: 'resident-profile-1',
          user_id: 'resident-user-1',
          full_name: 'Resident One',
          email: 'resident@example.com',
          phone: '0240000000',
          role: 'user',
          community_id: 'community-1',
        },
        {
          id: 'profile-admin-1',
          user_id: 'admin-user-1',
          full_name: 'Admin One',
          email: 'admin1@example.com',
          phone: '0200000000',
          role: 'facility_manager',
          community_id: 'community-1',
        },
      ],
      communities: [
        { id: 'community-1', name: 'Casa One', agency_id: 'agency-1' },
        { id: 'community-2', name: 'Casa Two', agency_id: 'agency-1' },
      ],
      agencies: [{ id: 'agency-1', name: 'Agency One' }],
    };

    const req = createMockRequest();
    const res = createMockResponse();
    const next = vi.fn();

    await listInquiries(req, res, next as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect(res.body).toEqual({
      data: [
        expect.objectContaining({
          id: 'inq-1',
          community: expect.objectContaining({ name: 'Casa One' }),
          agency: expect.objectContaining({ name: 'Agency One' }),
          user_profile: expect.objectContaining({ full_name: 'Resident One' }),
          assignee_profile: expect.objectContaining({ full_name: 'Admin One' }),
        }),
      ],
    });
  });

  it('denies inquiry detail access outside the scoped community set', async () => {
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'facility_manager',
      profileId: 'profile-facility',
      email: 'facility@example.com',
      isGlobal: false,
      communityIds: ['community-1'],
      agencyIds: [],
    });

    supabaseState.tables = {
      inquiries: [
        {
          id: 'inq-2',
          user_id: 'resident-user-2',
          community_id: 'community-2',
          inquiry_type: 'feedback',
          subject: 'Out of scope',
          description: 'Should not be visible.',
          priority: 'low',
          status: 'open',
          created_at: '2026-03-11T08:00:00.000Z',
        },
      ],
      profiles: [],
      communities: [{ id: 'community-2', name: 'Casa Two', agency_id: 'agency-1' }],
      agencies: [{ id: 'agency-1', name: 'Agency One' }],
    };

    const req = createMockRequest({ params: { id: 'inq-2' } });
    const res = createMockResponse();
    const next = vi.fn();

    await getInquiry(req, res, next as NextFunction);
    errorHandler(next.mock.calls[0]?.[0], req, res, vi.fn() as NextFunction);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'INQUIRY_SCOPE_VIOLATION',
        }),
      })
    );
  });

  it('returns scoped assignable admins and keeps superadmins available', async () => {
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'facility_manager',
      profileId: 'profile-facility',
      email: 'facility@example.com',
      isGlobal: false,
      communityIds: ['community-1'],
      agencyIds: [],
    });

    supabaseState.tables = {
      profiles: [
        {
          id: 'profile-superadmin',
          user_id: 'superadmin-user',
          full_name: 'Global Admin',
          email: 'global@example.com',
          phone: null,
          role: 'superadmin',
          community_id: null,
        },
        {
          id: 'profile-facility-1',
          user_id: 'facility-user-1',
          full_name: 'Community Admin',
          email: 'facility1@example.com',
          phone: null,
          role: 'facility_manager',
          community_id: 'community-1',
        },
        {
          id: 'profile-facility-2',
          user_id: 'facility-user-2',
          full_name: 'Other Community Admin',
          email: 'facility2@example.com',
          phone: null,
          role: 'facility_manager',
          community_id: 'community-2',
        },
      ],
    };

    const req = createMockRequest({ query: { community_id: 'community-1' } });
    const res = createMockResponse();
    const next = vi.fn();

    await listAssignableInquiryAdmins(req, res, next as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect(res.body).toEqual({
      data: [
        expect.objectContaining({ id: 'profile-facility-1', user_id: 'facility-user-1' }),
        expect.objectContaining({ id: 'profile-superadmin', user_id: 'superadmin-user' }),
      ],
    });
  });

  it('normalizes assignee identity and stamps response lifecycle fields on update', async () => {
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'facility_manager',
      profileId: 'profile-facility',
      email: 'facility@example.com',
      isGlobal: false,
      communityIds: ['community-1'],
      agencyIds: [],
    });

    supabaseState.tables = {
      inquiries: [
        {
          id: 'inq-1',
          user_id: 'resident-user-1',
          community_id: 'community-1',
          inquiry_type: 'general_inquiry',
          subject: 'Gate light issue',
          description: 'The gate light is not working.',
          priority: 'high',
          status: 'open',
          assigned_to: null,
          admin_response: null,
          resolution_notes: null,
          responded_at: null,
          resolved_at: null,
          created_at: '2026-03-12T08:00:00.000Z',
          updated_at: '2026-03-12T08:00:00.000Z',
        },
      ],
      profiles: [
        {
          id: 'profile-facility-1',
          user_id: 'facility-user-1',
          full_name: 'Community Admin',
          email: 'facility1@example.com',
          phone: null,
          role: 'facility_manager',
          community_id: 'community-1',
        },
      ],
      communities: [{ id: 'community-1', name: 'Casa One', agency_id: 'agency-1' }],
      agencies: [{ id: 'agency-1', name: 'Agency One' }],
    };

    const req = createMockRequest({
      params: { id: 'inq-1' },
      body: {
        status: 'resolved',
        assigned_to: 'profile-facility-1',
        admin_response: 'Team has fixed the issue.',
        resolution_notes: 'Replaced bulb and tested wiring.',
      },
    });
    const res = createMockResponse();
    const next = vi.fn();

    await updateInquiry(req, res, next as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect((res.body as any).data).toEqual(
      expect.objectContaining({
        id: 'inq-1',
        status: 'resolved',
        assigned_to: 'facility-user-1',
        admin_response: 'Team has fixed the issue.',
        resolution_notes: 'Replaced bulb and tested wiring.',
      })
    );
    expect((res.body as any).data.responded_at).toBeTruthy();
    expect((res.body as any).data.resolved_at).toBeTruthy();
  });

  it('clears terminal resolution state when reopening an inquiry', async () => {
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'facility_manager',
      profileId: 'profile-facility',
      email: 'facility@example.com',
      isGlobal: false,
      communityIds: ['community-1'],
      agencyIds: [],
    });

    supabaseState.tables = {
      inquiries: [
        {
          id: 'inq-1',
          user_id: 'resident-user-1',
          community_id: 'community-1',
          inquiry_type: 'general_inquiry',
          subject: 'Gate light issue',
          description: 'The gate light is not working.',
          priority: 'high',
          status: 'resolved',
          assigned_to: 'facility-user-1',
          admin_response: 'Team has fixed the issue.',
          resolution_notes: 'Old note',
          responded_at: '2026-03-12T09:00:00.000Z',
          resolved_at: '2026-03-12T10:00:00.000Z',
          created_at: '2026-03-12T08:00:00.000Z',
          updated_at: '2026-03-12T10:00:00.000Z',
        },
      ],
      profiles: [
        {
          id: 'profile-facility-1',
          user_id: 'facility-user-1',
          full_name: 'Community Admin',
          email: 'facility1@example.com',
          phone: null,
          role: 'facility_manager',
          community_id: 'community-1',
        },
      ],
      communities: [{ id: 'community-1', name: 'Casa One', agency_id: 'agency-1' }],
      agencies: [{ id: 'agency-1', name: 'Agency One' }],
    };

    const req = createMockRequest({
      params: { id: 'inq-1' },
      body: {
        status: 'open',
      },
    });
    const res = createMockResponse();
    const next = vi.fn();

    await updateInquiry(req, res, next as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect((res.body as any).data).toEqual(
      expect.objectContaining({
        id: 'inq-1',
        status: 'open',
        resolved_at: null,
        resolution_notes: null,
      })
    );
  });

  it('rejects malformed inquiry list query values via route validation', async () => {
    const validationMiddleware = findRouteHandler(adminRoutes, '/inquiries', 'get', 2);
    const req = createMockRequest({
      query: { status: 42 },
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
