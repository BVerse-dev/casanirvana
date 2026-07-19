import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import {
  useCreateServiceRequest,
  useListCommunityServices,
  useListMyServiceRequests,
} from "../hooks/useServiceRequests";

const formatCurrency = (value) => `GHS ${Number(value || 0).toFixed(2)}`;

const formatBookingDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatBookingTime = (timeValue) => {
  if (!timeValue) return "N/A";
  const parsed = new Date(`1970-01-01T${String(timeValue)}`);
  if (Number.isNaN(parsed.getTime())) return String(timeValue);
  return parsed.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
};

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

const getStatusMeta = (status = "pending") => {
  switch (status) {
    case "completed":
      return { label: "Completed", color: Colors.green };
    case "in_progress":
      return { label: "In Progress", color: Colors.orange };
    case "cancelled":
      return { label: "Cancelled", color: Colors.red };
    default:
      return { label: "Pending", color: Colors.orange };
  }
};

const ServiceScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();

  const isRtl = i18n.dir() === "rtl";

  function tr(key) {
    return t(`serviceScreen:${key}`);
  }

  const [openServiceModal, setOpenServiceModal] = useState(false);
  const [activeTab, setActiveTab] = useState("services");
  const [selectedService, setSelectedService] = useState(null);

  const { data: services = [], isLoading: servicesLoading } = useListCommunityServices();
  const { data: serviceRequests = [], isLoading: bookingsLoading } = useListMyServiceRequests();
  const createServiceRequestMutation = useCreateServiceRequest();

  const serviceList = useMemo(
    () =>
      services.map((service) => ({
        key: String(service.id),
        id: service.id,
        title: service.name,
        image: getServiceImageByName(service.name),
        basePrice: Number(service.base_price || 0),
      })),
    [services]
  );

  const serviceBookingsList = useMemo(
    () =>
      serviceRequests.map((request) => ({
        key: request.id,
        id: request.id,
        image: getServiceImageByName(request?.services?.name || request.title),
        title: request?.services?.name || request.title || "Service Request",
        date: formatBookingDate(request.preferred_date || request.created_at),
        time: formatBookingTime(request.preferred_time),
        confirmedBy: request.assigned_to || "Pending",
        price: formatCurrency(request.total_amount || request?.services?.base_price || 0),
        status: request.status || "pending",
        requestDate: request.preferred_date,
        requestTime: request.preferred_time,
        description: request.description || request.request_details,
        totalAmount: Number(request.total_amount || request?.services?.base_price || 0),
      })),
    [serviceRequests]
  );

  const handleBookingCreated = async (bookingInput) => {
    const selectedServiceFromCatalog = services.find(
      (service) => String(service.id) === String(bookingInput.serviceId)
    );
    const resolvedAmount = Number(
      bookingInput.amount ?? selectedServiceFromCatalog?.base_price ?? 0
    );

    const createdRequest = await createServiceRequestMutation.mutateAsync({
      serviceId: bookingInput.serviceId,
      title: bookingInput.serviceTitle,
      description: bookingInput.description,
      preferredDate: bookingInput.date,
      preferredTime: bookingInput.time,
      totalAmount: resolvedAmount,
    });

    setActiveTab("bookings");
    return {
      ...createdRequest,
      total_amount: Number(createdRequest?.total_amount ?? resolvedAmount),
    };
  };

  // Function to switch to bookings tab
  const handleViewBookings = () => {
    setActiveTab("bookings");
  };

  // Function to handle payment navigation
  const handleProceedToPayment = (serviceBookingDetails) => {
    const resolvedAmount = Number(
      serviceBookingDetails?.amount ?? serviceBookingDetails?.totalAmount ?? 0
    );

    navigation.navigate("paymentMethodScreen", {
      bookingId: serviceBookingDetails?.requestId || serviceBookingDetails?.id || null,
      sourceType: "service_request",
      sourceId: serviceBookingDetails?.requestId || serviceBookingDetails?.id || null,
      bookingType: "service",
      amount: resolvedAmount,
      amountFormatted: `GHS ${resolvedAmount.toFixed(2)}`,
      bookingData: {
        serviceName:
          serviceBookingDetails?.serviceName || serviceBookingDetails?.serviceTitle,
        serviceTitle: serviceBookingDetails?.serviceTitle || serviceBookingDetails?.serviceName,
        date: serviceBookingDetails?.date,
        time: serviceBookingDetails?.time,
        description: serviceBookingDetails?.description,
        image: serviceBookingDetails?.image,
        totalAmount: resolvedAmount,
        type: "service_booking",
      },
      paymentData: {
        amount: resolvedAmount,
        description: "Service Booking Payment",
        type: "service_booking",
        title: `${serviceBookingDetails?.serviceTitle || "Service"} Booking`,
      },
    });
  };

  const renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedService(item);
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
    const statusMeta = getStatusMeta(item.status);
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
          navigation.navigate("serviceBookingDetailScreen", {
            bookingId: item.id,
            booking: item,
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
                backgroundColor: statusMeta.color,
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
                {statusMeta.label}
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
              source={
                typeof item.image === "number"
                  ? item.image
                  : typeof item.image === "string" && item.image.startsWith("http")
                  ? { uri: item.image }
                  : require("../assets/images/service.png")
              }
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
              >
                {`${item.status === "cancelled" ? "Cancelled By" : "Assigned To"} : ${
                  item.status === "pending" ? "Pending" : item.confirmedBy || "Admin"
                }`}
              </Text>
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
              {item.totalAmount > 0 ? "Payment Pending" : "No Payment Required"}
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
                {serviceList[0]?.title || tr("homePainting")}
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
                {serviceList[0]
                  ? "Book trusted service providers in your community."
                  : "No active services available for your community yet."}
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
                  {serviceList[0]
                    ? `${formatCurrency(serviceList[0]?.basePrice || 0)} starting price`
                    : " "}
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
                source={serviceList[0]?.image || require("../assets/images/service.png")}
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
        servicesLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            numColumns={2}
            data={serviceList}
            renderItem={renderItem}
            keyExtractor={(item) => item.key}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: Default.fixPadding * 1,
              paddingBottom: Default.fixPadding * 3,
              flexGrow: 1,
            }}
            style={{ backgroundColor: Colors.regularGrey }}
            ListEmptyComponent={() => (
              <View style={styles.emptyStateWrap}>
                <Text style={styles.emptyStateTitle}>No Services Available</Text>
                <Text style={styles.emptyStateSubtitle}>
                  Services will appear here once your community admin enables them.
                </Text>
              </View>
            )}
          />
        )
      )}

      {activeTab === 'bookings' && (
        bookingsLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            data={serviceBookingsList}
            renderItem={renderBookingItem}
            keyExtractor={(item) => item.key}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: Default.fixPadding * 1,
              paddingBottom: Default.fixPadding * 3,
              flexGrow: 1,
            }}
            style={{ backgroundColor: Colors.regularGrey }}
            ListEmptyComponent={() => (
              <View style={styles.emptyStateWrap}>
                <Text style={styles.emptyStateTitle}>No Service Requests Yet</Text>
                <Text style={styles.emptyStateSubtitle}>
                  Your service requests will appear here after submission.
                </Text>
              </View>
            )}
          />
        )
      )}

      <ServiceModal
        visible={openServiceModal}
        closeServiceModal={() => setOpenServiceModal(false)}
        image={selectedService?.image}
        title={selectedService?.title}
        serviceId={selectedService?.id}
        basePrice={selectedService?.basePrice || 0}
        isSubmitting={createServiceRequestMutation.isPending}
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
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.regularGrey,
  },
  emptyStateWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Default.fixPadding * 3,
    paddingVertical: Default.fixPadding * 4,
  },
  emptyStateTitle: {
    ...Fonts.SemiBold18black,
    textAlign: "center",
    marginBottom: Default.fixPadding * 0.8,
  },
  emptyStateSubtitle: {
    ...Fonts.Medium14grey,
    textAlign: "center",
    lineHeight: 20,
  },
});
