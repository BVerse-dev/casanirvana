'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAdminApi } from '@/hooks/useAdminApi';
import type { Database } from '@/lib/database.types';

type EmergencyAlertRow = Database['public']['Tables']['emergency_alerts']['Row'];
type Profile = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'id' | 'first_name' | 'last_name' | 'email' | 'phone' | 'avatar_url' | 'user_id'
>;
type Community = Pick<Database['public']['Tables']['communities']['Row'], 'id' | 'name'>;
type Unit = Pick<Database['public']['Tables']['units']['Row'], 'id' | 'block' | 'number' | 'unit_number'>;

export type EmergencyAlertStatus = 'pending' | 'active' | 'investigating' | 'escalated' | 'resolved';

export type EmergencyAlertRecord = EmergencyAlertRow & {
  communities: Community | null;
  units: Unit | null;
  user_profile: Profile | null;
  resolved_by_profile: Profile | null;
};

type EmergencyAlertListResponse = {
  data: EmergencyAlertRecord[];
};

type EmergencyAlertDetailResponse = {
  data: EmergencyAlertRecord;
};

type EmergencyAlertDeleteResponse = {
  success: boolean;
};

type EmergencyAlertListFilters = {
  communityId?: string;
  status?: string;
  search?: string;
  limit?: number;
};

export type CreateEmergencyAlertInput = {
  title: string;
  description?: string | null;
  alert_type: string;
  priority?: string | null;
  community_id?: string | null;
  unit_id?: string | null;
};

export type UpdateEmergencyAlertInput = {
  id: string;
  title?: string;
  description?: string | null;
  alert_type?: string;
  priority?: string | null;
  status?: EmergencyAlertStatus;
  community_id?: string | null;
  unit_id?: string | null;
};

const REFRESH_INTERVAL_MS = 30_000;

const normalizeFilters = (filters: EmergencyAlertListFilters = {}) => ({
  communityId: filters.communityId?.trim() || '',
  status: filters.status?.trim() || '',
  search: filters.search?.trim() || '',
  limit: filters.limit || 100,
});

const listQueryKey = (filters: EmergencyAlertListFilters = {}) =>
  ['admin-emergency-alerts', normalizeFilters(filters)] as const;

export const normalizeEmergencyAlertStatus = (value?: string | null): EmergencyAlertStatus => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase();

  switch (normalized) {
    case 'pending':
    case 'active':
    case 'investigating':
    case 'escalated':
    case 'resolved':
      return normalized;
    default:
      return 'active';
  }
};

export const formatEmergencyAlertStatusLabel = (value?: string | null) =>
  normalizeEmergencyAlertStatus(value)
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

export const useListEmergencyAlerts = (communityId?: string, status?: string) => {
  const { fetchAdmin, hasToken } = useAdminApi();
  const filters = normalizeFilters({ communityId, status });

  return useQuery({
    queryKey: listQueryKey(filters),
    enabled: hasToken,
    queryFn: async (): Promise<EmergencyAlertRecord[]> => {
      const params = new URLSearchParams();
      if (filters.communityId) params.set('community_id', filters.communityId);
      if (filters.status) params.set('status', filters.status);
      if (filters.search) params.set('search', filters.search);
      if (filters.limit) params.set('limit', String(filters.limit));

      const response = await fetchAdmin<EmergencyAlertListResponse>(`/admin/emergency-alerts?${params.toString()}`);
      return response.data || [];
    },
    staleTime: 30_000,
    refetchInterval: REFRESH_INTERVAL_MS,
    refetchOnWindowFocus: true,
    placeholderData: (previous) => previous,
  });
};

export const useGetEmergencyAlert = (id: string) => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: ['admin-emergency-alert', id || 'none'],
    enabled: hasToken && Boolean(id),
    queryFn: async (): Promise<EmergencyAlertRecord | null> => {
      const response = await fetchAdmin<EmergencyAlertDetailResponse>(`/admin/emergency-alerts/${id}`);
      return response.data;
    },
    staleTime: 30_000,
    refetchInterval: REFRESH_INTERVAL_MS,
    refetchOnWindowFocus: true,
  });
};

export const useCreateEmergencyAlert = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async (payload: CreateEmergencyAlertInput) =>
      fetchAdmin<EmergencyAlertDetailResponse>('/admin/emergency-alerts', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-emergency-alerts'] });
    },
  });
};

export const useUpdateEmergencyAlert = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateEmergencyAlertInput) =>
      fetchAdmin<EmergencyAlertDetailResponse>(`/admin/emergency-alerts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-emergency-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-emergency-alert', variables.id] });
    },
  });
};

export const useDeleteEmergencyAlert = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async (id: string) =>
      fetchAdmin<EmergencyAlertDeleteResponse>(`/admin/emergency-alerts/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-emergency-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-emergency-alert'] });
    },
  });
};
