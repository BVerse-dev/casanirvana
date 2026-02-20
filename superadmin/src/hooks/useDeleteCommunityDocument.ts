import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useDeleteCommunityDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      console.log('🔄 useDeleteCommunityDocument: Deleting document...', id);

      const { error } = await supabase
        .from('community_documents' as any)
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ useDeleteCommunityDocument: Error deleting document:', error);
        throw new Error(`Failed to delete community document: ${error.message}`);
      }

      console.log('✅ useDeleteCommunityDocument: Document deleted successfully');
    },
    onSuccess: () => {
      // Invalidate and refetch community documents
      queryClient.invalidateQueries({ queryKey: ['community_documents'] });
      console.log('🔄 useDeleteCommunityDocument: Invalidated community_documents cache');
    },
    onError: (error) => {
      console.error('❌ useDeleteCommunityDocument: Mutation failed:', error);
    },
  });
}; 