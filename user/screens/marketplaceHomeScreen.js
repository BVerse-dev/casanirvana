import React, { useState, useEffect, useRef } from "react";
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
  RefreshControl,
  StatusBar,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

const MarketplaceHomeScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideRef = useRef(null);
  const slideInterval = useRef(null);

  const categories = [
    {
      id: 1,
      name: "Baby & toddler",
      icon: "baby-carriage",
      iconType: "FontAwesome5",
      bgColor: ["#FFB3D9", "#FFC4E1"],
      image: require("../assets/images/community1.png"),
    },
    {
      id: 2,
      name: "Home",
      icon: "home",
      iconType: "Ionicons",
      bgColor: ["#A4C4A4", "#B8D4B8"],
      image: require("../assets/images/community2.png"),
    },
    {
      id: 3,
      name: "Fitness & nutrition",
      icon: "fitness-center",
      iconType: "MaterialIcons",
      bgColor: ["#9FC5E8", "#B4D4EC"],
      image: require("../assets/images/community3.png"),
    },
    {
      id: 4,
      name: "Accessories",
      icon: "glasses",
      iconType: "FontAwesome5",
      bgColor: ["#8B9A46", "#A3B85C"],
      image: require("../assets/images/community4.png"),
    },
    {
      id: 5,
      name: "Beauty",
      icon: "spa",
      iconType: "MaterialIcons",
      bgColor: ["#8B6B47", "#A0826D"],
      image: require("../assets/images/community5.png"),
    },
    {
      id: 6,
      name: "Food & drinks",
      icon: "restaurant",
      iconType: "Ionicons",
      bgColor: ["#C8A2C8", "#D4B5D4"],
      image: require("../assets/images/community6.png"),
    },
    {
      id: 7,
      name: "Pet supplies",
      icon: "paw",
      iconType: "FontAwesome5",
      bgColor: ["#D4C5B9", "#E0D5C7"],
      image: require("../assets/images/community7.png"),
    },
    {
      id: 8,
      name: "Toys & games",
      icon: "game-controller",
      iconType: "Ionicons",
      bgColor: ["#7B68EE", "#9370DB"],
      image: require("../assets/images/community8.png"),
    },
  ];

  const moreCategories = [
    {
      id: 9,
      name: "Electronics",
      icon: "laptop",
      iconType: "FontAwesome5",
      bgColor: ["#4A4A4A", "#6B6B6B"],
    },
    {
      id: 10,
      name: "Arts & crafts",
      icon: "palette",
      iconType: "MaterialIcons",
      bgColor: ["#9B9B9B", "#B5B5B5"],
    },
    {
      id: 11,
      name: "Luggage & bags",
      icon: "briefcase",
      iconType: "FontAwesome5",
      bgColor: ["#C8B88B", "#D4C4A0"],
    },
    {
      id: 12,
      name: "Sporting goods",
      icon: "football",
      iconType: "Ionicons",
      bgColor: ["#6B9BD1", "#8BB3E0"],
    },
  ];

  const heroSlides = [
    {
      id: 1,
      title: "Up your glow game",
      subtitle: "Explore offers on self-care essentials",
      gradient: ["#8B0000", "#DC143C"],
      image: require("../assets/images/img1.png"),
      badge: "Ends Sunday",
    },
    {
      id: 2,
      title: "Summer Collection",
      subtitle: "Get ready for the season",
      gradient: ["#1B4F72", "#2E86C1"],
      image: require("../assets/images/img2.png"),
      badge: "New Arrival",
    },
    {
      id: 3,
      title: "Wellness Week",
      subtitle: "Health and beauty essentials",
      gradient: ["#0B5345", "#239B56"],
      image: require("../assets/images/img3.png"),
      badge: "Limited Time",
    },
  ];

  const tryNewFeatures = [
    {
      id: 1,
      title: "Rate My Fit",
      icon: "tshirt",
      iconType: "FontAwesome5",
      bgColor: "#FFD700",
    },
    {
      id: 2,
      title: "Radiance Routine",
      subtitle: "Discover skincare tips",
      icon: "sparkles",
      iconType: "Ionicons",
      bgColor: "#9370DB",
    },
    {
      id: 3,
      title: "Image Search",
      subtitle: "Search and shop your pics",
      icon: "camera",
      iconType: "Ionicons",
      bgColor: "#6B3AA0",
    },
  ];

  const featuredProducts = [
    {
      id: 1,
      name: "Summer Collection",
      price: "$29.99",
      originalPrice: "$49.99",
      discount: "Save $20",
      image: require("../assets/images/img1.png"),
    },
    {
      id: 2,
      name: "Trendy Outfits",
      price: "$39.99",
      originalPrice: "$59.99",
      discount: "Save $20",
      image: require("../assets/images/img2.png"),
    },
  ];

  useEffect(() => {
    // Auto-slide hero images
    slideInterval.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);

    return () => {
      if (slideInterval.current) {
        clearInterval(slideInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    // Scroll to current slide
    if (slideRef.current) {
      slideRef.current.scrollToOffset({
        offset: currentSlide * width,
        animated: true,
      });
    }
  }, [currentSlide]);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const handleCategoryPress = (category) => {
    navigation.navigate("categoryListingScreen", {
      category: category.name,
      categoryId: category.id,
    });
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate("marketplaceSearchScreen", { query: searchQuery });
    }
  };

  const renderHeroSlide = ({ item }) => (
    <TouchableOpacity
      style={styles.heroSlide}
      activeOpacity={0.9}
      onPress={() => console.log("Hero slide pressed:", item.title)}
    >
      <LinearGradient
        colors={item.gradient}
        style={styles.heroGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {item.badge && (
          <View style={styles.heroBadge}>
            <Ionicons name="time-outline" size={16} color={Colors.white} />
            <Text style={styles.heroBadgeText}>{item.badge}</Text>
          </View>
        )}
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>{item.title}</Text>
          <View style={styles.heroSubtitleContainer}>
            <Text style={styles.heroSubtitle}>{item.subtitle}</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.white} />
          </View>
        </View>
        <Image source={item.image} style={styles.heroImage} />
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderCategory = ({ item, index }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(item)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={item.bgColor}
        style={styles.categoryGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.categoryName}>{item.name}</Text>
        {item.image && (
          <Image source={item.image} style={styles.categoryImage} />
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderFeature = ({ item }) => (
    <TouchableOpacity style={styles.featureCard} activeOpacity={0.8}>
      <View
        style={[styles.featureIconContainer, { backgroundColor: item.bgColor }]}
      >
        {item.iconType === "Ionicons" ? (
          <Ionicons name={item.icon} size={24} color={Colors.white} />
        ) : item.iconType === "MaterialIcons" ? (
          <MaterialIcons name={item.icon} size={24} color={Colors.white} />
        ) : (
          <FontAwesome5 name={item.icon} size={24} color={Colors.white} />
        )}
      </View>
      <View style={styles.featureTextContainer}>
        <Text style={styles.featureTitle}>{item.title}</Text>
        {item.subtitle && (
          <Text style={styles.featureSubtitle}>{item.subtitle}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.lightGrey} />
    </TouchableOpacity>
  );

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() =>
        navigation.navigate("productDetailScreen", { productId: item.id })
      }
      activeOpacity={0.8}
    >
      {item.discount && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{item.discount}</Text>
        </View>
      )}
      <Image source={item.image} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>{item.price}</Text>
          <Text style={styles.originalPrice}>{item.originalPrice}</Text>
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
        <Text style={styles.headerTitle}>Marketplace</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="cart-outline" size={24} color={Colors.black} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Box */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={Colors.lightGrey} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor={Colors.lightGrey}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Hero Slider */}
        <View style={styles.heroContainer}>
          <FlatList
            ref={slideRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            data={heroSlides}
            renderItem={renderHeroSlide}
            keyExtractor={(item) => item.id.toString()}
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.round(
                event.nativeEvent.contentOffset.x / width
              );
              setCurrentSlide(newIndex);
            }}
          />
          {/* Slide Indicators */}
          <View style={styles.slideIndicators}>
            {heroSlides.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setCurrentSlide(index)}
                style={[
                  styles.indicator,
                  index === currentSlide && styles.activeIndicator,
                ]}
              />
            ))}
          </View>
        </View>
        {/* Main Categories Grid */}
        <View style={styles.categoriesGrid}>
          {categories.slice(0, 4).map((category, index) => (
            <View key={category.id} style={styles.categoryCard}>
              <TouchableOpacity
                style={styles.categoryTouchable}
                onPress={() => handleCategoryPress(category)}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={category.bgColor}
                  style={styles.categoryGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <View />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Try Something New Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Try something new</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.black} />
          </View>
          <Text style={styles.sectionSubtitle}>
            Discover more ways to shop with Minis
          </Text>
          <View style={styles.featuresContainer}>
            {tryNewFeatures.map((feature) => (
              <TouchableOpacity
                key={feature.id}
                style={styles.featureCard}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.featureIconContainer,
                    { backgroundColor: feature.bgColor },
                  ]}
                >
                  {feature.iconType === "Ionicons" ? (
                    <Ionicons
                      name={feature.icon}
                      size={20}
                      color={Colors.white}
                    />
                  ) : (
                    <FontAwesome5
                      name={feature.icon}
                      size={20}
                      color={Colors.white}
                    />
                  )}
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  {feature.subtitle && (
                    <Text style={styles.featureSubtitle}>
                      {feature.subtitle}
                    </Text>
                  )}
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={Colors.lightGrey}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Women Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Women</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.black} />
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={featuredProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* More Categories */}
        <View style={styles.categoriesGrid}>
          {categories.slice(4, 8).map((category, index) => (
            <View key={category.id} style={styles.categoryCard}>
              <TouchableOpacity
                style={styles.categoryTouchable}
                onPress={() => handleCategoryPress(category)}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={category.bgColor}
                  style={styles.categoryGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <View />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Additional Categories */}
        <View style={styles.categoriesGrid}>
          {moreCategories.map((category, index) => (
            <View key={category.id} style={styles.categoryCard}>
              <TouchableOpacity
                style={styles.categoryTouchable}
                onPress={() => handleCategoryPress(category)}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={category.bgColor}
                  style={styles.categoryGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <View />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Bottom Spacing for Tab Bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Bottom Tab Bar */}
      <View style={styles.bottomTabContainer}>
        <View style={styles.bottomTab}>
          <TouchableOpacity style={styles.tabButton} activeOpacity={0.8}>
            <Ionicons name="home" size={24} color={Colors.black} />
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
    marginLeft: Default.fixPadding,
  },
  headerRight: {
    flexDirection: "row",
  },
  headerButton: {
    padding: Default.fixPadding * 0.5,
  },
  searchContainer: {
    paddingHorizontal: Default.fixPadding * 1.2,
    paddingVertical: Default.fixPadding,
    backgroundColor: Colors.white,
  },
  searchBox: {
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
    ...Fonts.SemiBold14black,
    color: Colors.black,
  },
  heroContainer: {
    height: width * 0.5,
    marginBottom: Default.fixPadding,
  },
  heroSlide: {
    width: width,
    height: width * 0.5,
  },
  heroGradient: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  heroBadge: {
    position: "absolute",
    top: Default.fixPadding,
    left: Default.fixPadding * 1.2,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    paddingHorizontal: Default.fixPadding,
    paddingVertical: Default.fixPadding * 0.5,
    borderRadius: 20,
    zIndex: 2,
  },
  heroBadgeText: {
    ...Fonts.SemiBold12white,
    color: Colors.white,
    marginLeft: Default.fixPadding * 0.3,
  },
  heroContent: {
    position: "absolute",
    bottom: Default.fixPadding * 2,
    left: Default.fixPadding * 1.5,
    right: Default.fixPadding * 1.5,
    zIndex: 2,
  },
  heroTitle: {
    ...Fonts.Bold24white,
    color: Colors.white,
    fontSize: 28,
    marginBottom: Default.fixPadding * 0.5,
  },
  heroSubtitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroSubtitle: {
    ...Fonts.Regular16white,
    color: Colors.white,
    opacity: 0.9,
  },
  heroImage: {
    position: "absolute",
    right: -50,
    bottom: -50,
    width: width * 0.6,
    height: width * 0.6,
    opacity: 0.3,
    transform: [{ rotate: "15deg" }],
  },
  slideIndicators: {
    position: "absolute",
    bottom: Default.fixPadding,
    alignSelf: "center",
    flexDirection: "row",
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: Colors.white,
    width: 20,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Default.fixPadding * 0.5,
    marginTop: Default.fixPadding,
  },
  categoryCard: {
    width: (width - Default.fixPadding * 2) / 2,
    height: (width - Default.fixPadding * 2) / 2 * 0.55,
    paddingHorizontal: Default.fixPadding * 0.5,
    paddingBottom: Default.fixPadding,
  },
  categoryTouchable: {
    flex: 1,
    borderRadius: 15,
    overflow: "hidden",
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
  },
  categoryImage: {
    position: "absolute",
    right: 10,
    bottom: 10,
    width: 60,
    height: 60,
    opacity: 0.3,
  },
  section: {
    marginTop: Default.fixPadding * 2,
    paddingHorizontal: Default.fixPadding * 1.2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Default.fixPadding * 0.5,
  },
  sectionTitle: {
    ...Fonts.Bold18black,
    color: Colors.black,
  },
  sectionSubtitle: {
    ...Fonts.Regular14grey,
    color: Colors.grey,
    marginBottom: Default.fixPadding,
  },
  featuresContainer: {
    marginTop: Default.fixPadding,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    padding: Default.fixPadding,
    marginBottom: Default.fixPadding,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  featureTextContainer: {
    flex: 1,
    marginLeft: Default.fixPadding,
  },
  featureTitle: {
    ...Fonts.SemiBold16black,
    color: Colors.black,
  },
  featureSubtitle: {
    ...Fonts.Regular12grey,
    color: Colors.grey,
    marginTop: 2,
  },
  horizontalList: {
    paddingVertical: Default.fixPadding,
  },
  productCard: {
    width: width * 0.45,
    marginRight: Default.fixPadding,
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  discountBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#6B3AA0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 1,
  },
  discountText: {
    ...Fonts.SemiBold12white,
    color: Colors.white,
  },
  productImage: {
    width: "100%",
    height: width * 0.45,
    resizeMode: "cover",
  },
  productInfo: {
    padding: Default.fixPadding,
  },
  productName: {
    ...Fonts.SemiBold14black,
    color: Colors.black,
    marginBottom: Default.fixPadding * 0.5,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  productPrice: {
    ...Fonts.Bold16black,
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

export default MarketplaceHomeScreen;
