import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';

import {
  getCommunityManagementData,
  listCommunities,
} from '../controllers/adminCommunities';
import { listJoinRequests } from '../controllers/adminJoinRequests';
import { listUnits } from '../controllers/adminUnits';
import { errorHandler } from '../middleware/errorHandler';

const scopeMocks = vi.hoisted(() => ({
  resolveAdminScope: vi.fn(),
}));

const supabaseState = vi.hoisted(() => ({
  tables: {} as Record<string, any[]>,
}));

function createQueryBuilder(table: string) {
  let rows = [...(supabaseState.tables[table] || [])];
  let countRequested = false;
  let headOnly = false;

  const builder: any = {
    select(_columns?: string, options?: { count?: string; head?: boolean }) {
      countRequested = Boolean(options?.count);
      headOnly = Boolean(options?.head);
      return builder;
    },
    eq(column: string, value: unknown) {
      rows = rows.filter((row) => row[column] === value);
      return builder;
    },
    in(column: string, values: unknown[]) {
      rows = rows.filter((row) => values.includes(row[column]));
      return builder;
    },
    order(column: string, options?: { ascending?: boolean }) {
      const ascending = options?.ascending ?? true;
      rows = [...rows].sort((left, right) => {
        const leftValue = left[column];
        const rightValue = right[column];
        if (leftValue === rightValue) return 0;
        if (leftValue === undefined || leftValue === null) return 1;
        if (rightValue === undefined || rightValue === null) return -1;
        return ascending ? (leftValue < rightValue ? -1 : 1) : (leftValue > rightValue ? -1 : 1);
      });
      return builder;
    },
    range(start: number, end: number) {
      rows = rows.slice(start, end + 1);
      return builder;
    },
    or() {
      return builder;
    },
    maybeSingle() {
      return Promise.resolve({ data: rows[0] || null, error: null, count: rows.length });
    },
    single() {
      return Promise.resolve({
        data: rows[0] || null,
        error: rows[0] ? null : { code: 'PGRST116' },
        count: rows.length,
      });
    },
    then(resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) {
      return Promise.resolve({
        data: headOnly ? null : rows,
        error: null,
        count: countRequested ? rows.length : null,
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
  canAccessAgency: (scope: { isGlobal: boolean; agencyIds: string[] }, agencyId: string) =>
    scope.isGlobal || scope.agencyIds.includes(agencyId),
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
  method: 'get',
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

describe('Admin community launch read models', () => {
  let adminRoutes: Awaited<typeof import('../routes/admin')>['default'];

  beforeAll(async () => {
    ({ default: adminRoutes } = await import('../routes/admin'));
  });

  beforeEach(() => {
    vi.clearAllMocks();
    supabaseState.tables = {};
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'superadmin',
      profileId: 'admin-1',
      email: 'admin@example.com',
      isGlobal: true,
      communityIds: [],
      agencyIds: [],
    });
  });

  it('returns scoped communities with computed unit and amenity stats', async () => {
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'facility_manager',
      profileId: 'admin-1',
      email: 'manager@example.com',
      isGlobal: false,
      communityIds: ['community-1'],
      agencyIds: ['agency-1'],
    });

    supabaseState.tables = {
      communities: [
        {
          id: 'community-1',
          name: 'Alpha Court',
          status: 'active',
          agencies: { id: 'agency-1', name: 'Agency One', email: 'agency@example.com', phone: '2330000001' },
        },
        {
          id: 'community-2',
          name: 'Beta Court',
          status: 'active',
          agencies: { id: 'agency-2', name: 'Agency Two', email: 'agency2@example.com', phone: '2330000002' },
        },
      ],
      units: [
        { id: 'unit-1', community_id: 'community-1', status: 'occupied', area: 800, area_sqft: null, floor_area: null },
        { id: 'unit-2', community_id: 'community-1', status: 'vacant', area: 650, area_sqft: null, floor_area: null },
        { id: 'unit-3', community_id: 'community-2', status: 'occupied', area: 700, area_sqft: null, floor_area: null },
      ],
      amenities: [
        { community_id: 'community-1', name: 'Pool', is_active: true, status: 'active' },
        { community_id: 'community-1', name: 'Gym', is_active: false, status: 'inactive' },
        { community_id: 'community-2', name: 'Lounge', is_active: true, status: 'active' },
      ],
    };

    const req = createMockRequest({ query: { page: '1', limit: '20' } });
    const res = createMockResponse();
    const next = vi.fn();

    await listCommunities(req, res, next as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect((res.body as any).data).toHaveLength(1);
    expect((res.body as any).data[0]).toEqual(
      expect.objectContaining({
        id: 'community-1',
        unit_count: 2,
        occupied_unit_count: 1,
        vacancy_count: 1,
        occupancy_rate: 50,
        total_area_sqft: 1450,
        amenity_names: ['Pool'],
      })
    );
  });

  it('returns scoped management data with residents, directory roles, and staff', async () => {
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'facility_manager',
      profileId: 'admin-1',
      email: 'manager@example.com',
      isGlobal: false,
      communityIds: ['community-1'],
      agencyIds: [],
    });

    supabaseState.tables = {
      profiles: [
        {
          id: 'resident-1',
          user_id: 'auth-1',
          first_name: 'Ama',
          last_name: 'Owusu',
          full_name: 'Ama Owusu',
          email: 'ama@example.com',
          phone: '2331000001',
          avatar_url: null,
          unit_id: 'unit-1',
          status: 'active',
          role: 'user',
          is_active: true,
          created_at: '2026-03-10T10:00:00.000Z',
          community_id: 'community-1',
        },
        {
          id: 'resident-2',
          user_id: 'auth-2',
          first_name: 'Kojo',
          last_name: 'Mensah',
          full_name: 'Kojo Mensah',
          email: 'kojo@example.com',
          phone: '2331000002',
          avatar_url: null,
          unit_id: 'unit-2',
          status: 'active',
          role: 'user',
          is_active: true,
          created_at: '2026-03-11T10:00:00.000Z',
          community_id: 'community-1',
        },
        {
          id: 'guard-1',
          user_id: 'auth-3',
          first_name: 'Guard',
          last_name: 'User',
          full_name: 'Guard User',
          email: 'guard@example.com',
          phone: '2331000003',
          avatar_url: null,
          unit_id: null,
          status: 'active',
          role: 'guard',
          is_active: true,
          created_at: '2026-03-09T10:00:00.000Z',
          community_id: 'community-1',
        },
      ],
      units: [
        { id: 'unit-1', block: 'A', number: '101', unit_number: 'A-101', community_id: 'community-1' },
        { id: 'unit-2', block: 'B', number: '202', unit_number: 'B-202', community_id: 'community-1' },
      ],
      community_memberships: [
        {
          id: 'membership-1',
          community_id: 'community-1',
          profile_id: 'resident-1',
          membership_role: 'admin',
          committee_position: null,
          tenure_start: null,
          tenure_end: null,
          is_active: true,
          created_at: '2026-03-10T12:00:00.000Z',
        },
        {
          id: 'membership-2',
          community_id: 'community-1',
          profile_id: 'resident-2',
          membership_role: 'committee',
          committee_position: 'Secretary',
          tenure_start: '2026-01-01',
          tenure_end: null,
          is_active: true,
          created_at: '2026-03-11T12:00:00.000Z',
        },
      ],
      community_staff: [
        {
          id: 'staff-1',
          community_id: 'community-1',
          first_name: 'Service',
          last_name: 'Lead',
          position: 'Facility Supervisor',
          shift: 'Day',
          status: 'active',
          email: 'staff@example.com',
          phone: '2332000001',
          hire_date: '2025-01-15',
          created_at: '2025-01-15',
          updated_at: '2026-03-01',
          is_active: true,
        },
      ],
    };

    const req = createMockRequest({ params: { id: 'community-1' } });
    const res = createMockResponse();
    const next = vi.fn();

    await getCommunityManagementData(req, res, next as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect((res.body as any).data.residents).toHaveLength(2);
    expect((res.body as any).data.directoryMembers).toHaveLength(2);
    expect((res.body as any).data.staff).toHaveLength(1);
    expect((res.body as any).data.directoryMembers[0]).toEqual(
      expect.objectContaining({
        membership_role: 'admin',
        profile: expect.objectContaining({ full_name: 'Ama Owusu' }),
      })
    );
  });

  it('denies management access outside the admin scope', async () => {
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'facility_manager',
      profileId: 'admin-1',
      email: 'manager@example.com',
      isGlobal: false,
      communityIds: ['community-2'],
      agencyIds: [],
    });

    const req = createMockRequest({ params: { id: 'community-1' } });
    const res = createMockResponse();
    const next = vi.fn();

    await getCommunityManagementData(req, res, next as NextFunction);
    errorHandler(next.mock.calls[0]?.[0], req, res, vi.fn() as NextFunction);

    expect(res.statusCode).toBe(403);
    expect((res.body as any).error.code).toBe('COMMUNITY_SCOPE_VIOLATION');
  });

  it('returns units with owner profile fallback by user id', async () => {
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'facility_manager',
      profileId: 'admin-1',
      email: 'manager@example.com',
      isGlobal: false,
      communityIds: ['community-1'],
      agencyIds: [],
    });

    supabaseState.tables = {
      units: [
        {
          id: 'unit-1',
          community_id: 'community-1',
          number: '101',
          unit_number: 'A-101',
          block: 'A',
          floor: 1,
          status: 'occupied',
          type: '2bhk',
          area: 850,
          owner_id: 'auth-owner-1',
          created_at: '2026-03-10T00:00:00.000Z',
          updated_at: '2026-03-10T00:00:00.000Z',
        },
      ],
      communities: [
        { id: 'community-1', name: 'Alpha Court', address: 'North Ridge', city: 'Accra', state: 'Greater Accra' },
      ],
      profiles: [
        {
          id: 'profile-owner-1',
          user_id: 'auth-owner-1',
          first_name: 'Nana',
          last_name: 'Kofi',
          full_name: 'Nana Kofi',
          email: 'nana@example.com',
          phone: '2333000001',
        },
      ],
    };

    const req = createMockRequest({ query: { page: '1', limit: '20' } });
    const res = createMockResponse();
    const next = vi.fn();

    await listUnits(req, res, next as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect((res.body as any).data[0]).toEqual(
      expect.objectContaining({
        id: 'unit-1',
        communities: expect.objectContaining({ name: 'Alpha Court' }),
        profiles: expect.objectContaining({ full_name: 'Nana Kofi', email: 'nana@example.com' }),
      })
    );
  });

  it('returns an empty unit list when the admin has no scoped communities', async () => {
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'facility_manager',
      profileId: 'admin-1',
      email: 'manager@example.com',
      isGlobal: false,
      communityIds: [],
      agencyIds: [],
    });

    const req = createMockRequest({ query: { page: '1', limit: '20' } });
    const res = createMockResponse();
    const next = vi.fn();

    await listUnits(req, res, next as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect(res.body).toEqual({
      data: [],
      count: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0,
    });
  });

  it('returns scoped join requests with related lookup details', async () => {
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'facility_manager',
      profileId: 'admin-1',
      email: 'manager@example.com',
      isGlobal: false,
      communityIds: ['community-1'],
      agencyIds: [],
    });

    supabaseState.tables = {
      join_requests: [
        {
          id: 'join-1',
          user_id: 'resident-1',
          reviewed_by: 'reviewer-1',
          community_id: 'community-1',
          unit_id: 'unit-1',
          community_name: null,
          manual_unit_info: null,
          comments: 'Please approve',
          status: 'pending',
          created_at: '2026-03-11T12:00:00.000Z',
        },
      ],
      units: [
        { id: 'unit-1', community_id: 'community-1', number: '101', block: 'A' },
      ],
      communities: [
        { id: 'community-1', name: 'Alpha Court' },
      ],
      profiles: [
        {
          id: 'resident-1',
          first_name: 'Ama',
          last_name: 'Owusu',
          full_name: 'Ama Owusu',
          email: 'ama@example.com',
          phone: '2331000001',
        },
        {
          id: 'reviewer-1',
          first_name: 'Admin',
          last_name: 'User',
          full_name: 'Admin User',
          email: 'admin@example.com',
          phone: '2339000001',
        },
      ],
    };

    const req = createMockRequest({ query: { page: '1', limit: '20' } });
    const res = createMockResponse();
    const next = vi.fn();

    await listJoinRequests(req, res, next as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect((res.body as any).data[0]).toEqual(
      expect.objectContaining({
        id: 'join-1',
        full_name: 'Ama Owusu',
        email: 'ama@example.com',
        reviewer_name: 'Admin User',
        community_name: 'Alpha Court',
        unit_number: '101',
        unit_block: 'A',
      })
    );
  });

  it('rejects invalid join request status query values', async () => {
    const validationMiddleware = findRouteHandler(adminRoutes, '/join-requests', 'get', 2);
    const req = createMockRequest({ query: { status: 'not-a-status' } });

    const res = await runValidationMiddleware(validationMiddleware, req);

    expect(res.statusCode).toBe(400);
    expect((res.body as any).error.code).toBe('VALIDATION_ERROR');
  });
});
