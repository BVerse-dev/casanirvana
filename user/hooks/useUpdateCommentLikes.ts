import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCommentLikes } from '../services/commentService';

export const useUpdateCommentLikes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, likesCount }: { id: string; likesCount: number }) =>
      updateCommentLikes(id, likesCount),
    onSuccess: (data) => {
      // Invalidate and refetch comments for this notice
      queryClient.invalidateQueries({
        queryKey: ['comments', data.notice_id],
      });
    },
  });
};
