import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { StaffMember } from './useListStaff';

export type CreateStaffData = Omit<StaffMember, 'id' | 'created_at' | 'updated_at'>;

export const useCreateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (staffData: CreateStaffData): Promise<StaffMember> => {
      const { data, error } = await supabase
        .from('community_staff' as any)
        .insert([staffData])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create staff member: ${error.message}`);
      }

      return data as unknown as StaffMember;
    },
    onSuccess: () => {
      // Invalidate and refetch staff list
      queryClient.invalidateQueries({ queryKey: ['community_staff'] });
    },
  });
}; 