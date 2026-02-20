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
      // Direct SQL approach using service_role key via a custom endpoint
      // If this doesn't work, it's a pure backend issue, not a frontend issue
      
      // First try fetching logs via an RPC call that should bypass RLS 
      console.log('🔍 DEBUG: Fetching activity logs with filters:', filters);
      
      // First verify if user role is correct and RPC works at all
      try {
        console.log('� Checking user role...');
        const { data: roleData, error: roleError } = await supabase.rpc('get_my_role');
        console.log('�👤 User role from database:', roleData, roleError ? `(Error: ${roleError.message})` : '');
        
        // Test if basic RPC works
        const { data: testResult, error: testError } = await supabase.rpc('test_rpc_function');
        console.log('🔄 Basic RPC test:', testResult, testError ? `(Error: ${testError.message})` : '');
      } catch (e) {
        console.error('❌ Error checking role:', e);
      }
      
      // Try different RPC functions to get the data
      // 1. Try get_all_activity_logs first
      try {
        console.log('🔄 Attempting get_all_activity_logs RPC...');
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_all_activity_logs');
        
        // If the RPC call succeeds, process and return the data
        if (rpcData && !rpcError) {
          console.log('✅ get_all_activity_logs SUCCESS! Logs retrieved:', rpcData.length);
          console.log('🔎 First few logs:', rpcData.slice(0, 3));
          
          // Apply client-side filtering
          let filteredData = [...rpcData];
          console.log('📋 Starting with', filteredData.length, 'logs from RPC');
          
          // Filter by action type
          if (filters?.actionType && filters.actionType !== 'all') {
            filteredData = filteredData.filter(log => log.action_type === filters.actionType);
            console.log(`🔍 After filtering by action_type=${filters.actionType}:`, filteredData.length);
          }
          
          // Filter by status
          if (filters?.status && filters.status !== 'all') {
            filteredData = filteredData.filter(log => log.status === filters.status);
            console.log(`🔍 After filtering by status=${filters.status}:`, filteredData.length);
          }
          
          // Filter by severity
          if (filters?.severity && filters.severity !== 'all') {
            filteredData = filteredData.filter(log => log.severity === filters.severity);
            console.log(`🔍 After filtering by severity=${filters.severity}:`, filteredData.length);
          }
          
          // Filter by user ID
          if (filters?.userId && filters.userId !== 'all') {
            filteredData = filteredData.filter(log => log.user_id === filters.userId);
            console.log(`🔍 After filtering by userId=${filters.userId}:`, filteredData.length);
          }
          
          // Search term filtering
          if (filters?.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            filteredData = filteredData.filter(log => 
              (log.user_name?.toLowerCase().includes(term) || 
               log.action?.toLowerCase().includes(term) || 
               log.details?.toLowerCase().includes(term))
            );
            console.log(`🔍 After filtering by searchTerm=${filters.searchTerm}:`, filteredData.length);
          }
          
          // Date range filtering
          if (filters?.dateRange && filters.dateRange !== 'all') {
            const now = new Date();
            console.log('📅 Current date for filtering:', now.toISOString());
            
            switch (filters.dateRange) {
              case 'today': {
                const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
                console.log(`📅 Filtering for today: ${startDate.toISOString()} to ${endDate.toISOString()}`);
                filteredData = filteredData.filter(log => {
                  const logDate = new Date(log.timestamp);
                  return logDate >= startDate && logDate < endDate;
                });
                break;
              }
              case 'yesterday': {
                const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
                const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                console.log(`📅 Filtering for yesterday: ${startDate.toISOString()} to ${endDate.toISOString()}`);
                filteredData = filteredData.filter(log => {
                  const logDate = new Date(log.timestamp);
                  return logDate >= startDate && logDate < endDate;
                });
                break;
              }
              case 'last_7_days': {
                const startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                console.log(`📅 Filtering for last 7 days: since ${startDate.toISOString()}`);
                filteredData = filteredData.filter(log => new Date(log.timestamp) >= startDate);
                break;
              }
              case 'last_30_days': {
                const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                console.log(`📅 Filtering for last 30 days: since ${startDate.toISOString()}`);
                filteredData = filteredData.filter(log => new Date(log.timestamp) >= startDate);
                break;
              }
              case 'last_90_days': {
                const startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                console.log(`📅 Filtering for last 90 days: since ${startDate.toISOString()}`);
                filteredData = filteredData.filter(log => new Date(log.timestamp) >= startDate);
                break;
              }
            }
            console.log(`🔍 After date filtering (${filters.dateRange}):`, filteredData.length);
          }
          
          // Sort by timestamp descending
          filteredData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          
          // Apply pagination
          let paginatedData = filteredData;
          if (filters?.offset !== undefined && filters?.limit) {
            paginatedData = filteredData.slice(filters.offset, filters.offset + filters.limit);
          } else if (filters?.limit) {
            paginatedData = filteredData.slice(0, filters.limit);
          }
          
          console.log('✅ Final data after all filtering:', paginatedData.length, 'records');
          if (paginatedData.length > 0) {
            console.log('📋 First returned record:', {
              id: paginatedData[0].id,
              timestamp: paginatedData[0].timestamp,
              user: paginatedData[0].user_name,
              action: paginatedData[0].action
            });
          } else {
            console.log('⚠️ No records to display after filtering');
          }
          
          return paginatedData as ActivityLog[];
        } else {
          console.error('❌ RPC ERROR:', rpcError);
          // Fall through to standard query approach
        }
      } catch (error) {
        console.error('❌ EXCEPTION in get_all_activity_logs RPC call:', error);
        // Try the next method
      }
      
      // 2. Try admin_get_all_logs as a backup
      try {
        console.log('🔄 Attempting admin_get_all_logs RPC...');
        const { data: adminData, error: adminError } = await supabase.rpc('admin_get_all_logs');
        
        if (adminData && !adminError) {
          console.log('✅ admin_get_all_logs SUCCESS! Logs retrieved:', adminData.length);
          console.log('🔎 First few logs:', adminData.slice(0, 3));
          
          // Process data same as before...
          let filteredData = [...adminData];
          console.log('📋 Starting with', filteredData.length, 'logs from admin RPC');
          
          // Apply all the same filters
          if (filters?.actionType && filters.actionType !== 'all') {
            filteredData = filteredData.filter(log => log.action_type === filters.actionType);
          }
          
          if (filters?.status && filters.status !== 'all') {
            filteredData = filteredData.filter(log => log.status === filters.status);
          }
          
          if (filters?.severity && filters.severity !== 'all') {
            filteredData = filteredData.filter(log => log.severity === filters.severity);
          }
          
          if (filters?.userId && filters.userId !== 'all') {
            filteredData = filteredData.filter(log => log.user_id === filters.userId);
          }
          
          if (filters?.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            filteredData = filteredData.filter(log => 
              (log.user_name?.toLowerCase().includes(term) || 
               log.action?.toLowerCase().includes(term) || 
               log.details?.toLowerCase().includes(term))
            );
          }
          
          if (filters?.dateRange && filters.dateRange !== 'all') {
            const now = new Date();
            
            switch (filters.dateRange) {
              case 'today': {
                const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
                filteredData = filteredData.filter(log => {
                  const logDate = new Date(log.timestamp);
                  return logDate >= startDate && logDate < endDate;
                });
                break;
              }
              case 'yesterday': {
                const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
                const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                filteredData = filteredData.filter(log => {
                  const logDate = new Date(log.timestamp);
                  return logDate >= startDate && logDate < endDate;
                });
                break;
              }
              case 'last_7_days': {
                const startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                filteredData = filteredData.filter(log => new Date(log.timestamp) >= startDate);
                break;
              }
              case 'last_30_days': {
                const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                filteredData = filteredData.filter(log => new Date(log.timestamp) >= startDate);
                break;
              }
              case 'last_90_days': {
                const startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                filteredData = filteredData.filter(log => new Date(log.timestamp) >= startDate);
                break;
              }
            }
          }
          
          filteredData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          
          let paginatedData = filteredData;
          if (filters?.offset !== undefined && filters?.limit) {
            paginatedData = filteredData.slice(filters.offset, filters.offset + filters.limit);
          } else if (filters?.limit) {
            paginatedData = filteredData.slice(0, filters.limit);
          }
          
          console.log('✅ Final data from admin_get_all_logs:', paginatedData.length, 'records');
          return paginatedData as ActivityLog[];
        } else {
          console.error('❌ admin_get_all_logs ERROR:', adminError);
        }
      } catch (error) {
        console.error('❌ EXCEPTION in admin_get_all_logs RPC call:', error);
      }
      
      console.log('⚠️ All RPC methods failed, falling back to standard query...');
      // Fallback: Standard query with filters applied in the database
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

      // Apply date range filter
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
            const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            query = query.gte('timestamp', startDate.toISOString()).lt('timestamp', endDate.toISOString());
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
          // No default case needed - 'all' is explicitly handled by the outer if condition
        }
      }

      // Apply pagination
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching activity logs:', error);
        throw error;
      }
      
      // Detailed debug logging
      console.log('▶️ ACTIVITY LOGS DEBUG INFO:');
      console.log('📊 Number of logs returned:', data?.length || 0);
      console.log('🔍 Filters applied:', JSON.stringify(filters, null, 2));
      console.log('📅 Current date:', new Date().toISOString());
      
      // Examine the first few logs if available
      if (data && data.length > 0) {
        console.log('📋 First log:', {
          id: data[0].id,
          user: data[0].user_name,
          action: data[0].action,
          timestamp: data[0].timestamp,
          formattedDate: new Date(data[0].timestamp).toLocaleString(),
          severity: data[0].severity
        });
        
        // Check all fields on first log
        console.log('🔎 All fields on first log:', data[0]);
        
        // Show distribution of dates
        const dates = data.map(log => new Date(log.timestamp).toISOString().split('T')[0]);
        const dateCounts: Record<string, number> = dates.reduce((acc, date) => {
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        console.log('📆 Date distribution:', dateCounts);
      } else {
        console.log('⚠️ WARNING: No logs found - possible reasons:');
        console.log('  1. No matching logs in database');
        console.log('  2. Date filter excluding logs - current filter:', filters?.dateRange);
        console.log('  3. Other filters excluding logs:', 
          filters?.actionType !== 'all' ? `actionType=${filters?.actionType}` : '',
          filters?.status !== 'all' ? `status=${filters?.status}` : '',
          filters?.severity !== 'all' ? `severity=${filters?.severity}` : '',
          filters?.searchTerm ? `searchTerm=${filters?.searchTerm}` : ''
        );
        console.log('  4. RLS policies preventing access');
        
        // Try a direct count query to verify data exists
        console.log('🔄 Attempting direct count query to verify data exists...');
        supabase
          .from('activity_logs')
          .select('*', { count: 'exact', head: true })
          .then(response => {
            console.log('📝 Total logs in database:', response.count);
            console.log('❌ Error if any:', response.error);
          });
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
      // First try using an RPC function to get stats
      try {
        console.log('🔄 Attempting to fetch stats via RPC function...');
        const { data: statsData, error: statsError } = await supabase.rpc('get_activity_logs_stats');
        
        if (!statsError && statsData) {
          console.log('✅ Stats RPC successful, returned data:', statsData);
          return statsData;
        } else {
          console.log('⚠️ Stats RPC failed:', statsError);
          // Fall through to standard query approach
        }
      } catch (error) {
        console.error('❌ Exception in stats RPC:', error);
        // Fall through to standard query approach
      }
      
      console.log('⚠️ Falling back to standard stats queries...');
      
      // Fallback to standard queries for stats
      // Get total count
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
      
      console.log('Activity stats fetched from Supabase:', stats);
      
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
