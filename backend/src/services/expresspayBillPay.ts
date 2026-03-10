import { adminSupabase } from '../lib/supabase';

type JsonRecord = Record<string, unknown>;
type BillPayMode = 'test' | 'live';

export type PersonalHubServiceCategory =
  | 'airtime'
  | 'data'
  | 'bill_payment'
  | 'insurance'
  | 'money_transfer';

export type PersonalHubBillCategory = 'general' | 'utilities' | 'tv';

export type ExpressPayCatalogProvider = {
  id: string;
  provider_name: string;
  service_type: PersonalHubServiceCategory;
  bill_category: PersonalHubBillCategory;
  external_service_code: string;
  logo_url: string | null;
  supports_query: boolean;
  supports_pay: boolean;
  supports_status: boolean;
  provider_metadata: JsonRecord;
  is_active: boolean;
  is_enabled_for_app: boolean;
  last_synced_at: string | null;
};

export type CachedPersonalHubPackage = {
  id: string;
  provider_id: string | null;
  provider_name: string | null;
  provider_external_service_code: string | null;
  service_type: PersonalHubServiceCategory;
  package_name: string;
  package_code: string | null;
  denomination: number | null;
  data_amount: string | null;
  validity_days: number | null;
  description: string | null;
  is_active: boolean;
  is_enabled_for_app: boolean;
  provider_enabled_for_app: boolean;
  last_synced_at: string | null;
  provider_metadata: JsonRecord;
};

export type ExpressPayServiceQueryRequest = {
  providerId?: string | null;
  externalServiceCode?: string | null;
  serviceType?: PersonalHubServiceCategory | null;
  billCategory?: PersonalHubBillCategory | null;
  payload: JsonRecord;
};

export type ExpressPayServiceQueryOption = {
  id: string;
  code: string | null;
  name: string;
  amount: number | null;
  data_amount: string | null;
  validity_days: number | null;
  description: string | null;
  raw: JsonRecord;
};

export type ExpressPayServiceQueryResult = {
  provider: ExpressPayCatalogProvider;
  query_context: JsonRecord;
  options: ExpressPayServiceQueryOption[];
  raw: JsonRecord;
  status_text: string | null;
};

const EXPRESSPAY_BILLPAY_ENDPOINTS = {
  test: 'https://sandbox.expresspaygh.com/billpay/api.php',
  live: 'https://expresspaygh.com/billpay/api.php',
} as const;

const SUPPORTED_SERVICE_TYPES = new Set<PersonalHubServiceCategory>([
  'airtime',
  'data',
  'bill_payment',
  'insurance',
  'money_transfer',
]);

const AIRTIME_KEYWORDS = ['airtime', 'topup', 'top up', 'recharge', 'prepaid'];
const DATA_KEYWORDS = ['data', 'bundle', 'broadband', 'internet', 'surfline', 'iburst'];
const TV_KEYWORDS = ['dstv', 'gotv', 'tv', 'boxoffice', 'showmax', 'subscription'];
const UTILITY_KEYWORDS = ['ecg', 'water', 'utility', 'electric', 'electricity', 'waste', 'zoomlion', 'power'];
const TRANSFER_KEYWORDS = ['transfer', 'bank', 'wallet', 'mobile money', 'cashout', 'cash out', 'payout'];
const INSURANCE_KEYWORDS = ['insurance', 'policy', 'premium', 'life cover', 'cover'];

const asObject = (value: unknown): JsonRecord =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonRecord) : {};

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const pickString = (source: JsonRecord, keys: string[]) => {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return null;
};

