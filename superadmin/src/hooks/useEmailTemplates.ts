'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Types
export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  template_type: 'welcome' | 'notification' | 'password_reset' | 'verification' | 'invoice' | 'reminder' | 'newsletter' | 'custom';
  subject: string;
  body_text: string;
  body_html: string;
  variables: string[];
  category: string;
  language: string;
  is_active: boolean;
  is_default: boolean;
  sender_name: string;
  sender_email: string;
  reply_to_email: string;
  attachments: Record<string, any>[];
  metadata: Record<string, any>;
  usage_count: number;
  last_used: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEmailTemplateData {
  name: string;
  description?: string;
  template_type: 'welcome' | 'notification' | 'password_reset' | 'verification' | 'invoice' | 'reminder' | 'newsletter' | 'custom';
  subject: string;
  body_text: string;
  body_html?: string;
  variables?: string[];
  category?: string;
  language?: string;
  is_active?: boolean;
  is_default?: boolean;
  sender_name?: string;
  sender_email?: string;
  reply_to_email?: string;
  attachments?: Record<string, any>[];
  metadata?: Record<string, any>;
}

export interface UpdateEmailTemplateData extends Partial<CreateEmailTemplateData> {}

// Query Keys
const QUERY_KEYS = {
  emailTemplates: ['email_templates'] as const,
  emailTemplate: (id: string) => ['email_templates', id] as const,
  emailTemplatesByType: (type: string) => ['email_templates', 'type', type] as const,
  emailTemplatesByCategory: (category: string) => ['email_templates', 'category', category] as const,
  activeEmailTemplates: ['email_templates', 'active'] as const,
  defaultEmailTemplates: ['email_templates', 'default'] as const,
};

// Helper function to parse email template data
const parseEmailTemplateData = (data: any): EmailTemplate => {
  return {
    id: data.id,
    name: data.name || '',
    description: data.description || '',
    template_type: data.template_type || 'custom',
    subject: data.subject || '',
    body_text: data.body_text || '',
    body_html: data.body_html || '',
    variables: data.variables || [],
    category: data.category || 'general',
    language: data.language || 'en',
    is_active: data.is_active ?? true,
    is_default: data.is_default ?? false,
    sender_name: data.sender_name || '',
    sender_email: data.sender_email || '',
    reply_to_email: data.reply_to_email || '',
    attachments: data.attachments || [],
    metadata: data.metadata || {},
    usage_count: data.usage_count || 0,
    last_used: data.last_used,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

// Hooks

// List all email templates
export const useListEmailTemplates = () => {
  return useQuery({
    queryKey: QUERY_KEYS.emailTemplates,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching email templates:', error);
        throw new Error(`Failed to fetch email templates: ${error.message}`);
      }

      return data?.map(parseEmailTemplateData) || [];
    },
  });
};

// Get active email templates
export const useActiveEmailTemplates = () => {
  return useQuery({
    queryKey: QUERY_KEYS.activeEmailTemplates,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching active email templates:', error);
        throw new Error(`Failed to fetch active email templates: ${error.message}`);
      }

      return data?.map(parseEmailTemplateData) || [];
    },
  });
};

// Get default email templates
export const useDefaultEmailTemplates = () => {
  return useQuery({
    queryKey: QUERY_KEYS.defaultEmailTemplates,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('is_default', true)
        .order('template_type');

      if (error) {
        console.error('Error fetching default email templates:', error);
        throw new Error(`Failed to fetch default email templates: ${error.message}`);
      }

      return data?.map(parseEmailTemplateData) || [];
    },
  });
};

// Get email template by ID
export const useGetEmailTemplate = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.emailTemplate(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching email template:', error);
        throw new Error(`Failed to fetch email template: ${error.message}`);
      }

      return parseEmailTemplateData(data);
    },
    enabled: !!id,
  });
};

// Get email templates by type
export const useGetEmailTemplatesByType = (templateType: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.emailTemplatesByType(templateType),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('template_type', templateType)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching email templates by type:', error);
        throw new Error(`Failed to fetch email templates: ${error.message}`);
      }

      return data?.map(parseEmailTemplateData) || [];
    },
    enabled: !!templateType,
  });
};

