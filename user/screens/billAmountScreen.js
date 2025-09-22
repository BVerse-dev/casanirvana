import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from "react-native";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { ms } from "react-native-size-matters/extend";
import MyStatusBar from "../components/myStatusBar";

const BillAmountScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  
  const { provider, providerName, accountNumber, description, saveAccount, providerLogo } = route.params || {};
  
  const [amount, setAmount] = useState("");
  const [isValidAmount, setIsValidAmount] = useState(false);
  const [amountError, setAmountError] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [billInfo, setBillInfo] = useState(null);

  // Safe translation function that ALWAYS returns a string
  function tr(key, fallback = "Missing Translation") {
    if (!key) return fallback || "";
    const translated = t(key);
    return translated || fallback;
  }

  // Simulate bill checking
  useEffect(() => {
    if (provider && accountNumber && provider.includes("ecg")) {
      setIsChecking(true);
      
      // Simulate API call
      setTimeout(() => {
        setBillInfo({
          customerName: "John Doe",
          billAmount: 125.50,
          dueDate: "2025-10-15",
          billPeriod: "September 2025"
        });
        setAmount("125.50");
        setIsValidAmount(true);
        setIsChecking(false);
      }, 2000);
    }
  }, [provider, accountNumber]);

  // Validate amount
  const validateAmount = (text) => {
    setAmount(text);
    
    const numAmount = parseFloat(text);
    if (isNaN(numAmount) || numAmount <= 0) {
      setIsValidAmount(false);
      if (text.length > 0) {
        setAmountError("Please enter a valid amount");
      } else {
        setAmountError("");
      }
    } else {
      setIsValidAmount(true);
      setAmountError("");
    }
  };

  // Handle continue
  const handleContinue = () => {
    if (!isValidAmount) {
      Alert.alert("Invalid Amount", "Please enter a valid amount");
      return;
    }

    navigation.navigate("paymentMethodScreen", {
      provider,
      providerName,
      accountNumber,
      description,
      amount: parseFloat(amount),
      amountFormatted: `GHS ${parseFloat(amount).toFixed(2)}`,
      transactionType: "bill_payment",
      billInfo,
      providerLogo,
      phoneNumber: accountNumber, // Pass account number as phone number for mobile money screen
      recipientInfo: {
        name: billInfo?.customerName || description || "Bill Payment",
        accountNumber: accountNumber
      },
      isPersonalHubTransaction: true
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.extraLightGrey }}>
      <MyStatusBar />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
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
              {tr("Payment Amount")}
            </Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, padding: Default.fixPadding * 2 }}
          >
            {/* Account Info */}
            <View
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
                marginBottom: Default.fixPadding,
              }}>
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: Colors.extraLightGrey,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: isRtl ? 0 : Default.fixPadding * 1.5,
                    marginLeft: isRtl ? Default.fixPadding * 1.5 : 0,
                    overflow: "hidden"
                  }}
                >
                  <Image
                    source={providerLogo}
                    style={{
                      width: ms(35),
                      height: ms(35),
                      resizeMode: "contain"
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ ...Fonts.SemiBold16black }}>
                    {providerName}
                  </Text>
                  <Text style={{ ...Fonts.Medium14grey, marginTop: 2 }}>
                    {accountNumber}
                  </Text>
                  {description ? (
                    <Text style={{ ...Fonts.Medium14grey, marginTop: 2 }}>
                      {description}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>

            {/* Bill Info if available */}
            {isChecking ? (
              <View
                style={{
                  backgroundColor: Colors.white,
                  borderRadius: 10,
                  padding: Default.fixPadding * 2,
                  marginBottom: Default.fixPadding * 2,
                  alignItems: "center",
                  ...Default.shadow,
                }}
              >
                <Text style={{ ...Fonts.Medium14grey }}>
                  {tr("Checking bill information...")}
                </Text>
              </View>
            ) : billInfo ? (
              <View
                style={{
                  backgroundColor: Colors.white,
                  borderRadius: 10,
                  padding: Default.fixPadding * 2,
                  marginBottom: Default.fixPadding * 2,
                  ...Default.shadow,
                }}
              >
                <Text style={{ ...Fonts.SemiBold16black, marginBottom: Default.fixPadding }}>
                  {tr("Bill Information")}
                </Text>
                
                <View style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  justifyContent: "space-between",
                  marginBottom: Default.fixPadding * 0.5,
                }}>
                  <Text style={{ ...Fonts.Medium14grey }}>
                    {tr("Customer Name")}
                  </Text>
                  <Text style={{ ...Fonts.SemiBold14black }}>
                    {billInfo.customerName}
                  </Text>
                </View>
                
                <View style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  justifyContent: "space-between",
                  marginBottom: Default.fixPadding * 0.5,
                }}>
                  <Text style={{ ...Fonts.Medium14grey }}>
                    {tr("Bill Amount")}
                  </Text>
                  <Text style={{ ...Fonts.SemiBold14primary }}>
                    {`GHS ${billInfo.billAmount.toFixed(2)}`}
                  </Text>
                </View>
                
                <View style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  justifyContent: "space-between",
                  marginBottom: Default.fixPadding * 0.5,
                }}>
                  <Text style={{ ...Fonts.Medium14grey }}>
                    {tr("Due Date")}
                  </Text>
                  <Text style={{ ...Fonts.SemiBold14black }}>
                    {billInfo.dueDate}
                  </Text>
                </View>
                
                <View style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  justifyContent: "space-between",
                }}>
                  <Text style={{ ...Fonts.Medium14grey }}>
                    {tr("Billing Period")}
                  </Text>
                  <Text style={{ ...Fonts.SemiBold14black }}>
                    {billInfo.billPeriod}
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Amount Input */}
            <View
              style={{
                backgroundColor: Colors.white,
                borderRadius: 10,
                padding: Default.fixPadding * 2,
                marginBottom: Default.fixPadding * 2,
                ...Default.shadow,
              }}
            >
              <Text style={{ ...Fonts.SemiBold14grey, marginBottom: Default.fixPadding }}>
                {tr("AMOUNT")}
              </Text>
              <View style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: amountError ? Colors.red : Colors.lightGrey,
                borderRadius: 8,
                paddingHorizontal: Default.fixPadding,
              }}>
                <Text style={{ 
                  ...Fonts.SemiBold18black,
                  marginRight: isRtl ? 0 : Default.fixPadding,
                  marginLeft: isRtl ? Default.fixPadding : 0,
                }}>
                  {tr("GHS")}
                </Text>
                <TextInput
                  style={{
                    flex: 1,
                    ...Fonts.Medium18black,
                    textAlign: isRtl ? "right" : "left",
                    padding: Default.fixPadding,
                  }}
                  value={amount}
                  onChangeText={validateAmount}
                  placeholder="0.00"
                  placeholderTextColor={Colors.grey}
                  keyboardType="numeric"
                />
              </View>
              {amountError ? (
                <Text style={{ ...Fonts.Medium12red, marginTop: Default.fixPadding * 0.5 }}>
                  {amountError}
                </Text>
              ) : null}
            </View>
            
            {/* Info Card */}
            <View
              style={{
                backgroundColor: "#FFF3E0",
                borderRadius: 10,
                padding: Default.fixPadding * 1.5,
                marginBottom: Default.fixPadding * 2,
                flexDirection: isRtl ? "row-reverse" : "row",
              }}
            >
              <MaterialCommunityIcons
                name="lightbulb-outline"
                size={24}
                color="#FF9800"
                style={{
                  marginRight: isRtl ? 0 : Default.fixPadding,
                  marginLeft: isRtl ? Default.fixPadding : 0,
                }}
              />
              <Text style={{ ...Fonts.Medium14black, flex: 1 }}>
                {tr("For utility bills, you can pay the exact amount due or a different amount based on your preference.")}
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
              disabled={!isValidAmount}
              style={{
                backgroundColor: isValidAmount ? Colors.primary : Colors.grey,
                borderRadius: 10,
                paddingVertical: Default.fixPadding * 1.5,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ ...Fonts.SemiBold16white }}>
                {tr("Continue")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default BillAmountScreen;
