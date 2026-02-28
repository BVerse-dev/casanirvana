import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface PaymentMethodSettings {
  // Payment Methods Configuration (8 fields)
  credit_card_enabled?: boolean;
  debit_card_enabled?: boolean;
  net_banking_enabled?: boolean;
  expresspay_enabled?: boolean;
  wallet_enabled?: boolean;
  bank_transfer_enabled?: boolean;
  cash_enabled?: boolean;
  cheque_enabled?: boolean;

  // Payment Method Limits (4 fields)
  min_payment_amount?: number;
  max_payment_amount?: number;
  daily_payment_limit?: number;
  monthly_payment_limit?: number;

  // Payment Processing Configuration (4 fields)
  auto_capture_enabled?: boolean;
  partial_payments_enabled?: boolean;
  recurring_payments_enabled?: boolean;
  refund_enabled?: boolean;

  // Payment Notes and Instructions (2 fields)
  payment_instructions?: string;
  payment_terms?: string;
}

// Parse value based on field type
const parseValue = (key: string, value: string): any => {
  // Boolean fields
  if (key.includes('_enabled')) {
    return value === 'true';
  }
  
  // Number fields
  if (key.includes('_amount') || key.includes('_limit')) {
    return parseInt(value) || 0;
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

const usePaymentMethodSettings = () => {
  const queryClient = useQueryClient();

  // Fetch payment method settings
  const {
    data: paymentMethodSettings,
    isLoading: isLoadingData,
    error: loadError,
  } = useQuery({
    queryKey: ['paymentMethodSettings'],
    queryFn: async (): Promise<PaymentMethodSettings> => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value')
        .eq('category', 'payment_methods');

      if (error) {
        console.error('Error fetching payment method settings:', error);
        throw new Error(`Failed to fetch payment method settings: ${error.message}`);
      }

      // Transform the data into the expected format
      const settings: PaymentMethodSettings = {};
      
      data?.forEach((setting: { key: string; value: string }) => {
        const { key, value } = setting;
        (settings as any)[key] = parseValue(key, value);
      });

      return settings;
    },
  });

  // Update payment method settings
  const updateMutation = useMutation({
    mutationFn: async (newSettings: PaymentMethodSettings) => {
      const updates = Object.entries(newSettings).map(([key, value]) => ({
        key,
        value: formatValue(key, value),
        category: 'payment_methods',
        description: getFieldDescription(key),
      }));

      const { error } = await supabase
        .from('app_settings')
        .upsert(updates, { onConflict: 'key' });

      if (error) {
        console.error('Error updating payment method settings:', error);
        throw new Error(`Failed to update payment method settings: ${error.message}`);
      }

      return newSettings;
    },
    onSuccess: () => {
      // Invalidate and refetch the settings
      queryClient.invalidateQueries({ queryKey: ['paymentMethodSettings'] });
    },
  });

  const updateSettings = (settings: PaymentMethodSettings) => {
    updateMutation.mutate(settings);
  };

  return {
    paymentMethodSettings,
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
    // Payment Methods
    credit_card_enabled: 'Enable card payments for user app checkout',
    debit_card_enabled: 'Reserved payment toggle for future debit-card-specific flows',
    net_banking_enabled: 'Reserved payment toggle for future net banking flows',
    expresspay_enabled: 'Enable Mobile Money payments through ExpressPay',
    wallet_enabled: 'Enable PayPal for future rollout (currently hidden in the user app)',
    bank_transfer_enabled: 'Enable bank transfer payments for upcoming flows',
    cash_enabled: 'Reserved payment toggle for cash collection flows',
    cheque_enabled: 'Reserved payment toggle for cheque collection flows',

    // Payment Limits
    min_payment_amount: 'Minimum payment amount allowed',
    max_payment_amount: 'Maximum payment amount allowed',
    daily_payment_limit: 'Daily payment limit per user',
    monthly_payment_limit: 'Monthly payment limit per user',

    // Payment Processing
    auto_capture_enabled: 'Enable automatic payment capture',
    partial_payments_enabled: 'Enable partial payments for bills',
    recurring_payments_enabled: 'Enable recurring/subscription payments',
    refund_enabled: 'Enable refund processing',

    // Payment Notes
    payment_instructions: 'Custom payment instructions for users',
    payment_terms: 'Payment terms and conditions text',
  };

  return descriptions[key] || `Configuration setting for ${key}`;
};

export default usePaymentMethodSettings;