const pickNumber = (source: JsonRecord, keys: string[]) => {
  for (const key of keys) {
    const raw = source[key];
    const parsed = typeof raw === 'number' ? raw : Number(raw);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
};

const pickBoolean = (source: JsonRecord, keys: string[], fallback: boolean) => {
  for (const key of keys) {
    const raw = source[key];
    if (typeof raw === 'boolean') {
      return raw;
    }
    if (typeof raw === 'number') {
      return raw === 1;
    }
    if (typeof raw === 'string') {
      const normalized = raw.trim().toLowerCase();
      if (['true', 'yes', '1', 'supported', 'enabled'].includes(normalized)) {
        return true;
      }
      if (['false', 'no', '0', 'disabled'].includes(normalized)) {
        return false;
      }
    }
  }
  return fallback;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const normalizeMode = (value?: string | null): BillPayMode => {
  const normalized = String(value || '').trim().toLowerCase();
  return normalized === 'live' ? 'live' : 'test';
};

const resolveBillPayConfig = () => {
  const mode = normalizeMode(process.env.EXPRESSPAY_BILLPAY_MODE || process.env.EXPRESSPAY_MODE || 'test');
  const baseUrl = process.env.EXPRESSPAY_BILLPAY_URL || EXPRESSPAY_BILLPAY_ENDPOINTS[mode];
  const username = process.env.EXPRESSPAY_BILLPAY_USERNAME?.trim() || '';
  const authToken = process.env.EXPRESSPAY_BILLPAY_AUTH_TOKEN?.trim() || '';

  if (!username || !authToken) {
    throw new Error('ExpressPay Bill Payments credentials are not configured.');
  }

  return {
    mode,
    apiUrl: baseUrl,
    username,
    authToken,
  };
};

const getStatusText = (payload: JsonRecord) =>
  pickString(payload, ['status-text', 'status_text', 'message', 'result-text', 'result_text']);

const extractCollection = (payload: JsonRecord): JsonRecord[] => {
  const candidateKeys = ['data', 'services', 'response', 'result', 'items', 'records'];

  for (const key of candidateKeys) {
    const value = payload[key];
    if (Array.isArray(value)) {
      return value.map((item) => asObject(item));
    }
  }

  if (Array.isArray(payload)) {
    return payload.map((item) => asObject(item));
  }

  return [];
};

const inferServiceCategory = (
  providerName: string,
  rawCategory?: string | null
): { serviceType: PersonalHubServiceCategory | null; billCategory: PersonalHubBillCategory } => {
  const name = providerName.toLowerCase();
  const category = String(rawCategory || '').toLowerCase();
  const normalized = `${name} ${category}`;

  if (AIRTIME_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return { serviceType: 'airtime', billCategory: 'general' };
  }

  if (DATA_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return { serviceType: 'data', billCategory: 'general' };
  }

  if (TV_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return { serviceType: 'bill_payment', billCategory: 'tv' };
  }

  if (UTILITY_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return { serviceType: 'bill_payment', billCategory: 'utilities' };
  }

  if (TRANSFER_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return { serviceType: 'money_transfer', billCategory: 'general' };
  }

  if (INSURANCE_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return { serviceType: 'insurance', billCategory: 'general' };
  }

  return { serviceType: null, billCategory: 'general' };
};

const normalizeCatalogProvider = (input: JsonRecord): Omit<ExpressPayCatalogProvider, 'id' | 'last_synced_at'> | null => {
  const providerName =
    pickString(input, ['name', 'service_name', 'serviceName', 'provider_name', 'providerName', 'label']) || '';
  const externalServiceCode =
    pickString(input, ['service', 'service_code', 'serviceCode', 'code', 'id', 'service_id']) || '';
  const rawCategory = pickString(input, ['category', 'service_category', 'group', 'type']);

  const fallbackName = externalServiceCode || providerName;
  const { serviceType, billCategory } = inferServiceCategory(fallbackName, rawCategory);

  if (!serviceType || !SUPPORTED_SERVICE_TYPES.has(serviceType) || !externalServiceCode) {
    return null;
  }

  const logoUrl = pickString(input, ['logo_url', 'logo', 'icon', 'image']);

  return {
    provider_name: providerName || externalServiceCode,
    service_type: serviceType,
    bill_category: billCategory,
    external_service_code: externalServiceCode,
    logo_url: logoUrl,
    supports_query: pickBoolean(input, ['supports_query', 'query_supported', 'can_query'], true),
    supports_pay: pickBoolean(input, ['supports_pay', 'pay_supported', 'can_pay'], true),
    supports_status: pickBoolean(input, ['supports_status', 'status_supported', 'can_status'], true),
    provider_metadata: input,
    is_active: true,
    is_enabled_for_app: true,
  };
};

const extractPackageOptions = (raw: JsonRecord): ExpressPayServiceQueryOption[] => {
  const packageCollections = [
    ...asArray(raw.packages),
    ...asArray(raw.bundles),
    ...asArray(raw.options),
    ...asArray(raw.products),
    ...asArray(raw.data),
  ];

  return packageCollections
    .map((item) => asObject(item))
    .map((item, index) => {
      const name =
        pickString(item, ['name', 'package_name', 'bundle_name', 'description', 'title']) || `Option ${index + 1}`;
      const code = pickString(item, ['code', 'package_code', 'bundle_code', 'id']);
      const amount = pickNumber(item, ['amount', 'price', 'cost', 'denomination']);
      const dataAmount = pickString(item, ['data_amount', 'data', 'volume', 'bundle_size']);
      const validityDays = pickNumber(item, ['validity_days', 'validity', 'days']);
      const description = pickString(item, ['description', 'label', 'details']);

      return {
        id: code || slugify(name) || `option_${index + 1}`,
        code,
        name,
        amount,
        data_amount: dataAmount,
        validity_days: validityDays !== null ? Number(validityDays) : null,
        description,
        raw: item,
      };
    });
};

const buildQueryContext = (raw: JsonRecord, payload: JsonRecord) => ({
  account_number:
    pickString(raw, ['account_number', 'accountNumber', 'meter_number', 'smartcard_number']) ||
    pickString(payload, ['account_number', 'accountNumber', 'meter_number', 'smartcard_number']),
  phone_number:
    pickString(raw, ['phone_number', 'phone', 'msisdn']) ||
    pickString(payload, ['phone_number', 'phone', 'msisdn']),
  customer_name:
    pickString(raw, ['customer_name', 'customerName', 'name', 'full_name', 'customer']) ||
    pickString(payload, ['customer_name', 'customerName', 'name']),
  policy_number:
    pickString(raw, ['policy_number', 'policyNumber', 'member_number']) ||
    pickString(payload, ['policy_number', 'policyNumber', 'member_number']),
  amount: pickNumber(raw, ['amount', 'payable_amount', 'total_amount', 'price']) ?? pickNumber(payload, ['amount']),
  raw,
});

const upsertPackagesForProvider = async ({
  providerId,
  serviceType,
  packages,
}: {
  providerId: string;
  serviceType: PersonalHubServiceCategory;
  packages: ExpressPayServiceQueryOption[];
}) => {
  if (!packages.length) {
    return;
  }

  const now = new Date().toISOString();
  const records = packages.map((item, index) => ({
    provider_id: providerId,
    package_name: item.name,
    service_type: serviceType,
    package_code: item.code || slugify(item.name) || `${providerId}_${index + 1}`,
    denomination: item.amount,
    data_amount: item.data_amount,
    validity_days: item.validity_days,
    description: item.description,
    is_active: true,
    display_order: index,
    catalog_source: 'expresspay',
    provider_metadata: item.raw,
    last_synced_at: now,
    is_enabled_for_app: true,
    updated_at: now,
  }));

  const { error } = await adminSupabase
    .from('service_packages')
    .upsert(records, {
      onConflict: 'provider_id,package_code',
    });

  if (error) {
    throw new Error(`Failed to sync service packages: ${error.message}`);
  }
};

const callExpressPayBillPay = async (payload: JsonRecord) => {
  const config = resolveBillPayConfig();

  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      username: config.username,
      'auth-token': config.authToken,
      ...payload,
    }),
  });

  const text = await response.text();
  let body: JsonRecord;

  try {
    body = asObject(JSON.parse(text));
  } catch {
    throw new Error(`ExpressPay Bill Payments returned a non-JSON response (${response.status}).`);
  }

  if (!response.ok) {
    throw new Error(getStatusText(body) || `ExpressPay Bill Payments request failed (${response.status}).`);
  }

  return body;
};

