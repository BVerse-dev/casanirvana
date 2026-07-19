import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';
import { getProfileByAuthId } from '../utils/profileResolver';

export interface Call {
  id: string;
  caller_id: string;
  callee_id: string;
  call_type: 'voice' | 'video';
  status: 'initiated' | 'ringing' | 'answered' | 'ended' | 'rejected' | 'missed';
  started_at: string;
  answered_at: string | null;
  ended_at: string | null;
  duration_seconds: number;
  agora_channel_name: string | null;
  agora_token: string | null;
  created_at: string;
  updated_at: string;
}

const CALL_SELECT = `
  *,
  caller:caller_id(id, full_name, first_name, last_name, avatar_url),
  callee:callee_id(id, full_name, first_name, last_name, avatar_url)
`;

const ACTIVE_INCOMING_CALL_STATUSES = ['initiated', 'ringing'] as const;
const ACTIVE_INCOMING_CALL_STATUS_SET = new Set<Call['status']>(ACTIVE_INCOMING_CALL_STATUSES);

const resolveCurrentProfileId = async (
  currentProfileId?: string | null,
  authUserId?: string | null
) => {
  if (currentProfileId) {
    return currentProfileId;
  }

  if (!authUserId) {
    return null;
  }

  const resolvedProfile = await getProfileByAuthId(authUserId, 'id');
  return resolvedProfile?.id || null;
};

const invalidateCallCaches = (
  queryClient: ReturnType<typeof useQueryClient>,
  currentProfileId?: string | null,
  otherUserId?: string | null
) => {
  queryClient.invalidateQueries({ queryKey: ['userCalls'] });
  queryClient.invalidateQueries({ queryKey: ['messages'] });
  queryClient.invalidateQueries({ queryKey: ['conversation'] });
  queryClient.invalidateQueries({ queryKey: ['conversations'] });
  queryClient.invalidateQueries({ queryKey: ['chatEnhancements'] });

  if (currentProfileId) {
    queryClient.invalidateQueries({ queryKey: ['userCalls', currentProfileId] });
  }

  if (currentProfileId && otherUserId) {
    queryClient.invalidateQueries({ queryKey: ['callHistory', currentProfileId, otherUserId] });
  } else {
    queryClient.invalidateQueries({ queryKey: ['callHistory'] });
  }
};

const fetchLatestIncomingCall = async (currentProfileId: string) => {
  const { data, error } = await supabase
    .from('calls')
    .select(CALL_SELECT)
    .eq('callee_id', currentProfileId)
    .in('status', [...ACTIVE_INCOMING_CALL_STATUSES])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data || null;
};

export const useCallHistory = (otherUserId: string) => {
  const { profile, user } = useAuth();

  return useQuery({
    queryKey: ['callHistory', profile?.id || user?.id, otherUserId],
    queryFn: async () => {
      const currentProfileId = await resolveCurrentProfileId(profile?.id, user?.id);
      if (!currentProfileId || !otherUserId) {
        return [];
      }

      const { data, error } = await supabase
        .from('calls')
        .select(CALL_SELECT)
        .or(
          `and(caller_id.eq.${currentProfileId},callee_id.eq.${otherUserId}),and(caller_id.eq.${otherUserId},callee_id.eq.${currentProfileId})`
        )
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    },
    enabled: !!otherUserId && !!(profile?.id || user?.id),
    staleTime: 30 * 1000,
  });
};

export const useUserCalls = () => {
  const { profile, user } = useAuth();

  return useQuery({
    queryKey: ['userCalls', profile?.id || user?.id],
    queryFn: async () => {
      const currentProfileId = await resolveCurrentProfileId(profile?.id, user?.id);
      if (!currentProfileId) {
        return [];
      }

      const { data, error } = await supabase
        .from('calls')
        .select(CALL_SELECT)
        .or(`caller_id.eq.${currentProfileId},callee_id.eq.${currentProfileId}`)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    },
    enabled: !!(profile?.id || user?.id),
    staleTime: 30 * 1000,
  });
};

