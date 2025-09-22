import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ms } from "react-native-size-matters/extend";

const AirtimeScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  // Network providers data
  const providers = [
    {
      id: "mtn",
      name: "MTN Prepaid Topup",
      logo: require("../assets/images/pay1.png"),
      navigateTo: "selectPackageScreen",
      params: { provider: "mtn", providerName: "MTN Prepaid Topup" }
    },
    {
      id: "telecel",
      name: "Telecel Prepaid Topup",
      logo: require("../assets/images/pay2.png"),
      navigateTo: "selectPackageScreen",
      params: { provider: "telecel", providerName: "Telecel Prepaid Topup" }
    },
    {
      id: "airtel",
      name: "AirtelTigo Prepaid Topup",
      logo: require("../assets/images/pay3.png"),
      navigateTo: "selectPackageScreen",
      params: { provider: "airtel", providerName: "AirtelTigo Prepaid Topup" }
    }
  ];

  // Safe translation function that ALWAYS returns a string
  function tr(key, fallback = "Missing Translation") {
    if (!key) return fallback || "";
    const translated = t(key);
    return translated || fallback;
  }

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
            {tr("Airtime")}
          </Text>
        </View>

        {/* Provider List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: Default.fixPadding * 2 }}
        >
          {providers.map((provider, index) => (
            <TouchableOpacity
              key={provider.id}
              onPress={() => navigation.navigate(provider.navigateTo, provider.params)}
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                alignItems: "center",
                paddingVertical: Default.fixPadding * 1.5,
                paddingHorizontal: Default.fixPadding * 2,
                borderBottomWidth: 1,
                borderBottomColor: Colors.lightGrey,
                backgroundColor: Colors.white,
              }}
            >
              <View
                style={{
                  width: ms(40),
                  height: ms(40),
                  borderRadius: ms(20),
                  justifyContent: "center",
                  alignItems: "center",
                  overflow: "hidden",
                  marginRight: isRtl ? 0 : Default.fixPadding * 1.5,
                  marginLeft: isRtl ? Default.fixPadding * 1.5 : 0,
                }}
              >
                <Image
                  source={provider.logo}
                  style={{
                    width: ms(40),
                    height: ms(40),
                    resizeMode: "contain",
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ ...Fonts.SemiBold16black }}>
                  {provider.name}
                </Text>
              </View>
              <Ionicons
                name={isRtl ? "chevron-back" : "chevron-forward"}
                size={20}
                color={Colors.grey}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default AirtimeScreen;
