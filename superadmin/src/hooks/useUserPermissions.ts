"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useMemo } from 'react';

// Types for User Permissions
export interface Permission {
  id: string;
  name: string;
  key: string;
  description: string;
  category: string;
  module: string;
  type: 'read' | 'write' | 'delete' | 'execute' | 'admin';
  is_system_permission: boolean;
  isSystemPermission?: boolean;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  role_count?: number; // calculated field from join
  roleCount?: number;
}

export interface PermissionInsert {
  name: string;
  key: string;
  description: string;
  category: string;
  module: string;
  type: 'read' | 'write' | 'delete' | 'execute' | 'admin';
  is_system_permission?: boolean;
  status?: 'active' | 'inactive';
  created_by?: string;
}

export interface PermissionUpdate {
  id: string;
  name?: string;
  key?: string;
  description?: string;
  category?: string;
  module?: string;
  type?: 'read' | 'write' | 'delete' | 'execute' | 'admin';
  status?: 'active' | 'inactive';
  updated_by?: string;
}

export interface ListPermissionsParams {
  search?: string;
  category?: string;
  module?: string;
  type?: string;
  status?: 'all' | 'active' | 'inactive';
  sortBy?: 'name' | 'category' | 'module' | 'type' | 'created_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface PermissionStats {
  total: number;
  active: number;
  inactive: number;
  system: number;
  byType: { [key: string]: number };
  byCategory: { [key: string]: number };
  byModule: { [key: string]: number };
}

const normalizePermission = (permission: any): Permission => {
  const roleCount = Number(permission?.roleCount ?? permission?.role_count ?? 0);
  const isSystemPermission = Boolean(
    permission?.isSystemPermission ?? permission?.is_system_permission ?? false
  );

  return {
    ...permission,
    role_count: roleCount,
    roleCount,
    is_system_permission: isSystemPermission,
    isSystemPermission,
  } as Permission;
};

