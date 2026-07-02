import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import {
  buildDailyHelpQrCode,
  createDirectoryEntryIdentity,
  resolveDirectoryEntryIdentity,
} from '../utils/directoryEntryQr';

// Hook to list daily help for a user
export const useListDailyHelp = (userId) => {
  return useQuery({
    queryKey: ['daily-help', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('daily_help')
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

// Hook to create a new daily help entry
export const useCreateDailyHelp = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (helpData) => {
      const createdAt = new Date().toISOString();
      const { entityId, entryCode } = createDirectoryEntryIdentity('DH');
      const qrCodeData = buildDailyHelpQrCode({
        entityId,
        entryCode,
        data: {
          ...helpData,
          created_at: createdAt,
        },
      });
      
      const { data, error } = await supabase
        .from('daily_help')
        .insert([{
          ...helpData,
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
      queryClient.invalidateQueries({ queryKey: ['daily-help', variables.user_id] });
    },
  });
};

// Hook to update a daily help entry
export const useUpdateDailyHelp = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }) => {
      const { data: existingData, error: existingError } = await supabase
        .from('daily_help')
        .select('*')
        .eq('id', id)
        .single();

      if (existingError) throw existingError;

      const mergedData = {
        ...existingData,
        ...updates,
      };
      const { entityId, entryCode } = resolveDirectoryEntryIdentity({
        prefix: 'DH',
        existingEntryCode: existingData.entry_code,
        existingQrCode: existingData.qr_code,
      });
      const qrCode = buildDailyHelpQrCode({
        entityId,
        entryCode,
        data: {
          ...mergedData,
          created_at: existingData.created_at,
        },
      });

      const { data, error } = await supabase
        .from('daily_help')
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
      queryClient.invalidateQueries({ queryKey: ['daily-help', data.user_id] });
    },
  });
};

// Hook to delete a daily help entry
export const useDeleteDailyHelp = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, userId }) => {
      const { error } = await supabase
        .from('daily_help')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
      return { id };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['daily-help', variables.userId] });
    },
  });
};

// Hook to get a single daily help entry
export const useGetDailyHelp = (id) => {
  return useQuery({
    queryKey: ['daily-help-item', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('daily_help')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}; 
