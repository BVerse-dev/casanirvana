import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import MyStatusBar from "../components/myStatusBar";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { useGuardAuth } from '../contexts/GuardAuthContext';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AwesomeButton from "react-native-really-awesome-button";

const EntryConfirmationScreen = ({ navigation, route }) => {
  const {
    name,
    phoneNumber, // FIXED: Changed from mobileNumber to phoneNumber
    visiting,
    hostName,
    insideTime,
    selectedTime,
    entryType = 'guest', // Entry type: guest, cab, delivery, service
    guestDetails,        // Additional details specific to entry type
    guestMessage,        // Message/purpose for the visit
    companyName,         // Company name for delivery entries
  } = route.params || {};

  // Convert selectedTime back to Date object if it's a string
  const selectedTimeDate = selectedTime ? new Date(selectedTime) : new Date();

  const { t, i18n } = useTranslation();
  const { guard, user, isAuthenticated } = useGuardAuth();

  const isRtl = i18n.dir() == "rtl";

  // Generate appropriate entry text based on entry type
  const getEntryTypeText = () => {
    switch (entryType) {
      case 'cab':
        return {
          title: 'Cab Entry Confirmation',
          nameLabel: 'Driver Name',
          phoneLabel: 'Phone',
          visitingLabel: 'Unit',
          additionalInfo: guestDetails || 'Cab service'
        };
      case 'delivery':
        return {
          title: 'Delivery Confirmation', 
          nameLabel: 'Name',
          phoneLabel: 'Phone',
          visitingLabel: 'Delivering to',
          additionalInfo: companyName || 'Delivery Service'
        };
      case 'service':
        return {
          title: 'Service Provider Confirmation',
          nameLabel: 'Service Person',
          phoneLabel: 'Phone',
          visitingLabel: 'Service at',
          additionalInfo: guestDetails || 'Service visit'
        };
      default:
        return {
          title: 'Guest Entry Confirmation',
          nameLabel: 'Guest Name',
          phoneLabel: 'Phone',
          visitingLabel: 'Visiting',
          additionalInfo: guestDetails || 'Guest visit'
        };
    }
  };

  const entryTypeInfo = getEntryTypeText();

  // Parse cab-specific details (same as allowed screen)
  const parseCabDetails = () => {
    if (entryType === 'cab' && guestDetails) {
      // guestDetails format: "Uber - Last 4 digits: 1234"
      const parts = guestDetails.split(' - Last 4 digits: ');
      return {
        company: parts[0] || 'Unknown',
        vehicleDigits: parts[1] || 'N/A'
      };
    }
    return null;
  };

  const cabDetails = parseCabDetails();

  // Extract purpose from guestMessage (same as allowed screen)
  const extractPurpose = () => {
    if (entryType === 'cab' && guestMessage) {
      const message = guestMessage.toLowerCase();
      
      if (message.includes('pickup') && message.includes('dropoff')) {
        return 'Pickup & Dropoff';
      } else if (message.includes('pickup')) {
        return 'Pickup';
      } else if (message.includes('dropoff')) {
        return 'Dropoff';
      }
      
      return guestMessage;
    }
    return guestMessage;
  };

  const purposeText = extractPurpose();

  function tr(key) {
    return t(`entryConfirmationScreen:${key}`);
  }

  const backAction = () => {
    navigation.pop();
    return true;
  };

  useEffect(() => {
    const backSub = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backSub.remove();
  }, []);

  const [submitting, setSubmitting] = useState(false);

  const handleConfirmAndProceed = () => {
    // Navigate to ringing screen with all entry data
    // The visitor pass will be created AFTER the call when guard clicks "Allow"
    navigation.push("ringingScreen", {
      hostName,
      selectedFlatNo: visiting,
      guestName: name,
      visitorPhone: phoneNumber, // FIXED: Use phoneNumber consistently
      expectedTime: selectedTime || new Date().toISOString(), // Use string version
      insideTime,
      entryType,           // Pass entry type
      guestDetails,        // Pass additional details
      guestMessage,        // Pass message/purpose
      companyName,         // FIXED: Pass company name for delivery entries
      // Pass all data needed for visitor pass creation later
      guestData: {
        name,
        phoneNumber, // FIXED: Use phoneNumber consistently
        visiting,
        hostName,
        insideTime,
        selectedTime: selectedTime || new Date().toISOString(), // Use string version
        entryType,
        guestDetails,
        guestMessage,
        companyName  // FIXED: Include company name in guest data
      }
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <MyStatusBar />
      
      {/* Header - Standard Pattern */}
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
          {entryTypeInfo.title}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View
          style={{
            alignItems: "center",
            marginTop: Default.fixPadding * 2.8,
          }}
        >
          <Image
            source={require("../assets/images/img2.png")}
            style={styles.image}
          />
        </View>

        {/* Entry Details Card */}
        <View style={styles.detailCard}>
          <Text style={{ ...Fonts.Medium16black, marginBottom: Default.fixPadding * 1.5 }}>
            {entryType.charAt(0).toUpperCase() + entryType.slice(1)} Information
          </Text>
          
          <View style={{ flexDirection: 'row', marginBottom: Default.fixPadding }}>
            <MaterialCommunityIcons name="account" size={20} color={Colors.grey} />
            <Text style={{ ...Fonts.Medium16black, marginLeft: Default.fixPadding }}>
              {entryTypeInfo.nameLabel}: {name}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', marginBottom: Default.fixPadding }}>
            <MaterialCommunityIcons name="phone" size={20} color={Colors.grey} />
            <Text style={{ ...Fonts.Medium16black, marginLeft: Default.fixPadding }}>
              {entryTypeInfo.phoneLabel}: {phoneNumber || 'Not provided'}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', marginBottom: Default.fixPadding }}>
            <MaterialCommunityIcons name="home-outline" size={20} color={Colors.grey} />
            <Text style={{ ...Fonts.Medium16black, marginLeft: Default.fixPadding }}>
              {entryTypeInfo.visitingLabel}: {visiting}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', marginBottom: Default.fixPadding }}>
            <MaterialCommunityIcons name="account-outline" size={20} color={Colors.grey} />
            <Text style={{ ...Fonts.Medium16black, marginLeft: Default.fixPadding }}>
              Host: {hostName}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', marginBottom: Default.fixPadding }}>
            <MaterialCommunityIcons name="calendar" size={20} color={Colors.grey} />
            <Text style={{ ...Fonts.Medium16black, marginLeft: Default.fixPadding }}>
              Time of Entry: {selectedTimeDate?.toLocaleTimeString()}
            </Text>
          </View>

          {/* Show cab-specific details in organized way (same as allowed screen) */}
          {entryType === 'cab' && cabDetails && (
            <>
              <View style={{ flexDirection: 'row', marginBottom: Default.fixPadding }}>
                <MaterialCommunityIcons name="car" size={20} color={Colors.grey} />
                <Text style={{ ...Fonts.Medium16black, marginLeft: Default.fixPadding }}>
                  Company: {cabDetails.company}
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', marginBottom: Default.fixPadding }}>
                <MaterialCommunityIcons name="card-text" size={20} color={Colors.grey} />
                <Text style={{ ...Fonts.Medium16black, marginLeft: Default.fixPadding }}>
                  Last 4 Digits: {cabDetails.vehicleDigits}
                </Text>
              </View>
              
              {purposeText && (
                <View style={{ flexDirection: 'row' }}>
                  <MaterialCommunityIcons name="clipboard-text" size={20} color={Colors.grey} />
                  <Text style={{ ...Fonts.Medium16black, marginLeft: Default.fixPadding }}>
                    Purpose: {purposeText}
                  </Text>
                </View>
              )}
            </>
          )}
          
          {/* Show delivery-specific details */}
          {entryType === 'delivery' && (
            <>
              <View style={{ flexDirection: 'row', marginBottom: Default.fixPadding }}>
                <MaterialCommunityIcons name="store" size={20} color={Colors.grey} />
                <Text style={{ ...Fonts.Medium16black, marginLeft: Default.fixPadding }}>
                  Company: {companyName || 'Delivery Service'}
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row' }}>
                <MaterialCommunityIcons name="clipboard-text" size={20} color={Colors.grey} />
                <Text style={{ ...Fonts.Medium16black, marginLeft: Default.fixPadding }}>
                  Purpose: Package delivery
                </Text>
              </View>
            </>
          )}
          
          {/* Show service-specific details (EXACT same as allowedScreen) */}
          {entryType === 'service' && (
            <>
              <View style={{ flexDirection: 'row', marginBottom: Default.fixPadding }}>
                <MaterialCommunityIcons name="account-wrench" size={20} color={Colors.grey} />
                <Text style={{ ...Fonts.Medium16black, marginLeft: Default.fixPadding }}>
                  Service Type: {guestDetails || guestMessage || 'Service Provider'}
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row' }}>
                <MaterialCommunityIcons name="clipboard-text" size={20} color={Colors.grey} />
                <Text style={{ ...Fonts.Medium16black, marginLeft: Default.fixPadding }}>
                  Purpose: Service visit
                </Text>
              </View>
            </>
          )}
          
          {/* Show general details for guest entries only */}
          {entryType !== 'cab' && entryType !== 'delivery' && entryType !== 'service' && guestDetails && (
            <View style={{ flexDirection: 'row', marginBottom: Default.fixPadding }}>
              <MaterialCommunityIcons name="information" size={20} color={Colors.grey} />
              <Text style={{ ...Fonts.Medium16black, marginLeft: Default.fixPadding }}>
                Details: {guestDetails}
              </Text>
            </View>
          )}
          
          {entryType !== 'cab' && entryType !== 'delivery' && entryType !== 'service' && guestMessage && (
            <View style={{ flexDirection: 'row' }}>
              <MaterialCommunityIcons name="clipboard-text" size={20} color={Colors.grey} />
              <Text style={{ ...Fonts.Medium16black, marginLeft: Default.fixPadding }}>
                Purpose: {guestMessage}
              </Text>
            </View>
          )}
        </View>

        {/* Confirm Button */}
        <View
          style={{
            marginBottom: Default.fixPadding * 2,
            marginHorizontal: Default.fixPadding * 2,
          }}
        >
          <AwesomeButton
            height={50}
            onPress={handleConfirmAndProceed}
            raiseLevel={1}
            stretch={true}
            borderRadius={10}
            backgroundShadow={Colors.primary}
            backgroundDarker={Colors.primary}
            backgroundColor={Colors.primary}
          >
            <Text
              numberOfLines={1}
              style={{ ...Fonts.SemiBold18white, overflow: "hidden" }}
            >
              Confirm & Send Notification
            </Text>
          </AwesomeButton>
        </View>
      </ScrollView>
    </View>
  );
};

export default EntryConfirmationScreen;

const styles = StyleSheet.create({
  detailCard: {
    marginHorizontal: Default.fixPadding * 2,
    marginTop: Default.fixPadding * 2,
    marginBottom: Default.fixPadding * 3,
    padding: Default.fixPadding * 1.6,
    borderRadius: 12,
    backgroundColor: Colors.white,
    elevation: 3,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
});
