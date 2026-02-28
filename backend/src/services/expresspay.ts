import { adminSupabase } from '../lib/supabase';

const EXPRESSPAY_PROVIDER = 'expresspay';
const TEST_MODE = 'test';
const LIVE_MODE = 'live';
const DEFAULT_CURRENCY = 'GHS';

const EXPRESSPAY_ENDPOINTS = {
  test: {
    submitUrl: 'https://sandbox.expresspaygh.com/api/submit.php',
    queryUrl: 'https://sandbox.expresspaygh.com/api/query.php',
    checkoutUrl: 'https://sandbox.expresspaygh.com/api/checkout.php',
  },
  live: {
    submitUrl: 'https://expresspaygh.com/api/submit.php',
    queryUrl: 'https://expresspaygh.com/api/query.php',
    checkoutUrl: 'https://expresspaygh.com/api/checkout.php',
  },
} as const;

type ExpressPayMode = keyof typeof EXPRESSPAY_ENDPOINTS;
type JsonRecord = Record<string, unknown>;

type GatewayConfigRow = {
  id: string;
  provider: string;
  mode: ExpressPayMode;
  scope: 'global' | 'community';
  community_id: string | null;
  is_enabled: boolean;
  public_config: JsonRecord | null;
  secret_refs: JsonRecord | null;
};

type ExpressPayRuntimeConfig = {
  mode: ExpressPayMode;
  merchantId: string;
  apiKey: string;
  submitUrl: string;
  queryUrl: string;
  checkoutUrl: string;
  redirectUrl: string;
  postUrl: string;
  source: 'db' | 'env';
  communityId: string | null;
};

type PaymentRow = {
  id: string;
  amount: number;
  status: string | null;
  transaction_id: string | null;
  reference_number: string | null;
  payment_gateway: string | null;
  payer_id: string | null;
  metadata: JsonRecord | null;
};

type SubmitResponse = {
  token?: string;
  result?: number | string;
  ['result-text']?: string;
  ['order-id']?: string;
  ['transaction-id']?: string;
  [key: string]: unknown;
};

type QueryResponse = {
  result?: number | string;
  ['result-text']?: string;
  ['order-id']?: string;
  ['transaction-id']?: string;
  token?: string;
  amount?: number | string;
  currency?: string;
  ['date-processed']?: string;
  [key: string]: unknown;
};

type QueryError = { message?: string } | null;

type LooseQuery = {
  select: (...args: unknown[]) => LooseQuery;
  eq: (...args: unknown[]) => LooseQuery;
  limit: (...args: unknown[]) => LooseQuery;
  order: (...args: unknown[]) => LooseQuery;
  insert: (...args: unknown[]) => LooseQuery;
  update: (...args: unknown[]) => LooseQuery;
  maybeSingle: () => Promise<{ data: unknown; error: QueryError }>;
  single: () => Promise<{ data: unknown; error: QueryError }>;
};

type LooseSchemaClient = {
  from: (table: string) => LooseQuery;
};

type LooseSupabaseClient = LooseSchemaClient & {
  schema: (schema: string) => LooseSchemaClient;
};

const looseDb = adminSupabase as unknown as LooseSupabaseClient;

export type InitiateExpressPayInput = {
  amount: number;
  currency?: string;
  paymentType: string;
  paymentMethod: string;
  unitId: string;
  payerId: string;
  payerProfile?: {
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    phone?: string | null;
  };
  description?: string | null;
  bookingId?: string | null;
  communityId?: string | null;
  metadata?: JsonRecord;
  idempotencyKey?: string | null;
};

export type InitiateExpressPayResult = {
  paymentId: string;
  transactionId: string;
  checkoutUrl: string;
  status: 'pending';
  providerReference: string | null;
  token: string;
};

export type ExpressPayCallbackPayload = {
  token?: string | null;
  orderId?: string | null;
  rawPayload?: JsonRecord;
};

