'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdminApi } from './useAdminApi';

export interface PaymentGatewaySettings {
  razorpay_enabled?: boolean;
  razorpay_key_id?: string;
  razorpay_key_secret?: string;
  razorpay_webhook_secret?: string;
  razorpay_mode?: string;
  stripe_enabled?: boolean;
  stripe_publishable_key?: string;
  stripe_secret_key?: string;
  stripe_webhook_secret?: string;
  stripe_mode?: string;
  paypal_enabled?: boolean;
  paypal_client_id?: string;
  paypal_client_secret?: string;
  paypal_webhook_id?: string;
  paypal_mode?: string;
  paytm_enabled?: boolean;
  paytm_merchant_id?: string;
  paytm_merchant_key?: string;
  paytm_website?: string;
  paytm_mode?: string;
  expresspay_enabled?: boolean;
  expresspay_merchant_id?: string;
  expresspay_api_key?: string;
  expresspay_webhook_url?: string;
  expresspay_mode?: string;
  bank_transfer_enabled?: boolean;
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  account_holder_name?: string;
  payment_currency?: string;
  payment_timeout?: number;
  auto_refund_enabled?: boolean;
  partial_payment_enabled?: boolean;
}

export type PaymentGatewayTestTarget =
  | 'razorpay'
  | 'stripe'
  | 'paypal'
  | 'paytm'
  | 'bank_transfer';

const DEFAULT_PAYMENT_GATEWAY_SETTINGS: PaymentGatewaySettings = {
  razorpay_enabled: false,
  razorpay_key_id: '',
  razorpay_key_secret: '',
  razorpay_webhook_secret: '',
  razorpay_mode: 'test',
  stripe_enabled: false,
  stripe_publishable_key: '',
  stripe_secret_key: '',
  stripe_webhook_secret: '',
  stripe_mode: 'test',
  paypal_enabled: false,
  paypal_client_id: '',
  paypal_client_secret: '',
  paypal_webhook_id: '',
  paypal_mode: 'sandbox',
  paytm_enabled: false,
  paytm_merchant_id: '',
  paytm_merchant_key: '',
  paytm_website: '',
  paytm_mode: 'test',
  bank_transfer_enabled: false,
  bank_name: '',
  account_number: '',
  ifsc_code: '',
  account_holder_name: '',
  payment_currency: 'GHS',
  payment_timeout: 15,
  auto_refund_enabled: false,
  partial_payment_enabled: false,
};

const usePaymentGatewaySettings = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin, hasToken } = useAdminApi();

  const {
    data: paymentGatewaySettings,
    isLoading: isLoadingData,
    error: loadError,
  } = useQuery({
    queryKey: ['paymentGatewaySettings'],
    queryFn: async (): Promise<PaymentGatewaySettings> => {
      const response = await fetchAdmin<{ settings?: Partial<PaymentGatewaySettings> }>(
        '/admin/settings/payment-gateways'
      );
      return {
        ...DEFAULT_PAYMENT_GATEWAY_SETTINGS,
        ...(response.settings || {}),
      };
    },
    staleTime: 5 * 60 * 1000,
    enabled: hasToken,
  });

  const updateMutation = useMutation({
    mutationFn: async (settings: Partial<PaymentGatewaySettings>) => {
      const response = await fetchAdmin<{ settings?: Partial<PaymentGatewaySettings> }>(
        '/admin/settings/payment-gateways',
        {
          method: 'PUT',
          body: JSON.stringify(settings),
        }
      );
      return response.settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentGatewaySettings'] });
    },
  });

  return {
    paymentGatewaySettings,
    isLoadingData,
    isUpdating: updateMutation.isPending,
    loadError,
    updateError: updateMutation.error,
    updateSuccess: updateMutation.isSuccess,
    updateSettings: updateMutation.mutate,
    updateSettingsAsync: updateMutation.mutateAsync,
  };
};

export const useTestPaymentGatewaySettings = () => {
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async ({
      gateway,
      settings,
    }: {
      gateway: PaymentGatewayTestTarget;
      settings: Partial<PaymentGatewaySettings>;
    }) => {
      return fetchAdmin<{ success: boolean; message: string }>('/admin/settings/payment-gateways/test', {
        method: 'POST',
        body: JSON.stringify({ gateway, settings }),
      });
    },
  });
};

export default usePaymentGatewaySettings;
