"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

// Define temporary types until database.types.ts is regenerated
type PreferenceCategory = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  order: number | null;
  created_at: string;
  updated_at: string;
};

type PreferenceSetting = {
  id: string;
  category_id: string;
  key: string;
  name: string;
  description: string | null;
  type: 'boolean' | 'select' | 'text' | 'number' | 'color' | 'time';
  default_value: any;
  options: any[] | null;
  validation: any | null;
  is_user_editable: boolean;
  is_system_setting: boolean;
  created_at: string;
  updated_at: string;
  affected_users?: number;
};

type UserPreferenceValue = {
  id: string;
  user_id: string;
  preference_id: string;
  value: any;
  created_at: string;
  updated_at: string;
};

// Type for view data
type PreferenceSettingWithStats = PreferenceSetting & {
  affected_users: number;
};

type UserWithPreferenceStats = {
  id: string;
  email: string;
  user_name: string;
  user_role: string;
  customizations: number;
  last_updated: string;
};

// Parameter types for filtering and sorting
interface ListPreferenceCategoriesParams {
  isActive?: boolean;
  sortBy?: 'name' | 'order' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

interface ListPreferenceSettingsParams {
  search?: string;
  categoryId?: string;
  type?: string;
  isUserEditable?: boolean;
  isSystemSetting?: boolean;
  sortBy?: 'name' | 'key' | 'created_at' | 'affected_users';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

interface ListUserPreferenceValuesParams {
  userId?: string;
  preferenceId?: string;
}

// ------ PREFERENCE CATEGORIES HOOKS ------

// List preference categories with filtering
export const useListPreferenceCategories = (params: ListPreferenceCategoriesParams = {}) => {
  return useQuery({
    queryKey: ['preference-categories', params],
    queryFn: async () => {
      let query = supabase
        .from('preference_categories')
        .select('*');

      // Apply filters
      if (params.isActive !== undefined) {
        query = query.eq('is_active', params.isActive);
      }

      // Apply sorting
      const sortBy = params.sortBy || 'order';
      const sortOrder = params.sortOrder || 'asc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
  });
};

// Get a single preference category
export const useGetPreferenceCategory = (id: string) => {
  return useQuery({
    queryKey: ['preference-category', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('preference_categories')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

// Create a preference category
export const useCreatePreferenceCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (categoryData: Omit<PreferenceCategory, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('preference_categories')
        .insert(categoryData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preference-categories'] });
    },
  });
};

// Update a preference category
export const useUpdatePreferenceCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PreferenceCategory> & { id: string }) => {
      const { data, error } = await supabase
        .from('preference_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['preference-categories'] });
      queryClient.invalidateQueries({ queryKey: ['preference-category', variables.id] });
    },
  });
};

// Delete a preference category
export const useDeletePreferenceCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('preference_categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preference-categories'] });
    },
  });
};

// ------ PREFERENCE SETTINGS HOOKS ------

// List preference settings with filtering and stats
export const useListPreferenceSettings = (params: ListPreferenceSettingsParams = {}) => {
  return useQuery({
    queryKey: ['preference-settings', params],
    queryFn: async () => {
      let query = supabase
        .from('preference_settings_with_stats')
        .select('*', { count: 'exact' });

      // Apply filters
      if (params.search) {
        query = query.or(`name.ilike.%${params.search}%,key.ilike.%${params.search}%,description.ilike.%${params.search}%`);
      }
      
      if (params.categoryId) {
        query = query.eq('category_id', params.categoryId);
      }
      
      if (params.type) {
        query = query.eq('type', params.type);
      }
      
      if (params.isUserEditable !== undefined) {
        query = query.eq('is_user_editable', params.isUserEditable);
      }
      
      if (params.isSystemSetting !== undefined) {
        query = query.eq('is_system_setting', params.isSystemSetting);
      }

      // Apply sorting
      const sortBy = params.sortBy || 'created_at';
      const sortOrder = params.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      if (params.page !== undefined && params.pageSize !== undefined) {
        const from = (params.page - 1) * params.pageSize;
        const to = from + params.pageSize - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;
      
      if (error) throw error;
      
      return {
        data: data || [],
        count: count || 0,
        page: params.page || 1,
        pageSize: params.pageSize || 10,
        totalPages: Math.ceil((count || 0) / (params.pageSize || 10))
      };
    },
  });
};

// Get a single preference setting with stats
export const useGetPreferenceSetting = (id: string) => {
  return useQuery({
    queryKey: ['preference-setting', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('preference_settings_with_stats')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

// Create a preference setting
export const useCreatePreferenceSetting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (settingData: Omit<PreferenceSetting, 'id' | 'created_at' | 'updated_at' | 'affected_users'>) => {
      const { data, error } = await supabase
        .from('preference_settings')
        .insert(settingData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preference-settings'] });
    },
  });
};

// Update a preference setting
export const useUpdatePreferenceSetting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PreferenceSetting> & { id: string }) => {
      // Filter out affected_users which is not a column in the base table
      const { affected_users, ...validUpdates } = updates as any;
      
      const { data, error } = await supabase
        .from('preference_settings')
        .update(validUpdates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['preference-settings'] });
      queryClient.invalidateQueries({ queryKey: ['preference-setting', variables.id] });
    },
  });
};

// Delete a preference setting
export const useDeletePreferenceSetting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('preference_settings')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preference-settings'] });
    },
  });
};

// ------ USER PREFERENCE VALUES HOOKS ------

