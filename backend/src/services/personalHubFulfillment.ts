import { adminSupabase } from '../lib/supabase';
import {
  getExpressPayBillPayStatus,
  payExpressPayBillPay,
  PersonalHubBillCategory,
  PersonalHubServiceCategory,
} from './expresspayBillPay';

type JsonRecord = Record<string, unknown>;

type PaymentRow = {
  id: string;
  status: string | null;
  source_type: string | null;
  source_id: string | null;
  metadata: JsonRecord | null;
};

type SourceConfig = {
  table: string;
  serviceType: PersonalHubServiceCategory;
  accountFields: string[];
  amountField: 'amount' | 'total_amount';
  customerFields: string[];
  phoneFields: string[];
  billCategory?: PersonalHubBillCategory | null;
};

type QueryError = { message?: string } | null;

type LooseQuery = {
  select: (...args: unknown[]) => LooseQuery;
  eq: (...args: unknown[]) => LooseQuery;
  maybeSingle: () => Promise<{ data: unknown; error: QueryError }>;
  update: (...args: unknown[]) => LooseQuery;
};

type LooseSupabaseClient = {
  from: (table: string) => LooseQuery;
};

type FulfillmentExecution = {
  status: 'completed' | 'pending' | 'failed';
  status_code: number | null;
  status_text: string | null;
  reference_number: string | null;
  transaction_id: string | null;
  receipt_number: string | null;
  raw: JsonRecord;
};

const db = adminSupabase as unknown as LooseSupabaseClient;

const SOURCE_CONFIG: Record<string, SourceConfig> = {
  airtime_purchase: {
    table: 'airtime_purchases',
    serviceType: 'airtime',
    accountFields: ['phone_number'],
    amountField: 'amount',
    customerFields: ['description'],
    phoneFields: ['phone_number'],
  },
  data_purchase: {
    table: 'data_purchases',
    serviceType: 'data',
    accountFields: ['phone_number'],
    amountField: 'amount',
    customerFields: ['description'],
    phoneFields: ['phone_number'],
  },
  bill_payment: {
    table: 'bill_payments',
    serviceType: 'bill_payment',
    accountFields: ['account_number'],
    amountField: 'total_amount',
    customerFields: ['customer_name'],
    phoneFields: ['account_number'],
  },
  insurance_payment: {
    table: 'insurance_payments',
    serviceType: 'insurance',
    accountFields: ['policy_number'],
    amountField: 'total_amount',
    customerFields: ['insured_name'],
    phoneFields: ['policy_number'],
  },
  money_transfer: {
    table: 'money_transfers',
    serviceType: 'money_transfer',
    accountFields: ['recipient_account', 'recipient_phone'],
    amountField: 'total_amount',
    customerFields: ['recipient_name'],
    phoneFields: ['recipient_phone'],
  },
};

const asObject = (value: unknown): JsonRecord =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonRecord) : {};

const readString = (value: unknown) => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const pickString = (record: JsonRecord, keys: string[]) => {
  for (const key of keys) {
    const value = readString(record[key]);
    if (value) {
      return value;
    }
  }

  return null;
};

const pickNumber = (record: JsonRecord, keys: string[]) => {
  for (const key of keys) {
    const raw = record[key];
    const parsed = typeof raw === 'number' ? raw : Number(raw);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
};

const normalizeStatus = (value: unknown) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return 'pending';
  if (normalized === 'initiated' || normalized === 'processing') return 'pending';
  return normalized;
};

const nowIso = () => new Date().toISOString();

const getPaymentRow = async (paymentId: string): Promise<PaymentRow | null> => {
  const { data, error } = await db.from('payments').select('*').eq('id', paymentId).maybeSingle();

  if (error) {
    throw new Error(`Failed to load payment for Personal Hub fulfillment: ${error.message}`);
  }

  return (data as PaymentRow | null) || null;
};

const getSourceRow = async (table: string, id: string): Promise<JsonRecord | null> => {
  const { data, error } = await db.from(table).select('*').eq('id', id).maybeSingle();

  if (error) {
    throw new Error(`Failed to load ${table} source row: ${error.message}`);
  }

  return (data as JsonRecord | null) || null;
};

const buildStatusPayload = (existingFulfillment: JsonRecord) => {
  const payload: JsonRecord = {};
  const referenceNumber = pickString(existingFulfillment, ['reference_number']);
  const transactionId = pickString(existingFulfillment, ['transaction_id']);

  if (referenceNumber) {
    payload['reference-number'] = referenceNumber;
  }

  if (transactionId) {
    payload['transaction-id'] = transactionId;
  }

  return payload;
};

const inferBillCategory = (
  sourceType: string,
  sourceRow: JsonRecord,
  paymentMeta: JsonRecord
): PersonalHubBillCategory | null => {
  if (sourceType !== 'bill_payment') {
    return null;
  }

  const fromPayment = readString(paymentMeta.bill_category);
  if (fromPayment === 'tv' || fromPayment === 'utilities' || fromPayment === 'general') {
    return fromPayment;
  }

  const billType = readString(sourceRow.bill_type);
  if (billType === 'tv' || billType === 'utilities' || billType === 'general') {
    return billType;
  }

  return 'general';
};

