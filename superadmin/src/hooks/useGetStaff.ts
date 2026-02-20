import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { StaffMember } from './useListStaff';

export const useGetStaff = (id: string) => {
  return useQuery({
    queryKey: ['community_staff', id],
    queryFn: async (): Promise<StaffMember | null> => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('community_staff' as any)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Failed to fetch staff member: ${error.message}`);
      }

      return (data as unknown as StaffMember) || null;
    },
    enabled: !!id,
  });
}; 