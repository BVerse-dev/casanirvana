"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

export type UserRole = Database['public']['Tables']['user_roles']['Row'];
export type CreateUserRoleData = Database['public']['Tables']['user_roles']['Insert'];
export type UpdateUserRoleData = Database['public']['Tables']['user_roles']['Update'];

export interface UserRoleWithUserCount extends UserRole {
  userCount: number;
}

export interface CreateRoleFormData {
  name: string;
  description: string;
  color: string;
  permissions: string[];
  is_default: boolean;
}

export interface UpdateRoleFormData extends Partial<CreateRoleFormData> {
  id: string;
}

// Available permissions for role assignment
export const AVAILABLE_PERMISSIONS = [
  { value: 'all', label: 'All Permissions (Super Admin)', group: 'System' },
  { value: 'user_management', label: 'User Management', group: 'Administration' },
  { value: 'system_settings', label: 'System Settings', group: 'Administration' },
  { value: 'reports', label: 'Reports & Analytics', group: 'Administration' },
  { value: 'visitor_management', label: 'Visitor Management', group: 'Security' },
  { value: 'emergency_alerts', label: 'Emergency Alerts', group: 'Security' },
  { value: 'patrol_logs', label: 'Patrol Logs', group: 'Security' },
  { value: 'maintenance', label: 'Maintenance Management', group: 'Operations' },
  { value: 'work_orders', label: 'Work Orders', group: 'Operations' },
  { value: 'facility_access', label: 'Facility Access', group: 'Operations' },
  { value: 'amenity_management', label: 'Amenity Management', group: 'Community' },
  { value: 'amenity_booking', label: 'Amenity Booking', group: 'Community' },
  { value: 'notices', label: 'Notices & Announcements', group: 'Community' },
  { value: 'profile', label: 'Profile Management', group: 'Personal' },
  { value: 'visitor_request', label: 'Visitor Requests', group: 'Personal' },
  { value: 'maintenance_request', label: 'Maintenance Requests', group: 'Personal' },
  { value: 'complaints', label: 'Complaints & Feedback', group: 'Personal' }
];

// Role color options
export const ROLE_COLORS = [
  { value: '#dc3545', label: 'Red' },
  { value: '#fd7e14', label: 'Orange' },
  { value: '#ffc107', label: 'Yellow' },
  { value: '#198754', label: 'Green' },
  { value: '#20c997', label: 'Teal' },
  { value: '#0dcaf0', label: 'Cyan' },
  { value: '#0d6efd', label: 'Blue' },
  { value: '#6610f2', label: 'Indigo' },
  { value: '#6f42c1', label: 'Purple' },
  { value: '#d63384', label: 'Pink' }
];

const QUERY_KEYS = {
  userRoles: ['user-roles'] as const,
  userRole: (id: string) => ['user-roles', id] as const,
  roleStatistics: ['user-roles', 'statistics'] as const,
  availablePermissions: ['user-roles', 'permissions'] as const,
} as const;

/**
 * Hook to fetch all user roles with user counts
 */
