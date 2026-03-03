import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useDeleteFinancialRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('community_financial_records' as any)
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting financial record:', error);
        throw new Error(`Failed to delete financial record: ${error.message}`);
      }
    },
    onSuccess: () => {
      // Invalidate and refetch financial records
      queryClient.invalidateQueries({ queryKey: ['community_financial_records'] });
    },
    onError: (error) => {
      console.error('Delete financial record mutation failed:', error);
    },
  });
};
