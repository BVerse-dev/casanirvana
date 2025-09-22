import { useQuery } from '@tanstack/react-query';
import { getNoticesForSociety } from '../services/noticeService';

export const useListNotices = (communityId: string, page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['notices', communityId, page, limit],
    queryFn: () => getNoticesForSociety({ society_id: communityId, page, limit }),
    enabled: !!communityId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