export function useListUserRoles(filters?: {
  searchTerm?: string;
  status?: 'all' | 'active' | 'inactive';
}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.userRoles, filters],
    queryFn: async (): Promise<UserRoleWithUserCount[]> => {
      console.log('🔍 [useListUserRoles] Fetching user roles with filters:', filters);

      try {
        // Build the query
        let query = supabase
          .from('user_roles')
          .select('*')
          .order('created_at', { ascending: false });

        // Apply status filter
        if (filters?.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }

        // Apply search filter
        if (filters?.searchTerm && filters.searchTerm.trim()) {
          query = query.or(`name.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
        }

        const { data: roles, error } = await query;

        if (error) {
          console.error('❌ [useListUserRoles] Supabase error:', error);
          throw new Error(`Failed to fetch user roles: ${error.message}`);
        }

        console.log('✅ [useListUserRoles] Fetched roles:', roles?.length || 0);

        // Get user counts for each role
        const rolesWithCounts = await Promise.all(
          (roles || []).map(async (role) => {
            try {
              const { count, error: countError } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('role_id', role.id);

              if (countError) {
                console.warn(`⚠️ [useListUserRoles] Failed to get user count for role ${role.name}:`, countError);
                return { ...role, userCount: 0 };
              }

              return { ...role, userCount: count || 0 };
            } catch (err) {
              console.warn(`⚠️ [useListUserRoles] Error getting user count for role ${role.name}:`, err);
              return { ...role, userCount: 0 };
            }
          })
        );

        return rolesWithCounts;
      } catch (error) {
        console.error('❌ [useListUserRoles] Unexpected error:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch a single user role by ID
 */
export function useGetUserRole(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.userRole(id),
    queryFn: async (): Promise<UserRole> => {
      console.log('🔍 [useGetUserRole] Fetching role:', id);

      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ [useGetUserRole] Error:', error);
        throw new Error(`Failed to fetch user role: ${error.message}`);
      }

      if (!data) {
        throw new Error('User role not found');
      }

      console.log('✅ [useGetUserRole] Fetched role:', data.name);
      return data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook to create a new user role
 */
export function useCreateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRoleFormData): Promise<UserRole> => {
      console.log('➕ [useCreateUserRole] Creating role:', data.name);

      // Prepare the data for insertion
      const insertData: CreateUserRoleData = {
        name: data.name,
        description: data.description,
        color: data.color,
        permissions: JSON.stringify(data.permissions),
        is_default: data.is_default,
        is_system_role: false, // Only system can create system roles
        status: 'active',
      };

      // If this role is set as default, unset the current default
      if (data.is_default) {
        await supabase
          .from('user_roles')
          .update({ is_default: false })
          .eq('is_default', true);
      }

      const { data: newRole, error } = await supabase
        .from('user_roles')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ [useCreateUserRole] Error:', error);
        throw new Error(`Failed to create user role: ${error.message}`);
      }

      console.log('✅ [useCreateUserRole] Created role:', newRole.name);
      return newRole;
    },
    onSuccess: () => {
      // Invalidate and refetch roles list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userRoles });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.roleStatistics });
    },
  });
}

/**
 * Hook to update an existing user role
 */
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateRoleFormData): Promise<UserRole> => {
      console.log('📝 [useUpdateUserRole] Updating role:', data.id);

      const { id, ...updateData } = data;

      // Prepare the data for update
      const updatePayload: UpdateUserRoleData = {
        ...(updateData.name && { name: updateData.name }),
        ...(updateData.description && { description: updateData.description }),
        ...(updateData.color && { color: updateData.color }),
        ...(updateData.permissions && { permissions: JSON.stringify(updateData.permissions) }),
        ...(updateData.is_default !== undefined && { is_default: updateData.is_default }),
      };

      // If this role is set as default, unset the current default
      if (updateData.is_default) {
        await supabase
          .from('user_roles')
          .update({ is_default: false })
          .eq('is_default', true)
          .neq('id', id);
      }

      const { data: updatedRole, error } = await supabase
        .from('user_roles')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ [useUpdateUserRole] Error:', error);
        throw new Error(`Failed to update user role: ${error.message}`);
      }

      console.log('✅ [useUpdateUserRole] Updated role:', updatedRole.name);
      return updatedRole;
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch roles list and specific role
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userRoles });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userRole(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.roleStatistics });
    },
  });
}

/**
 * Hook to delete a user role
 */
export function useDeleteUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      console.log('🗑️ [useDeleteUserRole] Deleting role:', id);

      // First, check if this role is assigned to any users
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role_id', id);

      if (countError) {
        console.error('❌ [useDeleteUserRole] Error checking user count:', countError);
        throw new Error(`Failed to check user count: ${countError.message}`);
      }

      if (count && count > 0) {
        throw new Error(`Cannot delete role: ${count} users are assigned to this role`);
      }

      // Check if this is a system role
      const { data: role, error: roleError } = await supabase
        .from('user_roles')
        .select('is_system_role, name')
        .eq('id', id)
        .single();

      if (roleError) {
        console.error('❌ [useDeleteUserRole] Error fetching role:', roleError);
        throw new Error(`Failed to fetch role: ${roleError.message}`);
      }

      if (role?.is_system_role) {
        throw new Error('Cannot delete system role');
      }

      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ [useDeleteUserRole] Error:', error);
        throw new Error(`Failed to delete user role: ${error.message}`);
      }

      console.log('✅ [useDeleteUserRole] Deleted role:', role?.name);
    },
    onSuccess: () => {
      // Invalidate and refetch roles list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userRoles });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.roleStatistics });
    },
  });
}

/**
 * Hook to get role statistics
 */
export function useRoleStatistics() {
  return useQuery({
    queryKey: QUERY_KEYS.roleStatistics,
    queryFn: async () => {
      console.log('📊 [useRoleStatistics] Fetching role statistics');

      try {
        // Get total roles count
        const { count: totalRoles, error: totalError } = await supabase
          .from('user_roles')
          .select('*', { count: 'exact', head: true });

        if (totalError) throw totalError;

        // Get active roles count
        const { count: activeRoles, error: activeError } = await supabase
          .from('user_roles')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        if (activeError) throw activeError;

        // Get system roles count
        const { count: systemRoles, error: systemError } = await supabase
          .from('user_roles')
          .select('*', { count: 'exact', head: true })
          .eq('is_system_role', true);

        if (systemError) throw systemError;

        // Get total users with roles
        const { count: totalUsers, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .not('role_id', 'is', null);

        if (usersError) throw usersError;

        const stats = {
          total: totalRoles || 0,
          active: activeRoles || 0,
          system: systemRoles || 0,
          totalUsers: totalUsers || 0,
        };

        console.log('✅ [useRoleStatistics] Statistics:', stats);
        return stats;
      } catch (error) {
        console.error('❌ [useRoleStatistics] Error:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook to get available permissions
 */
export function useAvailablePermissions() {
  return useQuery({
    queryKey: QUERY_KEYS.availablePermissions,
    queryFn: async () => {
      // Return static permissions list - could be fetched from database in the future
      return AVAILABLE_PERMISSIONS;
    },
    staleTime: Infinity, // Permissions don't change often
  });
}

/**
 * Utility function to check if a user has a specific permission
 */
export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  // Super admin has all permissions
  if (userPermissions.includes('all')) {
    return true;
  }
  
  return userPermissions.includes(requiredPermission);
}

/**
 * Utility function to get permission groups
 */
export function getPermissionGroups() {
  const groups: Record<string, typeof AVAILABLE_PERMISSIONS> = {};
  
  AVAILABLE_PERMISSIONS.forEach(permission => {
    if (!groups[permission.group]) {
      groups[permission.group] = [];
    }
    groups[permission.group].push(permission);
  });
  
  return groups;
}
