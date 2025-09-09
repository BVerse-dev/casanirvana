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
  Alert,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Colors, Fonts, Default } from "../constants/styles";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import AwesomeButton from "react-native-really-awesome-button";
import DashedLine from "react-native-dashed-line";
import moment from "moment";
import FromToCalendarPicker from "./fromToCalendarPicker";
import GatePassModal from "./gatePassModal";
import { useCreateDelivery } from "../hooks/useCreateDelivery";

const { width, height } = Dimensions.get("window");

const AddDeliveryModal = (props) => {
  const { t, i18n } = useTranslation();
  const createDeliveryMutation = useCreateDelivery();

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`addDeliveryModal:${key}`);
  }

  // Form state
  const [deliveryPersonName, setDeliveryPersonName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [deliveryDetails, setDeliveryDetails] = useState("");
  const [send, setSend] = useState(true);
  const [createdDelivery, setCreatedDelivery] = useState(null);
  const [openGatePassModal, setOpenGatePassModal] = useState(false);

  const [companyNameModal, setCompanyNameModal] = useState(false);

  const companyNameList = [
    {
      key: "1",
      name: "Yango Delivery",
    },
    {
      key: "2",
      name: "Uber Delivery",
    },
    {
      key: "3",
      name: "Bolt Delivery",
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
  const [selectedCompanyName, setSelectedCompanyName] = useState("Yango Delivery");
  const [confirmCompanyName, setConfirmCompanyName] = useState();

  const renderItemCompanyName = ({ item }) => {
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

  // Calendar date selection (replacing Today/Tomorrow dropdown)
  const today = moment().format("YYYY-MM-DD");
  const [date, setDate] = useState(today);
  const [dateCalendarModal, setDateCalendarModal] = useState(false);

  // Submit function
  const handleSubmit = async () => {
    console.log('🚚 Delivery submit clicked', { date, selectedCompanyName });
    
    // Validation
    if (!date) {
      Alert.alert('Validation Error', 'Please select a delivery date.');
      setDateCalendarModal(true);
      return;
    }

    try {
      console.log('🚚 Creating delivery with data:', {
        deliveryPersonName: deliveryPersonName || "Delivery Person",
        phoneNumber: phoneNumber || "",
        companyName: selectedCompanyName,
        deliveryDetails: deliveryDetails || "Package delivery",
        visitDate: date,
        sendGatePassNotification: send,
      });

      // Create delivery pass in database
      const newDelivery = await createDeliveryMutation.mutateAsync({
        deliveryPersonName: deliveryPersonName || "Delivery Person",
        phoneNumber: phoneNumber || "",
        companyName: selectedCompanyName,
        deliveryDetails: deliveryDetails || "Package delivery",
        visitDate: date,
        sendGatePassNotification: send,
      });

      console.log('🚚 Delivery created successfully:', newDelivery);

      // Set the created delivery data
      setCreatedDelivery(newDelivery);
      
      // Open gate pass modal
      setOpenGatePassModal(true);
    } catch (error) {
      console.error('🚚 Create delivery error:', error);
      Alert.alert('Error', 'Failed to create delivery pass. Please try again.');
    }
  };
  const onDateChange = (day) => {
    setDate(day.dateString);
    setDateCalendarModal(false);
  };
  
  // Format the date in a more user-friendly format when displayed
  const formatDisplayDate = (dateString) => {
    if (!dateString || typeof dateString !== 'string') return '';
    try {
      const momentObj = moment(dateString);
      if (!momentObj.isValid()) {
        return '';
      }
      return momentObj.format('dddd, MMMM D, YYYY') || '';
    } catch (error) {
      console.warn('Error formatting date:', error);
      return '';
    }
  };

  return (
    <>
    <Modal
      transparent={true}
      animationType="fade"
      visible={props.visible}
      onRequestClose={props.closeAddDeliveryModal}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressOut={props.closeAddDeliveryModal}
        style={{ flex: 1 }}
      >
        <View style={styles.mainModalView}>
          <TouchableWithoutFeedback>
            <View style={{ ...styles.subModalView, maxHeight: height / 1.7 }}>
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View style={styles.topImageView}>
                  <Image
                    source={require("../assets/images/pre3.png")}
                    style={{ width: 54, height: 54, resizeMode: "contain" }}
                  />
                </View>
              </View>
              <TouchableOpacity
                onPress={props.closeAddDeliveryModal}
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
                {tr("allowMyDelivery")}
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
                      ...Fonts.Medium16black,
                      textAlign: isRtl ? "right" : "left",
                    }}
                  >
                    {tr("deliveryCompany")}
                  </Text>

                  <TouchableOpacity
                    onPress={() => setCompanyNameModal(true)}
                    style={{
                      flexDirection: isRtl ? "row-reverse" : "row",
                      marginBottom: Default.fixPadding * 2.5,
                      ...styles.touchOpacityBox,
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
                        : tr("selectDeliveryCompany")}
                    </Text>

                    <Ionicons
                      name="chevron-down"
                      size={18}
                      color={Colors.black}
                    />
                  </TouchableOpacity>

                  <Text
                    style={{
                      ...Fonts.Medium16black,
                      textAlign: isRtl ? "right" : "left",
                    }}
                  >
                    {tr("enterDate")}
                  </Text>
                  
                  <TouchableOpacity
                    onPress={() => setDateCalendarModal(true)}
                    style={{
                      flexDirection: isRtl ? "row-reverse" : "row",
                      marginBottom: Default.fixPadding * 2,
                      ...styles.touchOpacityBox,
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
                      {date ? (formatDisplayDate(date) || tr("selectDate") || "Select Date") : (tr("selectDate") || "Select Date")}
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
                    marginBottom: Default.fixPadding * 2,
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
                        {tr("today") || "Today"}
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
                        {tr("tomorrow") || "Tomorrow"}
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
                renderItem={renderItemCompanyName}
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
              width: width * 0.9,
              borderRadius: 10,
              backgroundColor: Colors.white,
              ...Default.shadow,
            }}>
              <Text
                style={{
                  ...Fonts.Medium18primary,
                  textAlign: "center",
                  marginVertical: Default.fixPadding * 1.6,
                }}
              >
                {tr("selectDate") || "Select Date"}
              </Text>
              <DashedLine
                dashGap={2.5}
                dashLength={2.5}
                dashThickness={1.5}
                dashColor={Colors.grey}
              />
              
              <FromToCalendarPicker
                markedDates={{
                  [date]: { selected: true, selectedColor: Colors.primary }
                }}
                onDayPress={onDateChange}
                minDate={today}
                hideArrows={false}
                disableAllTouchEventsForDisabledDays={true}
                enableSwipeMonths={true}
              />
              
              <View
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  alignItems: "center",
                  marginBottom: Default.fixPadding * 2.6,
                  marginHorizontal: Default.fixPadding * 2.6,
                }}
              >
                <TouchableOpacity
                  onPress={() => setDateCalendarModal(false)}
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
                    setDateCalendarModal(false);
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
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </Modal>

    {/* Gate Pass Modal */}
    {createdDelivery && (
      <GatePassModal
        visible={openGatePassModal}
        visitorData={createdDelivery}
        onClose={() => {
          setOpenGatePassModal(false);
          setCreatedDelivery(null);
          props.closeAddDeliveryModal();
        }}
      />
    )}
    </>
  );
};

export default AddDeliveryModal;

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
  touchOpacityBox: {
    alignItems: "center",
    marginTop: Default.fixPadding * 0.5,
    paddingHorizontal: Default.fixPadding * 1.4,
    paddingVertical: Default.fixPadding * 1.5,
    borderRadius: 10,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
});
