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
          transaction_id: transactionId,
          mobile_network: selectedNetwork,
          phone_number: cleanPhone,
          transaction_type: transactionType,
          recipient_phone: recipientPhone,
          recipient_description: description,
          status: 'pending',
        };
        
        const paymentResult = await addPayment(paymentData);
        
        if (!paymentResult.success) {
          throw new Error(paymentResult.error || "Payment failed");
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
        transaction_id: transactionId,
        mobile_network: selectedNetwork,
        phone_number: cleanPhone,
        status: 'pending', // Mobile money payments start as pending
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

      {/* Payment Amount */}
      {(amount || bookingData?.totalAmount) && (
        <View style={{
          backgroundColor: Colors.white,
          paddingVertical: Default.fixPadding * 2,
          paddingHorizontal: Default.fixPadding * 2,
          marginVertical: Default.fixPadding,
          alignItems: 'center',
          ...Default.shadow,
        }}>
          <Text style={{ ...Fonts.Medium14grey, marginBottom: Default.fixPadding }}>
            {tr("Amount to Pay")}
          </Text>
          <Text style={{ ...Fonts.Bold24primary }}>
            {amountFormatted || `GHS ${amount?.toFixed(2)}` || `GHS ${bookingData?.totalAmount?.toFixed(2)}` || 'GHS 0.00'}
          </Text>
          
          {transactionType === 'airtime' && (
            <View style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              alignItems: "center",
              marginTop: Default.fixPadding,
            }}>
              {providerLogo && (
                <Image
                  source={providerLogo}
                  style={{
                    width: 24,
                    height: 24,
                    marginRight: isRtl ? 0 : Default.fixPadding * 0.5,
                    marginLeft: isRtl ? Default.fixPadding * 0.5 : 0,
                    resizeMode: "contain",
                  }}
                />
              )}
              <Text style={{ ...Fonts.Medium14grey }}>
                {providerName || ''} {description ? `- ${description}` : ''}
              </Text>
            </View>
          )}
        </View>
      )}

      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: Default.fixPadding * 3 }}
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
                GH₵ {bookingData?.totalAmount?.toFixed(2) || '0.00'}
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
  );
};

export default MobileMoneyScreen;
