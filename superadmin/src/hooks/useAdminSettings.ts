'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Types
export interface AdminSettings {
  id: string;
  setting_key: string;
  setting_value: Record<string, any>;
  category: 'general' | 'security' | 'notifications' | 'appearance' | 'integrations' | 'billing' | 'privacy' | 'advanced';
  description: string;
  data_type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  is_encrypted: boolean;
  is_public: boolean;
  is_editable: boolean;
  validation_rules: Record<string, any>;
  default_value: Record<string, any>;
  environment: 'development' | 'staging' | 'production' | 'all';
  created_by: string;
  updated_by: string;
  tags: string[];
  metadata: Record<string, any>;
  version: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  creator?: any;
  updater?: any;
}

export interface CreateAdminSettingsData {
  setting_key: string;
  setting_value: Record<string, any>;
  category: 'general' | 'security' | 'notifications' | 'appearance' | 'integrations' | 'billing' | 'privacy' | 'advanced';
  description?: string;
  data_type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
  is_encrypted?: boolean;
  is_public?: boolean;
  is_editable?: boolean;
  validation_rules?: Record<string, any>;
  default_value?: Record<string, any>;
  environment?: 'development' | 'staging' | 'production' | 'all';
  created_by: string;
  tags?: string[];
  metadata?: Record<string, any>;
  version?: string;
  is_active?: boolean;
}

export interface UpdateAdminSettingsData {
  setting_value?: Record<string, any>;
  description?: string;
  is_public?: boolean;
  is_editable?: boolean;
  validation_rules?: Record<string, any>;
  environment?: 'development' | 'staging' | 'production' | 'all';
  updated_by: string;
  tags?: string[];
  metadata?: Record<string, any>;
  version?: string;
  is_active?: boolean;
}

// Query Keys
const QUERY_KEYS = {
  adminSettings: ['admin_settings'] as const,
  adminSetting: (id: string) => ['admin_settings', id] as const,
  adminSettingByKey: (key: string) => ['admin_settings', 'key', key] as const,
  adminSettingsByCategory: (category: string) => ['admin_settings', 'category', category] as const,
  publicAdminSettings: ['admin_settings', 'public'] as const,
  activeAdminSettings: ['admin_settings', 'active'] as const,
};

// Helper function to parse admin settings data
const parseAdminSettingsData = (data: any): AdminSettings => {
  return {
    id: data.id,
    setting_key: data.setting_key || '',
    setting_value: data.setting_value || {},
    category: data.category || 'general',
    description: data.description || '',
    data_type: data.data_type || 'object',
    is_encrypted: data.is_encrypted ?? false,
    is_public: data.is_public ?? false,
    is_editable: data.is_editable ?? true,
    validation_rules: data.validation_rules || {},
    default_value: data.default_value || {},
    environment: data.environment || 'all',
    created_by: data.created_by,
    updated_by: data.updated_by,
    tags: data.tags || [],
    metadata: data.metadata || {},
    version: data.version || '1.0',
    is_active: data.is_active ?? true,
    created_at: data.created_at,
    updated_at: data.updated_at,
    // Relations
    creator: data.creator,
    updater: data.updater,
  };
};

// Hooks

// List all admin settings
export const useListAdminSettings = () => {
  return useQuery({
    queryKey: QUERY_KEYS.adminSettings,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select(`
          *,
          creator:profiles!admin_settings_created_by_fkey(id, first_name, last_name, email),
          updater:profiles!admin_settings_updated_by_fkey(id, first_name, last_name, email)
        `)
        .order('category')
        .order('setting_key');

      if (error) {
        console.error('Error fetching admin settings:', error);
        throw new Error(`Failed to fetch admin settings: ${error.message}`);
      }

      return data?.map(parseAdminSettingsData) || [];
    },
  });
};

// Get active admin settings
export const useActiveAdminSettings = () => {
  return useQuery({
    queryKey: QUERY_KEYS.activeAdminSettings,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select(`
          *,
          creator:profiles!admin_settings_created_by_fkey(id, first_name, last_name, email),
          updater:profiles!admin_settings_updated_by_fkey(id, first_name, last_name, email)
        `)
        .eq('is_active', true)
        .order('category')
        .order('setting_key');

      if (error) {
        console.error('Error fetching active admin settings:', error);
        throw new Error(`Failed to fetch active admin settings: ${error.message}`);
      }

      return data?.map(parseAdminSettingsData) || [];
    },
  });
};

