import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';

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

// Hook to get call history between two users
export const useCallHistory = (otherUserId: string) => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['callHistory', profile?.id, otherUserId],
    queryFn: async () => {
      if (!profile?.id || !otherUserId) {
        return [];
      }

      console.log('🔍 Fetching call history between:', profile.id, 'and', otherUserId);

      const { data, error } = await supabase
        .from('calls')
        .select(`
          *,
          caller:caller_id(id, first_name, last_name),
          callee:callee_id(id, first_name, last_name)
        `)
        .or(`and(caller_id.eq.${profile.id},callee_id.eq.${otherUserId}),and(caller_id.eq.${otherUserId},callee_id.eq.${profile.id})`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching call history:', error);
        throw error;
      }

      console.log('✅ Call history fetched:', data?.length || 0, 'calls');
      return data || [];
    },
    enabled: !!profile?.id && !!otherUserId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Hook to get all calls for current user
export const useUserCalls = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['userCalls', profile?.id],
    queryFn: async () => {
      if (!profile?.id) {
        return [];
      }

      console.log('🔍 Fetching all calls for user:', profile.id);

      const { data, error } = await supabase
        .from('calls')
        .select(`
          *,
          caller:caller_id(id, first_name, last_name),
          callee:callee_id(id, first_name, last_name)
        `)
        .or(`caller_id.eq.${profile.id},callee_id.eq.${profile.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching user calls:', error);
        throw error;
      }

      console.log('✅ User calls fetched:', data?.length || 0, 'calls');
      return data || [];
    },
    enabled: !!profile?.id,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Hook to create a new call
export const useCreateCall = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      calleeId,
      callType = 'voice'
    }: {
      calleeId: string;
      callType?: 'voice' | 'video';
    }) => {
      if (!profile?.id) {
        throw new Error('User not authenticated');
      }

      console.log('📞 Creating call from', profile.id, 'to', calleeId, 'type:', callType);

      // Generate unique channel name
      const channelName = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const { data, error } = await supabase
        .from('calls')
        .insert({
          caller_id: profile.id,
          callee_id: calleeId,
          call_type: callType,
          status: 'initiated',
          agora_channel_name: channelName,
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating call:', error);
        throw error;
      }

      console.log('✅ Call created:', data);
      return data;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['userCalls'] });
      queryClient.invalidateQueries({ queryKey: ['callHistory'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['chatEnhancements'] });
    },
  });
};

// Hook to update call status
export const useUpdateCall = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      callId,
      status,
      answeredAt,
      endedAt,
      durationSeconds
    }: {
      callId: string;
      status?: Call['status'];
      answeredAt?: string;
      endedAt?: string;
      durationSeconds?: number;
    }) => {
      console.log('📞 Updating call:', callId, 'status:', status);

      const updateData: any = {
        updated_at: new Date().toISOString()
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
        console.error('❌ Error updating call:', error);
        throw error;
      }

      console.log('✅ Call updated:', data);
      return data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['userCalls'] });
      queryClient.invalidateQueries({ queryKey: ['callHistory'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['chatEnhancements'] });
    },
  });
};

// Real-time subscription for calls
export const useCallsSubscription = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!profile?.id) return;

    console.log('🔔 Setting up calls subscription for user:', profile.id);

    const callsChannel = supabase
      .channel(`calls-${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calls',
          filter: `or(caller_id.eq.${profile.id},callee_id.eq.${profile.id})`,
        },
        (payload) => {
          console.log('🔔 Real-time call update:', payload);
          queryClient.invalidateQueries({ queryKey: ['userCalls'] });
          queryClient.invalidateQueries({ queryKey: ['callHistory'] });
          queryClient.invalidateQueries({ queryKey: ['messages'] });
          queryClient.invalidateQueries({ queryKey: ['chatEnhancements'] });
        }
      )
      .subscribe();

    return () => {
      console.log('🔔 Cleaning up calls subscription');
      supabase.removeChannel(callsChannel);
    };
  }, [profile?.id, queryClient]);
};

// Helper function to format call duration
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

// Helper function to get call display info
export const getCallDisplayInfo = (call: Call, currentUserId: string) => {
  const isOutgoing = call.caller_id === currentUserId;
  const isMissed = call.status === 'missed' || (call.status === 'ended' && !call.answered_at);
  const isAnswered = call.answered_at !== null;
  
  let displayText = '';
  let iconName = '';
  let color = '#666';

  if (call.call_type === 'video') {
    iconName = 'videocam';
  } else {
    iconName = 'call';
  }

  if (isOutgoing) {
    if (isMissed) {
      displayText = 'Outgoing call (missed)';
      color = '#ff6b6b';
    } else if (isAnswered) {
      displayText = `Outgoing call (${formatCallDuration(call.duration_seconds)})`;
      color = '#4CAF50';
    } else {
      displayText = 'Outgoing call';
      color = '#666';
    }
  } else {
    if (isMissed) {
      displayText = 'Missed call';
      color = '#ff6b6b';
    } else if (isAnswered) {
      displayText = `Incoming call (${formatCallDuration(call.duration_seconds)})`;
      color = '#4CAF50';
    } else {
      displayText = 'Incoming call';
      color = '#666';
    }
  }

  return {
    displayText,
    iconName,
    color,
    isOutgoing,
    isMissed,
    isAnswered,
    duration: call.duration_seconds,
    timestamp: call.created_at
  };
};
