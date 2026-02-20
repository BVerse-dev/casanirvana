'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

// Types for app settings
export interface AppSetting {
  id: number;
  key: string;
  value: string;
  description?: string;
  updated_at?: string;
}

export interface AppConfigData {
  application_name?: string;
  application_tagline?: string;
  organization_name?: string;
  contact_email?: string;
  support_email?: string;
  contact_phone?: string;
  website_url?: string;
  address?: string;
  description?: string;
  logo_url?: string;
  favicon_url?: string;
}

// Fetch all app settings
export const useAppSettings = () => {
  return useQuery({
    queryKey: ['app-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .order('key');

      if (error) throw error;

      // Convert to key-value format for easier use
      const settings = data?.reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {} as Record<string, string>) || {};

      return { data, settings };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Update app settings
export const useUpdateAppSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settingsData: Record<string, string>) => {
      // Convert settings object to array format for upsert
      const settingsArray = Object.entries(settingsData).map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString(),
      }));

      const { data, error } = await supabase
        .from('app_settings')
        .upsert(settingsArray, { onConflict: 'key' })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-settings'] });
    },
  });
};

// Get specific app setting by key
export const useAppSetting = (key: string) => {
  return useQuery({
    queryKey: ['app-settings', key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('key', key)
        .single();

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Update single app setting
export const useUpdateAppSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      key, 
      value, 
      description 
    }: { 
      key: string; 
      value: string; 
      description?: string; 
    }) => {
      const { data, error } = await supabase
        .from('app_settings')
        .upsert(
          {
            key,
            value,
            description,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'key' }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['app-settings'] });
      queryClient.invalidateQueries({ queryKey: ['app-settings', variables.key] });
    },
  });
};
