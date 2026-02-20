import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Template type matching our frontend interface
export interface Template {
  id: number;
  template_name?: string | null;
  template_content?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  name?: string | null;
  type?: string | null;
  category?: string | null;
  subject?: string | null;
  content?: string | null;
  variables?: string[] | null;
  status?: string | null;
  usage_count?: number | null;
  last_used?: string | null;
}

export type TemplateInsert = Omit<Template, 'id' | 'created_at' | 'updated_at'>;
export type TemplateUpdate = Partial<TemplateInsert>;

// List all notification templates
export const useListNotificationTemplates = () => {
  return useQuery({
    queryKey: ['notification-templates'],
    queryFn: async (): Promise<Template[]> => {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .order('usage_count', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

// Get single notification template
export const useGetNotificationTemplate = (id: number) => {
  return useQuery({
    queryKey: ['notification-templates', id],
    queryFn: async (): Promise<Template | null> => {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

// Create notification template
export const useCreateNotificationTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: TemplateInsert): Promise<Template> => {
      const { data, error } = await (supabase as any)
        .from('notification_templates')
        .insert(template)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
    },
  });
};

// Update notification template
export const useUpdateNotificationTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TemplateUpdate & { id: number }): Promise<Template> => {
      const { data, error } = await (supabase as any)
        .from('notification_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
      queryClient.invalidateQueries({ queryKey: ['notification-templates', data.id] });
    },
  });
};

// Delete notification template
export const useDeleteNotificationTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const { error } = await supabase
        .from('notification_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
    },
  });
};

// Increment usage count
export const useIncrementTemplateUsage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<Template> => {
      // First get current usage count
      const { data: current, error: fetchError } = await (supabase as any)
        .from('notification_templates')
        .select('usage_count')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Increment the usage count
      const newUsageCount = (current.usage_count || 0) + 1;

      const { data, error } = await (supabase as any)
        .from('notification_templates')
        .update({ 
          usage_count: newUsageCount,
          last_used: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
    },
  });
};
