import { useMutation, useQuery } from '@tanstack/react-query';

import { useAdminApi } from './useAdminApi';

type ActivityLog = {
  id: string;
  user_id: string | null;
  user_name: string;
  user_role: string;
  action: string;
  action_type: string;
  resource: string;
  resource_id: string | null;
  details: string;
  ip_address: string;
  user_agent: string;
  location: string | null;
  timestamp: string;
  status: string;
  severity: string;
  metadata: any | null;
};

type ActivityLogFilters = {
  dateRange?: string;
  actionType?: string;
  status?: string;
  severity?: string;
  userId?: string;
  searchTerm?: string;
  limit?: number;
  offset?: number;
};

const buildQuery = (filters?: ActivityLogFilters) => {
  const params = new URLSearchParams();

  if (!filters) return params.toString();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    params.set(key, String(value));
  });

  return params.toString();
};

export const useActivityLogs = (filters?: ActivityLogFilters) => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: ['activity-logs', filters],
    enabled: hasToken,
    staleTime: 5 * 60 * 1000,
    retry: 3,
    queryFn: async () => {
      const query = buildQuery(filters);
      const response = await fetchAdmin<{ data?: ActivityLog[] }>(
        `/admin/settings/activity-logs${query ? `?${query}` : ''}`
      );
      return response.data || [];
    },
  });
};

export const useActivityLog = (id: string) => {
  const { data: logs, ...query } = useActivityLogs();

  return {
    ...query,
    data: logs?.find((entry) => entry.id === id) || null,
  };
};

export const useActivityStats = () => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: ['activity-stats'],
    enabled: hasToken,
    staleTime: 2 * 60 * 1000,
    retry: 3,
    queryFn: async () => {
      const response = await fetchAdmin<{ data: any }>('/admin/settings/activity-logs/stats');
      return response.data;
    },
  });
};

export const useCreateActivityLog = () => {
  return useMutation({
    mutationFn: async () => {
      throw new Error('Activity log creation is not available from the settings workspace.');
    },
  });
};

export const useUpdateActivityLog = () => {
  return useMutation({
    mutationFn: async () => {
      throw new Error('Activity log updates are not available from the settings workspace.');
    },
  });
};

export const useDeleteActivityLog = () => {
  return useMutation({
    mutationFn: async () => {
      throw new Error('Activity log deletion is not available from the settings workspace.');
    },
  });
};

export const useBulkDeleteActivityLogs = () => {
  return useMutation({
    mutationFn: async () => {
      throw new Error('Bulk activity log deletion is not available from the settings workspace.');
    },
  });
};

export const useExportActivityLogs = () => {
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async (filters?: Omit<ActivityLogFilters, 'limit' | 'offset'>) => {
      const query = buildQuery(filters);
      const response = await fetchAdmin<{ data?: ActivityLog[] }>(
        `/admin/settings/activity-logs/export${query ? `?${query}` : ''}`
      );
      return response.data || [];
    },
  });
};
