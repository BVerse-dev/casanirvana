import { adminSupabase } from '../lib/supabase';

const EXPRESSPAY_PROVIDER = 'expresspay';
const DEFAULT_CURRENCY = 'GHS';
const DEFAULT_CALLBACK_PATH = '/payments/expresspay/callback';

const ENDPOINTS = {
  test: {
    queryUrl: 'https://sandbox.expresspaygh.com/api/query.php',
  },
  live: {
    queryUrl: 'https://expresspaygh.com/api/query.php',
  },
} as const;

type JsonRecord = Record<string, unknown>;

type QueryError = { message?: string } | null;

type LooseQuery = {
  select: (...args: unknown[]) => LooseQuery;
  eq: (...args: unknown[]) => LooseQuery;
  neq: (...args: unknown[]) => LooseQuery;
  is: (...args: unknown[]) => LooseQuery;
  maybeSingle: () => Promise<{ data: unknown; error: QueryError }>;
  insert: (...args: unknown[]) => LooseQuery;
  update: (...args: unknown[]) => LooseQuery;
  single: () => Promise<{ data: unknown; error: QueryError }>;
};

type LooseSupabaseClient = {
  from: (table: string) => LooseQuery;
  rpc: (fn: string, params?: Record<string, unknown>) => Promise<{ data: unknown; error: QueryError }>;
};

const db = adminSupabase as unknown as LooseSupabaseClient;

type GatewayMode = 'test' | 'live';
type GatewayScope = 'global' | 'community';

type GatewayConfigRow = {
  id: string;
  mode: GatewayMode;
  scope: GatewayScope;
  community_id: string | null;
  is_enabled: boolean;
  public_config: JsonRecord | null;
  secret_refs: JsonRecord | null;
  last_tested_at: string | null;
  last_test_status: string | null;
  last_test_message: string | null;
};

export type ExpressPayConfigView = {
  mode: GatewayMode;
  scope: GatewayScope;
  community_id: string | null;
  is_enabled: boolean;
  currency: string;
  callback_path: string;
  webhook_url: string | null;
  submit_url: string | null;
  query_url: string | null;
  checkout_url: string | null;
  merchant_id_configured: boolean;
  api_key_configured: boolean;
  last_tested_at: string | null;
  last_test_status: string | null;
  last_test_message: string | null;
};

export type UpsertExpressPayConfigInput = {
  mode: GatewayMode;
  scope: GatewayScope;
  community_id?: string | null;
  is_enabled: boolean;
  currency?: string;
  callback_path?: string;
  webhook_url?: string | null;
  submit_url?: string | null;
  query_url?: string | null;
  checkout_url?: string | null;
  merchant_id?: string | null;
  api_key?: string | null;
  actor_profile_id?: string | null;
};

const asObject = (value: unknown): JsonRecord => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as JsonRecord;
  }
  return {};
};