// Get public admin settings
export const usePublicAdminSettings = () => {
  return useQuery({
    queryKey: QUERY_KEYS.publicAdminSettings,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select(`
          *,
          creator:profiles!admin_settings_created_by_fkey(id, first_name, last_name, email),
          updater:profiles!admin_settings_updated_by_fkey(id, first_name, last_name, email)
        `)
        .eq('is_public', true)
        .eq('is_active', true)
        .order('category')
        .order('setting_key');

      if (error) {
        console.error('Error fetching public admin settings:', error);
        throw new Error(`Failed to fetch public admin settings: ${error.message}`);
      }

      return data?.map(parseAdminSettingsData) || [];
    },
  });
};

// Get admin setting by ID
export const useGetAdminSetting = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.adminSetting(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select(`
          *,
          creator:profiles!admin_settings_created_by_fkey(id, first_name, last_name, email, avatar_url),
          updater:profiles!admin_settings_updated_by_fkey(id, first_name, last_name, email, avatar_url)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching admin setting:', error);
        throw new Error(`Failed to fetch admin setting: ${error.message}`);
      }

      return parseAdminSettingsData(data);
    },
    enabled: !!id,
  });
};

// Get admin setting by key
export const useGetAdminSettingByKey = (settingKey: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.adminSettingByKey(settingKey),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select(`
          *,
          creator:profiles!admin_settings_created_by_fkey(id, first_name, last_name, email),
          updater:profiles!admin_settings_updated_by_fkey(id, first_name, last_name, email)
        `)
        .eq('setting_key', settingKey)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No setting found with this key
          return null;
        }
        console.error('Error fetching admin setting by key:', error);
        throw new Error(`Failed to fetch admin setting: ${error.message}`);
      }

      return parseAdminSettingsData(data);
    },
    enabled: !!settingKey,
  });
};

// Get admin settings by category
export const useGetAdminSettingsByCategory = (category: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.adminSettingsByCategory(category),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select(`
          *,
          creator:profiles!admin_settings_created_by_fkey(id, first_name, last_name, email),
          updater:profiles!admin_settings_updated_by_fkey(id, first_name, last_name, email)
        `)
        .eq('category', category)
        .eq('is_active', true)
        .order('setting_key');

      if (error) {
        console.error('Error fetching admin settings by category:', error);
        throw new Error(`Failed to fetch admin settings: ${error.message}`);
      }

      return data?.map(parseAdminSettingsData) || [];
    },
    enabled: !!category,
  });
};

// Create admin setting
export const useCreateAdminSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newAdminSetting: CreateAdminSettingsData) => {
      const { data, error } = await supabase
        .from('admin_settings')
        .insert([{
          ...newAdminSetting,
          updated_by: newAdminSetting.created_by, // Set updated_by to same as created_by initially
        }])
        .select(`
          *,
          creator:profiles!admin_settings_created_by_fkey(id, first_name, last_name, email),
          updater:profiles!admin_settings_updated_by_fkey(id, first_name, last_name, email)
        `)
        .single();

      if (error) {
        console.error('Error creating admin setting:', error);
        throw new Error(`Failed to create admin setting: ${error.message}`);
      }

      return parseAdminSettingsData(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminSettings });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeAdminSettings });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminSettingsByCategory(data.category) });
      if (data.is_public) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.publicAdminSettings });
      }
    },
  });
};

// Update admin setting
export const useUpdateAdminSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateAdminSettingsData }) => {
      const { data, error } = await supabase
        .from('admin_settings')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          creator:profiles!admin_settings_created_by_fkey(id, first_name, last_name, email),
          updater:profiles!admin_settings_updated_by_fkey(id, first_name, last_name, email)
        `)
        .single();

      if (error) {
        console.error('Error updating admin setting:', error);
        throw new Error(`Failed to update admin setting: ${error.message}`);
      }

      return parseAdminSettingsData(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminSettings });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminSetting(data.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminSettingByKey(data.setting_key) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeAdminSettings });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminSettingsByCategory(data.category) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.publicAdminSettings });
    },
  });
};

