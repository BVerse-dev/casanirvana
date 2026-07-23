'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdminApi } from '@/hooks/useAdminApi';

export type PersonalNotification = {
  id: string;
  title: string | null;
  body: string | null;
  notification_type: string | null;
  priority: string | null;
  is_read: boolean | null;
  read_at: string | null;
  action_url: string | null;
  reference_id: string | null;
  created_at: string | null;
};

type PersonalNotificationsResponse = {
  data: PersonalNotification[];
  unreadCount: number;
};

const QUERY_KEY = ['personal-admin-notifications'] as const;

export const usePersonalNotifications = () => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: QUERY_KEY,
    enabled: hasToken,
    queryFn: () => fetchAdmin<PersonalNotificationsResponse>('/admin/notifications/me?limit=10'),
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
};

export const useMarkNotificationAsRead = () => {
  const { fetchAdmin } = useAdminApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      fetchAdmin(`/admin/notifications/me/${encodeURIComponent(notificationId)}/read`, { method: 'PATCH' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const { fetchAdmin } = useAdminApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => fetchAdmin('/admin/notifications/me/read-all', { method: 'PATCH' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};
