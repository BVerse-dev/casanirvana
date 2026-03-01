import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  BackHandler,
  TouchableOpacity,
  Dimensions,
  TextInput,
  ScrollView,
  Alert,
  Modal,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import MyStatusBar from "../components/myStatusBar";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Colors, Default, Fonts } from "../constants/styles";
import AwesomeButton from "react-native-really-awesome-button";
import CreditCard from "react-native-credit-card-ui";
import * as cardValidator from "card-validator";
import { useUpdateAmenityBooking } from "../hooks/useCreateAmenityBooking";
import { supabase } from "../utils/supabase";
import { useHasJoinedCommunity } from "../hooks/useCommunityData";
import {
  initiateExpressPayPayment,
  reconcileExpressPayPayment,
} from "../services/expressPayService";
import { normalizeOptionalUuid } from "../utils/id";

const { width } = Dimensions.get("window");

const CreditCardScreen = ({ navigation, route }) => {
  const { bookingId, bookingData, paymentData, sourceType, sourceId, obligationId, isAddingPaymentMethod, onPaymentMethodAdded } = route.params || {};
  const { t, i18n } = useTranslation();
  const updateBookingMutation = useUpdateAmenityBooking();
  
  // Determine if this is for adding a payment method or making a payment
  const isAddingMode = isAddingPaymentMethod === true;
  const { profile } = useHasJoinedCommunity();
  const resolvedBookingId = React.useMemo(
    () => normalizeOptionalUuid(bookingId) || normalizeOptionalUuid(bookingData?.id),
    [bookingData?.id, bookingId]
  );
  const resolvedSourceType = React.useMemo(() => {
    if (typeof sourceType === "string" && sourceType.trim()) {
      return sourceType.trim();
    }

    if (typeof paymentData?.sourceType === "string" && paymentData.sourceType.trim()) {
      return paymentData.sourceType.trim();
    }

    if (bookingData?.type === "amenity_booking") {
      return "amenity_booking";
    }

    if (bookingData?.type === "service_booking") {
      return "service_booking";
    }

    if (paymentData?.type === "payment_obligation") {
      return "payment_obligation";
    }

    return null;
  }, [bookingData?.type, paymentData?.sourceType, paymentData?.type, sourceType]);

  const resolvedSourceId = React.useMemo(() => {
    const explicitSourceId =
      normalizeOptionalUuid(sourceId) || normalizeOptionalUuid(paymentData?.sourceId);

    if (explicitSourceId) {
      return explicitSourceId;
    }

    if (resolvedSourceType === "amenity_booking" || resolvedSourceType === "service_booking") {
      return resolvedBookingId;
    }

    return null;
  }, [paymentData?.sourceId, resolvedBookingId, resolvedSourceType, sourceId]);

  const resolvedObligationId = React.useMemo(() => {
    return (
      normalizeOptionalUuid(obligationId) ||
      normalizeOptionalUuid(paymentData?.obligationId) ||
      (resolvedSourceType === "payment_obligation" ? normalizeOptionalUuid(paymentData?.sourceId) : null)
    );
  }, [obligationId, paymentData?.obligationId, paymentData?.sourceId, resolvedSourceType]);

  const isRtl = i18n.dir() === "rtl";

  function tr(key) {
    return t(`creditCardScreen:${key}`);
  }

  useEffect(() => {
    const onBackPress = () => {
      navigation.pop();
      return true;
    };
    const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => subscription.remove();
  }, [navigation]);

  const [focused, setFocused] = useState("name");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedPaymentMethod, setSavedPaymentMethod] = useState(null);

  const [name, setName] = useState("");
  const [isValidName, setIsValidName] = useState(true);

  const [number, setNumber] = useState("");
  const [isValidNumber, setIsValidNumber] = useState(true);

  const [cvvCode, setCvvCode] = useState("");
  const [isValidCvv, setIsValidCvv] = useState(true);

  const [expiryDate, setExpiryDate] = useState("");
  const [isValidExpiry, setIsValidExpiry] = useState(true);

  const handleExpiryDate = (text) => {
    let textTemp = text;
    
    // Allow only numbers and forward slash
    textTemp = textTemp.replace(/[^\d\/]/g, '');
    
    // Auto-format: add slash after 2 digits
    if (textTemp.length === 2 && !textTemp.includes('/')) {
      const month = parseInt(textTemp);
      if (month >= 1 && month <= 12) {
        textTemp += "/";
      }
    }
    
    // Handle month validation
    if (textTemp.length >= 2 && !textTemp.includes('/')) {
      const month = parseInt(textTemp.substring(0, 2));
      if (month > 12 || month === 0) {
        textTemp = textTemp[0];
      }
    }
    
    // Handle year validation
    if (textTemp.includes('/')) {
      const parts = textTemp.split('/');
      if (parts.length === 2) {
        const month = parseInt(parts[0]);
        let year = parts[1];
        
        // Validate month
        if (month < 1 || month > 12) {
          textTemp = "";
          setExpiryDate(textTemp);
          setIsValidExpiry(false);
          return;
        }
        
        // Validate year (if complete)
        if (year.length === 2) {
          const currentYear = new Date().getFullYear() % 100;
          const currentMonth = new Date().getMonth() + 1;
          const yearNum = parseInt(year);
          
          if (yearNum < currentYear || (yearNum === currentYear && month < currentMonth)) {
            setIsValidExpiry(false);
          } else {
            setIsValidExpiry(true);
          }
        }
      }
    }
    
    setExpiryDate(textTemp);
    
    // Final validation using card-validator
    if (textTemp.length === 5) {
      let expireDateValidation = cardValidator.expirationDate(textTemp);
      setIsValidExpiry(expireDateValidation.isValid);
    }
  };

  const [cardType, setCardType] = useState("mastercard");

  const getCardType = (number) => {
    const visaRegEx = /^4[0-9]{12}(?:[0-9]{3})?$/;
    const mastercardRegEx = /^5[1-5][0-9]{14}$/;
    const amexRegEx = /^3[47][0-9]{13}$/;
    const discoverRegEx = /^6(?:011|5[0-9]{2})[0-9]{12}$/;

    if (visaRegEx.test(number)) return "visa";
    if (mastercardRegEx.test(number)) return "mastercard";
    if (amexRegEx.test(number)) return "amex";
    if (discoverRegEx.test(number)) return "discover";
    return "mastercard";
  };

  const handleCardNumberChange = (value) => {
    let formattedText = value.split(" ").join("");
    if (formattedText.length > 0) {
      formattedText = formattedText.match(new RegExp(".{1,4}", "g")).join(" ");
    }
    setCardType(getCardType(value));
    if (formattedText.length === 19) {
      const numberValidation = cardValidator.number(value);
      setIsValidNumber(numberValidation.isValid);
    } else {
      setIsValidNumber(false);
    }
    setNumber(formattedText);
  };

  const formattedNumber = number.replace(/\s/g, "");

  const creditCard = () => {
    return (
      <CreditCard
        type={cardType}
        imageFront={require("../assets/images/card.png")}
        imageBack={require("../assets/images/card.png")}
        shiny={true}
        bar={true}
        flip={true}
        focused={focused}
        width={width * 0.9}
        height={220}
        number={formattedNumber}
        name={name}
        expiry={expiryDate}
        cvc={cvvCode}
        style={{
          marginVertical: Default.fixPadding * 1.5,
          alignSelf: "center",
        }}
      />
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <MyStatusBar />
      <View
        style={{
          flexDirection: isRtl ? "row-reverse" : "row",
          alignItems: "center",
          paddingVertical: Default.fixPadding * 1.2,
          paddingHorizontal: Default.fixPadding * 2,
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
          {isAddingMode ? "Add Credit Card" : tr("creditCard")}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets={true}
      >
        {creditCard()}

        <View
          style={{
            marginTop: Default.fixPadding,
            marginHorizontal: Default.fixPadding * 2,
          }}
        >
          <Text
            style={{
              ...Fonts.Medium16grey,
              textAlign: isRtl ? "right" : "left",
            }}
          >
            {tr("name")}
          </Text>

          <TextInput
            value={name}
            onChangeText={(text) => {
              setFocused("name");
              setName(text);
              let nameValidation = cardValidator.cardholderName(text);
              setIsValidName(nameValidation.isValid);
            }}
            placeholder={tr("enterName")}
            placeholderTextColor={Colors.grey}
            selectionColor={Colors.primary}
            style={{
              ...(isValidName ? Fonts.Medium16black : Fonts.Medium16red),
              textAlign: isRtl ? "right" : "left",
              paddingVertical: Default.fixPadding * 1.2,
              paddingHorizontal: Default.fixPadding * 1.5,
              marginTop: Default.fixPadding,
              marginBottom: Default.fixPadding * 2,
              borderRadius: 10,
              backgroundColor: Colors.white,
              ...Default.shadow,
            }}
          />
          <Text
            style={{
              ...Fonts.Medium16grey,
              textAlign: isRtl ? "right" : "left",
            }}
          >
            {tr("cardNo")}
          </Text>

          <TextInput
            maxLength={19}
            value={number}
            onChangeText={(text) => {
              setFocused("number");
              handleCardNumberChange(text);
            }}
            keyboardType={"number-pad"}
            placeholder={tr("enterCard")}
            placeholderTextColor={Colors.grey}
            selectionColor={Colors.primary}
            style={{
              ...(isValidNumber ? Fonts.Medium16black : Fonts.Medium16red),
              textAlign: isRtl ? "right" : "left",
              paddingVertical: Default.fixPadding * 1.2,
              paddingHorizontal: Default.fixPadding * 1.5,
              marginTop: Default.fixPadding,
              marginBottom: Default.fixPadding * 2,
              borderRadius: 10,
              backgroundColor: Colors.white,
              ...Default.shadow,
            }}
          />

          <View
            style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              justifyContent: "space-between",
              marginBottom: Default.fixPadding * 2,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  ...Fonts.Medium16grey,
                  textAlign: isRtl ? "right" : "left",
                }}
              >
                {tr("expiryDate")}
              </Text>

              <TextInput
                maxLength={5}
                value={expiryDate}
                keyboardType="number-pad"
                onChangeText={(text) => {
                  setFocused("expiry");
                  handleExpiryDate(text);
                }}
                selectionColor={Colors.primary}
                placeholder="MM/YY"
                placeholderTextColor={Colors.grey}
                style={{
                  ...(isValidExpiry ? Fonts.Medium16black : Fonts.Medium16red),
                  textAlign: isRtl ? "right" : "left",
                  paddingVertical: Default.fixPadding * 1.2,
                  paddingHorizontal: Default.fixPadding * 1.5,
                  marginTop: Default.fixPadding,
                  marginRight: isRtl ? 0 : Default.fixPadding * 2,
                  marginLeft: isRtl ? Default.fixPadding * 2 : 0,
                  borderRadius: 10,
                  backgroundColor: Colors.white,
                  ...Default.shadow,
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  ...Fonts.Medium16grey,
                  textAlign: isRtl ? "right" : "left",
                }}
              >
                CVV
              </Text>

              <TextInput
                maxLength={3}
                value={cvvCode}
                secureTextEntry={true}
                keyboardType="number-pad"
                onChangeText={(text) => {
                  setFocused("cvc");
                  setCvvCode(text);
                  if (text.length === 3) {
                    const cvvValidation = cardValidator.cvv(text);
                    setIsValidCvv(cvvValidation.isValid);
                  } else {
                    setIsValidCvv(false);
                  }
                }}
                placeholder={"CVV"}
                placeholderTextColor={Colors.grey}
                selectionColor={Colors.primary}
                style={{
                  ...(isValidCvv ? Fonts.Medium16black : Fonts.Medium16red),
                  textAlign: isRtl ? "right" : "left",
                  paddingVertical: Default.fixPadding * 1.2,
                  paddingHorizontal: Default.fixPadding * 1.5,
                  marginTop: Default.fixPadding,
                  borderRadius: 10,
                  backgroundColor: Colors.white,
                  ...Default.shadow,
                }}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View
        style={{
          marginTop: Default.fixPadding,
          marginBottom: Default.fixPadding * 2,
          marginHorizontal: Default.fixPadding * 2,
        }}
      >
        <AwesomeButton
          height={50}
          onPress={handlePayment}
          raiseLevel={1}
          stretch={true}
          borderRadius={10}
          backgroundShadow={Colors.primary}
          backgroundDarker={Colors.primary}
          backgroundColor={Colors.primary}
          disabled={isProcessing}
        >
          <Text style={{ ...Fonts.SemiBold18white }}>
            {isProcessing 
              ? (isAddingMode ? 'Saving Payment Method...' : 'Processing Payment...')
              : (isAddingMode ? 'Save Payment Method' : tr("continue"))
            }
          </Text>
        </AwesomeButton>
      </View>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: Default.fixPadding * 2
        }}>
          <View style={{
            backgroundColor: Colors.white,
            borderRadius: 15,
            padding: Default.fixPadding * 3,
            width: '100%',
            maxWidth: 350,
            alignItems: 'center',
            ...Default.shadow
          }}>
            {/* Success Icon */}
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: Colors.primary + '20',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: Default.fixPadding * 2
            }}>
              <Ionicons name="checkmark-circle" size={50} color={Colors.primary} />
            </View>

            {/* Title */}
            <Text style={{
              ...Fonts.SemiBold20black,
              textAlign: 'center',
              marginBottom: Default.fixPadding
            }}>
              Payment Method Added!
            </Text>

            {/* Description */}
            <Text style={{
              ...Fonts.Medium14grey,
              textAlign: 'center',
              marginBottom: Default.fixPadding * 2,
              lineHeight: 22
            }}>
              Your payment method has been successfully saved to your account.
            </Text>

            {/* Payment Method Details */}
            {savedPaymentMethod && (
              <View style={{
                backgroundColor: Colors.lightGrey + '40',
                borderRadius: 10,
                padding: Default.fixPadding * 1.5,
                width: '100%',
                marginBottom: Default.fixPadding * 2
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Ionicons name="card" size={20} color={Colors.primary} />
                  <Text style={{
                    ...Fonts.SemiBold16black,
                    marginLeft: 10
                  }}>
                    {savedPaymentMethod.brand} •••• {savedPaymentMethod.lastFour}
                  </Text>
                </View>
                <Text style={{
                  ...Fonts.Medium14grey,
                  marginLeft: 30
                }}>
                  Expires {savedPaymentMethod.expiry}
                </Text>
              </View>
            )}

            {/* Done Button */}
            <TouchableOpacity
              style={{
                backgroundColor: Colors.primary,
                borderRadius: 10,
                paddingVertical: Default.fixPadding * 1.2,
                paddingHorizontal: Default.fixPadding * 3,
                width: '100%',
                alignItems: 'center'
              }}
              onPress={() => {
                setShowSuccessModal(false);
                // Call the callback to refresh the payment methods list
                if (onPaymentMethodAdded) {
                  onPaymentMethodAdded();
                }
                // Navigate back to My Payment Methods screen
                navigation.pop(2); // Go back 2 screens (paymentMethodScreen -> myPaymentMethodsScreen)
              }}
            >
              <Text style={{ ...Fonts.SemiBold16white }}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );

  // Handle payment processing
  async function handlePayment() {
    if (!name.trim()) {
      setIsValidName(false);
      Alert.alert('Validation Error', 'Please enter cardholder name');
      return;
    }

    if (!cardValidator.number(number).isValid) {
      setIsValidNumber(false);
      Alert.alert('Validation Error', 'Please enter a valid card number');
      return;
    }

    if (!cardValidator.cvv(cvvCode).isValid) {
      setIsValidCvv(false);
      Alert.alert('Validation Error', 'Please enter a valid CVV');
      return;
    }

    if (!cardValidator.expirationDate(expiryDate).isValid) {
      setIsValidExpiry(false);
      Alert.alert('Validation Error', 'Please enter a valid expiry date');
      return;
    }

    if (isAddingMode) {
      setIsProcessing(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id || profile?.id;

        if (!userId) {
          Alert.alert('Error', 'User profile not found');
          return;
        }

        const expiryParts = expiryDate.split('/');
        const expiryMonth = parseInt(expiryParts[0], 10);
        const expiryYear = parseInt(`20${expiryParts[1]}`, 10);
        const cardInfo = cardValidator.number(number);
        const cardBrand = cardInfo.card?.type || 'unknown';

        const { error } = await supabase
          .from('user_payment_methods')
          .insert({
            user_id: userId,
            payment_type: 'card',
            card_last_four: number.slice(-4),
            card_brand: cardBrand.charAt(0).toUpperCase() + cardBrand.slice(1),
            card_expiry_month: expiryMonth,
            card_expiry_year: expiryYear,
            is_default: false,
            is_active: true
          });

        if (error) {
          Alert.alert('Error', `Failed to save payment method: ${error.message}`);
          return;
        }

        setSavedPaymentMethod({
          type: 'Credit Card',
          brand: cardBrand.charAt(0).toUpperCase() + cardBrand.slice(1),
          lastFour: number.slice(-4),
          expiry: expiryDate
        });
        setShowSuccessModal(true);
        return;
      } catch (error) {
        Alert.alert('Function Error', `Error: ${error.message}`);
        return;
      } finally {
        setIsProcessing(false);
      }
    }

    if (!bookingData && !paymentData) {
      Alert.alert('Error', 'Payment information is missing');
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

      const normalizeGatewayStatus = (status) => {
        if (!status) return 'pending';
        const normalized = String(status).toLowerCase();
        if (normalized === 'processing' || normalized === 'initiated') return 'pending';
        return normalized;
      };

      const mapBookingPaymentStatus = (status) => {
        if (status === 'completed') return 'paid';
        if (status === 'failed') return 'failed';
        return 'pending';
      };

      const bookingType = bookingData?.type || paymentData?.type || 'community_dues';
      const amountToCharge = Number(bookingData?.totalAmount ?? paymentData?.amount ?? 0);
      const displayTitle =
        bookingData?.amenityName ||
        bookingData?.serviceName ||
        bookingData?.serviceTitle ||
        paymentData?.title ||
        paymentData?.description ||
        'Payment';
      const appReturnUrl = Linking.createURL("payments/expresspay/return");

      if (!Number.isFinite(amountToCharge) || amountToCharge <= 0) {
        throw new Error('Invalid payment amount');
      }

      const initiationResult = await initiateExpressPayPayment({
        amount: amountToCharge,
        currency: 'GHS',
        payment_type: bookingType,
        payment_method: 'card',
        unit_id: unitId,
        booking_id: resolvedSourceType === 'service_booking' ? resolvedBookingId || undefined : undefined,
        source_type: resolvedSourceType || undefined,
        source_id: resolvedSourceId || undefined,
        obligation_id: resolvedObligationId || undefined,
        description: displayTitle,
        idempotency_key: `card-${payerId}-${bookingType}-${Date.now()}`,
        metadata: {
          source: 'user-credit-card-screen',
          source_booking_id: resolvedBookingId || null,
          source_booking_type: bookingType,
          source_display_title: displayTitle,
          source_display_description: paymentData?.description || null,
          app_return_url: appReturnUrl,
          entered_card_last_four: number.slice(-4),
          entered_card_brand: cardValidator.number(number).card?.type || 'unknown',
          entered_cardholder_name: name,
        },
      });

      if (!initiationResult.success || !initiationResult.data?.payment_id) {
        throw new Error(initiationResult.error || 'Failed to initiate payment');
      }

      if (bookingData?.type !== 'service_booking' && resolvedBookingId) {
        await updateBookingMutation.mutateAsync({
          id: resolvedBookingId,
          updates: {
            payment_status: 'pending',
          },
        });
      }

      const checkoutUrl = initiationResult.data.checkout_url;
      if (!checkoutUrl) {
        throw new Error('Checkout URL missing from payment gateway response.');
      }

      await WebBrowser.openAuthSessionAsync(checkoutUrl, appReturnUrl);

      const reconciliation = await reconcileExpressPayPayment({
        paymentId: initiationResult.data.payment_id,
        token: initiationResult.data.token,
        orderId: initiationResult.data.transaction_id,
        pollAttempts: 6,
        pollDelayMs: 2000,
      });

      const gatewayStatus = normalizeGatewayStatus(
        reconciliation.status || reconciliation.payment?.status || 'pending'
      );
      const transactionId = initiationResult.data.transaction_id || `TXN_${Date.now()}`;
      const maskedCard = `**** **** **** ${number.slice(-4)}`;

      if (bookingData?.type !== 'service_booking' && resolvedBookingId) {
        await updateBookingMutation.mutateAsync({
          id: resolvedBookingId,
          updates: {
            payment_status: mapBookingPaymentStatus(gatewayStatus),
          },
        });
      }

      if (gatewayStatus === 'completed') {
        if (bookingData) {
          navigation.push("successScreen", {
            bookingId: resolvedBookingId,
            paymentMethod: maskedCard,
            transactionId,
            bookingData: {
              ...bookingData,
              paymentMethod: maskedCard,
              paymentDate: new Date().toISOString(),
              transactionId,
            }
          });
          return;
        }

        navigation.push("successScreen", {
          paymentMethod: maskedCard,
          transactionId,
          paymentData: {
            ...paymentData,
            sourceType: resolvedSourceType || paymentData?.sourceType || null,
            sourceId: resolvedSourceId || paymentData?.sourceId || null,
            obligationId: resolvedObligationId || paymentData?.obligationId || null,
            paymentMethod: maskedCard,
            paymentDate: new Date().toISOString(),
            transactionId,
          }
        });
        return;
      }

      if (gatewayStatus === 'failed') {
        Alert.alert('Payment Failed', reconciliation.error || 'Card payment failed. Please try again.');
        return;
      }

      Alert.alert(
        'Payment Initiated',
        `Your payment is pending confirmation. Reference: ${transactionId}`
      );
    } catch (error) {
      Alert.alert('Function Error', `Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  }
};

export default CreditCardScreen;