export const resolveExpressPayCatalogProvider = async ({
  providerId,
  externalServiceCode,
  serviceType,
  billCategory,
}: {
  providerId?: string | null;
  externalServiceCode?: string | null;
  serviceType?: PersonalHubServiceCategory | null;
  billCategory?: PersonalHubBillCategory | null;
}) => {
  let query = adminSupabase
    .from('service_providers')
    .select(
      'id, provider_name, service_type, bill_category, external_service_code, logo_url, supports_query, supports_pay, supports_status, provider_metadata, is_active, is_enabled_for_app, last_synced_at'
    )
    .eq('catalog_source', 'expresspay')
    .eq('is_active', true)
    .eq('is_enabled_for_app', true)
    .limit(1);

  if (providerId) {
    query = query.eq('id', providerId);
  } else if (externalServiceCode) {
    query = query.eq('external_service_code', externalServiceCode);
    if (serviceType) {
      query = query.eq('service_type', serviceType);
    }
    if (billCategory) {
      query = query.eq('bill_category', billCategory);
    }
  } else {
    throw new Error('A provider_id or external_service_code is required.');
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(`Failed to resolve Personal Hub provider: ${error.message}`);
  }

  if (!data) {
    throw new Error('The selected Personal Hub provider could not be found.');
  }

  return data as ExpressPayCatalogProvider;
};

