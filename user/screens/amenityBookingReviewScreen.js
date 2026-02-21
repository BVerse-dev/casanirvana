import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  BackHandler,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AwesomeButton from "react-native-really-awesome-button";
import MyStatusBar from "../components/myStatusBar";
import { Colors, Default, Fonts } from "../constants/styles";
import { useCreateAmenityBooking } from "../hooks/useCreateAmenityBooking";

const { width } = Dimensions.get("window");

const AmenityBookingReviewScreen = ({ navigation, route }) => {
  const { bookingDraft, bookingData, amenity } = route.params || {};
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const createAmenityBooking = useCreateAmenityBooking();

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);

  useEffect(() => {
    const onBackPress = () => {
      navigation.pop();
      return true;
    };
    const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => subscription.remove();
  }, [navigation]);

  const totalAmount = useMemo(() => {
    const amount = bookingData?.totalAmount ?? bookingDraft?.total_amount ?? bookingDraft?.amount ?? 0;
    return Number.isFinite(Number(amount)) ? Number(amount) : 0;
  }, [bookingData, bookingDraft]);

  const totalDays = bookingData?.totalDays ?? bookingDraft?.total_days ?? 1;
  const isPaidBooking = totalAmount > 0;
  const pricingLabel =
    amenity?.charges_per_hour > 0
      ? `GH₵ ${amenity.charges_per_hour} / hour`
      : amenity?.price > 0
      ? `GH₵ ${amenity.price} / day`
      : amenity?.monthly_charges > 0
      ? `GH₵ ${amenity.monthly_charges} / month`
      : "Free";

  const formatAmount = (value) => (value > 0 ? `GH₵ ${value.toFixed(2)}` : "Free");

  const handleSubmitBooking = async () => {
    if (!bookingDraft) {
      Alert.alert("Missing Data", "Booking details are missing. Please reselect the amenity.");
      return;
    }

    try {
      const insertedBooking = await createAmenityBooking.mutateAsync(bookingDraft);
      setCreatedBooking(insertedBooking);
      setShowSuccessModal(true);
    } catch (error) {
      Alert.alert("Booking Failed", error?.message || "Unable to submit booking right now.");
    }
  };

  const goToBookings = () => {
    setShowSuccessModal(false);
    navigation.navigate("bookedAmenitiesScreen");
  };

  const continueToPayment = () => {
    if (!createdBooking?.id) {
      Alert.alert("Booking Created", "Booking is saved. Please open your bookings and continue payment.");
      goToBookings();
      return;
    }

    setShowSuccessModal(false);
    navigation.push("paymentMethodScreen", {
      bookingId: createdBooking.id,
      bookingData: {
        ...bookingData,
        amenityName: amenity?.name || bookingData?.amenityName,
        totalAmount,
        totalDays,
        type: "amenity_booking",
      },
    });
  };

  if (!bookingDraft || !bookingData || !amenity) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.white }}>
        <MyStatusBar />
        <View style={styles.header(isRtl)}>
          <TouchableOpacity onPress={() => navigation.pop()}>
            <Ionicons
              name={isRtl ? "arrow-forward-outline" : "arrow-back-outline"}
              size={25}
              color={Colors.black}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review Booking</Text>
        </View>
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color={Colors.grey} />
          <Text style={styles.emptyTitle}>Booking details are unavailable</Text>
          <Text style={styles.emptySubtitle}>
            Please go back to the amenity screen and start booking again.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.extraLightGrey }}>
      <MyStatusBar />

      <View style={styles.header(isRtl)}>
        <TouchableOpacity onPress={() => navigation.pop()}>
          <Ionicons
            name={isRtl ? "arrow-forward-outline" : "arrow-back-outline"}
            size={25}
            color={Colors.black}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Booking</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.amenityRow(isRtl)}>
            <Image
              source={
                amenity?.image && (typeof amenity.image === "number" || amenity.image?.uri)
                  ? amenity.image
                  : require("../assets/images/booked1.png")
              }
              style={styles.amenityImage}
            />
            <View style={styles.amenityInfo}>
              <View style={styles.amenityHeaderRow(isRtl)}>
                <Text style={styles.amenityName}>{amenity?.name || bookingData?.amenityName || "Amenity"}</Text>
                <View style={styles.typeBadge(isPaidBooking)}>
                  <Text style={styles.typeBadgeText}>
                    {isPaidBooking ? "Paid" : "Free"}
                  </Text>
                </View>
              </View>
              <Text style={styles.amenityMeta}>
                {amenity?.location ? `Location: ${amenity.location}` : "Location: N/A"}
              </Text>
              <Text style={styles.amenityMeta}>
                {amenity?.capacity ? `Capacity: ${amenity.capacity}` : "Capacity: N/A"}
              </Text>
              <Text style={styles.amenityMeta}>Rate: {pricingLabel}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          <Row label="From Date" value={bookingData?.fromDate || "N/A"} isRtl={isRtl} />
          <Row label="To Date" value={bookingData?.toDate || "N/A"} isRtl={isRtl} />
          <Row label="From Time" value={bookingData?.fromTime || "N/A"} isRtl={isRtl} />
          <Row label="To Time" value={bookingData?.toTime || "N/A"} isRtl={isRtl} />
          <Row label="Total Days" value={`${totalDays}`} isRtl={isRtl} isLast />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <Row label="Total Amount" value={formatAmount(totalAmount)} isRtl={isRtl} />
          <Row
            label="Payment Status"
            value={isPaidBooking ? "Payment required" : "No payment required"}
            isRtl={isRtl}
            isLast
          />
        </View>
      </ScrollView>

      <View style={styles.ctaContainer}>
        <AwesomeButton
          height={50}
          onPress={handleSubmitBooking}
          disabled={createAmenityBooking.isPending}
          raiseLevel={1}
          stretch
          borderRadius={10}
          backgroundShadow={Colors.primary}
          backgroundDarker={Colors.primary}
          backgroundColor={createAmenityBooking.isPending ? Colors.grey : Colors.primary}
        >
          <Text style={Fonts.SemiBold18white}>
            {createAmenityBooking.isPending
              ? "Submitting..."
              : isPaidBooking
              ? "Confirm & Continue"
              : "Confirm Booking"}
          </Text>
        </AwesomeButton>
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={showSuccessModal}
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowSuccessModal(false)}
          style={{ flex: 1, backgroundColor: Colors.transparentBlack }}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalCenter}>
            <View style={styles.modalCard}>
              <View style={styles.modalIconWrap}>
                <View style={styles.modalIcon}>
                  <Ionicons name="checkmark" size={30} color={Colors.white} />
                </View>
              </View>

              <Text style={styles.modalTitle}>
                {isPaidBooking ? "Booking Created" : "Booking Submitted"}
              </Text>
              <Text style={styles.modalSubtitle}>
                {isPaidBooking
                  ? "Your booking is saved. Complete payment now to confirm it."
                  : "Your amenity booking was submitted successfully."}
              </Text>
              {createdBooking?.id ? (
                <View style={styles.referencePill}>
                  <Text style={styles.referenceText}>
                    Ref: {String(createdBooking.id).slice(0, 8).toUpperCase()}
                  </Text>
                </View>
              ) : null}

              <View style={styles.modalActions(isRtl)}>
                <TouchableOpacity
                  onPress={goToBookings}
                  style={[styles.modalButton, styles.secondaryButton]}
                >
                  <Text style={styles.secondaryButtonText}>
                    {isPaidBooking ? "Pay Later" : "View Bookings"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={
                    isPaidBooking
                      ? continueToPayment
                      : () => {
                          setShowSuccessModal(false);
                          navigation.navigate("bottomTab");
                        }
                  }
                  style={[styles.modalButton, styles.primaryButton]}
                >
                  <Text style={styles.primaryButtonText}>
                    {isPaidBooking ? "Continue to Payment" : "Back Home"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const Row = ({ label, value, isRtl, isLast = false }) => (
  <View
    style={[
      styles.row(isRtl),
      !isLast && {
        borderBottomWidth: 1,
        borderBottomColor: Colors.regularLightGrey,
      },
    ]}
  >
    <Text style={styles.rowLabel(isRtl)}>{label}</Text>
    <Text style={styles.rowValue(isRtl)}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  header: (isRtl) => ({
    flexDirection: isRtl ? "row-reverse" : "row",
    alignItems: "center",
    paddingVertical: Default.fixPadding * 1.2,
    paddingHorizontal: Default.fixPadding * 2,
    backgroundColor: Colors.white,
    ...Default.shadow,
  }),
  headerTitle: {
    ...Fonts.SemiBold18black,
    marginHorizontal: Default.fixPadding,
  },
  scrollContent: {
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 1.5,
    paddingBottom: Default.fixPadding * 2,
  },
  card: {
    borderRadius: 10,
    backgroundColor: Colors.white,
    marginBottom: Default.fixPadding * 1.5,
    ...Default.shadow,
  },
  amenityRow: (isRtl) => ({
    flexDirection: isRtl ? "row-reverse" : "row",
    padding: Default.fixPadding * 1.2,
  }),
  amenityImage: {
    width: 72,
    height: 72,
    borderRadius: 10,
  },
  amenityInfo: {
    flex: 1,
    justifyContent: "center",
    marginHorizontal: Default.fixPadding,
  },
  amenityHeaderRow: (isRtl) => ({
    flexDirection: isRtl ? "row-reverse" : "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Default.fixPadding * 0.2,
  }),
  amenityName: {
    ...Fonts.SemiBold16black,
    flex: 1,
    marginEnd: Default.fixPadding * 0.7,
  },
  typeBadge: (isPaidBooking) => ({
    backgroundColor: isPaidBooking ? `${Colors.green}22` : `${Colors.orange}28`,
    borderRadius: 999,
    paddingHorizontal: Default.fixPadding * 0.7,
    paddingVertical: Default.fixPadding * 0.2,
  }),
  typeBadgeText: {
    ...Fonts.SemiBold12grey,
    color: Colors.black,
  },
  amenityMeta: {
    ...Fonts.Medium14grey,
    marginTop: Default.fixPadding * 0.2,
  },
  sectionTitle: {
    ...Fonts.SemiBold16black,
    paddingHorizontal: Default.fixPadding * 1.2,
    paddingTop: Default.fixPadding * 1.2,
    paddingBottom: Default.fixPadding * 0.8,
  },
  row: (isRtl) => ({
    flexDirection: isRtl ? "row-reverse" : "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Default.fixPadding * 1.2,
    paddingVertical: Default.fixPadding * 0.9,
  }),
  rowLabel: (isRtl) => ({
    ...Fonts.Medium14grey,
    flex: 1,
    textAlign: isRtl ? "right" : "left",
  }),
  rowValue: (isRtl) => ({
    ...Fonts.SemiBold14black,
    flex: 1,
    textAlign: isRtl ? "left" : "right",
  }),
  ctaContainer: {
    marginHorizontal: Default.fixPadding * 2,
    marginBottom: Default.fixPadding * 2,
    marginTop: Default.fixPadding * 0.5,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: Default.fixPadding * 3,
  },
  emptyTitle: {
    ...Fonts.SemiBold16black,
    textAlign: "center",
    marginTop: Default.fixPadding,
  },
  emptySubtitle: {
    ...Fonts.Medium14grey,
    textAlign: "center",
    marginTop: Default.fixPadding * 0.4,
  },
  modalCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: width * 0.85,
    borderRadius: 12,
    backgroundColor: Colors.white,
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 2,
  },
  modalIconWrap: {
    alignItems: "center",
    marginBottom: Default.fixPadding,
  },
  modalIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.green,
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    ...Fonts.SemiBold18black,
    textAlign: "center",
    marginBottom: Default.fixPadding * 0.6,
  },
  modalSubtitle: {
    ...Fonts.Medium14grey,
    textAlign: "center",
    marginBottom: Default.fixPadding,
  },
  referencePill: {
    alignSelf: "center",
    backgroundColor: Colors.regularLightGrey,
    borderRadius: 999,
    paddingHorizontal: Default.fixPadding,
    paddingVertical: Default.fixPadding * 0.35,
    marginBottom: Default.fixPadding * 1.4,
  },
  referenceText: {
    ...Fonts.SemiBold12grey,
    color: Colors.darkGrey,
  },
  modalActions: (isRtl) => ({
    flexDirection: isRtl ? "row-reverse" : "row",
  }),
  modalButton: {
    flex: 1,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Default.fixPadding,
    marginHorizontal: Default.fixPadding * 0.4,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.lightGrey,
  },
  primaryButtonText: {
    ...Fonts.SemiBold16white,
    textAlign: "center",
  },
  secondaryButtonText: {
    ...Fonts.SemiBold16black,
    textAlign: "center",
  },
});

export default AmenityBookingReviewScreen;
