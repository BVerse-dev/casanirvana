'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Types for Business Configuration
export interface BusinessConfigData {
  default_currency: string;
  maintenance_fee: number;
  late_payment_penalty_percentage?: number;
  payment_reminder_days: number;
  payment_due_grace_period_days?: number;
  visitor_pass_expiry_hours: number;
  max_visitors_per_unit?: number;
  visitor_pre_approval_required?: boolean;
  maintenance_request_auto_approve?: boolean;
  amenity_booking_enabled?: boolean;
  complaint_system_enabled?: boolean;
  emergency_contacts_enabled?: boolean;
  digital_notice_board_enabled?: boolean;
}

// Query Keys
const QUERY_KEYS = {
  businessConfig: ['app_settings', 'business'] as const,
};

// Business configuration keys
const BUSINESS_CONFIG_KEYS = [
  'default_currency',
  'maintenance_fee',
  'late_payment_penalty_percentage',
  'payment_reminder_days',
  'payment_due_grace_period_days',
  'visitor_pass_expiry_hours',
  'max_visitors_per_unit',
  'visitor_pre_approval_required',
  'maintenance_request_auto_approve',
  'amenity_booking_enabled',
  'complaint_system_enabled',
  'emergency_contacts_enabled',
  'digital_notice_board_enabled'
] as const;

// Helper function to parse settings data into typed object
const parseBusinessConfig = (settings: Array<{key: string, value: string}>): BusinessConfigData => {
  const config: any = {};
  
  settings.forEach(setting => {
    if (BUSINESS_CONFIG_KEYS.includes(setting.key as any)) {
      // Parse different data types
      if (['maintenance_fee', 'late_payment_penalty_percentage', 'payment_reminder_days', 
           'payment_due_grace_period_days', 'visitor_pass_expiry_hours', 'max_visitors_per_unit'].includes(setting.key)) {
        config[setting.key] = parseInt(setting.value) || 0;
      } else if (['visitor_pre_approval_required', 'maintenance_request_auto_approve', 
                  'amenity_booking_enabled', 'complaint_system_enabled', 
                  'emergency_contacts_enabled', 'digital_notice_board_enabled'].includes(setting.key)) {
        config[setting.key] = setting.value === 'true';
      } else {
        config[setting.key] = setting.value;
      }
    }
  });

  return {
    default_currency: config.default_currency || 'INR',
    maintenance_fee: config.maintenance_fee || 2500,
    late_payment_penalty_percentage: config.late_payment_penalty_percentage || 5,
    payment_reminder_days: config.payment_reminder_days || 5,
    payment_due_grace_period_days: config.payment_due_grace_period_days || 3,
    visitor_pass_expiry_hours: config.visitor_pass_expiry_hours || 24,
    max_visitors_per_unit: config.max_visitors_per_unit || 5,
    visitor_pre_approval_required: config.visitor_pre_approval_required ?? true,
    maintenance_request_auto_approve: config.maintenance_request_auto_approve ?? false,
    amenity_booking_enabled: config.amenity_booking_enabled ?? true,
    complaint_system_enabled: config.complaint_system_enabled ?? true,
    emergency_contacts_enabled: config.emergency_contacts_enabled ?? true,
    digital_notice_board_enabled: config.digital_notice_board_enabled ?? true,
  };
};

// Hook to fetch business configuration
export const useBusinessConfig = () => {
  return useQuery({
    queryKey: QUERY_KEYS.businessConfig,
    queryFn: async (): Promise<BusinessConfigData> => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value')
        .in('key', BUSINESS_CONFIG_KEYS);

      if (error) {
        console.error('Error fetching business config:', error);
        throw new Error(`Failed to fetch business config: ${error.message}`);
      }

      return parseBusinessConfig(data || []);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to update business configuration
export const useUpdateBusinessConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BusinessConfigData): Promise<void> => {
      // Convert config object to array of key-value pairs for database
      const updates = Object.entries(data).map(([key, value]) => ({
        key,
        value: String(value ?? ''),
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
      // Invalidate and refetch business config
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.businessConfig });
    },
    onError: (error) => {
      console.error('Error updating business config:', error);
    },
  });
};

// Helper function to get field descriptions
const getFieldDescription = (key: string): string => {
  const descriptions: Record<string, string> = {
    default_currency: 'Default currency (INR/USD/EUR/GBP)',
    maintenance_fee: 'Monthly maintenance fee amount',
    late_payment_penalty_percentage: 'Late payment penalty percentage',
    payment_reminder_days: 'Payment reminder days before due',
    payment_due_grace_period_days: 'Grace period days after due',
    visitor_pass_expiry_hours: 'Visitor pass validity hours',
    max_visitors_per_unit: 'Maximum visitors per unit',
    visitor_pre_approval_required: 'Visitor pre-approval requirement',
    maintenance_request_auto_approve: 'Auto-approve maintenance requests',
    amenity_booking_enabled: 'Amenity booking system toggle',
    complaint_system_enabled: 'Complaint management system toggle',
    emergency_contacts_enabled: 'Emergency contacts module toggle',
    digital_notice_board_enabled: 'Digital notice board toggle',
  };
  
  return descriptions[key] || '';
};

// Hook to get a single business config value
export const useBusinessConfigValue = (key: keyof BusinessConfigData) => {
  const { data: config } = useBusinessConfig();
  return config?.[key];
};
