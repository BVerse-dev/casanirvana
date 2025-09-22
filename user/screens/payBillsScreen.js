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
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { ms } from "react-native-size-matters/extend";
import MyStatusBar from "../components/myStatusBar";

const PayBillsScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  // Safe translation function that ALWAYS returns a string
  function tr(key, fallback = "Missing Translation") {
    if (!key) return fallback || "";
    const translated = t(key);
    return translated || fallback;
  }

  const categories = [
    {
      id: "utilities",
      title: "Utilities",
      icon: "flash-outline",
      description: "Pay electricity, water & waste management bills",
      screen: "utilitiesScreen",
    },
    {
      id: "tv",
      title: "TV/Entertainment",
      icon: "tv-outline",
      description: "Pay TV subscriptions and streaming services",
      screen: "tvScreen",
    },
  ];

  const handleCategorySelect = (item) => {
    navigation.navigate(item.screen);
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
            {tr("Pay Bills")}
          </Text>
        </View>

        {/* Main Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: Default.fixPadding * 2 }}
        >
          {/* Categories */}
          {categories.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleCategorySelect(item)}
              style={{
                backgroundColor: Colors.white,
                borderRadius: 10,
                padding: Default.fixPadding * 2,
                marginBottom: Default.fixPadding * 2,
                ...Default.shadow,
              }}
            >
              <View style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                alignItems: "center",
              }}>
                <View style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: item.id === "utilities" ? "#E3F2FD" : "#FFF3E0",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: isRtl ? 0 : Default.fixPadding * 2,
                  marginLeft: isRtl ? Default.fixPadding * 2 : 0,
                }}>
                  <Ionicons
                    name={item.icon}
                    size={30}
                    color={item.id === "utilities" ? "#1976D2" : "#FF9800"}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ ...Fonts.SemiBold16black }}>
                    {tr(item.title)}
                  </Text>
                  <Text style={{ ...Fonts.Medium14grey, marginTop: Default.fixPadding * 0.5 }}>
                    {tr(item.description)}
                  </Text>
                </View>
                <Ionicons
                  name={isRtl ? "chevron-back-outline" : "chevron-forward-outline"}
                  size={24}
                  color={Colors.grey}
                />
              </View>
            </TouchableOpacity>
          ))}

          {/* Recent Payments */}
          <View style={{ marginTop: Default.fixPadding }}>
            <Text style={{ ...Fonts.SemiBold16black, marginBottom: Default.fixPadding * 1.5 }}>
              {tr("Recent Payments")}
            </Text>
            
            <View style={{
              backgroundColor: Colors.white,
              borderRadius: 10,
              padding: Default.fixPadding * 2,
              ...Default.shadow,
            }}>
              <Text style={{ ...Fonts.Medium14grey, textAlign: "center" }}>
                {tr("No recent bill payments")}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default PayBillsScreen;
