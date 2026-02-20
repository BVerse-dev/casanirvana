import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { CommunityDocument } from './useCommunityDocuments';

type CreateCommunityDocumentData = Omit<CommunityDocument, 'id' | 'created_at' | 'updated_at'>;

export const useCreateCommunityDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newDocument: CreateCommunityDocumentData): Promise<CommunityDocument> => {
      console.log('🔄 useCreateCommunityDocument: Creating document...', newDocument);

      const { data, error } = await supabase
        .from('community_documents' as any)
        .insert(newDocument)
        .select()
        .single();

      if (error) {
        console.error('❌ useCreateCommunityDocument: Error creating document:', error);
        throw new Error(`Failed to create community document: ${error.message}`);
      }

      console.log('✅ useCreateCommunityDocument: Document created successfully:', data);
      return data as unknown as CommunityDocument;
    },
    onSuccess: () => {
      // Invalidate and refetch community documents
      queryClient.invalidateQueries({ queryKey: ['community_documents'] });
      console.log('🔄 useCreateCommunityDocument: Invalidated community_documents cache');
    },
    onError: (error) => {
      console.error('❌ useCreateCommunityDocument: Mutation failed:', error);
    },
  });
}; 