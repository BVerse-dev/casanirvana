'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

// Type for user settings
type UserSettings = Database['public']['Tables']['user_settings']['Row'];
type UserSettingsInsert = Database['public']['Tables']['user_settings']['Insert'];
type UserSettingsUpdate = Database['public']['Tables']['user_settings']['Update'];

// Fetch all user settings
export const useUserSettings = () => {
  return useQuery({
    queryKey: ['user-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get user settings by user ID
export const useUserSettingsByUserId = (userId: string) => {
  return useQuery({
    queryKey: ['user-settings', 'user', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!userId,
  });
};

// Get user settings by ID
export const useUserSetting = (id: number) => {
  return useQuery({
    queryKey: ['user-settings', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id,
  });
};

// Create new user settings
export const useCreateUserSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userSettings: UserSettingsInsert) => {
      const { data, error } = await supabase
        .from('user_settings')
        .insert(userSettings)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
    },
  });
};

// Update user settings
export const useUpdateUserSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      language_id, 
      user_id 
    }: { 
      id: number; 
      language_id?: number | null; 
      user_id?: string | null; 
    }) => {
      const updates: UserSettingsUpdate = {
        language_id,
        user_id,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
      queryClient.invalidateQueries({ queryKey: ['user-settings', variables.id] });
      if (data.user_id) {
        queryClient.invalidateQueries({ queryKey: ['user-settings', 'user', data.user_id] });
      }
    },
  });
};

// Update user settings by user ID
export const useUpdateUserSettingsByUserId = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      language_id 
    }: { 
      userId: string; 
      language_id?: number | null; 
    }) => {
      const updates: UserSettingsUpdate = {
        language_id,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
      queryClient.invalidateQueries({ queryKey: ['user-settings', 'user', variables.userId] });
      if (data.id) {
        queryClient.invalidateQueries({ queryKey: ['user-settings', data.id] });
      }
    },
  });
};

// Delete user settings
export const useDeleteUserSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('user_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
    },
  });
};
