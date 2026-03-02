'use client';

import { useSettingsCategory } from './useSettingsCategory';

export interface NotificationRulesSettings {
  enable_notification_rules: boolean;
  default_priority: string;
  max_concurrent_rules: number;
  log_rule_executions: boolean;
  enable_rule_throttling: boolean;
  default_throttle_time: number;
}

const defaultNotificationRulesSettings: NotificationRulesSettings = {
  enable_notification_rules: true,
  default_priority: 'medium',
  max_concurrent_rules: 50,
  log_rule_executions: true,
  enable_rule_throttling: true,
  default_throttle_time: 300,
};

const notificationRulesDescriptions: Record<string, string> = {
  enable_notification_rules: 'Enable the notification rules engine.',
  default_priority: 'Default priority assigned to new notification rules.',
  max_concurrent_rules: 'Maximum number of active notification rules allowed.',
  log_rule_executions: 'Log notification rule executions for auditing.',
  enable_rule_throttling: 'Throttle notification rules to avoid repeated execution bursts.',
  default_throttle_time: 'Default throttle duration in seconds.',
};

function useNotificationRulesSettings() {
  const {
    data,
    isLoading,
    error,
    saveSettings,
    saveSettingsAsync,
    isSaving,
    saveError,
    saveSuccess,
  } = useSettingsCategory<NotificationRulesSettings>({
    queryKey: ['notificationRulesSettings'],
    category: 'notification_rules',
    defaults: defaultNotificationRulesSettings,
    descriptions: notificationRulesDescriptions,
  });

  return {
    notificationRulesSettings: data,
    isLoadingData: isLoading,
    isUpdating: isSaving,
    loadError: error,
    updateError: saveError,
    updateSuccess: saveSuccess,
    updateSettings: saveSettings,
    updateSettingsAsync: saveSettingsAsync,
  };
}

export default useNotificationRulesSettings;
