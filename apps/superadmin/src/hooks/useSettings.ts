'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdminApi } from './useAdminApi';

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

export interface BulkSettingsUpdate {
  category: string;
  subcategory?: string | null;
  settings: Record<string, any>;
}

export const settingsQueryKeys = {
  all: ['system_settings'] as const,
  category: (category: string, subcategory?: string | null) =>
    ['system_settings', category, subcategory ?? 'all'] as const,
  single: (category: string, key: string, subcategory?: string | null) =>
    ['system_settings', category, subcategory ?? 'all', key] as const,
};

export const useSettingsCategory = (category: string, subcategory?: string | null) => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: settingsQueryKeys.category(category, subcategory),
    queryFn: async (): Promise<Record<string, any>> => {
      const params = new URLSearchParams();
      params.set('category', category);
      if (subcategory) params.set('subcategory', subcategory);

      const response = await fetchAdmin<{ settings?: Record<string, any> }>(
        `/admin/system-settings?${params.toString()}`
      );
      return response?.settings || {};
    },
    staleTime: 5 * 60 * 1000,
    enabled: hasToken && !!category,
  });
};

export const useSettingsRaw = (category: string, subcategory?: string | null) => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: [...settingsQueryKeys.category(category, subcategory), 'raw'],
    queryFn: async (): Promise<SystemSetting[]> => {
      const params = new URLSearchParams();
      params.set('category', category);
      if (subcategory) params.set('subcategory', subcategory);
      params.set('raw', 'true');

      const response = await fetchAdmin<SystemSetting[] | { data?: SystemSetting[] }>(
        `/admin/system-settings?${params.toString()}`
      );

      if (Array.isArray(response)) {
        return response;
      }

      return response?.data || [];
    },
    staleTime: 5 * 60 * 1000,
    enabled: hasToken && !!category,
  });
};

export const useBulkUpdateSettings = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async ({
      category,
      subcategory,
      settings,
    }: BulkSettingsUpdate): Promise<SystemSetting[]> => {
      const response = await fetchAdmin<{ data?: SystemSetting[] }>('/admin/system-settings', {
        method: 'PUT',
        body: JSON.stringify({
          category,
          subcategory: subcategory || null,
          settings,
        }),
      });

      return response?.data || [];
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: settingsQueryKeys.category(variables.category, variables.subcategory),
      });
    },
  });
};

export const useSettingsExist = (category: string, subcategory?: string | null) => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: [...settingsQueryKeys.category(category, subcategory), 'exists'],
    queryFn: async (): Promise<boolean> => {
      const params = new URLSearchParams();
      params.set('category', category);
      if (subcategory) params.set('subcategory', subcategory);

      const response = await fetchAdmin<{ exists?: boolean }>(
        `/admin/system-settings/exists?${params.toString()}`
      );
      return !!response?.exists;
    },
    enabled: hasToken && !!category,
  });
};

export default {
  useSettingsCategory,
  useSettingsRaw,
  useBulkUpdateSettings,
  useSettingsExist,
  settingsQueryKeys,
};
