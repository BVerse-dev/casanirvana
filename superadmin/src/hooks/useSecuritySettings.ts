'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Types
export interface SecuritySettings {
  id: string;
  password_policy: Record<string, any>;
  session_timeout: number;
  max_login_attempts: number;
  account_lockout_duration: number;
  two_factor_auth_required: boolean;
  password_expiry_days: number;
  password_history_count: number;
  login_history_retention_days: number;
  ip_whitelist: string[];
  ip_blacklist: string[];
  allowed_countries: string[];
  blocked_countries: string[];
  security_headers: Record<string, any>;
  encryption_settings: Record<string, any>;
  audit_log_retention_days: number;
  privacy_policy_url: string;
  terms_of_service_url: string;
  data_retention_policy: Record<string, any>;
  gdpr_compliance_settings: Record<string, any>;
  security_notifications: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSecuritySettingsData {
  password_policy?: Record<string, any>;
  session_timeout?: number;
  max_login_attempts?: number;
  account_lockout_duration?: number;
  two_factor_auth_required?: boolean;
  password_expiry_days?: number;
  password_history_count?: number;
  login_history_retention_days?: number;
  ip_whitelist?: string[];
  ip_blacklist?: string[];
  allowed_countries?: string[];
  blocked_countries?: string[];
  security_headers?: Record<string, any>;
  encryption_settings?: Record<string, any>;
  audit_log_retention_days?: number;
  privacy_policy_url?: string;
  terms_of_service_url?: string;
  data_retention_policy?: Record<string, any>;
  gdpr_compliance_settings?: Record<string, any>;
  security_notifications?: Record<string, any>;
  is_active?: boolean;
}

export interface UpdateSecuritySettingsData extends Partial<CreateSecuritySettingsData> {}

// Query Keys
const QUERY_KEYS = {
  securitySettings: ['security_settings'] as const,
  securitySetting: (id: string) => ['security_settings', id] as const,
  activeSecuritySettings: ['security_settings', 'active'] as const,
};

// Helper function to parse security settings data
const parseSecuritySettingsData = (data: any): SecuritySettings => {
  return {
    id: data.id,
    password_policy: data.password_policy || {
      min_length: 8,
      require_uppercase: true,
      require_lowercase: true,
      require_numbers: true,
      require_special_chars: true,
      forbidden_patterns: []
    },
    session_timeout: data.session_timeout || 30,
    max_login_attempts: data.max_login_attempts || 5,
    account_lockout_duration: data.account_lockout_duration || 15,
    two_factor_auth_required: data.two_factor_auth_required ?? false,
    password_expiry_days: data.password_expiry_days || 90,
    password_history_count: data.password_history_count || 5,
    login_history_retention_days: data.login_history_retention_days || 90,
    ip_whitelist: data.ip_whitelist || [],
    ip_blacklist: data.ip_blacklist || [],
    allowed_countries: data.allowed_countries || [],
    blocked_countries: data.blocked_countries || [],
    security_headers: data.security_headers || {},
    encryption_settings: data.encryption_settings || {},
    audit_log_retention_days: data.audit_log_retention_days || 365,
    privacy_policy_url: data.privacy_policy_url || '',
    terms_of_service_url: data.terms_of_service_url || '',
    data_retention_policy: data.data_retention_policy || {},
    gdpr_compliance_settings: data.gdpr_compliance_settings || {},
    security_notifications: data.security_notifications || {},
    is_active: data.is_active ?? true,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

// Hooks

// List all security settings
export const useListSecuritySettings = () => {
  return useQuery({
    queryKey: QUERY_KEYS.securitySettings,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_settings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching security settings:', error);
        throw new Error(`Failed to fetch security settings: ${error.message}`);
      }

      return data?.map(parseSecuritySettingsData) || [];
    },
  });
};

// Get active security settings
export const useActiveSecuritySettings = () => {
  return useQuery({
    queryKey: QUERY_KEYS.activeSecuritySettings,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_settings')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No active security settings found
          return null;
        }
        console.error('Error fetching active security settings:', error);
        throw new Error(`Failed to fetch active security settings: ${error.message}`);
      }

      return data ? parseSecuritySettingsData(data) : null;
    },
  });
};

