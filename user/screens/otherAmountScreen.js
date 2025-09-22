import React, { useState, useRef } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Keyboard,
  StyleSheet,
  SafeAreaView,
  BackHandler,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { ms } from "react-native-size-matters/extend";
import MyStatusBar from "../components/myStatusBar";

const OtherAmountScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const [amount, setAmount] = useState("");
  const inputRef = useRef(null);
  
  // Get provider data from route params
  const { provider, providerName, providerColor, providerLogo, packageType } = route.params || {};

  // Safe translation function that ALWAYS returns a string
  function tr(key, fallback = "Missing Translation") {
    if (!key) return fallback || "";
    const translated = t(key);
    return translated || fallback;
  }

  // Handle back button
  React.useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };
    
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [navigation]);

  // Focus input on component mount
  React.useEffect(() => {
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  }, []);

  const handleContinue = () => {
    if (!amount || parseFloat(amount) <= 0) {
      // Show error or alert
      return;
    }
    
    const numericAmount = parseFloat(amount);
    
    navigation.navigate("accountDetailsScreen", {
      provider,
      providerName,
      providerColor,
      providerLogo,
      packageType,
      amountTitle: "Custom Amount",
      amount: numericAmount,
      amountFormatted: `GHS ${numericAmount.toFixed(2)}`
    });
  };

  const isValidAmount = amount && parseFloat(amount) > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.extraLightGrey }}>
      <MyStatusBar />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : null}
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
                name={isRtl ? "chevron-forward" : "chevron-back"}
                size={25}
                color={Colors.black}
              />
            </TouchableOpacity>
            <Text style={{ ...Fonts.SemiBold18black }}>
              {tr("Enter Amount")}
            </Text>
          </View>

          {/* Provider Info */}
          <View
            style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              alignItems: "center",
              padding: Default.fixPadding * 2,
              backgroundColor: Colors.white,
              marginBottom: Default.fixPadding,
              ...Default.shadow,
            }}
          >
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: providerColor ? providerColor + '15' : Colors.blue + '15',
                justifyContent: "center",
                alignItems: "center",
                marginRight: isRtl ? 0 : Default.fixPadding * 1.5,
                marginLeft: isRtl ? Default.fixPadding * 1.5 : 0,
              }}
            >
              <Image
                source={providerLogo || require("../assets/images/pay1.png")}
                style={{
                  width: ms(30),
                  height: ms(30),
                  resizeMode: "contain",
                }}
              />
            </View>
            <Text style={{ ...Fonts.SemiBold16black }}>
              {providerName || "Airtime Purchase"}
            </Text>
          </View>

          {/* Amount Input */}
          <View style={{ 
            backgroundColor: Colors.white, 
            margin: Default.fixPadding * 2,
            borderRadius: 10,
            padding: Default.fixPadding * 2,
            ...Default.shadow,
          }}>
            <Text style={{ ...Fonts.SemiBold14grey, marginBottom: Default.fixPadding }}>
              {tr("ENTER AMOUNT")}
            </Text>
            
            <View
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                alignItems: "center",
                borderBottomWidth: 1,
                borderBottomColor: Colors.lightGrey,
                paddingBottom: Default.fixPadding,
                marginBottom: Default.fixPadding * 2,
              }}
            >
              <Text style={{ ...Fonts.Bold20black, marginRight: Default.fixPadding }}>
                GHS
              </Text>
              <TextInput
                ref={inputRef}
                style={{
                  flex: 1,
                  ...Fonts.Bold20black,
                  textAlign: isRtl ? "right" : "left",
                  padding: Default.fixPadding,
                }}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={Colors.grey}
              />
            </View>

            <View style={{ 
              backgroundColor: Colors.lightLinkWater,
              padding: Default.fixPadding * 1.5,
              borderRadius: 8,
              marginTop: Default.fixPadding
            }}>
              <Text style={{ ...Fonts.Medium14black }}>
                {tr("Enter any amount between GHS 1.00 and GHS 1,000.00")}
              </Text>
            </View>
          </View>

          {/* Continue Button */}
          <View
            style={{
              padding: Default.fixPadding * 2,
              backgroundColor: Colors.white,
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              ...Default.shadow,
            }}
          >
            <TouchableOpacity
              onPress={handleContinue}
              disabled={!isValidAmount}
              style={{
                backgroundColor: isValidAmount ? Colors.primary : Colors.grey,
                borderRadius: 10,
                paddingVertical: Default.fixPadding * 1.5,
                alignItems: "center",
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

export default OtherAmountScreen;