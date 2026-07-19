import React, { useRef, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  BackHandler,
  Image,
} from "react-native";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { ms } from "react-native-size-matters/extend";
import MyStatusBar from "../components/myStatusBar";
import { formatMoney } from "../utils/money";

const OtherAmountScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const inputRef = useRef(null);
  const [amount, setAmount] = useState("");

  const {
    provider,
    externalServiceCode,
    providerId,
    providerName,
    providerColor,
    providerLogo,
    phoneNumber,
    description,
    saveAccount,
    queryContext,
  } = route.params || {};

  function tr(key, fallback = "Missing Translation") {
    if (!key) return fallback || "";
    const translated = t(key);
    return translated || fallback;
  }

  React.useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [navigation]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  const handleContinue = () => {
    if (!amount || parseFloat(amount) <= 0) {
      return;
    }

    const numericAmount = parseFloat(amount);

    navigation.navigate("paymentMethodScreen", {
      provider,
      externalServiceCode: externalServiceCode || provider || null,
      providerId,
      providerName,
      providerColor,
      providerLogo,
      amountTitle: "Custom Amount",
      amount: numericAmount,
      amountFormatted: formatMoney(numericAmount),
      phoneNumber,
      description,
      saveAccount,
      transactionType: "airtime",
      queryContext,
      recipientInfo: {
        phoneNumber,
        name: description || phoneNumber,
        provider: providerName,
        logo: providerLogo,
      },
      isPersonalHubTransaction: true,
    });
  };

  const isValidAmount = amount && parseFloat(amount) > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.extraLightGrey }}>
      <MyStatusBar />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : null} style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
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
            <Text style={{ ...Fonts.SemiBold18black }}>{tr("Enter Amount")}</Text>
          </View>

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
                backgroundColor: providerColor ? providerColor + "15" : Colors.blue + "15",
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
              <Text style={{ ...Fonts.SemiBold16black }}>{providerName || "Airtime Purchase"}</Text>
              <Text style={{ ...Fonts.Medium14grey, marginTop: 2 }}>{phoneNumber}</Text>
            </View>
          </View>

          <View
            style={{
              backgroundColor: Colors.white,
              margin: Default.fixPadding * 2,
              borderRadius: 10,
              padding: Default.fixPadding * 2,
              ...Default.shadow,
            }}
          >
            <Text style={{ ...Fonts.SemiBold14grey, marginBottom: Default.fixPadding }}>
              {tr("ENTER AMOUNT")}
            </Text>

            <View
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                alignItems: "center",
                borderBottomWidth: 1,
                borderBottomColor: Colors.lightGrey,
                paddingBottom: Default.fixPadding,
                marginBottom: Default.fixPadding * 2,
              }}
            >
              <Text style={{ ...Fonts.Bold20black, marginRight: Default.fixPadding }}>GHS</Text>
              <TextInput
                ref={inputRef}
                style={{
                  flex: 1,
                  ...Fonts.Bold20black,
                  textAlign: isRtl ? "right" : "left",
                  padding: Default.fixPadding,
                }}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={Colors.grey}
              />
            </View>

            <View
              style={{
                backgroundColor: Colors.lightLinkWater,
                padding: Default.fixPadding * 1.5,
                borderRadius: 8,
                marginTop: Default.fixPadding,
                flexDirection: isRtl ? "row-reverse" : "row",
              }}
            >
              <MaterialCommunityIcons
                name="information-outline"
                size={20}
                color={Colors.primary}
                style={{
                  marginRight: isRtl ? 0 : Default.fixPadding,
                  marginLeft: isRtl ? Default.fixPadding : 0,
                }}
              />
              <Text style={{ ...Fonts.Medium14black, flex: 1 }}>
                {tr("The selected provider did not return fixed denominations, so you can enter a custom amount.")}
              </Text>
            </View>
          </View>

          <View
            style={{
              padding: Default.fixPadding * 2,
              backgroundColor: Colors.white,
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
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
              }}
            >
              <Text style={{ ...Fonts.SemiBold16white }}>{tr("Continue")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default OtherAmountScreen;
