import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';

import {
  createMarketplaceCategory,
  getMarketplaceWorkspace,
  updateMarketplaceOrderStatus,
  updateMarketplaceReviewVisibility,
} from '../controllers/adminMarketplace';
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
  let operation: 'read' | 'insert' | 'update' = 'read';
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
        const updated = {
          ...row,
          ...(updatePayload || {}),
          updated_at: '2026-03-13T13:00:00.000Z',
        };
        updatedRows.push(updated);
        return updated;
      });
      setRows(nextRows);
      return { data: updatedRows, error: null };
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
        created_at: entry.created_at || '2026-03-13T12:00:00.000Z',
        updated_at: entry.updated_at || '2026-03-13T12:00:00.000Z',
        ...entry,
      })) as Record<string, any>[];
      operation = 'insert';
      return builder;
    },
    update(payload: Record<string, unknown>) {
      updatePayload = payload as Record<string, any>;
      operation = 'update';
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
      role: 'superadmin',
      email: 'admin@example.com',
      community_id: null,
    },
    permissions: ['read:all_payments', 'create:payments', 'update:payments'],
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
  method: 'post' | 'patch',
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

describe('Admin Personal Hub marketplace launch contracts', () => {
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

  it('returns a marketplace workspace with derived metrics and customer joins', async () => {
    supabaseState.tables = {
      marketplace_categories: [
        {
          id: 'category-1',
          name: 'Essentials',
          category_type: 'local',
          display_order: 1,
          is_active: true,
        },
      ],
      marketplace_products: [
        {
          id: 'product-1',
          name: 'Rice Pack',
          category_id: 'category-1',
          vendor_id: 'vendor-1',
          price: 60,
          sales_count: 4,
          is_active: true,
          is_featured: true,
          marketplace_categories: { name: 'Essentials' },
          marketplace_vendors: { store_name: 'Shop One' },
          created_at: '2026-03-12T08:00:00.000Z',
        },
      ],
      marketplace_vendors: [
        {
          id: 'vendor-1',
          store_name: 'Shop One',
          is_active: true,
          is_verified: true,
          rating: 4.5,
          review_count: 3,
        },
      ],
      marketplace_orders: [
        {
          id: 'order-1',
          order_number: 'ORD-1001',
          vendor_id: 'vendor-1',
          user_id: 'user-1',
          status: 'delivered',
          payment_method: 'mobile_money',
          payment_status: 'paid',
          total_amount: 60,
          final_amount: 58,
          created_at: '2026-03-10T09:00:00.000Z',
          marketplace_vendors: { store_name: 'Shop One' },
          marketplace_order_items: [
            {
              id: 'item-1',
              quantity: 2,
              total_price: 58,
              unit_price: 29,
              marketplace_products: {
                name: 'Rice Pack',
                images: ['https://example.com/rice.png'],
              },
            },
          ],
        },
        {
          id: 'order-2',
          order_number: 'ORD-1002',
          vendor_id: 'vendor-1',
          user_id: 'user-2',
          status: 'pending',
          payment_method: 'card',
          payment_status: 'pending',
          total_amount: 40,
          final_amount: 40,
          created_at: '2026-02-01T09:00:00.000Z',
          marketplace_vendors: { store_name: 'Shop One' },
          marketplace_order_items: [],
        },
      ],
      marketplace_reviews: [
        {
          id: 'review-1',
          product_id: 'product-1',
          user_id: 'user-1',
          rating: 5,
          review_text: 'Great quality',
          is_active: true,
          is_verified_purchase: true,
          created_at: '2026-03-11T09:00:00.000Z',
          marketplace_products: {
            name: 'Rice Pack',
            images: ['https://example.com/rice.png'],
          },
        },
      ],
      profiles: [
        { id: 'user-1', name: 'Resident One', email: 'resident1@example.com' },
        { id: 'user-2', name: 'Resident Two', email: 'resident2@example.com' },
      ],
    };

    const { res, next } = await runController(getMarketplaceWorkspace, createMockRequest());

    expect(next).not.toHaveBeenCalled();
    expect((res.body as any).data.metrics.totalOrders).toBe(2);
    expect((res.body as any).data.metrics.activeVendors).toBe(1);
    expect((res.body as any).data.categories[0]).toEqual(
      expect.objectContaining({ id: 'category-1', product_count: 1 })
    );
    expect((res.body as any).data.orders[0]).toEqual(
      expect.objectContaining({
        order_number: 'ORD-1001',
        customer_name: 'Resident One',
        vendor_name: 'Shop One',
        item_count: 2,
      })
    );
    expect((res.body as any).data.reviews[0]).toEqual(
      expect.objectContaining({
        customer_email: 'resident1@example.com',
        product_name: 'Rice Pack',
      })
    );
  });

  it('returns an empty marketplace workspace when no rows exist', async () => {
    const { res, next } = await runController(getMarketplaceWorkspace, createMockRequest());

    expect(next).not.toHaveBeenCalled();
    expect((res.body as any).data.categories).toEqual([]);
    expect((res.body as any).data.products).toEqual([]);
    expect((res.body as any).data.metrics).toEqual({
      totalOrders: 0,
      grossMerchandiseValue: 0,
      fulfillmentRate: 0,
      activeVendors: 0,
      growth: {
        orders: 0,
        revenue: 0,
        fulfillmentRate: 0,
      },
    });
  });

  it('denies scoped admins from using the marketplace workspace', async () => {
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'facility_manager',
      profileId: 'admin-2',
      email: 'manager@example.com',
      isGlobal: false,
      communityIds: ['community-1'],
      agencyIds: [],
    });

    const { res } = await runController(getMarketplaceWorkspace, createMockRequest());

    expect(res.statusCode).toBe(403);
    expect((res.body as any).error.code).toBe('MARKETPLACE_WORKSPACE_FORBIDDEN');
  });

  it('creates categories and updates order/review lifecycle fields through the admin controllers', async () => {
    supabaseState.tables = {
      marketplace_categories: [],
      marketplace_orders: [
        { id: 'order-1', order_number: 'ORD-1001', status: 'pending', total_amount: 60, final_amount: 60 },
      ],
      marketplace_reviews: [
        { id: 'review-1', rating: 5, is_active: true },
      ],
    };

    const createResult = await runController(
      createMarketplaceCategory,
      createMockRequest({
        method: 'POST',
        body: {
          name: 'Fresh Foods',
          category_type: 'local',
          display_order: 2,
          is_active: true,
        },
      })
    );

    expect(createResult.res.statusCode).toBe(201);
    expect((createResult.res.body as any).data.name).toBe('Fresh Foods');
    expect(supabaseState.tables.marketplace_categories).toHaveLength(1);

    const orderResult = await runController(
      updateMarketplaceOrderStatus,
      createMockRequest({
        method: 'PATCH',
        params: { id: 'order-1' },
        body: { status: 'processing' },
      })
    );

    expect(orderResult.res.statusCode).toBe(200);
    expect((orderResult.res.body as any).data.status).toBe('processing');

    const reviewResult = await runController(
      updateMarketplaceReviewVisibility,
      createMockRequest({
        method: 'PATCH',
        params: { id: 'review-1' },
        body: { is_active: false },
      })
    );

    expect(reviewResult.res.statusCode).toBe(200);
    expect((reviewResult.res.body as any).data.is_active).toBe(false);
  });

  it('validates malformed marketplace payloads before hitting the controllers', async () => {
    const categoryValidation = findRouteHandler(
      adminRoutes,
      '/personal-hub/marketplace/categories',
      'post',
      2
    );

    const invalidCategoryResponse = await runValidationMiddleware(
      categoryValidation,
      createMockRequest({
        method: 'POST',
        body: {
          name: '',
        },
      })
    );

    expect(invalidCategoryResponse.statusCode).toBe(400);
    expect((invalidCategoryResponse.body as any).error.code).toBe('VALIDATION_ERROR');

    const orderStatusValidation = findRouteHandler(
      adminRoutes,
      '/personal-hub/marketplace/orders/:id/status',
      'patch',
      2
    );

    const invalidOrderStatusResponse = await runValidationMiddleware(
      orderStatusValidation,
      createMockRequest({
        method: 'PATCH',
        params: { id: 'order-1' },
        body: {
          status: 'archived',
        },
      })
    );

    expect(invalidOrderStatusResponse.statusCode).toBe(400);
    expect((invalidOrderStatusResponse.body as any).error.code).toBe('VALIDATION_ERROR');
  });
});
