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
} from "react-native";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { ms } from "react-native-size-matters/extend";

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

  // Get provider logo based on provider ID
  const getProviderLogo = () => {
    switch (provider) {
      case 'mtn':
        return require("../assets/images/pay1.png");
      case 'telecel':
        return require("../assets/images/pay2.png");
      case 'airtel':
        return require("../assets/images/pay3.png");
      default:
        return require("../assets/images/pay1.png");
    }
  };

  const handleContinue = () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      // Show error or alert
      return;
    }
    
    // Navigate to payment method selection
    navigation.navigate("paymentMethodScreen", {
      provider,
      providerName,
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
        logo: getProviderLogo()
      }
    });
  };

  const handleContactPicker = () => {
    // Implement contact picker functionality
    // For now, just a placeholder
    console.log("Open contact picker");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white }}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />
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
            {tr("Account Details")}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.setParams({ editMode: true })}
            style={{
              marginLeft: isRtl ? 0 : "auto",
              marginRight: isRtl ? "auto" : 0,
            }}
          >
            <Text style={{ ...Fonts.SemiBold16white }}>
              {tr("EDIT")}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {/* Provider Info */}
          <View style={{ alignItems: "center", padding: Default.fixPadding * 2 }}>
            <Image
              source={getProviderLogo()}
              style={{ width: ms(80), height: ms(80), resizeMode: "contain" }}
            />
            <Text style={{ ...Fonts.SemiBold18black, marginTop: Default.fixPadding }}>
              {providerName}
            </Text>
          </View>

          {/* Phone Number Input */}
          <View style={{ padding: Default.fixPadding * 2 }}>
            <Text style={{ ...Fonts.SemiBold14lightGrey, marginBottom: Default.fixPadding * 0.5 }}>
              {tr("PHONE NUMBER")}
            </Text>
            <View
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                alignItems: "center",
                borderBottomWidth: 1,
                borderBottomColor: Colors.lightGrey,
                paddingBottom: Default.fixPadding * 0.5,
              }}
            >
              <TextInput
                style={{
                  flex: 1,
                  ...Fonts.SemiBold16black,
                  textAlign: isRtl ? "right" : "left",
                  padding: Default.fixPadding * 0.5,
                }}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                placeholder={tr("Enter phone number to topup")}
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
            <Text style={{ 
              ...Fonts.SemiBold14lightGrey, 
              marginBottom: Default.fixPadding * 0.5,
              marginTop: Default.fixPadding * 2 
            }}>
              {tr("DESCRIPTION")}
            </Text>
            <TextInput
              style={{
                ...Fonts.SemiBold16black,
                textAlign: isRtl ? "right" : "left",
                padding: Default.fixPadding * 0.5,
                borderBottomWidth: 1,
                borderBottomColor: Colors.lightGrey,
                paddingBottom: Default.fixPadding * 0.5,
              }}
              value={description}
              onChangeText={setDescription}
              placeholder={tr("Enter account description (e.g My mum)")}
              placeholderTextColor={Colors.grey}
            />

            {/* Save Account Toggle */}
            <View
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: Default.fixPadding * 2,
              }}
            >
              <Text style={{ ...Fonts.SemiBold16black }}>
                {tr("Save")}
              </Text>
              <Switch
                value={saveAccount}
                onValueChange={setSaveAccount}
                trackColor={{ false: Colors.lightGrey, true: Colors.primaryLight }}
                thumbColor={saveAccount ? Colors.primary : Colors.white}
                ios_backgroundColor={Colors.lightGrey}
              />
            </View>
          </View>
        </ScrollView>

        {/* Next Button */}
        <TouchableOpacity
          onPress={handleContinue}
          style={{
            backgroundColor: Colors.green,
            paddingVertical: Default.fixPadding * 1.5,
            alignItems: "center",
            margin: Default.fixPadding * 2,
            borderRadius: 5,
          }}
        >
          <Text style={{ ...Fonts.SemiBold16white }}>
            {phoneNumber ? tr("NEXT") : tr("DONE")}
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AccountDetailsScreen;
