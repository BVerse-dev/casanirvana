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
  RefreshControl,
  StatusBar,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import { useProducts } from "../hooks/useMarketplace";

const { width } = Dimensions.get("window");

const CategoryListingScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { category, categoryId, categoryData } = route.params;
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSort, setSelectedSort] = useState("relevance");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("all");

  // Build filters based on category data and user selections
  const buildFilters = () => {
    const filters = { sort: selectedSort };
    
    if (categoryId && categoryId !== "imported") {
      filters.categoryId = categoryId;
    }
    
    // Handle imported products filtering
    if (categoryData?.category_type === "imported") {
      filters.isImported = true;
      
      if (categoryData?.name === "UK Products") {
        filters.countryOfOrigin = "UK";
      } else if (categoryData?.name === "USA Products") {
        filters.countryOfOrigin = "USA";
      }
    }
    
    // Apply country filter if selected
    if (selectedCountry !== "all") {
      filters.countryOfOrigin = selectedCountry;
    }
    
    return filters;
  };

  // Fetch products for this category
  const { data: productsData, isLoading, error, refetch } = useProducts(buildFilters());

  // Use dynamic products or fallback to mock data
  const mockProducts = [
    {
      id: 1,
      name: "Honey Bee Balm",
      vendor: "My Bee Balm",
      rating: 4.7,
      reviews: 21100,
      price: 5.00,
      originalPrice: 19.99,
      discount: "75% off",
      image: require("../assets/images/img1.png"),
    },
    {
      id: 2,
      name: "Strawberry Bee Balm",
      vendor: "My Bee Balm",
      rating: 4.5,
      reviews: 13500,
      price: 5.00,
      originalPrice: 19.99,
      discount: "75% off",
      image: require("../assets/images/img2.png"),
    },
    {
      id: 3,
      name: "Watermelon Bee Balm",
      vendor: "My Bee Balm",
      rating: 4.6,
      reviews: 12500,
      price: 5.00,
      originalPrice: 19.99,
      discount: "75% off",
      image: require("../assets/images/img3.png"),
    },
    {
      id: 4,
      name: "Piña Colada Bee Balm",
      vendor: "My Bee Balm",
      rating: 4.8,
      reviews: 1200,
      price: 7.00,
      originalPrice: 19.99,
      discount: "65% off",
      image: require("../assets/images/img4.png"),
    },
    {
      id: 5,
      name: "Coconut Milk Bee Balm",
      vendor: "My Bee Balm",
      rating: 4.7,
      reviews: 8900,
      price: 7.00,
      originalPrice: 19.99,
      discount: "65% off",
      image: require("../assets/images/img5.png"),
    },
    {
      id: 6,
      name: "Apple Bee Balm",
      vendor: "My Bee Balm",
      rating: 4.6,
      reviews: 5600,
      price: 7.00,
      originalPrice: 19.99,
      discount: "65% off",
      image: require("../assets/images/img6.png"),
    },
  ];

  // Use database products if available, otherwise fallback to mock data
  const products = productsData && productsData.length > 0 ? productsData.map(product => ({
    id: product.id,
    name: product.name,
    vendor: product.vendor?.store_name || "Casa Nirvana",
    rating: product.rating || 4.5,
    reviews: product.review_count || 100,
    price: parseFloat(product.price),
    originalPrice: product.original_price ? parseFloat(product.original_price) : parseFloat(product.price) * 1.3,
    discount: product.discount_percentage ? `${product.discount_percentage}% off` : null,
    image: product.images && product.images.length > 0 ? { uri: product.images[0] } : require("../assets/images/img1.png"),
  })) : mockProducts;

  const sortOptions = [
    { id: "relevance", label: "Relevance" },
    { id: "price_low", label: "Price: Low to High" },
    { id: "price_high", label: "Price: High to Low" },
    { id: "rating", label: "Rating" },
    { id: "newest", label: "Newest" },
    { id: "country", label: "Country" },
  ];

  const countryOptions = [
    { id: "all", label: "All Countries" },
    { id: "Local", label: "Local" },
    { id: "UK", label: "UK Products" },
    { id: "USA", label: "USA Products" },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Error refreshing products:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSort = (sortId) => {
    setSelectedSort(sortId);
  };

  const handleCountryFilter = (countryId) => {
    setSelectedCountry(countryId);
  };

  const formatReviews = (count) => {
    if (count >= 1000) {
      return `(${(count / 1000).toFixed(1)}K)`;
    }
    return `(${count})`;
  };

  const renderProduct = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.productCard,
        index % 2 === 0 ? styles.leftCard : styles.rightCard,
      ]}
      onPress={() =>
        navigation.navigate("productDetailScreen", {
          productId: item.id,
          product: item,
        })
      }
      activeOpacity={0.8}
    >
      {item.discount && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{item.discount}</Text>
        </View>
      )}
      <TouchableOpacity style={styles.favoriteButton}>
        <Ionicons name="heart-outline" size={20} color={Colors.grey} />
      </TouchableOpacity>
      <Image source={item.image} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.vendorName}>{item.vendor}</Text>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.ratingContainer}>
          {[...Array(5)].map((_, i) => (
            <Ionicons
              key={i}
              name="star"
              size={12}
              color={i < Math.floor(item.rating) ? "#FFD700" : "#E0E0E0"}
            />
          ))}
          <Text style={styles.ratingText}>
            {" "}
            {formatReviews(item.reviews)}
          </Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>US${item.price.toFixed(2)}</Text>
          <Text style={styles.originalPrice}>
            US${item.originalPrice.toFixed(2)}
          </Text>
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
        <Text style={styles.headerTitle}>{category}</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color={Colors.black} />
        </TouchableOpacity>
      </View>

      {/* Sort and Filter Bar */}
      <View style={styles.sortFilterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortOptions}
        >
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons name="filter" size={16} color={Colors.black} />
            <Text style={styles.filterText}>Filters</Text>
          </TouchableOpacity>
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.sortButton,
                selectedSort === option.id && styles.selectedSortButton,
              ]}
              onPress={() => handleSort(option.id)}
            >
              <Text
                style={[
                  styles.sortText,
                  selectedSort === option.id && styles.selectedSortText,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
          
          {/* Country Filter Buttons */}
          {(categoryData?.category_type === "imported" || selectedCountry !== "all") && (
            <>
              <View style={styles.filterDivider} />
              {countryOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.countryButton,
                    selectedCountry === option.id && styles.selectedCountryButton,
                  ]}
                  onPress={() => handleCountryFilter(option.id)}
                >
                  <Text
                    style={[
                      styles.countryText,
                      selectedCountry === option.id && styles.selectedCountryText,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>
      </View>

      {/* Products Grid */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.productsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
  searchButton: {
    padding: Default.fixPadding * 0.5,
  },
  sortFilterBar: {
    backgroundColor: Colors.white,
    paddingVertical: Default.fixPadding,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  sortOptions: {
    paddingHorizontal: Default.fixPadding,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Default.fixPadding,
    paddingVertical: Default.fixPadding * 0.5,
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    marginRight: Default.fixPadding * 0.5,
  },
  filterText: {
    ...Fonts.SemiBold14black,
    color: Colors.black,
    marginLeft: Default.fixPadding * 0.3,
  },
  sortButton: {
    paddingHorizontal: Default.fixPadding,
    paddingVertical: Default.fixPadding * 0.5,
    borderRadius: 20,
    marginRight: Default.fixPadding * 0.5,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  selectedSortButton: {
    backgroundColor: Colors.black,
    borderColor: Colors.black,
  },
  sortText: {
    ...Fonts.Regular14black,
    color: Colors.black,
  },
  selectedSortText: {
    color: Colors.white,
  },
  filterDivider: {
    width: 1,
    height: 20,
    backgroundColor: "#E0E0E0",
    marginHorizontal: Default.fixPadding * 0.5,
  },
  countryButton: {
    paddingHorizontal: Default.fixPadding,
    paddingVertical: Default.fixPadding * 0.5,
    backgroundColor: "#F0F8FF",
    borderRadius: 20,
    marginRight: Default.fixPadding * 0.5,
    borderWidth: 1,
    borderColor: "#4ECDC4",
  },
  selectedCountryButton: {
    backgroundColor: "#4ECDC4",
    borderColor: "#4ECDC4",
  },
  countryText: {
    ...Fonts.Regular14black,
    color: "#4ECDC4",
  },
  selectedCountryText: {
    color: Colors.white,
  },
  productsList: {
    paddingHorizontal: Default.fixPadding,
    paddingTop: Default.fixPadding,
  },
  productCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: Default.fixPadding,
    overflow: "hidden",
  },
  leftCard: {
    marginRight: Default.fixPadding * 0.5,
  },
  rightCard: {
    marginLeft: Default.fixPadding * 0.5,
  },
  discountBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: Colors.black,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 1,
  },
  discountText: {
    ...Fonts.SemiBold10white,
    color: Colors.white,
  },
  favoriteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
  },
  productImage: {
    width: "100%",
    height: (width - Default.fixPadding * 3) / 2,
    resizeMode: "cover",
  },
  productInfo: {
    padding: Default.fixPadding,
  },
  vendorName: {
    ...Fonts.Regular12grey,
    color: Colors.grey,
    marginBottom: 2,
  },
  productName: {
    ...Fonts.SemiBold14black,
    color: Colors.black,
    marginBottom: Default.fixPadding * 0.3,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Default.fixPadding * 0.5,
  },
  ratingText: {
    ...Fonts.Regular12grey,
    color: Colors.grey,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
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

export default CategoryListingScreen;
