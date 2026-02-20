"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  role: 'resident' | 'guard' | 'admin' | 'maintenance' | 'management' | 'user' | 'superadmin' | 'agency_manager' | 'facility_manager';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  unit_id?: string | null;
  society_id?: string | null;
  block_number?: string | null;
  emergency_contact?: string | null;
  two_factor_enabled: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  last_login?: string | null;
  preferences: {
    notifications: boolean;
    darkMode: boolean;
    language: string;
  };
  bio?: string | null;
  full_name?: string | null;
  is_active?: boolean | null;
  user_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CreateUserProfileData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  unit_id?: string;
  block_number?: string;
  emergency_contact?: string;
  two_factor_enabled?: boolean;
  send_welcome_email?: boolean;
  password?: string;
}

export interface UpdateUserProfileData extends Partial<CreateUserProfileData> {
  id: string;
}

export interface UserProfileFilters {
  role?: string;
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

// List all user profiles with filtering
export const useListUserProfiles = (filters: UserProfileFilters = {}) => {
  return useQuery({
    queryKey: ['userProfiles', filters],
    queryFn: async (): Promise<{ data: UserProfile[]; count: number; page: number; pageSize: number; totalPages: number }> => {
      console.log('🔍 useListUserProfiles starting query with filters:', filters);
      
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.role && filters.role !== 'all') {
        console.log('📝 Applying role filter:', filters.role);
        query = query.eq('role', filters.role);
      }

      if (filters.status && filters.status !== 'all') {
        console.log('📝 Applying status filter:', filters.status);
        query = query.eq('status', filters.status);
      }

      if (filters.search && filters.search.trim()) {
        console.log('📝 Applying search filter:', filters.search);
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%`);
      }

      // Pagination
      const page = filters.page || 1;
      const pageSize = filters.pageSize || 50; // Increased to 50 to show all 19 users
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      query = query.range(from, to).order('created_at', { ascending: false });

      console.log('🚀 Executing Supabase query...');
      const { data, error, count } = await query;

      console.log('📊 Query results:', {
        dataLength: data?.length,
        count,
        error: error?.message,
        firstUser: data?.[0]?.email
      });

      if (error) {
        console.error('❌ Error fetching user profiles:', error);
        throw new Error(`Failed to fetch user profiles: ${error.message}`);
      }

      // Transform data to match UserProfile interface
      const transformedData: UserProfile[] = data?.map((profile: any) => ({
        id: profile.id,
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email,
        phone: profile.phone,
        avatar_url: profile.avatar_url,
        role: (profile.role as UserProfile['role']) || 'user',
        status: profile.status || 'active',
        unit_id: profile.unit_id,
        society_id: profile.society_id,
        block_number: profile.block_number || null,
        emergency_contact: profile.emergency_contact || null,
        two_factor_enabled: profile.two_factor_enabled || false,
        email_verified: profile.email_verified || false,
        phone_verified: profile.phone_verified || false,
        last_login: profile.last_login,
        preferences: typeof profile.preferences === 'string' 
          ? JSON.parse(profile.preferences) 
          : profile.preferences || { notifications: true, darkMode: false, language: 'en' },
        bio: profile.bio,
        full_name: profile.full_name,
        is_active: profile.is_active,
        user_id: profile.user_id,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      })) || [];

      const totalPages = Math.ceil((count || 0) / pageSize);

      console.log('✅ Transformed data:', {
        transformedLength: transformedData.length,
        totalPages,
        sampleUser: transformedData[0]?.email
      });

      return {
        data: transformedData,
        count: count || 0,
        page,
        pageSize,
        totalPages
      };
    },
    staleTime: 1 * 60 * 1000, // Reduced to 1 minute for debugging
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
};

// Get single user profile by ID
export const useGetUserProfile = (id: string) => {
  return useQuery({
    queryKey: ['userProfile', id],
    queryFn: async (): Promise<UserProfile | null> => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        throw new Error(`Failed to fetch user profile: ${error.message}`);
      }

      if (!data) return null;

      // Transform to UserProfile interface
      return {
        id: data.id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        avatar_url: data.avatar_url,
        role: (data.role as UserProfile['role']) || 'resident',
        status: (data as any).status || (data.is_active ? 'active' : 'inactive'),
        unit_id: data.unit_id,
        society_id: data.society_id,
        block_number: (data as any).block_number || null,
        emergency_contact: (data as any).emergency_contact || null,
        two_factor_enabled: (data as any).two_factor_enabled || false,
        email_verified: (data as any).email_verified || false,
        phone_verified: (data as any).phone_verified || false,
        last_login: (data as any).last_login,
        preferences: typeof (data as any).preferences === 'string' 
          ? JSON.parse((data as any).preferences) 
          : (data as any).preferences || { notifications: true, darkMode: false, language: 'en' },
        bio: data.bio,
        full_name: data.full_name,
        is_active: data.is_active,
        user_id: data.user_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    },
    enabled: !!id,
  });
};

// Create new user profile
export const useCreateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: CreateUserProfileData): Promise<UserProfile> => {
      // Generate ID if not provided
      const profileId = crypto.randomUUID();

      // Prepare profile data
      const profileData = {
        id: profileId,
        first_name: userData.first_name,
        last_name: userData.last_name,
        full_name: `${userData.first_name} ${userData.last_name}`,
        email: userData.email,
        phone: userData.phone || null,
        role: userData.role,
        status: userData.status || 'active',
        unit_id: userData.unit_id || null,
        block_number: userData.block_number || null,
        emergency_contact: userData.emergency_contact || null,
        two_factor_enabled: userData.two_factor_enabled || false,
        email_verified: false, // New users need to verify email
        phone_verified: false, // New users need to verify phone
        preferences: {
          notifications: true,
          darkMode: false,
          language: 'en'
        },
        is_active: userData.status === 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        throw new Error(`Failed to create user profile: ${error.message}`);
      }

      // TODO: Handle password creation and welcome email if specified
      if (userData.password) {
        // Create auth user with password
        console.log('Password creation would be handled here');
      }

      if (userData.send_welcome_email) {
        // Send welcome email
        console.log('Welcome email would be sent here');
      }

      return {
        ...data,
        role: (data.role as UserProfile['role']) || 'resident',
        preferences: typeof data.preferences === 'string' 
          ? JSON.parse(data.preferences) 
          : data.preferences || { notifications: true, darkMode: false, language: 'en' }
      } as UserProfile;
    },
    onSuccess: () => {
      // Invalidate and refetch user profiles
      queryClient.invalidateQueries({ queryKey: ['userProfiles'] });
    },
  });
};

// Update user profile
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: UpdateUserProfileData): Promise<UserProfile> => {
      const { id, ...updateFields } = userData;
      
      const updateData = {
        ...updateFields,
        full_name: updateFields.first_name && updateFields.last_name 
          ? `${updateFields.first_name} ${updateFields.last_name}` 
          : undefined,
        is_active: updateFields.status === 'active',
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        throw new Error(`Failed to update user profile: ${error.message}`);
      }

      return {
        ...data,
        role: (data.role as UserProfile['role']) || 'resident',
        preferences: typeof data.preferences === 'string' 
          ? JSON.parse(data.preferences) 
          : data.preferences || { notifications: true, darkMode: false, language: 'en' }
      } as UserProfile;
    },
    onSuccess: (data) => {
      // Invalidate and refetch user profiles
      queryClient.invalidateQueries({ queryKey: ['userProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile', data.id] });
    },
  });
};

// Delete user profile
export const useDeleteUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting user profile:', error);
        throw new Error(`Failed to delete user profile: ${error.message}`);
      }
    },
    onSuccess: () => {
      // Invalidate and refetch user profiles
      queryClient.invalidateQueries({ queryKey: ['userProfiles'] });
    },
  });
};

// Bulk operations for user profiles
export const useBulkUpdateUserProfiles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, updateData }: { ids: string[]; updateData: Partial<UpdateUserProfileData> }): Promise<void> => {
      const updates = {
        ...updateData,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .in('id', ids);

      if (error) {
        console.error('Error bulk updating user profiles:', error);
        throw new Error(`Failed to bulk update user profiles: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfiles'] });
    },
  });
};

// Get user profile statistics
export const useUserProfileStats = () => {
  return useQuery({
    queryKey: ['userProfileStats'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('role, status, two_factor_enabled, email_verified, phone_verified');

      if (error) {
        console.error('Error fetching user profile stats:', error);
        throw new Error(`Failed to fetch user profile stats: ${error.message}`);
      }

      const stats = {
        total: profiles?.length || 0,
        byRole: {} as Record<string, number>,
        byStatus: {} as Record<string, number>,
        twoFactorEnabled: profiles?.filter(p => p.two_factor_enabled).length || 0,
        emailVerified: profiles?.filter(p => p.email_verified).length || 0,
        phoneVerified: profiles?.filter(p => p.phone_verified).length || 0,
      };

      profiles?.forEach(profile => {
        stats.byRole[profile.role] = (stats.byRole[profile.role] || 0) + 1;
        if (profile.status) {
          stats.byStatus[profile.status] = (stats.byStatus[profile.status] || 0) + 1;
        }
      });

      return stats;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export default {
  useListUserProfiles,
  useGetUserProfile,
  useCreateUserProfile,
  useUpdateUserProfile,
  useDeleteUserProfile,
  useBulkUpdateUserProfiles,
  useUserProfileStats,
};
