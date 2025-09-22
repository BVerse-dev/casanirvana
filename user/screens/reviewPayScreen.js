import React, { useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { ms } from "react-native-size-matters/extend";

const ReviewPayScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const [isLoading, setIsLoading] = useState(false);
  
  // Get data from route params
  const { 
    provider, 
    providerName, 
    amount, 
    amountFormatted,
    phoneNumber,
    description,
    paymentMethod,
    recipientInfo
  } = route.params || {};

  // Safe translation function that ALWAYS returns a string
  function tr(key, fallback = "Missing Translation") {
    if (!key) return fallback || "";
    const translated = t(key);
    return translated || fallback;
  }

  const handlePayment = () => {
    setIsLoading(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsLoading(false);
      
      // Show success message and navigate to home
      Alert.alert(
        tr("Payment Successful"),
        tr("Your airtime purchase was successful."),
        [
          {
            text: tr("OK"),
            onPress: () => navigation.navigate("homeScreen")
          }
        ]
      );
    }, 2000);
  };

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
            {tr("Review & Pay")}
          </Text>
        </View>

        {/* Amount Display */}
        <View style={{ alignItems: "center", padding: Default.fixPadding * 3 }}>
          <Text style={{ ...Fonts.Bold32black }}>
            GHS {amount}
          </Text>
        </View>

        {/* Transaction Details */}
        <View style={{ flex: 1, padding: Default.fixPadding * 2 }}>
          {/* Amount Row */}
          <View
            style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              justifyContent: "space-between",
              borderBottomWidth: 1,
              borderBottomColor: Colors.lightGrey,
              paddingBottom: Default.fixPadding * 1.5,
            }}
          >
            <Text style={{ ...Fonts.SemiBold16black }}>
              {tr("Amount")}
            </Text>
            <Text style={{ ...Fonts.SemiBold16black }}>
              {amountFormatted}
            </Text>
          </View>

          {/* Fee Row */}
          <View
            style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              justifyContent: "space-between",
              borderBottomWidth: 1,
              borderBottomColor: Colors.lightGrey,
              paddingVertical: Default.fixPadding * 1.5,
            }}
          >
            <Text style={{ ...Fonts.SemiBold16black }}>
              {tr("Fee")}
            </Text>
            <Text style={{ ...Fonts.SemiBold16black }}>
              GHS 0.00
            </Text>
          </View>

          {/* Account Section */}
          <View style={{ marginTop: Default.fixPadding * 2 }}>
            <Text style={{ ...Fonts.SemiBold14grey, marginBottom: Default.fixPadding }}>
              {tr("ACCOUNT")}
            </Text>
            
            <View
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                alignItems: "center",
                borderBottomWidth: 1,
                borderBottomColor: Colors.lightGrey,
                paddingBottom: Default.fixPadding * 1.5,
              }}
            >
              <Image
                source={recipientInfo?.logo || require("../assets/images/pay1.png")}
                style={{ 
                  width: ms(40), 
                  height: ms(40), 
                  resizeMode: "contain",
                  marginRight: isRtl ? 0 : Default.fixPadding,
                  marginLeft: isRtl ? Default.fixPadding : 0,
                }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ ...Fonts.SemiBold16black }}>
                  {description || tr("Airtime Purchase")}
                </Text>
                <Text style={{ ...Fonts.Medium14grey }}>
                  {phoneNumber}
                </Text>
                <Text style={{ ...Fonts.Medium14primary }}>
                  {providerName}
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

          {/* Payment Method Section */}
          <View style={{ marginTop: Default.fixPadding * 2 }}>
            <Text style={{ ...Fonts.SemiBold14grey, marginBottom: Default.fixPadding }}>
              {tr("PAY WITH")}
            </Text>
            
            <View
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                alignItems: "center",
              }}
            >
              <Image
                source={paymentMethod?.logo || require("../assets/images/pay4.png")}
                style={{ 
                  width: ms(40), 
                  height: ms(24), 
                  resizeMode: "contain",
                  marginRight: isRtl ? 0 : Default.fixPadding,
                  marginLeft: isRtl ? Default.fixPadding : 0,
                }}
              />
              <Text style={{ ...Fonts.SemiBold16black, flex: 1 }}>
                {paymentMethod?.displayNumber || "****7708"}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("paymentMethodScreen")}>
                <Text style={{ ...Fonts.SemiBold14primary }}>
                  {tr("Change")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Pay Button */}
        <TouchableOpacity
          onPress={handlePayment}
          disabled={isLoading}
          style={{
            backgroundColor: isLoading ? Colors.grey : Colors.green,
            paddingVertical: Default.fixPadding * 1.5,
            alignItems: "center",
            margin: Default.fixPadding * 2,
            borderRadius: 5,
          }}
        >
          <Text style={{ ...Fonts.SemiBold16white }}>
            {isLoading ? tr("PROCESSING...") : tr("PAY")}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ReviewPayScreen;
