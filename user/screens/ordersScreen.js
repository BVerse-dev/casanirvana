import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
  Dimensions,
  StatusBar,
  RefreshControl,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");

const OrdersScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("active");
  const [refreshing, setRefreshing] = useState(false);

  // Mock orders data
  const activeOrders = [
    {
      id: 1,
      status: "On the way",
      carrier: "FedEx",
      estimatedDelivery: "Tomorrow",
      trackingNumber: "FX123456789",
      items: [
        {
          name: "Honey Bee Balm",
          quantity: 2,
          image: require("../assets/images/img1.png"),
        },
      ],
      totalAmount: 10.00,
    },
    {
      id: 2,
      status: "On the way",
      carrier: "FedEx",
      estimatedDelivery: "Dec 28",
      trackingNumber: "FX987654321",
      items: [
        {
          name: "Strawberry Bee Balm",
          quantity: 1,
          image: require("../assets/images/img2.png"),
        },
      ],
      totalAmount: 5.00,
    },
    {
      id: 3,
      status: "Processing",
      carrier: "FedEx",
      estimatedDelivery: "Dec 30",
      items: [
        {
          name: "Watermelon Bee Balm",
          quantity: 3,
          image: require("../assets/images/img3.png"),
        },
      ],
      totalAmount: 15.00,
    },
  ];

  const pastOrders = [
    {
      id: 4,
      status: "Delivered",
      deliveredDate: "Feb 11",
      carrier: "Evri",
      items: [
        {
          name: "Coffee Bundle",
          quantity: 1,
          image: require("../assets/images/img7.png"),
        },
      ],
      totalAmount: 27.00,
    },
    {
      id: 5,
      status: "Cancelled",
      cancelledDate: "Feb 5",
      vendor: "STOREBLITZ",
      refundAmount: 156.51,
      items: [
        {
          name: "Electronics Bundle",
          quantity: 1,
          image: require("../assets/images/img10.png"),
        },
      ],
    },
    {
      id: 6,
      status: "Delivered",
      deliveredDate: "Jan 28",
      carrier: "DHL",
      items: [
        {
          name: "Tea Collection",
          quantity: 2,
          image: require("../assets/images/img8.png"),
        },
      ],
      totalAmount: 32.00,
    },
  ];

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

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

  const handleOrderPress = (order) => {
    navigation.navigate("orderDetailScreen", { order });
  };

  const handleTrackOrder = (order) => {
    navigation.navigate("orderTrackingScreen", { order });
  };

  const handleReorder = (order) => {
    // Navigate to cart with items from this order
    navigation.navigate("shoppingCartScreen", { reorderItems: order.items });
  };

  const renderOrder = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => handleOrderPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderStatus}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          />
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
        {item.trackingNumber && (
          <TouchableOpacity
            onPress={() => handleTrackOrder(item)}
            style={styles.trackButton}
          >
            <Text style={styles.trackButtonText}>Track</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.orderContent}>
        {item.items[0].image && (
          <Image source={item.items[0].image} style={styles.orderImage} />
        )}
        <View style={styles.orderInfo}>
          <Text style={styles.orderTitle} numberOfLines={2}>
            {item.items[0].name}
          </Text>
          {item.items.length > 1 && (
            <Text style={styles.moreItems}>
              +{item.items.length - 1} more items
            </Text>
          )}
          <Text style={styles.carrierText}>
            {item.carrier || item.vendor}
          </Text>
          {item.estimatedDelivery && (
            <Text style={styles.deliveryText}>
              Est. delivery: {item.estimatedDelivery}
            </Text>
          )}
          {item.deliveredDate && (
            <Text style={styles.deliveryText}>
              Delivered: {item.deliveredDate}
            </Text>
          )}
          {item.refundAmount && (
            <Text style={styles.refundText}>
              Refund: £{item.refundAmount.toFixed(2)}
            </Text>
          )}
        </View>
      </View>

      {item.status === "Delivered" && (
        <View style={styles.orderActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleReorder(item)}
          >
            <Ionicons name="refresh" size={16} color={Colors.primary} />
            <Text style={styles.actionButtonText}>Reorder</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="star-outline" size={16} color={Colors.primary} />
            <Text style={styles.actionButtonText}>Rate</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  const EmptyState = ({ type }) => (
    <View style={styles.emptyState}>
      <Ionicons
        name={type === "active" ? "cube-outline" : "archive-outline"}
        size={64}
        color={Colors.lightGrey}
      />
      <Text style={styles.emptyTitle}>
        {type === "active" ? "No active orders" : "No past orders"}
      </Text>
      <Text style={styles.emptySubtitle}>
        {type === "active"
          ? "Your active orders will appear here"
          : "Your order history will appear here"}
      </Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => navigation.navigate("marketplaceHomeScreen")}
      >
        <Text style={styles.shopButtonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

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
        <Text style={styles.headerTitle}>Orders</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="search" size={24} color={Colors.black} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="ellipsis-vertical" size={24} color={Colors.black} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "active" && styles.activeTab]}
          onPress={() => setActiveTab("active")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "active" && styles.activeTabText,
            ]}
          >
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "past" && styles.activeTab]}
          onPress={() => setActiveTab("past")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "past" && styles.activeTabText,
            ]}
          >
            Past orders
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={activeTab === "past" ? Colors.black : Colors.grey}
          />
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      <FlatList
        data={activeTab === "active" ? activeOrders : pastOrders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.ordersList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => <EmptyState type={activeTab} />}
        ListFooterComponent={<View style={{ height: 100 }} />}
      />

      {/* Floating Bottom Tab Bar */}
      <View style={styles.bottomTabContainer}>
        <View style={styles.bottomTab}>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => navigation.navigate("marketplaceHomeScreen")}
            activeOpacity={0.8}
          >
            <Ionicons name="home-outline" size={24} color={Colors.lightGrey} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => navigation.navigate("marketplaceSearchScreen")}
            activeOpacity={0.8}
          >
            <Ionicons name="search" size={24} color={Colors.lightGrey} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabButton} activeOpacity={0.8}>
            <Ionicons name="list" size={24} color={Colors.black} />
          </TouchableOpacity>
        </View>
      </View>
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
    paddingHorizontal: Default.fixPadding * 1.2,
    paddingTop: Default.fixPadding * 3,
    paddingBottom: Default.fixPadding,
    backgroundColor: Colors.white,
  },
  backButton: {
    padding: Default.fixPadding * 0.5,
  },
  headerTitle: {
    ...Fonts.Bold18black,
    color: Colors.black,
    flex: 1,
    marginLeft: Default.fixPadding,
  },
  headerActions: {
    flexDirection: "row",
  },
  headerButton: {
    padding: Default.fixPadding * 0.5,
    marginLeft: Default.fixPadding * 0.5,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    paddingHorizontal: Default.fixPadding * 1.2,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Default.fixPadding,
    marginRight: Default.fixPadding * 2,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: Colors.black,
  },
  tabText: {
    ...Fonts.SemiBold14grey,
    color: Colors.grey,
  },
  activeTabText: {
    ...Fonts.SemiBold14black,
    color: Colors.black,
  },
  ordersList: {
    padding: Default.fixPadding * 1.2,
  },
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Default.fixPadding * 1.2,
    marginBottom: Default.fixPadding,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Default.fixPadding,
  },
  orderStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Default.fixPadding * 0.5,
  },
  statusText: {
    ...Fonts.SemiBold14black,
    color: Colors.black,
  },
  trackButton: {
    paddingHorizontal: Default.fixPadding,
    paddingVertical: Default.fixPadding * 0.3,
    borderRadius: 15,
    backgroundColor: "#F0F0F0",
  },
  trackButtonText: {
    ...Fonts.SemiBold12black,
    color: Colors.black,
  },
  orderContent: {
    flexDirection: "row",
  },
  orderImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: Default.fixPadding,
  },
  orderInfo: {
    flex: 1,
  },
  orderTitle: {
    ...Fonts.SemiBold14black,
    color: Colors.black,
    marginBottom: Default.fixPadding * 0.3,
  },
  moreItems: {
    ...Fonts.Regular12grey,
    color: Colors.grey,
    marginBottom: Default.fixPadding * 0.3,
  },
  carrierText: {
    ...Fonts.Regular12grey,
    color: Colors.grey,
  },
  deliveryText: {
    ...Fonts.Regular12black,
    color: Colors.black,
    marginTop: Default.fixPadding * 0.3,
  },
  refundText: {
    ...Fonts.SemiBold14black,
    color: Colors.black,
    marginTop: Default.fixPadding * 0.3,
  },
  orderActions: {
    flexDirection: "row",
    marginTop: Default.fixPadding,
    paddingTop: Default.fixPadding,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: Default.fixPadding * 1.5,
  },
  actionButtonText: {
    ...Fonts.SemiBold12primary,
    color: Colors.primary,
    marginLeft: Default.fixPadding * 0.3,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Default.fixPadding * 5,
  },
  emptyTitle: {
    ...Fonts.Bold18black,
    color: Colors.black,
    marginTop: Default.fixPadding * 1.5,
  },
  emptySubtitle: {
    ...Fonts.Regular14grey,
    color: Colors.grey,
    marginTop: Default.fixPadding * 0.5,
    marginBottom: Default.fixPadding * 2,
  },
  shopButton: {
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding,
    backgroundColor: Colors.primary,
    borderRadius: 25,
  },
  shopButtonText: {
    ...Fonts.SemiBold14white,
    color: Colors.white,
  },
  bottomTabContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  bottomTab: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 30,
    paddingVertical: Default.fixPadding,
    paddingHorizontal: Default.fixPadding * 2,
    justifyContent: "space-around",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tabButton: {
    padding: Default.fixPadding * 0.5,
  },
});

export default OrdersScreen;
