import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  StyleSheet,
  Image,
} from 'react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Colors, Default, Fonts } from '../constants/styles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MyStatusBar from '../components/myStatusBar';
import { ms } from 'react-native-size-matters/extend';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useCallManager } from '../hooks/useCallManager';

const TERMINAL_STATUSES = new Set(['ended', 'rejected', 'missed']);

const CallScreen = ({ navigation, route }) => {
  const {
    image,
    name,
    phone,
    id,
    hostId,
    hostPhone,
    unitDisplay: routeUnitDisplay,
    unitId: passedUnitId,
    actualHostName,
    passFlatNumber,
    originalPass,
    calleeProfileId: routeCalleeProfileId,
    callType: routeCallType,
    memberId,
    memberPhone,
    email,
  } = route.params;

  const resolvedCalleeProfileId = routeCalleeProfileId || memberId || id || null;
  const resolvedUnitId = passedUnitId || hostId || null;
  const normalizedCallType = routeCallType === 'video' ? 'video' : 'voice';
  const initiatedRef = useRef(false);

  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  const {
    isInCall,
    callData,
    hostName,
    unitDisplay,
    localAudioMuted,
    initiateCall,
    endCall,
    toggleMute,
  } = useCallManager();

  const [callStatus, setCallStatus] = useState('connecting');
  const [callDuration, setCallDuration] = useState(0);
  const [speakerMuted, setSpeakerMuted] = useState(false);

  const resolvedUnitLabel = unitDisplay || routeUnitDisplay || route.params?.flatNo || passFlatNumber || '';
  const displayName = hostName || name || actualHostName || 'Resident';

  function tr(key) {
    return t(`callScreen:${key}`);
  }

  const avatarSource = useMemo(() => {
    if (typeof image === 'number') {
      return image;
    }

    if (typeof image === 'string' && image.startsWith('http')) {
      return { uri: image };
    }

    return require('../assets/images/call.png');
  }, [image]);

  useEffect(() => {
    if (initiatedRef.current) {
      return;
    }

    if (!resolvedCalleeProfileId && !resolvedUnitId) {
      setCallStatus('ended');
      return;
    }

    initiatedRef.current = true;

    const startCall = async () => {
      try {
        setCallStatus('connecting');
        await initiateCall(resolvedCalleeProfileId, normalizedCallType, resolvedUnitId, {
          actualHostName,
          passFlatNumber,
          hostPhone,
          originalPass,
        });
      } catch (_error) {
        setCallStatus('ended');
      }
    };

    startCall();
  }, [
    actualHostName,
    hostPhone,
    initiateCall,
    normalizedCallType,
    originalPass,
    passFlatNumber,
    resolvedCalleeProfileId,
    resolvedUnitId,
  ]);

  useEffect(() => {
    if (!callData?.status) {
      return;
    }

    if (callData.status === 'answered') {
      setCallStatus('connected');
      return;
    }

    if (callData.status === 'ringing' || callData.status === 'initiated') {
      setCallStatus('ringing');
      return;
    }

    if (callData.status === 'rejected') {
      setCallStatus('rejected');
      return;
    }

    if (callData.status === 'missed') {
      setCallStatus('missed');
      return;
    }

    if (callData.status === 'ended') {
      setCallStatus('ended');
    }
  }, [callData?.status]);

  useEffect(() => {
    if (callStatus !== 'connected' || !callData?.answered_at) {
      setCallDuration(callData?.duration_seconds || 0);
      return undefined;
    }

    const syncDuration = () => {
      const answeredAt = new Date(callData.answered_at).getTime();
      const elapsedSeconds = Math.max(0, Math.floor((Date.now() - answeredAt) / 1000));
      setCallDuration(elapsedSeconds);
    };

    syncDuration();
    const timer = setInterval(syncDuration, 1000);
    return () => clearInterval(timer);
  }, [callData?.answered_at, callData?.duration_seconds, callStatus]);

  useEffect(() => {
    if (!TERMINAL_STATUSES.has(callStatus)) {
      return undefined;
    }

    const timer = setTimeout(() => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [callStatus, navigation]);

  useEffect(() => {
    const handleBack = () => {
      handleEndCall();
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => subscription.remove();
  }, [isInCall, callData?.id]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCallStatusText = () => {
    switch (callStatus) {
      case 'connecting':
        return tr('connecting') || 'Connecting...';
      case 'ringing':
        return tr('calling') || 'Calling...';
      case 'connected':
        return formatTime(callDuration);
      case 'rejected':
        return 'Call declined';
      case 'missed':
        return 'No answer';
      case 'ended':
        return 'Call ended';
      default:
        return tr('calling') || 'Calling...';
    }
  };

  const handleEndCall = async () => {
    try {
      await endCall();
      setCallStatus('ended');
    } catch (_error) {
      navigation.goBack();
    }
  };

  const handleToggleMute = async () => {
    try {
      await toggleMute();
    } catch (_error) {
      // local-only control; ignore toggle errors
    }
  };

  const Ring = ({ index }) => {
    const opacityValue = useSharedValue(0.9);
    const scaleValue = useSharedValue(1);

    useEffect(() => {
      opacityValue.value = withDelay(
        index * 200,
        withRepeat(
          withTiming(0, {
            duration: 2000,
          }),
          -1,
          false
        )
      );
      scaleValue.value = withDelay(
        index * 200,
        withRepeat(
          withTiming(2, {
            duration: 2000,
          }),
          -1,
          false
        )
      );
    }, [index, opacityValue, scaleValue]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scaleValue.value }],
      opacity: opacityValue.value,
    }));

    return <Animated.View style={[styles.ring, animatedStyle]} />;
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <MyStatusBar />
      <View style={{ flex: 1.2 }}>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: Default.fixPadding * 2,
          }}
        >
          <Text style={{ ...Fonts.Medium18grey, marginBottom: Default.fixPadding }}>
            {getCallStatusText()}
          </Text>
          <Text style={{ ...Fonts.SemiBold18black }}>{displayName}</Text>
          {resolvedUnitLabel ? (
            <Text style={{ ...Fonts.Medium16grey, marginTop: 5 }}>Flat {resolvedUnitLabel}</Text>
          ) : null}
        </View>
      </View>

      <View
        style={{
          flex: 6,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Image
          source={avatarSource}
          style={{
            zIndex: 1,
            width: ms(259),
            height: ms(259),
            borderRadius: 130,
          }}
        />
        {callStatus === 'connecting' || callStatus === 'ringing'
          ? [...Array(3).keys()].map((index) => <Ring key={index} index={index} />)
          : null}
      </View>

      <View
        style={{
          flex: 2.8,
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            flexDirection: isRtl ? 'row-reverse' : 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginHorizontal: Default.fixPadding * 7,
          }}
        >
          <TouchableOpacity
            onPress={handleToggleMute}
            style={{
              ...styles.bottomBtn,
              backgroundColor: localAudioMuted ? Colors.darkRed : Colors.silver,
            }}
          >
            <Ionicons
              name={localAudioMuted ? 'mic-off-outline' : 'mic-outline'}
              size={28}
              color={Colors.white}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSpeakerMuted((previous) => !previous)}
            style={{
              marginHorizontal: Default.fixPadding * 2,
              backgroundColor: speakerMuted ? Colors.darkRed : Colors.silver,
              ...styles.bottomBtn,
            }}
          >
            <Ionicons
              name={speakerMuted ? 'volume-mute-outline' : 'volume-medium-outline'}
              size={28}
              color={Colors.white}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              navigation.push('messageScreen', {
                image: avatarSource,
                name: displayName,
                key: '2',
                phone: phone || memberPhone || hostPhone,
                id: resolvedCalleeProfileId,
                memberId: resolvedCalleeProfileId,
                memberPhone: phone || memberPhone || hostPhone,
                email,
              })
            }
            style={{ ...styles.bottomBtn, backgroundColor: Colors.silver }}
          >
            <Ionicons name={'chatbox-ellipses-outline'} size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleEndCall}
          style={{
            alignSelf: 'center',
            marginVertical: Default.fixPadding * 4,
            backgroundColor: Colors.darkRed,
            ...styles.bottomBtn,
          }}
        >
          <MaterialIcons name="call-end" size={28} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CallScreen;

const styles = StyleSheet.create({
  bottomBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  ring: {
    position: 'absolute',
    width: ms(200),
    height: ms(200),
    borderRadius: 100,
    backgroundColor: Colors.regularBlue,
  },
});
