import React, { useState, useRef } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Switch,
  Image,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  BackHandler,
  Alert,
} from "react-native";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { ms } from "react-native-size-matters/extend";
import MyStatusBar from "../components/myStatusBar";

const AccountDetailsScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const [phoneNumber, setPhoneNumber] = useState("");
  const [description, setDescription] = useState("");
  const [saveAccount, setSaveAccount] = useState(true);
  
  // Get data from route params
  const { 
    provider, 
    providerName, 
    providerColor,
    providerLogo,
    packageType, 
    amountTitle, 
    amount, 
    amountFormatted 
  } = route.params || {};

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
    if (!phoneNumber || phoneNumber.length < 9) {
      // Show error or alert
      return;
    }
    
    // Navigate to payment method selection
    navigation.navigate("paymentMethodScreen", {
      provider,
      providerName,
      providerColor,
      providerLogo,
      packageType,
      amountTitle,
      amount,
      amountFormatted,
      phoneNumber,
      description,
      saveAccount,
      transactionType: 'airtime',
      recipientInfo: {
        phoneNumber,
        name: description || phoneNumber,
        provider: providerName,
        logo: providerLogo
      }
    });
  };

  const handleContactPicker = () => {
    // Just show an alert for now since we don't have actual contact picker implementation
    Alert.alert(
      tr("Contact Access"),
      tr("Contact picker functionality will be implemented in a future update."),
      [{ text: tr("OK") }]
    );
  };

  const isValidPhoneNumber = phoneNumber && phoneNumber.length >= 9;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.extraLightGrey }}>
      <MyStatusBar />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : null}
        style={{ flex: 1 }}
      >
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
            {tr("Account Details")}
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: Default.fixPadding * 10 }}
        >
          {/* Provider & Amount Info */}
          <View style={{ 
            backgroundColor: Colors.white, 
            padding: Default.fixPadding * 2,
            marginBottom: Default.fixPadding,
            ...Default.shadow,
          }}>
            <View style={{ 
              flexDirection: isRtl ? "row-reverse" : "row",
              alignItems: "center",
              marginBottom: Default.fixPadding * 2,
            }}>
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
              <View>
                <Text style={{ ...Fonts.SemiBold16black }}>
                  {providerName || "Airtime Purchase"}
                </Text>
                <Text style={{ ...Fonts.Medium14primary, marginTop: 2 }}>
                  {amountFormatted || `GHS ${amount?.toFixed(2) || '0.00'}`}
                </Text>
              </View>
            </View>

            <View style={{
              height: 1,
              backgroundColor: Colors.lightGrey,
              marginVertical: Default.fixPadding,
            }} />

            <View style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <Text style={{ ...Fonts.Medium14grey }}>
                {tr("Package")}
              </Text>
              <Text style={{ ...Fonts.SemiBold14black }}>
                {amountTitle || "Airtime"}
              </Text>
            </View>
          </View>

          {/* Phone Number Input */}
          <View style={{ 
            backgroundColor: Colors.white, 
            padding: Default.fixPadding * 2,
            marginBottom: Default.fixPadding,
            ...Default.shadow,
          }}>
            <Text style={{ ...Fonts.SemiBold14grey, marginBottom: Default.fixPadding }}>
              {tr("PHONE NUMBER")}
            </Text>
            <View
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: Colors.lightGrey,
                borderRadius: 8,
                paddingHorizontal: Default.fixPadding,
                marginBottom: Default.fixPadding * 2,
              }}
            >
              <TextInput
                style={{
                  flex: 1,
                  ...Fonts.Medium16black,
                  textAlign: isRtl ? "right" : "left",
                  padding: Default.fixPadding,
                }}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                placeholder={tr("Phone number")}
                placeholderTextColor={Colors.grey}
              />
              <TouchableOpacity onPress={handleContactPicker}>
                <MaterialCommunityIcons
                  name="contacts"
                  size={24}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            </View>

            {/* Description Input */}
            <Text style={{ ...Fonts.SemiBold14grey, marginBottom: Default.fixPadding }}>
              {tr("DESCRIPTION")}
            </Text>
            <TextInput
              style={{
                ...Fonts.Medium16black,
                textAlign: isRtl ? "right" : "left",
                padding: Default.fixPadding,
                borderWidth: 1,
                borderColor: Colors.lightGrey,
                borderRadius: 8,
                marginBottom: Default.fixPadding * 2,
              }}
              value={description}
              onChangeText={setDescription}
              placeholder={tr("Description (e.g. My mum)")}
              placeholderTextColor={Colors.grey}
            />

            {/* Save Account Toggle */}
            <View
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View>
                <Text style={{ ...Fonts.SemiBold16black }}>
                  {tr("Save Account")}
                </Text>
                <Text style={{ ...Fonts.Medium14grey, marginTop: 2 }}>
                  {tr("Save this account for future transactions")}
                </Text>
              </View>
              <Switch
                value={saveAccount}
                onValueChange={setSaveAccount}
                trackColor={{ false: Colors.lightGrey, true: Colors.primary + '50' }}
                thumbColor={saveAccount ? Colors.primary : Colors.white}
                ios_backgroundColor={Colors.lightGrey}
              />
            </View>
          </View>

          {/* Info Card */}
          <View style={{ 
            backgroundColor: Colors.lightLinkWater,
            margin: Default.fixPadding * 2,
            padding: Default.fixPadding * 1.5,
            borderRadius: 8,
            flexDirection: isRtl ? "row-reverse" : "row",
          }}>
            <MaterialIcons
              name="info-outline"
              size={20}
              color={Colors.blue}
              style={{ 
                marginRight: isRtl ? 0 : Default.fixPadding,
                marginLeft: isRtl ? Default.fixPadding : 0,
                marginTop: 2,
              }}
            />
            <Text style={{ ...Fonts.Medium14black, flex: 1 }}>
              {tr("Enter the phone number you want to top up. You can save this account for future transactions.")}
            </Text>
          </View>
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
            disabled={!isValidPhoneNumber}
            style={{
              backgroundColor: isValidPhoneNumber ? Colors.primary : Colors.grey,
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AccountDetailsScreen;