const buildPayPayload = ({
  payment,
  sourceType,
  sourceRow,
}: {
  payment: PaymentRow;
  sourceType: string;
  sourceRow: JsonRecord;
}) => {
  const config = SOURCE_CONFIG[sourceType];
  if (!config) {
    throw new Error(`Unsupported Personal Hub fulfillment source type: ${sourceType}`);
  }

  const paymentMeta = asObject(asObject(payment.metadata).expresspay);
  const queryContext = asObject(paymentMeta.query_context);
  const selectedOption = asObject(paymentMeta.selected_option);
  const providerPayload = asObject(sourceRow.provider_payload);
  const existingFulfillment = asObject(providerPayload.fulfillment);

  const accountNumber =
    pickString(sourceRow, config.accountFields) ||
    pickString(queryContext, ['account_number', 'meter_number', 'smartcard_number', 'policy_number', 'phone_number']) ||
    pickString(selectedOption, ['account_number', 'phone_number']);

  const amount =
    pickNumber(selectedOption, ['amount', 'denomination']) ||
    pickNumber(queryContext, ['amount', 'payable_amount', 'total_amount', 'price']) ||
    pickNumber(sourceRow, [config.amountField, 'amount']);

  if (!accountNumber) {
    throw new Error('Personal Hub fulfillment is missing the destination account or phone number.');
  }

  if (!Number.isFinite(amount || NaN) || Number(amount) <= 0) {
    throw new Error('Personal Hub fulfillment is missing a valid payable amount.');
  }

  const payerName =
    pickString(queryContext, ['customer_name', 'payer_name', 'recipient_name', 'name']) ||
    pickString(sourceRow, config.customerFields);

  const payerPhone =
    pickString(queryContext, ['payer_phone', 'phone_number', 'payer_phonenumber']) ||
    pickString(sourceRow, config.phoneFields);

  const packageCode =
    pickString(selectedOption, ['code', 'package_code', 'bundle_code']) ||
    pickString(queryContext, ['package_code']);

  const payload: JsonRecord = {
    'account-number': accountNumber,
    amount: Number(amount),
    'reference-number':
      pickString(existingFulfillment, ['reference_number']) ||
      pickString(providerPayload, ['transaction_id']) ||
      payment.id,
  };

  if (payerName) {
    payload['payer-name'] = payerName;
  }

  if (payerPhone) {
    payload['payer-phonenumber'] = payerPhone;
  }

  if (packageCode) {
    payload.package = packageCode;
  }

  return payload;
};

const resolveBillPayConfigContext = (paymentMeta: JsonRecord) => {
  const mode = readString(paymentMeta.mode);
  const communityId = readString(paymentMeta.config_scope_community_id);

  return {
    mode,
    scope: communityId ? ('community' as const) : ('global' as const),
    communityId,
  };
};

const buildFailureMode = (message: string) => {
  const normalized = message.toLowerCase();
  if (
    normalized.includes('credential') ||
    normalized.includes('auth token') ||
    normalized.includes('username') ||
    normalized.includes('whitelist') ||
    normalized.includes('not configured')
  ) {
    return 'failed';
  }

  return 'pending';
};

const updateSourceFulfillment = async ({
  table,
  sourceId,
  sourceRow,
  paymentStatus,
  execution,
  fallbackMessage,
}: {
  table: string;
  sourceId: string;
  sourceRow: JsonRecord;
  paymentStatus: string;
  execution?: FulfillmentExecution | null;
  fallbackMessage?: string | null;
}) => {
  const timestamp = nowIso();
  const providerPayload = asObject(sourceRow.provider_payload);
  const existingFulfillment = asObject(providerPayload.fulfillment);

  const normalizedPaymentStatus = normalizeStatus(paymentStatus);
  let fulfillmentStatus: 'completed' | 'pending' | 'failed';

  if (execution) {
    fulfillmentStatus = execution.status;
  } else if (normalizedPaymentStatus === 'failed' || normalizedPaymentStatus === 'cancelled' || normalizedPaymentStatus === 'expired') {
    fulfillmentStatus = 'failed';
  } else {
    fulfillmentStatus = buildFailureMode(fallbackMessage || '');
  }

  const updates: Record<string, unknown> = {
    status:
      fulfillmentStatus === 'completed'
        ? 'completed'
        : fulfillmentStatus === 'failed'
          ? 'failed'
          : 'pending',
    fulfillment_status: fulfillmentStatus,
    provider_payload: {
      ...providerPayload,
      fulfillment: {
        ...existingFulfillment,
        status: fulfillmentStatus,
        payment_status: normalizedPaymentStatus,
        last_attempted_at: timestamp,
        status_code: execution?.status_code ?? existingFulfillment.status_code ?? null,
        status_text: execution?.status_text ?? fallbackMessage ?? existingFulfillment.status_text ?? null,
        reference_number:
          execution?.reference_number ??
          readString(existingFulfillment.reference_number) ??
          readString(providerPayload.transaction_id) ??
          null,
        transaction_id:
          execution?.transaction_id ??
          readString(existingFulfillment.transaction_id) ??
          null,
        receipt_number:
          execution?.receipt_number ??
          readString(existingFulfillment.receipt_number) ??
          null,
        raw: execution?.raw ?? existingFulfillment.raw ?? null,
      },
    },
    updated_at: timestamp,
  };

  if ('error_message' in sourceRow && (fulfillmentStatus === 'failed' || fallbackMessage)) {
    updates.error_message = execution?.status_text ?? fallbackMessage ?? null;
  }

  const { error } = (await (adminSupabase as any).from(table).update(updates).eq('id', sourceId)) as {
    error: QueryError;
  };

  if (error) {
    throw new Error(`Failed to update ${table} fulfillment state: ${error.message}`);
  }

  return {
    ...sourceRow,
    ...updates,
  };
};

