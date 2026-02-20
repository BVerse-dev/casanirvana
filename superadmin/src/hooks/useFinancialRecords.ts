import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface FinancialRecord {
  id: string;
  community_id: string;
  community_name: string;
  type: 'income' | 'expense' | 'maintenance' | 'utility' | 'penalty' | 'refund';
  category: 'maintenance_fee' | 'amenity_booking' | 'penalty' | 'water_bill' | 'electricity_bill' | 'security' | 'housekeeping' | 'gardening' | 'repairs' | 'miscellaneous';
  description: string;
  amount: number;
  unit_id?: string;
  unit_number?: string;
  transaction_date: string;
  due_date?: string;
  payment_date?: string;
  payment_method?: 'cash' | 'bank_transfer' | 'upi' | 'card' | 'cheque' | 'online';
  status: 'pending' | 'paid' | 'overdue' | 'partial' | 'cancelled';
  invoice_number?: string;
  tax_amount?: number;
  discount_amount?: number;
  remarks?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const useFinancialRecords = () => {
  return useQuery({
    queryKey: ['community_financial_records'],
    queryFn: async (): Promise<FinancialRecord[]> => {
      console.log('🔍 useFinancialRecords: Starting query...');
      
      const { data, error } = await supabase
        .from('community_financial_records' as any)
        .select('*')
        .order('transaction_date', { ascending: false });

      if (error) {
        console.error('❌ useFinancialRecords: Error fetching records:', error);
        throw new Error(`Failed to fetch financial records: ${error.message}`);
      }

      console.log('✅ useFinancialRecords: Data fetched successfully:', data?.length, 'records');
      return (data as unknown as FinancialRecord[]) || [];
    },
  });
}; 