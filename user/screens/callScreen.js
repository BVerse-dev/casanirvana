import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
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

const TERMINAL_CALL_STATUSES = new Set(["ended", "rejected", "missed"]);
const ACTIVE_RINGING_STATUSES = new Set(["initiated", "ringing"]);

const CallScreen = ({ navigation, route }) => {
  const {
    image,
    name,
    phone,
    id,
    memberId,
    memberPhone,
    calleeProfileId,
    mode = "outgoing",
    callId = null,
  } = route.params || {};

  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() == "rtl";
  const hasBootstrappedCallRef = useRef(false);

  const {
    isInCall,
    callData,
    localAudioMuted,
    hydrateCall,
    initiateCall,
    answerCall,
    endCall,
    rejectCall,
    toggleMute,
  } = useCallManager();

  function tr(key, fallback) {
    const translatedValue = t(`callScreen:${key}`);
    return translatedValue === `callScreen:${key}` ? fallback : translatedValue;
  }

  const [callDuration, setCallDuration] = useState(0);
  const [speakerMuted, setSpeakerMuted] = useState(false);

  const resolvedCalleeId = calleeProfileId || id || memberId;
  const isIncomingRoute = mode === "incoming";
  const isTerminalCall = TERMINAL_CALL_STATUSES.has(callData?.status);
  const isIncomingRinging = isIncomingRoute && ACTIVE_RINGING_STATUSES.has(callData?.status || "initiated");
  const isConnected = callData?.status === "answered";

  const displayStatus = useMemo(() => {
    if (isConnected) {
      return "connected";
    }

    if (isTerminalCall) {
      return "ended";
    }

    if (isIncomingRinging) {
      return "incoming";
    }

    if (ACTIVE_RINGING_STATUSES.has(callData?.status || "initiated")) {
      return "ringing";
    }

    return "connecting";
  }, [callData?.status, isConnected, isIncomingRinging, isTerminalCall]);

  const avatarSource =
    typeof image === "number"
      ? image
      : typeof image === "string" && image.length > 0
        ? { uri: image }
        : image?.uri
          ? image
          : require("../assets/images/pic1.png");

  useEffect(() => {
    if (hasBootstrappedCallRef.current) {
      return;
    }

    hasBootstrappedCallRef.current = true;

    const bootstrapCall = async () => {
      try {
        if (isIncomingRoute) {
          if (!callId) {
            throw new Error("Incoming call is unavailable.");
          }

          await hydrateCall(callId);
          return;
        }

        if (!resolvedCalleeId) {
          throw new Error("Cannot initiate call: recipient not found.");
        }

        await initiateCall(resolvedCalleeId, "voice");
      } catch (error) {
        Alert.alert(tr("callFailed", "Call Failed"), error.message || tr("callFailedBody", "Unable to start this call."));
        navigation.goBack();
      }
    };

    bootstrapCall();
  }, [callId, hydrateCall, initiateCall, isIncomingRoute, navigation, resolvedCalleeId]);

  useEffect(() => {
    if (!callData?.answered_at || callData.status !== "answered") {
      if (callData?.duration_seconds && TERMINAL_CALL_STATUSES.has(callData.status)) {
        setCallDuration(callData.duration_seconds);
      } else if (!callData?.answered_at) {
        setCallDuration(0);
      }
      return undefined;
    }

    const setElapsedDuration = () => {
      const durationInSeconds = Math.max(
        0,
        Math.floor((Date.now() - new Date(callData.answered_at).getTime()) / 1000)
      );
      setCallDuration(durationInSeconds);
    };

    setElapsedDuration();
    const timer = setInterval(setElapsedDuration, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [callData?.answered_at, callData?.duration_seconds, callData?.status]);

  useEffect(() => {
    if (!callData?.status || !TERMINAL_CALL_STATUSES.has(callData.status)) {
      return undefined;
    }

    const timer = setTimeout(() => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate("bottomTab", { screen: "homeScreen" });
      }
    }, 1200);

    return () => {
      clearTimeout(timer);
    };
  }, [callData?.status, navigation]);

  const handleEndCall = async () => {
    try {
      await endCall(callData?.id);
    } catch (error) {
      navigation.goBack();
    }
  };

  const handleRejectCall = async () => {
    try {
      await rejectCall(callData?.id || callId);
    } catch (error) {
      navigation.goBack();
    }
  };

  const handleAnswerCall = async () => {
    try {
      await answerCall(callData?.id || callId);
    } catch (error) {
      Alert.alert(tr("answerFailed", "Answer Failed"), error.message || tr("answerFailedBody", "Unable to answer this call."));
    }
  };

  const handleToggleMute = async () => {
    try {
      await toggleMute();
    } catch (error) {
      Alert.alert(tr("muteFailed", "Action Failed"), tr("muteFailedBody", "Unable to update microphone state."));
    }
  };

  const formatCallDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getCallStatusText = () => {
    switch (displayStatus) {
      case "connecting":
        return tr("connecting", "Connecting...");
      case "incoming":
        return tr("incoming", "Incoming call...");
      case "ringing":
        return tr("ringing", "Ringing...");
      case "connected":
        return formatCallDuration(callDuration);
      case "ended":
        if (callData?.status === "rejected") {
          return tr("declined", "Call declined");
        }
        if (callData?.status === "missed") {
          return tr("missed", "Missed call");
        }
        return tr("ended", "Call ended");
      default:
        return tr("calling", "Calling...");
    }
  };

  const backAction = () => {
    if (isTerminalCall) {
      navigation.goBack();
      return true;
    }

    if (isIncomingRinging) {
      handleRejectCall();
      return true;
    }

    handleEndCall();
    return true;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  });

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

    const rStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scaleValue.value }],
      opacity: opacityValue.value,
    }));

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
          <Text style={{ ...Fonts.Medium18grey, marginBottom: Default.fixPadding }}>
            {getCallStatusText()}
          </Text>
          <Text style={{ ...Fonts.SemiBold18black }}>{name || tr("resident", "Resident")}</Text>
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
          source={avatarSource}
          style={{
            zIndex: 1,
            width: ms(259),
            height: ms(259),
            borderRadius: 130,
          }}
        />
        {!isTerminalCall && [...Array(3).keys()].map((index) => <Ring key={index} index={index} />)}
      </View>

      <View
        style={{
          flex: 2.8,
          justifyContent: "flex-end",
        }}
      >
        {isIncomingRinging ? (
          <View
            style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginHorizontal: Default.fixPadding * 5,
            }}
          >
            <TouchableOpacity
              onPress={handleRejectCall}
              style={{ ...styles.bottomBtn, backgroundColor: Colors.darkRed }}
            >
              <MaterialIcons name="call-end" size={28} color={Colors.white} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAnswerCall}
              style={{ ...styles.bottomBtn, backgroundColor: Colors.primary }}
            >
              <Ionicons name="call" size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>
        ) : (
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
              style={{
                ...styles.bottomBtn,
                backgroundColor: localAudioMuted ? Colors.darkRed : Colors.silver,
              }}
            >
              <Ionicons
                name={localAudioMuted ? "mic-off-outline" : "mic-outline"}
                size={28}
                color={Colors.white}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSpeakerMuted((previous) => !previous)}
              style={{ ...styles.bottomBtn, backgroundColor: Colors.silver }}
            >
              <Ionicons
                name={speakerMuted ? "volume-mute-outline" : "volume-medium-outline"}
                size={28}
                color={Colors.white}
              />
            </TouchableOpacity>

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
              <Ionicons name={"chatbox-ellipses-outline"} size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>
        )}

        {!isIncomingRinging && !isTerminalCall && (
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
        )}

        {isTerminalCall && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              alignSelf: "center",
              marginVertical: Default.fixPadding * 4,
              backgroundColor: Colors.silver,
              ...styles.bottomBtn,
            }}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default CallScreen;

const styles = StyleSheet.create({
  bottomBtn: {
    justifyContent: "center",
    alignItems: "center",
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  ring: {
    position: "absolute",
    width: ms(200),
    height: ms(200),
    borderRadius: ms(100),
    backgroundColor: Colors.primary,
  },
});
