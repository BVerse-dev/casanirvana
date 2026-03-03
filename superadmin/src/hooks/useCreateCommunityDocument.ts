import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { CommunityDocument } from './useCommunityDocuments';

type CreateCommunityDocumentData = Omit<CommunityDocument, 'id' | 'created_at' | 'updated_at'>;

export const useCreateCommunityDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newDocument: CreateCommunityDocumentData): Promise<CommunityDocument> => {
      const { data, error } = await supabase
        .from('community_documents' as any)
        .insert(newDocument)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create community document: ${error.message}`);
      }

      return data as unknown as CommunityDocument;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community_documents'] });
    },
  });
};
