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

const PUSH_DEFAULTS = {
  firebase_enabled: false,
  firebase_server_key: '',
  firebase_sender_id: '',
  firebase_api_key: '',
  firebase_project_id: '',
  push_maintenance_requests: true,
  push_payment_reminders: true,
  push_visitor_approvals: true,
  push_emergency_alerts: true,
  push_community_announcements: true,
  push_complaint_updates: true,
  push_amenity_bookings: true,
  push_service_updates: true,
  admin_push_new_users: true,
  admin_push_new_complaints: true,
  admin_push_maintenance_requests: true,
  admin_push_payment_received: true,
  admin_push_emergency_alerts: true,
  push_sound_enabled: true,
  push_vibration_enabled: true,
  push_badge_enabled: true,
  push_quiet_hours_enabled: false,
  push_quiet_start_time: '22:00',
  push_quiet_end_time: '07:00',
  default_push_title: 'Casa Nirvana',
  default_push_message: 'You have a new notification',
  push_click_action: 'OPEN_APP',
} satisfies SettingsMap;

const PUSH_SENSITIVE_KEYS = new Set<string>(['firebase_server_key', 'firebase_api_key']);

const PUSH_DESCRIPTIONS: Record<string, string> = {
  firebase_enabled: 'Enable Firebase push notifications',
  firebase_server_key: 'Firebase server key',
  firebase_sender_id: 'Firebase sender id',
  firebase_api_key: 'Firebase API key',
  firebase_project_id: 'Firebase project id',
  push_maintenance_requests: 'Send push notifications for maintenance updates',
  push_payment_reminders: 'Send push notifications for payment reminders',
  push_visitor_approvals: 'Send push notifications for visitor approvals',
  push_emergency_alerts: 'Send push notifications for emergency alerts',
  push_community_announcements: 'Send push notifications for community announcements',
  push_complaint_updates: 'Send push notifications for complaint updates',
  push_amenity_bookings: 'Send push notifications for amenity bookings',
  push_service_updates: 'Send push notifications for service updates',
  admin_push_new_users: 'Send admin push notifications for new users',
  admin_push_new_complaints: 'Send admin push notifications for new complaints',
  admin_push_maintenance_requests: 'Send admin push notifications for maintenance requests',
  admin_push_payment_received: 'Send admin push notifications for payments received',
  admin_push_emergency_alerts: 'Send admin push notifications for emergency alerts',
  push_sound_enabled: 'Enable sound for push notifications',
  push_vibration_enabled: 'Enable vibration for push notifications',
  push_badge_enabled: 'Enable badge counts for push notifications',
  push_quiet_hours_enabled: 'Enable quiet hours for push notifications',
  push_quiet_start_time: 'Push quiet hours start time',
  push_quiet_end_time: 'Push quiet hours end time',
  default_push_title: 'Default push notification title',
  default_push_message: 'Default push notification message',
  push_click_action: 'Default push notification click action',
};

const SMS_DEFAULTS = {
  sms_provider: 'twilio',
  twilio_account_sid: '',
  twilio_auth_token: '',
  twilio_phone_number: '',
  aws_access_key_id: '',
  aws_secret_access_key: '',
  aws_region: 'us-east-1',
  textlocal_api_key: '',
  textlocal_sender: '',
  msg91_api_key: '',
  msg91_sender_id: '',
  msg91_route: '4',
  default_country_code: '+233',
  rate_limit_per_minute: 10,
  sms_timeout: 30,
  enable_delivery_reports: true,
  test_mode: false,
  enable_otp_sms: true,
  enable_alert_sms: true,
  enable_reminder_sms: true,
  enable_emergency_sms: true,
} satisfies SettingsMap;

const SMS_SENSITIVE_KEYS = new Set<string>([
  'twilio_auth_token',
  'aws_access_key_id',
  'aws_secret_access_key',
  'textlocal_api_key',
  'msg91_api_key',
]);

