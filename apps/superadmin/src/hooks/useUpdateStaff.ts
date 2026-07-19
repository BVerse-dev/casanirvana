import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { StaffMember } from './useListStaff';

export type UpdateStaffData = Partial<Omit<StaffMember, 'id' | 'created_at' | 'updated_at'>>;

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateStaffData & { id: string }): Promise<StaffMember> => {
      const { data, error } = await supabase
        .from('community_staff' as any)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update staff member: ${error.message}`);
      }

      return data as unknown as StaffMember;
    },
    onSuccess: (data) => {
      // Invalidate and refetch staff list
      queryClient.invalidateQueries({ queryKey: ['community_staff'] });
      // Also invalidate specific staff member
      queryClient.invalidateQueries({ queryKey: ['community_staff', data.id] });
    },
  });
}; 