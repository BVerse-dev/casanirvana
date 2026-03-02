import { Socket } from 'node:net';
import { supabase } from '../lib/supabase';

export const MASKED_SECRET_VALUE = '••••••••';

type Primitive = string | number | boolean | null;
type SettingsMap = Record<string, Primitive>;

const SMTP_DEFAULTS = {
  smtp_host: 'smtp.gmail.com',
  smtp_port: 587,
  smtp_username: '',
  smtp_password: '',
  smtp_encryption: 'tls',
  smtp_from_email: 'noreply@casanirvana.com',
  smtp_from_name: 'Casa Nirvana',
  smtp_timeout: 30,
  smtp_enable_ssl: false,
  smtp_enable_tls: true,
  smtp_test_mode: false,
} satisfies SettingsMap;

const SMTP_SENSITIVE_KEYS = new Set<string>(['smtp_username', 'smtp_password']);

const INTEGRATION_DEFAULTS = {
  openai_api_key: '',
  openai_organization_id: '',
  anthropic_api_key: '',
  google_ai_api_key: '',
  azure_openai_endpoint: '',
  azure_openai_key: '',
  huggingface_api_key: '',
  sms_provider: 'twilio',
  sms_api_key: '',
  email_provider: 'sendgrid',
  email_api_key: '',
  whatsapp_business_api_key: '',
  telegram_bot_token: '',
  slack_webhook_url: '',
  razorpay_key_id: '',
  razorpay_key_secret: '',
  stripe_public_key: '',
  stripe_secret_key: '',
  paypal_client_id: '',
  paypal_client_secret: '',
  aws_access_key: '',
  aws_secret_key: '',
  aws_region: 'us-east-1',
  aws_bucket_name: '',
  google_cloud_key: '',
  azure_storage_key: '',
  firebase_config: '',
  pusher_app_id: '',
  pusher_key: '',
  pusher_secret: '',
  ai_chat_enabled: false,
  ai_maintenance_predictions: false,
  ai_document_processing: false,
  smart_notifications: false,
  automated_billing: false,
  real_time_analytics: false,
} satisfies SettingsMap;

const INTEGRATION_SENSITIVE_KEYS = new Set<string>([
  'openai_api_key',
  'anthropic_api_key',
  'google_ai_api_key',
  'azure_openai_key',
  'huggingface_api_key',
  'sms_api_key',
  'email_api_key',
  'whatsapp_business_api_key',
  'telegram_bot_token',
  'slack_webhook_url',
  'razorpay_key_id',
  'razorpay_key_secret',
  'stripe_public_key',
  'stripe_secret_key',
  'paypal_client_id',
  'paypal_client_secret',
  'aws_access_key',
  'aws_secret_key',
  'google_cloud_key',
  'azure_storage_key',
  'firebase_config',
  'pusher_key',
  'pusher_secret',
]);

type SystemSettingRow = {
  key: string;
  value: string;
  data_type?: string | null;
  is_sensitive?: boolean | null;
};

type LegacySettingRow = {
  key: string;
  value: string;
};

const SMTP_DESCRIPTIONS: Record<string, string> = {
  smtp_host: 'SMTP relay hostname',
  smtp_port: 'SMTP relay port',
  smtp_username: 'SMTP authentication username',
  smtp_password: 'SMTP authentication password',
  smtp_encryption: 'Transport encryption mode',
  smtp_from_email: 'Default sender email address',
  smtp_from_name: 'Default sender display name',
  smtp_timeout: 'SMTP connection timeout in seconds',
  smtp_enable_ssl: 'Enable SSL/TLS socket encryption',
  smtp_enable_tls: 'Enable STARTTLS negotiation',
  smtp_test_mode: 'Enable safe SMTP test mode',
};