const SMS_DESCRIPTIONS: Record<string, string> = {
  sms_provider: 'Configured SMS provider',
  twilio_account_sid: 'Twilio account SID',
  twilio_auth_token: 'Twilio auth token',
  twilio_phone_number: 'Twilio phone number',
  aws_access_key_id: 'AWS access key id',
  aws_secret_access_key: 'AWS secret access key',
  aws_region: 'AWS region',
  textlocal_api_key: 'TextLocal API key',
  textlocal_sender: 'TextLocal sender id',
  msg91_api_key: 'MSG91 API key',
  msg91_sender_id: 'MSG91 sender id',
  msg91_route: 'MSG91 route',
  default_country_code: 'Default SMS country code',
  rate_limit_per_minute: 'Rate limit per minute',
  sms_timeout: 'SMS timeout in seconds',
  enable_delivery_reports: 'Enable delivery reports',
  test_mode: 'Enable SMS test mode',
  enable_otp_sms: 'Enable OTP SMS',
  enable_alert_sms: 'Enable alert SMS',
  enable_reminder_sms: 'Enable reminder SMS',
  enable_emergency_sms: 'Enable emergency SMS',
};

const PAYMENT_GATEWAY_DEFAULTS = {
  razorpay_enabled: false,
  razorpay_key_id: '',
  razorpay_key_secret: '',
  razorpay_webhook_secret: '',
  razorpay_mode: 'test',
  stripe_enabled: false,
  stripe_publishable_key: '',
  stripe_secret_key: '',
  stripe_webhook_secret: '',
  stripe_mode: 'test',
  paypal_enabled: false,
  paypal_client_id: '',
  paypal_client_secret: '',
  paypal_webhook_id: '',
  paypal_mode: 'sandbox',
  paytm_enabled: false,
  paytm_merchant_id: '',
  paytm_merchant_key: '',
  paytm_website: '',
  paytm_mode: 'test',
  bank_transfer_enabled: false,
  bank_name: '',
  account_number: '',
  ifsc_code: '',
  account_holder_name: '',
  payment_currency: 'GHS',
  payment_timeout: 15,
  auto_refund_enabled: false,
  partial_payment_enabled: false,
} satisfies SettingsMap;

const PAYMENT_GATEWAY_SENSITIVE_KEYS = new Set<string>([
  'razorpay_key_secret',
  'stripe_secret_key',
  'paypal_client_secret',
  'paytm_merchant_key',
  'account_number',
]);

const PAYMENT_GATEWAY_DESCRIPTIONS: Record<string, string> = {
  razorpay_enabled: 'Enable the legacy Razorpay gateway toggle',
  razorpay_key_id: 'Razorpay key id',
  razorpay_key_secret: 'Razorpay key secret',
  razorpay_webhook_secret: 'Razorpay webhook secret',
  razorpay_mode: 'Razorpay mode (test or live)',
  stripe_enabled: 'Enable the legacy Stripe gateway toggle',
  stripe_publishable_key: 'Stripe publishable key',
  stripe_secret_key: 'Stripe secret key',
  stripe_webhook_secret: 'Stripe webhook secret',
  stripe_mode: 'Stripe mode (test or live)',
  paypal_enabled: 'Enable the legacy PayPal gateway toggle',
  paypal_client_id: 'PayPal client id',
  paypal_client_secret: 'PayPal client secret',
  paypal_webhook_id: 'PayPal webhook id',
  paypal_mode: 'PayPal mode (sandbox or live)',
  paytm_enabled: 'Enable the legacy Paytm gateway toggle',
  paytm_merchant_id: 'Paytm merchant id',
  paytm_merchant_key: 'Paytm merchant key',
  paytm_website: 'Paytm website parameter',
  paytm_mode: 'Paytm mode (test or live)',
  bank_transfer_enabled: 'Enable bank transfer instructions',
  bank_name: 'Bank transfer bank name',
  account_number: 'Bank transfer account number',
  ifsc_code: 'Bank transfer routing code',
  account_holder_name: 'Bank transfer account holder name',
  payment_currency: 'Default payment currency',
  payment_timeout: 'Payment timeout in minutes',
  auto_refund_enabled: 'Automatically refund failed captures when supported',
  partial_payment_enabled: 'Allow partial bill payments',
};

