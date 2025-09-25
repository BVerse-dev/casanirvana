import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import AwesomeButton from "react-native-really-awesome-button";
import MyStatusBar from "../components/myStatusBar";
import { useCreateOrder, useClearCart } from "../hooks/useMarketplace";

const { width } = Dimensions.get("window");

const OrderReviewScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const {
    cartItems,
    subtotal,
    deliveryFee,
    totalAmount,
    deliveryOption,
    deliveryAddress,
    paymentMethod,
    orderSummary
  } = route.params || {};

  const [isProcessing, setIsProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);

  const createOrderMutation = useCreateOrder();
  const clearCartMutation = useClearCart();

  const finalTotal = totalAmount - promoDiscount;

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    
    try {
      // Prepare order data
      const orderData = {
        items: cartItems?.map(item => ({
          product_id: item.product?.id || item.id,
          product_name: item.product?.name || item.name,
          quantity: item.quantity,
          unit_price: parseFloat(item.product?.price || item.price || 0),
          total_price: parseFloat(item.product?.price || item.price || 0) * item.quantity,
          product_image: item.product?.images?.[0] || item.image,
        })) || [],
        subtotal: parseFloat(subtotal || 0),
        delivery_fee: parseFloat(deliveryFee || 0),
        promo_discount: promoDiscount,
        total_amount: finalTotal,
        delivery_method: deliveryOption?.id || 'delivery',
        delivery_address: deliveryAddress || null,
        payment_method: paymentMethod || 'Credit Card',
        status: 'pending',
        order_notes: '',
      };

      console.log("Creating order with data:", orderData);

      // Create the order
      const newOrder = await createOrderMutation.mutateAsync(orderData);
      
      // Clear the cart
      await clearCartMutation.mutateAsync();

      // Navigate to confirmation screen
      navigation.replace("orderConfirmationScreen", {
        orderId: newOrder.id,
        orderData: newOrder,
        totalAmount: finalTotal,
      });

    } catch (error) {
      console.error("Error placing order:", error);
      Alert.alert(
        "Order Failed", 
        "There was an error processing your order. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const renderCartItem = ({ item, index }) => (
    <View key={index} style={styles.cartItem}>
      <Image 
        source={
          item.product?.images?.[0] 
            ? { uri: item.product.images[0] }
            : item.image
            ? item.image
            : require("../assets/images/img1.png")
        }
        style={styles.itemImage}
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>
          {String(item.product?.name || item.name || "Product")}
        </Text>
        <Text style={styles.itemVendor}>
          {String(item.product?.vendor?.store_name || "Casa Nirvana")}
        </Text>
        <View style={styles.itemPricing}>
          <Text style={styles.itemPrice}>
            GH₵ {parseFloat(item.product?.price || item.price || 0).toFixed(2)}
          </Text>
          <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
        </View>
      </View>
      <View style={styles.itemTotal}>
        <Text style={styles.itemTotalPrice}>
          GH₵ {(parseFloat(item.product?.price || item.price || 0) * item.quantity).toFixed(2)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <MyStatusBar />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Order</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items ({cartItems?.length || 0})</Text>
          <View style={styles.itemsContainer}>
            {cartItems?.map((item, index) => renderCartItem({ item, index }))}
          </View>
        </View>

        {/* Delivery Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <MaterialIcons 
                  name={deliveryOption?.icon || "local-shipping"} 
                  size={20} 
                  color={deliveryOption?.id === "pickup" ? "#6B3AA0" : "#4ECDC4"} 
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>{deliveryOption?.title || "Home Delivery"}</Text>
                <Text style={styles.infoSubtitle}>{deliveryOption?.estimatedTime || "2-3 business days"}</Text>
              </View>
              <Text style={styles.infoPrice}>{deliveryOption?.price || "GH₵ 15.00"}</Text>
            </View>

            {deliveryAddress && (
              <View style={styles.addressSection}>
                <View style={styles.addressHeader}>
                  <Ionicons name="location" size={16} color={Colors.grey} />
                  <Text style={styles.addressLabel}>{deliveryAddress.label}</Text>
                </View>
                <Text style={styles.addressName}>{deliveryAddress.fullName}</Text>
                <Text style={styles.addressDetails}>
                  {deliveryAddress.streetAddress}{'\n'}
                  {deliveryAddress.city}, {deliveryAddress.region} {deliveryAddress.postalCode}
                </Text>
                <Text style={styles.addressPhone}>{deliveryAddress.phoneNumber}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <MaterialIcons 
                  name={
                    paymentMethod === "Credit Card" ? "credit-card" :
                    paymentMethod === "Mobile Money" ? "phone-android" :
                    paymentMethod === "PayPal" ? "account-balance-wallet" : "credit-card"
                  } 
                  size={20} 
                  color={Colors.primary} 
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>{paymentMethod || "Credit Card"}</Text>
                <Text style={styles.infoSubtitle}>
                  {paymentMethod === "Credit Card" ? "Secure card payment" :
                   paymentMethod === "Mobile Money" ? "MTN, Vodafone, AirtelTigo" :
                   paymentMethod === "PayPal" ? "PayPal account" : "Secure payment"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>GH₵ {parseFloat(subtotal || 0).toFixed(2)}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>
                {deliveryFee > 0 ? `GH₵ ${parseFloat(deliveryFee).toFixed(2)}` : "Free"}
              </Text>
            </View>

            {promoDiscount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, styles.discountLabel]}>Promo Discount</Text>
                <Text style={[styles.summaryValue, styles.discountValue]}>
                  -GH₵ {promoDiscount.toFixed(2)}
                </Text>
              </View>
            )}

            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>GH₵ {finalTotal.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Terms and Conditions */}
        <View style={styles.section}>
          <View style={styles.termsContainer}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.grey} />
            <Text style={styles.termsText}>
              By placing this order, you agree to our{" "}
              <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
              <Text style={styles.termsLink}>Privacy Policy</Text>.
            </Text>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.bottomContainer}>
        <View style={styles.orderTotal}>
          <Text style={styles.orderTotalLabel}>Total</Text>
          <Text style={styles.orderTotalValue}>GH₵ {finalTotal.toFixed(2)}</Text>
        </View>
        
        <AwesomeButton
          progress
          disabled={isProcessing}
          onPress={(next) => {
            handlePlaceOrder();
            next();
          }}
          width={width - Default.fixPadding * 2.4}
          height={50}
          backgroundColor={isProcessing ? Colors.grey : Colors.primary}
          backgroundDarker={isProcessing ? Colors.grey : Colors.primary}
          borderRadius={25}
        >
          {isProcessing ? (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="small" color={Colors.white} />
              <Text style={styles.processingText}>Processing...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>Place Order</Text>
          )}
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
  section: {
    padding: Default.fixPadding * 1.2,
  },
  sectionTitle: {
    ...Fonts.Bold16black,
    color: Colors.black,
    marginBottom: Default.fixPadding,
    fontWeight: "bold",
  },
  itemsContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    overflow: "hidden",
  },
  cartItem: {
    flexDirection: "row",
    padding: Default.fixPadding,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: Colors.lightGrey,
  },
  itemDetails: {
    flex: 1,
    marginLeft: Default.fixPadding,
    justifyContent: "space-between",
  },
  itemName: {
    ...Fonts.SemiBold14black,
    color: Colors.black,
    marginBottom: 2,
    fontWeight: "bold",
  },
  itemVendor: {
    ...Fonts.Regular12grey,
    color: Colors.grey,
    marginBottom: 4,
  },
  itemPricing: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemPrice: {
    ...Fonts.SemiBold12black,
    color: Colors.black,
  },
  itemQuantity: {
    ...Fonts.Regular12grey,
    color: Colors.grey,
  },
  itemTotal: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
  itemTotalPrice: {
    ...Fonts.Bold14black,
    color: Colors.black,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Default.fixPadding,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F8FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Default.fixPadding,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...Fonts.Bold14black,
    color: Colors.black,
    marginBottom: 2,
  },
  infoSubtitle: {
    ...Fonts.Regular12grey,
    color: Colors.grey,
  },
  infoPrice: {
    ...Fonts.SemiBold14black,
    color: Colors.black,
  },
  addressSection: {
    marginTop: Default.fixPadding,
    paddingTop: Default.fixPadding,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Default.fixPadding * 0.5,
  },
  addressLabel: {
    ...Fonts.Bold12black,
    color: Colors.black,
    marginLeft: Default.fixPadding * 0.5,
  },
  addressName: {
    ...Fonts.SemiBold14black,
    color: Colors.black,
    marginBottom: 4,
  },
  addressDetails: {
    ...Fonts.Regular12grey,
    color: Colors.grey,
    lineHeight: 18,
    marginBottom: 4,
  },
  addressPhone: {
    ...Fonts.Regular12grey,
    color: Colors.grey,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Default.fixPadding,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Default.fixPadding * 0.5,
  },
  summaryLabel: {
    ...Fonts.Regular14black,
    color: Colors.black,
  },
  summaryValue: {
    ...Fonts.SemiBold14black,
    color: Colors.black,
  },
  discountLabel: {
    color: Colors.primary,
  },
  discountValue: {
    color: Colors.primary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    marginTop: Default.fixPadding * 0.5,
    paddingTop: Default.fixPadding,
  },
  totalLabel: {
    ...Fonts.Bold16black,
    color: Colors.black,
  },
  totalValue: {
    ...Fonts.Bold16black,
    color: Colors.primary,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F8F9FA",
    padding: Default.fixPadding,
    borderRadius: 8,
  },
  termsText: {
    ...Fonts.Regular12grey,
    color: Colors.grey,
    marginLeft: Default.fixPadding * 0.5,
    flex: 1,
    lineHeight: 18,
  },
  termsLink: {
    color: Colors.primary,
    textDecorationLine: "underline",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingTop: Default.fixPadding,
    paddingBottom: Default.fixPadding * 2,
    paddingHorizontal: Default.fixPadding * 1.2,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    alignItems: "center",
  },
  orderTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: Default.fixPadding,
  },
  orderTotalLabel: {
    ...Fonts.Bold18black,
    color: Colors.black,
  },
  orderTotalValue: {
    ...Fonts.Bold18black,
    color: Colors.primary,
  },
  buttonText: {
    ...Fonts.SemiBold16white,
    color: Colors.white,
  },
  processingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  processingText: {
    ...Fonts.SemiBold16white,
    color: Colors.white,
    marginLeft: Default.fixPadding * 0.5,
  },
});

export default OrderReviewScreen;
