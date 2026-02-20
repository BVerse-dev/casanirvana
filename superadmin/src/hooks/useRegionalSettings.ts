'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Types
export interface RegionalSettings {
  id: string;
  country: string;
  timezone: string;
  currency: string;
  language: string;
  date_format: string;
  time_format: string;
  first_day_of_week: number;
  number_format: string;
  address_format: string;
  phone_format: string;
  postal_code_format: string;
  emergency_numbers: Record<string, any>;
  local_holidays: Record<string, any>[];
  working_days: string[];
  business_hours: Record<string, any>;
  tax_settings: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateRegionalSettingsData {
  country: string;
  timezone: string;
  currency: string;
  language: string;
  date_format?: string;
  time_format?: string;
  first_day_of_week?: number;
  number_format?: string;
  address_format?: string;
  phone_format?: string;
  postal_code_format?: string;
  emergency_numbers?: Record<string, any>;
  local_holidays?: Record<string, any>[];
  working_days?: string[];
  business_hours?: Record<string, any>;
  tax_settings?: Record<string, any>;
  is_active?: boolean;
}

export interface UpdateRegionalSettingsData extends Partial<CreateRegionalSettingsData> {}

// Query Keys
const QUERY_KEYS = {
  regionalSettings: ['regional_settings'] as const,
  regionalSetting: (id: string) => ['regional_settings', id] as const,
  activeRegionalSettings: ['regional_settings', 'active'] as const,
};

// Helper function to parse regional settings data
const parseRegionalSettingsData = (data: any): RegionalSettings => {
  return {
    id: data.id,
    country: data.country || '',
    timezone: data.timezone || 'UTC',
    currency: data.currency || 'USD',
    language: data.language || 'en',
    date_format: data.date_format || 'MM/DD/YYYY',
    time_format: data.time_format || '12h',
    first_day_of_week: data.first_day_of_week || 0,
    number_format: data.number_format || 'en-US',
    address_format: data.address_format || '',
    phone_format: data.phone_format || '',
    postal_code_format: data.postal_code_format || '',
    emergency_numbers: data.emergency_numbers || {},
    local_holidays: data.local_holidays || [],
    working_days: data.working_days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    business_hours: data.business_hours || {},
    tax_settings: data.tax_settings || {},
    is_active: data.is_active ?? true,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

// Hooks

// List all regional settings
export const useListRegionalSettings = () => {
  return useQuery({
    queryKey: QUERY_KEYS.regionalSettings,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('regional_settings')
        .select('*')
        .order('country');

      if (error) {
        console.error('Error fetching regional settings:', error);
        throw new Error(`Failed to fetch regional settings: ${error.message}`);
      }

      return data?.map(parseRegionalSettingsData) || [];
    },
  });
};

// Get active regional settings
export const useActiveRegionalSettings = () => {
  return useQuery({
    queryKey: QUERY_KEYS.activeRegionalSettings,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('regional_settings')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No active regional settings found
          return null;
        }
        console.error('Error fetching active regional settings:', error);
        throw new Error(`Failed to fetch active regional settings: ${error.message}`);
      }

      return data ? parseRegionalSettingsData(data) : null;
    },
  });
};

// Get regional settings by ID
export const useGetRegionalSettings = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.regionalSetting(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('regional_settings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching regional settings:', error);
        throw new Error(`Failed to fetch regional settings: ${error.message}`);
      }

      return parseRegionalSettingsData(data);
    },
    enabled: !!id,
  });
};

// Create regional settings
export const useCreateRegionalSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newRegionalSettings: CreateRegionalSettingsData) => {
      const { data, error } = await supabase
        .from('regional_settings')
        .insert([newRegionalSettings])
        .select()
        .single();

      if (error) {
        console.error('Error creating regional settings:', error);
        throw new Error(`Failed to create regional settings: ${error.message}`);
      }

      return parseRegionalSettingsData(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.regionalSettings });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeRegionalSettings });
    },
  });
};

// Update regional settings
export const useUpdateRegionalSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateRegionalSettingsData }) => {
      const { data, error } = await supabase
        .from('regional_settings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating regional settings:', error);
        throw new Error(`Failed to update regional settings: ${error.message}`);
      }

      return parseRegionalSettingsData(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.regionalSettings });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.regionalSetting(data.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeRegionalSettings });
    },
  });
};

// Delete regional settings
export const useDeleteRegionalSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('regional_settings')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting regional settings:', error);
        throw new Error(`Failed to delete regional settings: ${error.message}`);
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.regionalSettings });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeRegionalSettings });
    },
  });
};

// Activate regional settings (sets all others to inactive)
export const useActivateRegionalSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // First, deactivate all regional settings
      const { error: deactivateError } = await supabase
        .from('regional_settings')
        .update({ is_active: false })
        .neq('id', 'dummy');

      if (deactivateError) {
        console.error('Error deactivating regional settings:', deactivateError);
        throw new Error(`Failed to deactivate regional settings: ${deactivateError.message}`);
      }

      // Then activate the specified one
      const { data, error } = await supabase
        .from('regional_settings')
        .update({ is_active: true })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error activating regional settings:', error);
        throw new Error(`Failed to activate regional settings: ${error.message}`);
      }

      return parseRegionalSettingsData(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.regionalSettings });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeRegionalSettings });
    },
  });
};

// Get regional settings by country
export const useGetRegionalSettingsByCountry = (country: string) => {
  return useQuery({
    queryKey: ['regional_settings', 'country', country],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('regional_settings')
        .select('*')
        .eq('country', country)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching regional settings by country:', error);
        throw new Error(`Failed to fetch regional settings: ${error.message}`);
      }

      return data?.map(parseRegionalSettingsData) || [];
    },
    enabled: !!country,
  });
};

// Bulk update multiple regional settings
export const useBulkUpdateRegionalSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Array<{ id: string; data: UpdateRegionalSettingsData }>) => {
      const promises = updates.map(({ id, data }) =>
        supabase
          .from('regional_settings')
          .update(data)
          .eq('id', id)
          .select()
          .single()
      );

      const results = await Promise.all(promises);
      
      // Check for errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error('Errors in bulk update:', errors);
        throw new Error(`Failed to update some regional settings`);
      }

      return results.map(result => parseRegionalSettingsData(result.data));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.regionalSettings });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeRegionalSettings });
    },
  });
};
