import React, { useMemo, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  BackHandler,
  Image,
} from "react-native";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import MyStatusBar from "../components/myStatusBar";
import { ms } from "react-native-size-matters/extend";
import { formatMoney } from "../utils/money";
import { normalizeCatalogOptions } from "../services/personalHubCatalogFlowService";

const FALLBACK_OPTIONS = [
  { id: "starter", name: "Starter", amount: 2 },
  { id: "value", name: "Value", amount: 5 },
  { id: "extra", name: "Extra Value", amount: 10 },
  { id: "supreme", name: "Supreme Value", amount: 20 },
  { id: "maximum", name: "Maximum Value", amount: 30 },
  { id: "elite", name: "Elite", amount: 50 },
  { id: "ultimate", name: "Ultimate", amount: 100 },
];

const AmountScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

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
    queryOptions,
  } = route.params || {};

  const amountOptions = useMemo(() => {
    const normalized = normalizeCatalogOptions({ options: queryOptions || [], queryContext: queryContext || {} });
    if (normalized.length) {
      return normalized;
    }

    return FALLBACK_OPTIONS.map((item) => ({
      id: item.id,
      name: item.name,
      amount: item.amount,
      amountLabel: formatMoney(item.amount),
      description: "Airtime top-up",
      raw: {},
    }));
  }, [queryContext, queryOptions]);

  const [selectedAmount, setSelectedAmount] = useState(null);

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

  const handleContinue = () => {
    if (!selectedAmount) return;

    const option = amountOptions.find((item) => item.id === selectedAmount);
    if (!option || option.amount === null || option.amount === undefined) {
      return;
    }

    navigation.navigate("paymentMethodScreen", {
      provider,
      externalServiceCode: externalServiceCode || provider || null,
      providerId,
      providerName,
      providerColor,
      providerLogo,
      amountTitle: option.name,
      amount: option.amount,
      amountFormatted: option.amountLabel || formatMoney(option.amount),
      phoneNumber,
      description,
      saveAccount,
      transactionType: "airtime",
      queryContext,
      selectedOption: option.raw || {},
      recipientInfo: {
        phoneNumber,
        name: description || phoneNumber,
        provider: providerName,
        logo: providerLogo,
      },
      isPersonalHubTransaction: true,
    });
  };

  const renderItem = (item) => {
    const isSelected = selectedAmount === item.id;

    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => setSelectedAmount(item.id)}
        style={{
          flexDirection: isRtl ? "row-reverse" : "row",
          alignItems: "center",
          paddingVertical: Default.fixPadding * 1.5,
          paddingHorizontal: Default.fixPadding * 2,
          backgroundColor: Colors.white,
          marginBottom: Default.fixPadding,
          borderRadius: 10,
          ...Default.shadow,
          borderWidth: isSelected ? 2 : 0,
          borderColor: isSelected ? Colors.primary : "transparent",
        }}
      >
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: isRtl ? "row-reverse" : "row", alignItems: "center", flexWrap: "wrap" }}>
            <Text style={{ ...Fonts.SemiBold16black }}>{item.name}</Text>
            <View
              style={{
                backgroundColor: Colors.lightLinkWater,
                paddingHorizontal: Default.fixPadding * 0.8,
                paddingVertical: Default.fixPadding * 0.3,
                borderRadius: 4,
                marginLeft: isRtl ? 0 : Default.fixPadding,
                marginRight: isRtl ? Default.fixPadding : 0,
                marginTop: Default.fixPadding * 0.3,
              }}
            >
              <Text style={{ ...Fonts.Medium12primary }}>{item.amountLabel || formatMoney(item.amount)}</Text>
            </View>
          </View>

          {item.description ? (
            <Text numberOfLines={2} style={{ ...Fonts.Medium14grey, marginTop: Default.fixPadding * 0.5 }}>
              {item.description}
            </Text>
          ) : null}
        </View>

        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: isSelected ? Colors.primary : Colors.grey,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {isSelected ? (
            <View
              style={{
                width: 14,
                height: 14,
                borderRadius: 7,
                backgroundColor: Colors.primary,
              }}
            />
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.extraLightGrey }}>
      <MyStatusBar />
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
          <Text style={{ ...Fonts.SemiBold18black }}>{tr("Select Amount")}</Text>
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

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: Default.fixPadding * 2, paddingBottom: Default.fixPadding * 10 }}
        >
          <Text style={{ ...Fonts.SemiBold16black, marginBottom: Default.fixPadding * 1.5 }}>
            {tr("Choose Amount")}
          </Text>
          {amountOptions.map(renderItem)}
        </ScrollView>

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
            disabled={!selectedAmount}
            style={{
              backgroundColor: selectedAmount ? Colors.primary : Colors.grey,
              borderRadius: 10,
              paddingVertical: Default.fixPadding * 1.5,
              alignItems: "center",
            }}
          >
            <Text style={{ ...Fonts.SemiBold16white }}>{tr("Continue")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AmountScreen;
