import { useQuery } from '@tanstack/react-query';
import { getNoticesForSociety } from '../services/noticeService';

export const useListNotices = (societyId: string, page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['notices', societyId, page, limit],
    queryFn: () => getNoticesForSociety({ society_id: societyId, page, limit }),
    enabled: !!societyId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
