import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface AgencyTransaction {
  id: string;
  agencyId: string;
  billingId?: string | null;
  date: string; // ISO date of transaction
  type: string; // Income / Expense
  category: string;
  amount: number;
  paymentMethod?: string | null;
  status: string;
  description?: string;
  reference?: string | null;
  createdAt?: string;
}

export interface CreateTransactionData extends Omit<AgencyTransaction, 'id' | 'createdAt'> {}
export interface UpdateTransactionData extends Partial<CreateTransactionData> { id: string }

const fromDB = (row: any): AgencyTransaction => ({
  id: row.id,
  agencyId: row.agency_id,
  billingId: row.billing_id,
  date: row.date,
  type: row.type,
  category: row.category,
  amount: Number(row.amount ?? 0),
  paymentMethod: row.payment_method,
  status: row.status,
  description: row.description,
  reference: row.reference,
  createdAt: row.created_at,
});

export const useAgencyTransactions = (agencyId?: string) => {
  return useQuery({
    queryKey: ['agencyTransactions', agencyId],
    queryFn: async () => {
      let query = (supabase as any).from('agency_transactions').select('*');
      if (agencyId) query = query.eq('agency_id', agencyId);
      query = query.order('date', { ascending: false });
      const { data, error } = await query;
      if (error) throw error;
      return data.map(fromDB) as AgencyTransaction[];
    },
  });
};

export const useCreateAgencyTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateTransactionData) => {
      const dbData = {
        agency_id: data.agencyId,
        billing_id: data.billingId,
        date: data.date,
        type: data.type,
        category: data.category,
        amount: data.amount,
        payment_method: data.paymentMethod,
        status: data.status,
        description: data.description,
        reference: data.reference,
      };
      const { data: result, error } = await (supabase as any)
        .from('agency_transactions')
        .insert([dbData])
        .select()
        .single();
      if (error) throw error;
      return fromDB(result);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agencyTransactions'] });
    },
  });
};

export const useUpdateAgencyTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateTransactionData) => {
      const { id, ...rest } = data;
      const dbData: any = {};
      Object.entries(rest).forEach(([k, v]) => {
        if (v !== undefined) {
          const map: Record<string, string> = {
            agencyId: 'agency_id',
            billingId: 'billing_id',
            date: 'date',
            type: 'type',
            category: 'category',
            paymentMethod: 'payment_method',
          };
          dbData[map[k] ?? k] = v;
        }
      });
      const { data: result, error } = await (supabase as any)
        .from('agency_transactions')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return fromDB(result);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agencyTransactions'] });
    },
  });
};

export const useDeleteAgencyTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('agency_transactions')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agencyTransactions'] });
    },
  });
}; 