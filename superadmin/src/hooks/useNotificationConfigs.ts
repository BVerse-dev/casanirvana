'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

// Type for notification configs
type NotificationConfig = Database['public']['Tables']['notification_configs']['Row'];
type NotificationConfigInsert = Database['public']['Tables']['notification_configs']['Insert'];
type NotificationConfigUpdate = Database['public']['Tables']['notification_configs']['Update'];

// Fetch all notification configs
export const useNotificationConfigs = () => {
  return useQuery({
    queryKey: ['notification-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_configs')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get notification configs by category
export const useNotificationConfigsByCategory = (category: string) => {
  return useQuery({
    queryKey: ['notification-configs', 'category', category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_configs')
        .select('*')
        .eq('category', category)
        .order('provider');

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get notification configs by provider
export const useNotificationConfigsByProvider = (provider: string) => {
  return useQuery({
    queryKey: ['notification-configs', 'provider', provider],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_configs')
        .select('*')
        .eq('provider', provider)
        .order('category');

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get active notification configs
export const useActiveNotificationConfigs = () => {
  return useQuery({
    queryKey: ['notification-configs', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_configs')
        .select('*')
        .eq('is_active', true)
        .order('category');

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get specific notification config by ID
export const useNotificationConfig = (id: string) => {
  return useQuery({
    queryKey: ['notification-configs', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_configs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create new notification config
export const useCreateNotificationConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationConfig: NotificationConfigInsert) => {
      const { data, error } = await supabase
        .from('notification_configs')
        .insert(notificationConfig)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-configs'] });
    },
  });
};

// Update notification config
export const useUpdateNotificationConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & NotificationConfigUpdate) => {
      const { data, error } = await supabase
        .from('notification_configs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notification-configs'] });
      queryClient.invalidateQueries({ queryKey: ['notification-configs', variables.id] });
    },
  });
};

// Toggle notification config active status
export const useToggleNotificationConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('notification_configs')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notification-configs'] });
      queryClient.invalidateQueries({ queryKey: ['notification-configs', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['notification-configs', 'active'] });
    },
  });
};

// Delete notification config
export const useDeleteNotificationConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notification_configs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-configs'] });
    },
  });
};
