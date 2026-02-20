import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// In-app notification settings interface matching database schema
export interface InAppNotificationSettings {
  // General Settings (8 fields)
  notifications_enabled: boolean;
  sound_enabled: boolean;
  vibration_enabled: boolean;
  badge_count_enabled: boolean;
  preview_enabled: boolean;
  group_notifications: boolean;
  auto_dismiss_enabled: boolean;
  auto_dismiss_duration: number;
  
  // Real-time Settings (6 fields)
  real_time_enabled: boolean;
  real_time_sound: boolean;
  real_time_vibration: boolean;
  real_time_badge: boolean;
  typing_indicators: boolean;
  read_receipts: boolean;
  
  // User Notification Types (12 fields)
  notify_maintenance_requests: boolean;
  notify_payment_reminders: boolean;
  notify_visitor_approvals: boolean;
  notify_community_announcements: boolean;
  notify_emergency_alerts: boolean;
  notify_complaint_updates: boolean;
  notify_amenity_confirmations: boolean;
  notify_service_updates: boolean;
  notify_new_messages: boolean;
  notify_group_messages: boolean;
  notify_system_updates: boolean;
  notify_security_alerts: boolean;
  
  // Admin Notification Types (8 fields)
  admin_notify_new_users: boolean;
  admin_notify_new_complaints: boolean;
  admin_notify_maintenance_requests: boolean;
  admin_notify_payment_issues: boolean;
  admin_notify_security_events: boolean;
  admin_notify_system_errors: boolean;
  admin_notify_user_feedback: boolean;
  admin_notify_critical_alerts: boolean;
  
  // Display Settings (7 fields)
  notification_position: string;
  animation_style: string;
  theme: string;
  max_notifications: number;
  notification_width: number;
  show_timestamp: boolean;
  show_avatar: boolean;
  
  // Storage & Performance (5 fields)
  max_stored_notifications: number;
  auto_cleanup_days: number;
  offline_storage_enabled: boolean;
  compression_enabled: boolean;
  lazy_loading_enabled: boolean;
  
  // User Preferences (5 fields)
  allow_user_customization: boolean;
  user_can_disable: boolean;
  user_can_set_quiet_hours: boolean;
  user_can_choose_categories: boolean;
  user_can_set_priority: boolean;
}


const useInAppNotificationSettings = () => {
  const queryClient = useQueryClient();

  // Fetch in-app notification settings
  const {
    data: inappSettings,
    isLoading: isLoadingData,
    error: loadError,
  } = useQuery({
    queryKey: ['inAppNotificationSettings'],
    queryFn: async (): Promise<InAppNotificationSettings> => {
      console.log('Fetching in-app notification settings...');

      const { data, error } = await supabase
        .from('in_app_notification_settings')
        .select('*')
        .limit(1);

      if (error) {
        console.error('Error fetching in-app notification settings:', error);
        // Don't throw error if it's just because no data exists
        if (error.code !== 'PGRST116') {
          throw new Error(`Failed to fetch in-app notification settings: ${error.message}`);
        }
      }

      console.log('Raw in-app notification settings data:', data);

      // If no data exists or empty array, return defaults
      if (!data || data.length === 0) {
        console.log('No in-app notification settings found, returning defaults');
        return {
          // General Settings
          notifications_enabled: true,
          sound_enabled: true,
          vibration_enabled: true,
          badge_count_enabled: true,
          preview_enabled: true,
          group_notifications: true,
          auto_dismiss_enabled: false,
          auto_dismiss_duration: 5000,
          
          // Real-time Settings
          real_time_enabled: true,
          real_time_sound: true,
          real_time_vibration: true,
          real_time_badge: true,
          typing_indicators: true,
          read_receipts: true,
          
          // User Notification Types
          notify_maintenance_requests: true,
          notify_payment_reminders: true,
          notify_visitor_approvals: true,
          notify_community_announcements: true,
          notify_emergency_alerts: true,
          notify_complaint_updates: true,
          notify_amenity_confirmations: true,
          notify_service_updates: true,
          notify_new_messages: true,
          notify_group_messages: true,
          notify_system_updates: false,
          notify_security_alerts: true,
          
          // Admin Notification Types
          admin_notify_new_users: true,
          admin_notify_new_complaints: true,
          admin_notify_maintenance_requests: true,
          admin_notify_payment_issues: true,
          admin_notify_security_events: true,
          admin_notify_system_errors: true,
          admin_notify_user_feedback: false,
          admin_notify_critical_alerts: true,
          
          // Display Settings
          notification_position: 'top-right',
          animation_style: 'slide',
          theme: 'light',
          max_notifications: 5,
          notification_width: 400,
          show_timestamp: true,
          show_avatar: true,
          
          // Storage & Performance
          max_stored_notifications: 100,
          auto_cleanup_days: 30,
          offline_storage_enabled: true,
          compression_enabled: false,
          lazy_loading_enabled: true,
          
          // User Preferences
          allow_user_customization: true,
          user_can_disable: true,
          user_can_set_quiet_hours: true,
          user_can_choose_categories: true,
          user_can_set_priority: false,
        } as InAppNotificationSettings;
      }

      // Return the first item from the array since we used limit(1)
      return data[0] as InAppNotificationSettings;
    },
  });

  // Update in-app notification settings
  const updateInAppSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<InAppNotificationSettings>) => {
      console.log('Updating in-app notification settings:', newSettings);

      const { error } = await supabase
        .from('in_app_notification_settings')
        .upsert({
          ...newSettings,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (error) {
        console.error('Error updating in-app notification settings:', error);
        throw new Error(`Failed to update in-app notification settings: ${error.message}`);
      }

      return newSettings;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['inAppNotificationSettings'] });
    },
    onError: (error) => {
      console.error('Error updating in-app notification settings:', error);
    },
  });

  return {
    inappSettings,
    isLoadingData,
    loadError,
    updateSettings: updateInAppSettingsMutation.mutate,
    isUpdating: updateInAppSettingsMutation.isPending,
    updateError: updateInAppSettingsMutation.error,
    updateSuccess: updateInAppSettingsMutation.isSuccess,
  };
};

export default useInAppNotificationSettings;
