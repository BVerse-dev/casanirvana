import React, { useMemo, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  BackHandler,
} from "react-native";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MyStatusBar from "../components/myStatusBar";
import { formatMoney } from "../utils/money";
import { normalizeCatalogOptions } from "../services/personalHubCatalogFlowService";

const DataAmountScreen = ({ navigation, route }) => {
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

  const dataPackages = useMemo(
    () => normalizeCatalogOptions({ options: queryOptions || [], queryContext: queryContext || {} }),
    [queryContext, queryOptions]
  );

  const handleContinue = () => {
    if (!selectedAmount) return;

    const option = dataPackages.find((item) => item.id === selectedAmount);
    if (!option || option.amount === null) {
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
      dataAmount: option.dataAmount,
      validity: option.validityLabel,
      transactionType: "data",
      selectedOption: option.raw || {},
      queryContext,
      recipientInfo: {
        phoneNumber,
        name: description || phoneNumber,
        provider: providerName,
        logo: providerLogo,
        dataAmount: option.dataAmount,
        validity: option.validityLabel,
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
            <Text style={{ ...Fonts.SemiBold16black }}>{item.dataAmount || item.name}</Text>
            {item.amountLabel ? (
              <View
                style={{
                  backgroundColor: Colors.lightGreen,
                  paddingHorizontal: Default.fixPadding * 0.8,
                  paddingVertical: Default.fixPadding * 0.3,
                  borderRadius: 4,
                  marginLeft: isRtl ? 0 : Default.fixPadding,
                  marginRight: isRtl ? Default.fixPadding : 0,
                  marginTop: Default.fixPadding * 0.3,
                }}
              >
                <Text style={{ ...Fonts.Medium12green }}>{item.amountLabel}</Text>
              </View>
            ) : null}
          </View>

          <Text numberOfLines={2} style={{ ...Fonts.Medium14grey, marginTop: Default.fixPadding * 0.5 }}>
            {[item.name, item.validityLabel].filter(Boolean).join(" • ")}
          </Text>
          {item.description ? (
            <Text numberOfLines={2} style={{ ...Fonts.Medium12grey, marginTop: Default.fixPadding * 0.4 }}>
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
          <Text style={{ ...Fonts.SemiBold18black }}>{tr("Select Bundle")}</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: Default.fixPadding * 2, paddingBottom: Default.fixPadding * 10 }}
        >
          <View
            style={{
              backgroundColor: Colors.white,
              borderRadius: 10,
              padding: Default.fixPadding * 1.5,
              marginBottom: Default.fixPadding * 1.5,
              ...Default.shadow,
            }}
          >
            <View style={{ flexDirection: isRtl ? "row-reverse" : "row", alignItems: "center" }}>
              <MaterialCommunityIcons
                name="wifi-check"
                size={20}
                color={Colors.primary}
                style={{
                  marginRight: isRtl ? 0 : Default.fixPadding,
                  marginLeft: isRtl ? Default.fixPadding : 0,
                }}
              />
              <Text style={{ ...Fonts.Medium14black, flex: 1 }}>
                {tr("The bundles below came directly from the selected provider for this number.")}
              </Text>
            </View>
          </View>

          {dataPackages.length ? (
            dataPackages.map(renderItem)
          ) : (
            <View
              style={{
                backgroundColor: Colors.white,
                borderRadius: 10,
                padding: Default.fixPadding * 1.5,
                ...Default.shadow,
              }}
            >
              <Text style={{ ...Fonts.Medium14black }}>
                {tr("No bundles are available for this number right now. Please try another provider or number.")}
              </Text>
            </View>
          )}
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

export default DataAmountScreen;
