import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type MockRow = Record<string, any>;

const state = {
  tables: {} as Record<string, MockRow[]>,
  secrets: {} as Record<string, string>,
  fetchImpl: vi.fn(),
};

const baseEnv = { ...process.env };

function resetState() {
  state.tables = {
    payment_gateway_configs: [
      {
        id: 'cfg-global-live',
        provider: 'expresspay',
        mode: 'live',
        scope: 'global',
        community_id: null,
        is_enabled: true,
        public_config: {
          billpay_url: 'https://expresspaygh.com/billpay/api.php',
        },
        secret_refs: {
          billpay_username_secret_name: 'exp_live_billpay_username',
          billpay_auth_token_secret_name: 'exp_live_billpay_auth_token',
        },
      },
      {
        id: 'cfg-community-test',
        provider: 'expresspay',
        mode: 'test',
        scope: 'community',
        community_id: 'community-1',
        is_enabled: false,
        public_config: {
          billpay_url: 'https://sandbox.expresspaygh.com/billpay/api.php',
        },
        secret_refs: {
          billpay_username_secret_name: 'exp_test_billpay_username',
          billpay_auth_token_secret_name: 'exp_test_billpay_auth_token',
        },
      },
    ],
    service_providers: [
      {
        id: 'provider-1',
        provider_name: 'MTN Airtime',
        service_type: 'airtime',
        bill_category: 'general',
        external_service_code: 'mtn_airtime',
        logo_url: null,
        supports_query: true,
        supports_pay: true,
        supports_status: true,
        provider_metadata: {},
        is_active: true,
        is_enabled_for_app: true,
        last_synced_at: null,
        catalog_source: 'expresspay',
      },
    ],
    service_packages: [],
  };
  state.secrets = {
    exp_live_billpay_username: 'live-user',
    exp_live_billpay_auth_token: 'live-token',
    exp_test_billpay_username: 'test-user',
    exp_test_billpay_auth_token: 'test-token',
  };
  state.fetchImpl = vi.fn();
}

function createQueryBuilder(table: string) {
  const filters: Array<(row: MockRow) => boolean> = [];
  let limitValue: number | null = null;

  const getRows = () => [...(state.tables[table] || [])];

  const applyFilters = () => {
    let rows = getRows().filter((row) => filters.every((filter) => filter(row)));
    if (limitValue !== null) {
      rows = rows.slice(0, limitValue);
    }
    return rows;
  };

  const builder: any = {
    select() {
      return builder;
    },
    eq(column: string, value: unknown) {
      filters.push((row) => row[column] === value);
      return builder;
    },
    is(column: string, value: unknown) {
      filters.push((row) => row[column] === value);
      return builder;
    },
    limit(value: number) {
      limitValue = value;
      return builder;
    },
    maybeSingle() {
      const rows = applyFilters();
      return Promise.resolve({ data: rows[0] || null, error: null });
    },
    then(resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) {
      return Promise.resolve({ data: applyFilters(), error: null }).then(resolve, reject);
    },
  };

  return builder;
}

async function loadModule() {
  vi.resetModules();
  process.env = {
    ...baseEnv,
    EXPRESSPAY_BILLPAY_MODE: undefined,
    EXPRESSPAY_MODE: undefined,
    EXPRESSPAY_BILLPAY_USERNAME: undefined,
    EXPRESSPAY_BILLPAY_AUTH_TOKEN: undefined,
    EXPRESSPAY_BILLPAY_URL: undefined,
  };

  vi.doMock('../lib/supabase', () => {
    const client = {
      from: (table: string) => createQueryBuilder(table),
      rpc: vi.fn(async (fn: string, params?: Record<string, unknown>) => {
        if (fn === 'p27_read_vault_secret') {
          const secretName = String(params?.secret_name || '');
          return { data: state.secrets[secretName] || null, error: null };
        }
        return { data: null, error: null };
      }),
    };

    return {
      adminSupabase: client,
      supabase: client,
      default: client,
    };
  });

  vi.stubGlobal(
    'fetch',
    vi.fn((...args: Parameters<typeof fetch>) => state.fetchImpl(...args)) as typeof fetch
  );

  return import('../services/expresspayBillPay');
}

