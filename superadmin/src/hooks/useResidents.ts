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
  // Legacy compatibility with older forms
  society_id?: string;
  
  // Emergency Contact
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  
  // System Fields
  role: 'resident' | 'tenant' | 'admin';
  status?: 'active' | 'inactive' | 'suspended' | 'pending';
  is_active?: boolean;
};

export type UpdateResidentData = Partial<CreateResidentData>;

type ResidentQueryResult = Resident & {
  communities?: {
    id: string;
    name: string;
  } | null;
  units?: {
    id: string;
    block: string;
    number: string;
    community_id: string;
  } | null;
  community?: {
    id: string;
    name: string;
  } | null;
  roles?: unknown;
};

const RESIDENT_ROLES = ['user', 'resident', 'tenant'];

const normalizeRole = (role?: string | null): 'resident' | 'tenant' | 'admin' | string => {
  if (!role) return 'resident';

  if (role.toLowerCase() === 'tenant') return 'tenant';
  if (role.toLowerCase() === 'admin') return 'admin';
  return 'resident';
};

const normalizeStatus = (status?: string | null, isActive?: boolean | null): 'active' | 'inactive' | 'suspended' | 'pending' => {
  if (status === 'inactive' || status === 'suspended' || status === 'pending') {
    return status;
  }
  if (isActive === false) {
    return 'inactive';
  }
  return 'active';
};

const buildResidentCreatePayload = (residentData: CreateResidentData) => {
  const role = normalizeRole(residentData.role);
  const status = normalizeStatus(residentData.status, residentData.is_active);
  const communityId = residentData.community_id || residentData.society_id;

  return {
    ...residentData,
    role,
    status,
    is_active: status === 'active',
    community_id: communityId || null,
    unit_id: residentData.unit_id || null,
    phone: residentData.phone || residentData.mobile || null,
  };
};

const normalizeResidentRow = (resident: ResidentQueryResult) => {
  const fullName = `${resident.first_name || ''} ${resident.last_name || ''}`.trim() || resident.full_name || 'N/A';
  const community = resident.communities || resident.community;

  return {
    ...(resident as Resident),
    communities: community ? {
      id: community.id,
      name: community.name,
    } : undefined,
    societies: community ? {
      id: community.id,
      name: community.name,
    } : undefined,
    full_name: fullName,
    unit_number: resident.units ? `${resident.units.block}-${resident.units.number}` : 'N/A',
    is_active: resident.is_active ?? false,
    role: normalizeRole(resident.role),
    status: normalizeStatus(resident.status, resident.is_active),
    community_id: resident.community_id || resident.units?.community_id,
  };
};

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
          communities!profiles_society_id_fkey (
            id,
            name
          )
        `)
        .in('role', RESIDENT_ROLES)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching residents:", error);
        throw new Error(`Failed to fetch residents: ${error.message}`);
      }

      const transformedData = (data || []).map((resident: ResidentQueryResult) => normalizeResidentRow(resident));

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
          communities!profiles_society_id_fkey (
            id,
            name
          )
        `)
        .in('role', RESIDENT_ROLES)
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

      return normalizeResidentRow(data as ResidentQueryResult) as Resident;
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
          .insert([buildResidentCreatePayload(residentData)])
          .select()
          .single();

      if (error) throw error;
      return normalizeResidentRow(data as ResidentQueryResult);
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
            ...buildResidentCreatePayload(residentData as CreateResidentData),
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return normalizeResidentRow(data as ResidentQueryResult);
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
        .in('role', RESIDENT_ROLES)
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching residents by community:", error);
        throw new Error(`Failed to fetch community residents: ${error.message}`);
      }

      const transformedData = (data || []).map((resident: ResidentQueryResult) => normalizeResidentRow(resident));
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
        .in('role', RESIDENT_ROLES)
        .eq('unit_id', unitId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching residents by unit:", error);
        throw new Error(`Failed to fetch unit residents: ${error.message}`);
      }

      const transformedData = (data || []).map((resident: ResidentQueryResult) => normalizeResidentRow(resident));
      return transformedData as Resident[];
    },
    enabled: !!unitId,
  });
};