// Get security settings by ID
export const useGetSecuritySettings = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.securitySetting(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_settings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching security settings:', error);
        throw new Error(`Failed to fetch security settings: ${error.message}`);
      }

      return parseSecuritySettingsData(data);
    },
    enabled: !!id,
  });
};

// Create security settings
export const useCreateSecuritySettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newSecuritySettings: CreateSecuritySettingsData) => {
      const { data, error } = await supabase
        .from('security_settings')
        .insert([newSecuritySettings])
        .select()
        .single();

      if (error) {
        console.error('Error creating security settings:', error);
        throw new Error(`Failed to create security settings: ${error.message}`);
      }

      return parseSecuritySettingsData(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.securitySettings });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeSecuritySettings });
    },
  });
};

// Update security settings
export const useUpdateSecuritySettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateSecuritySettingsData }) => {
      const { data, error } = await supabase
        .from('security_settings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating security settings:', error);
        throw new Error(`Failed to update security settings: ${error.message}`);
      }

      return parseSecuritySettingsData(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.securitySettings });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.securitySetting(data.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeSecuritySettings });
    },
  });
};

// Delete security settings
export const useDeleteSecuritySettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('security_settings')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting security settings:', error);
        throw new Error(`Failed to delete security settings: ${error.message}`);
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.securitySettings });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeSecuritySettings });
    },
  });
};

// Activate security settings (sets all others to inactive)
export const useActivateSecuritySettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // First, deactivate all security settings
      const { error: deactivateError } = await supabase
        .from('security_settings')
        .update({ is_active: false })
        .neq('id', 'dummy');

      if (deactivateError) {
        console.error('Error deactivating security settings:', deactivateError);
        throw new Error(`Failed to deactivate security settings: ${deactivateError.message}`);
      }

      // Then activate the specified one
      const { data, error } = await supabase
        .from('security_settings')
        .update({ is_active: true })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error activating security settings:', error);
        throw new Error(`Failed to activate security settings: ${error.message}`);
      }

      return parseSecuritySettingsData(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.securitySettings });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeSecuritySettings });
    },
  });
};

// Update password policy
export const useUpdatePasswordPolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, passwordPolicy }: { id: string; passwordPolicy: Record<string, any> }) => {
      const { data, error } = await supabase
        .from('security_settings')
        .update({ password_policy: passwordPolicy })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating password policy:', error);
        throw new Error(`Failed to update password policy: ${error.message}`);
      }

      return parseSecuritySettingsData(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.securitySettings });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.securitySetting(data.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeSecuritySettings });
    },
  });
};

// Update IP whitelist/blacklist
export const useUpdateIPSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      ipWhitelist, 
      ipBlacklist 
    }: { 
      id: string; 
      ipWhitelist?: string[]; 
      ipBlacklist?: string[]; 
    }) => {
      const updates: any = {};
      if (ipWhitelist !== undefined) updates.ip_whitelist = ipWhitelist;
      if (ipBlacklist !== undefined) updates.ip_blacklist = ipBlacklist;

      const { data, error } = await supabase
        .from('security_settings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating IP settings:', error);
        throw new Error(`Failed to update IP settings: ${error.message}`);
      }

      return parseSecuritySettingsData(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.securitySettings });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.securitySetting(data.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeSecuritySettings });
    },
  });
};

// Update GDPR compliance settings
export const useUpdateGDPRSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, gdprSettings }: { id: string; gdprSettings: Record<string, any> }) => {
      const { data, error } = await supabase
        .from('security_settings')
        .update({ gdpr_compliance_settings: gdprSettings })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating GDPR settings:', error);
        throw new Error(`Failed to update GDPR settings: ${error.message}`);
      }

      return parseSecuritySettingsData(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.securitySettings });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.securitySetting(data.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeSecuritySettings });
    },
  });
};
