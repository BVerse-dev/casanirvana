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
  FlatList,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  TextInput,
  Alert,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Colors, Fonts, Default } from "../constants/styles";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import AwesomeButton from "react-native-really-awesome-button";
import { ms } from "react-native-size-matters/extend";
import DashedLine from "react-native-dashed-line";
import { OtpInput } from "react-native-otp-entry";
import moment from "moment";
import FromToCalendarPicker from "./fromToCalendarPicker";
import GatePassModal from "./gatePassModal";
import { useCreateCab } from "../hooks/useCreateCab";

const { width, height } = Dimensions.get("window");

const AddCabModal = (props) => {
  const { t, i18n } = useTranslation();
  const createCabMutation = useCreateCab();

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`addCabModal:${key}`);
  }

  // Form state
  const [driverName, setDriverName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [send, setSend] = useState(true);
  const [createdCab, setCreatedCab] = useState(null);
  const today = moment().format("YYYY-MM-DD");
  const [date, setDate] = useState(today);
  const [dateCalendarModal, setDateCalendarModal] = useState(false);
  const [openGatePassModal, setOpenGatePassModal] = useState(false);

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

  // Submit function
  const handleSubmit = async () => {
    // Validation
    if (!vehicleNumber?.trim() || vehicleNumber.length !== 4) {
      Alert.alert('Validation Error', 'Please enter the last 4 digits of the vehicle number.');
      return;
    }
    
    if (!date) {
      Alert.alert('Validation Error', 'Please select a visit date.');
      setDateCalendarModal(true);
      return;
    }

    if (!confirmCompanyName) {
      Alert.alert('Validation Error', 'Please select a company name.');
      setCompanyNameModal(true);
      return;
    }

    try {
      // Generate a visitor name for the cab
      const visitorName = `${confirmCompanyName} - ${vehicleNumber.trim()}`;
      
      // Create cab pass in database
      const newCab = await createCabMutation.createCab({
        driverName: visitorName, // Use the generated name as driver name  
        phoneNumber: "", // Optional field - not collected in this UI 
        vehicleNumber: vehicleNumber.trim(),
        vehicleType: vehicleType,
        companyName: confirmCompanyName,
        visitDate: date,
        sendGatePassNotification: send,
      });

      // Set the created cab data
      setCreatedCab(newCab);
      
      // Open gate pass modal
      setOpenGatePassModal(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to create cab pass. Please try again.');
      console.error('Create cab error:', error);
    }
  };

  const [companyNameModal, setCompanyNameModal] = useState(false);
  const companyNameList = [
    {
      key: "1",
      name: "Uber",
    },
    {
      key: "2",
      name: "Bolt",
    },
    {
      key: "3",
      name: "Yango",
    },
    {
      key: "4",
      name: "Taxi/Bike",
    },
    {
      key: "5",
      name: "Other",
    },
  ];
  const [selectedCompanyName, setSelectedCompanyName] = useState("Uber");
  const [confirmCompanyName, setConfirmCompanyName] = useState();
  const [vehicleType, setVehicleType] = useState("Car"); // Default vehicle type

  const renderItem = ({ item }) => {
    const isSelected = selectedCompanyName === item.name;
    return (
      <TouchableOpacity
        onPress={() => setSelectedCompanyName(item.name)}
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
    <>
    <Modal
      transparent={true}
      animationType="fade"
      visible={props.visible}
      onRequestClose={props.closeAddCabModal}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressOut={props.closeAddCabModal}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView behavior={"padding"} style={{ flex: 1 }}>
          <View style={styles.mainModalView}>
            <TouchableWithoutFeedback>
              <View style={{ ...styles.subModalView, maxHeight: height / 1.2 }}>
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <View style={styles.topImageView}>
                    <Image
                      source={require("../assets/images/pre2.png")}
                      style={{ width: 54, height: 54, resizeMode: "contain" }}
                    />
                  </View>
                </View>
                <TouchableOpacity
                  onPress={props.closeAddCabModal}
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
                    marginVertical: Default.fixPadding * 1.5,
                    marginHorizontal: Default.fixPadding * 2,
                  }}
                >
                  {tr("allowMyCab")}
                </Text>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  automaticallyAdjustKeyboardInsets={true}
                >
                  <View>
                    <View
                      style={{
                        marginTop: Default.fixPadding * 1.5,
                        marginHorizontal: Default.fixPadding * 2,
                      }}
                    >


                      <Text
                        style={{
                          ...Fonts.Medium16black,
                          textAlign: isRtl ? "right" : "left",
                          marginBottom: Default.fixPadding * 1.2,
                        }}
                      >
                        {tr("addLastDigit")}
                      </Text>
                    </View>
                    <View
                      style={{
                        marginBottom: Default.fixPadding * 2,
                        marginHorizontal: Default.fixPadding * 1.5,
                      }}
                    >
                      <OtpInput
                        numberOfDigits={4}
                        value={vehicleNumber}
                        onTextChange={(text) => setVehicleNumber(text)}
                        onFilled={(text) => setVehicleNumber(text)}
                        autoFocus={false}
                        focusColor={Colors.primary}
                        type="numeric"
                        keyboardType="numeric"
                        theme={{
                          inputsContainerStyle: {
                            justifyContent: isRtl ? "flex-end" : "flex-start",
                          },
                          pinCodeContainerStyle: {
                            borderWidth: 0,
                            width: ms(43),
                            height: ms(43),
                            borderRadius: 10,
                            backgroundColor: Colors.white,
                            marginHorizontal: Default.fixPadding * 0.5,
                            ...Default.shadow,
                          },
                          pinCodeTextStyle: { ...Fonts.Medium20black },
                          focusedPinCodeContainerStyle: {
                            borderWidth: 0,
                            borderRadius: 10,
                            backgroundColor: Colors.white,
                            borderColor: Colors.primary,
                            borderWidth: 1,
                          },
                          focusStickStyle: {
                            backgroundColor: Colors.primary,
                          },
                        }}
                      />
                    </View>

                    <View style={{ marginHorizontal: Default.fixPadding * 2 }}>
                      <Text
                        style={{
                          ...Fonts.Medium16black,
                          textAlign: isRtl ? "right" : "left",
                        }}
                      >
                        {tr("companyName")}
                      </Text>

                      <TouchableOpacity
                        onPress={() => setCompanyNameModal(true)}
                        style={{
                          flexDirection: isRtl ? "row-reverse" : "row",
                          ...styles.companyNameTouchOpacity,
                        }}
                      >
                        <Text
                          style={{
                            ...(confirmCompanyName
                              ? Fonts.Medium14black
                              : Fonts.Medium14grey),
                            flex: 1,
                            textAlign: isRtl ? "right" : "left",
                            marginRight: isRtl ? 0 : Default.fixPadding,
                            marginLeft: isRtl ? Default.fixPadding : 0,
                          }}
                        >
                          {confirmCompanyName
                            ? confirmCompanyName
                            : tr("enterCompanyName")}
                        </Text>

                        <Ionicons
                          name="chevron-down"
                          size={18}
                          color={Colors.black}
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={{ marginHorizontal: Default.fixPadding * 2 }}>
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
                          ...styles.companyNameTouchOpacity,
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
                    onPress={handleSubmit}
                    raiseLevel={1}
                    stretch={true}
                    borderRadius={10}
                    backgroundShadow={Colors.primary}
                    backgroundDarker={Colors.primary}
                    backgroundColor={Colors.primary}
                    disabled={createCabMutation.isLoading}
                  >
                    <Text style={{ ...Fonts.SemiBold18white }}>
                      {createCabMutation.isLoading ? "Creating..." : tr("submit")}
                    </Text>
                  </AwesomeButton>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </KeyboardAvoidingView>
      </TouchableOpacity>
      <Modal
        transparent={true}
        animationType="fade"
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
                  {tr("companyName")}
                </Text>
              </View>
              <DashedLine
                dashGap={2.5}
                dashLength={2.5}
                dashThickness={1.5}
                dashColor={Colors.grey}
              />

              <FlatList
                data={companyNameList}
                renderItem={renderItem}
                keyExtractor={(item) => item.key}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingBottom: Default.fixPadding * 1.2,
                }}
              />

              <View
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  alignItems: "center",
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
                    {tr("cancel")}
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
                    {tr("okay")}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Date Calendar Modal */}
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
                      justifyContent: 'center',
                      shadowColor: Colors.primary,
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
    </Modal>

    {/* Gate Pass Modal */}
    {createdCab && (
      <GatePassModal
        visible={openGatePassModal}
        visitorData={createdCab}
        onClose={() => {
          setOpenGatePassModal(false);
          setCreatedCab(null);
          props.closeAddCabModal();
        }}
      />
    )}
    </>
  );
};

export default AddCabModal;

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
  cancelOkBtn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Default.fixPadding * 1.4,
    borderRadius: 10,
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
  companyNameTouchOpacity: {
    alignItems: "center",
    paddingHorizontal: Default.fixPadding * 1.4,
    paddingVertical: Default.fixPadding * 1.5,
    marginTop: Default.fixPadding * 0.5,
    marginBottom: Default.fixPadding * 2,
    borderRadius: 10,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
});
