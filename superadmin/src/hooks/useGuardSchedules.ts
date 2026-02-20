import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { toast } from 'react-hot-toast';

// Type definitions based on UI requirements
export interface GuardSchedule {
  id: string;
  guardId: string;
  guardName: string;
  shiftType: 'day' | 'night' | 'rotating' | 'split';
  startTime: string;
  endTime: string;
  assignedDate: string;
  endDate?: string;
  communityId: string;
  communityName: string;
  postLocation: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  createdAt: string;
  replacementId?: string;
  replacementName?: string;
}

export interface ShiftPattern {
  id: string;
  name: string;
  type: 'fixed' | 'rotating' | 'flexible';
  startTime: string;
  endTime: string;
  duration: number; // hours
  breakTime: number; // minutes
  isDefault: boolean;
  description: string;
}

export interface CreateScheduleData {
  guardId: string;
  shiftType: 'day' | 'night' | 'rotating' | 'split';
  startTime: string;
  endTime: string;
  assignedDate: string;
  endDate?: string;
  communityId: string;
  postLocation: string;
  notes?: string;
}

export interface CreatePatternData {
  name: string;
  type: 'fixed' | 'rotating' | 'flexible';
  startTime: string;
  endTime: string;
  duration: number;
  breakTime: number;
  isDefault: boolean;
  description: string;
}

const transformPatternRow = (row: any): ShiftPattern => ({
  id: row.id,
  name: row.name,
  type: row.type,
  startTime: row.start_time,
  endTime: row.end_time,
  duration: row.duration,
  breakTime: row.break_time,
  isDefault: row.is_default,
  description: row.description || '',
});

// Query Keys
const QUERY_KEYS = {
  schedules: ['guard-schedules'] as const,
  patterns: ['shift-patterns'] as const,
  schedulesByGuard: (guardId: string) => ['guard-schedules', 'by-guard', guardId] as const,
  schedulesByDate: (date: string) => ['guard-schedules', 'by-date', date] as const,
  schedulesByStatus: (status: string) => ['guard-schedules', 'by-status', status] as const,
};

// Hook for fetching all guard schedules
export const useGuardSchedules = () => {
  return useQuery({
    queryKey: QUERY_KEYS.schedules,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guard_schedules')
        .select(`
          id,
          guard_id,
          shift_type,
          start_time,
          end_time,
          assigned_date,
          end_date,
          community_id,
          post_location,
          status,
          notes,
          replacement_id,
          created_at,
          updated_at
        `)
        .order('assigned_date', { ascending: false });

      if (error) {
        console.error('Error fetching guard schedules:', error);
        throw new Error(`Failed to fetch guard schedules: ${error.message}`);
      }

      // Fetch related data separately to avoid ambiguous relationships
      const schedules = data || [];
      const guardIds = [...new Set([...schedules.map(s => s.guard_id), ...schedules.map(s => s.replacement_id).filter(Boolean)])];
      const communityIds = [...new Set(schedules.map(s => s.community_id))];

      // Fetch guards data from profiles table
      const { data: guardsData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', guardIds);

      // Fetch communities data
      const { data: communitiesData } = await supabase
        .from('communities')
        .select('id, name, address')
        .in('id', communityIds);

      // Create lookup maps
      const guardsMap = new Map(guardsData?.map(g => [g.id, g]) || []);
      const communitiesMap = new Map(communitiesData?.map(s => [s.id, s]) || []);

      // Transform schedules with related data
      return schedules.map(schedule => ({
        id: schedule.id,
        guardId: schedule.guard_id,
        guardName: guardsMap.get(schedule.guard_id)?.full_name || 
                  `${guardsMap.get(schedule.guard_id)?.first_name} ${guardsMap.get(schedule.guard_id)?.last_name}` || 
                  'Unknown',
        shiftType: schedule.shift_type,
        startTime: schedule.start_time,
        endTime: schedule.end_time,
        assignedDate: schedule.assigned_date,
        endDate: schedule.end_date,
        communityId: schedule.community_id,
        communityName: communitiesMap.get(schedule.community_id)?.name || 'Unknown Community',
        postLocation: schedule.post_location,
        status: schedule.status,
        notes: schedule.notes,
        createdAt: schedule.created_at,
        replacementId: schedule.replacement_id,
        replacementName: schedule.replacement_id ? 
                        (guardsMap.get(schedule.replacement_id)?.full_name || 
                         `${guardsMap.get(schedule.replacement_id)?.first_name} ${guardsMap.get(schedule.replacement_id)?.last_name}`) :
                        undefined,
      }));
    },
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: true,
  });
};

