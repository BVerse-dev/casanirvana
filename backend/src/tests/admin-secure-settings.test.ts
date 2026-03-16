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
  testAdminIntegrationSetting,
  testAdminPaymentGatewaySettings,
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
});
