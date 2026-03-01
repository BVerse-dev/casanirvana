import React, { useCallback, useEffect, useState } from "react";
import {
  Text,
  View,
  BackHandler,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
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
import { createPaymentNotification } from "../services/notificationService";
import {
  createAirtimePurchase,
  createDataPurchase,
  createMoneyTransfer,
  createBillPayment,
  createInsurancePayment,
  createShoppingPayment,
  updateTransactionStatus,
} from "../services/personalHubService";
import { saveBillAccount } from "../services/billPaymentService";
import { savePolicy as savePolicyRecord } from "../services/insuranceService";
import { useAuth } from "../contexts/AuthContext";
import {
  initiateExpressPayPayment,
  reconcileExpressPayPayment,
} from "../services/expressPayService";
import { normalizeOptionalUuid } from "../utils/id";
import { formatMoney } from "../utils/money";

const MobileMoneyScreen = ({ navigation, route }) => {
  const { 
    bookingId, 
    bookingData,
    paymentData,
    sourceType,
    sourceId,
    obligationId,
    // Airtime purchase params
    provider,
    providerId,
    providerName,
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
  
  const { i18n } = useTranslation();
  const { profile, user } = useAuth();
  const updateBookingMutation = useUpdateAmenityBooking();
  const navigateHome = useCallback(() => {
    navigation.navigate("bottomTab", {
      screen: "homeScreen",
      params: { activeTab: "personal" },
    });
  }, [navigation]);

  const isRtl = i18n.dir() === "rtl";

  const backAction = useCallback(() => {
    navigation.pop();
    return true;
  }, [navigation]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => subscription.remove();
  }, [backAction]);

  const [selectedNetwork, setSelectedNetwork] = useState("MTN");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isValidPhone, setIsValidPhone] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationStatus, setConfirmationStatus] = useState("pending");
  const [paymentReference, setPaymentReference] = useState("");
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

  const buildPersonalHubSuccessPayload = ({
    recordId,
    paymentId,
    transactionId,
    paidAmount,
  }) => ({
    id: recordId || paymentId || null,
    paymentId,
    type: transactionType || "payment",
    sourceType: transactionType || "payment",
    sourceId: recordId || null,
    title: providerName || getTransactionLabel(transactionType || "payment"),
    description: description || recipientPhone || providerName || "Personal Hub Payment",
    amount: paidAmount,
    paymentMethod: "Mobile Money",
    paymentDate: new Date().toISOString(),
    transactionId,
  });

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

    const normalizeGatewayStatus = (status) => {
      if (!status) return "pending";
      const normalized = String(status).toLowerCase();
      if (normalized === "processing" || normalized === "initiated") return "pending";
      return normalized;
    };

    const mapBookingPaymentStatus = (status) => {
      if (status === "completed") return "paid";
      if (status === "failed") return "failed";
      return "pending";
    };

    if (!transactionType && !bookingData && !paymentData) {
      Alert.alert("Payment Failed", "Payment information is missing.");
      return;
    }

    setIsProcessing(true);

    try {
      const cleanPhone = phoneNumber.replace(/\s+/g, "");
      const authUserId = user?.id || profile?.user_id || null;
      const profileId = profile?.id || null;
      const unitId = profile?.unit_id || bookingData?.unit_id || paymentData?.unit_id || null;
      const isPersonalHubTransaction = Boolean(transactionType);
      const paymentType = isPersonalHubTransaction
        ? transactionType
        : bookingData?.type || paymentData?.type || paymentData?.payment_type || "community_dues";
      const numericAmount = Number(
        isPersonalHubTransaction ? amount : bookingData?.totalAmount ?? paymentData?.amount
      ) || 0;
      const numericPlatformFee = Number(platformFee) || 0;
      const numericTotalAmount = Number(totalAmount) || numericAmount;

      if (!authUserId || !unitId) {
        throw new Error("Unable to resolve payer/unit for payment.");
      }

      const initiationResult = await initiateExpressPayPayment({
        amount: numericAmount,
        currency: "GHS",
        payment_type: paymentType,
        payment_method: "mobile_money",
        unit_id: unitId,
        booking_id: resolvedSourceType === "service_booking" ? resolvedBookingId || undefined : undefined,
        source_type: !isPersonalHubTransaction ? resolvedSourceType || undefined : undefined,
        source_id: !isPersonalHubTransaction ? resolvedSourceId || undefined : undefined,
        obligation_id: !isPersonalHubTransaction ? resolvedObligationId || undefined : undefined,
        description: isPersonalHubTransaction
          ? `${providerName || "Mobile"} ${paymentType} for ${description || recipientPhone || "resident"}`
          : bookingData
            ? `Payment for booking #${resolvedBookingId || "amenity"}`
            : paymentData?.title || paymentData?.description || "Community Payment",
        idempotency_key: `mm-${authUserId}-${paymentType}-${Date.now()}`,
        metadata: {
          source: "user-mobile-money-screen",
          mobile_network: selectedNetwork,
          payer_phone: cleanPhone,
          recipient_phone: recipientPhone || null,
          recipient_description: description || null,
          reference: reference || null,
          schedule_payment: schedulePayment || false,
          frequency: frequency || null,
          first_payment_now: firstPaymentNow || false,
          source_booking_id: resolvedBookingId || null,
          source_booking_type: bookingData?.type || null,
        },
      });

      if (!initiationResult.success || !initiationResult.data?.payment_id) {
        throw new Error(initiationResult.error || "Unable to initiate payment.");
      }

      const gatewayPayment = initiationResult.data;
      const gatewayTransactionId =
        gatewayPayment.provider_reference ||
        gatewayPayment.transaction_id ||
        `MM-${Date.now()}`;
      const gatewayPaymentId = gatewayPayment.payment_id;
      let personalHubRecord = null;

      if (isPersonalHubTransaction) {
        switch (transactionType) {
          case "airtime":
            personalHubRecord = await createAirtimePurchase({
              user_id: authUserId,
              profile_id: profileId,
              provider: provider || "unknown",
              provider_id: providerId || null,
              phone_number: recipientPhone || "",
              description: description || "",
              amount: numericAmount,
              status: "pending",
              payment_ref_id: gatewayPaymentId,
            });
            break;
          case "data":
            personalHubRecord = await createDataPurchase({
              user_id: authUserId,
              profile_id: profileId,
              provider: provider || "unknown",
              provider_id: providerId || null,
              phone_number: recipientPhone || "",
              description: description || "",
              package_name: amountTitle || "Data Bundle",
              data_amount: dataAmount || "1GB",
              validity_days: validity ? parseInt(validity, 10) : 30,
              amount: numericAmount,
              status: "pending",
              payment_ref_id: gatewayPaymentId,
            });
            break;
          case "money_transfer":
            personalHubRecord = await createMoneyTransfer({
              user_id: authUserId,
              profile_id: profileId,
              provider_id: providerId || null,
              recipient_name: description || "Recipient",
              recipient_phone: recipientPhone || "",
              amount: numericAmount,
              fee: numericPlatformFee,
              total_amount: numericTotalAmount,
              status: "pending",
              payment_ref_id: gatewayPaymentId,
            });
            break;
          case "bill_payment":
            personalHubRecord = await createBillPayment({
              user_id: authUserId,
              profile_id: profileId,
              bill_type: description || "Utility",
              provider: provider || "unknown",
              provider_id: providerId || null,
              account_number: recipientPhone || "",
              customer_name: description || "",
              amount: numericAmount,
              fee: 0,
              total_amount: numericAmount,
              status: "pending",
              payment_ref_id: gatewayPaymentId,
            });
            break;
          case "insurance":
            personalHubRecord = await createInsurancePayment({
              user_id: authUserId,
              profile_id: profileId,
              insurance_type: description || "General",
              provider: provider || "unknown",
              provider_id: providerId || null,
              policy_number: recipientPhone || "",
              insured_name: description || "",
              coverage_period: "1 year",
              amount: numericAmount,
              fee: 0,
              total_amount: numericAmount,
              status: "pending",
              payment_ref_id: gatewayPaymentId,
            });
            break;
          case "shopping":
            personalHubRecord = await createShoppingPayment({
              user_id: authUserId,
              profile_id: profileId,
              merchant: provider || "unknown",
              order_number: recipientPhone || "",
              items: [{ name: description || "Item", price: numericAmount }],
              amount: numericAmount,
              shipping_fee: 0,
              tax: 0,
              total_amount: numericAmount,
              status: "pending",
              payment_ref_id: gatewayPaymentId,
            });
            break;
          default:
            break;
        }

        if (personalHubRecord && !personalHubRecord.success) {
          console.warn("Personal hub transaction record warning:", personalHubRecord.error);
        }

        await persistSavedDestination({ authUserId, profileId });

        await createPaymentNotification({
          transaction_type: transactionType,
          transaction_id: gatewayTransactionId,
          amount: numericAmount,
          amount_formatted: amountFormatted,
          data_amount: dataAmount,
          validity,
          status: "pending",
        });
      } else {
        if (bookingData?.type !== "service_booking" && resolvedBookingId) {
          await updateBookingMutation.mutateAsync({
            id: resolvedBookingId,
            updates: {
              payment_status: "pending",
              status: "pending",
            },
          });
        }
      }
      setConfirmationStatus("processing");
      setPaymentReference(gatewayTransactionId);
      setShowConfirmationModal(true);

      const reconciliation = await reconcileExpressPayPayment({
        paymentId: gatewayPaymentId,
        token: gatewayPayment.token,
        orderId: gatewayTransactionId,
        pollAttempts: 20,
        pollDelayMs: 3000,
      });

      const gatewayStatus = normalizeGatewayStatus(
        reconciliation.status || reconciliation.payment?.status || "pending"
      );

      if (isPersonalHubTransaction && personalHubRecord?.success && personalHubRecord.data?.id) {
        if (gatewayStatus === "completed" || gatewayStatus === "failed") {
          await updateTransactionStatus(
            transactionType,
            personalHubRecord.data.id,
            gatewayStatus === "completed" ? "completed" : "failed"
          );
        }
      }

      if (!isPersonalHubTransaction && bookingData?.type !== "service_booking" && resolvedBookingId) {
        await updateBookingMutation.mutateAsync({
          id: resolvedBookingId,
          updates: {
            payment_status: mapBookingPaymentStatus(gatewayStatus),
          },
        });
      }

      if (gatewayStatus === "completed") {
        setShowConfirmationModal(false);

        if (isPersonalHubTransaction) {
          await createPaymentNotification({
            transaction_type: transactionType,
            transaction_id: gatewayTransactionId,
            amount: numericAmount,
            amount_formatted: amountFormatted,
            data_amount: dataAmount,
            validity,
            status: "completed",
          });

          navigation.push("successScreen", {
            paymentMethod: "Mobile Money",
            transactionId: gatewayTransactionId,
            paymentData: buildPersonalHubSuccessPayload({
              recordId: personalHubRecord?.data?.id,
              paymentId: gatewayPaymentId,
              transactionId: gatewayTransactionId,
              paidAmount: numericAmount,
            }),
          });
          return;
        }

        if (bookingData) {
          navigation.push("successScreen", {
            bookingId: resolvedBookingId,
            paymentMethod: "Mobile Money",
            transactionId: gatewayTransactionId,
            bookingData: {
              ...bookingData,
              paymentMethod: "Mobile Money",
              paymentDate: new Date().toISOString(),
              transactionId: gatewayTransactionId,
            },
          });
          return;
        }

        navigation.push("successScreen", {
          paymentMethod: "Mobile Money",
          transactionId: gatewayTransactionId,
          paymentData: {
            ...paymentData,
            sourceType: resolvedSourceType || paymentData?.sourceType || null,
            sourceId: resolvedSourceId || paymentData?.sourceId || null,
            obligationId: resolvedObligationId || paymentData?.obligationId || null,
            paymentMethod: "Mobile Money",
            paymentDate: new Date().toISOString(),
            transactionId: gatewayTransactionId,
          },
        });
        return;
      }

      if (gatewayStatus === "failed") {
        setShowConfirmationModal(false);
        Alert.alert(
          "Payment Failed",
          reconciliation.error || "Payment could not be completed. Please try again."
        );
        return;
      }

      setConfirmationStatus("pending");
      setPaymentReference(gatewayTransactionId);
      setShowConfirmationModal(true);
    } catch (error) {
      setShowConfirmationModal(false);
      console.error("Mobile Money payment error:", error);
      Alert.alert(
        "Payment Failed",
        error?.message || "There was an error processing your payment. Please try again."
      );
    } finally {
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
                {formatMoney(
                  Number(
                    amount ??
                    bookingData?.totalAmount ??
                    paymentData?.amount ??
                    0
                  )
                )}
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
          if (confirmationStatus === "processing") {
            return;
          }
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
                backgroundColor:
                  confirmationStatus === "completed"
                    ? Colors.green + "20"
                    : confirmationStatus === "pending"
                      ? Colors.primary + "20"
                      : Colors.orange + "20",
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: Default.fixPadding * 1.5,
              }}>
                <MaterialCommunityIcons
                  name={
                    confirmationStatus === "completed"
                      ? "check-circle"
                      : confirmationStatus === "pending"
                        ? "cellphone-check"
                        : "progress-clock"
                  }
                  size={50}
                  color={
                    confirmationStatus === "completed"
                      ? Colors.green
                      : confirmationStatus === "pending"
                        ? Colors.primary
                        : Colors.orange
                  }
                />
              </View>
              <Text style={{ ...Fonts.SemiBold18black, textAlign: 'center' }}>
                {confirmationStatus === "completed"
                  ? "Payment Successful"
                  : confirmationStatus === "pending"
                    ? "Awaiting Confirmation"
                    : "Approve on Your Phone"}
              </Text>
              <Text style={{ 
                ...Fonts.Medium14grey, 
                textAlign: 'center',
                marginTop: Default.fixPadding,
                marginHorizontal: Default.fixPadding,
              }}>
                {confirmationStatus === "completed"
                  ? `Your ${getTransactionLabel(transactionType || paymentData?.payment_type || "booking")} was completed successfully.`
                  : confirmationStatus === "pending"
                    ? `Your ${getTransactionLabel(transactionType || paymentData?.payment_type || "booking")} has been submitted and is pending mobile money confirmation.`
                    : "A payment prompt has been sent to your phone. Approve it with your mobile money PIN to continue."}
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

            {confirmationStatus === "processing" ? null : (
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
            )}
          </View>
        </View>
      </Modal>
    </View>
  </KeyboardAvoidingView>
  );
};

export default MobileMoneyScreen;
