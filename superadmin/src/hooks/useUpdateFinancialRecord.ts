import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { FinancialRecord } from './useFinancialRecords';

type UpdateFinancialRecordData = Partial<Omit<FinancialRecord, 'id' | 'created_at' | 'updated_at'>> & {
  id: string;
};

export const useUpdateFinancialRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateFinancialRecordData): Promise<FinancialRecord> => {
      console.log('🔄 useUpdateFinancialRecord: Updating record...', id, updateData);

      const { data, error } = await supabase
        .from('community_financial_records' as any)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ useUpdateFinancialRecord: Error updating record:', error);
        throw new Error(`Failed to update financial record: ${error.message}`);
      }

      console.log('✅ useUpdateFinancialRecord: Record updated successfully:', data);
      return data as unknown as FinancialRecord;
    },
    onSuccess: () => {
      // Invalidate and refetch financial records
      queryClient.invalidateQueries({ queryKey: ['community_financial_records'] });
      console.log('🔄 useUpdateFinancialRecord: Invalidated community_financial_records cache');
    },
    onError: (error) => {
      console.error('❌ useUpdateFinancialRecord: Mutation failed:', error);
    },
  });
}; 