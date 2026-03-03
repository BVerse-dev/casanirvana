"use client";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ResidentProfile } from '@/assets/data/residents';

export type Resident = ResidentProfile;

export type CreateResidentData = {
  // Basic Information
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  mobile?: string; // Alternative phone field
  date_of_birth?: string;
  address?: string;
  avatar_url?: string;
  
  // Unit & Community
  unit_number?: string;
  block_number?: string;
  unit_id?: string;
  community_id?: string;
  
  // Emergency Contact
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  
  // System Fields
  role: 'resident' | 'tenant' | 'admin';
  status?: 'active' | 'inactive' | 'suspended' | 'pending';
};

export type UpdateResidentData = Partial<CreateResidentData>;

// List all residents
export const useListResidents = () => {
  return useQuery({
    queryKey: ['residents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          units!profiles_unit_id_fkey (
            id,
            block,
            number,
            community_id
          ),
          community:communities!profiles_society_id_fkey (
            id,
            name
          )
        `)
        .eq('role', 'user')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching residents:", error);
        throw new Error(`Failed to fetch residents: ${error.message}`);
      }

      // Transform database data to match expected format
      const transformedData = (data || []).map((resident: any) => ({
        ...resident,
        full_name: `${resident.first_name || ''} ${resident.last_name || ''}`.trim(),
        unit_number: resident.units ? `${resident.units.block}-${resident.units.number}` : 'N/A',
        is_active: resident.is_active ?? true,
        avatar_url: resident.avatar_url
      }));

      return transformedData as Resident[];
    },
  });
};

// Get single resident
export const useGetResident = (id: string) => {
  return useQuery({
    queryKey: ['residents', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          units!profiles_unit_id_fkey (
            id,
            block,
            number,
            community_id
          ),
          community:communities!profiles_society_id_fkey (
            id,
            name
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Error fetching resident by id:', error);
        throw new Error(`Failed to fetch resident: ${error.message}`);
      }

      if (!data) {
        return null;
      }

      // Transform database data to match expected format
      const transformedData = {
        ...data,
        full_name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
        unit_number: data.units ? `${data.units.block}-${data.units.number}` : 'N/A',
        is_active: data.is_active ?? true,
        avatar_url: data.avatar_url
      };

      return transformedData as Resident;
    },
    enabled: !!id,
  });
};

// Create new resident
export const useCreateResident = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (residentData: CreateResidentData) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .insert([{
            ...residentData,
            role: residentData.role || 'RESIDENT',
            is_active: residentData.status === 'active' || true,
          }])
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.error("Database insert failed:", err);
        const message = err instanceof Error ? err.message : 'Failed to create resident profile';
        throw new Error(message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
    },
  });
};

// Update resident
export const useUpdateResident = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (residentData: UpdateResidentData) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update({
            ...residentData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.error("Database update failed:", err);
        const message = err instanceof Error ? err.message : 'Failed to update resident profile';
        throw new Error(message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      queryClient.invalidateQueries({ queryKey: ['residents', id] });
    },
  });
};

// Delete resident
export const useDeleteResident = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', id);

        if (error) throw error;
        return id;
      } catch (err) {
        console.error("Database delete failed:", err);
        const message = err instanceof Error ? err.message : 'Failed to delete resident profile';
        throw new Error(message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
    },
  });
};

// Get residents by community
export const useResidentsByCommunity = (communityId: string) => {
  return useQuery({
    queryKey: ['residents', 'community', communityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          units (
            id,
            block,
            number,
            community_id
          )
        `)
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching residents by community:", error);
        throw new Error(`Failed to fetch community residents: ${error.message}`);
      }

      // Transform database data to match expected format
      const transformedData = (data || []).map((resident: any) => ({
        ...resident,
        full_name: `${resident.first_name || ''} ${resident.last_name || ''}`.trim(),
        unit_number: resident.units ? `${resident.units.block}-${resident.units.number}` : 'N/A',
        is_active: resident.is_active ?? true,
        avatar_url: resident.avatar_url
      }));

      return transformedData as Resident[];
    },
    enabled: !!communityId,
  });
};

// Get residents by unit
export const useResidentsByUnit = (unitId: string) => {
  return useQuery({
    queryKey: ['residents', 'unit', unitId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('unit_id', unitId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching residents by unit:", error);
        throw new Error(`Failed to fetch unit residents: ${error.message}`);
      }

      // Transform database data to match expected format
      const transformedData = (data || []).map((resident: any) => ({
        ...resident,
        full_name: `${resident.first_name || ''} ${resident.last_name || ''}`.trim(),
        is_active: resident.is_active ?? true,
        avatar_url: resident.avatar_url
      }));

      return transformedData as Resident[];
    },
    enabled: !!unitId,
  });
};
