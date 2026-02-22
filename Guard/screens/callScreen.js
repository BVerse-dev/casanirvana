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
    visitorName,
    actualHostName,
    passFlatNumber,
    originalPass,
    calleeProfileId: routeCalleeProfileId,
    callType: routeCallType,
  } = route.params;

  const resolvedCalleeProfileId =
    routeCalleeProfileId || route.params?.memberId || id || null;
  const resolvedUnitId = passedUnitId || hostId || null;
  const normalizedCallType = routeCallType === "video" ? "video" : "voice";

  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() == "rtl";
  
  // Initialize call manager
  const {
    rtcEngine,
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
  } = useCallManager();
  const resolvedUnitLabel =
    unitDisplay || routeUnitDisplay || route.params?.flatNo || passFlatNumber || "";

  function tr(key) {
    return t(`callScreen:${key}`);
  }

  const [callStatus, setCallStatus] = useState('connecting'); // 'connecting', 'ringing', 'connected', 'ended'
  const [callDuration, setCallDuration] = useState(0);
  const [callTimer, setCallTimer] = useState(null);

  // Debug logging
  console.log('CallScreen params:', route.params);
  console.log('CallScreen state:', { hostName, unitDisplay, routeUnitDisplay });

  // Format time helper function
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start call timer when connected
  const startCallTimer = () => {
    if (callTimer) clearInterval(callTimer);
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    setCallTimer(timer);
    return timer;
  };

  // Stop call timer
  const stopCallTimer = () => {
    if (callTimer) {
      clearInterval(callTimer);
      setCallTimer(null);
    }
  };

  // Start call when component mounts
  useEffect(() => {
    if ((resolvedCalleeProfileId || resolvedUnitId) && !isInCall) {
      handleInitiateCall();
    }
    
    // Simulate call progression for demo
    const timer1 = setTimeout(() => {
      setCallStatus('ringing');
    }, 2000);

    const timer2 = setTimeout(() => {
      setCallStatus('connected');
      startCallTimer();
    }, 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      stopCallTimer();
    };
  }, [resolvedCalleeProfileId, resolvedUnitId, isInCall]);

  const handleInitiateCall = async () => {
    try {
      setCallStatus('connecting');
      // Calls must stay in-app; resolve callee profile directly when available.
      await initiateCall(resolvedCalleeProfileId, normalizedCallType, resolvedUnitId, {
        actualHostName: actualHostName,
        passFlatNumber: passFlatNumber,
        hostPhone: hostPhone,
        originalPass: originalPass
      });
      setCallStatus('ringing');
    } catch (error) {
      setCallStatus('ended');
      setTimeout(() => navigation.goBack(), 2000);
    }
  };
  const backAction = () => {
    // End call before going back
    if (isInCall) {
      stopCallTimer();
      endCall();
    } else {
      stopCallTimer();
    }
    navigation.pop();
    return true;
  };

  useEffect(() => {
    const backSub = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => {
      backSub.remove();
      stopCallTimer();
    };
  }, [isInCall]);

  // Handle call end
  const handleEndCall = () => {
    stopCallTimer();
    setCallStatus('ended');
    endCall();
    navigation.goBack();
  };

  // Handle mute toggle
  const handleToggleMute = () => {
    toggleMute();
  };
  const [mic, setMic] = useState(false);
  const [mute, setMute] = useState(false);

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
            {callStatus === 'connecting' ? (tr("connecting") || 'Connecting...') : 
             callStatus === 'ringing' ? (tr("calling") || 'Calling...') : 
             callStatus === 'connected' ? formatTime(callDuration) :
             (tr("connecting") || 'Connecting...')}
          </Text>
          <Text style={{ ...Fonts.SemiBold18black }}>
            {hostName || "Connecting to Host..."}
          </Text>
          {resolvedUnitLabel ? (
            <Text style={{ ...Fonts.Medium16grey, marginTop: 5 }}>
              Flat {resolvedUnitLabel}
            </Text>
          ) : null}
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
          source={require("../assets/images/call.png")}
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
          <View style={{ ...styles.bottomBtn, backgroundColor: Colors.silver }}>
            <Ionicons
              name={localAudioMuted ? "mic-off-outline" : "mic-outline"}
              size={28}
              color={Colors.white}
              onPress={handleToggleMute}
            />
          </View>

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
              navigation.push("chatScreen", {
                image: image || require("../assets/images/call.png"),
                name: name || "Host",
                key: "2",
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
    borderRadius: 100,
    backgroundColor: Colors.regularBlue,
  },
});