const asObject = (value: unknown): JsonRecord => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as JsonRecord;
  }
  return {};
};

const parseMaybeQuoted = (value?: string | null): string => {
  if (!value) return '';
  const trimmed = String(value).trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
};

const normalizeMode = (value?: string | null): ExpressPayMode => {
  const normalized = parseMaybeQuoted(value).toLowerCase();
  if (normalized === LIVE_MODE) {
    return LIVE_MODE;
  }
  return TEST_MODE;
};

const nowIso = () => new Date().toISOString();

const generateOrderId = () => {
  const rand = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, '0');
  return `EXP-${Date.now()}-${rand}`;
};

const formatAmount = (amount: number) => {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Invalid amount for ExpressPay initiation');
  }
  return amount.toFixed(2);
};

const ensureHttpsForLive = (url: string, mode: ExpressPayMode) => {
  if (mode === LIVE_MODE && !url.startsWith('https://')) {
    throw new Error('ExpressPay live mode requires HTTPS callback URLs');
  }
};

const getCallbackBaseUrl = () => {
  const candidate =
    process.env.EXPRESSPAY_CALLBACK_BASE_URL ||
    process.env.BACKEND_PUBLIC_URL ||
    process.env.API_BASE_URL ||
    (process.env.PORT ? `http://localhost:${process.env.PORT}` : 'http://localhost:3000');

  return candidate.endsWith('/') ? candidate.slice(0, -1) : candidate;
};

const getNestedString = (record: JsonRecord, key: string): string | undefined => {
  const value = record[key];
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }
  return undefined;
};

const buildCallbackUrl = ({
  callbackBase,
  callbackPath,
  overrideUrl,
}: {
  callbackBase: string;
  callbackPath: string;
  overrideUrl?: string;
}) => {
  if (overrideUrl && /^https?:\/\//i.test(overrideUrl)) {
    return overrideUrl;
  }

  const normalizedPath = callbackPath.startsWith('/') ? callbackPath : `/${callbackPath}`;
  return `${callbackBase}${normalizedPath}`;
};

const readSetting = async (key: string, category?: string): Promise<string | null> => {
  let query = adminSupabase.from('app_settings').select('value').eq('key', key).limit(1);

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    return null;
  }

  return parseMaybeQuoted(data?.value ?? null) || null;
};

const readVaultSecret = async ({
  secretId,
  secretName,
}: {
  secretId?: string | null;
  secretName?: string | null;
}): Promise<string | null> => {
  if (secretId) {
    const { data, error } = await adminSupabase.rpc('p27_read_vault_secret_by_id', {
      secret_id: secretId,
    });

    if (!error && typeof data === 'string' && data.trim().length > 0) {
      return data;
    }
  }

  if (secretName) {
    const { data, error } = await adminSupabase.rpc('p27_read_vault_secret', {
      secret_name: secretName,
    });

    if (!error && typeof data === 'string' && data.trim().length > 0) {
      return data;
    }
  }

  return null;
};

const resolveCredentialFromRefs = async (
  refs: JsonRecord,
  key: 'merchant_id' | 'api_key'
): Promise<string | null> => {
  const directKey = getNestedString(refs, key);
  if (directKey) {
    return directKey;
  }

  const secretId =
    getNestedString(refs, `${key}_secret_id`) ||
    getNestedString(refs, `${key}_vault_id`) ||
    getNestedString(refs, `${key}_secret_ref`);

  const secretName =
    getNestedString(refs, `${key}_secret_name`) ||
    getNestedString(refs, `${key}_vault_name`);

  return readVaultSecret({ secretId, secretName });
};

const getGatewayConfigs = async (): Promise<GatewayConfigRow[]> => {
  const { data, error } = await looseDb
    .from('payment_gateway_configs')
    .select('*')
    .eq('provider', EXPRESSPAY_PROVIDER);

  if (error) {
    throw new Error(`Failed to load payment gateway config: ${error.message}`);
  }

  return Array.isArray(data) ? (data as GatewayConfigRow[]) : [];
};

