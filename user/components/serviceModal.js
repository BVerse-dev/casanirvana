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
  Alert,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Colors, Fonts, Default } from "../constants/styles";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import AwesomeButton from "react-native-really-awesome-button";
import moment from "moment";
import FromToCalendarPicker from "./fromToCalendarPicker";
import { ms } from "react-native-size-matters/extend";
import DateTimePicker from "@react-native-community/datetimepicker";

const { width, height } = Dimensions.get("window");

const ServiceModal = (props) => {
  const { t, i18n } = useTranslation();

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`serviceModal:${key}`);
  }

  const [serviceModal, setServiceModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  const [selectedService, setSelectedService] = useState(props.title || "");
  const [confirmService, setConfirmService] = useState(props.title || "");

  const today = moment().format("YYYY-MM-DD");

  const [date, setDate] = useState();
  const [dateCalendarModal, setDateCalendarModal] = useState(false);

  const onDateChange = (day) => {
    setDate(day.dateString);
    setDateCalendarModal(false);
  };

  const [timePickerVisible, setTimePickerVisibility] = useState(false);
  const [selectedFromTime, setSelectedFromTime] = useState();

  const onTimeChangeHandle = (_, value) => {
    setTimePickerVisibility(false);
    setSelectedFromTime(value);
  };

  const confirmTime = (time) => {
    let hours = time.getHours();
    const minutes = time.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? "0" + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  };

  const [writeProblem, setWriteProblem] = useState();

  // Validation function
  const validateForm = () => {
    if (!date) {
      Alert.alert("Missing Information", "Please select a date for your service request.");
      return false;
    }
    if (!selectedFromTime) {
      Alert.alert("Missing Information", "Please select a time for your service request.");
      return false;
    }
    if (!writeProblem || writeProblem.trim() === "") {
      Alert.alert("Missing Information", "Please describe your service requirement.");
      return false;
    }
    return true;
  };

  // Function to create service booking
  const handleSubmit = () => {
    if (!validateForm()) return;

    // Format date for display (convert YYYY-MM-DD to readable format)
    const formatDisplayDate = (dateString) => {
      const date = moment(dateString);
      return date.format("DD MMM YYYY");
    };

    // Create new booking object
    const newBooking = {
      key: Date.now().toString(),
      id: `sb${Date.now()}`,
      image: props.image,
      title: props.title,
      date: formatDisplayDate(date), // Single date, not range
      time: confirmTime(selectedFromTime),
      confirmedBy: "Pending",
      price: "GH₵ 0.00", // Will be set by admin
      confirmed: false,
      pending: true,
      cancelled: false,
      status: "pending",
      payment_status: "pending",
      description: writeProblem,
      booking_date: date,
      start_time: confirmTime(selectedFromTime),
    };

    // Pass the new booking to parent component
    if (props.onBookingCreated) {
      props.onBookingCreated(newBooking);
    }

    // Show success modal
    setSuccessModal(true);
  };

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={props.visible}
      onRequestClose={props.closeServiceModal}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressOut={props.closeServiceModal}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView behavior={"padding"} style={{ flex: 1 }}>
          <View style={styles.mainModalView}>
            <TouchableWithoutFeedback>
              <View
                style={{
                  maxHeight: height / 1.6,
                  ...styles.subModalView,
                }}
              >
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <View style={styles.topImageView}>
                    <Image
                      source={
                        typeof props.image === 'number' 
                          ? props.image 
                          : typeof props.image === 'string' && props.image.startsWith('http')
                            ? { uri: props.image }
                            : require("../assets/images/service.png") // Fallback service image
                      }
                      style={{ width: 54, height: 54, resizeMode: "contain" }}
                    />
                  </View>
                </View>
                <TouchableOpacity
                  onPress={props.closeServiceModal}
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
                    ...Fonts.SemiBold18black,
                    overflow: "hidden",
                    textAlign: "center",
                    marginTop: Default.fixPadding,
                    marginBottom: Default.fixPadding * 2,
                  }}
                >
                  {`${tr("bookFor")} ${props.title}`}
                </Text>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <View
                    style={{
                      marginTop: Default.fixPadding * 2,
                      marginHorizontal: Default.fixPadding * 2,
                    }}
                  >
                    <Text
                      style={{
                        ...Fonts.SemiBold16black,
                        textAlign: isRtl ? "right" : "left",
                      }}
                    >
                      {tr("bookVisit")}
                    </Text>

                    <View
                      style={{
                        flexDirection: isRtl ? "row-reverse" : "row",
                        alignItems: "center",
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => setDateCalendarModal(true)}
                        style={{
                          flexDirection: isRtl ? "row-reverse" : "row",
                          marginRight: isRtl ? 0 : Default.fixPadding * 1.5,
                          marginLeft: isRtl ? Default.fixPadding * 1.5 : 0,
                          ...styles.dateTimeTouchOpacity,
                        }}
                      >
                        <Text
                          numberOfLines={1}
                          style={{
                            ...(date
                              ? Fonts.Medium15black
                              : Fonts.Medium15grey),
                            flex: 1,
                            overflow: "hidden",
                            textAlign: isRtl ? "right" : "left",
                            marginRight: isRtl ? 0 : Default.fixPadding,
                            marginLeft: isRtl ? Default.fixPadding : 0,
                          }}
                        >
                          {date ? date : tr("selectDate")}
                        </Text>
                        <MaterialCommunityIcons
                          name="calendar-range-outline"
                          size={18}
                          color={Colors.grey}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => setTimePickerVisibility(true)}
                        style={{
                          flexDirection: isRtl ? "row-reverse" : "row",
                          ...styles.dateTimeTouchOpacity,
                        }}
                      >
                        <Text
                          numberOfLines={1}
                          style={{
                            ...(selectedFromTime
                              ? Fonts.Medium15black
                              : Fonts.Medium15grey),
                            flex: 1,
                            overflow: "hidden",
                            textAlign: isRtl ? "right" : "left",
                            marginRight: isRtl ? 0 : Default.fixPadding,
                            marginLeft: isRtl ? Default.fixPadding : 0,
                          }}
                        >
                          {selectedFromTime
                            ? confirmTime(selectedFromTime)
                            : tr("selectTime")}
                        </Text>
                        <MaterialCommunityIcons
                          name="clock-time-three-outline"
                          size={18}
                          color={Colors.grey}
                        />
                      </TouchableOpacity>
                    </View>
                    {timePickerVisible && (
                      <DateTimePicker
                        value={selectedFromTime ? selectedFromTime : new Date()}
                        mode={"time"}
                        onChange={onTimeChangeHandle}
                        accentColor={Colors.primary}
                      />
                    )}

                    <Text
                      style={{
                        ...Fonts.SemiBold16black,
                        textAlign: isRtl ? "right" : "left",
                      }}
                    >
                      {tr("briefYourProblem")}
                    </Text>

                    <View
                      style={{
                        marginBottom: Default.fixPadding * 2,
                        ...styles.textInputView,
                      }}
                    >
                      <TextInput
                        multiline={true}
                        numberOfLines={5}
                        value={writeProblem}
                        onChangeText={setWriteProblem}
                        textAlignVertical="top"
                        placeholder={tr("writeYourProblem")}
                        placeholderTextColor={Colors.grey}
                        selectionColor={Colors.primary}
                        style={{
                          ...Fonts.Medium15black,
                          height: ms(95),
                          textAlign: isRtl ? "right" : "left",
                        }}
                      />
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
                  >
                    <Text style={{ ...Fonts.SemiBold18white }}>
                      {tr("submit")}
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
                  }}
                >
                  {tr("selectDate")}
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
                  paddingBottom: Default.fixPadding * 1.5,
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

      {/* Success Modal */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={successModal}
        onRequestClose={() => setSuccessModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPressOut={() => {
            setSuccessModal(false);
            props.closeServiceModal();
            // Clear form
            setSelectedFromTime();
            setWriteProblem("");
            setDate();
          }}
          style={{ flex: 1 }}
        >
          <View style={styles.mainModalView}>
            <TouchableOpacity 
              activeOpacity={1} 
              style={{
                width: width * 0.85,
                borderRadius: 15,
                backgroundColor: Colors.white,
                paddingVertical: Default.fixPadding * 3,
                paddingHorizontal: Default.fixPadding * 2,
                alignItems: "center",
                ...Default.shadow,
              }}
            >
              {/* Success Icon */}
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: Colors.green,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: Default.fixPadding * 2,
                }}
              >
                <MaterialCommunityIcons
                  name="check"
                  size={50}
                  color={Colors.white}
                />
              </View>

              {/* Success Title */}
              <Text
                style={{
                  ...Fonts.SemiBold20black,
                  textAlign: "center",
                  marginBottom: Default.fixPadding,
                }}
              >
                Service Request Submitted!
              </Text>

              {/* Success Message */}
              <Text
                style={{
                  ...Fonts.Medium16grey,
                  textAlign: "center",
                  lineHeight: 24,
                  marginBottom: Default.fixPadding * 2,
                }}
              >
                Your request for{" "}
                <Text style={{ ...Fonts.SemiBold16primary }}>
                  {props.title}
                </Text>
                {" "}has been successfully submitted.
              </Text>

              <Text
                style={{
                  ...Fonts.Medium14grey,
                  textAlign: "center",
                  lineHeight: 20,
                  marginBottom: Default.fixPadding * 2.5,
                }}
              >
                Our admin will review your request and assign a service provider. Please proceed with payment to confirm your booking.
              </Text>

              {/* Single Payment Button */}
              <TouchableOpacity
                onPress={() => {
                  // Create service booking details to pass to payment
                  const serviceBookingDetails = {
                    serviceTitle: props.title,
                    serviceName: props.title,
                    date: date,
                    time: selectedFromTime ? confirmTime(selectedFromTime) : null,
                    description: writeProblem,
                    image: props.image,
                    amount: 0, // Will be set by admin
                    type: "service_booking"
                  };
                  
                  setSuccessModal(false);
                  props.closeServiceModal();
                  // Clear form
                  setSelectedFromTime();
                  setWriteProblem("");
                  setDate();
                  // Navigate to payment method selection with service details
                  if (props.onProceedToPayment) {
                    props.onProceedToPayment(serviceBookingDetails);
                  }
                }}
                style={{
                  width: "100%",
                  backgroundColor: Colors.primary,
                  paddingVertical: Default.fixPadding * 1.4,
                  borderRadius: 10,
                  alignItems: "center",
                  elevation: 2,
                  shadowColor: Colors.primary,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 3,
                }}
              >
                <Text style={{ ...Fonts.SemiBold16white }}>
                  Proceed to Payment
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </Modal>
  );
};

export default ServiceModal;

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
  dateTimeTouchOpacity: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Default.fixPadding * 1.5,
    paddingHorizontal: Default.fixPadding,
    marginTop: Default.fixPadding,
    marginBottom: Default.fixPadding * 2.5,
    borderRadius: 10,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  textInputView: {
    marginTop: Default.fixPadding,
    paddingHorizontal: Default.fixPadding * 1.4,
    paddingVertical: Default.fixPadding * 1.2,
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
});
