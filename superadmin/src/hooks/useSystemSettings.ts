'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdminApi } from './useAdminApi';

// Types for system settings
export interface SystemSetting {
  id: number;
  key: string;
  value: string;
  description?: string;
  category?: string;
  data_type?: string;
  is_sensitive?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SystemConfigData {
  // Performance & Infrastructure
  app_name?: string;
  app_version?: string;
  environment?: string;
  debug_mode?: boolean;
  maintenance_mode?: boolean;
  force_ssl?: boolean;
  database_connection_pool_size?: number;
  database_query_timeout?: number;
  max_file_upload_size?: number;
  storage_provider?: string;
  cache_provider?: string;
  cache_ttl?: number;
  
  // Security & Authentication
  session_timeout?: number;
  password_min_length?: number;
  max_login_attempts?: number;
  enable_two_factor?: boolean;
  jwt_expiry_minutes?: number;
  cors_allowed_origins?: string;
  
  // API & Rate Limiting
  api_rate_limit_per_minute?: number;
  api_burst_limit?: number;
  webhook_timeout?: number;
  enable_api_versioning?: boolean;
  
  // Notification Settings
  notification_email_enabled?: boolean;
  notification_sms_enabled?: boolean;
  notification_push_enabled?: boolean;
  email_queue_batch_size?: number;
  sms_queue_batch_size?: number;
  notification_retry_attempts?: number;
  
  // System Monitoring
  enable_system_monitoring?: boolean;
  monitoring_interval_seconds?: number;
  disk_space_alert_threshold?: number;
  memory_usage_alert_threshold?: number;
  cpu_usage_alert_threshold?: number;
  
  // Backup & Recovery
  backup_frequency?: string;
  backup_retention_days?: number;
  auto_backup_enabled?: boolean;
  backup_compression?: boolean;
  offsite_backup_enabled?: boolean;
  
  // Logging & Auditing
  log_level?: string;
  log_retention_days?: number;
  enable_audit_logging?: boolean;
  enable_performance_logging?: boolean;
  log_file_max_size_mb?: number;
  
  // Business Logic
  maintenance_auto_assignment?: boolean;
  amenity_booking_advance_days?: number;
  visitor_pass_validity_hours?: number;
  payment_grace_period_days?: number;
  complaint_auto_escalation_hours?: number;
  
  // Advanced Features
  enable_analytics?: boolean;
  enable_machine_learning?: boolean;
  enable_real_time_sync?: boolean;
  enable_mobile_push?: boolean;
  enable_whatsapp_integration?: boolean;
}

// Fetch all system settings
export const useSystemSettings = () => {
  const { fetchAdmin, hasToken } = useAdminApi();
  return useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const response = await fetchAdmin('/admin/system-settings');
      return {
        data: response?.data || [],
        settings: response?.settings || {},
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: hasToken,
  });
};

// Fetch system settings by category
export const useSystemSettingsByCategory = (category: string) => {
  const { fetchAdmin, hasToken } = useAdminApi();
  return useQuery({
    queryKey: ['system-settings', 'category', category],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('category', category);
      const response = await fetchAdmin(`/admin/system-settings?${params.toString()}`);
      return {
        data: response?.data || [],
        settings: response?.settings || {},
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: hasToken && !!category,
  });
};

// Update system settings
export const useUpdateSystemSettings = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async (settingsData: Record<string, any>) => {
      return fetchAdmin('/admin/system-settings', {
        method: 'PUT',
        body: JSON.stringify({
          category: 'system',
          settings: settingsData,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
    },
  });
};

// Get specific system setting by key
export const useSystemSetting = (key: string) => {
  const { fetchAdmin, hasToken } = useAdminApi();
  return useQuery({
    queryKey: ['system-settings', key],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('category', 'system');
      const response = await fetchAdmin(`/admin/system-settings?${params.toString()}`);
      return { key, value: response?.settings?.[key] };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: hasToken && !!key,
  });
};

// Update single system setting
export const useUpdateSystemSetting = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async ({ 
      key, 
      value, 
      description,
      category,
      isSensitive = false
    }: { 
      key: string; 
      value: any; 
      description?: string;
      category?: string;
      isSensitive?: boolean;
    }) => {
      return fetchAdmin('/admin/system-settings', {
        method: 'PUT',
        body: JSON.stringify({
          category: category || 'system',
          settings: { [key]: value },
          descriptions: description ? { [key]: description } : undefined,
          sensitivities: { [key]: isSensitive },
        }),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      queryClient.invalidateQueries({ queryKey: ['system-settings', variables.key] });
    },
  });
};