const resolveRuntimeConfig = async (communityId?: string | null): Promise<ExpressPayRuntimeConfig> => {
  const allConfigs = await getGatewayConfigs();
  const enabledConfigs = allConfigs.filter((cfg) => cfg.is_enabled);

  const communityConfig = communityId
    ? enabledConfigs.find((cfg) => cfg.scope === 'community' && cfg.community_id === communityId)
    : null;

  const globalConfig = enabledConfigs.find((cfg) => cfg.scope === 'global');
  const selected = communityConfig || globalConfig;

  if (!selected) {
    const mode = normalizeMode(process.env.EXPRESSPAY_MODE || (await readSetting('expresspay_mode', 'payment_gateways')));
    const callbackBase = getCallbackBaseUrl();
    const defaultEndpoints = EXPRESSPAY_ENDPOINTS[mode];
    if (allConfigs.length > 0) {
      throw new Error('ExpressPay is configured but disabled for the active mode.');
    }

    const merchantId = process.env.EXPRESSPAY_MERCHANT_ID || '';
    const apiKey = process.env.EXPRESSPAY_API_KEY || '';

    if (!merchantId || !apiKey) {
      throw new Error('ExpressPay is not configured or enabled. Enable gateway and add credentials first.');
    }

    const submitUrl = process.env.EXPRESSPAY_SUBMIT_URL || defaultEndpoints.submitUrl;
    const queryUrl = process.env.EXPRESSPAY_QUERY_URL || defaultEndpoints.queryUrl;
    const checkoutUrl = process.env.EXPRESSPAY_CHECKOUT_URL || defaultEndpoints.checkoutUrl;
    const callbackPath = process.env.EXPRESSPAY_CALLBACK_PATH || '/payments/expresspay/callback';
    const webhookUrl = process.env.EXPRESSPAY_WEBHOOK_URL || '';
    const redirectUrl = buildCallbackUrl({ callbackBase, callbackPath, overrideUrl: webhookUrl });
    const postUrl = buildCallbackUrl({ callbackBase, callbackPath, overrideUrl: webhookUrl });

    ensureHttpsForLive(redirectUrl, mode);
    ensureHttpsForLive(postUrl, mode);

    return {
      mode,
      merchantId,
      apiKey,
      submitUrl,
      queryUrl,
      checkoutUrl,
      redirectUrl,
      postUrl,
      source: 'env',
      communityId: communityId || null,
    };
  }

  const mode = selected.mode;
  const callbackBase = getCallbackBaseUrl();
  const defaultEndpoints = EXPRESSPAY_ENDPOINTS[mode];
  const publicConfig = asObject(selected.public_config);
  const secretRefs = asObject(selected.secret_refs);

  const merchantId =
    getNestedString(publicConfig, 'merchant_id') ||
    (await resolveCredentialFromRefs(secretRefs, 'merchant_id')) ||
    process.env.EXPRESSPAY_MERCHANT_ID ||
    '';

  const apiKey =
    (await resolveCredentialFromRefs(secretRefs, 'api_key')) || process.env.EXPRESSPAY_API_KEY || '';

  if (!merchantId || !apiKey) {
    throw new Error('ExpressPay credentials are incomplete. Set merchant-id and api-key in secure config.');
  }

  const callbackPath = getNestedString(publicConfig, 'callback_path') || '/payments/expresspay/callback';
  const webhookUrl = getNestedString(publicConfig, 'webhook_url');
  const submitUrl = getNestedString(publicConfig, 'submit_url') || defaultEndpoints.submitUrl;
  const queryUrl = getNestedString(publicConfig, 'query_url') || defaultEndpoints.queryUrl;
  const checkoutUrl = getNestedString(publicConfig, 'checkout_url') || defaultEndpoints.checkoutUrl;

  const redirectUrl = buildCallbackUrl({ callbackBase, callbackPath, overrideUrl: webhookUrl });
  const postUrl = buildCallbackUrl({ callbackBase, callbackPath, overrideUrl: webhookUrl });

  ensureHttpsForLive(redirectUrl, mode);
  ensureHttpsForLive(postUrl, mode);

  return {
    mode,
    merchantId,
    apiKey,
    submitUrl,
    queryUrl,
    checkoutUrl,
    redirectUrl,
    postUrl,
    source: 'db',
    communityId: selected.community_id,
  };
};