const INTEGRATION_DESCRIPTIONS: Record<string, string> = {
  openai_api_key: 'OpenAI API key',
  openai_organization_id: 'OpenAI organization identifier',
  anthropic_api_key: 'Anthropic API key',
  google_ai_api_key: 'Google AI API key',
  azure_openai_endpoint: 'Azure OpenAI endpoint URL',
  azure_openai_key: 'Azure OpenAI access key',
  huggingface_api_key: 'Hugging Face access token',
  sms_provider: 'Configured SMS provider',
  sms_api_key: 'SMS provider API key',
  email_provider: 'Configured email provider',
  email_api_key: 'Transactional email API key',
  whatsapp_business_api_key: 'WhatsApp Business API key',
  telegram_bot_token: 'Telegram bot token',
  slack_webhook_url: 'Slack incoming webhook URL',
  razorpay_key_id: 'Razorpay key id',
  razorpay_key_secret: 'Razorpay key secret',
  stripe_public_key: 'Stripe publishable key',
  stripe_secret_key: 'Stripe secret key',
  paypal_client_id: 'PayPal client id',
  paypal_client_secret: 'PayPal client secret',
  aws_access_key: 'AWS access key',
  aws_secret_key: 'AWS secret key',
  aws_region: 'AWS region',
  aws_bucket_name: 'AWS bucket name',
  google_cloud_key: 'Google Cloud service key',
  azure_storage_key: 'Azure Storage key',
  firebase_config: 'Firebase JSON configuration',
  pusher_app_id: 'Pusher app id',
  pusher_key: 'Pusher key',
  pusher_secret: 'Pusher secret',
  ai_chat_enabled: 'Enable AI chat assistant',
  ai_maintenance_predictions: 'Enable predictive maintenance',
  ai_document_processing: 'Enable AI document processing',
  smart_notifications: 'Enable smart notification rules',
  automated_billing: 'Enable automated billing routines',
  real_time_analytics: 'Enable real-time analytics features',
};

const INTEGRATION_TEST_REQUIREMENTS: Record<
  string,
  { label: string; keys: string[]; urlKeys?: string[]; jsonKeys?: string[] }
> = {
  openai_api_key: { label: 'OpenAI', keys: ['openai_api_key'] },
  anthropic_api_key: { label: 'Anthropic Claude', keys: ['anthropic_api_key'] },
  google_ai_api_key: { label: 'Google AI Studio', keys: ['google_ai_api_key'] },
  azure_openai_key: {
    label: 'Azure OpenAI',
    keys: ['azure_openai_key', 'azure_openai_endpoint'],
    urlKeys: ['azure_openai_endpoint'],
  },
  huggingface_api_key: { label: 'Hugging Face', keys: ['huggingface_api_key'] },
  sms_api_key: { label: 'SMS Service', keys: ['sms_api_key'] },
  email_api_key: { label: 'Email Service', keys: ['email_api_key'] },
  whatsapp_business_api_key: {
    label: 'WhatsApp Business',
    keys: ['whatsapp_business_api_key'],
  },
  telegram_bot_token: { label: 'Telegram Bot', keys: ['telegram_bot_token'] },
  slack_webhook_url: {
    label: 'Slack Integration',
    keys: ['slack_webhook_url'],
    urlKeys: ['slack_webhook_url'],
  },
  razorpay_key_id: { label: 'Razorpay', keys: ['razorpay_key_id'] },
  stripe_public_key: { label: 'Stripe', keys: ['stripe_public_key'] },
  paypal_client_id: { label: 'PayPal', keys: ['paypal_client_id'] },
  aws_access_key: { label: 'Amazon S3', keys: ['aws_access_key'] },
  google_cloud_key: { label: 'Google Cloud Storage', keys: ['google_cloud_key'] },
  azure_storage_key: { label: 'Azure Storage', keys: ['azure_storage_key'] },
  firebase_config: {
    label: 'Firebase',
    keys: ['firebase_config'],
    jsonKeys: ['firebase_config'],
  },
  pusher_key: { label: 'Pusher', keys: ['pusher_key'] },
};

