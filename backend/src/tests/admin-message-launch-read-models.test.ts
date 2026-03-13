import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';

import {
  createMessageGroup,
  createMessageGroupMessage,
  getMessageConversation,
  getMessageStats,
  listMessageContacts,
  listMessageGroupMessages,
  listMessageGroups,
} from '../controllers/adminMessagesReadModels';
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
    is(column: string, value: unknown) {
      rows = rows.filter((row) =>
        value === null ? row[column] === null || row[column] === undefined : row[column] === value
      );
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
    insert(payload: Record<string, unknown> | Record<string, unknown>[]) {
      const inserts = (Array.isArray(payload) ? payload : [payload]).map((entry, index) => ({
        id: typeof entry.id === 'string' ? entry.id : `${table}-${(supabaseState.tables[table] || []).length + index + 1}`,
        ...entry,
      }));

      supabaseState.tables[table] = [...(supabaseState.tables[table] || []), ...inserts];
      rows = inserts;
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
    userProfile: {
      id: 'admin-profile-1',
      role: 'facility_manager',
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

function findRouteHandler(router: { stack?: RouteLayer[] }, path: string, method: 'post', index: number) {
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

describe('Admin message launch read models', () => {
  let adminRoutes: Awaited<typeof import('../routes/admin')>['default'];

  beforeAll(async () => {
    ({ default: adminRoutes } = await import('../routes/admin'));
  });

  beforeEach(() => {
    vi.clearAllMocks();
    supabaseState.tables = {};
    scopeMocks.resolveAdminScope.mockResolvedValue({
      role: 'facility_manager',
      profileId: 'admin-profile-1',
      email: 'manager@example.com',
      isGlobal: false,
      communityIds: ['community-1'],
      agencyIds: ['agency-1'],
    });
  });

  it('returns actor-scoped stats and scoped contacts while preserving existing direct conversations', async () => {
    const recentLogin = new Date().toISOString();
    const oldLogin = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    supabaseState.tables = {
      profiles: [
        {
          id: 'admin-profile-1',
          first_name: 'Admin',
          last_name: 'Manager',
          email: 'manager@example.com',
          role: 'facility_manager',
          community_id: 'community-1',
          unit_id: null,
          block_number: null,
          is_active: true,
          last_login: recentLogin,
        },
        {
          id: 'resident-1',
          first_name: 'Ama',
          last_name: 'Mensah',
          email: 'ama@example.com',
          phone: '2330000001',
          role: 'resident',
          community_id: 'community-1',
          unit_id: 'unit-1',
          block_number: 'A',
          is_active: true,
          last_login: recentLogin,
        },
        {
          id: 'superadmin-1',
          first_name: 'Platform',
          last_name: 'Lead',
          email: 'lead@example.com',
          phone: '2330000002',
          role: 'superadmin',
          community_id: null,
          unit_id: null,
          block_number: null,
          is_active: true,
          last_login: oldLogin,
        },
        {
          id: 'resident-2',
          first_name: 'Outside',
          last_name: 'User',
          email: 'outside@example.com',
          phone: '2330000003',
          role: 'resident',
          community_id: 'community-2',
          unit_id: null,
          block_number: null,
          is_active: true,
          last_login: recentLogin,
        },
      ],
      units: [
        { id: 'unit-1', block: 'A', number: '12', unit_number: '12', community_id: 'community-1' },
      ],
      communities: [{ id: 'community-1', name: 'Alpha Court' }],
      messages: [
        {
          id: 'message-1',
          from_user: 'admin-profile-1',
          to_user: 'resident-1',
          body: 'Hello Ama',
          message_type: 'text',
          sent_at: '2026-03-11T10:00:00.000Z',
          deleted_at: null,
          is_read: true,
          read: true,
        },
        {
          id: 'message-2',
          from_user: 'resident-1',
          to_user: 'admin-profile-1',
          body: 'Need help',
          message_type: 'text',
          sent_at: '2026-03-11T11:00:00.000Z',
          deleted_at: null,
          is_read: false,
          read: false,
        },
        {
          id: 'message-3',
          from_user: 'superadmin-1',
          to_user: 'admin-profile-1',
          body: 'Platform check-in',
          message_type: 'text',
          sent_at: '2026-03-11T12:00:00.000Z',
          deleted_at: null,
          is_read: true,
          read: true,
        },
      ],
    };

    const statsRun = await runController(getMessageStats, createMockRequest());
    expect(statsRun.next).not.toHaveBeenCalled();
    expect(statsRun.res.body).toEqual({
      data: {
        totalMessages: 3,
        activeChats: 2,
        unreadMessages: 1,
        onlineUsers: 1,
      },
    });

    const contactsRun = await runController(listMessageContacts, createMockRequest());
    expect(contactsRun.next).not.toHaveBeenCalled();
    expect((contactsRun.res.body as any).data).toEqual([
      expect.objectContaining({
        id: 'superadmin-1',
        name: 'Platform Lead',
        message: 'Platform check-in',
        unreadCount: 0,
      }),
      expect.objectContaining({
        id: 'resident-1',
        name: 'Ama Mensah',
        location: 'A-12 | Alpha Court',
        unreadCount: 1,
      }),
    ]);
  });

  it('returns empty message stats and contacts when the actor has no conversations', async () => {
    supabaseState.tables = {
      profiles: [
        {
          id: 'admin-profile-1',
          first_name: 'Admin',
          last_name: 'Manager',
          email: 'manager@example.com',
          role: 'facility_manager',
          community_id: 'community-1',
          is_active: true,
          last_login: new Date().toISOString(),
        },
      ],
      communities: [],
      units: [],
      messages: [],
    };

    const statsRun = await runController(getMessageStats, createMockRequest());
    expect(statsRun.res.body).toEqual({
      data: {
        totalMessages: 0,
        activeChats: 0,
        unreadMessages: 0,
        onlineUsers: 0,
      },
    });

    const contactsRun = await runController(listMessageContacts, createMockRequest());
    expect(contactsRun.res.body).toEqual({ data: [] });
  });

  it('rejects conversation access for a contact outside scope with no existing conversation', async () => {
    supabaseState.tables = {
      profiles: [
        {
          id: 'admin-profile-1',
          first_name: 'Admin',
          last_name: 'Manager',
          email: 'manager@example.com',
          role: 'facility_manager',
          community_id: 'community-1',
          is_active: true,
          last_login: new Date().toISOString(),
        },
        {
          id: 'resident-2',
          first_name: 'Outside',
          last_name: 'User',
          email: 'outside@example.com',
          role: 'resident',
          community_id: 'community-2',
          is_active: true,
          last_login: new Date().toISOString(),
        },
      ],
      messages: [],
      units: [],
      communities: [],
    };

    const { res } = await runController(
      getMessageConversation,
      createMockRequest({ params: { id: 'resident-2' } })
    );

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'MESSAGE_CONTACT_NOT_FOUND',
        }),
      })
    );
  });

  it('creates groups with allowed members and exposes group summaries plus messages', async () => {
    supabaseState.tables = {
      profiles: [
        {
          id: 'admin-profile-1',
          first_name: 'Admin',
          last_name: 'Manager',
          email: 'manager@example.com',
          role: 'facility_manager',
          community_id: 'community-1',
          is_active: true,
          last_login: new Date().toISOString(),
        },
        {
          id: 'resident-1',
          first_name: 'Ama',
          last_name: 'Mensah',
          email: 'ama@example.com',
          phone: '2330000001',
          role: 'resident',
          community_id: 'community-1',
          is_active: true,
          last_login: new Date().toISOString(),
        },
      ],
      communities: [{ id: 'community-1', name: 'Alpha Court' }],
      units: [],
      messages: [],
      groups: [],
      group_members: [],
      group_messages: [],
    };

    const createRun = await runController(
      createMessageGroup,
      createMockRequest({
        method: 'POST',
        body: {
          name: 'Security Ops',
          description: 'Launch coordination',
          member_ids: ['resident-1'],
        },
      })
    );

    expect(createRun.next).not.toHaveBeenCalled();
    expect(createRun.res.statusCode).toBe(201);
    expect((createRun.res.body as any).data).toEqual(
      expect.objectContaining({
        name: 'Security Ops',
        group_members: expect.arrayContaining([
          expect.objectContaining({ user_id: 'admin-profile-1' }),
          expect.objectContaining({ user_id: 'resident-1' }),
        ]),
      })
    );

    const createdGroupId = (createRun.res.body as any).data.id as string;

    const messageRun = await runController(
      createMessageGroupMessage,
      createMockRequest({
        method: 'POST',
        params: { id: createdGroupId },
        body: {
          body: 'Morning coordination check',
          message_type: 'text',
        },
      })
    );

    expect(messageRun.next).not.toHaveBeenCalled();
    expect(messageRun.res.statusCode).toBe(201);
    expect((messageRun.res.body as any).data).toEqual(
      expect.objectContaining({
        group_id: createdGroupId,
        body: 'Morning coordination check',
        profiles: expect.objectContaining({
          id: 'admin-profile-1',
          email: 'manager@example.com',
        }),
      })
    );

    const groupsRun = await runController(listMessageGroups, createMockRequest());
    expect((groupsRun.res.body as any).data).toEqual([
      expect.objectContaining({
        id: createdGroupId,
        member_count: 2,
        last_message: 'Morning coordination check',
        last_message_sender: 'You',
        unread_count: 0,
      }),
    ]);

    const groupMessagesRun = await runController(
      listMessageGroupMessages,
      createMockRequest({ params: { id: createdGroupId } })
    );
    expect((groupMessagesRun.res.body as any).data).toEqual([
      expect.objectContaining({
        group_id: createdGroupId,
        body: 'Morning coordination check',
        profiles: expect.objectContaining({
          id: 'admin-profile-1',
        }),
      }),
    ]);
  });

  it('rejects group creation for a member outside the allowed messaging scope', async () => {
    supabaseState.tables = {
      profiles: [
        {
          id: 'admin-profile-1',
          first_name: 'Admin',
          last_name: 'Manager',
          email: 'manager@example.com',
          role: 'facility_manager',
          community_id: 'community-1',
          is_active: true,
          last_login: new Date().toISOString(),
        },
        {
          id: 'resident-2',
          first_name: 'Outside',
          last_name: 'User',
          email: 'outside@example.com',
          role: 'resident',
          community_id: 'community-2',
          is_active: true,
          last_login: new Date().toISOString(),
        },
      ],
      messages: [],
      communities: [],
      units: [],
      groups: [],
      group_members: [],
    };

    const { res } = await runController(
      createMessageGroup,
      createMockRequest({
        method: 'POST',
        body: {
          name: 'Security Ops',
          member_ids: ['resident-2'],
        },
      })
    );

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'MESSAGE_GROUP_MEMBER_SCOPE_VIOLATION',
        }),
      })
    );
  });

  it('validates required fields for group creation and group message creation', async () => {
    const validateGroupCreate = findRouteHandler(adminRoutes, '/messages/groups', 'post', 2);
    const groupCreateResponse = await runValidationMiddleware(
      validateGroupCreate,
      createMockRequest({ body: {} })
    );

    expect(groupCreateResponse.statusCode).toBe(400);
    expect(groupCreateResponse.body).toEqual(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'VALIDATION_ERROR',
        }),
      })
    );

    const validateGroupMessageCreate = findRouteHandler(adminRoutes, '/messages/groups/:id/messages', 'post', 2);
    const groupMessageResponse = await runValidationMiddleware(
      validateGroupMessageCreate,
      createMockRequest({ params: { id: 'group-1' }, body: {} })
    );

    expect(groupMessageResponse.statusCode).toBe(400);
    expect(groupMessageResponse.body).toEqual(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'VALIDATION_ERROR',
        }),
      })
    );
  });
});
