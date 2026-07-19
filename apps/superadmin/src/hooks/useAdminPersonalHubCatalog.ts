'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAdminApi } from '@/hooks/useAdminApi';

export type AdminPersonalHubCatalogProvider = {
  id: string;
  provider_name: string;
  service_type: string;
  bill_category: string | null;
  external_service_code: string | null;
  logo_url?: string | null;
  supports_query: boolean;
  supports_pay: boolean;
  supports_status: boolean;
  is_active: boolean;
  is_enabled_for_app: boolean;
  last_synced_at: string | null;
};

export type AdminPersonalHubCatalogPackage = {
  id: string;
  provider_id: string | null;
  provider_name: string | null;
  provider_external_service_code: string | null;
  service_type: string;
  package_name: string;
  package_code: string | null;
  denomination: number | null;
  data_amount: string | null;
  validity_days: number | null;
  description: string | null;
  is_active: boolean;
  is_enabled_for_app: boolean;
  provider_enabled_for_app: boolean;
  last_synced_at: string | null;
};

type AdminCatalogResponse = {
  success: boolean;
  data: {
    items: AdminPersonalHubCatalogProvider[];
  };
};

type SyncCatalogResponse = {
  success: boolean;
  data: {
    synced_at: string;
    imported_count: number;
  };
};

type AdminCatalogPackagesResponse = {
  success: boolean;
  data: {
    items: AdminPersonalHubCatalogPackage[];
  };
};

export function useAdminPersonalHubCatalog({
  serviceType,
  billCategory,
}: {
  serviceType?: string;
  billCategory?: string;
}) {
  const { fetchAdmin, hasToken } = useAdminApi();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin-personal-hub-catalog', serviceType || 'all', billCategory || 'all'],
    enabled: hasToken,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (serviceType) params.set('service_type', serviceType);
      if (billCategory) params.set('bill_category', billCategory);
      params.set('include_disabled', 'true');
      return fetchAdmin<AdminCatalogResponse>(`/admin/personal-hub/catalog/providers?${params.toString()}`);
    },
    staleTime: 30_000,
    placeholderData: (previous) => previous,
  });

  const mutation = useMutation({
    mutationFn: async () => fetchAdmin<SyncCatalogResponse>('/admin/personal-hub/catalog/sync', { method: 'POST' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-personal-hub-catalog'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      providerId,
      updates,
    }: {
      providerId: string;
      updates: Partial<Pick<AdminPersonalHubCatalogProvider, 'provider_name' | 'is_enabled_for_app' | 'logo_url'>>;
    }) =>
      fetchAdmin<{ success: boolean; data: AdminPersonalHubCatalogProvider }>(
        `/admin/personal-hub/catalog/providers/${providerId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(updates),
        }
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-personal-hub-catalog'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-personal-hub-packages'] });
    },
  });

  return {
    providers: query.data?.data.items || [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    syncCatalog: mutation.mutateAsync,
    isSyncing: mutation.isPending,
    syncError: mutation.error instanceof Error ? mutation.error.message : null,
    updateProvider: updateMutation.mutateAsync,
    isUpdatingProvider: updateMutation.isPending,
    updateError: updateMutation.error instanceof Error ? updateMutation.error.message : null,
  };
}

export function useAdminPersonalHubCatalogPackages({
  serviceType,
  providerId,
}: {
  serviceType?: string;
  providerId?: string;
}) {
  const { fetchAdmin, hasToken } = useAdminApi();

  const query = useQuery({
    queryKey: ['admin-personal-hub-packages', serviceType || 'all', providerId || 'all'],
    enabled: hasToken,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (serviceType) params.set('service_type', serviceType);
      if (providerId) params.set('provider_id', providerId);
      params.set('include_disabled', 'true');
      return fetchAdmin<AdminCatalogPackagesResponse>(`/admin/personal-hub/catalog/packages?${params.toString()}`);
    },
    staleTime: 30_000,
    placeholderData: (previous) => previous,
  });

  return {
    packages: query.data?.data.items || [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
  };
}