// Hook for fetching shift patterns
export const useShiftPatterns = () => {
  return useQuery({
    queryKey: QUERY_KEYS.patterns,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shift_patterns')
        .select('*')
        .order('is_default', { ascending: false })
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching shift patterns:', error);
        throw new Error(`Failed to fetch shift patterns: ${error.message}`);
      }

      return data?.map(transformPatternRow) || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes (patterns change less frequently)
  });
};

// Hook for fetching schedules by date
export const useSchedulesByDate = (date: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.schedulesByDate(date),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guard_schedules')
        .select(`
          id,
          guard_id,
          shift_type,
          start_time,
          end_time,
          assigned_date,
          end_date,
          community_id,
          post_location,
          status,
          notes,
          replacement_id,
          created_at,
          updated_at
        `)
        .eq('assigned_date', date)
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching schedules by date:', error);
        throw new Error(`Failed to fetch schedules for ${date}: ${error.message}`);
      }

      const schedules = data || [];
      const guardIds = [...new Set([...schedules.map(s => s.guard_id), ...schedules.map(s => s.replacement_id).filter(Boolean)])];
      const communityIds = [...new Set(schedules.map(s => s.community_id))];

      // Fetch guards data
      const { data: guardsData } = await supabase
        .from('guards')
        .select('id, first_name, last_name, full_name, email')
        .in('id', guardIds);

      // Fetch communities data
      const { data: communitiesData } = await supabase
        .from('communities')
        .select('id, name, address')
        .in('id', communityIds);

      // Create lookup maps
      const guardsMap = new Map(guardsData?.map(g => [g.id, g]) || []);
      const communitiesMap = new Map(communitiesData?.map(c => [c.id, c]) || []);

      // Transform schedules with related data
      return schedules.map(schedule => ({
        id: schedule.id,
        guardId: schedule.guard_id,
        guardName: guardsMap.get(schedule.guard_id)?.full_name || 
                  `${guardsMap.get(schedule.guard_id)?.first_name} ${guardsMap.get(schedule.guard_id)?.last_name}` || 
                  'Unknown',
        shiftType: schedule.shift_type,
        startTime: schedule.start_time,
        endTime: schedule.end_time,
        assignedDate: schedule.assigned_date,
        endDate: schedule.end_date,
        communityId: schedule.community_id,
        communityName: communitiesMap.get(schedule.community_id)?.name || 'Unknown Community',
        postLocation: schedule.post_location,
        status: schedule.status,
        notes: schedule.notes,
        createdAt: schedule.created_at,
        replacementId: schedule.replacement_id,
        replacementName: schedule.replacement_id ? 
                        (guardsMap.get(schedule.replacement_id)?.full_name || 
                         `${guardsMap.get(schedule.replacement_id)?.first_name} ${guardsMap.get(schedule.replacement_id)?.last_name}`) :
                        undefined,
      }));
    },
    enabled: !!date,
    staleTime: 1000 * 60, // 1 minute
  });
};

