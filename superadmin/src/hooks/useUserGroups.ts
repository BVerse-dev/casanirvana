import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Types matching the frontend interface
export interface UserGroup {
  id: string;
  name: string;
  description: string;
  color: string;
  type: 'block' | 'role' | 'interest' | 'committee' | 'custom';
  memberCount: number;
  maxMembers?: number;
  isActive: boolean;
  autoAssign: boolean;
  assignmentRules?: string[];
  createdDate: string;
  updatedDate: string;
  leaderId?: string;
  leaderName?: string;
  tags: string[];
}

export interface GroupFormData {
  name: string;
  description: string;
  color: string;
  type: string;
  maxMembers?: number;
  autoAssign: boolean;
  assignmentRules: string[];
  tags: string[];
}

export interface GroupStats {
  total: number;
  active: number;
  totalMembers: number;
  avgMembersPerGroup: number;
  byType: { [key: string]: number };
}

// Transform database row to frontend interface
const transformUserGroup = (dbGroup: any): UserGroup => ({
  id: dbGroup.id,
  name: dbGroup.name,
  description: dbGroup.description,
  color: dbGroup.color,
  type: dbGroup.type,
  memberCount: dbGroup.member_count || 0,
  maxMembers: dbGroup.max_members,
  isActive: dbGroup.is_active,
  autoAssign: dbGroup.auto_assign,
  assignmentRules: dbGroup.assignment_rules || [],
  createdDate: dbGroup.created_at ? new Date(dbGroup.created_at).toISOString().split('T')[0] : '',
  updatedDate: dbGroup.updated_at ? new Date(dbGroup.updated_at).toISOString().split('T')[0] : '',
  leaderId: dbGroup.leader_id,
  leaderName: dbGroup.leader_name,
  tags: dbGroup.tags || []
});

// Transform frontend form to database format
const transformFormData = (formData: GroupFormData) => ({
  name: formData.name,
  description: formData.description,
  color: formData.color,
  type: formData.type,
  max_members: formData.maxMembers || null,
  auto_assign: formData.autoAssign,
  assignment_rules: formData.assignmentRules,
  tags: formData.tags
});

// Query key factory
const userGroupsKeys = {
  all: ['userGroups'] as const,
  lists: () => [...userGroupsKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...userGroupsKeys.lists(), { filters }] as const,
  details: () => [...userGroupsKeys.all, 'detail'] as const,
  detail: (id: string) => [...userGroupsKeys.details(), id] as const,
  stats: () => [...userGroupsKeys.all, 'stats'] as const,
};

