import React, { useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Image,
  StyleSheet,
  SafeAreaView,
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
import { format } from "date-fns";

const TransferReviewScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  
  // Get data from route params
  const { 
    provider, 
    providerName, 
    providerColor,
    providerLogo,
    phoneNumber,
    description,
    saveRecipient,
    amount,
    amountFormatted,
    reference,
    schedulePayment,
    frequency,
    firstPaymentNow,
    recipientInfo,
    transactionType
  } = route.params || {};

  // Calculate platform fee (1% of amount)
  const platformFee = amount * 0.01;
  const totalAmount = amount + platformFee;
  const totalAmountFormatted = `GHS ${totalAmount.toFixed(2)}`;
  const platformFeeFormatted = `GHS ${platformFee.toFixed(2)}`;

  // Format dates
  const today = new Date();
  const formattedDate = format(today, "MMM dd");
  
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
    // Navigate to payment method selection
    navigation.navigate("paymentMethodScreen", {
      provider,
      providerName,
      providerColor,
      providerLogo,
      phoneNumber,
      description,
      amount,
      amountFormatted,
      reference,
      schedulePayment,
      frequency,
      firstPaymentNow,
      platformFee,
      totalAmount,
      recipientInfo,
      transactionType,
      isPersonalHubTransaction: true
    });
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
            {tr("Review & Send")}
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, padding: Default.fixPadding * 2 }}
        >
          {/* Amount Card */}
          <View style={{ 
            backgroundColor: Colors.darkBlue, 
            borderRadius: 10,
            padding: Default.fixPadding * 2,
            marginBottom: Default.fixPadding * 2,
            ...Default.shadow,
          }}>
            {/* Amount */}
            <Text style={{ 
              ...Fonts.Bold36white, 
              textAlign: "center",
              marginBottom: Default.fixPadding,
            }}>
              {amountFormatted || `GHS ${amount.toFixed(2)}`}
            </Text>
            <Text style={{ 
              ...Fonts.Medium14lightGrey, 
              textAlign: "center",
              marginBottom: Default.fixPadding * 2,
            }}>
              {tr("RECIPIENT GETS")}
            </Text>

            {/* Recipient Info */}
            <View style={{ 
              marginBottom: Default.fixPadding * 2,
            }}>
              <Text style={{ 
                ...Fonts.Medium14lightGrey, 
                marginBottom: Default.fixPadding,
              }}>
                {tr("RECIPIENT")}
              </Text>
              <View style={{ 
                flexDirection: isRtl ? "row-reverse" : "row",
                alignItems: "center",
              }}>
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
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
                <View style={{ flex: 1 }}>
                  <Text style={{ ...Fonts.SemiBold16white }}>
                    {phoneNumber || ""}
                  </Text>
                  <Text style={{ ...Fonts.Medium14lightGrey }}>
                    {description || ""}
                  </Text>
                  <Text style={{ ...Fonts.Medium14white }}>
                    {providerName || "Mobile Money"}
                  </Text>
                </View>
                <TouchableOpacity>
                  <MaterialCommunityIcons
                    name="star-outline"
                    size={24}
                    color={Colors.orange}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Schedule Info */}
            {schedulePayment && (
              <View style={{ 
                marginBottom: Default.fixPadding * 2,
              }}>
                <Text style={{ 
                  ...Fonts.Medium14lightGrey, 
                  marginBottom: Default.fixPadding,
                }}>
                  {tr("SCHEDULE")}
                </Text>
                <View style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  alignItems: "center",
                }}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: Colors.orange,
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: isRtl ? 0 : Default.fixPadding,
                      marginLeft: isRtl ? Default.fixPadding : 0,
                    }}
                  >
                    <Text style={{ ...Fonts.Bold16white }}>
                      {formattedDate.split(" ")[1]}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ ...Fonts.SemiBold16white }}>
                      {tr("Recurring")} {frequency}
                    </Text>
                    <Text style={{ ...Fonts.Medium14lightGrey }}>
                      {tr("Pay Now")}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Payment Method */}
            <View style={{ 
              marginBottom: Default.fixPadding * 2,
            }}>
              <Text style={{ 
                ...Fonts.Medium14lightGrey, 
                marginBottom: Default.fixPadding,
              }}>
                {tr("PAY WITH")}
              </Text>
              <TouchableOpacity
                onPress={handleContinue}
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ ...Fonts.SemiBold16white }}>
                  {tr("Select payment method")}
                </Text>
                <Text style={{ ...Fonts.Medium14lightBlue }}>
                  {tr("Change")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Payment Details Card */}
          <View style={{ 
            backgroundColor: Colors.darkBlue, 
            borderRadius: 10,
            padding: Default.fixPadding * 2,
            marginBottom: Default.fixPadding * 2,
            ...Default.shadow,
          }}>
            <Text style={{ 
              ...Fonts.SemiBold18white, 
              marginBottom: Default.fixPadding * 2,
              textAlign: "center",
            }}>
              {tr("YOU PAY")}
            </Text>
            <Text style={{ 
              ...Fonts.Bold36white, 
              textAlign: "center",
              marginBottom: Default.fixPadding * 2,
            }}>
              {totalAmountFormatted}
            </Text>
            <TouchableOpacity
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: Default.fixPadding,
              }}
            >
              <Text style={{ ...Fonts.Medium14lightBlue }}>
                {tr("DETAILS")}
              </Text>
              <MaterialIcons
                name="keyboard-arrow-down"
                size={20}
                color={Colors.lightBlue}
                style={{
                  marginLeft: isRtl ? 0 : Default.fixPadding * 0.5,
                  marginRight: isRtl ? Default.fixPadding * 0.5 : 0,
                }}
              />
            </TouchableOpacity>
            <View
              style={{
                height: 1,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                marginVertical: Default.fixPadding,
              }}
            />
            <View
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: Default.fixPadding,
              }}
            >
              <Text style={{ ...Fonts.Medium14lightGrey }}>
                {tr("Amount")}
              </Text>
              <Text style={{ ...Fonts.SemiBold14white }}>
                {amountFormatted || `GHS ${amount.toFixed(2)}`}
              </Text>
            </View>
            <View
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ ...Fonts.Medium14lightGrey }}>
                {tr("Platform Fee")}
              </Text>
              <Text style={{ ...Fonts.SemiBold14white }}>
                {platformFeeFormatted}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Send Button */}
        <View
          style={{
            padding: Default.fixPadding * 2,
            backgroundColor: Colors.white,
            ...Default.shadow,
          }}
        >
          <TouchableOpacity
            onPress={handleContinue}
            style={{
              backgroundColor: Colors.primary,
              borderRadius: 10,
              paddingVertical: Default.fixPadding * 1.5,
              alignItems: "center",
            }}
          >
            <Text style={{ ...Fonts.SemiBold16white }}>
              {tr("SEND")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default TransferReviewScreen;
