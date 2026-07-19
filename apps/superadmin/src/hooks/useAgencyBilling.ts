import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface AgencyBilling {
  id: string;
  agencyId: string;
  name: string;
  type: string;
  amount: number;
  frequency: string;
  dueDate: string; // ISO date
  paymentMethod: string;
  status: string;
  description?: string;
  autoRenewal: boolean;
  taxIncluded: boolean;
  lateFee?: number;
  discountRate?: number;
  lastPayment?: string;
  nextPayment?: string | null;
  totalPaid?: number;
  outstanding?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBillingData extends Omit<AgencyBilling, 'id' | 'createdAt' | 'updatedAt'> {}
export interface UpdateBillingData extends Partial<CreateBillingData> { id: string }

const fromDB = (row: any): AgencyBilling => ({
  id: row.id,
  agencyId: row.agency_id,
  name: row.name,
  type: row.type,
  amount: Number(row.amount ?? 0),
  frequency: row.frequency,
  dueDate: row.due_date,
  paymentMethod: row.payment_method,
  status: row.status,
  description: row.description,
  autoRenewal: row.auto_renewal ?? false,
  taxIncluded: row.tax_included ?? false,
  lateFee: row.late_fee ?? 0,
  discountRate: row.discount_rate ?? 0,
  lastPayment: row.last_payment,
  nextPayment: row.next_payment,
  totalPaid: Number(row.total_paid ?? 0),
  outstanding: Number(row.outstanding ?? 0),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const useAgencyBilling = (agencyId?: string) => {
  return useQuery({
    queryKey: ['agencyBilling', agencyId],
    queryFn: async () => {
      let query = (supabase as any).from('agency_billing').select('*');
      if (agencyId) query = query.eq('agency_id', agencyId);
      query = query.order('due_date', { ascending: true });
      const { data, error } = await query;
      if (error) throw error;
      return data.map(fromDB) as AgencyBilling[];
    },
  });
};

export const useCreateAgencyBilling = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateBillingData) => {
      const dbData = {
        agency_id: data.agencyId,
        name: data.name,
        type: data.type,
        amount: data.amount,
        frequency: data.frequency,
        due_date: data.dueDate,
        payment_method: data.paymentMethod,
        status: data.status,
        description: data.description,
        auto_renewal: data.autoRenewal,
        tax_included: data.taxIncluded,
        late_fee: data.lateFee,
        discount_rate: data.discountRate,
        last_payment: data.lastPayment,
        next_payment: data.nextPayment,
        total_paid: data.totalPaid,
        outstanding: data.outstanding,
      };
      const { data: result, error } = await (supabase as any)
        .from('agency_billing')
        .insert([dbData])
        .select()
        .single();
      if (error) throw error;
      return fromDB(result);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agencyBilling'] });
    },
  });
};

export const useUpdateAgencyBilling = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateBillingData) => {
      const { id, ...rest } = data;
      const dbData: any = {};
      Object.entries(rest).forEach(([k, v]) => {
        if (v !== undefined) {
          // map camelCase to snake_case where needed
          const map: Record<string, string> = {
            agencyId: 'agency_id',
            dueDate: 'due_date',
            paymentMethod: 'payment_method',
            autoRenewal: 'auto_renewal',
            taxIncluded: 'tax_included',
            lateFee: 'late_fee',
            discountRate: 'discount_rate',
            lastPayment: 'last_payment',
            nextPayment: 'next_payment',
            totalPaid: 'total_paid',
          };
          dbData[map[k] ?? k] = v;
        }
      });
      const { data: result, error } = await (supabase as any)
        .from('agency_billing')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return fromDB(result);
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['agencyBilling'] });
      qc.invalidateQueries({ queryKey: ['agencyBilling', data.id] });
    },
  });
};

export const useDeleteAgencyBilling = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('agency_billing')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agencyBilling'] });
    },
  });
}; 