// List all user groups
export const useListUserGroups = () => {
  return useQuery({
    queryKey: userGroupsKeys.lists(),
    queryFn: async (): Promise<UserGroup[]> => {
      try {
        console.log('🔄 Fetching user groups from Supabase...');
        const { data, error } = await supabase
          .from('groups_with_leaders')
          .select('*')
          .order('name');

        if (error) {
          console.error('❌ Error fetching user groups:', error);
          
          // Check if the groups_with_leaders view exists
          const { data: viewCheck, error: viewError } = await supabase
            .from('information_schema.views')
            .select('table_name')
            .eq('table_name', 'groups_with_leaders')
            .eq('table_schema', 'public')
            .single();
            
          if (viewError || !viewCheck) {
            console.error('⚠️ The groups_with_leaders view does not exist:', viewError);
            console.log('⚠️ Falling back to direct query on user_groups table');
            
            // Try querying the base table directly
            const { data: directData, error: directError } = await supabase
              .from('user_groups')
              .select('*')
              .order('name');
              
            if (directError) {
              console.error('❌ Error querying user_groups directly:', directError);
              throw new Error(`Failed to fetch user groups: ${directError.message}`);
            }
            
            console.log('✅ Successfully fetched user groups directly:', directData?.length);
            return directData?.map(transformUserGroup) || [];
          }
          
          throw new Error(`Failed to fetch user groups: ${error.message}`);
        }

        console.log('✅ Successfully fetched user groups:', data?.length);
        return data?.map(transformUserGroup) || [];
      } catch (error) {
        console.error('❌ Error in useListUserGroups:', error);
        throw error instanceof Error ? error : new Error('Failed to fetch user groups');
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single user group
export const useGetUserGroup = (id: string) => {
  return useQuery({
    queryKey: userGroupsKeys.detail(id),
    queryFn: async (): Promise<UserGroup | null> => {
      try {
        const { data, error } = await supabase
          .from('groups_with_leaders')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching user group:', error);
          const { data: directData, error: directError } = await supabase
            .from('user_groups')
            .select('*')
            .eq('id', id)
            .single();

          if (directError) {
            throw new Error(`Failed to fetch user group: ${directError.message}`);
          }

          return directData ? transformUserGroup(directData) : null;
        }

        return data ? transformUserGroup(data) : null;
      } catch (error) {
        console.error('Error in useGetUserGroup:', error);
        throw error instanceof Error ? error : new Error('Failed to fetch user group');
      }
    },
    enabled: !!id,
  });
};

// Get user groups statistics
export const useUserGroupsStats = () => {
  return useQuery({
    queryKey: userGroupsKeys.stats(),
    queryFn: async (): Promise<GroupStats> => {
      try {
        console.log('🔄 Fetching user groups stats...');
        
        // First try the dedicated statistics view
        const { data: statsData, error: statsError } = await supabase
          .from('group_statistics')
          .select('*')
          .single();
          
        if (!statsError && statsData) {
          console.log('✅ Successfully fetched group stats from view:', statsData);
          return {
            total: statsData.total_groups || 0,
            active: statsData.active_groups || 0,
            totalMembers: statsData.total_members || 0,
            avgMembersPerGroup: statsData.avg_members_per_group || 0,
            byType: statsData.groups_by_type || {}
          };
        }
        
        console.log('⚠️ Stats view failed, using manual calculation:', statsError?.message);
        
        // Fall back to manual calculation
        const { data: groups, error } = await supabase
          .from('user_groups')
          .select('type, member_count, is_active');

        if (error) {
          console.error('❌ Error fetching group stats:', error);
          throw new Error(`Failed to fetch group statistics: ${error.message}`);
        }

        const total = groups?.length || 0;
        const active = groups?.filter(g => g.is_active).length || 0;
        const totalMembers = groups?.reduce((sum, group) => sum + (group.member_count || 0), 0) || 0;
        const avgMembersPerGroup = total > 0 ? Math.round(totalMembers / total) : 0;

        const byType = groups?.reduce((acc, group) => {
          acc[group.type] = (acc[group.type] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number }) || {};

        return {
          total,
          active,
          totalMembers,
          avgMembersPerGroup,
          byType
        };
      } catch (error) {
        console.error('Error in useUserGroupsStats:', error);
        throw error instanceof Error ? error : new Error('Failed to fetch group statistics');
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create user group
export const useCreateUserGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: GroupFormData): Promise<UserGroup> => {
      const dbData = transformFormData(formData);
      
      const { data, error } = await supabase
        .from('user_groups')
        .insert([dbData])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return transformUserGroup(data);
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: userGroupsKeys.all });
    },
  });
};

// Update user group
export const useUpdateUserGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: GroupFormData }): Promise<UserGroup> => {
      const dbData = transformFormData(formData);
      
      const { data, error } = await supabase
        .from('user_groups')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return transformUserGroup(data);
    },
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: userGroupsKeys.all });
      queryClient.setQueryData(userGroupsKeys.detail(data.id), data);
    },
  });
};

// Delete user group
export const useDeleteUserGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('user_groups')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: (_, id) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: userGroupsKeys.all });
      queryClient.removeQueries({ queryKey: userGroupsKeys.detail(id) });
    },
  });
};

// Toggle group active status
export const useToggleGroupStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }): Promise<UserGroup> => {
      const { data, error } = await supabase
        .from('user_groups')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return transformUserGroup(data);
    },
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: userGroupsKeys.all });
      queryClient.setQueryData(userGroupsKeys.detail(data.id), data);
    },
  });
};
