'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdminApi } from './useAdminApi';

export interface PaymentMethodSettings {
  credit_card_enabled?: boolean;
  debit_card_enabled?: boolean;
  net_banking_enabled?: boolean;
  expresspay_enabled?: boolean;
  wallet_enabled?: boolean;
  bank_transfer_enabled?: boolean;
  cash_enabled?: boolean;
  cheque_enabled?: boolean;
  min_payment_amount?: number;
  max_payment_amount?: number;
  daily_payment_limit?: number;
  monthly_payment_limit?: number;
  auto_capture_enabled?: boolean;
  partial_payments_enabled?: boolean;
  recurring_payments_enabled?: boolean;
  refund_enabled?: boolean;
  payment_instructions?: string;
  payment_terms?: string;
}

const DEFAULT_PAYMENT_METHOD_SETTINGS: PaymentMethodSettings = {
  credit_card_enabled: true,
  debit_card_enabled: true,
  net_banking_enabled: false,
  expresspay_enabled: true,
  wallet_enabled: false,
  bank_transfer_enabled: false,
  cash_enabled: false,
  cheque_enabled: false,
  min_payment_amount: 1,
  max_payment_amount: 100000,
  daily_payment_limit: 50000,
  monthly_payment_limit: 500000,
  auto_capture_enabled: true,
  partial_payments_enabled: false,
  recurring_payments_enabled: true,
  refund_enabled: true,
  payment_instructions: '',
  payment_terms: '',
};

const usePaymentMethodSettings = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin, hasToken } = useAdminApi();

  const {
    data: paymentMethodSettings,
    isLoading: isLoadingData,
    error: loadError,
  } = useQuery({
    queryKey: ['paymentMethodSettings'],
    queryFn: async (): Promise<PaymentMethodSettings> => {
      const response = await fetchAdmin<{ settings?: Partial<PaymentMethodSettings> }>(
        '/admin/settings/payment-methods'
      );
      return {
        ...DEFAULT_PAYMENT_METHOD_SETTINGS,
        ...(response.settings || {}),
      };
    },
    staleTime: 5 * 60 * 1000,
    enabled: hasToken,
  });

  const updateMutation = useMutation({
    mutationFn: async (settings: Partial<PaymentMethodSettings>) => {
      const response = await fetchAdmin<{ settings?: Partial<PaymentMethodSettings> }>(
        '/admin/settings/payment-methods',
        {
          method: 'PUT',
          body: JSON.stringify(settings),
        }
      );
      return response.settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethodSettings'] });
    },
  });

  return {
    paymentMethodSettings,
    isLoadingData,
    isUpdating: updateMutation.isPending,
    loadError,
    updateError: updateMutation.error,
    updateSuccess: updateMutation.isSuccess,
    updateSettings: updateMutation.mutate,
    updateSettingsAsync: updateMutation.mutateAsync,
  };
};

export default usePaymentMethodSettings;
