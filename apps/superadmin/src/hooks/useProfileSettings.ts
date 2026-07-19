'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

// Type for profile settings
type ProfileSettings = Database['public']['Tables']['profile_settings']['Row'];
type ProfileSettingsInsert = Database['public']['Tables']['profile_settings']['Insert'];
type ProfileSettingsUpdate = Database['public']['Tables']['profile_settings']['Update'];

// Fetch all profile settings
export const useProfileSettings = () => {
  return useQuery({
    queryKey: ['profile-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile_settings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get profile settings by user ID
export const useProfileSettingsByUserId = (userId: string) => {
  return useQuery({
    queryKey: ['profile-settings', 'user', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile_settings')
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

// Get profile settings by ID
export const useProfileSetting = (id: string) => {
  return useQuery({
    queryKey: ['profile-settings', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile_settings')
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

// Create new profile settings
export const useCreateProfileSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileSettings: ProfileSettingsInsert) => {
      const { data, error } = await supabase
        .from('profile_settings')
        .insert(profileSettings)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-settings'] });
    },
  });
};

// Update profile settings
export const useUpdateProfileSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      language, 
      notifications_enabled, 
      privacy_policy_accepted,
      user_id 
    }: { 
      id: string; 
      language?: string | null; 
      notifications_enabled?: boolean | null; 
      privacy_policy_accepted?: boolean | null;
      user_id?: string | null; 
    }) => {
      const updates: ProfileSettingsUpdate = {
        language,
        notifications_enabled,
        privacy_policy_accepted,
        user_id,
      };

      const { data, error } = await supabase
        .from('profile_settings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile-settings'] });
      queryClient.invalidateQueries({ queryKey: ['profile-settings', variables.id] });
      if (data.user_id) {
        queryClient.invalidateQueries({ queryKey: ['profile-settings', 'user', data.user_id] });
      }
    },
  });
};

// Update profile settings by user ID
export const useUpdateProfileSettingsByUserId = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      language, 
      notifications_enabled, 
      privacy_policy_accepted 
    }: { 
      userId: string; 
      language?: string | null; 
      notifications_enabled?: boolean | null; 
      privacy_policy_accepted?: boolean | null; 
    }) => {
      const updates: ProfileSettingsUpdate = {
        language,
        notifications_enabled,
        privacy_policy_accepted,
      };

      const { data, error } = await supabase
        .from('profile_settings')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile-settings'] });
      queryClient.invalidateQueries({ queryKey: ['profile-settings', 'user', variables.userId] });
      if (data.id) {
        queryClient.invalidateQueries({ queryKey: ['profile-settings', data.id] });
      }
    },
  });
};

// Delete profile settings
export const useDeleteProfileSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('profile_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-settings'] });
    },
  });
};
