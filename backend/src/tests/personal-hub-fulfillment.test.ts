import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type MockRow = Record<string, any>;

const state = {
  tables: {} as Record<string, MockRow[]>,
};

const billPayMocks = {
  pay: vi.fn(),
  status: vi.fn(),
};

function resetState() {
  state.tables = {
    payments: [],
    airtime_purchases: [],
    data_purchases: [],
    bill_payments: [],
    insurance_payments: [],
    money_transfers: [],
  };
  billPayMocks.pay.mockReset();
  billPayMocks.status.mockReset();
}

function createQueryBuilder(table: string) {
  const filters: Array<(row: MockRow) => boolean> = [];
  let operation: 'read' | 'update' = 'read';
  let updatePayload: MockRow | null = null;

  const getRows = () => [...(state.tables[table] || [])];
  const setRows = (rows: MockRow[]) => {
    state.tables[table] = rows;
  };

  const matches = (row: MockRow) => filters.every((filter) => filter(row));

  const execute = () => {
    if (operation === 'update') {
      const nextRows: MockRow[] = [];
      const updatedRows: MockRow[] = [];

      for (const row of getRows()) {
        if (!matches(row)) {
          nextRows.push(row);
          continue;
        }

        const updated = {
          ...row,
          ...(updatePayload || {}),
        };
        nextRows.push(updated);
        updatedRows.push(updated);
      }

      setRows(nextRows);
      return { data: updatedRows, error: null };
    }

    return { data: getRows().filter(matches), error: null };
  };

  const builder: any = {
    select() {
      return builder;
    },
    eq(column: string, value: unknown) {
      filters.push((row) => row[column] === value);
      return builder;
    },
    maybeSingle() {
      const result = execute();
      return Promise.resolve({
        data: Array.isArray(result.data) ? result.data[0] || null : null,
        error: result.error,
      });
    },
    update(payload: MockRow) {
      operation = 'update';
      updatePayload = payload;
      return builder;
    },
    then(resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) {
      return Promise.resolve(execute()).then(resolve, reject);
    },
  };

  return builder;
}

async function loadModule() {
  vi.resetModules();

  vi.doMock('../lib/supabase', () => {
    const client = {
      from: (table: string) => createQueryBuilder(table),
    };

    return {
      adminSupabase: client,
      supabase: client,
      default: client,
    };
  });

  vi.doMock('../services/expresspayBillPay', () => ({
    payExpressPayBillPay: billPayMocks.pay,
    getExpressPayBillPayStatus: billPayMocks.status,
  }));

  return import('../services/personalHubFulfillment');
}

