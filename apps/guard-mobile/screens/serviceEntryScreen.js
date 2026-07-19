import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  ScrollView,
  StyleSheet,
  TextInput,
  Image,
  Modal,
  FlatList,
  Alert,
  Dimensions,
} from "react-native";
import MyStatusBar from "../components/myStatusBar";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { ms } from "react-native-size-matters/extend";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AwesomeButton from "react-native-really-awesome-button";
import * as Contacts from "expo-contacts";
import { useServiceEntries } from '../hooks/useServiceEntries';

const { width, height } = Dimensions.get("window");

const ServiceEntryScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const { loading: serviceLoading, error: serviceError } = useServiceEntries(); // Database integration

  // Get route params for normal service entry mode only
  const { 
    headerTitle, 
    textInputTitle, 
    placeholderTitle, 
    image
  } = route.params || {};

  const isRtl = i18n.dir() == "rtl";

  // State variables
  const [servicemanName, setServicemanName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [serviceTypeModal, setServiceTypeModal] = useState(false);
  const [selectedServiceType, setSelectedServiceType] = useState("");
  const [confirmServiceType, setConfirmServiceType] = useState("");
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [contacts, setContacts] = useState([]);

  // Service type list
  const serviceTypeList = [
    { key: "1", name: "Home Cleaning" },
    { key: "2", name: "Appliances Repair" },
    { key: "3", name: "Carpenters Service" },
    { key: "4", name: "Home Painting" },
    { key: "5", name: "Plumbing Service" },
    { key: "6", name: "Packer Movers" },
    { key: "7", name: "Home Sanitize" },
    { key: "8", name: "Hair Beauty" },
    { key: "9", name: "Laundry Services" },
    { key: "10", name: "Gardening" },
    { key: "11", name: "Cooking" },
    { key: "12", name: "Electrical Services" },
    { key: "13", name: "HVAC Services" },
    { key: "14", name: "Pest Control" },
    { key: "15", name: "Security Services" },
    { key: "16", name: "Water Tank Cleaning" },
    { key: "17", name: "Other" },
  ];

  function tr(key) {
    return t(`serviceEntryScreen:${key}`);
  }
  // Contact picker functions
  const loadContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
        });

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
        Alert.alert('No Contacts', 'No contacts found on your device.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load contacts. Please try again.');
    }
  };

  const selectContact = (contact) => {
    if (!contact) return;
    
    const safeName = contact.name || "";
    const safePhone = contact.phoneNumber || "";
    
    setServicemanName(safeName);
    setPhoneNumber(safePhone.replace(/[^\d]/g, '').slice(-10)); // Extract digits and take last 10
    setShowContactPicker(false);
  };

  const renderItemServiceType = ({ item }) => {
    const isSelected = selectedServiceType === item.name;
    return (
      <TouchableOpacity
        onPress={() => setSelectedServiceType(item.name)}
        style={{
          flex: 1,
          flexDirection: isRtl ? "row-reverse" : "row",
          alignItems: "center",
          marginTop: Default.fixPadding * 2.5,
          marginHorizontal: Default.fixPadding * 2.6,
        }}
      >
        <MaterialCommunityIcons
          name={isSelected ? "record-circle" : "circle-outline"}
          size={22}
          color={isSelected ? Colors.primary : Colors.grey}
        />
        <Text
          numberOfLines={1}
          style={{
            ...Fonts.Medium16black,
            overflow: "hidden",
            marginHorizontal: Default.fixPadding,
          }}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const backAction = () => {
    navigation.pop();
    return true;
  };
  
  useEffect(() => {
    const backSub = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backSub.remove();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <MyStatusBar />
      <View
        style={{
          flexDirection: isRtl ? "row-reverse" : "row",
          alignItems: "center",
          paddingVertical: Default.fixPadding * 1.2,
          paddingHorizontal: Default.fixPadding * 2,
        }}
      >
        <TouchableOpacity onPress={() => navigation.pop()}>
          <Ionicons
            name={isRtl ? "arrow-forward-outline" : "arrow-back-outline"}
            size={25}
            color={Colors.black}
          />
        </TouchableOpacity>
        <Text
          style={{
            ...Fonts.SemiBold18black,
            marginHorizontal: Default.fixPadding,
          }}
        >
          {tr("serviceEntry")}
        </Text>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets={true}
      >
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: Default.fixPadding * 2.8,
          }}
        >
          <Image
            source={require("../assets/images/visitor4.png")}
            style={{ width: ms(110), height: ms(110), resizeMode: "contain" }}
          />
        </View>

        <View
          style={{
            marginTop: Default.fixPadding * 6,
            marginHorizontal: Default.fixPadding * 2,
          }}
        >
          <Text
            style={{
              ...Fonts.Medium16grey,
              textAlign: isRtl ? "right" : "left",
            }}
          >
            {tr("servicemanName")}
          </Text>

          <View
            style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              ...styles.textInputView,
            }}
          >
            <TextInput
              value={servicemanName}
              onChangeText={setServicemanName}
              placeholder={tr("enterName")}
              placeholderTextColor={Colors.grey}
              selectionColor={Colors.primary}
              style={{
                ...Fonts.SemiBold16black,
                flex: 1,
                textAlign: isRtl ? "right" : "left",
                marginRight: isRtl ? 0 : Default.fixPadding,
                marginLeft: isRtl ? Default.fixPadding : 0,
              }}
            />
          </View>

          <Text
            style={{
              ...Fonts.Medium16grey,
              textAlign: isRtl ? "right" : "left",
            }}
          >
            {tr("phoneNumber")}
          </Text>

          <View
            style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              ...styles.textInputView,
            }}
          >
            <TextInput
              maxLength={15}
              value={phoneNumber}
              onChangeText={(value) =>
                setPhoneNumber(String(value || "").replace(/[^\d]/g, ""))
              }
              keyboardType="number-pad"
              placeholder={tr("enterPhoneNumber")}
              placeholderTextColor={Colors.grey}
              selectionColor={Colors.primary}
              style={{
                ...Fonts.SemiBold16black,
                flex: 1,
                textAlign: isRtl ? "right" : "left",
                marginRight: isRtl ? 0 : Default.fixPadding,
                marginLeft: isRtl ? Default.fixPadding : 0,
              }}
            />

            <TouchableOpacity
              onPress={loadContacts}
              style={{
                marginLeft: Default.fixPadding,
                padding: Default.fixPadding * 0.5,
              }}
            >
              <Ionicons
                name="person-circle-outline"
                size={24}
                color={Colors.primary}
              />
            </TouchableOpacity>
          </View>

          <View>
            <Text
              style={{
                ...Fonts.Medium16grey,
                textAlign: isRtl ? "right" : "left",
              }}
            >
              {tr("serviceType")}
            </Text>

            <TouchableOpacity
              onPress={() => setServiceTypeModal(true)}
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                ...styles.textInputView,
              }}
            >
              <Text
                style={{
                  ...(confirmServiceType
                    ? Fonts.SemiBold16black
                    : Fonts.Medium16grey),
                  flex: 1,
                  textAlign: isRtl ? "right" : "left",
                }}
              >
                {confirmServiceType || tr("enterServiceType")}
              </Text>

              <Ionicons
                name="chevron-down"
                size={18}
                color={Colors.black}
              />
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>

      <View
        style={{
          margin: Default.fixPadding * 2,
        }}
      >
        <AwesomeButton
          height={50}
          onPress={() => {
            const cleanedName = String(servicemanName || "").trim();
            const cleanedPhone = String(phoneNumber || "").replace(/[^\d]/g, "");

            if (!cleanedName || !confirmServiceType) {
              Alert.alert(
                tr("missingFields") || "Missing Fields",
                tr("fillAllFields") || "Please fill all required fields"
              );
              return;
            }

            if (cleanedPhone.length < 7) {
              Alert.alert(
                tr("invalidPhone") || "Invalid Phone Number",
                tr("enterValidPhone") || "Please enter a valid phone number"
              );
              return;
            }
            
            navigation.push("flatNoScreen", {
              headerTitle: tr("serviceEntry"),
              title: tr("servicemanName"),
              placeholderTitle: tr("enterName"),
              image: require("../assets/images/visitor4.png"),
              returnScreen: 'serviceEntryScreen',
              guestName: cleanedName,
              phoneNumber: cleanedPhone,
              serviceType: confirmServiceType,
            });
          }}
          raiseLevel={1}
          stretch={true}
          borderRadius={10}
          backgroundShadow={Colors.primary}
          backgroundDarker={Colors.primary}
          backgroundColor={Colors.primary}
        >
          <Text
            numberOfLines={1}
            style={{ ...Fonts.SemiBold18white, overflow: "hidden" }}
          >
            {tr("continue")}
          </Text>
        </AwesomeButton>
      </View>

      {/* Service Type Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={serviceTypeModal}
        onRequestClose={() => setServiceTypeModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPressOut={() => setServiceTypeModal(false)}
          style={{ flex: 1 }}
        >
          <View style={styles.mainModalView}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {}}
              style={{ maxHeight: height * 0.7, ...styles.subModalView }}
            >
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  padding: Default.fixPadding * 1.6,
                }}
              >
                <Text style={{ ...Fonts.Medium18primary }}>
                  {tr("serviceType")}
                </Text>
              </View>
              <View
                style={{
                  height: 1,
                  backgroundColor: Colors.lightGrey,
                  marginBottom: Default.fixPadding,
                }}
              />

              <View style={{ height: 350 }}>
                <FlatList
                  data={serviceTypeList}
                  renderItem={renderItemServiceType}
                  keyExtractor={(item) => item.key}
                  showsVerticalScrollIndicator={false}
                />
              </View>

              <View
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  paddingHorizontal: Default.fixPadding * 2.6,
                  paddingTop: Default.fixPadding * 2,
                  paddingBottom: Default.fixPadding * 2,
                }}
              >
                <TouchableOpacity
                  onPress={() => setServiceTypeModal(false)}
                  style={{
                    marginRight: isRtl ? 0 : Default.fixPadding * 1.5,
                    marginLeft: isRtl ? Default.fixPadding * 1.5 : 0,
                    backgroundColor: Colors.white,
                    ...styles.cancelOkBtn,
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={{ ...Fonts.SemiBold18black, overflow: "hidden" }}
                  >
                    {tr("cancel") || "Cancel"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setConfirmServiceType(selectedServiceType);
                    setServiceTypeModal(false);
                  }}
                  style={{
                    backgroundColor: Colors.primary,
                    ...styles.cancelOkBtn,
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={{ ...Fonts.SemiBold18white, overflow: "hidden" }}
                  >
                    {tr("okay") || "Okay"}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Contact Picker Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showContactPicker}
        onRequestClose={() => setShowContactPicker(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowContactPicker(false)}
          style={{ flex: 1 }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: Colors.transparentBlack,
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {}}
              style={{
                width: "90%",
                maxHeight: "80%",
                backgroundColor: Colors.white,
                borderRadius: 10,
              }}
            >
              <Text
                style={{
                  ...Fonts.SemiBold18primary,
                  textAlign: "center",
                  margin: Default.fixPadding * 2,
                }}
              >
                Select Contact
              </Text>

              <FlatList
                data={contacts}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => selectContact(item)}
                    style={{
                      flexDirection: isRtl ? "row-reverse" : "row",
                      alignItems: "center",
                      paddingHorizontal: Default.fixPadding * 2,
                      paddingVertical: Default.fixPadding * 1.2,
                      borderBottomWidth: 1,
                      borderBottomColor: Colors.lightGrey,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          ...Fonts.SemiBold16black,
                          textAlign: isRtl ? "right" : "left",
                        }}
                      >
                        {item.name}
                      </Text>
                      {item.phoneNumber && (
                        <Text
                          style={{
                            ...Fonts.Medium14grey,
                            textAlign: isRtl ? "right" : "left",
                            marginTop: Default.fixPadding * 0.3,
                          }}
                        >
                          {item.phoneNumber}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                )}
              />

              <TouchableOpacity
                onPress={() => setShowContactPicker(false)}
                style={{
                  backgroundColor: Colors.primary,
                  borderRadius: 10,
                  paddingVertical: Default.fixPadding * 1.2,
                  marginHorizontal: Default.fixPadding * 2,
                  marginVertical: Default.fixPadding * 2,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{ ...Fonts.SemiBold18white, overflow: "hidden", textAlign: "center" }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </View>
  );
};

export default ServiceEntryScreen;

const styles = StyleSheet.create({
  textInputView: {
    alignItems: "center",
    paddingHorizontal: Default.fixPadding,
    paddingVertical: Default.fixPadding * 1.2,
    marginTop: Default.fixPadding,
    marginBottom: Default.fixPadding * 2,
    borderRadius: 10,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  mainModalView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.transparentBlack,
  },
  subModalView: {
    width: width * 0.9,
    borderRadius: 10,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  cancelOkBtn: {
    flex: 1,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Default.fixPadding * 1.2,
    ...Default.shadow,
  },
});
