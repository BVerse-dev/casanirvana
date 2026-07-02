import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import {
  buildFamilyMemberQrCode,
  createDirectoryEntryIdentity,
  resolveDirectoryEntryIdentity,
} from '../utils/directoryEntryQr';

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
      const createdAt = new Date().toISOString();
      const { entityId, entryCode } = createDirectoryEntryIdentity('FM');
      const qrCodeData = buildFamilyMemberQrCode({
        entityId,
        entryCode,
        data: {
          ...familyData,
          created_at: createdAt,
        },
      });
      
      const { data, error } = await supabase
        .from('family_members')
        .insert([{
          ...familyData,
          qr_code: qrCodeData,
          entry_code: entryCode,
          expires_at: null,
          is_active: true,
          created_at: createdAt,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['family-members', variables.user_id] });
    },
  });
};

// Hook to update a family member
export const useUpdateFamilyMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }) => {
      const { data: existingData, error: existingError } = await supabase
        .from('family_members')
        .select('*')
        .eq('id', id)
        .single();

      if (existingError) throw existingError;

      const mergedData = {
        ...existingData,
        ...updates,
      };
      const { entityId, entryCode } = resolveDirectoryEntryIdentity({
        prefix: 'FM',
        existingEntryCode: existingData.entry_code,
        existingQrCode: existingData.qr_code,
      });
      const qrCode = buildFamilyMemberQrCode({
        entityId,
        entryCode,
        data: {
          ...mergedData,
          created_at: existingData.created_at,
        },
      });

      const { data, error } = await supabase
        .from('family_members')
        .update({
          ...updates,
          entry_code: entryCode,
          qr_code: qrCode,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['family-members', data.user_id] });
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
      queryClient.invalidateQueries({ queryKey: ['family-members', variables.userId] });
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
