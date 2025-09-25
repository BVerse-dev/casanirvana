import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Share,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import AwesomeButton from "react-native-really-awesome-button";
import MyStatusBar from "../components/myStatusBar";
import { useOrder } from "../hooks/useMarketplace";

const { width } = Dimensions.get("window");

const OrderConfirmationScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { orderId, orderData, totalAmount } = route.params || {};
  
  const [showConfetti, setShowConfetti] = useState(true);
  
  // Fetch the latest order data
  const { data: latestOrderData, isLoading, error } = useOrder(orderId);
  
  // Use latest data if available, otherwise use passed data
  const order = latestOrderData || orderData;

  useEffect(() => {
    // Hide confetti after animation
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const generateOrderNumber = (orderId) => {
    if (!orderId) return "CN-000000";
    // Generate a readable order number from UUID
    const shortId = orderId.replace(/-/g, '').substring(0, 8).toUpperCase();
    return `CN-${shortId}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString();
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getEstimatedDelivery = () => {
    const today = new Date();
    const deliveryDate = new Date(today);
    
    if (order?.delivery_method === 'pickup') {
      deliveryDate.setDate(today.getDate() + 1); // Next day for pickup
      return deliveryDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } else {
      deliveryDate.setDate(today.getDate() + 3); // 3 days for delivery
      return deliveryDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }
  };

  const handleShareOrder = async () => {
    try {
      const orderNumber = generateOrderNumber(orderId);
      const message = `🎉 Order Confirmed! 
      
Order #${orderNumber}
Total: GH₵ ${(totalAmount || order?.total_amount || 0).toFixed(2)}
Estimated ${order?.delivery_method === 'pickup' ? 'Pickup' : 'Delivery'}: ${getEstimatedDelivery()}

Thanks for shopping with Casa Nirvana! 🛍️`;

      await Share.share({
        message: message,
        title: 'Order Confirmation',
      });
    } catch (error) {
      console.error('Error sharing order:', error);
    }
  };

  const orderTimeline = [
    {
      id: 1,
      title: "Order Placed",
      subtitle: formatDate(order?.created_at),
      icon: "checkmark-circle",
      status: "completed",
      color: Colors.primary,
    },
    {
      id: 2,
      title: "Order Confirmed",
      subtitle: "Processing your order",
      icon: "time",
      status: "current",
      color: "#FFD700",
    },
    {
      id: 3,
      title: order?.delivery_method === 'pickup' ? "Ready for Pickup" : "Out for Delivery",
      subtitle: getEstimatedDelivery(),
      icon: order?.delivery_method === 'pickup' ? "store" : "car",
      status: "pending",
      color: Colors.lightGrey,
    },
    {
      id: 4,
      title: order?.delivery_method === 'pickup' ? "Picked Up" : "Delivered",
      subtitle: "Order complete",
      icon: "checkmark-circle",
      status: "pending",
      color: Colors.lightGrey,
    },
  ];

  return (
    <View style={styles.container}>
      <MyStatusBar />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />

      {/* Success Animation Area */}
      {showConfetti && (
        <View style={styles.confettiContainer}>
          <View style={styles.successAnimation}>
            <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
          </View>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Success Header */}
        <View style={styles.successHeader}>
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
          </View>
          <Text style={styles.successTitle}>Order Confirmed!</Text>
          <Text style={styles.successSubtitle}>
            Thank you for your purchase. We're preparing your order.
          </Text>
        </View>

        {/* Order Details Card */}
        <View style={styles.section}>
          <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderNumber}>
                  Order #{generateOrderNumber(orderId)}
                </Text>
                <Text style={styles.orderDate}>
                  Placed on {formatDate(order?.created_at)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShareOrder}
                activeOpacity={0.8}
              >
                <Ionicons name="share-outline" size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.orderSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Items</Text>
                <Text style={styles.summaryValue}>
                  {order?.items?.length || 0} item{(order?.items?.length || 0) !== 1 ? 's' : ''}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Amount</Text>
                <Text style={styles.totalAmount}>
                  GH₵ {(totalAmount || order?.total_amount || 0).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Delivery Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {order?.delivery_method === 'pickup' ? 'Pickup' : 'Delivery'} Information
          </Text>
          <View style={styles.deliveryCard}>
            <View style={styles.deliveryHeader}>
              <View style={styles.deliveryIconContainer}>
                <MaterialIcons 
                  name={order?.delivery_method === 'pickup' ? "store" : "local-shipping"} 
                  size={24} 
                  color={order?.delivery_method === 'pickup' ? "#6B3AA0" : "#4ECDC4"} 
                />
              </View>
              <View style={styles.deliveryInfo}>
                <Text style={styles.deliveryTitle}>
                  {order?.delivery_method === 'pickup' ? 'Pickup from Casa Nirvana Hub' : 'Home Delivery'}
                </Text>
                <Text style={styles.deliverySubtitle}>
                  Estimated: {getEstimatedDelivery()}
                </Text>
              </View>
            </View>

            {order?.delivery_address && order?.delivery_method !== 'pickup' && (
              <View style={styles.addressSection}>
                <Text style={styles.addressTitle}>Delivery Address:</Text>
                <Text style={styles.addressText}>
                  {order.delivery_address.fullName}{'\n'}
                  {order.delivery_address.streetAddress}{'\n'}
                  {order.delivery_address.city}, {order.delivery_address.region}{'\n'}
                  {order.delivery_address.phoneNumber}
                </Text>
              </View>
            )}

            {order?.delivery_method === 'pickup' && (
              <View style={styles.addressSection}>
                <Text style={styles.addressTitle}>Pickup Location:</Text>
                <Text style={styles.addressText}>
                  Casa Nirvana Hub{'\n'}
                  123 Community Center Drive{'\n'}
                  Accra, Greater Accra Region{'\n'}
                  Mon-Fri: 8:00 AM - 6:00 PM
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Order Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Status</Text>
          <View style={styles.timelineContainer}>
            {orderTimeline.map((step, index) => (
              <View key={step.id} style={styles.timelineStep}>
                <View style={styles.timelineContent}>
                  <View style={[
                    styles.timelineIcon,
                    { backgroundColor: step.color + '15' }
                  ]}>
                    <MaterialIcons 
                      name={step.icon} 
                      size={20} 
                      color={step.color} 
                    />
                  </View>
                  <View style={styles.timelineText}>
                    <Text style={[
                      styles.timelineTitle,
                      step.status === 'completed' && styles.completedText,
                      step.status === 'current' && styles.currentText
                    ]}>
                      {step.title}
                    </Text>
                    <Text style={styles.timelineSubtitle}>{step.subtitle}</Text>
                  </View>
                </View>
                {index < orderTimeline.length - 1 && (
                  <View style={[
                    styles.timelineLine,
                    step.status === 'completed' && styles.completedLine
                  ]} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("orderTrackingScreen", { orderId })}
              activeOpacity={0.8}
            >
              <Ionicons name="location-outline" size={20} color={Colors.primary} />
              <Text style={styles.actionText}>Track Order</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("ordersScreen")}
              activeOpacity={0.8}
            >
              <Ionicons name="list" size={20} color={Colors.primary} />
              <Text style={styles.actionText}>View All Orders</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("marketplaceHomeScreen")}
              activeOpacity={0.8}
            >
              <Ionicons name="storefront" size={20} color={Colors.primary} />
              <Text style={styles.actionText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Support Information */}
        <View style={styles.section}>
          <View style={styles.supportCard}>
            <Ionicons name="help-circle-outline" size={24} color={Colors.primary} />
            <View style={styles.supportText}>
              <Text style={styles.supportTitle}>Need Help?</Text>
              <Text style={styles.supportSubtitle}>
                Contact our support team if you have any questions about your order.
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomContainer}>
        <AwesomeButton
          onPress={() => navigation.navigate("ordersScreen")}
          width={(width - Default.fixPadding * 3) / 2}
          height={45}
          backgroundColor={Colors.white}
          backgroundDarker="#F0F0F0"
          borderColor={Colors.primary}
          borderWidth={1}
          borderRadius={22}
        >
          <Text style={[styles.buttonText, { color: Colors.primary }]}>
            Track Order
          </Text>
        </AwesomeButton>

        <AwesomeButton
          onPress={() => {
            // Reset navigation stack and go to marketplace home
            navigation.reset({
              index: 0,
              routes: [{ name: 'homeScreen' }],
            });
            navigation.navigate("marketplaceHomeScreen");
          }}
          width={(width - Default.fixPadding * 3) / 2}
          height={45}
          backgroundColor={Colors.primary}
          backgroundDarker={Colors.primary}
          borderRadius={22}
        >
          <Text style={styles.buttonText}>Continue Shopping</Text>
        </AwesomeButton>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  confettiContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  successAnimation: {
    alignItems: "center",
    justifyContent: "center",
  },
  successHeader: {
    alignItems: "center",
    paddingVertical: Default.fixPadding * 3,
    paddingHorizontal: Default.fixPadding * 1.2,
  },
  successIconContainer: {
    marginBottom: Default.fixPadding,
  },
  successTitle: {
    ...Fonts.Bold24black,
    color: Colors.black,
    marginBottom: Default.fixPadding * 0.5,
    textAlign: "center",
  },
  successSubtitle: {
    ...Fonts.Regular16grey,
    color: Colors.grey,
    textAlign: "center",
    lineHeight: 22,
  },
  section: {
    paddingHorizontal: Default.fixPadding * 1.2,
    marginBottom: Default.fixPadding,
  },
  sectionTitle: {
    ...Fonts.Bold16black,
    color: Colors.black,
    marginBottom: Default.fixPadding,
    fontWeight: "bold",
  },
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Default.fixPadding,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Default.fixPadding,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    ...Fonts.Bold18black,
    color: Colors.black,
    marginBottom: 4,
  },
  orderDate: {
    ...Fonts.Regular14grey,
    color: Colors.grey,
  },
  shareButton: {
    padding: Default.fixPadding * 0.5,
    backgroundColor: Colors.primary + '15',
    borderRadius: 20,
  },
  orderSummary: {
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: Default.fixPadding,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Default.fixPadding * 0.5,
  },
  summaryLabel: {
    ...Fonts.Regular14black,
    color: Colors.black,
  },
  summaryValue: {
    ...Fonts.SemiBold14black,
    color: Colors.black,
  },
  totalAmount: {
    ...Fonts.Bold16black,
    color: Colors.primary,
  },
  deliveryCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Default.fixPadding,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  deliveryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Default.fixPadding,
  },
  deliveryIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F0F8FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Default.fixPadding,
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryTitle: {
    ...Fonts.Bold14black,
    color: Colors.black,
    marginBottom: 4,
  },
  deliverySubtitle: {
    ...Fonts.Regular12grey,
    color: Colors.grey,
  },
  addressSection: {
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: Default.fixPadding,
  },
  addressTitle: {
    ...Fonts.SemiBold12black,
    color: Colors.black,
    marginBottom: Default.fixPadding * 0.5,
  },
  addressText: {
    ...Fonts.Regular12grey,
    color: Colors.grey,
    lineHeight: 18,
  },
  timelineContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Default.fixPadding,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  timelineStep: {
    position: "relative",
  },
  timelineContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: Default.fixPadding,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Default.fixPadding,
  },
  timelineText: {
    flex: 1,
  },
  timelineTitle: {
    ...Fonts.SemiBold14black,
    color: Colors.grey,
    marginBottom: 2,
  },
  completedText: {
    color: Colors.black,
  },
  currentText: {
    color: "#FFD700",
    fontWeight: "bold",
  },
  timelineSubtitle: {
    ...Fonts.Regular12grey,
    color: Colors.grey,
  },
  timelineLine: {
    position: "absolute",
    left: 19,
    top: 40,
    width: 2,
    height: 20,
    backgroundColor: "#E0E0E0",
  },
  completedLine: {
    backgroundColor: Colors.primary,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 0.48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary + '10',
    paddingVertical: Default.fixPadding,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  actionText: {
    ...Fonts.SemiBold14primary,
    color: Colors.primary,
    marginLeft: Default.fixPadding * 0.5,
  },
  supportCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F8F9FA",
    padding: Default.fixPadding,
    borderRadius: 8,
  },
  supportText: {
    flex: 1,
    marginLeft: Default.fixPadding,
  },
  supportTitle: {
    ...Fonts.SemiBold14black,
    color: Colors.black,
    marginBottom: 4,
  },
  supportSubtitle: {
    ...Fonts.Regular12grey,
    color: Colors.grey,
    lineHeight: 18,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    paddingTop: Default.fixPadding,
    paddingBottom: Default.fixPadding * 2,
    paddingHorizontal: Default.fixPadding * 1.2,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  buttonText: {
    ...Fonts.SemiBold14white,
    color: Colors.white,
  },
});

export default OrderConfirmationScreen;
