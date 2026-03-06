import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { useGuardAuth } from '../contexts/GuardAuthContext';
import { getCurrentProfile, getProfileByAuthId } from '../utils/profileResolver';

const TERMINAL_CALL_STATUSES = new Set(['ended', 'rejected', 'missed']);

const toDisplayName = (profile) => {
  const fullName = profile?.full_name?.trim();
  if (fullName) return fullName;
  const composed = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim();
  return composed || 'Resident';
};

const normalizeName = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');

const resolveHostByUnit = async (unitId, preferredHostName = null) => {
  const { data: unitData, error: unitError } = await supabase
    .from('units')
    .select('id, number, unit_number, block, owner_id, tenant_id')
    .eq('id', unitId)
    .single();

  if (unitError || !unitData) {
    throw new Error('Unit not found');
  }

  const unitDisplay = unitData.unit_number || `${unitData.block}-${unitData.number}`;
  const hostCandidates = [];

  if (unitData.owner_id) {
    const ownerProfile = await getProfileByAuthId(
      unitData.owner_id,
      'id, full_name, first_name, last_name, phone'
    );
    if (ownerProfile) {
      hostCandidates.push(ownerProfile);
    }
  }

  if (unitData.tenant_id) {
    const tenantProfile = await getProfileByAuthId(
      unitData.tenant_id,
      'id, full_name, first_name, last_name, phone'
    );
    if (tenantProfile) {
      hostCandidates.push(tenantProfile);
    }
  }

  if (hostCandidates.length === 0) {
    throw new Error(`No resident profile is assigned to unit ${unitDisplay}`);
  }

  const preferredNormalized = normalizeName(preferredHostName);
  const selectedHost =
    hostCandidates.find((candidate) => normalizeName(toDisplayName(candidate)) === preferredNormalized) ||
    hostCandidates[0];

  return {
    calleeProfileId: selectedHost.id,
    hostName: toDisplayName(selectedHost),
    unitDisplay,
  };
};

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

export const useCallManager = () => {
  const { authUser } = useGuardAuth();
  const [isInCall, setIsInCall] = useState(false);
  const [callData, setCallData] = useState(null);
  const [hostName, setHostName] = useState('');
  const [unitDisplay, setUnitDisplay] = useState('');
  const [localAudioMuted, setLocalAudioMuted] = useState(false);
  const [localVideoMuted, setLocalVideoMuted] = useState(false);

  useEffect(() => {
    if (!callData?.id) {
      return undefined;
    }

    const currentCallId = callData.id;
    const channel = supabase
      .channel(`guard-call-${currentCallId}`)
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
            setCallData(null);
            setIsInCall(false);
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

  const updateCallStatus = async (callId, status) => {
    const updateData = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'answered') {
      updateData.answered_at = new Date().toISOString();
    }

    if (status === 'ended' || status === 'rejected' || status === 'missed') {
      updateData.ended_at = new Date().toISOString();

      if (callData?.answered_at) {
        const duration = Math.floor((Date.now() - new Date(callData.answered_at).getTime()) / 1000);
        updateData.duration_seconds = Math.max(duration, callData.duration_seconds || 0, 0);
      }
    }

    const updatedCall = await updateCallRow(callId, updateData);
    setCallData(updatedCall);
    setIsInCall(!TERMINAL_CALL_STATUSES.has(updatedCall.status));
    return updatedCall;
  };

  const initiateCall = async (calleeId, callType = 'voice', unitId = null, passData = null) => {
    if (!authUser?.id) {
      throw new Error('Guard session is unavailable. Please sign in again.');
    }

    const callerProfile = await getCurrentProfile('id, full_name, first_name, last_name');
    if (!callerProfile?.id) {
      throw new Error('Guard profile mapping is missing. Please contact admin.');
    }

    let targetCalleeId = null;
    let resolvedHostName = passData?.actualHostName || 'Resident';
    let resolvedUnitDisplay = passData?.passFlatNumber || '';

    if (calleeId) {
      const calleeProfile = await getProfileByAuthId(calleeId, 'id, full_name, first_name, last_name');
      if (calleeProfile?.id) {
        targetCalleeId = calleeProfile.id;
        resolvedHostName = toDisplayName(calleeProfile);
      }
    }

    if (!targetCalleeId && unitId) {
      const hostByUnit = await resolveHostByUnit(unitId, passData?.actualHostName);
      targetCalleeId = hostByUnit.calleeProfileId;
      resolvedHostName = hostByUnit.hostName;
      resolvedUnitDisplay = resolvedUnitDisplay || hostByUnit.unitDisplay;
    }

    if (!targetCalleeId) {
      throw new Error(
        'In-app call recipient could not be resolved. Start the call from a valid resident profile.'
      );
    }

    setHostName(resolvedHostName);
    setUnitDisplay(resolvedUnitDisplay || '');

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
    if (!callId) {
      throw new Error('Call not found');
    }

    return updateCallStatus(callId, 'answered');
  };

  const endCall = async () => {
    if (!callData?.id) {
      setIsInCall(false);
      setCallData(null);
      return null;
    }

    const updatedCall = await updateCallStatus(callData.id, 'ended');
    setLocalAudioMuted(false);
    setLocalVideoMuted(false);
    return updatedCall;
  };

  const rejectCall = async (callId = callData?.id) => {
    if (!callId) {
      return null;
    }

    const updatedCall = await updateCallStatus(callId, 'rejected');
    setLocalAudioMuted(false);
    setLocalVideoMuted(false);
    return updatedCall;
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
    hostName,
    unitDisplay,
    localAudioMuted,
    localVideoMuted,
    initiateCall,
    answerCall,
    endCall,
    rejectCall,
    toggleMute,
    toggleVideo,
  };
};
