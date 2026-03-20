"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useAdminApi } from './useAdminApi';

type PreferenceCategory = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  is_active: boolean | null;
  order: number | null;
  created_at: string | null;
  updated_at: string | null;
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
  is_user_editable: boolean | null;
  is_system_setting: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  affected_users?: number;
};

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

const buildQuery = (params: Record<string, unknown>) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.set(key, String(value));
  });

  return searchParams.toString();
};

export const useListPreferenceCategories = (params: ListPreferenceCategoriesParams = {}) => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: ['preference-categories', params],
    enabled: hasToken,
    queryFn: async () => {
      const response = await fetchAdmin<{ data?: PreferenceCategory[] }>('/admin/settings/preference-categories');
      let categories = response.data || [];

      if (params.isActive !== undefined) {
        categories = categories.filter((category) => Boolean(category.is_active) === params.isActive);
      }

      const sortBy = params.sortBy || 'order';
      const sortOrder = params.sortOrder || 'asc';
      categories = [...categories].sort((left, right) => {
        const leftValue = (left as any)[sortBy];
        const rightValue = (right as any)[sortBy];
        if (leftValue === rightValue) return 0;
        if (leftValue === undefined || leftValue === null) return 1;
        if (rightValue === undefined || rightValue === null) return -1;
        const comparison = leftValue < rightValue ? -1 : 1;
        return sortOrder === 'asc' ? comparison : comparison * -1;
      });

      return categories;
    },
  });
};

export const useListPreferenceSettings = (params: ListPreferenceSettingsParams = {}) => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: ['preference-settings', params],
    enabled: hasToken,
    queryFn: async () => {
      const query = buildQuery(params as Record<string, unknown>);
      const response = await fetchAdmin<{
        data?: PreferenceSetting[];
        count?: number;
        page?: number;
        pageSize?: number;
        totalPages?: number;
      }>(`/admin/settings/preference-settings${query ? `?${query}` : ''}`);

      return {
        data: response.data || [],
        count: response.count || 0,
        page: response.page || 1,
        pageSize: response.pageSize || 10,
        totalPages: response.totalPages || 0,
      };
    },
  });
};

export const useCreatePreferenceSetting = () => {
  const { fetchAdmin } = useAdminApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      settingData: Omit<PreferenceSetting, 'id' | 'created_at' | 'updated_at' | 'affected_users'>
    ) => {
      const response = await fetchAdmin<{ data: PreferenceSetting }>('/admin/settings/preference-settings', {
        method: 'POST',
        body: JSON.stringify(settingData),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preference-settings'] });
      queryClient.invalidateQueries({ queryKey: ['preference-settings-stats'] });
    },
  });
};

export const useUpdatePreferenceSetting = () => {
  const { fetchAdmin } = useAdminApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PreferenceSetting> & { id: string }) => {
      const response = await fetchAdmin<{ data: PreferenceSetting }>(`/admin/settings/preference-settings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['preference-settings'] });
      queryClient.invalidateQueries({ queryKey: ['preference-setting', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['preference-settings-stats'] });
    },
  });
};

export const useDeletePreferenceSetting = () => {
  const { fetchAdmin } = useAdminApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await fetchAdmin(`/admin/settings/preference-settings/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preference-settings'] });
      queryClient.invalidateQueries({ queryKey: ['preference-settings-stats'] });
    },
  });
};

export const usePreferenceSettingsStats = () => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: ['preference-settings-stats'],
    enabled: hasToken,
    queryFn: async () => {
      const response = await fetchAdmin<{ data: any }>('/admin/settings/preference-settings/stats');
      return response.data;
    },
  });
};

export const mapPreferenceSettingToUI = (setting: PreferenceSetting): any => {
  const normalizedOptions = Array.isArray(setting.options)
    ? setting.options.map((option: any) => {
        if (option && typeof option === 'object' && 'value' in option && 'label' in option) {
          return option;
        }

        return {
          value: option,
          label: String(option),
        };
      })
    : [];

  return {
    id: setting.id,
    categoryId: setting.category_id,
    key: setting.key,
    name: setting.name,
    description: setting.description || '',
    type: setting.type,
    defaultValue: setting.default_value,
    options: normalizedOptions,
    validation: setting.validation || {},
    isUserEditable: Boolean(setting.is_user_editable),
    isSystemSetting: Boolean(setting.is_system_setting),
    affectedUsers: setting.affected_users || 0,
    createdDate: setting.created_at?.split('T')[0] || '',
    updatedDate: setting.updated_at?.split('T')[0] || '',
  };
};

export const mapPreferenceCategoryToUI = (category: PreferenceCategory): any => ({
  id: category.id,
  name: category.name,
  description: category.description || '',
  icon: category.icon || '',
  isActive: Boolean(category.is_active),
  order: category.order || 0,
});

export const mapUIToPreferenceSetting = (uiSetting: any): Partial<PreferenceSetting> => ({
  id: uiSetting.id,
  category_id: uiSetting.categoryId,
  key: uiSetting.key,
  name: uiSetting.name,
  description: uiSetting.description,
  type: uiSetting.type,
  default_value: uiSetting.defaultValue,
  options: uiSetting.options,
  validation: uiSetting.validation,
  is_user_editable: uiSetting.isUserEditable,
  is_system_setting: uiSetting.isSystemSetting,
});
