import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MyStatusBar from "../components/myStatusBar";
import { ms } from "react-native-size-matters/extend";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useCallManager } from "../hooks/useCallManager";
import { useRealTimeCalls } from "../hooks/useMessages";

const CallScreen = ({ navigation, route }) => {
  const { image, name, phone, id, memberId, memberPhone } = route.params;

  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() == "rtl";
  
  // Initialize call manager
  const {
    rtcEngine,
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
  } = useCallManager();

  const { incomingCall, clearIncomingCall } = useRealTimeCalls();

  function tr(key) {
    return t(`callScreen:${key}`);
  }

  const [callStatus, setCallStatus] = useState('connecting'); // 'connecting', 'ringing', 'connected', 'ended'
  const [callDuration, setCallDuration] = useState(0);
  const [callTimer, setCallTimer] = useState(null);

  // Start call when component mounts
  useEffect(() => {
    if (id && !isInCall) {
      handleInitiateCall();
    }
  }, [id]);

  // Handle call duration timer
  useEffect(() => {
    if (callStatus === 'connected') {
      const timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      setCallTimer(timer);
      
      return () => {
        if (timer) clearInterval(timer);
      };
    } else {
      if (callTimer) {
        clearInterval(callTimer);
        setCallTimer(null);
      }
    }
  }, [callStatus]);

  const handleInitiateCall = async () => {
    try {
      setCallStatus('connecting');
      
      const calleeId = id || memberId;
      
      if (!calleeId) {
        Alert.alert('Call Failed', 'Cannot initiate call: recipient not found');
        navigation.goBack();
        return;
      }
      
      await initiateCall(calleeId, 'voice');
      setCallStatus('ringing');
      
    } catch (error) {
      Alert.alert('Call Failed', 'Unable to initiate call. Please try again.');
      navigation.goBack();
    }
  };

  const handleEndCall = async () => {
    try {
      await endCall();
      setCallStatus('ended');
      navigation.goBack();
    } catch (error) {
      navigation.goBack();
    }
  };

  const formatCallDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCallStatusText = () => {
    switch (callStatus) {
      case 'connecting':
        return 'Connecting...';
      case 'ringing':
        return 'Ringing...';
      case 'connected':
        return formatCallDuration(callDuration);
      case 'ended':
        return 'Call Ended';
      default:
        return 'Calling...';
    }
  };
  const backAction = () => {
    handleEndCall();
    return true;
  };
  
  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => {
      const subscription = BackHandler.addEventListener("hardwareBackPress", backAction); 
      return () => subscription?.remove(); 
    }
  }, []);
  
  const [mic, setMic] = useState(false);
  const [mute, setMute] = useState(false);

  const handleToggleMute = async () => {
    try {
      await toggleMute();
      setMic(!localAudioMuted);
    } catch (error) {
      // Silently handle mute toggle errors
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
    }, [opacityValue, scaleValue, index]);

    const rStyle = useAnimatedStyle(() => {
      return {
        transform: [
          {
            scale: scaleValue.value,
          },
        ],
        opacity: opacityValue.value,
      };
    });
    return <Animated.View style={[styles.ring, rStyle]} />;
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <MyStatusBar />
      <View style={{ flex: 1.2 }}>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: Default.fixPadding * 2,
          }}
        >
          <Text
            style={{ ...Fonts.Medium18grey, marginBottom: Default.fixPadding }}
          >
            {getCallStatusText()}
          </Text>
          <Text style={{ ...Fonts.SemiBold18black }}>{name}</Text>
        </View>
      </View>

      <View
        style={{
          flex: 6,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          source={
            typeof image === 'number' 
              ? image 
              : typeof image === 'string' && image.startsWith('http')
                ? { uri: image }
                : require("../assets/images/pic1.png") // Fallback user avatar
          }
          style={{
            zIndex: 1,
            width: ms(259),
            height: ms(259),
            borderRadius: 130,
          }}
        />
        {[...Array(3).keys()].map((index) => (
          <Ring key={index} index={index} />
        ))}
      </View>

      <View
        style={{
          flex: 2.8,
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginHorizontal: Default.fixPadding * 7,
          }}
        >
          <TouchableOpacity
            onPress={handleToggleMute}
            style={{ ...styles.bottomBtn, backgroundColor: localAudioMuted ? Colors.darkRed : Colors.silver }}
          >
            <Ionicons
              name={localAudioMuted ? "mic-off-outline" : "mic-outline"}
              size={28}
              color={Colors.white}
            />
          </TouchableOpacity>

          <View
            style={{
              marginHorizontal: Default.fixPadding * 2,
              backgroundColor: Colors.silver,
              ...styles.bottomBtn,
            }}
          >
            <Ionicons
              name={mute ? "volume-mute-outline" : "volume-medium-outline"}
              size={28}
              color={Colors.white}
              onPress={() => setMute((prev) => !prev)}
            />
          </View>

          <TouchableOpacity
            onPress={() =>
              navigation.push("messageScreen", { 
                image, 
                name, 
                key: "2",
                phone,
                id,
                memberId,
                memberPhone,
              })
            }
            style={{ ...styles.bottomBtn, backgroundColor: Colors.silver }}
          >
            <Ionicons
              name={"chatbox-ellipses-outline"}
              size={24}
              color={Colors.white}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleEndCall}
          style={{
            alignSelf: "center",
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
    justifyContent: "center",
    alignItems: "center",
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  ring: {
    position: "absolute",
    width: ms(200),
    height: ms(200),
    borderRadius: ms(100),
    backgroundColor: Colors.primary,
  },
});
