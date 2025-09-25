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

const RadianceRoutineScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRoutineStep, setSelectedRoutineStep] = useState(0);

  // Fetch beauty/skincare products
  const { data: productsData, isLoading, error, refetch } = useProducts({
    search: "skincare beauty",
    sort: "rating",
    limit: 15,
  });

  const routineSteps = [
    {
      id: 1,
      title: "Cleanse",
      description: "Start with a gentle cleanser to remove impurities",
      icon: "water",
      color: "#4ECDC4",
      time: "Morning & Evening",
    },
    {
      id: 2,
      title: "Tone",
      description: "Balance your skin's pH with a toner",
      icon: "leaf",
      color: "#56AB2F",
      time: "Morning & Evening",
    },
    {
      id: 3,
      title: "Treat",
      description: "Apply serums for targeted skin concerns",
      icon: "medical",
      color: "#9370DB",
      time: "Morning or Evening",
    },
    {
      id: 4,
      title: "Moisturize",
      description: "Hydrate and protect your skin barrier",
      icon: "heart",
      color: "#FF6B6B",
      time: "Morning & Evening",
    },
    {
      id: 5,
      title: "Protect",
      description: "Shield your skin with SPF during the day",
      icon: "sunny",
      color: "#FFD700",
      time: "Morning Only",
    },
  ];

  const skincareTips = [
    {
      id: 1,
      title: "Consistency is Key",
      description: "Stick to your routine for at least 4-6 weeks to see results",
      icon: "calendar",
    },
    {
      id: 2,
      title: "Patch Test First",
      description: "Always test new products on a small area before full application",
      icon: "checkmark-circle",
    },
    {
      id: 3,
      title: "Less is More",
      description: "Start with fewer products and gradually build your routine",
      icon: "remove-circle",
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error("Error refreshing radiance routine:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const renderRoutineStep = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.routineStepCard,
        selectedRoutineStep === index && styles.selectedStepCard,
      ]}
      onPress={() => setSelectedRoutineStep(index)}
      activeOpacity={0.8}
    >
      <View style={[styles.stepIconContainer, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon} size={24} color={Colors.white} />
      </View>
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>{item.title}</Text>
        <Text style={styles.stepDescription}>{item.description}</Text>
        <Text style={styles.stepTime}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() =>
        navigation.navigate("productDetailScreen", {
          productId: item.id,
          product: item,
        })
      }
      activeOpacity={0.8}
    >
      <Image 
        source={item.images && item.images.length > 0 ? { uri: item.images[0] } : require("../assets/images/img1.png")} 
        style={styles.productImage} 
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {String(item.name || "Product")}
        </Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={12} color="#FFD700" />
          <Text style={styles.ratingText}>
            {(item.rating || 4.5).toFixed(1)} ({item.review_count || 100})
          </Text>
        </View>
        <Text style={styles.productPrice}>${parseFloat(item.price || 0).toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderTip = ({ item }) => (
    <View style={styles.tipCard}>
      <View style={styles.tipIconContainer}>
        <Ionicons name={item.icon} size={20} color="#9370DB" />
      </View>
      <View style={styles.tipContent}>
        <Text style={styles.tipTitle}>{item.title}</Text>
        <Text style={styles.tipDescription}>{item.description}</Text>
      </View>
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
        <Text style={styles.headerTitle}>Radiance Routine</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Ionicons name="sparkles" size={32} color="#9370DB" />
          <Text style={styles.heroTitle}>Your Path to Radiant Skin</Text>
          <Text style={styles.heroSubtitle}>
            Discover the perfect skincare routine tailored for glowing, healthy skin
          </Text>
        </View>

        {/* Routine Steps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5-Step Skincare Routine</Text>
          <FlatList
            data={routineSteps}
            renderItem={renderRoutineStep}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.routineStepsList}
          />
        </View>

        {/* Recommended Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended Products</Text>
          {isLoading && !productsData ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading skincare products...</Text>
            </View>
          ) : (
            <FlatList
              data={productsData || []}
              renderItem={renderProduct}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsList}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Ionicons name="leaf-outline" size={48} color={Colors.lightGrey} />
                  <Text style={styles.emptyText}>No skincare products available</Text>
                </View>
              )}
            />
          )}
        </View>

        {/* Skincare Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pro Tips</Text>
          <FlatList
            data={skincareTips}
            renderItem={renderTip}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.tipsList}
          />
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
    backgroundColor: "#F8F4FF",
    paddingVertical: Default.fixPadding * 2,
    paddingHorizontal: Default.fixPadding * 1.2,
    alignItems: "center",
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
  section: {
    padding: Default.fixPadding * 1.2,
  },
  sectionTitle: {
    ...Fonts.Bold16black,
    color: Colors.black,
    marginBottom: Default.fixPadding,
    fontWeight: "bold",
  },
  routineStepsList: {
    paddingBottom: Default.fixPadding,
  },
  routineStepCard: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Default.fixPadding,
    marginBottom: Default.fixPadding,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  selectedStepCard: {
    borderColor: "#9370DB",
    borderWidth: 2,
  },
  stepIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Default.fixPadding,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    ...Fonts.Bold14black,
    color: Colors.black,
    marginBottom: Default.fixPadding * 0.3,
  },
  stepDescription: {
    ...Fonts.Regular12grey,
    color: Colors.grey,
    marginBottom: Default.fixPadding * 0.3,
    lineHeight: 16,
  },
  stepTime: {
    ...Fonts.SemiBold10primary,
    color: "#9370DB",
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
    paddingVertical: Default.fixPadding,
  },
  productCard: {
    width: width * 0.4,
    marginRight: Default.fixPadding,
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  productImage: {
    width: "100%",
    height: width * 0.4,
    resizeMode: "cover",
  },
  productInfo: {
    padding: Default.fixPadding,
  },
  productName: {
    ...Fonts.SemiBold12black,
    color: Colors.black,
    marginBottom: Default.fixPadding * 0.3,
    fontWeight: "bold",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Default.fixPadding * 0.3,
  },
  ratingText: {
    ...Fonts.Regular10grey,
    color: Colors.grey,
    marginLeft: 4,
  },
  productPrice: {
    ...Fonts.Bold12black,
    color: Colors.black,
  },
  tipsList: {
    paddingBottom: Default.fixPadding,
  },
  tipCard: {
    flexDirection: "row",
    backgroundColor: "#F8F4FF",
    borderRadius: 12,
    padding: Default.fixPadding,
    marginBottom: Default.fixPadding,
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Default.fixPadding,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    ...Fonts.Bold12black,
    color: Colors.black,
    marginBottom: Default.fixPadding * 0.3,
  },
  tipDescription: {
    ...Fonts.Regular11grey,
    color: Colors.grey,
    lineHeight: 16,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: Default.fixPadding * 2,
  },
  emptyText: {
    ...Fonts.Regular14grey,
    color: Colors.grey,
    marginTop: Default.fixPadding,
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

export default RadianceRoutineScreen;