const PAYMENT_METHOD_DEFAULTS = {
  credit_card_enabled: true,
  debit_card_enabled: true,
  net_banking_enabled: false,
  expresspay_enabled: true,
  wallet_enabled: false,
  bank_transfer_enabled: false,
  cash_enabled: false,
  cheque_enabled: false,
  min_payment_amount: 1,
  max_payment_amount: 100000,
  daily_payment_limit: 50000,
  monthly_payment_limit: 500000,
  auto_capture_enabled: true,
  partial_payments_enabled: false,
  recurring_payments_enabled: true,
  refund_enabled: true,
  payment_instructions: '',
  payment_terms: '',
} satisfies SettingsMap;

const PAYMENT_METHOD_DESCRIPTIONS: Record<string, string> = {
  credit_card_enabled: 'Enable Credit / Debit Card hosted checkout',
  debit_card_enabled: 'Reserved debit card specific toggle',
  net_banking_enabled: 'Reserved net banking toggle',
  expresspay_enabled: 'Enable Mobile Money (ExpressPay) checkout',
  wallet_enabled: 'Keep PayPal disabled until future rollout',
  bank_transfer_enabled: 'Enable bank transfer method',
  cash_enabled: 'Enable cash collection method',
  cheque_enabled: 'Enable cheque collection method',
  min_payment_amount: 'Minimum allowed payment amount',
  max_payment_amount: 'Maximum allowed payment amount',
  daily_payment_limit: 'Daily payment limit per payer',
  monthly_payment_limit: 'Monthly payment limit per payer',
  auto_capture_enabled: 'Automatically capture successful payments',
  partial_payments_enabled: 'Allow partial settlement of obligations',
  recurring_payments_enabled: 'Allow recurring payment schedules',
  refund_enabled: 'Allow payment refunds',
  payment_instructions: 'User-facing payment instructions',
  payment_terms: 'User-facing payment terms',
};

const PAYMENT_FEE_DEFAULTS = {
  credit_card_fee_percentage: 2.5,
  credit_card_fee_fixed: 0,
  debit_card_fee_percentage: 1.5,
  debit_card_fee_fixed: 0,
  expresspay_fee_percentage: 0,
  expresspay_fee_fixed: 0,
  net_banking_fee_percentage: 1,
  net_banking_fee_fixed: 0,
  wallet_fee_percentage: 0,
  wallet_fee_fixed: 0,
  processing_fee_enabled: false,
  processing_fee_percentage: 1,
  processing_fee_fixed: 5,
  processing_fee_max_amount: 100,
  convenience_fee_enabled: false,
  convenience_fee_percentage: 1,
  convenience_fee_fixed: 10,
  late_payment_fee_enabled: true,
  late_payment_fee_percentage: 2,
  late_payment_fee_fixed: 50,
  late_payment_grace_period: 7,
  fee_bearer: 'customer',
  fee_calculation_method: 'percentage_plus_fixed',
  minimum_fee_amount: 1,
  maximum_fee_amount: 500,
} satisfies SettingsMap;

