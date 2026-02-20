'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const useAdminFetch = () => {
  const { data: session } = useSession();
  const token = session?.accessToken as string | undefined;

  const fetchAdmin = async (path: string, options: RequestInit = {}) => {
    if (!token) {
      throw new Error('Missing admin session. Please sign in again.');
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || payload.message || 'Request failed');
    }
    return payload;
  };

  return { fetchAdmin, hasToken: !!token };
};

// Types for the system_settings table
export interface SystemSetting {
  id: string;
  category: string;
  subcategory: string | null;
  settings_key: string;
  settings_value: any;
  data_type: 'string' | 'boolean' | 'number' | 'json';
  description: string | null;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export interface SettingsData {
  [key: string]: any;
}

export interface BulkSettingsUpdate {
  category: string;
  subcategory?: string | null;
  settings: Record<string, any>;
}

// Query keys for caching
export const settingsQueryKeys = {
  all: ['system_settings'] as const,
  category: (category: string, subcategory?: string | null) => 
    ['system_settings', category, subcategory ?? 'all'] as const,
  single: (category: string, key: string, subcategory?: string | null) => 
    ['system_settings', category, subcategory ?? 'all', key] as const,
  // Legacy support
  legacy: ['settings'] as const,
};


// ============================================================================
// Category-Based Hooks (New - for system_settings table)
// ============================================================================

/**
 * Fetch all settings for a category/subcategory
 * Returns settings as a key-value object for easy form binding
 */
export const useSettingsCategory = (category: string, subcategory?: string | null) => {
  const { fetchAdmin, hasToken } = useAdminFetch();
  return useQuery({
    queryKey: settingsQueryKeys.category(category, subcategory),
    queryFn: async (): Promise<Record<string, any>> => {
      const params = new URLSearchParams();
      params.set('category', category);
      if (subcategory) params.set('subcategory', subcategory);

      const response = await fetchAdmin(`/admin/system-settings?${params.toString()}`);
      return response?.settings || {};
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: hasToken && !!category,
  });
};

/**
 * Fetch raw settings for a category (with metadata)
 */
export const useSettingsRaw = (category: string, subcategory?: string | null) => {
  const { fetchAdmin, hasToken } = useAdminFetch();
  return useQuery({
    queryKey: [...settingsQueryKeys.category(category, subcategory), 'raw'],
    queryFn: async (): Promise<SystemSetting[]> => {
      const params = new URLSearchParams();
      params.set('category', category);
      if (subcategory) params.set('subcategory', subcategory);
      params.set('raw', 'true');

      const response = await fetchAdmin(`/admin/system-settings?${params.toString()}`);
      return (response as SystemSetting[]) || [];
    },
    staleTime: 5 * 60 * 1000,
    enabled: hasToken && !!category,
  });
};

/**
 * Bulk update multiple settings at once
 * Accepts a settings object and upserts all key-value pairs
 */
export const useBulkUpdateSettings = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminFetch();
  
  return useMutation({
    mutationFn: async ({
      category,
      subcategory,
      settings,
    }: BulkSettingsUpdate): Promise<SystemSetting[]> => {
      const response = await fetchAdmin('/admin/system-settings', {
        method: 'PUT',
        body: JSON.stringify({
          category,
          subcategory: subcategory || null,
          settings,
        }),
      });

      return (response?.data as SystemSetting[]) || [];
    },
    onSuccess: (_, variables) => {
      // Invalidate the category
      queryClient.invalidateQueries({ 
        queryKey: settingsQueryKeys.category(variables.category, variables.subcategory) 
      });
    },
  });
};

/**
 * Hook to check if settings exist for a category
 */
export const useSettingsExist = (category: string, subcategory?: string | null) => {
  const { fetchAdmin, hasToken } = useAdminFetch();
  return useQuery({
    queryKey: [...settingsQueryKeys.category(category, subcategory), 'exists'],
    queryFn: async (): Promise<boolean> => {
      const params = new URLSearchParams();
      params.set('category', category);
      if (subcategory) params.set('subcategory', subcategory);

      const response = await fetchAdmin(`/admin/system-settings/exists?${params.toString()}`);
      return !!response?.exists;
    },
    enabled: hasToken && !!category,
  });
};

// ============================================================================
// Legacy Hooks (Backward Compatibility - for old 'settings' table)
// ============================================================================

// Fetch all settings (legacy)
export const useSettings = () => {
  const { fetchAdmin, hasToken } = useAdminFetch();
  return useQuery({
    queryKey: settingsQueryKeys.legacy,
    queryFn: async () => {
      const response = await fetchAdmin('/admin/settings');
      const settings = Object.entries(response || {}).reduce((acc, [key, value]) => {
        try {
          acc[key] = typeof value === 'string' ? JSON.parse(value) : value;
        } catch {
          acc[key] = value;
        }
        return acc;
      }, {} as SettingsData);

      const data = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
      }));

      return { data, settings };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: hasToken,
  });
};

