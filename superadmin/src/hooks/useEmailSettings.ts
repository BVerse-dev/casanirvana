'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

// Type for email settings (SMTP configuration)
type EmailSettings = Database['public']['Tables']['email_settings']['Row'];
type EmailSettingsInsert = Database['public']['Tables']['email_settings']['Insert'];
type EmailSettingsUpdate = Database['public']['Tables']['email_settings']['Update'];

// Fetch all email settings (SMTP configurations)
export const useEmailSettings = () => {
  return useQuery({
    queryKey: ['email-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_settings')
        .select('*')
        .order('created_at');

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get default email setting
export const useDefaultEmailSetting = () => {
  return useQuery({
    queryKey: ['email-settings', 'default'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_settings')
        .select('*')
        .eq('is_default', true)
        .single();

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get specific email setting by ID
export const useEmailSetting = (id: string) => {
  return useQuery({
    queryKey: ['email-settings', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_settings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create new email setting
export const useCreateEmailSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (emailSetting: EmailSettingsInsert) => {
      const { data, error } = await supabase
        .from('email_settings')
        .insert(emailSetting)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-settings'] });
    },
  });
};

// Update email setting
export const useUpdateEmailSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & EmailSettingsUpdate) => {
      const { data, error } = await supabase
        .from('email_settings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['email-settings'] });
      queryClient.invalidateQueries({ queryKey: ['email-settings', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['email-settings', 'default'] });
    },
  });
};

// Delete email setting
export const useDeleteEmailSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('email_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-settings'] });
    },
  });
};
