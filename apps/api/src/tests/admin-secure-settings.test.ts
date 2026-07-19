import { beforeEach, describe, expect, it, vi } from 'vitest';

const supabaseState = vi.hoisted(() => ({
  tables: {} as Record<string, Record<string, any>[]>,
}));

function createQueryBuilder(table: string) {
  const filters: Array<(row: Record<string, any>) => boolean> = [];

  const executeRead = () => {
    let rows = [...(supabaseState.tables[table] || [])];
    rows = rows.filter((row) => filters.every((filter) => filter(row)));
    return { data: rows, error: null };
  };

  const builder: any = {
    select() {
      return builder;
    },
    eq(column: string, value: unknown) {
      filters.push((row) => row[column] === value);
      return builder;
    },
    then(resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) {
      return Promise.resolve(executeRead()).then(resolve, reject);
    },
  };

  return builder;
}

vi.mock('../lib/supabase', () => {
  const client = {
    from: (table: string) => createQueryBuilder(table),
  };

  return {
    supabase: client,
    adminSupabase: client,
    createPublicClient: vi.fn(() => client),
    default: client,
  };
});

import {
  MASKED_SECRET_VALUE,
  getAdminPaymentFeeSettings,
  getAdminPaymentMethodSettings,
  testAdminPushSettings,
  testAdminIntegrationSetting,
  testAdminPaymentGatewaySettings,
  testAdminSmsSettings,
} from '../services/adminSecureSettings';

describe('admin secure settings', () => {
  beforeEach(() => {
    supabaseState.tables = {
      system_settings: [],
      app_settings: [],
    };
  });

  it('validates Azure OpenAI using the current stored secret plus unsaved form values', async () => {
    supabaseState.tables.system_settings = [
      {
        category: 'integrations',
        subcategory: '',
        key: 'azure_openai_key',
        value: 'stored-azure-key',
        data_type: 'string',
        is_sensitive: true,
      },
      {
        category: 'integrations',
        subcategory: '',
        key: 'azure_openai_endpoint',
        value: '',
        data_type: 'string',
        is_sensitive: false,
      },
    ];

    const result = await testAdminIntegrationSetting(
      'azure_openai_key',
      MASKED_SECRET_VALUE,
      { azure_openai_endpoint: 'https://casa-nirvana.openai.azure.com/' }
    );

    expect(result).toEqual({
      success: true,
      message: 'Azure OpenAI configuration is valid and stored securely.',
    });
  });

  it('validates an unsaved Stripe configuration payload before it is persisted', async () => {
    const result = await testAdminPaymentGatewaySettings('stripe', {
      stripe_enabled: true,
      stripe_publishable_key: 'pk_test_123',
      stripe_secret_key: 'sk_test_123',
    });

    expect(result).toEqual({
      success: true,
      message:
        'Stripe configuration is valid. Live payment processing still depends on your active provider account, webhooks, and callback handling.',
    });
  });

  it('requires fresh Firebase secrets when project identity changes during validation', async () => {
    supabaseState.tables.system_settings = [
      { category: 'push_notifications', subcategory: '', key: 'firebase_enabled', value: 'true', data_type: 'boolean' },
      { category: 'push_notifications', subcategory: '', key: 'firebase_project_id', value: 'casa-nirvana-app', data_type: 'string' },
      { category: 'push_notifications', subcategory: '', key: 'firebase_sender_id', value: '123456789012', data_type: 'string' },
      { category: 'push_notifications', subcategory: '', key: 'firebase_server_key', value: 'stored-server-key', data_type: 'string', is_sensitive: true },
      { category: 'push_notifications', subcategory: '', key: 'firebase_api_key', value: 'stored-api-key', data_type: 'string', is_sensitive: true },
    ];

    const result = await testAdminPushSettings({
      firebase_enabled: true,
      firebase_project_id: 'casa-nirvana-prod',
      firebase_sender_id: '123456789012',
      firebase_server_key: MASKED_SECRET_VALUE,
      firebase_api_key: MASKED_SECRET_VALUE,
    });

    expect(result).toEqual({
      success: false,
      message:
        'Provide both Firebase server key and Firebase API key when changing project or sender details, then test again.',
    });
  });

  it('validates SMS provider details when fresh secrets are supplied for changed identity fields', async () => {
    supabaseState.tables.system_settings = [
      { category: 'sms_notifications', subcategory: '', key: 'sms_provider', value: 'twilio', data_type: 'string' },
      { category: 'sms_notifications', subcategory: '', key: 'twilio_account_sid', value: 'AC123', data_type: 'string' },
      { category: 'sms_notifications', subcategory: '', key: 'twilio_auth_token', value: 'stored-auth-token', data_type: 'string', is_sensitive: true },
      { category: 'sms_notifications', subcategory: '', key: 'twilio_phone_number', value: '+233555123456', data_type: 'string' },
    ];

    const result = await testAdminSmsSettings({
      sms_provider: 'twilio',
      twilio_account_sid: 'AC456',
      twilio_auth_token: 'fresh-auth-token',
      twilio_phone_number: '+233555999999',
    });

    expect(result).toEqual({
      success: true,
      message: 'SMS provider configuration is valid. Deliverability depends on your active provider account and sender configuration.',
    });
  });

  it('loads payment method settings with persisted overrides merged onto defaults', async () => {
    supabaseState.tables.system_settings = [
      { category: 'payment_methods', subcategory: '', key: 'credit_card_enabled', value: 'false', data_type: 'boolean' },
      { category: 'payment_methods', subcategory: '', key: 'expresspay_enabled', value: 'true', data_type: 'boolean' },
      { category: 'payment_methods', subcategory: '', key: 'payment_terms', value: 'Due immediately.', data_type: 'string' },
    ];

    const result = await getAdminPaymentMethodSettings();

    expect(result.credit_card_enabled).toBe(false);
    expect(result.expresspay_enabled).toBe(true);
    expect(result.payment_terms).toBe('Due immediately.');
    expect(result.min_payment_amount).toBe(1);
  });

  it('loads payment fee settings with persisted overrides merged onto defaults', async () => {
    supabaseState.tables.system_settings = [
      { category: 'payment_fees', subcategory: '', key: 'expresspay_fee_percentage', value: '1.5', data_type: 'number' },
      { category: 'payment_fees', subcategory: '', key: 'late_payment_fee_enabled', value: 'false', data_type: 'boolean' },
    ];

    const result = await getAdminPaymentFeeSettings();

    expect(result.expresspay_fee_percentage).toBe(1.5);
    expect(result.late_payment_fee_enabled).toBe(false);
    expect(result.fee_bearer).toBe('customer');
  });
});
