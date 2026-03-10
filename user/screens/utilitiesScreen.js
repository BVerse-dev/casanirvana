import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Image,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ms } from "react-native-size-matters/extend";
import MyStatusBar from "../components/myStatusBar";
import { getActiveServiceProviders } from "../services/serviceProviderCatalogService";

const UtilitiesScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const [utilities, setUtilities] = useState([]);
  const [loadingUtilities, setLoadingUtilities] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Safe translation function that ALWAYS returns a string
  function tr(key, fallback = "Missing Translation") {
    if (!key) return fallback || "";
    const translated = t(key);
    return translated || fallback;
  }

  useEffect(() => {
    let isMounted = true;

    const loadProviders = async () => {
      setLoadingUtilities(true);
      const { data, error } = await getActiveServiceProviders({
        serviceType: "bill_payment",
        billCategory: "utilities",
      });
      if (!isMounted) return;
      setUtilities(data || []);
      setLoadError(error?.message || null);
      setLoadingUtilities(false);
    };

    loadProviders();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleUtilitySelect = (item) => {
    navigation.navigate("billAccountDetailsScreen", {
      provider: item.providerCode,
      externalServiceCode: item.externalServiceCode || item.providerCode,
      providerId: item.providerId || null,
      providerName: item.name,
      providerLogo: item.logo,
      billCategory: "utilities",
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
            {tr("UTILITIES")}
          </Text>
        </View>

        {/* Main Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: Default.fixPadding * 2 }}
        >
          {loadingUtilities ? (
            <View style={{ alignItems: "center", paddingVertical: Default.fixPadding * 2 }}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={{ ...Fonts.Medium14grey, marginTop: Default.fixPadding }}>
                {tr("Loading providers...")}
              </Text>
            </View>
          ) : (
            utilities.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleUtilitySelect(item)}
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  alignItems: "center",
                  backgroundColor: Colors.white,
                  borderRadius: 10,
                  padding: Default.fixPadding * 1.5,
                  marginBottom: Default.fixPadding * 2,
                  ...Default.shadow,
                }}
              >
                <View style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: Colors.extraLightGrey,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: isRtl ? 0 : Default.fixPadding * 1.5,
                  marginLeft: isRtl ? Default.fixPadding * 1.5 : 0,
                  overflow: "hidden"
                }}>
                  <Image
                    source={item.logo}
                    style={{
                      width: ms(40),
                      height: ms(40),
                      resizeMode: "contain"
                    }}
                  />
                </View>
                <Text style={{
                  ...Fonts.SemiBold16black,
                  flex: 1,
                }}>
                  {item.name}
                </Text>
                <Ionicons
                  name={isRtl ? "chevron-back-outline" : "chevron-forward-outline"}
                  size={24}
                  color={Colors.grey}
                />
              </TouchableOpacity>
            ))
          )}

          {!loadingUtilities && !utilities.length ? (
            <View
              style={{
                backgroundColor: Colors.lightLinkWater,
                borderRadius: 10,
                padding: Default.fixPadding * 1.5,
              }}
            >
              <Text style={{ ...Fonts.Medium14black }}>
                {tr("No active utility providers are available right now.")}
              </Text>
            </View>
          ) : null}

          {loadError ? (
            <View
              style={{
                backgroundColor: "#FFF3E0",
                borderRadius: 10,
                padding: Default.fixPadding * 1.5,
                marginTop: Default.fixPadding,
              }}
            >
              <Text style={{ ...Fonts.Medium14black }}>
                {tr("Provider catalog is currently using fallback data.")}
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default UtilitiesScreen;
