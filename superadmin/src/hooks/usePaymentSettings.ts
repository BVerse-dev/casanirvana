'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

// Types for payment settings
export interface PaymentSetting {
  id: number;
  key: string;
  value: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentConfigData {
  razorpay_enabled?: boolean;
  razorpay_key_id?: string;
  razorpay_key_secret?: string;
  stripe_enabled?: boolean;
  stripe_publishable_key?: string;
  stripe_secret_key?: string;
  paypal_enabled?: boolean;
  paypal_client_id?: string;
  paypal_client_secret?: string;
  payment_methods?: string;
  auto_capture?: boolean;
  webhook_enabled?: boolean;
  webhook_secret?: string;
  late_fee_percentage?: string;
  grace_period_days?: string;
  payment_reminder_days?: string;
  auto_receipt_generation?: boolean;
  currency?: string;
  minimum_payment_amount?: string;
  maximum_payment_amount?: string;
}

// Fetch all payment settings
export const usePaymentSettings = () => {
  return useQuery({
    queryKey: ['payment-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_settings')
        .select('*')
        .order('key');

      if (error) throw error;

      // Convert to key-value format for easier use
      const settings = data?.reduce((acc, item) => {
        // Parse boolean values
        if (item.value === 'true' || item.value === 'false') {
          acc[item.key] = item.value === 'true';
        } else {
          acc[item.key] = item.value;
        }
        return acc;
      }, {} as Record<string, any>) || {};

      return { data, settings };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Update payment settings
export const useUpdatePaymentSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settingsData: Record<string, any>) => {
      // Convert settings object to array format for upsert
      const settingsArray = Object.entries(settingsData).map(([key, value]) => ({
        key,
        value: String(value), // Convert to string for database storage
        updated_at: new Date().toISOString(),
      }));

      const { data, error } = await supabase
        .from('payment_settings')
        .upsert(settingsArray, { onConflict: 'key' })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-settings'] });
    },
  });
};

// Get specific payment setting by key
export const usePaymentSetting = (key: string) => {
  return useQuery({
    queryKey: ['payment-settings', key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_settings')
        .select('*')
        .eq('key', key)
        .single();

      if (error) throw error;

      // Parse boolean values
      if (data.value === 'true' || data.value === 'false') {
        return { ...data, value: data.value === 'true' };
      }
      
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Update single payment setting
export const useUpdatePaymentSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      key, 
      value, 
      description 
    }: { 
      key: string; 
      value: any; 
      description?: string; 
    }) => {
      const { data, error } = await supabase
        .from('payment_settings')
        .upsert(
          {
            key,
            value: String(value), // Convert to string for database storage
            description,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'key' }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payment-settings'] });
      queryClient.invalidateQueries({ queryKey: ['payment-settings', variables.key] });
    },
  });
};
