import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';

import { getAnalyticsDashboard, getGuardDashboard, getResidentDashboard } from '../controllers/adminDashboard';
import { errorHandler } from '../middleware/errorHandler';

const scopeMocks = vi.hoisted(() => ({
  resolveAdminScope: vi.fn(),
  getScopedGuardIds: vi.fn(),
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
    gte(column: string, value: string | number) {
      rows = rows.filter((row) => row[column] !== null && row[column] !== undefined && row[column] >= value);
      return builder;
    },
    lte(column: string, value: string | number) {
      rows = rows.filter((row) => row[column] !== null && row[column] !== undefined && row[column] <= value);
      return builder;
    },
    gt(column: string, value: string | number) {
      rows = rows.filter((row) => row[column] !== null && row[column] !== undefined && row[column] > value);
      return builder;
    },
    lt(column: string, value: string | number) {
      rows = rows.filter((row) => row[column] !== null && row[column] !== undefined && row[column] < value);
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
    limit(value: number) {
      rows = rows.slice(0, value);
      return builder;
    },
    maybeSingle() {
      return Promise.resolve({ data: rows[0] || null, error: null, count: rows.length });
    },
    single() {
      return Promise.resolve({ data: rows[0] || null, error: rows[0] ? null : { code: 'PGRST116' }, count: rows.length });
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
  getScopedGuardIds: scopeMocks.getScopedGuardIds,
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

describe('Admin dashboard read models', () => {
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
    scopeMocks.getScopedGuardIds.mockResolvedValue([]);
  });

  it('returns scoped analytics data for accessible communities only', async () => {
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'facility_manager',
      profileId: 'admin-1',
      email: 'manager@example.com',
      isGlobal: false,
      communityIds: ['community-1'],
      agencyIds: [],
    });

    supabaseState.tables = {
      communities: [
        { id: 'community-1', name: 'Alpha Court', address: 'North Ridge' },
        { id: 'community-2', name: 'Beta Court', address: 'Airport' },
      ],
      units: [
        { id: 'unit-1', community_id: 'community-1', created_at: '2026-03-10T00:00:00.000Z', status: 'occupied', owner_id: null, tenant_id: 'tenant-1' },
        { id: 'unit-2', community_id: 'community-2', created_at: '2026-03-10T00:00:00.000Z', status: 'occupied', owner_id: null, tenant_id: 'tenant-2' },
      ],
      profiles: [
        { id: 'resident-1', role: 'user', is_active: true, created_at: '2026-03-09T00:00:00.000Z', last_login: '2026-03-11T00:00:00.000Z', community_id: 'community-1', unit_id: 'unit-1' },
        { id: 'resident-2', role: 'user', is_active: true, created_at: '2026-03-09T00:00:00.000Z', last_login: '2026-03-11T00:00:00.000Z', community_id: 'community-2', unit_id: 'unit-2' },
      ],
      visitor_passes: [
        {
          id: 'visit-1',
          from_date: '2026-03-11T08:00:00.000Z',
          to_date: '2026-03-13T20:00:00.000Z',
          status: 'approved',
          community_id: 'community-1',
          unit_id: 'unit-1',
        },
        {
          id: 'visit-2',
          from_date: '2026-03-11T08:00:00.000Z',
          to_date: '2026-03-13T20:00:00.000Z',
          status: 'approved',
          community_id: 'community-2',
          unit_id: 'unit-2',
        },
      ],
    };

    const req = createMockRequest({ query: { days: '7' } });
    const res = createMockResponse();
    const next = vi.fn();

    await getAnalyticsDashboard(req, res, next as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect((res.body as any).data.summary.totalUnits).toBe(1);
    expect((res.body as any).data.summary.activeResidents).toBe(1);
    expect((res.body as any).data.communityDistribution).toEqual([
      expect.objectContaining({ id: 'community-1', name: 'Alpha Court', count: 1 }),
    ]);
  });

  it('returns an empty resident dashboard when the admin has no scoped communities', async () => {
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'facility_manager',
      profileId: 'admin-1',
      email: 'manager@example.com',
      isGlobal: false,
      communityIds: [],
      agencyIds: [],
    });

    supabaseState.tables = {
      profiles: [
        { id: 'resident-1', role: 'user', is_active: true, created_at: '2026-03-01T00:00:00.000Z', community_id: 'community-1', unit_id: 'unit-1' },
      ],
      units: [
        { id: 'unit-1', community_id: 'community-1', created_at: '2026-03-01T00:00:00.000Z', status: 'occupied', owner_id: null, tenant_id: 'tenant-1' },
      ],
      communities: [{ id: 'community-1', name: 'Alpha Court', address: 'North Ridge' }],
      maintenance_requests: [
        { id: 1, created_at: '2026-03-05T00:00:00.000Z', resolved_at: null, completed_at: null, status: 'open', unit_id: 'unit-1' },
      ],
      inquiries: [
        { id: 'inquiry-1', created_at: '2026-03-06T00:00:00.000Z', satisfaction_rating: 4, community_id: 'community-1', user_id: 'resident-1' },
      ],
    };

    const req = createMockRequest({ query: { months: '12' } });
    const res = createMockResponse();
    const next = vi.fn();

    await getResidentDashboard(req, res, next as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect((res.body as any).data.summary.totalResidents).toBe(0);
    expect((res.body as any).data.roster.recentResidents).toEqual([]);
    expect((res.body as any).data.stats.allResidentsPerSociety).toEqual([]);
  });

  it('filters guard dashboard data to the scoped guard set', async () => {
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'facility_manager',
      profileId: 'admin-1',
      email: 'manager@example.com',
      isGlobal: false,
      communityIds: ['community-1'],
      agencyIds: [],
    });
    scopeMocks.getScopedGuardIds.mockResolvedValue(['guard-1']);

    supabaseState.tables = {
      communities: [
        { id: 'community-1', name: 'Alpha Court', address: 'North Ridge' },
        { id: 'community-2', name: 'Beta Court', address: 'Airport' },
      ],
      units: [
        { id: 'unit-1', community_id: 'community-1', created_at: '2026-03-01T00:00:00.000Z', status: 'occupied', owner_id: null, tenant_id: 'tenant-1' },
      ],
      guards: [
        { id: 'guard-1', full_name: 'Guard One', community_id: 'community-1', is_active: true, salary: 1200, phone: '233200000001', email: 'guard1@example.com' },
        { id: 'guard-2', full_name: 'Guard Two', community_id: 'community-2', is_active: true, salary: 1300, phone: '233200000002', email: 'guard2@example.com' },
      ],
      guard_assignments: [
        {
          id: 'assignment-1',
          guard_id: 'guard-1',
          community_id: 'community-1',
          assignment_name: 'Main Gate',
          shift_type: 'day',
          start_date: '2026-03-10',
          end_date: null,
          status: 'active',
          assigned_location: 'Main Gate',
          assigned_gate: null,
          responsibilities: [],
          emergency_contact: null,
          special_instructions: null,
          created_at: '2026-03-11T10:00:00.000Z',
          updated_at: '2026-03-11T10:00:00.000Z',
        },
        {
          id: 'assignment-2',
          guard_id: 'guard-2',
          community_id: 'community-2',
          assignment_name: 'West Gate',
          shift_type: 'night',
          start_date: '2026-03-10',
          end_date: null,
          status: 'active',
          assigned_location: 'West Gate',
          assigned_gate: null,
          responsibilities: [],
          emergency_contact: null,
          special_instructions: null,
          created_at: '2026-03-11T10:00:00.000Z',
          updated_at: '2026-03-11T10:00:00.000Z',
        },
      ],
      guard_shifts: [
        { guard_id: 'guard-1', community_id: 'community-1', shift_date: '2026-03-12', start_time: '08:00:00', end_time: '16:00:00', status: 'scheduled' },
        { guard_id: 'guard-2', community_id: 'community-2', shift_date: '2026-03-12', start_time: '08:00:00', end_time: '16:00:00', status: 'scheduled' },
      ],
      guard_performance_metrics: [
        {
          id: 'metric-1',
          guard_id: 'guard-1',
          overall_rating: 4.8,
          punctuality_rating: 4.7,
          professionalism_rating: 4.9,
          reliability_rating: 4.6,
          communication_rating: 4.5,
          attendance_percentage: 98,
          total_shifts: 24,
          completed_shifts: 23,
          late_arrivals: 0,
          incident_reports: 1,
          compliments: 3,
          complaints: 0,
          last_review_date: '2026-03-01',
          next_review_date: '2026-04-01',
          status: 'excellent',
        },
        {
          id: 'metric-2',
          guard_id: 'guard-2',
          overall_rating: 4.2,
          punctuality_rating: 4.0,
          professionalism_rating: 4.1,
          reliability_rating: 4.3,
          communication_rating: 4.0,
          attendance_percentage: 91,
          total_shifts: 20,
          completed_shifts: 19,
          late_arrivals: 1,
          incident_reports: 0,
          compliments: 1,
          complaints: 0,
          last_review_date: '2026-03-01',
          next_review_date: '2026-04-01',
          status: 'good',
        },
      ],
      guard_performance: [
        { guard_id: 'guard-1', evaluation_date: '2026-02-01', overall_score: 95, attendance_score: 97 },
        { guard_id: 'guard-2', evaluation_date: '2026-02-01', overall_score: 80, attendance_score: 85 },
      ],
      guard_training: [
        { guard_id: 'guard-1', status: 'completed', certification_expiry: '2026-12-01', end_date: '2026-02-05' },
        { guard_id: 'guard-2', status: 'scheduled', certification_expiry: '2026-12-01', end_date: '2026-02-05' },
      ],
      guard_trainings: [
        { guard_id: 'guard-1', status: 'completed', score: 94 },
        { guard_id: 'guard-2', status: 'in_progress', score: 88 },
      ],
      guard_certifications: [
        { guard_id: 'guard-1', status: 'valid' },
        { guard_id: 'guard-2', status: 'expired' },
      ],
      training_programs: [{ status: 'active' }],
    };

    const req = createMockRequest({ query: { weeks: '4' } });
    const res = createMockResponse();
    const next = vi.fn();

    await getGuardDashboard(req, res, next as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect((res.body as any).data.summary.totalGuards).toBe(1);
    expect((res.body as any).data.topGuards).toHaveLength(1);
    expect((res.body as any).data.topGuardProfile.guardId).toBe('guard-1');
    expect((res.body as any).data.communityOverview).toEqual([
      expect.objectContaining({ id: 'community-1', currentGuards: 1 }),
    ]);
  });

  it.each([
    ['/dashboard/analytics', { days: '3' }],
    ['/dashboard/residents', { months: '1' }],
    ['/dashboard/guards', { weeks: '1' }],
  ])('rejects malformed dashboard query input for %s', async (path, query) => {
    const validate = findRouteHandler(adminRoutes as unknown as { stack?: RouteLayer[] }, path, 'get', 2);
    const req = createMockRequest({
      originalUrl: `/admin${path}`,
      url: `/admin${path}`,
      query,
    });

    const res = await runValidationMiddleware(validate, req);

    expect(res.statusCode).toBe(400);
    expect((res.body as any).error.code).toBe('VALIDATION_ERROR');
  });
});
