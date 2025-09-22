import React, { useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ms } from "react-native-size-matters/extend";

const AmountScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  
  // Get provider data from route params
  const { provider, providerName, packageType } = route.params || {};

  // Safe translation function that ALWAYS returns a string
  function tr(key, fallback = "Missing Translation") {
    if (!key) return fallback || "";
    const translated = t(key);
    return translated || fallback;
  }

  // Amount options based on provider
  const amountOptions = [
    { id: "ultimate", title: "Ultimate", amount: "GHS 100.00" },
    { id: "elite", title: "Elite", amount: "GHS 50.00" },
    { id: "maximum", title: "Maximum Value", amount: "GHS 30.00" },
    { id: "supreme", title: "Supreme Value", amount: "GHS 20.00" },
    { id: "extra", title: "Extra Value", amount: "GHS 10.00" },
    { id: "value", title: "Value", amount: "GHS 5.00" },
    { id: "starter", title: "Starter", amount: "GHS 2.00" },
  ];

  const handleSelectAmount = (option) => {
    // Extract numeric value from amount string (e.g., "GHS 50.00" -> 50)
    const numericAmount = parseFloat(option.amount.replace(/[^0-9.]/g, ''));
    
    navigation.navigate("accountDetailsScreen", {
      provider,
      providerName,
      packageType,
      amountTitle: option.title,
      amount: numericAmount,
      amountFormatted: option.amount
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

        {/* Amount Options */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: Default.fixPadding * 2 }}
        >
          {amountOptions.map((option, index) => (
            <TouchableOpacity
              key={option.id}
              onPress={() => handleSelectAmount(option)}
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: Default.fixPadding * 2,
                paddingHorizontal: Default.fixPadding * 2,
                borderBottomWidth: 1,
                borderBottomColor: Colors.lightGrey,
                backgroundColor: Colors.white,
              }}
            >
              <Text style={{ ...Fonts.SemiBold16black }}>
                {option.title}
              </Text>
              <Text style={{ ...Fonts.SemiBold16primary }}>
                {option.amount}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default AmountScreen;
