import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Types matching the UI interface and database schema
export interface AgencyProfile {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone?: string;
  email?: string;
  website?: string;
  agency_type: 'residential' | 'commercial' | 'mixed' | 'luxury';
  category: 'premium' | 'standard' | 'budget';
  status: 'active' | 'inactive' | 'suspended' | 'pending_approval';
  total_properties: number;
  total_agents: number;
  total_clients: number;
  established_year: number;
  license_number?: string;
  owner_name?: string;
  manager_name?: string;
  commission_rate: number;
  average_deal_value: number;
  description?: string;
  
  // Bank Details (4 fields)
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  account_holder_name?: string;
  
  // Additional metadata
  services?: string[];
  specializations?: string[];
  documents?: any;
  contact_persons?: any[];
  
  created_at?: string;
  updated_at?: string;
}

export interface CreateAgencyProfileData {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone?: string;
  email?: string;
  website?: string;
  agency_type: string;
  category: string;
  status?: string;
  total_properties?: number;
  total_agents?: number;
  total_clients?: number;
  established_year: number;
  license_number?: string;
  owner_name?: string;
  manager_name?: string;
  commission_rate?: number;
  average_deal_value?: number;
  description?: string;
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  account_holder_name?: string;
  services?: string[];
  specializations?: string[];
  documents?: any;
  contact_persons?: any[];
}

export interface UpdateAgencyProfileData extends Partial<CreateAgencyProfileData> {
  id: string;
}

// Data transformation functions
const transformFromDB = (data: any): AgencyProfile => {
  return {
    id: data.id,
    name: data.name,
    address: data.address,
    city: data.city,
    state: data.state,
    pincode: data.pincode,
    phone: data.phone,
    email: data.email,
    website: data.website,
    agency_type: data.agency_type,
    category: data.category,
    status: data.status,
    total_properties: data.total_properties || 0,
    total_agents: data.total_agents || 1,
    total_clients: data.total_clients || 0,
    established_year: data.established_year,
    license_number: data.license_number,
    owner_name: data.owner_name,
    manager_name: data.manager_name,
    commission_rate: data.commission_rate || 2.5,
    average_deal_value: data.average_deal_value || 0,
    description: data.description,
    bank_name: data.bank_name,
    account_number: data.account_number,
    ifsc_code: data.ifsc_code,
    account_holder_name: data.account_holder_name,
    services: data.services || [],
    specializations: data.specializations || [],
    documents: data.documents || {},
    contact_persons: data.contact_persons || [],
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

const transformToDB = (data: CreateAgencyProfileData | UpdateAgencyProfileData) => {
  return {
    ...data,
    // Ensure proper field mapping
    total_properties: data.total_properties || 0,
    total_agents: data.total_agents || 1,
    total_clients: data.total_clients || 0,
    commission_rate: data.commission_rate || 2.5,
    average_deal_value: data.average_deal_value || 0,
    services: data.services || [],
    specializations: data.specializations || [],
    documents: data.documents || {},
    contact_persons: data.contact_persons || [],
  };
};

// Hook to get all agency profiles
export const useAgencyProfiles = () => {
  return useQuery({
    queryKey: ['agencyProfiles'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('agency_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data?.map(transformFromDB) || [];
    },
  });
};

// Hook to get agency profiles with filters
export const useFilteredAgencyProfiles = (filters: {
  agencyType?: string;
  category?: string;
  status?: string;
  searchTerm?: string;
}) => {
  return useQuery({
    queryKey: ['agencyProfiles', 'filtered', filters],
    queryFn: async () => {
      let query = (supabase as any).from('agency_profiles').select('*');

      if (filters.agencyType && filters.agencyType !== 'all') {
        query = query.eq('agency_type', filters.agencyType);
      }
      if (filters.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.searchTerm) {
        query = query.or(`name.ilike.%${filters.searchTerm}%,city.ilike.%${filters.searchTerm}%,owner_name.ilike.%${filters.searchTerm}%`);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data?.map(transformFromDB) || [];
    },
  });
};

// Hook to get single agency profile by ID
export const useAgencyProfile = (id: string) => {
  return useQuery({
    queryKey: ['agencyProfile', id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('agency_profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data ? transformFromDB(data) : null;
    },
    enabled: !!id,
  });
};

// Hook to create a new agency profile
export const useCreateAgencyProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAgencyProfileData) => {
      const transformedData = transformToDB(data);
      const { data: result, error } = await (supabase as any)
        .from('agency_profiles')
        .insert([transformedData])
        .select()
        .single();

      if (error) throw error;
      return transformFromDB(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencyProfiles'] });
    },
  });
};

// Hook to update an existing agency profile
export const useUpdateAgencyProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateAgencyProfileData) => {
      const { id, ...updateData } = data;
      const transformedData = transformToDB(updateData as CreateAgencyProfileData);
      
      const { data: result, error } = await (supabase as any)
        .from('agency_profiles')
        .update(transformedData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return transformFromDB(result);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['agencyProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['agencyProfile', data.id] });
    },
  });
};

// Hook to delete an agency profile
export const useDeleteAgencyProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('agency_profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencyProfiles'] });
    },
  });
};

// Hook to get agency statistics
export const useAgencyStatistics = () => {
  return useQuery({
    queryKey: ['agencyStatistics'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('agency_profiles')
        .select('total_properties, total_agents, total_clients, status, category, agency_type');

      if (error) throw error;

      const profiles = data || [];
      
      // Use more robust aggregation with explicit type checking
      let totalProperties = 0;
      let totalAgents = 0;
      let totalClients = 0;
      
      profiles.forEach((profile: any) => {
        // Convert to numbers and handle null/undefined values
        const props = parseInt(profile.total_properties) || 0;
        const agents = parseInt(profile.total_agents) || 0;
        const clients = parseInt(profile.total_clients) || 0;
        
        totalProperties += props;
        totalAgents += agents;
        totalClients += clients;
      });

      return {
        totalAgencies: profiles.length,
        activeAgencies: profiles.filter((p: any) => p.status === 'active').length,
        totalProperties: totalProperties,
        totalClients: totalClients,
        totalAgents: totalAgents,
        categoryBreakdown: {
          premium: profiles.filter((p: any) => p.category === 'premium').length,
          standard: profiles.filter((p: any) => p.category === 'standard').length,
          budget: profiles.filter((p: any) => p.category === 'budget').length,
        },
        typeBreakdown: {
          residential: profiles.filter((p: any) => p.agency_type === 'residential').length,
          commercial: profiles.filter((p: any) => p.agency_type === 'commercial').length,
          mixed: profiles.filter((p: any) => p.agency_type === 'mixed').length,
          luxury: profiles.filter((p: any) => p.agency_type === 'luxury').length,
        },
      };
    },
  });
}; 