describe('personalHubFulfillment', () => {
  beforeEach(() => {
    resetState();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('runs PAY after completed checkout and persists a completed fulfillment state', async () => {
    state.tables.payments = [
      {
        id: 'payment-1',
        status: 'completed',
        source_type: 'airtime_purchase',
        source_id: 'airtime-1',
        metadata: {
          expresspay: {
            mode: 'live',
            config_scope_community_id: 'community-1',
            provider_id: 'provider-1',
            external_service_code: 'mtn_airtime',
            query_context: {
              customer_name: 'Ada Resident',
              payer_phone: '233501234567',
            },
          },
        },
      },
    ];
    state.tables.airtime_purchases = [
      {
        id: 'airtime-1',
        user_id: 'user-1',
        phone_number: '233501234567',
        description: 'MTN airtime',
        amount: 12,
        status: 'pending',
        provider_id: 'provider-1',
        external_service_code: 'mtn_airtime',
        provider_payload: {},
        error_message: null,
      },
    ];

    billPayMocks.pay.mockResolvedValue({
      status: 'completed',
      status_code: 0,
      status_text: 'Delivered',
      reference_number: 'ref-1',
      transaction_id: 'txn-1',
      receipt_number: 'rcpt-1',
      raw: { status: 0 },
    });

    const { reconcilePersonalHubPaymentFulfillment } = await loadModule();

    const result = await reconcilePersonalHubPaymentFulfillment({
      paymentId: 'payment-1',
    });

    expect(billPayMocks.pay).toHaveBeenCalledWith(
      expect.objectContaining({
        providerId: 'provider-1',
        externalServiceCode: 'mtn_airtime',
        mode: 'live',
        scope: 'community',
        communityId: 'community-1',
      })
    );
    expect(result?.fulfillment_status).toBe('completed');
    expect(state.tables.airtime_purchases[0].status).toBe('completed');
    expect(state.tables.airtime_purchases[0].fulfillment_status).toBe('completed');
    expect(state.tables.airtime_purchases[0].provider_payload.fulfillment.reference_number).toBe('ref-1');
    expect(state.tables.airtime_purchases[0].provider_payload.fulfillment.transaction_id).toBe('txn-1');
  });

  it('reconciles existing provider references through STATUS instead of sending PAY again', async () => {
    state.tables.payments = [
      {
        id: 'payment-2',
        status: 'completed',
        source_type: 'bill_payment',
        source_id: 'bill-1',
        metadata: {
          expresspay: {
            mode: 'test',
            provider_id: 'provider-1',
            external_service_code: 'dstv',
          },
        },
      },
    ];
    state.tables.bill_payments = [
      {
        id: 'bill-1',
        user_id: 'user-1',
        account_number: 'ACC-100',
        customer_name: 'Ada Resident',
        amount: 20,
        total_amount: 20,
        status: 'pending',
        provider_id: 'provider-1',
        external_service_code: 'dstv',
        provider_payload: {
          fulfillment: {
            reference_number: 'ref-2',
            status: 'pending',
          },
        },
        error_message: null,
      },
    ];

    billPayMocks.status.mockResolvedValue({
      status: 'pending',
      status_code: 7,
      status_text: 'Pending',
      reference_number: 'ref-2',
      transaction_id: 'txn-2',
      receipt_number: null,
      raw: { status: 7 },
    });

    const { reconcilePersonalHubPaymentFulfillment } = await loadModule();

    const result = await reconcilePersonalHubPaymentFulfillment({
      paymentId: 'payment-2',
    });

    expect(billPayMocks.status).toHaveBeenCalledTimes(1);
    expect(billPayMocks.pay).not.toHaveBeenCalled();
    expect(result?.fulfillment_status).toBe('pending');
    expect(state.tables.bill_payments[0].fulfillment_status).toBe('pending');
    expect(state.tables.bill_payments[0].provider_payload.fulfillment.reference_number).toBe('ref-2');
  });

  it('marks fulfillment failed when BillPay rejects credentials after payment completion', async () => {
    state.tables.payments = [
      {
        id: 'payment-3',
        status: 'completed',
        source_type: 'insurance_payment',
        source_id: 'insurance-1',
        metadata: {
          expresspay: {
            mode: 'live',
            provider_id: 'provider-1',
            external_service_code: 'ins_1',
            query_context: {
              customer_name: 'Ada Resident',
            },
          },
        },
      },
    ];
    state.tables.insurance_payments = [
      {
        id: 'insurance-1',
        user_id: 'user-1',
        policy_number: 'POL-100',
        insured_name: 'Ada Resident',
        amount: 35,
        total_amount: 35,
        status: 'pending',
        provider_id: 'provider-1',
        external_service_code: 'ins_1',
        provider_payload: {},
        error_message: null,
      },
    ];

    billPayMocks.pay.mockRejectedValue(new Error('ExpressPay Bill Payments credentials are not configured.'));

    const { reconcilePersonalHubPaymentFulfillment } = await loadModule();

    const result = await reconcilePersonalHubPaymentFulfillment({
      paymentId: 'payment-3',
    });

    expect(result?.fulfillment_status).toBe('failed');
    expect(result?.error).toContain('credentials');
    expect(state.tables.insurance_payments[0].status).toBe('failed');
    expect(state.tables.insurance_payments[0].fulfillment_status).toBe('failed');
    expect(state.tables.insurance_payments[0].error_message).toContain('credentials');
  });
});