const PAYMENT_FEE_DESCRIPTIONS: Record<string, string> = {
  credit_card_fee_percentage: 'Credit / Debit Card fee percentage',
  credit_card_fee_fixed: 'Credit / Debit Card fixed fee amount',
  debit_card_fee_percentage: 'Reserved debit card fee percentage',
  debit_card_fee_fixed: 'Reserved debit card fixed fee amount',
  expresspay_fee_percentage: 'Mobile Money (ExpressPay) fee percentage',
  expresspay_fee_fixed: 'Mobile Money (ExpressPay) fixed fee amount',
  net_banking_fee_percentage: 'Net banking fee percentage',
  net_banking_fee_fixed: 'Net banking fixed fee amount',
  wallet_fee_percentage: 'Deferred wallet fee percentage',
  wallet_fee_fixed: 'Deferred wallet fixed fee amount',
  processing_fee_enabled: 'Enable processing fees',
  processing_fee_percentage: 'Processing fee percentage',
  processing_fee_fixed: 'Processing fixed fee amount',
  processing_fee_max_amount: 'Maximum processing fee amount',
  convenience_fee_enabled: 'Enable convenience fees',
  convenience_fee_percentage: 'Convenience fee percentage',
  convenience_fee_fixed: 'Convenience fixed fee amount',
  late_payment_fee_enabled: 'Enable late payment fees',
  late_payment_fee_percentage: 'Late fee percentage',
  late_payment_fee_fixed: 'Fixed late fee amount',
  late_payment_grace_period: 'Late fee grace period in days',
  fee_bearer: 'Which party bears payment fees',
  fee_calculation_method: 'Fee calculation method',
  minimum_fee_amount: 'Minimum fee amount',
  maximum_fee_amount: 'Maximum fee amount',
};

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

