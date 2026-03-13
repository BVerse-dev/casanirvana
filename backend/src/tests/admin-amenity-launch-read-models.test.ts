import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';

import {
  createAmenity,
  listAmenityBookings,
  listAmenities,
  updateAmenityBooking,
} from '../controllers/adminAmenities';
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
  let insertPayloads: Record<string, any>[] = [];
  let updatePayload: Record<string, any> | null = null;

  const getRows = () => [...(supabaseState.tables[table] || [])];
  const setRows = (rows: Record<string, any>[]) => {
    supabaseState.tables[table] = rows;
  };

  const applyFilters = (rows: Record<string, any>[]) => rows.filter((row) => filters.every((filter) => filter(row)));

  const execute = () => {
    if (operation === 'insert') {
      const currentRows = getRows();
      const insertedRows = insertPayloads.map((row, index) => ({
        id: row.id || `${table}-${currentRows.length + index + 1}`,
        ...row,
      }));
      setRows([...currentRows, ...insertedRows]);
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
    update(payload: Record<string, any>) {
      operation = 'update';
      updatePayload = payload;
      return builder;
    },
    insert(payload: Record<string, any> | Record<string, any>[]) {
      operation = 'insert';
      insertPayloads = Array.isArray(payload) ? payload : [payload];
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
  method: 'patch',
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

describe('Admin amenity launch read models', () => {
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

  it('returns scoped amenities with community enrichment', async () => {
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'facility_manager',
      profileId: 'profile-facility',
      email: 'facility@example.com',
      isGlobal: false,
      communityIds: ['community-1'],
      agencyIds: [],
    });

    supabaseState.tables = {
      amenities: [
        {
          id: 'amenity-1',
          community_id: 'community-1',
          name: 'Pool',
          status: 'active',
          is_active: true,
          is_paid: true,
          price_per_hour: 25,
          created_at: '2026-03-12T08:00:00.000Z',
        },
        {
          id: 'amenity-2',
          community_id: 'community-2',
          name: 'Gym',
          status: 'active',
          is_active: true,
          created_at: '2026-03-11T08:00:00.000Z',
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

    await listAmenities(req, res, next as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      data: [
        expect.objectContaining({
          id: 'amenity-1',
          community_id: 'community-1',
          communityName: 'Casa Nirvana One',
          communities: expect.objectContaining({
            id: 'community-1',
            name: 'Casa Nirvana One',
          }),
        }),
      ],
    });
  });

  it('rejects amenity creation outside the admin community scope', async () => {
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
        name: 'Clubhouse',
        community_id: 'community-2',
      },
    });
    const res = createMockResponse();
    const next = vi.fn();

    await createAmenity(req, res, next as NextFunction);
    errorHandler(next.mock.calls[0]?.[0], req, res, vi.fn() as NextFunction);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'AMENITY_SCOPE_VIOLATION',
        }),
      })
    );
  });

  it('returns scoped amenity bookings with amenity and resident enrichment', async () => {
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'facility_manager',
      profileId: 'profile-facility',
      email: 'facility@example.com',
      isGlobal: false,
      communityIds: ['community-1'],
      agencyIds: [],
    });

    supabaseState.tables = {
      amenities: [
        {
          id: 'amenity-1',
          community_id: 'community-1',
          name: 'Pool',
          amenity_type: 'Recreation',
          description: 'Main pool',
        },
        {
          id: 'amenity-2',
          community_id: 'community-2',
          name: 'Gym',
          amenity_type: 'Fitness',
        },
      ],
      amenity_bookings: [
        {
          id: 'booking-1',
          amenity_id: 'amenity-1',
          user_id: 'profile-resident-1',
          booking_date: '2026-03-12',
          start_time: '10:00:00',
          end_time: '11:00:00',
          status: 'pending',
          payment_status: 'paid',
          total_amount: 50,
          amount: 50,
          created_at: '2026-03-12T08:00:00.000Z',
          updated_at: '2026-03-12T08:00:00.000Z',
        },
        {
          id: 'booking-2',
          amenity_id: 'amenity-2',
          user_id: 'profile-resident-2',
          booking_date: '2026-03-13',
          start_time: '09:00:00',
          end_time: '10:00:00',
          status: 'pending',
          payment_status: 'pending',
          total_amount: 20,
          amount: 20,
          created_at: '2026-03-11T08:00:00.000Z',
          updated_at: '2026-03-11T08:00:00.000Z',
        },
      ],
      profiles: [
        {
          id: 'profile-resident-1',
          first_name: 'Ama',
          last_name: 'Mensah',
          full_name: 'Ama Mensah',
          email: 'ama@example.com',
          phone: '0240000000',
        },
        {
          id: 'profile-resident-2',
          first_name: 'Kofi',
          last_name: 'Boateng',
          full_name: 'Kofi Boateng',
          email: 'kofi@example.com',
        },
      ],
    };

    const req = createMockRequest();
    const res = createMockResponse();
    const next = vi.fn();

    await listAmenityBookings(req, res, next as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      data: [
        expect.objectContaining({
          id: 'booking-1',
          amenities: expect.objectContaining({
            id: 'amenity-1',
            name: 'Pool',
          }),
          user_profile: expect.objectContaining({
            id: 'profile-resident-1',
            email: 'ama@example.com',
          }),
        }),
      ],
    });
  });

  it('applies valid scoped booking lifecycle updates', async () => {
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'facility_manager',
      profileId: 'profile-facility',
      email: 'facility@example.com',
      isGlobal: false,
      communityIds: ['community-1'],
      agencyIds: [],
    });

    supabaseState.tables = {
      amenities: [
        {
          id: 'amenity-1',
          community_id: 'community-1',
          name: 'Pool',
          amenity_type: 'Recreation',
        },
      ],
      amenity_bookings: [
        {
          id: 'booking-1',
          amenity_id: 'amenity-1',
          community_id: 'community-1',
          user_id: 'profile-resident-1',
          status: 'pending',
          payment_status: 'pending',
          created_at: '2026-03-12T08:00:00.000Z',
          updated_at: '2026-03-12T08:00:00.000Z',
        },
      ],
      profiles: [
        {
          id: 'profile-resident-1',
          first_name: 'Ama',
          last_name: 'Mensah',
          full_name: 'Ama Mensah',
          email: 'ama@example.com',
        },
      ],
    };

    const req = createMockRequest({
      params: { id: 'booking-1' },
      body: { status: 'confirmed', payment_status: 'paid' },
    });
    const res = createMockResponse();
    const next = vi.fn();

    await updateAmenityBooking(req, res, next as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          id: 'booking-1',
          status: 'confirmed',
          payment_status: 'paid',
        }),
      })
    );
  });

  it('validates booking update payloads on the admin route', async () => {
    const validationMiddleware = findRouteHandler(adminRoutes as unknown as { stack?: RouteLayer[] }, '/amenity-bookings/:id', 'patch', 2);

    const response = await runValidationMiddleware(
      validationMiddleware,
      createMockRequest({
        params: { id: 'booking-1' },
        body: { status: 'archived' },
      })
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
