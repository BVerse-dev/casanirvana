import React, { useState, useRef } from "react";
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
  Modal,
  FlatList,
} from "react-native";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { ms } from "react-native-size-matters/extend";
import MyStatusBar from "../components/myStatusBar";
import * as Contacts from "expo-contacts";

const AccountDetailsScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const [phoneNumber, setPhoneNumber] = useState("");
  const [description, setDescription] = useState("");
  const [saveAccount, setSaveAccount] = useState(true);
  
  // Contact picker states
  const [contacts, setContacts] = useState([]);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Get data from route params
  const { 
    provider, 
    providerName, 
    providerColor,
    providerLogo,
    packageType, 
    amountTitle, 
    amount, 
    amountFormatted 
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
    if (!phoneNumber || phoneNumber.length < 9) {
      // Show error or alert
      return;
    }
    
    // Navigate to payment method selection
    navigation.navigate("paymentMethodScreen", {
      provider,
      providerName,
      providerColor,
      providerLogo,
      packageType,
      amountTitle,
      amount,
      amountFormatted,
      phoneNumber,
      description,
      saveAccount,
      transactionType: 'airtime',
      recipientInfo: {
        phoneNumber,
        name: description || phoneNumber,
        provider: providerName,
        logo: providerLogo
      }
    });
  };

  // Contact permission and loading functions
  const requestContactsPermission = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.log('Permission error:', error);
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
        // Filter contacts that have phone numbers and names
        const validContacts = data.filter(contact => 
          contact.name && 
          contact.phoneNumbers && 
          contact.phoneNumbers.length > 0
        ).map(contact => ({
          id: contact.id,
          name: contact.name,
          phoneNumber: contact.phoneNumbers[0].number
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

  const handleContactPicker = () => {
    loadContacts();
  };

  const isValidPhoneNumber = phoneNumber && phoneNumber.length >= 9;

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
            {tr("Account Details")}
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: Default.fixPadding * 10 }}
        >
          {/* Provider & Amount Info */}
          <View style={{ 
            backgroundColor: Colors.white, 
            padding: Default.fixPadding * 2,
            marginBottom: Default.fixPadding,
            ...Default.shadow,
          }}>
            <View style={{ 
              flexDirection: isRtl ? "row-reverse" : "row",
              alignItems: "center",
              marginBottom: Default.fixPadding * 2,
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
                  {providerName || "Airtime Purchase"}
                </Text>
                <Text style={{ ...Fonts.Medium14primary, marginTop: 2 }}>
                  {amountFormatted || `GHS ${amount?.toFixed(2) || '0.00'}`}
                </Text>
              </View>
            </View>

            <View style={{
              height: 1,
              backgroundColor: Colors.lightGrey,
              marginVertical: Default.fixPadding,
            }} />

            <View style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <Text style={{ ...Fonts.Medium14grey }}>
                {tr("Package")}
              </Text>
              <Text style={{ ...Fonts.SemiBold14black }}>
                {amountTitle || "Airtime"}
              </Text>
            </View>
          </View>

          {/* Phone Number Input */}
          <View style={{ 
            backgroundColor: Colors.white, 
            padding: Default.fixPadding * 2,
            marginBottom: Default.fixPadding,
            ...Default.shadow,
          }}>
            <Text style={{ ...Fonts.SemiBold14grey, marginBottom: Default.fixPadding }}>
              {tr("PHONE NUMBER")}
            </Text>
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
              <TouchableOpacity onPress={handleContactPicker}>
                <Ionicons
                  name="person-circle-outline"
                  size={24}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            </View>

            {/* Description Input */}
            <Text style={{ ...Fonts.SemiBold14grey, marginBottom: Default.fixPadding }}>
              {tr("DESCRIPTION")}
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
              value={description}
              onChangeText={setDescription}
              placeholder={tr("Description (e.g. My mum)")}
              placeholderTextColor={Colors.grey}
            />

            {/* Save Account Toggle */}
            <View
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View>
                <Text style={{ ...Fonts.SemiBold16black }}>
                  {tr("Save Account")}
                </Text>
                <Text style={{ ...Fonts.Medium14grey, marginTop: 2 }}>
                  {tr("Save this account for future transactions")}
                </Text>
              </View>
              <Switch
                value={saveAccount}
                onValueChange={setSaveAccount}
                trackColor={{ false: Colors.lightGrey, true: Colors.primary + '50' }}
                thumbColor={saveAccount ? Colors.primary : Colors.white}
                ios_backgroundColor={Colors.lightGrey}
              />
            </View>
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
              {tr("Enter the phone number you want to top up. You can save this account for future transactions.")}
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
            disabled={!isValidPhoneNumber}
            style={{
              backgroundColor: isValidPhoneNumber ? Colors.primary : Colors.grey,
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

      {/* Contact Picker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showContactPicker}
        onRequestClose={() => setShowContactPicker(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}>
          <View style={{
            backgroundColor: Colors.white,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            height: '80%',
            padding: Default.fixPadding * 2,
          }}>
            {/* Header */}
            <View style={{
              flexDirection: isRtl ? 'row-reverse' : 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: Default.fixPadding * 2,
            }}>
              <Text style={{ ...Fonts.SemiBold18black }}>
                {tr("Select Contact")}
              </Text>
              <TouchableOpacity onPress={() => setShowContactPicker(false)}>
                <Ionicons name="close" size={22} color={Colors.grey} />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={{
              flexDirection: isRtl ? 'row-reverse' : 'row',
              alignItems: 'center',
              backgroundColor: Colors.extraLightGrey,
              borderRadius: 8,
              paddingHorizontal: Default.fixPadding,
              marginBottom: Default.fixPadding * 2,
            }}>
              <Ionicons name="search" size={20} color={Colors.grey} />
              <TextInput
                style={{
                  flex: 1,
                  ...Fonts.Medium14black,
                  padding: Default.fixPadding,
                  textAlign: isRtl ? 'right' : 'left',
                }}
                placeholder={tr("Search contacts")}
                placeholderTextColor={Colors.grey}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Contacts List */}
            <FlatList
              data={contacts.filter(contact => 
                contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                contact.phoneNumber.includes(searchQuery)
              )}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    flexDirection: isRtl ? 'row-reverse' : 'row',
                    alignItems: 'center',
                    paddingVertical: Default.fixPadding,
                    borderBottomWidth: 1,
                    borderBottomColor: Colors.lightGrey,
                  }}
                  onPress={() => selectContact(item)}
                >
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: Colors.primary + '20',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: isRtl ? 0 : Default.fixPadding,
                    marginLeft: isRtl ? Default.fixPadding : 0,
                  }}>
                    <Ionicons name="person" size={20} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ ...Fonts.SemiBold16black }}>{item.name}</Text>
                    <Text style={{ ...Fonts.Medium14grey }}>{item.phoneNumber}</Text>
                  </View>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={{
                  alignItems: 'center',
                  paddingVertical: Default.fixPadding * 2,
                }}>
                  <Text style={{ ...Fonts.Medium14grey }}>
                    {searchQuery ? tr("No matching contacts found") : tr("No contacts available")}
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AccountDetailsScreen;