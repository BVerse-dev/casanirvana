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
  FlatList,
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
import DashedLine from "react-native-dashed-line";
import GatePassModal from "./gatePassModal";
import { useCreateService } from "../hooks/useCreateService";

const { width, height } = Dimensions.get("window");

const ServiceModal = (props) => {
  const { t, i18n } = useTranslation();
  const createServiceMutation = useCreateService();

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`serviceModal:${key}`);
  }

  const [serviceModal, setServiceModal] = useState(false);
  const [createdService, setCreatedService] = useState(null);
  const [openGatePassModal, setOpenGatePassModal] = useState(false);

  const allServiceList = [
    {
      key: "1",
      title: tr("aCRepair"),
    },
    {
      key: "2",
      title: tr("tvRepair"),
    },
    {
      key: "3",
      title: tr("mixerGrinderRepair"),
    },
    {
      key: "4",
      title: tr("doorBellRepair"),
    },
    {
      key: "5",
      title: tr("fanRepair"),
    },
  ];

  const [selectedService, setSelectedService] = useState(tr("aCRepair"));
  const [confirmService, setConfirmService] = useState();

  const renderItemService = ({ item }) => {
    const isSelected = selectedService === item.title;
    return (
      <TouchableOpacity
        onPress={() => setSelectedService(item.title)}
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
          {item.title}
        </Text>
      </TouchableOpacity>
    );
  };

  const today = moment().format("YYYY-MM-DD");

  const [date, setDate] = useState(today);
  const [dateCalendarModal, setDateCalendarModal] = useState(false);

  const onDateChange = (day) => {
    console.log('Date selected:', day);
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

  // Submit function
  const handleSubmit = async () => {
    console.log('Submit button pressed!');
    
    // Validation - use confirmService instead of selectedService
    const serviceToUse = confirmService || selectedService;
    console.log('Service to use:', serviceToUse);
    console.log('Date:', date);
    
    if (!serviceToUse?.trim()) {
      Alert.alert('Validation Error', 'Please select a service type.');
      setServiceModal(true); // Open service selection modal
      return;
    }
    
    if (!date) {
      Alert.alert('Validation Error', 'Please select a service date.');
      setDateCalendarModal(true);
      return;
    }

    try {
      console.log('Starting service creation...');
      
      // Generate service provider name
      const serviceName = `${serviceToUse} Service Provider`;
      
      // Create service pass in database
      const newService = await createServiceMutation.mutateAsync({
        serviceName: serviceName,
        phoneNumber: "", // Not collected in this UI
        serviceType: serviceToUse,
        serviceTime: selectedFromTime ? moment(selectedFromTime).format('HH:mm') : '09:00',
        serviceDetails: writeProblem || serviceToUse,
        visitDate: date,
        sendGatePassNotification: true,
      });

      console.log('Service created successfully:', newService);
      
      // Set the created service data
      setCreatedService(newService);
      
      console.log('About to open gate pass modal...');
      // Open gate pass modal
      setOpenGatePassModal(true);
    } catch (error) {
      console.error('Create service error:', error);
      Alert.alert('Error', 'Failed to create service pass. Please try again.');
    }
  };

  return (
    <>
    <Modal
      transparent={true}
      animationType="fade"
      visible={props.visible}
      onRequestClose={props.closeServiceModal}
    >
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={props.closeServiceModal}
          style={{ flex: 1, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
        <KeyboardAvoidingView behavior={"padding"} style={{ flex: 1 }} pointerEvents="box-none">
          <View style={styles.mainModalView} pointerEvents="box-none">
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
                      {tr("selectService")}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setServiceModal(true)}
                      style={{
                        flexDirection: isRtl ? "row-reverse" : "row",
                        ...styles.serviceTouchOpacity,
                      }}
                    >
                      <View
                        style={{
                          flex: 1,
                          marginRight: isRtl ? 0 : Default.fixPadding,
                          marginLeft: isRtl ? Default.fixPadding : 0,
                        }}
                      >
                        <Text
                          numberOfLines={1}
                          style={{
                            ...(confirmService
                              ? Fonts.Medium15black
                              : Fonts.Medium15grey),
                            overflow: "hidden",
                            textAlign: isRtl ? "right" : "left",
                          }}
                        >
                          {confirmService
                            ? confirmService
                            : tr("selectService")}
                        </Text>
                      </View>
                      <Ionicons
                        name="caret-down-outline"
                        color={Colors.grey}
                        size={18}
                      />
                    </TouchableOpacity>

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
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>

      {/* Calendar Modal */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={dateCalendarModal}
        onRequestClose={() => setDateCalendarModal(false)}
      >
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setDateCalendarModal(false)}
            style={{ flex: 1, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />
          <View style={styles.mainModalView} pointerEvents="box-none">
            <View style={styles.subModalView}>
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
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        animationType="fade"
        visible={serviceModal}
        onRequestClose={() => setServiceModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPressOut={() => setServiceModal(false)}
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
                  {tr("selectService")}
                </Text>
              </View>
              <DashedLine
                dashGap={2.5}
                dashLength={2.5}
                dashThickness={1.5}
                dashColor={Colors.grey}
              />

              <FlatList
                data={allServiceList}
                renderItem={renderItemService}
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
                  onPress={() => setServiceModal(false)}
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
                    setConfirmService(selectedService);
                    setServiceModal(false);
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
                    {tr("ok")}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    {/* Gate Pass Modal */}
    {createdService && (
      <GatePassModal
        visible={openGatePassModal}
        visitorData={createdService}
        onClose={() => {
          setOpenGatePassModal(false);
          setCreatedService(null);
          // Don't close the main modal automatically - let user close it manually
          // props.closeServiceModal();
        }}
      />
    )}
    </>
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
  serviceTouchOpacity: {
    alignItems: "center",
    paddingHorizontal: Default.fixPadding,
    paddingVertical: Default.fixPadding * 1.5,
    marginTop: Default.fixPadding,
    marginBottom: Default.fixPadding * 2.5,
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
