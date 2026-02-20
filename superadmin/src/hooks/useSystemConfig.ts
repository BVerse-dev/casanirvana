'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Types for System Configuration
export interface SystemConfigData {
  admin_dashboard_refresh_minutes: number;
  auto_logout_minutes?: number;
  max_file_upload_size_mb?: number;
  session_timeout_minutes?: number;
  max_concurrent_sessions?: number;
  data_backup_frequency: string;
  log_retention_days?: number;
  enable_real_time_notifications?: boolean;
  enable_analytics?: boolean;
  enable_audit_logs?: boolean;
  enable_maintenance_mode?: boolean;
}

// Query Keys
const QUERY_KEYS = {
  systemConfig: ['app_settings', 'system'] as const,
};

// System configuration keys
const SYSTEM_CONFIG_KEYS = [
  'admin_dashboard_refresh_minutes',
  'auto_logout_minutes',
  'max_file_upload_size_mb',
  'session_timeout_minutes',
  'max_concurrent_sessions',
  'data_backup_frequency',
  'log_retention_days',
  'enable_real_time_notifications',
  'enable_analytics',
  'enable_audit_logs',
  'enable_maintenance_mode'
] as const;

// Helper function to parse settings data into typed object
const parseSystemConfig = (settings: Array<{key: string, value: string}>): SystemConfigData => {
  const config: any = {};
  
  settings.forEach(setting => {
    if (SYSTEM_CONFIG_KEYS.includes(setting.key as any)) {
      // Parse different data types
      if (['admin_dashboard_refresh_minutes', 'auto_logout_minutes', 'max_file_upload_size_mb', 
           'session_timeout_minutes', 'max_concurrent_sessions', 'log_retention_days'].includes(setting.key)) {
        config[setting.key] = parseInt(setting.value) || 0;
      } else if (['enable_real_time_notifications', 'enable_analytics', 'enable_audit_logs', 'enable_maintenance_mode'].includes(setting.key)) {
        config[setting.key] = setting.value === 'true';
      } else {
        config[setting.key] = setting.value;
      }
    }
  });

  return {
    admin_dashboard_refresh_minutes: config.admin_dashboard_refresh_minutes || 5,
    auto_logout_minutes: config.auto_logout_minutes || 60,
    max_file_upload_size_mb: config.max_file_upload_size_mb || 10,
    session_timeout_minutes: config.session_timeout_minutes || 30,
    max_concurrent_sessions: config.max_concurrent_sessions || 3,
    data_backup_frequency: config.data_backup_frequency || 'daily',
    log_retention_days: config.log_retention_days || 90,
    enable_real_time_notifications: config.enable_real_time_notifications ?? true,
    enable_analytics: config.enable_analytics ?? true,
    enable_audit_logs: config.enable_audit_logs ?? true,
    enable_maintenance_mode: config.enable_maintenance_mode ?? false,
  };
};

// Hook to fetch system configuration
export const useSystemConfig = () => {
  return useQuery({
    queryKey: QUERY_KEYS.systemConfig,
    queryFn: async (): Promise<SystemConfigData> => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value')
        .in('key', SYSTEM_CONFIG_KEYS);

      if (error) {
        console.error('Error fetching system config:', error);
        throw new Error(`Failed to fetch system config: ${error.message}`);
      }

      return parseSystemConfig(data || []);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to update system configuration
export const useUpdateSystemConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SystemConfigData): Promise<void> => {
      // Convert config object to array of key-value pairs for database
      const updates = Object.entries(data).map(([key, value]) => ({
        key,
        value: String(value ?? ''),
        description: getFieldDescription(key),
      }));

      // Update each setting individually
      for (const update of updates) {
        const { error } = await supabase
          .from('app_settings')
          .upsert({
            key: update.key,
            value: update.value,
            description: update.description,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'key'
          });

        if (error) {
          console.error(`Error updating ${update.key}:`, error);
          throw new Error(`Failed to update ${update.key}: ${error.message}`);
        }
      }
    },
    onSuccess: () => {
      // Invalidate and refetch system config
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.systemConfig });
    },
    onError: (error) => {
      console.error('Error updating system config:', error);
    },
  });
};

// Helper function to get field descriptions
const getFieldDescription = (key: string): string => {
  const descriptions: Record<string, string> = {
    admin_dashboard_refresh_minutes: 'Dashboard auto-refresh interval in minutes',
    auto_logout_minutes: 'Auto logout timeout in minutes for inactive users',
    max_file_upload_size_mb: 'Maximum file upload size in megabytes',
    session_timeout_minutes: 'Session timeout duration in minutes',
    max_concurrent_sessions: 'Maximum concurrent sessions allowed per user',
    data_backup_frequency: 'Data backup frequency: hourly, daily, weekly, monthly',
    log_retention_days: 'Log file retention period in days',
    enable_real_time_notifications: 'Enable real-time notifications system',
    enable_analytics: 'Enable analytics and reporting system',
    enable_audit_logs: 'Enable audit logging for user actions',
    enable_maintenance_mode: 'Enable maintenance mode to disable user access',
  };
  
  return descriptions[key] || '';
};

// Hook to get a single system config value
export const useSystemConfigValue = (key: keyof SystemConfigData) => {
  const { data: config } = useSystemConfig();
  return config?.[key];
};
