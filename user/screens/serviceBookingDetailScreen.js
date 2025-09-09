import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  Image,
  ActivityIndicator,
  Modal,
  ScrollView,
  Dimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MyStatusBar from "../components/myStatusBar";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const { width: screenWidth } = Dimensions.get('window');

const ServiceBookingDetailScreen = ({ navigation, route }) => {
  const { booking } = route.params || {};
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`serviceBookingDetailScreen:${key}`) || key;
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
      case 'in_progress':
        return Colors.purple;
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

  const formatDateTime = (dateString, timeString) => {
    if (!dateString) return { date: 'N/A', time: 'N/A' };
    
    // Handle different date formats
    let date;
    if (dateString.includes('-') && dateString.length > 10) {
      // ISO format
      date = new Date(dateString);
    } else if (dateString.includes(' ')) {
      // "DD MMM YYYY" format
      date = new Date(dateString);
    } else {
      // Other formats
      date = new Date(dateString);
    }

    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return {
      date: formattedDate,
      time: timeString || 'N/A',
    };
  };

  if (!booking) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.extraLightGrey }}>
        <MyStatusBar />
        <View
          style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            alignItems: "center",
            paddingVertical: Default.fixPadding * 1.2,
            paddingHorizontal: Default.fixPadding * 2,
            backgroundColor: Colors.white,
            ...Default.shadow,
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
            numberOfLines={1}
            style={{
              ...Fonts.SemiBold18black,
              overflow: "hidden",
              marginHorizontal: Default.fixPadding,
            }}
          >
            Service Booking Details
          </Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ ...Fonts.Medium16grey }}>No booking data available</Text>
        </View>
      </View>
    );
  }

  const formatted = formatDateTime(booking.booking_date || booking.date, booking.start_time || booking.time);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.extraLightGrey }}>
      <MyStatusBar />
      
      {/* Header */}
      <View
        style={{
          flexDirection: isRtl ? "row-reverse" : "row",
          alignItems: "center",
          paddingVertical: Default.fixPadding * 1.2,
          paddingHorizontal: Default.fixPadding * 2,
          backgroundColor: Colors.white,
          ...Default.shadow,
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
          numberOfLines={1}
          style={{
            ...Fonts.SemiBold18black,
            overflow: "hidden",
            marginHorizontal: Default.fixPadding,
          }}
        >
          Service Booking Details
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: Default.fixPadding * 2,
        }}
      >
        {/* Service Image and Basic Info */}
        <View style={{
          alignItems: 'center',
          marginBottom: Default.fixPadding * 2,
        }}>
          <Image
            source={
              typeof booking.image === 'number' 
                ? booking.image 
                : typeof booking.image === 'string' && booking.image.startsWith('http')
                  ? { uri: booking.image }
                  : typeof booking.image === 'object' && booking.image.uri
                    ? booking.image
                    : require("../assets/images/service.png") // Fallback service image
            }
            style={{
              width: screenWidth,
              height: 200,
              marginBottom: Default.fixPadding * 1.5,
            }}
          />
          <View style={{
            paddingHorizontal: Default.fixPadding * 2,
            alignItems: 'center',
          }}>
            <Text style={{
              ...Fonts.SemiBold22black,
              textAlign: 'center',
              marginBottom: Default.fixPadding * 0.5,
            }}>
              {booking.title || booking.serviceName || booking.serviceTitle}
            </Text>
            {booking.description && (
              <Text style={{
                ...Fonts.Medium14grey,
                textAlign: 'center',
                marginBottom: Default.fixPadding,
              }}>
                {booking.description}
              </Text>
            )}
          </View>
        </View>

        {/* Status Badges */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: Default.fixPadding * 2,
          marginHorizontal: Default.fixPadding * 2,
        }}>
          <View style={{
            backgroundColor: getStatusColor(booking.status),
            paddingHorizontal: Default.fixPadding * 1.5,
            paddingVertical: Default.fixPadding * 0.8,
            borderRadius: 20,
            flex: 1,
            marginRight: Default.fixPadding,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Text style={{
              ...Fonts.SemiBold14white,
              textAlign: 'center',
              textTransform: 'capitalize',
            }}>
              {booking.status || 'pending'}
            </Text>
          </View>
          <View style={{
            backgroundColor: getPaymentStatusColor(booking.payment_status || 'pending'),
            paddingHorizontal: Default.fixPadding * 1.5,
            paddingVertical: Default.fixPadding * 0.8,
            borderRadius: 20,
            flex: 1,
            marginLeft: Default.fixPadding,
          }}>
            <Text style={{
              ...Fonts.SemiBold14white,
              textAlign: 'center',
              textTransform: 'capitalize',
            }}>
              Payment: {booking.payment_status || 'pending'}
            </Text>
          </View>
        </View>

        {/* Booking Information */}
        <View style={{
          backgroundColor: Colors.regularLightGrey,
          borderRadius: 15,
          padding: Default.fixPadding * 1.5,
          marginBottom: Default.fixPadding * 2,
          marginHorizontal: Default.fixPadding * 2,
        }}>
          <Text style={{
            ...Fonts.SemiBold18black,
            marginBottom: Default.fixPadding * 1.5,
          }}>
            Service Information
          </Text>

          {/* Service Date */}
          <View style={{
            flexDirection: 'row',
            marginBottom: Default.fixPadding,
          }}>
            <MaterialCommunityIcons
              name="calendar"
              size={20}
              color={Colors.primary}
              style={{ marginRight: Default.fixPadding * 0.8 }}
            />
            <Text style={{ ...Fonts.Medium14black, flex: 1 }}>
              Scheduled Date: {formatted.date}
            </Text>
          </View>

          {/* Service Time */}
          <View style={{
            flexDirection: 'row',
            marginBottom: Default.fixPadding,
          }}>
            <MaterialCommunityIcons
              name="clock-time-four"
              size={20}
              color={Colors.primary}
              style={{ marginRight: Default.fixPadding * 0.8 }}
            />
            <Text style={{ ...Fonts.Medium14black, flex: 1 }}>
              Scheduled Time: {formatted.time}
            </Text>
          </View>

          {/* Confirmed By */}
          <View style={{
            flexDirection: 'row',
            marginBottom: Default.fixPadding,
          }}>
            <MaterialCommunityIcons
              name="account-tie"
              size={20}
              color={Colors.primary}
              style={{ marginRight: Default.fixPadding * 0.8 }}
            />
            <Text style={{ ...Fonts.Medium14black, flex: 1 }}>
              {booking.status === 'cancelled' ? 'Cancelled By' : 'Confirmed By'}: {
                booking.status === 'pending' ? 'Pending' :
                booking.status === 'cancelled' ? 'Admin' :
                booking.status === 'confirmed' ? (booking.confirmedBy || 'Admin') :
                booking.status === 'completed' ? (booking.confirmedBy || 'Admin') :
                booking.status === 'in_progress' ? (booking.confirmedBy || 'Admin') :
                'Pending'
              }
            </Text>
          </View>

          {/* Booking ID */}
          <View style={{
            flexDirection: 'row',
            marginBottom: Default.fixPadding,
          }}>
            <MaterialCommunityIcons
              name="identifier"
              size={20}
              color={Colors.primary}
              style={{ marginRight: Default.fixPadding * 0.8 }}
            />
            <Text style={{ ...Fonts.Medium14black, flex: 1 }}>
              Booking ID: {booking.id ? booking.id.substring(0, 8) + '...' : booking.key}
            </Text>
          </View>

          {/* Service Type */}
          <View style={{
            flexDirection: 'row',
            marginBottom: Default.fixPadding,
          }}>
            <MaterialCommunityIcons
              name="tools"
              size={20}
              color={Colors.primary}
              style={{ marginRight: Default.fixPadding * 0.8 }}
            />
            <Text style={{ ...Fonts.Medium14black, flex: 1 }}>
              Service Type: Home Service
            </Text>
          </View>
        </View>

        {/* Payment Information */}
        <View style={{
          backgroundColor: Colors.regularLightGrey,
          borderRadius: 15,
          padding: Default.fixPadding * 1.5,
          marginBottom: Default.fixPadding * 2,
          marginHorizontal: Default.fixPadding * 2,
        }}>
          <Text style={{
            ...Fonts.SemiBold18black,
            marginBottom: Default.fixPadding * 1.5,
          }}>
            Payment Information
          </Text>

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: Default.fixPadding,
          }}>
            <Text style={{ ...Fonts.Medium14black }}>
              Service Fee:
            </Text>
            <Text style={{ ...Fonts.SemiBold16primary }}>
              {booking.price || booking.totalAmount || 'GH₵ 0.00'}
            </Text>
          </View>

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: Default.fixPadding,
          }}>
            <Text style={{ ...Fonts.Medium14black }}>
              Payment Status:
            </Text>
            <Text style={{ 
              ...Fonts.SemiBold14black,
              color: getPaymentStatusColor(booking.payment_status || 'pending'),
              textTransform: 'capitalize',
            }}>
              {booking.payment_status || 'pending'}
            </Text>
          </View>

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: Default.fixPadding,
          }}>
            <Text style={{ ...Fonts.Medium14black }}>
              Payment Method:
            </Text>
            <Text style={{ ...Fonts.Medium14grey }}>
              {booking.payment_status === 'paid' ? 'Credit Card' : 'Pending Payment'}
            </Text>
          </View>
        </View>

        {/* Service Request Details */}
        {booking.description && (
          <View style={{
            backgroundColor: Colors.regularLightGrey,
            borderRadius: 15,
            padding: Default.fixPadding * 1.5,
            marginBottom: Default.fixPadding * 2,
            marginHorizontal: Default.fixPadding * 2,
          }}>
            <Text style={{
              ...Fonts.SemiBold18black,
              marginBottom: Default.fixPadding * 1.5,
            }}>
              Service Request Details
            </Text>

            <View style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
            }}>
              <MaterialCommunityIcons
                name="text-box-outline"
                size={20}
                color={Colors.primary}
                style={{ marginRight: Default.fixPadding * 0.8 }}
              />
              <Text style={{ ...Fonts.Medium14black, flex: 1, lineHeight: 20 }}>
                {booking.description}
              </Text>
            </View>
          </View>
        )}

        {/* Booking Timeline */}
        <View style={{
          backgroundColor: Colors.regularLightGrey,
          borderRadius: 15,
          padding: Default.fixPadding * 1.5,
          marginBottom: Default.fixPadding * 2,
          marginHorizontal: Default.fixPadding * 2,
        }}>
          <Text style={{
            ...Fonts.SemiBold18black,
            marginBottom: Default.fixPadding * 1.5,
          }}>
            Booking Timeline
          </Text>

          <View style={{
            flexDirection: 'row',
            marginBottom: Default.fixPadding,
          }}>
            <MaterialCommunityIcons
              name="calendar-plus"
              size={20}
              color={Colors.primary}
              style={{ marginRight: Default.fixPadding * 0.8 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ ...Fonts.Medium14black, marginBottom: 2 }}>
                Booking Created
              </Text>
              <Text style={{ ...Fonts.Medium12grey }}>
                {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : 'Recently'}
              </Text>
            </View>
          </View>

          {booking.updatedAt && booking.updatedAt !== booking.createdAt && (
            <View style={{
              flexDirection: 'row',
              marginBottom: Default.fixPadding,
            }}>
              <MaterialCommunityIcons
                name="calendar-edit"
                size={20}
                color={Colors.primary}
                style={{ marginRight: Default.fixPadding * 0.8 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ ...Fonts.Medium14black, marginBottom: 2 }}>
                  Last Updated
                </Text>
                <Text style={{ ...Fonts.Medium12grey }}>
                  {new Date(booking.updatedAt).toLocaleString()}
                </Text>
              </View>
            </View>
          )}

          {booking.status === 'confirmed' && (
            <View style={{
              flexDirection: 'row',
              marginBottom: Default.fixPadding,
            }}>
              <MaterialCommunityIcons
                name="check-circle"
                size={20}
                color={Colors.green}
                style={{ marginRight: Default.fixPadding * 0.8 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ ...Fonts.Medium14black, marginBottom: 2 }}>
                  Service Confirmed
                </Text>
                <Text style={{ ...Fonts.Medium12grey }}>
                  Your service has been confirmed and assigned
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={{
          marginTop: Default.fixPadding,
          paddingHorizontal: Default.fixPadding * 2,
        }}>
          {/* For paid and confirmed bookings, only show back button */}
          {(booking.payment_status === 'paid' && booking.status === 'confirmed') ? (
            <TouchableOpacity
              style={{
                backgroundColor: Colors.primary,
                paddingVertical: Default.fixPadding * 1.2,
                borderRadius: 10,
                width: '100%',
              }}
              onPress={() => navigation.pop()}
            >
              <Text style={{
                ...Fonts.SemiBold16white,
                textAlign: 'center',
              }}>
                Back
              </Text>
            </TouchableOpacity>
          ) : (
            // For other bookings, show both buttons
            <>
              <TouchableOpacity
                style={{
                  backgroundColor: Colors.primary,
                  paddingHorizontal: Default.fixPadding * 2,
                  paddingVertical: Default.fixPadding * 1.2,
                  borderRadius: 10,
                  flex: 1,
                  marginRight: Default.fixPadding * 0.5,
                }}
                onPress={() => navigation.pop()}
              >
                <Text style={{
                  ...Fonts.SemiBold16white,
                  textAlign: 'center',
                }}>
                  Back
                </Text>
              </TouchableOpacity>
              
              {booking.status === 'confirmed' && (
                <TouchableOpacity
                  style={{
                    backgroundColor: Colors.primary,
                    paddingHorizontal: Default.fixPadding * 2,
                    paddingVertical: Default.fixPadding * 1.2,
                    borderRadius: 10,
                    flex: 1,
                    marginLeft: Default.fixPadding * 0.5,
                  }}
                  onPress={() => {
                    // Handle contact service provider
                    console.log('Contact service provider');
                  }}
                >
                  <Text style={{
                    ...Fonts.SemiBold16white,
                    textAlign: 'center',
                  }}>
                    Contact Provider
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ServiceBookingDetailScreen;
