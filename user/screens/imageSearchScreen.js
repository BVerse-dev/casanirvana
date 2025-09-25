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
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { useProducts } from "../hooks/useMarketplace";

const { width, height } = Dimensions.get("window");

const ImageSearchScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);

  // Fetch all products for search matching
  const { data: allProducts } = useProducts({ limit: 100 });

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Camera and photo library access are needed for image search functionality.',
        [{ text: 'OK' }]
      );
    }
  };

  const pickImageFromCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
        analyzeImage(imageUri);
      }
    } catch (error) {
      console.error('Error picking image from camera:', error);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
        analyzeImage(imageUri);
      }
    } catch (error) {
      console.error('Error picking image from gallery:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const analyzeImage = async (imageUri) => {
    setIsAnalyzing(true);
    setSearchResults([]);
    
    try {
      // Simulate image analysis and product matching
      // In a real app, this would use AI/ML services like Google Vision API, AWS Rekognition, etc.
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // Mock analysis results - match products based on categories
      const mockResults = allProducts ? allProducts.slice(0, 8) : [];
      setSearchResults(mockResults);
      
      // Add to recent searches
      const newSearch = {
        id: Date.now(),
        image: imageUri,
        timestamp: new Date(),
        resultsCount: mockResults.length,
      };
      setRecentSearches(prev => [newSearch, ...prev.slice(0, 4)]);
      
    } catch (error) {
      console.error('Error analyzing image:', error);
      Alert.alert('Error', 'Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearSearch = () => {
    setSelectedImage(null);
    setSearchResults([]);
    setIsAnalyzing(false);
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
      <Image 
        source={item.images && item.images.length > 0 ? { uri: item.images[0] } : require("../assets/images/img1.png")} 
        style={styles.resultImage} 
      />
      <View style={styles.resultInfo}>
        <Text style={styles.resultName} numberOfLines={2}>
          {String(item.name || "Product")}
        </Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={12} color="#FFD700" />
          <Text style={styles.ratingText}>
            {(item.rating || 4.5).toFixed(1)}
          </Text>
        </View>
        <Text style={styles.resultPrice}>${parseFloat(item.price || 0).toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderRecentSearch = ({ item }) => (
    <TouchableOpacity
      style={styles.recentSearchCard}
      onPress={() => {
        setSelectedImage(item.image);
        analyzeImage(item.image);
      }}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image }} style={styles.recentSearchImage} />
      <View style={styles.recentSearchInfo}>
        <Text style={styles.recentSearchCount}>
          {String(item.resultsCount || 0)} products found
        </Text>
        <Text style={styles.recentSearchTime}>
          {item.timestamp ? item.timestamp.toLocaleDateString() : "Recent"}
        </Text>
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
        <Text style={styles.headerTitle}>Image Search</Text>
        {selectedImage && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Ionicons name="close" size={24} color={Colors.black} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {!selectedImage ? (
          <>
            {/* Hero Section */}
            <View style={styles.heroSection}>
              <Ionicons name="camera" size={64} color="#6B3AA0" />
              <Text style={styles.heroTitle}>Search and Shop Your Pics</Text>
              <Text style={styles.heroSubtitle}>
                Take a photo or upload an image to find similar products in our marketplace
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsSection}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cameraButton]}
                onPress={pickImageFromCamera}
                activeOpacity={0.8}
              >
                <Ionicons name="camera" size={32} color={Colors.white} />
                <Text style={styles.actionButtonText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.galleryButton]}
                onPress={pickImageFromGallery}
                activeOpacity={0.8}
              >
                <Ionicons name="images" size={32} color={Colors.white} />
                <Text style={styles.actionButtonText}>Choose from Gallery</Text>
              </TouchableOpacity>
            </View>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Searches</Text>
                <FlatList
                  data={recentSearches}
                  renderItem={renderRecentSearch}
                  keyExtractor={(item) => item.id.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.recentSearchesList}
                />
              </View>
            )}

            {/* How It Works */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How It Works</Text>
              <View style={styles.stepsContainer}>
                <View style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>1</Text>
                  </View>
                  <Text style={styles.stepText}>Take a photo or select from gallery</Text>
                </View>
                <View style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>2</Text>
                  </View>
                  <Text style={styles.stepText}>AI analyzes your image</Text>
                </View>
                <View style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>3</Text>
                  </View>
                  <Text style={styles.stepText}>Find similar products to shop</Text>
                </View>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Selected Image */}
            <View style={styles.selectedImageSection}>
              <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
            </View>

            {/* Analysis State */}
            {isAnalyzing ? (
              <View style={styles.analyzingSection}>
                <ActivityIndicator size="large" color="#6B3AA0" />
                <Text style={styles.analyzingText}>Analyzing your image...</Text>
                <Text style={styles.analyzingSubtext}>Finding similar products</Text>
              </View>
            ) : (
              <>
                {/* Search Results */}
                {searchResults.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                      Found {searchResults.length} similar products
                    </Text>
                    <FlatList
                      data={searchResults}
                      renderItem={renderSearchResult}
                      keyExtractor={(item) => item.id.toString()}
                      numColumns={2}
                      scrollEnabled={false}
                      contentContainerStyle={styles.resultsList}
                    />
                  </View>
                )}
              </>
            )}
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
  clearButton: {
    padding: Default.fixPadding * 0.5,
  },
  heroSection: {
    paddingVertical: Default.fixPadding * 3,
    paddingHorizontal: Default.fixPadding * 1.2,
    alignItems: "center",
    backgroundColor: "#F8F4FF",
  },
  heroTitle: {
    ...Fonts.Bold22black,
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
    maxWidth: width * 0.8,
  },
  actionsSection: {
    padding: Default.fixPadding * 1.2,
    gap: Default.fixPadding,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Default.fixPadding * 1.5,
    borderRadius: 12,
    gap: Default.fixPadding,
  },
  cameraButton: {
    backgroundColor: "#6B3AA0",
  },
  galleryButton: {
    backgroundColor: "#4ECDC4",
  },
  actionButtonText: {
    ...Fonts.Bold16white,
    color: Colors.white,
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
  recentSearchesList: {
    paddingVertical: Default.fixPadding * 0.5,
  },
  recentSearchCard: {
    width: 120,
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
  recentSearchImage: {
    width: "100%",
    height: 80,
    resizeMode: "cover",
  },
  recentSearchInfo: {
    padding: Default.fixPadding * 0.5,
  },
  recentSearchCount: {
    ...Fonts.SemiBold10black,
    color: Colors.black,
  },
  recentSearchTime: {
    ...Fonts.Regular10grey,
    color: Colors.grey,
  },
  stepsContainer: {
    gap: Default.fixPadding,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Default.fixPadding,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#6B3AA0",
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    ...Fonts.Bold14white,
    color: Colors.white,
  },
  stepText: {
    ...Fonts.Regular14black,
    color: Colors.black,
    flex: 1,
  },
  selectedImageSection: {
    padding: Default.fixPadding * 1.2,
    alignItems: "center",
  },
  selectedImage: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 12,
    resizeMode: "cover",
  },
  analyzingSection: {
    paddingVertical: Default.fixPadding * 2,
    alignItems: "center",
  },
  analyzingText: {
    ...Fonts.Bold16black,
    color: Colors.black,
    marginTop: Default.fixPadding,
  },
  analyzingSubtext: {
    ...Fonts.Regular14grey,
    color: Colors.grey,
    marginTop: Default.fixPadding * 0.5,
  },
  resultsList: {
    gap: Default.fixPadding,
  },
  resultCard: {
    width: (width - Default.fixPadding * 3.4) / 2,
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
  resultImage: {
    width: "100%",
    height: (width - Default.fixPadding * 3.4) / 2,
    resizeMode: "cover",
  },
  resultInfo: {
    padding: Default.fixPadding,
  },
  resultName: {
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
  resultPrice: {
    ...Fonts.Bold12black,
    color: Colors.black,
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

export default ImageSearchScreen;
