import React, { useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { ms } from "react-native-size-matters/extend";
import MyStatusBar from "../components/myStatusBar";
import { queryPersonalHubCatalog } from "../services/expressPayService";
import {
  buildCatalogQueryPayload,
  getQueryContextLabel,
  normalizeCatalogOptions,
} from "../services/personalHubCatalogFlowService";

const PolicyDetailsScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  const { provider, externalServiceCode, providerId, providerName, providerLogo } = route.params || {};

  const [policyNumber, setPolicyNumber] = useState("");
  const [description, setDescription] = useState("");
  const [savePolicy, setSavePolicy] = useState(false);
  const [isValidPolicy, setIsValidPolicy] = useState(false);
  const [policyError, setPolicyError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  function tr(key, fallback = "Missing Translation") {
    if (!key) return fallback || "";
    const translated = t(key);
    return translated || fallback;
  }

  const getProviderLogo = () => {
    if (providerLogo) return providerLogo;

    switch (provider) {
      case "enterprise_life":
        return require("../assets/images/pay1.png");
      case "akwantupa":
        return require("../assets/images/pay2.png");
      case "hollard_life":
        return require("../assets/images/pay3.png");
      case "metropolitan_life":
        return require("../assets/images/pay4.png");
      case "old_mutual":
        return require("../assets/images/pay5.png");
      default:
        return require("../assets/images/pay5.png");
    }
  };

  const validatePolicy = (text) => {
    setPolicyNumber(text);
    if (text.length < 6) {
      setIsValidPolicy(false);
      setPolicyError(text.length > 0 ? "Policy number too short" : "");
      return;
    }
    setIsValidPolicy(true);
    setPolicyError("");
  };

  const handleContinue = async () => {
    if (!isValidPolicy) {
      Alert.alert("Invalid Policy", "Please enter a valid policy number");
      return;
    }

    setIsVerifying(true);

    const result = await queryPersonalHubCatalog({
      provider_id: providerId || undefined,
      external_service_code: externalServiceCode || provider || undefined,
      service_type: "insurance",
      payload: {
        ...buildCatalogQueryPayload({
          transactionType: "insurance",
          identifier: policyNumber,
        }),
        provider_name: providerName || null,
      },
    });

    setIsVerifying(false);

    if (!result.success) {
      Alert.alert(
        tr("Unable to Verify Policy"),
        result.error || tr("We could not validate this policy with the selected provider.")
      );
      return;
    }

    const queryContext = result.data?.query_context || {};
    const queryOptions = normalizeCatalogOptions({
      options: result.data?.options || [],
      queryContext,
    });

    navigation.navigate("insuranceAmountScreen", {
      provider,
      externalServiceCode: externalServiceCode || provider || null,
      providerId,
      providerName,
      policyNumber,
      description: description || getQueryContextLabel(queryContext, null),
      savePolicy,
      providerLogo: getProviderLogo(),
      queryContext,
      queryOptions,
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
            <Text style={{ ...Fonts.SemiBold18black }}>{tr("Account Details")}</Text>
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
                alignItems: "center",
                ...Default.shadow,
              }}
            >
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: Colors.extraLightGrey,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: Default.fixPadding,
                  overflow: "hidden",
                }}
              >
                <Image
                  source={getProviderLogo()}
                  style={{
                    width: ms(60),
                    height: ms(60),
                    resizeMode: "contain",
                  }}
                />
              </View>
              <Text style={{ ...Fonts.SemiBold18black }}>{providerName}</Text>
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
              <Text style={{ ...Fonts.SemiBold14grey, marginBottom: Default.fixPadding }}>
                {tr("POLICY NUMBER")}
              </Text>
              <TextInput
                style={{
                  ...Fonts.Medium14black,
                  borderWidth: 1,
                  borderColor: policyError ? Colors.red : Colors.lightGrey,
                  borderRadius: 8,
                  padding: Default.fixPadding,
                  textAlign: isRtl ? "right" : "left",
                }}
                value={policyNumber}
                onChangeText={validatePolicy}
                placeholder="Enter policy number"
                placeholderTextColor={Colors.grey}
                keyboardType="numeric"
              />
              {policyError ? (
                <Text style={{ ...Fonts.Medium12red, marginTop: Default.fixPadding * 0.5 }}>{policyError}</Text>
              ) : null}

              <Text
                style={{
                  ...Fonts.SemiBold14grey,
                  marginTop: Default.fixPadding * 2,
                  marginBottom: Default.fixPadding,
                }}
              >
                {tr("DESCRIPTION (OPTIONAL)")}
              </Text>
              <TextInput
                style={{
                  ...Fonts.Medium14black,
                  borderWidth: 1,
                  borderColor: Colors.lightGrey,
                  borderRadius: 8,
                  padding: Default.fixPadding,
                  textAlign: isRtl ? "right" : "left",
                }}
                value={description}
                onChangeText={setDescription}
                placeholder="e.g. My Life Insurance"
                placeholderTextColor={Colors.grey}
              />

              <View
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: Default.fixPadding * 2,
                }}
              >
                <Text style={{ ...Fonts.SemiBold14black }}>{tr("Save Policy")}</Text>
                <Switch
                  value={savePolicy}
                  onValueChange={setSavePolicy}
                  trackColor={{ false: Colors.lightGrey, true: Colors.primary + "50" }}
                  thumbColor={savePolicy ? Colors.primary : Colors.white}
                />
              </View>
            </View>

            <View
              style={{
                backgroundColor: "#E3F2FD",
                borderRadius: 10,
                padding: Default.fixPadding * 1.5,
                marginBottom: Default.fixPadding * 2,
                flexDirection: isRtl ? "row-reverse" : "row",
              }}
            >
              <MaterialCommunityIcons
                name={isVerifying ? "progress-clock" : "information-outline"}
                size={24}
                color="#1976D2"
                style={{
                  marginRight: isRtl ? 0 : Default.fixPadding,
                  marginLeft: isRtl ? Default.fixPadding : 0,
                }}
              />
              <Text style={{ ...Fonts.Medium14black, flex: 1 }}>
                {isVerifying
                  ? tr("Validating this policy with the insurer...")
                  : tr("We will verify this policy with the insurer and load the available premium options before checkout.")}
              </Text>
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
              disabled={!isValidPolicy || isVerifying}
              style={{
                backgroundColor: isValidPolicy && !isVerifying ? Colors.primary : Colors.grey,
                borderRadius: 10,
                paddingVertical: Default.fixPadding * 1.5,
                alignItems: "center",
              }}
            >
              <Text style={{ ...Fonts.SemiBold16white }}>{isVerifying ? tr("Checking...") : tr("Continue")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PolicyDetailsScreen;
