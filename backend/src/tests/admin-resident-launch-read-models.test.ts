import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';

import {
  createResident,
  getResidentActivity,
  getResidentDirectory,
  listResidents,
} from '../controllers/adminResidents';
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
  let limitCount: number | null = null;

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
    limit(value: number) {
      limitCount = value;
      return builder;
    },
    maybeSingle() {
      const resultRows = limitCount === null ? rows : rows.slice(0, limitCount);
      return Promise.resolve({ data: resultRows[0] || null, error: null, count: resultRows.length });
    },
    single() {
      const resultRows = limitCount === null ? rows : rows.slice(0, limitCount);
      return Promise.resolve({ data: resultRows[0] || null, error: null, count: resultRows.length });
    },
    then(resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) {
      const resultRows = limitCount === null ? rows : rows.slice(0, limitCount);
      return Promise.resolve({
        data: headOnly ? null : resultRows,
        error: null,
        count: countRequested ? resultRows.length : null,
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
  method: 'get' | 'post',
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

describe('Admin resident launch read models', () => {
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

  it('returns scoped residents with derived tenant role and residence context', async () => {
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
          last_name: 'Mensah',
          full_name: null,
          email: 'ama@example.com',
          phone: '2330000001',
          avatar_url: null,
          block_number: null,
          community_id: 'community-1',
          unit_id: 'unit-1',
          role: 'resident',
          status: 'active',
          is_active: true,
          emergency_contact: null,
          preferences: { address: 'Accra' },
          created_at: '2026-03-01T10:00:00.000Z',
          updated_at: '2026-03-02T10:00:00.000Z',
        },
        {
          id: 'resident-2',
          user_id: 'auth-2',
          first_name: 'Kojo',
          last_name: 'Owusu',
          full_name: null,
          email: 'kojo@example.com',
          phone: '2330000002',
          avatar_url: null,
          block_number: null,
          community_id: 'community-2',
          unit_id: 'unit-2',
          role: 'resident',
          status: 'active',
          is_active: true,
          emergency_contact: null,
          preferences: null,
          created_at: '2026-03-03T10:00:00.000Z',
          updated_at: '2026-03-04T10:00:00.000Z',
        },
      ],
      units: [
        { id: 'unit-1', block: 'A', number: '101', unit_number: 'A-101', community_id: 'community-1', tenant_id: 'resident-1', owner_id: null },
        { id: 'unit-2', block: 'B', number: '202', unit_number: 'B-202', community_id: 'community-2', tenant_id: null, owner_id: null },
      ],
      communities: [
        { id: 'community-1', name: 'Palm Residences', address: 'Airport', city: 'Accra', state: 'Greater Accra' },
        { id: 'community-2', name: 'Harbor View', address: 'Tema', city: 'Tema', state: 'Greater Accra' },
      ],
    };

    const req = createMockRequest({ query: { page: '1', limit: '20' } });
    const res = createMockResponse();
    const next = vi.fn();

    await listResidents(req, res, next as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect((res.body as any).data).toHaveLength(1);
    expect((res.body as any).data[0]).toEqual(
      expect.objectContaining({
        id: 'resident-1',
        full_name: 'Ama Mensah',
        role: 'tenant',
        unit_number: 'A-101',
        community_id: 'community-1',
        communities: expect.objectContaining({ name: 'Palm Residences' }),
      })
    );
  });

  it('returns resident activity summary and recent records from live tables', async () => {
    supabaseState.tables = {
      profiles: [
        {
          id: 'resident-1',
          user_id: 'auth-1',
          first_name: 'Ama',
          last_name: 'Mensah',
          full_name: 'Ama Mensah',
          email: 'ama@example.com',
          phone: '2330000001',
          avatar_url: null,
          block_number: null,
          community_id: 'community-1',
          unit_id: 'unit-1',
          role: 'resident',
          status: 'active',
          is_active: true,
          emergency_contact: null,
          preferences: null,
          created_at: '2026-03-01T10:00:00.000Z',
          updated_at: '2026-03-02T10:00:00.000Z',
        },
      ],
      units: [
        { id: 'unit-1', block: 'A', number: '101', unit_number: 'A-101', community_id: 'community-1', tenant_id: 'resident-1', owner_id: null },
      ],
      communities: [
        { id: 'community-1', name: 'Palm Residences', address: 'Airport', city: 'Accra', state: 'Greater Accra' },
      ],
      payments: [
        { id: 'payment-1', amount: 1200, status: 'completed', title: 'March Dues', description: null, due_date: '2026-03-05T00:00:00.000Z', paid_at: '2026-03-04T00:00:00.000Z', completed_at: null, payment_date: null, created_at: '2026-03-01T00:00:00.000Z', notes: 'Paid on time', unit_id: 'unit-1' },
        { id: 'payment-2', amount: 900, status: 'pending', title: 'April Dues', description: null, due_date: '2026-04-05T00:00:00.000Z', paid_at: null, completed_at: null, payment_date: null, created_at: '2026-04-01T00:00:00.000Z', notes: null, unit_id: 'unit-1' },
      ],
      maintenance_requests: [
        { id: 14, title: 'Leak Repair', request_type: 'plumbing', status: 'open', created_at: '2026-03-06T10:00:00.000Z', updated_at: '2026-03-06T12:00:00.000Z', resolved_at: null, completed_at: null, description: 'Kitchen sink', requested_by: 'resident-1' },
      ],
      service_requests: [
        { id: 'service-1', title: 'Cleaning', status: 'pending', created_at: '2026-03-08T10:00:00.000Z', updated_at: '2026-03-08T11:00:00.000Z', request_details: 'Deep clean', description: null, total_amount: 150, user_id: 'auth-1', created_by: 'someone-else' },
        { id: 'service-2', title: 'Laundry', status: 'completed', created_at: '2026-03-07T10:00:00.000Z', updated_at: '2026-03-07T11:00:00.000Z', request_details: 'Weekly laundry', description: null, total_amount: 80, user_id: null, created_by: 'resident-1' },
      ],
      activity_logs: [
        { id: 'activity-1', action: 'Profile updated', details: 'Phone number changed', status: 'completed', created_at: '2026-03-09T09:30:00.000Z', timestamp: null, user_id: 'auth-1' },
      ],
    };

    const req = createMockRequest({ params: { id: 'resident-1' } });
    const res = createMockResponse();
    const next = vi.fn();

    await getResidentActivity(req, res, next as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect((res.body as any).data.summary).toEqual({
      totalRequests: 3,
      paymentsMade: 1,
      activeServices: 1,
      completedPayments: 1,
      pendingPayments: 1,
    });
    expect((res.body as any).data.recent).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'payment', title: 'April Dues' }),
        expect.objectContaining({ type: 'maintenance', title: 'Leak Repair' }),
        expect.objectContaining({ type: 'service', title: 'Cleaning' }),
        expect.objectContaining({ type: 'activity', title: 'Profile updated' }),
      ])
    );
  });

  it('returns empty resident directory sections truthfully when there are no entries', async () => {
    supabaseState.tables = {
      profiles: [
        {
          id: 'resident-1',
          user_id: 'auth-1',
          first_name: 'Ama',
          last_name: 'Mensah',
          full_name: 'Ama Mensah',
          email: 'ama@example.com',
          phone: '2330000001',
          avatar_url: null,
          block_number: null,
          community_id: 'community-1',
          unit_id: 'unit-1',
          role: 'resident',
          status: 'active',
          is_active: true,
          emergency_contact: null,
          preferences: null,
          created_at: '2026-03-01T10:00:00.000Z',
          updated_at: '2026-03-02T10:00:00.000Z',
        },
      ],
      units: [
        { id: 'unit-1', block: 'A', number: '101', unit_number: 'A-101', community_id: 'community-1', tenant_id: 'resident-1', owner_id: null },
      ],
      communities: [
        { id: 'community-1', name: 'Palm Residences', address: 'Airport', city: 'Accra', state: 'Greater Accra' },
      ],
      family_members: [],
      daily_help: [],
      vehicles: [],
      frequent_entries: [],
    };

    const req = createMockRequest({ params: { id: 'resident-1' } });
    const res = createMockResponse();
    const next = vi.fn();

    await getResidentDirectory(req, res, next as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect((res.body as any).data).toEqual({
      familyMembers: [],
      dailyHelp: [],
      vehicles: [],
      frequentEntries: [],
    });
  });

  it('blocks resident creation outside the admin scope', async () => {
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'facility_manager',
      profileId: 'admin-1',
      email: 'manager@example.com',
      isGlobal: false,
      communityIds: ['community-1'],
      agencyIds: [],
    });

    const req = createMockRequest({
      body: {
        first_name: 'Ama',
        last_name: 'Mensah',
        email: 'ama@example.com',
        role: 'resident',
        community_id: 'community-2',
      },
    });
    const res = createMockResponse();
    const next = vi.fn();

    await createResident(req, res, next as NextFunction);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toMatchObject({
      statusCode: 403,
      code: 'RESIDENT_SCOPE_VIOLATION',
    });
  });

  it('rejects malformed resident create payloads via route validation', async () => {
    const validationMiddleware = findRouteHandler(adminRoutes as unknown as { stack?: RouteLayer[] }, '/residents', 'post', 2);
    const req = createMockRequest({
      body: {
        first_name: 'Ama',
        last_name: 'Mensah',
        email: 'ama@example.com',
        role: 'admin',
      },
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
