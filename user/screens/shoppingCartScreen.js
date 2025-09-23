import React from "react";
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
  Alert,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import { useCart, useUpdateCartItem, useRemoveFromCart, useClearCart } from "../hooks/useMarketplace";
import AwesomeButton from "react-native-really-awesome-button";

const { width, height } = Dimensions.get("window");

const ShoppingCartScreen = ({ navigation }) => {
  const { t } = useTranslation();
  
  // Cart hooks
  const { data: cartItems, isLoading, error, refetch } = useCart();
  const updateCartItemMutation = useUpdateCartItem();
  const removeFromCartMutation = useRemoveFromCart();
  const clearCartMutation = useClearCart();

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    
    try {
      await updateCartItemMutation.mutateAsync({
        cartItemId: itemId,
        quantity: newQuantity,
      });
    } catch (error) {
      console.error("Error updating cart item:", error);
      Alert.alert("Error", "Failed to update item quantity");
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeFromCartMutation.mutateAsync(itemId);
    } catch (error) {
      console.error("Error removing cart item:", error);
      Alert.alert("Error", "Failed to remove item from cart");
    }
  };

  const handleClearCart = () => {
    Alert.alert(
      "Clear Cart",
      "Are you sure you want to remove all items from your cart?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await clearCartMutation.mutateAsync();
            } catch (error) {
              console.error("Error clearing cart:", error);
              Alert.alert("Error", "Failed to clear cart");
            }
          },
        },
      ]
    );
  };

  const calculateSubtotal = () => {
    if (!cartItems || cartItems.length === 0) return 0;
    return cartItems.reduce((total, item) => {
      const price = Number(item.product?.price || 0);
      return total + (price * item.quantity);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const renderCartItem = ({ item }) => {
    const product = item.product || {};
    const price = Number(product.price || 0);
    const originalPrice = Number(product.original_price || 0);
    const hasDiscount = originalPrice > price;

    return (
      <View style={styles.cartItem}>
        <Image 
          source={
            product.images && product.images.length > 0 
              ? { uri: product.images[0] }
              : require("../assets/images/img1.png")
          }
          style={styles.productImage}
        />
        
        <View style={styles.productDetails}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name || "Product"}
          </Text>
          <Text style={styles.vendorName}>
            {product.vendor?.store_name || "Casa Nirvana"}
          </Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>
              ${price.toFixed(2)}
            </Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>
                ${originalPrice.toFixed(2)}
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
            disabled={updateCartItemMutation.isPending}
          >
            <Ionicons name="remove" size={16} color={Colors.black} />
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>{item.quantity}</Text>
          
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
            disabled={updateCartItemMutation.isPending}
          >
            <Ionicons name="add" size={16} color={Colors.black} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item.id)}
          disabled={removeFromCartMutation.isPending}
        >
          <Ionicons name="trash-outline" size={20} color={Colors.red} />
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    );
  }

  if (!cartItems || cartItems.length === 0) {
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
          <Text style={styles.headerTitle}>Shopping Cart</Text>
          <View style={styles.headerRight} />
        </View>
        
        {/* Empty Cart */}
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color={Colors.lightGrey} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Add some items to get started
          </Text>
          
          <AwesomeButton
            style={styles.continueButton}
            onPress={() => navigation.navigate("marketplaceHomeScreen")}
            height={50}
            backgroundColor={Colors.primary}
            backgroundDarker={Colors.primaryDark}
            borderRadius={25}
          >
            <Text style={styles.buttonText}>Continue Shopping</Text>
          </AwesomeButton>
        </View>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>Shopping Cart ({cartItems.length})</Text>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearCart}
          disabled={clearCartMutation.isPending}
        >
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>
      
      {/* Cart Items */}
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.cartList}
      />
      
      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.summaryValue}>
            {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax</Text>
          <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
        </View>
        
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>
        
        {subtotal < 50 && (
          <Text style={styles.shippingNote}>
            Add ${(50 - subtotal).toFixed(2)} more for free shipping
          </Text>
        )}
        
        <AwesomeButton
          style={styles.checkoutButton}
          onPress={() => navigation.navigate("deliveryAddressScreen", { cartItems, total })}
          height={50}
          backgroundColor={Colors.primary}
          backgroundDarker={Colors.primaryDark}
          borderRadius={25}
        >
          <Text style={styles.buttonText}>Proceed to Checkout</Text>
        </AwesomeButton>
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
    paddingHorizontal: Default.fixPadding,
    paddingVertical: Default.fixPadding,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGrey,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    ...Fonts.SemiBold18black,
    marginHorizontal: Default.fixPadding,
  },
  headerRight: {
    width: 40,
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    ...Fonts.SemiBold14primary,
    color: Colors.red,
  },
  loadingText: {
    ...Fonts.SemiBold16black,
    color: Colors.grey,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Default.fixPadding * 2,
  },
  emptyTitle: {
    ...Fonts.Bold20black,
    marginTop: Default.fixPadding,
    marginBottom: Default.fixPadding * 0.5,
  },
  emptySubtitle: {
    ...Fonts.Regular14grey,
    textAlign: "center",
    marginBottom: Default.fixPadding * 2,
  },
  continueButton: {
    width: width * 0.6,
  },
  cartList: {
    paddingHorizontal: Default.fixPadding,
    paddingVertical: Default.fixPadding,
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    padding: Default.fixPadding,
    marginBottom: Default.fixPadding,
    borderRadius: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: Colors.lightGrey,
  },
  productDetails: {
    flex: 1,
    marginLeft: Default.fixPadding,
  },
  productName: {
    ...Fonts.SemiBold16black,
    marginBottom: 4,
  },
  vendorName: {
    ...Fonts.Regular12grey,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  currentPrice: {
    ...Fonts.Bold16black,
    color: Colors.primary,
  },
  originalPrice: {
    ...Fonts.Regular12grey,
    textDecorationLine: "line-through",
    marginLeft: 8,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: Default.fixPadding,
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.lightGrey,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    ...Fonts.SemiBold16black,
    marginHorizontal: Default.fixPadding,
    minWidth: 20,
    textAlign: "center",
  },
  removeButton: {
    padding: 8,
    marginLeft: Default.fixPadding * 0.5,
  },
  summaryContainer: {
    backgroundColor: Colors.white,
    padding: Default.fixPadding * 1.5,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGrey,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Default.fixPadding * 0.5,
  },
  summaryLabel: {
    ...Fonts.Regular16black,
  },
  summaryValue: {
    ...Fonts.SemiBold16black,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.lightGrey,
    paddingTop: Default.fixPadding * 0.5,
    marginTop: Default.fixPadding * 0.5,
    marginBottom: Default.fixPadding,
  },
  totalLabel: {
    ...Fonts.Bold18black,
  },
  totalValue: {
    ...Fonts.Bold18black,
    color: Colors.primary,
  },
  shippingNote: {
    ...Fonts.Regular12grey,
    textAlign: "center",
    marginBottom: Default.fixPadding,
  },
  checkoutButton: {
    width: "100%",
  },
  buttonText: {
    ...Fonts.SemiBold16white,
    color: Colors.white,
  },
});

export default ShoppingCartScreen;
