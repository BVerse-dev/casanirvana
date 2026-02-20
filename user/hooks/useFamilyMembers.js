import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';

// Hook to list family members for a user
export const useListFamilyMembers = (userId) => {
  return useQuery({
    queryKey: ['family-members', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
};

// Hook to create a new family member
export const useCreateFamilyMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (familyData) => {
      // Generate unique family member ID for QR code
      const familyMemberId = `FM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Generate entry code from family member ID (last 8 characters)
      const entryCode = familyMemberId.slice(-8).toUpperCase();

      // Generate unique QR code data with family member information
      const qrCodeData = JSON.stringify({
        id: familyMemberId,
        name: familyData.name,
        relation: familyData.relation,
        phone: familyData.phone,
        user_id: familyData.user_id,
        type: 'family_member',
        entry_code: entryCode,
        created_at: new Date().toISOString(),
        expires_at: null // Family members don't expire
      });
      
      const { data, error } = await supabase
        .from('family_members')
        .insert([{
          ...familyData,
          qr_code: qrCodeData,
          entry_code: entryCode,
          expires_at: null, // Family members don't expire
          is_active: true,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['family-members', variables.user_id]);
    },
  });
};

// Hook to update a family member
export const useUpdateFamilyMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }) => {
      const { data, error } = await supabase
        .from('family_members')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['family-members', data.user_id]);
    },
  });
};

// Hook to delete a family member
export const useDeleteFamilyMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, userId }) => {
      const { error } = await supabase
        .from('family_members')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
      return { id };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['family-members', variables.userId]);
    },
  });
};

// Hook to get a single family member
export const useGetFamilyMember = (id) => {
  return useQuery({
    queryKey: ['family-member', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};
