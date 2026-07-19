import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  StatusBar,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");

const OrderDetailScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { order } = route.params || {};

  if (!order) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Order not found</Text>
      </View>
    );
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "#4CAF50";
      case "on the way":
        return "#FF9800";
      case "processing":
        return "#2196F3";
      case "cancelled":
        return "#F44336";
      default:
        return Colors.grey;
    }
  };

  const handleTrackOrder = () => {
    // Navigate to tracking screen or show tracking info
    console.log("Track order:", order.trackingNumber);
  };

  const handleContactSupport = () => {
    // Navigate to support or open support chat
    console.log("Contact support for order:", order.id);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={Colors.black} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Order Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusInfo}>
              <Text style={styles.orderNumber}>Order #{order.id}</Text>
              <View style={styles.statusBadge}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(order.status) },
                  ]}
                />
                <Text style={styles.statusText}>{order.status}</Text>
              </View>
            </View>
            {order.trackingNumber && (
              <TouchableOpacity
                style={styles.trackButton}
                onPress={handleTrackOrder}
              >
                <Ionicons name="location" size={16} color={Colors.white} />
                <Text style={styles.trackButtonText}>Track</Text>
              </TouchableOpacity>
            )}
          </View>

          {order.estimatedDelivery && (
            <View style={styles.deliveryInfo}>
              <Ionicons name="time-outline" size={20} color={Colors.grey} />
              <Text style={styles.deliveryText}>
                Estimated delivery: {order.estimatedDelivery}
              </Text>
            </View>
          )}

          {order.deliveredDate && (
            <View style={styles.deliveryInfo}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.deliveryText}>
                Delivered on: {order.deliveredDate}
              </Text>
            </View>
          )}
        </View>

        {/* Items Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.items && order.items.map((item, index) => (
            <View key={index} style={styles.itemCard}>
              {item.image && (
                <Image source={item.image} style={styles.itemImage} />
              )}
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
                {item.price && (
                  <Text style={styles.itemPrice}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Delivery Information */}
        {order.deliveryAddress && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <View style={styles.addressCard}>
              <Ionicons name="location" size={20} color={Colors.primary} />
              <View style={styles.addressInfo}>
                <Text style={styles.addressText}>
                  {order.deliveryAddress.street}
                </Text>
                <Text style={styles.addressText}>
                  {order.deliveryAddress.city}, {order.deliveryAddress.state}
                </Text>
                <Text style={styles.addressText}>
                  {order.deliveryAddress.zipCode}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Carrier Information */}
        {order.carrier && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shipping Information</Text>
            <View style={styles.carrierCard}>
              <View style={styles.carrierInfo}>
                <Text style={styles.carrierLabel}>Carrier:</Text>
                <Text style={styles.carrierText}>{order.carrier}</Text>
              </View>
              {order.trackingNumber && (
                <View style={styles.carrierInfo}>
                  <Text style={styles.carrierLabel}>Tracking Number:</Text>
                  <Text style={styles.trackingNumber}>{order.trackingNumber}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Payment Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                ${order.totalAmount ? order.totalAmount.toFixed(2) : "0.00"}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>
                ${order.deliveryFee ? order.deliveryFee.toFixed(2) : "0.00"}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                ${order.totalAmount ? order.totalAmount.toFixed(2) : "0.00"}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {order.status === "Delivered" && (
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Reorder</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleContactSupport}
          >
            <Text style={styles.secondaryButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Default.fixPadding * 1.2,
    paddingTop: Default.fixPadding * 3,
    paddingBottom: Default.fixPadding,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    padding: Default.fixPadding * 0.5,
  },
  headerTitle: {
    ...Fonts.Bold18black,
    color: Colors.black,
    flex: 1,
    textAlign: "center",
  },
  menuButton: {
    padding: Default.fixPadding * 0.5,
  },
  statusCard: {
    backgroundColor: Colors.white,
    margin: Default.fixPadding * 1.2,
    padding: Default.fixPadding * 1.5,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Default.fixPadding,
  },
  statusInfo: {
    flex: 1,
  },
  orderNumber: {
    ...Fonts.SemiBold16black,
    color: Colors.black,
    marginBottom: Default.fixPadding * 0.5,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Default.fixPadding * 0.5,
  },
  statusText: {
    ...Fonts.SemiBold14black,
    color: Colors.black,
  },
  trackButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: Default.fixPadding,
    paddingVertical: Default.fixPadding * 0.5,
    borderRadius: 20,
  },
  trackButtonText: {
    ...Fonts.SemiBold12white,
    color: Colors.white,
    marginLeft: Default.fixPadding * 0.3,
  },
  deliveryInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Default.fixPadding * 0.5,
  },
  deliveryText: {
    ...Fonts.Regular14black,
    color: Colors.black,
    marginLeft: Default.fixPadding * 0.5,
  },
  section: {
    marginHorizontal: Default.fixPadding * 1.2,
    marginBottom: Default.fixPadding * 1.5,
  },
  sectionTitle: {
    ...Fonts.Bold16black,
    color: Colors.black,
    marginBottom: Default.fixPadding,
  },
  itemCard: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    padding: Default.fixPadding,
    borderRadius: 12,
    marginBottom: Default.fixPadding * 0.5,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: Default.fixPadding,
  },
  itemInfo: {
    flex: 1,
    justifyContent: "center",
  },
  itemName: {
    ...Fonts.SemiBold14black,
    color: Colors.black,
    marginBottom: Default.fixPadding * 0.3,
  },
  itemQuantity: {
    ...Fonts.Regular12grey,
    color: Colors.grey,
  },
  itemPrice: {
    ...Fonts.SemiBold14black,
    color: Colors.black,
    marginTop: Default.fixPadding * 0.3,
  },
  addressCard: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    padding: Default.fixPadding,
    borderRadius: 12,
  },
  addressInfo: {
    flex: 1,
    marginLeft: Default.fixPadding,
  },
  addressText: {
    ...Fonts.Regular14black,
    color: Colors.black,
    marginBottom: Default.fixPadding * 0.2,
  },
  carrierCard: {
    backgroundColor: Colors.white,
    padding: Default.fixPadding,
    borderRadius: 12,
  },
  carrierInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Default.fixPadding * 0.5,
  },
  carrierLabel: {
    ...Fonts.Regular14grey,
    color: Colors.grey,
  },
  carrierText: {
    ...Fonts.SemiBold14black,
    color: Colors.black,
  },
  trackingNumber: {
    ...Fonts.SemiBold14primary,
    color: Colors.primary,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    padding: Default.fixPadding,
    borderRadius: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Default.fixPadding * 0.5,
  },
  summaryLabel: {
    ...Fonts.Regular14grey,
    color: Colors.grey,
  },
  summaryValue: {
    ...Fonts.SemiBold14black,
    color: Colors.black,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: Default.fixPadding * 0.5,
    marginTop: Default.fixPadding * 0.5,
  },
  totalLabel: {
    ...Fonts.Bold16black,
    color: Colors.black,
  },
  totalValue: {
    ...Fonts.Bold16black,
    color: Colors.black,
  },
  actionButtons: {
    marginHorizontal: Default.fixPadding * 1.2,
    marginTop: Default.fixPadding,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Default.fixPadding * 1.2,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: Default.fixPadding,
  },
  primaryButtonText: {
    ...Fonts.SemiBold16white,
    color: Colors.white,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: Default.fixPadding * 1.2,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: Default.fixPadding,
  },
  secondaryButtonText: {
    ...Fonts.SemiBold16primary,
    color: Colors.primary,
  },
  errorText: {
    ...Fonts.Regular14grey,
    color: Colors.grey,
    textAlign: "center",
    marginTop: Default.fixPadding * 5,
  },
});

export default OrderDetailScreen;