export const reconcilePersonalHubPaymentFulfillment = async ({
  paymentId,
  paymentStatus,
}: {
  paymentId: string;
  paymentStatus?: string | null;
}) => {
  const payment = await getPaymentRow(paymentId);
  if (!payment?.source_type || !payment.source_id) {
    return null;
  }

  const sourceConfig = SOURCE_CONFIG[payment.source_type];
  if (!sourceConfig) {
    return null;
  }

  const sourceRow = await getSourceRow(sourceConfig.table, payment.source_id);
  if (!sourceRow) {
    return null;
  }

  const normalizedPaymentStatus = normalizeStatus(paymentStatus || payment.status);
  if (normalizedPaymentStatus !== 'completed') {
    if (normalizedPaymentStatus === 'failed' || normalizedPaymentStatus === 'cancelled' || normalizedPaymentStatus === 'expired') {
      await updateSourceFulfillment({
        table: sourceConfig.table,
        sourceId: payment.source_id,
        sourceRow,
        paymentStatus: normalizedPaymentStatus,
        fallbackMessage: 'Payment did not complete, so provider fulfillment was not attempted.',
      });
    }

    return {
      payment,
      source_type: payment.source_type,
      source_id: payment.source_id,
      source_status: normalizeStatus(sourceRow.status),
      fulfillment_status: normalizeStatus(sourceRow.fulfillment_status ?? sourceRow.status),
    };
  }

  const paymentMeta = asObject(asObject(payment.metadata).expresspay);
  const providerPayload = asObject(sourceRow.provider_payload);
  const existingFulfillment = asObject(providerPayload.fulfillment);
  const configContext = resolveBillPayConfigContext(paymentMeta);
  const hasExecutionReference = Boolean(
    readString(existingFulfillment.transaction_id) || readString(existingFulfillment.reference_number)
  );
  const sourceStatus = normalizeStatus(sourceRow.status);

  if (sourceStatus === 'completed' && normalizeStatus(existingFulfillment.status) === 'completed') {
    return {
      payment,
      source_type: payment.source_type,
      source_id: payment.source_id,
      source_status: sourceStatus,
      fulfillment_status: 'completed',
    };
  }

  try {
    const execution = hasExecutionReference
      ? await getExpressPayBillPayStatus({
          providerId: readString(paymentMeta.provider_id) || readString(sourceRow.provider_id),
          externalServiceCode:
            readString(paymentMeta.external_service_code) || readString(sourceRow.external_service_code),
          serviceType: sourceConfig.serviceType,
          billCategory: inferBillCategory(payment.source_type, sourceRow, paymentMeta),
          mode: configContext.mode,
          scope: configContext.scope,
          communityId: configContext.communityId,
          payload: buildStatusPayload(existingFulfillment),
        })
      : await payExpressPayBillPay({
          providerId: readString(paymentMeta.provider_id) || readString(sourceRow.provider_id),
          externalServiceCode:
            readString(paymentMeta.external_service_code) || readString(sourceRow.external_service_code),
          serviceType: sourceConfig.serviceType,
          billCategory: inferBillCategory(payment.source_type, sourceRow, paymentMeta),
          mode: configContext.mode,
          scope: configContext.scope,
          communityId: configContext.communityId,
          payload: buildPayPayload({
            payment,
            sourceType: payment.source_type,
            sourceRow,
          }),
        });

    const updatedSource = await updateSourceFulfillment({
      table: sourceConfig.table,
      sourceId: payment.source_id,
      sourceRow,
      paymentStatus: normalizedPaymentStatus,
      execution,
    });

    return {
      payment,
      source_type: payment.source_type,
      source_id: payment.source_id,
      source_status: normalizeStatus(updatedSource.status),
      fulfillment_status: normalizeStatus(updatedSource.fulfillment_status ?? updatedSource.status),
      execution,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Provider fulfillment could not be completed right now.';
    const updatedSource = await updateSourceFulfillment({
      table: sourceConfig.table,
      sourceId: payment.source_id,
      sourceRow,
      paymentStatus: normalizedPaymentStatus,
      fallbackMessage: message,
    });

    return {
      payment,
      source_type: payment.source_type,
      source_id: payment.source_id,
      source_status: normalizeStatus(updatedSource.status),
      fulfillment_status: normalizeStatus(updatedSource.fulfillment_status ?? updatedSource.status),
      error: message,
    };
  }
};
