import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// ActivityLog types based on the database schema
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
  created_at: string;
  updated_at: string;
};

type ActivityLogInsert = Omit<ActivityLog, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

type ActivityLogUpdate = Partial<ActivityLogInsert>;

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

const applyDateRangeFilter = (logs: ActivityLog[], dateRange?: string) => {
  if (!dateRange || dateRange === 'all') return logs;

  const now = new Date();
  switch (dateRange) {
    case 'today': {
      const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      return logs.filter((log) => {
        const logDate = new Date(log.timestamp);
        return logDate >= startDate && logDate < endDate;
      });
    }
    case 'yesterday': {
      const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return logs.filter((log) => {
        const logDate = new Date(log.timestamp);
        return logDate >= startDate && logDate < endDate;
      });
    }
    case 'last_7_days': {
      const startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return logs.filter((log) => new Date(log.timestamp) >= startDate);
    }
    case 'last_30_days': {
      const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return logs.filter((log) => new Date(log.timestamp) >= startDate);
    }
    case 'last_90_days': {
      const startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      return logs.filter((log) => new Date(log.timestamp) >= startDate);
    }
    default:
      return logs;
  }
};

const applyClientFilters = (logs: ActivityLog[], filters?: ActivityLogFilters) => {
  let filtered = [...logs];

  if (filters?.actionType && filters.actionType !== 'all') {
    filtered = filtered.filter((log) => log.action_type === filters.actionType);
  }

  if (filters?.status && filters.status !== 'all') {
    filtered = filtered.filter((log) => log.status === filters.status);
  }

  if (filters?.severity && filters.severity !== 'all') {
    filtered = filtered.filter((log) => log.severity === filters.severity);
  }

  if (filters?.userId && filters.userId !== 'all') {
    filtered = filtered.filter((log) => log.user_id === filters.userId);
  }

  if (filters?.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(
      (log) =>
        log.user_name?.toLowerCase().includes(term) ||
        log.action?.toLowerCase().includes(term) ||
        log.details?.toLowerCase().includes(term)
    );
  }

  filtered = applyDateRangeFilter(filtered, filters?.dateRange);
  filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (filters?.offset !== undefined && filters?.limit) {
    return filtered.slice(filters.offset, filters.offset + filters.limit);
  }
  if (filters?.limit) {
    return filtered.slice(0, filters.limit);
  }

  return filtered;
};

const applyDateRangeQuery = (
  query: any,
  dateRange?: string
) => {
  if (!dateRange || dateRange === 'all') {
    return query;
  }

  const now = new Date();
  switch (dateRange) {
    case 'today': {
      const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      return query.gte('timestamp', startDate.toISOString()).lt('timestamp', endDate.toISOString());
    }
    case 'yesterday': {
      const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return query.gte('timestamp', startDate.toISOString()).lt('timestamp', endDate.toISOString());
    }
    case 'last_7_days': {
      const startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return query.gte('timestamp', startDate.toISOString());
    }
    case 'last_30_days': {
      const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return query.gte('timestamp', startDate.toISOString());
    }
    case 'last_90_days': {
      const startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      return query.gte('timestamp', startDate.toISOString());
    }
    default:
      return query;
  }
};

