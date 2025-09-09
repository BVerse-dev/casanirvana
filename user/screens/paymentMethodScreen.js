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
  const { bookingId, bookingData, paymentData } = route.params || {};
  const { t, i18n } = useTranslation();

  // Debug: Log what we receive from payment screen
  console.log('PaymentMethodScreen - Received params:', { 
    bookingId, 
    bookingData: bookingData ? 'present' : 'null', 
    paymentData: paymentData ? 'present' : 'null' 
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
    switch (selectedPaymentMethod) {
      case "Credit Card":
        navigation.push("creditCardScreen", {
          bookingId,
          bookingData,
          paymentData
        });
        break;
      case "Mobile Money":
        navigation.push("mobileMoneyScreen", {
          bookingId,
          bookingData,
          paymentData
        });
        break;
      case "PayPal":
        navigation.push("paypalScreen", {
          bookingId,
          bookingData,
          paymentData
        });
        break;
      default:
        navigation.push("creditCardScreen", {
          bookingId,
          bookingData,
          paymentData
        });
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
          {tr("selectPaymentMethod")}
        </Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        {/* Summary Card - Dynamic based on payment type */}
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
                GH₵ {(() => {
                  let amount = 0;
                  if (bookingData && typeof bookingData.totalAmount === 'number') {
                    amount = bookingData.totalAmount;
                  } else if (paymentData && typeof paymentData.amount === 'number') {
                    amount = paymentData.amount;
                  } else if (bookingData && bookingData.totalAmount) {
                    amount = parseFloat(bookingData.totalAmount) || 0;
                  } else if (paymentData && paymentData.amount) {
                    amount = parseFloat(paymentData.amount) || 0;
                  }
                  return amount.toFixed(2);
                })()}
              </Text>
            </View>
          </View>
        </View>

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
          <Text style={{ ...Fonts.SemiBold18white }}>{tr("continue")}</Text>
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
