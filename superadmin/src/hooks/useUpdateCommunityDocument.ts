import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { CommunityDocument } from './useCommunityDocuments';

type UpdateCommunityDocumentData = Partial<Omit<CommunityDocument, 'id' | 'created_at' | 'updated_at'>> & {
  id: string;
};

export const useUpdateCommunityDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateCommunityDocumentData): Promise<CommunityDocument> => {
      console.log('🔄 useUpdateCommunityDocument: Updating document...', id, updateData);

      const { data, error } = await supabase
        .from('community_documents' as any)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ useUpdateCommunityDocument: Error updating document:', error);
        throw new Error(`Failed to update community document: ${error.message}`);
      }

      console.log('✅ useUpdateCommunityDocument: Document updated successfully:', data);
      return data as unknown as CommunityDocument;
    },
    onSuccess: () => {
      // Invalidate and refetch community documents
      queryClient.invalidateQueries({ queryKey: ['community_documents'] });
      console.log('🔄 useUpdateCommunityDocument: Invalidated community_documents cache');
    },
    onError: (error) => {
      console.error('❌ useUpdateCommunityDocument: Mutation failed:', error);
    },
  });
}; 