import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MyStatusBar from "../components/myStatusBar";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import { ms } from "react-native-size-matters/extend";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import ServiceModal from "../components/serviceModal";
import DashedLine from "react-native-dashed-line";

const ServiceScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`serviceScreen:${key}`);
  }

  const [openServiceModal, setOpenServiceModal] = useState(false);
  const [activeTab, setActiveTab] = useState('services');

  // Mock data for service bookings matching bookedAmenitiesScreen card design
  const [serviceBookingsList, setServiceBookingsList] = useState([
    {
      key: "1",
      id: "sb001",
      image: require("../assets/images/booked1.png"),
      title: "Home Cleaning Service",
      date: "25 Jul 2025",
      time: "09:00 AM",
      confirmedBy: "Sarah Johnson",
      price: "GH₵ 150.00",
      confirmed: true,
      pending: false,
      cancelled: false,
      status: "confirmed",
      payment_status: "paid",
    },
    {
      key: "2",
      id: "sb002",
      image: require("../assets/images/booked2.png"),
      title: "Appliance Repair",
      date: "28 Jul 2025",
      time: "02:00 PM",
      confirmedBy: "Mike Thompson",
      price: "GH₵ 200.00",
      confirmed: false,
      pending: true,
      cancelled: false,
      status: "pending",
      payment_status: "pending",
    },
    {
      key: "3",
      id: "sb003",
      image: require("../assets/images/booked3.png"),
      title: "Carpenter Service",
      date: "22 Jul 2025",
      time: "08:00 AM",
      confirmedBy: "David Wilson",
      price: "GH₵ 350.00",
      confirmed: true,
      pending: false,
      cancelled: false,
      status: "confirmed",
      payment_status: "paid",
    },
    {
      key: "4",
      id: "sb004",
      image: require("../assets/images/booked4.png"),
      title: "Home Painting",
      date: "15 Jul 2025",
      time: "08:00 AM",
      confirmedBy: "Pending",
      price: "GH₵ 800.00",
      confirmed: false,
      pending: false,
      cancelled: true,
      status: "cancelled",
      payment_status: "refunded",
    },
  ]);

  const serviceList = [
    {
      key: "1",
      title: tr("homeCleaning"),
      image: require("../assets/images/service1.png"),
    },
    {
      key: "2",
      title: tr("appliancesRepair"),
      image: require("../assets/images/service2.png"),
    },
    {
      key: "3",
      title: tr("carpentersService"),
      image: require("../assets/images/service3.png"),
    },
    {
      key: "4",
      title: tr("homePainting"),
      image: require("../assets/images/service.png"),
    },
    {
      key: "5",
      title: tr("plumbingService"),
      image: require("../assets/images/s7.png"),
    },
    {
      key: "6",
      title: tr("packerMovers"),
      image: require("../assets/images/service4.png"),
    },
    {
      key: "7",
      title: tr("homeSanitize"),
      image: require("../assets/images/service5.png"),
    },
    {
      key: "8",
      title: tr("hairBeauty"),
      image: require("../assets/images/service6.png"),
    },
    {
      key: "9",
      title: tr("laundryServices"),
      image: require("../assets/images/service8.png"),
    },
    {
      key: "10",
      title: tr("gardening"),
      image: require("../assets/images/service9.png"),
    },
    {
      key: "11",
      title: tr("cooking"),
      image: require("../assets/images/service10.png"),
    },
    {
      key: "12",
      title: tr("electricalServices"),
      image: require("../assets/images/s1.png"),
    },
    {
      key: "13",
      title: tr("hvacServices"),
      image: require("../assets/images/s2.png"),
    },
    {
      key: "14",
      title: tr("pestControl"),
      image: require("../assets/images/s3.png"),
    },
    {
      key: "15",
      title: tr("securityServices"),
      image: require("../assets/images/s4.png"),
    },
    {
      key: "16",
      title: tr("waterTankCleaning"),
      image: require("../assets/images/s1.png"),
    },
  ];

  const [selectedService, setSelectedService] = useState(0);

  // Function to handle new booking creation
  const handleBookingCreated = (newBooking) => {
    setServiceBookingsList(prevBookings => [newBooking, ...prevBookings]);
    // Switch to bookings tab to show the new booking
    setActiveTab('bookings');
  };

  // Function to switch to bookings tab
  const handleViewBookings = () => {
    setActiveTab('bookings');
  };

  // Function to handle payment navigation
  const handleProceedToPayment = (serviceBookingDetails) => {
    console.log('ServiceScreen - handleProceedToPayment called with:', serviceBookingDetails);
    
    // Navigate to payment method screen with service booking details
    navigation.navigate("paymentMethodScreen", {
      bookingType: "service",
      bookingData: {
        serviceName: serviceBookingDetails?.serviceName || serviceBookingDetails?.serviceTitle,
        serviceTitle: serviceBookingDetails?.serviceTitle || serviceBookingDetails?.serviceName,
        date: serviceBookingDetails?.date,
        time: serviceBookingDetails?.time,
        description: serviceBookingDetails?.description,
        image: serviceBookingDetails?.image,
        totalAmount: serviceBookingDetails?.amount || 0,
        type: "service_booking"
      },
      // Keep paymentData for backward compatibility
      paymentData: {
        amount: serviceBookingDetails?.amount || 0,
        description: "Service Booking Payment",
        type: "service_booking",
        title: `${serviceBookingDetails?.serviceTitle || 'Service'} Booking`
      }
    });
  };

  const renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedService(index);
          setOpenServiceModal(true);
        }}
        style={{
          marginLeft: index % 2 === 0 ? Default.fixPadding * 2 : Default.fixPadding,
          marginRight: index % 2 === 1 ? Default.fixPadding * 2 : Default.fixPadding,
          ...styles.serviceTouchableOpacity,
        }}
      >
        <Image
          source={
            typeof item.image === 'number' 
              ? item.image 
              : typeof item.image === 'string' && item.image.startsWith('http')
                ? { uri: item.image }
                : require("../assets/images/service.png") // Fallback service icon
          }
          style={{ width: 35, height: 35, resizeMode: "contain" }}
        />
        <Text
          numberOfLines={1}
          style={{
            ...Fonts.Medium15primary,
            overflow: "hidden",
            marginTop: Default.fixPadding,
          }}
        >
          {item.title}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderBookingItem = ({ item, index }) => {
    const lastIndex = serviceBookingsList.length - 1 === index;
    return (
      <TouchableOpacity
        style={{
          flex: 1,
          marginHorizontal: Default.fixPadding * 2,
          marginBottom: lastIndex ? Default.fixPadding : Default.fixPadding * 2,
          borderRadius: 10,
          backgroundColor: Colors.white,
          ...Default.shadow,
        }}
        activeOpacity={0.8}
        onPress={() => {
          // Navigate to service booking detail screen
          navigation.navigate('serviceBookingDetailScreen', {
            booking: item
          });
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
              {item.title}
            </Text>
          </View>
          <View
            style={{ flex: 4, alignItems: isRtl ? "flex-start" : "flex-end" }}
          >
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                width: 103,
                height: 30,
                borderTopRightRadius: isRtl ? 0 : 10,
                borderTopLeftRadius: isRtl ? 10 : 0,
                backgroundColor: item.confirmed
                  ? Colors.green
                  : item.pending
                  ? Colors.orange
                  : Colors.red,
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
                {item.confirmed
                  ? "Confirmed"
                  : item.pending
                  ? "Pending"
                  : "Cancelled"}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            paddingTop: Default.fixPadding,
            paddingBottom: Default.fixPadding * 1.5,
            paddingHorizontal: Default.fixPadding * 1.2,
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
              source={item.image}
              style={{ width: ms(83), height: ms(83), borderRadius: 10 }}
            />

            <View
              style={{
                flex: 1,
                marginHorizontal: Default.fixPadding,
                alignItems: isRtl ? "flex-end" : "flex-start",
              }}
            >
              <View
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="calendar-range-outline"
                  size={20}
                  color={Colors.black}
                />
                <Text
                  numberOfLines={1}
                  style={{
                    ...Fonts.Medium14black,
                    overflow: "hidden",
                    marginHorizontal: Default.fixPadding * 0.2,
                  }}
                >
                  {item.date}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  alignItems: "center",
                  marginVertical: Default.fixPadding * 1.1,
                }}
              >
                <MaterialCommunityIcons
                  name="clock-time-three-outline"
                  size={20}
                  color={Colors.black}
                />
                <Text
                  numberOfLines={1}
                  style={{
                    ...Fonts.Medium14black,
                    overflow: "hidden",
                    marginHorizontal: Default.fixPadding * 0.2,
                  }}
                >
                  {item.time}
                </Text>
              </View>

              <Text
                numberOfLines={1}
                style={{ ...Fonts.Medium14black, overflow: "hidden" }}
              >{`${item.status === "cancelled" ? "Cancelled By" : "Confirmed By"} : ${
                item.status === "pending"
                  ? "Pending"
                  : item.status === "cancelled"
                  ? "Admin"
                  : item.confirmedBy || "Admin"
              }`}</Text>
            </View>
          </View>
        </View>
        <DashedLine
          dashGap={2.5}
          dashLength={2.5}
          dashThickness={1.5}
          dashColor={Colors.grey}
        />

        <View
          style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            alignItems: "center",
            paddingHorizontal: Default.fixPadding * 1.2,
            paddingVertical: Default.fixPadding * 1.5,
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: isRtl ? "row-reverse" : "row",
              alignItems: "center",
            }}
          >
            <MaterialCommunityIcons
              name="check-circle"
              size={20}
              color={Colors.green}
            />
            <Text
              numberOfLines={1}
              style={{
                ...Fonts.Medium14black,
                overflow: "hidden",
                marginLeft: isRtl ? 0 : Default.fixPadding * 0.5,
                marginRight: isRtl ? Default.fixPadding * 0.5 : 0,
              }}
            >
              {item.confirmed ? "Paid Debit Card" : "No Payment"}
            </Text>
          </View>

          <Text
            numberOfLines={1}
            style={{
              ...Fonts.SemiBold18primary,
              flex: 1,
              overflow: "hidden",
              textAlign: isRtl ? "left" : "right",
            }}
          >
            {item.price}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <View style={{ flex: 1, backgroundColor: Colors.regularGrey }}>
      <MyStatusBar />
      <View
        style={{
          paddingHorizontal: Default.fixPadding * 2,
          paddingVertical: Default.fixPadding * 1.2,
          backgroundColor: Colors.white,
        }}
      >
        <Text
          style={{
            ...Fonts.SemiBold22black,
            textAlign: isRtl ? "right" : "left",
          }}
        >
          {tr("service")}
        </Text>
      </View>

      {/* Banner and Tab Navigation */}
      <View
        style={{
          paddingTop: Default.fixPadding * 0.8,
          paddingBottom: Default.fixPadding * 2,
          paddingHorizontal: Default.fixPadding * 2,
          backgroundColor: Colors.white,
        }}
      >
        <Text
          style={{
            ...Fonts.SemiBold16black,
            textAlign: isRtl ? "right" : "left",
          }}
        >
          {tr("yourBooking")}
        </Text>

        <View
          style={{
            overflow: "hidden",
            flexDirection: isRtl ? "row-reverse" : "row",
            marginTop: Default.fixPadding,
            marginBottom: Default.fixPadding * 2,
            borderRadius: 16,
            elevation: 8,
            shadowColor: Colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
          }}
        >
          <View style={{ flex: 0.2, backgroundColor: Colors.primary }} />
          <LinearGradient
            colors={['rgba(30, 71, 153, 0.95)', 'rgba(0, 141, 185, 0.9)', 'rgba(201, 44, 36, 0.85)']}
            start={[0, 0]}
            end={[1, 1]}
            style={{
              flex: 9.8,
              flexDirection: isRtl ? "row-reverse" : "row",
              justifyContent: "center",
              minHeight: 120,
            }}
          >
            <View
              style={{
                flex: 7,
                justifyContent: "center",
                alignItems: isRtl ? "flex-end" : "flex-start",
                paddingLeft: isRtl ? Default.fixPadding : Default.fixPadding * 1.5,
                paddingRight: isRtl ? Default.fixPadding * 1.5 : Default.fixPadding,
                paddingVertical: Default.fixPadding * 1.5,
              }}
            >
              <Text
                numberOfLines={1}
                style={{ 
                  ...Fonts.SemiBold16white, 
                  overflow: "hidden",
                  textAlign: isRtl ? "right" : "left",
                  textShadowColor: 'rgba(0, 0, 0, 0.3)',
                  textShadowOffset: {width: 0, height: 1},
                  textShadowRadius: 2,
                  fontSize: 18,
                  fontWeight: '600',
                }}
              >
                {tr("homePainting")}
              </Text>
              
              <View
                style={{
                  width: 50,
                  borderBottomWidth: 1.5,
                  borderBottomColor: 'rgba(255, 255, 255, 0.7)',
                  marginVertical: Default.fixPadding * 0.5,
                }}
              />
              
              <Text
                numberOfLines={2}
                style={{
                  ...Fonts.Medium14white,
                  overflow: "hidden",
                  textAlign: isRtl ? "right" : "left",
                  color: 'rgba(255, 255, 255, 0.95)',
                  textShadowColor: 'rgba(0, 0, 0, 0.2)',
                  textShadowOffset: {width: 0, height: 1},
                  textShadowRadius: 1,
                  lineHeight: 20,
                  fontSize: 13,
                }}
              >
                {tr("paintService")}
              </Text>

              <View
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  alignItems: "center",
                  marginTop: Default.fixPadding * 0.8,
                }}
              >
                <MaterialCommunityIcons
                  name="calendar-range-outline"
                  size={16}
                  color="rgba(255, 255, 255, 0.9)"
                />
                <Text
                  style={{
                    ...Fonts.Medium12white,
                    marginHorizontal: Default.fixPadding * 0.5,
                    color: 'rgba(255, 255, 255, 0.9)',
                    textShadowColor: 'rgba(0, 0, 0, 0.2)',
                    textShadowOffset: {width: 0, height: 1},
                    textShadowRadius: 1,
                  }}
                >
                  {`20 Aug 2022 | 03:30pm`}
                </Text>
              </View>
            </View>

            <View
              style={{
                flex: 2.8,
                justifyContent: "flex-end",
                alignItems: isRtl ? "flex-start" : "flex-end",
                paddingHorizontal: Default.fixPadding * 0.8,
                paddingBottom: Default.fixPadding * 0.1,
              }}
            >
              <Image
                source={require("../assets/images/service.png")}
                style={{
                  resizeMode: "contain",
                  width: ms(90),
                  height: ms(80),
                  opacity: 0.9,
                }}
              />
            </View>
          </LinearGradient>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'services' && styles.activeTabButton]}
            onPress={() => setActiveTab('services')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'services' && styles.activeTabButtonText]}>
              Services
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'bookings' && styles.activeTabButton]}
            onPress={() => setActiveTab('bookings')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'bookings' && styles.activeTabButtonText]}>
              My Bookings
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Small grey strip below tabs */}
      <View style={{
        height: 15,
        backgroundColor: Colors.regularGrey,
      }} />

      {/* Tab Content */}
      {activeTab === 'services' && (
        <FlatList
          numColumns={2}
          data={serviceList}
          renderItem={renderItem}
          keyExtractor={(item) => item.key}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ 
            paddingTop: Default.fixPadding * 1,
            paddingBottom: Default.fixPadding * 3
          }}
          style={{ backgroundColor: Colors.regularGrey }}
        />
      )}

      {activeTab === 'bookings' && (
        <FlatList
          data={serviceBookingsList}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item.key}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ 
            paddingTop: Default.fixPadding * 1,
            paddingBottom: Default.fixPadding * 3
          }}
          style={{ backgroundColor: Colors.regularGrey }}
        />
      )}

      <ServiceModal
        visible={openServiceModal}
        closeServiceModal={() => setOpenServiceModal(false)}
        image={serviceList[selectedService].image}
        title={serviceList[selectedService].title}
        onBookingCreated={handleBookingCreated}
        onViewBookings={handleViewBookings}
        onProceedToPayment={handleProceedToPayment}
      />
    </View>
  );
};

export default ServiceScreen;

const styles = StyleSheet.create({
  serviceTouchableOpacity: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Default.fixPadding * 1.7,
    paddingHorizontal: Default.fixPadding,
    marginBottom: Default.fixPadding * 2,
    borderRadius: 10,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: Colors.lightLinkWater,
    borderRadius: 10,
    padding: 4,
    marginTop: Default.fixPadding * 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: Default.fixPadding,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: Colors.white,
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabButtonText: {
    ...Fonts.Medium14black,
    fontWeight: "500",
  },
  activeTabButtonText: {
    ...Fonts.Medium14primary,
    fontWeight: "600",
  },
  bookingsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Default.fixPadding * 2,
    backgroundColor: Colors.regularGrey,
  },
  noBookingsText: {
    ...Fonts.SemiBold18black,
    textAlign: "center",
    marginBottom: Default.fixPadding,
  },
  noBookingsSubText: {
    ...Fonts.Medium14grey,
    textAlign: "center",
    lineHeight: 20,
  },
});
