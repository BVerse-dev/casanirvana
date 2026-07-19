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
      const { data, error } = await supabase
        .from('community_documents' as any)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update community document: ${error.message}`);
      }

      return data as unknown as CommunityDocument;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community_documents'] });
    },
  });
};
