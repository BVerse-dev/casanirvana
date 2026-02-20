"use client";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export type JoinRequest = {
  id: string;
  user_id: string;
  community_id?: string;
  unit_id?: string;
  comments?: string;
  status: 'pending' | 'approved' | 'rejected' | 'pending_manual_review';
  created_at: string;
  updated_at?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  community_name?: string;
  manual_unit_info?: string;
  is_manual_entry: boolean;
  // Joined data from profiles
  full_name?: string;
  email?: string;
  phone?: string;
  // Joined data from communities/units
  community_name?: string;
  unit_number?: string;
  unit_block?: string;
};

export type CreateJoinRequestData = {
  user_id: string;
  community_id?: string;
  unit_id?: string;
  comments?: string;
  community_name?: string;
  manual_unit_info?: string;
  is_manual_entry?: boolean;
};

export type UpdateJoinRequestData = {
  id: string;
  status?: 'pending' | 'approved' | 'rejected' | 'pending_manual_review';
  review_notes?: string;
  reviewed_by?: string;
};

// List all join requests
export const useListJoinRequests = () => {
  return useQuery({
    queryKey: ['join-requests'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('join_requests')
          .select(`
            *,
            user_profile:profiles!join_requests_user_id_fkey (
              full_name,
              email,
              phone,
              first_name,
              last_name
            ),
            reviewer_profile:profiles!join_requests_reviewed_by_fkey (
              full_name,
              first_name,
              last_name
            ),
            communities (
              id,
              name
            ),
            units (
              id,
              number,
              block
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching join requests:', error);
          throw error;
        }

        // Transform the data to flatten the nested objects
        const transformedData = data?.map(item => ({
          ...item,
          full_name: item.user_profile?.full_name || `${item.user_profile?.first_name} ${item.user_profile?.last_name}`,
          email: item.user_profile?.email,
          phone: item.user_profile?.phone,
          reviewer_name: item.reviewer_profile?.full_name || `${item.reviewer_profile?.first_name} ${item.reviewer_profile?.last_name}`,
          community_name: item.communities?.name,
          unit_number: item.units?.number,
          unit_block: item.units?.block,
          // Remove the nested objects to avoid duplication
          user_profile: undefined,
          reviewer_profile: undefined,
          communities: undefined,
          units: undefined,
        })) || [];

        return transformedData;
      } catch (error) {
        console.error('Error in useListJoinRequests:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time updates
  });
};

// Get a specific join request by ID
export const useGetJoinRequest = (id: string) => {
  return useQuery({
    queryKey: ['join-request', id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('join_requests')
          .select(`
            *,
            communities (
              id,
              name
            ),
            units (
              id,
              number,
              block
            )
          `)
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching join request:', error);
          throw error;
        }

        return data;
      } catch (error) {
        console.error('Error in useGetJoinRequest:', error);
        throw error;
      }
    },
    enabled: !!id,
  });
};

// Create a new join request
export const useCreateJoinRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (joinRequestData: CreateJoinRequestData) => {
      try {
        const { data, error } = await supabase
          .from('join_requests')
          .insert({
            ...joinRequestData,
            status: 'pending',
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating join request:', error);
          throw error;
        }

        return data;
      } catch (error) {
        console.error('Error in useCreateJoinRequest:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch join requests
      queryClient.invalidateQueries({ queryKey: ['join-requests'] });
    },
  });
};

// Update a join request (mainly for status changes and admin notes)
export const useUpdateJoinRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateJoinRequestData) => {
      try {
        const updates: any = {
          ...updateData,
          updated_at: new Date().toISOString(),
        };

        // If status is being updated, also set reviewed timestamp
        if (updateData.status && updateData.status !== 'pending') {
          updates.reviewed_at = new Date().toISOString();
        }

        const { data, error } = await supabase
          .from('join_requests')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Error updating join request:', error);
          throw error;
        }

        return data;
      } catch (error) {
        console.error('Error in useUpdateJoinRequest:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidate and refetch join requests
      queryClient.invalidateQueries({ queryKey: ['join-requests'] });
      // Also invalidate the specific join request
      queryClient.invalidateQueries({ queryKey: ['join-request', data.id] });
    },
  });
};

// Delete a join request
export const useDeleteJoinRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const { error } = await supabase
          .from('join_requests')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting join request:', error);
          throw error;
        }

        return id;
      } catch (error) {
        console.error('Error in useDeleteJoinRequest:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch join requests
      queryClient.invalidateQueries({ queryKey: ['join-requests'] });
    },
  });
};

// Get join requests by status
export const useJoinRequestsByStatus = (status: 'pending' | 'approved' | 'rejected' | 'pending_manual_review') => {
  return useQuery({
    queryKey: ['join-requests', 'status', status],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('join_requests')
          .select(`
            *,
            profiles (
              full_name,
              email,
              phone
            ),
            communities (
              id,
              name
            ),
            units (
              id,
              number,
              block
            )
          `)
          .eq('status', status)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching join requests by status:', error);
          throw error;
        }

        // Transform the data to flatten the nested objects
        const transformedData = data?.map(item => ({
          ...item,
          full_name: item.profiles?.full_name,
          email: item.profiles?.email,
          phone: item.profiles?.phone,
          community_name: item.communities?.name,
          unit_number: item.units?.number,
          unit_block: item.units?.block,
          // Remove the nested objects to avoid duplication
          profiles: undefined,
          communities: undefined,
          units: undefined,
        })) || [];

        return transformedData;
      } catch (error) {
        console.error('Error in useJoinRequestsByStatus:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get pending join requests count for notifications
export const usePendingJoinRequestsCount = () => {
  return useQuery({
    queryKey: ['join-requests', 'pending-count'],
    queryFn: async () => {
      try {
        const { count, error } = await supabase
          .from('join_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        if (error) {
          console.error('Error fetching pending join requests count:', error);
          throw error;
        }

        return count || 0;
      } catch (error) {
        console.error('Error in usePendingJoinRequestsCount:', error);
        throw error;
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};
