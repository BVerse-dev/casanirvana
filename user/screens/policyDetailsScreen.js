import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { ms } from "react-native-size-matters/extend";
import MyStatusBar from "../components/myStatusBar";

const PolicyDetailsScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  
  const { provider, providerName } = route.params || {};
  
  const [policyNumber, setPolicyNumber] = useState("");
  const [description, setDescription] = useState("");
  const [savePolicy, setSavePolicy] = useState(false);
  const [isValidPolicy, setIsValidPolicy] = useState(false);
  const [policyError, setPolicyError] = useState("");

  // Safe translation function that ALWAYS returns a string
  function tr(key, fallback = "Missing Translation") {
    if (!key) return fallback || "";
    const translated = t(key);
    return translated || fallback;
  }

  // Get logo based on provider
  const getProviderLogo = () => {
    switch (provider) {
      case "enterprise_life":
        return require("../assets/images/pay1.png");
      case "akwantupa":
        return require("../assets/images/pay2.png");
      case "hollard_life":
        return require("../assets/images/pay3.png");
      case "metropolitan_life":
        return require("../assets/images/pay4.png");
      case "old_mutual":
        return require("../assets/images/pay5.png");
      default:
        return require("../assets/images/pay5.png");
    }
  };

  // Validate policy number
  const validatePolicy = (text) => {
    setPolicyNumber(text);
    
    // Simple validation - can be enhanced based on provider requirements
    if (text.length < 6) {
      setIsValidPolicy(false);
      if (text.length > 0) {
        setPolicyError("Policy number too short");
      } else {
        setPolicyError("");
      }
    } else {
      setIsValidPolicy(true);
      setPolicyError("");
    }
  };

  // Handle continue
  const handleContinue = () => {
    if (!isValidPolicy) {
      Alert.alert("Invalid Policy", "Please enter a valid policy number");
      return;
    }

    navigation.navigate("insuranceAmountScreen", {
      provider,
      providerName,
      policyNumber,
      description,
      savePolicy,
      providerLogo: getProviderLogo(),
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.extraLightGrey }}>
      <MyStatusBar />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View
            style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              alignItems: "center",
              paddingVertical: Default.fixPadding * 1.2,
              paddingHorizontal: Default.fixPadding * 2,
              backgroundColor: Colors.white,
              ...Default.shadow,
            }}
          >
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                marginRight: isRtl ? 0 : Default.fixPadding * 1.5,
                marginLeft: isRtl ? Default.fixPadding * 1.5 : 0,
              }}
            >
              <Ionicons
                name={isRtl ? "arrow-forward-outline" : "arrow-back-outline"}
                size={25}
                color={Colors.black}
              />
            </TouchableOpacity>
            <Text style={{ ...Fonts.SemiBold18black }}>
              {tr("Account Details")}
            </Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, padding: Default.fixPadding * 2 }}
          >
            {/* Provider Info */}
            <View
              style={{
                backgroundColor: Colors.white,
                borderRadius: 10,
                padding: Default.fixPadding * 2,
                marginBottom: Default.fixPadding * 2,
                alignItems: "center",
                ...Default.shadow,
              }}
            >
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: Colors.extraLightGrey,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: Default.fixPadding,
                  overflow: "hidden"
                }}
              >
                <Image
                  source={getProviderLogo()}
                  style={{
                    width: ms(60),
                    height: ms(60),
                    resizeMode: "contain"
                  }}
                />
              </View>
              <Text style={{ ...Fonts.SemiBold18black }}>
                {providerName}
              </Text>
            </View>

            {/* Policy Input */}
            <View
              style={{
                backgroundColor: Colors.white,
                borderRadius: 10,
                padding: Default.fixPadding * 2,
                marginBottom: Default.fixPadding * 2,
                ...Default.shadow,
              }}
            >
              <Text style={{ ...Fonts.SemiBold14grey, marginBottom: Default.fixPadding }}>
                {tr("POLICY NUMBER")}
              </Text>
              <TextInput
                style={{
                  ...Fonts.Medium14black,
                  borderWidth: 1,
                  borderColor: policyError ? Colors.red : Colors.lightGrey,
                  borderRadius: 8,
                  padding: Default.fixPadding,
                  textAlign: isRtl ? "right" : "left",
                }}
                value={policyNumber}
                onChangeText={validatePolicy}
                placeholder="Enter policy number"
                placeholderTextColor={Colors.grey}
                keyboardType="numeric"
              />
              {policyError ? (
                <Text style={{ ...Fonts.Medium12red, marginTop: Default.fixPadding * 0.5 }}>
                  {policyError}
                </Text>
              ) : null}

              <Text style={{ ...Fonts.SemiBold14grey, marginTop: Default.fixPadding * 2, marginBottom: Default.fixPadding }}>
                {tr("DESCRIPTION (OPTIONAL)")}
              </Text>
              <TextInput
                style={{
                  ...Fonts.Medium14black,
                  borderWidth: 1,
                  borderColor: Colors.lightGrey,
                  borderRadius: 8,
                  padding: Default.fixPadding,
                  textAlign: isRtl ? "right" : "left",
                }}
                value={description}
                onChangeText={setDescription}
                placeholder="e.g. My Life Insurance"
                placeholderTextColor={Colors.grey}
              />

              <View
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: Default.fixPadding * 2,
                }}
              >
                <Text style={{ ...Fonts.SemiBold14black }}>
                  {tr("Save Policy")}
                </Text>
                <Switch
                  value={savePolicy}
                  onValueChange={setSavePolicy}
                  trackColor={{ false: Colors.lightGrey, true: Colors.primary + '50' }}
                  thumbColor={savePolicy ? Colors.primary : Colors.white}
                />
              </View>
            </View>
            
            {/* Info Card */}
            <View
              style={{
                backgroundColor: "#E3F2FD",
                borderRadius: 10,
                padding: Default.fixPadding * 1.5,
                marginBottom: Default.fixPadding * 2,
                flexDirection: isRtl ? "row-reverse" : "row",
              }}
            >
              <MaterialCommunityIcons
                name="information-outline"
                size={24}
                color="#1976D2"
                style={{
                  marginRight: isRtl ? 0 : Default.fixPadding,
                  marginLeft: isRtl ? Default.fixPadding : 0,
                }}
              />
              <Text style={{ ...Fonts.Medium14black, flex: 1 }}>
                {tr("Enter your policy number exactly as it appears on your insurance documents to ensure successful payment.")}
              </Text>
            </View>
          </ScrollView>

          {/* Continue Button */}
          <View
            style={{
              padding: Default.fixPadding * 2,
              backgroundColor: Colors.white,
              ...Default.shadow,
            }}
          >
            <TouchableOpacity
              onPress={handleContinue}
              disabled={!isValidPolicy}
              style={{
                backgroundColor: isValidPolicy ? Colors.primary : Colors.grey,
                borderRadius: 10,
                paddingVertical: Default.fixPadding * 1.5,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ ...Fonts.SemiBold16white }}>
                {tr("Continue")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PolicyDetailsScreen;
