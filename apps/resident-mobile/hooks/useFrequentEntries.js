import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import {
  buildFrequentEntryQrCode,
  createDirectoryEntryIdentity,
  resolveDirectoryEntryIdentity,
} from '../utils/directoryEntryQr';

// Hook to list frequent entries for a user
export const useListFrequentEntries = (userId) => {
  return useQuery({
    queryKey: ['frequent-entries', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('frequent_entries')
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

// Hook to create a new frequent entry
export const useCreateFrequentEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (entryData) => {
      const createdAt = new Date().toISOString();
      const { entityId, entryCode } = createDirectoryEntryIdentity('FE');
      const qrCodeData = buildFrequentEntryQrCode({
        entityId,
        entryCode,
        data: {
          ...entryData,
          created_at: createdAt,
        },
      });
      
      const { data, error } = await supabase
        .from('frequent_entries')
        .insert([{
          ...entryData,
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
      queryClient.invalidateQueries({ queryKey: ['frequent-entries', variables.user_id] });
    },
  });
};

// Hook to update a frequent entry
export const useUpdateFrequentEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }) => {
      const { data: existingData, error: existingError } = await supabase
        .from('frequent_entries')
        .select('*')
        .eq('id', id)
        .single();

      if (existingError) throw existingError;

      const mergedData = {
        ...existingData,
        ...updates,
      };
      const { entityId, entryCode } = resolveDirectoryEntryIdentity({
        prefix: 'FE',
        existingEntryCode: existingData.entry_code,
        existingQrCode: existingData.qr_code,
      });
      const qrCode = buildFrequentEntryQrCode({
        entityId,
        entryCode,
        data: {
          ...mergedData,
          created_at: existingData.created_at,
        },
      });

      const { data, error } = await supabase
        .from('frequent_entries')
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
      queryClient.invalidateQueries({ queryKey: ['frequent-entries', data.user_id] });
    },
  });
};

// Hook to delete a frequent entry
export const useDeleteFrequentEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, userId }) => {
      const { error } = await supabase
        .from('frequent_entries')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
      return { id };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['frequent-entries', variables.userId] });
    },
  });
};

// Hook to get a single frequent entry
export const useGetFrequentEntry = (id) => {
  return useQuery({
    queryKey: ['frequent-entry', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('frequent_entries')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}; 