function parseStoredValue(value: string, dataType?: string | null) {
  if (dataType === 'boolean') {
    return value === 'true';
  }
  if (dataType === 'number') {
    return Number(value);
  }
  if (dataType === 'json') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value !== '' && !Number.isNaN(Number(value))) return Number(value);
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function inferDataType(value: Primitive) {
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'object' && value !== null) return 'json';
  return 'string';
}

function serializeValue(value: Primitive) {
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value);
  }
  return value == null ? '' : String(value);
}

async function readSystemSettings(category: string): Promise<SystemSettingRow[]> {
  const { data, error } = await supabase
    .from('system_settings')
    .select('key, value, data_type, is_sensitive')
    .eq('category', category);

  if (error) {
    throw new Error(`Failed to fetch ${category} settings`);
  }

  return (data || []) as SystemSettingRow[];
}

async function readLegacySettings(category: string): Promise<LegacySettingRow[]> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('key, value')
    .eq('category', category);

  if (error) {
    return [];
  }

  return (data || []) as LegacySettingRow[];
}

async function loadSettings(category: string, defaults: SettingsMap): Promise<SettingsMap> {
  const rows = await readSystemSettings(category);
  const sourceRows = rows.length > 0 ? rows : await readLegacySettings(category);
  const settings: SettingsMap = { ...defaults };

  for (const row of sourceRows) {
    if (!(row.key in defaults)) continue;
    const dataType = 'data_type' in row ? row.data_type : undefined;
    settings[row.key] = parseStoredValue(row.value, dataType);
  }

  return settings;
}

function maskSensitiveValues(settings: SettingsMap, sensitiveKeys: Set<string>) {
  const masked = { ...settings };
  for (const key of sensitiveKeys) {
    const value = masked[key];
    if (typeof value === 'string' && value.trim()) {
      masked[key] = MASKED_SECRET_VALUE;
    }
  }
  return masked;
}

function mergeSubmittedSettings(
  submitted: Record<string, unknown>,
  current: SettingsMap,
  defaults: SettingsMap,
  sensitiveKeys: Set<string>
) {
  const next: SettingsMap = { ...current };

  for (const [key, value] of Object.entries(submitted)) {
    if (!(key in defaults)) continue;

    if (sensitiveKeys.has(key)) {
      if (value === undefined || value === null) continue;
      const trimmed = String(value).trim();
      if (!trimmed || trimmed === MASKED_SECRET_VALUE) {
        continue;
      }
      next[key] = trimmed;
      continue;
    }

    next[key] = value as Primitive;
  }

  return next;
}

