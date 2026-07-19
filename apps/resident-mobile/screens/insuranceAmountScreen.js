import React, { useMemo, useState } from "react";
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
import { formatMoney } from "../utils/money";
import {
  getQueryContextLabel,
  normalizeCatalogOptions,
} from "../services/personalHubCatalogFlowService";

const InsuranceAmountScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  const {
    provider,
    externalServiceCode,
    providerId,
    providerName,
    policyNumber,
    description,
    savePolicy,
    providerLogo,
    queryContext,
    queryOptions,
  } = route.params || {};

  const normalizedOptions = useMemo(
    () => normalizeCatalogOptions({ options: queryOptions || [], queryContext: queryContext || {} }),
    [queryContext, queryOptions]
  );

  const [selectedOptionId, setSelectedOptionId] = useState(normalizedOptions[0]?.id || null);
  const [amount, setAmount] = useState(
    normalizedOptions[0]?.amount !== null && normalizedOptions[0]?.amount !== undefined
      ? String(normalizedOptions[0].amount)
      : queryContext?.amount
        ? String(queryContext.amount)
        : ""
  );
  const [amountError, setAmountError] = useState("");
  const [schedulePayment, setSchedulePayment] = useState(false);

  function tr(key, fallback = "Missing Translation") {
    if (!key) return fallback || "";
    const translated = t(key);
    return translated || fallback;
  }

  const selectedOption = normalizedOptions.find((item) => item.id === selectedOptionId) || null;
  const hasPresetOptions = normalizedOptions.length > 0;
  const policyLabel = getQueryContextLabel(queryContext, description || policyNumber);

  const validateAmount = (text) => {
    setAmount(text);

    const numAmount = parseFloat(text);
    if (isNaN(numAmount) || numAmount <= 0) {
      setAmountError(text.length > 0 ? "Please enter a valid amount" : "");
      return false;
    }

    setAmountError("");
    return true;
  };

  const handleSelectOption = (option) => {
    setSelectedOptionId(option.id);
    if (option.amount !== null && option.amount !== undefined) {
      validateAmount(String(option.amount));
    }
  };

  const handleContinue = () => {
    const parsedAmount = parseFloat(amount);
    if (!validateAmount(amount)) {
      Alert.alert("Invalid Amount", "Please enter a valid amount");
      return;
    }

    navigation.navigate("paymentMethodScreen", {
      provider,
      externalServiceCode: externalServiceCode || provider || null,
      providerId,
      providerName,
      policyNumber,
      description: description || policyLabel,
      savePolicy,
      amount: parsedAmount,
      amountFormatted: formatMoney(parsedAmount),
      transactionType: "insurance",
      providerLogo,
      schedulePayment,
      phoneNumber: policyNumber,
      policyInfo: queryContext,
      queryContext,
      selectedOption: selectedOption?.raw || {},
      recipientInfo: {
        name: policyLabel || "Insurance Premium",
        policyNumber,
        policyType: providerName,
      },
      isPersonalHubTransaction: true,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.extraLightGrey }}>
      <MyStatusBar />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
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
            <Text style={{ ...Fonts.SemiBold18black }}>{tr("Payment Amount")}</Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, padding: Default.fixPadding * 2 }}
          >
            <View
              style={{
                backgroundColor: Colors.white,
                borderRadius: 10,
                padding: Default.fixPadding * 2,
                marginBottom: Default.fixPadding * 2,
                ...Default.shadow,
              }}
            >
              <View
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  alignItems: "center",
                  marginBottom: Default.fixPadding,
                }}
              >
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
                    overflow: "hidden",
                  }}
                >
                  <Image
                    source={providerLogo}
                    style={{
                      width: ms(35),
                      height: ms(35),
                      resizeMode: "contain",
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ ...Fonts.SemiBold16black }}>{providerName}</Text>
                  <Text style={{ ...Fonts.Medium14grey, marginTop: 2 }}>{policyNumber}</Text>
                  {policyLabel ? (
                    <Text style={{ ...Fonts.Medium14grey, marginTop: 2 }}>{policyLabel}</Text>
                  ) : null}
                </View>
              </View>
            </View>

            <View
              style={{
                backgroundColor: Colors.white,
                borderRadius: 10,
                padding: Default.fixPadding * 2,
                marginBottom: Default.fixPadding * 2,
                ...Default.shadow,
              }}
            >
              <Text style={{ ...Fonts.Medium14grey }}>
                {tr("Policy verification completed. Review the premium option below before continuing to checkout.")}
              </Text>
            </View>

            {hasPresetOptions ? (
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
                  {tr("AVAILABLE OPTIONS")}
                </Text>
                {normalizedOptions.map((option) => {
                  const isSelected = selectedOptionId === option.id;
                  return (
                    <TouchableOpacity
                      key={option.id}
                      onPress={() => handleSelectOption(option)}
                      style={{
                        flexDirection: isRtl ? "row-reverse" : "row",
                        alignItems: "center",
                        paddingVertical: Default.fixPadding,
                        borderBottomWidth: option.id === normalizedOptions[normalizedOptions.length - 1]?.id ? 0 : 1,
                        borderBottomColor: Colors.lightGrey,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{ ...Fonts.SemiBold14black }}>{option.name}</Text>
                        <Text style={{ ...Fonts.Medium13grey, marginTop: 3 }}>
                          {[option.amountLabel, option.description].filter(Boolean).join(" • ")}
                        </Text>
                      </View>
                      <MaterialCommunityIcons
                        name={isSelected ? "radiobox-marked" : "radiobox-blank"}
                        size={22}
                        color={isSelected ? Colors.primary : Colors.grey}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}

            <View
              style={{
                backgroundColor: Colors.white,
                borderRadius: 10,
                padding: Default.fixPadding * 2,
                marginBottom: Default.fixPadding * 2,
                ...Default.shadow,
              }}
            >
              <Text style={{ ...Fonts.SemiBold14grey, marginBottom: Default.fixPadding }}>{tr("AMOUNT")}</Text>
              <View
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: amountError ? Colors.red : Colors.lightGrey,
                  borderRadius: 8,
                  paddingHorizontal: Default.fixPadding,
                }}
              >
                <Text
                  style={{
                    ...Fonts.SemiBold18black,
                    marginRight: isRtl ? 0 : Default.fixPadding,
                    marginLeft: isRtl ? Default.fixPadding : 0,
                  }}
                >
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
                  editable={!hasPresetOptions}
                />
              </View>
              {amountError ? (
                <Text style={{ ...Fonts.Medium12red, marginTop: Default.fixPadding * 0.5 }}>{amountError}</Text>
              ) : null}

              <View
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: Default.fixPadding * 2,
                }}
              >
                <Text style={{ ...Fonts.SemiBold14black }}>{tr("Schedule Payment")}</Text>
                <TouchableOpacity onPress={() => setSchedulePayment((value) => !value)}>
                  <MaterialCommunityIcons
                    name={schedulePayment ? "checkbox-marked" : "checkbox-blank-outline"}
                    size={24}
                    color={schedulePayment ? Colors.primary : Colors.grey}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

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
              <Text style={{ ...Fonts.SemiBold16white }}>{tr("Continue")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default InsuranceAmountScreen;
