'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdminApi } from './useAdminApi';

type SettingsRecord = Record<string, any>;

export const useSettingsCategory = <TSettings extends SettingsRecord>({
  queryKey,
  category,
  subcategory,
  defaults,
  descriptions,
}: {
  queryKey: readonly unknown[];
  category: string;
  subcategory?: string;
  defaults: TSettings;
  descriptions?: Record<string, string>;
}) => {
  const { fetchAdmin, hasToken } = useAdminApi();
  const queryClient = useQueryClient();

  const params = new URLSearchParams({ category });
  if (subcategory) {
    params.set('subcategory', subcategory);
  }

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<TSettings> => {
      const response = await fetchAdmin<{ settings?: Partial<TSettings> }>(
        `/admin/system-settings?${params.toString()}`
      );
      return {
        ...defaults,
        ...(response.settings || {}),
      };
    },
    staleTime: 5 * 60 * 1000,
    enabled: hasToken,
  });

  const mutation = useMutation({
    mutationFn: async (settings: Partial<TSettings>) => {
      await fetchAdmin('/admin/system-settings', {
        method: 'PUT',
        body: JSON.stringify({
          category,
          subcategory,
          settings,
          descriptions,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    saveSettings: mutation.mutate,
    saveSettingsAsync: mutation.mutateAsync,
    isSaving: mutation.isPending,
    saveError: mutation.error,
    saveSuccess: mutation.isSuccess,
  };
};
