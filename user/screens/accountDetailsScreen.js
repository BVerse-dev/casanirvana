import React, { useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Switch,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  BackHandler,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { ms } from "react-native-size-matters/extend";
import MyStatusBar from "../components/myStatusBar";
import * as Contacts from "expo-contacts";
import { queryPersonalHubCatalog } from "../services/expressPayService";
import {
  buildCatalogQueryPayload,
  normalizeCatalogOptions,
} from "../services/personalHubCatalogFlowService";

const AccountDetailsScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const [phoneNumber, setPhoneNumber] = useState("");
  const [description, setDescription] = useState("");
  const [saveAccount, setSaveAccount] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCheckingProvider, setIsCheckingProvider] = useState(false);

  const {
    provider,
    externalServiceCode,
    providerId,
    providerName,
    providerColor,
    providerLogo,
    supportsQuery,
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

  const requestContactsPermission = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.log("Permission error:", error);
      return false;
    }
  };

  const loadContacts = async () => {
    try {
      const hasPermission = await requestContactsPermission();
      if (!hasPermission) {
        Alert.alert(
          tr("Permission Required"),
          tr("Please grant contacts permission to select from your contacts.")
        );
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
      });

      if (data.length > 0) {
        const validContacts = data
          .filter((contact) => contact.name && contact.phoneNumbers && contact.phoneNumbers.length > 0)
          .map((contact) => ({
            id: contact.id,
            name: contact.name,
            phoneNumber: contact.phoneNumbers[0].number,
          }));

        setContacts(validContacts);
        setShowContactPicker(true);
      } else {
        Alert.alert(tr("No Contacts"), tr("No contacts found on your device."));
      }
    } catch (error) {
      Alert.alert(tr("Error"), tr("Failed to load contacts. Please try again."));
    }
  };

  const selectContact = (contact) => {
    if (!contact) return;

    const safeName = contact.name || "";
    const safePhone = contact.phoneNumber || "";

    setPhoneNumber(safePhone);
    if (!description && safeName) {
      setDescription(safeName);
    }
    setShowContactPicker(false);
  };

  const handleContinue = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      Alert.alert(tr("Invalid Number"), tr("Please enter a valid phone number."));
      return;
    }

    if (supportsQuery === false) {
      navigation.navigate("otherAmountScreen", {
        provider,
        externalServiceCode: externalServiceCode || provider || null,
        providerId,
        providerName,
        providerColor,
        providerLogo,
        phoneNumber,
        description,
        saveAccount,
        transactionType: "airtime",
      });
      return;
    }

    setIsCheckingProvider(true);

    const result = await queryPersonalHubCatalog({
      provider_id: providerId || undefined,
      external_service_code: externalServiceCode || provider || undefined,
      service_type: "airtime",
      payload: {
        ...buildCatalogQueryPayload({
          transactionType: "airtime",
          identifier: phoneNumber,
        }),
        provider_name: providerName || null,
      },
    });

    setIsCheckingProvider(false);

    if (!result.success) {
      Alert.alert(
        tr("Unable to Check Amounts"),
        result.error || tr("We could not load airtime options for this number.")
      );
      return;
    }

    const queryContext = result.data?.query_context || {};
    const queryOptions = normalizeCatalogOptions({
      options: result.data?.options || [],
      queryContext,
    });

    if (queryOptions.length) {
      navigation.navigate("amountScreen", {
        provider,
        externalServiceCode: externalServiceCode || provider || null,
        providerId,
        providerName,
        providerColor,
        providerLogo,
        phoneNumber,
        description,
        saveAccount,
        queryContext,
        queryOptions,
        transactionType: "airtime",
      });
      return;
    }

    navigation.navigate("otherAmountScreen", {
      provider,
      externalServiceCode: externalServiceCode || provider || null,
      providerId,
      providerName,
      providerColor,
      providerLogo,
      phoneNumber,
      description,
      saveAccount,
      queryContext,
      transactionType: "airtime",
    });
  };

  const isValidPhoneNumber = phoneNumber && phoneNumber.length >= 9;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.extraLightGrey }}>
      <MyStatusBar />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : null} style={{ flex: 1 }}>
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
          contentContainerStyle={{ flexGrow: 1, paddingBottom: Default.fixPadding * 10 }}
        >
          <View
            style={{
              backgroundColor: Colors.white,
              padding: Default.fixPadding * 2,
              marginBottom: Default.fixPadding,
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
                <Text style={{ ...Fonts.Medium14grey, marginTop: 2 }}>
                  {tr("We will confirm the available airtime options for this number before checkout.")}
                </Text>
              </View>
            </View>
          </View>

          <View
            style={{
              backgroundColor: Colors.white,
              padding: Default.fixPadding * 2,
              marginBottom: Default.fixPadding,
              ...Default.shadow,
            }}
          >
            <Text style={{ ...Fonts.SemiBold14grey, marginBottom: Default.fixPadding }}>{tr("PHONE NUMBER")}</Text>
            <View
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: Colors.lightGrey,
                borderRadius: 8,
                paddingHorizontal: Default.fixPadding,
                marginBottom: Default.fixPadding * 2,
              }}
            >
              <TextInput
                style={{
                  flex: 1,
                  ...Fonts.Medium16black,
                  textAlign: isRtl ? "right" : "left",
                  padding: Default.fixPadding,
                }}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                placeholder={tr("Phone number")}
                placeholderTextColor={Colors.grey}
              />
              <TouchableOpacity onPress={loadContacts}>
                <Ionicons name="person-circle-outline" size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            <Text style={{ ...Fonts.SemiBold14grey, marginBottom: Default.fixPadding }}>{tr("DESCRIPTION")}</Text>
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
              value={description}
              onChangeText={setDescription}
              placeholder={tr("Description (e.g. My mum)")}
              placeholderTextColor={Colors.grey}
            />

            <View
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View>
                <Text style={{ ...Fonts.SemiBold16black }}>{tr("Save Account")}</Text>
                <Text style={{ ...Fonts.Medium14grey, marginTop: 2 }}>
                  {tr("Save this account for future transactions")}
                </Text>
              </View>
              <Switch
                value={saveAccount}
                onValueChange={setSaveAccount}
                trackColor={{ false: Colors.lightGrey, true: Colors.primary + "50" }}
                thumbColor={saveAccount ? Colors.primary : Colors.white}
                ios_backgroundColor={Colors.lightGrey}
              />
            </View>
          </View>

          <View
            style={{
              backgroundColor: Colors.lightLinkWater,
              margin: Default.fixPadding * 2,
              padding: Default.fixPadding * 1.5,
              borderRadius: 8,
              flexDirection: isRtl ? "row-reverse" : "row",
            }}
          >
            <MaterialCommunityIcons
              name={isCheckingProvider ? "progress-clock" : "information-outline"}
              size={20}
              color={Colors.blue}
              style={{
                marginRight: isRtl ? 0 : Default.fixPadding,
                marginLeft: isRtl ? Default.fixPadding : 0,
                marginTop: 2,
              }}
            />
            <Text style={{ ...Fonts.Medium14black, flex: 1 }}>
              {isCheckingProvider
                ? tr("Checking available airtime options for this number...")
                : tr("Enter the number you want to top up. If the provider returns fixed denominations, you will choose from them next.")}
            </Text>
          </View>
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
            disabled={!isValidPhoneNumber || isCheckingProvider}
            style={{
              backgroundColor: isValidPhoneNumber && !isCheckingProvider ? Colors.primary : Colors.grey,
              borderRadius: 10,
              paddingVertical: Default.fixPadding * 1.5,
              alignItems: "center",
            }}
          >
            <Text style={{ ...Fonts.SemiBold16white }}>
              {isCheckingProvider ? tr("Checking...") : tr("Continue")}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal
        animationType="slide"
        transparent
        visible={showContactPicker}
        onRequestClose={() => setShowContactPicker(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: Colors.white,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              height: "80%",
              padding: Default.fixPadding * 2,
            }}
          >
            <View
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: Default.fixPadding * 2,
              }}
            >
              <Text style={{ ...Fonts.SemiBold18black }}>{tr("Select Contact")}</Text>
              <TouchableOpacity onPress={() => setShowContactPicker(false)}>
                <Ionicons name="close" size={22} color={Colors.grey} />
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                alignItems: "center",
                backgroundColor: Colors.extraLightGrey,
                borderRadius: 8,
                paddingHorizontal: Default.fixPadding,
                marginBottom: Default.fixPadding * 2,
              }}
            >
              <Ionicons name="search" size={20} color={Colors.grey} />
              <TextInput
                style={{
                  flex: 1,
                  ...Fonts.Medium14black,
                  padding: Default.fixPadding,
                  textAlign: isRtl ? "right" : "left",
                }}
                placeholder={tr("Search contacts")}
                placeholderTextColor={Colors.grey}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <FlatList
              data={contacts.filter(
                (contact) =>
                  contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  contact.phoneNumber.includes(searchQuery)
              )}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    flexDirection: isRtl ? "row-reverse" : "row",
                    alignItems: "center",
                    paddingVertical: Default.fixPadding,
                    borderBottomWidth: 1,
                    borderBottomColor: Colors.lightGrey,
                  }}
                  onPress={() => selectContact(item)}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: Colors.primary + "20",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: isRtl ? 0 : Default.fixPadding,
                      marginLeft: isRtl ? Default.fixPadding : 0,
                    }}
                  >
                    <Ionicons name="person" size={20} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ ...Fonts.SemiBold14black }}>{item.name}</Text>
                    <Text style={{ ...Fonts.Medium12grey, marginTop: 2 }}>{item.phoneNumber}</Text>
                  </View>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AccountDetailsScreen;
