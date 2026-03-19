import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Duplex } from 'node:stream';
import { EventEmitter } from 'node:events';
import { IncomingMessage } from 'node:http';
import type { Express } from 'express';

type MockRow = Record<string, any>;

const mockState = {
  tables: {} as Record<string, MockRow[]>,
  idCounter: 1,
  authUser: null as { id: string; email?: string | null } | null,
  authError: null as Record<string, unknown> | null,
  adminScope: {
    role: 'superadmin',
    profileId: 'profile-admin',
    email: 'admin@example.com',
    isGlobal: true,
    communityIds: [] as string[],
    agencyIds: [] as string[],
  },
};

const baseEnv = { ...process.env };

class MockSocket extends Duplex {
  remoteAddress = '127.0.0.1';
  encrypted = false;

  override _read() {}

  override _write(
    _chunk: Buffer | string,
    _encoding: BufferEncoding,
    callback: (error?: Error | null) => void
  ) {
    callback();
  }
}

function resetMockState() {
  mockState.tables = {
    admin_onboarding_requests: [],
    profiles: [],
    role_permissions_detailed: [],
    user_roles: [],
  };
  mockState.idCounter = 1;
  mockState.authUser = null;
  mockState.authError = null;
  mockState.adminScope = {
    role: 'superadmin',
    profileId: 'profile-admin',
    email: 'admin@example.com',
    isGlobal: true,
    communityIds: [],
    agencyIds: [],
  };
}

function resolveMockGuardCommunityId(guardId: string) {
  const guardRow = (mockState.tables.guards || []).find((row) => row.id === guardId);
  if (guardRow?.community_id) {
    return guardRow.community_id as string;
  }

  const activeAssignment = (mockState.tables.guard_assignments || []).find(
    (row) => row.guard_id === guardId && row.community_id && String(row.status || '').toLowerCase() === 'active'
  );
  if (activeAssignment?.community_id) {
    return activeAssignment.community_id as string;
  }

  const latestSchedule = (mockState.tables.guard_schedules || []).find(
    (row) => row.guard_id === guardId && row.community_id
  );
  if (latestSchedule?.community_id) {
    return latestSchedule.community_id as string;
  }

  return null;
}

function getMockScopedGuardIds(scope: { isGlobal: boolean; communityIds: string[] }) {
  const guardIds = new Set<string>();

  for (const guard of mockState.tables.guards || []) {
    if (typeof guard.id !== 'string') continue;
    if (scope.isGlobal || (guard.community_id && scope.communityIds.includes(guard.community_id))) {
      guardIds.add(guard.id);
    }
  }

  for (const assignment of mockState.tables.guard_assignments || []) {
    if (typeof assignment.guard_id !== 'string') continue;
    if (scope.isGlobal || (assignment.community_id && scope.communityIds.includes(assignment.community_id))) {
      guardIds.add(assignment.guard_id);
    }
  }

  for (const schedule of mockState.tables.guard_schedules || []) {
    if (typeof schedule.guard_id !== 'string') continue;
    if (scope.isGlobal || (schedule.community_id && scope.communityIds.includes(schedule.community_id))) {
      guardIds.add(schedule.guard_id);
    }
  }

  return [...guardIds];
}

function createQueryBuilder(table: string) {
  const filters: Array<(row: MockRow) => boolean> = [];
  let operation: 'read' | 'insert' | 'update' = 'read';
  let insertPayload: MockRow[] = [];
  let updatePayload: MockRow | null = null;
  let sortColumn: string | null = null;
  let sortAscending = true;
  let limitValue: number | null = null;
  let rangeStart: number | null = null;
  let rangeEnd: number | null = null;
  let includeExactCount = false;

  const getRows = () => [...(mockState.tables[table] || [])];
  const setRows = (rows: MockRow[]) => {
    mockState.tables[table] = rows;
  };

  const applyFilters = (rows: MockRow[]) => {
    let filtered = rows.filter((row) => filters.every((filter) => filter(row)));

    if (sortColumn) {
      filtered = [...filtered].sort((left, right) => {
        const leftValue = left[sortColumn];
        const rightValue = right[sortColumn];

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

    if (rangeStart !== null) {
      filtered = filtered.slice(rangeStart, rangeEnd === null ? undefined : rangeEnd + 1);
    }

    if (limitValue !== null) {
      filtered = filtered.slice(0, limitValue);
    }

    return filtered;
  };

  const execute = () => {
    if (operation === 'insert') {
      const existingRows = getRows();
      const insertedRows = insertPayload.map((row) => ({
        ...row,
        id: row.id || `${table}-${mockState.idCounter++}`,
      }));
      setRows([...existingRows, ...insertedRows]);
      return { data: insertedRows, error: null, count: insertedRows.length };
    }

    if (operation === 'update') {
      const existingRows = getRows();
      const updatedRows: MockRow[] = [];
      const nextRows = existingRows.map((row) => {
        if (!filters.every((filter) => filter(row))) {
          return row;
        }

        const updatedRow = {
          ...row,
          ...(updatePayload || {}),
        };
        updatedRows.push(updatedRow);
        return updatedRow;
      });

      setRows(nextRows);
      return {
        data: applyFilters(updatedRows),
        error: null,
        count: updatedRows.length,
      };
    }

    const allFilteredRows = getRows().filter((row) => filters.every((filter) => filter(row)));

    return {
      data: applyFilters(getRows()),
      error: null,
      count: includeExactCount ? allFilteredRows.length : null,
    };
  };

  const builder: any = {
    select(_columns?: string, options?: { count?: 'exact' | 'planned' | 'estimated' }) {
      includeExactCount = options?.count === 'exact';
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
      if (operator === 'is') {
        filters.push((row) => row[column] !== value);
      }
      return builder;
    },
    is(column: string, value: unknown) {
      filters.push((row) => row[column] === value);
      return builder;
    },
    order(column: string, options?: { ascending?: boolean }) {
      sortColumn = column;
      sortAscending = options?.ascending ?? true;
      return builder;
    },
    limit(value: number) {
      limitValue = value;
      return builder;
    },
    range(start: number, end: number) {
      rangeStart = start;
      rangeEnd = end;
      return Promise.resolve(execute());
    },
    insert(payload: MockRow | MockRow[]) {
      operation = 'insert';
      insertPayload = Array.isArray(payload) ? payload : [payload];
      return builder;
    },
    update(payload: MockRow) {
      operation = 'update';
      updatePayload = payload;
      return builder;
    },
    single() {
      const result = execute();
      const row = Array.isArray(result.data) ? result.data[0] || null : null;
      return Promise.resolve({ data: row, error: result.error });
    },
    maybeSingle() {
      const result = execute();
      const row = Array.isArray(result.data) ? result.data[0] || null : null;
      return Promise.resolve({ data: row, error: result.error });
    },
    then(resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) {
      const result = execute();
      return Promise.resolve({
        data: result.data,
        error: result.error,
        count: result.count,
      }).then(resolve, reject);
    },
  };

  return builder;
}

function seedAuthenticatedAdmin(options: {
  permissions?: string[];
  role?: string;
  isGlobal?: boolean;
  communityIds?: string[];
  agencyIds?: string[];
} = {}) {
  const role = options.role || 'superadmin';
  const permissions = options.permissions || [];

  mockState.authUser = {
    id: 'auth-admin',
    email: 'admin@example.com',
  };

  mockState.tables.profiles = [
    {
      id: 'profile-admin',
      user_id: 'auth-admin',
      first_name: 'Ada',
      last_name: 'Admin',
      email: 'admin@example.com',
      role,
    },
  ];

  mockState.tables.role_permissions_detailed = permissions.map((permissionKey) => ({
    role_name: role,
    permission_key: permissionKey,
  }));

  mockState.tables.user_roles = [
    {
      name: role,
      permissions: [],
    },
  ];

  mockState.adminScope = {
    role,
    profileId: 'profile-admin',
    email: 'admin@example.com',
    isGlobal: options.isGlobal ?? role === 'superadmin',
    communityIds: options.communityIds || [],
    agencyIds: options.agencyIds || [],
  };
}

async function loadApp(envOverrides: Record<string, string | undefined> = {}) {
  vi.resetModules();
  resetMockState();

  process.env = {
    ...baseEnv,
    NODE_ENV: 'test',
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
    RATE_LIMIT_ENABLED: 'true',
    RATE_LIMIT_MAX: '1000',
    AUTH_RATE_LIMIT_MAX: '1000',
    ADMIN_RATE_LIMIT_MAX: '1000',
    ONBOARDING_RATE_LIMIT_MAX: '1000',
    ONBOARDING_REQUEST_API_KEY: 'onboarding-test-key',
    ...envOverrides,
  };

  vi.doMock('../lib/logger', () => ({
    logger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
  }));

  vi.doMock('../lib/observability', () => ({
    initObservability: vi.fn(),
    captureException: vi.fn(),
  }));

  vi.doMock('../lib/supabase', () => {
    const auth = {
      getUser: vi.fn(async (token: string) => {
        if (mockState.authError) {
          return { data: { user: null }, error: mockState.authError };
        }

        if (mockState.authUser && token === 'valid-token') {
          return { data: { user: mockState.authUser }, error: null };
        }

        return { data: { user: null }, error: { message: 'Invalid token' } };
      }),
    };

    const storageBucket = {
      list: vi.fn(async () => ({ data: [], error: null })),
      upload: vi.fn(async () => ({ data: null, error: null })),
      download: vi.fn(async () => ({ data: null, error: null })),
      remove: vi.fn(async () => ({ data: [], error: null })),
    };

    const client = {
      auth,
      from: (table: string) => createQueryBuilder(table),
      rpc: vi.fn(async () => ({ data: null, error: null })),
      storage: {
        getBucket: vi.fn(async () => ({ data: null, error: { message: 'Not found' } })),
        createBucket: vi.fn(async () => ({ data: null, error: null })),
        from: vi.fn(() => storageBucket),
      },
    };

    return {
      supabase: client,
      adminSupabase: client,
      createPublicClient: vi.fn(() => client),
      default: client,
    };
  });

  vi.doMock('../services/adminScope', () => ({
    resolveAdminScope: vi.fn(async () => mockState.adminScope),
    canAccessCommunity: (
      scope: { isGlobal: boolean; communityIds: string[] },
      communityId: string
    ) => scope.isGlobal || scope.communityIds.includes(communityId),
    canAccessAgency: (
      scope: { isGlobal: boolean; agencyIds: string[] },
      agencyId: string
    ) => scope.isGlobal || scope.agencyIds.includes(agencyId),
    isUuid: (value: unknown) =>
      typeof value === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value),
    getScopedGuardIds: vi.fn(async (scope: { isGlobal: boolean; communityIds: string[] }) =>
      getMockScopedGuardIds(scope)
    ),
    resolveGuardCommunityId: vi.fn(async (guardId: string) => resolveMockGuardCommunityId(guardId)),
  }));

  const { default: app } = await import('../app');
  return app;
}

type RequestOptions = {
  method: 'GET' | 'POST' | 'PATCH' | 'PUT';
  path: string;
  headers?: Record<string, string>;
  body?: unknown;
};

type MountedResponse = {
  status: number;
  headers: Record<string, string>;
  body: unknown;
  text: string;
};

async function performMountedRequest(
  app: Express,
  { method, path, headers = {}, body }: RequestOptions
): Promise<MountedResponse> {
  return new Promise((resolve, reject) => {
    const socket = new MockSocket();
    const req = new IncomingMessage(socket);
    const responseEvents = new EventEmitter();
    const headerStore = new Map<string, string | string[]>();
    const normalizedHeaders = Object.fromEntries(
      Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value])
    );
    const rawBody =
      body === undefined
        ? null
        : typeof body === 'string'
          ? body
          : JSON.stringify(body);

    req.method = method;
    req.url = path;
    req.headers = {
      host: 'localhost',
      ...normalizedHeaders,
    };
    req.socket = socket;
    (req as IncomingMessage & { connection: MockSocket }).connection = socket;

    if (rawBody !== null) {
      req.headers['content-type'] = req.headers['content-type'] || 'application/json';
      req.headers['content-length'] = Buffer.byteLength(rawBody).toString();
    }

    const chunks: Buffer[] = [];
    const res = {
      app,
      req,
      statusCode: 200,
      statusMessage: undefined as string | undefined,
      headersSent: false,
      finished: false,
      writableEnded: false,
      locals: {},
      socket,
      connection: socket,
      setHeader(name: string, value: string | number | readonly string[]) {
        headerStore.set(
          name.toLowerCase(),
          Array.isArray(value) ? value.map(String) : String(value)
        );
        return this;
      },
      getHeader(name: string) {
        return headerStore.get(name.toLowerCase());
      },
      getHeaders() {
        return Object.fromEntries(headerStore.entries());
      },
      getHeaderNames() {
        return [...headerStore.keys()];
      },
      hasHeader(name: string) {
        return headerStore.has(name.toLowerCase());
      },
      removeHeader(name: string) {
        headerStore.delete(name.toLowerCase());
      },
      writeHead(
        statusCode: number,
        reasonPhraseOrHeaders?: string | Record<string, string | string[] | number>,
        headersArg?: Record<string, string | string[] | number>
      ) {
        this.statusCode = statusCode;
        const headerObject =
          typeof reasonPhraseOrHeaders === 'string'
            ? headersArg
            : reasonPhraseOrHeaders;

        if (typeof reasonPhraseOrHeaders === 'string') {
          this.statusMessage = reasonPhraseOrHeaders;
        }

        if (headerObject) {
          for (const [key, value] of Object.entries(headerObject)) {
            this.setHeader(key, value);
          }
        }

        this.headersSent = true;
        return this;
      },
      write(chunk: any, encoding?: BufferEncoding | (() => void), callback?: () => void) {
        if (chunk) {
          const bufferEncoding = typeof encoding === 'string' ? encoding : undefined;
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, bufferEncoding));
        }
        this.headersSent = true;
        if (typeof encoding === 'function') {
          encoding();
        }
        callback?.();
        return true;
      },
      end(chunk?: any, encoding?: BufferEncoding | (() => void), callback?: () => void) {
        if (chunk) {
          const bufferEncoding = typeof encoding === 'string' ? encoding : undefined;
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, bufferEncoding));
        }
        this.headersSent = true;
        this.finished = true;
        this.writableEnded = true;
        if (typeof encoding === 'function') {
          encoding();
        }
        callback?.();
        queueMicrotask(() => {
          responseEvents.emit('finish');
        });
        return this;
      },
      flushHeaders() {
        this.headersSent = true;
      },
      setTimeout() {
        return this;
      },
      on: responseEvents.on.bind(responseEvents),
      once: responseEvents.once.bind(responseEvents),
      emit: responseEvents.emit.bind(responseEvents),
      removeListener: responseEvents.removeListener.bind(responseEvents),
    };

    responseEvents.once('finish', () => {
      const text = Buffer.concat(chunks).toString('utf8');
      const contentType = res.getHeader('content-type');
      const isJson =
        typeof contentType === 'string' && contentType.toLowerCase().includes('application/json');

      resolve({
        status: res.statusCode,
        headers: Object.fromEntries(
          Object.entries(res.getHeaders()).map(([key, value]) => [
            key.toLowerCase(),
            Array.isArray(value) ? value.join(', ') : String(value),
          ])
        ),
        body: isJson && text ? JSON.parse(text) : text,
        text,
      });
    });

    responseEvents.once('error', reject);

    app.handle(req, res as any, (error) => {
      reject(error ?? new Error(`Mounted request did not resolve for ${method} ${path}`));
    });

    if (rawBody !== null) {
      req.push(rawBody);
    }
    req.push(null);
  });
}

