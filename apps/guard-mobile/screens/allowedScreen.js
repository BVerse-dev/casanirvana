import React, { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from "react-native";
import MyStatusBar from "../components/myStatusBar";
import { Colors, Default, Fonts } from "../constants/styles";
import { useTranslation } from "react-i18next";
import { ms } from "react-native-size-matters/extend";
import QRCode from 'react-native-qrcode-svg';
import { supabase } from "../utils/supabase";
import moment from "moment";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useGuardAuth } from '../contexts/GuardAuthContext';
import { useVisitorPasses } from '../hooks/useVisitorPasses';
import { resolveUnitResidentInfo } from "../services/unitValidationService";

const AllowedScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useGuardAuth();
  const { updatePassStatus } = useVisitorPasses();
  
  const { 
    hostName, 
    selectedFlatNo, 
    guestName,
    phoneNumber,
    arrivalTime,
    guestDetails,
    guestMessage,
    companyName,      // FIXED: Add company name for delivery
    unitId,
    visitorPassId,    // Visitor pass ID from entry
    visitorPhone,     // Visitor phone from entry
    expectedTime,     // Expected time from entry
    entryType = 'guest',  // Entry type: guest, cab, delivery, service
    cabData,          // NEW: cab-specific data
    deliveryData,     // NEW: delivery-specific data
    visitorType,      // NEW: visitor type parameter (delivery, cab, guest)
    guestData         // FIXED: Add guest data
  } = route.params || {};

  const [visitorPass, setVisitorPass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resolvedHost, setResolvedHost] = useState({
    name: hostName || "Resident",
    phone: null,
  });

  // Generate appropriate entry text based on entry type
  const getEntryTypeText = () => {
    const currentEntryType = visitorType || entryType;
    
    switch (currentEntryType) {
      case 'cab':
        return {
          title: 'Cab Entry Approved!',
          subtitle: 'Cab has been granted entry successfully',
          nameLabel: 'Driver',
          phoneLabel: 'Phone',
          additionalInfo: (cabData?.companyName || guestDetails) || 'Cab service'
        };
      case 'delivery':
        return {
          title: 'Delivery Approved!',
          subtitle: 'Delivery person has been granted entry',
          nameLabel: 'Name', // FIXED: Match confirmation screen
          phoneLabel: 'Phone',
          additionalInfo: (deliveryData?.companyName || guestDetails) || 'Package delivery'
        };
      case 'service':
        return {
          title: 'Service Provider Approved!',
          subtitle: 'Service provider has been granted entry',
          nameLabel: 'Service Person',
          phoneLabel: 'Phone',
          additionalInfo: guestDetails || 'Service visit'
        };
      default:
        return {
          title: 'Guest Approved!',
          subtitle: 'Entry has been granted successfully',
          nameLabel: 'Guest',
          phoneLabel: 'Phone',
          additionalInfo: guestDetails || 'Guest visit'
        };
    }
  };

  const entryTypeInfo = getEntryTypeText();

  // Parse cab-specific details
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

  // Extract purpose from guestMessage - should be just the service type
  const extractPurpose = () => {
    if (entryType === 'cab' && guestMessage) {
      // guestMessage should contain just the service type info
      // Look for the service type keywords in the message
      const message = guestMessage.toLowerCase();
      
      if (message.includes('pickup') && message.includes('dropoff')) {
        return 'Pickup & Dropoff';
      } else if (message.includes('pickup')) {
        return 'Pickup';
      } else if (message.includes('dropoff')) {
        return 'Dropoff';
      }
      
      // If no keywords found, return the raw service type from cabData if available
      return guestMessage;
    }
    return guestMessage;
  };

  const purposeText = extractPurpose();

  function tr(key) {
    return t(`allowedScreen:${key}`);
  }

  // Update visitor pass status and send notification when screen loads
  useEffect(() => {
    updateVisitorPassStatus();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const currentHostName = String(hostName || "").trim().toLowerCase();
    const needsResolution =
      !!unitId &&
      (!hostName ||
        currentHostName === "resident" ||
        currentHostName === "unknown resident" ||
        currentHostName === "unknown host");

    if (!needsResolution) {
      setResolvedHost((previous) => ({
        ...previous,
        name: hostName || previous.name || "Resident",
      }));
      return undefined;
    }

    const hydrateHost = async () => {
      const resident = await resolveUnitResidentInfo(unitId, {
        name: hostName || "Resident",
        phone: null,
      });
      if (!cancelled) {
        setResolvedHost({
          name: resident.name,
          phone: resident.phone,
        });
      }
    };

    hydrateHost();

    return () => {
      cancelled = true;
    };
  }, [hostName, unitId]);

  const navigateHome = () => {
    navigation.navigate("bottomTab", { screen: "homeScreen" });
  };

  const updateVisitorPassStatus = async () => {
    if (!isAuthenticated || !visitorPassId) {
      Alert.alert('Error', 'Authentication required or invalid visitor pass');
      navigation.goBack();
      return;
    }

    try {
      setLoading(true);

      const hostInfo = unitId
        ? await resolveUnitResidentInfo(unitId, {
            name: hostName || resolvedHost.name || "Resident",
          })
        : { name: hostName || resolvedHost.name || "Resident", phone: null };

      setResolvedHost({
        name: hostInfo.name,
        phone: hostInfo.phone || null,
      });

      // Update visitor pass status to 'approved' and 'checked_in'
      const guardNotes = `${entryTypeInfo.nameLabel} approved by guard. Host: ${hostInfo.name}, Unit: ${selectedFlatNo}`;
      await updatePassStatus(visitorPassId, 'checked_in', guardNotes);

      // Fetch the updated visitor pass data
      const { data: updatedPass, error: fetchError } = await supabase
        .from('visitor_passes')
        .select('*')
        .eq('id', visitorPassId)
        .single();

      if (fetchError) {
        console.error('Error fetching updated visitor pass:', fetchError);
        Alert.alert('Warning', 'Visitor approved but could not fetch details');
      } else {
        setVisitorPass(updatedPass);
      }

      // Send approval notification
      await sendApprovalNotification(updatedPass);

    } catch (error) {
      console.error('Error updating visitor pass:', error);
      Alert.alert('Error', 'Failed to approve visitor: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const sendApprovalNotification = async (passRow) => {
    try {
      const recipientId = passRow?.created_by;
      if (!recipientId || recipientId === user?.id) {
        return;
      }

      // Send notification to resident/host about entry approval
      const notificationData = {
        user_id: recipientId,
        title: `${entryTypeInfo.nameLabel} Approved`,
        body: `${guestName} has been approved for entry to ${selectedFlatNo}.`,
        notification_type: `${entryType}_approved`,
        reference_id: visitorPassId,
        priority: 'medium',
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('notifications').insert([notificationData]);
      if (error) {
        throw error;
      }
      
    } catch (error) {
      console.error('Error sending approval notification:', error);
      // Don't fail the whole process if notification fails
    }
  };

  const formatTime = (timestamp) => {
    return moment(timestamp).format('MMM DD, YYYY - HH:mm');
  };

  const handleBackToDashboard = () => {
    navigateHome();
  };

  const generateQRCodeData = () => {
    if (!visitorPass) return '';
    
    return JSON.stringify({
      id: visitorPass.id,
      visitor_name: visitorPass.visitor_name,
      visitor_phone: visitorPass.visitor_phone,
      unit_id: visitorPass.unit_id,
      flat_no: selectedFlatNo,
      host_name: resolvedHost.name,
      from_date: visitorPass.from_date,
      to_date: visitorPass.to_date,
      status: visitorPass.status,
      entry_method: 'walk_in',
      type: 'visitor_pass'
    });
  };

  const qrCodeValue = visitorPass?.qr_code_data || generateQRCodeData();
  const entryCodeValue = visitorPass?.entry_code || 'N/A';

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.white }}>
        <MyStatusBar />
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          paddingHorizontal: Default.fixPadding * 2
        }}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={{ 
            ...Fonts.Medium16black, 
            marginTop: Default.fixPadding * 2,
            textAlign: 'center'
          }}>
            Approving {entryType} entry...
          </Text>
          <Text style={{ 
            ...Fonts.Medium14grey, 
            marginTop: Default.fixPadding,
            textAlign: 'center'
          }}>
            Updating visitor pass status and sending notifications
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <MyStatusBar />
      
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Header */}
        <View style={{ 
          backgroundColor: Colors.lightGreen, 
          paddingVertical: Default.fixPadding * 3,
          paddingHorizontal: Default.fixPadding * 2,
          alignItems: 'center'
        }}>
          <View style={{
            backgroundColor: Colors.white,
            borderRadius: 50,
            padding: Default.fixPadding,
            marginBottom: Default.fixPadding * 2
          }}>
            <Ionicons name="checkmark" size={40} color={Colors.green} />
          </View>
          
          <Text style={{ ...Fonts.SemiBold22black, textAlign: 'center', color: Colors.white }}>
            {entryTypeInfo.title}
          </Text>
          
          <Text style={{ ...Fonts.Medium16black, textAlign: 'center', marginTop: Default.fixPadding, color: Colors.white }}>
            {entryTypeInfo.subtitle}
          </Text>
        </View>

        {/* Guest Information Card */}
        <View style={{ 
          margin: Default.fixPadding * 2,
          backgroundColor: Colors.white,
          borderRadius: 12,
          padding: Default.fixPadding * 2,
          elevation: 3,
          shadowColor: Colors.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}>
          <Text style={{ ...Fonts.Medium16black, marginBottom: Default.fixPadding * 1.5 }}>
            Entry Information
          </Text>
          
          <View style={{ flexDirection: 'row', marginBottom: Default.fixPadding }}>
            <MaterialCommunityIcons name="account" size={20} color={Colors.grey} />
            <Text style={{ ...Fonts.Medium16black, marginLeft: Default.fixPadding }}>
              {entryTypeInfo.nameLabel}: {guestName}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', marginBottom: Default.fixPadding }}>
            <MaterialCommunityIcons name="phone" size={20} color={Colors.grey} />
            <Text style={{ ...Fonts.Medium16black, marginLeft: Default.fixPadding }}>
              {entryTypeInfo.phoneLabel}: {visitorPhone || phoneNumber || 'Not provided'}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', marginBottom: Default.fixPadding }}>
            <MaterialCommunityIcons name="home-outline" size={20} color={Colors.grey} />
            <Text style={{ ...Fonts.Medium16black, marginLeft: Default.fixPadding }}>
              Flat/Unit: {selectedFlatNo}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', marginBottom: Default.fixPadding }}>
            <MaterialCommunityIcons name="account-outline" size={20} color={Colors.grey} />
            <Text style={{ ...Fonts.Medium16black, marginLeft: Default.fixPadding }}>
              Host: {resolvedHost.name}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', marginBottom: Default.fixPadding }}>
            <MaterialCommunityIcons name="clock" size={20} color={Colors.grey} />
            <Text style={{ ...Fonts.Medium16black, marginLeft: Default.fixPadding }}>
              Time: {formatTime(visitorPass?.actual_entry_time || new Date())}
            </Text>
          </View>
          
          {/* Show cab-specific details in organized way */}
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
                  Company: {companyName || guestData?.companyName || visitorData?.company_name || 'Delivery Service'}
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
          
          {/* Show service-specific details */}
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

        {/* QR Code Section */}
        {visitorPass && (
          <View style={{ 
            margin: Default.fixPadding * 2,
            backgroundColor: Colors.white,
            borderRadius: 12,
            padding: Default.fixPadding * 2,
            elevation: 3,
            shadowColor: Colors.black,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            alignItems: 'center'
          }}>
            <Text style={{ ...Fonts.Bold16primary, marginBottom: Default.fixPadding * 1.5 }}>
              Entry QR Code
            </Text>
            
            <View style={{ 
              backgroundColor: Colors.lightGrey, 
              padding: Default.fixPadding * 1.5,
              borderRadius: 8,
              marginBottom: Default.fixPadding
            }}>
              <QRCode
                value={qrCodeValue || '{}'}
                size={150}
                color={Colors.black}
                backgroundColor={Colors.white}
              />
            </View>
            
            <Text style={{ ...Fonts.Medium12grey, textAlign: 'center' }}>
              Show this QR code at the exit for checkout
            </Text>
          </View>
        )}

        {/* Status Information */}
        <View style={{ 
          margin: Default.fixPadding * 2,
          backgroundColor: Colors.lightGreen,
          borderRadius: 12,
          padding: Default.fixPadding * 2,
        }}>
          <Text style={{ ...Fonts.Medium16black, marginBottom: Default.fixPadding, color: Colors.white }}>
            Entry Status
          </Text>
          
          <Text style={{ ...Fonts.Medium16black, marginBottom: Default.fixPadding * 0.5, color: Colors.white }}>
            Status: <Text style={{ color: Colors.white, fontWeight: 'bold' }}>Checked In</Text>
          </Text>
          
          <Text style={{ ...Fonts.Medium16black, marginBottom: Default.fixPadding * 0.5, color: Colors.white }}>
            Entry Time: {formatTime(visitorPass?.actual_entry_time || new Date())}
          </Text>
          
          <Text style={{ ...Fonts.Medium16black, color: Colors.white }}>
            Entry Code: <Text style={{ ...Fonts.Medium18black, color: Colors.white }}>{entryCodeValue}</Text>
          </Text>
        </View>
      </ScrollView>

      {/* Back to Home Button */}
      <View style={{ 
        backgroundColor: Colors.white,
        paddingTop: Default.fixPadding * 2,
        paddingHorizontal: Default.fixPadding * 2,
        paddingBottom: Default.fixPadding * 2,
        elevation: 5,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }}>
        <TouchableOpacity
          onPress={handleBackToDashboard}
          style={{
            backgroundColor: Colors.primary,
            paddingVertical: Default.fixPadding * 1.5,
            borderRadius: 8,
            alignItems: 'center'
          }}
        >
          <Text style={{ ...Fonts.Medium16black, color: Colors.white }}>
            Back to Home
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AllowedScreen;
