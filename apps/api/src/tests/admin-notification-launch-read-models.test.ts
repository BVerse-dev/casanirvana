import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';

import {
  createNotificationCampaign,
  getNotificationAnalytics,
  getNotificationCampaign,
  getNotificationDashboard,
  listNotificationCampaigns,
  listNotificationTemplates,
} from '../controllers/adminNotifications';
import { errorHandler } from '../middleware/errorHandler';

const supabaseState = vi.hoisted(() => ({
  tables: {} as Record<string, Record<string, any>[]>,
}));

function createQueryBuilder(table: string) {
  const filters: Array<(row: Record<string, any>) => boolean> = [];
  const sortRules: Array<{ column: string; ascending: boolean }> = [];
  let limitValue: number | null = null;
  let operation: 'read' | 'insert' | 'update' | 'delete' = 'read';
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
    contains(column: string, value: unknown[]) {
      filters.push((row) => Array.isArray(row[column]) && value.every((entry) => row[column].includes(entry)));
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
        created_at: entry.created_at || '2026-03-13T10:00:00.000Z',
        updated_at: entry.updated_at || '2026-03-13T10:00:00.000Z',
        ...entry,
      })) as Record<string, any>[];
      operation = 'insert';
      return builder;
    },
    update(payload: Record<string, unknown>) {
      updatePayload = {
        ...payload,
        updated_at: (payload as Record<string, unknown>).updated_at || '2026-03-13T11:00:00.000Z',
      } as Record<string, any>;
      operation = 'update';
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
    permissions: ['read:all_notifications', 'write:all_notifications'],
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

describe('Admin notification launch read models', () => {
  let adminRoutes: Awaited<typeof import('../routes/admin')>['default'];

  beforeAll(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-13T12:00:00.000Z'));
    ({ default: adminRoutes } = await import('../routes/admin'));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    supabaseState.tables = {};
  });

  it('lists notification campaigns through the audited backend contract', async () => {
    supabaseState.tables = {
      notification_campaigns: [
        {
          id: 'campaign-1',
          title: 'Late fee notice',
          name: 'Late fee notice',
          type: 'email',
          status: 'scheduled',
          recipients_count: 32,
          delivered_count: 0,
          opened_count: 0,
          clicked_count: 0,
          failed_count: 0,
          created_at: '2026-03-13T08:00:00.000Z',
          updated_at: '2026-03-13T08:00:00.000Z',
        },
        {
          id: 'campaign-2',
          title: 'Visitor reminder',
          name: 'Visitor reminder',
          type: 'sms',
          status: 'delivered',
          recipients_count: 20,
          delivered_count: 18,
          opened_count: 0,
          clicked_count: 0,
          failed_count: 2,
          created_at: '2026-03-12T08:00:00.000Z',
          updated_at: '2026-03-12T08:00:00.000Z',
        },
      ],
    };

    const { res, next } = await runController(
      listNotificationCampaigns,
      createMockRequest({ query: { type: 'email', limit: '10', offset: '0' } })
    );

    expect(next).not.toHaveBeenCalled();
    expect((res.body as any).data.total).toBe(1);
    expect((res.body as any).data.items).toEqual([
      expect.objectContaining({ id: 'campaign-1', type: 'email' }),
    ]);
  });

  it('keeps scoped admins inside their notification campaign tenant boundary', async () => {
    supabaseState.tables = {
      notification_campaigns: [
        {
          id: 'campaign-community-a',
          title: 'Community A Notice',
          name: 'Community A Notice',
          type: 'email',
          status: 'scheduled',
          community_id: '11111111-1111-1111-1111-111111111111',
          recipients_count: 12,
          delivered_count: 0,
          opened_count: 0,
          clicked_count: 0,
          failed_count: 0,
          created_at: '2026-03-13T08:00:00.000Z',
          updated_at: '2026-03-13T08:00:00.000Z',
        },
        {
          id: 'campaign-community-b',
          title: 'Community B Notice',
          name: 'Community B Notice',
          type: 'sms',
          status: 'delivered',
          community_id: '22222222-2222-2222-2222-222222222222',
          recipients_count: 20,
          delivered_count: 18,
          opened_count: 0,
          clicked_count: 0,
          failed_count: 2,
          created_at: '2026-03-12T08:00:00.000Z',
          updated_at: '2026-03-12T08:00:00.000Z',
        },
        {
          id: 'campaign-global',
          title: 'Legacy Global Notice',
          name: 'Legacy Global Notice',
          type: 'push',
          status: 'draft',
          community_id: null,
          recipients_count: 5,
          delivered_count: 0,
          opened_count: 0,
          clicked_count: 0,
          failed_count: 0,
          created_at: '2026-03-11T08:00:00.000Z',
          updated_at: '2026-03-11T08:00:00.000Z',
        },
      ],
    };

    const scopedRequest = createMockRequest({
      userProfile: {
        id: 'profile-scoped',
        role: 'agency_manager',
        email: 'scoped@example.com',
        community_id: '11111111-1111-1111-1111-111111111111',
      } as any,
    });

    const { res, next } = await runController(listNotificationCampaigns, scopedRequest);

    expect(next).not.toHaveBeenCalled();
    expect((res.body as any).data.items).toEqual([
      expect.objectContaining({ id: 'campaign-community-a', community_id: '11111111-1111-1111-1111-111111111111' }),
    ]);
  });

  it('returns truthful dashboard summary and channel performance from live campaign rows', async () => {
    supabaseState.tables = {
      notification_campaigns: [
        {
          id: 'campaign-today-1',
          title: 'Resident broadcast',
          name: 'Resident broadcast',
          type: 'sms',
          status: 'delivered',
          recipients_count: 100,
          delivered_count: 90,
          opened_count: 45,
          clicked_count: 9,
          failed_count: 10,
          sent_at: '2026-03-13T09:00:00.000Z',
          created_at: '2026-03-13T08:00:00.000Z',
          updated_at: '2026-03-13T09:00:00.000Z',
        },
        {
          id: 'campaign-today-2',
          title: 'Guard rota',
          name: 'Guard rota',
          type: 'push',
          status: 'scheduled',
          recipients_count: 5,
          delivered_count: 0,
          opened_count: 0,
          clicked_count: 0,
          failed_count: 0,
          scheduled_at: '2026-03-13T18:00:00.000Z',
          created_at: '2026-03-13T10:00:00.000Z',
          updated_at: '2026-03-13T10:00:00.000Z',
        },
        {
          id: 'campaign-yesterday',
          title: 'Yesterday bulletin',
          name: 'Yesterday bulletin',
          type: 'email',
          status: 'delivered',
          recipients_count: 40,
          delivered_count: 30,
          opened_count: 12,
          clicked_count: 3,
          failed_count: 10,
          sent_at: '2026-03-12T07:00:00.000Z',
          created_at: '2026-03-12T07:00:00.000Z',
          updated_at: '2026-03-12T07:00:00.000Z',
        },
      ],
    };

    const { res, next } = await runController(
      getNotificationDashboard,
      createMockRequest({ query: { limit: '2' } })
    );

    expect(next).not.toHaveBeenCalled();
    expect((res.body as any).data.recent_campaigns).toHaveLength(2);
    expect((res.body as any).data.today_summary).toEqual(
      expect.objectContaining({
        total_sent: 105,
        total_delivered: 90,
        total_opened: 45,
        total_clicked: 9,
        total_failed: 10,
        total_scheduled: 1,
      })
    );
    expect((res.body as any).data.channel_performance.sms).toEqual(
      expect.objectContaining({
        total_sent: 100,
        total_delivered: 90,
        performance_score: 90,
      })
    );
  });

  it('returns notification analytics with overview, channel breakdown, trends, and paged top campaigns', async () => {
    supabaseState.tables = {
      notification_campaigns: [
        {
          id: 'campaign-1',
          title: 'SMS A',
          name: 'SMS A',
          type: 'sms',
          status: 'delivered',
          recipients_count: 100,
          delivered_count: 90,
          opened_count: 50,
          clicked_count: 20,
          failed_count: 10,
          sent_at: '2026-03-10T08:00:00.000Z',
          created_at: '2026-03-10T07:30:00.000Z',
          updated_at: '2026-03-10T08:00:00.000Z',
        },
        {
          id: 'campaign-2',
          title: 'SMS B',
          name: 'SMS B',
          type: 'sms',
          status: 'delivered',
          recipients_count: 50,
          delivered_count: 45,
          opened_count: 15,
          clicked_count: 5,
          failed_count: 5,
          sent_at: '2026-03-11T08:00:00.000Z',
          created_at: '2026-03-11T07:30:00.000Z',
          updated_at: '2026-03-11T08:00:00.000Z',
        },
        {
          id: 'campaign-3',
          title: 'Email C',
          name: 'Email C',
          type: 'email',
          status: 'delivered',
          recipients_count: 80,
          delivered_count: 70,
          opened_count: 25,
          clicked_count: 10,
          failed_count: 10,
          sent_at: '2026-03-12T08:00:00.000Z',
          created_at: '2026-03-12T07:30:00.000Z',
          updated_at: '2026-03-12T08:00:00.000Z',
        },
      ],
    };

    const { res, next } = await runController(
      getNotificationAnalytics,
      createMockRequest({
        query: {
          dateRange: 'custom',
          startDate: '2026-03-09',
          endDate: '2026-03-12',
          channel: 'sms',
          page: '1',
          pageSize: '1',
        },
      })
    );

    expect(next).not.toHaveBeenCalled();
    expect((res.body as any).data.overview).toEqual(
      expect.objectContaining({
        totalCampaigns: 2,
        totalSent: 150,
        totalDelivered: 135,
        totalOpened: 65,
        totalClicked: 25,
      })
    );
    expect((res.body as any).data.channels).toEqual([
      expect.objectContaining({
        type: 'sms',
        campaignCount: 2,
        totalSent: 150,
      }),
    ]);
    expect((res.body as any).data.top_campaigns).toEqual(
      expect.objectContaining({
        totalCount: 2,
        currentPage: 1,
        pageSize: 1,
        campaigns: [expect.objectContaining({ id: 'campaign-1', opened: 50 })],
      })
    );
    expect((res.body as any).data.trends).toEqual([
      expect.objectContaining({ recipients_count: 100, created_at: '2026-03-10T08:00:00.000Z' }),
      expect.objectContaining({ recipients_count: 50, created_at: '2026-03-11T08:00:00.000Z' }),
    ]);
  });

  it('persists both title and name when creating a notification campaign', async () => {
    supabaseState.tables = {
      notification_campaigns: [],
      notification_templates: [],
    };

    const { res, next } = await runController(
      createNotificationCampaign,
      createMockRequest({
        method: 'POST',
        body: {
          title: 'Launch reminder',
          type: 'email',
          recipients_count: 12,
          audience: 'all-residents',
          status: 'draft',
        },
      })
    );

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(201);
    expect((res.body as any).title).toBe('Launch reminder');
    expect((res.body as any).name).toBe('Launch reminder');
    expect(supabaseState.tables.notification_campaigns[0]).toEqual(
      expect.objectContaining({
        title: 'Launch reminder',
        name: 'Launch reminder',
      })
    );
  });

  it('auto-assigns the only scoped community when a scoped admin creates a campaign', async () => {
    supabaseState.tables = {
      notification_campaigns: [],
      notification_templates: [],
    };

    const { res, next } = await runController(
      createNotificationCampaign,
      createMockRequest({
        method: 'POST',
        userProfile: {
          id: 'profile-scoped',
          role: 'agency_manager',
          email: 'scoped@example.com',
          community_id: '11111111-1111-1111-1111-111111111111',
        } as any,
        body: {
          title: 'Scoped launch reminder',
          type: 'email',
          recipients_count: 12,
          audience: 'all-residents',
          status: 'draft',
        },
      })
    );

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(201);
    expect((res.body as any).community_id).toBe('11111111-1111-1111-1111-111111111111');
    expect(supabaseState.tables.notification_campaigns[0]).toEqual(
      expect.objectContaining({
        title: 'Scoped launch reminder',
        community_id: '11111111-1111-1111-1111-111111111111',
      })
    );
  });

  it('requires community selection when a scoped admin has multiple communities', async () => {
    supabaseState.tables = {
      notification_campaigns: [],
      notification_templates: [],
      community_admins: [
        {
          user_id: 'profile-multi',
          community_id: '22222222-2222-2222-2222-222222222222',
        },
      ],
    };

    const { res, next } = await runController(
      createNotificationCampaign,
      createMockRequest({
        method: 'POST',
        userProfile: {
          id: 'profile-multi',
          role: 'facility_manager',
          email: 'multi@example.com',
          community_id: '11111111-1111-1111-1111-111111111111',
        } as any,
        body: {
          title: 'Needs explicit scope',
          type: 'push',
          recipients_count: 3,
          audience: 'all-residents',
          status: 'draft',
        },
      })
    );

    expect(next).toHaveBeenCalled();
    expect(res.statusCode).toBe(400);
    expect((res.body as any).error.code).toBe('NOTIFICATION_CAMPAIGN_COMMUNITY_REQUIRED');
  });

  it('blocks scoped admins from reading notification campaigns outside their tenant scope', async () => {
    supabaseState.tables = {
      notification_campaigns: [
        {
          id: 'campaign-community-b',
          title: 'Community B Notice',
          name: 'Community B Notice',
          type: 'sms',
          status: 'delivered',
          community_id: '22222222-2222-2222-2222-222222222222',
          recipients_count: 20,
          delivered_count: 18,
          opened_count: 0,
          clicked_count: 0,
          failed_count: 2,
          created_at: '2026-03-12T08:00:00.000Z',
          updated_at: '2026-03-12T08:00:00.000Z',
        },
      ],
    };

    const { res, next } = await runController(
      getNotificationCampaign,
      createMockRequest({
        params: { id: 'campaign-community-b' },
        userProfile: {
          id: 'profile-scoped',
          role: 'agency_manager',
          email: 'scoped@example.com',
          community_id: '11111111-1111-1111-1111-111111111111',
        } as any,
      })
    );

    expect(next).toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
    expect((res.body as any).error.code).toBe('NOTIFICATION_CAMPAIGN_SCOPE_VIOLATION');
  });

  it('returns 404 for an unknown notification campaign detail lookup', async () => {
    supabaseState.tables = {
      notification_campaigns: [],
    };

    const { res, next } = await runController(
      getNotificationCampaign,
      createMockRequest({ params: { id: 'missing-campaign' } })
    );

    expect(next).toHaveBeenCalled();
    expect(res.statusCode).toBe(404);
    expect((res.body as any).error.code).toBe('NOTIFICATION_CAMPAIGN_NOT_FOUND');
  });

  it('scopes notification template usage metrics to accessible campaigns', async () => {
    supabaseState.tables = {
      notification_templates: [
        {
          id: 7,
          template_name: 'Payment Reminder',
          name: 'Payment Reminder',
          type: 'email',
          category: 'billing',
          status: 'active',
          variables: [],
          updated_at: '2026-03-13T08:00:00.000Z',
        },
      ],
      notification_campaigns: [
        {
          id: 'campaign-community-a',
          template_id: 7,
          template: 'Payment Reminder',
          community_id: '11111111-1111-1111-1111-111111111111',
          sent_at: '2026-03-13T09:00:00.000Z',
          updated_at: '2026-03-13T09:00:00.000Z',
        },
        {
          id: 'campaign-community-b',
          template_id: 7,
          template: 'Payment Reminder',
          community_id: '22222222-2222-2222-2222-222222222222',
          sent_at: '2026-03-12T09:00:00.000Z',
          updated_at: '2026-03-12T09:00:00.000Z',
        },
      ],
    };

    const { res, next } = await runController(
      listNotificationTemplates,
      createMockRequest({
        userProfile: {
          id: 'profile-scoped',
          role: 'agency_manager',
          email: 'scoped@example.com',
          community_id: '11111111-1111-1111-1111-111111111111',
        } as any,
      })
    );

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([
      expect.objectContaining({
        id: 7,
        usage_count: 1,
        last_used: '2026-03-13T09:00:00.000Z',
      }),
    ]);
  });

  it('rejects custom analytics queries without an explicit date window', async () => {
    const validationMiddleware = findRouteHandler(adminRoutes, '/notifications/analytics', 'get', 2);

    const res = await runValidationMiddleware(
      validationMiddleware,
      createMockRequest({ query: { dateRange: 'custom', channel: 'sms' } })
    );

    expect(res.statusCode).toBe(400);
    expect((res.body as any).error.code).toBe('VALIDATION_ERROR');
  });
});