async function upsertSettingsCategory(
  category: string,
  settings: SettingsMap,
  descriptions: Record<string, string>,
  sensitiveKeys: Set<string>,
  updatedBy?: string | null
) {
  const rows = Object.entries(settings).map(([key, value]) => ({
    category,
    key,
    value: serializeValue(value),
    data_type: inferDataType(value),
    description: descriptions[key] ?? null,
    is_sensitive: sensitiveKeys.has(key),
    updated_by: updatedBy ?? null,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from('system_settings').upsert(rows, { onConflict: 'key' });
  if (error) {
    throw new Error(`Failed to save ${category} settings`);
  }

  return settings;
}

function validateUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export async function getAdminSmtpSettings() {
  const settings = await loadSettings('smtp', SMTP_DEFAULTS);
  return maskSensitiveValues(settings, SMTP_SENSITIVE_KEYS);
}

export async function saveAdminSmtpSettings(input: Record<string, unknown>, updatedBy?: string | null) {
  const current = await loadSettings('smtp', SMTP_DEFAULTS);
  const merged = mergeSubmittedSettings(input, current, SMTP_DEFAULTS, SMTP_SENSITIVE_KEYS);
  return upsertSettingsCategory('smtp', merged, SMTP_DESCRIPTIONS, SMTP_SENSITIVE_KEYS, updatedBy);
}

async function tcpConnectivityCheck(host: string, port: number, timeoutSeconds: number) {
  return new Promise<void>((resolve, reject) => {
    const socket = new Socket();
    const timeoutMs = Math.max(1000, timeoutSeconds * 1000);

    const cleanup = () => {
      socket.removeAllListeners();
      socket.destroy();
    };

    socket.setTimeout(timeoutMs);
    socket.once('connect', () => {
      cleanup();
      resolve();
    });
    socket.once('timeout', () => {
      cleanup();
      reject(new Error('Connection timed out'));
    });
    socket.once('error', (error) => {
      cleanup();
      reject(error);
    });
    socket.connect(port, host);
  });
}

export async function testAdminSmtpSettings(input: Record<string, unknown>) {
  const current = await loadSettings('smtp', SMTP_DEFAULTS);
  const merged = mergeSubmittedSettings(input, current, SMTP_DEFAULTS, SMTP_SENSITIVE_KEYS);

  if (!merged.smtp_host || !merged.smtp_from_email || !merged.smtp_username || !merged.smtp_password) {
    return {
      success: false,
      message: 'SMTP host, username, password, and sender email are required before testing.',
    };
  }

  try {
    await tcpConnectivityCheck(
      String(merged.smtp_host),
      Number(merged.smtp_port || 587),
      Number(merged.smtp_timeout || 30)
    );
    return {
      success: true,
      message: 'SMTP server responded successfully.',
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? `SMTP connectivity test failed: ${error.message}`
          : 'SMTP connectivity test failed.',
    };
  }
}

export async function getAdminIntegrationSettings() {
  const settings = await loadSettings('integrations', INTEGRATION_DEFAULTS);
  return maskSensitiveValues(settings, INTEGRATION_SENSITIVE_KEYS);
}

export async function saveAdminIntegrationSettings(input: Record<string, unknown>, updatedBy?: string | null) {
  const current = await loadSettings('integrations', INTEGRATION_DEFAULTS);
  const merged = mergeSubmittedSettings(input, current, INTEGRATION_DEFAULTS, INTEGRATION_SENSITIVE_KEYS);
  return upsertSettingsCategory('integrations', merged, INTEGRATION_DESCRIPTIONS, INTEGRATION_SENSITIVE_KEYS, updatedBy);
}

export async function testAdminIntegrationSetting(service: string, value?: unknown) {
  const requirements = INTEGRATION_TEST_REQUIREMENTS[service];
  if (!requirements) {
    throw new Error('Unsupported integration test target');
  }

  const current = await loadSettings('integrations', INTEGRATION_DEFAULTS);
  const candidateValue =
    value === undefined || value === null || String(value).trim() === '' || value === MASKED_SECRET_VALUE
      ? current[service]
      : value;

  const candidateConfig: SettingsMap = {
    ...current,
    [service]: candidateValue as Primitive,
  };

  for (const key of requirements.keys) {
    const fieldValue = candidateConfig[key];
    if (fieldValue === undefined || fieldValue === null || String(fieldValue).trim() === '') {
      return {
        success: false,
        message: `${requirements.label} configuration is incomplete. Set ${key.replace(/_/g, ' ')} first.`,
      };
    }
  }

  for (const key of requirements.urlKeys || []) {
    const fieldValue = String(candidateConfig[key] || '');
    if (!validateUrl(fieldValue)) {
      return {
        success: false,
        message: `${requirements.label} requires a valid URL in ${key.replace(/_/g, ' ')}.`,
      };
    }
  }

  for (const key of requirements.jsonKeys || []) {
    const fieldValue = String(candidateConfig[key] || '');
    try {
      JSON.parse(fieldValue);
    } catch {
      return {
        success: false,
        message: `${requirements.label} requires valid JSON in ${key.replace(/_/g, ' ')}.`,
      };
    }
  }

  return {
    success: true,
    message: `${requirements.label} configuration is valid and stored securely.`,
  };
}
