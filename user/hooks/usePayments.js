import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// Hook to list pending payments for a unit
export const useListPendingPayments = (unitId) => {
  return useQuery({
    queryKey: ['pending-payments', unitId],
    queryFn: async () => {
      if (!unitId) {
        return [];
      }
      
      try {
        const { data, error } = await supabase
          .from('payments')
          .select(`
            *,
            units (
              id,
              number,
              type,
              floor,
              block
            )
          `)
          .eq('unit_id', unitId)
          .eq('status', 'pending')
          .order('due_date', { ascending: true });
        
        if (error) {
          console.error('❌ useListPendingPayments error:', error);
          throw error;
        }
        
        return data || [];
        return data || [];
      } catch (error) {
        console.error('❌ useListPendingPayments: Unexpected error:', error);
        throw error;
      }
    },
    enabled: !!unitId,
  });
};

// Hook to list payment history for a unit
export const useListPaymentHistory = (unitId) => {
  return useQuery({
    queryKey: ['payment-history', unitId],
    queryFn: async () => {
      if (!unitId) {
        return [];
      }
      
      try {
        const { data, error } = await supabase
          .from('payments')
          .select(`
            *,
            units (
              id,
              number,
              type,
              floor,
              block
            )
          `)
          .eq('unit_id', unitId)
          .eq('status', 'completed')
          .order('paid_at', { ascending: false });
        
        if (error) {
          console.error('❌ useListPaymentHistory error:', error);
          throw error;
        }
        
        return data || [];
        return data || [];
      } catch (error) {
        console.error('❌ useListPaymentHistory: Unexpected error:', error);
        throw error;
      }
    },
    enabled: !!unitId,
  });
};

// Hook to list payment statements for a unit
export const useListPaymentStatements = (unitId) => {
  return useQuery({
    queryKey: ['payment-statements', unitId],
    queryFn: async () => {
      if (!unitId) {
        return [];
      }
      
      try {
        const { data, error } = await supabase
          .from('payment_statements')
          .select('*')
          .eq('unit_id', unitId)
          .order('month_year', { ascending: false });
        
        if (error) {
          console.error('❌ useListPaymentStatements error:', error);
          throw error;
        }
        
        return data || [];
        return data || [];
      } catch (error) {
        console.error('❌ useListPaymentStatements: Unexpected error:', error);
        throw error;
      }
    },
    enabled: !!unitId,
  });
};

// Hook to download payment receipt
export const useDownloadPaymentReceipt = () => {
  return useMutation({
    mutationFn: async (paymentId) => {
      console.log('📄 Downloading receipt for payment ID:', paymentId);
      
      // First fetch the payment data to get the receipt URL
      const { data: payment, error } = await supabase
        .from('payments')
        .select('id, receipt_url, title')
        .eq('id', paymentId)
        .single();
      
      if (error) {
        console.error('❌ Error fetching payment data:', error);
        throw new Error('Payment not found');
      }
      
      if (!payment?.receipt_url) {
        throw new Error('No receipt available for this payment');
      }
      
      // In a real app, you would download the file from the URL
      // For now, we'll return the URL for opening in browser
      console.log(`📄 Receipt URL for payment ${payment.title}: ${payment.receipt_url}`);
      
      return { success: true, url: payment.receipt_url };
    },
  });
};

// Hook to download payment statement
export const useDownloadPaymentStatement = () => {
  return useMutation({
    mutationFn: async (statementId) => {
      console.log('📄 Downloading statement ID:', statementId);
      
      // First fetch the statement data to get the statement URL
      const { data: statement, error } = await supabase
        .from('payment_statements')
        .select('id, statement_url, month_year')
        .eq('id', statementId)
        .single();
      
      if (error) {
        console.error('❌ Error fetching statement data:', error);
        throw new Error('Statement not found');
      }
      
      if (!statement?.statement_url) {
        throw new Error('No statement PDF available');
      }
      
      // In a real app, you would download the file from the URL
      // For now, we'll return the URL for opening in browser
      console.log(`📄 Statement URL for ${statement.month_year}: ${statement.statement_url}`);
      
      return { success: true, url: statement.statement_url };
    },
  });
};

// Hook to update payment
export const useUpdatePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }) => {
      console.log('🔄 Updating payment:', id, updates);
      
      const { data, error } = await supabase
        .from('payments')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('❌ useUpdatePayment error:', error);
        throw error;
      }
      
      console.log('✅ Payment updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      console.log('🔄 Invalidating payment queries after update');
      queryClient.invalidateQueries({ queryKey: ['pending-payments'] });
      queryClient.invalidateQueries({ queryKey: ['payment-history'] });
    },
  });
};
