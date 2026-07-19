import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface AgencyFinance {
  id: string;
  agency_id: string;
  name: string;
  type: string;
  amount: number;
  frequency: string;
  due_date: string;
  payment_method: string;
  status: 'Active' | 'Inactive' | 'Pending' | 'Completed';
  description?: string;
  auto_renewal: boolean;
  tax_included: boolean;
  late_fee: number;
  discount_rate: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAgencyFinanceData {
  agency_id: string;
  name: string;
  type: string;
  amount: number;
  frequency: string;
  due_date: string;
  payment_method: string;
  status?: string;
  description?: string;
  auto_renewal?: boolean;
  tax_included?: boolean;
  late_fee?: number;
  discount_rate?: number;
}

export interface UpdateAgencyFinanceData extends Partial<CreateAgencyFinanceData> {
  id: string;
}

const transformFromDB = (data: any): AgencyFinance => ({
  id: data.id,
  agency_id: data.agency_id,
  name: data.name,
  type: data.type,
  amount: data.amount,
  frequency: data.frequency,
  due_date: data.due_date,
  payment_method: data.payment_method,
  status: data.status,
  description: data.description,
  auto_renewal: data.auto_renewal || false,
  tax_included: data.tax_included || false,
  late_fee: data.late_fee || 0,
  discount_rate: data.discount_rate || 0,
  created_at: data.created_at,
  updated_at: data.updated_at,
});

export const useAgencyFinance = (agencyId?: string) => {
  return useQuery({
    queryKey: ['agencyFinance', agencyId],
    queryFn: async () => {
      let query = (supabase as any).from('agency_finance').select('*');
      if (agencyId) query = query.eq('agency_id', agencyId);
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      if (error) throw error;
      return data?.map(transformFromDB) || [];
    },
  });
};

export const useAgencyFinanceItem = (id: string) => {
  return useQuery({
    queryKey: ['agencyFinanceItem', id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('agency_finance')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data ? transformFromDB(data) : null;
    },
    enabled: !!id,
  });
};

export const useCreateAgencyFinance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateAgencyFinanceData) => {
      const { data: result, error } = await (supabase as any)
        .from('agency_finance')
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return transformFromDB(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencyFinance'] });
    },
  });
};

export const useUpdateAgencyFinance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateAgencyFinanceData) => {
      const { id, ...updateData } = data;
      const { data: result, error } = await (supabase as any)
        .from('agency_finance')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return transformFromDB(result);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['agencyFinance'] });
      queryClient.invalidateQueries({ queryKey: ['agencyFinanceItem', data.id] });
    },
  });
};

export const useDeleteAgencyFinance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('agency_finance')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencyFinance'] });
    },
  });
}; 