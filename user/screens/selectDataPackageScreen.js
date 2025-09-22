import React, { useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StatusBar,
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

const SelectDataPackageScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  
  // Get provider data from route params
  const { provider, providerName, providerColor, providerLogo } = route.params || {};
  const [selectedPackage, setSelectedPackage] = useState(null);

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

  // Package options
  const packageOptions = [
    {
      id: "data",
      title: "Data",
      subtitle: "Regular internet browsing packages",
      icon: "wifi",
      color: Colors.green,
    },
    {
      id: "social",
      title: "Social Media",
      subtitle: "Bundles for social media apps",
      icon: "share",
      color: Colors.blue,
    },
    {
      id: "video",
      title: "Video",
      subtitle: "Streaming and video bundles",
      icon: "videocam",
      color: Colors.orange,
    }
  ];

  const handleContinue = () => {
    if (!selectedPackage) return;
    
    navigation.navigate("dataAmountScreen", { 
      provider, 
      providerName,
      providerColor,
      providerLogo,
      packageType: selectedPackage 
    });
  };

  const renderItem = ({ item }) => {
    const isSelected = selectedPackage === item.id;
    
    return (
      <TouchableOpacity
        onPress={() => setSelectedPackage(item.id)}
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
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: item.color + '15',
            justifyContent: "center",
            alignItems: "center",
            marginRight: isRtl ? 0 : Default.fixPadding,
            marginLeft: isRtl ? Default.fixPadding : 0,
          }}
        >
          <MaterialIcons
            name={item.icon}
            size={24}
            color={item.color}
          />
        </View>

        <View
          style={{
            flex: 1,
            alignItems: isRtl ? "flex-end" : "flex-start",
            marginHorizontal: Default.fixPadding,
          }}
        >
          <Text
            numberOfLines={1}
            style={{ ...Fonts.SemiBold16black, overflow: "hidden" }}
          >
            {item.title}
          </Text>
          <Text
            numberOfLines={1}
            style={{ ...Fonts.Medium14grey, overflow: "hidden", marginTop: 2 }}
          >
            {item.subtitle}
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
            {tr("Select Package")}
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
            {providerName || "Data Purchase"}
          </Text>
        </View>

        {/* Package Options */}
        <View style={{ padding: Default.fixPadding * 2, flex: 1 }}>
          <Text style={{ ...Fonts.SemiBold16black, marginBottom: Default.fixPadding * 1.5 }}>
            {tr("Choose Package Type")}
          </Text>

          {packageOptions.map((item) => (
            <React.Fragment key={item.id}>
              {renderItem({ item })}
            </React.Fragment>
          ))}
        </View>

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
            disabled={!selectedPackage}
            style={{
              backgroundColor: selectedPackage ? Colors.primary : Colors.grey,
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

export default SelectDataPackageScreen;
