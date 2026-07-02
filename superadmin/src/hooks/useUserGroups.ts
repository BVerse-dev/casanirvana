import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAdminApi } from './useAdminApi';

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

export interface GroupMember {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  joinDate: string;
  isActive: boolean;
}

const userGroupsKeys = {
  all: ['userGroups'] as const,
  lists: () => [...userGroupsKeys.all, 'list'] as const,
  details: () => [...userGroupsKeys.all, 'detail'] as const,
  detail: (id: string) => [...userGroupsKeys.details(), id] as const,
  members: () => [...userGroupsKeys.all, 'members'] as const,
  memberList: (groupId: string) => [...userGroupsKeys.members(), groupId] as const,
  stats: () => [...userGroupsKeys.all, 'stats'] as const,
};

const transformUserGroup = (dbGroup: any): UserGroup => ({
  id: dbGroup.id,
  name: dbGroup.name,
  description: dbGroup.description || '',
  color: dbGroup.color || '#7367f0',
  type: dbGroup.type,
  memberCount: dbGroup.member_count || 0,
  maxMembers: dbGroup.max_members ?? undefined,
  isActive: dbGroup.is_active ?? true,
  autoAssign: dbGroup.auto_assign ?? false,
  assignmentRules: dbGroup.assignment_rules || [],
  createdDate: dbGroup.created_at ? new Date(dbGroup.created_at).toISOString().split('T')[0] : '',
  updatedDate: dbGroup.updated_at ? new Date(dbGroup.updated_at).toISOString().split('T')[0] : '',
  leaderId: dbGroup.leader_id || undefined,
  leaderName: dbGroup.leader_name || undefined,
  tags: dbGroup.tags || [],
});

const transformFormData = (formData: GroupFormData) => ({
  name: formData.name,
  description: formData.description,
  color: formData.color,
  type: formData.type,
  max_members: formData.maxMembers || null,
  auto_assign: formData.autoAssign,
  assignment_rules: formData.assignmentRules,
  tags: formData.tags,
});

export const useListUserGroups = () => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: userGroupsKeys.lists(),
    enabled: hasToken,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<UserGroup[]> => {
      const response = await fetchAdmin<{ data?: any[] }>('/admin/settings/user-groups');
      return (response.data || []).map(transformUserGroup);
    },
  });
};

export const useGetUserGroup = (id: string) => {
  const { data: groups, ...query } = useListUserGroups();

  return {
    ...query,
    data: groups?.find((group) => group.id === id) || null,
  };
};

export const useGroupMembers = (groupId?: string) => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: groupId ? userGroupsKeys.memberList(groupId) : [...userGroupsKeys.members(), 'none'],
    enabled: hasToken && Boolean(groupId),
    staleTime: 60 * 1000,
    queryFn: async (): Promise<GroupMember[]> => {
      if (!groupId) return [];
      const response = await fetchAdmin<{ data?: GroupMember[] }>(`/admin/settings/user-groups/${groupId}/members`);
      return response.data || [];
    },
  });
};

export const useUserGroupsStats = () => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: userGroupsKeys.stats(),
    enabled: hasToken,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<GroupStats> => {
      const response = await fetchAdmin<{ data: GroupStats }>('/admin/settings/user-groups/stats');
      return response.data;
    },
  });
};

export const useCreateUserGroup = () => {
  const { fetchAdmin } = useAdminApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: GroupFormData): Promise<UserGroup> => {
      const response = await fetchAdmin<{ data: any }>('/admin/settings/user-groups', {
        method: 'POST',
        body: JSON.stringify(transformFormData(formData)),
      });
      return transformUserGroup(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userGroupsKeys.all });
    },
  });
};

export const useUpdateUserGroup = () => {
  const { fetchAdmin } = useAdminApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: GroupFormData }): Promise<UserGroup> => {
      const response = await fetchAdmin<{ data: any }>(`/admin/settings/user-groups/${id}`, {
        method: 'PUT',
        body: JSON.stringify(transformFormData(formData)),
      });
      return transformUserGroup(response.data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userGroupsKeys.all });
      queryClient.setQueryData(userGroupsKeys.detail(data.id), data);
    },
  });
};

export const useDeleteUserGroup = () => {
  const { fetchAdmin } = useAdminApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await fetchAdmin(`/admin/settings/user-groups/${id}`, { method: 'DELETE' });
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: userGroupsKeys.all });
      queryClient.removeQueries({ queryKey: userGroupsKeys.detail(id) });
    },
  });
};

export const useToggleGroupStatus = () => {
  const { fetchAdmin } = useAdminApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }): Promise<UserGroup> => {
      const response = await fetchAdmin<{ data: any }>(`/admin/settings/user-groups/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: isActive }),
      });
      return transformUserGroup(response.data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userGroupsKeys.all });
      queryClient.setQueryData(userGroupsKeys.detail(data.id), data);
    },
  });
};
