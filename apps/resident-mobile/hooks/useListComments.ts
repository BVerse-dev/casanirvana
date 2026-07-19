import { useQuery } from '@tanstack/react-query';
import { getCommentsForNotice } from '../services/commentService';

export const useListComments = (noticeId: string) => {
  return useQuery({
    queryKey: ['comments', noticeId],
    queryFn: () => getCommentsForNotice(noticeId),
    enabled: !!noticeId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
