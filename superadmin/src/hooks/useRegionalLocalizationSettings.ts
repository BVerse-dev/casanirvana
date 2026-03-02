'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdminApi } from './useAdminApi';

export interface RegionalLocalizationSettings {
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  weekStartDay: string;
  currency: string;
  currencyPosition: string;
  numberFormat: string;
  primaryLanguage: string;
  supportedLanguages: string[];
  rtlSupport: boolean;
  addressFormat: string;
  phoneFormat: string;
  postalCodeFormat: string;
  gstEnabled: boolean;
  vatEnabled: boolean;
  gdprCompliance: boolean;
  cookieConsent: boolean;
  dataLocalization: boolean;
}

const DEFAULT_REGIONAL_SETTINGS: RegionalLocalizationSettings = {
  timezone: 'Africa/Accra',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '12',
  weekStartDay: 'monday',
  currency: 'GHS',
  currencyPosition: 'before',
  numberFormat: 'standard',
  primaryLanguage: 'en',
  supportedLanguages: ['en'],
  rtlSupport: false,
  addressFormat: 'ghana',
  phoneFormat: 'ghana',
  postalCodeFormat: 'ghana',
  gstEnabled: false,
  vatEnabled: true,
  gdprCompliance: true,
  cookieConsent: true,
  dataLocalization: false,
};

const QUERY_KEY = ['regionalLocalizationSettings'] as const;

function normalizeRegionalSettings(
  settings?: Partial<RegionalLocalizationSettings>
): RegionalLocalizationSettings {
  const merged = {
    ...DEFAULT_REGIONAL_SETTINGS,
    ...(settings || {}),
  };

  return {
    ...merged,
    timezone: merged.timezone === 'Asia/Kolkata' ? 'Africa/Accra' : merged.timezone,
    currency: merged.currency === 'INR' ? 'GHS' : merged.currency,
    numberFormat: merged.numberFormat === 'indian' ? 'standard' : merged.numberFormat,
    addressFormat: merged.addressFormat === 'indian' ? 'ghana' : merged.addressFormat,
    phoneFormat: merged.phoneFormat === 'indian' ? 'ghana' : merged.phoneFormat,
    postalCodeFormat: merged.postalCodeFormat === 'indian' ? 'ghana' : merged.postalCodeFormat,
    supportedLanguages:
      merged.supportedLanguages && merged.supportedLanguages.length > 0
        ? merged.supportedLanguages.filter(Boolean)
        : DEFAULT_REGIONAL_SETTINGS.supportedLanguages,
  };
}

export function useRegionalLocalizationSettings() {
  const queryClient = useQueryClient();
  const { fetchAdmin, hasToken } = useAdminApi();

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<RegionalLocalizationSettings> => {
      const response = await fetchAdmin<{ settings?: Partial<RegionalLocalizationSettings> }>('/admin/settings/regional');
      return normalizeRegionalSettings(response.settings);
    },
    staleTime: 5 * 60 * 1000,
    enabled: hasToken,
  });

  const mutation = useMutation({
    mutationFn: async (settings: Partial<RegionalLocalizationSettings>) => {
      const response = await fetchAdmin<{ settings?: Partial<RegionalLocalizationSettings> }>('/admin/settings/regional', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      return normalizeRegionalSettings(response.settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  return {
    regionalSettings: query.data,
    isLoadingData: query.isLoading,
    isUpdating: mutation.isPending,
    loadError: query.error,
    updateError: mutation.error,
    updateSuccess: mutation.isSuccess,
    updateSettings: mutation.mutate,
    updateSettingsAsync: mutation.mutateAsync,
  };
}

export default useRegionalLocalizationSettings;
