import { adminSupabase } from '../lib/supabase';
import { DEFAULT_PAYMENT_DISPLAY, applyPaymentOutcomeSideEffects } from './paymentLedger';

const EXPRESSPAY_PROVIDER = 'expresspay';
const TEST_MODE = 'test';
const LIVE_MODE = 'live';
const DEFAULT_CURRENCY = 'GHS';
const EXPRESSPAY_DIRECT_CALLBACK_PATH = '/xp/cb';
const MAX_EXPRESSPAY_DIRECT_POST_URL_LENGTH = 64;
const MAX_EXPRESSPAY_HOSTED_REDIRECT_URL_LENGTH = 256;

const EXPRESSPAY_ENDPOINTS = {
  test: {
    submitUrl: 'https://sandbox.expresspaygh.com/api/submit.php',
    directSubmitUrl: 'https://sandbox.expresspaygh.com/api/direct/submit.php',
    queryUrl: 'https://sandbox.expresspaygh.com/api/query.php',
    checkoutUrl: 'https://sandbox.expresspaygh.com/api/checkout.php',
  },
  live: {
    submitUrl: 'https://expresspaygh.com/api/submit.php',
    directSubmitUrl: 'https://expresspaygh.com/api/direct/submit.php',
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
  directSubmitUrl: string;
  queryUrl: string;
  checkoutUrl: string;
  redirectUrl: string;
  postUrl: string;
  directPostUrl: string;
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
  status?: number | string;
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

type SubmitCallResult = {
  body: SubmitResponse;
  cookieHeader: string | null;
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

class ExpressPayGatewayError extends Error {
  readonly details: JsonRecord | null;

  constructor(message: string, details?: JsonRecord | null) {
    super(message);
    this.name = 'ExpressPayGatewayError';
    this.details = details || null;
  }
}

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
  sourceType?: string | null;
  sourceId?: string | null;
  obligationId?: string | null;
  communityId?: string | null;
  metadata?: JsonRecord;
  idempotencyKey?: string | null;
};

export type InitiateExpressPayResult = {
  paymentId: string;
  transactionId: string;
  checkoutUrl: string | null;
  status: 'initiated' | 'processing' | 'completed' | 'failed';
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

const normalizeExpressPayMsisdn = (value: string) => {
  const digits = value.replace(/\D+/g, '');

  if (digits.startsWith('233') && digits.length === 12) {
    return digits;
  }

  if (digits.startsWith('0') && digits.length === 10) {
    return `233${digits.slice(1)}`;
  }

  return digits;
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

const buildDirectPostUrl = ({
  callbackBase,
  callbackPath,
  overrideUrl,
  mode,
}: {
  callbackBase: string;
  callbackPath: string;
  overrideUrl?: string;
  mode: ExpressPayMode;
}) => {
  const candidates: string[] = [];

  if (overrideUrl && /^https?:\/\//i.test(overrideUrl) && overrideUrl.length <= MAX_EXPRESSPAY_DIRECT_POST_URL_LENGTH) {
    candidates.push(overrideUrl);
  }

  const shortInternalCallback = buildCallbackUrl({
    callbackBase,
    callbackPath: EXPRESSPAY_DIRECT_CALLBACK_PATH,
  });

  if (shortInternalCallback.length <= MAX_EXPRESSPAY_DIRECT_POST_URL_LENGTH) {
    candidates.push(shortInternalCallback);
  }

  const configuredCallback = buildCallbackUrl({
    callbackBase,
    callbackPath,
    overrideUrl,
  });

  if (configuredCallback.length <= MAX_EXPRESSPAY_DIRECT_POST_URL_LENGTH) {
    candidates.push(configuredCallback);
  }

  const selected = candidates[0];

  if (!selected) {
    throw new Error(
      `ExpressPay direct payments require a post-url no longer than ${MAX_EXPRESSPAY_DIRECT_POST_URL_LENGTH} characters. ` +
        `Current callback URLs are too long for the configured backend origin.`
    );
  }

  ensureHttpsForLive(selected, mode);
  return selected;
};

const DIRECT_SUBMIT_STATUS_MESSAGES: Record<number, string> = {
  1: 'Success',
  2: 'Invalid credentials. Check the configured merchant ID and API key.',
  3: 'Invalid request. ExpressPay rejected the direct payment payload.',
  4: 'Invalid IP. ExpressPay Direct API rejected the backend server IP. Whitelist the backend egress IP for direct payments.',
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
    const directSubmitUrl = process.env.EXPRESSPAY_DIRECT_SUBMIT_URL || defaultEndpoints.directSubmitUrl;
    const queryUrl = process.env.EXPRESSPAY_QUERY_URL || defaultEndpoints.queryUrl;
    const checkoutUrl = process.env.EXPRESSPAY_CHECKOUT_URL || defaultEndpoints.checkoutUrl;
    const callbackPath = process.env.EXPRESSPAY_CALLBACK_PATH || '/payments/expresspay/callback';
    const webhookUrl = process.env.EXPRESSPAY_WEBHOOK_URL || '';
    const redirectUrl = buildCallbackUrl({ callbackBase, callbackPath, overrideUrl: webhookUrl });
    const postUrl = buildCallbackUrl({ callbackBase, callbackPath, overrideUrl: webhookUrl });
    const directPostUrl = buildDirectPostUrl({
      callbackBase,
      callbackPath,
      overrideUrl: webhookUrl,
      mode,
    });

    ensureHttpsForLive(redirectUrl, mode);
    ensureHttpsForLive(postUrl, mode);

    return {
      mode,
      merchantId,
      apiKey,
      submitUrl,
      directSubmitUrl,
      queryUrl,
      checkoutUrl,
      redirectUrl,
      postUrl,
      directPostUrl,
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
  const directSubmitUrl =
    getNestedString(publicConfig, 'direct_submit_url') || defaultEndpoints.directSubmitUrl;
  const queryUrl = getNestedString(publicConfig, 'query_url') || defaultEndpoints.queryUrl;
  const checkoutUrl = getNestedString(publicConfig, 'checkout_url') || defaultEndpoints.checkoutUrl;

  const redirectUrl = buildCallbackUrl({ callbackBase, callbackPath, overrideUrl: webhookUrl });
  const postUrl = buildCallbackUrl({ callbackBase, callbackPath, overrideUrl: webhookUrl });
  const directPostUrl = buildDirectPostUrl({
    callbackBase,
    callbackPath,
    overrideUrl: webhookUrl,
    mode,
  });

  ensureHttpsForLive(redirectUrl, mode);
  ensureHttpsForLive(postUrl, mode);

  return {
    mode,
    merchantId,
    apiKey,
    submitUrl,
    directSubmitUrl,
    queryUrl,
    checkoutUrl,
    redirectUrl,
    postUrl,
    directPostUrl,
    source: 'db',
    communityId: selected.community_id,
  };
};

const extractExpressPaySessionCookie = (response: Response): string | null => {
  const rawSetCookie = response.headers.get('set-cookie');
  if (!rawSetCookie) {
    return null;
  }

  const phpSessionMatch = rawSetCookie.match(/PHPSESSID=([^;,\s]+)/i);
  if (phpSessionMatch) {
    return `PHPSESSID=${phpSessionMatch[1]}`;
  }

  const firstCookie = rawSetCookie.split(',')[0]?.split(';')[0]?.trim();
  return firstCookie || null;
};

const invokeExpressPaySubmit = async (
  config: ExpressPayRuntimeConfig,
  payload: URLSearchParams
): Promise<SubmitCallResult> => {
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
    throw new ExpressPayGatewayError(
      `ExpressPay submit failed (${response.status}): ${String(
        json['result-text'] || (json as JsonRecord).message || 'Unknown error'
      )}`,
      asObject(json)
    );
  }

  if (!json.token || String(json.token).trim().length === 0) {
    const reason = String(json['result-text'] || (json as JsonRecord).message || 'Unknown error');
    throw new ExpressPayGatewayError(`ExpressPay submit did not return token: ${reason}`, asObject(json));
  }

  return {
    body: json,
    cookieHeader: extractExpressPaySessionCookie(response),
  };
};

const invokeExpressPayDirectSubmit = async (
  config: ExpressPayRuntimeConfig,
  payload: URLSearchParams
): Promise<SubmitResponse> => {
  const response = await fetch(config.directSubmitUrl, {
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
    throw new Error(`ExpressPay direct submit returned non-JSON response (${response.status})`);
  }

  if (!response.ok) {
    throw new ExpressPayGatewayError(
      `ExpressPay direct submit failed (${response.status}): ${String(json['result-text'] || 'Unknown error')}`,
      asObject(json)
    );
  }

  const numericStatus = Number((json as JsonRecord).status);
  if (numericStatus !== 1 || !json.token || String(json.token).trim().length === 0) {
    const fallbackReason = DIRECT_SUBMIT_STATUS_MESSAGES[numericStatus] || 'Unable to create direct payment session.';
    const explicitReason =
      typeof json['result-text'] === 'string' && json['result-text'].trim().length > 0
        ? json['result-text'].trim()
        : null;
    const reason = explicitReason || fallbackReason;
    const statusLabel = Number.isFinite(numericStatus) ? `status ${numericStatus}` : 'unknown status';

    throw new ExpressPayGatewayError(
      `ExpressPay direct submit failed (${statusLabel}): ${reason}`,
      asObject(json)
    );
  }

  return json;
};

const invokeExpressPayDirectCheckout = async (
  attempts: Array<{ url: string; label: string; payload: URLSearchParams; cookieHeader?: string | null }>
): Promise<QueryResponse> => {
  let lastError: Error | null = null;

  for (let index = 0; index < attempts.length; index += 1) {
    const attempt = attempts[index];
    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    if (attempt.cookieHeader) {
      headers.Cookie = attempt.cookieHeader;
    }

    const response = await fetch(attempt.url, {
      method: 'POST',
      headers,
      body: attempt.payload.toString(),
    });

    const rawText = await response.text();

    let json: QueryResponse;
    try {
      json = JSON.parse(rawText);
    } catch {
      lastError = new ExpressPayGatewayError(
        `ExpressPay direct checkout returned non-JSON response (${response.status}) from ${attempt.label}`,
        {
          endpoint: attempt.label,
          http_status: response.status,
          raw_preview: rawText.slice(0, 240),
        }
      );
      continue;
    }

    if (!response.ok) {
      const error = new ExpressPayGatewayError(
        `ExpressPay direct checkout failed (${response.status}) via ${attempt.label}: ${String(
          json['result-text'] || (json as JsonRecord).message || 'Unknown error'
        )}`,
        {
          ...asObject(json),
          endpoint: attempt.label,
        }
      );

      if (index < attempts.length - 1) {
        lastError = error;
        continue;
      }

      throw error;
    }

    return json;
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error('ExpressPay direct checkout failed before a provider response was received.');
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

const mapQueryResultToStatus = (queryResult: QueryResponse): 'processing' | 'completed' | 'failed' => {
  const providerStatus = Number((queryResult as JsonRecord).status);
  const resultText = String(queryResult['result-text'] || (queryResult as JsonRecord).message || '').toLowerCase();
  const numeric = Number(queryResult.result);

  if (!Number.isNaN(providerStatus) && Number.isNaN(numeric)) {
    if (providerStatus === 1) return 'processing';
    return 'failed';
  }

  if (numeric === 1) return 'completed';
  if (numeric === 4) return 'processing';
  if (numeric === 3 && resultText.includes('no transaction data available')) {
    return 'processing';
  }
  return 'failed';
};

const MOBILE_NETWORK_ALIASES: Record<string, string> = {
  MTN: 'MTN_MM',
  MTN_MM: 'MTN_MM',
  VODAFONE: 'VODAFONE_CASH',
  VODAFONE_CASH: 'VODAFONE_CASH',
  AIRTELTIGO: 'AIRTEL_MM',
  AIRTEL_MM: 'AIRTEL_MM',
  TIGO_CASH: 'TIGO_CASH',
};

const resolveExpressPayMobileNetwork = ({
  rawNetwork,
  phoneNumber,
}: {
  rawNetwork?: string;
  phoneNumber?: string;
}) => {
  const normalizedNetwork = rawNetwork ? rawNetwork.trim().toUpperCase() : '';

  if (normalizedNetwork === 'AIRTELTIGO') {
    if (phoneNumber.startsWith('027') || phoneNumber.startsWith('057')) {
      return 'TIGO_CASH';
    }
    return 'AIRTEL_MM';
  }

  return MOBILE_NETWORK_ALIASES[normalizedNetwork] || null;
};

const resolveExpressPayLegacyMobileNetwork = (rawNetwork?: string) => {
  const normalizedNetwork = rawNetwork ? rawNetwork.trim().toUpperCase() : '';

  if (normalizedNetwork === 'MTN' || normalizedNetwork === 'MTN_MM') {
    return 'MTN';
  }

  if (normalizedNetwork === 'VODAFONE' || normalizedNetwork === 'VODAFONE_CASH' || normalizedNetwork === 'TELECEL') {
    return 'VODAFONE';
  }

  if (
    normalizedNetwork === 'AIRTELTIGO' ||
    normalizedNetwork === 'AIRTEL_MM' ||
    normalizedNetwork === 'TIGO_CASH'
  ) {
    return 'AIRTELTIGO';
  }

  return null;
};

const PAYMENT_SOURCE_TABLES: Record<string, string | null> = {
  payment_obligation: 'payment_obligations',
  amenity_booking: 'amenity_bookings',
  service_booking: 'service_bookings',
  service_request: 'service_requests',
  airtime_purchase: 'airtime_purchases',
  data_purchase: 'data_purchases',
  money_transfer: 'money_transfers',
  bill_payment: 'bill_payments',
  insurance_payment: 'insurance_payments',
  shopping_order: 'shopping_payments',
  manual: null,
};

type ResolvedPaymentSource = {
  sourceType: string | null;
  sourceId: string | null;
  obligationId: string | null;
  derivedTitle: string | null;
  derivedDescription: string | null;
  derivedAmount: number | null;
  derivedCurrencyCode: string | null;
};

const normalizePaymentSourceType = (value?: string | null) => {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  return PAYMENT_SOURCE_TABLES[normalized] !== undefined ? normalized : null;
};

const fetchSourceRecord = async (table: string, id: string) => {
  const { data, error } = await looseDb.from(table).select('*').eq('id', id).maybeSingle();

  if (error) {
    throw new Error(`Failed to resolve payment source from ${table}: ${error.message}`);
  }

  return (data as JsonRecord | null) || null;
};

const ensureSourceUnitMatch = ({
  unitId,
  sourceRecord,
  sourceType,
}: {
  unitId: string;
  sourceRecord: JsonRecord;
  sourceType: string;
}) => {
  const sourceUnitId = typeof sourceRecord.unit_id === 'string' ? sourceRecord.unit_id : null;
  if (sourceUnitId && sourceUnitId !== unitId) {
    throw new Error(`The selected ${sourceType} does not belong to your assigned unit.`);
  }
};

const resolvePaymentSourceContext = async (input: InitiateExpressPayInput): Promise<ResolvedPaymentSource> => {
  const fallbackSourceType =
    normalizePaymentSourceType(input.sourceType) ||
    (() => {
      if (!input.bookingId) {
        return null;
      }

      const normalizedPaymentType = String(input.paymentType || '').toLowerCase();
      if (normalizedPaymentType.includes('service')) {
        return 'service_booking';
      }

      return null;
    })();

  const fallbackSourceId =
    input.sourceId ||
    (fallbackSourceType === 'service_booking' ? input.bookingId || null : null);

  let sourceType = fallbackSourceType;
  let sourceId = fallbackSourceId;
  let obligationId = input.obligationId || null;
  let derivedTitle: string | null = null;
  let derivedDescription: string | null = null;
  let derivedAmount: number | null = null;
  let derivedCurrencyCode: string | null = null;

  if (obligationId) {
    const obligationRecord = await fetchSourceRecord('payment_obligations', obligationId);
    if (!obligationRecord) {
      throw new Error('The selected payment obligation could not be found.');
    }

    ensureSourceUnitMatch({
      unitId: input.unitId,
      sourceRecord: obligationRecord,
      sourceType: 'payment_obligation',
    });

    obligationId = String(obligationRecord.id);
    sourceType = sourceType || 'payment_obligation';
    sourceId = sourceId || obligationId;
    derivedTitle =
      typeof obligationRecord.title === 'string' && obligationRecord.title.trim().length > 0
        ? obligationRecord.title.trim()
        : derivedTitle;
    derivedDescription =
      typeof obligationRecord.description === 'string' && obligationRecord.description.trim().length > 0
        ? obligationRecord.description.trim()
        : derivedDescription;
    if (Number.isFinite(Number(obligationRecord.amount))) {
      derivedAmount = Number(obligationRecord.amount);
    }
    if (typeof obligationRecord.currency_code === 'string' && obligationRecord.currency_code.trim().length > 0) {
      derivedCurrencyCode = obligationRecord.currency_code.trim().toUpperCase();
    }

    const linkedSourceType =
      typeof obligationRecord.source_type === 'string'
        ? normalizePaymentSourceType(obligationRecord.source_type)
        : null;

    if (sourceType === 'payment_obligation' && linkedSourceType && linkedSourceType !== 'payment_obligation') {
      sourceType = linkedSourceType;
      if (typeof obligationRecord.source_id === 'string' && obligationRecord.source_id.trim().length > 0) {
        sourceId = obligationRecord.source_id.trim();
      }
    }
  }

  if (!sourceType) {
    return {
      sourceType: null,
      sourceId: null,
      obligationId,
      derivedTitle,
      derivedDescription,
      derivedAmount,
      derivedCurrencyCode,
    };
  }

  const sourceTable = PAYMENT_SOURCE_TABLES[sourceType];
  if (!sourceTable) {
    return {
      sourceType,
      sourceId,
      obligationId,
      derivedTitle,
      derivedDescription,
      derivedAmount,
      derivedCurrencyCode,
    };
  }

  if (!sourceId) {
    throw new Error(`A source_id is required for ${sourceType} payments.`);
  }

  const sourceRecord = await fetchSourceRecord(sourceTable, sourceId);
  if (!sourceRecord) {
    throw new Error(`The selected ${sourceType} record could not be found.`);
  }

  ensureSourceUnitMatch({
    unitId: input.unitId,
    sourceRecord,
    sourceType,
  });

  sourceId = String(sourceRecord.id);

  const recordAmount =
    Number.isFinite(Number(sourceRecord.total_amount))
      ? Number(sourceRecord.total_amount)
      : Number.isFinite(Number(sourceRecord.amount))
        ? Number(sourceRecord.amount)
        : Number.isFinite(Number(sourceRecord.payment_amount))
          ? Number(sourceRecord.payment_amount)
          : null;

  if (recordAmount !== null) {
    derivedAmount = recordAmount;
  }

  const recordTitleCandidates = [
    sourceRecord.name,
    sourceRecord.title,
    sourceRecord.amenity_name,
    sourceRecord.service_name,
    sourceRecord.bill_type,
    sourceRecord.package_name,
  ];
  const resolvedTitle = recordTitleCandidates.find(
    (value) => typeof value === 'string' && value.trim().length > 0
  );
  if (typeof resolvedTitle === 'string') {
    derivedTitle = resolvedTitle.trim();
  }

  const resolvedDescription = [sourceRecord.description, sourceRecord.notes].find(
    (value) => typeof value === 'string' && value.trim().length > 0
  );
  if (typeof resolvedDescription === 'string') {
    derivedDescription = resolvedDescription.trim();
  }

  const recordCurrency = [sourceRecord.currency_code, sourceRecord.currency].find(
    (value) => typeof value === 'string' && value.trim().length > 0
  );
  if (typeof recordCurrency === 'string') {
    derivedCurrencyCode = recordCurrency.trim().toUpperCase();
  }

  return {
    sourceType,
    sourceId,
    obligationId,
    derivedTitle,
    derivedDescription,
    derivedAmount,
    derivedCurrencyCode,
  };
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

const buildSubmitFallbackParams = ({
  config,
  input,
  orderId,
  formattedAmount,
}: {
  config: ExpressPayRuntimeConfig;
  input: InitiateExpressPayInput;
  orderId: string;
  formattedAmount: string;
}) => {
  const providerRedirectUrl =
    config.redirectUrl.length <= MAX_EXPRESSPAY_DIRECT_POST_URL_LENGTH ? config.redirectUrl : config.directPostUrl;
  const params = new URLSearchParams();

  params.set('merchant-id', config.merchantId);
  params.set('api-key', config.apiKey);
  params.set('firstname', input.payerProfile?.first_name || 'Resident');
  params.set('lastname', input.payerProfile?.last_name || 'User');
  params.set('email', input.payerProfile?.email || 'resident@casanirvana.app');
  params.set('phonenumber', input.payerProfile?.phone || '0000000000');
  params.set('username', input.payerProfile?.email || `user-${input.payerId}`);
  params.set('accountnumber', input.unitId.slice(0, 32));
  params.set('currency', input.currency || DEFAULT_CURRENCY);
  params.set('amount', formattedAmount);
  params.set('order-id', orderId);
  params.set('order-desc', input.description || `Casa Nirvana ${input.paymentType} payment`);
  params.set('redirect-url', providerRedirectUrl);
  params.set('post-url', config.directPostUrl);

  return params;
};

const buildDirectMobileMoneyCheckoutAttempts = ({
  config,
  token,
  baseSubmitParams,
  cookieHeader,
  payerPhone,
  requestedNetwork,
  inputMetadata,
}: {
  config: ExpressPayRuntimeConfig;
  token: string;
  baseSubmitParams: URLSearchParams;
  cookieHeader?: string | null;
  payerPhone: string;
  requestedNetwork?: string | null;
  inputMetadata: JsonRecord;
}) => {
  const mobileAuthNetwork =
    getNestedString(inputMetadata, 'mobile_auth_network') ||
    getNestedString(inputMetadata, 'mobile_auth_token');
  const legacyNetwork = resolveExpressPayLegacyMobileNetwork(requestedNetwork);

  const submitParams = new URLSearchParams(baseSubmitParams.toString());
  submitParams.set('token', token);
  submitParams.set('mobile-number', payerPhone);
  submitParams.set('mobile-network', legacyNetwork || 'MTN');
  if (mobileAuthNetwork) {
    submitParams.set('mobile-auth-token', mobileAuthNetwork);
  }

  return [
    {
      url: config.submitUrl,
      label: 'submit.php',
      payload: submitParams,
      cookieHeader: cookieHeader || null,
    },
  ];
};

export const initiateExpressPayPayment = async (
  input: InitiateExpressPayInput
): Promise<InitiateExpressPayResult> => {
  const sourceContext = await resolvePaymentSourceContext(input);
  const amount =
    sourceContext.derivedAmount !== null && Number.isFinite(sourceContext.derivedAmount)
      ? sourceContext.derivedAmount
      : Number(input.amount);
  const effectiveCurrency =
    sourceContext.derivedCurrencyCode ||
    (input.currency && input.currency.trim().length > 0 ? input.currency.trim().toUpperCase() : null) ||
    DEFAULT_PAYMENT_CURRENCY_CODE;
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
      const directFlow = expresspayMeta.direct_flow === true;

      if (token && ['initiated', 'processing'].includes(String(existing.status || '').toLowerCase()) && (checkoutUrl || directFlow)) {
        return {
          paymentId: existing.id,
          transactionId: existing.transaction_id || '',
          checkoutUrl: checkoutUrl || null,
          status: directFlow ? 'processing' : 'initiated',
          providerReference: existing.reference_number || null,
          token,
        };
      }
    }
  }

  const config = await resolveRuntimeConfig(input.communityId);
  const orderId = generateOrderId();
  const createdAt = nowIso();
  const inputMetadata = asObject(input.metadata);

  const paymentPayload: Record<string, unknown> = {
    amount,
    unit_id: input.unitId,
    payer_id: input.payerId,
    booking_id: sourceContext.sourceType === 'service_booking' ? input.bookingId || sourceContext.sourceId || null : null,
    source_type: sourceContext.sourceType,
    source_id: sourceContext.sourceId,
    obligation_id: sourceContext.obligationId,
    currency_code: effectiveCurrency,
    currency_symbol:
      effectiveCurrency === DEFAULT_PAYMENT_DISPLAY.currencyCode
        ? DEFAULT_PAYMENT_DISPLAY.currencySymbol
        : effectiveCurrency,
    payment_type: input.paymentType,
    payment_method: input.paymentMethod,
    payment_gateway: EXPRESSPAY_PROVIDER,
    status: 'initiated',
    title:
      sourceContext.derivedTitle ||
      getNestedString(inputMetadata, 'source_display_title') ||
      input.description ||
      'ExpressPay Payment',
    description:
      input.description ||
      sourceContext.derivedDescription ||
      getNestedString(inputMetadata, 'source_display_description') ||
      null,
    transaction_id: orderId,
    initiated_at: createdAt,
    payment_date: createdAt,
    provider_status_code: null,
    provider_status_message: null,
    provider_checked_at: null,
    metadata: {
      ...inputMetadata,
      idempotency_key: idempotencyKey,
      expresspay: {
        mode: config.mode,
        order_id: orderId,
        config_scope_community_id: config.communityId,
        initiated_at: createdAt,
        source_type: sourceContext.sourceType,
        source_id: sourceContext.sourceId,
        obligation_id: sourceContext.obligationId,
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

  if (input.paymentMethod === 'mobile_money') {
    try {
      const payerPhoneRaw = getNestedString(inputMetadata, 'payer_phone') || input.payerProfile?.phone || '';
      const payerPhone = payerPhoneRaw.replace(/\D+/g, '');
      const requestedNetwork = getNestedString(inputMetadata, 'mobile_network');
      const resolvedNetwork = resolveExpressPayMobileNetwork({
        rawNetwork: requestedNetwork,
        phoneNumber: payerPhone,
      });
      const payerPhoneForProvider = normalizeExpressPayMsisdn(payerPhone);

      if (!payerPhone || payerPhone.length < 10) {
        throw new Error('A valid mobile money number is required for in-app payment.');
      }

      if (!resolvedNetwork) {
        throw new Error('Unsupported mobile money network selected for ExpressPay.');
      }

      const directSubmitParams = new URLSearchParams();
      directSubmitParams.set('merchant-id', config.merchantId);
      directSubmitParams.set('api-key', config.apiKey);
      directSubmitParams.set('currency', effectiveCurrency);
      directSubmitParams.set('amount', formattedAmount);
      directSubmitParams.set('order-id', orderId);
      directSubmitParams.set('post-url', config.directPostUrl);

      let directSubmitResponse: SubmitResponse;
      let directSubmitCookieHeader: string | null = null;
      let directSubmitTransport: 'standard_submit' | 'direct_submit' | 'submit_fallback' = 'standard_submit';
      let directSubmitPrimaryError: JsonRecord | null = null;

      const submitFallbackParams = buildSubmitFallbackParams({
        config,
        input: {
          ...input,
          currency: effectiveCurrency,
        },
        orderId,
        formattedAmount,
      });

      try {
        const submitCallResult = await invokeExpressPaySubmit(
          config,
          submitFallbackParams
        );
        directSubmitResponse = submitCallResult.body;
        directSubmitCookieHeader = submitCallResult.cookieHeader;
      } catch (error: unknown) {
        const providerErrorDetails =
          error instanceof ExpressPayGatewayError && error.details ? error.details : null;
        const providerStatus = Number(providerErrorDetails?.status);

        // ExpressPay's Merchant Direct API docs are internally inconsistent:
        // the endpoint table documents /api/direct/submit.php, while the official
        // sample uses /api/submit.php for token creation. We follow the sample
        // first because it includes the customer fields that the MoMo step
        // subsequently validates. Keep the direct endpoint only as a last resort.
        if (providerStatus !== 3) {
          throw error;
        }

        directSubmitPrimaryError = providerErrorDetails;
        directSubmitResponse = await invokeExpressPayDirectSubmit(config, directSubmitParams);
        directSubmitTransport = 'direct_submit';
      }

      const token = String(directSubmitResponse.token).trim();

      const directCheckoutResponse = await invokeExpressPayDirectCheckout(
        buildDirectMobileMoneyCheckoutAttempts({
          config,
          token,
          baseSubmitParams: submitFallbackParams,
          cookieHeader: directSubmitCookieHeader,
          payerPhone,
          requestedNetwork,
          inputMetadata,
        })
      );
      const immediateStatus = mapQueryResultToStatus(directCheckoutResponse);
      const directCheckoutMessage = String(
        directCheckoutResponse['result-text'] || (directCheckoutResponse as JsonRecord).message || 'Unknown error'
      );

      if (immediateStatus === 'failed') {
        throw new ExpressPayGatewayError(`ExpressPay direct checkout failed: ${directCheckoutMessage}`, {
          ...asObject(directCheckoutResponse),
          mobile_number: payerPhoneForProvider,
          mobile_network: resolvedNetwork,
        });
      }

      const verifiedAt = nowIso();
      const providerReference =
        typeof directCheckoutResponse['transaction-id'] === 'string'
          ? directCheckoutResponse['transaction-id']
          : payment.reference_number;
      const paymentMetadata = asObject(payment.metadata);
      const expressPayMetadata = asObject(paymentMetadata.expresspay);

      const updates: Record<string, unknown> = {
        reference_number: providerReference || null,
        status: immediateStatus,
        provider_status_code:
          typeof directCheckoutResponse.result !== 'undefined'
            ? String(directCheckoutResponse.result)
            : typeof (directCheckoutResponse as JsonRecord).status !== 'undefined'
              ? String((directCheckoutResponse as JsonRecord).status)
              : null,
        provider_status_message: directCheckoutMessage,
        provider_checked_at: verifiedAt,
        metadata: {
          ...paymentMetadata,
          expresspay: {
            ...expressPayMetadata,
            token,
            direct_flow: true,
            direct_submit_result: directSubmitResponse,
            direct_submit_transport: directSubmitTransport,
            direct_submit_primary_error: directSubmitPrimaryError,
            direct_checkout_result: directCheckoutResponse,
            direct_post_url: config.directPostUrl,
            mobile_network: resolvedNetwork,
            mobile_network_legacy: resolveExpressPayLegacyMobileNetwork(requestedNetwork),
            mobile_number: payerPhoneForProvider,
            mobile_number_local: payerPhone,
            verified_at: verifiedAt,
          },
        },
      };

      if (immediateStatus === 'completed') {
        updates.completed_at = verifiedAt;
        updates.paid_at = verifiedAt;
      }

      if (immediateStatus === 'failed') {
        updates.failed_at = verifiedAt;
      }

      const updated = await updatePaymentRecord(payment.id, updates);
      await applyPaymentOutcomeSideEffects({
        paymentId: updated.id,
        status: immediateStatus,
      });

      return {
        paymentId: updated.id,
        transactionId: updated.transaction_id || orderId,
        checkoutUrl: null,
        status: immediateStatus,
        providerReference: providerReference || null,
        token,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown mobile money initiation error';
      const errorDetails =
        error instanceof ExpressPayGatewayError && error.details ? error.details : null;

      await updatePaymentRecord(payment.id, {
        status: 'failed',
        failed_at: nowIso(),
        provider_status_code: 'initiation_failed',
        provider_status_message: message,
        provider_checked_at: nowIso(),
        metadata: {
          ...asObject(payment.metadata),
          expresspay: {
            ...asObject(asObject(payment.metadata).expresspay),
            direct_flow: true,
            initiation_error: message,
            initiation_error_context: errorDetails,
            initiation_failed_at: nowIso(),
          },
        },
      });
      await applyPaymentOutcomeSideEffects({
        paymentId: payment.id,
        status: 'failed',
      });

      throw new Error(message);
    }
  }

  try {
    const submitParams = new URLSearchParams();
    const appReturnUrl = getNestedString(inputMetadata, 'app_return_url');
    let providerRedirectUrl = config.redirectUrl;

    if (appReturnUrl && /^(myapp|exp):\/\//i.test(appReturnUrl)) {
      const relayUrl = new URL('/payments/expresspay/redirect', getCallbackBaseUrl());
      relayUrl.searchParams.set('payment_id', payment.id);
      relayUrl.searchParams.set('return_url', appReturnUrl);

      if (relayUrl.toString().length <= MAX_EXPRESSPAY_HOSTED_REDIRECT_URL_LENGTH) {
        providerRedirectUrl = relayUrl.toString();
      }
    }

    submitParams.set('merchant-id', config.merchantId);
    submitParams.set('api-key', config.apiKey);
    submitParams.set('firstname', input.payerProfile?.first_name || 'Resident');
    submitParams.set('lastname', input.payerProfile?.last_name || 'User');
    submitParams.set('email', input.payerProfile?.email || 'resident@casanirvana.app');
    submitParams.set('phonenumber', input.payerProfile?.phone || '0000000000');
    submitParams.set('username', input.payerProfile?.email || `user-${input.payerId}`);
    submitParams.set('accountnumber', input.unitId.slice(0, 3));
    submitParams.set('currency', effectiveCurrency);
    submitParams.set('amount', formattedAmount);
    submitParams.set('order-id', orderId);
    submitParams.set('order-desc', input.description || `Casa Nirvana ${input.paymentType} payment`);
    submitParams.set('redirect-url', providerRedirectUrl);
    submitParams.set('post-url', config.directPostUrl);

    const submitCallResult = await invokeExpressPaySubmit(config, submitParams);
    const submitResponse = submitCallResult.body;
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
      status: 'initiated',
      providerReference: providerReference || null,
      token,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown initiation error';
    await updatePaymentRecord(payment.id, {
      status: 'failed',
      failed_at: nowIso(),
      provider_status_code: 'initiation_failed',
      provider_status_message: message,
      provider_checked_at: nowIso(),
      metadata: {
        ...asObject(payment.metadata),
        expresspay: {
          ...asObject(asObject(payment.metadata).expresspay),
          initiation_error: message,
          initiation_failed_at: nowIso(),
        },
      },
    });
    await applyPaymentOutcomeSideEffects({
      paymentId: payment.id,
      status: 'failed',
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
    provider_status_code:
      typeof queryResult.result !== 'undefined'
        ? String(queryResult.result)
        : typeof (queryResult as JsonRecord).status !== 'undefined'
          ? String((queryResult as JsonRecord).status)
          : null,
    provider_status_message: String(queryResult['result-text'] || (queryResult as JsonRecord).message || ''),
    provider_checked_at: verifiedAt,
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
  await applyPaymentOutcomeSideEffects({
    paymentId: updatedPayment.id,
    status: mappedStatus,
  });

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
    status: payment.status || 'initiated',
    transaction_id: payment.transaction_id,
    reference_number: payment.reference_number,
    payment_gateway: payment.payment_gateway,
    metadata: payment.metadata,
  };
};

export const getExpressPayPaymentRecord = getPaymentById;
