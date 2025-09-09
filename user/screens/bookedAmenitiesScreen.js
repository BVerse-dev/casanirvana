import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  Image,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MyStatusBar from "../components/myStatusBar";
import { ms } from "react-native-size-matters/extend";
import DashedLine from "react-native-dashed-line";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AwesomeButton from "react-native-really-awesome-button";
import { useListAmenityBookings } from "../hooks/useListAmenityBookings";
import { useAuth } from "../contexts/AuthContext";

const { width: screenWidth } = Dimensions.get('window');

const BookedAmenitiesScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`bookedAmenitiesScreen:${key}`);
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

  // Fetch amenity bookings for the current user
  const { data: amenityBookings, isLoading, error } = useListAmenityBookings({
    userId: user?.id || '',
    enabled: !!user?.id,
  });

  // Transform the data to match the expected format
  const bookedAmenitiesList = amenityBookings?.map((booking, index) => ({
    key: booking.id || index.toString(),
    id: booking.id,
    image: booking.amenity?.image_urls?.[0] 
      ? { uri: booking.amenity.image_urls[0] }
      : require("../assets/images/booked1.png"), // fallback image
    title: booking.amenity?.name || 'Unknown Amenity',
    date: `${new Date(booking.start_datetime).toLocaleDateString()} - ${new Date(booking.end_datetime).toLocaleDateString()}`,
    time: `${booking.start_time} - ${booking.end_time}`,
    confirmedBy: booking.confirmed_by || 'Pending',
    price: booking.amount > 0 ? `GH₵ ${booking.amount.toFixed(2)}` : 'Free',
    confirmed: booking.status === 'confirmed',
    pending: booking.status === 'pending',
    cancelled: booking.status === 'cancelled',
    status: booking.status,
    payment_status: booking.payment_status,
    // Additional details for modal
    fullBookingData: booking,
    amenityDescription: booking.amenity?.description || '',
    amenityLocation: booking.amenity?.location || '',
    contactPerson: booking.amenity?.contact_person || '',
    contactPhone: booking.amenity?.contact_phone || '',
    bookingDate: booking.booking_date,
    startDateTime: booking.start_datetime,
    endDateTime: booking.end_datetime,
    totalDays: booking.total_days,
    totalAmount: booking.total_amount || booking.amount,
    createdAt: booking.created_at,
    updatedAt: booking.updated_at,
  })) || [];

  const handleBookingPress = (booking) => {
    navigation.navigate('amenityBookingDetailScreen', { booking });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return Colors.green;
      case 'pending':
        return Colors.orange;
      case 'cancelled':
        return Colors.red;
      case 'completed':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  };

  const getPaymentStatusColor = (paymentStatus) => {
    switch (paymentStatus) {
      case 'paid':
        return Colors.green;
      case 'pending':
        return Colors.orange;
      case 'failed':
        return Colors.red;
      case 'refunded':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
    };
  };

  const renderItem = ({ item, index }) => {
    const lastIndex = bookedAmenitiesList.length - 1 === index;
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
        onPress={() => handleBookingPress(item)}
        activeOpacity={0.8}
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
                  ? tr("confirmed")
                  : item.pending
                  ? tr("pending")
                  : tr("canceled")}
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
              >{`${item.status === "cancelled" ? "Cancelled By" : tr("confirmedBy")} : ${
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
              {item.confirmed ? tr("paidDebitCard") : tr("noPayment")}
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
          {tr("bookedAmenities")}
        </Text>
      </View>

      {isLoading ? (
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          marginTop: Default.fixPadding * 4
        }}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={{ 
            ...Fonts.Medium14Grey, 
            marginTop: Default.fixPadding,
            textAlign: 'center'
          }}>
            Loading your bookings...
          </Text>
        </View>
      ) : error ? (
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          marginTop: Default.fixPadding * 4,
          marginHorizontal: Default.fixPadding * 2
        }}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={48}
            color={Colors.grey}
          />
          <Text style={{ 
            ...Fonts.Medium14Grey, 
            marginTop: Default.fixPadding,
            textAlign: 'center'
          }}>
            Failed to load bookings. Please try again.
          </Text>
          <TouchableOpacity
            style={{
              marginTop: Default.fixPadding,
              paddingHorizontal: Default.fixPadding * 2,
              paddingVertical: Default.fixPadding,
              backgroundColor: Colors.primary,
              borderRadius: 8,
            }}
            onPress={() => {
              // This will trigger a refetch via react-query
              navigation.replace('BookedAmenitiesScreen');
            }}
          >
            <Text style={{ ...Fonts.Medium14white }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : bookedAmenitiesList.length === 0 ? (
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          marginTop: Default.fixPadding * 4,
          marginHorizontal: Default.fixPadding * 2
        }}>
          <MaterialCommunityIcons
            name="calendar-blank-outline"
            size={48}
            color={Colors.grey}
          />
          <Text style={{ 
            ...Fonts.Medium16Grey, 
            marginTop: Default.fixPadding,
            textAlign: 'center'
          }}>
            No bookings found
          </Text>
          <Text style={{ 
            ...Fonts.Medium14Grey, 
            marginTop: Default.fixPadding / 2,
            textAlign: 'center'
          }}>
            You haven't booked any amenities yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookedAmenitiesList}
          renderItem={renderItem}
          keyExtractor={(item) => item.key}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: Default.fixPadding * 0.8 }}
        />
      )}

      <View
        style={{
          marginTop: Default.fixPadding,
          marginBottom: Default.fixPadding * 2,
          marginHorizontal: Default.fixPadding * 2,
        }}
      >
        <AwesomeButton
          height={50}
          onPress={() => navigation.push("amenityScreen")}
          raiseLevel={1}
          stretch={true}
          borderRadius={10}
          backgroundShadow={Colors.primary}
          backgroundDarker={Colors.primary}
          backgroundColor={Colors.primary}
        >
          <Text style={{ ...Fonts.SemiBold18white }}>{tr("bookAmenity")}</Text>
        </AwesomeButton>
      </View>
    </View>
  );
};

export default BookedAmenitiesScreen;
