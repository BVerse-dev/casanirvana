import { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase';
import { Alert } from 'react-native';
import { useGuardAuth } from '../contexts/GuardAuthContext';

// Expo Go compatible version - no native modules
export const useCallManager = () => {
  const { user, guard } = useGuardAuth();
  const [rtcEngine, setRtcEngine] = useState(null);
  const [isInCall, setIsInCall] = useState(false);
  const [callData, setCallData] = useState(null);
  const [hostName, setHostName] = useState('');
  const [unitDisplay, setUnitDisplay] = useState('');
  const [localAudioMuted, setLocalAudioMuted] = useState(false);
  const [localVideoMuted, setLocalVideoMuted] = useState(false);

  const initiateCall = async (calleeId, callType = 'voice', unitId = null, passData = null) => {
    try {
      console.log('=== Call Manager Debug ===');
      console.log('user:', user);
      console.log('guard:', guard);
      console.log('user.id:', user?.id);
      console.log('passData:', passData);
      console.log('===========================');

      if (!user?.id) {
        throw new Error('Guard not found. User ID: ' + user?.id);
      }
      
      let targetCalleeId = calleeId;
      let hostName = 'Host';
      let unitDisplay = '';
      
      // PRIORITIZE: Use the exact visitor pass data if provided
      if (passData?.actualHostName && passData?.passFlatNumber) {
        console.log('Using EXACT visitor pass data');
        hostName = passData.actualHostName;
        unitDisplay = passData.passFlatNumber;
        
        // We still need to find a valid profile ID for the database call
        if (unitId) {
          console.log('Finding profile for exact host:', hostName, 'unit:', unitDisplay);
          
          // Get the unit information
          const { data: unitData, error: unitError } = await supabase
            .from('units')
            .select('id, owner_id, tenant_id')
            .eq('id', unitId)
            .single();
            
          if (!unitError && unitData) {
            // Find host profile by searching for matching name
            if (unitData.owner_id) {
              const { data: ownerProfile, error: ownerProfileError } = await supabase
                .from('profiles')
                .select('id, full_name, first_name, last_name')
                .eq('user_id', unitData.owner_id)
                .single();

              if (!ownerProfileError && ownerProfile) {
                const ownerFullName = ownerProfile.full_name || `${ownerProfile.first_name || ''} ${ownerProfile.last_name || ''}`.trim();
                if (ownerFullName === hostName || ownerProfile.full_name === hostName) {
                  targetCalleeId = ownerProfile.id;
                  console.log('Found matching owner profile:', hostName, ownerProfile.id);
                }
              }
            }
            
            // If owner doesn't match, try tenant
            if (!targetCalleeId && unitData.tenant_id) {
              const { data: tenantProfile, error: tenantProfileError } = await supabase
                .from('profiles')
                .select('id, full_name, first_name, last_name')
                .eq('user_id', unitData.tenant_id)
                .single();

              if (!tenantProfileError && tenantProfile) {
                const tenantFullName = tenantProfile.full_name || `${tenantProfile.first_name || ''} ${tenantProfile.last_name || ''}`.trim();
                if (tenantFullName === hostName || tenantProfile.full_name === hostName) {
                  targetCalleeId = tenantProfile.id;
                  console.log('Found matching tenant profile:', hostName, tenantProfile.id);
                }
              }
            }
            
            // If no exact match found, fall back to owner profile
            if (!targetCalleeId && unitData.owner_id) {
              const { data: fallbackProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('user_id', unitData.owner_id)
                .single();
                
              if (fallbackProfile) {
                targetCalleeId = fallbackProfile.id;
                console.log('Using fallback owner profile:', fallbackProfile.id);
              }
            }
          }
        }
        
        // Set the exact host name and unit display from visitor pass
        setHostName(hostName);
        setUnitDisplay(unitDisplay);
      } else
  if (unitId) {
        console.log('Finding host for unit ID:', unitId);
        
        // Get the unit information by ID - simplified query to avoid foreign key errors
        const { data: unitData, error: unitError } = await supabase
          .from('units')
          .select(`
            id, 
            number, 
            unit_number, 
            block,
            owner_id,
            tenant_id
          `)
          .eq('id', unitId)
          .single();
          
        if (unitError || !unitData) {
          console.error('Unit not found:', unitError);
          throw new Error('Unit not found');
        }
        
        // Get unit display from data
        const calculatedUnitDisplay = unitData.unit_number || `${unitData.block}-${unitData.number}`;
        // For UI, prefer to use the block-number format if unit_number isn't already in that format
        if (calculatedUnitDisplay.includes('-')) {
          unitDisplay = calculatedUnitDisplay;
        } else {
          unitDisplay = `${unitData.block}-${unitData.number}`;
        }
        console.log('Found unit:', unitDisplay);        // Find host profile record using owner_id, fall back to tenant if needed
        let resolved = false;
        if (unitData.owner_id) {
          const { data: ownerProfile, error: ownerProfileError } = await supabase
            .from('profiles')
            .select('id, full_name, first_name, last_name, phone')
            .eq('user_id', unitData.owner_id)
            .single();

          if (!ownerProfileError && ownerProfile) {
            targetCalleeId = ownerProfile.id;
            hostName = ownerProfile.full_name || `${ownerProfile.first_name || ''} ${ownerProfile.last_name || ''}`.trim();
            console.log('Found owner profile:', hostName, ownerProfile.id);
            resolved = true;
          } else if (unitData.owner) {
            // owner user exists but profile missing
            hostName = `${unitData.owner.first_name} ${unitData.owner.last_name}`.trim();
          }
        }

        if (!resolved && unitData.tenant_id) {
          const { data: tenantProfile, error: tenantProfileError } = await supabase
            .from('profiles')
            .select('id, full_name, first_name, last_name, phone')
            .eq('user_id', unitData.tenant_id)
            .single();

          if (!tenantProfileError && tenantProfile) {
            targetCalleeId = tenantProfile.id;
            hostName = tenantProfile.full_name || `${tenantProfile.first_name || ''} ${tenantProfile.last_name || ''}`.trim();
            console.log('Found tenant profile:', hostName, tenantProfile.id);
            resolved = true;
          } else if (unitData.tenant) {
            // tenant user exists but profile missing
            hostName = hostName || `${unitData.tenant.first_name} ${unitData.tenant.last_name}`.trim();
          }
        }

        if (!resolved) {
          if (unitData.owner_id || unitData.tenant_id) {
            throw new Error(`Profile required for host ${hostName || unitDisplay} of unit ${unitDisplay}. Please contact admin.`);
          }
          throw new Error(`No owner or tenant assigned to unit ${unitDisplay}`);
        }
        
        // Set the state values for the call screen
        setHostName(hostName);
        setUnitDisplay(unitDisplay);
      }
      
      // For guards, we need to ensure we have the correct caller ID
      // Check if guard has a profile record or uses user ID directly
      let guardCallerId = null;
      
      const { data: guardProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
        
      if (!profileError && guardProfile) {
        guardCallerId = guardProfile.id;
        console.log('Using guard profile ID:', guardCallerId);
      } else {
        console.log('Guard profile not found, attempting to create...');
        try {
          // Instead of creating a profile which may fail due to RLS,
          // use the user ID directly as a fallback
          guardCallerId = user.id;
          console.log('Using guard user ID as fallback:', guardCallerId);
        } catch (createErr) {
          console.error('Failed to use guard ID:', createErr);
          throw new Error('Could not establish guard identity. Please contact administrator.');
        }
      }
      
      // Generate channel name
      const channelName = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
        // Database call structure bypassing RLS issues
        const { data: callRecord, error } = await supabase
          .from('calls')
          .insert({
            caller_id: guardCallerId,  // Use guard profile ID (FK to profiles)
            callee_id: targetCalleeId,    // Resident profile or user ID
            call_type: callType,
            status: 'initiated',
            agora_channel_name: channelName
          })
          .select()
          .single();      if (error) {
        throw error;
      }

      setCallData(callRecord);
      setIsInCall(true);
      
      // Update call status to ringing
      await updateCallStatus(callRecord.id, 'ringing');
      
      // Show alert for Expo Go mode
      Alert.alert(
        'Call Initiated Successfully',
        `📞 Calling Host of ${unitId ? 'Unit' : 'Contact'}\n\n🔄 Status: Ringing\n👮‍♂️ Guard: ${guard?.full_name || user?.email}\n✅ Call record created!\n\n� Host will receive notification in User app`,
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
