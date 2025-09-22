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
} from "react-native";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ms } from "react-native-size-matters/extend";

const OtherAmountScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const [amount, setAmount] = useState("");
  const inputRef = useRef(null);
  
  // Get provider data from route params
  const { provider, providerName, packageType } = route.params || {};

  // Safe translation function that ALWAYS returns a string
  function tr(key, fallback = "Missing Translation") {
    if (!key) return fallback || "";
    const translated = t(key);
    return translated || fallback;
  }

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
      packageType,
      amountTitle: "Other Amount",
      amount: numericAmount,
      amountFormatted: `GHS ${numericAmount.toFixed(2)}`
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white }}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            alignItems: "center",
            paddingVertical: Default.fixPadding * 1.2,
            paddingHorizontal: Default.fixPadding * 2,
            backgroundColor: Colors.primary,
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
              color={Colors.white}
            />
          </TouchableOpacity>
          <Text style={{ ...Fonts.SemiBold18white }}>
            {tr("Amount")}
          </Text>
        </View>

        {/* Amount Input */}
        <View style={{ flex: 1, padding: Default.fixPadding * 2 }}>
          <View
            style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              alignItems: "center",
              borderBottomWidth: 1,
              borderBottomColor: Colors.grey,
              paddingBottom: Default.fixPadding,
              marginBottom: Default.fixPadding * 2,
            }}
          >
            <Text style={{ ...Fonts.Bold24black, marginRight: Default.fixPadding }}>
              GHS
            </Text>
            <TextInput
              ref={inputRef}
              style={{
                flex: 1,
                ...Fonts.Bold24black,
                textAlign: isRtl ? "right" : "left",
                padding: 0,
              }}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={Colors.grey}
            />
          </View>

          <View style={{ marginTop: Default.fixPadding * 2 }}>
            <Text style={{ ...Fonts.SemiBold14grey, marginBottom: Default.fixPadding }}>
              {tr("PACKAGE")}
            </Text>
            <Text style={{ ...Fonts.SemiBold16primary }}>
              {tr("Other Amount")}
            </Text>
          </View>
          
          {/* Next Button */}
          <TouchableOpacity
            onPress={handleContinue}
            style={{
              backgroundColor: Colors.green,
              borderRadius: 5,
              paddingVertical: Default.fixPadding * 1.5,
              alignItems: "center",
              position: "absolute",
              bottom: Default.fixPadding * 2,
              left: Default.fixPadding * 2,
              right: Default.fixPadding * 2,
            }}
          >
            <Text style={{ ...Fonts.SemiBold16white }}>
              {tr("NEXT")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OtherAmountScreen;