// List user preference values with filtering
export const useListUserPreferenceValues = (params: ListUserPreferenceValuesParams = {}) => {
  return useQuery({
    queryKey: ['user-preference-values', params],
    queryFn: async () => {
      let query = supabase
        .from('user_preference_values')
        .select(`
          *,
          preference_settings!inner(
            id,
            key,
            name,
            description,
            type,
            default_value,
            options,
            category_id
          )
        `);

      // Apply filters
      if (params.userId) {
        query = query.eq('user_id', params.userId);
      }
      
      if (params.preferenceId) {
        query = query.eq('preference_id', params.preferenceId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
  });
};

// Get a single user preference value
export const useGetUserPreferenceValue = (userId: string, preferenceId: string) => {
  return useQuery({
    queryKey: ['user-preference-value', userId, preferenceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_preference_values')
        .select(`
          *,
          preference_settings!inner(
            id,
            key,
            name,
            description,
            type,
            default_value,
            options
          )
        `)
        .eq('user_id', userId)
        .eq('preference_id', preferenceId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!(userId && preferenceId),
  });
};

// Create or update a user preference value
export const useSetUserPreferenceValue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      preferenceId, 
      value 
    }: { 
      userId: string; 
      preferenceId: string; 
      value: any 
    }) => {
      // Convert value to JSONB if it's not already
      const jsonValue = typeof value === 'object' 
        ? value 
        : JSON.parse(JSON.stringify(value));

      const { data, error } = await supabase
        .from('user_preference_values')
        .upsert({
          user_id: userId,
          preference_id: preferenceId,
          value: jsonValue
        }, {
          onConflict: 'user_id,preference_id',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-preference-values', { userId: variables.userId }] });
      queryClient.invalidateQueries({ queryKey: ['user-preference-value', variables.userId, variables.preferenceId] });
    },
  });
};

// Delete a user preference value
export const useDeleteUserPreferenceValue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, preferenceId }: { userId: string; preferenceId: string }) => {
      const { error } = await supabase
        .from('user_preference_values')
        .delete()
        .eq('user_id', userId)
        .eq('preference_id', preferenceId);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-preference-values', { userId: variables.userId }] });
    },
  });
};

// ------ STATISTICS HOOKS ------

// Get preference setting statistics
export const usePreferenceSettingsStats = () => {
  return useQuery({
    queryKey: ['preference-settings-stats'],
    queryFn: async () => {
      // Get categories for categorization
      const { data: categories, error: categoriesError } = await supabase
        .from('preference_categories')
        .select('id, name');
      
      if (categoriesError) throw categoriesError;

      // Get all settings with stats
      const { data: settings, error: settingsError } = await supabase
        .from('preference_settings_with_stats')
        .select('*');
      
      if (settingsError) throw settingsError;
      
      const categoriesMap = Object.fromEntries(
        (categories || []).map(cat => [cat.id, cat.name])
      );
      
      const stats = {
        total: settings?.length || 0,
        userEditable: settings?.filter(s => s.is_user_editable).length || 0,
        systemSettings: settings?.filter(s => s.is_system_setting).length || 0,
        byCategory: Object.fromEntries(
          (categories || []).map(cat => [
            cat.id, 
            settings?.filter(s => s.category_id === cat.id).length || 0
          ])
        ),
        categoriesMap, // Add category names for display
        byType: {} as Record<string, number>
      };

      // Count by type
      settings?.forEach(setting => {
        if (!stats.byType[setting.type]) {
          stats.byType[setting.type] = 0;
        }
        stats.byType[setting.type]++;
      });

      return stats;
    },
  });
};

// Get users with preference customizations
export const useUsersWithPreferenceStats = () => {
  return useQuery({
    queryKey: ['users-preference-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users_with_preference_stats')
        .select('*');
      
      if (error) throw error;
      return data as UserWithPreferenceStats[] || [];
    },
  });
};

// ------ HELPER FUNCTIONS ------

// Convert a database preference setting to the UI format
export const mapPreferenceSettingToUI = (setting: PreferenceSetting): any => {
  return {
    id: setting.id,
    categoryId: setting.category_id,
    key: setting.key,
    name: setting.name,
    description: setting.description,
    type: setting.type,
    defaultValue: setting.default_value,
    options: setting.options,
    isUserEditable: setting.is_user_editable,
    isSystemSetting: setting.is_system_setting,
    affectedUsers: setting.affected_users || 0,
    createdDate: setting.created_at?.split('T')[0] || '',
    updatedDate: setting.updated_at?.split('T')[0] || ''
  };
};

// Convert a database preference category to the UI format
export const mapPreferenceCategoryToUI = (category: PreferenceCategory): any => {
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    icon: category.icon,
    isActive: category.is_active,
    order: category.order
  };
};

// Convert UI format to database format for preference settings
export const mapUIToPreferenceSetting = (uiSetting: any): Partial<PreferenceSetting> => {
  return {
    id: uiSetting.id,
    category_id: uiSetting.categoryId,
    key: uiSetting.key,
    name: uiSetting.name,
    description: uiSetting.description,
    type: uiSetting.type,
    default_value: uiSetting.defaultValue,
    options: uiSetting.options,
    is_user_editable: uiSetting.isUserEditable,
    is_system_setting: uiSetting.isSystemSetting
  };
};

// Convert UI format to database format for preference categories
export const mapUIToPreferenceCategory = (uiCategory: any): Partial<PreferenceCategory> => {
  return {
    id: uiCategory.id,
    name: uiCategory.name,
    description: uiCategory.description,
    icon: uiCategory.icon,
    is_active: uiCategory.isActive,
    order: uiCategory.order
  };
};