// Mutation for creating a new schedule
export const useCreateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (scheduleData: CreateScheduleData) => {
      const { data, error } = await supabase
        .from('guard_schedules')
        .insert({
          guard_id: scheduleData.guardId,
          shift_type: scheduleData.shiftType,
          start_time: scheduleData.startTime,
          end_time: scheduleData.endTime,
          assigned_date: scheduleData.assignedDate,
          end_date: scheduleData.endDate || null,
          community_id: scheduleData.communityId,
          post_location: scheduleData.postLocation,
          notes: scheduleData.notes || null,
          status: 'scheduled',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating schedule:', error);
        throw new Error(`Failed to create schedule: ${error.message}`);
      }

      // Fetch related data separately
      const [guardResponse, communityResponse] = await Promise.all([
        supabase.from('guards').select('id, first_name, last_name, full_name, email').eq('id', data.guard_id).single(),
        supabase.from('communities').select('id, name, address').eq('id', data.community_id).single()
      ]);

      return {
        id: data.id,
        guardId: data.guard_id,
        guardName: guardResponse.data?.full_name || 
                  `${guardResponse.data?.first_name} ${guardResponse.data?.last_name}` || 
                  'Unknown',
        shiftType: data.shift_type,
        startTime: data.start_time,
        endTime: data.end_time,
        assignedDate: data.assigned_date,
        endDate: data.end_date,
        communityId: data.community_id,
        communityName: communityResponse.data?.name || 'Unknown Community',
        postLocation: data.post_location,
        status: data.status,
        notes: data.notes,
        createdAt: data.created_at,
        replacementId: data.replacement_id,
        replacementName: undefined,
      };
    },
    onSuccess: (newSchedule) => {
      // Invalidate and refetch schedules
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.schedules });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.schedulesByDate(newSchedule.assignedDate) });
      toast.success('Schedule created successfully!');
    },
    onError: (error: Error) => {
      console.error('Create schedule error:', error);
      toast.error(error.message || 'Failed to create schedule');
    },
  });
};

// Mutation for updating a schedule
export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, scheduleData }: { id: string; scheduleData: Partial<CreateScheduleData> }) => {
      const updateData: any = {};
      
      if (scheduleData.guardId) updateData.guard_id = scheduleData.guardId;
      if (scheduleData.shiftType) updateData.shift_type = scheduleData.shiftType;
      if (scheduleData.startTime) updateData.start_time = scheduleData.startTime;
      if (scheduleData.endTime) updateData.end_time = scheduleData.endTime;
      if (scheduleData.assignedDate) updateData.assigned_date = scheduleData.assignedDate;
      if (scheduleData.endDate !== undefined) updateData.end_date = scheduleData.endDate || null;
      if (scheduleData.communityId) updateData.community_id = scheduleData.communityId;
      if (scheduleData.postLocation) updateData.post_location = scheduleData.postLocation;
      if (scheduleData.notes !== undefined) updateData.notes = scheduleData.notes || null;

      const { data, error } = await supabase
        .from('guard_schedules')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating schedule:', error);
        throw new Error(`Failed to update schedule: ${error.message}`);
      }

      // Fetch related data separately
      const guardIds = [data.guard_id, data.replacement_id].filter(Boolean);
      const [guardsResponse, communityResponse] = await Promise.all([
        supabase.from('guards').select('id, first_name, last_name, full_name, email').in('id', guardIds),
        supabase.from('communities').select('id, name, address').eq('id', data.community_id).single()
      ]);

      const guardsMap = new Map(guardsResponse.data?.map(g => [g.id, g]) || []);

      return {
        id: data.id,
        guardId: data.guard_id,
        guardName: guardsMap.get(data.guard_id)?.full_name || 
                  `${guardsMap.get(data.guard_id)?.first_name} ${guardsMap.get(data.guard_id)?.last_name}` || 
                  'Unknown',
        shiftType: data.shift_type,
        startTime: data.start_time,
        endTime: data.end_time,
        assignedDate: data.assigned_date,
        endDate: data.end_date,
        communityId: data.community_id,
        communityName: communityResponse.data?.name || 'Unknown Community',
        postLocation: data.post_location,
        status: data.status,
        notes: data.notes,
        createdAt: data.created_at,
        replacementId: data.replacement_id,
        replacementName: data.replacement_id ? 
                        (guardsMap.get(data.replacement_id)?.full_name || 
                         `${guardsMap.get(data.replacement_id)?.first_name} ${guardsMap.get(data.replacement_id)?.last_name}`) :
                        undefined,
      };
    },
    onSuccess: (updatedSchedule) => {
      // Invalidate and refetch schedules
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.schedules });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.schedulesByDate(updatedSchedule.assignedDate) });
      toast.success('Schedule updated successfully!');
    },
    onError: (error: Error) => {
      console.error('Update schedule error:', error);
      toast.error(error.message || 'Failed to update schedule');
    },
  });
};

