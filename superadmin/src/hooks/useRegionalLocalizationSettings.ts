import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Regional & Localization settings interface matching the form structure
export interface RegionalLocalizationSettings {
  // Date & Time Configuration (4 fields)
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  weekStartDay: string;
  
  // Currency & Number Format (3 fields)
  currency: string;
  currencyPosition: string;
  numberFormat: string;
  
  // Language & Localization (3 fields)
  primaryLanguage: string;
  supportedLanguages: string[];
  rtlSupport: boolean;
  
  // Regional Format Settings (3 fields)
  addressFormat: string;
  phoneFormat: string;
  postalCodeFormat: string;
  
  // Regional Compliance (5 fields)
  gstEnabled: boolean;
  vatEnabled: boolean;
  gdprCompliance: boolean;
  cookieConsent: boolean;
  dataLocalization: boolean;
}

// Function to parse database values to the correct types
function parseSettingValue(key: string, value: string): any {
  try {
    // Parse JSON values
    const parsed = JSON.parse(value);
    
    // Handle specific field types
    switch (key) {
      case 'supported_languages':
        return Array.isArray(parsed) ? parsed : [];
      case 'rtl_support':
      case 'gst_enabled':
      case 'vat_enabled':
      case 'gdpr_compliance':
      case 'cookie_consent':
      case 'data_localization':
        return Boolean(parsed);
      default:
        return parsed;
    }
  } catch {
    // Fallback for non-JSON values
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  }
}

// Convert camelCase keys to snake_case for database
function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter, index) => {
    return index === 0 ? letter.toLowerCase() : '_' + letter.toLowerCase();
  });
}

// Convert snake_case keys to camelCase for frontend
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// Fetch regional & localization settings from Supabase
async function fetchRegionalLocalizationSettings(): Promise<RegionalLocalizationSettings> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('key, value')
    .eq('category', 'regional');

  if (error) {
    console.error('Error fetching regional & localization settings:', error);
    throw new Error('Failed to fetch regional & localization settings');
  }

  // Convert database format to RegionalLocalizationSettings interface
  const settings: Partial<RegionalLocalizationSettings> = {};
  
  data?.forEach((setting) => {
    const camelKey = snakeToCamel(setting.key) as keyof RegionalLocalizationSettings;
    settings[camelKey] = parseSettingValue(setting.key, setting.value);
  });

  // Provide defaults for missing settings
  return {
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12',
    weekStartDay: 'monday',
    currency: 'INR',
    currencyPosition: 'before',
    numberFormat: 'indian',
    primaryLanguage: 'en',
    supportedLanguages: ['en', 'hi'],
    rtlSupport: false,
    addressFormat: 'indian',
    phoneFormat: 'indian',
    postalCodeFormat: 'indian',
    gstEnabled: true,
    vatEnabled: false,
    gdprCompliance: true,
    cookieConsent: true,
    dataLocalization: true,
    ...settings,
  } as RegionalLocalizationSettings;
}

// Update regional & localization settings in Supabase
async function updateRegionalLocalizationSettings(settings: Partial<RegionalLocalizationSettings>): Promise<void> {
  const updates = Object.entries(settings).map(([key, value]) => {
    const snakeKey = camelToSnake(key);
    return {
      key: snakeKey,
      value: JSON.stringify(value),
      category: 'regional',
    };
  });

  const { error } = await supabase
    .from('app_settings')
    .upsert(updates, { onConflict: 'key' });

  if (error) {
    console.error('Error updating regional & localization settings:', error);
    throw new Error('Failed to update regional & localization settings');
  }
}

// React Query hook for regional & localization settings
export function useRegionalLocalizationSettings() {
  const queryClient = useQueryClient();

  // Query to fetch regional & localization settings
  const {
    data: regionalSettings,
    isLoading: isLoadingData,
    error: loadError,
  } = useQuery({
    queryKey: ['regionalLocalizationSettings'],
    queryFn: fetchRegionalLocalizationSettings,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  // Mutation to update regional & localization settings
  const {
    mutate: updateSettings,
    isPending: isUpdating,
    error: updateError,
    isSuccess: updateSuccess,
  } = useMutation({
    mutationFn: updateRegionalLocalizationSettings,
    onSuccess: () => {
      // Invalidate and refetch regional & localization settings
      queryClient.invalidateQueries({ queryKey: ['regionalLocalizationSettings'] });
    },
  });

  return {
    // Data
    regionalSettings,
    
    // Loading states
    isLoadingData,
    isUpdating,
    
    // Error states
    loadError,
    updateError,
    
    // Success states
    updateSuccess,
    
    // Actions
    updateSettings,
  };
}

export default useRegionalLocalizationSettings;
