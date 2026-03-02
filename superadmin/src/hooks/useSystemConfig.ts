'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdminApi } from './useAdminApi';

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

const DEFAULT_SYSTEM_CONFIG: SystemConfigData = {
  admin_dashboard_refresh_minutes: 5,
  auto_logout_minutes: 60,
  max_file_upload_size_mb: 10,
  session_timeout_minutes: 30,
  max_concurrent_sessions: 3,
  data_backup_frequency: 'daily',
  log_retention_days: 90,
  enable_real_time_notifications: true,
  enable_analytics: true,
  enable_audit_logs: true,
  enable_maintenance_mode: false,
};

const QUERY_KEY = ['generalSystemConfig'] as const;

export const useSystemConfig = () => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<SystemConfigData> => {
      const response = await fetchAdmin<{ settings?: Partial<SystemConfigData> }>('/admin/settings/general-system');
      return {
        ...DEFAULT_SYSTEM_CONFIG,
        ...(response.settings || {}),
      };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: hasToken,
  });
};

export const useUpdateSystemConfig = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async (data: SystemConfigData) => {
      const response = await fetchAdmin<{ settings?: Partial<SystemConfigData> }>('/admin/settings/general-system', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response.settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};

export const useSystemConfigValue = (key: keyof SystemConfigData) => {
  const { data: config } = useSystemConfig();
  return config?.[key];
};
