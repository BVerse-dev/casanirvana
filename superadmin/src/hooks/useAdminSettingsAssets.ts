'use client';

import { useMutation } from '@tanstack/react-query';
import { useAdminApi } from './useAdminApi';

export type AdminSettingsAssetType = 'splash' | 'onboarding';

export interface AdminSettingsAsset {
  assetType: AdminSettingsAssetType;
  bucket: string;
  path: string;
  url: string;
}

export function useAdminSettingsAssetUpload() {
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async ({
      assetType,
      file,
    }: {
      assetType: AdminSettingsAssetType;
      file: File;
    }): Promise<AdminSettingsAsset> => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetchAdmin<{ data: AdminSettingsAsset }>(
        `/admin/system-settings/assets/${assetType}`,
        {
          method: 'POST',
          body: formData,
        }
      );

      return response.data;
    },
  });
}

export function useAdminSettingsAssetDelete() {
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async ({
      assetType,
      path,
    }: {
      assetType: AdminSettingsAssetType;
      path: string;
    }): Promise<void> => {
      await fetchAdmin(`/admin/system-settings/assets/${assetType}`, {
        method: 'DELETE',
        body: JSON.stringify({ path }),
      });
    },
  });
}
