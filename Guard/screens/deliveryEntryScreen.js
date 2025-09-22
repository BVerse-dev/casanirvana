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
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Contacts from "expo-contacts";

// PROFESSIONAL: Import all necessary services from the start
import { useDeliveryEntries } from '../hooks/useDeliveryEntries';
import { useGuardAuth } from '../contexts/GuardAuthContext';
import { validateAndGetUnitId, getUnitResident } from '../services/unitValidationService';

const { width, height } = Dimensions.get("window");

// PROFESSIONAL: Detail row component for confirmation view
const DetailRow = ({ label, value, isRtl = false }) => (
  <View style={{ marginBottom: Default.fixPadding }}>
    <Text
      style={{
        ...Fonts.Medium14grey,
        textAlign: isRtl ? "right" : "left",
      }}
    >
      {label}
    </Text>
    <Text
      style={{
        ...Fonts.SemiBold16black,
        textAlign: isRtl ? "right" : "left",
        marginTop: Default.fixPadding * 0.3,
      }}
    >
      {value}
    </Text>
  </View>
);

const DeliveryEntryScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  
  // PROFESSIONAL: Always get authentication context first
  const { guard, user, isAuthenticated } = useGuardAuth();
  const { createDeliveryEntry } = useDeliveryEntries();

  // Get route params for confirmation mode
  const { 
    key, 
    headerTitle, 
    selectedFlatNo, 
    textInputTitle, 
    placeholderTitle, 
    image, 
    deliverymanName: paramDeliverymanName 
  } = route.params || {};

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`deliveryEntryScreen:${key}`);
  }
  const backAction = () => {
    navigation.pop();
    return true;
  };
  useEffect(() => {
    const backSub = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backSub.remove();
  }, []);

  const [deliverymanName, setDeliverymanName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [entryTime, setEntryTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Dropdown states
  const [companyNameModal, setCompanyNameModal] = useState(false);
  const [selectedCompanyName, setSelectedCompanyName] = useState("");
  const [confirmCompanyName, setConfirmCompanyName] = useState("");

  // Contact picker states
  const [contacts, setContacts] = useState([]);
  const [showContactPicker, setShowContactPicker] = useState(false);

  // Flat and host name states (for confirmation mode)
  const [selectedFlat, setSelectedFlat] = useState(selectedFlatNo || "");
  const [hostName, setHostName] = useState("");
  
  // PROFESSIONAL: Add state for tracking delivery entry ID and submission
  const [submitting, setSubmitting] = useState(false);
  const [unitId, setUnitId] = useState(null);
  const [deliveryEntryId, setDeliveryEntryId] = useState(null);

  // PROFESSIONAL: Replace hardcoded mapping with database lookup
  // Load host name from database for the selected flat
  const loadHostName = async (flatNumber) => {
    if (!flatNumber || !guard?.community_id) {
      setHostName("");
      setUnitId(null);
      return;
    }

    try {
      const unitInfo = await validateAndGetUnitId(flatNumber, guard.community_id);
      const resident = await getUnitResident(unitInfo.unitId);
      setHostName(resident ? resident.name : "Unknown Resident");
      setUnitId(unitInfo.unitId);
    } catch (err) {
      console.error('Error loading host name:', err);
      setHostName("Unknown Resident");
      setUnitId(null);
    }
  };

  // Handle navigation return from flat selection
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Check route params for selectedFlat
      const currentRoute = navigation.getState()?.routes?.find(route => route.name === 'deliveryEntryScreen');
      const params = currentRoute?.params;
      
      if (params?.selectedFlatNo) {
        setSelectedFlat(params.selectedFlatNo);
        loadHostName(params.selectedFlatNo); // PROFESSIONAL: Use database lookup
        
        // Clear the params to prevent re-triggering
        navigation.setParams({ selectedFlatNo: undefined });
      }
    });
    return unsubscribe;
  }, [navigation]);

  // Also check route params on component mount
  useEffect(() => {
    if (route.params?.selectedFlatNo) {
      setSelectedFlat(route.params.selectedFlatNo);
      loadHostName(route.params.selectedFlatNo); // PROFESSIONAL: Use database lookup
    }
  }, [route.params]);

  // Delivery company list (same as user app)
  const companyNameList = [
    { key: "1", name: "Yango Delivery" },
    { key: "2", name: "Uber Delivery" },
    { key: "3", name: "Bolt Delivery" },
    { key: "4", name: "Taxi/Bike" },
    { key: "5", name: "Other" },
  ];

  const formatTime = (time) => {
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const showTimeSelector = () => {
    setShowTimePicker(true);
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setEntryTime(selectedTime);
    }
  };

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
    
    setDeliverymanName(safeName);
    setPhoneNumber(safePhone.replace(/[^\d]/g, '').slice(-10)); // Extract digits and take last 10
    setShowContactPicker(false);
  };

  const renderItemCompanyName = ({ item }) => {
    const isSelected = selectedCompanyName === item.name;
    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedCompanyName(item.name);
        }}
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
          {key === "2" ? headerTitle : tr("deliveryEntry")}
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
            source={require("../assets/images/visitor3.png")}
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
            {tr("deliverymanName")}
          </Text>

          <View
            style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              ...styles.textInputView,
            }}
          >
            <TextInput
              value={deliverymanName}
              onChangeText={setDeliverymanName}
              placeholder={tr("enterDeliverymanName")}
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
              maxLength={10}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
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

          <Text
            style={{
              ...Fonts.Medium16grey,
              textAlign: isRtl ? "right" : "left",
            }}
          >
            {tr("deliveryCompany")}
          </Text>

          <TouchableOpacity
            onPress={() => setCompanyNameModal(true)}
            style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              ...styles.textInputView,
            }}
          >
            <Text
              style={{
                ...(confirmCompanyName
                  ? Fonts.SemiBold16black
                  : Fonts.Medium16grey),
                flex: 1,
                textAlign: isRtl ? "right" : "left",
              }}
            >
              {confirmCompanyName || tr("enterDeliveryCompany")}
            </Text>

            <Ionicons
              name="chevron-down"
              size={18}
              color={Colors.black}
            />
          </TouchableOpacity>

          <Text
            style={{
              ...Fonts.Medium16grey,
              textAlign: isRtl ? "right" : "left",
            }}
          >
            {tr("timeOfEntry")}
          </Text>

          <TouchableOpacity
            onPress={showTimeSelector}
            style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              ...styles.textInputView,
            }}
          >
            <Text
              style={{
                ...Fonts.SemiBold16black,
                flex: 1,
                textAlign: isRtl ? "right" : "left",
              }}
            >
              {formatTime(entryTime)}
            </Text>

            <Ionicons
              name="time-outline"
              size={20}
              color={Colors.primary}
            />
          </TouchableOpacity>
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
            // Validate required fields first
            const isValid = deliverymanName.trim() && phoneNumber.trim() && confirmCompanyName;
            
            if (!isValid) {
              Alert.alert(
                tr("missingFields") || "Missing Fields",
                tr("fillAllFields") || "Please fill all required fields"
              );
              return;
            }

            if (selectedFlat) {
              // Follow cab entry pattern: Go directly to entry confirmation screen
              navigation.push("entryConfirmationScreen", {
                name: deliverymanName,
                phoneNumber: phoneNumber,
                visiting: selectedFlat,
                hostName,
                insideTime: "2 hours", // Default for deliveries
                selectedTime: new Date().toISOString(),
                entryType: 'delivery',
                guestDetails: `${confirmCompanyName} - ${deliverymanName}`,
                guestMessage: `Package delivery from ${confirmCompanyName}`
              });
            } else {
              // Navigate to flat selection
              const navParams = {
                headerTitle: tr("selectFlatUnit") || "Select flat unit",
                title: `${confirmCompanyName}|${tr("deliverymanName")}`, // FIXED: Encode company in title
                placeholderTitle: tr("enterDeliverymanName"),
                image: require("../assets/images/visitor3.png"),
                returnScreen: 'deliveryEntryScreen',
                guestName: deliverymanName,
                phoneNumber: phoneNumber,
                deliveryCompany: confirmCompanyName,
                companyName: confirmCompanyName, // FIXED: Add as backup parameter
                navigationSource: 'DELIVERY_ENTRY_SCREEN' // Add unique identifier
              };
              
              // Use navigate instead of push to force parameter refresh
              navigation.navigate("flatNoScreen", navParams);
            }
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
            {selectedFlat ? (tr("confirmNotification") || "Confirm and send notification") : tr("continue")}
          </Text>
        </AwesomeButton>
      </View>

      {/* Company Name Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={companyNameModal}
        onRequestClose={() => setCompanyNameModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPressOut={() => setCompanyNameModal(false)}
          style={{ flex: 1 }}
        >
          <View style={styles.mainModalView}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {}}
              style={{ maxHeight: height / 2, ...styles.subModalView }}
            >
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  padding: Default.fixPadding * 1.6,
                }}
              >
                <Text style={{ ...Fonts.Medium18primary }}>
                  {tr("deliveryCompany")}
                </Text>
              </View>
              <View
                style={{
                  height: 1,
                  backgroundColor: Colors.lightGrey,
                  marginBottom: Default.fixPadding,
                }}
              />

              <View style={{ maxHeight: 300 }}>
                <FlatList
                  data={companyNameList}
                  renderItem={renderItemCompanyName}
                  keyExtractor={(item) => item.key}
                  showsVerticalScrollIndicator={false}
                />
              </View>

              <View
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  paddingHorizontal: Default.fixPadding * 2.6,
                  marginTop: Default.fixPadding * 1.3,
                  marginBottom: Default.fixPadding * 2.2,
                }}
              >
                <TouchableOpacity
                  onPress={() => setCompanyNameModal(false)}
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
                    setConfirmCompanyName(selectedCompanyName);
                    setCompanyNameModal(false);
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

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={entryTime}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={onTimeChange}
        />
      )}
    </View>
  );
};

export default DeliveryEntryScreen;

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
