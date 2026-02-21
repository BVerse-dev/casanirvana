import React, { useState, useEffect } from "react";
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

const TransferAmountScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [schedulePayment, setSchedulePayment] = useState(false);
  const [frequency, setFrequency] = useState("Monthly");
  const [firstPaymentNow, setFirstPaymentNow] = useState(true);
  
  // Get data from route params
  const { 
    provider, 
    providerId,
    providerName, 
    providerColor,
    providerLogo,
    phoneNumber,
    description,
    saveRecipient,
    recipientInfo
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
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert(
        tr("Invalid Amount"),
        tr("Please enter a valid amount to continue.")
      );
      return;
    }
    
    // Format the amount for display
    const amountValue = parseFloat(amount);
    const amountFormatted = `GHS ${amountValue.toFixed(2)}`;
    
    // Navigate to review screen
    navigation.navigate("transferReviewScreen", {
      provider,
      providerId,
      providerName,
      providerColor,
      providerLogo,
      phoneNumber,
      description,
      saveRecipient,
      amount: amountValue,
      amountFormatted,
      reference,
      schedulePayment,
      frequency: schedulePayment ? frequency : null,
      firstPaymentNow,
      recipientInfo,
      transactionType: 'money_transfer'
    });
  };

  const handleFrequencySelect = (selected) => {
    setFrequency(selected);
  };

  const handleFirstPaymentSelect = (isNow) => {
    setFirstPaymentNow(isNow);
  };

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
            {tr("Amount")}
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: Default.fixPadding * 10 }}
        >
          {/* Recipient Info */}
          <View style={{ 
            backgroundColor: Colors.white, 
            padding: Default.fixPadding * 2,
            marginBottom: Default.fixPadding,
            ...Default.shadow,
          }}>
            <Text style={{ ...Fonts.SemiBold14grey, marginBottom: Default.fixPadding }}>
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
                  {description || phoneNumber || "Recipient"}
                </Text>
                <Text style={{ ...Fonts.Medium14grey, marginTop: 2 }}>
                  {phoneNumber || ""}
                </Text>
                <Text style={{ ...Fonts.Medium14primary, marginTop: 2 }}>
                  {providerName || "Money Transfer"}
                </Text>
              </View>
            </View>
          </View>

          {/* Amount Input */}
          <View style={{ 
            backgroundColor: Colors.white, 
            padding: Default.fixPadding * 2,
            marginBottom: Default.fixPadding,
            ...Default.shadow,
          }}>
            <Text style={{ ...Fonts.SemiBold14grey, marginBottom: Default.fixPadding }}>
              {tr("AMOUNT")}
            </Text>
            <View style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: Colors.lightGrey,
              borderRadius: 8,
              paddingHorizontal: Default.fixPadding,
              marginBottom: Default.fixPadding * 2,
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
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor={Colors.grey}
              />
            </View>
            
            <View style={{
              backgroundColor: Colors.extraLightGrey,
              borderRadius: 8,
              padding: Default.fixPadding,
              marginBottom: Default.fixPadding * 2,
            }}>
              <Text style={{ ...Fonts.Medium14black }}>
                {tr("GHS 5000.00 MAX")}
              </Text>
            </View>

            {/* Reference */}
            <Text style={{ ...Fonts.SemiBold14grey, marginBottom: Default.fixPadding }}>
              {tr("REFERENCE")}
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
              value={reference}
              onChangeText={setReference}
              placeholder={tr("Enter a reference")}
              placeholderTextColor={Colors.grey}
            />

            {/* Schedule Payment Toggle */}
            <View
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: Default.fixPadding,
              }}
            >
              <View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={{ ...Fonts.SemiBold16black }}>
                    {tr("Schedule Payment")}
                  </Text>
                  <View
                    style={{
                      backgroundColor: "#FFB900",
                      paddingHorizontal: Default.fixPadding * 0.5,
                      paddingVertical: Default.fixPadding * 0.2,
                      borderRadius: 4,
                      marginLeft: Default.fixPadding * 0.5,
                    }}
                  >
                    <Text style={{ ...Fonts.SemiBold10white }}>
                      {tr("NEW")}
                    </Text>
                  </View>
                </View>
                <Text style={{ ...Fonts.Medium14grey, marginTop: 2 }}>
                  {tr("Set up recurring payments")}
                </Text>
              </View>
              <Switch
                value={schedulePayment}
                onValueChange={setSchedulePayment}
                trackColor={{ false: Colors.lightGrey, true: Colors.primary + '50' }}
                thumbColor={schedulePayment ? Colors.primary : Colors.white}
                ios_backgroundColor={Colors.lightGrey}
              />
            </View>

            {/* Schedule Payment Options */}
            {schedulePayment && (
              <>
                {/* Frequency */}
                <Text style={{ ...Fonts.SemiBold14grey, marginBottom: Default.fixPadding }}>
                  {tr("FREQUENCY")}
                </Text>
                <View style={{
                  flexDirection: "row",
                  borderRadius: 8,
                  overflow: "hidden",
                  marginBottom: Default.fixPadding * 2,
                  backgroundColor: Colors.extraLightGrey,
                }}>
                  {["Monthly", "Bi-Weekly", "Weekly", "Daily", "Once"].map((item) => (
                    <TouchableOpacity
                      key={item}
                      onPress={() => handleFrequencySelect(item)}
                      style={{
                        flex: 1,
                        paddingVertical: Default.fixPadding * 0.8,
                        paddingHorizontal: Default.fixPadding * 0.2,
                        backgroundColor: frequency === item ? Colors.primary : "transparent",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                      style={{
                        ...Fonts.SemiBold9black,
                        fontSize: 9,
                        color: frequency === item ? Colors.white : Colors.black,
                        textAlign: "center",
                      }}
                      numberOfLines={1}
                      >
                        {tr(item)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* First Payment */}
                <Text style={{ ...Fonts.SemiBold14grey, marginBottom: Default.fixPadding }}>
                  {tr("FIRST PAYMENT")}
                </Text>
                <View style={{
                  flexDirection: "row",
                  marginBottom: Default.fixPadding * 2,
                }}>
                  <TouchableOpacity
                    onPress={() => handleFirstPaymentSelect(true)}
                    style={{
                      flex: 1,
                      paddingVertical: Default.fixPadding,
                      backgroundColor: firstPaymentNow ? Colors.primary : Colors.extraLightGrey,
                      alignItems: "center",
                      marginRight: Default.fixPadding,
                      borderRadius: 8,
                    }}
                  >
                    <Text
                      style={{
                        ...Fonts.SemiBold14black,
                        color: firstPaymentNow ? Colors.white : Colors.black,
                      }}
                    >
                      {tr("Now")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleFirstPaymentSelect(false)}
                    style={{
                      flex: 1,
                      paddingVertical: Default.fixPadding,
                      backgroundColor: !firstPaymentNow ? Colors.primary : Colors.extraLightGrey,
                      alignItems: "center",
                      borderRadius: 8,
                    }}
                  >
                    <Text
                      style={{
                        ...Fonts.SemiBold14black,
                        color: !firstPaymentNow ? Colors.white : Colors.black,
                      }}
                    >
                      {tr("Later")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
              {tr("Enter the amount you want to send. You can also schedule recurring payments.")}
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
            disabled={!amount || parseFloat(amount) <= 0}
            style={{
              backgroundColor: amount && parseFloat(amount) > 0 ? Colors.primary : Colors.grey,
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

export default TransferAmountScreen;
