import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useDeleteFinancialRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      console.log('🔄 useDeleteFinancialRecord: Deleting record...', id);

      const { error } = await supabase
        .from('community_financial_records' as any)
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ useDeleteFinancialRecord: Error deleting record:', error);
        throw new Error(`Failed to delete financial record: ${error.message}`);
      }

      console.log('✅ useDeleteFinancialRecord: Record deleted successfully');
    },
    onSuccess: () => {
      // Invalidate and refetch financial records
      queryClient.invalidateQueries({ queryKey: ['community_financial_records'] });
      console.log('🔄 useDeleteFinancialRecord: Invalidated community_financial_records cache');
    },
    onError: (error) => {
      console.error('❌ useDeleteFinancialRecord: Mutation failed:', error);
    },
  });
}; 