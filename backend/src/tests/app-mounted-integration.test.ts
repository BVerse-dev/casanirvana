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

function createQueryBuilder(table: string) {
  const filters: Array<(row: MockRow) => boolean> = [];
  let operation: 'read' | 'insert' | 'update' = 'read';
  let insertPayload: MockRow[] = [];
  let updatePayload: MockRow | null = null;
  let sortColumn: string | null = null;
  let sortAscending = true;
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
    is(column: string, value: unknown) {
      filters.push((row) => row[column] === value);
      return builder;
    },
    order(column: string, options?: { ascending?: boolean }) {
      sortColumn = column;
      sortAscending = options?.ascending ?? true;
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
    getScopedGuardIds: vi.fn(async () => []),
    resolveGuardCommunityId: vi.fn(async () => null),
  }));

  const { default: app } = await import('../app');
  return app;
}

type RequestOptions = {
  method: 'GET' | 'POST' | 'PATCH';
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
