import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  StatusBar,
  FlatList,
  Modal,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import { useProduct, useAddToCart } from "../hooks/useMarketplace";
import AwesomeButton from "react-native-really-awesome-button";

const { width, height } = Dimensions.get("window");

const ProductDetailScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { productId, product } = route.params || {};

  // Fetch product details from database
  const { data: fetchedProductData, isLoading, error } = useProduct(productId);
  const addToCartMutation = useAddToCart();
  const scrollViewRef = useRef(null);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [purchaseType, setPurchaseType] = useState("onetime");

  // Mock product data
  const productData = product || {
    id: productId || 1,
    name: "Lip Mask Duo Set - Special Offer!",
    vendor: "My Bee Balm",
    vendorRating: 4.7,
    vendorReviews: 83100,
    rating: 4.7,
    reviews: 32,
    price: 10.00,
    originalPrice: 39.99,
    subscribePrice: 8.00,
    description: "Experience the healing and moisturizing power of honey bee propolis and cherry extract 🍒 🍯 This lip mask is the ultimate solution for dry, chapped lips. Plus, it adds a natural tint for a healthy glow.",
    images: [
      require("../assets/images/img1.png"),
      require("../assets/images/img2.png"),
      require("../assets/images/img3.png"),
    ],
    variants: [
      { id: 1, type: "Tea Type", options: ["18 Tea Bags", "Loose-Leaf - 30g"] },
    ],
  };

  // Ensure images array exists
  if (!productData.images || !Array.isArray(productData.images)) {
    productData.images = [require("../assets/images/img1.png")];
  }

  // Ensure all price values are numbers
  productData.price = Number(productData.price) || 0;
  productData.originalPrice = Number(productData.originalPrice) || 0;
  productData.subscribePrice = Number(productData.subscribePrice) || 0;

  const relatedProducts = [
    {
      id: 2,
      name: "Honey Bee Balm",
      price: 5.00,
      originalPrice: 19.99,
      discount: "75% off",
      image: require("../assets/images/img4.png"),
    },
    {
      id: 3,
      name: "Strawberry Bee Balm",
      price: 5.00,
      originalPrice: 19.99,
      discount: "75% off",
      image: require("../assets/images/img5.png"),
    },
  ].map(p => ({
    ...p,
    price: Number(p.price) || 0,
    originalPrice: Number(p.originalPrice) || 0
  }));

  const reviews = [
    {
      id: 1,
      author: "Inarose",
      date: "Yesterday",
      rating: 5,
      text: "Cute little size perfect for my purse. Soft flavor for days when you don't want something too sweet.",
    },
    {
      id: 2,
      author: "Catherine",
      date: "2 days ago",
      rating: 5,
      text: "Happy with product. Great quality and fast shipping!",
    },
  ];

  const handleAddToCart = async () => {
    try {
      await addToCartMutation.mutateAsync({
        productId: productData.id,
        quantity: quantity,
        variantOptions: selectedVariant,
      });
      
      // Show success message or navigate to cart
      alert("Product added to cart successfully!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add product to cart. Please try again.");
    }
  };

  const handleBuyNow = () => {
    // Buy now logic - go directly to checkout
    navigation.navigate("deliveryAddressScreen", {
      items: [{
        ...productData,
        quantity,
        selectedVariant,
      }],
      totalAmount: productData.price * quantity,
    });
  };

  const renderImage = ({ item, index }) => (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => setSelectedImageIndex(index)}
    >
      <Image source={item} style={styles.productImage} />
    </TouchableOpacity>
  );

  const renderRelatedProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.relatedProductCard}
      onPress={() =>
        navigation.push("productDetailScreen", {
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
      <Image source={item.image} style={styles.relatedProductImage} />
      <View style={styles.relatedProductInfo}>
        <Text style={styles.relatedProductName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.priceContainer}>
          <Text style={styles.relatedProductPrice}>
            US${(Number(item.price) || 0).toFixed(2)}
          </Text>
          <Text style={styles.originalPrice}>
            US${(Number(item.originalPrice) || 0).toFixed(2)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderReview = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewRating}>
          {[...Array(5)].map((_, i) => (
            <Ionicons
              key={i}
              name="star"
              size={12}
              color={i < item.rating ? "#FFD700" : "#E0E0E0"}
            />
          ))}
        </View>
        <Text style={styles.reviewDate}>{item.date}</Text>
      </View>
      <Text style={styles.reviewText}>{item.text}</Text>
      <Text style={styles.reviewAuthor}>{item.author}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="share-outline" size={24} color={Colors.black} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? Colors.red : Colors.black}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Product Images */}
        <FlatList
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          data={productData.images}
          renderItem={renderImage}
          keyExtractor={(item, index) => index.toString()}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(
              event.nativeEvent.contentOffset.x / width
            );
            setSelectedImageIndex(index);
          }}
        />

        {/* Image Indicators */}
        <View style={styles.imageIndicators}>
          {productData.images && productData.images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === selectedImageIndex && styles.activeIndicator,
              ]}
            />
          ))}
        </View>

        {/* Vendor Info */}
        <TouchableOpacity
          style={styles.vendorSection}
          onPress={() =>
            navigation.navigate("vendorStoreScreen", {
              vendorId: productData.vendor,
            })
          }
          activeOpacity={0.8}
        >
          <View style={styles.vendorLogo}>
            <Text style={styles.vendorInitial}>
              {productData.vendor.charAt(0)}
            </Text>
          </View>
          <View style={styles.vendorInfo}>
            <Text style={styles.vendorName}>{productData.vendor}</Text>
            <View style={styles.vendorRating}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.vendorRatingText}>
                {productData.vendorRating} ({(productData.vendorReviews / 1000).toFixed(1)}K)
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.followButton}>
            <Text style={styles.followButtonText}>Follow</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Product Info */}
        <View style={styles.productSection}>
          <Text style={styles.productName}>{productData.name}</Text>
          <View style={styles.productRating}>
            {[...Array(5)].map((_, i) => (
              <Ionicons
                key={i}
                name="star"
                size={16}
                color={i < Math.floor(productData.rating) ? "#FFD700" : "#E0E0E0"}
              />
            ))}
            <Text style={styles.ratingText}>
              {" "}
              {productData.reviews} ratings
            </Text>
          </View>

          {/* Price */}
          <View style={styles.priceSection}>
            <Text style={styles.currentPrice}>
              ${purchaseType === "subscribe" ? 
                (Number(productData.subscribePrice) || 0).toFixed(2) : 
                (Number(productData.price) || 0).toFixed(2)}
            </Text>
            <Text style={styles.originalPriceDetail}>
              ${(Number(productData.originalPrice) || 0).toFixed(2)}
            </Text>
          </View>

          {/* Variants */}
          {productData.variants && productData.variants.length > 0 && (
            <View style={styles.variantsSection}>
              {productData.variants.map((variant) => (
                <View key={variant.id}>
                  <Text style={styles.variantTitle}>{variant.type}</Text>
                  <View style={styles.variantOptions}>
                    {variant.options.map((option, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.variantButton,
                          selectedVariant === option && styles.selectedVariant,
                        ]}
                        onPress={() => setSelectedVariant(option)}
                      >
                        <Text
                          style={[
                            styles.variantText,
                            selectedVariant === option &&
                              styles.selectedVariantText,
                          ]}
                        >
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={styles.quantityTitle}>Quantity</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => quantity > 1 && setQuantity(quantity - 1)}
              >
                <Ionicons name="remove" size={20} color={Colors.black} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Ionicons name="add" size={20} color={Colors.black} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Purchase Options */}
          <View style={styles.purchaseOptions}>
            <TouchableOpacity
              style={styles.purchaseOption}
              onPress={() => setPurchaseType("onetime")}
            >
              <View style={styles.radioButton}>
                {purchaseType === "onetime" && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
              <View style={styles.purchaseOptionText}>
                <Text style={styles.purchaseOptionTitle}>One time purchase</Text>
                <Text style={styles.purchaseOptionPrice}>
                  ${(Number(productData.price) || 0).toFixed(2)}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.purchaseOption}
              onPress={() => setPurchaseType("subscribe")}
            >
              <View style={styles.radioButton}>
                {purchaseType === "subscribe" && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
              <View style={styles.purchaseOptionText}>
                <Text style={styles.purchaseOptionTitle}>
                  Subscribe & save{" "}
                  <Text style={styles.saveBadge}>Save 20%</Text>
                </Text>
                <Text style={styles.purchaseOptionPrice}>
                  ${(Number(productData.subscribePrice) || 0).toFixed(2)}{" "}
                  <Text style={styles.originalSubscribePrice}>
                    ${(Number(productData.price) || 0).toFixed(2)}
                  </Text>
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <AwesomeButton
              progress
              onPress={(next) => {
                handleAddToCart();
                next();
              }}
              width={width - Default.fixPadding * 2.4}
              height={50}
              backgroundColor="#6B3AA0"
              backgroundDarker="#5A2E8A"
              borderRadius={25}
            >
              <Text style={styles.buttonText}>
                {addToCartMutation.isPending ? "Adding..." : "Add to cart"}
              </Text>
            </AwesomeButton>

            <View style={{ height: Default.fixPadding }} />

            <AwesomeButton
              progress
              onPress={(next) => {
                handleBuyNow();
                next();
              }}
              width={width - Default.fixPadding * 2.4}
              height={50}
              backgroundColor={Colors.black}
              backgroundDarker="#333"
              borderRadius={25}
            >
              <Text style={styles.buttonText}>Buy now</Text>
            </AwesomeButton>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              {productData.description}
            </Text>
            <TouchableOpacity>
              <Text style={styles.readMore}>Read more</Text>
            </TouchableOpacity>
          </View>

          {/* Policies */}
          <View style={styles.policiesSection}>
            <TouchableOpacity style={styles.policyButton}>
              <Text style={styles.policyText}>Refund policy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.policyButton}>
              <Text style={styles.policyText}>Shipping policy</Text>
            </TouchableOpacity>
          </View>

          {/* Visit Store */}
          <TouchableOpacity
            style={styles.visitStoreButton}
            onPress={() =>
              navigation.navigate("vendorStoreScreen", {
                vendorId: productData.vendor,
              })
            }
          >
            <Ionicons name="link" size={20} color={Colors.black} />
            <Text style={styles.visitStoreText}>
              Visit {productData.vendor}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Ratings and Reviews */}
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>Ratings and reviews</Text>
          <View style={styles.overallRating}>
            <Text style={styles.ratingNumber}>{productData.rating}</Text>
            <Ionicons name="star" size={24} color="#FFD700" />
          </View>
          <Text style={styles.totalReviews}>{productData.reviews} ratings</Text>

          {/* Rating Bars */}
          <View style={styles.ratingBars}>
            {[5, 4, 3, 2, 1].map((stars) => (
              <View key={stars} style={styles.ratingBar}>
                <Text style={styles.ratingBarLabel}>{stars}</Text>
                <View style={styles.ratingBarTrack}>
                  <View
                    style={[
                      styles.ratingBarFill,
                      { width: stars === 5 ? "80%" : stars === 4 ? "15%" : "5%" },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>

          {/* Sample Reviews */}
          {reviews.slice(0, 2).map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewRating}>
                  {[...Array(5)].map((_, i) => (
                    <Ionicons
                      key={i}
                      name="star"
                      size={12}
                      color={i < review.rating ? "#FFD700" : "#E0E0E0"}
                    />
                  ))}
                </View>
              </View>
              <Text style={styles.reviewText}>{review.text}</Text>
              <Text style={styles.reviewAuthor}>
                {review.author} · {review.date}
              </Text>
            </View>
          ))}

          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => setShowReviews(true)}
          >
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        </View>

        {/* More from Vendor */}
        <View style={styles.moreSection}>
          <View style={styles.moreSectionHeader}>
            <Text style={styles.sectionTitle}>
              More from {productData.vendor}
            </Text>
            <TouchableOpacity>
              <Ionicons name="chevron-forward" size={20} color={Colors.black} />
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={relatedProducts}
            renderItem={renderRelatedProduct}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.relatedProductsList}
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
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerButton: {
    padding: Default.fixPadding * 0.5,
  },
  headerRight: {
    flexDirection: "row",
  },
  scrollContent: {
    paddingTop: Default.fixPadding * 5,
  },
  productImage: {
    width: width,
    height: width,
    resizeMode: "cover",
  },
  imageIndicators: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: Default.fixPadding,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: Colors.black,
  },
  vendorSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: Default.fixPadding * 1.2,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  vendorLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
  },
  vendorInitial: {
    ...Fonts.Bold18white,
    color: Colors.white,
  },
  vendorInfo: {
    flex: 1,
    marginLeft: Default.fixPadding,
  },
  vendorName: {
    ...Fonts.SemiBold16black,
    color: Colors.black,
  },
  vendorRating: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  vendorRatingText: {
    ...Fonts.Regular12grey,
    color: Colors.grey,
    marginLeft: 4,
  },
  followButton: {
    paddingHorizontal: Default.fixPadding * 1.5,
    paddingVertical: Default.fixPadding * 0.5,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
  },
  followButtonText: {
    ...Fonts.SemiBold14black,
    color: Colors.black,
  },
  productSection: {
    padding: Default.fixPadding * 1.2,
  },
  productName: {
    ...Fonts.Bold18black,
    color: Colors.black,
    marginBottom: Default.fixPadding * 0.5,
  },
  productRating: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Default.fixPadding,
  },
  ratingText: {
    ...Fonts.Regular14grey,
    color: Colors.grey,
  },
  priceSection: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: Default.fixPadding * 1.5,
  },
  currentPrice: {
    ...Fonts.Bold24black,
    color: Colors.black,
    marginRight: Default.fixPadding * 0.5,
  },
  originalPriceDetail: {
    ...Fonts.Regular16grey,
    color: Colors.grey,
    textDecorationLine: "line-through",
  },
  variantsSection: {
    marginBottom: Default.fixPadding * 1.5,
  },
  variantTitle: {
    ...Fonts.SemiBold14black,
    color: Colors.black,
    marginBottom: Default.fixPadding * 0.5,
  },
  variantOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  variantButton: {
    paddingHorizontal: Default.fixPadding * 1.2,
    paddingVertical: Default.fixPadding * 0.8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginRight: Default.fixPadding * 0.5,
    marginBottom: Default.fixPadding * 0.5,
  },
  selectedVariant: {
    backgroundColor: Colors.black,
    borderColor: Colors.black,
  },
  variantText: {
    ...Fonts.Regular14black,
    color: Colors.black,
  },
  selectedVariantText: {
    color: Colors.white,
  },
  quantitySection: {
    marginBottom: Default.fixPadding * 1.5,
  },
  quantityTitle: {
    ...Fonts.SemiBold14black,
    color: Colors.black,
    marginBottom: Default.fixPadding * 0.5,
  },
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    ...Fonts.SemiBold16black,
    color: Colors.black,
    marginHorizontal: Default.fixPadding * 1.5,
  },
  purchaseOptions: {
    marginBottom: Default.fixPadding * 1.5,
  },
  purchaseOption: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Default.fixPadding,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.black,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Default.fixPadding,
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.black,
  },
  purchaseOptionText: {
    flex: 1,
  },
  purchaseOptionTitle: {
    ...Fonts.SemiBold14black,
    color: Colors.black,
  },
  purchaseOptionPrice: {
    ...Fonts.Regular14black,
    color: Colors.black,
  },
  saveBadge: {
    backgroundColor: Colors.black,
    color: Colors.white,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    ...Fonts.SemiBold10white,
  },
  originalSubscribePrice: {
    textDecorationLine: "line-through",
    color: Colors.grey,
  },
  actionButtons: {
    marginBottom: Default.fixPadding * 2,
  },
  buttonText: {
    ...Fonts.SemiBold16white,
    color: Colors.white,
  },
  descriptionSection: {
    marginBottom: Default.fixPadding * 1.5,
  },
  sectionTitle: {
    ...Fonts.Bold16black,
    color: Colors.black,
    marginBottom: Default.fixPadding * 0.5,
  },
  descriptionText: {
    ...Fonts.Regular14black,
    color: Colors.black,
    lineHeight: 20,
  },
  readMore: {
    ...Fonts.SemiBold14primary,
    color: "#6B3AA0",
    marginTop: Default.fixPadding * 0.5,
  },
  policiesSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: Default.fixPadding * 1.5,
  },
  policyButton: {
    padding: Default.fixPadding,
  },
  policyText: {
    ...Fonts.SemiBold14black,
    color: Colors.black,
  },
  visitStoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Default.fixPadding,
    marginBottom: Default.fixPadding * 2,
  },
  visitStoreText: {
    ...Fonts.SemiBold14black,
    color: Colors.black,
    marginLeft: Default.fixPadding * 0.5,
  },
  reviewsSection: {
    padding: Default.fixPadding * 1.2,
    borderTopWidth: 8,
    borderTopColor: "#F5F5F5",
  },
  overallRating: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Default.fixPadding * 0.5,
  },
  ratingNumber: {
    ...Fonts.Bold32black,
    color: Colors.black,
    marginRight: Default.fixPadding * 0.5,
  },
  totalReviews: {
    ...Fonts.Regular14grey,
    color: Colors.grey,
    marginBottom: Default.fixPadding,
  },
  ratingBars: {
    marginBottom: Default.fixPadding * 1.5,
  },
  ratingBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Default.fixPadding * 0.3,
  },
  ratingBarLabel: {
    ...Fonts.Regular12black,
    color: Colors.black,
    width: 20,
  },
  ratingBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    marginLeft: Default.fixPadding * 0.5,
  },
  ratingBarFill: {
    height: 8,
    backgroundColor: Colors.black,
    borderRadius: 4,
  },
  reviewCard: {
    marginBottom: Default.fixPadding * 1.5,
    paddingBottom: Default.fixPadding,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Default.fixPadding * 0.5,
  },
  reviewRating: {
    flexDirection: "row",
  },
  reviewDate: {
    ...Fonts.Regular12grey,
    color: Colors.grey,
  },
  reviewText: {
    ...Fonts.Regular14black,
    color: Colors.black,
    lineHeight: 20,
    marginBottom: Default.fixPadding * 0.5,
  },
  reviewAuthor: {
    ...Fonts.Regular12grey,
    color: Colors.grey,
  },
  viewAllButton: {
    alignSelf: "center",
    paddingVertical: Default.fixPadding,
  },
  viewAllText: {
    ...Fonts.SemiBold14black,
    color: Colors.black,
  },
  moreSection: {
    padding: Default.fixPadding * 1.2,
    borderTopWidth: 8,
    borderTopColor: "#F5F5F5",
  },
  moreSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Default.fixPadding,
  },
  relatedProductsList: {
    paddingVertical: Default.fixPadding,
  },
  relatedProductCard: {
    width: width * 0.4,
    marginRight: Default.fixPadding,
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  relatedProductImage: {
    width: "100%",
    height: width * 0.4,
    resizeMode: "cover",
  },
  relatedProductInfo: {
    padding: Default.fixPadding,
  },
  relatedProductName: {
    ...Fonts.SemiBold12black,
    color: Colors.black,
    marginBottom: Default.fixPadding * 0.3,
  },
  relatedProductPrice: {
    ...Fonts.Bold14black,
    color: Colors.black,
    marginRight: Default.fixPadding * 0.5,
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
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

export default ProductDetailScreen;
