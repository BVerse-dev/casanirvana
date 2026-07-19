import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface BudgetItem {
  id: string;
  community_id: string;
  category: string;
  allocated_amount: number;
  spent_amount: number;
  budget_period: 'monthly' | 'quarterly' | 'yearly';
  budget_year: number;
  budget_month?: number;
  budget_quarter?: number;
  created_at: string;
  updated_at: string;
}

export const useBudgetItems = () => {
  return useQuery({
    queryKey: ['community_budget_items'],
    queryFn: async (): Promise<BudgetItem[]> => {
      const { data, error } = await supabase
        .from('community_budget_items' as any)
        .select('*')
        .order('category', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch budget items: ${error.message}`);
      }

      return (data as unknown as BudgetItem[]) || [];
    },
  });
};
