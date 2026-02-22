import { useState } from 'react';
import { supabase } from '../utils/supabase';
import { Alert } from 'react-native';
import { useGuardAuth } from '../contexts/GuardAuthContext';
import { getCurrentProfile, getProfileByAuthId } from '../utils/profileResolver';

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

// Expo Go compatible version - no native modules
export const useCallManager = () => {
  const { authUser, guard } = useGuardAuth();
  const [isInCall, setIsInCall] = useState(false);
  const [callData, setCallData] = useState(null);
  const [hostName, setHostName] = useState('');
  const [unitDisplay, setUnitDisplay] = useState('');
  const [localAudioMuted, setLocalAudioMuted] = useState(false);
  const [localVideoMuted, setLocalVideoMuted] = useState(false);

  const initiateCall = async (calleeId, callType = 'voice', unitId = null, passData = null) => {
    try {
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
        const calleeProfile = await getProfileByAuthId(
          calleeId,
          'id, full_name, first_name, last_name'
        );
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

      // Generate channel name
      const channelName = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { data: callRecord, error } = await supabase
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

      setCallData(callRecord);
      setIsInCall(true);
      
      // Update call status to ringing
      await updateCallStatus(callRecord.id, 'ringing');
      
      // Show alert for Expo Go mode
      Alert.alert(
        'Call Initiated Successfully',
        `📞 Calling ${resolvedHostName}\n\n🔄 Status: Ringing\n👮‍♂️ Guard: ${guard?.full_name || authUser?.email}\n✅ Call record created.`,
        [
          { text: 'End Call', onPress: endCall, style: 'destructive' },
          { text: 'Continue', style: 'default' }
        ]
      );

      return callRecord;
    } catch (error) {
      Alert.alert('Call Failed', error.message);
      throw error;
    }
  };

  const answerCall = async (callId) => {
    try {
      // Get call data
      const { data: call, error } = await supabase
        .from('calls')
        .select('*')
        .eq('id', callId)
        .single();

      if (error || !call) {
        throw new Error('Call not found');
      }

      setCallData(call);
      setIsInCall(true);
      
      // Update call status to answered
      await updateCallStatus(callId, 'answered');
      
      Alert.alert(
        'Call Answered',
        '📞 Call answered successfully\n✅ Call is now active\n🔊 Audio simulation (Expo Go mode)'
      );
    } catch (error) {
      Alert.alert('Answer Failed', error.message);
    }
  };

  const endCall = async () => {
    try {
      if (callData) {
        // Update call status to ended
        await updateCallStatus(callData.id, 'ended');
      }
      
      setIsInCall(false);
      setCallData(null);
      setLocalAudioMuted(false);
      setLocalVideoMuted(false);
      
      Alert.alert('Call Ended', '📞 Call terminated\n✅ Database updated');
    } catch (error) {
      // Silently handle end call errors
    }
  };

  const rejectCall = async (callId) => {
    try {
      await updateCallStatus(callId, 'rejected');
      Alert.alert('Call Rejected', '📞 Call rejected\n✅ Database updated');
    } catch (error) {
      // Silently handle reject call errors
    }
  };

  const toggleMute = async () => {
    try {
      const newMuted = !localAudioMuted;
      setLocalAudioMuted(newMuted);
      
      Alert.alert(
        newMuted ? 'Muted' : 'Unmuted',
        `🎤 Microphone ${newMuted ? 'muted' : 'unmuted'}\n\n(Expo Go mode - simulation only)`
      );
    } catch (error) {
      // Silently handle mute toggle errors
    }
  };

  const toggleVideo = async () => {
    const newMuted = !localVideoMuted;
    setLocalVideoMuted(newMuted);
    
    Alert.alert(
      newMuted ? 'Video Off' : 'Video On',
      `📹 Video ${newMuted ? 'disabled' : 'enabled'}\n\n(Expo Go mode - simulation only)`
    );
  };

  const updateCallStatus = async (callId, status) => {
    try {
      const updateData = { status, updated_at: new Date().toISOString() };
      
      if (status === 'answered') {
        updateData.answered_at = new Date().toISOString();
      } else if (status === 'ended') {
        updateData.ended_at = new Date().toISOString();
        
        // Calculate duration if call was answered
        if (callData?.answered_at) {
          const duration = Math.floor((new Date() - new Date(callData.answered_at)) / 1000);
          updateData.duration_seconds = duration;
        }
      }
      
      const { error } = await supabase
        .from('calls')
        .update(updateData)
        .eq('id', callId);

      if (error) {
        throw error;
      }
    } catch (error) {
      // Silently handle call status update errors
    }
  };

  return {
    rtcEngine: null, // No engine in Expo Go
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
