import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface UserConfigSettings {
  // Registration & Access Settings (4 fields)
  default_user_role?: string;
  require_email_verification?: boolean;
  require_phone_verification?: boolean;
  enable_user_registration?: boolean;

  // Security & Authentication Settings (4 fields)
  max_login_attempts?: number;
  account_lockout_duration_minutes?: number;
  session_timeout_minutes?: number;
  enable_2fa?: boolean;

  // Password Requirements (4 fields)
  password_min_length?: number;
  password_require_special_chars?: boolean;
  password_require_numbers?: boolean;
  password_require_uppercase?: boolean;

  // Profile & Data Management (2 fields)
  profile_pic_max_size_mb?: number;
  user_data_retention_days?: number;
}

// Parse value based on field type
const parseValue = (key: string, value: string): any => {
  // Boolean fields
  if (key.includes('require_') || key.includes('enable_') || key.includes('password_require_')) {
    return value === 'true';
  }
  
  // Number fields
  if (key.includes('_attempts') || key.includes('_minutes') || key.includes('_length') || 
      key.includes('_size_mb') || key.includes('_days')) {
    return parseInt(value) || 0;
  }
  
  // String fields (remove quotes if present)
  if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1);
  }
  
  return value;
};

const useUserConfigSettings = () => {
  const queryClient = useQueryClient();

  // Fetch user configuration settings
  const {
    data: userConfigSettings,
    isLoading: isLoadingData,
    error: loadError,
  } = useQuery({
    queryKey: ['userConfigSettings'],
    queryFn: async (): Promise<UserConfigSettings> => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value')
        .eq('category', 'user_settings');

      if (error) {
        console.error('Error fetching user configuration settings:', error);
        throw new Error(`Failed to fetch user configuration settings: ${error.message}`);
      }

      // Transform the data into the expected format
      const settings: UserConfigSettings = {};
      
      data?.forEach((setting: { key: string; value: string }) => {
        const { key, value } = setting;
        (settings as any)[key] = parseValue(key, value);
      });

      return settings;
    },
  });

  // Update user configuration settings
  const updateMutation = useMutation({
    mutationFn: async (settings: UserConfigSettings): Promise<UserConfigSettings> => {
      // Convert settings object to array of updates
      const updates = Object.entries(settings).map(([key, value]) => {
        let stringValue: string;
        
        // Convert value to string based on type
        if (typeof value === 'boolean') {
          stringValue = value.toString();
        } else if (typeof value === 'number') {
          stringValue = value.toString();
        } else if (typeof value === 'string') {
          // Don't add extra quotes for string values
          stringValue = value;
        } else {
          stringValue = String(value);
        }

        return {
          key,
          value: stringValue,
          category: 'user_settings',
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
        console.error('Error updating user configuration settings:', error);
        throw new Error(`Failed to update user configuration settings: ${error.message}`);
      }

      // Transform the response back to the expected format
      const newSettings: UserConfigSettings = {};
      data?.forEach((setting: { key: string; value: string }) => {
        const { key, value } = setting;
        (newSettings as any)[key] = parseValue(key, value);
      });

      return newSettings;
    },
    onSuccess: () => {
      // Invalidate and refetch the settings
      queryClient.invalidateQueries({ queryKey: ['userConfigSettings'] });
    },
  });

  const updateSettings = (settings: UserConfigSettings) => {
    updateMutation.mutate(settings);
  };

  return {
    userConfigSettings,
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
    // Registration & Access
    default_user_role: 'Default role assigned to new users (user/guard/admin/superadmin)',
    require_email_verification: 'Require email verification during user registration',
    require_phone_verification: 'Require phone number verification during user registration',
    enable_user_registration: 'Allow new users to register accounts',

    // Security & Authentication
    max_login_attempts: 'Maximum login attempts before account lockout',
    account_lockout_duration_minutes: 'Account lockout duration in minutes after max failed attempts',
    session_timeout_minutes: 'User session timeout in minutes',
    enable_2fa: 'Enable two-factor authentication for users',

    // Password Requirements
    password_min_length: 'Minimum password length requirement',
    password_require_special_chars: 'Require special characters in passwords',
    password_require_numbers: 'Require numbers in passwords',
    password_require_uppercase: 'Require uppercase letters in passwords',

    // Profile & Data Management
    profile_pic_max_size_mb: 'Maximum profile picture size in megabytes',
    user_data_retention_days: 'User data retention period in days (7 years default)',
  };

  return descriptions[key] || `Configuration setting for ${key}`;
};

export default useUserConfigSettings;
