import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  StatusBar,
  RefreshControl,
  Animated,
  Alert,
  Linking,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import MyStatusBar from "../components/myStatusBar";
import { useOrder } from "../hooks/useMarketplace";
import { supabase } from "../lib/supabase";

const { width, height } = Dimensions.get("window");

const OrderTrackingScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { orderId } = route.params || {};
  
  const [refreshing, setRefreshing] = useState(false);
  const [trackingUpdates, setTrackingUpdates] = useState([]);
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  // Fetch order data with real-time updates
  const { data: orderData, isLoading, error, refetch } = useOrder(orderId);

  // Real-time subscription for order updates
  useEffect(() => {
    if (!orderId) return;

    const subscription = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'marketplace_orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          console.log('Order updated:', payload);
          refetch(); // Refetch order data when updated
          
          // Add tracking update
          const newUpdate = {
            id: Date.now(),
            timestamp: new Date(),
            status: payload.new.status,
            message: getStatusMessage(payload.new.status),
            isNew: true,
          };
          
          setTrackingUpdates(prev => [newUpdate, ...prev]);
          
          // Animate progress
          animateProgress(payload.new.status);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [orderId]);

  // Pulse animation for active status
  useEffect(() => {
    const startPulseAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startPulseAnimation();
  }, []);

  const getStatusMessage = (status) => {
    switch (status) {
      case 'pending':
        return 'Order received and being processed';
      case 'confirmed':
        return 'Order confirmed and preparing';
      case 'processing':
        return 'Items being prepared for shipment';
      case 'shipped':
        return 'Order has been shipped';
      case 'on_the_way':
        return 'Out for delivery';
      case 'delivered':
        return 'Order successfully delivered';
      case 'cancelled':
        return 'Order has been cancelled';
      default:
        return 'Order status updated';
    }
  };

  const animateProgress = (status) => {
    const progressValues = {
      'pending': 0.2,
      'confirmed': 0.4,
      'processing': 0.6,
      'shipped': 0.8,
      'on_the_way': 0.9,
      'delivered': 1.0,
    };

    Animated.timing(progressAnimation, {
      toValue: progressValues[status] || 0.2,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  };

  const generateOrderNumber = (orderId) => {
    if (!orderId) return "CN-000000";
    const shortId = orderId.replace(/-/g, '').substring(0, 8).toUpperCase();
    return `CN-${shortId}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstimatedDelivery = () => {
    if (!orderData) return "Calculating...";
    
    const orderDate = new Date(orderData.created_at);
    const deliveryDate = new Date(orderDate);
    
    if (orderData.delivery_method === 'pickup') {
      deliveryDate.setDate(orderDate.getDate() + 1);
      return `Ready for pickup: ${deliveryDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    } else {
      deliveryDate.setDate(orderDate.getDate() + 3);
      return `Estimated delivery: ${deliveryDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    }
  };

  const getTrackingTimeline = () => {
    const currentStatus = orderData?.status || 'pending';
    
    const timeline = [
      {
        id: 1,
        status: 'pending',
        title: 'Order Placed',
        description: 'Your order has been received',
        icon: 'receipt-outline',
        timestamp: orderData?.created_at,
        completed: true,
      },
      {
        id: 2,
        status: 'confirmed',
        title: 'Order Confirmed',
        description: 'Order details verified and confirmed',
        icon: 'checkmark-circle-outline',
        timestamp: orderData?.confirmed_at,
        completed: ['confirmed', 'processing', 'shipped', 'on_the_way', 'delivered'].includes(currentStatus),
        active: currentStatus === 'confirmed',
      },
      {
        id: 3,
        status: 'processing',
        title: 'Preparing Order',
        description: 'Items being prepared and packaged',
        icon: 'cube-outline',
        timestamp: orderData?.processing_at,
        completed: ['processing', 'shipped', 'on_the_way', 'delivered'].includes(currentStatus),
        active: currentStatus === 'processing',
      },
      {
        id: 4,
        status: orderData?.delivery_method === 'pickup' ? 'ready_pickup' : 'shipped',
        title: orderData?.delivery_method === 'pickup' ? 'Ready for Pickup' : 'Shipped',
        description: orderData?.delivery_method === 'pickup' 
          ? 'Order ready for collection' 
          : 'Package dispatched for delivery',
        icon: orderData?.delivery_method === 'pickup' ? 'storefront-outline' : 'car-outline',
        timestamp: orderData?.shipped_at,
        completed: ['shipped', 'on_the_way', 'delivered'].includes(currentStatus),
        active: currentStatus === 'shipped' || (orderData?.delivery_method === 'pickup' && currentStatus === 'ready_pickup'),
      },
    ];

    if (orderData?.delivery_method !== 'pickup') {
      timeline.push({
        id: 5,
        status: 'on_the_way',
        title: 'Out for Delivery',
        description: 'Package is on the way to you',
        icon: 'bicycle-outline',
        timestamp: orderData?.out_for_delivery_at,
        completed: ['on_the_way', 'delivered'].includes(currentStatus),
        active: currentStatus === 'on_the_way',
      });
    }

    timeline.push({
      id: 6,
      status: 'delivered',
      title: orderData?.delivery_method === 'pickup' ? 'Picked Up' : 'Delivered',
      description: orderData?.delivery_method === 'pickup' 
        ? 'Order successfully collected' 
        : 'Package delivered successfully',
      icon: 'checkmark-done-outline',
      timestamp: orderData?.delivered_at,
      completed: currentStatus === 'delivered',
      active: currentStatus === 'delivered',
    });

    return timeline;
  };

  const handleContactSupport = () => {
    Alert.alert(
      "Contact Support",
      "How would you like to contact our support team?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Call", 
          onPress: () => Linking.openURL("tel:+233123456789") 
        },
        { 
          text: "WhatsApp", 
          onPress: () => Linking.openURL("whatsapp://send?phone=233123456789&text=Hi, I need help with my order " + generateOrderNumber(orderId)) 
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Error refreshing order:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const renderTimelineItem = (item, index, timeline) => {
    const isLast = index === timeline.length - 1;
    
    return (
      <View key={item.id} style={styles.timelineItem}>
        <View style={styles.timelineContent}>
          <View style={styles.timelineLeft}>
            <Animated.View style={[
              styles.timelineIcon,
              item.completed && styles.completedIcon,
              item.active && styles.activeIcon,
              item.active && {
                transform: [{ scale: pulseAnimation }]
              }
            ]}>
              <Ionicons 
                name={item.icon} 
                size={20} 
                color={
                  item.completed ? Colors.white :
                  item.active ? Colors.white :
                  Colors.grey
                } 
              />
            </Animated.View>
            {!isLast && (
              <View style={[
                styles.timelineLine,
                item.completed && styles.completedLine
              ]} />
            )}
          </View>
          
          <View style={styles.timelineRight}>
            <View style={styles.timelineHeader}>
              <Text style={[
                styles.timelineTitle,
                item.completed && styles.completedText,
                item.active && styles.activeText
              ]}>
                {item.title}
              </Text>
              {item.timestamp && (
                <Text style={styles.timelineTime}>
                  {formatDate(item.timestamp)}
                </Text>
              )}
            </View>
            <Text style={styles.timelineDescription}>
              {item.description}
            </Text>
            
            {item.active && (
              <View style={styles.activeIndicator}>
                <View style={styles.activeDot} />
                <Text style={styles.activeText}>Current Status</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (isLoading && !orderData) {
    return (
      <View style={[styles.container, styles.centered]}>
        <MyStatusBar />
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <MyStatusBar />
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        <Ionicons name="alert-circle-outline" size={64} color={Colors.grey} />
        <Text style={styles.errorText}>Unable to load order details</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const timeline = getTrackingTimeline();
  const progressWidth = progressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <MyStatusBar />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Order</Text>
        <TouchableOpacity
          style={styles.supportButton}
          onPress={handleContactSupport}
        >
          <Ionicons name="help-circle-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Order Info Card */}
        <View style={styles.section}>
          <View style={styles.orderInfoCard}>
            <View style={styles.orderHeader}>
              <View style={styles.orderNumberContainer}>
                <Text style={styles.orderNumber}>
                  {generateOrderNumber(orderId)}
                </Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(orderData?.status) + '20' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: getStatusColor(orderData?.status) }
                  ]}>
                    {getStatusDisplayName(orderData?.status)}
                  </Text>
                </View>
              </View>
              <Text style={styles.orderDate}>
                Placed on {formatDate(orderData?.created_at)}
              </Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <Animated.View 
                  style={[
                    styles.progressBar,
                    { width: progressWidth }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round((progressAnimation._value || 0.2) * 100)}% Complete
              </Text>
            </View>

            {/* Estimated Delivery */}
            <View style={styles.deliveryEstimate}>
              <Ionicons 
                name={orderData?.delivery_method === 'pickup' ? "storefront" : "time"} 
                size={16} 
                color={Colors.primary} 
              />
              <Text style={styles.deliveryText}>
                {getEstimatedDelivery()}
              </Text>
            </View>
          </View>
        </View>

        {/* Tracking Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Timeline</Text>
          <View style={styles.timelineContainer}>
            {timeline.map((item, index) => renderTimelineItem(item, index, timeline))}
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          <View style={styles.itemsContainer}>
            {orderData?.items?.map((item, index) => (
              <View key={index} style={styles.orderItem}>
                <Image 
                  source={
                    item.product_image 
                      ? { uri: item.product_image }
                      : require("../assets/images/img1.png")
                  }
                  style={styles.itemImage}
                />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {String(item.product_name || "Product")}
                  </Text>
                  <Text style={styles.itemQuantity}>
                    Qty: {item.quantity}
                  </Text>
                  <Text style={styles.itemPrice}>
                    GH₵ {parseFloat(item.unit_price || 0).toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Delivery Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Information</Text>
          <View style={styles.deliveryCard}>
            <View style={styles.deliveryHeader}>
              <MaterialIcons 
                name={orderData?.delivery_method === 'pickup' ? "store" : "local-shipping"} 
                size={24} 
                color={orderData?.delivery_method === 'pickup' ? "#6B3AA0" : "#4ECDC4"} 
              />
              <Text style={styles.deliveryMethod}>
                {orderData?.delivery_method === 'pickup' ? 'Pickup from Store' : 'Home Delivery'}
              </Text>
            </View>

            {orderData?.delivery_address && orderData?.delivery_method !== 'pickup' && (
              <View style={styles.addressSection}>
                <Text style={styles.addressTitle}>Delivery Address:</Text>
                <Text style={styles.addressText}>
                  {orderData.delivery_address.fullName}{'\n'}
                  {orderData.delivery_address.streetAddress}{'\n'}
                  {orderData.delivery_address.city}, {orderData.delivery_address.region}{'\n'}
                  {orderData.delivery_address.phoneNumber}
                </Text>
              </View>
            )}

            {orderData?.delivery_method === 'pickup' && (
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

        {/* Recent Updates */}
        {trackingUpdates.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Updates</Text>
            <View style={styles.updatesContainer}>
              {trackingUpdates.slice(0, 3).map((update) => (
                <View key={update.id} style={styles.updateItem}>
                  <View style={styles.updateDot} />
                  <View style={styles.updateContent}>
                    <Text style={styles.updateMessage}>{update.message}</Text>
                    <Text style={styles.updateTime}>
                      {formatDate(update.timestamp)}
                    </Text>
                  </View>
                  {update.isNew && (
                    <View style={styles.newBadge}>
                      <Text style={styles.newText}>New</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.section}>
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("ordersScreen")}
            >
              <Ionicons name="list-outline" size={20} color={Colors.primary} />
              <Text style={styles.actionText}>All Orders</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleContactSupport}
            >
              <Ionicons name="chatbubble-outline" size={20} color={Colors.primary} />
              <Text style={styles.actionText}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return '#FFD700';
    case 'confirmed':
      return '#4ECDC4';
    case 'processing':
      return '#6B3AA0';
    case 'shipped':
      return '#FF6B35';
    case 'on_the_way':
      return '#FF6B35';
    case 'delivered':
      return '#4CAF50';
    case 'cancelled':
      return '#FF5252';
    default:
      return Colors.grey;
  }
};

const getStatusDisplayName = (status) => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'confirmed':
      return 'Confirmed';
    case 'processing':
      return 'Processing';
    case 'shipped':
      return 'Shipped';
    case 'on_the_way':
      return 'On the Way';
    case 'delivered':
      return 'Delivered';
    case 'cancelled':
      return 'Cancelled';
    default:
      return 'Unknown';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  supportButton: {
    padding: Default.fixPadding * 0.5,
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
  orderInfoCard: {
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
    marginBottom: Default.fixPadding,
  },
  orderNumberContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Default.fixPadding * 0.5,
  },
  orderNumber: {
    ...Fonts.Bold20black,
    color: Colors.black,
  },
  statusBadge: {
    paddingHorizontal: Default.fixPadding,
    paddingVertical: Default.fixPadding * 0.3,
    borderRadius: 15,
  },
  statusText: {
    ...Fonts.SemiBold12black,
    fontWeight: "bold",
  },
  orderDate: {
    ...Fonts.Regular14grey,
    color: Colors.grey,
  },
  progressContainer: {
    marginBottom: Default.fixPadding,
  },
  progressTrack: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    marginBottom: Default.fixPadding * 0.5,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressText: {
    ...Fonts.SemiBold12black,
    color: Colors.primary,
    textAlign: "center",
  },
  deliveryEstimate: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary + '10',
    padding: Default.fixPadding * 0.8,
    borderRadius: 8,
  },
  deliveryText: {
    ...Fonts.SemiBold14black,
    color: Colors.primary,
    marginLeft: Default.fixPadding * 0.5,
  },
  timelineContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Default.fixPadding,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  timelineItem: {
    marginBottom: Default.fixPadding * 1.5,
  },
  timelineContent: {
    flexDirection: "row",
  },
  timelineLeft: {
    alignItems: "center",
    marginRight: Default.fixPadding,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  completedIcon: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  activeIcon: {
    backgroundColor: "#FFD700",
    borderColor: "#FFD700",
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#E0E0E0",
    marginTop: 8,
  },
  completedLine: {
    backgroundColor: Colors.primary,
  },
  timelineRight: {
    flex: 1,
  },
  timelineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Default.fixPadding * 0.3,
  },
  timelineTitle: {
    ...Fonts.SemiBold16black,
    color: Colors.grey,
    flex: 1,
  },
  completedText: {
    color: Colors.black,
  },
  activeText: {
    color: "#FFD700",
    fontWeight: "bold",
  },
  timelineTime: {
    ...Fonts.Regular12grey,
    color: Colors.grey,
  },
  timelineDescription: {
    ...Fonts.Regular14grey,
    color: Colors.grey,
    lineHeight: 20,
  },
  activeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Default.fixPadding * 0.5,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFD700",
    marginRight: Default.fixPadding * 0.5,
  },
  itemsContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    overflow: "hidden",
  },
  orderItem: {
    flexDirection: "row",
    padding: Default.fixPadding,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: Colors.lightGrey,
  },
  itemDetails: {
    flex: 1,
    marginLeft: Default.fixPadding,
    justifyContent: "space-between",
  },
  itemName: {
    ...Fonts.SemiBold14black,
    color: Colors.black,
    marginBottom: 4,
    fontWeight: "bold",
  },
  itemQuantity: {
    ...Fonts.Regular12grey,
    color: Colors.grey,
  },
  itemPrice: {
    ...Fonts.Bold14black,
    color: Colors.black,
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
  deliveryMethod: {
    ...Fonts.Bold16black,
    color: Colors.black,
    marginLeft: Default.fixPadding,
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
  updatesContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    overflow: "hidden",
  },
  updateItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Default.fixPadding,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  updateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginRight: Default.fixPadding,
  },
  updateContent: {
    flex: 1,
  },
  updateMessage: {
    ...Fonts.SemiBold14black,
    color: Colors.black,
    marginBottom: 2,
  },
  updateTime: {
    ...Fonts.Regular12grey,
    color: Colors.grey,
  },
  newBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  newText: {
    ...Fonts.SemiBold10white,
    color: Colors.white,
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
  loadingText: {
    ...Fonts.SemiBold16black,
    color: Colors.grey,
    textAlign: "center",
  },
  errorText: {
    ...Fonts.SemiBold16black,
    color: Colors.grey,
    textAlign: "center",
    marginTop: Default.fixPadding,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding,
    borderRadius: 8,
    marginTop: Default.fixPadding,
  },
  retryText: {
    ...Fonts.SemiBold14white,
    color: Colors.white,
  },
});

export default OrderTrackingScreen;
