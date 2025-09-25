import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  StyleSheet,
  Dimensions,
  StatusBar,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import { useSearchProducts } from "../hooks/useMarketplace";

const { width } = Dimensions.get("window");

const MarketplaceSearchScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { query: initialQuery } = route.params || {};
  const [searchQuery, setSearchQuery] = useState(initialQuery || "");
  const [recentSearches, setRecentSearches] = useState([
    "Coffee",
    "Tea",
    "Snacks",
    "Beauty products",
    "Home essentials",
  ]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Build search filters
  const buildSearchFilters = () => {
    const filters = {};
    
    if (selectedCountry !== "all") {
      filters.countryOfOrigin = selectedCountry;
    }
    
    return filters;
  };

  // Use search hook with filters
  const { data: searchData, isLoading: isSearchLoading, error: searchError } = useSearchProducts(
    searchQuery,
    buildSearchFilters()
  );

  // Country filter options
  const countryOptions = [
    { id: "all", label: "All Countries" },
    { id: "Local", label: "Local" },
    { id: "UK", label: "UK Products" },
    { id: "USA", label: "USA Products" },
  ];

  const handleCountryFilter = (countryId) => {
    setSelectedCountry(countryId);
  };

  // Mock search results
  const mockResults = [
    {
      id: 1,
      name: "RYZE Mushroom Coffee",
      vendor: "RYZE",
      rating: 4.5,
      reviews: 385200,
      price: 27.00,
      image: require("../assets/images/img7.png"),
    },
    {
      id: 2,
      name: "Bones Coffee Company",
      vendor: "Bones Coffee",
      rating: 4.8,
      reviews: 56000,
      price: 15.99,
      originalPrice: 55.99,
      discount: "Save US$40",
      image: require("../assets/images/img8.png"),
    },
    {
      id: 3,
      name: "Purity Coffee",
      vendor: "Purity Coffee",
      rating: 4.9,
      reviews: 32800,
      price: 24.00,
      originalPrice: 39.00,
      discount: "Save US$15",
      image: require("../assets/images/img9.png"),
    },
    {
      id: 4,
      name: "Danger Coffee",
      vendor: "Danger Coffee",
      rating: 4.6,
      reviews: 8100,
      price: 29.99,
      image: require("../assets/images/img10.png"),
    },
  ];

  const categories = [
    { id: 1, name: "Coffee", icon: "cafe", colors: ["#6B3AA0", "#8B5FBF"] },
    { id: 2, name: "Pantry", icon: "restaurant", colors: ["#4ECDC4", "#44A08D"] },
    { id: 3, name: "Snacks", icon: "fast-food", colors: ["#FF6B6B", "#FF8E53"] },
    { id: 4, name: "Tea", icon: "leaf", colors: ["#4ECDC4", "#44A08D"] },
    { id: 5, name: "Candy & chocolate", icon: "ice-cream", colors: ["#FFD93D", "#FF6B6B"] },
    { id: 6, name: "Fresh Foods", icon: "nutrition", colors: ["#56AB2F", "#A8E6CF"] },
  ];

  useEffect(() => {
    if (searchQuery.length > 0) {
      performSearch();
    }
  }, [searchQuery, searchData]);

  const performSearch = () => {
    setIsSearching(true);
    
    // Use real data from hook or fallback to mock data
    if (searchData && searchData.length > 0) {
      const formattedResults = searchData.map(product => ({
        id: product.id,
        name: product.name,
        vendor: product.vendor?.store_name || "Casa Nirvana",
        rating: product.rating || 4.5,
        reviews: product.review_count || 100,
        price: parseFloat(product.price),
        originalPrice: product.original_price ? parseFloat(product.original_price) : parseFloat(product.price) * 1.3,
        discount: product.discount_percentage ? `${product.discount_percentage}% off` : null,
        image: product.images && product.images.length > 0 ? { uri: product.images[0] } : require("../assets/images/img1.png"),
      }));
      setSearchResults(formattedResults);
    } else {
      // Fallback to mock results
      setSearchResults(mockResults);
    }
    setIsSearching(false);
    
    // Add to recent searches
    if (!recentSearches.includes(searchQuery)) {
      setRecentSearches([searchQuery, ...recentSearches.slice(0, 4)]);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      performSearch();
    }
  };

  const handleCategoryPress = (category) => {
    navigation.navigate("categoryListingScreen", {
      category: category.name,
      categoryId: category.id,
    });
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  const formatReviews = (count) => {
    if (count >= 1000000) {
      return `(${(count / 1000000).toFixed(1)}M)`;
    }
    if (count >= 1000) {
      return `(${(count / 1000).toFixed(1)}K)`;
    }
    return `(${count})`;
  };

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity
      style={styles.resultCard}
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
      <Image source={item.image} style={styles.resultImage} />
      <View style={styles.resultInfo}>
        <Text style={styles.vendorName}>{item.vendor}</Text>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.ratingText}>
            {item.rating} {formatReviews(item.reviews)}
          </Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>US${item.price.toFixed(2)}</Text>
          {item.originalPrice && (
            <Text style={styles.originalPrice}>
              US${item.originalPrice.toFixed(2)}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(item)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={item.colors}
        style={styles.categoryGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.categoryName}>{item.name}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />

      {/* Search Header */}
      <View style={styles.searchHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={Colors.lightGrey} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor={Colors.lightGrey}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            autoFocus={true}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color={Colors.lightGrey} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Country Filters */}
      {searchQuery.length > 0 && (
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
          </ScrollView>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        {searchResults.length === 0 && !isSearching ? (
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent searches</Text>
                {recentSearches.map((search, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.recentSearchItem}
                    onPress={() => setSearchQuery(search)}
                  >
                    <Ionicons
                      name="time-outline"
                      size={20}
                      color={Colors.lightGrey}
                    />
                    <Text style={styles.recentSearchText}>{search}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Categories */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Browse categories</Text>
              <FlatList
                data={categories}
                renderItem={renderCategory}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                scrollEnabled={false}
                contentContainerStyle={styles.categoriesGrid}
              />
            </View>
          </>
        ) : isSearching ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        ) : (
          <>
            {/* Search Results */}
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>
                {searchResults.length} results for "{searchQuery}"
              </Text>
            </View>
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              contentContainerStyle={styles.resultsList}
            />
          </>
        )}

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
          <TouchableOpacity style={styles.tabButton} activeOpacity={0.8}>
            <Ionicons name="search" size={24} color={Colors.black} />
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
  searchHeader: {
    flexDirection: "row",
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
    marginRight: Default.fixPadding,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 25,
    paddingHorizontal: Default.fixPadding * 1.2,
    paddingVertical: Default.fixPadding * 0.8,
  },
  searchInput: {
    flex: 1,
    marginLeft: Default.fixPadding * 0.5,
    marginRight: Default.fixPadding * 0.5,
    ...Fonts.SemiBold14black,
    color: Colors.black,
  },
  filtersContainer: {
    paddingHorizontal: Default.fixPadding * 1.2,
    paddingVertical: Default.fixPadding * 0.5,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
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
  section: {
    padding: Default.fixPadding * 1.2,
  },
  sectionTitle: {
    ...Fonts.Bold16black,
    color: Colors.black,
    marginBottom: Default.fixPadding,
  },
  recentSearchItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Default.fixPadding * 0.8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  recentSearchText: {
    ...Fonts.Regular14black,
    color: Colors.black,
    marginLeft: Default.fixPadding,
    flex: 1,
  },
  categoriesGrid: {
    marginTop: Default.fixPadding * 0.5,
  },
  categoryCard: {
    width: (width - Default.fixPadding * 2) / 2,
    height: 100,
    marginBottom: Default.fixPadding,
    paddingHorizontal: Default.fixPadding * 0.5,
  },
  categoryGradient: {
    flex: 1,
    padding: Default.fixPadding * 1.2,
    justifyContent: "space-between",
    borderRadius: 15,
  },
  categoryName: {
    ...Fonts.Bold16white,
    color: Colors.white,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  loadingContainer: {
    padding: Default.fixPadding * 3,
    alignItems: "center",
  },
  loadingText: {
    ...Fonts.Regular14grey,
    color: Colors.grey,
  },
  resultsHeader: {
    padding: Default.fixPadding * 1.2,
    paddingBottom: Default.fixPadding * 0.5,
  },
  resultsCount: {
    ...Fonts.Regular14grey,
    color: Colors.grey,
  },
  resultsList: {
    paddingHorizontal: Default.fixPadding * 1.2,
  },
  resultCard: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: Default.fixPadding,
    padding: Default.fixPadding,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  discountBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#6B3AA0",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    zIndex: 1,
  },
  discountText: {
    ...Fonts.SemiBold10white,
    color: Colors.white,
  },
  resultImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: Default.fixPadding,
  },
  resultInfo: {
    flex: 1,
    justifyContent: "center",
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
    marginBottom: Default.fixPadding * 0.3,
  },
  ratingText: {
    ...Fonts.Regular12grey,
    color: Colors.grey,
    marginLeft: 4,
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

export default MarketplaceSearchScreen;