const invokeExpressPaySubmit = async (
  config: ExpressPayRuntimeConfig,
  payload: URLSearchParams
): Promise<SubmitResponse> => {
  const response = await fetch(config.submitUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: payload.toString(),
  });

  const rawText = await response.text();

  let json: SubmitResponse;
  try {
    json = JSON.parse(rawText);
  } catch {
    throw new Error(`ExpressPay submit returned non-JSON response (${response.status})`);
  }

  if (!response.ok) {
    throw new Error(
      `ExpressPay submit failed (${response.status}): ${String(json['result-text'] || 'Unknown error')}`
    );
  }

  if (!json.token || String(json.token).trim().length === 0) {
    throw new Error(`ExpressPay submit did not return token: ${String(json['result-text'] || 'Unknown error')}`);
  }

  return json;
};

const invokeExpressPayQuery = async (
  config: ExpressPayRuntimeConfig,
  token: string
): Promise<QueryResponse> => {
  const params = new URLSearchParams();
  params.set('merchant-id', config.merchantId);
  params.set('api-key', config.apiKey);
  params.set('token', token);

  const response = await fetch(config.queryUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const rawText = await response.text();

  let json: QueryResponse;
  try {
    json = JSON.parse(rawText);
  } catch {
    throw new Error(`ExpressPay query returned non-JSON response (${response.status})`);
  }

  if (!response.ok) {
    throw new Error(`ExpressPay query failed (${response.status}): ${String(json['result-text'] || 'Unknown error')}`);
  }

  return json;
};

const mapQueryResultToStatus = (queryResult: QueryResponse): 'pending' | 'completed' | 'failed' => {
  const numeric = Number(queryResult.result);

  if (numeric === 1) return 'completed';
  if (numeric === 4) return 'pending';
  return 'failed';
};

const getPaymentById = async (paymentId: string): Promise<PaymentRow | null> => {
  const { data, error } = await looseDb
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load payment: ${error.message}`);
  }

  return (data as PaymentRow | null) || null;
};

const updatePaymentRecord = async (paymentId: string, updates: Record<string, unknown>): Promise<PaymentRow> => {
  const { data, error } = await looseDb
    .from('payments')
    .update(updates)
    .eq('id', paymentId)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to update payment: ${error.message}`);
  }

  return data as PaymentRow;
};

