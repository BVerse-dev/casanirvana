import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useDeleteCommunityDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('community_documents' as any)
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete community document: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community_documents'] });
    },
  });
};