export const useCreateCall = () => {
  const queryClient = useQueryClient();
  const { profile, user } = useAuth();

  return useMutation({
    mutationFn: async ({
      calleeId,
      callType = 'voice',
    }: {
      calleeId: string;
      callType?: 'voice' | 'video';
    }) => {
      const currentProfileId = await resolveCurrentProfileId(profile?.id, user?.id);
      if (!currentProfileId) {
        throw new Error('User not authenticated');
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
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      invalidateCallCaches(queryClient, data?.caller_id || profile?.id || null, data?.callee_id || null);
    },
  });
};

export const useUpdateCall = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      callId,
      status,
      answeredAt,
      endedAt,
      durationSeconds,
    }: {
      callId: string;
      status?: Call['status'];
      answeredAt?: string;
      endedAt?: string;
      durationSeconds?: number;
    }) => {
      const updateData: Record<string, unknown> = {
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
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      const otherUserId =
        data?.caller_id && data?.callee_id
          ? data.caller_id === data.callee_id
            ? null
            : data.callee_id
          : null;
      invalidateCallCaches(queryClient, data?.caller_id || null, otherUserId);
    },
  });
};

export const useCallsSubscription = () => {
  const { profile, user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    let isMounted = true;
    let callerChannel: ReturnType<typeof supabase.channel> | null = null;
    let calleeChannel: ReturnType<typeof supabase.channel> | null = null;

    const bootstrap = async () => {
      const currentProfileId = await resolveCurrentProfileId(profile?.id, user?.id);
      if (!isMounted || !currentProfileId) {
        return;
      }

      const handlePayload = (payload: any) => {
        const row = (payload?.new || payload?.old) as Call | undefined;
        const otherUserId = row
          ? row.caller_id === currentProfileId
            ? row.callee_id
            : row.caller_id
          : null;

        invalidateCallCaches(queryClient, currentProfileId, otherUserId);
      };

      callerChannel = supabase
        .channel(`user-calls-caller-${currentProfileId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'calls',
            filter: `caller_id=eq.${currentProfileId}`,
          },
          handlePayload
        )
        .subscribe();

      calleeChannel = supabase
        .channel(`user-calls-callee-${currentProfileId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'calls',
            filter: `callee_id=eq.${currentProfileId}`,
          },
          handlePayload
        )
        .subscribe();
    };

    bootstrap();

    return () => {
      isMounted = false;
      if (callerChannel) {
        supabase.removeChannel(callerChannel);
      }
      if (calleeChannel) {
        supabase.removeChannel(calleeChannel);
      }
    };
  }, [profile?.id, queryClient, user?.id]);
};

export const useIncomingCallSignal = () => {
  const { profile, user } = useAuth();
  const queryClient = useQueryClient();
  const [incomingCall, setIncomingCall] = useState(null);
  const activeIncomingCallIdRef = useRef(null);

  useEffect(() => {
    activeIncomingCallIdRef.current = incomingCall?.id || null;
  }, [incomingCall?.id]);

  useEffect(() => {
    let isMounted = true;
    let incomingChannel: ReturnType<typeof supabase.channel> | null = null;

    const bootstrap = async () => {
      const currentProfileId = await resolveCurrentProfileId(profile?.id, user?.id);
      if (!isMounted || !currentProfileId) {
        return;
      }

      const syncLatestIncomingCall = async () => {
        const latestIncomingCall = await fetchLatestIncomingCall(currentProfileId);

        if (!isMounted) {
          return;
        }

        setIncomingCall(latestIncomingCall);
      };

      await syncLatestIncomingCall();

      incomingChannel = supabase
        .channel(`user-incoming-calls-${currentProfileId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'calls',
            filter: `callee_id=eq.${currentProfileId}`,
          },
          async (payload) => {
            const row = (payload?.new || payload?.old) as Call | undefined;
            invalidateCallCaches(queryClient, currentProfileId, row?.caller_id || null);

            if (payload.eventType === 'DELETE') {
              if (payload.old?.id === activeIncomingCallIdRef.current) {
                setIncomingCall(null);
              }
              return;
            }

            if (!row) {
              return;
            }

            if (ACTIVE_INCOMING_CALL_STATUS_SET.has(row.status)) {
              setIncomingCall(row);
              return;
            }

            if (row.id === activeIncomingCallIdRef.current) {
              await syncLatestIncomingCall();
            }
          }
        )
        .subscribe();
    };

    bootstrap();

    return () => {
      isMounted = false;
      if (incomingChannel) {
        supabase.removeChannel(incomingChannel);
      }
    };
  }, [profile?.id, queryClient, user?.id]);

  return incomingCall;
};

export const formatCallDuration = (durationSeconds: number): string => {
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

  return `${hours}:${remainingMinutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const getCallDisplayInfo = (call: Call, currentUserId: string) => {
  const isOutgoing = call.caller_id === currentUserId;
  const isMissed = call.status === 'missed' || (call.status === 'ended' && !call.answered_at);
  const isAnswered = call.answered_at !== null;

  return {
    isOutgoing,
    isMissed,
    isAnswered,
    duration: formatCallDuration(call.duration_seconds || 0),
  };
};
