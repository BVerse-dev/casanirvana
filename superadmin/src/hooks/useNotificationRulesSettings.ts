import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Notification rules interface matching the form structure
export interface NotificationRulesSettings {
  // Global Rules Configuration (6 fields)
  enable_notification_rules: boolean;
  default_priority: string;
  max_concurrent_rules: number;
  log_rule_executions: boolean;
  enable_rule_throttling: boolean;
  default_throttle_time: number;
}

// Function to parse database values to the correct types
function parseSettingValue(key: string, value: string): any {
  try {
    // Parse JSON values first
    const parsed = JSON.parse(value);
    
    // Handle specific field types
    switch (key) {
      // Boolean fields
      case 'enable_notification_rules':
      case 'log_rule_executions':
      case 'enable_rule_throttling':
        return Boolean(parsed);
      
      // Number fields
      case 'max_concurrent_rules':
      case 'default_throttle_time':
        return Number(parsed);
      
      default:
        return parsed;
    }
  } catch {
    // Fallback for non-JSON values
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (!isNaN(Number(value))) return Number(value);
    return value;
  }
}

// Fetch notification rules settings from Supabase
async function fetchNotificationRulesSettings(): Promise<NotificationRulesSettings> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('key, value')
    .eq('category', 'notification_rules');

  if (error) {
    console.error('Error fetching notification rules settings:', error);
    throw new Error('Failed to fetch notification rules settings');
  }

  // Convert database format to NotificationRulesSettings interface
  const settings: Partial<NotificationRulesSettings> = {};
  
  data?.forEach((setting) => {
    const key = setting.key as keyof NotificationRulesSettings;
    settings[key] = parseSettingValue(setting.key, setting.value);
  });

  // Provide defaults for missing settings
  return {
    // Global Rules Configuration defaults
    enable_notification_rules: true,
    default_priority: 'medium',
    max_concurrent_rules: 50,
    log_rule_executions: true,
    enable_rule_throttling: true,
    default_throttle_time: 300,
    
    ...settings,
  } as NotificationRulesSettings;
}

// Update notification rules settings in Supabase
async function updateNotificationRulesSettings(settings: Partial<NotificationRulesSettings>): Promise<void> {
  const updates = Object.entries(settings).map(([key, value]) => {
    return {
      key: key,
      value: JSON.stringify(value),
      category: 'notification_rules',
      description: getFieldDescription(key),
    };
  });

  const { error } = await supabase
    .from('app_settings')
    .upsert(updates, { onConflict: 'key' });

  if (error) {
    console.error('Error updating notification rules settings:', error);
    throw new Error('Failed to update notification rules settings');
  }
}

// Helper function to get field descriptions
function getFieldDescription(key: string): string {
  const descriptions: Record<string, string> = {
    // Global Rules Configuration
    enable_notification_rules: 'Enable notification rules system',
    default_priority: 'Default priority for notification rules (low, medium, high, critical)',
    max_concurrent_rules: 'Maximum concurrent notification rules',
    log_rule_executions: 'Log notification rule executions',
    enable_rule_throttling: 'Enable throttling for notification rules',
    default_throttle_time: 'Default throttle time for notification rules in seconds',
  };
  
  return descriptions[key] || 'Notification rules setting';
}

// Custom hook for notification rules settings
function useNotificationRulesSettings() {
  const queryClient = useQueryClient();

  // Query to fetch notification rules settings
  const {
    data: notificationRulesSettings,
    isLoading: isLoadingData,
    error: loadError,
  } = useQuery({
    queryKey: ['notificationRulesSettings'],
    queryFn: fetchNotificationRulesSettings,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  // Mutation to update notification rules settings
  const {
    mutate: updateSettings,
    isPending: isUpdating,
    error: updateError,
    isSuccess: updateSuccess,
  } = useMutation({
    mutationFn: updateNotificationRulesSettings,
    onSuccess: () => {
      // Invalidate and refetch notification rules settings
      queryClient.invalidateQueries({ queryKey: ['notificationRulesSettings'] });
    },
  });

  return {
    // Data
    notificationRulesSettings,
    
    // Loading states
    isLoadingData,
    isUpdating,
    
    // Error states
    loadError,
    updateError,
    
    // Success states
    updateSuccess,
    
    // Actions
    updateSettings,
  };
}

export default useNotificationRulesSettings;
