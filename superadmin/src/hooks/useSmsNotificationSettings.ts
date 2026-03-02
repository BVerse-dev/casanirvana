'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdminApi } from './useAdminApi';

export interface SmsNotificationSettings {
  sms_provider: string;
  twilio_account_sid: string;
  twilio_auth_token: string;
  twilio_phone_number: string;
  aws_access_key_id: string;
  aws_secret_access_key: string;
  aws_region: string;
  textlocal_api_key: string;
  textlocal_sender: string;
  msg91_api_key: string;
  msg91_sender_id: string;
  msg91_route: string;
  default_country_code: string;
  rate_limit_per_minute: number;
  sms_timeout: number;
  enable_delivery_reports: boolean;
  test_mode: boolean;
  enable_otp_sms: boolean;
  enable_alert_sms: boolean;
  enable_reminder_sms: boolean;
  enable_emergency_sms: boolean;
}

const DEFAULT_SMS_NOTIFICATION_SETTINGS: SmsNotificationSettings = {
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
};

function useSmsNotificationSettings() {
  const queryClient = useQueryClient();
  const { fetchAdmin, hasToken } = useAdminApi();

  const { data: smsNotificationSettings, isLoading: isLoadingData, error: loadError } = useQuery({
    queryKey: ['smsNotificationSettings'],
    queryFn: async (): Promise<SmsNotificationSettings> => {
      const response = await fetchAdmin<{ settings?: Partial<SmsNotificationSettings> }>('/admin/settings/sms');
      return {
        ...DEFAULT_SMS_NOTIFICATION_SETTINGS,
        ...(response.settings || {}),
      };
    },
    staleTime: 5 * 60 * 1000,
    enabled: hasToken,
  });

  const updateMutation = useMutation({
    mutationFn: async (settings: Partial<SmsNotificationSettings>) => {
      const response = await fetchAdmin<{ settings?: Partial<SmsNotificationSettings> }>('/admin/settings/sms', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      return response.settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smsNotificationSettings'] });
    },
  });

  const testMutation = useMutation({
    mutationFn: async (settings: Partial<SmsNotificationSettings>) =>
      fetchAdmin<{ success: boolean; message: string }>('/admin/settings/sms/test', {
        method: 'POST',
        body: JSON.stringify(settings),
      }),
  });

  return {
    smsNotificationSettings,
    isLoadingData,
    isUpdating: updateMutation.isPending,
    isTesting: testMutation.isPending,
    loadError,
    updateError: updateMutation.error,
    testError: testMutation.error,
    updateSuccess: updateMutation.isSuccess,
    testResult: testMutation.data,
    updateSettings: updateMutation.mutate,
    updateSettingsAsync: updateMutation.mutateAsync,
    testSettings: testMutation.mutate,
    testSettingsAsync: testMutation.mutateAsync,
  };
}

export default useSmsNotificationSettings;