const findPaymentByCallbackReference = async ({
  orderId,
  token,
}: {
  orderId?: string | null;
  token?: string | null;
}): Promise<PaymentRow | null> => {
  if (orderId) {
    const { data, error } = await looseDb
      .from('payments')
      .select('*')
      .eq('payment_gateway', EXPRESSPAY_PROVIDER)
      .eq('transaction_id', orderId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to lookup payment by order-id: ${error.message}`);
    }

    if (data) {
      return data as PaymentRow;
    }
  }

  if (token) {
    const { data, error } = await looseDb
      .from('payments')
      .select('*')
      .eq('payment_gateway', EXPRESSPAY_PROVIDER)
      .eq('metadata->expresspay->>token', token)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      throw new Error(`Failed to lookup payment by token: ${error.message}`);
    }

    if (Array.isArray(data) && data.length > 0) {
      return data[0] as PaymentRow;
    }
  }

  return null;
};

const buildCheckoutUrl = (checkoutBaseUrl: string, token: string): string => {
  const base = checkoutBaseUrl.includes('?') ? checkoutBaseUrl.split('?')[0] : checkoutBaseUrl;
  return `${base}?token=${encodeURIComponent(token)}`;
};

export const initiateExpressPayPayment = async (
  input: InitiateExpressPayInput
): Promise<InitiateExpressPayResult> => {
  const amount = Number(input.amount);
  const formattedAmount = formatAmount(amount);

  const idempotencyKey = input.idempotencyKey?.trim() || null;

  if (idempotencyKey) {
    const { data, error } = await looseDb
      .from('payments')
      .select('*')
      .eq('payment_gateway', EXPRESSPAY_PROVIDER)
      .eq('payer_id', input.payerId)
      .eq('metadata->>idempotency_key', idempotencyKey)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!error && Array.isArray(data) && data.length > 0) {
      const existing = data[0] as PaymentRow;
      const existingMetadata = asObject(existing.metadata);
      const expresspayMeta = asObject(existingMetadata.expresspay);
      const token = typeof expresspayMeta.token === 'string' ? expresspayMeta.token : null;
      const checkoutUrl = typeof expresspayMeta.checkout_url === 'string' ? expresspayMeta.checkout_url : null;

      if (token && checkoutUrl && existing.status === 'pending') {
        return {
          paymentId: existing.id,
          transactionId: existing.transaction_id || '',
          checkoutUrl,
          status: 'pending',
          providerReference: existing.reference_number || null,
          token,
        };
      }
    }
  }

  const config = await resolveRuntimeConfig(input.communityId);
  const orderId = generateOrderId();
  const createdAt = nowIso();

  const paymentPayload: Record<string, unknown> = {
    amount,
    unit_id: input.unitId,
    payer_id: input.payerId,
    booking_id: input.bookingId || null,
    payment_type: input.paymentType,
    payment_method: input.paymentMethod,
    payment_gateway: EXPRESSPAY_PROVIDER,
    status: 'pending',
    title: 'ExpressPay Payment',
    description: input.description || null,
    transaction_id: orderId,
    initiated_at: createdAt,
    payment_date: createdAt,
    metadata: {
      ...asObject(input.metadata),
      idempotency_key: idempotencyKey,
      expresspay: {
        mode: config.mode,
        order_id: orderId,
        config_scope_community_id: config.communityId,
        initiated_at: createdAt,
      },
    },
  };

  const { data: insertedPayment, error: insertError } = await looseDb
    .from('payments')
    .insert(paymentPayload)
    .select('*')
    .single();

  if (insertError || !insertedPayment) {
    throw new Error(`Unable to create payment intent: ${insertError?.message || 'Unknown error'}`);
  }

  const payment = insertedPayment as PaymentRow;

  try {
    const submitParams = new URLSearchParams();
    submitParams.set('merchant-id', config.merchantId);
    submitParams.set('api-key', config.apiKey);
    submitParams.set('firstname', input.payerProfile?.first_name || 'Resident');
    submitParams.set('lastname', input.payerProfile?.last_name || 'User');
    submitParams.set('email', input.payerProfile?.email || 'resident@casanirvana.app');
    submitParams.set('phonenumber', input.payerProfile?.phone || '0000000000');
    submitParams.set('username', input.payerProfile?.email || `user-${input.payerId}`);
    submitParams.set('accountnumber', input.unitId.slice(0, 3));
    submitParams.set('currency', input.currency || DEFAULT_CURRENCY);
    submitParams.set('amount', formattedAmount);
    submitParams.set('order-id', orderId);
    submitParams.set('order-desc', input.description || `Casa Nirvana ${input.paymentType} payment`);
    submitParams.set('redirect-url', config.redirectUrl);
    submitParams.set('post-url', config.postUrl);

    const submitResponse = await invokeExpressPaySubmit(config, submitParams);
    const token = String(submitResponse.token).trim();
    const checkoutUrl = buildCheckoutUrl(config.checkoutUrl, token);
    const providerReference =
      typeof submitResponse['transaction-id'] === 'string'
        ? submitResponse['transaction-id']
        : payment.reference_number;

    const paymentMetadata = asObject(payment.metadata);
    const expressPayMetadata = asObject(paymentMetadata.expresspay);

    const updated = await updatePaymentRecord(payment.id, {
      reference_number: providerReference || null,
      metadata: {
        ...paymentMetadata,
        expresspay: {
          ...expressPayMetadata,
          token,
          checkout_url: checkoutUrl,
          submit_result: submitResponse,
          submit_confirmed_at: nowIso(),
        },
      },
    });

    return {
      paymentId: updated.id,
      transactionId: updated.transaction_id || orderId,
      checkoutUrl,
      status: 'pending',
      providerReference: providerReference || null,
      token,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown initiation error';
    await updatePaymentRecord(payment.id, {
      status: 'failed',
      failed_at: nowIso(),
      metadata: {
        ...asObject(payment.metadata),
        expresspay: {
          ...asObject(asObject(payment.metadata).expresspay),
          initiation_error: message,
          initiation_failed_at: nowIso(),
        },
      },
    });

    throw new Error(message);
  }
};

export const verifyExpressPayPayment = async ({
  paymentId,
  token,
  orderId,
}: {
  paymentId?: string | null;
  token?: string | null;
  orderId?: string | null;
}) => {
  let payment: PaymentRow | null = null;

  if (paymentId) {
    payment = await getPaymentById(paymentId);
  }

  if (!payment) {
    payment = await findPaymentByCallbackReference({ orderId, token });
  }

  if (!payment) {
    return {
      ok: false,
      reason: 'payment_not_found',
      payment: null,
      providerResult: null,
    };
  }

  const metadata = asObject(payment.metadata);
  const expresspayMeta = asObject(metadata.expresspay);
  const effectiveToken = token || (typeof expresspayMeta.token === 'string' ? expresspayMeta.token : null);

  if (!effectiveToken) {
    throw new Error('Missing ExpressPay token for verification');
  }

  const config = await resolveRuntimeConfig((expresspayMeta.config_scope_community_id as string) || null);
  const queryResult = await invokeExpressPayQuery(config, effectiveToken);
  const mappedStatus = mapQueryResultToStatus(queryResult);
  const verifiedAt = nowIso();

  const updates: Record<string, unknown> = {
    status: mappedStatus,
    metadata: {
      ...metadata,
      expresspay: {
        ...expresspayMeta,
        token: effectiveToken,
        query_result: queryResult,
        verified_at: verifiedAt,
      },
    },
  };

  if (typeof queryResult['transaction-id'] === 'string' && queryResult['transaction-id'].length > 0) {
    updates.reference_number = queryResult['transaction-id'];
  }

  if (mappedStatus === 'completed') {
    updates.completed_at = verifiedAt;
    updates.paid_at = verifiedAt;
  }

  if (mappedStatus === 'failed') {
    updates.failed_at = verifiedAt;
  }

  const updatedPayment = await updatePaymentRecord(payment.id, updates);

  return {
    ok: true,
    reason: 'verified',
    payment: updatedPayment,
    providerResult: queryResult,
  };
};

export const handleExpressPayCallback = async (payload: ExpressPayCallbackPayload) => {
  const token = payload.token?.trim() || null;
  const orderId = payload.orderId?.trim() || null;

  if (!token && !orderId) {
    return {
      ok: false,
      reason: 'missing_reference',
      payment: null,
      providerResult: null,
    };
  }

  return verifyExpressPayPayment({ paymentId: null, token, orderId });
};

export const getExpressPayPaymentStatus = async (paymentId: string) => {
  const payment = await getPaymentById(paymentId);

  if (!payment) {
    return null;
  }

  return {
    id: payment.id,
    status: payment.status || 'pending',
    transaction_id: payment.transaction_id,
    reference_number: payment.reference_number,
    payment_gateway: payment.payment_gateway,
    metadata: payment.metadata,
  };
};

export const getExpressPayPaymentRecord = getPaymentById;
