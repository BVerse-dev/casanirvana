import React, { useCallback, useEffect, useState } from "react";
import {
  Text,
  View,
  BackHandler,
  TouchableOpacity,
  Dimensions,
  TextInput,
  ScrollView,
  Alert,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import MyStatusBar from "../components/myStatusBar";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Colors, Default, Fonts } from "../constants/styles";
import AwesomeButton from "react-native-really-awesome-button";
import { useUpdateAmenityBooking } from "../hooks/useCreateAmenityBooking";
import { addPayment } from "../services/paymentService";
import { createPaymentNotification } from "../services/notificationService";
import { createAirtimePurchase, createDataPurchase, createMoneyTransfer, createBillPayment, createInsurancePayment, createShoppingPayment } from "../services/personalHubService";
import { saveBillAccount } from "../services/billPaymentService";
import { savePolicy as savePolicyRecord } from "../services/insuranceService";
import { useAuth } from "../contexts/AuthContext";

const { width } = Dimensions.get("window");

const MobileMoneyScreen = ({ navigation, route }) => {
  const { 
    bookingId, 
    bookingData,
    // Airtime purchase params
    provider,
    providerId,
    providerName,
    providerColor,
    providerLogo,
    packageType,
    amountTitle,
    amount,
    amountFormatted,
    phoneNumber: recipientPhone,
    description,
    saveAccount,
    savePolicy,
    transactionType,
    recipientInfo,
    dataAmount,
    validity,
    reference,
    schedulePayment,
    frequency,
    firstPaymentNow,
    platformFee,
    totalAmount,
  } = route.params || {};
  
  const { t, i18n } = useTranslation();
  const { profile, user } = useAuth();
  const updateBookingMutation = useUpdateAmenityBooking();
  const navigateHome = useCallback(() => {
    navigation.navigate("bottomTab", {
      screen: "homeScreen",
      params: { activeTab: "personal" },
    });
  }, [navigation]);

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`mobileMoneyScreen:${key}`);
  }

  const backAction = () => {
    navigation.pop();
    return true;
  };

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => subscription.remove();
  }, []);

  const [selectedNetwork, setSelectedNetwork] = useState("MTN");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isValidPhone, setIsValidPhone] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [paymentReference, setPaymentReference] = useState("");

  const mobileNetworks = [
    {
      id: "MTN",
      name: "MTN Mobile Money",
      color: "#FFCC00",
      icon: "phone-android",
      prefix: ["024", "054", "055", "059"],
    },
    {
      id: "VODAFONE",
      name: "Vodafone Cash",
      color: "#E60000",
      icon: "phone-android",
      prefix: ["020", "050"],
    },
    {
      id: "AIRTELTIGO",
      name: "AirtelTigo Money",
      color: "#FF6B35",
      icon: "phone-android",
      prefix: ["026", "056", "027", "057"],
    },
  ];

  const validatePhoneNumber = (phone) => {
    const cleanPhone = phone.replace(/\s+/g, "");
    if (cleanPhone.length !== 10) return false;
    
    const network = mobileNetworks.find(n => n.id === selectedNetwork);
    if (!network) return false;
    
    return network.prefix.some(prefix => cleanPhone.startsWith(prefix));
  };

  const handlePhoneNumberChange = (text) => {
    // Remove all non-numeric characters
    const cleanedText = text.replace(/[^0-9]/g, "");
    
    // Format phone number with spaces for readability
    let formattedText = cleanedText;
    if (cleanedText.length > 3) {
      formattedText = cleanedText.substring(0, 3) + " " + cleanedText.substring(3);
    }
    if (cleanedText.length > 6) {
      formattedText = cleanedText.substring(0, 3) + " " + cleanedText.substring(3, 6) + " " + cleanedText.substring(6);
    }
    
    setPhoneNumber(formattedText);
    setIsValidPhone(validatePhoneNumber(cleanedText));
  };

  const getTransactionLabel = (type) => {
    switch (type) {
      case "airtime":
        return "airtime purchase";
      case "data":
        return "data purchase";
      case "money_transfer":
        return "money transfer";
      case "bill_payment":
        return "bill payment";
      case "insurance":
        return "insurance payment";
      case "shopping":
        return "shopping payment";
      case "booking":
        return "booking payment";
      default:
        return "payment";
    }
  };

  const persistSavedDestination = async ({ authUserId, profileId }) => {
    if (!authUserId) return;

    if (transactionType === "bill_payment" && saveAccount) {
      await saveBillAccount({
        user_id: authUserId,
        profile_id: profileId || null,
        provider: provider || "unknown",
        provider_name: providerName || null,
        account_number: recipientPhone || "",
        description: description || null,
        is_favorite: false,
      });
    }

    if (transactionType === "insurance" && savePolicy) {
      await savePolicyRecord({
        user_id: authUserId,
        profile_id: profileId || null,
        provider: provider || "unknown",
        provider_name: providerName || null,
        policy_number: recipientPhone || "",
        description: description || null,
        insurance_type: recipientInfo?.policyType || "Insurance",
        insured_name: recipientInfo?.name || description || null,
        is_favorite: false,
      });
    }
  };

  const handlePayment = async () => {
    if (!phoneNumber || !isValidPhone) {
      Alert.alert("Invalid Phone Number", "Please enter a valid phone number for the selected network.");
      return;
    }

    // For airtime and personal hub transactions
    if (transactionType) {
      setIsProcessing(true);
      
      try {
        const cleanPhone = phoneNumber.replace(/\s+/g, "");
        const transactionId = `MM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const authUserId = user?.id || profile?.user_id || null;
        const profileId = profile?.id || null;
        const numericAmount = Number(amount) || 0;
        const numericPlatformFee = Number(platformFee) || 0;
        const numericTotalAmount = Number(totalAmount) || numericAmount;
        
        // Create payment record
        const paymentData = {
          amount: numericAmount,
          payment_method: 'mobile_money',
          payment_type: transactionType || 'airtime',
          transaction_id: transactionId,
          title: `${transactionType ? transactionType.charAt(0).toUpperCase() + transactionType.slice(1) : 'Airtime'} Purchase`,
          description: `${providerName || 'Mobile'} ${transactionType || 'airtime'} purchase for ${description || recipientPhone || 'user'}`,
          payment_gateway: 'mobile_money',
          status: 'pending',
          // Required field - use the user's unit_id from profile
          unit_id: profile?.unit_id || null,
          payer_id: authUserId,
          // Store mobile network details in metadata
          metadata: {
            mobile_network: selectedNetwork,
            phone_number: cleanPhone,
            recipient_phone: recipientPhone,
            recipient_description: description,
            reference,
            schedule_payment: schedulePayment,
            frequency,
            first_payment_now: firstPaymentNow
          }
        };
        
        const paymentResult = await addPayment(paymentData);
        
        if (paymentResult.error || !paymentResult.data) {
          throw new Error(paymentResult.error?.message || "Payment failed");
        }
        
        // Create transaction record based on transaction type
        let transactionResult;
        
        switch(transactionType) {
          case 'airtime':
            transactionResult = await createAirtimePurchase({
              user_id: authUserId,
              profile_id: profileId,
              provider: provider || 'unknown',
              provider_id: providerId || null,
              phone_number: recipientPhone || '',
              description: description || '',
              amount: numericAmount,
              status: 'pending',
              payment_ref_id: paymentResult.data.id
            });
            break;
            
          case 'data':
            transactionResult = await createDataPurchase({
              user_id: authUserId,
              profile_id: profileId,
              provider: provider || 'unknown',
              provider_id: providerId || null,
              phone_number: recipientPhone || '',
              description: description || '',
              package_name: amountTitle || 'Data Bundle',
              data_amount: dataAmount || '1GB',
              validity_days: validity ? parseInt(validity) : 30,
              amount: numericAmount,
              status: 'pending',
              payment_ref_id: paymentResult.data.id
            });
            break;
            
          case 'money_transfer':
            transactionResult = await createMoneyTransfer({
              user_id: authUserId,
              profile_id: profileId,
              provider_id: providerId || null,
              recipient_name: description || 'Recipient',
              recipient_phone: recipientPhone || '',
              amount: numericAmount,
              fee: numericPlatformFee,
              total_amount: numericTotalAmount,
              status: 'pending',
              payment_ref_id: paymentResult.data.id
            });
            break;
            
          case 'bill_payment':
            transactionResult = await createBillPayment({
              user_id: authUserId,
              profile_id: profileId,
              bill_type: description || 'Utility',
              provider: provider || 'unknown',
              provider_id: providerId || null,
              account_number: recipientPhone || '',
              customer_name: description || '',
              amount: numericAmount,
              fee: 0,
              total_amount: numericAmount,
              status: 'pending',
              payment_ref_id: paymentResult.data.id
            });
            break;
            
          case 'insurance':
            transactionResult = await createInsurancePayment({
              user_id: authUserId,
              profile_id: profileId,
              insurance_type: description || 'General',
              provider: provider || 'unknown',
              provider_id: providerId || null,
              policy_number: recipientPhone || '',
              insured_name: description || '',
              coverage_period: '1 year',
              amount: numericAmount,
              fee: 0,
              total_amount: numericAmount,
              status: 'pending',
              payment_ref_id: paymentResult.data.id
            });
            break;
            
          case 'shopping':
            transactionResult = await createShoppingPayment({
              user_id: authUserId,
              profile_id: profileId,
              merchant: provider || 'unknown',
              order_number: recipientPhone || '',
              items: [{ name: description || 'Item', price: numericAmount }],
              amount: numericAmount,
              shipping_fee: 0,
              tax: 0,
              total_amount: numericAmount,
              status: 'pending',
              payment_ref_id: paymentResult.data.id
            });
            break;
            
          default:
            console.log(`No specific handler for transaction type: ${transactionType}`);
        }
        
        if (transactionResult && !transactionResult.success) {
          console.warn(`Warning: Transaction record creation had an issue: ${transactionResult.error}`);
          // Continue with the flow even if transaction record creation fails
        }
        
        await persistSavedDestination({ authUserId, profileId });

        // Create pending notification
        await createPaymentNotification({
          transaction_type: transactionType,
          transaction_id: transactionId,
          amount: numericAmount,
          amount_formatted: amountFormatted,
          data_amount: dataAmount,
          validity,
          status: "pending",
        });

        // Show pending confirmation modal
        setPaymentReference(transactionId);
        setIsProcessing(false);
        setShowConfirmationModal(true);
        
      } catch (error) {
        console.error("Mobile Money payment error:", error);
        Alert.alert("Payment Failed", "There was an error processing your payment. Please try again.");
        setIsProcessing(false);
      }
      
      return;
    }
    
    // For booking payments (original flow)
    if (!bookingId) {
      Alert.alert("Error", "Booking information is missing.");
      return;
    }

    setIsProcessing(true);

    try {
      const cleanPhone = phoneNumber.replace(/\s+/g, "");
      const transactionId = `MM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const bookingType = bookingData?.type || 'booking';

      // Create payment record
      const paymentData = {
        amount: bookingData.totalAmount,
        payment_method: 'mobile_money',
        payment_type: bookingType,
        transaction_id: transactionId,
        title: `Booking Payment`,
        description: `Payment for booking #${bookingId}`,
        payment_gateway: 'mobile_money',
        status: 'pending', // Mobile money payments start as pending
        // Required field - use the user's unit_id from profile
        unit_id: profile?.unit_id || bookingData?.unit_id || null,
        payer_id: user?.id || profile?.user_id || null,
        // Store mobile network details in metadata
        metadata: {
          mobile_network: selectedNetwork,
          phone_number: cleanPhone,
          source_booking_id: bookingId || null,
          source_booking_type: bookingType,
        }
      };

      const paymentResult = await addPayment(paymentData);

      if (!paymentResult.error && paymentResult.data) {
        // Update booking status
        if (bookingData?.type !== 'service_booking') {
          await updateBookingMutation.mutateAsync({
            id: bookingId,
            updates: {
              payment_status: 'pending',
              status: 'pending',
            }
          });
        }

        // Create pending notification and show confirmation modal
        await createPaymentNotification({
          transaction_type: bookingType,
          transaction_id: transactionId,
          amount: bookingData.totalAmount,
          amount_formatted: `GHS ${bookingData.totalAmount?.toFixed(2)}`,
          status: "pending",
        });

        setPaymentReference(transactionId);
        setIsProcessing(false);
        setShowConfirmationModal(true);
      } else {
        throw new Error(paymentResult.error?.message || "Payment failed");
      }
    } catch (error) {
      console.error("Mobile Money payment error:", error);
      Alert.alert("Payment Failed", "There was an error processing your payment. Please try again.");
      setIsProcessing(false);
    }
  };

  const renderNetworkOption = (network) => {
    const isSelected = selectedNetwork === network.id;
    return (
      <TouchableOpacity
        key={network.id}
        style={{
          flexDirection: isRtl ? "row-reverse" : "row",
          alignItems: "center",
          padding: Default.fixPadding * 1.5,
          marginHorizontal: Default.fixPadding * 2,
          marginBottom: Default.fixPadding,
          borderRadius: 10,
          backgroundColor: Colors.white,
          borderWidth: isSelected ? 2 : 1,
          borderColor: isSelected ? Colors.primary : Colors.lightGrey,
          ...Default.shadow,
        }}
        onPress={() => setSelectedNetwork(network.id)}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: network.color + '15',
            justifyContent: "center",
            alignItems: "center",
            marginRight: isRtl ? 0 : Default.fixPadding,
            marginLeft: isRtl ? Default.fixPadding : 0,
          }}
        >
          <MaterialIcons
            name={network.icon}
            size={20}
            color={network.color}
          />
        </View>
        
        <View style={{ flex: 1 }}>
          <Text
            style={{
              ...Fonts.SemiBold16black,
              textAlign: isRtl ? "right" : "left",
            }}
          >
            {network.name}
          </Text>
          <Text
            style={{
              ...Fonts.Medium12grey,
              textAlign: isRtl ? "right" : "left",
              marginTop: 2,
            }}
          >
            {network.prefix.join(", ")}
          </Text>
        </View>
        
        <MaterialCommunityIcons
          name={isSelected ? "record-circle" : "circle-outline"}
          size={20}
          color={isSelected ? Colors.primary : Colors.lightGrey}
        />
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
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
            Mobile Money Payment
          </Text>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: Default.fixPadding * 3 }}
          keyboardShouldPersistTaps="handled"
        >
        {/* Amount Summary */}
        <View
          style={{
            marginHorizontal: Default.fixPadding * 2,
            marginTop: Default.fixPadding * 2,
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
                {amountFormatted || (amount ? `GHS ${amount.toFixed(2)}` : bookingData?.totalAmount ? `GHS ${bookingData.totalAmount.toFixed(2)}` : 'GHS 0.00')}
              </Text>
            </View>
          </View>
        </View>

        {/* Network Selection */}
        <View style={{ marginBottom: Default.fixPadding * 2 }}>
          <Text
            style={{
              ...Fonts.SemiBold16black,
              textAlign: isRtl ? "right" : "left",
              marginHorizontal: Default.fixPadding * 2,
              marginBottom: Default.fixPadding,
            }}
          >
            Select Mobile Network
          </Text>
          {mobileNetworks.map(renderNetworkOption)}
        </View>

        {/* Phone Number Input */}
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
                marginBottom: Default.fixPadding,
              }}
            >
              Phone Number
            </Text>
            
            <TextInput
              value={phoneNumber}
              onChangeText={handlePhoneNumberChange}
              placeholder="024 123 4567"
              keyboardType="phone-pad"
              maxLength={12} // For formatted number with spaces
              style={{
                ...(isValidPhone ? Fonts.Medium16black : Fonts.Medium16red),
                textAlign: isRtl ? "right" : "left",
                paddingVertical: Default.fixPadding * 1.2,
                paddingHorizontal: Default.fixPadding * 1.5,
                borderRadius: 10,
                backgroundColor: Colors.extraLightGrey,
                borderWidth: 1,
                borderColor: isValidPhone ? Colors.lightGrey : Colors.red,
              }}
            />
            
            {!isValidPhone && phoneNumber.length > 0 && (
              <Text
                style={{
                  ...Fonts.Medium12red,
                  textAlign: isRtl ? "right" : "left",
                  marginTop: Default.fixPadding * 0.5,
                }}
              >
                Please enter a valid {selectedNetwork} number
              </Text>
            )}
          </View>
        </View>

        {/* Payment Instructions */}
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
            <Text
              style={{
                ...Fonts.SemiBold14primary,
                textAlign: isRtl ? "right" : "left",
                marginBottom: Default.fixPadding * 0.5,
              }}
            >
              Payment Instructions
            </Text>
            <Text
              style={{
                ...Fonts.Medium12black,
                textAlign: isRtl ? "right" : "left",
                lineHeight: 18,
              }}
            >
              1. You will receive a payment prompt on your phone{'\n'}
              2. Enter your mobile money PIN to authorize the payment{'\n'}
              3. You will receive a status update once the provider confirms processing
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
          backgroundShadow={Colors.primary}
          backgroundDarker={Colors.primary}
          backgroundColor={Colors.primary}
          disabled={isProcessing || !isValidPhone || !phoneNumber}
        >
          <Text style={{ ...Fonts.SemiBold18white }}>
            {isProcessing ? "Processing..." : "Pay Now"}
          </Text>
        </AwesomeButton>
      </View>

      {/* Payment Confirmation Modal */}
      <Modal
        visible={showConfirmationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowConfirmationModal(false);
          navigateHome();
        }}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: Default.fixPadding * 2,
        }}>
          <View style={{
            width: '90%',
            backgroundColor: Colors.white,
            borderRadius: 15,
            padding: Default.fixPadding * 2,
            ...Default.shadow,
          }}>
            <View style={{
              alignItems: 'center',
              marginBottom: Default.fixPadding * 2,
            }}>
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: Colors.primary + '20',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: Default.fixPadding * 1.5,
              }}>
                <MaterialCommunityIcons
                  name="cellphone-check"
                  size={50}
                  color={Colors.primary}
                />
              </View>
              <Text style={{ ...Fonts.SemiBold18black, textAlign: 'center' }}>
                Payment Initiated
              </Text>
              <Text style={{ 
                ...Fonts.Medium14grey, 
                textAlign: 'center',
                marginTop: Default.fixPadding,
                marginHorizontal: Default.fixPadding,
              }}>
                Your {getTransactionLabel(transactionType || "booking")} has been submitted and is pending mobile money confirmation.
              </Text>
              {paymentReference ? (
                <Text style={{
                  ...Fonts.Medium13black,
                  textAlign: "center",
                  marginTop: Default.fixPadding,
                }}>
                  Reference: {paymentReference}
                </Text>
              ) : null}
            </View>
            
            <TouchableOpacity
              style={{
                backgroundColor: Colors.primary,
                paddingVertical: Default.fixPadding * 1.2,
                borderRadius: 10,
                alignItems: 'center',
              }}
              onPress={() => {
                setShowConfirmationModal(false);
                navigateHome();
              }}
            >
              <Text style={{ ...Fonts.SemiBold16white }}>
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  </KeyboardAvoidingView>
  );
};

export default MobileMoneyScreen;
