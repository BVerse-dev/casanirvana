import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface PaymentFeeSettings {
  // Transaction Fees by Payment Method (10 fields)
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

  // Processing Fees (4 fields)
  processing_fee_enabled?: boolean;
  processing_fee_percentage?: number;
  processing_fee_fixed?: number;
  processing_fee_max_amount?: number;

  // Convenience Fees (3 fields)
  convenience_fee_enabled?: boolean;
  convenience_fee_percentage?: number;
  convenience_fee_fixed?: number;

  // Late Payment Fees (4 fields)
  late_payment_fee_enabled?: boolean;
  late_payment_fee_percentage?: number;
  late_payment_fee_fixed?: number;
  late_payment_grace_period?: number;

  // Fee Settings and Configuration (4 fields)
  fee_bearer?: string;
  fee_calculation_method?: string;
  minimum_fee_amount?: number;
  maximum_fee_amount?: number;
}

// Parse value based on field type
const parseValue = (key: string, value: string): any => {
  // Boolean fields
  if (key.includes('_enabled')) {
    return value === 'true';
  }
  
  // Number fields (percentages, amounts, periods)
  if (key.includes('_percentage') || key.includes('_fixed') || key.includes('_amount') || key.includes('_period')) {
    return parseFloat(value) || 0;
  }
  
  // String fields (remove quotes if present)
  if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1);
  }
  
  return value;
};

const usePaymentFeeSettings = () => {
  const queryClient = useQueryClient();

  // Fetch payment fee settings
  const {
    data: paymentFeeSettings,
    isLoading: isLoadingData,
    error: loadError,
  } = useQuery({
    queryKey: ['paymentFeeSettings'],
    queryFn: async (): Promise<PaymentFeeSettings> => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value')
        .eq('category', 'payment_fees');

      if (error) {
        console.error('Error fetching payment fee settings:', error);
        throw new Error(`Failed to fetch payment fee settings: ${error.message}`);
      }

      // Transform the data into the expected format
      const settings: PaymentFeeSettings = {};
      
      data?.forEach((setting: { key: string; value: string }) => {
        const { key, value } = setting;
        (settings as any)[key] = parseValue(key, value);
      });

      return settings;
    },
  });

  // Update payment fee settings
  const updateMutation = useMutation({
    mutationFn: async (settings: PaymentFeeSettings): Promise<PaymentFeeSettings> => {
      // Convert settings object to array of updates
      const updates = Object.entries(settings).map(([key, value]) => {
        let stringValue: string;
        
        // Convert value to string based on type
        if (typeof value === 'boolean') {
          stringValue = value.toString();
        } else if (typeof value === 'number') {
          stringValue = value.toString();
        } else if (typeof value === 'string') {
          // Add quotes for string values if they don't already have them
          stringValue = value.startsWith('"') && value.endsWith('"') ? value : `"${value}"`;
        } else {
          stringValue = String(value);
        }

        return {
          key,
          value: stringValue,
          category: 'payment_fees',
          description: getFieldDescription(key),
        };
      });

      // Perform batch upsert
      const { data, error } = await supabase
        .from('app_settings')
        .upsert(updates, { 
          onConflict: 'key',
          ignoreDuplicates: false 
        })
        .select();

      if (error) {
        console.error('Error updating payment fee settings:', error);
        throw new Error(`Failed to update payment fee settings: ${error.message}`);
      }

      // Transform the response back to the expected format
      const newSettings: PaymentFeeSettings = {};
      data?.forEach((setting: { key: string; value: string }) => {
        const { key, value } = setting;
        (newSettings as any)[key] = parseValue(key, value);
      });

      return newSettings;
    },
    onSuccess: () => {
      // Invalidate and refetch the settings
      queryClient.invalidateQueries({ queryKey: ['paymentFeeSettings'] });
    },
  });

  const updateSettings = (settings: PaymentFeeSettings) => {
    updateMutation.mutate(settings);
  };

  return {
    paymentFeeSettings,
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
    // Transaction Fees
    credit_card_fee_percentage: 'Credit card transaction fee percentage',
    credit_card_fee_fixed: 'Credit card fixed transaction fee amount',
    debit_card_fee_percentage: 'Debit card transaction fee percentage',
    debit_card_fee_fixed: 'Debit card fixed transaction fee amount',
    upi_fee_percentage: 'UPI transaction fee percentage',
    upi_fee_fixed: 'UPI fixed transaction fee amount',
    net_banking_fee_percentage: 'Net banking transaction fee percentage',
    net_banking_fee_fixed: 'Net banking fixed transaction fee amount',
    wallet_fee_percentage: 'Digital wallet transaction fee percentage',
    wallet_fee_fixed: 'Digital wallet fixed transaction fee amount',

    // Processing Fees
    processing_fee_enabled: 'Enable additional processing fees',
    processing_fee_percentage: 'Processing fee percentage',
    processing_fee_fixed: 'Fixed processing fee amount',
    processing_fee_max_amount: 'Maximum processing fee amount',

    // Convenience Fees
    convenience_fee_enabled: 'Enable convenience fees for online payments',
    convenience_fee_percentage: 'Convenience fee percentage',
    convenience_fee_fixed: 'Fixed convenience fee amount',

    // Late Payment Fees
    late_payment_fee_enabled: 'Enable late payment penalties',
    late_payment_fee_percentage: 'Late payment fee percentage',
    late_payment_fee_fixed: 'Fixed late payment fee amount',
    late_payment_grace_period: 'Grace period in days before late fees apply',

    // Fee Settings
    fee_bearer: 'Who bears the transaction fees (customer/merchant/split)',
    fee_calculation_method: 'Method for calculating fees (percentage_only/fixed_only/percentage_plus_fixed/higher_of_both)',
    minimum_fee_amount: 'Minimum fee amount charged per transaction',
    maximum_fee_amount: 'Maximum fee amount charged per transaction',
  };

  return descriptions[key] || `Configuration setting for ${key}`;
};

export default usePaymentFeeSettings;
