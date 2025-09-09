import React, { useState } from "react";
import {
  Text,
  View,
  Modal,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  FlatList,
  Alert,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Colors, Fonts, Default } from "../constants/styles";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import AwesomeButton from "react-native-really-awesome-button";
import moment from "moment";
import FromToCalendarPicker from "./fromToCalendarPicker";
import GatePassModal from "./gatePassModal";
import * as Contacts from "expo-contacts";

const { width, height } = Dimensions.get("window");

const AllowGuestModal = (props) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() == "rtl";

  // Safe translation function that ALWAYS returns a valid string
  const tr = (key, fallback = "") => {
    try {
      const translation = t(`allowGuestModal:${key}`);
      if (translation && typeof translation === 'string' && translation.trim() !== '') {
        return translation;
      }
      return fallback || key;
    } catch (error) {
      return fallback || key;
    }
  };

  const [guestName, setGuestName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [send, setSend] = useState(true);
  const today = moment().format("YYYY-MM-DD");

  const [openGatePassModal, setOpenGatePassModal] = useState(false);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [date, setDate] = useState("");
  const [dateCalendarModal, setDateCalendarModal] = useState(false);

  const onDateChange = (day) => {
    setDate(day.dateString);
    setDateCalendarModal(false);
  };

  // Contact picker functions
  const requestContactsPermission = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === 'granted') {
      return true;
    } else {
      Alert.alert(
        'Permission Required',
        'This app needs access to your contacts to help you select guests quickly.',
        [{ text: 'OK' }]
      );
      return false;
    }
  };

  const loadContacts = async () => {
    try {
      const hasPermission = await requestContactsPermission();
      if (!hasPermission) return;

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
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load contacts. Please try again.');
    }
  };
  const selectContact = (contact) => {
    if (!contact) return;
    
    const safeName = contact.name || "";
    const safePhone = contact.phoneNumber || "";
    
    setGuestName(safeName);
    setPhoneNumber(safePhone.replace(/[^\d]/g, '').slice(-10)); // Extract digits and take last 10
    setShowContactPicker(false);
    setSearchQuery('');
  };
  const filteredContacts = contacts.filter(contact =>
    (contact.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (contact.phoneNumber || "").includes(searchQuery)
  );
  const renderContactItem = ({ item }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => selectContact(item)}
    >
      <View style={styles.contactAvatar}>
        <Text style={styles.contactAvatarText}>
          {(item.name || "?").charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName} numberOfLines={1}>
          {item.name || "Unknown"}
        </Text>
        <Text style={styles.contactPhone} numberOfLines={1}>
          {item.phoneNumber || "No number"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={props.visible}
      onRequestClose={props.closeAllowGuestModal}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressOut={props.closeAllowGuestModal}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView behavior={"padding"} style={{ flex: 1 }}>
          <View style={styles.mainModalView}>
            <TouchableWithoutFeedback>
              <View
                style={{ maxHeight: height / 1.55, ...styles.subModalView }}
              >
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <View style={styles.topImageView}>
                    <Image
                      source={require("../assets/images/pre1.png")}
                      style={{ width: 54, height: 54, resizeMode: "contain" }}
                    />
                  </View>
                </View>
                <TouchableOpacity
                  onPress={props.closeAllowGuestModal}
                  style={{
                    position: "absolute",
                    right: isRtl ? null : 0,
                    marginTop: Default.fixPadding * 1.2,
                    marginHorizontal: Default.fixPadding * 1.1,
                  }}
                >
                  <Ionicons name="close" size={22} color={Colors.grey} />
                </TouchableOpacity>                <Text
                  numberOfLines={1}
                  style={{
                    ...Fonts.SemiBold16black,
                    overflow: "hidden",
                    textAlign: "center",
                    marginTop: Default.fixPadding,
                    marginBottom: Default.fixPadding * 2,
                  }}                >
                  {tr("allowMyGuest", "Allow My Guest")}
                </Text>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  automaticallyAdjustKeyboardInsets={true}
                >
                  <View>
                    <View
                      style={{
                        marginTop: Default.fixPadding * 2,
                        marginHorizontal: Default.fixPadding * 2,
                      }}
                    >
                      <Text
                        style={{
                          ...Fonts.Medium16black,
                          textAlign: isRtl ? "right" : "left",
                        }}                      >
                        {tr("guestName", "Guest Name")}
                      </Text>
                      <View
                        style={{
                          flexDirection: isRtl ? "row-reverse" : "row",
                          alignItems: "center",
                          ...styles.textInputView,
                        }}
                      >                        <TextInput
                          value={guestName}
                          onChangeText={setGuestName}
                          placeholder={tr("enterGuestName", "Enter guest name")}
                          placeholderTextColor={Colors.grey}
                          selectionColor={Colors.primary}
                          style={{
                            ...Fonts.Medium14black,
                            flex: 1,
                            textAlign: isRtl ? "right" : "left",
                            marginRight: isRtl ? 0 : Default.fixPadding,
                            marginLeft: isRtl ? Default.fixPadding : 0,
                          }}
                        />
                        <TouchableOpacity
                          onPress={loadContacts}
                          style={styles.contactPickerButton}
                        >
                          <Ionicons
                            name="person-add"
                            size={20}
                            color={Colors.white}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View
                      style={{
                        marginHorizontal: Default.fixPadding * 2,
                      }}
                    >
                      <Text
                        style={{
                          ...Fonts.Medium16black,
                          textAlign: isRtl ? "right" : "left",
                        }}                      >
                        {tr("phoneNumber", "Phone Number")}
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
                          placeholder={tr("enterPhoneNumber", "Enter phone number")}
                          placeholderTextColor={Colors.grey}
                          selectionColor={Colors.primary}
                          style={{
                            ...Fonts.Medium14black,
                            flex: 1,
                            textAlign: isRtl ? "right" : "left",
                            marginRight: isRtl ? 0 : Default.fixPadding,
                            marginLeft: isRtl ? Default.fixPadding : 0,
                          }}
                        />
                        <Feather
                          name="smartphone"
                          size={18}
                          color={Colors.grey}
                        />
                      </View>
                    </View>

                    <View
                      style={{
                        marginHorizontal: Default.fixPadding * 2,
                      }}
                    >
                      <Text
                        style={{
                          ...Fonts.Medium16black,
                          textAlign: isRtl ? "right" : "left",
                        }}                      >
                        {tr("enterDate", "Enter Date")}
                      </Text>

                      <TouchableOpacity
                        onPress={() => setDateCalendarModal(true)}
                        style={{
                          flexDirection: isRtl ? "row-reverse" : "row",
                          ...styles.dateTouchOpacity,
                        }}
                      >
                        <Text
                          style={{
                            ...(date
                              ? Fonts.Medium14black
                              : Fonts.Medium14grey),
                            flex: 1,
                            textAlign: isRtl ? "right" : "left",
                            marginRight: isRtl ? 0 : Default.fixPadding,
                            marginLeft: isRtl ? Default.fixPadding : 0,
                          }}                        >
                          {date || tr("enterDate", "Select Date")}
                        </Text>

                        <MaterialCommunityIcons
                          name="calendar-range-outline"
                          size={18}
                          color={Colors.grey}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => setSend((pre) => !pre)}
                        style={{
                          flexDirection: isRtl ? "row-reverse" : "row",
                          alignItems: "center",
                          marginBottom: Default.fixPadding * 2,
                        }}
                      >
                        <Ionicons
                          name={send ? "checkbox-outline" : "square-outline"}
                          size={18}
                          color={send ? Colors.primary : Colors.grey}
                        />
                        <Text
                          style={{
                            ...Fonts.Medium14grey,
                            marginHorizontal: Default.fixPadding,
                          }}                        >
                          {tr("sendGate", "Send Gate Pass")}
                        </Text>
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
                    onPress={() => setOpenGatePassModal(true)}
                    raiseLevel={1}
                    stretch={true}
                    borderRadius={10}
                    backgroundShadow={Colors.primary}
                    backgroundDarker={Colors.primary}
                    backgroundColor={Colors.primary}
                  >                    <Text style={{ ...Fonts.SemiBold18white }}>
                      {tr("submit", "Submit")}
                    </Text>
                  </AwesomeButton>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </KeyboardAvoidingView>
      </TouchableOpacity>      <Modal
        transparent={true}
        animationType="fade"
        visible={dateCalendarModal}
        onRequestClose={() => setDateCalendarModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPressOut={() => setDateCalendarModal(false)}
          style={{ flex: 1 }}
        >
          <View style={styles.mainModalView}>
            <TouchableOpacity activeOpacity={1} style={styles.subModalView}>
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  margin: Default.fixPadding,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    textAlign: "center",
                    overflow: "hidden",
                    ...Fonts.SemiBold18black,
                  }}                >
                  {tr("selectDate", "Select Date")}
                </Text>
                <TouchableOpacity
                  onPress={() => setDateCalendarModal(false)}
                  style={{
                    position: "absolute",
                    alignSelf: isRtl ? "flex-start" : "flex-end",
                  }}
                >
                  <Ionicons name="close" size={22} color={Colors.grey} />
                </TouchableOpacity>
              </View>
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: Default.fixPadding * 1.5,
                }}
              >
                <FromToCalendarPicker
                  minDate={today}
                  current={date}
                  onDayPress={onDateChange}
                />
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Contact Picker Modal */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={showContactPicker}
        onRequestClose={() => setShowContactPicker(false)}
      >
        <View style={styles.contactPickerContainer}>
          <View style={styles.contactPickerModal}>
            <View style={styles.contactPickerHeader}>
              <Text style={styles.contactPickerTitle}>Select Contact</Text>
              <TouchableOpacity
                onPress={() => setShowContactPicker(false)}
                style={styles.contactPickerClose}
              >
                <Ionicons name="close" size={24} color={Colors.grey} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <Feather name="search" size={20} color={Colors.grey} style={styles.searchIcon} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search contacts..."
                placeholderTextColor={Colors.grey}
                style={styles.searchInput}
              />
            </View>

            <FlatList
              data={filteredContacts}
              keyExtractor={(item) => item.id}
              renderItem={renderContactItem}
              style={styles.contactsList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No contacts found</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      <GatePassModal
        visible={openGatePassModal}
        modalClose={() => setOpenGatePassModal(false)}
        name={guestName || "Kwame Thompson"}
        onDownloadHandle={() => {
          setOpenGatePassModal(false);
          props.closeAllowGuestModal();
          setGuestName("");
          setPhoneNumber("");
          setDate("");
        }}
        onShareClose={() => {
          setOpenGatePassModal(false);
          props.closeAllowGuestModal();
          setDate("");
        }}
      />
    </Modal>
  );
};

