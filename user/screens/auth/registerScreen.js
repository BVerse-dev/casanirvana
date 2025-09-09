import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  ImageBackground,
  BackHandler,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { Colors, Fonts, Default } from "../../constants/styles";
import { useTranslation } from "react-i18next";
import MyStatusBar from "../../components/myStatusBar";
import AwesomeButton from "react-native-really-awesome-button";
import { supabase } from "../../utils/supabase";
import Ionicons from "react-native-vector-icons/Ionicons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Feather from "react-native-vector-icons/Feather";

const RegisterScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`registerScreen:${key}`);
  }
  const backAction = () => {
    navigation.pop();
    return true;
  };  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => {
      subscription?.remove();
    };
  }, []);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (next) => {
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            mobile: mobile,
          },
        },
      });
      if (error) {
        setError(error.message || tr("registrationFailed"));
        return;
      }
      // Registration successful
      next();
      navigation.push("verificationScreen");
    } catch (err) {
      setError(err.message || tr("registrationFailed"));
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
              {tr("register").toUpperCase()}
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

          {/* First Name */}
          <View
            style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              ...styles.textInput,
            }}
          >
            <FontAwesome
              name="user-o"
              size={18}
              color={Colors.grey}
              style={{
                marginRight: isRtl ? 0 : Default.fixPadding * 1.5,
                marginLeft: isRtl ? Default.fixPadding * 1.5 : 0,
              }}
            />
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First Name"
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
            />
          </View>

          {/* Last Name */}
          <View
            style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              marginTop: Default.fixPadding * 1.5,
              ...styles.textInput,
            }}
          >
            <FontAwesome
              name="user-o"
              size={18}
              color={Colors.grey}
              style={{
                marginRight: isRtl ? 0 : Default.fixPadding * 1.5,
                marginLeft: isRtl ? Default.fixPadding * 1.5 : 0,
              }}
            />
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last Name"
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
            />
          </View>

          {/* Mobile Number */}
          <View
            style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              marginTop: Default.fixPadding * 1.5,
              ...styles.textInput,
            }}
          >
            <Feather
              name="smartphone"
              size={18}
              color={Colors.grey}
              style={{
                marginRight: isRtl ? 0 : Default.fixPadding * 1.5,
                marginLeft: isRtl ? Default.fixPadding * 1.5 : 0,
              }}
            />
            <TextInput
              maxLength={15}
              value={mobile}
              onChangeText={setMobile}
              placeholder={tr("mobileNumber") || "Mobile Number"}
              keyboardType="phone-pad"
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
            />
          </View>

          {/* Email Address */}
          <View
            style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              marginTop: Default.fixPadding * 1.5,
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
              placeholder={tr("emailAddress") || "Email Address"}
              keyboardType="email-address"
              placeholderTextColor={Colors.grey}
              selectionColor={Colors.primary}
              autoCapitalize="none"
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
            />
          </View>

          {/* Password */}
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
              secureTextEntry={true}
              autoCapitalize="none"
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
            />
          </View>

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
              onPress={handleRegister}
              raiseLevel={1}
              stretch={true}
              borderRadius={10}
              backgroundShadow={Colors.primary}
              backgroundDarker={Colors.primary}
              backgroundColor={Colors.primary}
              disabled={loading}
            >
              {loading ? (
                <Text style={{ ...Fonts.SemiBold18white }}>{tr("loading") || "Loading..."}</Text>
              ) : (
                <Text style={{ ...Fonts.SemiBold18white }}>{tr("register")}</Text>
              )}
            </AwesomeButton>
            {!!error && (
              <Text style={{ color: Colors.red, marginTop: 10, textAlign: "center" }}>{error}</Text>
            )}
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

export default RegisterScreen;

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