describe('Mounted app integration', () => {
  beforeEach(() => {
    process.env = { ...baseEnv };
  });

  afterEach(() => {
    process.env = { ...baseEnv };
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('serves the health endpoint with CORS and helmet headers', async () => {
    const app = await loadApp();

    const response = await performMountedRequest(app, {
      method: 'GET',
      path: '/health',
      headers: {
        Origin: 'http://localhost:3000',
      },
    });

    expect(response.status).toBe(200);
    expect((response.body as Record<string, unknown>).status).toBe('ok');
    expect((response.body as Record<string, unknown>).service).toBe('casa-nirvana-backend');
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(response.headers['x-powered-by']).toBeUndefined();
  });

  it('fails closed on mounted admin routes without an auth token', async () => {
    const app = await loadApp();

    const response = await performMountedRequest(app, {
      method: 'GET',
      path: '/admin/users',
    });

    expect(response.status).toBe(401);
    expect((response.body as any).error.code).toBe('AUTH_TOKEN_MISSING');
    expect(typeof (response.body as any).error.requestId).toBe('string');
    expect(response.headers['x-request-id']).toBe((response.body as any).error.requestId);
  });

  it('rejects mounted admin routes when the authenticated actor lacks the required permission', async () => {
    const app = await loadApp();
    seedAuthenticatedAdmin();

    const response = await performMountedRequest(app, {
      method: 'GET',
      path: '/admin/onboarding-requests',
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    expect(response.status).toBe(403);
    expect((response.body as any).error.code).toBe('AUTH_PERMISSION_DENIED');
    expect(typeof (response.body as any).error.requestId).toBe('string');
  });

  it('fails closed on mounted account routes without an auth token', async () => {
    const app = await loadApp();

    const response = await performMountedRequest(app, {
      method: 'POST',
      path: '/account/delete',
      body: {
        current_password: 'secret-password',
        confirmation_text: 'DELETE MY ACCOUNT',
      },
    });

    expect(response.status).toBe(401);
    expect((response.body as any).error.code).toBe('ACCOUNT_AUTH_TOKEN_MISSING');
    expect(typeof (response.body as any).error.requestId).toBe('string');
  });

  it('lists onboarding requests through the mounted admin route for an authenticated reviewer', async () => {
    const app = await loadApp();
    seedAuthenticatedAdmin({ permissions: ['manage:users'] });
    mockState.tables.admin_onboarding_requests = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        status: 'pending',
        requested_role: 'agency_manager',
        first_name: 'Grace',
        last_name: 'Hopper',
        email: 'grace@example.com',
        created_at: '2026-03-19T08:00:00.000Z',
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        status: 'approved',
        requested_role: 'facility_manager',
        first_name: 'Katherine',
        last_name: 'Johnson',
        email: 'katherine@example.com',
        created_at: '2026-03-18T08:00:00.000Z',
      },
    ];

    const response = await performMountedRequest(app, {
      method: 'GET',
      path: '/admin/onboarding-requests?status=pending&limit=1&offset=0',
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    expect(response.status).toBe(200);
    expect((response.body as any).count).toBe(1);
    expect((response.body as any).limit).toBe(1);
    expect((response.body as any).offset).toBe(0);
    expect((response.body as any).data).toEqual([
      expect.objectContaining({
        id: '11111111-1111-1111-1111-111111111111',
        email: 'grace@example.com',
        status: 'pending',
      }),
    ]);
  });

  it('validates mounted admin onboarding review queries before the controller runs', async () => {
    const app = await loadApp();
    seedAuthenticatedAdmin({ permissions: ['manage:users'] });

    const response = await performMountedRequest(app, {
      method: 'GET',
      path: '/admin/onboarding-requests?status=invalid',
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    expect(response.status).toBe(400);
    expect((response.body as any).error.code).toBe('VALIDATION_ERROR');
    expect((response.body as any).error.details.fieldErrors.status).toBeTruthy();
  });

  it('updates onboarding requests through the mounted admin route and stamps the reviewer', async () => {
    const app = await loadApp();
    seedAuthenticatedAdmin({ permissions: ['manage:users'] });
    mockState.tables.admin_onboarding_requests = [
      {
        id: '33333333-3333-4333-8333-333333333333',
        status: 'pending',
        requested_role: 'agency_manager',
        first_name: 'Margaret',
        last_name: 'Hamilton',
        email: 'margaret@example.com',
        created_at: '2026-03-19T07:00:00.000Z',
      },
    ];

    const response = await performMountedRequest(app, {
      method: 'PATCH',
      path: '/admin/onboarding-requests/33333333-3333-4333-8333-333333333333',
      headers: {
        Authorization: 'Bearer valid-token',
      },
      body: {
        status: 'approved',
        review_notes: 'Approved for launch readiness',
      },
    });

    expect(response.status).toBe(200);
    expect((response.body as any).status).toBe('approved');
    expect((response.body as any).review_notes).toBe('Approved for launch readiness');
    expect((response.body as any).reviewed_by).toBe('auth-admin');
    expect(typeof (response.body as any).reviewed_at).toBe('string');
    expect((response.body as any).updated_at).toBeTruthy();
  });

  it('lists scoped visitor passes through the mounted admin route for a tenant admin', async () => {
    const app = await loadApp();
    const communityId = '11111111-1111-1111-1111-111111111111';
    const otherCommunityId = '22222222-2222-2222-2222-222222222222';
    const unitId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const otherUnitId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

    seedAuthenticatedAdmin({
      permissions: ['read:all_profiles'],
      role: 'facility_manager',
      isGlobal: false,
      communityIds: [communityId],
      agencyIds: ['33333333-3333-4333-8333-333333333333'],
    });

    mockState.tables.units = [
      { id: unitId, block: 'A', number: '101', unit_number: 'A101', community_id: communityId },
      { id: otherUnitId, block: 'B', number: '202', unit_number: 'B202', community_id: otherCommunityId },
    ];
    mockState.tables.communities = [
      { id: communityId, name: 'Casa One', agency_id: '33333333-3333-4333-8333-333333333333' },
      { id: otherCommunityId, name: 'Casa Two', agency_id: '44444444-4444-4444-8444-444444444444' },
    ];
    mockState.tables.agencies = [
      { id: '33333333-3333-4333-8333-333333333333', name: 'Primary Agency' },
      { id: '44444444-4444-4444-8444-444444444444', name: 'Other Agency' },
    ];
    mockState.tables.visitor_passes = [
      {
        id: '55555555-5555-4555-8555-555555555555',
        visitor_name: 'Scoped Guest',
        from_date: '2026-03-20',
        to_date: '2026-03-20',
        community_id: communityId,
        unit_id: unitId,
        status: 'approved',
        visitor_type: 'guest',
        created_by: 'auth-admin',
        created_at: '2026-03-19T09:00:00.000Z',
      },
      {
        id: '66666666-6666-4666-8666-666666666666',
        visitor_name: 'Out Of Scope Guest',
        from_date: '2026-03-20',
        to_date: '2026-03-20',
        community_id: otherCommunityId,
        unit_id: otherUnitId,
        status: 'approved',
        visitor_type: 'guest',
        created_by: 'auth-admin',
        created_at: '2026-03-18T09:00:00.000Z',
      },
    ];

    const response = await performMountedRequest(app, {
      method: 'GET',
      path: '/admin/visitor-passes?status=approved',
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    expect(response.status).toBe(200);
    expect((response.body as any).data).toHaveLength(1);
    expect((response.body as any).data[0]).toEqual(
      expect.objectContaining({
        id: '55555555-5555-4555-8555-555555555555',
        community_name: 'Casa One',
        agency_name: 'Primary Agency',
        unit_label: 'A-101',
        created_by_display: 'Ada Admin',
      })
    );
  });

  it('creates scoped visitor passes through the mounted admin route and stamps backend-owned actor fields', async () => {
    const app = await loadApp();
    const communityId = '11111111-1111-1111-1111-111111111111';
    const unitId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

    seedAuthenticatedAdmin({
      permissions: ['create:profiles'],
      role: 'facility_manager',
      isGlobal: false,
      communityIds: [communityId],
      agencyIds: ['33333333-3333-4333-8333-333333333333'],
    });

    mockState.tables.units = [
      { id: unitId, block: 'A', number: '101', unit_number: 'A101', community_id: communityId },
    ];
    mockState.tables.communities = [
      { id: communityId, name: 'Casa One', agency_id: '33333333-3333-4333-8333-333333333333' },
    ];
    mockState.tables.agencies = [
      { id: '33333333-3333-4333-8333-333333333333', name: 'Primary Agency' },
    ];

    const response = await performMountedRequest(app, {
      method: 'POST',
      path: '/admin/visitor-passes',
      headers: {
        Authorization: 'Bearer valid-token',
      },
      body: {
        visitor_name: 'Launch Visitor',
        visitor_type: 'guest',
        from_date: '2026-03-20',
        to_date: '2026-03-20',
        unit_id: unitId,
        purpose: 'Move-in support',
      },
    });

    expect(response.status).toBe(201);
    expect((response.body as any).message).toBe('Visitor pass created successfully');
    expect((response.body as any).data).toEqual(
      expect.objectContaining({
        visitor_name: 'Launch Visitor',
        community_id: communityId,
        created_by: 'auth-admin',
        community_name: 'Casa One',
        created_by_display: 'Ada Admin',
      })
    );
    expect(mockState.tables.visitor_passes).toHaveLength(1);
    expect(mockState.tables.visitor_passes[0]).toEqual(
      expect.objectContaining({
        community_id: communityId,
        created_by: 'auth-admin',
        unit_id: unitId,
        visitor_name: 'Launch Visitor',
      })
    );
  });

  it('lists scoped residents through the mounted admin route with derived tenancy and residence context', async () => {
    const app = await loadApp();
    const communityId = '11111111-1111-1111-1111-111111111111';
    const otherCommunityId = '22222222-2222-2222-2222-222222222222';
    const residentId = '33333333-3333-4333-8333-333333333333';
    const otherResidentId = '44444444-4444-4444-8444-444444444444';
    const unitId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const otherUnitId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

    seedAuthenticatedAdmin({
      permissions: ['read:all_profiles'],
      role: 'facility_manager',
      isGlobal: false,
      communityIds: [communityId],
    });

    mockState.tables.profiles = [
      ...mockState.tables.profiles,
      {
        id: residentId,
        user_id: 'resident-auth-1',
        first_name: 'Ama',
        last_name: 'Mensah',
        full_name: null,
        email: 'ama@example.com',
        phone: '2330000001',
        avatar_url: null,
        block_number: null,
        community_id: communityId,
        unit_id: unitId,
        role: 'resident',
        status: 'active',
        is_active: true,
        emergency_contact: null,
        preferences: { address: 'Accra' },
        created_at: '2026-03-01T10:00:00.000Z',
        updated_at: '2026-03-02T10:00:00.000Z',
      },
      {
        id: otherResidentId,
        user_id: 'resident-auth-2',
        first_name: 'Kojo',
        last_name: 'Owusu',
        full_name: null,
        email: 'kojo@example.com',
        phone: '2330000002',
        avatar_url: null,
        block_number: null,
        community_id: otherCommunityId,
        unit_id: otherUnitId,
        role: 'resident',
        status: 'active',
        is_active: true,
        emergency_contact: null,
        preferences: null,
        created_at: '2026-03-03T10:00:00.000Z',
        updated_at: '2026-03-04T10:00:00.000Z',
      },
    ];
    mockState.tables.units = [
      {
        id: unitId,
        block: 'A',
        number: '101',
        unit_number: 'A-101',
        community_id: communityId,
        tenant_id: residentId,
        owner_id: null,
      },
      {
        id: otherUnitId,
        block: 'B',
        number: '202',
        unit_number: 'B-202',
        community_id: otherCommunityId,
        tenant_id: null,
        owner_id: null,
      },
    ];
    mockState.tables.communities = [
      { id: communityId, name: 'Palm Residences', address: 'Airport', city: 'Accra', state: 'Greater Accra' },
      { id: otherCommunityId, name: 'Harbor View', address: 'Tema', city: 'Tema', state: 'Greater Accra' },
    ];

    const response = await performMountedRequest(app, {
      method: 'GET',
      path: '/admin/residents?page=1&limit=20',
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    expect(response.status).toBe(200);
    expect((response.body as any).count).toBe(1);
    expect((response.body as any).data).toEqual([
      expect.objectContaining({
        id: residentId,
        full_name: 'Ama Mensah',
        role: 'tenant',
        unit_number: 'A-101',
        community_id: communityId,
        communities: expect.objectContaining({ name: 'Palm Residences' }),
      }),
    ]);
  });

  it('returns resident activity summary and recent records through the mounted admin route', async () => {
    const app = await loadApp();
    const communityId = '11111111-1111-1111-1111-111111111111';
    const residentId = '33333333-3333-4333-8333-333333333333';
    const unitId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

    seedAuthenticatedAdmin({
      permissions: ['read:all_profiles'],
      role: 'facility_manager',
      isGlobal: false,
      communityIds: [communityId],
    });

    mockState.tables.profiles = [
      ...mockState.tables.profiles,
      {
        id: residentId,
        user_id: 'resident-auth-1',
        first_name: 'Ama',
        last_name: 'Mensah',
        full_name: 'Ama Mensah',
        email: 'ama@example.com',
        phone: '2330000001',
        avatar_url: null,
        block_number: null,
        community_id: communityId,
        unit_id: unitId,
        role: 'resident',
        status: 'active',
        is_active: true,
        emergency_contact: null,
        preferences: null,
        created_at: '2026-03-01T10:00:00.000Z',
        updated_at: '2026-03-02T10:00:00.000Z',
      },
    ];
    mockState.tables.units = [
      {
        id: unitId,
        block: 'A',
        number: '101',
        unit_number: 'A-101',
        community_id: communityId,
        tenant_id: residentId,
        owner_id: null,
      },
    ];
    mockState.tables.communities = [
      { id: communityId, name: 'Palm Residences', address: 'Airport', city: 'Accra', state: 'Greater Accra' },
    ];
    mockState.tables.payments = [
      {
        id: 'payment-1',
        amount: 1200,
        status: 'completed',
        title: 'March Dues',
        description: null,
        due_date: '2026-03-05T00:00:00.000Z',
        paid_at: '2026-03-04T00:00:00.000Z',
        completed_at: null,
        payment_date: null,
        created_at: '2026-03-01T00:00:00.000Z',
        notes: 'Paid on time',
        unit_id: unitId,
      },
      {
        id: 'payment-2',
        amount: 900,
        status: 'pending',
        title: 'April Dues',
        description: null,
        due_date: '2026-04-05T00:00:00.000Z',
        paid_at: null,
        completed_at: null,
        payment_date: null,
        created_at: '2026-04-01T00:00:00.000Z',
        notes: null,
        unit_id: unitId,
      },
    ];
    mockState.tables.maintenance_requests = [
      {
        id: 14,
        title: 'Leak Repair',
        request_type: 'plumbing',
        status: 'open',
        created_at: '2026-03-06T10:00:00.000Z',
        updated_at: '2026-03-06T12:00:00.000Z',
        resolved_at: null,
        completed_at: null,
        description: 'Kitchen sink',
        requested_by: residentId,
      },
    ];
    mockState.tables.service_requests = [
      {
        id: 'service-1',
        title: 'Cleaning',
        status: 'pending',
        created_at: '2026-03-08T10:00:00.000Z',
        updated_at: '2026-03-08T11:00:00.000Z',
        request_details: 'Deep clean',
        description: null,
        total_amount: 150,
        user_id: 'resident-auth-1',
        created_by: 'someone-else',
      },
      {
        id: 'service-2',
        title: 'Laundry',
        status: 'completed',
        created_at: '2026-03-07T10:00:00.000Z',
        updated_at: '2026-03-07T11:00:00.000Z',
        request_details: 'Weekly laundry',
        description: null,
        total_amount: 80,
        user_id: null,
        created_by: residentId,
      },
    ];
    mockState.tables.activity_logs = [
      {
        id: 'activity-1',
        action: 'Profile updated',
        details: 'Phone number changed',
        status: 'completed',
        created_at: '2026-03-09T09:30:00.000Z',
        timestamp: null,
        user_id: 'resident-auth-1',
      },
    ];

    const response = await performMountedRequest(app, {
      method: 'GET',
      path: `/admin/residents/${residentId}/activity`,
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    expect(response.status).toBe(200);
    expect((response.body as any).data.summary).toEqual({
      totalRequests: 3,
      paymentsMade: 1,
      activeServices: 1,
      completedPayments: 1,
      pendingPayments: 1,
    });
    expect((response.body as any).data.recent).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'payment', title: 'April Dues' }),
        expect.objectContaining({ type: 'maintenance', title: 'Leak Repair' }),
        expect.objectContaining({ type: 'service', title: 'Cleaning' }),
        expect.objectContaining({ type: 'activity', title: 'Profile updated' }),
      ])
    );
  });

  it('returns empty resident directory sections truthfully through the mounted admin route', async () => {
    const app = await loadApp();
    const communityId = '11111111-1111-1111-1111-111111111111';
    const residentId = '33333333-3333-4333-8333-333333333333';
    const unitId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

    seedAuthenticatedAdmin({
      permissions: ['read:all_profiles'],
      role: 'facility_manager',
      isGlobal: false,
      communityIds: [communityId],
    });

    mockState.tables.profiles = [
      ...mockState.tables.profiles,
      {
        id: residentId,
        user_id: 'resident-auth-1',
        first_name: 'Ama',
        last_name: 'Mensah',
        full_name: 'Ama Mensah',
        email: 'ama@example.com',
        phone: '2330000001',
        avatar_url: null,
        block_number: null,
        community_id: communityId,
        unit_id: unitId,
        role: 'resident',
        status: 'active',
        is_active: true,
        emergency_contact: null,
        preferences: null,
        created_at: '2026-03-01T10:00:00.000Z',
        updated_at: '2026-03-02T10:00:00.000Z',
      },
    ];
    mockState.tables.units = [
      {
        id: unitId,
        block: 'A',
        number: '101',
        unit_number: 'A-101',
        community_id: communityId,
        tenant_id: residentId,
        owner_id: null,
      },
    ];
    mockState.tables.communities = [
      { id: communityId, name: 'Palm Residences', address: 'Airport', city: 'Accra', state: 'Greater Accra' },
    ];
    mockState.tables.family_members = [];
    mockState.tables.daily_help = [];
    mockState.tables.vehicles = [];
    mockState.tables.frequent_entries = [];

    const response = await performMountedRequest(app, {
      method: 'GET',
      path: `/admin/residents/${residentId}/directory`,
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    expect(response.status).toBe(200);
    expect((response.body as any).data).toEqual({
      familyMembers: [],
      dailyHelp: [],
      vehicles: [],
      frequentEntries: [],
    });
  });

  it('rejects resident creation outside the admin community scope through the mounted admin route', async () => {
    const app = await loadApp();
    const communityId = '11111111-1111-1111-1111-111111111111';
    const otherCommunityId = '22222222-2222-2222-2222-222222222222';

    seedAuthenticatedAdmin({
      permissions: ['create:profiles'],
      role: 'facility_manager',
      isGlobal: false,
      communityIds: [communityId],
    });

    const response = await performMountedRequest(app, {
      method: 'POST',
      path: '/admin/residents',
      headers: {
        Authorization: 'Bearer valid-token',
      },
      body: {
        first_name: 'Ama',
        last_name: 'Mensah',
        email: 'ama@example.com',
        role: 'resident',
        community_id: otherCommunityId,
      },
    });

    expect(response.status).toBe(403);
    expect((response.body as any).error.code).toBe('RESIDENT_SCOPE_VIOLATION');
  });

  it('updates residents through the mounted admin route and preserves backend-owned lifecycle fields', async () => {
    const app = await loadApp();
    const communityId = '11111111-1111-1111-1111-111111111111';
    const residentId = '33333333-3333-4333-8333-333333333333';
    const unitId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

    seedAuthenticatedAdmin({
      permissions: ['update:all_profiles'],
      role: 'facility_manager',
      isGlobal: false,
      communityIds: [communityId],
    });

    mockState.tables.profiles = [
      ...mockState.tables.profiles,
      {
        id: residentId,
        user_id: 'resident-auth-1',
        first_name: 'Ama',
        last_name: 'Mensah',
        full_name: 'Ama Mensah',
        email: 'ama@example.com',
        phone: '2330000001',
        avatar_url: null,
        block_number: null,
        community_id: communityId,
        unit_id: unitId,
        role: 'resident',
        status: 'active',
        is_active: true,
        emergency_contact: null,
        preferences: null,
        created_at: '2026-03-01T10:00:00.000Z',
        updated_at: '2026-03-02T10:00:00.000Z',
      },
    ];
    mockState.tables.units = [
      {
        id: unitId,
        block: 'A',
        number: '101',
        unit_number: 'A-101',
        community_id: communityId,
        tenant_id: residentId,
        owner_id: null,
      },
    ];
    mockState.tables.communities = [
      { id: communityId, name: 'Palm Residences', address: 'Airport', city: 'Accra', state: 'Greater Accra' },
    ];

    const response = await performMountedRequest(app, {
      method: 'PUT',
      path: `/admin/residents/${residentId}`,
      headers: {
        Authorization: 'Bearer valid-token',
      },
      body: {
        phone: '2330000099',
        status: 'inactive',
      },
    });

    expect(response.status).toBe(200);
    expect((response.body as any).data).toEqual(
      expect.objectContaining({
        id: residentId,
        phone: '2330000099',
        status: 'inactive',
      })
    );
    expect((mockState.tables.profiles || []).find((row) => row.id === residentId)).toEqual(
      expect.objectContaining({
        id: residentId,
        phone: '2330000099',
        status: 'inactive',
        is_active: false,
      })
    );
    expect(((mockState.tables.profiles || []).find((row) => row.id === residentId) || {}).updated_at).toBeTruthy();
  });

  it('validates mounted resident create payloads before the controller runs', async () => {
    const app = await loadApp();

    seedAuthenticatedAdmin({
      permissions: ['create:profiles'],
      role: 'facility_manager',
      isGlobal: false,
      communityIds: ['11111111-1111-1111-1111-111111111111'],
    });

    const response = await performMountedRequest(app, {
      method: 'POST',
      path: '/admin/residents',
      headers: {
        Authorization: 'Bearer valid-token',
      },
      body: {
        first_name: 'Ama',
        last_name: 'Mensah',
        email: 'ama@example.com',
        role: 'admin',
      },
    });

    expect(response.status).toBe(400);
    expect((response.body as any).error.code).toBe('VALIDATION_ERROR');
  });

  it('lists scoped guard profiles through the mounted admin route with assignment enrichment', async () => {
    const app = await loadApp();
    const communityId = '11111111-1111-4111-8111-111111111111';
    const otherCommunityId = '22222222-2222-4222-8222-222222222222';
    const guardId = '33333333-3333-4333-8333-333333333333';
    const otherGuardId = '44444444-4444-4444-8444-444444444444';

    seedAuthenticatedAdmin({
      permissions: ['read:all_profiles'],
      role: 'facility_manager',
      isGlobal: false,
      communityIds: [communityId],
    });

    mockState.tables.guards = [
      {
        id: guardId,
        user_id: '55555555-5555-4555-8555-555555555555',
        first_name: 'Kojo',
        last_name: 'Guard',
        full_name: 'Kojo Guard',
        email: 'kojo.guard@example.com',
        phone: '233200000001',
        status: 'active',
        is_active: true,
        community_id: communityId,
        communities: { id: communityId, name: 'Palm Residences', address: 'Airport' },
        created_at: '2026-03-18T08:00:00.000Z',
      },
      {
        id: otherGuardId,
        user_id: '66666666-6666-4666-8666-666666666666',
        first_name: 'Yaw',
        last_name: 'Outside',
        full_name: 'Yaw Outside',
        email: 'yaw.guard@example.com',
        phone: '233200000002',
        status: 'active',
        is_active: true,
        community_id: otherCommunityId,
        communities: { id: otherCommunityId, name: 'Harbor View', address: 'Tema' },
        created_at: '2026-03-17T08:00:00.000Z',
      },
    ];
    mockState.tables.guard_assignments = [
      {
        id: '77777777-7777-4777-8777-777777777777',
        guard_id: guardId,
        community_id: communityId,
        assignment_name: 'Main Gate Day Shift',
        assigned_gate: 'Gate A',
        shift_type: 'day',
        status: 'active',
        start_date: '2026-03-18',
        created_at: '2026-03-18T08:00:00.000Z',
        updated_at: '2026-03-18T08:00:00.000Z',
      },
      {
        id: '88888888-8888-4888-8888-888888888888',
        guard_id: otherGuardId,
        community_id: otherCommunityId,
        assignment_name: 'Outside Scope',
        assigned_gate: 'Gate B',
        shift_type: 'night',
        status: 'active',
        start_date: '2026-03-17',
        created_at: '2026-03-17T08:00:00.000Z',
        updated_at: '2026-03-17T08:00:00.000Z',
      },
    ];
    mockState.tables.communities = [
      { id: communityId, name: 'Palm Residences' },
      { id: otherCommunityId, name: 'Harbor View' },
    ];

    const response = await performMountedRequest(app, {
      method: 'GET',
      path: `/admin/guards/profiles?community_id=${communityId}`,
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    expect(response.status).toBe(200);
    expect((response.body as any).data).toEqual([
      expect.objectContaining({
        id: guardId,
        full_name: 'Kojo Guard',
        resolved_community_id: communityId,
        resolved_community_name: 'Palm Residences',
        active_assignment_name: 'Main Gate Day Shift',
        active_assignment_gate: 'Gate A',
        assignment_status: 'assigned',
      }),
    ]);
  });

  it('rejects guard profile creation outside the admin community scope through the mounted admin route', async () => {
    const app = await loadApp();
    const communityId = '11111111-1111-4111-8111-111111111111';
    const otherCommunityId = '22222222-2222-4222-8222-222222222222';

    seedAuthenticatedAdmin({
      permissions: ['create:profiles'],
      role: 'facility_manager',
      isGlobal: false,
      communityIds: [communityId],
    });

    const response = await performMountedRequest(app, {
      method: 'POST',
      path: '/admin/guards/profiles',
      headers: {
        Authorization: 'Bearer valid-token',
      },
      body: {
        first_name: 'Kojo',
        last_name: 'Guard',
        email: 'kojo.guard@example.com',
        community_id: otherCommunityId,
        shift_type: 'morning',
      },
    });

    expect(response.status).toBe(403);
    expect((response.body as any).error.code).toBe('GUARD_SCOPE_VIOLATION');
  });

  it('lists scoped guard schedules through the mounted admin route', async () => {
    const app = await loadApp();
    const communityId = '11111111-1111-4111-8111-111111111111';
    const otherCommunityId = '22222222-2222-4222-8222-222222222222';
    const guardId = '33333333-3333-4333-8333-333333333333';

    seedAuthenticatedAdmin({
      permissions: ['read:all_profiles'],
      role: 'facility_manager',
      isGlobal: false,
      communityIds: [communityId],
    });

    mockState.tables.guard_schedules = [
      {
        id: '77777777-7777-4777-8777-777777777777',
        guard_id: guardId,
        community_id: communityId,
        shift_type: 'morning',
        start_time: '06:00',
        end_time: '14:00',
        assigned_date: '2026-03-20',
        status: 'scheduled',
      },
      {
        id: '88888888-8888-4888-8888-888888888888',
        guard_id: '44444444-4444-4444-8444-444444444444',
        community_id: otherCommunityId,
        shift_type: 'night',
        start_time: '22:00',
        end_time: '06:00',
        assigned_date: '2026-03-21',
        status: 'scheduled',
      },
    ];

    const response = await performMountedRequest(app, {
      method: 'GET',
      path: '/admin/guards/schedules',
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    expect(response.status).toBe(200);
    expect((response.body as any).data).toEqual([
      expect.objectContaining({
        guard_id: guardId,
        community_id: communityId,
        shift_type: 'morning',
      }),
    ]);
  });

  it('creates guard assignments through the mounted admin route and syncs guard and user scope', async () => {
    const app = await loadApp();
    const communityId = '11111111-1111-4111-8111-111111111111';
    const guardId = '33333333-3333-4333-8333-333333333333';
    const userId = '55555555-5555-4555-8555-555555555555';

    seedAuthenticatedAdmin({
      permissions: ['create:profiles'],
      role: 'facility_manager',
      isGlobal: false,
      communityIds: [communityId],
    });

    mockState.tables.guards = [
      {
        id: guardId,
        user_id: userId,
        full_name: 'Kojo Guard',
        first_name: 'Kojo',
        last_name: 'Guard',
        email: 'kojo.guard@example.com',
        status: 'active',
        is_active: true,
        community_id: null,
      },
    ];
    mockState.tables.users = [
      {
        id: userId,
        email: 'kojo.guard@example.com',
        community_id: null,
        updated_at: null,
      },
    ];
    mockState.tables.guard_assignments = [];

    const response = await performMountedRequest(app, {
      method: 'POST',
      path: '/admin/guards/assignments',
      headers: {
        Authorization: 'Bearer valid-token',
      },
      body: {
        community_id: communityId,
        guard_id: guardId,
        shift_type: 'day',
        start_time: '06:00',
        end_time: '14:00',
        days_of_week: [1, 2, 3, 4, 5],
        start_date: '2026-03-20',
        assignment_name: 'Main Gate Day Shift',
        assigned_gate: 'Gate A',
        assigned_location: 'Main Gate',
        status: 'active',
        current_status: 'off_duty',
        is_permanent: true,
        is_temporary: false,
      },
    });

    expect(response.status).toBe(201);
    expect((response.body as any).data).toEqual(
      expect.objectContaining({
        guard_id: guardId,
        community_id: communityId,
        assignment_name: 'Main Gate Day Shift',
      })
    );
    expect((mockState.tables.guards || []).find((row) => row.id === guardId)).toEqual(
      expect.objectContaining({
        id: guardId,
        community_id: communityId,
        community_assignment: 'Main Gate Day Shift',
      })
    );
    expect((mockState.tables.users || []).find((row) => row.id === userId)).toEqual(
      expect.objectContaining({
        id: userId,
        community_id: communityId,
      })
    );
    expect(((mockState.tables.guards || []).find((row) => row.id === guardId) || {}).updated_at).toBeTruthy();
    expect(((mockState.tables.users || []).find((row) => row.id === userId) || {}).updated_at).toBeTruthy();
  });

  it('updates guard assignments through the mounted admin route and stamps lifecycle fields', async () => {
    const app = await loadApp();
    const communityId = '11111111-1111-4111-8111-111111111111';
    const guardId = '33333333-3333-4333-8333-333333333333';
    const userId = '55555555-5555-4555-8555-555555555555';
    const assignmentId = '77777777-7777-4777-8777-777777777777';

    seedAuthenticatedAdmin({
      permissions: ['update:all_profiles'],
      role: 'facility_manager',
      isGlobal: false,
      communityIds: [communityId],
    });

    mockState.tables.guards = [
      {
        id: guardId,
        user_id: userId,
        full_name: 'Kojo Guard',
        first_name: 'Kojo',
        last_name: 'Guard',
        email: 'kojo.guard@example.com',
        status: 'active',
        is_active: true,
        community_id: communityId,
        community_assignment: 'Main Gate Day Shift',
      },
    ];
    mockState.tables.users = [
      {
        id: userId,
        email: 'kojo.guard@example.com',
        community_id: communityId,
        updated_at: null,
      },
    ];
    mockState.tables.guard_assignments = [
      {
        id: assignmentId,
        guard_id: guardId,
        community_id: communityId,
        assignment_name: 'Main Gate Day Shift',
        assigned_gate: 'Gate A',
        assigned_location: 'Main Gate',
        shift_type: 'day',
        start_time: '06:00',
        end_time: '14:00',
        days_of_week: [1, 2, 3, 4, 5],
        start_date: '2026-03-20',
        status: 'active',
        current_status: 'off_duty',
        created_at: '2026-03-20T06:00:00.000Z',
        updated_at: null,
      },
    ];

    const response = await performMountedRequest(app, {
      method: 'PATCH',
      path: `/admin/guards/assignments/${assignmentId}`,
      headers: {
        Authorization: 'Bearer valid-token',
      },
      body: {
        assigned_gate: 'Gate B',
        assignment_name: 'Main Gate Rotation',
      },
    });

    expect(response.status).toBe(200);
    expect((response.body as any).data).toEqual(
      expect.objectContaining({
        id: assignmentId,
        assigned_gate: 'Gate B',
        assignment_name: 'Main Gate Rotation',
      })
    );
    expect((mockState.tables.guard_assignments || []).find((row) => row.id === assignmentId)).toEqual(
      expect.objectContaining({
        id: assignmentId,
        assigned_gate: 'Gate B',
        assignment_name: 'Main Gate Rotation',
      })
    );
    expect(((mockState.tables.guard_assignments || []).find((row) => row.id === assignmentId) || {}).updated_at).toBeTruthy();
    expect((mockState.tables.guards || []).find((row) => row.id === guardId)).toEqual(
      expect.objectContaining({
        id: guardId,
        community_assignment: 'Main Gate Rotation',
      })
    );
  });

  it('validates mounted guard assignment payloads before the controller runs', async () => {
    const app = await loadApp();

    seedAuthenticatedAdmin({
      permissions: ['create:profiles'],
      role: 'facility_manager',
      isGlobal: false,
      communityIds: ['11111111-1111-4111-8111-111111111111'],
    });

    const response = await performMountedRequest(app, {
      method: 'POST',
      path: '/admin/guards/assignments',
      headers: {
        Authorization: 'Bearer valid-token',
      },
      body: {
        community_id: '11111111-1111-4111-8111-111111111111',
        guard_id: '33333333-3333-4333-8333-333333333333',
        shift_type: 'day',
        start_time: '06:00',
        end_time: '14:00',
        days_of_week: [7],
        start_date: '2026-03-20',
      },
    });

    expect(response.status).toBe(400);
    expect((response.body as any).error.code).toBe('VALIDATION_ERROR');
  });

  it('lists scoped agencies through the mounted admin directory route', async () => {
    const app = await loadApp();
    const agencyId = '11111111-1111-4111-8111-111111111111';
    const otherAgencyId = '22222222-2222-4222-8222-222222222222';

    seedAuthenticatedAdmin({
      permissions: ['read:all_profiles'],
      role: 'agency_manager',
      isGlobal: false,
      agencyIds: [agencyId],
    });

    mockState.tables.agencies = [
      {
        id: agencyId,
        name: 'Casa Agency',
        email: 'hello@casaagency.test',
        phone: '233300000001',
        address: 'Airport',
        created_at: '2026-03-19T08:00:00.000Z',
      },
      {
        id: otherAgencyId,
        name: 'Outside Agency',
        email: 'outside@agency.test',
        phone: '233300000002',
        address: 'Tema',
        created_at: '2026-03-18T08:00:00.000Z',
      },
    ];

    const response = await performMountedRequest(app, {
      method: 'GET',
      path: '/admin/agencies/directory',
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    expect(response.status).toBe(200);
    expect((response.body as any).data).toEqual([
      expect.objectContaining({
        id: agencyId,
        name: 'Casa Agency',
        email: 'hello@casaagency.test',
      }),
    ]);
  });

  it('returns scoped agency directory summary through the mounted admin route with truthful stats and activity', async () => {
    const app = await loadApp();
    const agencyId = '11111111-1111-4111-8111-111111111111';

    seedAuthenticatedAdmin({
      permissions: ['read:all_profiles'],
      role: 'agency_manager',
      isGlobal: false,
      agencyIds: [agencyId],
    });

    mockState.tables.agencies = [
      {
        id: agencyId,
        name: 'Casa Agency',
        email: 'hello@casaagency.test',
        phone: '233300000001',
        address: 'Airport',
        created_at: '2026-03-19T08:00:00.000Z',
      },
    ];
    mockState.tables.agency_profiles = [
      {
        id: agencyId,
        name: 'Casa Agency',
        city: 'Accra',
        state: 'Greater Accra',
        owner_name: 'Ada Agency',
        created_at: '2026-03-19T08:00:00.000Z',
      },
    ];
    mockState.tables.communities = [
      {
        id: '33333333-3333-4333-8333-333333333333',
        agency_id: agencyId,
        name: 'Palm Residences',
        address: 'Airport',
        city: 'Accra',
        state: 'Greater Accra',
        country: 'Ghana',
        status: 'active',
        created_at: '2026-03-18T08:00:00.000Z',
        updated_at: '2026-03-19T08:00:00.000Z',
      },
      {
        id: '44444444-4444-4444-8444-444444444444',
        agency_id: agencyId,
        name: 'Harbor View',
        address: 'Tema',
        city: 'Tema',
        state: 'Greater Accra',
        country: 'Ghana',
        status: 'inactive',
        created_at: '2026-03-17T08:00:00.000Z',
        updated_at: '2026-03-18T08:00:00.000Z',
      },
    ];
    mockState.tables.units = [
      {
        id: '55555555-5555-4555-8555-555555555555',
        community_id: '33333333-3333-4333-8333-333333333333',
      },
      {
        id: '66666666-6666-4666-8666-666666666666',
        community_id: '44444444-4444-4444-8444-444444444444',
      },
    ];
    mockState.tables.agency_staff = [
      {
        id: '77777777-7777-4777-8777-777777777777',
        agency_id: agencyId,
        first_name: 'Ama',
        last_name: 'Manager',
        email: 'ama.manager@test',
        role: 'manager',
        status: 'active',
        is_active: true,
        created_at: '2026-03-18T09:00:00.000Z',
        updated_at: '2026-03-19T09:00:00.000Z',
      },
    ];
    mockState.tables.agency_services = [
      {
        id: '88888888-8888-4888-8888-888888888888',
        agency_id: agencyId,
        service_name: 'Facility Management',
        category: 'operations',
        status: 'active',
        base_price: 4000,
        rate_type: 'monthly',
        created_at: '2026-03-18T10:00:00.000Z',
        updated_at: '2026-03-19T10:00:00.000Z',
      },
    ];
    mockState.tables.agency_documents = [
      {
        id: '99999999-9999-4999-8999-999999999999',
        agency_id: agencyId,
        name: 'Operating License',
        category: 'compliance',
        type: 'pdf',
        status: 'active',
        uploaded_by_name: 'Ada Admin',
        created_at: '2026-03-18T11:00:00.000Z',
        updated_at: '2026-03-19T11:00:00.000Z',
      },
    ];
    mockState.tables.agency_transactions = [
      {
        id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        agency_id: agencyId,
        date: '2026-03-19T12:00:00.000Z',
        type: 'income',
        category: 'management_fee',
        amount: 5200,
        status: 'completed',
        payment_method: 'bank_transfer',
        reference: 'INV-001',
        description: 'March management fee',
        created_at: '2026-03-19T12:00:00.000Z',
      },
    ];

    const response = await performMountedRequest(app, {
      method: 'GET',
      path: `/admin/agencies/directory/${agencyId}/summary`,
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    expect(response.status).toBe(200);
    expect((response.body as any).data.stats).toEqual(
      expect.objectContaining({
        communities_count: 2,
        active_communities_count: 1,
        inactive_communities_count: 1,
        units_count: 2,
        staff_count: 1,
        services_count: 1,
        documents_count: 1,
        finance_entries_count: 1,
        finance_total_amount: 5200,
      })
    );
    expect((response.body as any).data.activities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'community',
          title: 'Palm Residences',
        }),
        expect.objectContaining({
          type: 'staff',
          title: 'Ama Manager',
        }),
        expect.objectContaining({
          type: 'finance',
          title: 'management_fee',
        }),
      ])
    );
  });

  it('rejects mounted agency summary access outside the admin agency scope', async () => {
    const app = await loadApp();
    const agencyId = '11111111-1111-4111-8111-111111111111';
    const otherAgencyId = '22222222-2222-4222-8222-222222222222';

    seedAuthenticatedAdmin({
      permissions: ['read:all_profiles'],
      role: 'agency_manager',
      isGlobal: false,
      agencyIds: [agencyId],
    });

    mockState.tables.agencies = [
      {
        id: otherAgencyId,
        name: 'Outside Agency',
        email: 'outside@agency.test',
      },
    ];

    const response = await performMountedRequest(app, {
      method: 'GET',
      path: `/admin/agencies/directory/${otherAgencyId}/summary`,
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    expect(response.status).toBe(403);
    expect((response.body as any).error.code).toBe('AGENCY_SCOPE_VIOLATION');
  });

  it('creates agency staff through the mounted admin route with scoped agency fallback and actor stamping', async () => {
    const app = await loadApp();
    const agencyId = '11111111-1111-4111-8111-111111111111';

    seedAuthenticatedAdmin({
      permissions: ['create:profiles'],
      role: 'agency_manager',
      isGlobal: false,
      agencyIds: [agencyId],
    });

    const response = await performMountedRequest(app, {
      method: 'POST',
      path: '/admin/agencies/staff',
      headers: {
        Authorization: 'Bearer valid-token',
      },
      body: {
        first_name: 'Kojo',
        last_name: 'Broker',
        email: 'kojo.broker@example.com',
        role: 'agent',
        department: 'sales',
        status: 'active',
      },
    });

    expect(response.status).toBe(201);
    expect((response.body as any).data).toEqual(
      expect.objectContaining({
        agency_id: agencyId,
        first_name: 'Kojo',
        last_name: 'Broker',
        created_by: 'auth-admin',
        updated_by: 'auth-admin',
      })
    );
  });

  it('updates agency staff through the mounted admin route and stamps backend-owned update fields', async () => {
    const app = await loadApp();
    const agencyId = '11111111-1111-4111-8111-111111111111';
    const staffId = '33333333-3333-4333-8333-333333333333';

    seedAuthenticatedAdmin({
      permissions: ['update:all_profiles'],
      role: 'agency_manager',
      isGlobal: false,
      agencyIds: [agencyId],
    });

    mockState.tables.agency_staff = [
      {
        id: staffId,
        agency_id: agencyId,
        first_name: 'Kojo',
        last_name: 'Broker',
        email: 'kojo.broker@example.com',
        role: 'agent',
        status: 'active',
        created_by: 'seed-user',
        updated_by: null,
        updated_at: null,
      },
    ];

    const response = await performMountedRequest(app, {
      method: 'PATCH',
      path: `/admin/agencies/staff/${staffId}`,
      headers: {
        Authorization: 'Bearer valid-token',
      },
      body: {
        role: 'senior_agent',
        status: 'inactive',
      },
    });

    expect(response.status).toBe(200);
    expect((response.body as any).data).toEqual(
      expect.objectContaining({
        id: staffId,
        role: 'senior_agent',
        status: 'inactive',
        updated_by: 'auth-admin',
      })
    );
    expect(((mockState.tables.agency_staff || []).find((row) => row.id === staffId) || {}).updated_at).toBeTruthy();
  });

  it('validates mounted agency staff payloads before the controller runs', async () => {
    const app = await loadApp();

    seedAuthenticatedAdmin({
      permissions: ['create:profiles'],
      role: 'agency_manager',
      isGlobal: false,
      agencyIds: ['11111111-1111-4111-8111-111111111111'],
    });

    const response = await performMountedRequest(app, {
      method: 'POST',
      path: '/admin/agencies/staff',
      headers: {
        Authorization: 'Bearer valid-token',
      },
      body: {
        first_name: 'Kojo',
        last_name: 'Broker',
        email: 'not-an-email',
      },
    });

    expect(response.status).toBe(400);
    expect((response.body as any).error.code).toBe('VALIDATION_ERROR');
  });

  it('lists scoped agency services through the mounted admin route', async () => {
    const app = await loadApp();
    const agencyId = '11111111-1111-4111-8111-111111111111';
    const otherAgencyId = '22222222-2222-4222-8222-222222222222';

    seedAuthenticatedAdmin({
      permissions: ['read:all_profiles'],
      role: 'agency_manager',
      isGlobal: false,
      agencyIds: [agencyId],
    });

    mockState.tables.agency_services = [
      {
        id: '33333333-3333-4333-8333-333333333333',
        agency_id: agencyId,
        service_name: 'Facility Management',
        category: 'operations',
        status: 'active',
        base_price: 4000,
        created_at: '2026-03-19T08:00:00.000Z',
      },
      {
        id: '44444444-4444-4444-8444-444444444444',
        agency_id: otherAgencyId,
        service_name: 'Outside Service',
        category: 'sales',
        status: 'active',
        base_price: 2500,
        created_at: '2026-03-18T08:00:00.000Z',
      },
    ];

    const response = await performMountedRequest(app, {
      method: 'GET',
      path: '/admin/agencies/services',
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    expect(response.status).toBe(200);
    expect((response.body as any).data).toEqual([
      expect.objectContaining({
        agency_id: agencyId,
        service_name: 'Facility Management',
      }),
    ]);
  });

  it('creates agency services through the mounted admin route with scoped agency fallback', async () => {
    const app = await loadApp();
    const agencyId = '11111111-1111-4111-8111-111111111111';

    seedAuthenticatedAdmin({
      permissions: ['create:profiles'],
      role: 'agency_manager',
      isGlobal: false,
      agencyIds: [agencyId],
    });

    const response = await performMountedRequest(app, {
      method: 'POST',
      path: '/admin/agencies/services',
      headers: {
        Authorization: 'Bearer valid-token',
      },
      body: {
        service_name: 'Leasing Support',
        category: 'leasing',
        status: 'active',
        base_price: 3200,
        rate_type: 'monthly',
      },
    });

    expect(response.status).toBe(201);
    expect((response.body as any).data).toEqual(
      expect.objectContaining({
        agency_id: agencyId,
        service_name: 'Leasing Support',
        category: 'leasing',
      })
    );
  });

  it('lists scoped agency finance entries through the mounted admin route', async () => {
    const app = await loadApp();
    const agencyId = '11111111-1111-4111-8111-111111111111';
    const otherAgencyId = '22222222-2222-4222-8222-222222222222';

    seedAuthenticatedAdmin({
      permissions: ['read:all_payments'],
      role: 'agency_manager',
      isGlobal: false,
      agencyIds: [agencyId],
    });

    mockState.tables.agency_transactions = [
      {
        id: '33333333-3333-4333-8333-333333333333',
        agency_id: agencyId,
        date: '2026-03-19T10:00:00.000Z',
        type: 'income',
        category: 'management_fee',
        amount: 5200,
        status: 'completed',
        created_at: '2026-03-19T10:00:00.000Z',
      },
      {
        id: '44444444-4444-4444-8444-444444444444',
        agency_id: otherAgencyId,
        date: '2026-03-18T10:00:00.000Z',
        type: 'expense',
        category: 'marketing',
        amount: 900,
        status: 'pending',
        created_at: '2026-03-18T10:00:00.000Z',
      },
    ];

    const response = await performMountedRequest(app, {
      method: 'GET',
      path: '/admin/agencies/finance',
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    expect(response.status).toBe(200);
    expect((response.body as any).data).toEqual([
      expect.objectContaining({
        agency_id: agencyId,
        category: 'management_fee',
        amount: 5200,
      }),
    ]);
  });

  it('updates agency finance entries through the mounted admin route', async () => {
    const app = await loadApp();
    const agencyId = '11111111-1111-4111-8111-111111111111';
    const financeId = '33333333-3333-4333-8333-333333333333';

    seedAuthenticatedAdmin({
      permissions: ['update:payments'],
      role: 'agency_manager',
      isGlobal: false,
      agencyIds: [agencyId],
    });

    mockState.tables.agency_transactions = [
      {
        id: financeId,
        agency_id: agencyId,
        date: '2026-03-19T10:00:00.000Z',
        type: 'income',
        category: 'management_fee',
        amount: 5200,
        status: 'pending',
        reference: 'INV-001',
      },
    ];

    const response = await performMountedRequest(app, {
      method: 'PATCH',
      path: `/admin/agencies/finance/${financeId}`,
      headers: {
        Authorization: 'Bearer valid-token',
      },
      body: {
        amount: 5400,
        status: 'completed',
        reference: 'INV-001-PAID',
      },
    });

    expect(response.status).toBe(200);
    expect((response.body as any).data).toEqual(
      expect.objectContaining({
        id: financeId,
        amount: 5400,
        status: 'completed',
        reference: 'INV-001-PAID',
      })
    );
    expect((mockState.tables.agency_transactions || []).find((row) => row.id === financeId)).toEqual(
      expect.objectContaining({
        id: financeId,
        amount: 5400,
        status: 'completed',
        reference: 'INV-001-PAID',
      })
    );
  });

  it('creates agency documents through the mounted admin route with scoped agency fallback and upload stamping', async () => {
    const app = await loadApp();
    const agencyId = '11111111-1111-4111-8111-111111111111';

    seedAuthenticatedAdmin({
      permissions: ['create:profiles'],
      role: 'agency_manager',
      isGlobal: false,
      agencyIds: [agencyId],
    });

    const response = await performMountedRequest(app, {
      method: 'POST',
      path: '/admin/agencies/documents',
      headers: {
        Authorization: 'Bearer valid-token',
      },
      body: {
        name: 'Compliance Certificate',
        category: 'compliance',
        type: 'pdf',
        status: 'active',
      },
    });

    expect(response.status).toBe(201);
    expect((response.body as any).data).toEqual(
      expect.objectContaining({
        agency_id: agencyId,
        name: 'Compliance Certificate',
        uploaded_by: 'auth-admin',
      })
    );
    expect(((response.body as any).data.updated_at as string)).toBeTruthy();
  });

  it('updates agency documents through the mounted admin route and stamps updated_at', async () => {
    const app = await loadApp();
    const agencyId = '11111111-1111-4111-8111-111111111111';
    const documentId = '33333333-3333-4333-8333-333333333333';

    seedAuthenticatedAdmin({
      permissions: ['update:all_profiles'],
      role: 'agency_manager',
      isGlobal: false,
      agencyIds: [agencyId],
    });

    mockState.tables.agency_documents = [
      {
        id: documentId,
        agency_id: agencyId,
        name: 'Compliance Certificate',
        category: 'compliance',
        type: 'pdf',
        status: 'draft',
        updated_at: null,
      },
    ];

    const response = await performMountedRequest(app, {
      method: 'PATCH',
      path: `/admin/agencies/documents/${documentId}`,
      headers: {
        Authorization: 'Bearer valid-token',
      },
      body: {
        status: 'active',
        name: 'Compliance Certificate v2',
      },
    });

    expect(response.status).toBe(200);
    expect((response.body as any).data).toEqual(
      expect.objectContaining({
        id: documentId,
        status: 'active',
        name: 'Compliance Certificate v2',
      })
    );
    expect(((mockState.tables.agency_documents || []).find((row) => row.id === documentId) || {}).updated_at).toBeTruthy();
  });

  it('validates mounted agency finance payloads before the controller runs', async () => {
    const app = await loadApp();

    seedAuthenticatedAdmin({
      permissions: ['create:payments'],
      role: 'agency_manager',
      isGlobal: false,
      agencyIds: ['11111111-1111-4111-8111-111111111111'],
    });

    const response = await performMountedRequest(app, {
      method: 'POST',
      path: '/admin/agencies/finance',
      headers: {
        Authorization: 'Bearer valid-token',
      },
      body: {
        date: '2026-03-19',
        type: 'income',
        amount: 'bad-amount',
        status: 'completed',
      },
    });

    expect(response.status).toBe(400);
    expect((response.body as any).error.code).toBe('VALIDATION_ERROR');
  });

  it('lists scoped maintenance requests through the mounted admin route for a tenant admin', async () => {
    const app = await loadApp();
    const communityId = '11111111-1111-1111-1111-111111111111';
    const otherCommunityId = '22222222-2222-2222-2222-222222222222';

    seedAuthenticatedAdmin({
      permissions: ['read:all_maintenance_requests'],
      role: 'facility_manager',
      isGlobal: false,
      communityIds: [communityId],
    });

    mockState.tables.units = [
      { id: 'unit-1', block: 'A', number: '101', unit_number: 'A-101', community_id: communityId },
      { id: 'unit-2', block: 'B', number: '202', unit_number: 'B-202', community_id: otherCommunityId },
    ];
    mockState.tables.profiles = [
      ...mockState.tables.profiles,
      {
        id: 'resident-1',
        first_name: 'Ama',
        last_name: 'Mensah',
        full_name: 'Ama Mensah',
        email: 'ama@example.com',
        avatar_url: null,
        phone: '2330000001',
        role: 'resident',
      },
      {
        id: 'resident-2',
        first_name: 'Kojo',
        last_name: 'Owusu',
        full_name: 'Kojo Owusu',
        email: 'kojo@example.com',
        avatar_url: null,
        phone: '2330000002',
        role: 'resident',
      },
    ];
    mockState.tables.maintenance_requests = [
      {
        id: 14,
        title: 'Leak Repair',
        description: 'Kitchen sink leak',
        request_type: 'plumbing',
        priority: 'high',
        status: 'pending',
        requested_by: 'resident-1',
        assigned_to: null,
        resolved_by_profile_id: null,
        unit_id: 'unit-1',
        estimated_cost: 120,
        actual_cost: null,
        created_at: '2026-03-12T08:00:00.000Z',
        updated_at: '2026-03-12T08:00:00.000Z',
      },
      {
        id: 15,
        title: 'Broken AC',
        description: 'Living room AC',
        request_type: 'hvac',
        priority: 'medium',
        status: 'pending',
        requested_by: 'resident-2',
        assigned_to: null,
        resolved_by_profile_id: null,
        unit_id: 'unit-2',
        estimated_cost: 80,
        actual_cost: null,
        created_at: '2026-03-12T09:00:00.000Z',
        updated_at: '2026-03-12T09:00:00.000Z',
      },
    ];

    const response = await performMountedRequest(app, {
      method: 'GET',
      path: '/admin/maintenance-requests?status=pending',
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    expect(response.status).toBe(200);
    expect((response.body as any).data).toHaveLength(1);
    expect((response.body as any).data[0]).toEqual(
      expect.objectContaining({
        id: 14,
        title: 'Leak Repair',
        requester_profile: expect.objectContaining({ full_name: 'Ama Mensah' }),
        unit: expect.objectContaining({ unit_number: 'A-101' }),
      })
    );
  });

  it('rejects mounted maintenance detail access outside the admin community scope', async () => {
    const app = await loadApp();

    seedAuthenticatedAdmin({
      permissions: ['read:all_maintenance_requests'],
      role: 'facility_manager',
      isGlobal: false,
      communityIds: ['11111111-1111-1111-1111-111111111111'],
    });

    mockState.tables.units = [
      {
        id: 'unit-2',
        block: 'B',
        number: '202',
        unit_number: 'B-202',
        community_id: '22222222-2222-2222-2222-222222222222',
      },
    ];
    mockState.tables.maintenance_requests = [
      {
        id: 15,
        title: 'Broken AC',
        description: 'Living room AC',
        request_type: 'hvac',
        priority: 'medium',
        status: 'pending',
        requested_by: 'resident-2',
        unit_id: 'unit-2',
        created_at: '2026-03-12T09:00:00.000Z',
        updated_at: '2026-03-12T09:00:00.000Z',
      },
    ];

    const response = await performMountedRequest(app, {
      method: 'GET',
      path: '/admin/maintenance-requests/15',
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    expect(response.status).toBe(403);
    expect((response.body as any).error.code).toBe('MAINTENANCE_SCOPE_VIOLATION');
  });

  it('updates maintenance requests through the mounted admin route and stamps backend-owned lifecycle fields', async () => {
    const app = await loadApp();
    const communityId = '11111111-1111-1111-1111-111111111111';

    seedAuthenticatedAdmin({
      permissions: ['update:maintenance_requests'],
      role: 'facility_manager',
      isGlobal: false,
      communityIds: [communityId],
    });

    mockState.tables.units = [
      { id: 'unit-1', block: 'A', number: '101', unit_number: 'A-101', community_id: communityId },
    ];
    mockState.tables.profiles = [
      ...mockState.tables.profiles,
      {
        id: 'resident-1',
        first_name: 'Ama',
        last_name: 'Mensah',
        full_name: 'Ama Mensah',
        email: 'ama@example.com',
        avatar_url: null,
        phone: '2330000001',
        role: 'resident',
      },
    ];
    mockState.tables.maintenance_requests = [
      {
        id: 14,
        title: 'Leak Repair',
        description: 'Kitchen sink leak',
        request_type: 'plumbing',
        priority: 'high',
        status: 'pending',
        requested_by: 'resident-1',
        assigned_to: null,
        resolved_by_profile_id: null,
        unit_id: 'unit-1',
        estimated_cost: 120,
        actual_cost: null,
        created_at: '2026-03-12T08:00:00.000Z',
        updated_at: '2026-03-12T08:00:00.000Z',
        completed_at: null,
        resolved_at: null,
      },
    ];

    const response = await performMountedRequest(app, {
      method: 'PATCH',
      path: '/admin/maintenance-requests/14',
      headers: {
        Authorization: 'Bearer valid-token',
      },
      body: {
        status: 'completed',
        actual_cost: 150,
      },
    });

    expect(response.status).toBe(200);
    expect((response.body as any).message).toBe('Maintenance request updated successfully');
    expect((response.body as any).data).toEqual(
      expect.objectContaining({
        id: 14,
        status: 'completed',
        actual_cost: 150,
        resolved_by_profile: expect.objectContaining({
          id: 'profile-admin',
          email: 'admin@example.com',
        }),
      })
    );
    expect(mockState.tables.maintenance_requests[0]).toEqual(
      expect.objectContaining({
        id: 14,
        status: 'completed',
        actual_cost: 150,
        resolved_by_profile_id: 'profile-admin',
      })
    );
    expect(mockState.tables.maintenance_requests[0].completed_at).toBeTruthy();
    expect(mockState.tables.maintenance_requests[0].resolved_at).toBeTruthy();
    expect(mockState.tables.maintenance_requests[0].updated_at).toBeTruthy();
  });

  it('lists scoped complaints through the mounted admin route for a tenant admin', async () => {
    const app = await loadApp();
    const communityId = '11111111-1111-1111-1111-111111111111';
    const otherCommunityId = '22222222-2222-2222-2222-222222222222';

    seedAuthenticatedAdmin({
      permissions: ['read:all_complaints'],
      role: 'facility_manager',
      isGlobal: false,
      communityIds: [communityId],
    });

    mockState.tables.units = [
      { id: 'unit-1', block: 'A', number: '101', unit_number: 'A101', community_id: communityId },
      { id: 'unit-2', block: 'B', number: '202', unit_number: 'B202', community_id: otherCommunityId },
    ];
    mockState.tables.communities = [
      { id: communityId, name: 'Casa One', agency_id: 'agency-1' },
      { id: otherCommunityId, name: 'Casa Two', agency_id: 'agency-1' },
    ];
    mockState.tables.profiles = [
      ...mockState.tables.profiles,
      {
        id: 'resident-profile-1',
        user_id: 'resident-user-1',
        first_name: 'Naa',
        last_name: 'Mensah',
        full_name: 'Naa Mensah',
        email: 'naa@example.com',
        avatar_url: null,
        role: 'resident',
        community_id: communityId,
      },
    ];
    mockState.tables.complaints = [
      {
        id: 'complaint-1',
        subject: 'Noise complaint',
        details: 'Generator noise overnight',
        title: null,
        description: null,
        status: 'pending',
        priority: 'high',
        category: 'noise',
        complaint_type: 'community',
        unit_id: 'unit-1',
        raised_by: 'resident-profile-1',
        created_by: 'auth-admin',
        created_by_profile_id: 'profile-admin',
        resolved_by_profile_id: null,
        created_at: '2026-03-12T08:00:00.000Z',
        updated_at: '2026-03-12T08:00:00.000Z',
      },
      {
        id: 'complaint-2',
        subject: 'Out of scope',
        details: 'Should not be visible',
        status: 'pending',
        priority: 'low',
        category: 'security',
        complaint_type: 'community',
        unit_id: 'unit-2',
        raised_by: 'resident-profile-2',
        created_at: '2026-03-11T08:00:00.000Z',
      },
    ];
    mockState.tables.users_with_preference_stats = [];

    const response = await performMountedRequest(app, {
      method: 'GET',
      path: '/admin/complaints?status=pending',
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    expect(response.status).toBe(200);
    expect((response.body as any).data).toHaveLength(1);
    expect((response.body as any).data[0]).toEqual(
      expect.objectContaining({
        id: 'complaint-1',
        reporter_name: 'Naa Mensah',
        unit_label: 'A-101',
        community: expect.objectContaining({ id: communityId, name: 'Casa One' }),
      })
    );
  });

  it('rejects mounted complaint detail access outside the admin community scope', async () => {
    const app = await loadApp();

    seedAuthenticatedAdmin({
      permissions: ['read:all_complaints'],
      role: 'facility_manager',
      isGlobal: false,
      communityIds: ['11111111-1111-1111-1111-111111111111'],
    });

    mockState.tables.units = [
      {
        id: 'unit-2',
        block: 'B',
        number: '202',
        unit_number: 'B202',
        community_id: '22222222-2222-2222-2222-222222222222',
      },
    ];
    mockState.tables.communities = [
      { id: '22222222-2222-2222-2222-222222222222', name: 'Casa Two', agency_id: 'agency-1' },
    ];
    mockState.tables.complaints = [
      {
        id: 'complaint-2',
        subject: 'Gate issue',
        details: 'Back gate stuck',
        status: 'pending',
        priority: 'medium',
        unit_id: 'unit-2',
        created_at: '2026-03-11T08:00:00.000Z',
      },
    ];
    mockState.tables.users_with_preference_stats = [];

    const response = await performMountedRequest(app, {
      method: 'GET',
      path: '/admin/complaints/complaint-2',
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    expect(response.status).toBe(403);
    expect((response.body as any).error.code).toBe('COMPLAINT_SCOPE_VIOLATION');
  });

  it('creates complaint comments through the mounted admin route and stamps backend-owned actor data', async () => {
    const app = await loadApp();
    const communityId = '11111111-1111-1111-1111-111111111111';

    seedAuthenticatedAdmin({
      permissions: ['update:complaints'],
      role: 'facility_manager',
      isGlobal: false,
      communityIds: [communityId],
    });

    mockState.tables.units = [
      { id: 'unit-1', block: 'A', number: '101', unit_number: 'A101', community_id: communityId },
    ];
    mockState.tables.communities = [
      { id: communityId, name: 'Casa One', agency_id: 'agency-1' },
    ];
    mockState.tables.complaints = [
      {
        id: 'complaint-1',
        subject: 'Water leak',
        details: 'Bathroom ceiling leaking',
        status: 'pending',
        priority: 'medium',
        unit_id: 'unit-1',
        created_at: '2026-03-10T08:00:00.000Z',
      },
    ];
    mockState.tables.complaint_comments = [];
    mockState.tables.users_with_preference_stats = [
      {
        id: 'auth-admin',
        user_name: 'Ada Admin',
        email: 'admin@example.com',
        user_role: 'facility_manager',
      },
    ];

    const response = await performMountedRequest(app, {
      method: 'POST',
      path: '/admin/complaints/complaint-1/comments',
      headers: {
        Authorization: 'Bearer valid-token',
      },
      body: {
        comment: 'Assigned technician and informed resident.',
      },
    });

    expect(response.status).toBe(201);
    expect((response.body as any).message).toBe('Complaint comment added successfully');
    expect((response.body as any).data).toEqual(
      expect.objectContaining({
        complaint_id: 'complaint-1',
        created_by: 'auth-admin',
        created_by_profile: expect.objectContaining({
          id: 'profile-admin',
          email: 'admin@example.com',
          role: 'facility_manager',
        }),
      })
    );
    expect(mockState.tables.complaint_comments).toHaveLength(1);
    expect(mockState.tables.complaint_comments[0]).toEqual(
      expect.objectContaining({
        complaint_id: 'complaint-1',
        created_by: 'auth-admin',
        comment: 'Assigned technician and informed resident.',
      })
    );
  });

  it('returns mounted message stats and scoped contacts while preserving existing direct conversations', async () => {
    const app = await loadApp();
    const recentLogin = new Date().toISOString();
    const residentId = '11111111-1111-4111-8111-111111111111';
    const platformId = '22222222-2222-4222-8222-222222222222';
    const outsideResidentId = '33333333-3333-4333-8333-333333333333';

    seedAuthenticatedAdmin({
      role: 'facility_manager',
      isGlobal: false,
      communityIds: ['community-1'],
    });

    mockState.tables.profiles = [
      {
        id: 'profile-admin',
        user_id: 'auth-admin',
        first_name: 'Ada',
        last_name: 'Admin',
        full_name: 'Ada Admin',
        email: 'admin@example.com',
        phone: '2330000000',
        role: 'facility_manager',
        community_id: 'community-1',
        unit_id: null,
        block_number: null,
        is_active: true,
        last_login: recentLogin,
      },
      {
        id: residentId,
        first_name: 'Ama',
        last_name: 'Mensah',
        full_name: 'Ama Mensah',
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
        id: platformId,
        first_name: 'Platform',
        last_name: 'Lead',
        full_name: 'Platform Lead',
        email: 'lead@example.com',
        phone: '2330000002',
        role: 'superadmin',
        community_id: null,
        unit_id: null,
        block_number: null,
        is_active: false,
        last_login: '2026-03-19T08:00:00.000Z',
      },
      {
        id: outsideResidentId,
        first_name: 'Outside',
        last_name: 'User',
        full_name: 'Outside User',
        email: 'outside@example.com',
        phone: '2330000003',
        role: 'resident',
        community_id: 'community-2',
        unit_id: null,
        block_number: null,
        is_active: true,
        last_login: recentLogin,
      },
    ];
    mockState.tables.units = [
      { id: 'unit-1', block: 'A', number: '12', unit_number: '12', community_id: 'community-1' },
    ];
    mockState.tables.communities = [{ id: 'community-1', name: 'Alpha Court' }];
    mockState.tables.messages = [
      {
        id: 'message-1',
        from_user: 'profile-admin',
        to_user: residentId,
        body: 'Hello Ama',
        message_type: 'text',
        sent_at: '2026-03-11T10:00:00.000Z',
        deleted_at: null,
        is_read: true,
        read: true,
      },
      {
        id: 'message-2',
        from_user: residentId,
        to_user: 'profile-admin',
        body: 'Need help',
        message_type: 'text',
        sent_at: '2026-03-11T11:00:00.000Z',
        deleted_at: null,
        is_read: false,
        read: false,
      },
      {
        id: 'message-3',
        from_user: platformId,
        to_user: 'profile-admin',
        body: 'Platform check-in',
        message_type: 'text',
        sent_at: '2026-03-11T12:00:00.000Z',
        deleted_at: null,
        is_read: true,
        read: true,
      },
    ];

    const statsResponse = await performMountedRequest(app, {
      method: 'GET',
      path: '/admin/messages/stats',
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    expect(statsResponse.status).toBe(200);
    expect((statsResponse.body as any).data).toEqual({
      totalMessages: 3,
      activeChats: 2,
      unreadMessages: 1,
      onlineUsers: 1,
    });

    const contactsResponse = await performMountedRequest(app, {
      method: 'GET',
      path: '/admin/messages/contacts',
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    expect(contactsResponse.status).toBe(200);
    expect((contactsResponse.body as any).data).toEqual([
      expect.objectContaining({
        id: platformId,
        name: 'Platform Lead',
        message: 'Platform check-in',
        unreadCount: 0,
      }),
      expect.objectContaining({
        id: residentId,
        name: 'Ama Mensah',
        location: 'A-12 | Alpha Court',
        unreadCount: 1,
      }),
    ]);
  });

  it('rejects mounted conversation access for a contact outside scope with no existing thread', async () => {
    const app = await loadApp();
    const outsideResidentId = '33333333-3333-4333-8333-333333333333';

    seedAuthenticatedAdmin({
      role: 'facility_manager',
      isGlobal: false,
      communityIds: ['community-1'],
    });

    mockState.tables.profiles = [
      {
        id: 'profile-admin',
        user_id: 'auth-admin',
        first_name: 'Ada',
        last_name: 'Admin',
        email: 'admin@example.com',
        role: 'facility_manager',
        community_id: 'community-1',
        is_active: true,
        last_login: '2026-03-19T09:30:00.000Z',
      },
      {
        id: outsideResidentId,
        first_name: 'Outside',
        last_name: 'User',
        email: 'outside@example.com',
        role: 'resident',
        community_id: 'community-2',
        is_active: true,
        last_login: '2026-03-19T09:30:00.000Z',
      },
    ];
    mockState.tables.messages = [];
    mockState.tables.units = [];
    mockState.tables.communities = [];

    const response = await performMountedRequest(app, {
      method: 'GET',
      path: `/admin/messages/conversations/${outsideResidentId}`,
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    expect(response.status).toBe(404);
    expect((response.body as any).error.code).toBe('MESSAGE_CONTACT_NOT_FOUND');
  });

  it('creates direct messages through the mounted admin route and enforces recipient scope', async () => {
    const app = await loadApp();
    const residentId = '11111111-1111-4111-8111-111111111111';
    const outsideResidentId = '33333333-3333-4333-8333-333333333333';

    seedAuthenticatedAdmin({
      role: 'facility_manager',
      isGlobal: false,
      communityIds: ['community-1'],
    });

    mockState.tables.profiles = [
      {
        id: 'profile-admin',
        user_id: 'auth-admin',
        first_name: 'Ada',
        last_name: 'Admin',
        email: 'admin@example.com',
        role: 'facility_manager',
        community_id: 'community-1',
      },
      {
        id: residentId,
        first_name: 'Ama',
        last_name: 'Mensah',
        email: 'ama@example.com',
        role: 'resident',
        community_id: 'community-1',
      },
      {
        id: outsideResidentId,
        first_name: 'Outside',
        last_name: 'User',
        email: 'outside@example.com',
        role: 'resident',
        community_id: 'community-2',
      },
    ];
    mockState.tables.messages = [];

    const createResponse = await performMountedRequest(app, {
      method: 'POST',
      path: '/admin/messages',
      headers: {
        Authorization: 'Bearer valid-token',
      },
      body: {
        to_user: residentId,
        body: 'Launch coordination update',
      },
    });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toEqual(
      expect.objectContaining({
        from_user: 'profile-admin',
        to_user: residentId,
        body: 'Launch coordination update',
        message_status: 'sent',
        read: false,
        is_read: false,
      })
    );

    const deniedResponse = await performMountedRequest(app, {
      method: 'POST',
      path: '/admin/messages',
      headers: {
        Authorization: 'Bearer valid-token',
      },
      body: {
        to_user: outsideResidentId,
        body: 'Should be blocked',
      },
    });

    expect(deniedResponse.status).toBe(403);
    expect((deniedResponse.body as any).error.code).toBe('MESSAGE_RECIPIENT_SCOPE_VIOLATION');
  });

  it('creates message groups and group messages through the mounted admin routes', async () => {
    const app = await loadApp();
    const residentId = '11111111-1111-4111-8111-111111111111';

    seedAuthenticatedAdmin({
      role: 'facility_manager',
      isGlobal: false,
      communityIds: ['community-1'],
    });

    mockState.tables.profiles = [
      {
        id: 'profile-admin',
        user_id: 'auth-admin',
        first_name: 'Ada',
        last_name: 'Admin',
        email: 'admin@example.com',
        role: 'facility_manager',
        community_id: 'community-1',
        is_active: true,
        last_login: '2026-03-19T09:30:00.000Z',
      },
      {
        id: residentId,
        first_name: 'Ama',
        last_name: 'Mensah',
        email: 'ama@example.com',
        phone: '2330000001',
        role: 'resident',
        community_id: 'community-1',
        is_active: true,
        last_login: '2026-03-19T09:30:00.000Z',
      },
    ];
    mockState.tables.communities = [{ id: 'community-1', name: 'Alpha Court' }];
    mockState.tables.units = [];
    mockState.tables.messages = [];
    mockState.tables.groups = [];
    mockState.tables.group_members = [];
    mockState.tables.group_messages = [];

    const createGroupResponse = await performMountedRequest(app, {
      method: 'POST',
      path: '/admin/messages/groups',
      headers: {
        Authorization: 'Bearer valid-token',
      },
      body: {
        name: 'Security Ops',
        description: 'Launch coordination',
        member_ids: [residentId],
      },
    });

    expect(createGroupResponse.status).toBe(201);
    const createdGroupId = (createGroupResponse.body as any).data.id as string;
    expect((createGroupResponse.body as any).data).toEqual(
      expect.objectContaining({
        id: createdGroupId,
        name: 'Security Ops',
        group_members: expect.arrayContaining([
          expect.objectContaining({ user_id: 'profile-admin' }),
          expect.objectContaining({ user_id: residentId }),
        ]),
      })
    );

    const createGroupMessageResponse = await performMountedRequest(app, {
      method: 'POST',
      path: `/admin/messages/groups/${createdGroupId}/messages`,
      headers: {
        Authorization: 'Bearer valid-token',
      },
      body: {
        body: 'Morning coordination check',
        message_type: 'text',
      },
    });

    expect(createGroupMessageResponse.status).toBe(201);
    expect((createGroupMessageResponse.body as any).data).toEqual(
      expect.objectContaining({
        group_id: createdGroupId,
        body: 'Morning coordination check',
        profiles: expect.objectContaining({
          id: 'profile-admin',
          email: 'admin@example.com',
        }),
      })
    );

    const groupsResponse = await performMountedRequest(app, {
      method: 'GET',
      path: '/admin/messages/groups',
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    expect(groupsResponse.status).toBe(200);
    expect((groupsResponse.body as any).data).toEqual([
      expect.objectContaining({
        id: createdGroupId,
        member_count: 2,
        last_message: 'Morning coordination check',
        last_message_sender: 'You',
        unread_count: 0,
      }),
    ]);
  });

  it('returns scoped inquiries through the mounted admin route with enrichment', async () => {
    const app = await loadApp();

    seedAuthenticatedAdmin({
      role: 'facility_manager',
      isGlobal: false,
      communityIds: ['community-1'],
    });

    mockState.tables.inquiries = [
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
    ];
    mockState.tables.profiles = [
      ...mockState.tables.profiles,
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
    ];
    mockState.tables.communities = [
      { id: 'community-1', name: 'Casa One', agency_id: 'agency-1' },
      { id: 'community-2', name: 'Casa Two', agency_id: 'agency-1' },
    ];
    mockState.tables.agencies = [{ id: 'agency-1', name: 'Agency One' }];

    const response = await performMountedRequest(app, {
      method: 'GET',
      path: '/admin/inquiries?status=open',
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    expect(response.status).toBe(200);
    expect((response.body as any).data).toEqual([
      expect.objectContaining({
        id: 'inq-1',
        community: expect.objectContaining({ name: 'Casa One' }),
        agency: expect.objectContaining({ name: 'Agency One' }),
        user_profile: expect.objectContaining({ full_name: 'Resident One' }),
        assignee_profile: expect.objectContaining({ full_name: 'Admin One' }),
      }),
    ]);
  });

  it('returns scoped assignable admins through the mounted inquiry route and keeps superadmins available', async () => {
    const app = await loadApp();
    const communityId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const otherCommunityId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
    const assignableAdminProfileId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

    seedAuthenticatedAdmin({
      role: 'facility_manager',
      isGlobal: false,
      communityIds: [communityId],
    });

    mockState.tables.profiles = [
      ...mockState.tables.profiles,
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
        id: assignableAdminProfileId,
        user_id: 'facility-user-1',
        full_name: 'Community Admin',
        email: 'facility1@example.com',
        phone: null,
        role: 'facility_manager',
        community_id: communityId,
      },
      {
        id: 'profile-facility-2',
        user_id: 'facility-user-2',
        full_name: 'Other Community Admin',
        email: 'facility2@example.com',
        phone: null,
        role: 'facility_manager',
        community_id: otherCommunityId,
      },
    ];

    const response = await performMountedRequest(app, {
      method: 'GET',
      path: `/admin/inquiries/assignable-admins?community_id=${communityId}`,
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    expect(response.status).toBe(200);
    expect((response.body as any).data).toEqual([
      expect.objectContaining({ id: assignableAdminProfileId, user_id: 'facility-user-1' }),
      expect.objectContaining({ id: 'profile-superadmin', user_id: 'superadmin-user' }),
    ]);
  });

  it('rejects mounted inquiry detail access outside the scoped community set', async () => {
    const app = await loadApp();

    seedAuthenticatedAdmin({
      role: 'facility_manager',
      isGlobal: false,
      communityIds: ['community-1'],
    });

    mockState.tables.inquiries = [
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
    ];
    mockState.tables.profiles = [...mockState.tables.profiles];
    mockState.tables.communities = [{ id: 'community-2', name: 'Casa Two', agency_id: 'agency-1' }];
    mockState.tables.agencies = [{ id: 'agency-1', name: 'Agency One' }];

    const response = await performMountedRequest(app, {
      method: 'GET',
      path: '/admin/inquiries/inq-2',
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    expect(response.status).toBe(403);
    expect((response.body as any).error.code).toBe('INQUIRY_SCOPE_VIOLATION');
  });

  it('updates inquiries through the mounted admin route and stamps lifecycle fields', async () => {
    const app = await loadApp();
    const communityId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const assignableAdminProfileId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

    seedAuthenticatedAdmin({
      role: 'facility_manager',
      isGlobal: false,
      communityIds: [communityId],
    });

    mockState.tables.inquiries = [
      {
        id: 'inq-1',
        user_id: 'resident-user-1',
        community_id: communityId,
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
    ];
    mockState.tables.profiles = [
      ...mockState.tables.profiles,
      {
        id: assignableAdminProfileId,
        user_id: 'facility-user-1',
        full_name: 'Community Admin',
        email: 'facility1@example.com',
        phone: null,
        role: 'facility_manager',
        community_id: communityId,
      },
    ];
    mockState.tables.communities = [{ id: communityId, name: 'Casa One', agency_id: 'agency-1' }];
    mockState.tables.agencies = [{ id: 'agency-1', name: 'Agency One' }];

    const response = await performMountedRequest(app, {
      method: 'PATCH',
      path: '/admin/inquiries/inq-1',
      headers: {
        Authorization: 'Bearer valid-token',
      },
      body: {
        status: 'resolved',
        assigned_to: assignableAdminProfileId,
        admin_response: 'Team has fixed the issue.',
        resolution_notes: 'Replaced bulb and tested wiring.',
      },
    });

    expect(response.status).toBe(200);
    expect((response.body as any).message).toBe('Inquiry updated successfully');
    expect((response.body as any).data).toEqual(
      expect.objectContaining({
        id: 'inq-1',
        status: 'resolved',
        assigned_to: 'facility-user-1',
        admin_response: 'Team has fixed the issue.',
        resolution_notes: 'Replaced bulb and tested wiring.',
      })
    );
    expect((response.body as any).data.responded_at).toBeTruthy();
    expect((response.body as any).data.resolved_at).toBeTruthy();
    expect(mockState.tables.inquiries[0]).toEqual(
      expect.objectContaining({
        id: 'inq-1',
        status: 'resolved',
        assigned_to: 'facility-user-1',
      })
    );
  });

  it('returns scoped services through the mounted admin route with request counts', async () => {
    const app = await loadApp();

    seedAuthenticatedAdmin({
      role: 'facility_manager',
      isGlobal: false,
      communityIds: ['community-1'],
    });

    mockState.tables.services = [
      {
        id: 26,
        name: 'Plumbing',
        community_id: 'community-1',
        is_active: true,
        created_at: '2026-03-12T08:00:00.000Z',
      },
      {
        id: 27,
        name: 'Cleaning',
        community_id: 'community-2',
        is_active: true,
        created_at: '2026-03-11T08:00:00.000Z',
      },
    ];
    mockState.tables.service_requests = [
      {
        id: 'request-1',
        community_id: 'community-1',
        service_id: 26,
        request_details: 'Fix the kitchen sink',
        created_by: 'user-1',
        status: 'pending',
        total_amount: 45,
      },
      {
        id: 'request-2',
        community_id: 'community-1',
        service_id: 26,
        request_details: 'Repair shower',
        created_by: 'user-1',
        status: 'completed',
        total_amount: 60,
      },
      {
        id: 'request-3',
        community_id: 'community-2',
        service_id: 27,
        request_details: 'Housekeeping',
        created_by: 'user-2',
        status: 'completed',
        total_amount: 20,
      },
    ];
    mockState.tables.communities = [
      { id: 'community-1', name: 'Casa Nirvana One', agency_id: 'agency-1' },
      { id: 'community-2', name: 'Other Community', agency_id: 'agency-2' },
    ];

    const response = await performMountedRequest(app, {
      method: 'GET',
      path: '/admin/services',
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    expect(response.status).toBe(200);
    expect((response.body as any).data).toHaveLength(1);
    expect((response.body as any).data[0]).toEqual(
      expect.objectContaining({
        id: 26,
        communityName: 'Casa Nirvana One',
        request_counts: expect.objectContaining({
          total: 2,
          pending: 1,
          completed: 1,
          completedRevenue: 60,
        }),
      })
    );
  });

  it('rejects service creation outside the mounted admin scope', async () => {
    const app = await loadApp();

    seedAuthenticatedAdmin({
      role: 'facility_manager',
      isGlobal: false,
      communityIds: ['community-1'],
    });

    const response = await performMountedRequest(app, {
      method: 'POST',
      path: '/admin/services',
      headers: {
        Authorization: 'Bearer valid-token',
      },
      body: {
        name: 'Laundry',
        community_id: 'community-2',
        category: 'cleaning',
      },
    });

    expect(response.status).toBe(403);
    expect((response.body as any).error.code).toBe('SERVICE_SCOPE_VIOLATION');
  });

  it('returns enriched service request detail through the mounted admin route', async () => {
    const app = await loadApp();
    const serviceRequestId = '11111111-1111-1111-1111-111111111111';

    seedAuthenticatedAdmin({
      role: 'facility_manager',
      isGlobal: false,
      communityIds: ['community-1'],
    });

    mockState.tables.service_requests = [
      {
        id: serviceRequestId,
        community_id: 'community-1',
        service_id: 26,
        unit_id: 'unit-1',
        user_id: 'user-1',
        created_by: 'user-1',
        assigned_to: 'profile-tech',
        request_details: 'Fix the kitchen sink',
        status: 'pending',
        title: 'Sink repair',
        total_amount: 75,
        created_at: '2026-03-12T08:00:00.000Z',
      },
    ];
    mockState.tables.services = [
      {
        id: 26,
        name: 'Plumbing',
        community_id: 'community-1',
        is_active: true,
      },
    ];
    mockState.tables.units = [
      {
        id: 'unit-1',
        block: 'A',
        number: '101',
        community_id: 'community-1',
      },
    ];
    mockState.tables.profiles = [
      ...mockState.tables.profiles,
      {
        id: 'profile-user',
        user_id: 'user-1',
        first_name: 'Ada',
        last_name: 'Stone',
        email: 'resident@example.com',
      },
      {
        id: 'profile-tech',
        user_id: 'tech-user',
        first_name: 'Max',
        last_name: 'Rivera',
        email: 'tech@example.com',
      },
    ];
    mockState.tables.communities = [
      {
        id: 'community-1',
        name: 'Casa Nirvana One',
        address: 'Accra',
        agency_id: 'agency-1',
      },
    ];

    const response = await performMountedRequest(app, {
      method: 'GET',
      path: `/admin/service-requests/${serviceRequestId}`,
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    expect(response.status).toBe(200);
    expect((response.body as any).data).toEqual(
      expect.objectContaining({
        id: serviceRequestId,
        services: expect.objectContaining({
          id: 26,
          name: 'Plumbing',
        }),
        units: expect.objectContaining({
          id: 'unit-1',
          community: expect.objectContaining({
            name: 'Casa Nirvana One',
          }),
        }),
        user_profile: expect.objectContaining({
          email: 'resident@example.com',
        }),
        assigned_profile: expect.objectContaining({
          email: 'tech@example.com',
        }),
      })
    );
  });

  it('updates service request lifecycle fields through the mounted admin route when completing a request', async () => {
    const app = await loadApp();
    const serviceRequestId = '11111111-1111-1111-1111-111111111111';

    seedAuthenticatedAdmin({
      role: 'facility_manager',
      isGlobal: false,
      communityIds: ['community-1'],
    });

    mockState.tables.service_requests = [
      {
        id: serviceRequestId,
        community_id: 'community-1',
        service_id: 26,
        created_by: 'user-1',
        request_details: 'Fix the kitchen sink',
        status: 'in_progress',
        created_at: '2026-03-12T08:00:00.000Z',
        updated_at: '2026-03-12T09:00:00.000Z',
      },
    ];
    mockState.tables.services = [
      {
        id: 26,
        name: 'Plumbing',
        community_id: 'community-1',
        is_active: true,
      },
    ];
    mockState.tables.communities = [
      {
        id: 'community-1',
        name: 'Casa Nirvana One',
        address: 'Accra',
      },
    ];

    const response = await performMountedRequest(app, {
      method: 'PATCH',
      path: `/admin/service-requests/${serviceRequestId}`,
      headers: {
        Authorization: 'Bearer valid-token',
      },
      body: {
        status: 'completed',
      },
    });

    expect(response.status).toBe(200);
    expect((response.body as any).message).toBe('Service request updated successfully');
    expect((response.body as any).data).toEqual(
      expect.objectContaining({
        id: serviceRequestId,
        status: 'completed',
      })
    );
    expect((response.body as any).data.completion_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect((response.body as any).data.updated_at).toBeTruthy();
    expect(mockState.tables.service_requests[0]).toEqual(
      expect.objectContaining({
        id: serviceRequestId,
        status: 'completed',
      })
    );
  });

  it('returns scoped amenities through the mounted admin route with community enrichment', async () => {
    const app = await loadApp();

    seedAuthenticatedAdmin({
      role: 'facility_manager',
      isGlobal: false,
      communityIds: ['community-1'],
    });

    mockState.tables.amenities = [
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
    ];
    mockState.tables.communities = [
      { id: 'community-1', name: 'Casa Nirvana One', agency_id: 'agency-1' },
      { id: 'community-2', name: 'Other Community', agency_id: 'agency-2' },
    ];

    const response = await performMountedRequest(app, {
      method: 'GET',
      path: '/admin/amenities',
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    expect(response.status).toBe(200);
    expect((response.body as any).data).toEqual([
      expect.objectContaining({
        id: 'amenity-1',
        community_id: 'community-1',
        communityName: 'Casa Nirvana One',
        communities: expect.objectContaining({
          id: 'community-1',
          name: 'Casa Nirvana One',
        }),
      }),
    ]);
  });

  it('rejects amenity creation outside the mounted admin community scope', async () => {
    const app = await loadApp();

    seedAuthenticatedAdmin({
      role: 'facility_manager',
      isGlobal: false,
      communityIds: ['community-1'],
    });

    const response = await performMountedRequest(app, {
      method: 'POST',
      path: '/admin/amenities',
      headers: {
        Authorization: 'Bearer valid-token',
      },
      body: {
        name: 'Clubhouse',
        community_id: 'community-2',
      },
    });

    expect(response.status).toBe(403);
    expect((response.body as any).error.code).toBe('AMENITY_SCOPE_VIOLATION');
  });

  it('returns scoped amenity bookings through the mounted admin route with amenity and resident enrichment', async () => {
    const app = await loadApp();

    seedAuthenticatedAdmin({
      role: 'facility_manager',
      isGlobal: false,
      communityIds: ['community-1'],
    });

    mockState.tables.amenities = [
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
    ];
    mockState.tables.amenity_bookings = [
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
    ];
    mockState.tables.profiles = [
      ...mockState.tables.profiles,
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
    ];

    const response = await performMountedRequest(app, {
      method: 'GET',
      path: '/admin/amenity-bookings',
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    expect(response.status).toBe(200);
    expect((response.body as any).data).toEqual([
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
    ]);
  });

  it('applies valid scoped amenity booking lifecycle updates through the mounted admin route', async () => {
    const app = await loadApp();

    seedAuthenticatedAdmin({
      role: 'facility_manager',
      isGlobal: false,
      communityIds: ['community-1'],
    });

    mockState.tables.amenities = [
      {
        id: 'amenity-1',
        community_id: 'community-1',
        name: 'Pool',
        amenity_type: 'Recreation',
      },
    ];
    mockState.tables.amenity_bookings = [
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
    ];
    mockState.tables.profiles = [
      ...mockState.tables.profiles,
      {
        id: 'profile-resident-1',
        first_name: 'Ama',
        last_name: 'Mensah',
        full_name: 'Ama Mensah',
        email: 'ama@example.com',
      },
    ];

    const response = await performMountedRequest(app, {
      method: 'PATCH',
      path: '/admin/amenity-bookings/booking-1',
      headers: {
        Authorization: 'Bearer valid-token',
      },
      body: {
        status: 'confirmed',
        payment_status: 'paid',
      },
    });

    expect(response.status).toBe(200);
    expect((response.body as any).data).toEqual(
      expect.objectContaining({
        id: 'booking-1',
        status: 'confirmed',
        payment_status: 'paid',
      })
    );
    expect(mockState.tables.amenity_bookings[0]).toEqual(
      expect.objectContaining({
        id: 'booking-1',
        status: 'confirmed',
        payment_status: 'paid',
      })
    );
  });

  it('returns scoped notification dashboard data through the mounted admin route', async () => {
    const app = await loadApp();
    const communityId = '11111111-1111-1111-1111-111111111111';
    const otherCommunityId = '22222222-2222-2222-2222-222222222222';
    const currentTimestamp = new Date().toISOString();

    seedAuthenticatedAdmin({
      permissions: ['read:all_notifications'],
      role: 'facility_manager',
      isGlobal: false,
      communityIds: [communityId],
    });

    mockState.tables.notification_campaigns = [
      {
        id: 'campaign-scoped',
        title: 'Scoped Broadcast',
        name: 'Scoped Broadcast',
        type: 'email',
        status: 'delivered',
        community_id: communityId,
        recipients_count: 42,
        delivered_count: 40,
        opened_count: 20,
        clicked_count: 5,
        failed_count: 2,
        sent_at: currentTimestamp,
        created_at: currentTimestamp,
        updated_at: currentTimestamp,
      },
      {
        id: 'campaign-out-of-scope',
        title: 'Out Of Scope Broadcast',
        name: 'Out Of Scope Broadcast',
        type: 'sms',
        status: 'delivered',
        community_id: otherCommunityId,
        recipients_count: 99,
        delivered_count: 90,
        opened_count: 10,
        clicked_count: 1,
        failed_count: 9,
        sent_at: currentTimestamp,
        created_at: currentTimestamp,
        updated_at: currentTimestamp,
      },
    ];

    const response = await performMountedRequest(app, {
      method: 'GET',
      path: '/admin/notifications/dashboard?limit=5',
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    expect(response.status).toBe(200);
    expect((response.body as any).data.recent_campaigns).toEqual([
      expect.objectContaining({ id: 'campaign-scoped', community_id: communityId }),
    ]);
    expect((response.body as any).data.today_summary).toEqual(
      expect.objectContaining({
        total_sent: 42,
        total_delivered: 40,
        total_opened: 20,
        total_clicked: 5,
      })
    );
    expect((response.body as any).data.channel_performance.email).toEqual(
      expect.objectContaining({
        totalSent: 42,
        totalDelivered: 40,
        totalOpened: 20,
        totalClicked: 5,
      })
    );
    expect((response.body as any).data.channel_performance.sms).toEqual(
      expect.objectContaining({
        totalSent: 0,
        totalDelivered: 0,
      })
    );
  });

  it('rejects mounted notification campaign detail access outside the admin community scope', async () => {
    const app = await loadApp();
    const communityId = '11111111-1111-1111-1111-111111111111';
    const otherCommunityId = '22222222-2222-2222-2222-222222222222';

    seedAuthenticatedAdmin({
      permissions: ['read:all_notifications'],
      role: 'facility_manager',
      isGlobal: false,
      communityIds: [communityId],
    });

    mockState.tables.notification_campaigns = [
      {
        id: 'campaign-out-of-scope',
        title: 'Out Of Scope Broadcast',
        name: 'Out Of Scope Broadcast',
        type: 'sms',
        status: 'delivered',
        community_id: otherCommunityId,
        recipients_count: 99,
        delivered_count: 90,
        opened_count: 10,
        clicked_count: 1,
        failed_count: 9,
        created_at: '2026-03-19T09:00:00.000Z',
        updated_at: '2026-03-19T09:00:00.000Z',
      },
    ];

    const response = await performMountedRequest(app, {
      method: 'GET',
      path: '/admin/notification-campaigns/campaign-out-of-scope',
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    expect(response.status).toBe(403);
    expect((response.body as any).error.code).toBe('NOTIFICATION_CAMPAIGN_SCOPE_VIOLATION');
  });

  it('creates notification campaigns through the mounted admin route and auto-assigns the scoped community', async () => {
    const app = await loadApp();
    const communityId = '11111111-1111-1111-1111-111111111111';

    seedAuthenticatedAdmin({
      permissions: ['write:all_notifications'],
      role: 'facility_manager',
      isGlobal: false,
      communityIds: [communityId],
    });

    mockState.tables.notification_campaigns = [];
    mockState.tables.notification_templates = [];

    const response = await performMountedRequest(app, {
      method: 'POST',
      path: '/admin/notification-campaigns',
      headers: {
        Authorization: 'Bearer valid-token',
      },
      body: {
        title: 'Scoped Launch Reminder',
        type: 'email',
        recipients_count: 12,
        audience: 'all-residents',
        status: 'draft',
      },
    });

    expect(response.status).toBe(201);
    expect((response.body as any).title).toBe('Scoped Launch Reminder');
    expect((response.body as any).name).toBe('Scoped Launch Reminder');
    expect((response.body as any).community_id).toBe(communityId);
    expect(mockState.tables.notification_campaigns[0]).toEqual(
      expect.objectContaining({
        title: 'Scoped Launch Reminder',
        name: 'Scoped Launch Reminder',
        community_id: communityId,
      })
    );
  });

  it('updates notification campaigns through the mounted admin route and keeps title and name aligned', async () => {
    const app = await loadApp();
    const communityId = '11111111-1111-1111-1111-111111111111';

    seedAuthenticatedAdmin({
      permissions: ['write:all_notifications'],
      role: 'facility_manager',
      isGlobal: false,
      communityIds: [communityId],
    });

    mockState.tables.notification_campaigns = [
      {
        id: 'campaign-scoped',
        title: 'Old Title',
        name: 'Old Title',
        type: 'push',
        status: 'draft',
        community_id: communityId,
        recipients_count: 10,
        delivered_count: 0,
        opened_count: 0,
        clicked_count: 0,
        failed_count: 0,
        created_at: '2026-03-19T08:00:00.000Z',
        updated_at: '2026-03-19T08:00:00.000Z',
      },
    ];

    const response = await performMountedRequest(app, {
      method: 'PUT',
      path: '/admin/notification-campaigns/campaign-scoped',
      headers: {
        Authorization: 'Bearer valid-token',
      },
      body: {
        title: 'Updated Title',
        status: 'completed',
        opened_count: 7,
      },
    });

    expect(response.status).toBe(200);
    expect((response.body as any).title).toBe('Updated Title');
    expect((response.body as any).name).toBe('Updated Title');
    expect((response.body as any).status).toBe('completed');
    expect((response.body as any).opened_count).toBe(7);
    expect(mockState.tables.notification_campaigns[0]).toEqual(
      expect.objectContaining({
        id: 'campaign-scoped',
        title: 'Updated Title',
        name: 'Updated Title',
        status: 'completed',
        opened_count: 7,
      })
    );
  });

  it('validates mounted notification analytics queries before the controller runs', async () => {
    const app = await loadApp();

    seedAuthenticatedAdmin({
      permissions: ['read:all_notifications'],
      role: 'facility_manager',
      isGlobal: false,
      communityIds: ['11111111-1111-1111-1111-111111111111'],
    });

    const response = await performMountedRequest(app, {
      method: 'GET',
      path: '/admin/notifications/analytics?dateRange=custom&channel=sms',
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    expect(response.status).toBe(400);
    expect((response.body as any).error.code).toBe('VALIDATION_ERROR');
  });

  it('returns scoped emergency alerts through the mounted admin route with enrichment', async () => {
    const app = await loadApp();

    seedAuthenticatedAdmin({
      permissions: ['read:all_notifications'],
      role: 'facility_manager',
      isGlobal: false,
      communityIds: ['community-1'],
    });

    mockState.tables.emergency_alerts = [
      {
        id: 'alert-1',
        title: 'Smoke in Block A',
        description: 'Smoke detected in the hallway.',
        alert_type: 'fire',
        priority: 'high',
        status: 'active',
        community_id: 'community-1',
        unit_id: 'unit-1',
        user_id: 'profile-reporter',
        resolved_by: null,
        resolved_at: null,
        created_at: '2026-03-19T08:00:00.000Z',
        updated_at: '2026-03-19T08:05:00.000Z',
      },
      {
        id: 'alert-2',
        title: 'Outside Scope',
        description: 'Should not be visible',
        alert_type: 'security',
        priority: 'medium',
        status: 'pending',
        community_id: 'community-2',
        unit_id: 'unit-2',
        user_id: 'profile-outside',
        resolved_by: null,
        resolved_at: null,
        created_at: '2026-03-19T09:00:00.000Z',
        updated_at: '2026-03-19T09:00:00.000Z',
      },
    ];
    mockState.tables.profiles = [
      ...mockState.tables.profiles,
      {
        id: 'profile-reporter',
        first_name: 'Ama',
        last_name: 'Mensah',
        email: 'ama@example.com',
        phone: '0240000000',
        avatar_url: null,
        user_id: 'resident-user-1',
        community_id: 'community-1',
      },
      {
        id: 'profile-outside',
        first_name: 'Outside',
        last_name: 'Resident',
        email: 'outside@example.com',
        phone: '0240000001',
        avatar_url: null,
        user_id: 'resident-user-2',
        community_id: 'community-2',
      },
    ];
    mockState.tables.communities = [
      { id: 'community-1', name: 'Palm Estate' },
      { id: 'community-2', name: 'Outside Estate' },
    ];
    mockState.tables.units = [
      { id: 'unit-1', community_id: 'community-1', block: 'A', number: '12', unit_number: 'A-12' },
      { id: 'unit-2', community_id: 'community-2', block: 'B', number: '4', unit_number: 'B-4' },
    ];

    const response = await performMountedRequest(app, {
      method: 'GET',
      path: '/admin/emergency-alerts?status=active',
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    expect(response.status).toBe(200);
    expect((response.body as any).data).toEqual([
      expect.objectContaining({
        id: 'alert-1',
        communities: expect.objectContaining({ id: 'community-1', name: 'Palm Estate' }),
        units: expect.objectContaining({ id: 'unit-1', block: 'A', number: '12' }),
        user_profile: expect.objectContaining({ id: 'profile-reporter', first_name: 'Ama', last_name: 'Mensah' }),
      }),
    ]);
  });

  it('rejects mounted emergency alert detail access outside the scoped community set', async () => {
    const app = await loadApp();

    seedAuthenticatedAdmin({
      permissions: ['read:all_notifications'],
      role: 'facility_manager',
      isGlobal: false,
      communityIds: ['community-1'],
    });

    mockState.tables.emergency_alerts = [
      {
        id: 'alert-outside',
        title: 'Outside Scope',
        description: 'Should not be visible',
        alert_type: 'security',
        priority: 'medium',
        status: 'pending',
        community_id: 'community-2',
        unit_id: 'unit-2',
        user_id: 'profile-outside',
        resolved_by: null,
        resolved_at: null,
        created_at: '2026-03-19T09:00:00.000Z',
        updated_at: '2026-03-19T09:00:00.000Z',
      },
    ];
    mockState.tables.profiles = [
      ...mockState.tables.profiles,
      {
        id: 'profile-outside',
        first_name: 'Outside',
        last_name: 'Resident',
        email: 'outside@example.com',
        phone: '0240000001',
        avatar_url: null,
        user_id: 'resident-user-2',
        community_id: 'community-2',
      },
    ];
    mockState.tables.communities = [{ id: 'community-2', name: 'Outside Estate' }];
    mockState.tables.units = [{ id: 'unit-2', community_id: 'community-2', block: 'B', number: '4', unit_number: 'B-4' }];

    const response = await performMountedRequest(app, {
      method: 'GET',
      path: '/admin/emergency-alerts/alert-outside',
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    expect(response.status).toBe(403);
    expect((response.body as any).error.code).toBe('EMERGENCY_ALERT_SCOPE_VIOLATION');
  });

  it('creates emergency alerts through the mounted admin route and stamps the actor profile', async () => {
    const app = await loadApp();

    seedAuthenticatedAdmin({
      permissions: ['write:all_notifications'],
      role: 'facility_manager',
      isGlobal: false,
      communityIds: ['community-1'],
    });

    mockState.tables.emergency_alerts = [];
    mockState.tables.communities = [{ id: 'community-1', name: 'Palm Estate' }];
    mockState.tables.units = [];

    const response = await performMountedRequest(app, {
      method: 'POST',
      path: '/admin/emergency-alerts',
      headers: {
        Authorization: 'Bearer valid-token',
      },
      body: {
        title: 'Medical response needed',
        description: 'Resident requested urgent assistance.',
        alert_type: 'medical',
        priority: 'critical',
        community_id: 'community-1',
      },
    });

    expect(response.status).toBe(201);
    expect((response.body as any).data).toEqual(
      expect.objectContaining({
        title: 'Medical response needed',
        community_id: 'community-1',
        user_id: 'profile-admin',
        priority: 'critical',
        status: 'active',
        resolved_at: null,
        resolved_by: null,
      })
    );
    expect(mockState.tables.emergency_alerts[0]).toEqual(
      expect.objectContaining({
        title: 'Medical response needed',
        community_id: 'community-1',
        user_id: 'profile-admin',
      })
    );
  });

  it('updates emergency alerts through the mounted admin route and stamps resolution server-side', async () => {
    const app = await loadApp();

    seedAuthenticatedAdmin({
      permissions: ['write:all_notifications'],
      role: 'facility_manager',
      isGlobal: false,
      communityIds: ['community-1'],
    });

    mockState.tables.emergency_alerts = [
      {
        id: 'alert-1',
        title: 'Smoke in Block A',
        description: 'Smoke detected in the hallway.',
        alert_type: 'fire',
        priority: 'high',
        status: 'active',
        community_id: 'community-1',
        unit_id: null,
        user_id: 'profile-admin',
        resolved_by: null,
        resolved_at: null,
        created_at: '2026-03-19T08:00:00.000Z',
        updated_at: '2026-03-19T08:05:00.000Z',
      },
    ];
    mockState.tables.communities = [{ id: 'community-1', name: 'Palm Estate' }];
    mockState.tables.units = [];

    const response = await performMountedRequest(app, {
      method: 'PATCH',
      path: '/admin/emergency-alerts/alert-1',
      headers: {
        Authorization: 'Bearer valid-token',
      },
      body: {
        status: 'resolved',
      },
    });

    expect(response.status).toBe(200);
    expect((response.body as any).data).toEqual(
      expect.objectContaining({
        id: 'alert-1',
        status: 'resolved',
        resolved_by: 'profile-admin',
      })
    );
    expect((response.body as any).data.resolved_at).toEqual(expect.any(String));
    expect(mockState.tables.emergency_alerts[0]).toEqual(
      expect.objectContaining({
        id: 'alert-1',
        status: 'resolved',
        resolved_by: 'profile-admin',
      })
    );
  });

  it('validates mounted emergency alert list queries before the controller runs', async () => {
    const app = await loadApp();

    seedAuthenticatedAdmin({
      permissions: ['read:all_notifications'],
      role: 'facility_manager',
      isGlobal: false,
      communityIds: ['community-1'],
    });

    const response = await performMountedRequest(app, {
      method: 'GET',
      path: '/admin/emergency-alerts?status=closed&limit=0',
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    expect(response.status).toBe(400);
    expect((response.body as any).error.code).toBe('VALIDATION_ERROR');
  });

  it('returns scoped email records through the mounted admin route with summary and enrichment', async () => {
    const app = await loadApp();

    seedAuthenticatedAdmin({
      permissions: ['read:all_notifications'],
      role: 'facility_manager',
      isGlobal: false,
      communityIds: ['community-1'],
    });

    mockState.tables.emails = [
      {
        id: 'email-1',
        subject: 'Community update',
        body: 'Body one',
        folder: 'inbox',
        status: 'delivered',
        priority: 'normal',
        sent_at: '2026-03-19T09:00:00.000Z',
        created_at: '2026-03-19T08:55:00.000Z',
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
        sent_at: '2026-03-19T10:00:00.000Z',
        created_at: '2026-03-19T09:55:00.000Z',
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
    ];
    mockState.tables.users = [
      { id: 'auth-admin', email: 'admin@example.com' },
      { id: 'resident-user-1', email: 'ama@example.com' },
      { id: 'resident-user-2', email: 'outside@example.com' },
    ];
    mockState.tables.profiles = [
      ...mockState.tables.profiles,
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
    ];
    mockState.tables.communities = [
      { id: 'community-1', name: 'Palm Estate' },
      { id: 'community-2', name: 'Outside Estate' },
    ];

    const response = await performMountedRequest(app, {
      method: 'GET',
      path: '/admin/emails?folder=inbox&limit=25',
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    expect(response.status).toBe(200);
    expect((response.body as any).data).toEqual([
      expect.objectContaining({
        id: 'email-1',
        resolved_community_id: 'community-1',
        resolved_community_name: 'Palm Estate',
        sender: expect.objectContaining({
          full_name: 'Ama Mensah',
          email: 'ama@example.com',
        }),
        recipient: expect.objectContaining({
          full_name: 'Ada Admin',
          email: 'admin@example.com',
        }),
      }),
    ]);
    expect((response.body as any).summary).toEqual(
      expect.objectContaining({
        total: 1,
        inbox: 1,
        queued: 0,
        delivered: 1,
        unread: 1,
        starred: 1,
      })
    );
  });

  it('rejects mounted email detail access outside the admin scope', async () => {
    const app = await loadApp();

    seedAuthenticatedAdmin({
      permissions: ['read:all_notifications'],
      role: 'facility_manager',
      isGlobal: false,
      communityIds: ['community-1'],
    });

    mockState.tables.emails = [
      {
        id: 'email-outside',
        subject: 'Outside scope',
        body: 'Body two',
        folder: 'inbox',
        status: 'delivered',
        priority: 'normal',
        sent_at: '2026-03-19T10:00:00.000Z',
        created_at: '2026-03-19T09:55:00.000Z',
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
    ];
    mockState.tables.users = [
      { id: 'auth-admin', email: 'admin@example.com' },
      { id: 'resident-user-2', email: 'outside@example.com' },
    ];
    mockState.tables.profiles = [
      ...mockState.tables.profiles,
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
    ];
    mockState.tables.communities = [
      { id: 'community-1', name: 'Palm Estate' },
      { id: 'community-2', name: 'Outside Estate' },
    ];

    const response = await performMountedRequest(app, {
      method: 'GET',
      path: '/admin/emails/email-outside',
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    expect(response.status).toBe(403);
    expect((response.body as any).error.code).toBe('EMAIL_SCOPE_VIOLATION');
  });

  it('creates scoped email records through the mounted admin route and queues drafts through update', async () => {
    const app = await loadApp();

    seedAuthenticatedAdmin({
      permissions: ['write:all_notifications'],
      role: 'facility_manager',
      isGlobal: false,
      communityIds: ['community-1'],
    });

    mockState.tables.emails = [
      {
        id: 'draft-1',
        subject: 'Draft subject',
        body: 'Draft body',
        folder: 'drafts',
        status: 'draft',
        priority: 'normal',
        sent_at: null,
        created_at: '2026-03-19T08:00:00.000Z',
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
    ];
    mockState.tables.users = [
      { id: 'auth-admin', email: 'admin@example.com' },
      { id: 'resident-user-1', email: 'ama@example.com' },
    ];
    mockState.tables.profiles = [
      ...mockState.tables.profiles,
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
    ];
    mockState.tables.communities = [{ id: 'community-1', name: 'Palm Estate' }];

    const createResponse = await performMountedRequest(app, {
      method: 'POST',
      path: '/admin/emails',
      headers: {
        Authorization: 'Bearer valid-token',
      },
      body: {
        recipient_id: 'resident-user-1',
        subject: 'Reminder',
        body: 'Please review your latest statement.',
        priority: 'urgent',
        action: 'queue',
      },
    });

    expect(createResponse.status).toBe(201);
    expect((createResponse.body as any).data).toEqual(
      expect.objectContaining({
        subject: 'Reminder',
        folder: 'sent',
        status: 'queued',
        community_id: 'community-1',
        sender_id: 'auth-admin',
        recipient_id: 'resident-user-1',
        is_important: true,
      })
    );

    const updateResponse = await performMountedRequest(app, {
      method: 'PATCH',
      path: '/admin/emails/draft-1',
      headers: {
        Authorization: 'Bearer valid-token',
      },
      body: {
        status: 'queued',
      },
    });

    expect(updateResponse.status).toBe(200);
    expect((updateResponse.body as any).data).toEqual(
      expect.objectContaining({
        id: 'draft-1',
        status: 'queued',
        folder: 'sent',
        is_draft: false,
        is_read: true,
      })
    );
    expect((mockState.tables.emails || []).find((row) => row.id === 'draft-1')).toEqual(
      expect.objectContaining({
        status: 'queued',
        folder: 'sent',
        is_draft: false,
        is_read: true,
      })
    );
  });

  it('returns scoped email contacts through the mounted admin route', async () => {
    const app = await loadApp();

    seedAuthenticatedAdmin({
      permissions: ['read:all_notifications'],
      role: 'facility_manager',
      isGlobal: false,
      communityIds: ['community-1'],
    });

    mockState.tables.profiles[0] = {
      ...mockState.tables.profiles[0],
      community_id: 'community-1',
    };
    mockState.tables.profiles = [
      ...mockState.tables.profiles,
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
    ];
    mockState.tables.communities = [
      { id: 'community-1', name: 'Palm Estate' },
      { id: 'community-2', name: 'Outside Estate' },
    ];

    const response = await performMountedRequest(app, {
      method: 'GET',
      path: '/admin/emails/contacts',
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    expect(response.status).toBe(200);
    expect((response.body as any).data).toEqual([
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
    ]);
  });

  it('validates mounted email list queries before the controller runs', async () => {
    const app = await loadApp();

    seedAuthenticatedAdmin({
      permissions: ['read:all_notifications'],
      role: 'facility_manager',
      isGlobal: false,
      communityIds: ['community-1'],
    });

    const response = await performMountedRequest(app, {
      method: 'GET',
      path: '/admin/emails?folder=made-up-folder&limit=0',
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    expect(response.status).toBe(400);
    expect((response.body as any).error.code).toBe('VALIDATION_ERROR');
  });

  it('returns scoped notices through the mounted admin route with community enrichment', async () => {
    const app = await loadApp();
    const communityId = '11111111-1111-1111-1111-111111111111';
    const otherCommunityId = '22222222-2222-2222-2222-222222222222';

    seedAuthenticatedAdmin({
      permissions: ['read:all_notifications'],
      role: 'facility_manager',
      isGlobal: false,
      communityIds: [communityId],
    });

    mockState.tables.communities = [
      { id: communityId, name: 'Casa One' },
      { id: otherCommunityId, name: 'Casa Two' },
    ];
    mockState.tables.notices = [
      {
        id: 'notice-scoped',
        community_id: communityId,
        title: 'Main Gate Repair',
        body: 'Repair works will start at 7 AM.',
        status: 'published',
        priority: 'high',
        created_at: '2026-03-19T08:00:00.000Z',
        posted_at: '2026-03-19T08:00:00.000Z',
        updated_at: '2026-03-19T08:00:00.000Z',
        tags: ['maintenance'],
      },
      {
        id: 'notice-outside',
        community_id: otherCommunityId,
        title: 'Outside Scope',
        body: 'Should not be visible',
        status: 'published',
        priority: 'medium',
        created_at: '2026-03-19T07:00:00.000Z',
        posted_at: '2026-03-19T07:00:00.000Z',
        updated_at: '2026-03-19T07:00:00.000Z',
        tags: ['outside'],
      },
    ];

    const response = await performMountedRequest(app, {
      method: 'GET',
      path: '/admin/notices?search=gate&limit=10',
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    expect(response.status).toBe(200);
    expect((response.body as any).count).toBe(1);
    expect((response.body as any).data).toEqual([
      expect.objectContaining({
        id: 'notice-scoped',
        community_id: communityId,
        communities: expect.objectContaining({ id: communityId, name: 'Casa One' }),
      }),
    ]);
  });

  it('rejects mounted notice detail access outside the admin scope', async () => {
    const app = await loadApp();
    const communityId = '11111111-1111-1111-1111-111111111111';
    const otherCommunityId = '22222222-2222-2222-2222-222222222222';

    seedAuthenticatedAdmin({
      permissions: ['read:all_notifications'],
      role: 'facility_manager',
      isGlobal: false,
      communityIds: [communityId],
    });

    mockState.tables.notices = [
      {
        id: 'notice-outside',
        community_id: otherCommunityId,
        title: 'Community B',
        body: 'Out of scope bulletin',
        status: 'published',
        created_at: '2026-03-19T07:00:00.000Z',
        posted_at: '2026-03-19T07:00:00.000Z',
        updated_at: '2026-03-19T07:00:00.000Z',
      },
    ];

    const response = await performMountedRequest(app, {
      method: 'GET',
      path: '/admin/notices/notice-outside',
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    expect(response.status).toBe(403);
    expect((response.body as any).error.code).toBe('ADMIN_NOTICE_SCOPE_VIOLATION');
  });

  it('creates and updates notices through the mounted admin route with backend-owned publication metadata', async () => {
    const app = await loadApp();
    const communityId = '11111111-1111-1111-1111-111111111111';

    seedAuthenticatedAdmin({
      permissions: ['write:all_notifications'],
      role: 'facility_manager',
      isGlobal: false,
      communityIds: [communityId],
    });

    mockState.tables.communities = [{ id: communityId, name: 'Casa One' }];
    mockState.tables.notices = [];

    const createResponse = await performMountedRequest(app, {
      method: 'POST',
      path: '/admin/notices',
      headers: {
        Authorization: 'Bearer valid-token',
      },
      body: {
        community_id: communityId,
        title: 'Pool Closure',
        body: 'The pool will be closed on Saturday.',
        status: 'published',
        priority: 'urgent',
        tags: ['amenities', 'weekend'],
        is_featured: true,
      },
    });

    expect(createResponse.status).toBe(201);
    expect((createResponse.body as any).data).toEqual(
      expect.objectContaining({
        title: 'Pool Closure',
        author_name: 'Ada Admin',
        community_id: communityId,
        is_featured: true,
      })
    );

    const createdId = ((createResponse.body as any).data.id as string);

    const updateResponse = await performMountedRequest(app, {
      method: 'PATCH',
      path: `/admin/notices/${createdId}`,
      headers: {
        Authorization: 'Bearer valid-token',
      },
      body: {
        title: 'Pool Closure Update',
        status: 'archived',
      },
    });

    expect(updateResponse.status).toBe(200);
    expect((updateResponse.body as any).data).toEqual(
      expect.objectContaining({
        id: createdId,
        title: 'Pool Closure Update',
        status: 'archived',
      })
    );
  });

  it('creates threaded notice comments through the mounted admin route', async () => {
    const app = await loadApp();
    const communityId = '11111111-1111-1111-1111-111111111111';
    const noticeId = '33333333-3333-4333-8333-333333333333';
    const parentCommentId = '44444444-4444-4444-8444-444444444444';

    seedAuthenticatedAdmin({
      permissions: ['read:all_notifications', 'write:all_notifications'],
      role: 'facility_manager',
      isGlobal: false,
      communityIds: [communityId],
    });

    mockState.tables.notices = [
      {
        id: noticeId,
        community_id: communityId,
        title: 'Main Gate Repair',
        body: 'Repair works will start at 7 AM.',
        status: 'published',
        created_at: '2026-03-19T08:00:00.000Z',
        posted_at: '2026-03-19T08:00:00.000Z',
        updated_at: '2026-03-19T08:00:00.000Z',
      },
    ];
    mockState.tables.comments = [
      {
        id: parentCommentId,
        notice_id: noticeId,
        author_name: 'Resident One',
        content: 'Will the side gate remain open?',
        likes_count: 2,
        created_at: '2026-03-19T09:00:00.000Z',
        updated_at: '2026-03-19T09:00:00.000Z',
        parent_id: null,
      },
    ];

    const createResponse = await performMountedRequest(app, {
      method: 'POST',
      path: `/admin/notices/${noticeId}/comments`,
      headers: {
        Authorization: 'Bearer valid-token',
      },
      body: {
        content: 'Yes, the side gate will remain open.',
        parent_id: parentCommentId,
      },
    });

    expect(createResponse.status).toBe(201);
    expect((createResponse.body as any).data).toEqual(
      expect.objectContaining({
        notice_id: noticeId,
        parent_id: parentCommentId,
        author_name: 'Ada Admin',
        author_user_id: 'auth-admin',
      })
    );

    const listResponse = await performMountedRequest(app, {
      method: 'GET',
      path: `/admin/notices/${noticeId}/comments`,
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    expect(listResponse.status).toBe(200);
    expect((listResponse.body as any).data).toEqual([
      expect.objectContaining({
        id: parentCommentId,
        replies: [
          expect.objectContaining({
            parent_id: parentCommentId,
            content: 'Yes, the side gate will remain open.',
          }),
        ],
      }),
    ]);
  });

  it('validates mounted notice list queries before the controller runs', async () => {
    const app = await loadApp();

    seedAuthenticatedAdmin({
      permissions: ['read:all_notifications'],
      role: 'facility_manager',
      isGlobal: false,
      communityIds: ['11111111-1111-1111-1111-111111111111'],
    });

    const response = await performMountedRequest(app, {
      method: 'GET',
      path: '/admin/notices?status=processing',
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    expect(response.status).toBe(400);
    expect((response.body as any).error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects onboarding writes when the public API key is wrong', async () => {
    const app = await loadApp();

    const response = await performMountedRequest(app, {
      method: 'POST',
      path: '/onboarding/requests',
      headers: {
        'x-onboarding-api-key': 'wrong-key',
      },
      body: {
        requested_role: 'agency_manager',
        first_name: 'Ada',
        last_name: 'Lovelace',
        email: 'ada@example.com',
      },
    });

    expect(response.status).toBe(401);
    expect((response.body as any).error.code).toBe('ONBOARDING_API_KEY_INVALID');
  });

  it('validates onboarding payloads before hitting the controller write path', async () => {
    const app = await loadApp();

    const response = await performMountedRequest(app, {
      method: 'POST',
      path: '/onboarding/requests',
      headers: {
        'x-onboarding-api-key': 'onboarding-test-key',
      },
      body: {
        requested_role: 'agency_manager',
        first_name: 'Ada',
        email: 'ada@example.com',
      },
    });

    expect(response.status).toBe(400);
    expect((response.body as any).error.code).toBe('VALIDATION_ERROR');
    expect((response.body as any).error.details.fieldErrors.last_name).toBeTruthy();
  });

  it('creates onboarding requests through the mounted app when auth and validation pass', async () => {
    const app = await loadApp();

    const response = await performMountedRequest(app, {
      method: 'POST',
      path: '/onboarding/requests',
      headers: {
        'x-onboarding-api-key': 'onboarding-test-key',
      },
      body: {
        requested_role: 'agency_manager',
        first_name: 'Ada',
        last_name: 'Lovelace',
        email: 'ada@example.com',
        organization_name: 'Analytical Engines Ltd',
      },
    });

    expect(response.status).toBe(201);
    expect((response.body as any).id).toBe('admin_onboarding_requests-1');
    expect((response.body as any).email).toBe('ada@example.com');
    expect(mockState.tables.admin_onboarding_requests).toHaveLength(1);
  });

  it('enforces the mounted onboarding rate limiter before repeated bad requests can continue', async () => {
    const app = await loadApp({
      ONBOARDING_RATE_LIMIT_MAX: '2',
      ONBOARDING_RATE_LIMIT_WINDOW_MS: '60000',
    });

    const payload = {
      requested_role: 'agency_manager',
      first_name: 'Ada',
      email: 'ada@example.com',
    };

    const first = await performMountedRequest(app, {
      method: 'POST',
      path: '/onboarding/requests',
      headers: {
        'x-onboarding-api-key': 'onboarding-test-key',
      },
      body: payload,
    });

    const second = await performMountedRequest(app, {
      method: 'POST',
      path: '/onboarding/requests',
      headers: {
        'x-onboarding-api-key': 'onboarding-test-key',
      },
      body: payload,
    });

    const third = await performMountedRequest(app, {
      method: 'POST',
      path: '/onboarding/requests',
      headers: {
        'x-onboarding-api-key': 'onboarding-test-key',
      },
      body: payload,
    });

    expect(first.status).toBe(400);
    expect(second.status).toBe(400);
    expect(third.status).toBe(429);
    expect((third.body as any).error).toBe('Too many requests');
    expect(typeof (third.body as any).requestId).toBe('string');
  });

  it('fails closed on internal payout automation routes when the key is not configured', async () => {
    const app = await loadApp({
      PAYOUT_AUTOMATION_API_KEY: undefined,
    });

    delete process.env.PAYOUT_AUTOMATION_API_KEY;

    const response = await performMountedRequest(app, {
      method: 'POST',
      path: '/internal/payouts/recompute-balances',
      body: {},
    });

    expect(response.status).toBe(500);
    expect((response.body as any).error.code).toBe('PAYOUT_AUTOMATION_KEY_MISSING');
    expect(typeof (response.body as any).error.requestId).toBe('string');
  });
});
