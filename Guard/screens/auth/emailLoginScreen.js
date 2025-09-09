import React, { useState, useCallback } from "react";
import {
  Text,
  View,
  ImageBackground,
  BackHandler,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Colors, Fonts, Default } from "../../constants/styles";
import { useTranslation } from "react-i18next";
import MyStatusBar from "../../components/myStatusBar";
import SnackbarToast from "../../components/snackbarToast";
import AwesomeButton from "react-native-really-awesome-button";
import { TextInput } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";
import { useAuthGuard } from "../../hooks/useAuthGuard";
import { useGuardAuth } from "../../contexts/GuardAuthContext";

const EmailLoginScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { signIn } = useGuardAuth();

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`emailLoginScreen:${key}`);
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [visibleToast, setVisibleToast] = useState(false);
  const onDismissVisibleToast = () => setVisibleToast(false);

  const [exitApp, setExitApp] = useState(0);
  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        if (Platform.OS === "ios") {
          navigation.addListener("beforeRemove", (e) => {
            e.preventDefault();
          });
        } else {
          setTimeout(() => {
            setExitApp(0);
          }, 2000);

          if (exitApp === 0) {
            setExitApp(exitApp + 1);
            setVisibleToast(true);
          } else if (exitApp === 1) {
            BackHandler.exitApp();
          }
          return true;
        }
      };
      const subscription = BackHandler.addEventListener("hardwareBackPress", backAction);
      navigation.addListener("gestureEnd", backAction);
      return () => {
        subscription?.remove();
        navigation.removeListener("gestureEnd", backAction);
      };
    }, [exitApp])
  );

  const handleEmailLogin = async (next) => {
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    if (!email.includes('@')) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await signIn(email, password);
      
      // Authentication successful, navigate to main app
      next();
      navigation.replace("bottomTab");
      
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Sign in failed. Please check your credentials.");
    } finally {
      setLoading(false);
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
              marginBottom: Default.fixPadding * 4,
              marginHorizontal: Default.fixPadding * 2,
            }}
          >
            <Text style={{ ...Fonts.SemiBold21primary }}>
              SIGN IN WITH EMAIL
            </Text>
            <Text
              style={{
                ...Fonts.Medium14extraDarkGrey,
                marginTop: Default.fixPadding * 1.1,
              }}
            >
              Hello guard, please sign in to your account
            </Text>
          </View>

          {/* Email Input Row */}
          <View
            style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              ...styles.textInput,
            }}
          >
            <Feather
              name="mail"
              size={18}
              color={Colors.grey}
              style={{
                marginRight: isRtl ? 0 : Default.fixPadding * 1.5,
                marginLeft: isRtl ? Default.fixPadding * 1.5 : 0,
              }}
            />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email Address"
              keyboardType="email-address"
              placeholderTextColor={Colors.grey}
              selectionColor={Colors.primary}
              style={{
                ...Fonts.Medium16black,
                flex: 1,
                textAlign: isRtl ? "right" : "left",
                paddingLeft: isRtl ? 0 : Default.fixPadding * 1.5,
                paddingRight: isRtl ? Default.fixPadding * 1.5 : 0,
                borderLeftWidth: isRtl ? null : 1,
                borderLeftColor: isRtl ? null : Colors.grey,
                borderRightWidth: isRtl ? 1 : null,
                borderRightColor: isRtl ? Colors.grey : null,
              }}
              editable={!loading}
              autoCapitalize="none"
            />
          </View>

          {/* Password Input Row */}
          <View
            style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              marginTop: Default.fixPadding * 1.5,
              ...styles.textInput,
            }}
          >
            <Feather
              name="lock"
              size={18}
              color={Colors.grey}
              style={{
                marginRight: isRtl ? 0 : Default.fixPadding * 1.5,
                marginLeft: isRtl ? Default.fixPadding * 1.5 : 0,
              }}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={Colors.grey}
              selectionColor={Colors.primary}
              style={{
                ...Fonts.Medium16black,
                flex: 1,
                textAlign: isRtl ? "right" : "left",
                paddingLeft: isRtl ? 0 : Default.fixPadding * 1.5,
                paddingRight: isRtl ? Default.fixPadding * 1.5 : 0,
                borderLeftWidth: isRtl ? null : 1,
                borderLeftColor: isRtl ? null : Colors.grey,
                borderRightWidth: isRtl ? 1 : null,
                borderRightColor: isRtl ? Colors.grey : null,
              }}
              secureTextEntry
              editable={!loading}
            />
          </View>

          {!!error && (
            <Text style={{ color: Colors.red, marginTop: 10, textAlign: "center", marginHorizontal: Default.fixPadding * 2 }}>
              {error}
            </Text>
          )}

          <View
            style={{
              marginTop: Default.fixPadding * 6,
              marginBottom: Default.fixPadding * 2,
              marginHorizontal: Default.fixPadding * 2,
            }}
          >
            <AwesomeButton
              progress
              height={50}
              progressLoadingTime={1000}
              onPress={handleEmailLogin}
              raiseLevel={1}
              stretch={true}
              borderRadius={10}
              backgroundShadow={Colors.primary}
              backgroundDarker={Colors.primary}
              backgroundColor={Colors.primary}
              disabled={loading || !email.trim() || !password.trim()}
            >
              {loading ? (
                <Text style={{ ...Fonts.SemiBold18white }}>Signing In...</Text>
              ) : (
                <Text style={{ ...Fonts.SemiBold18white }}>Sign In</Text>
              )}
            </AwesomeButton>
          </View>

          <View style={{ 
            alignItems: 'center', 
            marginHorizontal: Default.fixPadding * 2,
            marginBottom: Default.fixPadding * 2 
          }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={{
                ...Fonts.SemiBold14grey
              }}>
                Back to Phone Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ImageBackground>
      <SnackbarToast
        visible={visibleToast}
        title="Tap back again to exit the App"
        onDismiss={onDismissVisibleToast}
      />
    </View>
  );
};

export default EmailLoginScreen;

const styles = StyleSheet.create({
  textInput: {
    alignItems: "center",
    paddingVertical: Default.fixPadding,
    paddingHorizontal: Default.fixPadding * 1.3,
    marginHorizontal: Default.fixPadding * 2,
    borderRadius: 10,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
});