const readString = (record: JsonRecord, key: string): string | null => {
  const value = record[key];
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeMode = (value: string | undefined | null): GatewayMode =>
  String(value || 'test').toLowerCase() === 'live' ? 'live' : 'test';

const normalizeScope = (value: string | undefined | null): GatewayScope =>
  String(value || 'global').toLowerCase() === 'community' ? 'community' : 'global';

const nowIso = () => new Date().toISOString();

const sanitizeSecretSuffix = (value: string) => value.toLowerCase().replace(/[^a-z0-9_]/g, '_');

const buildSecretName = ({
  mode,
  scope,
  communityId,
  key,
}: {
  mode: GatewayMode;
  scope: GatewayScope;
  communityId?: string | null;
  key: 'merchant_id' | 'api_key';
}) => {
  const communityPart = communityId ? sanitizeSecretSuffix(communityId) : 'global';
  return `expresspay_${mode}_${scope}_${communityPart}_${key}`;
};

const updateTestStatus = async (
  rowId: string,
  status: 'passed' | 'failed',
  message: string
): Promise<void> => {
  await db
    .from('payment_gateway_configs')
    .update({
      last_tested_at: nowIso(),
      last_test_status: status,
      last_test_message: message,
    })
    .eq('id', rowId)
    .single();
};

const upsertVaultSecret = async ({
  name,
  value,
  description,
}: {
  name: string;
  value: string;
  description: string;
}) => {
  const { error } = await db.rpc('p27_upsert_vault_secret', {
    secret_name: name,
    secret_value: value,
    secret_description: description,
  });

  if (error) {
    throw new Error(`Failed to store gateway secret (${name}): ${error.message}`);
  }
};

const readVaultSecret = async (name: string | null): Promise<string | null> => {
  if (!name) return null;

  const { data, error } = await db.rpc('p27_read_vault_secret', {
    secret_name: name,
  });

  if (error) {
    return null;
  }

  if (typeof data === 'string' && data.trim().length > 0) {
    return data;
  }

  return null;
};

const getConfigRow = async ({
  mode,
  scope,
  communityId,
}: {
  mode: GatewayMode;
  scope: GatewayScope;
  communityId?: string | null;
}): Promise<GatewayConfigRow | null> => {
  let query = db
    .from('payment_gateway_configs')
    .select('*')
    .eq('provider', EXPRESSPAY_PROVIDER)
    .eq('mode', mode)
    .eq('scope', scope);

  if (scope === 'community') {
    query = query.eq('community_id', communityId || null);
  } else {
    query = query.is('community_id', null);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(`Failed to read ExpressPay config: ${error.message}`);
  }

  return (data as GatewayConfigRow | null) || null;
};

const toView = (row: GatewayConfigRow | null, mode: GatewayMode, scope: GatewayScope, communityId?: string | null): ExpressPayConfigView => {
  const publicConfig = asObject(row?.public_config);
  const secretRefs = asObject(row?.secret_refs);

  return {
    mode,
    scope,
    community_id: scope === 'community' ? communityId || null : null,
    is_enabled: row?.is_enabled || false,
    currency: readString(publicConfig, 'currency') || DEFAULT_CURRENCY,
    callback_path: readString(publicConfig, 'callback_path') || DEFAULT_CALLBACK_PATH,
    webhook_url: readString(publicConfig, 'webhook_url'),
    submit_url: readString(publicConfig, 'submit_url'),
    query_url: readString(publicConfig, 'query_url'),
    checkout_url: readString(publicConfig, 'checkout_url'),
    merchant_id_configured: Boolean(readString(secretRefs, 'merchant_id_secret_name')),
    api_key_configured: Boolean(readString(secretRefs, 'api_key_secret_name')),
    last_tested_at: row?.last_tested_at || null,
    last_test_status: row?.last_test_status || null,
    last_test_message: row?.last_test_message || null,
  };
};

export const getExpressPayConfig = async ({
  mode,
  scope,
  communityId,
}: {
  mode?: string | null;
  scope?: string | null;
  communityId?: string | null;
}): Promise<ExpressPayConfigView> => {
  const normalizedMode = normalizeMode(mode);
  const normalizedScope = normalizeScope(scope);
  const resolvedCommunityId = normalizedScope === 'community' ? communityId || null : null;

  const row = await getConfigRow({
    mode: normalizedMode,
    scope: normalizedScope,
    communityId: resolvedCommunityId,
  });

  return toView(row, normalizedMode, normalizedScope, resolvedCommunityId);
};

export const upsertExpressPayConfig = async (input: UpsertExpressPayConfigInput): Promise<ExpressPayConfigView> => {
  const mode = normalizeMode(input.mode);
  const scope = normalizeScope(input.scope);
  const communityId = scope === 'community' ? input.community_id || null : null;

  if (scope === 'community' && !communityId) {
    throw new Error('community_id is required when scope is community');
  }

  const existing = await getConfigRow({ mode, scope, communityId });
  const existingPublic = asObject(existing?.public_config);
  const existingSecretRefs = asObject(existing?.secret_refs);

  const publicConfig: JsonRecord = {
    ...existingPublic,
    currency: input.currency || readString(existingPublic, 'currency') || DEFAULT_CURRENCY,
    callback_path: input.callback_path || readString(existingPublic, 'callback_path') || DEFAULT_CALLBACK_PATH,
  };

  const maybeAssign = (key: string, value?: string | null) => {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        publicConfig[key] = trimmed;
      }
    }
  };

  maybeAssign('webhook_url', input.webhook_url);
  maybeAssign('submit_url', input.submit_url);
  maybeAssign('query_url', input.query_url);
  maybeAssign('checkout_url', input.checkout_url);

  const secretRefs: JsonRecord = { ...existingSecretRefs };

  const persistSecret = async (
    rawValue: string | null | undefined,
    key: 'merchant_id' | 'api_key'
  ) => {
    const value = typeof rawValue === 'string' ? rawValue.trim() : '';
    if (!value) return;

    const secretName = buildSecretName({ mode, scope, communityId, key });
    await upsertVaultSecret({
      name: secretName,
      value,
      description: `ExpressPay ${key.replace('_', ' ')} for ${scope} ${communityId || 'global'} (${mode})`,
    });
    secretRefs[`${key}_secret_name`] = secretName;
  };

  await persistSecret(input.merchant_id, 'merchant_id');
  await persistSecret(input.api_key, 'api_key');

  const payload: Record<string, unknown> = {
    provider: EXPRESSPAY_PROVIDER,
    mode,
    scope,
    community_id: communityId,
    is_enabled: input.is_enabled,
    public_config: publicConfig,
    secret_refs: secretRefs,
    updated_by: input.actor_profile_id || null,
  };

  if (!existing) {
    payload.created_by = input.actor_profile_id || null;
  }

  if (existing) {
    const { error } = await db
      .from('payment_gateway_configs')
      .update(payload)
      .eq('id', existing.id)
      .single();

    if (error) {
      throw new Error(`Failed to update ExpressPay config: ${error.message}`);
    }
  } else {
    const { error } = await db.from('payment_gateway_configs').insert(payload).single();
    if (error) {
      throw new Error(`Failed to create ExpressPay config: ${error.message}`);
    }
  }

  if (input.is_enabled) {
    let disableOtherModesQuery = adminSupabase
      .from('payment_gateway_configs')
      .select('id')
      .eq('provider', EXPRESSPAY_PROVIDER)
      .eq('scope', scope)
      .neq('mode', mode);

    if (scope === 'community') {
      disableOtherModesQuery = disableOtherModesQuery.eq('community_id', communityId);
    } else {
      disableOtherModesQuery = disableOtherModesQuery.is('community_id', null);
    }

    const { data: disableCandidates, error: disableCandidatesError } = await disableOtherModesQuery;

    if (disableCandidatesError) {
      throw new Error(`Failed to load previous ExpressPay modes: ${disableCandidatesError.message}`);
    }

    for (const row of disableCandidates || []) {
      const { error: disableOtherModesError } = await adminSupabase
        .from('payment_gateway_configs')
        .update({ is_enabled: false })
        .eq('id', row.id)
        .select('id')
        .single();

      if (disableOtherModesError) {
        throw new Error(`Failed to disable previous ExpressPay mode: ${disableOtherModesError.message}`);
      }
    }
  }

  return getExpressPayConfig({ mode, scope, communityId });
};

