import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  Dimensions,
  StyleSheet,
  Image,
  ScrollView,
  Modal,
  Alert,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MyStatusBar from "../components/myStatusBar";
import { ms } from "react-native-size-matters/extend";
import DashedLine from "react-native-dashed-line";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AwesomeButton from "react-native-really-awesome-button";
import FromToCalendarPicker from "../components/fromToCalendarPicker";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import { useCreateAmenityBooking } from "../hooks/useCreateAmenityBooking";
import { useHasJoinedCommunity } from "../hooks/useCommunityData";

const { width } = Dimensions.get("window");

const BookAmenityScreen = ({ navigation, route }) => {
  const { 
    image, 
    name, 
    amenityId, 
    description, 
    capacity, 
    location, 
    operating_hours, 
    contact_person, 
    contact_phone, 
    booking_phone,
    price,
    charges_per_hour,
    monthly_charges
  } = route.params;

  const { t, i18n } = useTranslation();
  const { profile } = useHasJoinedCommunity();
  const createBookingMutation = useCreateAmenityBooking();

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`bookAmenityScreen:${key}`);
  }

  const backAction = () => {
    navigation.pop();
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => {
      const subscription = BackHandler.addEventListener("hardwareBackPress", backAction); 
      return () => subscription?.remove(); 
    };
  }, []);

  const today = moment().format("YYYY-MM-DD");

  const [fromDate, setFromDate] = useState(today);
  const [fromDateCalendarModal, setFromDateCalendarModal] = useState(false);

  const onFromDateChange = (day) => {
    setFromDate(day.dateString);
    setFromDateCalendarModal(false);
  };

  const [toDate, setToDate] = useState(today);
  const [toDateCalendarModal, setToDateCalendarModal] = useState(false);

  const onToDateChange = (day) => {
    setToDate(day.dateString);
    setToDateCalendarModal(false);
  };

  const [fromTimePickerVisible, setFromTimePickerVisibility] = useState(false);
  const [selectedFromTime, setSelectedFromTime] = useState(new Date());

  const onFromTimeChangeHandle = (_, value) => {
    setFromTimePickerVisibility(false);
    setSelectedFromTime(value);
  };

  const [toTimePickerVisible, setToTimePickerVisibility] = useState(false);
  const [selectedToTime, setSelectedToTime] = useState(new Date());

  const onToTimeChangeHandle = (_, value) => {
    setToTimePickerVisibility(false);
    setSelectedToTime(value);
  };

  // State for total amount and days
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalDays, setTotalDays] = useState(0);

  // Recalculate total amount and days whenever dates or times change
  useEffect(() => {
    const newDays = calculateDays();
    const newTotal = calculatePrice();
    setTotalDays(newDays);
    setTotalAmount(newTotal);
  }, [fromDate, toDate, selectedFromTime, selectedToTime, calculateDays, calculatePrice]);

  const confirmTime = (time) => {
    let hours = time.getHours();
    const minutes = time.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? "0" + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  };

  // Calculate number of days based on selected dates
  const calculateDays = useCallback(() => {
    if (!fromDate || !toDate) {
      return 0;
    }

    const fromDateTime = moment(fromDate, 'YYYY-MM-DD');
    const toDateTime = moment(toDate, 'YYYY-MM-DD');
    
    if (!fromDateTime.isValid() || !toDateTime.isValid()) {
      return 0;
    }

    const daysDiff = toDateTime.diff(fromDateTime, 'days');
    return Math.max(1, daysDiff + 1); // +1 to include both start and end days, minimum 1 day
  }, [fromDate, toDate]);

  // Calculate booking price based on duration
  const calculatePrice = useCallback(() => {
    if (!fromDate || !toDate || !selectedFromTime || !selectedToTime) {
      return 0;
    }

    const fromDateTime = moment(`${fromDate} ${confirmTime(selectedFromTime)}`, 'YYYY-MM-DD h:mm A');
    const toDateTime = moment(`${toDate} ${confirmTime(selectedToTime)}`, 'YYYY-MM-DD h:mm A');
    
    if (!fromDateTime.isValid() || !toDateTime.isValid()) {
      return 0;
    }

    const duration = moment.duration(toDateTime.diff(fromDateTime));
    const hours = Math.max(1, Math.ceil(duration.asHours())); // Minimum 1 hour
    const days = Math.max(1, Math.ceil(duration.asDays())); // Minimum 1 day

    // Calculate days based on date selection (more accurate for daily pricing)
    const fromDateOnly = moment(fromDate, 'YYYY-MM-DD');
    const toDateOnly = moment(toDate, 'YYYY-MM-DD');
    const daysDiff = toDateOnly.diff(fromDateOnly, 'days');
    const totalDaysFromDates = Math.max(1, daysDiff + 1); // +1 to include both start and end days

    // Get pricing from route params (passed from amenity selection)
    const amenityData = route.params;
    
    console.log('Amenity pricing data:', {
      charges_per_hour: amenityData.charges_per_hour,
      monthly_charges: amenityData.monthly_charges,
      price: amenityData.price,
      hours: hours,
      days: days,
      totalDaysFromDates: totalDaysFromDates
    });
    
    // Try hourly pricing first
    if (amenityData.charges_per_hour && amenityData.charges_per_hour > 0) {
      const total = hours * amenityData.charges_per_hour;
      console.log('Hourly pricing:', total);
      return total;
    } 
    // Try daily pricing (using price field) - use the calculated days from date selection
    else if (amenityData.price && amenityData.price > 0) {
      const total = totalDaysFromDates * amenityData.price;
      console.log('Daily pricing:', total, 'days:', totalDaysFromDates, 'price per day:', amenityData.price);
      return total;
    }
    // Try monthly pricing
    else if (amenityData.monthly_charges && amenityData.monthly_charges > 0) {
      const total = Math.ceil(totalDaysFromDates / 30) * amenityData.monthly_charges;
      console.log('Monthly pricing:', total);
      return total;
    } 
    // Default to free
    console.log('Free pricing');
    return 0;
  }, [fromDate, toDate, selectedFromTime, selectedToTime, route.params]);

  // Handle proceed to payment
  const handleProceedToPayment = async () => {
    console.log('BookAmenity - handleProceedToPayment called');
    
    if (!profile) {
      Alert.alert('Authentication Required', 'Please log in to book an amenity.');
      return;
    }

    if (!amenityId) {
      Alert.alert('Error', 'Amenity information is missing.');
      return;
    }

    if (moment(toDate).isBefore(moment(fromDate))) {
      Alert.alert('Invalid Date', 'End date must be after start date.');
      return;
    }

    const bookingStartTime = moment(`${fromDate} ${confirmTime(selectedFromTime)}`, 'YYYY-MM-DD h:mm A');
    if (bookingStartTime.isBefore(moment())) {
      Alert.alert('Invalid Date', 'Booking cannot be in the past.');
      return;
    }

    console.log('BookAmenity - All validations passed, proceeding with booking...');

    try {
      // Use the calculated total days
      const calculatedDays = totalDays > 0 ? totalDays : 1;

      // Create the booking data
      const bookingData = {
        amenity_id: amenityId,
        user_id: profile.user_id,
        start_datetime: moment(`${fromDate} ${confirmTime(selectedFromTime)}`, 'YYYY-MM-DD h:mm A').toISOString(),
        end_datetime: moment(`${toDate} ${confirmTime(selectedToTime)}`, 'YYYY-MM-DD h:mm A').toISOString(),
        booking_date: moment().format('YYYY-MM-DD'),
        start_time: confirmTime(selectedFromTime),
        end_time: confirmTime(selectedToTime),
        amount: totalAmount,
        total_days: calculatedDays,
        status: 'pending',
        payment_status: totalAmount > 0 ? 'pending' : 'paid',
      };

      // Create the booking in the database
      console.log('BookAmenity - Creating booking with data:', bookingData);
      const result = await createBookingMutation.mutateAsync(bookingData);
      console.log('BookAmenity - Booking creation result:', result);

      if (result) {
        console.log('BookAmenity - Navigating to payment method screen...');
        // Navigate to payment method selection screen
        navigation.push("paymentMethodScreen", {
          bookingId: result.id,
          bookingData: {
            ...bookingData,
            amenityName: name,
            totalAmount,
            totalDays: calculatedDays,
            fromDate,
            toDate,
            fromTime: confirmTime(selectedFromTime),
            toTime: confirmTime(selectedToTime),
          }
        });
      } else {
        console.log('BookAmenity - No result returned from booking creation');
        Alert.alert('Booking Error', 'Booking was created but no result returned. Please try again.');
      }
    } catch (error) {
      console.error('Booking creation failed:', error);
      Alert.alert('Booking Failed', 'There was an error creating your booking. Please try again.');
    }
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
          {tr("bookAmenity")}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={{
            marginTop: Default.fixPadding * 0.8,
            marginBottom: Default.fixPadding * 3.6,
            marginHorizontal: Default.fixPadding * 2,
            borderRadius: 10,
            backgroundColor: Colors.white,
            ...Default.shadow,
          }}
        >
          <View
            style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                flex: 6,
                alignItems: isRtl ? "flex-end" : "flex-start",
                paddingTop: Default.fixPadding * 0.8,
                paddingHorizontal: Default.fixPadding * 1.1,
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  ...Fonts.SemiBold16black,
                  overflow: "hidden",
                }}
              >
                {name}
              </Text>
            </View>
            <View
              style={{
                flex: 4,
                alignItems: isRtl ? "flex-start" : "flex-end",
              }}
            >
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  width: 103,
                  paddingVertical: Default.fixPadding * 0.3,
                  backgroundColor: Colors.green,
                  borderTopRightRadius: isRtl ? 0 : 10,
                  borderTopLeftRadius: isRtl ? 10 : 0,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    ...Fonts.SemiBold16white,
                    overflow: "hidden",
                    paddingHorizontal: Default.fixPadding * 0.5,
                  }}
                >
                  {tr("paid")}
                </Text>
              </View>
            </View>
          </View>

          <View
            style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              alignItems: "center",
              paddingTop: Default.fixPadding,
              paddingBottom: Default.fixPadding * 0.9,
              paddingHorizontal: Default.fixPadding * 1.1,
            }}
          >
            <View
              style={{
                flex: 1,
                flexDirection: isRtl ? "row-reverse" : "row",
                alignItems: "center",
              }}
            >
              <Image
                source={image}
                style={{
                  resizeMode: "cover",
                  width: ms(77),
                  height: ms(77),
                  borderRadius: 10,
                }}
              />

              <View
                style={{
                  flex: 1,
                  alignItems: isRtl ? "flex-end" : "flex-start",
                  paddingHorizontal: Default.fixPadding * 1.5,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{ ...Fonts.Medium14grey, overflow: "hidden" }}
                >
                  {`${tr("maximinCapacity")} : `}
                  <Text style={{ ...Fonts.Medium14black }}>50 person</Text>
                </Text>

                <Text
                  numberOfLines={1}
                  style={{
                    ...Fonts.Medium14grey,
                    overflow: "hidden",
                    marginVertical: Default.fixPadding * 0.8,
                  }}
                >
                  {`${tr("bookBeforeLeast")} : `}
                  <Text style={{ ...Fonts.Medium14black }}>2 days</Text>
                </Text>
                <Text
                  numberOfLines={1}
                  style={{ ...Fonts.Medium14black, overflow: "hidden" }}
                >
                  {charges_per_hour && charges_per_hour > 0 
                    ? `GH₵ ${charges_per_hour} per hour`
                    : price && price > 0
                    ? `GH₵ ${price} per day`
                    : monthly_charges && monthly_charges > 0
                    ? `GH₵ ${monthly_charges} per month`
                    : 'Free'
                  }
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.selectDateTimeView}>
          <Text
            style={{
              ...Fonts.SemiBold16black,
              textAlign: isRtl ? "right" : "left",
            }}
          >
            {tr("selectDates")}
          </Text>
        </View>
        <View
          style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            alignItems: "center",
            marginTop: Default.fixPadding * 1.5,
            marginBottom: Default.fixPadding * 2,
            marginHorizontal: Default.fixPadding,
          }}
        >
          <View style={{ flex: 1, marginHorizontal: Default.fixPadding }}>
            <Text
              numberOfLines={1}
              style={{
                ...Fonts.SemiBold15black,
                overflow: "hidden",
                textAlign: isRtl ? "right" : "left",
              }}
            >
              {tr("from")}
            </Text>
            <TouchableOpacity
              onPress={() => setFromDateCalendarModal(true)}
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                ...styles.toFromBox,
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  ...Fonts.SemiBold14black,
                  flex: 1,
                  overflow: "hidden",
                  textAlign: isRtl ? "right" : "left",
                }}
              >
                {fromDate}
              </Text>
              <MaterialCommunityIcons
                name="calendar-month-outline"
                size={20}
                color={Colors.grey}
              />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, marginHorizontal: Default.fixPadding }}>
            <Text
              numberOfLines={1}
              style={{
                ...Fonts.SemiBold15black,
                overflow: "hidden",
                textAlign: isRtl ? "right" : "left",
              }}
            >
              {tr("to")}
            </Text>
            <TouchableOpacity
              onPress={() => setToDateCalendarModal(true)}
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                ...styles.toFromBox,
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  ...Fonts.SemiBold14black,
                  flex: 1,
                  overflow: "hidden",
                  textAlign: isRtl ? "right" : "left",
                }}
              >
                {toDate}
              </Text>
              <MaterialCommunityIcons
                name="calendar-month-outline"
                size={20}
                color={Colors.grey}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.selectDateTimeView}>
          <Text
            style={{
              ...Fonts.SemiBold16black,
              textAlign: isRtl ? "right" : "left",
            }}
          >
            {tr("selectTime")}
          </Text>
        </View>
        <View
          style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            alignItems: "center",
            marginTop: Default.fixPadding * 1.5,
            marginBottom: Default.fixPadding * 2,
            marginHorizontal: Default.fixPadding,
          }}
        >
          <View style={{ flex: 1, marginHorizontal: Default.fixPadding }}>
            <Text
              numberOfLines={1}
              style={{
                ...Fonts.SemiBold14black,
                overflow: "hidden",
                textAlign: isRtl ? "right" : "left",
              }}
            >
              {tr("from")}
            </Text>
            <TouchableOpacity
              onPress={() => setFromTimePickerVisibility(true)}
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                ...styles.toFromBox,
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  ...Fonts.SemiBold14black,
                  flex: 1,
                  overflow: "hidden",
                  textAlign: isRtl ? "right" : "left",
                }}
              >
                {confirmTime(selectedFromTime)}
              </Text>
              <MaterialCommunityIcons
                name="clock-time-three-outline"
                size={20}
                color={Colors.grey}
              />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, marginHorizontal: Default.fixPadding }}>
            <Text
              numberOfLines={1}
              style={{
                ...Fonts.SemiBold15black,
                overflow: "hidden",
                textAlign: isRtl ? "right" : "left",
              }}
            >
              {tr("to")}
            </Text>
            <TouchableOpacity
              onPress={() => setToTimePickerVisibility(true)}
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                ...styles.toFromBox,
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  ...Fonts.SemiBold14black,
                  flex: 1,
                  overflow: "hidden",
                  textAlign: isRtl ? "right" : "left",
                }}
              >
                {confirmTime(selectedToTime)}
              </Text>
              <MaterialCommunityIcons
                name="clock-time-three-outline"
                size={20}
                color={Colors.grey}
              />
            </TouchableOpacity>
          </View>
        </View>
        {fromTimePickerVisible && (
          <DateTimePicker
            value={selectedFromTime}
            mode={"time"}
            onChange={onFromTimeChangeHandle}
            accentColor={Colors.primary}
          />
        )}
        {toTimePickerVisible && (
          <DateTimePicker
            value={selectedToTime}
            mode={"time"}
            onChange={onToTimeChangeHandle}
            accentColor={Colors.primary}
          />
        )}

        <DashedLine
          dashGap={2.5}
          dashLength={2.5}
          dashThickness={1.5}
          dashColor={Colors.grey}
        />

        <View
          style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: Default.fixPadding * 2,
            paddingHorizontal: Default.fixPadding * 2,
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              ...Fonts.SemiBold15grey,
              flex: 1,
              overflow: "hidden",
              textAlign: isRtl ? "right" : "left",
            }}
          >
            {tr("totalDay")}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              ...Fonts.SemiBold15grey,
              flex: 1,
              overflow: "hidden",
              textAlign: isRtl ? "left" : "right",
            }}
          >
            {totalDays} {totalDays === 1 ? 'day' : 'days'}
          </Text>
        </View>

        <View
          style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: Default.fixPadding * 2,
            paddingTop: Default.fixPadding * 1.5,
            marginBottom: Default.fixPadding,
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              ...Fonts.SemiBold15primary,
              flex: 1,
              overflow: "hidden",
              textAlign: isRtl ? "right" : "left",
            }}
          >
            {tr("amountPay")}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              ...Fonts.SemiBold15primary,
              flex: 1,
              overflow: "hidden",
              textAlign: isRtl ? "left" : "right",
            }}
          >
            {totalAmount > 0 ? `GH₵ ${totalAmount.toFixed(2)}` : 'Free'}
          </Text>
        </View>
      </ScrollView>

      <View
        style={{
          marginTop: Default.fixPadding,
          marginBottom: Default.fixPadding * 2,
          marginHorizontal: Default.fixPadding * 2,
        }}
      >
        <AwesomeButton
          height={50}
          onPress={handleProceedToPayment}
          raiseLevel={1}
          stretch={true}
          borderRadius={10}
          backgroundShadow={Colors.primary}
          backgroundDarker={Colors.primary}
          backgroundColor={Colors.primary}
          disabled={createBookingMutation.isLoading}
        >
          <Text style={{ ...Fonts.SemiBold18white }}>
            {createBookingMutation.isLoading ? 'Processing...' : tr("proceedPay")}
          </Text>
        </AwesomeButton>
      </View>

      <Modal
        transparent={true}
        animationType="fade"
        visible={fromDateCalendarModal}
        onRequestClose={() => setFromDateCalendarModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPressOut={() => setFromDateCalendarModal(false)}
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
                  onPress={() => setFromDateCalendarModal(false)}
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
                  marginBottom: Default.fixPadding * 1.2,
                }}
              >
                <FromToCalendarPicker
                  minDate={today}
                  current={fromDate}
                  onDayPress={onFromDateChange}
                />
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={toDateCalendarModal}
        onRequestClose={() => setToDateCalendarModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPressOut={() => setToDateCalendarModal(false)}
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
                  onPress={() => setToDateCalendarModal(false)}
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
                  marginBottom: Default.fixPadding * 1.2,
                }}
              >
                <FromToCalendarPicker
                  minDate={fromDate}
                  current={toDate}
                  onDayPress={onToDateChange}
                />
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default BookAmenityScreen;

const styles = StyleSheet.create({
  toFromBox: {
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Default.fixPadding,
    paddingHorizontal: Default.fixPadding * 0.9,
    paddingVertical: Default.fixPadding * 1.5,
    borderRadius: 5,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  selectDateTimeView: {
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 1.2,
    backgroundColor: Colors.regularLightGrey,
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
});
