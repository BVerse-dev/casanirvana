import React, { useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  BackHandler,
  Image,
} from "react-native";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { ms } from "react-native-size-matters/extend";
import MyStatusBar from "../components/myStatusBar";

const AmountScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  
  // Get provider data from route params
  const { provider, providerId, providerName, providerColor, providerLogo, packageType } = route.params || {};
  const [selectedAmount, setSelectedAmount] = useState(null);

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

  // Amount options based on provider
  const amountOptions = [
    { id: "ultimate", title: "Ultimate", amount: 100.00, description: "Ultimate package with bonus data" },
    { id: "elite", title: "Elite", amount: 50.00, description: "Elite package with extra talk time" },
    { id: "maximum", title: "Maximum Value", amount: 30.00, description: "Maximum value for your money" },
    { id: "supreme", title: "Supreme Value", amount: 20.00, description: "Great value with bonus minutes" },
    { id: "extra", title: "Extra Value", amount: 10.00, description: "Extra value for daily use" },
    { id: "value", title: "Value", amount: 5.00, description: "Basic value package" },
    { id: "starter", title: "Starter", amount: 2.00, description: "Small amount for quick top-up" },
  ];

  const handleContinue = () => {
    if (!selectedAmount) return;
    
    const option = amountOptions.find(item => item.id === selectedAmount);
    
    navigation.navigate("accountDetailsScreen", {
      provider,
      providerId,
      providerName,
      providerColor,
      providerLogo,
      packageType,
      amountTitle: option.title,
      amount: option.amount,
      amountFormatted: `GHS ${option.amount.toFixed(2)}`
    });
  };

  const renderItem = ({ item }) => {
    const isSelected = selectedAmount === item.id;
    
    return (
      <TouchableOpacity
        onPress={() => setSelectedAmount(item.id)}
        style={{
          flexDirection: isRtl ? "row-reverse" : "row",
          alignItems: "center",
          paddingVertical: Default.fixPadding * 1.5,
          paddingHorizontal: Default.fixPadding * 2,
          backgroundColor: Colors.white,
          marginBottom: Default.fixPadding,
          borderRadius: 10,
          ...Default.shadow,
          borderWidth: isSelected ? 2 : 0,
          borderColor: isSelected ? Colors.primary : "transparent",
        }}
      >
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: isRtl ? "row-reverse" : "row", alignItems: "center" }}>
            <Text
              style={{ ...Fonts.SemiBold16black }}
            >
              {item.title}
            </Text>
            <View
              style={{
                backgroundColor: Colors.lightLinkWater,
                paddingHorizontal: Default.fixPadding * 0.8,
                paddingVertical: Default.fixPadding * 0.3,
                borderRadius: 4,
                marginLeft: isRtl ? 0 : Default.fixPadding,
                marginRight: isRtl ? Default.fixPadding : 0,
              }}
            >
              <Text style={{ ...Fonts.Medium12primary }}>
                {`GHS ${item.amount.toFixed(2)}`}
              </Text>
            </View>
          </View>
          
          <Text
            numberOfLines={1}
            style={{ ...Fonts.Medium14grey, marginTop: Default.fixPadding * 0.5 }}
          >
            {item.description}
          </Text>
        </View>

        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: isSelected ? Colors.primary : Colors.grey,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {isSelected && (
            <View
              style={{
                width: 14,
                height: 14,
                borderRadius: 7,
                backgroundColor: Colors.primary,
              }}
            />
          )}
        </View>
      </TouchableOpacity>
    );
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
            {tr("Select Amount")}
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

        {/* Amount Options */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: Default.fixPadding * 2, paddingBottom: Default.fixPadding * 10 }}
        >
          <Text style={{ ...Fonts.SemiBold16black, marginBottom: Default.fixPadding * 1.5 }}>
            {tr("Choose Amount")}
          </Text>

          {amountOptions.map((item) => (
            <React.Fragment key={item.id}>
              {renderItem({ item })}
            </React.Fragment>
          ))}
        </ScrollView>

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
            disabled={!selectedAmount}
            style={{
              backgroundColor: selectedAmount ? Colors.primary : Colors.grey,
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
    </SafeAreaView>
  );
};

export default AmountScreen;
