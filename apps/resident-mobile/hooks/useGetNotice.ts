import { useQuery } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';

export const useGetNotice = (noticeId: string) => {
  return useQuery({
    queryKey: ['notice', noticeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .eq('id', noticeId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!noticeId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};
