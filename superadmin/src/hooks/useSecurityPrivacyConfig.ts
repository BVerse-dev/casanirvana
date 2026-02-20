import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

export interface SecurityPrivacyConfigData {
  // Legal & Compliance URLs (4 fields)
  terms_url: string;
  privacy_url: string;
  refund_policy_url?: string;
  data_retention_policy_url?: string;
  
  // Password Policy (5 fields)
  password_min_length: number;
  password_require_uppercase: boolean;
  password_require_lowercase: boolean;
  password_require_numbers: boolean;
  password_require_symbols: boolean;
  
  // Account Security (3 fields)
  login_attempt_limit: number;
  account_lockout_duration_minutes: number;
  two_factor_auth_enabled: boolean;
  
  // Data Protection (3 fields)
  data_encryption_enabled: boolean;
  gdpr_compliance_enabled: boolean;
  data_retention_days: number;
}

// Helper function to parse string values to appropriate types
const parseValue = (key: string, value: string): any => {
  // Boolean fields
  if ([
    'password_require_uppercase', 'password_require_lowercase', 'password_require_numbers', 
    'password_require_symbols', 'two_factor_auth_enabled', 'data_encryption_enabled', 
    'gdpr_compliance_enabled'
  ].includes(key)) {
    return value === 'true';
  }
  
  // Number fields
  if ([
    'password_min_length', 'login_attempt_limit', 'account_lockout_duration_minutes', 
    'data_retention_days'
  ].includes(key)) {
    return parseInt(value, 10);
  }
  
  // String fields (URLs and text)
  return value;
};

// Helper function to convert typed values back to strings for storage
const stringifyValue = (value: any): string => {
  if (typeof value === 'boolean') {
    return value.toString();
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  return value || '';
};

export const useSecurityPrivacyConfig = () => {
  const queryClient = useQueryClient();

  const { data: configData, isLoading, error } = useQuery({
    queryKey: ['security-privacy-config'],
    queryFn: async (): Promise<SecurityPrivacyConfigData> => {
      const { data: settings, error } = await supabase
        .from('app_settings')
        .select('key, value')
        .eq('category', 'security_privacy');

      if (error) {
        console.error('Error fetching security privacy config:', error);
        throw new Error(`Failed to fetch security privacy configuration: ${error.message}`);
      }

      if (!settings || settings.length === 0) {
        throw new Error('No security privacy configuration found');
      }

      // Convert array of settings to typed object
      const configObject: any = {};
      settings.forEach((setting: { key: string; value: string }) => {
        configObject[setting.key] = parseValue(setting.key, setting.value);
      });

      // Ensure all required fields are present with defaults
      return {
        // Legal & Compliance URLs
        terms_url: configObject.terms_url || 'https://casanirvana.com/terms',
        privacy_url: configObject.privacy_url || 'https://casanirvana.com/privacy',
        refund_policy_url: configObject.refund_policy_url || '',
        data_retention_policy_url: configObject.data_retention_policy_url || '',
        
        // Password Policy
        password_min_length: configObject.password_min_length || 8,
        password_require_uppercase: configObject.password_require_uppercase ?? true,
        password_require_lowercase: configObject.password_require_lowercase ?? true,
        password_require_numbers: configObject.password_require_numbers ?? true,
        password_require_symbols: configObject.password_require_symbols ?? false,
        
        // Account Security
        login_attempt_limit: configObject.login_attempt_limit || 5,
        account_lockout_duration_minutes: configObject.account_lockout_duration_minutes || 30,
        two_factor_auth_enabled: configObject.two_factor_auth_enabled ?? true,
        
        // Data Protection
        data_encryption_enabled: configObject.data_encryption_enabled ?? true,
        gdpr_compliance_enabled: configObject.gdpr_compliance_enabled ?? true,
        data_retention_days: configObject.data_retention_days || 1095,
      } as SecurityPrivacyConfigData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (newConfig: SecurityPrivacyConfigData) => {
      // Prepare updates for each setting
      const updates = Object.entries(newConfig).map(([key, value]) => ({
        key,
        value: stringifyValue(value),
        category: 'security_privacy',
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
          .eq('category', 'security_privacy');

        if (error) {
          console.error(`Error updating setting ${update.key}:`, error);
          throw new Error(`Failed to update ${update.key}: ${error.message}`);
        }
      }

      return newConfig;
    },
    onSuccess: (data) => {
      // Invalidate and refetch the config data
      queryClient.invalidateQueries({ queryKey: ['security-privacy-config'] });
      toast.success('Security & Privacy configuration updated successfully!');
    },
    onError: (error: any) => {
      console.error('Error updating security privacy config:', error);
      toast.error(`Failed to update configuration: ${error.message}`);
    },
  });

  return {
    data: configData,
    isLoading,
    error,
    updateConfig: updateConfigMutation.mutate,
    isUpdating: updateConfigMutation.isPending,
  };
};
