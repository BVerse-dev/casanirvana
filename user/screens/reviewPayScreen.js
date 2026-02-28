import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Image,
  StyleSheet,
  SafeAreaView,
  BackHandler,
  ScrollView,
  Alert,
} from "react-native";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { ms } from "react-native-size-matters/extend";
import MyStatusBar from "../components/myStatusBar";
import {
  getPaymentMethodPolicy,
  validatePaymentSelection,
} from "../services/paymentMethodPolicyService";

const ReviewPayScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const [paymentPolicy, setPaymentPolicy] = React.useState(null);
  const [isLoadingPaymentPolicy, setIsLoadingPaymentPolicy] = React.useState(true);
  // Get data from route params
  const { 
    provider, 
    providerId,
    providerName,
    providerColor,
    providerLogo,
    amount, 
    amountFormatted,
    phoneNumber,
    description,
    paymentMethod,
    recipientInfo,
    transactionType,
    dataAmount,
    validity,
    reference,
    schedulePayment,
    frequency,
    firstPaymentNow,
    platformFee,
    totalAmount,
    saveAccount,
    savePolicy,
    packageType,
    amountTitle,
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

  React.useEffect(() => {
    let isMounted = true;

    const loadPaymentPolicy = async () => {
      setIsLoadingPaymentPolicy(true);
      const policy = await getPaymentMethodPolicy();

      if (!isMounted) return;

      setPaymentPolicy(policy);
      setIsLoadingPaymentPolicy(false);
    };

    loadPaymentPolicy();

    return () => {
      isMounted = false;
    };
  }, []);

  const handlePayment = () => {
    const normalizedTransactionType = transactionType || "airtime";
    const paymentMethodTitle = paymentMethod?.title || "Credit Card";
    const resolvedAmount = Number(totalAmount ?? amount ?? 0);

    if (isLoadingPaymentPolicy) {
      Alert.alert("Please Wait", "Loading payment settings. Please try again in a moment.");
      return;
    }

    const validationMessage = validatePaymentSelection({
      policy: paymentPolicy,
      methodTitle: paymentMethodTitle,
      amount: resolvedAmount,
    });

    if (validationMessage) {
      Alert.alert("Payment Unavailable", validationMessage);
      return;
    }

    const navigationParams = {
      provider,
      providerId: providerId || null,
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
      savePolicy,
      transactionType: normalizedTransactionType,
      recipientInfo,
      dataAmount,
      validity,
      reference,
      schedulePayment,
      frequency,
      firstPaymentNow,
      platformFee,
      totalAmount,
      isPersonalHubTransaction: true,
    };

    switch (paymentMethodTitle) {
      case "Mobile Money":
        navigation.push("mobileMoneyScreen", navigationParams);
        break;
      case "PayPal":
        navigation.push("paypalScreen", navigationParams);
        break;
      case "Credit Card":
      default:
        navigation.push("creditCardScreen", navigationParams);
        break;
    }
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
            {tr("Review & Pay")}
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: Default.fixPadding * 10 }}
        >
          {/* Amount Display */}
          <View style={{ 
            backgroundColor: Colors.white, 
            alignItems: "center", 
            padding: Default.fixPadding * 3,
            ...Default.shadow,
          }}>
            <Text style={{ ...Fonts.Medium16grey, marginBottom: Default.fixPadding }}>
              {tr("Total Amount")}
            </Text>
            <Text style={{ ...Fonts.Bold32primary }}>
              GHS {amount?.toFixed(2) || '0.00'}
            </Text>
          </View>

          {/* Transaction Details */}
          <View style={{ 
            backgroundColor: Colors.white, 
            padding: Default.fixPadding * 2,
            marginTop: Default.fixPadding,
            ...Default.shadow,
          }}>
            <Text style={{ ...Fonts.SemiBold16black, marginBottom: Default.fixPadding * 1.5 }}>
              {tr("Transaction Details")}
            </Text>
            
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
              <Text style={{ ...Fonts.Medium16grey }}>
                {tr("Amount")}
              </Text>
              <Text style={{ ...Fonts.SemiBold16black }}>
                {amountFormatted || `GHS ${amount?.toFixed(2) || '0.00'}`}
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
              <Text style={{ ...Fonts.Medium16grey }}>
                {tr("Fee")}
              </Text>
              <Text style={{ ...Fonts.SemiBold16black }}>
                GHS 0.00
              </Text>
            </View>

            {/* Total Row */}
            <View
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                justifyContent: "space-between",
                paddingTop: Default.fixPadding * 1.5,
              }}
            >
              <Text style={{ ...Fonts.SemiBold16black }}>
                {tr("Total")}
              </Text>
              <Text style={{ ...Fonts.SemiBold16primary }}>
                {amountFormatted || `GHS ${amount?.toFixed(2) || '0.00'}`}
              </Text>
            </View>
          </View>

          {/* Account Section */}
          <View style={{ 
            backgroundColor: Colors.white, 
            padding: Default.fixPadding * 2,
            marginTop: Default.fixPadding,
            ...Default.shadow,
          }}>
            <Text style={{ ...Fonts.SemiBold16black, marginBottom: Default.fixPadding * 1.5 }}>
              {tr("Recipient")}
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
              
              <View style={{ flex: 1 }}>
                <Text style={{ ...Fonts.SemiBold16black }}>
                  {description || tr("Airtime Purchase")}
                </Text>
                <Text style={{ ...Fonts.Medium14grey, marginTop: 2 }}>
                  {phoneNumber || ""}
                </Text>
                <Text style={{ ...Fonts.Medium14primary, marginTop: 2 }}>
                  {providerName || ""}
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
          <View style={{ 
            backgroundColor: Colors.white, 
            padding: Default.fixPadding * 2,
            marginTop: Default.fixPadding,
            ...Default.shadow,
          }}>
            <Text style={{ ...Fonts.SemiBold16black, marginBottom: Default.fixPadding * 1.5 }}>
              {tr("Payment Method")}
            </Text>
            
            <View
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
                <Text style={{ ...Fonts.SemiBold16black }}>
                  {paymentMethod?.displayNumber || "****7708"}
                </Text>
              </View>
              
              <TouchableOpacity onPress={() => navigation.navigate("paymentMethodScreen", route.params)}>
                <Text style={{ ...Fonts.SemiBold14primary }}>
                  {tr("Change")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Pay Button */}
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
            onPress={handlePayment}
            style={{
              backgroundColor: Colors.primary,
              borderRadius: 10,
              paddingVertical: Default.fixPadding * 1.5,
              alignItems: "center",
              flexDirection: isRtl ? "row-reverse" : "row",
              justifyContent: "center",
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

export default ReviewPayScreen;
