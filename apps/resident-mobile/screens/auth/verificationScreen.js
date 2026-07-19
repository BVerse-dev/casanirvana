import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  BackHandler,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors, Default, Fonts } from "../../constants/styles";
import { useTranslation } from "react-i18next";
import MyStatusBar from "../../components/myStatusBar";
import { ms } from "react-native-size-matters/extend";
import AwesomeButton from "react-native-really-awesome-button";
import Ionicons from "react-native-vector-icons/Ionicons";
import { OtpInput } from "react-native-otp-entry";
import { supabase } from "../../utils/supabase";

const VerificationScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  const phone = route?.params?.phone || "";
  const verificationType = route?.params?.verificationType || "phone";

  const [timer, setTimer] = useState(59);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  function tr(key) {
    return t(`verificationScreen:${key}`);
  }

  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };
    const subscription = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => subscription?.remove();
  }, [navigation]);

  useEffect(() => {
    if (timer <= 0) {
      return undefined;
    }
    const intervalId = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(intervalId);
  }, [timer]);

  const formattedPhone = useMemo(() => (phone ? phone : tr("phoneNumber")), [phone, tr]);

  const formatSecondsToTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const handleVerify = async () => {
    if (verificationType !== "phone") {
      Alert.alert("Unsupported flow", "Please sign in with email.");
      navigation.replace("emailLoginScreen");
      return;
    }

    if (!phone) {
      Alert.alert("Missing phone number", "Please go back and request a new OTP.");
      return;
    }

    if (otp.length !== 4) {
      Alert.alert("Invalid OTP", "Please enter the 4-digit OTP sent to your phone.");
      return;
    }

    try {
      setIsVerifying(true);
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: "sms",
      });

      if (error) {
        Alert.alert("Verification failed", error.message || "Unable to verify OTP.");
        return;
      }

      navigation.replace("bottomTab");
    } catch (error) {
      Alert.alert("Verification error", error?.message || "Unable to verify OTP.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || verificationType !== "phone" || !phone) {
      return;
    }

    try {
      setIsResending(true);
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) {
        Alert.alert("Resend failed", error.message || "Unable to resend OTP.");
        return;
      }
      setTimer(59);
    } catch (error) {
      Alert.alert("Resend error", error?.message || "Unable to resend OTP.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <MyStatusBar />

      <ImageBackground
        resizeMode="stretch"
        source={require("../../assets/images/login.png")}
        style={{ flex: 1 }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            alignSelf: isRtl ? "flex-end" : "flex-start",
            marginHorizontal: Default.fixPadding * 2,
            marginVertical: Default.fixPadding * 1.2,
          }}
        >
          <Ionicons
            name={isRtl ? "arrow-forward-outline" : "arrow-back-outline"}
            size={24}
            color={Colors.black}
          />
        </TouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={true}
        >
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginTop: Default.fixPadding * 0.8,
              marginHorizontal: Default.fixPadding * 3,
            }}
          >
            <Text style={{ ...Fonts.SemiBold21primary }}>{tr("otpVerification")}</Text>

            <Text
              style={{
                ...Fonts.Medium14extraDarkGrey,
                textAlign: "center",
                marginTop: Default.fixPadding * 1.1,
              }}
            >
              {`${tr("pleaseEnter")} ${formattedPhone}`}
            </Text>
          </View>

          <View
            style={{
              marginHorizontal: Default.fixPadding * 7,
              marginVertical: Default.fixPadding * 5,
            }}
          >
            <OtpInput
              numberOfDigits={4}
              onTextChange={setOtp}
              theme={{
                pinCodeContainerStyle: {
                  borderWidth: 0,
                  width: ms(50),
                  height: ms(50),
                  borderRadius: 5,
                  backgroundColor: Colors.white,
                  ...Default.shadow,
                },
                pinCodeTextStyle: { ...Fonts.Medium20black },
                focusedPinCodeContainerStyle: {
                  borderWidth: 0,
                  borderRadius: 5,
                },
                focusStickStyle: { backgroundColor: Colors.primary },
              }}
            />
          </View>

          <View style={styles.timeView}>
            <Text style={{ ...Fonts.Regular16black }}>{formatSecondsToTime(timer)}</Text>
          </View>

          <View
            style={{
              marginTop: Default.fixPadding * 2.5,
              marginBottom: Default.fixPadding,
              marginHorizontal: Default.fixPadding * 2,
            }}
          >
            <AwesomeButton
              progress
              disabled={isVerifying || otp.length !== 4}
              height={50}
              progressLoadingTime={300}
              onPress={async (next) => {
                await handleVerify();
                next();
              }}
              raiseLevel={1}
              stretch={true}
              borderRadius={10}
              backgroundShadow={Colors.primary}
              backgroundDarker={Colors.primary}
              backgroundColor={Colors.primary}
            >
              <Text style={{ ...Fonts.SemiBold18white }}>
                {isVerifying ? tr("verifying") || "Verifying..." : tr("verify")}
              </Text>
            </AwesomeButton>
          </View>

          <Text
            onPress={handleResend}
            style={{
              ...Fonts.Medium16primary,
              textAlign: "center",
              marginBottom: Default.fixPadding,
              opacity: timer === 0 && !isResending ? 1 : 0.5,
            }}
          >
            {isResending ? tr("resending") || "Resending..." : tr("resend")}
          </Text>
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

export default VerificationScreen;

const styles = StyleSheet.create({
  timeView: {
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    paddingVertical: Default.fixPadding * 0.6,
    paddingHorizontal: Default.fixPadding * 1.6,
    borderRadius: 40,
    backgroundColor: Colors.sky,
  },
});
