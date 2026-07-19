'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Types
export interface CommunityStaff {
  id: string;
  community_id: string;
  user_id: string;
  staff_type: 'manager' | 'security' | 'maintenance' | 'administrative' | 'cleaning' | 'gardening' | 'reception' | 'other';
  position: string;
  department: string;
  employee_id: string;
  hire_date: string;
  salary: number;
  contact_number: string;
  emergency_contact: string;
  address: string;
  qualifications: string[];
  certifications: string[];
  duties: string[];
  shift_schedule: Record<string, any>;
  reporting_manager_id: string;
  performance_rating: number;
  notes: string;
  documents: Record<string, any>[];
  is_active: boolean;
  last_performance_review: string;
  next_performance_review: string;
  created_at: string;
  updated_at: string;
  // Relations
  community?: any;
  user?: any;
  reporting_manager?: any;
}

export interface CreateCommunityStaffData {
  community_id: string;
  user_id: string;
  staff_type: 'manager' | 'security' | 'maintenance' | 'administrative' | 'cleaning' | 'gardening' | 'reception' | 'other';
  position: string;
  department?: string;
  employee_id?: string;
  hire_date?: string;
  salary?: number;
  contact_number?: string;
  emergency_contact?: string;
  address?: string;
  qualifications?: string[];
  certifications?: string[];
  duties?: string[];
  shift_schedule?: Record<string, any>;
  reporting_manager_id?: string;
  performance_rating?: number;
  notes?: string;
  documents?: Record<string, any>[];
  is_active?: boolean;
  last_performance_review?: string;
  next_performance_review?: string;
}

export interface UpdateCommunityStaffData extends Partial<CreateCommunityStaffData> {}

// Query Keys
const QUERY_KEYS = {
  communityStaff: ['community_staff'] as const,
  communityStaffMember: (id: string) => ['community_staff', id] as const,
  communityStaffByCommunity: (communityId: string) => ['community_staff', 'community', communityId] as const,
  communityStaffByType: (staffType: string) => ['community_staff', 'type', staffType] as const,
  activeCommunityStaff: ['community_staff', 'active'] as const,
};

// Helper function to parse community staff data
const parseCommunityStaffData = (data: any): CommunityStaff => {
  return {
    id: data.id,
    community_id: data.community_id,
    user_id: data.user_id,
    staff_type: data.staff_type || 'other',
    position: data.position || '',
    department: data.department || '',
    employee_id: data.employee_id || '',
    hire_date: data.hire_date,
    salary: data.salary || 0,
    contact_number: data.contact_number || '',
    emergency_contact: data.emergency_contact || '',
    address: data.address || '',
    qualifications: data.qualifications || [],
    certifications: data.certifications || [],
    duties: data.duties || [],
    shift_schedule: data.shift_schedule || {},
    reporting_manager_id: data.reporting_manager_id,
    performance_rating: data.performance_rating || 0,
    notes: data.notes || '',
    documents: data.documents || [],
    is_active: data.is_active ?? true,
    last_performance_review: data.last_performance_review,
    next_performance_review: data.next_performance_review,
    created_at: data.created_at,
    updated_at: data.updated_at,
    // Relations
    community: data.community,
    user: data.user,
    reporting_manager: data.reporting_manager,
  };
};

// Hooks

// List all community staff
export const useListCommunityStaff = () => {
  return useQuery({
    queryKey: QUERY_KEYS.communityStaff,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_staff')
        .select(`
          *,
          community:communities(id, name, address),
          user:profiles(id, first_name, last_name, email, avatar_url),
          reporting_manager:profiles!community_staff_reporting_manager_id_fkey(id, first_name, last_name)
        `)
        .order('position');

      if (error) {
        console.error('Error fetching community staff:', error);
        throw new Error(`Failed to fetch community staff: ${error.message}`);
      }

      return data?.map(parseCommunityStaffData) || [];
    },
  });
};

// Get active community staff
export const useActiveCommunityStaff = () => {
  return useQuery({
    queryKey: QUERY_KEYS.activeCommunityStaff,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_staff')
        .select(`
          *,
          community:communities(id, name, address),
          user:profiles(id, first_name, last_name, email, avatar_url),
          reporting_manager:profiles!community_staff_reporting_manager_id_fkey(id, first_name, last_name)
        `)
        .eq('is_active', true)
        .order('position');

      if (error) {
        console.error('Error fetching active community staff:', error);
        throw new Error(`Failed to fetch active community staff: ${error.message}`);
      }

      return data?.map(parseCommunityStaffData) || [];
    },
  });
};

