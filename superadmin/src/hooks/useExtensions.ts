'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Types for extension management
export interface Extension {
  id: string;
  name: string;
  slug: string;
  description?: string;
  version?: string;
  author?: string;
  category?: string;
  price?: string;
  rating?: number;
  downloads?: number;
  is_installed?: boolean;
  is_enabled?: boolean;
  config?: any;
  dependencies?: any;
  created_at?: string;
  updated_at?: string;
}

export interface ExtensionSetting {
  id: number;
  key: string;
  value: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ExtensionConfigData {
  // Global Extension Settings
  allow_third_party_extensions?: boolean;
  auto_update_extensions?: boolean;
  extension_security_scan?: boolean;
  
  // Marketplace Settings
  marketplace_enabled?: boolean;
  marketplace_url?: string;
  api_key_required?: boolean;
  
  // Developer Settings
  debug_mode?: boolean;
  allow_custom_extensions?: boolean;
  extension_logging?: boolean;
}

// Fetch all extensions
export const useExtensions = () => {
  return useQuery({
    queryKey: ['extensions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('extensions')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Fetch extensions by category
export const useExtensionsByCategory = (category?: string) => {
  return useQuery({
    queryKey: ['extensions', 'category', category],
    queryFn: async () => {
      let query = supabase.from('extensions').select('*');
      
      if (category && category !== 'all') {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query.order('name');

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Fetch installed extensions
export const useInstalledExtensions = () => {
  return useQuery({
    queryKey: ['extensions', 'installed'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('extensions')
        .select('*')
        .eq('is_installed', true)
        .order('name');

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Fetch extension settings
export const useExtensionSettings = () => {
  return useQuery({
    queryKey: ['extension-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('extension_settings')
        .select('*')
        .order('key');

      if (error) throw error;

      // Convert to key-value format for easier use
      const settings = data?.reduce((acc, item) => {
        // Parse boolean values
        if (item.value === 'true' || item.value === 'false') {
          acc[item.key] = item.value === 'true';
        } else {
          acc[item.key] = item.value;
        }
        return acc;
      }, {} as Record<string, any>) || {};

      return { data, settings };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create extension
export const useCreateExtension = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (extensionData: Omit<Extension, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('extensions')
        .insert({
          ...extensionData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extensions'] });
    },
  });
};

// Update extension
export const useUpdateExtension = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Extension> & { id: string }) => {
      const { data, error } = await supabase
        .from('extensions')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extensions'] });
    },
  });
};

// Delete extension
export const useDeleteExtension = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('extensions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extensions'] });
    },
  });
};

// Install extension
export const useInstallExtension = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('extensions')
        .update({
          is_installed: true,
          is_enabled: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extensions'] });
    },
  });
};

// Uninstall extension
export const useUninstallExtension = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('extensions')
        .update({
          is_installed: false,
          is_enabled: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extensions'] });
    },
  });
};

// Toggle extension enabled status
export const useToggleExtension = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { data, error } = await supabase
        .from('extensions')
        .update({
          is_enabled: enabled,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extensions'] });
    },
  });
};

// Update extension settings
export const useUpdateExtensionSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settingsData: Record<string, any>) => {
      // Convert settings object to array format for upsert
      const settingsArray = Object.entries(settingsData).map(([key, value]) => ({
        key,
        value: String(value), // Convert to string for database storage
        updated_at: new Date().toISOString(),
      }));

      const { data, error } = await supabase
        .from('extension_settings')
        .upsert(settingsArray, { onConflict: 'key' })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extension-settings'] });
    },
  });
};

// Get specific extension by slug
export const useExtension = (slug: string) => {
  return useQuery({
    queryKey: ['extensions', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('extensions')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Update extension configuration
export const useUpdateExtensionConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, config }: { id: string; config: any }) => {
      const { data, error } = await supabase
        .from('extensions')
        .update({
          config,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['extensions'] });
      queryClient.invalidateQueries({ queryKey: ['extensions', variables.id] });
    },
  });
};
