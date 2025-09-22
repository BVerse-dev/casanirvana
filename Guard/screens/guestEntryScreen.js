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
} from "react-native";
import MyStatusBar from "../components/myStatusBar";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { useGuardAuth } from '../contexts/GuardAuthContext';
import { validateAndGetUnitId, getUnitResident } from '../services/unitValidationService';
import { supabase } from '../utils/supabase';
import { ms } from "react-native-size-matters/extend";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AwesomeButton from "react-native-really-awesome-button";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Contacts from "expo-contacts";

const GuestEntryScreen = ({ navigation, route }) => {
  const {
    key,
    image,
    selectedFlatNo,
    headerTitle,
    textInputTitle,
    placeholderTitle,
    guestName,
    phoneNumber,
  } = route.params || {};

  const { t, i18n } = useTranslation();
  const { guard, user, isAuthenticated } = useGuardAuth();

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`guestEntryScreen:${key}`);
  }
  const backAction = () => {
    navigation.pop();
    return true;
  };
  useEffect(() => {
    const backSub = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backSub.remove();
  }, []);

  const [name, setName] = useState(guestName || "");
  const [mobileNumber, setMobileNumber] = useState(phoneNumber || "");
  const [insideTime, setInsideTime] = useState("1 hour");
  const [visiting, setVisiting] = useState(selectedFlatNo || "");
  const [hostName, setHostName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Contact picker states
  const [contacts, setContacts] = useState([]);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Time picker states
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [timePickerVisible, setTimePickerVisible] = useState(false);

  // Load host name from database for the selected flat
  const loadHostName = async (flatNumber) => {
    if (!flatNumber || !guard?.community_id) {
      setHostName("");
      return;
    }

    try {
      const unitInfo = await validateAndGetUnitId(flatNumber, guard.community_id);
      const resident = await getUnitResident(unitInfo.unitId);
      setHostName(resident ? resident.name : "Unknown Resident");
    } catch (err) {
      console.error('Error loading host name:', err);
      setHostName("Unknown Resident");
    }
  };

  // Load host name when component mounts or selectedFlatNo changes
  useEffect(() => {
    if (selectedFlatNo) {
      loadHostName(selectedFlatNo);
    } else {
      setHostName("");
    }
  }, [selectedFlatNo, guard?.community_id]);

  // Load resident information for selected flat (secure database lookup)
  const loadResidentInfo = async (flatNo) => {
    if (!flatNo || !guard?.community_id) return;
    
    try {
      const unitInfo = await validateAndGetUnitId(flatNo, guard.community_id);
      const resident = await getUnitResident(unitInfo.unitId);
      setHostName(resident ? resident.name : "Unknown Resident");
    } catch (err) {
      console.error('Error loading resident info:', err);
      setHostName("Unknown Resident");
    }
  };

  // Load resident info when flat is selected
  useEffect(() => {
    if (selectedFlatNo) {
      loadResidentInfo(selectedFlatNo);
    } else {
      setHostName("");
    }
  }, [selectedFlatNo, guard?.community_id]);

  // Direct visitor pass creation without subscription
  const createVisitorPassDirect = async (visitorPassData) => {
    try {
      const { data, error } = await supabase
        .from('visitor_passes')
        .insert([{
          ...visitorPassData,
          entry_method: 'walk_in',
          status: 'pending',
          created_at: new Date().toISOString()
        }])
        .select('id')
        .single();
        
      if (error) throw error;
      return data?.id || null;
    } catch (err) {
      console.error('Error creating visitor pass:', err);
      throw err;
    }
  };

  // Industry-standard visitor pass creation with auth context
  const handleCreateVisitorPass = async () => {
    // This function is no longer used since we go directly to entryConfirmationScreen
    // from flatNoScreen. The visitor pass creation now happens in entryConfirmationScreen.
    console.log("handleCreateVisitorPass called - redirecting to flat selection");
    
    // Redirect to flat selection if somehow this is called
    navigation.push("flatNoScreen", {
      headerTitle: tr("selectFlatUnit"),
      title: tr("guestName"),
      placeholderTitle: tr("enterGuestName"),
      image: require("../assets/images/visitor1.png"),
      guestName: name,
      phoneNumber: mobileNumber,
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
        Alert.alert('Permission Required', 'Please grant contacts permission to select from your contacts.');
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
    
    setName(safeName);
    setMobileNumber(safePhone.replace(/[^\d]/g, '').slice(-10)); // Extract digits and take last 10
    setShowContactPicker(false);
  };

  // Time picker functions
  const onTimeChange = (event, selectedTime) => {
    setTimePickerVisible(false);
    if (selectedTime) {
      setSelectedTime(selectedTime);
    }
  };

  const formatTime = (time) => {
    let hours = time.getHours();
    const minutes = time.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? "0" + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  };

  // Filter contacts based on search query
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phoneNumber.includes(searchQuery)
  );

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
          {key === "2" ? headerTitle : tr("guestEntry")}
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
            source={
              key === "2" ? image : require("../assets/images/visitor1.png")
            }
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
            {key === "2" ? textInputTitle : tr("guestName")}
          </Text>

          <View
            style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              marginBottom: Default.fixPadding * 2,
              ...styles.textInputView,
            }}
          >
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={
                key === "2" ? placeholderTitle : tr("enterGuestName")
              }
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

          {key === "2" ? (
            <View>
              <Text
                style={{
                  ...Fonts.Medium16grey,
                  textAlign: isRtl ? "right" : "left",
                }}
              >
                {tr("visiting")}
              </Text>

              <View
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  marginBottom: Default.fixPadding * 2,
                  ...styles.textInputView,
                }}
              >
                <TextInput
                  value={visiting}
                  onChangeText={setVisiting}
                  placeholder={tr("enterVisiting")}
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

              {/* Host Name Field */}
              <Text
                style={{
                  ...Fonts.Medium16grey,
                  textAlign: isRtl ? "right" : "left",
                }}
              >
                {tr("hostName")}
              </Text>

              <View
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  marginBottom: Default.fixPadding * 2,
                  ...styles.textInputView,
                }}
              >
                <Text
                  style={{
                    ...Fonts.SemiBold16black,
                    flex: 1,
                    textAlign: isRtl ? "right" : "left",
                    marginRight: isRtl ? 0 : Default.fixPadding,
                    marginLeft: isRtl ? Default.fixPadding : 0,
                    paddingVertical: Default.fixPadding * 0.8,
                  }}
                >
                  {hostName}
                </Text>
              </View>
            </View>
          ) : (
            <View>
              <Text
                style={{
                  ...Fonts.Medium16grey,
                  textAlign: isRtl ? "right" : "left",
                }}
              >
                Phone Number
              </Text>
              <View
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  marginBottom: Default.fixPadding * 2,
                  ...styles.textInputView,
                }}
              >
                <TextInput
                  maxLength={10}
                  value={mobileNumber}
                  onChangeText={setMobileNumber}
                  keyboardType="number-pad"
                  placeholder="Enter Phone Number"
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
            </View>
          )}

          <Text
            style={{
              ...Fonts.Medium16grey,
              textAlign: isRtl ? "right" : "left",
            }}
          >
            {tr("timeOfEntry")}
          </Text>

          <TouchableOpacity
            onPress={() => setTimePickerVisible(true)}
            style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              marginBottom: Default.fixPadding * 2,
              ...styles.textInputView,
            }}
          >
            <Text
              style={{
                ...Fonts.SemiBold16black,
                flex: 1,
                textAlign: isRtl ? "right" : "left",
                marginRight: isRtl ? 0 : Default.fixPadding,
                marginLeft: isRtl ? Default.fixPadding : 0,
              }}
            >
              {formatTime(selectedTime)}
            </Text>

            <MaterialCommunityIcons
              name="clock-time-three-outline"
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
          onPress={async () => {
            if (key === "2") {
              // Confirmation mode: Create visitor pass and proceed
              await handleCreateVisitorPass();
            } else {
              // Initial mode: Navigate to flat selection
              navigation.push("flatNoScreen", {
                headerTitle: tr("selectFlatUnit"),
                title: tr("guestName"),
                placeholderTitle: tr("enterGuestName"),
                image: require("../assets/images/visitor1.png"),
                guestName: name, // Pass the entered guest name
                phoneNumber: mobileNumber, // Pass the phone number
              });
            }
          }}
          disabled={submitting}
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
            {submitting 
              ? "Creating..." 
              : (key === "2" ? tr("confirmNotification") : tr("continue"))
            }
          </Text>
        </AwesomeButton>
      </View>

      {/* Contact Picker Modal */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={showContactPicker}
        onRequestClose={() => setShowContactPicker(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: Colors.transparentBlack }}
          onPress={() => setShowContactPicker(false)}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              marginHorizontal: Default.fixPadding * 2,
            }}
          >
            <TouchableOpacity
              style={{
                width: "100%",
                maxHeight: "70%",
                backgroundColor: Colors.white,
                borderRadius: 20,
                paddingTop: Default.fixPadding * 2,
              }}
              onPress={() => {}}
            >
              <Text
                style={{
                  ...Fonts.SemiBold18black,
                  textAlign: "center",
                  marginBottom: Default.fixPadding,
                }}
              >
                Select Contact
              </Text>

              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search contacts..."
                placeholderTextColor={Colors.grey}
                style={{
                  ...Fonts.Medium14black,
                  marginHorizontal: Default.fixPadding * 2,
                  paddingHorizontal: Default.fixPadding,
                  paddingVertical: Default.fixPadding,
                  borderWidth: 1,
                  borderColor: Colors.lightGrey,
                  borderRadius: 8,
                  marginBottom: Default.fixPadding,
                }}
              />

              <FlatList
                data={filteredContacts}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => selectContact(item)}
                    style={{
                      paddingHorizontal: Default.fixPadding * 2,
                      paddingVertical: Default.fixPadding * 1.5,
                      borderBottomWidth: 1,
                      borderBottomColor: Colors.extraLightGrey,
                    }}
                  >
                    <Text style={Fonts.Medium16black}>{item.name}</Text>
                    {item.phoneNumber && (
                      <Text style={Fonts.Medium14grey}>
                        {item.phoneNumber}
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              />

              <View
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  alignItems: "center",
                  marginTop: Default.fixPadding * 2,
                  marginBottom: Default.fixPadding * 2.6,
                  marginHorizontal: Default.fixPadding * 2.6,
                }}
              >
                <TouchableOpacity
                  onPress={() => setShowContactPicker(false)}
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    paddingVertical: Default.fixPadding * 1.2,
                    borderRadius: 10,
                    backgroundColor: Colors.white,
                    borderWidth: 1,
                    borderColor: Colors.lightGrey,
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={{ ...Fonts.SemiBold18black, overflow: "hidden" }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Time Picker */}
      {timePickerVisible && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          is24Hour={false}
          onChange={onTimeChange}
          accentColor={Colors.primary}
        />
      )}
    </View>
  );
};

export default GuestEntryScreen;

const styles = StyleSheet.create({
  textInputView: {
    alignItems: "center",
    paddingHorizontal: Default.fixPadding,
    paddingVertical: Default.fixPadding * 1.2,
    marginTop: Default.fixPadding,
    borderRadius: 10,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
});
