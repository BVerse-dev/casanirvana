'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdminApi } from './useAdminApi';

export interface PaymentFeeSettings {
  credit_card_fee_percentage?: number;
  credit_card_fee_fixed?: number;
  debit_card_fee_percentage?: number;
  debit_card_fee_fixed?: number;
  expresspay_fee_percentage?: number;
  expresspay_fee_fixed?: number;
  net_banking_fee_percentage?: number;
  net_banking_fee_fixed?: number;
  wallet_fee_percentage?: number;
  wallet_fee_fixed?: number;
  processing_fee_enabled?: boolean;
  processing_fee_percentage?: number;
  processing_fee_fixed?: number;
  processing_fee_max_amount?: number;
  convenience_fee_enabled?: boolean;
  convenience_fee_percentage?: number;
  convenience_fee_fixed?: number;
  late_payment_fee_enabled?: boolean;
  late_payment_fee_percentage?: number;
  late_payment_fee_fixed?: number;
  late_payment_grace_period?: number;
  fee_bearer?: string;
  fee_calculation_method?: string;
  minimum_fee_amount?: number;
  maximum_fee_amount?: number;
}

const DEFAULT_PAYMENT_FEE_SETTINGS: PaymentFeeSettings = {
  credit_card_fee_percentage: 2.5,
  credit_card_fee_fixed: 0,
  debit_card_fee_percentage: 1.5,
  debit_card_fee_fixed: 0,
  expresspay_fee_percentage: 0,
  expresspay_fee_fixed: 0,
  net_banking_fee_percentage: 1,
  net_banking_fee_fixed: 0,
  wallet_fee_percentage: 0,
  wallet_fee_fixed: 0,
  processing_fee_enabled: false,
  processing_fee_percentage: 1,
  processing_fee_fixed: 5,
  processing_fee_max_amount: 100,
  convenience_fee_enabled: false,
  convenience_fee_percentage: 1,
  convenience_fee_fixed: 10,
  late_payment_fee_enabled: true,
  late_payment_fee_percentage: 2,
  late_payment_fee_fixed: 50,
  late_payment_grace_period: 7,
  fee_bearer: 'customer',
  fee_calculation_method: 'percentage_plus_fixed',
  minimum_fee_amount: 1,
  maximum_fee_amount: 500,
};

const usePaymentFeeSettings = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin, hasToken } = useAdminApi();

  const {
    data: paymentFeeSettings,
    isLoading: isLoadingData,
    error: loadError,
  } = useQuery({
    queryKey: ['paymentFeeSettings'],
    queryFn: async (): Promise<PaymentFeeSettings> => {
      const response = await fetchAdmin<{ settings?: Partial<PaymentFeeSettings> }>(
        '/admin/settings/payment-fees'
      );
      return {
        ...DEFAULT_PAYMENT_FEE_SETTINGS,
        ...(response.settings || {}),
      };
    },
    staleTime: 5 * 60 * 1000,
    enabled: hasToken,
  });

  const updateMutation = useMutation({
    mutationFn: async (settings: Partial<PaymentFeeSettings>) => {
      const response = await fetchAdmin<{ settings?: Partial<PaymentFeeSettings> }>(
        '/admin/settings/payment-fees',
        {
          method: 'PUT',
          body: JSON.stringify(settings),
        }
      );
      return response.settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentFeeSettings'] });
    },
  });

  return {
    paymentFeeSettings,
    isLoadingData,
    isUpdating: updateMutation.isPending,
    loadError,
    updateError: updateMutation.error,
    updateSuccess: updateMutation.isSuccess,
    updateSettings: updateMutation.mutate,
    updateSettingsAsync: updateMutation.mutateAsync,
  };
};

export default usePaymentFeeSettings;
