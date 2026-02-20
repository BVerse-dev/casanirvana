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
import MyStatusBar from "../components/myStatusBar";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Colors, Default, Fonts } from "../constants/styles";
import AwesomeButton from "react-native-really-awesome-button";
import CreditCard from "react-native-credit-card-ui";
import * as cardValidator from "card-validator";
import { useUpdateAmenityBooking } from "../hooks/useCreateAmenityBooking";
import { addPayment } from "../services/paymentService";
import { supabase } from "../utils/supabase";
import { useHasJoinedCommunity } from "../hooks/useCommunityData";

const { width } = Dimensions.get("window");

const CreditCardScreen = ({ navigation, route }) => {
  const { bookingId, bookingData, paymentData, isAddingPaymentMethod, onPaymentMethodAdded } = route.params || {};
  const { t, i18n } = useTranslation();
  const updateBookingMutation = useUpdateAmenityBooking();
  
  // Determine if this is for adding a payment method or making a payment
  const isAddingMode = isAddingPaymentMethod === true;
  const { profile } = useHasJoinedCommunity();

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`creditCardScreen:${key}`);
  }

  const backAction = () => {
    navigation.pop();
    return true;
  };

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => subscription.remove();
  }, []);

  const [focused, setFocused] = useState("name");
  const [backspaceRemove, setBackspaceRemove] = useState(false);
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
    try {
      console.log('🚀 handlePayment called!', { isAddingMode, name, number: number.slice(-4) });
      console.log('🔍 Step 1: Function started successfully');
      
      // Immediate debug - let's see what's in our form fields
      console.log('📋 RAW FORM DATA:', { 
        name: `"${name}"`, 
        nameLength: name.length,
        number: `"${number}"`, 
        numberLength: number.length,
        cvvCode: `"${cvvCode}"`,
        cvvLength: cvvCode.length,
        expiryDate: `"${expiryDate}"`,
        expiryLength: expiryDate.length
      });
      console.log('🔍 Step 2: Raw data logged');

      console.log('🔍 Step 3: Basic function test passed, proceeding with validation...');
      
      // Form validation
      console.log('🔍 Step 4: Starting form validation...');
      console.log('🔍 Form validation check:', { 
      name: name.trim(), 
      nameValid: !!name.trim(),
      number: number.slice(-4),
      numberValid: cardValidator.number(number).isValid,
        cvv: cvvCode,
        cvvValid: cardValidator.cvv(cvvCode).isValid,
        expiry: expiryDate,
        expiryValid: cardValidator.expirationDate(expiryDate).isValid
      });
      
      // Validate form inputs
      if (!name.trim()) {
        console.log('❌ Name validation failed');
        setIsValidName(false);
        Alert.alert('Validation Error', 'Please enter cardholder name');
        return;
      }

      if (!cardValidator.number(number).isValid) {
        console.log('❌ Card number validation failed');
        setIsValidNumber(false);
        Alert.alert('Validation Error', 'Please enter a valid card number');
        return;
      }

      if (!cardValidator.cvv(cvvCode).isValid) {
        console.log('❌ CVV validation failed');
        setIsValidCvv(false);
        Alert.alert('Validation Error', 'Please enter a valid CVV');
        return;
      }

      if (!cardValidator.expirationDate(expiryDate).isValid) {
        console.log('❌ Expiry validation failed');
        setIsValidExpiry(false);
        Alert.alert('Validation Error', 'Please enter a valid expiry date');
        return;
      }

      console.log('✅ All validations passed, proceeding...');

      // Handle adding payment method mode
      if (isAddingMode) {
        console.log('🔄 Adding payment method mode detected');
        console.log('👤 Profile:', profile);
      
      // Check current auth user
      const { data: { user } } = await supabase.auth.getUser();
      console.log('🔐 Current auth user:', user?.id);
      console.log('🆔 Profile ID vs Auth ID:', { profileId: profile.id, authId: user?.id, match: profile.id === user?.id });
      
      if (!profile?.id) {
        console.error('❌ No profile ID found');
        Alert.alert('Error', 'User profile not found');
        return;
      }

      console.log('💳 Starting to save payment method...');
      setIsProcessing(true);

      // Parse expiry date
        console.log('🔍 Parsing expiry date:', expiryDate);
        const expiryParts = expiryDate.split('/');
        const expiryMonth = parseInt(expiryParts[0], 10);
        const expiryYear = parseInt(`20${expiryParts[1]}`, 10);
        console.log('📅 Parsed expiry:', { expiryMonth, expiryYear });

        // Get card brand
        const cardInfo = cardValidator.number(number);
        const cardBrand = cardInfo.card?.type || 'unknown';

        // Use auth user ID for RLS policy compliance
        const userId = user?.id || profile.id;
        console.log('🎯 Using user ID for insert:', userId);
        
        console.log('📊 Payment method data to save:', {
          user_id: userId,
          payment_type: 'card',
          card_last_four: number.slice(-4),
          card_brand: cardBrand.charAt(0).toUpperCase() + cardBrand.slice(1),
          card_expiry_month: expiryMonth,
          card_expiry_year: expiryYear
        });

        // Save payment method to database
        console.log('🚀 About to call Supabase insert...');
        const { data, error } = await supabase
          .from('user_payment_methods')
          .insert({
            user_id: userId,
            payment_type: 'card',
            card_last_four: number.slice(-4),
            card_brand: cardBrand.charAt(0).toUpperCase() + cardBrand.slice(1),
            card_expiry_month: expiryMonth,
            card_expiry_year: expiryYear,
            is_default: false, // Let user set default later
            is_active: true
          })
          .select();

        console.log('💾 Database response:', { data, error });
        console.log('💾 Data details:', JSON.stringify(data, null, 2));
        console.log('💾 Error details:', JSON.stringify(error, null, 2));

        if (error) {
          console.error('❌ Error saving payment method:', error);
          Alert.alert('Error', `Failed to save payment method: ${error.message}`);
          setIsProcessing(false);
          return;
        }

        setIsProcessing(false);

        // Save payment method details for modal display
        setSavedPaymentMethod({
          type: 'Credit Card',
          brand: cardBrand.charAt(0).toUpperCase() + cardBrand.slice(1),
          lastFour: number.slice(-4),
          expiry: expiryDate
        });

        // Show success modal
        setShowSuccessModal(true);
        return;
      }
    } catch (error) {
      console.error('💥 ERROR in handlePayment:', error);
      console.error('💥 Error message:', error.message);
      console.error('💥 Error stack:', error.stack);
      Alert.alert('Function Error', `Error: ${error.message}`);
      setIsProcessing(false);
      return;
    }

    // Check if we have either booking data or payment data (for payment mode)
    if (!bookingData && !paymentData) {
      Alert.alert('Error', 'Payment information is missing');
      return;
    }

    setIsProcessing(true);

    try {
      // Generate transaction ID
      const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      if (bookingData) {
        // Handle amenity booking payment
        const paymentRecord = {
          booking_id: bookingId,
          amount: bookingData.totalAmount,
          payment_method: 'card',
          transaction_id: transactionId,
          card_last_four: number.slice(-4),
          cardholder_name: name,
          status: 'completed',
          payment_date: new Date().toISOString(),
          payment_type: 'amenity_booking',
          description: `Payment for ${bookingData.amenityName} booking`,
        };

        console.log('Processing booking payment:', paymentRecord);

        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Add payment record to database
        const paymentResult = await addPayment(paymentRecord);

        if (paymentResult.error) {
          throw new Error(paymentResult.error);
        }

        // Update booking status to confirmed and payment status to paid
        await updateBookingMutation.mutateAsync({
          id: bookingId,
          updates: {
            status: 'confirmed',
            payment_status: 'paid',
          }
        });

        // Navigate to success screen with booking details
        navigation.push("successScreen", {
          bookingId,
          bookingData: {
            ...bookingData,
            paymentMethod: `**** **** **** ${number.slice(-4)}`,
            paymentDate: new Date().toISOString(),
            transactionId,
          }
        });

      } else if (paymentData) {
        // Handle general payment
        const paymentRecord = {
          amount: paymentData.amount,
          payment_method: 'card',
          transaction_id: transactionId,
          card_last_four: number.slice(-4),
          cardholder_name: name,
          status: 'completed',
          payment_date: new Date().toISOString(),
          payment_type: 'community_dues',
          description: paymentData.title || paymentData.description || 'Community Payment',
          due_date: paymentData.dueDate,
        };

        console.log('Processing general payment:', paymentRecord);

        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Add payment record to database
        const paymentResult = await addPayment(paymentRecord);

        if (paymentResult.error) {
          throw new Error(paymentResult.error);
        }

        // Navigate to success screen with payment details
        navigation.push("successScreen", {
          paymentData: {
            ...paymentData,
            paymentMethod: `**** **** **** ${number.slice(-4)}`,
            paymentDate: new Date().toISOString(),
            transactionId,
          }
        });
      }

    } catch (error) {
      console.error('💥 ERROR in handlePayment:', error);
      console.error('💥 Error message:', error.message);
      console.error('💥 Error stack:', error.stack);
      Alert.alert('Function Error', `Error: ${error.message}`);
      setIsProcessing(false);
    }
  }
};

export default CreditCardScreen;
