import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { FinancialRecord } from './useFinancialRecords';

type CreateFinancialRecordData = Omit<FinancialRecord, 'id' | 'created_at' | 'updated_at'>;

export const useCreateFinancialRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newRecord: CreateFinancialRecordData): Promise<FinancialRecord> => {
      const { data, error } = await supabase
        .from('community_financial_records' as any)
        .insert(newRecord)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create financial record: ${error.message}`);
      }

      return data as unknown as FinancialRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community_financial_records'] });
    },
  });
}; 
