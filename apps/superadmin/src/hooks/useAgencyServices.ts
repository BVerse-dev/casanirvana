import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface AgencyService {
  id: string;
  agency_id: string;
  name: string;
  category: string;
  description: string;
  basePrice: number;
  commissionRate: number;
  duration: string;
  availability: 'Available' | 'Limited' | 'Unavailable';
  requirements?: string;
  status: 'Active' | 'Beta' | 'Inactive' | 'Discontinued';
  targetMarket: string;
  features: string[];
  tags: string[];
  bookings?: number;
  revenue?: number;
  rating?: number;
  completionRate?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAgencyServiceData {
  agency_id: string;
  name: string;
  category: string;
  description: string;
  base_price: number;
  commission_rate: number;
  duration: string;
  availability: string;
  requirements?: string;
  status?: string;
  target_market: string;
  features?: string[];
  tags?: string[];
}

export interface UpdateAgencyServiceData extends Partial<CreateAgencyServiceData> {
  id: string;
}

const transformFromDB = (data: any): AgencyService => ({
  id: data.id,
  agency_id: data.agency_id,
  name: data.name ?? data.service_name,
  category: data.category,
  description: data.description,
  basePrice: data.basePrice ?? data.base_price,
  commissionRate: data.commissionRate ?? data.commission_rate,
  duration: data.duration,
  availability: data.availability,
  requirements: data.requirements,
  status: data.status,
  targetMarket: data.targetMarket ?? data.target_market,
  features: data.features || [],
  tags: data.tags || [],
  bookings: data.bookings || 0,
  revenue: data.revenue || 0,
  rating: data.rating || 0,
  completionRate: data.completionRate ?? data.completion_rate,
  created_at: data.created_at,
  updated_at: data.updated_at,
});

export const useAgencyServices = (agencyId?: string) => {
  return useQuery({
    queryKey: ['agencyServices', agencyId],
    queryFn: async () => {
      let query = (supabase as any).from('agency_services').select('*');
      if (agencyId) query = query.eq('agency_id', agencyId);
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      if (error) throw error;
      return data?.map(transformFromDB) || [];
    },
  });
};

export const useAgencyService = (id: string) => {
  return useQuery({
    queryKey: ['agencyService', id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('agency_services')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data ? transformFromDB(data) : null;
    },
    enabled: !!id,
  });
};

export const useCreateAgencyService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateAgencyServiceData) => {
      const { data: result, error } = await (supabase as any)
        .from('agency_services')
        .insert([{ ...data, features: data.features || [], tags: data.tags || [] }])
        .select()
        .single();
      if (error) throw error;
      return transformFromDB(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencyServices'] });
    },
  });
};

export const useUpdateAgencyService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateAgencyServiceData) => {
      const { id, ...updateData } = data;
      const { data: result, error } = await (supabase as any)
        .from('agency_services')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return transformFromDB(result);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['agencyServices'] });
      queryClient.invalidateQueries({ queryKey: ['agencyService', data.id] });
    },
  });
};

export const useDeleteAgencyService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('agency_services')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencyServices'] });
    },
  });
}; 