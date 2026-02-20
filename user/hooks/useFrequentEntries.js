import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';

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
      // Generate unique frequent entry ID for QR code
      const frequentEntryId = `FE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Generate entry code from frequent entry ID (last 8 characters)
      const entryCode = frequentEntryId.slice(-8).toUpperCase();

      // Generate unique QR code data with frequent entry information
      const qrCodeData = JSON.stringify({
        id: frequentEntryId,
        name: entryData.name,
        relation: entryData.relation,
        phone: entryData.phone,
        user_id: entryData.user_id,
        type: 'frequent_entry',
        entry_code: entryCode,
        created_at: new Date().toISOString(),
        expires_at: null // Frequent entries don't expire
      });
      
      const { data, error } = await supabase
        .from('frequent_entries')
        .insert([{
          ...entryData,
          qr_code: qrCodeData,
          entry_code: entryCode,
          expires_at: null, // Frequent entries don't expire
          is_active: true,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['frequent-entries', variables.user_id]);
    },
  });
};

// Hook to update a frequent entry
export const useUpdateFrequentEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }) => {
      const { data, error } = await supabase
        .from('frequent_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['frequent-entries', data.user_id]);
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
      queryClient.invalidateQueries(['frequent-entries', variables.userId]);
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
