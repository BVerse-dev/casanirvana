'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdminApi } from './useAdminApi';

export interface ApplicationConfigData {
  application_name: string;
  application_tagline: string;
  organization_name: string;
  contact_email: string;
  support_email: string;
  contact_phone: string;
  website_url?: string;
  address: string;
  description?: string;
}

const QUERY_KEYS = {
  applicationConfig: ['system-settings', 'application', 'core'] as const,
};

const DEFAULT_APPLICATION_CONFIG: ApplicationConfigData = {
  application_name: 'Casa Nirvana',
  application_tagline: 'Smart Community Management Platform',
  organization_name: 'Casa Nirvana',
  contact_email: 'hello@casanirvana.com',
  support_email: 'support@casanirvana.com',
  contact_phone: '+233 20 000 0000',
  website_url: 'https://casanirvana.com',
  address: 'Accra, Ghana',
  description: '',
};

const APPLICATION_DESCRIPTIONS: Record<string, string> = {
  application_name: 'Primary application name used across the platform',
  application_tagline: 'Public-facing product tagline',
  organization_name: 'Legal or operating organization name',
  contact_email: 'Primary business contact email',
  support_email: 'Support contact email',
  contact_phone: 'Primary business contact phone',
  website_url: 'Official website URL',
  address: 'Primary business address',
  description: 'Short organization description',
};

export const useApplicationConfig = () => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: QUERY_KEYS.applicationConfig,
    queryFn: async (): Promise<ApplicationConfigData> => {
      const response = await fetchAdmin<{ settings?: Partial<ApplicationConfigData> }>(
        '/admin/system-settings?category=application&subcategory=core'
      );

      return {
        ...DEFAULT_APPLICATION_CONFIG,
        ...(response.settings || {}),
      };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: hasToken,
  });
};

export const useUpdateApplicationConfig = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async (data: ApplicationConfigData): Promise<void> => {
      await fetchAdmin('/admin/system-settings', {
        method: 'PUT',
        body: JSON.stringify({
          category: 'application',
          subcategory: 'core',
          settings: data,
          descriptions: APPLICATION_DESCRIPTIONS,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.applicationConfig });
    },
    onError: (error) => {
      console.error('Error updating application config:', error);
    },
  });
};

export const useApplicationConfigValue = (key: keyof ApplicationConfigData) => {
  const { data: config } = useApplicationConfig();
  return config?.[key] || '';
};
