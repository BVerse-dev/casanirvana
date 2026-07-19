import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';

import {
  createEmail,
  getEmail,
  listEmailContacts,
  listEmails,
  updateEmail,
} from '../controllers/adminEmails';
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
        const updated = { ...row, ...(updatePayload || {}) };
        updatedRows.push(updated);
        return updated;
      });
      setRows(nextRows);
      return { data: updatedRows, error: null };
    }

    const rows = applyLimit(applySorts(applyFilters(getRows())));
    return { data: rows, error: null };
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
    not(column: string, operator: string, value: unknown) {
      if (operator === 'is' && value === null) {
        filters.push((row) => row[column] !== null && row[column] !== undefined);
      }
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
    or(_value: string) {
      return builder;
    },
    insert(payload: Record<string, unknown> | Record<string, unknown>[]) {
      const currentCount = (supabaseState.tables[table] || []).length;
      insertRows = (Array.isArray(payload) ? payload : [payload]).map((entry, index) => ({
        id: typeof entry.id === 'string' ? entry.id : `${table}-${currentCount + index + 1}`,
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
    userProfile: {
      id: 'profile-admin',
      role: 'facility_manager',
      community_id: 'community-1',
      email: 'manager@example.com',
    },
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

describe('Admin email launch read models', () => {
  let adminRoutes: Awaited<typeof import('../routes/admin')>['default'];

  beforeAll(async () => {
    ({ default: adminRoutes } = await import('../routes/admin'));
  });

  beforeEach(() => {
    vi.clearAllMocks();
    supabaseState.tables = {};
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'facility_manager',
      profileId: 'profile-admin',
      email: 'manager@example.com',
      isGlobal: false,
      communityIds: ['community-1'],
      agencyIds: [],
    });
  });

  it('returns scoped email records with summary and enrichment', async () => {
    supabaseState.tables = {
      emails: [
        {
          id: 'email-1',
          subject: 'Community update',
          body: 'Body one',
          folder: 'inbox',
          status: 'delivered',
          priority: 'normal',
          sent_at: '2026-03-12T09:00:00.000Z',
          created_at: '2026-03-12T08:55:00.000Z',
          read_at: null,
          is_read: false,
          is_starred: true,
          is_important: false,
          is_draft: false,
          is_deleted: false,
          has_attachment: false,
          attachments: null,
          email_type: 'incoming',
          sender_id: 'resident-user-1',
          recipient_id: 'auth-admin',
          community_id: 'community-1',
        },
        {
          id: 'email-2',
          subject: 'Other community',
          body: 'Body two',
          folder: 'inbox',
          status: 'queued',
          priority: 'high',
          sent_at: '2026-03-12T10:00:00.000Z',
          created_at: '2026-03-12T09:55:00.000Z',
          read_at: null,
          is_read: false,
          is_starred: false,
          is_important: true,
          is_draft: false,
          is_deleted: false,
          has_attachment: false,
          attachments: null,
          email_type: 'incoming',
          sender_id: 'resident-user-2',
          recipient_id: 'auth-admin',
          community_id: 'community-2',
        },
      ],
      users: [
        { id: 'auth-admin', email: 'manager@example.com' },
        { id: 'resident-user-1', email: 'ama@example.com' },
        { id: 'resident-user-2', email: 'outside@example.com' },
      ],
      profiles: [
        {
          id: 'profile-admin',
          user_id: 'auth-admin',
          first_name: 'Admin',
          last_name: 'Manager',
          email: 'manager@example.com',
          community_id: 'community-1',
          profile_pic_url: null,
          role: 'facility_manager',
        },
        {
          id: 'profile-resident-1',
          user_id: 'resident-user-1',
          first_name: 'Ama',
          last_name: 'Mensah',
          email: 'ama@example.com',
          community_id: 'community-1',
          profile_pic_url: null,
          role: 'resident',
        },
        {
          id: 'profile-resident-2',
          user_id: 'resident-user-2',
          first_name: 'Outside',
          last_name: 'Resident',
          email: 'outside@example.com',
          community_id: 'community-2',
          profile_pic_url: null,
          role: 'resident',
        },
      ],
      communities: [
        { id: 'community-1', name: 'Palm Estate' },
        { id: 'community-2', name: 'Outside Estate' },
      ],
    };

    const req = createMockRequest({ query: { folder: 'inbox', limit: '25' } });
    const { res } = await runController(listEmails, req);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      data: [
        expect.objectContaining({
          id: 'email-1',
          resolved_community_id: 'community-1',
          resolved_community_name: 'Palm Estate',
          sender: expect.objectContaining({
            full_name: 'Ama Mensah',
            email: 'ama@example.com',
          }),
          recipient: expect.objectContaining({
            full_name: 'Admin Manager',
            email: 'manager@example.com',
          }),
        }),
      ],
      summary: expect.objectContaining({
        total: 1,
        inbox: 1,
        queued: 0,
        delivered: 1,
        unread: 1,
        starred: 1,
      }),
    });
  });

  it('returns a truthful empty state when a scoped admin has no communities', async () => {
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'facility_manager',
      profileId: 'profile-admin',
      email: 'manager@example.com',
      isGlobal: false,
      communityIds: [],
      agencyIds: [],
    });

    const req = createMockRequest();
    const { res } = await runController(listEmails, req);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      data: [],
      summary: {
        total: 0,
        inbox: 0,
        sent: 0,
        drafts: 0,
        archived: 0,
        deleted: 0,
        unread: 0,
        starred: 0,
        important: 0,
        high_priority: 0,
        queued: 0,
        delivered: 0,
        failed: 0,
      },
    });
  });

  it('denies detail access outside the admin scope', async () => {
    supabaseState.tables = {
      emails: [
        {
          id: 'email-outside',
          subject: 'Outside scope',
          body: 'Body two',
          folder: 'inbox',
          status: 'delivered',
          priority: 'normal',
          sent_at: '2026-03-12T10:00:00.000Z',
          created_at: '2026-03-12T09:55:00.000Z',
          read_at: null,
          is_read: false,
          is_starred: false,
          is_important: false,
          is_draft: false,
          is_deleted: false,
          has_attachment: false,
          attachments: null,
          email_type: 'incoming',
          sender_id: 'resident-user-2',
          recipient_id: 'auth-admin',
          community_id: 'community-2',
        },
      ],
      users: [
        { id: 'auth-admin', email: 'manager@example.com' },
        { id: 'resident-user-2', email: 'outside@example.com' },
      ],
      profiles: [
        {
          id: 'profile-admin',
          user_id: 'auth-admin',
          first_name: 'Admin',
          last_name: 'Manager',
          email: 'manager@example.com',
          community_id: 'community-1',
          profile_pic_url: null,
          role: 'facility_manager',
        },
        {
          id: 'profile-resident-2',
          user_id: 'resident-user-2',
          first_name: 'Outside',
          last_name: 'Resident',
          email: 'outside@example.com',
          community_id: 'community-2',
          profile_pic_url: null,
          role: 'resident',
        },
      ],
      communities: [
        { id: 'community-1', name: 'Palm Estate' },
        { id: 'community-2', name: 'Outside Estate' },
      ],
    };

    const req = createMockRequest({ params: { id: 'email-outside' } });
    const { res } = await runController(getEmail, req);

    expect(res.statusCode).toBe(403);
    expect(res.body).toMatchObject({
      error: expect.objectContaining({
        code: 'EMAIL_SCOPE_VIOLATION',
      }),
    });
  });

  it('creates scoped email records and queues drafts through the backend-owned contract', async () => {
    supabaseState.tables = {
      emails: [
        {
          id: 'draft-1',
          subject: 'Draft subject',
          body: 'Draft body',
          folder: 'drafts',
          status: 'draft',
          priority: 'normal',
          sent_at: null,
          created_at: '2026-03-12T08:00:00.000Z',
          read_at: null,
          is_read: false,
          is_starred: false,
          is_important: false,
          is_draft: true,
          is_deleted: false,
          has_attachment: false,
          attachments: null,
          email_type: 'outgoing',
          sender_id: 'auth-admin',
          recipient_id: 'resident-user-1',
          community_id: 'community-1',
        },
      ],
      users: [
        { id: 'auth-admin', email: 'manager@example.com' },
        { id: 'resident-user-1', email: 'ama@example.com' },
      ],
      profiles: [
        {
          id: 'profile-admin',
          user_id: 'auth-admin',
          first_name: 'Admin',
          last_name: 'Manager',
          email: 'manager@example.com',
          community_id: 'community-1',
          profile_pic_url: null,
          role: 'facility_manager',
        },
        {
          id: 'profile-resident-1',
          user_id: 'resident-user-1',
          first_name: 'Ama',
          last_name: 'Mensah',
          email: 'ama@example.com',
          community_id: 'community-1',
          profile_pic_url: null,
          role: 'resident',
        },
      ],
      communities: [
        { id: 'community-1', name: 'Palm Estate' },
      ],
    };

    const createReq = createMockRequest({
      method: 'POST',
      body: {
        recipient_id: 'resident-user-1',
        subject: 'Reminder',
        body: 'Please review your latest statement.',
        priority: 'urgent',
        action: 'queue',
      },
    });

    const { res: createRes } = await runController(createEmail, createReq);

    expect(createRes.statusCode).toBe(201);
    expect(createRes.body).toMatchObject({
      data: expect.objectContaining({
        subject: 'Reminder',
        folder: 'sent',
        status: 'queued',
        community_id: 'community-1',
        sender_id: 'auth-admin',
        recipient_id: 'resident-user-1',
        is_important: true,
      }),
    });

    const updateReq = createMockRequest({
      method: 'POST',
      params: { id: 'draft-1' },
      body: { status: 'queued' },
    });

    const { res: updateRes } = await runController(updateEmail, updateReq);

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body).toMatchObject({
      data: expect.objectContaining({
        id: 'draft-1',
        status: 'queued',
        folder: 'sent',
        is_draft: false,
        is_read: true,
      }),
    });
    expect((supabaseState.tables.emails || []).find((row) => row.id === 'draft-1')).toMatchObject({
      status: 'queued',
      folder: 'sent',
      is_draft: false,
      is_read: true,
    });
  });

  it('returns scoped contacts for the compose flow', async () => {
    supabaseState.tables = {
      profiles: [
        {
          id: 'profile-admin',
          user_id: 'auth-admin',
          first_name: 'Admin',
          last_name: 'Manager',
          email: 'manager@example.com',
          community_id: 'community-1',
          profile_pic_url: null,
          role: 'facility_manager',
        },
        {
          id: 'profile-resident-1',
          user_id: 'resident-user-1',
          first_name: 'Ama',
          last_name: 'Mensah',
          email: 'ama@example.com',
          community_id: 'community-1',
          profile_pic_url: null,
          role: 'resident',
        },
        {
          id: 'profile-outside',
          user_id: 'resident-user-2',
          first_name: 'Outside',
          last_name: 'Resident',
          email: 'outside@example.com',
          community_id: 'community-2',
          profile_pic_url: null,
          role: 'resident',
        },
      ],
      communities: [
        { id: 'community-1', name: 'Palm Estate' },
        { id: 'community-2', name: 'Outside Estate' },
      ],
    };

    const req = createMockRequest();
    const { res } = await runController(listEmailContacts, req);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      data: [
        expect.objectContaining({
          profile_id: 'profile-admin',
          user_id: 'auth-admin',
          community_name: 'Palm Estate',
        }),
        expect.objectContaining({
          profile_id: 'profile-resident-1',
          user_id: 'resident-user-1',
          community_name: 'Palm Estate',
        }),
      ],
    });
  });

  it('rejects malformed email list and create payloads at validation time', async () => {
    const validateList = findRouteHandler(adminRoutes, '/emails', 'get', 2);
    const listRes = await runValidationMiddleware(
      validateList,
      createMockRequest({
        query: { folder: 'made-up-folder', limit: '0' },
      })
    );

    expect(listRes.statusCode).toBe(400);
    expect(listRes.body).toMatchObject({
      error: expect.objectContaining({
        code: 'VALIDATION_ERROR',
      }),
    });

    const validateCreate = findRouteHandler(adminRoutes, '/emails', 'post', 2);
    const createRes = await runValidationMiddleware(
      validateCreate,
      createMockRequest({
        method: 'POST',
        body: {
          recipient_id: 'resident-user-1',
          subject: 'Reminder',
          body: 'Body',
          priority: 'critical',
        },
      })
    );

    expect(createRes.statusCode).toBe(400);
    expect(createRes.body).toMatchObject({
      error: expect.objectContaining({
        code: 'VALIDATION_ERROR',
      }),
    });
  });
});
