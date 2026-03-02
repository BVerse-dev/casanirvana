import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { FinancialRecord } from './useFinancialRecords';

type CreateFinancialRecordData = Omit<FinancialRecord, 'id' | 'created_at' | 'updated_at'>;

export const useCreateFinancialRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newRecord: CreateFinancialRecordData): Promise<FinancialRecord> => {
      console.log('🔄 useCreateFinancialRecord: Creating record...', newRecord);

      const { data, error } = await supabase
        .from('community_financial_records' as any)
        .insert(newRecord)
        .select()
        .single();

      if (error) {
        console.error('❌ useCreateFinancialRecord: Error creating record:', error);
        throw new Error(`Failed to create financial record: ${error.message}`);
      }

      console.log('✅ useCreateFinancialRecord: Record created successfully:', data);
      return data as unknown as FinancialRecord;
    },
    onSuccess: () => {
      // Invalidate and refetch financial records
      queryClient.invalidateQueries({ queryKey: ['community_financial_records'] });
      console.log('🔄 useCreateFinancialRecord: Invalidated community_financial_records cache');
    },
    onError: (error) => {
      console.error('❌ useCreateFinancialRecord: Mutation failed:', error);
    },
  });
}; 
