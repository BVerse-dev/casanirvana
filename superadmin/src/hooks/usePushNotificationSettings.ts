'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdminApi } from './useAdminApi';

export interface PushNotificationSettings {
  firebase_enabled: boolean;
  firebase_server_key: string;
  firebase_sender_id: string;
  firebase_api_key: string;
  firebase_project_id: string;
  push_maintenance_requests: boolean;
  push_payment_reminders: boolean;
  push_visitor_approvals: boolean;
  push_emergency_alerts: boolean;
  push_community_announcements: boolean;
  push_complaint_updates: boolean;
  push_amenity_bookings: boolean;
  push_service_updates: boolean;
  admin_push_new_users: boolean;
  admin_push_new_complaints: boolean;
  admin_push_maintenance_requests: boolean;
  admin_push_payment_received: boolean;
  admin_push_emergency_alerts: boolean;
  push_sound_enabled: boolean;
  push_vibration_enabled: boolean;
  push_badge_enabled: boolean;
  push_quiet_hours_enabled: boolean;
  push_quiet_start_time: string;
  push_quiet_end_time: string;
  default_push_title: string;
  default_push_message: string;
  push_click_action: string;
}

const DEFAULT_PUSH_NOTIFICATION_SETTINGS: PushNotificationSettings = {
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
};

function usePushNotificationSettings() {
  const queryClient = useQueryClient();
  const { fetchAdmin, hasToken } = useAdminApi();

  const { data: pushNotificationSettings, isLoading: isLoadingData, error: loadError } = useQuery({
    queryKey: ['pushNotificationSettings'],
    queryFn: async (): Promise<PushNotificationSettings> => {
      const response = await fetchAdmin<{ settings?: Partial<PushNotificationSettings> }>('/admin/settings/push');
      return {
        ...DEFAULT_PUSH_NOTIFICATION_SETTINGS,
        ...(response.settings || {}),
      };
    },
    staleTime: 5 * 60 * 1000,
    enabled: hasToken,
  });

  const updateMutation = useMutation({
    mutationFn: async (settings: Partial<PushNotificationSettings>) => {
      const response = await fetchAdmin<{ settings?: Partial<PushNotificationSettings> }>('/admin/settings/push', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      return response.settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pushNotificationSettings'] });
    },
  });

  const testMutation = useMutation({
    mutationFn: async (settings: Partial<PushNotificationSettings>) =>
      fetchAdmin<{ success: boolean; message: string }>('/admin/settings/push/test', {
        method: 'POST',
        body: JSON.stringify(settings),
      }),
  });

  return {
    pushNotificationSettings,
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

export default usePushNotificationSettings;
