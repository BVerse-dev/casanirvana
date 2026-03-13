import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';

import {
  createNotice,
  createNoticeComment,
  getNotice,
  listNoticeComments,
  listNotices,
  updateNotice,
} from '../controllers/adminNotices';
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
    contains(column: string, values: unknown[]) {
      filters.push((row) => Array.isArray(row[column]) && values.every((entry) => row[column].includes(entry)));
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
      first_name: 'Ada',
      last_name: 'Admin',
      profile_pic_url: 'https://example.com/avatar.png',
      community_id: null,
    },
    permissions: ['read:all_notifications', 'write:all_notifications', 'create:notices'],
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

describe('Admin notice launch read models', () => {
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

  it('lists notices through the audited backend contract', async () => {
    supabaseState.tables = {
      communities: [
        { id: '11111111-1111-1111-1111-111111111111', name: 'Casa One' },
      ],
      notices: [
        {
          id: 'notice-1',
          community_id: '11111111-1111-1111-1111-111111111111',
          title: 'Main Gate Repair',
          body: 'Repair works will start at 7 AM.',
          status: 'published',
          priority: 'high',
          created_at: '2026-03-13T08:00:00.000Z',
          posted_at: '2026-03-13T08:00:00.000Z',
          updated_at: '2026-03-13T08:00:00.000Z',
          tags: ['maintenance'],
        },
      ],
    };

    const { res, next } = await runController(
      listNotices,
      createMockRequest({ query: { search: 'gate', limit: '10' } })
    );

    expect(next).not.toHaveBeenCalled();
    expect((res.body as any).count).toBe(1);
    expect((res.body as any).data).toEqual([
      expect.objectContaining({
        id: 'notice-1',
        communities: expect.objectContaining({ name: 'Casa One' }),
      }),
    ]);
  });

  it('keeps scoped admins inside their notice tenant boundary', async () => {
    supabaseState.tables = {
      communities: [
        { id: '11111111-1111-1111-1111-111111111111', name: 'Casa One' },
        { id: '22222222-2222-2222-2222-222222222222', name: 'Casa Two' },
      ],
      notices: [
        {
          id: 'notice-community-a',
          community_id: '11111111-1111-1111-1111-111111111111',
          title: 'Community A',
          body: 'Scoped bulletin',
          status: 'published',
          created_at: '2026-03-13T08:00:00.000Z',
          posted_at: '2026-03-13T08:00:00.000Z',
          updated_at: '2026-03-13T08:00:00.000Z',
        },
        {
          id: 'notice-community-b',
          community_id: '22222222-2222-2222-2222-222222222222',
          title: 'Community B',
          body: 'Out of scope bulletin',
          status: 'published',
          created_at: '2026-03-13T07:00:00.000Z',
          posted_at: '2026-03-13T07:00:00.000Z',
          updated_at: '2026-03-13T07:00:00.000Z',
        },
      ],
    };

    const { res, next } = await runController(
      listNotices,
      createMockRequest({
        userProfile: {
          id: 'profile-scoped',
          role: 'agency_manager',
          email: 'scoped@example.com',
          first_name: 'Scoped',
          last_name: 'Admin',
          community_id: '11111111-1111-1111-1111-111111111111',
        } as any,
      })
    );

    expect(next).not.toHaveBeenCalled();
    expect((res.body as any).data).toEqual([
      expect.objectContaining({
        id: 'notice-community-a',
        community_id: '11111111-1111-1111-1111-111111111111',
      }),
    ]);
  });

  it('rejects scoped admin access to an out-of-scope notice detail', async () => {
    supabaseState.tables = {
      notices: [
        {
          id: 'notice-community-b',
          community_id: '22222222-2222-2222-2222-222222222222',
          title: 'Community B',
          body: 'Out of scope bulletin',
          status: 'published',
          created_at: '2026-03-13T07:00:00.000Z',
          posted_at: '2026-03-13T07:00:00.000Z',
          updated_at: '2026-03-13T07:00:00.000Z',
        },
      ],
    };

    const { res } = await runController(
      getNotice,
      createMockRequest({
        params: { id: 'notice-community-b' },
        userProfile: {
          id: 'profile-scoped',
          role: 'agency_manager',
          email: 'scoped@example.com',
          first_name: 'Scoped',
          last_name: 'Admin',
          community_id: '11111111-1111-1111-1111-111111111111',
        } as any,
      })
    );

    expect(res.statusCode).toBe(403);
    expect((res.body as any).error.code).toBe('ADMIN_NOTICE_SCOPE_VIOLATION');
  });

  it('returns an empty comment state truthfully when a notice has no comments', async () => {
    supabaseState.tables = {
      notices: [
        {
          id: 'notice-1',
          community_id: '11111111-1111-1111-1111-111111111111',
          title: 'Main Gate Repair',
          body: 'Repair works will start at 7 AM.',
          status: 'published',
          created_at: '2026-03-13T08:00:00.000Z',
          posted_at: '2026-03-13T08:00:00.000Z',
          updated_at: '2026-03-13T08:00:00.000Z',
        },
      ],
      comments: [],
    };

    const { res, next } = await runController(
      listNoticeComments,
      createMockRequest({ params: { id: 'notice-1' } })
    );

    expect(next).not.toHaveBeenCalled();
    expect((res.body as any).data).toEqual([]);
  });

  it('creates and updates notices with backend-owned publication metadata', async () => {
    supabaseState.tables = {
      communities: [
        { id: '11111111-1111-1111-1111-111111111111', name: 'Casa One' },
      ],
      notices: [],
    };

    const createResult = await runController(
      createNotice,
      createMockRequest({
        method: 'POST',
        body: {
          community_id: '11111111-1111-1111-1111-111111111111',
          title: 'Pool Closure',
          body: 'The pool will be closed on Saturday.',
          status: 'published',
          priority: 'urgent',
          tags: ['amenities', 'weekend'],
          is_featured: true,
        },
      })
    );

    expect(createResult.res.statusCode).toBe(201);
    expect((createResult.res.body as any).data).toEqual(
      expect.objectContaining({
        title: 'Pool Closure',
        author_name: 'Ada Admin',
        community_id: '11111111-1111-1111-1111-111111111111',
        is_featured: true,
      })
    );

    const createdId = ((createResult.res.body as any).data.id as string);

    const updateResult = await runController(
      updateNotice,
      createMockRequest({
        method: 'PATCH',
        params: { id: createdId },
        body: {
          title: 'Pool Closure Update',
          status: 'archived',
        },
      })
    );

    expect(updateResult.res.statusCode).toBe(200);
    expect((updateResult.res.body as any).data).toEqual(
      expect.objectContaining({
        id: createdId,
        title: 'Pool Closure Update',
        status: 'archived',
      })
    );
  });

  it('creates threaded notice comments through the admin contract', async () => {
    supabaseState.tables = {
      notices: [
        {
          id: 'notice-1',
          community_id: '11111111-1111-1111-1111-111111111111',
          title: 'Main Gate Repair',
          body: 'Repair works will start at 7 AM.',
          status: 'published',
          created_at: '2026-03-13T08:00:00.000Z',
          posted_at: '2026-03-13T08:00:00.000Z',
          updated_at: '2026-03-13T08:00:00.000Z',
        },
      ],
      comments: [
        {
          id: 'comment-1',
          notice_id: 'notice-1',
          author_name: 'Resident One',
          content: 'Will the side gate remain open?',
          likes_count: 2,
          created_at: '2026-03-13T09:00:00.000Z',
          updated_at: '2026-03-13T09:00:00.000Z',
          parent_id: null,
        },
      ],
    };

    const createResult = await runController(
      createNoticeComment,
      createMockRequest({
        method: 'POST',
        params: { id: 'notice-1' },
        body: {
          content: 'Yes, the side gate will remain open.',
          parent_id: 'comment-1',
        },
      })
    );

    expect(createResult.res.statusCode).toBe(201);
    expect((createResult.res.body as any).data).toEqual(
      expect.objectContaining({
        notice_id: 'notice-1',
        parent_id: 'comment-1',
        author_name: 'Ada Admin',
        author_user_id: 'auth-admin',
      })
    );

    const listResult = await runController(
      listNoticeComments,
      createMockRequest({ params: { id: 'notice-1' } })
    );

    expect((listResult.res.body as any).data).toEqual([
      expect.objectContaining({
        id: 'comment-1',
        replies: [
          expect.objectContaining({
            parent_id: 'comment-1',
            content: 'Yes, the side gate will remain open.',
          }),
        ],
      }),
    ]);
  });

  it('rejects malformed notice list queries through route validation', async () => {
    const validationMiddleware = findRouteHandler(adminRoutes, '/notices', 'get', 2);

    const res = await runValidationMiddleware(
      validationMiddleware,
      createMockRequest({ query: { status: 'processing' } })
    );

    expect(res.statusCode).toBe(400);
    expect((res.body as any).error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects malformed notice comment payloads through route validation', async () => {
    const validationMiddleware = findRouteHandler(adminRoutes, '/notices/:id/comments', 'post', 2);

    const res = await runValidationMiddleware(
      validationMiddleware,
      createMockRequest({
        params: { id: 'notice-1' },
        body: { content: '', parent_id: 'not-a-uuid' },
      })
    );

    expect(res.statusCode).toBe(400);
    expect((res.body as any).error.code).toBe('VALIDATION_ERROR');
  });
});
