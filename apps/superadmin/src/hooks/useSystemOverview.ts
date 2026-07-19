import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { useAdminApi } from './useAdminApi';

export interface SystemMetrics {
  id: string;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_io: number;
  system_uptime: string;
  active_connections: number;
  active_users: number;
  total_users: number;
  total_units: number;
  active_complaints: number;
  maintenance_requests: number;
  monthly_revenue: number;
  payments_count: number;
  visitors_count: number;
  system_health_score: number;
  database_size: string;
  backup_size: string;
  storage_used: number;
  storage_total: number;
  storage_unit: string;
  bandwidth_used: number;
  bandwidth_total: number;
  bandwidth_unit: string;
  api_calls_used: number;
  api_calls_total: number;
  email_quota_used: number;
  email_quota_total: number;
  avg_response_time: number;
  uptime_percentage: number;
}

export interface SystemActivity {
  id: string;
  time_ago: string;
  action: string;
  user_info: string;
  activity_type: string;
  icon: string;
  created_at: string;
}

export interface SystemAlert {
  id: string;
  alert_type: string;
  message: string;
  time_ago: string;
  is_active: boolean;
  created_at: string;
}

export interface SystemPerformance {
  id: string;
  month: string;
  users_count: number;
  complaints_count: number;
  revenue: number;
  satisfaction_rating: number;
}

export interface SystemComponent {
  id: string;
  component_label: string;
  status: string;
  icon: string;
  uptime_percentage: string;
  updated_at: string;
}

export interface UISystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  uptime: string;
  connections: number;
  activeUsers: number;
  totalUsers: number;
  totalUnits: number;
  activeComplaints: number;
  maintenanceRequests: number;
  revenue: number;
  payments: number;
  visitors: number;
}

export interface UIResourceUsage {
  storage: { used: number; total: number; unit: string };
  bandwidth: { used: number; total: number; unit: string };
  apiCalls: { used: number; total: number; unit: string };
  emailQuota: { used: number; total: number; unit: string };
}

export interface UISystemStatus {
  label: string;
  status: string;
  icon: string;
  uptime: string;
}

export interface UIPerformanceData {
  month: string;
  users: number;
  complaints: number;
  revenue: number;
  satisfaction: number;
}

type SystemOverviewResponse = {
  data?: {
    metrics?: SystemMetrics | null;
    activities?: SystemActivity[];
    alerts?: SystemAlert[];
    performance?: SystemPerformance[];
    components?: SystemComponent[];
  };
};

const systemOverviewQueryKey = ['settings-system-overview'] as const;

export const mapSystemMetricsToUI = (metrics: SystemMetrics): UISystemMetrics => ({
  cpu: metrics.cpu_usage,
  memory: metrics.memory_usage,
  disk: metrics.disk_usage,
  network: metrics.network_io,
  uptime: metrics.system_uptime,
  connections: metrics.active_connections,
  activeUsers: metrics.active_users,
  totalUsers: metrics.total_users,
  totalUnits: metrics.total_units,
  activeComplaints: metrics.active_complaints,
  maintenanceRequests: metrics.maintenance_requests,
  revenue: metrics.monthly_revenue,
  payments: metrics.payments_count,
  visitors: metrics.visitors_count,
});

export const mapResourceUsageToUI = (metrics: SystemMetrics): UIResourceUsage => ({
  storage: {
    used: metrics.storage_used,
    total: metrics.storage_total,
    unit: metrics.storage_unit,
  },
  bandwidth: {
    used: metrics.bandwidth_used,
    total: metrics.bandwidth_total,
    unit: metrics.bandwidth_unit,
  },
  apiCalls: {
    used: metrics.api_calls_used,
    total: metrics.api_calls_total,
    unit: 'calls',
  },
  emailQuota: {
    used: metrics.email_quota_used,
    total: metrics.email_quota_total,
    unit: 'emails',
  },
});

export const mapSystemStatusToUI = (components: SystemComponent[]): UISystemStatus[] =>
  components.map((component) => ({
    label: component.component_label,
    status: component.status,
    icon: component.icon,
    uptime: component.uptime_percentage,
  }));

export const mapPerformanceDataToUI = (performance: SystemPerformance[]): UIPerformanceData[] =>
  performance.map((item) => ({
    month: item.month,
    users: item.users_count,
    complaints: item.complaints_count,
    revenue: item.revenue,
    satisfaction: item.satisfaction_rating,
  }));

const useSystemOverviewData = () => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: systemOverviewQueryKey,
    enabled: hasToken,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    queryFn: async () => {
      const response = await fetchAdmin<SystemOverviewResponse>('/admin/settings/system-overview');
      return response.data || {};
    },
  });
};

export const useSystemMetrics = () => {
  const query = useSystemOverviewData();
  return {
    ...query,
    data: query.data?.metrics || null,
  };
};

export const useSystemActivities = () => {
  const query = useSystemOverviewData();
  return {
    ...query,
    data: query.data?.activities || [],
  };
};

export const useSystemAlerts = () => {
  const query = useSystemOverviewData();
  return {
    ...query,
    data: query.data?.alerts || [],
  };
};

export const useSystemPerformance = () => {
  const query = useSystemOverviewData();
  return {
    ...query,
    data: query.data?.performance || [],
  };
};

export const useSystemComponents = () => {
  const query = useSystemOverviewData();
  return {
    ...query,
    data: query.data?.components || [],
  };
};

export const useDismissSystemAlert = () => {
  const { fetchAdmin } = useAdminApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const response = await fetchAdmin<{ data: SystemAlert }>(
        `/admin/settings/system-overview/alerts/${alertId}/dismiss`,
        {
          method: 'PATCH',
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemOverviewQueryKey });
      toast.success('Alert dismissed');
    },
    onError: (error) => {
      console.error('Error dismissing alert:', error);
      toast.error('Failed to dismiss alert');
    },
  });
};

export const useSystemOverviewRealtime = () => undefined;
