'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Types for Application Configuration
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

// Query Keys
const QUERY_KEYS = {
  applicationConfig: ['app_settings', 'application'] as const,
};

// Application configuration keys
const APPLICATION_CONFIG_KEYS = [
  'application_name',
  'application_tagline', 
  'organization_name',
  'contact_email',
  'support_email',
  'contact_phone',
  'website_url',
  'address',
  'description'
] as const;

// Helper function to parse settings data into typed object
const parseApplicationConfig = (settings: Array<{key: string, value: string}>): ApplicationConfigData => {
  const config: any = {};
  
  settings.forEach(setting => {
    if (APPLICATION_CONFIG_KEYS.includes(setting.key as any)) {
      config[setting.key] = setting.value;
    }
  });

  return {
    application_name: config.application_name || '',
    application_tagline: config.application_tagline || '',
    organization_name: config.organization_name || '',
    contact_email: config.contact_email || '',
    support_email: config.support_email || '',
    contact_phone: config.contact_phone || '',
    website_url: config.website_url || '',
    address: config.address || '',
    description: config.description || '',
  };
};

// Hook to fetch application configuration
export const useApplicationConfig = () => {
  return useQuery({
    queryKey: QUERY_KEYS.applicationConfig,
    queryFn: async (): Promise<ApplicationConfigData> => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value')
        .in('key', APPLICATION_CONFIG_KEYS);

      if (error) {
        console.error('Error fetching application config:', error);
        throw new Error(`Failed to fetch application config: ${error.message}`);
      }

      return parseApplicationConfig(data || []);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to update application configuration
export const useUpdateApplicationConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ApplicationConfigData): Promise<void> => {
      // Convert config object to array of key-value pairs for database
      const updates = Object.entries(data).map(([key, value]) => ({
        key,
        value: String(value || ''),
        description: getFieldDescription(key),
      }));

      // Update each setting individually
      for (const update of updates) {
        const { error } = await supabase
          .from('app_settings')
          .upsert({
            key: update.key,
            value: update.value,
            description: update.description,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'key'
          });

        if (error) {
          console.error(`Error updating ${update.key}:`, error);
          throw new Error(`Failed to update ${update.key}: ${error.message}`);
        }
      }
    },
    onSuccess: () => {
      // Invalidate and refetch application config
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.applicationConfig });
    },
    onError: (error) => {
      console.error('Error updating application config:', error);
    },
  });
};

// Helper function to get field descriptions
const getFieldDescription = (key: string): string => {
  const descriptions: Record<string, string> = {
    application_name: 'Application name displayed throughout the system',
    application_tagline: 'Application tagline/slogan displayed in branding',
    organization_name: 'Organization name for legal and contact purposes',
    contact_email: 'Primary contact email for the organization',
    support_email: 'Support email address for customer assistance',
    contact_phone: 'Contact phone number for the organization',
    website_url: 'Organization website URL',
    address: 'Complete organization address',
    description: 'Organization description',
  };
  
  return descriptions[key] || '';
};

// Hook to get a single application config value
export const useApplicationConfigValue = (key: keyof ApplicationConfigData) => {
  const { data: config } = useApplicationConfig();
  return config?.[key] || '';
};