export const listExpressPayCatalogServices = async () => {
  const body = await callExpressPayBillPay({ type: 'SERVICES' });
  return {
    raw: body,
    items: extractCollection(body),
    status_text: getStatusText(body),
  };
};

export const syncExpressPayCatalogToCache = async () => {
  const { items, raw, status_text } = await listExpressPayCatalogServices();
  const normalized = items
    .map((item) => normalizeCatalogProvider(item))
    .filter(Boolean) as Array<Omit<ExpressPayCatalogProvider, 'id' | 'last_synced_at'>>;

  if (!normalized.length) {
    throw new Error(status_text || 'ExpressPay did not return any supported Personal Hub services.');
  }

  const now = new Date().toISOString();
  const records = normalized.map((provider) => ({
    ...provider,
    catalog_source: 'expresspay',
    last_synced_at: now,
    updated_at: now,
  }));

  const { data, error } = await adminSupabase
    .from('service_providers')
    .upsert(records, {
      onConflict: 'catalog_source,service_type,bill_category,external_service_code',
    })
    .select(
      'id, provider_name, service_type, bill_category, external_service_code, logo_url, supports_query, supports_pay, supports_status, provider_metadata, is_active, is_enabled_for_app, last_synced_at'
    );

  if (error) {
    throw new Error(`Failed to sync ExpressPay Personal Hub catalog: ${error.message}`);
  }

  return {
    synced_at: now,
    imported_count: normalized.length,
    raw_status_text: status_text,
    providers: (data || []) as ExpressPayCatalogProvider[],
    raw,
  };
};

export const listCachedPersonalHubProviders = async ({
  serviceType,
  billCategory,
  includeDisabled = false,
}: {
  serviceType?: string | null;
  billCategory?: string | null;
  includeDisabled?: boolean;
}) => {
  let query = adminSupabase
    .from('service_providers')
    .select(
      'id, provider_name, service_type, bill_category, external_service_code, logo_url, supports_query, supports_pay, supports_status, provider_metadata, is_active, is_enabled_for_app, last_synced_at'
    )
    .eq('catalog_source', 'expresspay')
    .order('provider_name', { ascending: true });

  if (serviceType) {
    query = query.eq('service_type', serviceType);
  }

  if (billCategory) {
    query = query.eq('bill_category', billCategory);
  }

  if (!includeDisabled) {
    query = query.eq('is_active', true).eq('is_enabled_for_app', true);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to load cached Personal Hub providers: ${error.message}`);
  }

  return (data || []) as ExpressPayCatalogProvider[];
};

export const updateCachedPersonalHubProvider = async ({
  id,
  updates,
}: {
  id: string;
  updates: {
    provider_name?: string;
    logo_url?: string | null;
    is_enabled_for_app?: boolean;
  };
}) => {
  const payload = Object.fromEntries(
    Object.entries({
      provider_name: updates.provider_name,
      logo_url: updates.logo_url,
      is_enabled_for_app: updates.is_enabled_for_app,
      updated_at: new Date().toISOString(),
    }).filter(([, value]) => value !== undefined)
  );

  const { data, error } = await adminSupabase
    .from('service_providers')
    .update(payload)
    .eq('id', id)
    .eq('catalog_source', 'expresspay')
    .select(
      'id, provider_name, service_type, bill_category, external_service_code, logo_url, supports_query, supports_pay, supports_status, provider_metadata, is_active, is_enabled_for_app, last_synced_at'
    )
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to update cached Personal Hub provider: ${error.message}`);
  }

  if (!data) {
    throw new Error('Cached Personal Hub provider not found.');
  }

  return data as ExpressPayCatalogProvider;
};

