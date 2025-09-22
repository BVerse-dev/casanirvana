import React, { useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ms } from "react-native-size-matters/extend";

const SelectPackageScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  
  // Get provider data from route params
  const { provider, providerName } = route.params || { provider: "mtn", providerName: "MTN Prepaid Topup" };

  // Safe translation function that ALWAYS returns a string
  function tr(key, fallback = "Missing Translation") {
    if (!key) return fallback || "";
    const translated = t(key);
    return translated || fallback;
  }

  // Package options
  const packageOptions = [
    {
      id: "fixed",
      title: "Fixed Amount",
      navigateTo: "amountScreen",
      params: { provider, providerName, packageType: "fixed" }
    },
    {
      id: "other",
      title: "Other Amount",
      navigateTo: "otherAmountScreen",
      params: { provider, providerName, packageType: "other" }
    }
  ];

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
            {tr("Select Package")}
          </Text>
        </View>

        {/* Package Options */}
        <View style={{ flex: 1 }}>
          {packageOptions.map((option, index) => (
            <TouchableOpacity
              key={option.id}
              onPress={() => navigation.navigate(option.navigateTo, option.params)}
              style={{
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
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SelectPackageScreen;
