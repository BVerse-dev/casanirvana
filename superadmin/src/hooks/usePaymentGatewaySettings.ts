import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface PaymentGatewaySettings {
  // Razorpay
  razorpay_enabled?: boolean;
  razorpay_key_id?: string;
  razorpay_key_secret?: string;
  razorpay_webhook_secret?: string;
  razorpay_mode?: string;

  // Stripe
  stripe_enabled?: boolean;
  stripe_publishable_key?: string;
  stripe_secret_key?: string;
  stripe_webhook_secret?: string;
  stripe_mode?: string;

  // PayPal
  paypal_enabled?: boolean;
  paypal_client_id?: string;
  paypal_client_secret?: string;
  paypal_webhook_id?: string;
  paypal_mode?: string;

  // Paytm
  paytm_enabled?: boolean;
  paytm_merchant_id?: string;
  paytm_merchant_key?: string;
  paytm_website?: string;
  paytm_mode?: string;

  // ExpressPay
  expresspay_enabled?: boolean;
  expresspay_merchant_id?: string;
  expresspay_api_key?: string;
  expresspay_secret_key?: string;
  expresspay_webhook_url?: string;
  expresspay_mode?: string;

  // Bank Transfer
  bank_transfer_enabled?: boolean;
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  account_holder_name?: string;

  // Payment Settings
  payment_currency?: string;
  payment_timeout?: number;
  auto_refund_enabled?: boolean;
  partial_payment_enabled?: boolean;
}

// Parse value based on field type
const parseValue = (key: string, value: string): any => {
  // Boolean fields
  if (key.includes('_enabled')) {
    return value === 'true';
  }
  
  // Number fields
  if (key === 'payment_timeout') {
    return parseInt(value) || 15;
  }
  
  // String fields (remove quotes if present)
  if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1);
  }
  
  return value;
};

// Format value for database storage
const formatValue = (key: string, value: any): string => {
  if (typeof value === 'boolean') {
    return value.toString();
  }
  
  if (typeof value === 'number') {
    return value.toString();
  }
  
  if (typeof value === 'string') {
    // Add quotes for string values (except empty strings)
    return value === '' ? '""' : `"${value}"`;
  }
  
  return value?.toString() || '""';
};

const usePaymentGatewaySettings = () => {
  const queryClient = useQueryClient();

  // Fetch payment gateway settings
  const {
    data: paymentGatewaySettings,
    isLoading: isLoadingData,
    error: loadError,
  } = useQuery({
    queryKey: ['paymentGatewaySettings'],
    queryFn: async (): Promise<PaymentGatewaySettings> => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value')
        .eq('category', 'payment_gateways');

      if (error) {
        console.error('Error fetching payment gateway settings:', error);
        throw new Error(`Failed to fetch payment gateway settings: ${error.message}`);
      }

      // Transform the data into the expected format
      const settings: PaymentGatewaySettings = {};
      
      data?.forEach((setting: { key: string; value: string }) => {
        const { key, value } = setting;
        (settings as any)[key] = parseValue(key, value);
      });

      return settings;
    },
  });

  // Update payment gateway settings
  const updateMutation = useMutation({
    mutationFn: async (newSettings: PaymentGatewaySettings) => {
      const updates = Object.entries(newSettings).map(([key, value]) => ({
        key,
        value: formatValue(key, value),
        category: 'payment_gateways',
        description: getFieldDescription(key),
      }));

      const { error } = await supabase
        .from('app_settings')
        .upsert(updates, { onConflict: 'key' });

      if (error) {
        console.error('Error updating payment gateway settings:', error);
        throw new Error(`Failed to update payment gateway settings: ${error.message}`);
      }

      return newSettings;
    },
    onSuccess: () => {
      // Invalidate and refetch the settings
      queryClient.invalidateQueries({ queryKey: ['paymentGatewaySettings'] });
    },
  });

  const updateSettings = (settings: PaymentGatewaySettings) => {
    updateMutation.mutate(settings);
  };

  return {
    paymentGatewaySettings,
    isLoadingData,
    isUpdating: updateMutation.isPending,
    loadError,
    updateError: updateMutation.error,
    updateSuccess: updateMutation.isSuccess,
    updateSettings,
  };
};

// Helper function to get field descriptions
const getFieldDescription = (key: string): string => {
  const descriptions: Record<string, string> = {
    // Razorpay
    razorpay_enabled: 'Enable Razorpay payment gateway',
    razorpay_key_id: 'Razorpay key ID for payment processing',
    razorpay_key_secret: 'Razorpay key secret for payment processing',
    razorpay_webhook_secret: 'Razorpay webhook secret for payment verification',
    razorpay_mode: 'Razorpay mode (test or live)',

    // Stripe
    stripe_enabled: 'Enable Stripe payment gateway',
    stripe_publishable_key: 'Stripe publishable key for payment processing',
    stripe_secret_key: 'Stripe secret key for payment processing',
    stripe_webhook_secret: 'Stripe webhook secret for payment verification',
    stripe_mode: 'Stripe mode (test or live)',

    // PayPal
    paypal_enabled: 'Enable PayPal payment gateway',
    paypal_client_id: 'PayPal client ID for payment processing',
    paypal_client_secret: 'PayPal client secret for payment processing',
    paypal_webhook_id: 'PayPal webhook ID for payment verification',
    paypal_mode: 'PayPal mode (sandbox or live)',

    // Paytm
    paytm_enabled: 'Enable Paytm payment gateway',
    paytm_merchant_id: 'Paytm merchant ID for payment processing',
    paytm_merchant_key: 'Paytm merchant key for payment processing',
    paytm_website: 'Paytm website parameter for payment processing',
    paytm_mode: 'Paytm mode (test or live)',

    // UPI
    upi_enabled: 'Enable UPI payment method',
    upi_merchant_id: 'UPI merchant ID for payment processing',
    upi_merchant_vpa: 'UPI merchant VPA for payment processing',

    // Bank Transfer
    bank_transfer_enabled: 'Enable bank transfer payment method',
    bank_name: 'Bank name for direct bank transfers',
    account_number: 'Bank account number for direct transfers',
    ifsc_code: 'Bank IFSC code for direct transfers',
    account_holder_name: 'Bank account holder name for direct transfers',

    // Payment Settings
    payment_currency: 'Default currency for payments (USD, INR, EUR, GBP)',
    payment_timeout: 'Payment timeout in minutes',
    auto_refund_enabled: 'Enable automatic refunds for failed payments',
    partial_payment_enabled: 'Enable partial payments for maintenance fees',
  };

  return descriptions[key] || `Configuration setting for ${key}`;
};

export default usePaymentGatewaySettings;
