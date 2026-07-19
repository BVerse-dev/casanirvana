import React, { useEffect, useMemo, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import MyStatusBar from "../components/myStatusBar";
import { getActiveServiceProviders } from "../services/serviceProviderCatalogService";

const PayBillsScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [catalogNotice, setCatalogNotice] = useState(null);
  const [categoryAvailability, setCategoryAvailability] = useState({
    utilities: false,
    tv: false,
  });

  // Safe translation function that ALWAYS returns a string
  function tr(key, fallback = "Missing Translation") {
    if (!key) return fallback || "";
    const translated = t(key);
    return translated || fallback;
  }

  useEffect(() => {
    let isMounted = true;

    const loadAvailability = async () => {
      setAvailabilityLoading(true);

      const [utilitiesResponse, tvResponse] = await Promise.all([
        getActiveServiceProviders({
          serviceType: "bill_payment",
          billCategory: "utilities",
          allowFallback: false,
        }),
        getActiveServiceProviders({
          serviceType: "bill_payment",
          billCategory: "tv",
          allowFallback: false,
        }),
      ]);

      if (!isMounted) return;

      const nextAvailability = {
        utilities: Boolean(utilitiesResponse.data?.length),
        tv: Boolean(tvResponse.data?.length),
      };

      const notices = [];
      if (!nextAvailability.utilities && nextAvailability.tv) {
        notices.push("Utility bill payments are not currently available for this merchant profile. TV bill payments remain available.");
      } else if (!nextAvailability.utilities && !nextAvailability.tv) {
        notices.push("No live bill-payment providers are currently available for this merchant profile.");
      }

      if (utilitiesResponse.warning && !nextAvailability.utilities) {
        notices.push(utilitiesResponse.warning);
      }

      if (tvResponse.warning && !nextAvailability.tv) {
        notices.push(tvResponse.warning);
      }

      setCategoryAvailability(nextAvailability);
      setCatalogNotice(notices.length ? notices.join(" ") : null);
      setAvailabilityLoading(false);
    };

    loadAvailability();

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(
    () => [
      {
        id: "utilities",
        title: "Utilities",
        icon: "flash-outline",
        description: categoryAvailability.utilities
          ? "Pay electricity, water & waste management bills"
          : "Currently unavailable in the live ExpressPay bill-payment catalog",
        screen: "utilitiesScreen",
        available: categoryAvailability.utilities,
      },
      {
        id: "tv",
        title: "TV/Entertainment",
        icon: "tv-outline",
        description: "Pay TV subscriptions and streaming services",
        screen: "tvScreen",
        available: categoryAvailability.tv,
      },
    ],
    [categoryAvailability]
  );

  const handleCategorySelect = (item) => {
    if (!item.available || availabilityLoading) {
      return;
    }

    navigation.navigate(item.screen);
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
            {tr("Pay Bills")}
          </Text>
        </View>

        {/* Main Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: Default.fixPadding * 2 }}
        >
          {availabilityLoading ? (
            <View style={{ alignItems: "center", paddingVertical: Default.fixPadding * 2 }}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={{ ...Fonts.Medium14grey, marginTop: Default.fixPadding }}>
                {tr("Checking bill-payment availability...")}
              </Text>
            </View>
          ) : null}

          {!availabilityLoading
            ? categories.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleCategorySelect(item)}
                  disabled={!item.available}
                  style={{
                    backgroundColor: item.available ? Colors.white : Colors.regularLightGrey,
                    borderRadius: 10,
                    padding: Default.fixPadding * 2,
                    marginBottom: Default.fixPadding * 2,
                    borderWidth: item.available ? 0 : 1,
                    borderColor: item.available ? "transparent" : Colors.lightGrey,
                    ...Default.shadow,
                    opacity: item.available ? 1 : 0.9,
                  }}
                >
                  <View style={{
                    flexDirection: isRtl ? "row-reverse" : "row",
                    alignItems: "center",
                  }}>
                    <View style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      backgroundColor: item.id === "utilities" ? "#E3F2FD" : "#FFF3E0",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: isRtl ? 0 : Default.fixPadding * 2,
                      marginLeft: isRtl ? Default.fixPadding * 2 : 0,
                    }}>
                      <Ionicons
                        name={item.icon}
                        size={30}
                        color={
                          item.available
                            ? item.id === "utilities"
                              ? "#1976D2"
                              : "#FF9800"
                            : Colors.grey
                        }
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ ...Fonts.SemiBold16black }}>
                        {tr(item.title)}
                      </Text>
                      <Text style={{ ...Fonts.Medium14grey, marginTop: Default.fixPadding * 0.5 }}>
                        {tr(item.description)}
                      </Text>
                    </View>
                    <View
                      style={{
                        paddingHorizontal: Default.fixPadding,
                        paddingVertical: Default.fixPadding * 0.4,
                        borderRadius: 999,
                        backgroundColor: item.available ? "#E8F5E9" : "#FDECEC",
                      }}
                    >
                      <Text
                        style={{
                          ...Fonts.Medium12grey,
                          color: item.available ? "#2E7D32" : "#C62828",
                        }}
                      >
                        {item.available ? tr("Available") : tr("Unavailable")}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            : null}

          {catalogNotice ? (
            <View
              style={{
                backgroundColor: "#FFF3E0",
                borderRadius: 10,
                padding: Default.fixPadding * 1.5,
                marginBottom: Default.fixPadding * 2,
              }}
            >
              <Text style={{ ...Fonts.Medium14black }}>
                {tr(catalogNotice)}
              </Text>
            </View>
          ) : null}

          {/* Recent Payments */}
          <View style={{ marginTop: Default.fixPadding }}>
            <Text style={{ ...Fonts.SemiBold16black, marginBottom: Default.fixPadding * 1.5 }}>
              {tr("Recent Payments")}
            </Text>
            
            <View style={{
              backgroundColor: Colors.white,
              borderRadius: 10,
              padding: Default.fixPadding * 2,
              ...Default.shadow,
            }}>
              <Text style={{ ...Fonts.Medium14grey, textAlign: "center" }}>
                {tr("No recent bill payments")}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default PayBillsScreen;
