import React, { useCallback, useEffect, useState } from "react";
import {
  Text,
  View,
  BackHandler,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import MyStatusBar from "../components/myStatusBar";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Colors, Default, Fonts } from "../constants/styles";
import AwesomeButton from "react-native-really-awesome-button";
import { useUpdateAmenityBooking } from "../hooks/useCreateAmenityBooking";
import { useHasJoinedCommunity } from "../hooks/useCommunityData";
import { supabase } from "../utils/supabase";
import {
  initiateExpressPayPayment,
  reconcileExpressPayPayment,
} from "../services/expressPayService";
import { normalizeOptionalUuid } from "../utils/id";

const PayPalScreen = ({ navigation, route }) => {
  const { bookingId, bookingData, paymentData } = route.params || {};
  const { i18n } = useTranslation();
  const updateBookingMutation = useUpdateAmenityBooking();
  const { profile } = useHasJoinedCommunity();
  const resolvedBookingId = React.useMemo(
    () => normalizeOptionalUuid(bookingId) || normalizeOptionalUuid(bookingData?.id),
    [bookingData?.id, bookingId]
  );

  const isRtl = i18n.dir() === "rtl";

  const backAction = useCallback(() => {
    navigation.pop();
    return true;
  }, [navigation]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => subscription.remove();
  }, [backAction]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [isValidPassword, setIsValidPassword] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    setIsValidEmail(validateEmail(text));
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    setIsValidPassword(text.length >= 6);
  };

  const handlePayment = async () => {
    if (!email || !isValidEmail) {
      Alert.alert("Invalid Email", "Please enter a valid PayPal email address.");
      return;
    }

    if (!password || !isValidPassword) {
      Alert.alert("Invalid Password", "Please enter your PayPal password.");
      return;
    }

    if (!bookingData && !paymentData) {
      Alert.alert("Error", "Payment information is missing.");
      return;
    }

    setIsProcessing(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const payerId = user?.id || profile?.id || null;
      const unitId = bookingData?.unit_id || paymentData?.unit_id || profile?.unit_id || null;

      if (!unitId) {
        throw new Error('Unable to resolve unit for payment');
      }

      if (!payerId) {
        throw new Error('Unable to resolve payer for payment');
      }

      const bookingType =
        bookingData?.type || paymentData?.type || paymentData?.payment_type || "community_dues";
      const amountToCharge = Number(bookingData?.totalAmount ?? paymentData?.amount ?? 0);

      if (!Number.isFinite(amountToCharge) || amountToCharge <= 0) {
        throw new Error("Invalid payment amount");
      }

      const initiationResult = await initiateExpressPayPayment({
        amount: amountToCharge,
        currency: "GHS",
        payment_type: bookingType,
        payment_method: "paypal",
        unit_id: unitId,
        booking_id: resolvedBookingId || undefined,
        description: bookingData
          ? `Payment for ${bookingData?.amenityName || bookingData?.serviceTitle || "booking"}`
          : paymentData?.title || paymentData?.description || "Community Payment",
        idempotency_key: `paypal-${payerId}-${bookingType}-${Date.now()}`,
        metadata: {
          source: "user-paypal-screen",
          paypal_email: email,
          source_booking_id: resolvedBookingId || null,
          source_booking_type: bookingType,
        },
      });

      if (!initiationResult.success || !initiationResult.data?.payment_id) {
        throw new Error(initiationResult.error || "Payment initiation failed");
      }

      if (bookingData?.type !== "service_booking" && resolvedBookingId) {
        await updateBookingMutation.mutateAsync({
          id: resolvedBookingId,
          updates: {
            payment_status: "pending",
          },
        });
      }

      const checkoutUrl = initiationResult.data.checkout_url;
      if (!checkoutUrl) {
        throw new Error("Checkout URL missing from gateway response.");
      }

      await WebBrowser.openBrowserAsync(checkoutUrl, {
        controlsColor: Colors.primary,
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      });

      const reconciliation = await reconcileExpressPayPayment({
        paymentId: initiationResult.data.payment_id,
        token: initiationResult.data.token,
        orderId: initiationResult.data.transaction_id,
      });

      const status = String(reconciliation.status || reconciliation.payment?.status || "pending").toLowerCase();
      const transactionId = initiationResult.data.transaction_id || `PP_${Date.now()}`;

      if (bookingData?.type !== "service_booking" && resolvedBookingId) {
        await updateBookingMutation.mutateAsync({
          id: resolvedBookingId,
          updates: {
            payment_status:
              status === "completed" ? "paid" : status === "failed" ? "failed" : "pending",
          },
        });
      }

      if (status === "completed") {
        if (bookingData) {
          navigation.push("successScreen", {
            bookingId: resolvedBookingId,
            bookingData: {
              ...bookingData,
              paymentMethod: "PayPal",
              paymentDate: new Date().toISOString(),
              transactionId,
            },
            paymentMethod: "PayPal",
            transactionId,
          });
        } else {
          navigation.push("successScreen", {
            paymentMethod: "PayPal",
            transactionId,
            paymentData: {
              ...paymentData,
              paymentMethod: "PayPal",
              paymentDate: new Date().toISOString(),
              transactionId,
            },
          });
        }
        return;
      }

      if (status === "failed") {
        Alert.alert("Payment Failed", reconciliation.error || "PayPal payment failed. Please try again.");
        return;
      }

      Alert.alert(
        "Payment Initiated",
        `Your payment is pending confirmation. Reference: ${transactionId}`
      );
    } catch (error) {
      console.error("PayPal payment error:", error);
      Alert.alert(
        "Payment Failed",
        error?.message || "There was an error processing your payment. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.extraLightGrey }}>
      <MyStatusBar />
      <View
        style={{
          flexDirection: isRtl ? "row-reverse" : "row",
          alignItems: "center",
          paddingVertical: Default.fixPadding * 1.2,
          paddingHorizontal: Default.fixPadding * 2,
          backgroundColor: Colors.white,
          ...Default.shadow,
        }}
      >
        <TouchableOpacity onPress={() => navigation.pop()}>
          <Ionicons
            name={isRtl ? "arrow-forward-outline" : "arrow-back-outline"}
            size={25}
            color={Colors.black}
          />
        </TouchableOpacity>
        <Text
          style={{
            ...Fonts.SemiBold18black,
            marginHorizontal: Default.fixPadding,
          }}
        >
          PayPal Payment
        </Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: Default.fixPadding * 3 }}
      >
        {/* PayPal Logo */}
        <View
          style={{
            alignItems: "center",
            marginVertical: Default.fixPadding * 2,
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: "#0070BA15",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MaterialIcons
              name="account-balance-wallet"
              size={40}
              color="#0070BA"
            />
          </View>
          <Text
            style={{
              ...Fonts.SemiBold18black,
              marginTop: Default.fixPadding,
              textAlign: "center",
            }}
          >
            PayPal
          </Text>
        </View>

        {/* Amount Summary */}
        <View
          style={{
            marginHorizontal: Default.fixPadding * 2,
            marginBottom: Default.fixPadding * 2,
            borderRadius: 10,
            backgroundColor: Colors.white,
            ...Default.shadow,
          }}
        >
          <View style={{ padding: Default.fixPadding * 2 }}>
            <View
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  ...Fonts.SemiBold16black,
                  textAlign: isRtl ? "right" : "left",
                }}
              >
                Amount to Pay
              </Text>
              <Text
                style={{
                  ...Fonts.SemiBold24primary,
                  textAlign: isRtl ? "left" : "right",
                }}
              >
                GH₵ {bookingData?.totalAmount?.toFixed(2) || '0.00'}
              </Text>
            </View>
          </View>
        </View>

        {/* Login Form */}
        <View
          style={{
            marginHorizontal: Default.fixPadding * 2,
            marginBottom: Default.fixPadding * 2,
            borderRadius: 10,
            backgroundColor: Colors.white,
            ...Default.shadow,
          }}
        >
          <View style={{ padding: Default.fixPadding * 2 }}>
            <Text
              style={{
                ...Fonts.SemiBold16black,
                textAlign: isRtl ? "right" : "left",
                marginBottom: Default.fixPadding * 1.5,
              }}
            >
              Log in to your PayPal account
            </Text>
            
            {/* Email Input */}
            <View style={{ marginBottom: Default.fixPadding * 1.5 }}>
              <Text
                style={{
                  ...Fonts.Medium14grey,
                  textAlign: isRtl ? "right" : "left",
                  marginBottom: Default.fixPadding * 0.5,
                }}
              >
                Email Address
              </Text>
              <TextInput
                value={email}
                onChangeText={handleEmailChange}
                placeholder="your@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                style={{
                  ...(isValidEmail ? Fonts.Medium16black : Fonts.Medium16red),
                  textAlign: isRtl ? "right" : "left",
                  paddingVertical: Default.fixPadding * 1.2,
                  paddingHorizontal: Default.fixPadding * 1.5,
                  borderRadius: 10,
                  backgroundColor: Colors.extraLightGrey,
                  borderWidth: 1,
                  borderColor: isValidEmail ? Colors.lightGrey : Colors.red,
                }}
              />
              {!isValidEmail && email.length > 0 && (
                <Text
                  style={{
                    ...Fonts.Medium12red,
                    textAlign: isRtl ? "right" : "left",
                    marginTop: Default.fixPadding * 0.5,
                  }}
                >
                  Please enter a valid email address
                </Text>
              )}
            </View>

            {/* Password Input */}
            <View style={{ marginBottom: Default.fixPadding }}>
              <Text
                style={{
                  ...Fonts.Medium14grey,
                  textAlign: isRtl ? "right" : "left",
                  marginBottom: Default.fixPadding * 0.5,
                }}
              >
                Password
              </Text>
              <View style={{ position: "relative" }}>
                <TextInput
                  value={password}
                  onChangeText={handlePasswordChange}
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  style={{
                    ...(isValidPassword ? Fonts.Medium16black : Fonts.Medium16red),
                    textAlign: isRtl ? "right" : "left",
                    paddingVertical: Default.fixPadding * 1.2,
                    paddingHorizontal: Default.fixPadding * 1.5,
                    paddingRight: isRtl ? Default.fixPadding * 1.5 : Default.fixPadding * 5,
                    paddingLeft: isRtl ? Default.fixPadding * 5 : Default.fixPadding * 1.5,
                    borderRadius: 10,
                    backgroundColor: Colors.extraLightGrey,
                    borderWidth: 1,
                    borderColor: isValidPassword ? Colors.lightGrey : Colors.red,
                  }}
                />
                <TouchableOpacity
                  style={{
                    position: "absolute",
                    right: isRtl ? undefined : Default.fixPadding * 1.5,
                    left: isRtl ? Default.fixPadding * 1.5 : undefined,
                    top: "50%",
                    transform: [{ translateY: -12 }],
                  }}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color={Colors.grey}
                  />
                </TouchableOpacity>
              </View>
              {!isValidPassword && password.length > 0 && (
                <Text
                  style={{
                    ...Fonts.Medium12red,
                    textAlign: isRtl ? "right" : "left",
                    marginTop: Default.fixPadding * 0.5,
                  }}
                >
                  Password must be at least 6 characters
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Security Notice */}
        <View
          style={{
            marginHorizontal: Default.fixPadding * 2,
            marginBottom: Default.fixPadding * 2,
            borderRadius: 10,
            backgroundColor: Colors.primary + '10',
            borderWidth: 1,
            borderColor: Colors.primary + '30',
          }}
        >
          <View style={{ padding: Default.fixPadding * 2 }}>
            <View
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                alignItems: "center",
                marginBottom: Default.fixPadding * 0.5,
              }}
            >
              <MaterialIcons
                name="security"
                size={20}
                color={Colors.primary}
                style={{
                  marginRight: isRtl ? 0 : Default.fixPadding * 0.5,
                  marginLeft: isRtl ? Default.fixPadding * 0.5 : 0,
                }}
              />
              <Text
                style={{
                  ...Fonts.SemiBold14primary,
                  textAlign: isRtl ? "right" : "left",
                }}
              >
                Secure Payment
              </Text>
            </View>
            <Text
              style={{
                ...Fonts.Medium12black,
                textAlign: isRtl ? "right" : "left",
                lineHeight: 18,
              }}
            >
              Your payment information is encrypted and secure. PayPal does not share your financial information with merchants.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={{ margin: Default.fixPadding * 2 }}>
        <AwesomeButton
          height={50}
          onPress={handlePayment}
          raiseLevel={1}
          stretch={true}
          borderRadius={10}
          backgroundShadow="#0070BA"
          backgroundDarker="#0070BA"
          backgroundColor="#0070BA"
          disabled={isProcessing || !isValidEmail || !isValidPassword || !email || !password}
        >
          <Text style={{ ...Fonts.SemiBold18white }}>
            {isProcessing ? "Processing..." : "Pay with PayPal"}
          </Text>
        </AwesomeButton>
      </View>
    </View>
  );
};

export default PayPalScreen;