// Update admin setting value only
export const useUpdateAdminSettingValue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      settingValue, 
      updatedBy 
    }: { 
      id: string; 
      settingValue: Record<string, any>; 
      updatedBy: string; 
    }) => {
      const { data, error } = await supabase
        .from('admin_settings')
        .update({ 
          setting_value: settingValue,
          updated_by: updatedBy
        })
        .eq('id', id)
        .select(`
          *,
          creator:profiles!admin_settings_created_by_fkey(id, first_name, last_name, email),
          updater:profiles!admin_settings_updated_by_fkey(id, first_name, last_name, email)
        `)
        .single();

      if (error) {
        console.error('Error updating admin setting value:', error);
        throw new Error(`Failed to update admin setting value: ${error.message}`);
      }

      return parseAdminSettingsData(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminSettings });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminSetting(data.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminSettingByKey(data.setting_key) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeAdminSettings });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminSettingsByCategory(data.category) });
      if (data.is_public) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.publicAdminSettings });
      }
    },
  });
};

// Update admin setting by key
export const useUpdateAdminSettingByKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      settingKey, 
      settingValue, 
      updatedBy 
    }: { 
      settingKey: string; 
      settingValue: Record<string, any>; 
      updatedBy: string; 
    }) => {
      const { data, error } = await supabase
        .from('admin_settings')
        .update({ 
          setting_value: settingValue,
          updated_by: updatedBy
        })
        .eq('setting_key', settingKey)
        .eq('is_active', true)
        .select(`
          *,
          creator:profiles!admin_settings_created_by_fkey(id, first_name, last_name, email),
          updater:profiles!admin_settings_updated_by_fkey(id, first_name, last_name, email)
        `)
        .single();

      if (error) {
        console.error('Error updating admin setting by key:', error);
        throw new Error(`Failed to update admin setting: ${error.message}`);
      }

      return parseAdminSettingsData(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminSettings });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminSetting(data.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminSettingByKey(data.setting_key) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeAdminSettings });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminSettingsByCategory(data.category) });
      if (data.is_public) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.publicAdminSettings });
      }
    },
  });
};

// Delete admin setting
export const useDeleteAdminSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('admin_settings')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting admin setting:', error);
        throw new Error(`Failed to delete admin setting: ${error.message}`);
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminSettings });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeAdminSettings });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.publicAdminSettings });
    },
  });
};

// Toggle admin setting active status
export const useToggleAdminSettingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      isActive, 
      updatedBy 
    }: { 
      id: string; 
      isActive: boolean; 
      updatedBy: string; 
    }) => {
      const { data, error } = await supabase
        .from('admin_settings')
        .update({ 
          is_active: isActive,
          updated_by: updatedBy
        })
        .eq('id', id)
        .select(`
          *,
          creator:profiles!admin_settings_created_by_fkey(id, first_name, last_name, email),
          updater:profiles!admin_settings_updated_by_fkey(id, first_name, last_name, email)
        `)
        .single();

      if (error) {
        console.error('Error toggling admin setting status:', error);
        throw new Error(`Failed to update admin setting status: ${error.message}`);
      }

      return parseAdminSettingsData(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminSettings });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminSetting(data.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminSettingByKey(data.setting_key) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeAdminSettings });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminSettingsByCategory(data.category) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.publicAdminSettings });
    },
  });
};

// Bulk update admin settings
export const useBulkUpdateAdminSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Array<{ 
      id: string; 
      data: UpdateAdminSettingsData; 
    }>) => {
      const promises = updates.map(({ id, data }) =>
        supabase
          .from('admin_settings')
          .update(data)
          .eq('id', id)
          .select(`
            *,
            creator:profiles!admin_settings_created_by_fkey(id, first_name, last_name, email),
            updater:profiles!admin_settings_updated_by_fkey(id, first_name, last_name, email)
          `)
          .single()
      );

      const results = await Promise.all(promises);
      
      // Check for errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error('Errors in bulk update:', errors);
        throw new Error(`Failed to update some admin settings`);
      }

      return results.map(result => parseAdminSettingsData(result.data));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminSettings });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeAdminSettings });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.publicAdminSettings });
    },
  });
};
