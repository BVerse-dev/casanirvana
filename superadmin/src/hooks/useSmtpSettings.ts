'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdminApi } from './useAdminApi';

export interface SmtpSettings {
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  smtp_encryption: string;
  smtp_from_email: string;
  smtp_from_name: string;
  smtp_timeout: number;
  smtp_enable_ssl: boolean;
  smtp_enable_tls: boolean;
  smtp_test_mode: boolean;
}

const DEFAULT_SMTP_SETTINGS: SmtpSettings = {
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
};

export function useSmtpSettings() {
  const queryClient = useQueryClient();
  const { fetchAdmin, hasToken } = useAdminApi();

  const {
    data: smtpSettings,
    isLoading: isLoadingData,
    error: loadError,
  } = useQuery({
    queryKey: ['smtpSettings'],
    queryFn: async (): Promise<SmtpSettings> => {
      const response = await fetchAdmin<{ settings?: Partial<SmtpSettings> }>('/admin/settings/smtp');
      return {
        ...DEFAULT_SMTP_SETTINGS,
        ...(response.settings || {}),
      };
    },
    staleTime: 5 * 60 * 1000,
    enabled: hasToken,
  });

  const {
    mutate: updateSettings,
    mutateAsync: updateSettingsAsync,
    isPending: isUpdating,
    error: updateError,
    isSuccess: updateSuccess,
  } = useMutation({
    mutationFn: async (settings: Partial<SmtpSettings>) => {
      const response = await fetchAdmin<{ settings?: Partial<SmtpSettings> }>('/admin/settings/smtp', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      return response.settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smtpSettings'] });
    },
  });

  const {
    mutate: testConnection,
    mutateAsync: testConnectionAsync,
    isPending: isTesting,
    error: testError,
    data: testResult,
  } = useMutation({
    mutationFn: async (settings: Partial<SmtpSettings>) => {
      return fetchAdmin<{ success: boolean; message: string }>('/admin/settings/smtp/test', {
        method: 'POST',
        body: JSON.stringify(settings),
      });
    },
  });

  return {
    smtpSettings,
    isLoadingData,
    isUpdating,
    isTesting,
    loadError,
    updateError,
    testError,
    updateSuccess,
    testResult,
    updateSettings,
    updateSettingsAsync,
    testConnection,
    testConnectionAsync,
  };
}

export default useSmtpSettings;
