import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { useGuardAuth } from '../contexts/GuardAuthContext';
import { getProfileByAuthId } from '../utils/profileResolver';

const resolveCallProfileId = async (authUserId) => {
  const profile = await getProfileByAuthId(authUserId, 'id');
  return profile?.id || null;
};

const buildCallSelect = () => `
  *,
  caller:caller_id(id, full_name, first_name, last_name, avatar_url),
  callee:callee_id(id, full_name, first_name, last_name, avatar_url)
`;

const invalidateCallCaches = (queryClient, currentProfileId, otherProfileId = null) => {
  queryClient.invalidateQueries({ queryKey: ['userCalls', currentProfileId] });
  queryClient.invalidateQueries({ queryKey: ['callHistory', currentProfileId] });
  queryClient.invalidateQueries({ queryKey: ['messages', currentProfileId] });
  queryClient.invalidateQueries({ queryKey: ['conversations', currentProfileId] });

  if (otherProfileId) {
    queryClient.invalidateQueries({ queryKey: ['callHistory', currentProfileId, otherProfileId] });
    queryClient.invalidateQueries({ queryKey: ['callHistory', otherProfileId, currentProfileId] });
    queryClient.invalidateQueries({ queryKey: ['messages', currentProfileId, otherProfileId] });
    queryClient.invalidateQueries({ queryKey: ['messages', otherProfileId, currentProfileId] });
    queryClient.invalidateQueries({ queryKey: ['conversations', otherProfileId] });
  }
};

const useCurrentCallProfileId = () => {
  const { authUser } = useGuardAuth();
  const [profileId, setProfileId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const hydrateProfileId = async () => {
      if (!authUser?.id) {
        setProfileId(null);
        return;
      }

      try {
        const resolvedProfileId = await resolveCallProfileId(authUser.id);
        if (!cancelled) {
          setProfileId(resolvedProfileId);
        }
      } catch (error) {
        console.error('Failed to resolve current guard call profile:', error);
        if (!cancelled) {
          setProfileId(null);
        }
      }
    };

    hydrateProfileId();

    return () => {
      cancelled = true;
    };
  }, [authUser?.id]);

  return profileId;
};

export const useCallHistory = (otherUserId) => {
  const currentProfileId = useCurrentCallProfileId();

  return useQuery({
    queryKey: ['callHistory', currentProfileId, otherUserId],
    queryFn: async () => {
      if (!currentProfileId || !otherUserId) {
        return [];
      }

      const { data, error } = await supabase
        .from('calls')
        .select(buildCallSelect())
        .or(
          `and(caller_id.eq.${currentProfileId},callee_id.eq.${otherUserId}),and(caller_id.eq.${otherUserId},callee_id.eq.${currentProfileId})`
        )
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching call history:', error);
        throw error;
      }

      return data || [];
    },
    enabled: Boolean(currentProfileId && otherUserId),
    staleTime: 30 * 1000,
  });
};

