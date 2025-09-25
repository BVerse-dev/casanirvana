import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  RefreshControl,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import MyStatusBar from "../components/myStatusBar";
import { useOrders } from "../hooks/useMarketplace";

const OrdersScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  
  const { data: orders, isLoading, error, refetch } = useOrders();

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Error refreshing orders:', error);
    } finally {
      setRefreshing(false);
    }
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
      year: 'numeric'
    });
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

  const renderOrderItem = ({ item: order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate("orderTrackingScreen", { orderId: order.id })}
      activeOpacity={0.8}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>
            {generateOrderNumber(order.id)}
          </Text>
          <Text style={styles.orderDate}>
            {formatDate(order.created_at)}
          </Text>
        </View>
        
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(order.status) + '20' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: getStatusColor(order.status) }
          ]}>
            {getStatusDisplayName(order.status)}
          </Text>
        </View>
      </View>

      {/* Order Items Preview */}
      <View style={styles.orderItems}>
        {order.items?.slice(0, 2).map((item, index) => (
          <View key={index} style={styles.orderItemPreview}>
            <Image 
              source={
                item.product_image 
                  ? { uri: item.product_image }
                  : require("../assets/images/img1.png")
              }
              style={styles.itemImage}
            />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>
                {String(item.product_name || "Product")}
              </Text>
              <Text style={styles.itemQuantity}>
                Qty: {item.quantity}
              </Text>
            </View>
          </View>
        ))}
        
        {order.items?.length > 2 && (
          <View style={styles.moreItems}>
            <Text style={styles.moreItemsText}>
              +{order.items.length - 2} more items
            </Text>
          </View>
        )}
      </View>

      <View style={styles.orderFooter}>
        <View style={styles.orderTotal}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>
            GH₵ {parseFloat(order.total_amount || 0).toFixed(2)}
          </Text>
        </View>
        
        <View style={styles.trackButton}>
          <Ionicons name="location-outline" size={16} color={Colors.primary} />
          <Text style={styles.trackText}>Track Order</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="bag-outline" size={64} color={Colors.lightGrey} />
      <Text style={styles.emptyTitle}>No Orders Yet</Text>
      <Text style={styles.emptyMessage}>
        You haven't placed any orders yet.{'\n'}
        Start shopping to see your orders here!
      </Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => navigation.navigate("marketplaceHomeScreen")}
      >
        <Text style={styles.shopButtonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && !orders) {
    return (
      <View style={[styles.container, styles.centered]}>
        <MyStatusBar />
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        <Text style={styles.loadingText}>Loading your orders...</Text>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Orders List */}
      <FlatList
        data={orders || []}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
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
    fontWeight: "bold",
  },
  placeholder: {
    width: 34, // Same as back button width
  },
  listContainer: {
    padding: Default.fixPadding * 1.2,
    flexGrow: 1,
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
    ...Fonts.Bold16black,
    color: Colors.black,
    fontWeight: "bold",
    marginBottom: 4,
  },
  orderDate: {
    ...Fonts.Regular12grey,
    color: Colors.grey,
  },
  statusBadge: {
    paddingHorizontal: Default.fixPadding * 0.8,
    paddingVertical: Default.fixPadding * 0.3,
    borderRadius: 12,
  },
  statusText: {
    ...Fonts.SemiBold12black,
    fontWeight: "bold",
    fontSize: 11,
  },
  orderItems: {
    marginBottom: Default.fixPadding,
  },
  orderItemPreview: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Default.fixPadding * 0.5,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.lightGrey,
  },
  itemInfo: {
    flex: 1,
    marginLeft: Default.fixPadding * 0.8,
  },
  itemName: {
    ...Fonts.SemiBold12black,
    color: Colors.black,
    fontWeight: "bold",
    marginBottom: 2,
  },
  itemQuantity: {
    ...Fonts.Regular10grey,
    color: Colors.grey,
    fontSize: 10,
  },
  moreItems: {
    alignItems: "center",
    marginTop: Default.fixPadding * 0.5,
  },
  moreItemsText: {
    ...Fonts.Regular12grey,
    color: Colors.grey,
    fontStyle: "italic",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: Default.fixPadding,
  },
  orderTotal: {
    flex: 1,
  },
  totalLabel: {
    ...Fonts.Regular12grey,
    color: Colors.grey,
    marginBottom: 2,
  },
  totalAmount: {
    ...Fonts.Bold14black,
    color: Colors.black,
    fontWeight: "bold",
  },
  trackButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: Default.fixPadding,
    paddingVertical: Default.fixPadding * 0.5,
    borderRadius: 8,
  },
  trackText: {
    ...Fonts.SemiBold12primary,
    color: Colors.primary,
    marginLeft: Default.fixPadding * 0.3,
  },
  separator: {
    height: Default.fixPadding,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 4,
  },
  emptyTitle: {
    ...Fonts.Bold18black,
    color: Colors.black,
    fontWeight: "bold",
    marginTop: Default.fixPadding,
    marginBottom: Default.fixPadding * 0.5,
  },
  emptyMessage: {
    ...Fonts.Regular14grey,
    color: Colors.grey,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Default.fixPadding * 2,
  },
  shopButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding,
    borderRadius: 8,
  },
  shopButtonText: {
    ...Fonts.SemiBold14white,
    color: Colors.white,
  },
  loadingText: {
    ...Fonts.SemiBold16black,
    color: Colors.grey,
  },
});

export default OrdersScreen;