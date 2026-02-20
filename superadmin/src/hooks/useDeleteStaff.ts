import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useDeleteStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('community_staff' as any)
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete staff member: ${error.message}`);
      }
    },
    onSuccess: () => {
      // Invalidate and refetch staff list
      queryClient.invalidateQueries({ queryKey: ['community_staff'] });
    },
  });
}; 