// Get email templates by category
export const useGetEmailTemplatesByCategory = (category: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.emailTemplatesByCategory(category),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('category', category)
        .order('name');

      if (error) {
        console.error('Error fetching email templates by category:', error);
        throw new Error(`Failed to fetch email templates: ${error.message}`);
      }

      return data?.map(parseEmailTemplateData) || [];
    },
    enabled: !!category,
  });
};

// Create email template
export const useCreateEmailTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newEmailTemplate: CreateEmailTemplateData) => {
      const { data, error } = await supabase
        .from('email_templates')
        .insert([newEmailTemplate])
        .select()
        .single();

      if (error) {
        console.error('Error creating email template:', error);
        throw new Error(`Failed to create email template: ${error.message}`);
      }

      return parseEmailTemplateData(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.emailTemplates });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeEmailTemplates });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.defaultEmailTemplates });
    },
  });
};

// Update email template
export const useUpdateEmailTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateEmailTemplateData }) => {
      const { data, error } = await supabase
        .from('email_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating email template:', error);
        throw new Error(`Failed to update email template: ${error.message}`);
      }

      return parseEmailTemplateData(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.emailTemplates });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.emailTemplate(data.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeEmailTemplates });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.defaultEmailTemplates });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.emailTemplatesByType(data.template_type) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.emailTemplatesByCategory(data.category) });
    },
  });
};

// Delete email template
export const useDeleteEmailTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting email template:', error);
        throw new Error(`Failed to delete email template: ${error.message}`);
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.emailTemplates });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeEmailTemplates });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.defaultEmailTemplates });
    },
  });
};

// Set template as default for its type
export const useSetDefaultEmailTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, templateType }: { id: string; templateType: string }) => {
      // First, remove default status from all templates of this type
      const { error: clearDefaultError } = await supabase
        .from('email_templates')
        .update({ is_default: false })
        .eq('template_type', templateType);

      if (clearDefaultError) {
        console.error('Error clearing default email templates:', clearDefaultError);
        throw new Error(`Failed to clear default templates: ${clearDefaultError.message}`);
      }

      // Then set the specified template as default
      const { data, error } = await supabase
        .from('email_templates')
        .update({ is_default: true })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error setting default email template:', error);
        throw new Error(`Failed to set default template: ${error.message}`);
      }

      return parseEmailTemplateData(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.emailTemplates });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.defaultEmailTemplates });
    },
  });
};

// Duplicate email template
export const useDuplicateEmailTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // First get the original template
      const { data: originalTemplate, error: fetchError } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching original template:', fetchError);
        throw new Error(`Failed to fetch template: ${fetchError.message}`);
      }

      // Create duplicate with modified name
      const duplicateData = {
        ...originalTemplate,
        name: `${originalTemplate.name} (Copy)`,
        is_default: false,
        usage_count: 0,
        last_used: null,
      };

      // Remove id and timestamps as they'll be auto-generated
      delete duplicateData.id;
      delete duplicateData.created_at;
      delete duplicateData.updated_at;

      const { data, error } = await supabase
        .from('email_templates')
        .insert([duplicateData])
        .select()
        .single();

      if (error) {
        console.error('Error duplicating email template:', error);
        throw new Error(`Failed to duplicate email template: ${error.message}`);
      }

      return parseEmailTemplateData(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.emailTemplates });
    },
  });
};

// Update template usage statistics
export const useUpdateTemplateUsage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('email_templates')
        .update({ 
          usage_count: supabase.raw('usage_count + 1'),
          last_used: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating template usage:', error);
        throw new Error(`Failed to update template usage: ${error.message}`);
      }

      return parseEmailTemplateData(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.emailTemplates });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.emailTemplate(data.id) });
    },
  });
};

// Bulk update email templates
export const useBulkUpdateEmailTemplates = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Array<{ id: string; data: UpdateEmailTemplateData }>) => {
      const promises = updates.map(({ id, data }) =>
        supabase
          .from('email_templates')
          .update(data)
          .eq('id', id)
          .select()
          .single()
      );

      const results = await Promise.all(promises);
      
      // Check for errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error('Errors in bulk update:', errors);
        throw new Error(`Failed to update some email templates`);
      }

      return results.map(result => parseEmailTemplateData(result.data));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.emailTemplates });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeEmailTemplates });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.defaultEmailTemplates });
    },
  });
};