export const testExpressPayConfig = async ({
  mode,
  scope,
  communityId,
}: {
  mode?: string | null;
  scope?: string | null;
  communityId?: string | null;
}) => {
  const normalizedMode = normalizeMode(mode);
  const normalizedScope = normalizeScope(scope);
  const resolvedCommunityId = normalizedScope === 'community' ? communityId || null : null;

  const row = await getConfigRow({
    mode: normalizedMode,
    scope: normalizedScope,
    communityId: resolvedCommunityId,
  });

  if (!row) {
    throw new Error('No ExpressPay configuration found for selected scope/mode. Save settings first.');
  }

  const publicConfig = asObject(row.public_config);
  const secretRefs = asObject(row.secret_refs);

  const merchantIdSecretName = readString(secretRefs, 'merchant_id_secret_name');
  const apiKeySecretName = readString(secretRefs, 'api_key_secret_name');

  const merchantId =
    (await readVaultSecret(merchantIdSecretName)) ||
    process.env.EXPRESSPAY_MERCHANT_ID ||
    null;
  const apiKey =
    (await readVaultSecret(apiKeySecretName)) ||
    process.env.EXPRESSPAY_API_KEY ||
    null;

  if (!merchantId || !apiKey) {
    const message = 'Connection test failed: merchant-id or api-key is not configured.';
    await updateTestStatus(row.id, 'failed', message);
    return { passed: false, message };
  }

  const queryUrl =
    readString(publicConfig, 'query_url') ||
    ENDPOINTS[normalizedMode].queryUrl;

  const params = new URLSearchParams();
  params.set('merchant-id', merchantId);
  params.set('api-key', apiKey);
  params.set('token', 'CASA_NIRVANA_HEALTHCHECK');

  try {
    const response = await fetch(queryUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const rawText = await response.text();
    let parsed: JsonRecord = {};

    try {
      parsed = JSON.parse(rawText) as JsonRecord;
    } catch {
      // leave parsed as empty object
    }

    if (!response.ok) {
      const message = `Connection test failed (HTTP ${response.status}).`;
      await updateTestStatus(row.id, 'failed', message);
      return { passed: false, message, details: parsed };
    }

    const resultTextRaw = readString(parsed, 'result-text') || readString(parsed, 'result_text') || rawText;
    const resultText = String(resultTextRaw || '').toLowerCase();

    const authErrors = ['invalid api', 'invalid merchant', 'authentication', 'unauthorized'];
    const hasAuthError = authErrors.some((token) => resultText.includes(token));

    if (hasAuthError) {
      const message = 'Connection test failed: provider rejected credentials.';
      await updateTestStatus(row.id, 'failed', message);
      return { passed: false, message, details: parsed };
    }

    const message = 'Connection test passed: endpoint reachable and credentials accepted.';
    await updateTestStatus(row.id, 'passed', message);
    return { passed: true, message, details: parsed };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Network error while testing ExpressPay';
    await updateTestStatus(row.id, 'failed', message);
    return { passed: false, message };
  }
};