describe('expresspayBillPay', () => {
  beforeEach(() => {
    resetState();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env = { ...baseEnv };
  });

  it('uses the active secure BillPay config and form-encodes QUERY requests', async () => {
    state.fetchImpl.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ status: 0, customer_name: 'Ada Resident' }),
    });

    const { queryExpressPayCatalogProvider } = await loadModule();

    await queryExpressPayCatalogProvider({
      providerId: 'provider-1',
      payload: {
        account_number: '233501234567',
      },
    });

    expect(state.fetchImpl).toHaveBeenCalledTimes(1);
    const [url, options] = state.fetchImpl.mock.calls[0];
    expect(url).toBe('https://expresspaygh.com/billpay/api.php');
    expect(options?.headers).toMatchObject({
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    });

    const body = new URLSearchParams(String(options?.body || ''));
    expect(body.get('username')).toBe('live-user');
    expect(body.get('auth-token')).toBe('live-token');
    expect(body.get('type')).toBe('QUERY');
    expect(body.get('service')).toBe('mtn_airtime');
    expect(body.get('account-number')).toBe('233501234567');
  });

  it('normalizes duplicate PAY responses as pending and keeps form payloads aligned', async () => {
    state.fetchImpl.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          status: 11,
          'status-text': 'Duplicate transaction',
          'reference-number': 'ref-100',
          'transaction-id': 'txn-100',
        }),
    });

    const { payExpressPayBillPay } = await loadModule();

    const result = await payExpressPayBillPay({
      providerId: 'provider-1',
      payload: {
        account_number: '233501234567',
        amount: 12,
        reference_number: 'payment-1',
      },
    });

    expect(result.status).toBe('pending');
    expect(result.reference_number).toBe('ref-100');
    expect(result.transaction_id).toBe('txn-100');

    const [, options] = state.fetchImpl.mock.calls[0];
    const body = new URLSearchParams(String(options?.body || ''));
    expect(body.get('type')).toBe('PAY');
    expect(body.get('reference-number')).toBe('payment-1');
    expect(body.get('amount')).toBe('12');
  });

  it('supports explicit BillPay mode and scope for STATUS checks', async () => {
    state.fetchImpl.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          status: 7,
          'status-text': 'Pending',
          'transaction-id': 'txn-200',
        }),
    });

    const { getExpressPayBillPayStatus } = await loadModule();

    const result = await getExpressPayBillPayStatus({
      providerId: 'provider-1',
      mode: 'test',
      scope: 'community',
      communityId: 'community-1',
      payload: {
        transaction_id: 'txn-200',
      },
    });

    expect(result.status).toBe('pending');
    expect(state.fetchImpl).toHaveBeenCalledTimes(1);

    const [url, options] = state.fetchImpl.mock.calls[0];
    expect(url).toBe('https://sandbox.expresspaygh.com/billpay/api.php');

    const body = new URLSearchParams(String(options?.body || ''));
    expect(body.get('username')).toBe('test-user');
    expect(body.get('auth-token')).toBe('test-token');
    expect(body.get('type')).toBe('STATUS');
    expect(body.get('transaction-id')).toBe('txn-200');
  });

  it('treats an array service catalog response as a successful BillPay config test', async () => {
    state.fetchImpl.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify([
          {
            name: 'MTN Airtime',
            service: 'mtn_airtime',
          },
        ]),
    });

    const { testExpressPayBillPayConfig } = await loadModule();

    const result = await testExpressPayBillPayConfig({
      mode: 'live',
      scope: 'global',
    });

    expect(result.passed).toBe(true);
    expect(result.message).toContain('passed');
  });
});
