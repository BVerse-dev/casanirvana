'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdminApi } from './useAdminApi';

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

const DEFAULT_BUSINESS_CONFIG: BusinessConfigData = {
  default_currency: 'GHS',
  maintenance_fee: 250,
  late_payment_penalty_percentage: 5,
  payment_reminder_days: 5,
  payment_due_grace_period_days: 3,
  visitor_pass_expiry_hours: 24,
  max_visitors_per_unit: 5,
  visitor_pre_approval_required: true,
  maintenance_request_auto_approve: false,
  amenity_booking_enabled: true,
  complaint_system_enabled: true,
  emergency_contacts_enabled: true,
  digital_notice_board_enabled: true,
};

const QUERY_KEY = ['businessConfig'] as const;

export const useBusinessConfig = () => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<BusinessConfigData> => {
      const response = await fetchAdmin<{ settings?: Partial<BusinessConfigData> }>('/admin/settings/business');
      return {
        ...DEFAULT_BUSINESS_CONFIG,
        ...(response.settings || {}),
      };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: hasToken,
  });
};

export const useUpdateBusinessConfig = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async (data: BusinessConfigData) => {
      const response = await fetchAdmin<{ settings?: Partial<BusinessConfigData> }>('/admin/settings/business', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response.settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};

export const useBusinessConfigValue = (key: keyof BusinessConfigData) => {
  const { data: config } = useBusinessConfig();
  return config?.[key];
};
