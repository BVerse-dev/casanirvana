import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  Image,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from "react-native";
import React, { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MyStatusBar from "../components/myStatusBar";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useGetServiceRequest } from "../hooks/useServiceRequests";

const { width: screenWidth } = Dimensions.get('window');

const ServiceBookingDetailScreen = ({ navigation, route }) => {
  const { bookingId, booking } = route.params || {};
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const { data: dbRequest, isLoading } = useGetServiceRequest(bookingId);

  const backAction = useCallback(() => {
    navigation.pop();
    return true;
  }, [navigation]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => subscription.remove();
  }, [backAction]);

  const getServiceImageByName = (name = "") => {
    const normalized = String(name).toLowerCase();
    if (normalized.includes("clean")) return require("../assets/images/service1.png");
    if (normalized.includes("appliance")) return require("../assets/images/service2.png");
    if (normalized.includes("carpenter")) return require("../assets/images/service3.png");
    if (normalized.includes("paint")) return require("../assets/images/service.png");
    if (normalized.includes("plumb")) return require("../assets/images/s7.png");
    if (normalized.includes("packer") || normalized.includes("mover")) {
      return require("../assets/images/service4.png");
    }
    if (normalized.includes("sanitize")) return require("../assets/images/service5.png");
    if (normalized.includes("hair") || normalized.includes("beauty")) {
      return require("../assets/images/service6.png");
    }
    if (normalized.includes("laundry")) return require("../assets/images/service8.png");
    if (normalized.includes("garden")) return require("../assets/images/service9.png");
    if (normalized.includes("cooking")) return require("../assets/images/service10.png");
    if (normalized.includes("electrical")) return require("../assets/images/s1.png");
    if (normalized.includes("hvac")) return require("../assets/images/s2.png");
    if (normalized.includes("pest")) return require("../assets/images/s3.png");
    if (normalized.includes("security")) return require("../assets/images/s4.png");
    if (normalized.includes("water")) return require("../assets/images/s1.png");
    return require("../assets/images/service.png");
  };

  const normalizedDbBooking = dbRequest
    ? {
        id: dbRequest.id,
        title: dbRequest?.services?.name || dbRequest.title || "Service Request",
        serviceName: dbRequest?.services?.name || dbRequest.title || "Service Request",
        image: getServiceImageByName(dbRequest?.services?.name || dbRequest.title),
        date: dbRequest.preferred_date || dbRequest.created_at,
        time: dbRequest.preferred_time || null,
        booking_date: dbRequest.preferred_date,
        start_time: dbRequest.preferred_time,
        confirmedBy: dbRequest.assigned_to || "Pending",
        status: dbRequest.status || "pending",
        payment_status:
          dbRequest.payment_status || (Number(dbRequest.total_amount || 0) > 0 ? "pending" : "not_required"),
        price: `GHS ${Number(dbRequest.total_amount || dbRequest?.services?.base_price || 0).toFixed(2)}`,
        totalAmount: Number(dbRequest.total_amount || dbRequest?.services?.base_price || 0),
        description: dbRequest.description || dbRequest.request_details || "",
        createdAt: dbRequest.created_at,
        updatedAt: dbRequest.updated_at,
      }
    : null;

  const effectiveBooking = normalizedDbBooking || booking;

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return Colors.orange;
      case 'in_progress':
        return Colors.blue;
      case 'completed':
        return Colors.green;
      case 'cancelled':
        return Colors.red;
      default:
        return Colors.grey;
    }
  };

  const getPaymentStatusColor = (paymentStatus) => {
    switch (paymentStatus) {
      case 'pending':
        return Colors.orange;
      case 'not_required':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  };

  const formatDateTime = (dateString, timeString) => {
    if (!dateString) return { date: 'N/A', time: 'N/A' };

    const normalizedDate = String(dateString);
    
    // Handle different date formats
    let date;
    if (normalizedDate.includes('-') && normalizedDate.length > 10) {
      // ISO format
      date = new Date(normalizedDate);
    } else if (normalizedDate.includes(' ')) {
      // "DD MMM YYYY" format
      date = new Date(normalizedDate);
    } else {
      // Other formats
      date = new Date(normalizedDate);
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

  if (isLoading && bookingId) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.extraLightGrey, justifyContent: "center", alignItems: "center" }}>
        <MyStatusBar />
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  }

  if (!effectiveBooking) {
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

  const formatted = formatDateTime(
    effectiveBooking.booking_date || effectiveBooking.date,
    effectiveBooking.start_time || effectiveBooking.time
  );

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
              typeof effectiveBooking.image === 'number' 
                ? effectiveBooking.image 
                : typeof effectiveBooking.image === 'string' && effectiveBooking.image.startsWith('http')
                  ? { uri: effectiveBooking.image }
                  : typeof effectiveBooking.image === 'object' && effectiveBooking.image.uri
                    ? effectiveBooking.image
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
              {effectiveBooking.title || effectiveBooking.serviceName || effectiveBooking.serviceTitle}
            </Text>
            {effectiveBooking.description && (
              <Text style={{
                ...Fonts.Medium14grey,
                textAlign: 'center',
                marginBottom: Default.fixPadding,
              }}>
                {effectiveBooking.description}
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
            backgroundColor: getStatusColor(effectiveBooking.status),
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
              {(effectiveBooking.status || 'pending').replace(/_/g, ' ')}
            </Text>
          </View>
          <View style={{
            backgroundColor: getPaymentStatusColor(effectiveBooking.payment_status || 'pending'),
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
              Payment: {(effectiveBooking.payment_status || 'pending').replace(/_/g, ' ')}
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
              {effectiveBooking.status === 'cancelled' ? 'Cancelled By' : 'Assigned To'}: {
                effectiveBooking.status === 'pending'
                  ? 'Pending'
                  : (effectiveBooking.confirmedBy || 'Admin')
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
              Booking ID: {effectiveBooking.id ? effectiveBooking.id.substring(0, 8) + '...' : effectiveBooking.key}
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
              {effectiveBooking.price || effectiveBooking.totalAmount || 'GH₵ 0.00'}
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
              color: getPaymentStatusColor(effectiveBooking.payment_status || 'pending'),
              textTransform: 'capitalize',
            }}>
              {effectiveBooking.payment_status || 'pending'}
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
              {effectiveBooking.payment_status === 'not_required' ? 'Not Required' : 'Pending Payment'}
            </Text>
          </View>
        </View>

        {/* Service Request Details */}
        {effectiveBooking.description && (
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
                {effectiveBooking.description}
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
                {effectiveBooking.createdAt ? new Date(effectiveBooking.createdAt).toLocaleString() : 'Recently'}
              </Text>
            </View>
          </View>

          {effectiveBooking.updatedAt && effectiveBooking.updatedAt !== effectiveBooking.createdAt && (
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
                  {new Date(effectiveBooking.updatedAt).toLocaleString()}
                </Text>
              </View>
            </View>
          )}

          {effectiveBooking.status === 'in_progress' && (
            <View style={{
              flexDirection: 'row',
              marginBottom: Default.fixPadding,
            }}>
              <MaterialCommunityIcons
                name="check-circle"
                size={20}
                color={Colors.blue}
                style={{ marginRight: Default.fixPadding * 0.8 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ ...Fonts.Medium14black, marginBottom: 2 }}>
                  Service In Progress
                </Text>
                <Text style={{ ...Fonts.Medium12grey }}>
                  Your request is being handled by the service team.
                </Text>
              </View>
            </View>
          )}
          {effectiveBooking.status === 'completed' && (
            <View style={{
              flexDirection: 'row',
              marginBottom: Default.fixPadding,
            }}>
              <MaterialCommunityIcons
                name="check-decagram"
                size={20}
                color={Colors.green}
                style={{ marginRight: Default.fixPadding * 0.8 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ ...Fonts.Medium14black, marginBottom: 2 }}>
                  Service Completed
                </Text>
                <Text style={{ ...Fonts.Medium12grey }}>
                  This service request has been marked as completed.
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View
          style={{
            marginTop: Default.fixPadding,
            paddingHorizontal: Default.fixPadding * 2,
            flexDirection: 'row',
          }}
        >
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
            <Text
              style={{
                ...Fonts.SemiBold16white,
                textAlign: 'center',
              }}
            >
              Back
            </Text>
          </TouchableOpacity>

          {effectiveBooking.payment_status === 'pending' && effectiveBooking.totalAmount > 0 && (
            <TouchableOpacity
              style={{
                backgroundColor: Colors.green,
                paddingHorizontal: Default.fixPadding * 2,
                paddingVertical: Default.fixPadding * 1.2,
                borderRadius: 10,
                flex: 1,
                marginLeft: Default.fixPadding * 0.5,
              }}
              onPress={() => {
                navigation.navigate("paymentMethodScreen", {
                  bookingId: effectiveBooking.id,
                  sourceType: "service_request",
                  sourceId: effectiveBooking.id,
                  bookingType: "service",
                  bookingData: {
                    serviceName:
                      effectiveBooking.serviceName || effectiveBooking.title || "Service Request",
                    serviceTitle:
                      effectiveBooking.title || effectiveBooking.serviceName || "Service Request",
                    date: effectiveBooking.booking_date || effectiveBooking.date,
                    time: effectiveBooking.start_time || effectiveBooking.time,
                    description: effectiveBooking.description,
                    image: effectiveBooking.image,
                    totalAmount: Number(effectiveBooking.totalAmount || 0),
                    type: "service_booking",
                  },
                  paymentData: {
                    amount: Number(effectiveBooking.totalAmount || 0),
                    description: "Service Booking Payment",
                    type: "service_booking",
                    title: `${effectiveBooking.serviceName || effectiveBooking.title || "Service"} Booking`,
                  },
                });
              }}
            >
              <Text
                style={{
                  ...Fonts.SemiBold16white,
                  textAlign: 'center',
                }}
              >
                Proceed to Payment
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ServiceBookingDetailScreen;
