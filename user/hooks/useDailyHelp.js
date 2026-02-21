import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';

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
      // Generate unique daily help ID for QR code
      const dailyHelpId = `DH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Generate entry code from daily help ID (last 8 characters)
      const entryCode = dailyHelpId.slice(-8).toUpperCase();

      // Generate unique QR code data with daily help information
      const qrCodeData = JSON.stringify({
        id: dailyHelpId,
        name: helpData.name,
        type: helpData.type,
        phone: helpData.phone,
        user_id: helpData.user_id,
        type_category: 'daily_help',
        entry_code: entryCode,
        created_at: new Date().toISOString(),
        expires_at: null // Daily help doesn't expire
      });
      
      const { data, error } = await supabase
        .from('daily_help')
        .insert([{
          ...helpData,
          qr_code: qrCodeData,
          entry_code: entryCode,
          expires_at: null, // Daily help doesn't expire
          is_active: true,
          created_at: new Date().toISOString()
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
      const { data, error } = await supabase
        .from('daily_help')
        .update(updates)
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
