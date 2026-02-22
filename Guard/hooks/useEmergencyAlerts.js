import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { useGuardAuth } from '../contexts/GuardAuthContext';

const BASE_QUERY_KEY = 'guardEmergencyAlerts';
const NOT_FOUND_ERROR_CODE = 'PGRST116';

const normalizeStatusFilter = (status) => {
  if (!status || status === 'all') return null;
  return status;
};

const fetchEmergencyAlerts = async (communityId, statusFilter) => {
  let query = supabase
    .from('emergency_alerts')
    .select(
      `
      id,
      alert_type,
      title,
      description,
      status,
      priority,
      resolved_by,
      resolved_at,
      created_at,
      updated_at,
      community_id,
      user_id,
      unit_id,
      units:unit_id(id, block, number, unit_number),
      communities:community_id(id, name),
      reporter:user_id(id, first_name, last_name, full_name, phone)
    `,
    )
    .eq('community_id', communityId)
    .order('created_at', { ascending: false });

  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return data || [];
};

const resolveActorProfileId = async (authUserId) => {
  if (!authUserId) return null;

  const { data: byUserId, error: byUserIdError } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', authUserId)
    .maybeSingle();

  if (byUserIdError && byUserIdError.code !== NOT_FOUND_ERROR_CODE) {
    throw byUserIdError;
  }
  if (byUserId?.id) {
    return byUserId.id;
  }

  const { data: byId, error: byIdError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', authUserId)
    .maybeSingle();

  if (byIdError && byIdError.code !== NOT_FOUND_ERROR_CODE) {
    throw byIdError;
  }

  return byId?.id || null;
};

export const useGuardEmergencyAlerts = (status = 'all') => {
  const { guard, isAuthenticated } = useGuardAuth();
  const normalizedStatus = normalizeStatusFilter(status);

  return useQuery({
    queryKey: [BASE_QUERY_KEY, guard?.community_id, status || 'all'],
    queryFn: async () => {
      if (!guard?.community_id) return [];
      return fetchEmergencyAlerts(guard.community_id, normalizedStatus);
    },
    enabled: isAuthenticated && !!guard?.community_id,
    staleTime: 30 * 1000,
  });
};

export const useGuardEmergencyAlertsSubscription = () => {
  const { guard, isAuthenticated } = useGuardAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || !guard?.community_id) return undefined;

    const communityId = guard.community_id;
    const channel = supabase
      .channel(`guard-emergency-alerts-${communityId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emergency_alerts',
          filter: `community_id=eq.${communityId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: [BASE_QUERY_KEY, communityId] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [guard?.community_id, isAuthenticated, queryClient]);
};

export const useGuardEmergencyAlertActions = () => {
  const { guard, user, isAuthenticated } = useGuardAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ alertId, nextStatus }) => {
      if (!isAuthenticated || !guard?.community_id || !alertId) {
        throw new Error('Guard session is required');
      }

      const actorProfileId = await resolveActorProfileId(user?.id);
      const nowIso = new Date().toISOString();

      const payload = {
        status: nextStatus,
        updated_at: nowIso,
      };

      if (nextStatus === 'resolved') {
        payload.resolved_at = nowIso;
        if (actorProfileId) {
          payload.resolved_by = actorProfileId;
        }
      } else {
        payload.resolved_at = null;
        payload.resolved_by = null;
      }

      const { data, error } = await supabase
        .from('emergency_alerts')
        .update(payload)
        .eq('id', alertId)
        .eq('community_id', guard.community_id)
        .select('id, status, priority, resolved_by, resolved_at, created_at, updated_at')
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BASE_QUERY_KEY, guard?.community_id] });
    },
  });

  return {
    updateAlertStatus: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
};
