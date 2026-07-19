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
      const { data, error } = await supabase
        .from('community_financial_records' as any)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating financial record:', error);
        throw new Error(`Failed to update financial record: ${error.message}`);
      }
      return data as unknown as FinancialRecord;
    },
    onSuccess: () => {
      // Invalidate and refetch financial records
      queryClient.invalidateQueries({ queryKey: ['community_financial_records'] });
    },
    onError: (error) => {
      console.error('Update financial record mutation failed:', error);
    },
  });
};
