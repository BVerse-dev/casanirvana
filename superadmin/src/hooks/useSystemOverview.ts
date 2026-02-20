import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-toastify';

// Types
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

// UI mapping interfaces
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

// Helper functions
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
  components.map(component => ({
    label: component.component_label,
    status: component.status,
    icon: component.icon,
    uptime: component.uptime_percentage,
  }));

export const mapPerformanceDataToUI = (performance: SystemPerformance[]): UIPerformanceData[] =>
  performance.map(perf => ({
    month: perf.month,
    users: perf.users_count,
    complaints: perf.complaints_count,
    revenue: perf.revenue,
    satisfaction: perf.satisfaction_rating,
  }));

// Hooks
export const useSystemMetrics = () => {
  return useQuery({
    queryKey: ['system-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_overview')
        .select('*')
        .single();

      if (error) throw error;
      return data as SystemMetrics;
    },
  });
};

export const useSystemActivities = () => {
  return useQuery({
    queryKey: ['system-activities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as SystemActivity[];
    },
  });
};

export const useSystemAlerts = () => {
  return useQuery({
    queryKey: ['system-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_alerts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SystemAlert[];
    },
  });
};

export const useSystemPerformance = () => {
  return useQuery({
    queryKey: ['system-performance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_performance')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as SystemPerformance[];
    },
  });
};

export const useSystemComponents = () => {
  return useQuery({
    queryKey: ['system-components'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_components')
        .select('*')
        .order('component_label', { ascending: true });

      if (error) throw error;
      return data as SystemComponent[];
    },
  });
};

// Mutation hooks
export const useUpdateSystemMetrics = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (metrics: Partial<SystemMetrics>) => {
      const { data, error } = await supabase
        .from('system_overview')
        .update(metrics)
        .eq('id', metrics.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-metrics'] });
      toast.success('System metrics updated successfully');
    },
    onError: (error) => {
      console.error('Error updating system metrics:', error);
      toast.error('Failed to update system metrics');
    },
  });
};

export const useUpdateSystemComponent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (component: Partial<SystemComponent>) => {
      const { data, error } = await supabase
        .from('system_components')
        .update(component)
        .eq('id', component.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-components'] });
      toast.success('System component updated successfully');
    },
    onError: (error) => {
      console.error('Error updating system component:', error);
      toast.error('Failed to update system component');
    },
  });
};

export const useCreateSystemActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (activity: Omit<SystemActivity, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('system_activities')
        .insert([activity])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-activities'] });
    },
    onError: (error) => {
      console.error('Error creating system activity:', error);
      toast.error('Failed to create system activity');
    },
  });
};

export const useCreateSystemAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alert: Omit<SystemAlert, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('system_alerts')
        .insert([alert])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-alerts'] });
    },
    onError: (error) => {
      console.error('Error creating system alert:', error);
      toast.error('Failed to create system alert');
    },
  });
};

export const useDismissSystemAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const { data, error } = await supabase
        .from('system_alerts')
        .update({ is_active: false })
        .eq('id', alertId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-alerts'] });
      toast.success('Alert dismissed');
    },
    onError: (error) => {
      console.error('Error dismissing alert:', error);
      toast.error('Failed to dismiss alert');
    },
  });
}; 