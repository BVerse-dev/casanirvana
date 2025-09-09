import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createComment } from '../services/commentService';

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createComment,
    onSuccess: (data) => {
      // Invalidate and refetch comments for this notice
      queryClient.invalidateQueries({
        queryKey: ['comments', data.notice_id],
      });
    },
  });
};
