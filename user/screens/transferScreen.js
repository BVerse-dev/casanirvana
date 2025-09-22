import React, { useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  SafeAreaView,
  BackHandler,
  useWindowDimensions,
} from "react-native";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { ms } from "react-native-size-matters/extend";
import MyStatusBar from "../components/myStatusBar";

const TransferScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const { width } = useWindowDimensions();
  const [selectedProvider, setSelectedProvider] = useState(null);

  // Transfer providers data
  const providers = [
    {
      id: "mtn",
      name: "MTN Mobile Money",
      subtitle: "Send money to MTN users",
      logo: require("../assets/images/pay1.png"),
      icon: "cash",
      color: "#FFB900",
    },
    {
      id: "telecel",
      name: "Telecel Cash",
      subtitle: "Send money to Telecel users",
      logo: require("../assets/images/pay2.png"),
      icon: "cash",
      color: "#E60000",
    },
    {
      id: "airtel",
      name: "AirtelTigo Money",
      subtitle: "Send money to AirtelTigo users",
      logo: require("../assets/images/pay3.png"),
      icon: "cash",
      color: "#0057B8",
    },
    {
      id: "bank",
      name: "Bank Transfer",
      subtitle: "Send money to any bank account",
      logo: require("../assets/images/pay4.png"),
      icon: "bank",
      color: "#00A651",
    }
  ];

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

  const handleContinue = () => {
    if (selectedProvider) {
      navigation.navigate("transferRecipientScreen", {
        provider: selectedProvider.id,
        providerName: selectedProvider.name,
        providerColor: selectedProvider.color,
        providerLogo: selectedProvider.logo
      });
    }
  };

  const renderItem = ({ item }) => {
    const isSelected = selectedProvider && selectedProvider.id === item.id;
    
    return (
      <TouchableOpacity
        onPress={() => setSelectedProvider(item)}
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
          <Image
            source={item.logo}
            style={{
              width: ms(30),
              height: ms(30),
              resizeMode: "contain",
            }}
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
            {item.name}
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
            {tr("Send Money")}
          </Text>
        </View>

        {/* Provider Selection */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            padding: Default.fixPadding * 2,
          }}
        >
          <Text style={{ ...Fonts.SemiBold16black, marginBottom: Default.fixPadding * 1.5 }}>
            {tr("Select Provider")}
          </Text>

          {providers.map((item) => (
            <React.Fragment key={item.id}>
              {renderItem({ item })}
            </React.Fragment>
          ))}

          {/* Instructions */}
          <View
            style={{
              backgroundColor: Colors.lightLinkWater,
              borderRadius: 10,
              padding: Default.fixPadding * 1.5,
              marginTop: Default.fixPadding * 2,
            }}
          >
            <Text style={{ ...Fonts.Medium14black }}>
              {tr("Select your preferred money transfer service provider. You can send money to mobile wallets or bank accounts.")}
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
            disabled={!selectedProvider}
            style={{
              backgroundColor: selectedProvider ? Colors.primary : Colors.grey,
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

export default TransferScreen;
