import React, { useState, useEffect } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import { useProducts } from "../hooks/useMarketplace";

const { width } = Dimensions.get("window");

const CommunityPicksScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch top-rated products (community picks)
  const { data: productsData, isLoading, error, refetch } = useProducts({
    sort: "rating",
    limit: 20,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error("Error refreshing community picks:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatReviews = (num) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K reviews`;
    }
    return `${num} reviews`;
  };

  const renderProduct = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.productCard,
        index === 0 && styles.topPickCard
      ]}
      onPress={() =>
        navigation.navigate("productDetailScreen", {
          productId: item.id,
          product: item,
        })
      }
      activeOpacity={0.8}
    >
      {index === 0 && (
        <View style={styles.topPickBadge}>
          <Ionicons name="trophy" size={16} color={Colors.white} />
          <Text style={styles.topPickText}>Top Pick</Text>
        </View>
      )}
      {item.discount_percentage > 0 && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{String(item.discount_percentage)}% off</Text>
        </View>
      )}
      <Image 
        source={item.images && item.images.length > 0 ? { uri: item.images[0] } : require("../assets/images/img1.png")} 
        style={styles.productImage} 
      />
      <View style={styles.productInfo}>
        <Text style={styles.vendorName}>{String(item.vendor?.store_name || "Casa Nirvana")}</Text>
        <Text style={styles.productName} numberOfLines={2}>
          {String(item.name || "Product")}
        </Text>
        <View style={styles.ratingContainer}>
          <View style={styles.starsContainer}>
            {[...Array(5)].map((_, i) => (
              <Ionicons
                key={i}
                name="star"
                size={12}
                color={i < Math.floor(item.rating || 4.5) ? "#FFD700" : "#E0E0E0"}
              />
            ))}
          </View>
          <Text style={styles.ratingText}>
            {(item.rating || 4.5).toFixed(1)} • {formatReviews(item.review_count || 100)}
          </Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>${parseFloat(item.price || 0).toFixed(2)}</Text>
          {item.original_price && (
            <Text style={styles.originalPrice}>
              ${parseFloat(item.original_price).toFixed(2)}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Community Picks</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Ionicons name="people" size={32} color="#FFD700" />
            <Text style={styles.heroTitle}>Top-Rated by Neighbors</Text>
            <Text style={styles.heroSubtitle}>
              Discover products loved by your community. These are the highest-rated items based on real reviews from people just like you.
            </Text>
          </View>
        </View>

        {/* Products List */}
        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>Highest Rated Products</Text>
          {isLoading && !productsData ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading community picks...</Text>
            </View>
          ) : (
            <FlatList
              data={productsData || []}
              renderItem={renderProduct}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.productsList}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Ionicons name="star-outline" size={64} color={Colors.lightGrey} />
                  <Text style={styles.emptyTitle}>No community picks yet</Text>
                  <Text style={styles.emptyMessage}>
                    Check back later for top-rated products from your community.
                  </Text>
                </View>
              )}
            />
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

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
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => navigation.navigate("ordersScreen")}
            activeOpacity={0.8}
          >
            <Ionicons name="list" size={24} color={Colors.lightGrey} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
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
  headerRight: {
    width: 40,
  },
  heroSection: {
    backgroundColor: "#F8F9FA",
    paddingVertical: Default.fixPadding * 2,
    paddingHorizontal: Default.fixPadding * 1.2,
    alignItems: "center",
  },
  heroContent: {
    alignItems: "center",
    maxWidth: width * 0.8,
  },
  heroTitle: {
    ...Fonts.Bold20black,
    color: Colors.black,
    marginTop: Default.fixPadding,
    textAlign: "center",
  },
  heroSubtitle: {
    ...Fonts.Regular14grey,
    color: Colors.grey,
    marginTop: Default.fixPadding * 0.5,
    textAlign: "center",
    lineHeight: 20,
  },
  productsSection: {
    padding: Default.fixPadding * 1.2,
  },
  sectionTitle: {
    ...Fonts.Bold16black,
    color: Colors.black,
    marginBottom: Default.fixPadding,
  },
  loadingContainer: {
    padding: Default.fixPadding * 2,
    alignItems: "center",
  },
  loadingText: {
    ...Fonts.SemiBold16black,
    color: Colors.grey,
  },
  productsList: {
    paddingBottom: Default.fixPadding,
  },
  productCard: {
    width: (width - Default.fixPadding * 3.4) / 2,
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: Default.fixPadding,
    marginHorizontal: Default.fixPadding * 0.1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: "hidden",
  },
  topPickCard: {
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  topPickBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#FFD700",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1,
  },
  topPickText: {
    ...Fonts.SemiBold10white,
    color: Colors.white,
    marginLeft: 4,
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: Colors.black,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    zIndex: 1,
  },
  discountText: {
    ...Fonts.SemiBold10white,
    color: Colors.white,
  },
  productImage: {
    width: "100%",
    height: (width - Default.fixPadding * 3.4) / 2,
    resizeMode: "cover",
  },
  productInfo: {
    padding: Default.fixPadding,
  },
  vendorName: {
    ...Fonts.Regular12grey,
    color: Colors.grey,
    marginBottom: Default.fixPadding * 0.3,
  },
  productName: {
    ...Fonts.SemiBold14black,
    color: Colors.black,
    marginBottom: Default.fixPadding * 0.5,
    fontWeight: "bold",
  },
  ratingContainer: {
    marginBottom: Default.fixPadding * 0.5,
  },
  starsContainer: {
    flexDirection: "row",
    marginBottom: 2,
  },
  ratingText: {
    ...Fonts.Regular10grey,
    color: Colors.grey,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  productPrice: {
    ...Fonts.Bold14black,
    color: Colors.black,
    marginRight: Default.fixPadding * 0.5,
  },
  originalPrice: {
    ...Fonts.Regular12grey,
    color: Colors.grey,
    textDecorationLine: "line-through",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Default.fixPadding * 4,
  },
  emptyTitle: {
    ...Fonts.Bold18black,
    color: Colors.black,
    marginTop: Default.fixPadding,
    textAlign: "center",
  },
  emptyMessage: {
    ...Fonts.Regular14grey,
    color: Colors.grey,
    marginTop: Default.fixPadding * 0.5,
    textAlign: "center",
    lineHeight: 20,
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

export default CommunityPicksScreen;
