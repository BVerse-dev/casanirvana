'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAdminApi } from './useAdminApi';

export interface SecurityPrivacyConfigData {
  terms_url: string;
  privacy_url: string;
  refund_policy_url?: string;
  data_retention_policy_url?: string;
  password_min_length: number;
  password_require_uppercase: boolean;
  password_require_lowercase: boolean;
  password_require_numbers: boolean;
  password_require_symbols: boolean;
  login_attempt_limit: number;
  account_lockout_duration_minutes: number;
  two_factor_auth_enabled: boolean;
  data_encryption_enabled: boolean;
  gdpr_compliance_enabled: boolean;
  data_retention_days: number;
}

const DEFAULT_SECURITY_PRIVACY_CONFIG: SecurityPrivacyConfigData = {
  terms_url: 'https://casanirvana.com/terms',
  privacy_url: 'https://casanirvana.com/privacy',
  refund_policy_url: '',
  data_retention_policy_url: '',
  password_min_length: 8,
  password_require_uppercase: true,
  password_require_lowercase: true,
  password_require_numbers: true,
  password_require_symbols: false,
  login_attempt_limit: 5,
  account_lockout_duration_minutes: 30,
  two_factor_auth_enabled: true,
  data_encryption_enabled: true,
  gdpr_compliance_enabled: true,
  data_retention_days: 1095,
};

const QUERY_KEY = ['security-privacy-config'] as const;

export const useSecurityPrivacyConfig = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin, hasToken } = useAdminApi();

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<SecurityPrivacyConfigData> => {
      const response = await fetchAdmin<{ settings?: Partial<SecurityPrivacyConfigData> }>('/admin/settings/security-privacy');
      return {
        ...DEFAULT_SECURITY_PRIVACY_CONFIG,
        ...(response.settings || {}),
      };
    },
    staleTime: 5 * 60 * 1000,
    enabled: hasToken,
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (newConfig: SecurityPrivacyConfigData) => {
      const response = await fetchAdmin<{ settings?: Partial<SecurityPrivacyConfigData> }>('/admin/settings/security-privacy', {
        method: 'PUT',
        body: JSON.stringify(newConfig),
      });
      return response.settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Security & Privacy configuration updated successfully!');
    },
    onError: (error: any) => {
      console.error('Error updating security privacy config:', error);
      toast.error(`Failed to update configuration: ${error.message}`);
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updateConfig: updateConfigMutation.mutate,
    isUpdating: updateConfigMutation.isPending,
  };
};
