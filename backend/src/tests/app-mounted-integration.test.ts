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
  };
  mockState.idCounter = 1;
  mockState.authUser = null;
  mockState.authError = null;
}

function createQueryBuilder(table: string) {
  const filters: Array<(row: MockRow) => boolean> = [];
  let operation: 'read' | 'insert' = 'read';
  let insertPayload: MockRow[] = [];

  const getRows = () => [...(mockState.tables[table] || [])];
  const setRows = (rows: MockRow[]) => {
    mockState.tables[table] = rows;
  };

  const applyFilters = (rows: MockRow[]) => rows.filter((row) => filters.every((filter) => filter(row)));

  const execute = () => {
    if (operation === 'insert') {
      const existingRows = getRows();
      const insertedRows = insertPayload.map((row) => ({
        ...row,
        id: row.id || `${table}-${mockState.idCounter++}`,
      }));
      setRows([...existingRows, ...insertedRows]);
      return { data: insertedRows, error: null };
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
    insert(payload: MockRow | MockRow[]) {
      operation = 'insert';
      insertPayload = Array.isArray(payload) ? payload : [payload];
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

  const { default: app } = await import('../app');
  return app;
}

type RequestOptions = {
  method: 'GET' | 'POST';
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