// List permissions with filtering, search, and pagination
export const useListPermissions = (params: ListPermissionsParams = {}) => {
  const filters = useMemo(() => ({
    search: params.search || '',
    category: params.category || 'all',
    module: params.module || 'all',
    type: params.type || 'all',
    status: params.status || 'all',
    sortBy: params.sortBy || 'created_at',
    sortOrder: params.sortOrder || 'desc',
    page: params.page || 1,
    pageSize: params.pageSize || 10
  }), [params.search, params.category, params.module, params.type, params.status, params.sortBy, params.sortOrder, params.page, params.pageSize]);

  return useQuery({
    queryKey: ['permissions', filters],
    queryFn: async () => {
      try {
        // Use the view that includes role count
        let query = supabase
          .from('permissions_with_role_count')
          .select('*', { count: 'exact' });

        // Apply search filter
        if (filters.search) {
          query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,key.ilike.%${filters.search}%`);
        }

        // Apply category filter
        if (filters.category !== 'all') {
          query = query.eq('category', filters.category);
        }

        // Apply module filter
        if (filters.module !== 'all') {
          query = query.eq('module', filters.module);
        }

        // Apply type filter
        if (filters.type !== 'all') {
          query = query.eq('type', filters.type);
        }

        // Apply status filter
        if (filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }

        // Apply sorting
        query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });

        // Apply pagination
        const from = (filters.page - 1) * filters.pageSize;
        const to = from + filters.pageSize - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;
        
        if (error) {
          console.error('Error fetching permissions:', error);
          throw error;
        }

        console.log(`Successfully fetched ${data?.length || 0} permissions`);

        return {
          data: (data || []).map(normalizePermission),
          count: count || 0,
          page: filters.page,
          pageSize: filters.pageSize,
          totalPages: Math.ceil((count || 0) / filters.pageSize)
        };
      } catch (error) {
        console.error('Permission fetch error:', error);
        throw error;
      }
    },
  });
};

// Get single permission by ID
export const useGetPermission = (id: string) => {
  return useQuery({
    queryKey: ['permission', id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('permissions_with_role_count')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          console.error('Error fetching permission:', error);
          throw error;
        }

        return normalizePermission(data);
      } catch (error) {
        console.error('Get permission error:', error);
        throw error;
      }
    },
    enabled: !!id,
  });
};

// Create new permission
export const useCreatePermission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (permissionData: PermissionInsert) => {
      try {
        console.log('Creating permission:', permissionData);

        const { data, error } = await supabase
          .from('permissions')
          .insert({
            ...permissionData,
            status: permissionData.status || 'active',
            is_system_permission: permissionData.is_system_permission || false
          })
          .select()
          .single();
        
        if (error) {
          console.error('Error creating permission:', error);
          throw error;
        }

        console.log('Permission created successfully:', data);
        return normalizePermission(data);
      } catch (error) {
        console.error('Create permission error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      queryClient.invalidateQueries({ queryKey: ['permission-stats'] });
      console.log('Permission cache invalidated after creation');
    },
    onError: (error) => {
      console.error('Create permission mutation error:', error);
    }
  });
};

// Update permission
export const useUpdatePermission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: PermissionUpdate) => {
      try {
        console.log('Updating permission:', id, updates);

        const { data, error } = await supabase
          .from('permissions')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        
        if (error) {
          console.error('Error updating permission:', error);
          throw error;
        }

        console.log('Permission updated successfully:', data);
        return normalizePermission(data);
      } catch (error) {
        console.error('Update permission error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      queryClient.invalidateQueries({ queryKey: ['permission', data.id] });
      queryClient.invalidateQueries({ queryKey: ['permission-stats'] });
      console.log('Permission cache invalidated after update');
    },
    onError: (error) => {
      console.error('Update permission mutation error:', error);
    }
  });
};

// Delete permission
export const useDeletePermission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        console.log('Deleting permission:', id);

        // First check if it's a system permission
        const { data: permission, error: fetchError } = await supabase
          .from('permissions')
          .select('is_system_permission')
          .eq('id', id)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        if (permission?.is_system_permission) {
          throw new Error('Cannot delete system permissions');
        }

        const { error } = await supabase
          .from('permissions')
          .delete()
          .eq('id', id);
        
        if (error) {
          console.error('Error deleting permission:', error);
          throw error;
        }

        console.log('Permission deleted successfully');
        return { id };
      } catch (error) {
        console.error('Delete permission error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      queryClient.invalidateQueries({ queryKey: ['permission-stats'] });
      console.log('Permission cache invalidated after deletion');
    },
    onError: (error) => {
      console.error('Delete permission mutation error:', error);
    }
  });
};

// Toggle permission status
export const useTogglePermissionStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'inactive' }) => {
      try {
        console.log('Toggling permission status:', id, status);

        const { data, error } = await supabase
          .from('permissions')
          .update({ status })
          .eq('id', id)
          .select()
          .single();
        
        if (error) {
          console.error('Error toggling permission status:', error);
          throw error;
        }

        console.log('Permission status toggled successfully:', data);
        return normalizePermission(data);
      } catch (error) {
        console.error('Toggle permission status error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      queryClient.invalidateQueries({ queryKey: ['permission', data.id] });
      queryClient.invalidateQueries({ queryKey: ['permission-stats'] });
    },
    onError: (error) => {
      console.error('Toggle permission status mutation error:', error);
    }
  });
};

// Get permission statistics for dashboard
export const usePermissionStats = () => {
  return useQuery({
    queryKey: ['permission-stats'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('permissions')
          .select('status, is_system_permission, type, category, module');
        
        if (error) {
          console.error('Error fetching permission stats:', error);
          throw error;
        }

        const stats: PermissionStats = {
          total: data.length,
          active: data.filter(p => p.status === 'active').length,
          inactive: data.filter(p => p.status === 'inactive').length,
          system: data.filter(p => p.is_system_permission === true).length,
          byType: {},
          byCategory: {},
          byModule: {}
        };

        // Count by type
        const types = ['read', 'write', 'delete', 'execute', 'admin'];
        types.forEach(type => {
          stats.byType[type] = data.filter(p => p.type === type).length;
        });

        // Count by category
        const categories = [...new Set(data.map(p => p.category))];
        categories.forEach(category => {
          stats.byCategory[category] = data.filter(p => p.category === category).length;
        });

        // Count by module
        const modules = [...new Set(data.map(p => p.module))];
        modules.forEach(module => {
          stats.byModule[module] = data.filter(p => p.module === module).length;
        });

        console.log('Permission stats calculated:', stats);
        return stats;
      } catch (error) {
        console.error('Permission stats error:', error);
        throw error;
      }
    }
  });
};

// Get permissions grouped by category
export const usePermissionsByCategory = () => {
  return useQuery({
    queryKey: ['permissions-by-category'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('permissions_with_role_count')
          .select('*')
          .eq('status', 'active')
          .order('category')
          .order('name');
        
        if (error) {
          console.error('Error fetching permissions by category:', error);
          throw error;
        }

        // Group by category
        const grouped = data.reduce((acc, permission) => {
          const category = permission.category;
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(normalizePermission(permission));
          return acc;
        }, {} as { [key: string]: Permission[] });

        console.log('Permissions grouped by category:', Object.keys(grouped));
        return grouped;
      } catch (error) {
        console.error('Permissions by category error:', error);
        throw error;
      }
    },
  });
};

// Bulk update permissions status
export const useBulkUpdatePermissions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ ids, updates }: { ids: string[]; updates: Partial<PermissionUpdate> }) => {
      try {
        console.log('Bulk updating permissions:', ids, updates);

        const { data, error } = await supabase
          .from('permissions')
          .update(updates)
          .in('id', ids)
          .select();
        
        if (error) {
          console.error('Error bulk updating permissions:', error);
          throw error;
        }

        console.log('Permissions bulk updated successfully:', data?.length);
        return data;
      } catch (error) {
        console.error('Bulk update permissions error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      queryClient.invalidateQueries({ queryKey: ['permission-stats'] });
      console.log('Permission cache invalidated after bulk update');
    },
    onError: (error) => {
      console.error('Bulk update permissions mutation error:', error);
    }
  });
};