export const useUserCalls = () => {
  const currentProfileId = useCurrentCallProfileId();

  return useQuery({
    queryKey: ['userCalls', currentProfileId],
    queryFn: async () => {
      if (!currentProfileId) {
        return [];
      }

      const { data, error } = await supabase
        .from('calls')
        .select(buildCallSelect())
        .or(`caller_id.eq.${currentProfileId},callee_id.eq.${currentProfileId}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user calls:', error);
        throw error;
      }

      return data || [];
    },
    enabled: Boolean(currentProfileId),
    staleTime: 30 * 1000,
  });
};

export const useCreateCall = () => {
  const queryClient = useQueryClient();
  const currentProfileId = useCurrentCallProfileId();

  return useMutation({
    mutationFn: async ({ calleeId, callType = 'voice' }) => {
      if (!currentProfileId) {
        throw new Error('Guard profile is unavailable for call creation.');
      }
      if (!calleeId) {
        throw new Error('Call recipient is required.');
      }

      const channelName = `call_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

      const { data, error } = await supabase
        .from('calls')
        .insert({
          caller_id: currentProfileId,
          callee_id: calleeId,
          call_type: callType,
          status: 'initiated',
          agora_channel_name: channelName,
        })
        .select(buildCallSelect())
        .single();

      if (error) {
        console.error('Error creating call:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      invalidateCallCaches(queryClient, currentProfileId, data?.callee_id || null);
    },
  });
};

export const useUpdateCall = () => {
  const queryClient = useQueryClient();
  const currentProfileId = useCurrentCallProfileId();

  return useMutation({
    mutationFn: async ({ callId, status, answeredAt, endedAt, durationSeconds }) => {
      if (!callId) {
        throw new Error('Call ID is required.');
      }

      const updateData = {
        updated_at: new Date().toISOString(),
      };

      if (status) updateData.status = status;
      if (answeredAt) updateData.answered_at = answeredAt;
      if (endedAt) updateData.ended_at = endedAt;
      if (durationSeconds !== undefined) updateData.duration_seconds = durationSeconds;

      const { data, error } = await supabase
        .from('calls')
        .update(updateData)
        .eq('id', callId)
        .select(buildCallSelect())
        .single();

      if (error) {
        console.error('Error updating call:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      if (!currentProfileId) {
        return;
      }

      const otherProfileId =
        data?.caller_id === currentProfileId ? data?.callee_id : data?.caller_id;
      invalidateCallCaches(queryClient, currentProfileId, otherProfileId || null);
    },
  });
};

export const useCallsSubscription = () => {
  const currentProfileId = useCurrentCallProfileId();
  const queryClient = useQueryClient();

  const handleCallPayload = useCallback(
    (payload) => {
      const row = payload?.new || payload?.old;
      if (!currentProfileId || !row) {
        return;
      }

      const otherProfileId =
        row.caller_id === currentProfileId ? row.callee_id : row.caller_id;
      invalidateCallCaches(queryClient, currentProfileId, otherProfileId || null);
    },
    [currentProfileId, queryClient]
  );

  useEffect(() => {
    if (!currentProfileId) return undefined;

    const callsChannel = supabase
      .channel(`calls-${currentProfileId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calls',
          filter: `caller_id=eq.${currentProfileId}`,
        },
        handleCallPayload
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calls',
          filter: `callee_id=eq.${currentProfileId}`,
        },
        handleCallPayload
      )
      .subscribe();

    return () => {
      supabase.removeChannel(callsChannel);
    };
  }, [currentProfileId, handleCallPayload]);
};

export const formatCallDuration = (durationSeconds = 0) => {
  if (durationSeconds < 60) {
    return `${durationSeconds}s`;
  }

  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;

  if (minutes < 60) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours}:${remainingMinutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
};

export const getCallDisplayInfo = (call, currentUserId) => {
  const isOutgoing = call.caller_id === currentUserId;
  const isMissed = call.status === 'missed' || (call.status === 'ended' && !call.answered_at);
  const isAnswered = Boolean(call.answered_at);

  let displayText = '';
  let iconName = '';
  let color = '#666';

  iconName = call.call_type === 'video' ? 'videocam' : 'call';

  if (isOutgoing) {
    if (isMissed) {
      displayText = 'Outgoing call (missed)';
      color = '#ff6b6b';
    } else if (isAnswered) {
      displayText = `Outgoing call (${formatCallDuration(call.duration_seconds || 0)})`;
      color = '#4CAF50';
    } else {
      displayText = 'Outgoing call';
    }
  } else if (isMissed) {
    displayText = 'Missed call';
    color = '#ff6b6b';
  } else if (isAnswered) {
    displayText = `Incoming call (${formatCallDuration(call.duration_seconds || 0)})`;
    color = '#4CAF50';
  } else {
    displayText = 'Incoming call';
  }

  return {
    displayText,
    iconName,
    color,
    isOutgoing,
    isMissed,
    isAnswered,
    duration: call.duration_seconds || 0,
    timestamp: call.created_at,
  };
};
