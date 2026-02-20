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

// Mock data fallback (same as frontend)
const mockGroups: UserGroup[] = [
  {
    id: '1',
    name: 'Block A Residents',
    description: 'All residents living in Block A of the community',
    color: '#0d6efd',
    type: 'block',
    memberCount: 45,
    maxMembers: 50,
    isActive: true,
    autoAssign: true,
    assignmentRules: ['block_number:A'],
    createdDate: '2024-01-01',
    updatedDate: '2024-03-01',
    leaderId: '1',
    leaderName: 'John Smith',
    tags: ['residents', 'block-a']
  },
  {
    id: '2',
    name: 'Block B Residents',
    description: 'All residents living in Block B of the community',
    color: '#198754',
    type: 'block',
    memberCount: 38,
    maxMembers: 45,
    isActive: true,
    autoAssign: true,
    assignmentRules: ['block_number:B'],
    createdDate: '2024-01-01',
    updatedDate: '2024-02-28',
    leaderId: '2',
    leaderName: 'Sarah Johnson',
    tags: ['residents', 'block-b']
  },
  {
    id: '3',
    name: 'Security Team',
    description: 'Security guards and safety personnel',
    color: '#6f42c1',
    type: 'role',
    memberCount: 12,
    isActive: true,
    autoAssign: true,
    assignmentRules: ['role:guard', 'role:security'],
    createdDate: '2024-01-01',
    updatedDate: '2024-02-15',
    leaderId: '3',
    leaderName: 'Mike Davis',
    tags: ['security', 'staff']
  },
  {
    id: '4',
    name: 'Maintenance Team',
    description: 'Maintenance staff and facility management',
    color: '#fd7e14',
    type: 'role',
    memberCount: 8,
    isActive: true,
    autoAssign: true,
    assignmentRules: ['role:maintenance'],
    createdDate: '2024-01-01',
    updatedDate: '2024-03-05',
    leaderId: '4',
    leaderName: 'Tom Wilson',
    tags: ['maintenance', 'staff']
  },
  {
    id: '5',
    name: 'Sports Club',
    description: 'Residents interested in sports and fitness activities',
    color: '#20c997',
    type: 'interest',
    memberCount: 28,
    isActive: true,
    autoAssign: false,
    createdDate: '2024-01-15',
    updatedDate: '2024-03-10',
    leaderId: '5',
    leaderName: 'Alex Chen',
    tags: ['sports', 'fitness', 'recreation']
  },
  {
    id: '6',
    name: 'Garden Committee',
    description: 'Residents managing community gardens and landscaping',
    color: '#198754',
    type: 'committee',
    memberCount: 12,
    maxMembers: 15,
    isActive: true,
    autoAssign: false,
    createdDate: '2024-01-20',
    updatedDate: '2024-03-08',
    leaderId: '6',
    leaderName: 'Emma Brown',
    tags: ['gardening', 'environment', 'committee']
  },
  {
    id: '7',
    name: 'Book Club',
    description: 'Community book reading and discussion group',
    color: '#6610f2',
    type: 'interest',
    memberCount: 18,
    maxMembers: 25,
    isActive: true,
    autoAssign: false,
    createdDate: '2024-02-01',
    updatedDate: '2024-03-12',
    leaderId: '7',
    leaderName: 'Lisa Taylor',
    tags: ['books', 'education', 'social']
  },
  {
    id: '8',
    name: 'Emergency Response Team',
    description: 'Trained residents for emergency situations',
    color: '#dc3545',
    type: 'committee',
    memberCount: 15,
    maxMembers: 20,
    isActive: true,
    autoAssign: false,
    createdDate: '2024-01-10',
    updatedDate: '2024-02-25',
    leaderId: '8',
    leaderName: 'David Martinez',
    tags: ['emergency', 'safety', 'committee']
  }
];

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
              console.log('⚠️ Falling back to mock data');
              return mockGroups;
            }
            
            console.log('✅ Successfully fetched user groups directly:', directData?.length);
            return directData?.map(transformUserGroup) || [];
          }
          
          console.log('⚠️ Falling back to mock data');
          return mockGroups; 
        }

        console.log('✅ Successfully fetched user groups:', data?.length);
        return data?.map(transformUserGroup) || [];
      } catch (error) {
        console.error('❌ Error in useListUserGroups:', error);
        console.log('⚠️ Falling back to mock data');
        return mockGroups; // Fallback to mock data
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
          return mockGroups.find(g => g.id === id) || null;
        }

        return data ? transformUserGroup(data) : null;
      } catch (error) {
        console.error('Error in useGetUserGroup:', error);
        return mockGroups.find(g => g.id === id) || null;
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
          console.log('⚠️ Falling back to calculated mock stats');
          // Fallback to calculated mock stats
          return {
            total: mockGroups.length,
            active: mockGroups.filter(g => g.isActive).length,
            totalMembers: mockGroups.reduce((sum, group) => sum + group.memberCount, 0),
            avgMembersPerGroup: Math.round(mockGroups.reduce((sum, group) => sum + group.memberCount, 0) / mockGroups.length),
            byType: {
              block: mockGroups.filter(g => g.type === 'block').length,
              role: mockGroups.filter(g => g.type === 'role').length,
              interest: mockGroups.filter(g => g.type === 'interest').length,
              committee: mockGroups.filter(g => g.type === 'committee').length,
              custom: mockGroups.filter(g => g.type === 'custom').length,
            }
          };
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
        // Return mock stats on error
        return {
          total: mockGroups.length,
          active: mockGroups.filter(g => g.isActive).length,
          totalMembers: mockGroups.reduce((sum, group) => sum + group.memberCount, 0),
          avgMembersPerGroup: Math.round(mockGroups.reduce((sum, group) => sum + group.memberCount, 0) / mockGroups.length),
          byType: {
            block: mockGroups.filter(g => g.type === 'block').length,
            role: mockGroups.filter(g => g.type === 'role').length,
            interest: mockGroups.filter(g => g.type === 'interest').length,
            committee: mockGroups.filter(g => g.type === 'committee').length,
            custom: mockGroups.filter(g => g.type === 'custom').length,
          }
        };
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
