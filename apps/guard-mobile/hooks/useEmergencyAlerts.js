import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { useGuardAuth } from '../contexts/GuardAuthContext';

const BASE_QUERY_KEY = 'guardEmergencyAlerts';
const NOT_FOUND_ERROR_CODE = 'PGRST116';
const ADMIN_ROLE_SET = new Set([
  'admin',
  'superadmin',
  'agency_manager',
  'facility_manager',
  'manager',
  'management',
]);

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

const isActiveProfile = (profile) => {
  if (!profile) return false;
  if (profile.is_active === false) return false;
  return String(profile.status || 'active').toLowerCase() !== 'inactive';
};

const mapAlertPriorityToNotificationPriority = (priority) => {
  const normalized = String(priority || '').toLowerCase();
  if (normalized === 'critical') return 'urgent';
  if (normalized === 'high') return 'high';
  if (normalized === 'low') return 'low';
  return 'medium';
};

const resolveCommunityAdminRecipients = async ({ communityId, actorUserId }) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, user_id, role, full_name, first_name, last_name, is_active, status')
    .eq('community_id', communityId);

  if (error) {
    throw error;
  }

  const candidateProfiles = (data || [])
    .filter((row) => isActiveProfile(row))
    .filter((row) => ADMIN_ROLE_SET.has(String(row.role || '').toLowerCase()))
    .filter((row) => row.user_id && row.user_id !== actorUserId);

  if (candidateProfiles.length === 0) {
    return [];
  }

  // Guard notification policy is enforced via `guard_can_notify_user`.
  // Pre-filter with the same function so non-eligible legacy rows never hit insert.
  const eligibilityChecks = await Promise.all(
    candidateProfiles.map(async (row) => {
      const { data: canNotify, error: eligibilityError } = await supabase.rpc('guard_can_notify_user', {
        target_user_id: row.user_id,
      });

      if (eligibilityError) {
        throw eligibilityError;
      }

      return {
        row,
        canNotify: Boolean(canNotify),
      };
    }),
  );

  const eligibleProfiles = eligibilityChecks
    .filter((item) => item.canNotify)
    .map((item) => item.row);

  if (eligibleProfiles.length === 0) {
    return [];
  }

  const dedupedRecipients = new Map();

  eligibleProfiles
    .forEach((row) => {
      const recipientUserId = row.user_id;
      if (!dedupedRecipients.has(recipientUserId)) {
        const displayName =
          row.full_name ||
          `${row.first_name || ''} ${row.last_name || ''}`.trim() ||
          'Admin';

        dedupedRecipients.set(recipientUserId, {
          userId: recipientUserId,
          profileId: row.id || null,
          role: row.role || null,
          displayName,
        });
      }
    });

  return Array.from(dedupedRecipients.values());
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

  const notifyMutation = useMutation({
    mutationFn: async ({
      alertId,
      incidentId,
      alertType,
      alertTitle,
      alertDescription,
      alertPriority,
      alertLocation,
      reporterName,
    }) => {
      if (!isAuthenticated || !guard?.community_id || !alertId) {
        throw new Error('Guard session is required');
      }

      const recipients = await resolveCommunityAdminRecipients({
        communityId: guard.community_id,
        actorUserId: user?.id || null,
      });

      if (recipients.length === 0) {
        throw new Error('No active admin recipients are configured for this community.');
      }

      const nowIso = new Date().toISOString();
      const safePriority = mapAlertPriorityToNotificationPriority(alertPriority || 'high');
      const compactDescription = String(alertDescription || '')
        .replace(/\s+/g, ' ')
        .trim();

      const notificationTitle = `Emergency Escalation: ${alertTitle || 'Emergency Alert'}`;
      const notificationBody = [
        reporterName ? `Reported by ${reporterName}.` : null,
        alertLocation ? `Location: ${alertLocation}.` : null,
        alertType ? `Type: ${String(alertType).replace(/_/g, ' ')}.` : null,
        compactDescription ? `Details: ${compactDescription}` : null,
        `Incident: ${incidentId || alertId}.`,
      ]
        .filter(Boolean)
        .join(' ');

      const notificationRows = recipients.map((recipient) => ({
        recipient,
        row: {
          user_id: recipient.userId,
          title: notificationTitle,
          body: notificationBody,
          notification_type: 'emergency_alert',
          reference_id: alertId,
          priority: safePriority,
          created_at: nowIso,
          is_read: false,
          read: false,
        },
      }));

      // Insert one-by-one so one stale/invalid admin mapping does not fail the entire escalation.
      const deliveredRecipients = [];
      for (const item of notificationRows) {
        const { error: notifyError } = await supabase
          .from('notifications')
          .insert([item.row]);

        if (notifyError) {
          console.warn('Guard emergency admin notify skipped recipient:', {
            recipientUserId: item.recipient.userId,
            reason: notifyError.message,
            code: notifyError.code,
          });
          continue;
        }

        deliveredRecipients.push(item.recipient);
      }

      if (deliveredRecipients.length === 0) {
        throw new Error('No eligible admin recipients are configured for this community.');
      }

      // Keep recipient audit trail aligned with emergency alert dispatch behavior.
      const recipientRows = deliveredRecipients.map((recipient) => ({
        alert_id: alertId,
        recipient_user_id: recipient.userId,
        recipient_role: recipient.role,
        delivered_at: nowIso,
      }));

      // Recipient audit trail is best-effort and must never block emergency escalation delivery.
      await supabase
        .from('emergency_alert_recipients')
        .upsert(recipientRows, {
          onConflict: 'alert_id,recipient_user_id',
          ignoreDuplicates: true,
        });

      return {
        notifiedCount: deliveredRecipients.length,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BASE_QUERY_KEY, guard?.community_id] });
    },
  });

  return {
    updateAlertStatus: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    notifyAdmins: notifyMutation.mutateAsync,
    isNotifyingAdmins: notifyMutation.isPending,
  };
};
