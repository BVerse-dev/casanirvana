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
import moment from "moment";
import FromToCalendarPicker from "./fromToCalendarPicker";
import GatePassModal from "./gatePassModal";
import * as Contacts from "expo-contacts";
import { useCreateVisitor } from "../hooks/useCreateVisitor";
import { supabase } from "../utils/supabase";

const { width, height } = Dimensions.get("window");

const AllowGuestModal = (props) => {
  const { t, i18n } = useTranslation();
  const createVisitorMutation = useCreateVisitor();

  const isRtl = i18n.dir() == "rtl";

  const [guestName, setGuestName] = useState();
  const [phoneNumber, setPhoneNumber] = useState();
  const [send, setSend] = useState(true);
  const [createdVisitor, setCreatedVisitor] = useState(null);
  const today = moment().format("YYYY-MM-DD");
  const [openGatePassModal, setOpenGatePassModal] = useState(false);

  // Contact selection states
  const [contacts, setContacts] = useState([]);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
    
    setGuestName(safeName);
    setPhoneNumber(safePhone.replace(/[^\d]/g, '').slice(-10)); // Extract digits and take last 10
    setShowContactPicker(false);
    setSearchQuery('');
  };

  const filteredContacts = contacts.filter(contact =>
    (contact.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (contact.phoneNumber || "").includes(searchQuery)
  );

  const [date, setDate] = useState();
  const [dateCalendarModal, setDateCalendarModal] = useState(false);
  const onDateChange = (day) => {
    setDate(day.dateString);
    setDateCalendarModal(false);
  };
  // Format the date in a more user-friendly format when displayed
  const formatDisplayDate = (dateString) => {
    if (!dateString || typeof dateString !== 'string') return 'Select Date';
    try {
      const momentObj = moment(dateString);
      if (!momentObj.isValid()) {
        return 'Select Date';
      }
      const formatted = momentObj.format('dddd, MMMM D, YYYY');
      return formatted || 'Select Date';
    } catch (error) {
      console.warn('Error formatting date:', error);
      return 'Select Date';
    }
  };

  // Handle visitor submission
  const handleSubmitVisitor = async () => {
    // Validate required fields
    if (!guestName?.trim()) {
      Alert.alert('Validation Error', 'Please enter the guest name.');
      return;
    }
    
    if (!phoneNumber?.trim()) {
      Alert.alert('Validation Error', 'Please enter the phone number.');
      return;
    }
    
    if (!date) {
      Alert.alert('Validation Error', 'Please select a visit date.');
      setDateCalendarModal(true);
      return;
    }

    try {
      // Create visitor pass in database
      const newVisitor = await createVisitorMutation.mutateAsync({
        guestName: guestName.trim(),
        phoneNumber: phoneNumber.trim(),
        visitDate: date,
        sendGatePassNotification: send,
        // Add user/unit context if available from props
        unitId: props.unitId || null,
        createdBy: props.userId || null,
      });

      // Store the created visitor data with additional unit info
      // Get unit information for the gate pass
      let visitorWithUnitInfo = newVisitor;
      try {
        const { data: unitData } = await supabase
          .from('units')
          .select('unit_number')
          .eq('id', newVisitor.unit_id)
          .single();
        
        if (unitData) {
          visitorWithUnitInfo = { ...newVisitor, unit_number: unitData.unit_number };
        }
      } catch (unitError) {
        console.log('Could not fetch unit info:', unitError);
      }
      
      setCreatedVisitor(visitorWithUnitInfo);

      // Show success and open gate pass modal
      Alert.alert(
        'Success', 
        'Visitor pass has been created successfully!',
        [
          {
            text: 'OK',
            onPress: () => setOpenGatePassModal(true)
          }
        ]
      );

    } catch (error) {
      console.error('Error creating visitor pass:', error);
      Alert.alert(
        'Error', 
        error.message || 'Failed to create visitor pass. Please try again.',
        [
          {
            text: 'OK',
            onPress: () => {}
          }
        ]
      );
    }
  };

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
                </TouchableOpacity>

                <Text
                  numberOfLines={1}
                  style={{
                    ...Fonts.SemiBold16black,
                    overflow: "hidden",
                    textAlign: "center",
                    marginTop: Default.fixPadding,
                    marginBottom: Default.fixPadding * 2,
                  }}
                >
                  Allow my Guest
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
                        }}
                      >
                        Guest name
                      </Text>

                      <View
                        style={{
                          flexDirection: isRtl ? "row-reverse" : "row",
                          ...styles.textInputView,
                        }}
                      >
                        <TextInput
                          value={guestName}
                          onChangeText={setGuestName}
                          placeholder="Enter Guest Name"
                          placeholderTextColor={Colors.grey}
                          selectionColor={Colors.primary}
                          style={{
                            ...Fonts.Medium14black,
                            textAlign: isRtl ? "right" : "left",
                            flex: 1,
                          }}
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
                        }}
                      >
                        Phone Number
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
                          placeholder="Enter Phone Number"
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
                          style={{
                            marginLeft: Default.fixPadding * 0.5,
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

                    <View
                      style={{
                        marginHorizontal: Default.fixPadding * 2,
                      }}
                    >
                      <Text
                        style={{
                          ...Fonts.Medium16black,
                          textAlign: isRtl ? "right" : "left",
                        }}
                      >
                        Select Date
                      </Text>
                      
                      <TouchableOpacity
                        onPress={() => setDateCalendarModal(true)}                        style={{
                          flexDirection: isRtl ? "row-reverse" : "row",
                          ...styles.dateTouchOpacity
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
                          }}
                        >
                          {date ? formatDisplayDate(date) : "Select Date"}
                        </Text>

                        <MaterialCommunityIcons
                          name="calendar-range-outline"
                          size={20}
                          color={Colors.primary}
                        />
                      </TouchableOpacity>

                      <View style={{ 
                        flexDirection: isRtl ? "row-reverse" : "row",
                        justifyContent: 'space-between',
                        marginTop: Default.fixPadding * 0.5,
                        marginBottom: Default.fixPadding,
                        paddingHorizontal: Default.fixPadding * 0.5,
                      }}>
                        <TouchableOpacity
                          onPress={() => {
                            setDate(today);
                          }}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            padding: Default.fixPadding * 0.5,
                          }}
                        >
                          <Ionicons 
                            name="today-outline" 
                            size={16} 
                            color={Colors.primary}
                            style={{marginRight: 4}} 
                          />
                          <Text style={{...Fonts.Medium12primary}}>
                            Today
                          </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          onPress={() => {
                            const tomorrow = moment().add(1, 'days').format('YYYY-MM-DD');
                            setDate(tomorrow);
                          }}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            padding: Default.fixPadding * 0.5,
                          }}
                        >
                          <Ionicons 
                            name="calendar-outline" 
                            size={16} 
                            color={Colors.primary}
                            style={{marginRight: 4}} 
                          />
                          <Text style={{...Fonts.Medium12primary}}>
                            Tomorrow
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity
                        onPress={() => setSend((pre) => !pre)}
                        style={{
                          flexDirection: isRtl ? "row-reverse" : "row",
                          alignItems: "center",
                          marginBottom: Default.fixPadding * 2,                        }}
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
                          }}
                        >
                          Send gate pass to the guest
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
                  <TouchableOpacity
                    onPress={handleSubmitVisitor}
                    disabled={createVisitorMutation.isLoading}
                    style={{
                      height: 50,
                      backgroundColor: createVisitorMutation.isLoading ? Colors.grey : Colors.primary,
                      borderRadius: 10,
                      justifyContent: 'center',
                      alignItems: 'center',
                      shadowColor: Colors.primary,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 3,
                      elevation: 3,
                    }}
                  >
                    <Text style={{ ...Fonts.SemiBold18white }}>
                      {createVisitorMutation.isLoading ? 'Creating...' : 'Create Visitor Pass'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </KeyboardAvoidingView>
      </TouchableOpacity>
      
      <Modal
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
            <View style={{
                ...styles.subModalView,
                borderRadius: 20,
                overflow: 'hidden',
              }}>
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  margin: Default.fixPadding,
                  paddingVertical: Default.fixPadding,
                  backgroundColor: Colors.white,
                  borderBottomWidth: 1,
                  borderBottomColor: Colors.lightGrey,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    textAlign: "center",
                    overflow: "hidden",
                    ...Fonts.SemiBold18primary,
                  }}
                >
                  Select Visit Date
                </Text>
                <TouchableOpacity
                  onPress={() => setDateCalendarModal(false)}
                  style={{
                    position: "absolute",
                    alignSelf: isRtl ? "flex-start" : "flex-end",
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: Colors.lightGrey + '20', // semi-transparent
                  }}
                >
                  <Ionicons name="close" size={20} color={Colors.grey} />
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
              
              <View style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  justifyContent: "center",
                  marginVertical: Default.fixPadding * 1.5,
                  paddingHorizontal: Default.fixPadding * 2,
                }}>
                  <TouchableOpacity
                    onPress={() => setDateCalendarModal(false)}
                    style={{
                      backgroundColor: Colors.primary,
                      paddingVertical: Default.fixPadding * 0.8,
                      paddingHorizontal: Default.fixPadding * 4,
                      borderRadius: 20,
                      elevation: 3,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',                      shadowColor: Colors.primary,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 3,
                    }}
                  >
                    <Ionicons name="checkmark-circle" size={18} color={Colors.white} style={{marginRight: 8}} />
                    <Text style={{ ...Fonts.SemiBold16white }}>
                      Done
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Contact Picker Modal */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={showContactPicker}
        onRequestClose={() => setShowContactPicker(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPressOut={() => setShowContactPicker(false)}
          style={{ flex: 1 }}
        >
          <View style={styles.mainModalView}>
            <TouchableWithoutFeedback>
              <View style={{ ...styles.subModalView, maxHeight: height * 0.8, width: width * 0.9 }}>
                <View style={{
                  padding: Default.fixPadding * 1.6,
                  borderBottomWidth: 1,
                  borderBottomColor: Colors.lightGrey,
                }}>
                  <Text style={{ ...Fonts.Medium18primary, textAlign: 'center' }}>
                    Select Contact
                  </Text>
                </View>
                
                <View style={{
                  padding: Default.fixPadding,
                  borderBottomWidth: 1,
                  borderBottomColor: Colors.lightGrey,
                }}>
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search contacts..."
                    placeholderTextColor={Colors.grey}
                    style={{
                      ...Fonts.Medium14black,
                      padding: Default.fixPadding,
                      backgroundColor: Colors.lightGrey,
                      borderRadius: 8,
                    }}
                  />
                </View>

                <FlatList
                  data={filteredContacts}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  style={{ maxHeight: height * 0.5 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => selectContact(item)}
                      style={{
                        padding: Default.fixPadding * 1.2,
                        borderBottomWidth: 1,
                        borderBottomColor: Colors.extraLightGrey,
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                    >
                      <View style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: Colors.primary,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: Default.fixPadding,
                      }}>
                        <Text style={{ ...Fonts.SemiBold16white }}>
                          {(item.name || "").charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ ...Fonts.Medium16black }}>
                          {item.name || "Unknown"}
                        </Text>
                        <Text style={{ ...Fonts.Regular14grey }}>
                          {item.phoneNumber || "No number"}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={() => (
                    <View style={{ 
                      padding: Default.fixPadding * 2,
                      alignItems: 'center' 
                    }}>
                      <Text style={{ ...Fonts.Medium16grey }}>
                        No contacts found
                      </Text>
                    </View>
                  )}
                />

                <View style={{
                  padding: Default.fixPadding * 1.2,
                  borderTopWidth: 1,
                  borderTopColor: Colors.lightGrey,
                }}>
                  <TouchableOpacity
                    onPress={() => setShowContactPicker(false)}
                    style={{
                      backgroundColor: Colors.grey,
                      padding: Default.fixPadding * 1.2,
                      borderRadius: 10,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ ...Fonts.SemiBold16white }}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableOpacity>
      </Modal>

        {openGatePassModal && (
        <GatePassModal
          visible={openGatePassModal}
          modalClose={() => setOpenGatePassModal(false)}
          name={guestName ? guestName : "Cameron Williamson"}
          visitorData={createdVisitor} // Pass the created visitor data with QR code
          onDownloadHandle={() => {
            setOpenGatePassModal(false);
            props.closeAllowGuestModal();
            setGuestName("");
            setPhoneNumber("");
            setDate("");
            setSearchQuery("");
            setCreatedVisitor(null);
          }}
          onShareClose={() => {
            setOpenGatePassModal(false);
            props.closeAllowGuestModal();
            setDate("");
            setSearchQuery("");
            setCreatedVisitor(null);
          }}
        />
      )}
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
    backgroundColor: Colors.white,    ...Default.shadow,
  },
  dateTouchOpacity: {
    alignItems: "center",
    paddingHorizontal: Default.fixPadding * 1.4,
    paddingVertical: Default.fixPadding * 1.5,
    marginTop: Default.fixPadding,
    marginBottom: Default.fixPadding,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.primary + '40', // Semi-transparent primary color
    backgroundColor: Colors.white,
    ...Default.shadow,
    shadowColor: Colors.primary,
    shadowOpacity: 0.1,
    elevation: 2,
  },
});
