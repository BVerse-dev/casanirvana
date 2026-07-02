import { useEffect, useState } from 'react';

import { supabase } from '../utils/supabase';
import { getCurrentProfile, getProfileByAuthId } from '../utils/profileResolver';

const TERMINAL_CALL_STATUSES = new Set(['ended', 'rejected', 'missed']);

const updateCallRow = async (callId, updateData) => {
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
};

const resolveParticipantProfileId = async (actorId) => {
  if (!actorId) {
    return null;
  }

  const resolvedProfile = await getProfileByAuthId(actorId, 'id');
  return resolvedProfile?.id || actorId;
};

export const useCallManager = () => {
  const [isInCall, setIsInCall] = useState(false);
  const [callData, setCallData] = useState(null);
  const [localAudioMuted, setLocalAudioMuted] = useState(false);
  const [localVideoMuted, setLocalVideoMuted] = useState(false);

  const resetLocalState = () => {
    setIsInCall(false);
    setCallData(null);
    setLocalAudioMuted(false);
    setLocalVideoMuted(false);
  };

  useEffect(() => {
    if (!callData?.id) {
      return undefined;
    }

    const currentCallId = callData.id;
    const channel = supabase
      .channel(`user-call-${currentCallId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calls',
          filter: `id=eq.${currentCallId}`,
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            resetLocalState();
            return;
          }

          const nextCall = payload.new;
          if (!nextCall) {
            return;
          }

          setCallData(nextCall);
          setIsInCall(!TERMINAL_CALL_STATUSES.has(nextCall.status));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [callData?.id]);

  const hydrateCall = async (callId) => {
    if (!callId) {
      throw new Error('Call not found.');
    }

    const { data, error } = await supabase.from('calls').select('*').eq('id', callId).single();

    if (error || !data) {
      throw error || new Error('Call not found.');
    }

    setCallData(data);
    setIsInCall(!TERMINAL_CALL_STATUSES.has(data.status));
    return data;
  };

  const updateCallStatus = async (callId, status) => {
    if (!callId) {
      throw new Error('Call not found.');
    }

    const currentCall = callData?.id === callId ? callData : await hydrateCall(callId);
    const updateData = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'answered') {
      updateData.answered_at = new Date().toISOString();
    }

    if (TERMINAL_CALL_STATUSES.has(status)) {
      updateData.ended_at = new Date().toISOString();

      if (currentCall?.answered_at) {
        const duration = Math.floor((Date.now() - new Date(currentCall.answered_at).getTime()) / 1000);
        updateData.duration_seconds = Math.max(duration, currentCall.duration_seconds || 0, 0);
      }
    }

    const updatedCall = await updateCallRow(callId, updateData);
    setCallData(updatedCall);
    setIsInCall(!TERMINAL_CALL_STATUSES.has(updatedCall.status));

    if (TERMINAL_CALL_STATUSES.has(updatedCall.status)) {
      setLocalAudioMuted(false);
      setLocalVideoMuted(false);
    }

    return updatedCall;
  };

  const initiateCall = async (calleeId, callType = 'voice') => {
    const callerProfile = await getCurrentProfile('id, full_name, first_name, last_name');
    if (!callerProfile?.id) {
      throw new Error('Resident profile mapping is missing. Please sign in again.');
    }

    const targetCalleeId = await resolveParticipantProfileId(calleeId);
    if (!targetCalleeId) {
      throw new Error('Call recipient could not be resolved.');
    }

    const channelName = `call_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const { data: createdCall, error } = await supabase
      .from('calls')
      .insert({
        caller_id: callerProfile.id,
        callee_id: targetCalleeId,
        call_type: callType,
        status: 'initiated',
        agora_channel_name: channelName,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    setCallData(createdCall);
    setIsInCall(true);

    return updateCallStatus(createdCall.id, 'ringing');
  };

  const answerCall = async (callId = callData?.id) => {
    return updateCallStatus(callId, 'answered');
  };

  const endCall = async (callId = callData?.id) => {
    if (!callId) {
      resetLocalState();
      return null;
    }

    return updateCallStatus(callId, 'ended');
  };

  const rejectCall = async (callId = callData?.id) => {
    if (!callId) {
      resetLocalState();
      return null;
    }

    return updateCallStatus(callId, 'rejected');
  };

  const toggleMute = async () => {
    setLocalAudioMuted((previous) => !previous);
  };

  const toggleVideo = async () => {
    setLocalVideoMuted((previous) => !previous);
  };

  return {
    rtcEngine: null,
    transportMode: 'signaling-only',
    isRtcTransportReady: false,
    isInCall,
    callData,
    localAudioMuted,
    localVideoMuted,
    hydrateCall,
    initiateCall,
    answerCall,
    endCall,
    rejectCall,
    toggleMute,
    toggleVideo,
  };
};