// Get community staff by ID
export const useGetCommunityStaff = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.communityStaffMember(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_staff')
        .select(`
          *,
          community:communities(id, name, address, contact_number, email),
          user:profiles(id, first_name, last_name, email, phone, avatar_url),
          reporting_manager:profiles!community_staff_reporting_manager_id_fkey(id, first_name, last_name, email)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching community staff member:', error);
        throw new Error(`Failed to fetch community staff member: ${error.message}`);
      }

      return parseCommunityStaffData(data);
    },
    enabled: !!id,
  });
};

// Get community staff by community
export const useGetCommunityStaffByCommunity = (communityId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.communityStaffByCommunity(communityId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_staff')
        .select(`
          *,
          user:profiles(id, first_name, last_name, email, phone, avatar_url),
          reporting_manager:profiles!community_staff_reporting_manager_id_fkey(id, first_name, last_name)
        `)
        .eq('community_id', communityId)
        .order('position');

      if (error) {
        console.error('Error fetching community staff by community:', error);
        throw new Error(`Failed to fetch community staff: ${error.message}`);
      }

      return data?.map(parseCommunityStaffData) || [];
    },
    enabled: !!communityId,
  });
};

// Get community staff by type
export const useGetCommunityStaffByType = (staffType: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.communityStaffByType(staffType),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_staff')
        .select(`
          *,
          community:communities(id, name, address),
          user:profiles(id, first_name, last_name, email, avatar_url),
          reporting_manager:profiles!community_staff_reporting_manager_id_fkey(id, first_name, last_name)
        `)
        .eq('staff_type', staffType)
        .eq('is_active', true)
        .order('position');

      if (error) {
        console.error('Error fetching community staff by type:', error);
        throw new Error(`Failed to fetch community staff: ${error.message}`);
      }

      return data?.map(parseCommunityStaffData) || [];
    },
    enabled: !!staffType,
  });
};

// Create community staff
export const useCreateCommunityStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newCommunityStaff: CreateCommunityStaffData) => {
      const { data, error } = await supabase
        .from('community_staff')
        .insert(newCommunityStaff as any)
        .select(`
          *,
          community:communities(id, name, address),
          user:profiles(id, first_name, last_name, email, avatar_url),
          reporting_manager:profiles!community_staff_reporting_manager_id_fkey(id, first_name, last_name)
        `)
        .single();

      if (error) {
        console.error('Error creating community staff:', error);
        throw new Error(`Failed to create community staff: ${error.message}`);
      }

      return parseCommunityStaffData(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.communityStaff });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeCommunityStaff });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.communityStaffByCommunity(data.community_id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.communityStaffByType(data.staff_type) });
    },
  });
};

// Update community staff
export const useUpdateCommunityStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateCommunityStaffData }) => {
      const { data, error } = await supabase
        .from('community_staff')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          community:communities(id, name, address),
          user:profiles(id, first_name, last_name, email, avatar_url),
          reporting_manager:profiles!community_staff_reporting_manager_id_fkey(id, first_name, last_name)
        `)
        .single();

      if (error) {
        console.error('Error updating community staff:', error);
        throw new Error(`Failed to update community staff: ${error.message}`);
      }

      return parseCommunityStaffData(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.communityStaff });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.communityStaffMember(data.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeCommunityStaff });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.communityStaffByCommunity(data.community_id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.communityStaffByType(data.staff_type) });
    },
  });
};

// Delete community staff
export const useDeleteCommunityStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('community_staff')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting community staff:', error);
        throw new Error(`Failed to delete community staff: ${error.message}`);
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.communityStaff });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeCommunityStaff });
    },
  });
};

// Toggle community staff active status
export const useToggleCommunityStaffStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data, error } = await supabase
        .from('community_staff')
        .update({ is_active: isActive })
        .eq('id', id)
        .select(`
          *,
          community:communities(id, name, address),
          user:profiles(id, first_name, last_name, email, avatar_url),
          reporting_manager:profiles!community_staff_reporting_manager_id_fkey(id, first_name, last_name)
        `)
        .single();

      if (error) {
        console.error('Error toggling community staff status:', error);
        throw new Error(`Failed to update community staff status: ${error.message}`);
      }

      return parseCommunityStaffData(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.communityStaff });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.communityStaffMember(data.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeCommunityStaff });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.communityStaffByCommunity(data.community_id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.communityStaffByType(data.staff_type) });
    },
  });
};

// Update performance rating
export const useUpdatePerformanceRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, rating, notes }: { id: string; rating: number; notes?: string }) => {
      const updateData: any = { 
        performance_rating: rating,
        last_performance_review: new Date().toISOString(),
      };
      
      if (notes) {
        updateData.notes = notes;
      }

      const { data, error } = await supabase
        .from('community_staff')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          community:communities(id, name, address),
          user:profiles(id, first_name, last_name, email, avatar_url),
          reporting_manager:profiles!community_staff_reporting_manager_id_fkey(id, first_name, last_name)
        `)
        .single();

      if (error) {
        console.error('Error updating performance rating:', error);
        throw new Error(`Failed to update performance rating: ${error.message}`);
      }

      return parseCommunityStaffData(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.communityStaff });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.communityStaffMember(data.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.communityStaffByCommunity(data.community_id) });
    },
  });
};

// Bulk update community staff
export const useBulkUpdateCommunityStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Array<{ id: string; data: UpdateCommunityStaffData }>) => {
      const promises = updates.map(({ id, data }) =>
        supabase
          .from('community_staff')
          .update(data)
          .eq('id', id)
          .select(`
            *,
            community:communities(id, name, address),
            user:profiles(id, first_name, last_name, email, avatar_url),
            reporting_manager:profiles!community_staff_reporting_manager_id_fkey(id, first_name, last_name)
          `)
          .single()
      );

      const results = await Promise.all(promises);
      
      // Check for errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error('Errors in bulk update:', errors);
        throw new Error(`Failed to update some community staff members`);
      }

      return results.map(result => parseCommunityStaffData(result.data));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.communityStaff });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeCommunityStaff });
    },
  });
};