// Activity log query hooks
export const useActivityLogs = (filters?: {
  dateRange?: string;
  actionType?: string;
  status?: string;
  severity?: string;
  userId?: string;
  searchTerm?: string;
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: ['activity-logs', filters],
    queryFn: async () => {
      const fetchRpcLogs = async (rpcName: string): Promise<ActivityLog[] | null> => {
        try {
          const { data, error } = await supabase.rpc(rpcName);
          if (error || !Array.isArray(data)) {
            return null;
          }
          return data as ActivityLog[];
        } catch {
          return null;
        }
      };

      const rpcData = (await fetchRpcLogs('get_all_activity_logs')) ?? (await fetchRpcLogs('admin_get_all_logs'));
      if (rpcData) {
        return applyClientFilters(rpcData, filters);
      }

      // Fallback: standard table query with DB-side filtering
      let query = supabase
        .from('activity_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      // Apply filters
      if (filters?.actionType && filters.actionType !== 'all') {
        query = query.eq('action_type', filters.actionType);
      }

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.severity && filters.severity !== 'all') {
        query = query.eq('severity', filters.severity);
      }

      if (filters?.userId && filters.userId !== 'all') {
        query = query.eq('user_id', filters.userId);
      }

      if (filters?.searchTerm) {
        query = query.or(`user_name.ilike.%${filters.searchTerm}%,action.ilike.%${filters.searchTerm}%,details.ilike.%${filters.searchTerm}%`);
      }

      query = applyDateRangeQuery(query, filters?.dateRange);

      // Apply pagination
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data as ActivityLog[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
};

// Get single activity log
export const useActivityLog = (id: string) => {
  return useQuery({
    queryKey: ['activity-log', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data as ActivityLog;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Activity statistics hook
export const useActivityStats = () => {
  return useQuery({
    queryKey: ['activity-stats'],
    queryFn: async () => {
      try {
        const { data: statsData, error: statsError } = await supabase.rpc('get_activity_logs_stats');
        if (!statsError && statsData) {
          return statsData;
        }
      } catch {
        // Fall through to standard query approach
      }

      const { count: totalCount, error: totalError } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      // Get today's count
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      const { count: todayCount, error: todayError } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .gte('timestamp', startOfDay.toISOString())
        .lt('timestamp', endOfDay.toISOString());

      if (todayError) throw todayError;

      // Get failed count
      const { count: failedCount, error: failedError } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'failed');

      if (failedError) throw failedError;

      // Get critical count
      const { count: criticalCount, error: criticalError } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .eq('severity', 'critical');

      if (criticalError) throw criticalError;

      // Get action type distribution
      const { data: actionTypeData, error: actionTypeError } = await supabase
        .from('activity_logs')
        .select('action_type')
        .order('action_type');

      if (actionTypeError) throw actionTypeError;

      const byActionType = actionTypeData.reduce((acc, item) => {
        acc[item.action_type] = (acc[item.action_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Get status distribution
      const { data: statusData, error: statusError } = await supabase
        .from('activity_logs')
        .select('status')
        .order('status');

      if (statusError) throw statusError;

      const byStatus = statusData.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const stats = {
        total: totalCount || 0,
        today: todayCount || 0,
        failed: failedCount || 0,
        critical: criticalCount || 0,
        byActionType,
        byStatus,
      };

      return stats;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
  });
};

// Create activity log mutation
export const useCreateActivityLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newLog: ActivityLogInsert) => {
      const { data, error } = await supabase
        .from('activity_logs')
        .insert([newLog])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as ActivityLog;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      queryClient.invalidateQueries({ queryKey: ['activity-stats'] });
    },
  });
};

// Update activity log mutation
export const useUpdateActivityLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ActivityLogUpdate }) => {
      const { data, error } = await supabase
        .from('activity_logs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as ActivityLog;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      queryClient.invalidateQueries({ queryKey: ['activity-log', data.id] });
      queryClient.invalidateQueries({ queryKey: ['activity-stats'] });
    },
  });
};

// Delete activity log mutation
export const useDeleteActivityLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('activity_logs')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      queryClient.invalidateQueries({ queryKey: ['activity-stats'] });
    },
  });
};

// Bulk delete activity logs mutation
export const useBulkDeleteActivityLogs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('activity_logs')
        .delete()
        .in('id', ids);

      if (error) {
        throw error;
      }

      return { ids };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      queryClient.invalidateQueries({ queryKey: ['activity-stats'] });
    },
  });
};

// Export activity logs to CSV
export const useExportActivityLogs = () => {
  return useMutation({
    mutationFn: async (filters?: {
      dateRange?: string;
      actionType?: string;
      status?: string;
      severity?: string;
      userId?: string;
      searchTerm?: string;
    }) => {
      let query = supabase
        .from('activity_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      // Apply the same filters as in useActivityLogs
      if (filters?.actionType && filters.actionType !== 'all') {
        query = query.eq('action_type', filters.actionType);
      }

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.severity && filters.severity !== 'all') {
        query = query.eq('severity', filters.severity);
      }

      if (filters?.userId && filters.userId !== 'all') {
        query = query.eq('user_id', filters.userId);
      }

      if (filters?.searchTerm) {
        query = query.or(`user_name.ilike.%${filters.searchTerm}%,action.ilike.%${filters.searchTerm}%,details.ilike.%${filters.searchTerm}%`);
      }

      // Apply date range filter (same logic as useActivityLogs)
      if (filters?.dateRange && filters.dateRange !== 'all') {
        const now = new Date();

        switch (filters.dateRange) {
          case 'today': {
            const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            query = query.gte('timestamp', startDate.toISOString()).lt('timestamp', endDate.toISOString());
            break;
          }
          case 'yesterday': {
            const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
            const endDateYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            query = query.gte('timestamp', startDate.toISOString()).lt('timestamp', endDateYesterday.toISOString());
            break;
          }
          case 'last_7_days': {
            const startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            query = query.gte('timestamp', startDate.toISOString());
            break;
          }
          case 'last_30_days': {
            const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            query = query.gte('timestamp', startDate.toISOString());
            break;
          }
          case 'last_90_days': {
            const startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            query = query.gte('timestamp', startDate.toISOString());
            break;
          }
        }
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data as ActivityLog[];
    },
  });
};