export default AllowGuestModal;

const styles = StyleSheet.create({
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
  topImageView: {
    justifyContent: "center",
    alignItems: "center",
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: Colors.white,
    backgroundColor: Colors.geyser,
    marginTop: -Default.fixPadding * 5,
    ...Default.shadow,
  },
  textInputView: {
    alignItems: "center",
    paddingHorizontal: Default.fixPadding * 1.4,
    paddingVertical: Default.fixPadding * 1.2,
    marginTop: Default.fixPadding,
    marginBottom: Default.fixPadding * 1.5,
    borderRadius: 10,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },  dateTouchOpacity: {
    alignItems: "center",
    paddingHorizontal: Default.fixPadding * 1.4,
    paddingVertical: Default.fixPadding * 1.5,
    marginTop: Default.fixPadding,
    marginBottom: Default.fixPadding,
    borderRadius: 10,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  contactPickerButton: {
    padding: Default.fixPadding * 0.5,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contactPickerContainer: {
    flex: 1,
    backgroundColor: Colors.transparentBlack,
    justifyContent: 'flex-end',
  },
  contactPickerModal: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.8,
    paddingTop: Default.fixPadding,
  },
  contactPickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Default.fixPadding * 2,
    paddingBottom: Default.fixPadding,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGrey,
  },
  contactPickerTitle: {
    ...Fonts.SemiBold18black,
  },
  contactPickerClose: {
    padding: Default.fixPadding * 0.5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Default.fixPadding * 2,
    marginVertical: Default.fixPadding,
    paddingHorizontal: Default.fixPadding * 1.2,
    paddingVertical: Default.fixPadding * 0.8,
    backgroundColor: Colors.extraLightGrey,
    borderRadius: 25,
  },
  searchIcon: {
    marginRight: Default.fixPadding * 0.8,
  },
  searchInput: {
    flex: 1,
    ...Fonts.Medium14black,
    paddingVertical: 0,
  },
  contactsList: {
    maxHeight: height * 0.5,
    paddingHorizontal: Default.fixPadding * 2,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Default.fixPadding * 1.2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.extraLightGrey,
  },
  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Default.fixPadding * 1.2,
  },
  contactAvatarText: {
    ...Fonts.SemiBold16white,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    ...Fonts.Medium16black,
    marginBottom: 2,
  },
  contactPhone: {
    ...Fonts.Regular14grey,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Default.fixPadding * 3,
  },
  emptyText: {
    ...Fonts.Medium16grey,
  },
});