export const listCachedPersonalHubPackages = async ({
  serviceType,
  providerId,
  includeDisabled = false,
}: {
  serviceType?: string | null;
  providerId?: string | null;
  includeDisabled?: boolean;
}) => {
  let query = adminSupabase
    .from('service_packages')
    .select(
      `
        id,
        provider_id,
        service_type,
        package_name,
        package_code,
        denomination,
        data_amount,
        validity_days,
        description,
        is_active,
        is_enabled_for_app,
        last_synced_at,
        provider_metadata,
        service_providers (
          provider_name,
          external_service_code,
          is_enabled_for_app
        )
      `
    )
    .eq('catalog_source', 'expresspay')
    .order('provider_id', { ascending: true })
    .order('display_order', { ascending: true, nullsFirst: false })
    .order('package_name', { ascending: true });

  if (serviceType) {
    query = query.eq('service_type', serviceType);
  }

  if (providerId) {
    query = query.eq('provider_id', providerId);
  }

  if (!includeDisabled) {
    query = query.eq('is_active', true).eq('is_enabled_for_app', true);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to load cached Personal Hub packages: ${error.message}`);
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    provider_id: item.provider_id,
    provider_name: item.service_providers?.provider_name || null,
    provider_external_service_code: item.service_providers?.external_service_code || null,
    service_type: item.service_type,
    package_name: item.package_name,
    package_code: item.package_code,
    denomination: item.denomination,
    data_amount: item.data_amount,
    validity_days: item.validity_days,
    description: item.description,
    is_active: Boolean(item.is_active),
    is_enabled_for_app: Boolean(item.is_enabled_for_app),
    provider_enabled_for_app: Boolean(item.service_providers?.is_enabled_for_app),
    last_synced_at: item.last_synced_at,
    provider_metadata: asObject(item.provider_metadata),
  })) as CachedPersonalHubPackage[];
};

export const queryExpressPayCatalogProvider = async (
  input: ExpressPayServiceQueryRequest
): Promise<ExpressPayServiceQueryResult> => {
  const provider = await resolveExpressPayCatalogProvider({
    providerId: input.providerId,
    externalServiceCode: input.externalServiceCode,
    serviceType: input.serviceType,
    billCategory: input.billCategory,
  });

  if (!provider.supports_query) {
    throw new Error(`${provider.provider_name} does not support account or package query.`);
  }

  const body = await callExpressPayBillPay({
    type: 'QUERY',
    service: provider.external_service_code,
    service_code: provider.external_service_code,
    ...input.payload,
  });

  const options = extractPackageOptions(body);
  if (provider.id && options.length > 0) {
    await upsertPackagesForProvider({
      providerId: provider.id,
      serviceType: provider.service_type,
      packages: options,
    });
  }

  return {
    provider,
    query_context: buildQueryContext(body, input.payload),
    options,
    raw: body,
    status_text: getStatusText(body),
  };
};

export const getExpressPayBillPayStatus = async ({
  providerId,
  externalServiceCode,
  billCategory,
  serviceType,
  payload,
}: {
  providerId?: string | null;
  externalServiceCode?: string | null;
  serviceType?: PersonalHubServiceCategory | null;
  billCategory?: PersonalHubBillCategory | null;
  payload: JsonRecord;
}) => {
  const provider = await resolveExpressPayCatalogProvider({
    providerId,
    externalServiceCode,
    serviceType,
    billCategory,
  });

  if (!provider.supports_status) {
    throw new Error(`${provider.provider_name} does not expose fulfillment status checks.`);
  }

  const raw = await callExpressPayBillPay({
    type: 'STATUS',
    service: provider.external_service_code,
    service_code: provider.external_service_code,
    ...payload,
  });

  return {
    provider,
    raw,
    status_text: getStatusText(raw),
  };
};