// Update settings (legacy)
export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async (settingsData: SettingsData) => {
      return fetchAdmin('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settingsData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.legacy });
    },
  });
};

// Get specific setting by key (legacy)
export const useSetting = (key: string) => {
  const { fetchAdmin, hasToken } = useAdminFetch();
  return useQuery({
    queryKey: [...settingsQueryKeys.legacy, key],
    queryFn: async () => {
      const response = await fetchAdmin('/admin/settings');
      const rawValue = response?.[key];
      let value = rawValue;
      try {
        value = typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
      } catch {
        value = rawValue;
      }
      return { key, value };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!key && hasToken,
  });
};

// Update single setting (legacy + new)
export const useUpdateSetting = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async ({ 
      category,
      subcategory,
      key, 
      value, 
      description 
    }: { 
      category?: string;
      subcategory?: string | null;
      key: string; 
      value: any; 
      description?: string;
    }) => {
      // If category is provided, use new system_settings table
      if (category) {
        const response = await fetchAdmin('/admin/system-settings', {
          method: 'PUT',
          body: JSON.stringify({
            category,
            subcategory: subcategory || null,
            settings: { [key]: value },
            descriptions: description ? { [key]: description } : undefined,
          }),
        });

        const data = response?.data || [];
        return data[0];
      }
      
      // Legacy: use backend settings endpoint
      return fetchAdmin('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({ [key]: value }),
      });
    },
    onSuccess: (_, variables) => {
      if (variables.category) {
        queryClient.invalidateQueries({ 
          queryKey: settingsQueryKeys.category(variables.category, variables.subcategory) 
        });
      } else {
        queryClient.invalidateQueries({ queryKey: settingsQueryKeys.legacy });
        queryClient.invalidateQueries({ queryKey: [...settingsQueryKeys.legacy, variables.key] });
      }
    },
  });
};

// Delete setting
export const useDeleteSetting = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async ({ 
      category,
      subcategory,
      key 
    }: { 
      category?: string;
      subcategory?: string | null;
      key: string;
    }) => {
      if (category) {
        const params = new URLSearchParams();
        params.set('category', category);
        if (subcategory) params.set('subcategory', subcategory);

        await fetchAdmin(`/admin/system-settings/${encodeURIComponent(key)}?${params.toString()}`, {
          method: 'DELETE',
        });
      } else {
        await fetchAdmin(`/admin/settings/${encodeURIComponent(key)}`, {
          method: 'DELETE',
        });
      }
    },
    onSuccess: (_, variables) => {
      if (variables.category) {
        queryClient.invalidateQueries({ 
          queryKey: settingsQueryKeys.category(variables.category, variables.subcategory) 
        });
      } else {
        queryClient.invalidateQueries({ queryKey: settingsQueryKeys.legacy });
      }
    },
  });
};

// Default export for convenience
export default {
  // New category-based hooks
  useSettingsCategory,
  useSettingsRaw,
  useBulkUpdateSettings,
  useSettingsExist,
  // Legacy hooks
  useSettings,
  useUpdateSettings,
  useSetting,
  useUpdateSetting,
  useDeleteSetting,
  // Query keys
  settingsQueryKeys,
};
