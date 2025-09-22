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
          contentContainerStyle={{ padding: Default.fixPadding * 2 }}
        >
          {/* Amount Card */}
          <View style={{ 
            backgroundColor: Colors.darkBlue, 
            borderRadius: 15,
            padding: Default.fixPadding * 2,
            marginBottom: Default.fixPadding * 2,
            ...Default.shadow,
          }}>
            {/* Amount */}
            <Text style={{ 
              ...Fonts.Medium14lightGrey, 
              textAlign: "center",
              marginBottom: Default.fixPadding * 0.5,
              letterSpacing: 0.5,
            }}>
              {tr("RECIPIENT GETS")}
            </Text>
            <Text style={{ 
              ...Fonts.Bold36white, 
              textAlign: "center",
              marginBottom: Default.fixPadding * 2,
            }}>
              {amountFormatted || `GHS ${amount.toFixed(2)}`}
            </Text>

            {/* Recipient Info */}
            <View style={{ 
              marginBottom: Default.fixPadding * 2,
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: 10,
              padding: Default.fixPadding * 1.5,
            }}>
              <Text style={{ 
                ...Fonts.Medium12lightGrey, 
                marginBottom: Default.fixPadding,
                letterSpacing: 0.5,
              }}>
                {tr("RECIPIENT")}
              </Text>
              <View style={{ 
                flexDirection: isRtl ? "row-reverse" : "row",
                alignItems: "center",
              }}>
                <View
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 23,
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
                      width: ms(28),
                      height: ms(28),
                      resizeMode: "contain",
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ ...Fonts.SemiBold16white }}>
                    {phoneNumber || ""}
                  </Text>
                  <Text style={{ ...Fonts.Medium14lightGrey, marginTop: 2 }}>
                    {description || ""}
                  </Text>
                  <Text style={{ ...Fonts.Medium14white, marginTop: 2 }}>
                    {providerName || "Mobile Money"}
                  </Text>
                </View>
                <TouchableOpacity style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  justifyContent: "center",
                  alignItems: "center",
                }}>
                  <MaterialCommunityIcons
                    name="star-outline"
                    size={22}
                    color={Colors.orange}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Schedule Info */}
            {schedulePayment && (
              <View style={{ 
                marginBottom: Default.fixPadding * 2,
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderRadius: 10,
                padding: Default.fixPadding * 1.5,
              }}>
                <Text style={{ 
                  ...Fonts.Medium12lightGrey, 
                  marginBottom: Default.fixPadding,
                  letterSpacing: 0.5,
                }}>
                  {tr("SCHEDULE")}
                </Text>
                <View style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  alignItems: "center",
                }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: Colors.orange + '30',
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: isRtl ? 0 : Default.fixPadding * 1.5,
                      marginLeft: isRtl ? Default.fixPadding * 1.5 : 0,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="calendar-clock"
                      size={22}
                      color={Colors.orange}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ ...Fonts.SemiBold16white }}>
                      {tr("Recurring")} {frequency}
                    </Text>
                    <Text style={{ ...Fonts.Medium14lightGrey, marginTop: 2 }}>
                      {firstPaymentNow ? tr("First payment today") : tr("First payment scheduled")}
                    </Text>
                    <Text style={{ ...Fonts.Medium14white, marginTop: 2 }}>
                      {formattedDate}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Payment Method */}
            <View style={{ 
              marginBottom: Default.fixPadding,
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: 10,
              padding: Default.fixPadding * 1.5,
            }}>
              <Text style={{ 
                ...Fonts.Medium12lightGrey, 
                marginBottom: Default.fixPadding,
                letterSpacing: 0.5,
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
                <View style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  alignItems: "center",
                }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: Colors.blue + '30',
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: isRtl ? 0 : Default.fixPadding * 1.5,
                      marginLeft: isRtl ? Default.fixPadding * 1.5 : 0,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="credit-card-outline"
                      size={22}
                      color={Colors.blue}
                    />
                  </View>
                  <Text style={{ ...Fonts.SemiBold16white }}>
                    {tr("Select payment method")}
                  </Text>
                </View>
                <View style={{
                  backgroundColor: Colors.blue + '30',
                  paddingHorizontal: Default.fixPadding,
                  paddingVertical: Default.fixPadding * 0.5,
                  borderRadius: 5,
                }}>
                  <Text style={{ ...Fonts.Medium12blue }}>
                    {tr("Change")}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Payment Details Card */}
          <View style={{ 
            backgroundColor: Colors.darkBlue, 
            borderRadius: 15,
            overflow: "hidden",
            marginBottom: Default.fixPadding * 2,
            ...Default.shadow,
          }}>
            {/* Top Section */}
            <View style={{
              padding: Default.fixPadding * 2,
              alignItems: "center",
              backgroundColor: "rgba(255, 255, 255, 0.03)",
            }}>
              <Text style={{ 
                ...Fonts.Medium14lightGrey, 
                marginBottom: Default.fixPadding * 0.5,
                letterSpacing: 0.5,
              }}>
                {tr("YOU PAY")}
              </Text>
              <Text style={{ 
                ...Fonts.Bold36white, 
                textAlign: "center",
                marginBottom: Default.fixPadding,
              }}>
                {totalAmountFormatted}
              </Text>
            </View>
            
            {/* Details Section */}
            <View style={{
              padding: Default.fixPadding * 2,
            }}>
              <View style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: Default.fixPadding * 1.5,
              }}>
                <Text style={{ ...Fonts.Medium14lightGrey }}>
                  {tr("Transfer Amount")}
                </Text>
                <Text style={{ ...Fonts.SemiBold14white }}>
                  {amountFormatted || `GHS ${amount.toFixed(2)}`}
                </Text>
              </View>
              
              <View style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: Default.fixPadding * 1.5,
              }}>
                <Text style={{ ...Fonts.Medium14lightGrey }}>
                  {tr("Platform Fee")}
                </Text>
                <Text style={{ ...Fonts.SemiBold14white }}>
                  {platformFeeFormatted}
                </Text>
              </View>
              
              <View style={{
                height: 1,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                marginVertical: Default.fixPadding,
              }}/>
              
              <View style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <Text style={{ ...Fonts.SemiBold16lightGrey }}>
                  {tr("Total")}
                </Text>
                <Text style={{ ...Fonts.SemiBold16primary }}>
                  {totalAmountFormatted}
                </Text>
              </View>
              
              {reference && (
                <View style={{
                  marginTop: Default.fixPadding * 2,
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderRadius: 8,
                  padding: Default.fixPadding,
                }}>
                  <Text style={{ ...Fonts.Medium12lightGrey, marginBottom: 4 }}>
                    {tr("REFERENCE")}
                  </Text>
                  <Text style={{ ...Fonts.Medium14white }}>
                    {reference}
                  </Text>
                </View>
              )}
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
              flexDirection: isRtl ? "row-reverse" : "row",
              justifyContent: "center",
            }}
          >
            <MaterialCommunityIcons
              name="send"
              size={20}
              color={Colors.white}
              style={{
                marginRight: isRtl ? 0 : Default.fixPadding,
                marginLeft: isRtl ? Default.fixPadding : 0,
              }}
            />
            <Text style={{ ...Fonts.SemiBold16white }}>
              {tr("CONTINUE TO PAYMENT")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default TransferReviewScreen;
