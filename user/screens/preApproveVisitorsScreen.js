import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  StyleSheet,
  Image,
  ScrollView,
  Modal,
  Dimensions,
  TextInput,
  FlatList,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MyStatusBar from "../components/myStatusBar";
import AllowGuestModal from "../components/allowGuestModal";
import AddCabModal from "../components/addCabModal";
import AddDeliveryModal from "../components/addDeliveryModal";
import moment from "moment";
import FromToCalendarPicker from "../components/fromToCalendarPicker";
import * as Contacts from "expo-contacts";
import { useListVisitors } from "../hooks/useListVisitors";
import { useCreateService } from "../hooks/useCreateService";
import GatePassModal from "../components/gatePassModal";

const { width, height } = Dimensions.get("window");

const PreApproveVisitorsScreen = ({ navigation }) => {
  const { i18n } = useTranslation();
  const { data: visitors, isLoading: visitorsLoading, error: visitorsError } = useListVisitors();
  const createServiceMutation = useCreateService();
  const isSubmittingService = Boolean(createServiceMutation.isPending ?? createServiceMutation.isLoading);

  const isRtl = i18n.dir() === "rtl";
  
  const backAction = useCallback(() => {
    navigation.pop();
    return true;
  }, [navigation]);
  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => subscription.remove();
  }, [backAction]);

  const [openAllowGuestModal, setOpenAllowGuestModal] = useState(false);

  const [openAddCabModal, setOpenAddCabModal] = useState(false);

  const [openAddDeliveryModal, setOpenAddDeliveryModal] = useState(false);

  const [addServiceModal, setAddServiceModal] = useState(false);
  const [openGatePassModal, setOpenGatePassModal] = useState(false);
  const [createdService, setCreatedService] = useState(null);

  const [companyName, setCompanyName] = useState();
  const [phoneNumber, setPhoneNumber] = useState();

  // Contact selection states
  const [contacts, setContacts] = useState([]);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Calendar date selection (replacing Today/Tomorrow dropdown)
  const today = moment().format("YYYY-MM-DD");
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
    } catch (_error) {
      console.warn('Error formatting date:', _error);
      return 'Select Date';
    }
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
    } catch (_error) {
      Alert.alert('Error', 'Failed to load contacts. Please try again.');
    }
  };

  const selectContact = (contact) => {
    if (!contact) return;
    
    const safeName = contact.name || "";
    const safePhone = contact.phoneNumber || "";
    
    setCompanyName(safeName);
    setPhoneNumber(safePhone.replace(/[^\d]/g, '').slice(-10)); // Extract digits and take last 10
    setShowContactPicker(false);
    setSearchQuery('');
  };

  const filteredContacts = contacts.filter(contact =>
    (contact.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (contact.phoneNumber || "").includes(searchQuery)
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
          Pre-Approve Visitors
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets={true}
      >
        {/* Recent Visitors Section */}
        {visitorsLoading ? (
          <View style={{
            alignItems: 'center',
            padding: Default.fixPadding * 2,
          }}>
            <Text style={{...Fonts.Regular14grey}}>Loading recent visitors...</Text>
          </View>
        ) : visitorsError ? (
          <View style={{
            alignItems: 'center',
            padding: Default.fixPadding * 2,
          }}>
            <Text style={{...Fonts.Regular14grey}}>Unable to load visitors</Text>
          </View>
        ) : visitors && visitors.length > 0 ? (
          <View style={{
            marginTop: Default.fixPadding * 2,
            marginBottom: Default.fixPadding * 2,
            marginHorizontal: Default.fixPadding * 2,
          }}>
            <Text style={{
              ...Fonts.Medium16black,
              textAlign: isRtl ? "right" : "left",
              marginBottom: Default.fixPadding,
            }}>
              {`Recent Visitors (${visitors.length})`}
            </Text>
            <View style={{
              backgroundColor: '#E3F2FD',
              borderRadius: 10,
              padding: Default.fixPadding,
            }}>
              {visitors.slice(0, 3).map((visitor, index) => (
                <View key={visitor.id} style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  alignItems: "center",
                  paddingVertical: Default.fixPadding * 0.5,
                  borderBottomWidth: index < Math.min(visitors.length, 3) - 1 ? 1 : 0,
                  borderBottomColor: Colors.grey + '30',
                }}>
                  <View style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: visitor.status === 'approved' ? Colors.green : 
                                   visitor.status === 'pending' ? Colors.orange : Colors.red,
                    marginRight: isRtl ? 0 : Default.fixPadding,
                    marginLeft: isRtl ? Default.fixPadding : 0,
                  }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      ...Fonts.Medium14black,
                      textAlign: isRtl ? "right" : "left",
                    }}>
                      {visitor.visitor_name}
                    </Text>
                    <Text style={{
                      ...Fonts.Regular12grey,
                      textAlign: isRtl ? "right" : "left",
                    }}>
                      {`${visitor.visit_date ? moment(visitor.visit_date).format('MMM DD, YYYY') : 'No date set'} • ${visitor.status}`}
                    </Text>
                  </View>
                </View>
              ))}
              {visitors.length > 3 && (
                <Text style={{
                  ...Fonts.Regular12grey,
                  textAlign: 'center',
                  marginTop: Default.fixPadding * 0.5,
                }}>
                  {`+${visitors.length - 3} more visitors`}
                </Text>
              )}
            </View>
          </View>
        ) : null}

        <View
          style={{
            marginBottom: Default.fixPadding * 2,
            marginHorizontal: Default.fixPadding * 2,
          }}
        >
          <Text
            style={{
              ...Fonts.Medium14grey,
              textAlign: isRtl ? "right" : "left",
            }}
          >
            Add Visitor
          </Text>
        </View>

        <View
          style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            alignItems: "center",
            marginHorizontal: Default.fixPadding,
          }}
        >
          <TouchableOpacity
            style={styles.mainTouchableOpacity}
            onPress={() => setOpenAllowGuestModal(true)}
          >
            <Image
              source={require("../assets/images/pre1.png")}
              style={{ width: 54, height: 54, resizeMode: "contain" }}
            />
            <Text
              numberOfLines={1}
              style={{
                ...Fonts.SemiBold16black,
                overflow: "hidden",
                marginTop: Default.fixPadding * 1.5,
              }}
            >
              Add Guest
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mainTouchableOpacity}
            onPress={() => setOpenAddCabModal(true)}
          >
            <Image
              source={require("../assets/images/pre2.png")}
              style={{ width: 54, height: 54, resizeMode: "contain" }}
            />
            <Text
              numberOfLines={1}
              style={{
                ...Fonts.SemiBold16black,
                overflow: "hidden",
                marginTop: Default.fixPadding * 1.5,
              }}
            >
              Add Cab
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            alignItems: "center",
            marginHorizontal: Default.fixPadding,
          }}
        >
          <TouchableOpacity
            style={styles.mainTouchableOpacity}
            onPress={() => setOpenAddDeliveryModal(true)}
          >
            <Image
              source={require("../assets/images/pre3.png")}
              style={{ width: 54, height: 54, resizeMode: "contain" }}
            />
            <Text
              numberOfLines={1}
              style={{
                ...Fonts.SemiBold16black,
                overflow: "hidden",
                marginTop: Default.fixPadding * 1.5,
              }}
            >
              Add Delivery
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mainTouchableOpacity}
            onPress={() => setAddServiceModal(true)}
          >
            <Image
              source={require("../assets/images/pre4.png")}
              style={{ width: 54, height: 54, resizeMode: "contain" }}
            />
            <Text
              numberOfLines={1}
              style={{
                ...Fonts.SemiBold16black,
                overflow: "hidden",
                marginTop: Default.fixPadding * 1.5,
              }}
            >
              Add Service
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <AllowGuestModal
        visible={openAllowGuestModal}
        closeAllowGuestModal={() => setOpenAllowGuestModal(false)}
      />

      <AddCabModal
        visible={openAddCabModal}
        closeAddCabModal={() => setOpenAddCabModal(false)}
      />

      <AddDeliveryModal
        visible={openAddDeliveryModal}
        closeAddDeliveryModal={() => setOpenAddDeliveryModal(false)}
      />

      <Modal
        transparent={true}
        animationType="fade"
        visible={addServiceModal}
        onRequestClose={() => setAddServiceModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPressOut={() => setAddServiceModal(false)}
          style={{ flex: 1 }}
        >
          <KeyboardAvoidingView behavior={"padding"} style={{ flex: 1 }}>
            <View style={styles.mainModalView}>
              <TouchableWithoutFeedback>
                <View
                  style={{
                    ...styles.subModalView,
                    maxHeight: height / 1.2,
                  }}
                >
                  <View
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <View style={styles.modalTopImageView}>
                      <Image
                        source={require("../assets/images/pre4.png")}
                        style={{ width: 54, height: 54, resizeMode: "contain" }}
                      />
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => setAddServiceModal(false)}
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
                    style={{
                      ...Fonts.SemiBold16black,
                      textAlign: "center",
                      marginTop: Default.fixPadding * 1.5,
                      marginBottom: Default.fixPadding * 2,
                      marginHorizontal: Default.fixPadding * 2,
                    }}
                  >
                    Allow my Serviceman
                  </Text>

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
                        Serviceman Company Name
                      </Text>

                      <View style={styles.textInputView}>
                        <TextInput
                          value={companyName}
                          onChangeText={setCompanyName}
                          placeholder="Enter Serviceman Company"
                          placeholderTextColor={Colors.grey}
                          selectionColor={Colors.primary}
                          style={{
                            ...Fonts.Medium14black,
                            textAlign: isRtl ? "right" : "left",
                          }}
                        />
                      </View>

                      <Text
                        style={{
                          ...Fonts.Medium16black,
                          textAlign: isRtl ? "right" : "left",
                        }}
                      >
                        Phone Number
                      </Text>

                      <View style={[styles.textInputView, { flexDirection: 'row', alignItems: 'center' }]}>
                        <TextInput
                          maxLength={10}
                          value={phoneNumber}
                          keyboardType="number-pad"
                          onChangeText={setPhoneNumber}
                          placeholder="Enter Phone Number"
                          placeholderTextColor={Colors.grey}
                          selectionColor={Colors.primary}
                          style={{
                            ...Fonts.Medium14black,
                            textAlign: isRtl ? "right" : "left",
                            flex: 1,
                          }}
                        />
                        <TouchableOpacity
                          onPress={() => {
                            loadContacts();
                          }}
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
                          ...Fonts.Medium16black,
                          textAlign: isRtl ? "right" : "left",
                        }}
                      >
                        Select Date
                      </Text>
                      
                      <TouchableOpacity
                        onPress={() => setDateCalendarModal(true)}
                        style={{
                          flexDirection: isRtl ? "row-reverse" : "row",
                          alignItems: "center",
                          paddingHorizontal: Default.fixPadding * 1.4,
                          paddingVertical: Default.fixPadding * 1.5,
                          marginTop: Default.fixPadding * 0.5,
                          borderRadius: 10,
                          backgroundColor: Colors.white,
                          ...Default.shadow,
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
                        marginTop: Default.fixPadding * 2,
                        marginBottom: Default.fixPadding,
                        paddingHorizontal: Default.fixPadding * 0.5,
                      }}>
                        <TouchableOpacity
                          onPress={() => {
                            const today = moment().format('YYYY-MM-DD');
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

                      <View
                        style={{
                          margin: Default.fixPadding * 2,
                        }}
                      >
                        <TouchableOpacity
                          onPress={async () => {
                            console.log('🔥 Add Service Submit pressed');
                            
                            // Validate form data
                            if (!companyName?.trim()) {
                              Alert.alert('Error', 'Please enter serviceman company name');
                              return;
                            }
                            
                            if (!phoneNumber?.trim()) {
                              Alert.alert('Error', 'Please enter phone number');
                              return;
                            }
                            
                            if (!date) {
                              Alert.alert('Error', 'Please select a date');
                              return;
                            }

                            try {
                              console.log('🔥 Creating service with data:', {
                                serviceName: companyName.trim(),
                                phoneNumber: phoneNumber.trim(),
                                serviceType: 'General Service',
                                visitDate: date,
                                sendGatePassNotification: true
                              });

                              const result = await createServiceMutation.mutateAsync({
                                serviceName: companyName.trim(),
                                phoneNumber: phoneNumber.trim(),
                                serviceType: 'General Service',
                                visitDate: date,
                                sendGatePassNotification: true
                              });

                              console.log('🎯 Service created successfully:', result);
                              
                              // Store the created service data and open gate pass modal
                              setCreatedService(result);
                              setOpenGatePassModal(true);
                              
                              // Reset form and close modal
                              setAddServiceModal(false);
                              setCompanyName("");
                              setPhoneNumber("");
                              setDate(null);
                              
                            } catch (error) {
                              console.error('❌ Error creating service:', error);
                              Alert.alert('Error', error.message || 'Failed to create service entry');
                            }
                          }}
                          disabled={isSubmittingService}
                          style={{
                            height: 50,
                            backgroundColor: isSubmittingService ? Colors.grey : Colors.primary,
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
                            {isSubmittingService ? 'Creating...' : 'Submit'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </KeyboardAvoidingView>
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
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            <View style={styles.mainModalView}>
              <TouchableOpacity activeOpacity={1} style={styles.subModalView}>
                <Text
                  style={{
                    ...Fonts.Medium18primary,
                    textAlign: "center",
                    marginVertical: Default.fixPadding * 1.6,
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
                    paddingHorizontal: Default.fixPadding * 1.4,
                    paddingVertical: Default.fixPadding,
                    marginHorizontal: Default.fixPadding * 2,
                    marginBottom: Default.fixPadding,
                    borderRadius: 10,
                    backgroundColor: Colors.extraLightGrey,
                  }}
                />

                <FlatList
                  data={filteredContacts}
                  keyExtractor={(item) => item.id}
                  style={{ maxHeight: 300 }}
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
                      ...styles.cancelOkBtn,
                      backgroundColor: Colors.white,
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

        {/* Calendar Modal */}
        <Modal
          transparent={true}
          animationType="fade"
          visible={dateCalendarModal}
          onRequestClose={() => setDateCalendarModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPressOut={() => setDateCalendarModal(false)}
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            <View style={styles.mainModalView}>
              <TouchableOpacity activeOpacity={1} style={styles.subModalView}>
                <Text
                  style={{
                    ...Fonts.Medium18primary,
                    textAlign: "center",
                    marginVertical: Default.fixPadding * 1.6,
                  }}
                >
                  Select Date
                </Text>

                <FromToCalendarPicker
                  minDate={today}
                  current={date}
                  onDayPress={onDateChange}
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
                    onPress={() => setDateCalendarModal(false)}
                    style={{
                      ...styles.cancelOkBtn,
                      backgroundColor: Colors.white,
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      style={{ ...Fonts.SemiBold18black, overflow: "hidden" }}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setDateCalendarModal(false);
                    }}
                    style={{
                      marginLeft: isRtl ? 0 : Default.fixPadding * 1.5,
                      marginRight: isRtl ? Default.fixPadding * 1.5 : 0,
                      backgroundColor: Colors.primary,
                      ...styles.cancelOkBtn,
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      style={{ ...Fonts.SemiBold18white, overflow: "hidden" }}
                    >
                      Okay
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

      {/* Gate Pass Modal for Service */}
      {createdService && (
        <GatePassModal
          visible={openGatePassModal}
          visitorData={createdService}
          onClose={() => {
            console.log('🎯 GatePassModal onClose called');
            setOpenGatePassModal(false);
            setCreatedService(null);
          }}
        />
      )}
    </View>
  );
};

export default PreApproveVisitorsScreen;

const styles = StyleSheet.create({
  mainTouchableOpacity: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Default.fixPadding * 2.8,
    paddingHorizontal: Default.fixPadding,
    marginBottom: Default.fixPadding * 2,
    marginHorizontal: Default.fixPadding,
    borderRadius: 20,
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
    justifyContent: "center",
    alignItems: "center",
    padding: Default.fixPadding * 1.4,
    borderRadius: 10,
    ...Default.shadow,
  },
  textInputView: {
    marginTop: Default.fixPadding * 0.5,
    marginBottom: Default.fixPadding * 2.5,
    paddingHorizontal: Default.fixPadding * 1.4,
    paddingVertical: Default.fixPadding * 1.2,
    borderRadius: 10,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  modalTopImageView: {
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
});
