import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  StatusBar,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Colors, Fonts, Default } from "../constants/styles";
import AwesomeButton from "react-native-really-awesome-button";
import MyStatusBar from "../components/myStatusBar";
import { useCreateUserAddress, useUserAddresses } from "../hooks/useMarketplace";

const { width } = Dimensions.get("window");

const DeliveryAddressScreen = ({ navigation, route }) => {
  const { cartItems, total } = route.params || {};
  
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState("delivery");
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const addressesQuery = useUserAddresses();
  const createAddressMutation = useCreateUserAddress();
  const savedAddresses = useMemo(
    () => addressesQuery.data || [],
    [addressesQuery.data]
  );
  const isLoading = addressesQuery.isLoading || createAddressMutation.isPending;

  // New address form state
  const [newAddress, setNewAddress] = useState({
    label: "",
    fullName: "",
    phoneNumber: "",
    streetAddress: "",
    city: "",
    region: "",
    postalCode: "",
    additionalInfo: "",
  });

  const deliveryOptions = [
    {
      id: "delivery",
      title: "Home Delivery",
      subtitle: "Delivered to your address",
      icon: "local-shipping",
      price: "GH₵ 15.00",
      estimatedTime: "2-3 business days",
      color: "#4ECDC4",
    },
    {
      id: "pickup",
      title: "Pickup Point",
      subtitle: "Collect from Casa Nirvana Hub",
      icon: "store",
      price: "Free",
      estimatedTime: "Ready in 24 hours",
      color: "#6B3AA0",
    },
  ];

  useEffect(() => {
    if (savedAddresses.length === 0) {
      setSelectedAddressId(null);
      return;
    }

    const hasSelectedAddress = savedAddresses.some((addr) => addr.id === selectedAddressId);
    if (hasSelectedAddress) return;

    const defaultAddress = savedAddresses.find((addr) => addr.isDefault) || savedAddresses[0];
    setSelectedAddressId(defaultAddress.id);
  }, [savedAddresses, selectedAddressId]);

  const validateAddress = () => {
    const required = ["fullName", "phoneNumber", "streetAddress", "city", "region"];
    for (let field of required) {
      if (!newAddress[field].trim()) {
        Alert.alert("Error", `Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    return true;
  };

  const handleAddAddress = async () => {
    if (!validateAddress()) return;

    try {
      const createdAddress = await createAddressMutation.mutateAsync({
        ...newAddress,
        label: newAddress.label.trim() || "Address",
        isDefault: savedAddresses.length === 0,
      });

      setSelectedAddressId(createdAddress.id);
      setShowAddAddressModal(false);

      setNewAddress({
        label: "",
        fullName: "",
        phoneNumber: "",
        streetAddress: "",
        city: "",
        region: "",
        postalCode: "",
        additionalInfo: "",
      });

      Alert.alert("Success", "Address saved successfully.");
    } catch (error) {
      console.error("Failed to save address:", error);
      Alert.alert("Error", "Unable to save address. Please try again.");
    }
  };

  const handleContinueToPayment = () => {
    if (selectedDeliveryOption === "delivery" && !selectedAddressId) {
      Alert.alert("Error", "Please select a delivery address");
      return;
    }

    const selectedAddress =
      selectedDeliveryOption === "delivery"
        ? savedAddresses.find((addr) => addr.id === selectedAddressId)
        : null;
    if (selectedDeliveryOption === "delivery" && !selectedAddress) {
      Alert.alert("Error", "Selected address is not available. Please select another address.");
      return;
    }

    const deliveryOption = deliveryOptions.find(opt => opt.id === selectedDeliveryOption);
    
    const deliveryFee = selectedDeliveryOption === "delivery" ? 15.00 : 0.00;
    const finalTotal = parseFloat(total || 0) + deliveryFee;

    // Navigate to payment method screen with marketplace-specific params
    navigation.navigate("paymentMethodScreen", {
      transactionType: "shopping",
      cartItems,
      subtotal: total,
      deliveryFee,
      totalAmount: finalTotal,
      deliveryOption,
      deliveryAddress: selectedAddress,
      orderSummary: {
        itemCount: cartItems?.length || 0,
        subtotal: total,
        deliveryFee,
        total: finalTotal,
      }
    });
  };

  const renderDeliveryOption = ({ item }) => {
    const isSelected = selectedDeliveryOption === item.id;
    
    return (
      <TouchableOpacity
        style={[styles.deliveryOptionCard, isSelected && styles.selectedOption]}
        onPress={() => setSelectedDeliveryOption(item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.optionHeader}>
          <View style={[styles.optionIcon, { backgroundColor: item.color + '15' }]}>
            <MaterialIcons name={item.icon} size={24} color={item.color} />
          </View>
          <View style={styles.optionInfo}>
            <Text style={styles.optionTitle}>{item.title}</Text>
            <Text style={styles.optionSubtitle}>{item.subtitle}</Text>
          </View>
          <View style={styles.optionPricing}>
            <Text style={styles.optionPrice}>{item.price}</Text>
            <Text style={styles.optionTime}>{item.estimatedTime}</Text>
          </View>
        </View>
        
        <View style={styles.radioContainer}>
          <View style={[styles.radioButton, isSelected && styles.radioSelected]}>
            {isSelected && <View style={styles.radioInner} />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderAddressCard = (address) => {
    const isSelected = selectedAddressId === address.id;
    
    return (
      <TouchableOpacity
        key={address.id}
        style={[styles.addressCard, isSelected && styles.selectedAddress]}
        onPress={() => setSelectedAddressId(address.id)}
        activeOpacity={0.8}
      >
        <View style={styles.addressHeader}>
          <View style={styles.addressLabelContainer}>
            <Ionicons 
              name={address.label === "Home" ? "home" : "business"} 
              size={16} 
              color={isSelected ? Colors.primary : Colors.grey} 
            />
            <Text style={[styles.addressLabel, isSelected && styles.selectedText]}>
              {address.label}
            </Text>
            {address.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultText}>Default</Text>
              </View>
            )}
          </View>
          <View style={[styles.radioButton, isSelected && styles.radioSelected]}>
            {isSelected && <View style={styles.radioInner} />}
          </View>
        </View>
        
        <Text style={[styles.addressName, isSelected && styles.selectedText]}>
          {address.fullName}
        </Text>
        <Text style={[styles.addressDetails, isSelected && styles.selectedText]}>
          {address.streetAddress}
        </Text>
        <Text style={[styles.addressDetails, isSelected && styles.selectedText]}>
          {address.city}, {address.region} {address.postalCode}
        </Text>
        <Text style={[styles.addressPhone, isSelected && styles.selectedText]}>
          {address.phoneNumber}
        </Text>
      </TouchableOpacity>
    );
  };

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
        <Text style={styles.headerTitle}>Delivery Address</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Delivery Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Method</Text>
          {deliveryOptions.map((option) => (
            <View key={option.id}>
              {renderDeliveryOption({ item: option })}
            </View>
          ))}
        </View>

        {/* Address Selection (only show if delivery is selected) */}
        {selectedDeliveryOption === "delivery" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Delivery Address</Text>
              <TouchableOpacity
                style={styles.addAddressButton}
                onPress={() => setShowAddAddressModal(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={20} color={Colors.primary} />
                <Text style={styles.addAddressText}>Add New</Text>
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.loadingText}>Loading addresses...</Text>
              </View>
            ) : savedAddresses.length > 0 ? (
              savedAddresses.map(renderAddressCard)
            ) : (
              <View style={styles.emptyAddressCard}>
                <Ionicons name="location-outline" size={22} color={Colors.grey} />
                <Text style={styles.emptyAddressTitle}>No saved delivery addresses yet</Text>
                <Text style={styles.emptyAddressText}>
                  Tap Add New to create an address for checkout.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Pickup Information */}
        {selectedDeliveryOption === "pickup" && (
          <View style={styles.section}>
            <View style={styles.pickupInfoCard}>
              <View style={styles.pickupHeader}>
                <Ionicons name="location" size={24} color="#6B3AA0" />
                <Text style={styles.pickupTitle}>Casa Nirvana Hub</Text>
              </View>
              <Text style={styles.pickupAddress}>
                123 Community Center Drive{'\n'}
                Accra, Greater Accra Region{'\n'}
                Ghana
              </Text>
              <View style={styles.pickupHours}>
                <Ionicons name="time" size={16} color={Colors.grey} />
                <Text style={styles.pickupHoursText}>
                  Mon-Fri: 8:00 AM - 6:00 PM{'\n'}
                  Sat: 9:00 AM - 4:00 PM{'\n'}
                  Sun: Closed
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items ({cartItems?.length || 0})</Text>
              <Text style={styles.summaryValue}>GH₵ {parseFloat(total || 0).toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>
                {selectedDeliveryOption === "delivery" ? "GH₵ 15.00" : "Free"}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                GH₵ {(parseFloat(total || 0) + (selectedDeliveryOption === "delivery" ? 15.00 : 0.00)).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.bottomContainer}>
        <AwesomeButton
          progress
          onPress={(next) => {
            handleContinueToPayment();
            next();
          }}
          width={width - Default.fixPadding * 2.4}
          height={50}
          backgroundColor={Colors.primary}
          backgroundDarker={Colors.primary}
          borderRadius={25}
        >
          <Text style={styles.buttonText}>Continue to Payment</Text>
        </AwesomeButton>
      </View>

      {/* Add Address Modal */}
      <Modal
        visible={showAddAddressModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddAddressModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowAddAddressModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color={Colors.black} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add New Address</Text>
            <View style={styles.modalHeaderRight} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address Label *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Home, Office, etc."
                value={newAddress.label}
                onChangeText={(text) => setNewAddress({ ...newAddress, label: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter recipient's full name"
                value={newAddress.fullName}
                onChangeText={(text) => setNewAddress({ ...newAddress, fullName: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="+233 XX XXX XXXX"
                keyboardType="phone-pad"
                value={newAddress.phoneNumber}
                onChangeText={(text) => setNewAddress({ ...newAddress, phoneNumber: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Street Address *</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                placeholder="Enter street address, apartment, suite, etc."
                multiline
                numberOfLines={2}
                value={newAddress.streetAddress}
                onChangeText={(text) => setNewAddress({ ...newAddress, streetAddress: text })}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>City *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="City"
                  value={newAddress.city}
                  onChangeText={(text) => setNewAddress({ ...newAddress, city: text })}
                />
              </View>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>Region *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Region"
                  value={newAddress.region}
                  onChangeText={(text) => setNewAddress({ ...newAddress, region: text })}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Postal Code</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Postal Code (optional)"
                value={newAddress.postalCode}
                onChangeText={(text) => setNewAddress({ ...newAddress, postalCode: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Additional Information</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                placeholder="Delivery instructions, landmarks, etc. (optional)"
                multiline
                numberOfLines={3}
                value={newAddress.additionalInfo}
                onChangeText={(text) => setNewAddress({ ...newAddress, additionalInfo: text })}
              />
            </View>

            <View style={styles.modalButtonContainer}>
              <AwesomeButton
                progress
                onPress={async (next) => {
                  await handleAddAddress();
                  next();
                }}
                width={width - Default.fixPadding * 2.4}
                height={50}
                backgroundColor={Colors.primary}
                backgroundDarker={Colors.primary}
                borderRadius={25}
              >
                <Text style={styles.buttonText}>Save Address</Text>
              </AwesomeButton>
            </View>

            <View style={{ height: 50 }} />
          </ScrollView>
        </View>
      </Modal>
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Default.fixPadding,
  },
  deliveryOptionCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Default.fixPadding,
    marginBottom: Default.fixPadding,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  selectedOption: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Default.fixPadding,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    ...Fonts.Bold14black,
    color: Colors.black,
    marginBottom: 2,
  },
  optionSubtitle: {
    ...Fonts.Regular12grey,
    color: Colors.grey,
  },
  optionPricing: {
    alignItems: "flex-end",
  },
  optionPrice: {
    ...Fonts.Bold14black,
    color: Colors.black,
  },
  optionTime: {
    ...Fonts.Regular10grey,
    color: Colors.grey,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Default.fixPadding * 1.5,
  },
  loadingText: {
    ...Fonts.Regular12grey,
    color: Colors.grey,
    marginTop: Default.fixPadding * 0.6,
  },
  emptyAddressCard: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: Default.fixPadding * 1.2,
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  emptyAddressTitle: {
    ...Fonts.SemiBold14black,
    color: Colors.black,
    marginTop: Default.fixPadding * 0.6,
  },
  emptyAddressText: {
    ...Fonts.Regular12grey,
    color: Colors.grey,
    textAlign: "center",
    marginTop: Default.fixPadding * 0.4,
  },
  radioContainer: {
    alignItems: "center",
    marginTop: Default.fixPadding * 0.5,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  addAddressButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Default.fixPadding * 0.5,
    paddingHorizontal: Default.fixPadding,
    backgroundColor: Colors.primary + '15',
    borderRadius: 20,
  },
  addAddressText: {
    ...Fonts.SemiBold12primary,
    color: Colors.primary,
    marginLeft: 4,
  },
  addressCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Default.fixPadding,
    marginBottom: Default.fixPadding,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  selectedAddress: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: Colors.primary + '05',
  },
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Default.fixPadding * 0.5,
  },
  addressLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  addressLabel: {
    ...Fonts.Bold14black,
    color: Colors.black,
    marginLeft: Default.fixPadding * 0.5,
  },
  defaultBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: Default.fixPadding * 0.5,
  },
  defaultText: {
    ...Fonts.SemiBold10white,
    color: Colors.white,
  },
  selectedText: {
    color: Colors.primary,
  },
  addressName: {
    ...Fonts.SemiBold14black,
    color: Colors.black,
    marginBottom: 4,
  },
  addressDetails: {
    ...Fonts.Regular12grey,
    color: Colors.grey,
    marginBottom: 2,
  },
  addressPhone: {
    ...Fonts.Regular12grey,
    color: Colors.grey,
    marginTop: 4,
  },
  pickupInfoCard: {
    backgroundColor: "#F8F4FF",
    borderRadius: 12,
    padding: Default.fixPadding,
    borderWidth: 1,
    borderColor: "#6B3AA0" + '30',
  },
  pickupHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Default.fixPadding,
  },
  pickupTitle: {
    ...Fonts.Bold16black,
    color: Colors.black,
    marginLeft: Default.fixPadding * 0.5,
  },
  pickupAddress: {
    ...Fonts.Regular14black,
    color: Colors.black,
    marginBottom: Default.fixPadding,
    lineHeight: 20,
  },
  pickupHours: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  pickupHoursText: {
    ...Fonts.Regular12grey,
    color: Colors.grey,
    marginLeft: Default.fixPadding * 0.5,
    lineHeight: 18,
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
  bottomContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingTop: Default.fixPadding,
  },
  buttonText: {
    ...Fonts.SemiBold16white,
    color: Colors.white,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Default.fixPadding * 1.2,
    paddingTop: Default.fixPadding * 3,
    paddingBottom: Default.fixPadding,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalCloseButton: {
    padding: Default.fixPadding * 0.5,
  },
  modalTitle: {
    ...Fonts.Bold18black,
    color: Colors.black,
    flex: 1,
    textAlign: "center",
  },
  modalHeaderRight: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: Default.fixPadding * 1.2,
  },
  inputGroup: {
    marginBottom: Default.fixPadding,
  },
  inputLabel: {
    ...Fonts.SemiBold14black,
    color: Colors.black,
    marginBottom: Default.fixPadding * 0.5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: Default.fixPadding,
    paddingVertical: Default.fixPadding * 0.8,
    ...Fonts.Regular14black,
    color: Colors.black,
    backgroundColor: Colors.white,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Default.fixPadding,
  },
  inputHalf: {
    flex: 0.48,
  },
  modalButtonContainer: {
    alignItems: "center",
    marginTop: Default.fixPadding * 2,
  },
});

export default DeliveryAddressScreen;
