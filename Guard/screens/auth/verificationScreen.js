import React, { useEffect, useMemo, useState } from "react";
import {
  Text,
  View,
  ImageBackground,
  BackHandler,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Colors, Fonts, Default } from "../../constants/styles";
import { useTranslation } from "react-i18next";
import MyStatusBar from "../../components/myStatusBar";
import { ms } from "react-native-size-matters/extend";
import AwesomeButton from "react-native-really-awesome-button";
import Ionicons from "react-native-vector-icons/Ionicons";
import { OtpInput } from "react-native-otp-entry";
import { supabase } from "../../utils/supabase";

const RESEND_TIMEOUT_SECONDS = 59;

const VerificationScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  const phone = useMemo(() => String(route?.params?.phone || "").trim(), [route?.params?.phone]);

  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(RESEND_TIMEOUT_SECONDS);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");

  function tr(key) {
    return t(`verificationScreen:${key}`);
  }

  useEffect(() => {
    const backAction = () => {
      navigation.pop();
      return true;
    };
    const backSub = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backSub.remove();
  }, [navigation]);

  useEffect(() => {
    if (timer <= 0) return undefined;
    const intervalId = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalId);
  }, [timer]);

  const formatSecondsToTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const handleVerify = async (next) => {
    const completeProgress = () => {
      if (typeof next === "function") {
        next();
      }
    };

    const token = String(otp || "").trim();

    if (!phone) {
      setError("Missing phone number. Please restart sign in.");
      completeProgress();
      return;
    }

    if (token.length !== 4) {
      setError("Please enter the 4-digit code sent to your phone.");
      completeProgress();
      return;
    }

    try {
      setVerifying(true);
      setError("");

      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: "sms",
      });

      if (verifyError) {
        throw verifyError;
      }

      navigation.reset({
        index: 0,
        routes: [{ name: "splashScreen" }],
      });
    } catch (verifyErr) {
      setError(verifyErr?.message || "Invalid verification code. Please try again.");
    } finally {
      setVerifying(false);
      completeProgress();
    }
  };

  const handleResend = async () => {
    if (!phone || timer > 0 || resending) {
      return;
    }

    try {
      setResending(true);
      setError("");

      const { error: resendError } = await supabase.auth.signInWithOtp({ phone });
      if (resendError) {
        throw resendError;
      }

      setOtp("");
      setTimer(RESEND_TIMEOUT_SECONDS);
    } catch (resendErr) {
      setError(resendErr?.message || "Could not resend code. Please try again.");
    } finally {
      setResending(false);
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
          onPress={() => navigation.pop()}
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
          automaticallyAdjustKeyboardInsets
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
              {`${tr("pleaseEnter")} ${phone}`}
            </Text>
          </View>

          <View
            style={{
              marginTop: Default.fixPadding * 5,
              marginBottom: Default.fixPadding * 2.5,
              marginHorizontal: Default.fixPadding * 7,
            }}
          >
            <OtpInput
              numberOfDigits={4}
              textInputProps={{
                autoComplete: "one-time-code",
              }}
              onTextChange={(text) => {
                setOtp(text);
                if (error) {
                  setError("");
                }
              }}
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

          {!!error && <Text style={styles.errorText}>{error}</Text>}

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
              height={50}
              progressLoadingTime={700}
              onPress={handleVerify}
              raiseLevel={1}
              stretch
              borderRadius={10}
              backgroundShadow={Colors.primary}
              backgroundDarker={Colors.primary}
              backgroundColor={Colors.primary}
              disabled={verifying || otp.length !== 4}
            >
              <Text style={{ ...Fonts.SemiBold18white }}>
                {verifying ? "Verifying..." : tr("verify")}
              </Text>
            </AwesomeButton>
          </View>

          <TouchableOpacity disabled={timer > 0 || resending} onPress={handleResend}>
            <Text
              style={{
                ...Fonts.Medium16primary,
                textAlign: "center",
                marginBottom: Default.fixPadding,
                opacity: timer > 0 || resending ? 0.5 : 1,
              }}
            >
              {resending ? "Resending..." : tr("resend")}
            </Text>
          </TouchableOpacity>
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
  errorText: {
    ...Fonts.Medium14black,
    color: Colors.red,
    textAlign: "center",
    marginHorizontal: Default.fixPadding * 2,
    marginBottom: Default.fixPadding,
  },
});
