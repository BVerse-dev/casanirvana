import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Image,
  ScrollView,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ms } from "react-native-size-matters/extend";
import MyStatusBar from "../components/myStatusBar";

const InsuranceScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  // Safe translation function that ALWAYS returns a string
  function tr(key, fallback = "Missing Translation") {
    if (!key) return fallback || "";
    const translated = t(key);
    return translated || fallback;
  }

  const insuranceProviders = [
    {
      id: "enterprise_life",
      title: "Enterprise Life",
      logo: require("../assets/images/pay1.png"),
      screen: "policyDetailsScreen",
      params: { provider: "enterprise_life", providerName: "Enterprise Life" }
    },
    {
      id: "akwantupa",
      title: "AkwantuPa",
      logo: require("../assets/images/pay2.png"),
      screen: "policyDetailsScreen",
      params: { provider: "akwantupa", providerName: "AkwantuPa" }
    },
    {
      id: "hollard_life",
      title: "Hollard Life",
      logo: require("../assets/images/pay3.png"),
      screen: "policyDetailsScreen",
      params: { provider: "hollard_life", providerName: "Hollard Life" }
    },
    {
      id: "metropolitan_life",
      title: "Metropolitan Life Insurance",
      logo: require("../assets/images/pay4.png"),
      screen: "policyDetailsScreen",
      params: { provider: "metropolitan_life", providerName: "Metropolitan Life Insurance" }
    },
    {
      id: "old_mutual",
      title: "Old Mutual",
      logo: require("../assets/images/pay5.png"),
      screen: "policyDetailsScreen",
      params: { provider: "old_mutual", providerName: "Old Mutual" }
    }
  ];

  const handleProviderSelect = (item) => {
    navigation.navigate(item.screen, item.params);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.extraLightGrey }}>
      <MyStatusBar />
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
            {tr("INSURANCE")}
          </Text>
        </View>

        {/* Main Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: Default.fixPadding * 2 }}
        >
          {insuranceProviders.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleProviderSelect(item)}
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                alignItems: "center",
                backgroundColor: Colors.white,
                borderRadius: 10,
                padding: Default.fixPadding * 1.5,
                marginBottom: Default.fixPadding * 2,
                ...Default.shadow,
              }}
            >
              <View style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: Colors.extraLightGrey,
                justifyContent: "center",
                alignItems: "center",
                marginRight: isRtl ? 0 : Default.fixPadding * 1.5,
                marginLeft: isRtl ? Default.fixPadding * 1.5 : 0,
                overflow: "hidden"
              }}>
                <Image
                  source={item.logo}
                  style={{
                    width: ms(40),
                    height: ms(40),
                    resizeMode: "contain"
                  }}
                />
              </View>
              <Text style={{ 
                ...Fonts.SemiBold16black,
                flex: 1,
              }}>
                {tr(item.title)}
              </Text>
              <Ionicons
                name={isRtl ? "chevron-back-outline" : "chevron-forward-outline"}
                size={24}
                color={Colors.grey}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default InsuranceScreen;
