import { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase';
import { Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

// Expo Go compatible version - no native modules
export const useCallManager = () => {
  const [rtcEngine, setRtcEngine] = useState(null);
  const [isInCall, setIsInCall] = useState(false);
  const [callData, setCallData] = useState(null);
  const [localAudioMuted, setLocalAudioMuted] = useState(false);
  const [localVideoMuted, setLocalVideoMuted] = useState(false);
  const { user, profile } = useAuth();

  const initiateCall = async (calleeId, callType = 'voice') => {
    try {
      console.log('Initiating call to:', calleeId, 'Type:', callType);
      
      // Check if user profile is available
      if (!profile?.id) {
        throw new Error('User profile not found. Please ensure you are logged in.');
      }
      
      // Generate channel name
      const channelName = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create call record in database using profile IDs
      const { data: callRecord, error } = await supabase
        .from('calls')
        .insert({
          caller_id: profile.id,  // Use profile ID from context
          callee_id: calleeId,    // This should also be a profile ID
          call_type: callType,
          status: 'initiated',
          agora_channel_name: channelName
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating call record:', error);
        throw error;
      }

      setCallData(callRecord);
      setIsInCall(true);
      
      // Update call status to ringing
      await updateCallStatus(callRecord.id, 'ringing');
      
      // Show alert for Expo Go mode
      Alert.alert(
        'Call Initiated (Expo Go)',
        `📞 Call to ${calleeId}\n\n🔄 Status: Ringing\n🏗️ Running in Expo Go mode\n✅ Database record created!\n\n🚀 Real calling will work with development build.`,
        [
          { text: 'End Call', onPress: endCall, style: 'destructive' },
          { text: 'Continue', style: 'default' }
        ]
      );

      return callRecord;
    } catch (error) {
      console.error('Error initiating call:', error);
      Alert.alert('Call Failed', error.message);
      throw error;
    }
  };

  const answerCall = async (callId) => {
    try {
      console.log('Answering call:', callId);
      
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
      console.error('Error answering call:', error);
      Alert.alert('Answer Failed', error.message);
    }
  };

  const endCall = async () => {
    try {
      console.log('Ending call');
      
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
      console.error('Error ending call:', error);
    }
  };

  const rejectCall = async (callId) => {
    try {
      console.log('Rejecting call:', callId);
      await updateCallStatus(callId, 'rejected');
      Alert.alert('Call Rejected', '📞 Call rejected\n✅ Database updated');
    } catch (error) {
      console.error('Error rejecting call:', error);
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
      console.error('Error toggling mute:', error);
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
        console.error('Error updating call status:', error);
      } else {
        console.log('✅ Call status updated to:', status);
      }
    } catch (error) {
      console.error('Error updating call status:', error);
    }
  };

  return {
    rtcEngine: null, // No engine in Expo Go
    isInCall,
    callData,
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