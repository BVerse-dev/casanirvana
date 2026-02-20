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
  Alert,
} from "react-native";
import { Colors, Fonts, Default } from "../../constants/styles";
import { useTranslation } from "react-i18next";
import MyStatusBar from "../../components/myStatusBar";
import SnackbarToast from "../../components/snackbarToast";
import AwesomeButton from "react-native-really-awesome-button";
import IntlPhoneInput from "react-native-intl-phone-input";
import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "../../utils/supabase";

const LoginScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`loginScreen:${key}`);
  }

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
      const backSub = BackHandler.addEventListener("hardwareBackPress", backAction);
      const unsubscribeGesture = navigation.addListener("gestureEnd", backAction);
      return () => {
        backSub.remove();
        unsubscribeGesture();
      };
    }, [exitApp])
  );

  const [phoneState, setPhoneState] = useState({
    dialCode: "+233",
    unmaskedPhoneNumber: "",
    phoneNumber: "",
  });

  const handlePhoneChange = ({ dialCode, unmaskedPhoneNumber, phoneNumber }) => {
    setPhoneState({ dialCode, unmaskedPhoneNumber, phoneNumber });
  };

  return (
    <View style={{ flex: 1 }}>
      <MyStatusBar />

      <ImageBackground
        resizeMode="stretch"
        source={require("../../assets/images/login.png")}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={true}
        >
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginTop: Default.fixPadding * 5.6,
              marginBottom: Default.fixPadding * 4.4,
              marginHorizontal: Default.fixPadding * 2,
            }}
          >
            <Text style={{ ...Fonts.SemiBold21primary }}>
              {tr("login").toUpperCase()}
            </Text>
            <Text
              style={{
                ...Fonts.Medium14extraDarkGrey,
                marginTop: Default.fixPadding * 1.1,
              }}
            >
              {tr("helloUsers")}
            </Text>
          </View>

          <IntlPhoneInput
            placeholder={tr("enterMobileNumber")}
            placeholderTextColor={Colors.grey}
            defaultCountry="GH"
            filterText={tr("search")}
            closeText={tr("close")}
            onChangeText={handlePhoneChange}
            flagStyle={{
              fontSize: 25,
            }}
            modalCountryItemCountryNameStyle={{
              ...Fonts.Medium16black,
            }}
            dialCodeTextStyle={{
              ...Fonts.Medium16black,
              marginLeft: Default.fixPadding * 0.6,
              marginRight: Default.fixPadding,
            }}
            containerStyle={styles.containerStyle}
            phoneInputStyle={{
              ...Fonts.Medium16black,
              textAlign: isRtl ? "right" : "left",
              paddingHorizontal: isRtl ? 0 : Default.fixPadding * 1.5,
              borderLeftWidth: 1,
              borderLeftColor: Colors.grey,
            }}
          />

          <Text
            style={{
              ...Fonts.Medium14primary,
              textAlign: isRtl ? "right" : "left",
              marginHorizontal: Default.fixPadding * 2,
            }}
          >
            {tr("verification")}
          </Text>

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
              onPress={async (next) => {
                try {
                  const dial = phoneState?.dialCode || "";
                  const raw = (phoneState?.unmaskedPhoneNumber || "").replace(/\D/g, "");
                  const fullPhone = `${dial}${raw}`;

                  if (!dial || !raw || raw.length < 7) {
                    Alert.alert("Invalid phone number", "Please enter a valid mobile number.");
                    return;
                  }

                  // Attempt to send OTP via Supabase
                  const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
                  if (error) {
                    console.log("Phone OTP error:", error);
                    const msg = (error?.message || '').toLowerCase();
                    if (msg.includes('unsupported phone provider') || msg.includes('phone provider')) {
                      Alert.alert(
                        'Phone sign-in not available',
                        'Phone OTP is not enabled yet. Please use Email sign-in for now.',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Use Email', onPress: () => navigation.push('emailLoginScreen') },
                        ]
                      );
                    } else {
                      Alert.alert(
                        'Could not send OTP',
                        error.message || "We couldn't send an OTP right now. Please try email login or try again later."
                      );
                    }
                    return;
                  }

                  navigation.push("verificationScreen", {
                    phone: fullPhone,
                    verificationType: "phone",
                  });
                } catch (e) {
                  console.log("Phone login error:", e);
                  Alert.alert("Error", e.message || "Something went wrong. Please try again.");
                } finally {
                  next();
                }
              }}
              raiseLevel={1}
              stretch={true}
              borderRadius={10}
              backgroundShadow={Colors.primary}
              backgroundDarker={Colors.primary}
              backgroundColor={Colors.primary}
            >
              <Text style={{ ...Fonts.SemiBold18white }}>{tr("login")}</Text>
            </AwesomeButton>
          </View>

          <View style={{ 
            alignItems: 'center', 
            marginHorizontal: Default.fixPadding * 2,
            marginBottom: Default.fixPadding * 2 
          }}>
            <TouchableOpacity 
              onPress={() => navigation.push('emailLoginScreen')}
              style={{ marginBottom: Default.fixPadding }}
            >
              <Text style={{
                ...Fonts.SemiBold14primary
              }}>
                Sign In with Email
              </Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{
                ...Fonts.SemiBold14grey
              }}>
                Don't have an account? 
              </Text>
              <TouchableOpacity onPress={() => navigation.push('registerScreen')}>
                <Text style={{...Fonts.SemiBold14primary}}> Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
      <SnackbarToast
        visible={visibleToast}
        title={tr("tapBack")}
        onDismiss={onDismissVisibleToast}
      />
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  containerStyle: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Default.fixPadding * 0.8,
    marginBottom: Default.fixPadding * 0.5,
    marginHorizontal: Default.fixPadding * 2,
    borderRadius: 10,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
});
