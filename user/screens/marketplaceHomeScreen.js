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

  const categories = [
    {
      id: 1,
      name: "Baby & toddler",
      icon: "baby-carriage",
      iconType: "FontAwesome5",
      bgColor: ["#FFB6C1", "#FFC0CB"],
      image: require("../assets/images/community1.png"),
    },
    {
      id: 2,
      name: "Home",
      icon: "home",
      iconType: "Ionicons",
      bgColor: ["#8FBC8F", "#90EE90"],
      image: require("../assets/images/community2.png"),
    },
    {
      id: 3,
      name: "Fitness & nutrition",
      icon: "fitness-center",
      iconType: "MaterialIcons",
      bgColor: ["#87CEEB", "#B0E0E6"],
      image: require("../assets/images/community3.png"),
    },
    {
      id: 4,
      name: "Accessories",
      icon: "glasses",
      iconType: "FontAwesome5",
      bgColor: ["#8B8C0A", "#9ACD32"],
      image: require("../assets/images/community4.png"),
    },
    {
      id: 5,
      name: "Beauty",
      icon: "spa",
      iconType: "MaterialIcons",
      bgColor: ["#CD853F", "#DEB887"],
      image: require("../assets/images/community5.png"),
    },
    {
      id: 6,
      name: "Food & drinks",
      icon: "restaurant",
      iconType: "Ionicons",
      bgColor: ["#BC8F8F", "#F4A460"],
      image: require("../assets/images/community6.png"),
    },
    {
      id: 7,
      name: "Pet supplies",
      icon: "paw",
      iconType: "FontAwesome5",
      bgColor: ["#D2B48C", "#F5DEB3"],
      image: require("../assets/images/community7.png"),
    },
    {
      id: 8,
      name: "Toys & games",
      icon: "game-controller",
      iconType: "Ionicons",
      bgColor: ["#9370DB", "#BA55D3"],
      image: require("../assets/images/community8.png"),
    },
  ];

  const moreCategories = [
    {
      id: 9,
      name: "Electronics",
      icon: "laptop",
      iconType: "FontAwesome5",
      bgColor: ["#2F4F4F", "#696969"],
    },
    {
      id: 10,
      name: "Arts & crafts",
      icon: "palette",
      iconType: "MaterialIcons",
      bgColor: ["#808080", "#A9A9A9"],
    },
    {
      id: 11,
      name: "Luggage & bags",
      icon: "briefcase",
      iconType: "FontAwesome5",
      bgColor: ["#C0C0C0", "#D3D3D3"],
    },
    {
      id: 12,
      name: "Sporting goods",
      icon: "football",
      iconType: "Ionicons",
      bgColor: ["#4682B4", "#87CEEB"],
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
      
      {/* Search Header */}
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
        {/* Main Categories Grid */}
        <View style={styles.categoriesGrid}>
          {categories.slice(0, 4).map((category, index) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => handleCategoryPress(category)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={category.bgColor}
                style={styles.categoryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.categoryName}>{category.name}</Text>
              </LinearGradient>
            </TouchableOpacity>
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
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => handleCategoryPress(category)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={category.bgColor}
                style={styles.categoryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.categoryName}>{category.name}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Additional Categories */}
        <View style={styles.categoriesGrid}>
          {moreCategories.map((category, index) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => handleCategoryPress(category)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={category.bgColor}
                style={styles.categoryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.categoryName}>{category.name}</Text>
              </LinearGradient>
            </TouchableOpacity>
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
  searchContainer: {
    paddingHorizontal: Default.fixPadding * 1.2,
    paddingTop: Default.fixPadding * 3,
    paddingBottom: Default.fixPadding,
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
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Default.fixPadding,
    marginTop: Default.fixPadding,
  },
  categoryCard: {
    width: (width - Default.fixPadding * 3) / 2,
    height: (width - Default.fixPadding * 3) / 2 * 0.6,
    margin: Default.fixPadding * 0.5,
    borderRadius: 12,
    overflow: "hidden",
  },
  categoryGradient: {
    flex: 1,
    padding: Default.fixPadding,
    justifyContent: "flex-end",
  },
  categoryName: {
    ...Fonts.SemiBold16white,
    color: Colors.white,
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
