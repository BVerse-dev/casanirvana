import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  StyleSheet,
  Image,
  FlatList,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MyStatusBar from "../components/myStatusBar";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import AwesomeButton from "react-native-really-awesome-button";

const PaymentMethodScreen = ({ navigation, route }) => {
  const { 
    bookingId, 
    bookingData, 
    paymentData, 
    isAddingPaymentMethod, 
    onPaymentMethodAdded,
    // Airtime purchase params
    provider,
    providerName,
    packageType,
    amountTitle,
    amount,
    amountFormatted,
    phoneNumber,
    description,
    saveAccount,
    transactionType,
    recipientInfo
  } = route.params || {};
  
  const { t, i18n } = useTranslation();

  // Determine if this is for adding a payment method or making a payment
  const isAddingMode = isAddingPaymentMethod === true;
  
  // Determine transaction type for dynamic display
  const isPersonalHubTransaction = transactionType && ['airtime', 'data', 'money_transfer', 'bill_payment', 'insurance', 'shopping'].includes(transactionType);
  
  // Get transaction type display name
  const getTransactionTypeDisplay = () => {
    switch(transactionType) {
      case 'airtime': return 'Airtime Purchase';
      case 'data': return 'Data Purchase';
      case 'money_transfer': return 'Money Transfer';
      case 'bill_payment': return 'Bill Payment';
      case 'insurance': return 'Insurance Payment';
      case 'shopping': return 'Shopping Payment';
      default: return paymentData?.title || 'Payment';
    }
  };

  // Debug: Log what we receive from payment screen
  console.log('PaymentMethodScreen - Received params:', { 
    bookingId, 
    bookingData: bookingData ? 'present' : 'null', 
    paymentData: paymentData ? 'present' : 'null',
    isAddingPaymentMethod,
    isAddingMode
  });
  console.log('PaymentMethodScreen - BookingData:', bookingData);
  console.log('PaymentMethodScreen - PaymentData:', paymentData);

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`paymentMethodScreen:${key}`);
  }
  const backAction = () => {
    navigation.pop();
    return true;
  };
  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => {
      const subscription = BackHandler.addEventListener("hardwareBackPress", backAction); return () => subscription?.remove(); }
  }, []);

  const paymentList = [
    {
      key: "1",
      image: require("../assets/images/pay1.png"),
      title: "Credit Card",
      subtitle: "Pay with your credit or debit card",
      icon: "credit-card",
      color: Colors.primary,
    },
    {
      key: "2",
      image: require("../assets/images/pay2.png"),
      title: "Mobile Money",
      subtitle: "Pay with MTN, Vodafone, or AirtelTigo",
      icon: "phone-android",
      color: "#FF6B35",
    },
    {
      key: "3",
      image: require("../assets/images/pay3.png"),
      title: "PayPal",
      subtitle: "Pay securely with your PayPal account",
      icon: "account-balance-wallet",
      color: "#0070BA",
    },
  ];

  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState("Credit Card");

  const renderItem = ({ item }) => {
    const isSelected = selectedPaymentMethod === item.title;
    return (
      <TouchableOpacity
        onPress={() => setSelectedPaymentMethod(item.title)}
        style={{
          flexDirection: isRtl ? "row-reverse" : "row",
          ...styles.mainTouchOpacity,
        }}
      >
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: item.color + '15',
            justifyContent: "center",
            alignItems: "center",
            marginRight: isRtl ? 0 : Default.fixPadding,
            marginLeft: isRtl ? Default.fixPadding : 0,
          }}
        >
          <MaterialIcons
            name={item.icon}
            size={24}
            color={item.color}
          />
        </View>

        <View
          style={{
            flex: 1,
            alignItems: isRtl ? "flex-end" : "flex-start",
            marginHorizontal: Default.fixPadding,
          }}
        >
          <Text
            numberOfLines={1}
            style={{ ...Fonts.SemiBold16black, overflow: "hidden" }}
          >
            {item.title}
          </Text>
          <Text
            numberOfLines={1}
            style={{ 
              ...Fonts.Medium14grey, 
              overflow: "hidden",
              marginTop: Default.fixPadding * 0.3,
            }}
          >
            {item.subtitle}
          </Text>
        </View>
        
        <View style={{ alignItems: isRtl ? "flex-start" : "flex-end" }}>
          <MaterialCommunityIcons
            name={isSelected ? "record-circle" : "circle-outline"}
            size={20}
            color={isSelected ? Colors.primary : Colors.lightGrey}
          />
        </View>
      </TouchableOpacity>
    );
  };
  const handleContinue = () => {
    // Prepare parameters based on mode
    let navigationParams = {};
    
    if (transactionType === 'shopping') {
      // For marketplace checkout flow
      navigationParams = {
        transactionType: 'shopping',
        cartItems: route.params.cartItems,
        subtotal: route.params.subtotal,
        deliveryFee: route.params.deliveryFee,
        totalAmount: route.params.totalAmount,
        deliveryOption: route.params.deliveryOption,
        deliveryAddress: route.params.deliveryAddress,
        orderSummary: route.params.orderSummary,
        paymentMethod: selectedPaymentMethod
      };
    } else if (isPersonalHubTransaction) {
      // For airtime purchase flow
      navigationParams = {
        provider,
        providerName,
        amount,
        amountFormatted,
        phoneNumber,
        description,
        recipientInfo,
        transactionType: 'airtime'
      };
    } else if (isAddingMode) {
      // For adding payment method
      navigationParams = {
        isAddingPaymentMethod: true,
        onPaymentMethodAdded: onPaymentMethodAdded
      };
    } else {
      // For regular booking payment
      navigationParams = {
        bookingId,
        bookingData,
        paymentData
      };
    }

    if (transactionType === 'shopping') {
      // For marketplace checkout, go directly to order review
      navigation.navigate("orderReviewScreen", navigationParams);
    } else {
      // For other transactions, go to payment processing screens
      switch (selectedPaymentMethod) {
        case "Credit Card":
          navigation.push("creditCardScreen", navigationParams);
          break;
        case "Mobile Money":
          navigation.push("mobileMoneyScreen", navigationParams);
          break;
        case "PayPal":
          navigation.push("paypalScreen", navigationParams);
          break;
        default:
          navigation.push("creditCardScreen", navigationParams);
      }
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
          numberOfLines={1}
          style={{
            ...Fonts.SemiBold18black,
            overflow: "hidden",
            marginHorizontal: Default.fixPadding,
          }}
        >
          {isAddingMode ? "Add Payment Method" : tr("selectPaymentMethod")}
        </Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        {/* Summary Card - Dynamic based on payment type or adding mode */}
        {!isAddingMode && (
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
              <Text
                style={{
                  ...Fonts.SemiBold16black,
                  textAlign: isRtl ? "right" : "left",
                  marginBottom: Default.fixPadding,
                }}
              >
                {bookingData ? "Booking Summary" : "Payment Summary"}
              </Text>
            
            {bookingData ? (
              // Booking Summary Content
              <>
                <View
                  style={{
                    flexDirection: isRtl ? "row-reverse" : "row",
                    alignItems: "center",
                    marginBottom: Default.fixPadding * 0.5,
                  }}
                >
                  <MaterialCommunityIcons
                    name={bookingData.type === "service_booking" ? "tools" : "home-city"}
                    size={16}
                    color={Colors.primary}
                    style={{ marginRight: isRtl ? 0 : Default.fixPadding * 0.5, marginLeft: isRtl ? Default.fixPadding * 0.5 : 0 }}
                  />
                  <Text
                    style={{
                      ...Fonts.Medium14black,
                      textAlign: isRtl ? "right" : "left",
                    }}
                  >
                    <Text style={{ ...Fonts.SemiBold14black }}>
                      {bookingData.type === "service_booking" ? "Service:" : "Amenity:"}
                    </Text> {bookingData?.serviceName || bookingData?.serviceTitle || bookingData?.amenityName || 'N/A'}
                  </Text>
                </View>
                
                {bookingData.type === "service_booking" ? (
                  // Service booking display (single date and time)
                  <>
                    <View
                      style={{
                        flexDirection: isRtl ? "row-reverse" : "row",
                        alignItems: "center",
                        marginBottom: Default.fixPadding * 0.5,
                      }}
                    >
                      <MaterialCommunityIcons
                        name="calendar"
                        size={16}
                        color={Colors.primary}
                        style={{ marginRight: isRtl ? 0 : Default.fixPadding * 0.5, marginLeft: isRtl ? Default.fixPadding * 0.5 : 0 }}
                      />
                      <Text
                        style={{
                          ...Fonts.Medium14black,
                          textAlign: isRtl ? "right" : "left",
                        }}
                      >
                        <Text style={{ ...Fonts.SemiBold14black }}>Date:</Text> {bookingData?.date || 'N/A'}
                      </Text>
                    </View>
                    
                    <View
                      style={{
                        flexDirection: isRtl ? "row-reverse" : "row",
                        alignItems: "center",
                        marginBottom: Default.fixPadding,
                      }}
                    >
                      <MaterialCommunityIcons
                        name="clock-time-four"
                        size={16}
                        color={Colors.primary}
                        style={{ marginRight: isRtl ? 0 : Default.fixPadding * 0.5, marginLeft: isRtl ? Default.fixPadding * 0.5 : 0 }}
                      />
                      <Text
                        style={{
                          ...Fonts.Medium14black,
                          textAlign: isRtl ? "right" : "left",
                        }}
                      >
                        <Text style={{ ...Fonts.SemiBold14black }}>Time:</Text> {bookingData?.time || 'N/A'}
                      </Text>
                    </View>
                    
                    {bookingData?.description && (
                      <View
                        style={{
                          flexDirection: isRtl ? "row-reverse" : "row",
                          alignItems: "flex-start",
                          marginBottom: Default.fixPadding,
                        }}
                      >
                        <MaterialCommunityIcons
                          name="text-box-outline"
                          size={16}
                          color={Colors.primary}
                          style={{ 
                            marginRight: isRtl ? 0 : Default.fixPadding * 0.5, 
                            marginLeft: isRtl ? Default.fixPadding * 0.5 : 0,
                            marginTop: 2
                          }}
                        />
                        <Text
                          style={{
                            ...Fonts.Medium14black,
                            textAlign: isRtl ? "right" : "left",
                            flex: 1,
                          }}
                        >
                          <Text style={{ ...Fonts.SemiBold14black }}>Description:</Text> {bookingData.description}
                        </Text>
                      </View>
                    )}
                  </>
                ) : (
                  // Amenity booking display (date range)
                  <>
                    <View
                      style={{
                        flexDirection: isRtl ? "row-reverse" : "row",
                        alignItems: "center",
                        marginBottom: Default.fixPadding * 0.5,
                      }}
                    >
                      <MaterialCommunityIcons
                        name="calendar-range"
                        size={16}
                        color={Colors.primary}
                        style={{ marginRight: isRtl ? 0 : Default.fixPadding * 0.5, marginLeft: isRtl ? Default.fixPadding * 0.5 : 0 }}
                      />
                      <Text
                        style={{
                          ...Fonts.Medium14black,
                          textAlign: isRtl ? "right" : "left",
                        }}
                      >
                        <Text style={{ ...Fonts.SemiBold14black }}>Date:</Text> {bookingData?.fromDate || 'N/A'} - {bookingData?.toDate || 'N/A'}
                      </Text>
                    </View>
                    
                    <View
                      style={{
                        flexDirection: isRtl ? "row-reverse" : "row",
                        alignItems: "center",
                        marginBottom: Default.fixPadding,
                      }}
                    >
                      <MaterialCommunityIcons
                        name="clock-time-four"
                        size={16}
                        color={Colors.primary}
                        style={{ marginRight: isRtl ? 0 : Default.fixPadding * 0.5, marginLeft: isRtl ? Default.fixPadding * 0.5 : 0 }}
                      />
                      <Text
                        style={{
                          ...Fonts.Medium14black,
                          textAlign: isRtl ? "right" : "left",
                        }}
                      >
                        <Text style={{ ...Fonts.SemiBold14black }}>Time:</Text> {bookingData?.fromTime || 'N/A'} - {bookingData?.toTime || 'N/A'}
                      </Text>
                    </View>
                    
                    <View
                      style={{
                        flexDirection: isRtl ? "row-reverse" : "row",
                        alignItems: "center",
                        marginBottom: Default.fixPadding,
                      }}
                    >
                      <MaterialCommunityIcons
                        name="calendar-check"
                        size={16}
                        color={Colors.primary}
                        style={{ marginRight: isRtl ? 0 : Default.fixPadding * 0.5, marginLeft: isRtl ? Default.fixPadding * 0.5 : 0 }}
                      />
                      <Text
                        style={{
                          ...Fonts.Medium14black,
                          textAlign: isRtl ? "right" : "left",
                        }}
                      >
                        <Text style={{ ...Fonts.SemiBold14black }}>Total Days:</Text> {bookingData?.totalDays || 1} {bookingData?.totalDays === 1 ? 'day' : 'days'}
                      </Text>
                    </View>
                  </>
                )}
              </>
            ) : (
              // Payment Summary Content
              <>
                {isPersonalHubTransaction ? (
                  // Personal Hub Transaction Summary
                  <>
                    <View
                      style={{
                        flexDirection: isRtl ? "row-reverse" : "row",
                        alignItems: "center",
                        marginBottom: Default.fixPadding * 0.5,
                      }}
                    >
                      <MaterialCommunityIcons
                        name={transactionType === 'airtime' ? "phone" : 
                              transactionType === 'data' ? "wifi" :
                              transactionType === 'money_transfer' ? "bank-transfer" :
                              transactionType === 'bill_payment' ? "receipt" :
                              transactionType === 'insurance' ? "shield-check" :
                              transactionType === 'shopping' ? "cart" : "credit-card"}
                        size={16}
                        color={Colors.primary}
                        style={{ marginRight: isRtl ? 0 : Default.fixPadding * 0.5, marginLeft: isRtl ? Default.fixPadding * 0.5 : 0 }}
                      />
                      <Text
                        style={{
                          ...Fonts.Medium14black,
                          textAlign: isRtl ? "right" : "left",
                        }}
                      >
                        <Text style={{ ...Fonts.SemiBold14black }}>Service:</Text> {providerName || getTransactionTypeDisplay()}
                      </Text>
                    </View>

                    <View
                      style={{
                        flexDirection: isRtl ? "row-reverse" : "row",
                        alignItems: "center",
                        marginBottom: Default.fixPadding * 0.5,
                      }}
                    >
                      <MaterialCommunityIcons
                        name="account"
                        size={16}
                        color={Colors.primary}
                        style={{ marginRight: isRtl ? 0 : Default.fixPadding * 0.5, marginLeft: isRtl ? Default.fixPadding * 0.5 : 0 }}
                      />
                      <Text
                        style={{
                          ...Fonts.Medium14black,
                          textAlign: isRtl ? "right" : "left",
                        }}
                      >
                        <Text style={{ ...Fonts.SemiBold14black }}>Recipient:</Text> {description || phoneNumber || recipientInfo || 'N/A'}
                      </Text>
                    </View>

                    {phoneNumber && (
                      <View
                        style={{
                          flexDirection: isRtl ? "row-reverse" : "row",
                          alignItems: "center",
                          marginBottom: Default.fixPadding * 0.5,
                        }}
                      >
                        <MaterialCommunityIcons
                          name="phone-in-talk"
                          size={16}
                          color={Colors.primary}
                          style={{ marginRight: isRtl ? 0 : Default.fixPadding * 0.5, marginLeft: isRtl ? Default.fixPadding * 0.5 : 0 }}
                        />
                        <Text
                          style={{
                            ...Fonts.Medium14black,
                            textAlign: isRtl ? "right" : "left",
                          }}
                        >
                          <Text style={{ ...Fonts.SemiBold14black }}>Phone:</Text> {phoneNumber}
                        </Text>
                      </View>
                    )}

                    {/* Data bundle details if applicable */}
                    {transactionType === 'data' && dataAmount && (
                      <View
                        style={{
                          flexDirection: isRtl ? "row-reverse" : "row",
                          alignItems: "center",
                          marginBottom: Default.fixPadding * 0.5,
                        }}
                      >
                        <MaterialCommunityIcons
                          name="database"
                          size={16}
                          color={Colors.primary}
                          style={{ marginRight: isRtl ? 0 : Default.fixPadding * 0.5, marginLeft: isRtl ? Default.fixPadding * 0.5 : 0 }}
                        />
                        <Text
                          style={{
                            ...Fonts.Medium14black,
                            textAlign: isRtl ? "right" : "left",
                          }}
                        >
                          <Text style={{ ...Fonts.SemiBold14black }}>Data:</Text> {dataAmount}
                        </Text>
                      </View>
                    )}
                    
                    {transactionType === 'data' && validity && (
                      <View
                        style={{
                          flexDirection: isRtl ? "row-reverse" : "row",
                          alignItems: "center",
                          marginBottom: Default.fixPadding * 0.5,
                        }}
                      >
                        <MaterialCommunityIcons
                          name="calendar-clock"
                          size={16}
                          color={Colors.primary}
                          style={{ marginRight: isRtl ? 0 : Default.fixPadding * 0.5, marginLeft: isRtl ? Default.fixPadding * 0.5 : 0 }}
                        />
                        <Text
                          style={{
                            ...Fonts.Medium14black,
                            textAlign: isRtl ? "right" : "left",
                          }}
                        >
                          <Text style={{ ...Fonts.SemiBold14black }}>Validity:</Text> {validity}
                        </Text>
                      </View>
                    )}

                    <View
                      style={{
                        flexDirection: isRtl ? "row-reverse" : "row",
                        alignItems: "center",
                        marginBottom: Default.fixPadding * 0.5,
                      }}
                    >
                      <MaterialCommunityIcons
                        name="cash"
                        size={16}
                        color={Colors.primary}
                        style={{ marginRight: isRtl ? 0 : Default.fixPadding * 0.5, marginLeft: isRtl ? Default.fixPadding * 0.5 : 0 }}
                      />
                      <Text
                        style={{
                          ...Fonts.Medium14black,
                          textAlign: isRtl ? "right" : "left",
                        }}
                      >
                        <Text style={{ ...Fonts.SemiBold14black }}>Amount:</Text> {amountFormatted || (amount ? `GHS ${amount.toFixed(2)}` : 'GHS 0.00')}
                      </Text>
                    </View>
                  </>
                ) : (
                  // Regular Payment Summary
                  <View
                    style={{
                      flexDirection: isRtl ? "row-reverse" : "row",
                      alignItems: "center",
                      marginBottom: Default.fixPadding * 0.5,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="file-document-outline"
                      size={16}
                      color={Colors.primary}
                      style={{ marginRight: isRtl ? 0 : Default.fixPadding * 0.5, marginLeft: isRtl ? Default.fixPadding * 0.5 : 0 }}
                    />
                    <Text
                      style={{
                        ...Fonts.Medium14black,
                        textAlign: isRtl ? "right" : "left",
                      }}
                    >
                      <Text style={{ ...Fonts.SemiBold14black }}>Payment:</Text> {paymentData?.title || 'N/A'}
                    </Text>
                  </View>
                )}
                
                {/* Only show due date for regular payments, not for personal hub transactions */}
                {!isPersonalHubTransaction && (
                  <View
                    style={{
                      flexDirection: isRtl ? "row-reverse" : "row",
                      alignItems: "center",
                      marginBottom: Default.fixPadding * 0.5,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="calendar-clock"
                      size={16}
                      color={Colors.primary}
                      style={{ marginRight: isRtl ? 0 : Default.fixPadding * 0.5, marginLeft: isRtl ? Default.fixPadding * 0.5 : 0 }}
                    />
                    <Text
                      style={{
                        ...Fonts.Medium14black,
                        textAlign: isRtl ? "right" : "left",
                      }}
                    >
                      <Text style={{ ...Fonts.SemiBold14black }}>Due Date:</Text> {paymentData?.dueDate || 'N/A'}
                    </Text>
                  </View>
                )}
                
                {paymentData?.description && (
                  <View
                    style={{
                      flexDirection: isRtl ? "row-reverse" : "row",
                      alignItems: "flex-start",
                      marginBottom: Default.fixPadding,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="information-outline"
                      size={16}
                      color={Colors.primary}
                      style={{ 
                        marginRight: isRtl ? 0 : Default.fixPadding * 0.5, 
                        marginLeft: isRtl ? Default.fixPadding * 0.5 : 0,
                        marginTop: 2
                      }}
                    />
                    <Text
                      style={{
                        ...Fonts.Medium14black,
                        textAlign: isRtl ? "right" : "left",
                        flex: 1,
                      }}
                    >
                      <Text style={{ ...Fonts.SemiBold14black }}>Description:</Text> {paymentData.description}
                    </Text>
                  </View>
                )}
              </>
            )}
            
            <View
              style={{
                height: 1,
                backgroundColor: Colors.grey + '30',
                marginVertical: Default.fixPadding,
              }}
            />
            
            <View
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flexDirection: isRtl ? "row-reverse" : "row", alignItems: "center" }}>
                <MaterialCommunityIcons
                  name="cash-multiple"
                  size={18}
                  color={Colors.primary}
                  style={{ marginRight: isRtl ? 0 : Default.fixPadding * 0.5, marginLeft: isRtl ? Default.fixPadding * 0.5 : 0 }}
                />
                <Text
                  style={{
                    ...Fonts.SemiBold16black,
                    textAlign: isRtl ? "right" : "left",
                  }}
                >
                  Total Amount
                </Text>
              </View>
              <Text
                style={{
                  ...Fonts.SemiBold18primary,
                  textAlign: isRtl ? "left" : "right",
                }}
              >
                {(() => {
                  // Use amountFormatted if available (from airtime purchase)
                  if (amountFormatted) {
                    return amountFormatted;
                  }
                  
                  // Otherwise calculate from available data
                  let calculatedAmount = 0;
                  
                  // Check for amount from route params (airtime/personal hub)
                  if (amount !== undefined && amount !== null) {
                    calculatedAmount = parseFloat(amount);
                  } 
                  // Check booking data
                  else if (bookingData && bookingData.totalAmount) {
                    calculatedAmount = parseFloat(bookingData.totalAmount);
                  } 
                  // Check payment data
                  else if (paymentData && paymentData.amount) {
                    calculatedAmount = parseFloat(paymentData.amount);
                  }
                  
                  return `GHS ${calculatedAmount.toFixed(2)}`;
                })()}
              </Text>
            </View>
          </View>
        </View>
        )}

        {/* Add Payment Method Info Card - Only show when adding payment method */}
        {isAddingMode && (
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
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: Default.fixPadding }}>
                <MaterialCommunityIcons name="credit-card-plus" size={24} color={Colors.primary} />
                <Text
                  style={{
                    ...Fonts.SemiBold16black,
                    textAlign: isRtl ? "right" : "left",
                    marginLeft: Default.fixPadding,
                  }}
                >
                  Add New Payment Method
                </Text>
              </View>
              <Text
                style={{
                  ...Fonts.Medium14grey,
                  textAlign: isRtl ? "right" : "left",
                  lineHeight: 20,
                }}
              >
                Choose a payment method to add to your account. This will be saved securely for future payments.
              </Text>
            </View>
          </View>
        )}

        {/* Payment Methods */}
        <View>
          <Text
            style={{
              ...Fonts.SemiBold16black,
              textAlign: isRtl ? "right" : "left",
              marginHorizontal: Default.fixPadding * 2,
              marginBottom: Default.fixPadding,
            }}
          >
            Choose Payment Method
          </Text>
          
          <FlatList
            data={paymentList}
            renderItem={renderItem}
            keyExtractor={(item) => item.key}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      <View
        style={{
          margin: Default.fixPadding * 2,
        }}
      >
        <AwesomeButton
          height={50}
          onPress={handleContinue}
          raiseLevel={1}
          stretch={true}
          borderRadius={10}
          backgroundShadow={Colors.primary}
          backgroundDarker={Colors.primary}
          backgroundColor={Colors.primary}
        >
          <Text style={{ ...Fonts.SemiBold18white }}>
            {isAddingMode ? "Add Payment Method" : tr("continue")}
          </Text>
        </AwesomeButton>
      </View>
    </View>
  );
};

export default PaymentMethodScreen;

const styles = StyleSheet.create({
  mainTouchOpacity: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: Default.fixPadding * 1.4,
    paddingVertical: Default.fixPadding * 1.3,
    marginBottom: Default.fixPadding * 2.1,
    marginHorizontal: Default.fixPadding * 2,
    borderRadius: 10,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
});
