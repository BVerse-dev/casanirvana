import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

export interface IntegrationSettingsData {
  // AI Services (7 fields)
  openai_api_key: string;
  openai_organization_id: string;
  anthropic_api_key: string;
  google_ai_api_key: string;
  azure_openai_endpoint: string;
  azure_openai_key: string;
  huggingface_api_key: string;
  
  // Communication Services (7 fields)
  sms_provider: string;
  sms_api_key: string;
  email_provider: string;
  email_api_key: string;
  whatsapp_business_api_key: string;
  telegram_bot_token: string;
  slack_webhook_url: string;
  
  // Payment Gateways (6 fields)
  razorpay_key_id: string;
  razorpay_key_secret: string;
  stripe_public_key: string;
  stripe_secret_key: string;
  paypal_client_id: string;
  paypal_client_secret: string;
  
  // Cloud Storage (6 fields)
  aws_access_key: string;
  aws_secret_key: string;
  aws_region: string;
  aws_bucket_name: string;
  google_cloud_key: string;
  azure_storage_key: string;
  
  // Other Services (4 fields)
  firebase_config: string;
  pusher_app_id: string;
  pusher_key: string;
  pusher_secret: string;
  
  // AI Feature Toggles (6 fields)
  ai_chat_enabled: boolean;
  ai_maintenance_predictions: boolean;
  ai_document_processing: boolean;
  smart_notifications: boolean;
  automated_billing: boolean;
  real_time_analytics: boolean;
}

// Helper function to parse string values to appropriate types
const parseValue = (key: string, value: string): any => {
  // Boolean fields (feature toggles)
  if ([
    'ai_chat_enabled', 'ai_maintenance_predictions', 'ai_document_processing',
    'smart_notifications', 'automated_billing', 'real_time_analytics'
  ].includes(key)) {
    return value === 'true';
  }
  
  // All other fields are strings (API keys, URLs, etc.)
  return value || '';
};

// Helper function to convert typed values back to strings for storage
const stringifyValue = (value: any): string => {
  if (typeof value === 'boolean') {
    return value.toString();
  }
  return value || '';
};

export const useIntegrationSettings = () => {
  const queryClient = useQueryClient();

  const { data: configData, isLoading, error } = useQuery({
    queryKey: ['integration-settings'],
    queryFn: async (): Promise<IntegrationSettingsData> => {
      const { data: settings, error } = await supabase
        .from('app_settings')
        .select('key, value')
        .eq('category', 'integrations');

      if (error) {
        console.error('Error fetching integration settings:', error);
        throw new Error(`Failed to fetch integration settings: ${error.message}`);
      }

      if (!settings || settings.length === 0) {
        throw new Error('No integration settings found');
      }

      // Convert array of settings to typed object
      const configObject: any = {};
      settings.forEach((setting: { key: string; value: string }) => {
        configObject[setting.key] = parseValue(setting.key, setting.value);
      });

      // Ensure all required fields are present with defaults
      return {
        // AI Services
        openai_api_key: configObject.openai_api_key || '',
        openai_organization_id: configObject.openai_organization_id || '',
        anthropic_api_key: configObject.anthropic_api_key || '',
        google_ai_api_key: configObject.google_ai_api_key || '',
        azure_openai_endpoint: configObject.azure_openai_endpoint || '',
        azure_openai_key: configObject.azure_openai_key || '',
        huggingface_api_key: configObject.huggingface_api_key || '',
        
        // Communication Services
        sms_provider: configObject.sms_provider || 'twilio',
        sms_api_key: configObject.sms_api_key || '',
        email_provider: configObject.email_provider || 'sendgrid',
        email_api_key: configObject.email_api_key || '',
        whatsapp_business_api_key: configObject.whatsapp_business_api_key || '',
        telegram_bot_token: configObject.telegram_bot_token || '',
        slack_webhook_url: configObject.slack_webhook_url || '',
        
        // Payment Gateways
        razorpay_key_id: configObject.razorpay_key_id || '',
        razorpay_key_secret: configObject.razorpay_key_secret || '',
        stripe_public_key: configObject.stripe_public_key || '',
        stripe_secret_key: configObject.stripe_secret_key || '',
        paypal_client_id: configObject.paypal_client_id || '',
        paypal_client_secret: configObject.paypal_client_secret || '',
        
        // Cloud Storage
        aws_access_key: configObject.aws_access_key || '',
        aws_secret_key: configObject.aws_secret_key || '',
        aws_region: configObject.aws_region || 'us-east-1',
        aws_bucket_name: configObject.aws_bucket_name || '',
        google_cloud_key: configObject.google_cloud_key || '',
        azure_storage_key: configObject.azure_storage_key || '',
        
        // Other Services
        firebase_config: configObject.firebase_config || '',
        pusher_app_id: configObject.pusher_app_id || '',
        pusher_key: configObject.pusher_key || '',
        pusher_secret: configObject.pusher_secret || '',
        
        // AI Feature Toggles
        ai_chat_enabled: configObject.ai_chat_enabled ?? false,
        ai_maintenance_predictions: configObject.ai_maintenance_predictions ?? false,
        ai_document_processing: configObject.ai_document_processing ?? false,
        smart_notifications: configObject.smart_notifications ?? false,
        automated_billing: configObject.automated_billing ?? false,
        real_time_analytics: configObject.real_time_analytics ?? false,
      } as IntegrationSettingsData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (newConfig: IntegrationSettingsData) => {
      // Prepare updates for each setting
      const updates = Object.entries(newConfig).map(([key, value]) => ({
        key,
        value: stringifyValue(value),
        category: 'integrations',
      }));

      // Update each setting individually
      for (const update of updates) {
        const { error } = await supabase
          .from('app_settings')
          .update({ 
            value: update.value,
            updated_at: new Date().toISOString(),
          })
          .eq('key', update.key)
          .eq('category', 'integrations');

        if (error) {
          console.error(`Error updating setting ${update.key}:`, error);
          throw new Error(`Failed to update ${update.key}: ${error.message}`);
        }
      }

      return newConfig;
    },
    onSuccess: (data) => {
      // Invalidate and refetch the config data
      queryClient.invalidateQueries({ queryKey: ['integration-settings'] });
      toast.success('Integration settings updated successfully!');
    },
    onError: (error: any) => {
      console.error('Error updating integration settings:', error);
      toast.error(`Failed to update settings: ${error.message}`);
    },
  });

  const testIntegrationMutation = useMutation({
    mutationFn: async ({ service, apiKey }: { service: string; apiKey: string }) => {
      if (!apiKey) {
        throw new Error('API key is required for testing');
      }

      // Mock API testing - replace with actual API tests for each service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate random success/failure for demo purposes
      // In production, implement actual API testing for each service
      const isSuccess = Math.random() > 0.3;
      
      if (!isSuccess) {
        throw new Error(`Connection test failed for ${service}`);
      }
      
      return { service, status: 'success' };
    },
    onSuccess: (data) => {
      toast.success(`${data.service.replace('_', ' ')} connection successful!`);
    },
    onError: (error: any, variables) => {
      toast.error(`${variables.service.replace('_', ' ')} connection failed: ${error.message}`);
    },
  });

  return {
    data: configData,
    isLoading,
    error,
    updateConfig: updateConfigMutation.mutate,
    isUpdating: updateConfigMutation.isPending,
    testIntegration: testIntegrationMutation.mutate,
    isTesting: testIntegrationMutation.isPending,
  };
};
