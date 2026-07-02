'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAdminApi } from './useAdminApi';

export interface IntegrationSettingsData {
  openai_api_key: string;
  openai_organization_id: string;
  anthropic_api_key: string;
  google_ai_api_key: string;
  azure_openai_endpoint: string;
  azure_openai_key: string;
  huggingface_api_key: string;
  sms_provider: string;
  sms_api_key: string;
  email_provider: string;
  email_api_key: string;
  whatsapp_business_api_key: string;
  telegram_bot_token: string;
  slack_webhook_url: string;
  razorpay_key_id: string;
  razorpay_key_secret: string;
  stripe_public_key: string;
  stripe_secret_key: string;
  paypal_client_id: string;
  paypal_client_secret: string;
  aws_access_key: string;
  aws_secret_key: string;
  aws_region: string;
  aws_bucket_name: string;
  google_cloud_key: string;
  azure_storage_key: string;
  firebase_config: string;
  pusher_app_id: string;
  pusher_key: string;
  pusher_secret: string;
  ai_chat_enabled: boolean;
  ai_maintenance_predictions: boolean;
  ai_document_processing: boolean;
  smart_notifications: boolean;
  automated_billing: boolean;
  real_time_analytics: boolean;
}

const DEFAULT_INTEGRATION_SETTINGS: IntegrationSettingsData = {
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
};

export const useIntegrationSettings = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin, hasToken } = useAdminApi();

  const { data: configData, isLoading, error } = useQuery({
    queryKey: ['integration-settings'],
    queryFn: async (): Promise<IntegrationSettingsData> => {
      const response = await fetchAdmin<{ settings?: Partial<IntegrationSettingsData> }>('/admin/settings/integrations');
      return {
        ...DEFAULT_INTEGRATION_SETTINGS,
        ...(response.settings || {}),
      };
    },
    staleTime: 5 * 60 * 1000,
    enabled: hasToken,
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (newConfig: Partial<IntegrationSettingsData>) => {
      const response = await fetchAdmin<{ settings?: Partial<IntegrationSettingsData> }>('/admin/settings/integrations', {
        method: 'PUT',
        body: JSON.stringify(newConfig),
      });
      return response.settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integration-settings'] });
      toast.success('Integration settings updated successfully!');
    },
    onError: (mutationError: any) => {
      console.error('Error updating integration settings:', mutationError);
      toast.error(`Failed to update settings: ${mutationError.message}`);
    },
  });

  const testIntegrationMutation = useMutation({
    mutationFn: async ({
      service,
      value,
      settings,
    }: {
      service: string;
      value?: string;
      settings?: Partial<IntegrationSettingsData>;
    }) => {
      return fetchAdmin<{ success: boolean; message: string }>('/admin/settings/integrations/test', {
        method: 'POST',
        body: JSON.stringify({ service, value, settings }),
      });
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    },
    onError: (mutationError: any) => {
      toast.error(mutationError.message || 'Integration test failed');
    },
  });

  return {
    data: configData,
    isLoading,
    error,
    updateConfig: updateConfigMutation.mutate,
    updateConfigAsync: updateConfigMutation.mutateAsync,
    isUpdating: updateConfigMutation.isPending,
    testIntegration: testIntegrationMutation.mutate,
    testIntegrationAsync: testIntegrationMutation.mutateAsync,
    isTesting: testIntegrationMutation.isPending,
  };
};
