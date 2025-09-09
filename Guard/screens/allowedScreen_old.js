import React, { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, Image, ScrollView, Alert } from "react-native";
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

const AllowedScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { guard, user, isAuthenticated } = useGuardAuth();
  const { updatePassStatus } = useVisitorPasses();
  
  const { 
    hostName, 
    selectedFlatNo, 
    guestName,
    phoneNumber,
    arrivalTime,
    guestDetails,
    guestMessage,
    unitId,
    visitorPassId,    // NEW: visitor pass ID from guest entry
    visitorPhone,     // NEW: visitor phone from guest entry
    expectedTime      // NEW: expected time from guest entry
  } = route.params || {};

  const [visitorPass, setVisitorPass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  function tr(key) {
    return t(`allowedScreen:${key}`);
  }

  // Update visitor pass status and send notification when screen loads
  useEffect(() => {
    updateVisitorPassStatus();
  }, []);

  const updateVisitorPassStatus = async () => {
    if (!isAuthenticated || !visitorPassId) {
      Alert.alert('Error', 'Authentication required or invalid visitor pass');
      navigation.goBack();
      return;
    }

    try {
      setLoading(true);

      // Update visitor pass status to 'approved' and 'checked_in'
      await updatePassStatus(visitorPassId, 'checked_in', `Guest approved by guard. Host: ${hostName}, Unit: ${selectedFlatNo}`);

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
      await sendApprovalNotification();

    } catch (error) {
      console.error('Error updating visitor pass:', error);
      Alert.alert('Error', 'Failed to approve visitor: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const sendApprovalNotification = async () => {
    try {
      // Send notification to resident/host about guest approval
      const notificationData = {
        title: 'Guest Approved',
        message: `${guestName} has been approved for entry to ${selectedFlatNo}`,
        type: 'visitor_approved',
        recipient_id: unitId, // Can be enhanced to get actual resident ID
        visitor_pass_id: visitorPassId,
        created_at: new Date().toISOString()
      };

      // Insert notification (assuming notifications table exists)
      await supabase.from('notifications').insert([notificationData]);
      
    } catch (error) {
      console.error('Error sending approval notification:', error);
      // Don't fail the whole process if notification fails
    }
  };
      
      if (!resolvedUnitId) {
        console.warn(`Unit ${selectedFlatNo} not found in database. Creating pass without unit_id.`);
        // We can still create the visitor pass with unit_id as null
        // The flat number will be stored in the QR code data for reference
      }
      
      console.log('Resolved unit ID:', resolvedUnitId, 'for flat:', selectedFlatNo);

      // Generate unique visitor pass ID and entry code
      const visitorPassId = `VP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const entryCode = visitorPassId.slice(-8).toUpperCase();

      // Create visit timestamps
      const now = new Date();
      const fromDate = arrivalTime ? new Date(arrivalTime) : now;
      const toDate = new Date(fromDate.getTime() + (4 * 60 * 60 * 1000)); // 4 hours later

      // Generate QR code data
      const qrCodeData = JSON.stringify({
        id: visitorPassId,
        visitor_name: guestName,
        visitor_phone: phoneNumber,
        unit_id: resolvedUnitId,
        flat_no: selectedFlatNo,
        host_name: hostName,
        from_date: fromDate.toISOString(),
        to_date: toDate.toISOString(),
        created_by: authUser.user.id,
        created_at: now.toISOString(),
        purpose: 'Guest Visit',
        type: 'visitor_pass',
        entry_code: entryCode,
        visitor_type: 'guest',
        status: 'approved'
      });

      // Create visitor pass in database
      const { data: newVisitorPass, error: passError } = await supabase
        .from('visitor_passes')
        .insert([{
          visitor_name: guestName,
          visitor_phone: phoneNumber,
          unit_id: resolvedUnitId,
          from_date: fromDate.toISOString(),
          to_date: toDate.toISOString(),
          status: 'approved',
          visitor_type: 'guest',
          purpose: 'Guest Visit',
          qr_code_data: qrCodeData,
          entry_code: entryCode,
          created_by: authUser.user.id,
          checked_in_at: now.toISOString() // Mark as checked in since guard approved entry
        }])
        .select()
        .single();

      if (passError) {
        console.error('Error creating visitor pass:', passError);
        Alert.alert('Error', 'Failed to create visitor pass');
        return;
      }

      setVisitorPass(newVisitorPass);

      // Send notification to host
      await sendHostNotification(newVisitorPass);

    } catch (error) {
      console.error('Error in createVisitorPassAndNotify:', error);
      Alert.alert('Error', 'Failed to process visitor entry');
    } finally {
      setLoading(false);
    }
  };

  const getValidUnitId = async (flatNo) => {
    try {
      // Parse flat number format like "A-105" into block and number
      const parts = flatNo.split('-');
      if (parts.length !== 2) {
        console.warn('Invalid flat number format:', flatNo);
        return null;
      }

      const [block, number] = parts;

      // Try to find unit by block and number combination
      const { data: unitData, error: unitError } = await supabase
        .from('units')
        .select('id')
        .eq('block', block)
        .eq('number', number)
        .single();

      if (unitError || !unitData) {
        console.warn('Unit not found in database:', flatNo, 'Block:', block, 'Number:', number);
        
        // Try to find by unit_number as fallback
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('units')
          .select('id')
          .eq('unit_number', flatNo)
          .single();

        if (fallbackError || !fallbackData) {
          console.warn('Unit not found with fallback lookup either');
          return null;
        }

        return fallbackData.id;
      }

      return unitData.id;
    } catch (error) {
      console.error('Error getting unit ID:', error);
      return null;
    }
  };

  const sendHostNotification = async (visitorPass) => {
    try {
      // Create notification for the host
      const notificationData = {
        title: 'Visitor Entry Approved',
        message: `Your visitor ${guestName} has been approved for entry to ${selectedFlatNo}. Entry code: ${visitorPass.entry_code}`,
        type: 'visitor_entry',
        recipient_id: unitId, // This should be the resident's user ID
        data: {
          visitor_pass_id: visitorPass.id,
          visitor_name: guestName,
          flat_no: selectedFlatNo,
          entry_code: visitorPass.entry_code,
          host_name: hostName
        }
      };

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([notificationData]);

      if (notificationError) {
        console.error('Error sending notification:', notificationError);
      } else {
        console.log('✅ Host notification sent successfully');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };
  useEffect(() => {
    navigation.addListener("beforeRemove", (e) => {
      e.preventDefault();
      navigation.navigate("homeScreen");
    });
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <MyStatusBar />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Success Message Section - Keep Original */}
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginHorizontal: Default.fixPadding * 2,
            paddingTop: Default.fixPadding * 4,
          }}
        >
          <Image
            source={require("../assets/images/check.png")}
            style={{ width: ms(80), height: ms(80), resizeMode: "contain" }}
          />
          <Text
            style={{
              ...Fonts.SemiBold24black,
              marginTop: Default.fixPadding * 2,
            }}
          >
            {tr("allowed")}
          </Text>
          <Text
            style={{ ...Fonts.SemiBold16grey, marginTop: Default.fixPadding }}
          >
            {tr("letsGuest")}
          </Text>
        </View>

        {/* Visitor Pass Section */}
        {loading ? (
          <View style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: Default.fixPadding * 3,
          }}>
            <Text style={Fonts.Medium16grey}>Generating visitor pass...</Text>
          </View>
        ) : visitorPass ? (
          <View style={{
            marginHorizontal: Default.fixPadding * 2,
            marginTop: Default.fixPadding * 3,
          }}>
            {/* QR Code Card */}
            <View style={{
              backgroundColor: Colors.white,
              borderRadius: 15,
              padding: Default.fixPadding * 2,
              alignItems: 'center',
              ...Default.shadow,
              marginBottom: Default.fixPadding * 2,
            }}>
              <Text style={{
                ...Fonts.SemiBold18black,
                marginBottom: Default.fixPadding * 1.5,
                textAlign: 'center',
              }}>
                Visitor Pass
              </Text>
              
              <QRCode
                value={visitorPass.qr_code_data}
                size={ms(180)}
                color={Colors.black}
                backgroundColor={Colors.white}
              />
              
              <Text style={{
                ...Fonts.SemiBold20primary,
                marginTop: Default.fixPadding * 1.5,
                letterSpacing: 2,
              }}>
                {visitorPass.entry_code}
              </Text>
              
              <Text style={{
                ...Fonts.Medium14grey,
                textAlign: 'center',
                marginTop: Default.fixPadding * 0.5,
              }}>
                Entry Code
              </Text>
            </View>

            {/* Visitor Details Card */}
            <View style={{
              backgroundColor: Colors.white,
              borderRadius: 15,
              padding: Default.fixPadding * 2,
              ...Default.shadow,
              marginBottom: Default.fixPadding * 2,
            }}>
              <Text style={{
                ...Fonts.SemiBold16black,
                marginBottom: Default.fixPadding * 1.5,
              }}>
                Visitor Details
              </Text>
              
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: Default.fixPadding }}>
                <Ionicons name="person-outline" size={18} color={Colors.primary} />
                <Text style={{ ...Fonts.Medium14black, marginLeft: Default.fixPadding }}>
                  {guestName}
                </Text>
              </View>
              
              {phoneNumber && (
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: Default.fixPadding }}>
                  <MaterialCommunityIcons name="phone-outline" size={18} color={Colors.primary} />
                  <Text style={{ ...Fonts.Medium14black, marginLeft: Default.fixPadding }}>
                    {phoneNumber}
                  </Text>
                </View>
              )}
              
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: Default.fixPadding }}>
                <Ionicons name="time-outline" size={18} color={Colors.primary} />
                <Text style={{ ...Fonts.Medium14black, marginLeft: Default.fixPadding }}>
                  {moment(visitorPass.from_date).format('MMM DD, YYYY - HH:mm')}
                </Text>
              </View>
              
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <MaterialCommunityIcons name="clock-outline" size={18} color={Colors.primary} />
                <Text style={{ ...Fonts.Medium14black, marginLeft: Default.fixPadding }}>
                  Valid until {moment(visitorPass.to_date).format('HH:mm')}
                </Text>
              </View>
            </View>

            {/* Host Details Card */}
            <View style={{
              backgroundColor: Colors.white,
              borderRadius: 15,
              padding: Default.fixPadding * 2,
              ...Default.shadow,
              marginBottom: Default.fixPadding * 3,
            }}>
              <Text style={{
                ...Fonts.SemiBold16black,
                marginBottom: Default.fixPadding * 1.5,
              }}>
                Host Information
              </Text>
              
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: Default.fixPadding }}>
                <MaterialCommunityIcons name="account-tie-outline" size={18} color={Colors.primary} />
                <Text style={{ ...Fonts.Medium14black, marginLeft: Default.fixPadding }}>
                  {hostName}
                </Text>
              </View>
              
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <MaterialCommunityIcons name="home-outline" size={18} color={Colors.primary} />
                <Text style={{ ...Fonts.Medium14black, marginLeft: Default.fixPadding }}>
                  Flat {selectedFlatNo}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: Default.fixPadding * 3,
          }}>
            <Text style={Fonts.Medium16grey}>Failed to generate visitor pass</Text>
          </View>
        )}
      </ScrollView>

      {/* Back to Home Button - Keep Original Position */}
      <View style={{ justifyContent: "flex-end", paddingBottom: Default.fixPadding * 2 }}>
        <TouchableOpacity
          onPress={() => navigation.navigate("homeScreen")}
          style={{ alignSelf: "center", padding: Default.fixPadding * 2 }}
        >
          <Text style={{ ...Fonts.SemiBold16primary }}>{tr("backToHome")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AllowedScreen;
