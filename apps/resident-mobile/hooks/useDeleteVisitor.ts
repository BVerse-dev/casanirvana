import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useDeleteVisitor = () => {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  return useMutation<void, Error, string>({
    mutationFn: async (visitorId: string) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('🗑️ Deleting visitor:', visitorId);

      const { error } = await supabase
        .from('visitor_passes')
        .delete()
        .eq('id', visitorId)
        .eq('unit_id', profile?.unit_id); // Ensure user can only delete their own unit's visitors

      if (error) {
        console.error('❌ Error deleting visitor:', error);
        throw new Error(error.message);
      }

      console.log('✅ Visitor deleted successfully');
    },
    onSuccess: () => {
      // Invalidate all visitor-passes queries (this will match any query key that starts with 'visitor-passes')
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === 'visitor-passes'
      });
      
      console.log('🔄 Invalidated all visitor queries after deletion');
    },
  });
};