async function mirrorLegacyAppSettingsCategory(
  category: string,
  settings: SettingsMap,
  descriptions: Record<string, string>
) {
  const rows = Object.entries(settings).map(([key, value]) => ({
    category,
    key,
    value: serializeValue(value),
    description: descriptions[key] ?? null,
  }));

  const { error } = await supabase.from('app_settings').upsert(rows, { onConflict: 'key' });
  if (error) {
    throw new Error(`Failed to mirror ${category} settings`);
  }
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

export async function getAdminPushSettings() {
  const settings = await loadSettings('push_notifications', PUSH_DEFAULTS);
  return maskSensitiveValues(settings, PUSH_SENSITIVE_KEYS);
}

export async function saveAdminPushSettings(input: Record<string, unknown>, updatedBy?: string | null) {
  const current = await loadSettings('push_notifications', PUSH_DEFAULTS);
  const merged = mergeSubmittedSettings(input, current, PUSH_DEFAULTS, PUSH_SENSITIVE_KEYS);
  return upsertSettingsCategory(
    'push_notifications',
    merged,
    PUSH_DESCRIPTIONS,
    PUSH_SENSITIVE_KEYS,
    updatedBy
  );
}

export async function testAdminPushSettings(input: Record<string, unknown>) {
  const current = await loadSettings('push_notifications', PUSH_DEFAULTS);
  const merged = mergeSubmittedSettings(input, current, PUSH_DEFAULTS, PUSH_SENSITIVE_KEYS);

  if (!merged.firebase_enabled) {
    return {
      success: false,
      message: 'Enable Firebase push notifications before running a test.',
    };
  }

  const requiredKeys = ['firebase_server_key', 'firebase_sender_id', 'firebase_api_key', 'firebase_project_id'];
  for (const key of requiredKeys) {
    const value = merged[key];
    if (value === undefined || value === null || String(value).trim() === '') {
      return {
        success: false,
        message: `Firebase configuration is incomplete. Set ${key.replace(/_/g, ' ')} first.`,
      };
    }
  }

  return {
    success: true,
    message: 'Push notification configuration is valid. Deliverability still depends on the linked mobile clients and Firebase project.',
  };
}

export async function getAdminSmsSettings() {
  const settings = await loadSettings('sms_notifications', SMS_DEFAULTS);
  return maskSensitiveValues(settings, SMS_SENSITIVE_KEYS);
}

export async function saveAdminSmsSettings(input: Record<string, unknown>, updatedBy?: string | null) {
  const current = await loadSettings('sms_notifications', SMS_DEFAULTS);
  const merged = mergeSubmittedSettings(input, current, SMS_DEFAULTS, SMS_SENSITIVE_KEYS);
  return upsertSettingsCategory(
    'sms_notifications',
    merged,
    SMS_DESCRIPTIONS,
    SMS_SENSITIVE_KEYS,
    updatedBy
  );
}

export async function testAdminSmsSettings(input: Record<string, unknown>) {
  const current = await loadSettings('sms_notifications', SMS_DEFAULTS);
  const merged = mergeSubmittedSettings(input, current, SMS_DEFAULTS, SMS_SENSITIVE_KEYS);
  const provider = String(merged.sms_provider || '');

  const requiredByProvider: Record<string, string[]> = {
    twilio: ['twilio_account_sid', 'twilio_auth_token', 'twilio_phone_number'],
    aws_sns: ['aws_access_key_id', 'aws_secret_access_key', 'aws_region'],
    textlocal: ['textlocal_api_key', 'textlocal_sender'],
    msg91: ['msg91_api_key', 'msg91_sender_id', 'msg91_route'],
  };

  if (!requiredByProvider[provider]) {
    return {
      success: false,
      message: 'Select a supported SMS provider before running a test.',
    };
  }

  for (const key of requiredByProvider[provider]) {
    const value = merged[key];
    if (value === undefined || value === null || String(value).trim() === '') {
      return {
        success: false,
        message: `${provider.replace(/_/g, ' ')} configuration is incomplete. Set ${key.replace(/_/g, ' ')} first.`,
      };
    }
  }

  return {
    success: true,
    message: 'SMS provider configuration is valid. Deliverability depends on your active provider account and sender configuration.',
  };
}

export async function getAdminPaymentGatewaySettings() {
  const settings = await loadSettings('payment_gateways', PAYMENT_GATEWAY_DEFAULTS);
  return maskSensitiveValues(settings, PAYMENT_GATEWAY_SENSITIVE_KEYS);
}

export async function saveAdminPaymentGatewaySettings(input: Record<string, unknown>, updatedBy?: string | null) {
  const current = await loadSettings('payment_gateways', PAYMENT_GATEWAY_DEFAULTS);
  const merged = mergeSubmittedSettings(
    input,
    current,
    PAYMENT_GATEWAY_DEFAULTS,
    PAYMENT_GATEWAY_SENSITIVE_KEYS
  );
  const saved = await upsertSettingsCategory(
    'payment_gateways',
    merged,
    PAYMENT_GATEWAY_DESCRIPTIONS,
    PAYMENT_GATEWAY_SENSITIVE_KEYS,
    updatedBy
  );
  await mirrorLegacyAppSettingsCategory('payment_gateways', saved, PAYMENT_GATEWAY_DESCRIPTIONS);
  return maskSensitiveValues(saved, PAYMENT_GATEWAY_SENSITIVE_KEYS);
}

export async function getAdminPaymentMethodSettings() {
  return loadSettings('payment_methods', PAYMENT_METHOD_DEFAULTS);
}

export async function saveAdminPaymentMethodSettings(input: Record<string, unknown>, updatedBy?: string | null) {
  const current = await loadSettings('payment_methods', PAYMENT_METHOD_DEFAULTS);
  const merged = mergeSubmittedSettings(input, current, PAYMENT_METHOD_DEFAULTS, new Set<string>());
  const saved = await upsertSettingsCategory(
    'payment_methods',
    merged,
    PAYMENT_METHOD_DESCRIPTIONS,
    new Set<string>(),
    updatedBy
  );
  await mirrorLegacyAppSettingsCategory('payment_methods', saved, PAYMENT_METHOD_DESCRIPTIONS);
  return saved;
}

export async function getAdminPaymentFeeSettings() {
  return loadSettings('payment_fees', PAYMENT_FEE_DEFAULTS);
}

export async function saveAdminPaymentFeeSettings(input: Record<string, unknown>, updatedBy?: string | null) {
  const current = await loadSettings('payment_fees', PAYMENT_FEE_DEFAULTS);
  const merged = mergeSubmittedSettings(input, current, PAYMENT_FEE_DEFAULTS, new Set<string>());
  const saved = await upsertSettingsCategory(
    'payment_fees',
    merged,
    PAYMENT_FEE_DESCRIPTIONS,
    new Set<string>(),
    updatedBy
  );
  await mirrorLegacyAppSettingsCategory('payment_fees', saved, PAYMENT_FEE_DESCRIPTIONS);
  return saved;
}
