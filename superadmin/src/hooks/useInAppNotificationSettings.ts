'use client';

import { useSettingsCategory } from './useSettingsCategory';

export interface InAppNotificationSettings {
  notifications_enabled: boolean;
  sound_enabled: boolean;
  vibration_enabled: boolean;
  badge_count_enabled: boolean;
  preview_enabled: boolean;
  group_notifications: boolean;
  auto_dismiss_enabled: boolean;
  auto_dismiss_duration: number;
  notification_position: string;
  animation_type: string;
  theme_mode: string;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  quiet_hours_weekends_only: boolean;
  priority_high_enabled: boolean;
  priority_medium_enabled: boolean;
  priority_low_enabled: boolean;
  priority_urgent_bypass_quiet: boolean;
  maintenance_notifications: boolean;
  payment_notifications: boolean;
  community_announcements: boolean;
  event_notifications: boolean;
  security_alerts: boolean;
  amenity_bookings: boolean;
  visitor_notifications: boolean;
  complaint_updates: boolean;
  billing_reminders: boolean;
  emergency_alerts: boolean;
  max_notifications_per_hour: number;
  retry_failed_notifications: boolean;
  notification_timeout: number;
  batch_notifications: boolean;
  user_can_disable_categories: boolean;
  user_can_set_quiet_hours: boolean;
  user_can_choose_priority: boolean;
  user_can_customize_sounds: boolean;
  rich_notifications: boolean;
  action_buttons_enabled: boolean;
  inline_replies_enabled: boolean;
  notification_history_days: number;
}

const defaultInAppNotificationSettings: InAppNotificationSettings = {
  notifications_enabled: true,
  sound_enabled: true,
  vibration_enabled: true,
  badge_count_enabled: true,
  preview_enabled: true,
  group_notifications: true,
  auto_dismiss_enabled: false,
  auto_dismiss_duration: 5000,
  notification_position: 'top',
  animation_type: 'slide',
  theme_mode: 'auto',
  quiet_hours_enabled: false,
  quiet_hours_start: '22:00',
  quiet_hours_end: '07:00',
  quiet_hours_weekends_only: false,
  priority_high_enabled: true,
  priority_medium_enabled: true,
  priority_low_enabled: true,
  priority_urgent_bypass_quiet: true,
  maintenance_notifications: true,
  payment_notifications: true,
  community_announcements: true,
  event_notifications: true,
  security_alerts: true,
  amenity_bookings: true,
  visitor_notifications: true,
  complaint_updates: true,
  billing_reminders: true,
  emergency_alerts: true,
  max_notifications_per_hour: 20,
  retry_failed_notifications: true,
  notification_timeout: 30,
  batch_notifications: false,
  user_can_disable_categories: true,
  user_can_set_quiet_hours: true,
  user_can_choose_priority: false,
  user_can_customize_sounds: true,
  rich_notifications: true,
  action_buttons_enabled: true,
  inline_replies_enabled: false,
  notification_history_days: 30,
};

const inAppNotificationDescriptions: Record<string, string> = {
  notifications_enabled: 'Enable in-app notifications across the platform.',
  sound_enabled: 'Play sounds for in-app notifications.',
  vibration_enabled: 'Enable device vibration when supported.',
  badge_count_enabled: 'Show unread badge counts in the app interface.',
  preview_enabled: 'Show preview text in in-app notification banners.',
  group_notifications: 'Group related in-app notifications.',
  auto_dismiss_enabled: 'Automatically dismiss in-app notifications after a delay.',
  auto_dismiss_duration: 'Auto dismiss duration in milliseconds.',
  notification_position: 'Display position for in-app notifications.',
  animation_type: 'Animation used when showing notifications.',
  theme_mode: 'Theme mode used for in-app notifications.',
  quiet_hours_enabled: 'Suppress non-urgent in-app notifications during quiet hours.',
  quiet_hours_start: 'Quiet hours start time.',
  quiet_hours_end: 'Quiet hours end time.',
  quiet_hours_weekends_only: 'Apply quiet hours on weekends only.',
  priority_high_enabled: 'Allow high priority in-app notifications.',
  priority_medium_enabled: 'Allow medium priority in-app notifications.',
  priority_low_enabled: 'Allow low priority in-app notifications.',
  priority_urgent_bypass_quiet: 'Allow urgent notifications to bypass quiet hours.',
  maintenance_notifications: 'Enable maintenance-related in-app notifications.',
  payment_notifications: 'Enable payment-related in-app notifications.',
  community_announcements: 'Enable community announcement notifications.',
  event_notifications: 'Enable community event notifications.',
  security_alerts: 'Enable security alert notifications.',
  amenity_bookings: 'Enable amenity booking notifications.',
  visitor_notifications: 'Enable visitor-related notifications.',
  complaint_updates: 'Enable complaint update notifications.',
  billing_reminders: 'Enable billing reminder notifications.',
  emergency_alerts: 'Enable emergency alert notifications.',
  max_notifications_per_hour: 'Maximum number of in-app notifications per hour.',
  retry_failed_notifications: 'Retry failed in-app notifications automatically.',
  notification_timeout: 'Notification request timeout in seconds.',
  batch_notifications: 'Batch non-urgent notifications for delivery.',
  user_can_disable_categories: 'Allow users to disable notification categories.',
  user_can_set_quiet_hours: 'Allow users to manage their own quiet hours.',
  user_can_choose_priority: 'Allow users to manage notification priorities.',
  user_can_customize_sounds: 'Allow users to customize notification sounds.',
  rich_notifications: 'Enable rich content in in-app notifications.',
  action_buttons_enabled: 'Allow action buttons in notifications.',
  inline_replies_enabled: 'Allow inline replies where supported.',
  notification_history_days: 'Number of days to retain notification history.',
};

const useInAppNotificationSettings = () => {
  const {
    data,
    isLoading,
    error,
    saveSettings,
    saveSettingsAsync,
    isSaving,
    saveError,
    saveSuccess,
  } = useSettingsCategory<InAppNotificationSettings>({
    queryKey: ['inAppNotificationSettings'],
    category: 'notifications',
    subcategory: 'in_app',
    defaults: defaultInAppNotificationSettings,
    descriptions: inAppNotificationDescriptions,
  });

  return {
    inappSettings: data,
    isLoadingData: isLoading,
    loadError: error,
    updateSettings: saveSettings,
    updateSettingsAsync: saveSettingsAsync,
    isUpdating: isSaving,
    updateError: saveError,
    updateSuccess: saveSuccess,
  };
};

export default useInAppNotificationSettings;