// Mutation for updating schedule status
export const useUpdateScheduleStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: GuardSchedule['status'] }) => {
      const { data, error } = await supabase
        .from('guard_schedules')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating schedule status:', error);
        throw new Error(`Failed to update schedule status: ${error.message}`);
      }

      // Fetch related data separately
      const [guardResponse, communityResponse] = await Promise.all([
        supabase.from('guards').select('id, first_name, last_name, full_name, email').eq('id', data.guard_id).single(),
        supabase.from('communities').select('id, name, address').eq('id', data.community_id).single()
      ]);

      return {
        id: data.id,
        guardId: data.guard_id,
        guardName: guardResponse.data?.full_name || 
                  `${guardResponse.data?.first_name} ${guardResponse.data?.last_name}` || 
                  'Unknown',
        shiftType: data.shift_type,
        startTime: data.start_time,
        endTime: data.end_time,
        assignedDate: data.assigned_date,
        endDate: data.end_date,
        communityId: data.community_id,
        communityName: communityResponse.data?.name || 'Unknown Community',
        postLocation: data.post_location,
        status: data.status,
        notes: data.notes,
        createdAt: data.created_at,
        replacementId: data.replacement_id,
        replacementName: undefined,
      };
    },
    onSuccess: (updatedSchedule) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.schedules });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.schedulesByDate(updatedSchedule.assignedDate) });
      toast.success('Schedule status updated successfully!');
    },
    onError: (error: Error) => {
      console.error('Update schedule status error:', error);
      toast.error(error.message || 'Failed to update schedule status');
    },
  });
};

// Mutation for deleting a schedule
export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('guard_schedules')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting schedule:', error);
        throw new Error(`Failed to delete schedule: ${error.message}`);
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.schedules });
      toast.success('Schedule deleted successfully!');
    },
    onError: (error: Error) => {
      console.error('Delete schedule error:', error);
      toast.error(error.message || 'Failed to delete schedule');
    },
  });
};

// Mutation for creating a shift pattern
export const useCreateShiftPattern = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patternData: CreatePatternData) => {
      const { data, error } = await supabase
        .from('shift_patterns')
        .insert({
          name: patternData.name,
          type: patternData.type,
          start_time: patternData.startTime,
          end_time: patternData.endTime,
          duration: patternData.duration,
          break_time: patternData.breakTime,
          is_default: patternData.isDefault,
          description: patternData.description,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating shift pattern:', error);
        throw new Error(`Failed to create shift pattern: ${error.message}`);
      }

      return transformPatternRow(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.patterns });
      toast.success('Shift pattern created successfully!');
    },
    onError: (error: Error) => {
      console.error('Create pattern error:', error);
      toast.error(error.message || 'Failed to create shift pattern');
    },
  });
};

// Real-time subscription for schedules
export const useSchedulesSubscription = () => {
  const queryClient = useQueryClient();

  return supabase
    .channel('guard_schedules_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'guard_schedules',
      },
      (payload) => {
        console.log('Guard schedules change detected:', payload);
        // Invalidate schedules queries to refetch fresh data
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.schedules });
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'shift_patterns',
      },
      (payload) => {
        console.log('Shift patterns change detected:', payload);
        // Invalidate patterns queries to refetch fresh data
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.patterns });
      }
    )
    .subscribe();
};

// Hook to setup real-time subscriptions
export const useGuardSchedulesRealtime = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('guard_schedules_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guard_schedules',
        },
        (payload) => {
          console.log('Guard schedules change detected:', payload);
          // Invalidate schedules queries to refetch fresh data
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.schedules });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shift_patterns',
        },
        (payload) => {
          console.log('Shift patterns change detected:', payload);
          // Invalidate patterns queries to refetch fresh data
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.patterns });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
