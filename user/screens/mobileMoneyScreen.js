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
import { useAuth } from "../contexts/AuthContext";

const { width } = Dimensions.get("window");

const MobileMoneyScreen = ({ navigation, route }) => {
  const { 
    bookingId, 
    bookingData,
    // Airtime purchase params
    provider,
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
    transactionType,
    recipientInfo
  } = route.params || {};
  
  const { t, i18n } = useTranslation();
  const { profile } = useAuth();
  const updateBookingMutation = useUpdateAmenityBooking();

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`mobileMoneyScreen:${key}`);
  }

  const backAction = () => {
    navigation.pop();
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => {
      const subscription = BackHandler.addEventListener("hardwareBackPress", backAction);
      return () => subscription?.remove();
    };
  }, []);

  const [selectedNetwork, setSelectedNetwork] = useState("MTN");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isValidPhone, setIsValidPhone] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

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
        
        // Create payment record
        const paymentData = {
          amount: amount || 0,
          payment_method: 'mobile_money',
          payment_type: transactionType || 'airtime',
          transaction_id: transactionId,
          title: `${transactionType ? transactionType.charAt(0).toUpperCase() + transactionType.slice(1) : 'Airtime'} Purchase`,
          description: `${providerName || 'Mobile'} ${transactionType || 'airtime'} purchase for ${description || recipientPhone || 'user'}`,
          payment_gateway: 'mobile_money',
          status: 'pending',
          // Required field - use the user's unit_id from profile
          unit_id: profile?.unit_id || '',
          payer_id: profile?.id || '',
          // Store mobile network details in metadata
          metadata: {
            mobile_network: selectedNetwork,
            phone_number: cleanPhone,
            recipient_phone: recipientPhone,
            recipient_description: description
          }
        };
        
        const paymentResult = await addPayment(paymentData);
        
        if (!paymentResult.success) {
          throw new Error(paymentResult.error || "Payment failed");
        }
        
        // Create transaction record based on transaction type
        let transactionResult;
        
        switch(transactionType) {
          case 'airtime':
            transactionResult = await createAirtimePurchase({
              user_id: profile?.user_id,
              profile_id: profile?.id,
              provider: provider || 'unknown',
              phone_number: recipientPhone || '',
              description: description || '',
              amount: amount || 0,
              status: 'pending',
              payment_id: paymentResult.data.id
            });
            break;
            
          case 'data':
            transactionResult = await createDataPurchase({
              user_id: profile?.user_id,
              profile_id: profile?.id,
              provider: provider || 'unknown',
              phone_number: recipientPhone || '',
              description: description || '',
              package_name: amountTitle || 'Data Bundle',
              data_amount: description || '1GB',
              validity_days: 30,
              amount: amount || 0,
              status: 'pending',
              payment_id: paymentResult.data.id
            });
            break;
            
          case 'money_transfer':
            transactionResult = await createMoneyTransfer({
              user_id: profile?.user_id,
              profile_id: profile?.id,
              recipient_name: description || 'Recipient',
              recipient_phone: recipientPhone || '',
              amount: amount || 0,
              fee: 0,
              total_amount: amount || 0,
              status: 'pending',
              payment_id: paymentResult.data.id
            });
            break;
            
          case 'bill_payment':
            transactionResult = await createBillPayment({
              user_id: profile?.user_id,
              profile_id: profile?.id,
              bill_type: description || 'Utility',
              provider: provider || 'unknown',
              account_number: recipientPhone || '',
              customer_name: description || '',
              amount: amount || 0,
              fee: 0,
              total_amount: amount || 0,
              status: 'pending',
              payment_id: paymentResult.data.id
            });
            break;
            
          case 'insurance':
            transactionResult = await createInsurancePayment({
              user_id: profile?.user_id,
              profile_id: profile?.id,
              insurance_type: description || 'General',
              provider: provider || 'unknown',
              policy_number: recipientPhone || '',
              insured_name: description || '',
              coverage_period: '1 year',
              amount: amount || 0,
              fee: 0,
              total_amount: amount || 0,
              status: 'pending',
              payment_id: paymentResult.data.id
            });
            break;
            
          case 'shopping':
            transactionResult = await createShoppingPayment({
              user_id: profile?.user_id,
              profile_id: profile?.id,
              merchant: provider || 'unknown',
              order_number: recipientPhone || '',
              items: [{ name: description || 'Item', price: amount || 0 }],
              amount: amount || 0,
              shipping_fee: 0,
              tax: 0,
              total_amount: amount || 0,
              status: 'pending',
              payment_id: paymentResult.data.id
            });
            break;
            
          default:
            console.log(`No specific handler for transaction type: ${transactionType}`);
        }
        
        if (transactionResult && !transactionResult.success) {
          console.warn(`Warning: Transaction record creation had an issue: ${transactionResult.error}`);
          // Continue with the flow even if transaction record creation fails
        }
        
        // Show confirmation modal
        setIsProcessing(false);
        setShowConfirmationModal(true);
        
        // Simulate payment processing and success after 3 seconds
        setTimeout(async () => {
          setPaymentSuccess(true);
          
          // Create notification for successful payment
          try {
            const notificationResult = await createPaymentNotification({
              ...paymentData,
              amount_formatted: amountFormatted
            });
            
            if (!notificationResult.success) {
              console.error('Failed to create payment notification:', notificationResult.error);
            }
          } catch (notificationError) {
            console.error('Error creating payment notification:', notificationError);
          }
        }, 3000);
        
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

      // Create payment record
      const paymentData = {
        booking_id: bookingId,
        amount: bookingData.totalAmount,
        payment_method: 'mobile_money',
        payment_type: 'booking',
        transaction_id: transactionId,
        title: `Booking Payment`,
        description: `Payment for booking #${bookingId}`,
        payment_gateway: 'mobile_money',
        status: 'pending', // Mobile money payments start as pending
        // Required field - use the user's unit_id from profile
        unit_id: profile?.unit_id || bookingData?.unit_id || '',
        payer_id: profile?.id || '',
        // Store mobile network details in metadata
        metadata: {
          mobile_network: selectedNetwork,
          phone_number: cleanPhone
        }
      };

      const paymentResult = await addPayment(paymentData);

      if (paymentResult.success) {
        // Update booking status
        await updateBookingMutation.mutateAsync({
          id: bookingId,
          updates: {
            payment_status: 'pending',
            status: 'pending',
          }
        });

        // Show confirmation modal instead of navigating directly
        setIsProcessing(false);
        setShowConfirmationModal(true);
        
        // Simulate payment processing and success after 3 seconds
        setTimeout(async () => {
          setPaymentSuccess(true);
          
          // Create notification for successful payment
          try {
            const notificationResult = await createPaymentNotification({
              ...paymentData,
              amount_formatted: `GHS ${bookingData.totalAmount?.toFixed(2)}`
            });
            
            if (!notificationResult.success) {
              console.error('Failed to create payment notification:', notificationResult.error);
            }
          } catch (notificationError) {
            console.error('Error creating payment notification:', notificationError);
          }
        }, 3000);
      } else {
        throw new Error(paymentResult.error || "Payment failed");
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
              3. You will receive a confirmation SMS upon successful payment
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
          if (paymentSuccess) {
            // If payment is successful, navigate to home screen personal tab
            navigation.navigate("homeScreen", { activeTab: 'personal' });
          } else {
            setShowConfirmationModal(false);
          }
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
            {paymentSuccess ? (
              // Success state
              <>
                <View style={{
                  alignItems: 'center',
                  marginBottom: Default.fixPadding * 2,
                }}>
                  <View style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: Colors.green + '20',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: Default.fixPadding * 1.5,
                  }}>
                    <MaterialIcons
                      name="check-circle"
                      size={50}
                      color={Colors.green}
                    />
                  </View>
                  <Text style={{ ...Fonts.SemiBold18black, textAlign: 'center' }}>
                    Payment Successful
                  </Text>
                  <Text style={{ 
                    ...Fonts.Medium14grey, 
                    textAlign: 'center',
                    marginTop: Default.fixPadding,
                    marginHorizontal: Default.fixPadding,
                  }}>
                    Your payment has been processed successfully.
                  </Text>
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
                    navigation.navigate("homeScreen", { activeTab: 'personal' });
                  }}
                >
                  <Text style={{ ...Fonts.SemiBold16white }}>
                    Done
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              // Processing state
              <>
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
                    Payment Processing
                  </Text>
                  <Text style={{ 
                    ...Fonts.Medium14grey, 
                    textAlign: 'center',
                    marginTop: Default.fixPadding,
                    marginHorizontal: Default.fixPadding,
                  }}>
                    You will receive a prompt on your phone to enter your mobile money PIN to approve this payment.
                  </Text>
                </View>
                
                <TouchableOpacity
                  style={{
                    backgroundColor: Colors.grey,
                    paddingVertical: Default.fixPadding * 1.2,
                    borderRadius: 10,
                    alignItems: 'center',
                  }}
                  onPress={() => setShowConfirmationModal(false)}
                >
                  <Text style={{ ...Fonts.SemiBold16white }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  </KeyboardAvoidingView>
  );
};

export default MobileMoneyScreen;
