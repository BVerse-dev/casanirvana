import React, { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native";
import MyStatusBar from "../components/myStatusBar";
import { Colors, Default, Fonts } from "../constants/styles";
import { useTranslation } from "react-i18next";
import { ms } from "react-native-size-matters/extend";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useGuardAuth } from '../contexts/GuardAuthContext';
import { useVisitorPasses } from '../hooks/useVisitorPasses';
import { supabase } from "../utils/supabase";
import moment from "moment";

const CancelledScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { guard, user, isAuthenticated } = useGuardAuth();
  const { updatePassStatus } = useVisitorPasses();
  
  const { 
    hostName, 
    selectedFlatNo, 
    guestName,
    phoneNumber,
    visitorPassId,    // Visitor pass ID from guest entry
    visitorPhone,     // Visitor phone from guest entry
    expectedTime      // Expected time from guest entry
  } = route.params || {};

  const [loading, setLoading] = useState(true);

  function tr(key) {
    return t(`cancelledScreen:${key}`);
  }

  useEffect(() => {
    updateVisitorPassStatus();
    
    navigation.addListener("beforeRemove", (e) => {
      e.preventDefault();
      navigation.navigate("homeScreen");
    });
  }, []);

  const updateVisitorPassStatus = async () => {
    if (!isAuthenticated || !visitorPassId) {
      Alert.alert('Error', 'Authentication required or invalid visitor pass');
      navigation.goBack();
      return;
    }

    try {
      setLoading(true);

      // Update visitor pass status to 'rejected'
      const guardNotes = `Guest entry cancelled/rejected by guard. Host: ${hostName}, Unit: ${selectedFlatNo}`;
      await updatePassStatus(visitorPassId, 'rejected', guardNotes);

      // Send rejection notification
      await sendRejectionNotification();

    } catch (error) {
      console.error('Error updating visitor pass:', error);
      Alert.alert('Error', 'Failed to update visitor status: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const sendRejectionNotification = async () => {
    try {
      // Send notification to resident/host about guest rejection
      const notificationData = {
        title: 'Guest Entry Denied',
        message: `${guestName} was denied entry to ${selectedFlatNo}`,
        type: 'visitor_rejected',
        visitor_pass_id: visitorPassId,
        created_at: new Date().toISOString()
      };

      // Insert notification (assuming notifications table exists)
      await supabase.from('notifications').insert([notificationData]);
      
    } catch (error) {
      console.error('Error sending rejection notification:', error);
      // Don't fail the whole process if notification fails
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <MyStatusBar />
      <View style={{ justifyContent: "space-between", alignItems: "center" }} />
      
      {loading ? (
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          paddingHorizontal: Default.fixPadding * 2
        }}>
          <ActivityIndicator size="large" color={Colors.red} />
          <Text style={{ 
            ...Fonts.Medium16black, 
            marginTop: Default.fixPadding * 2,
            textAlign: 'center'
          }}>
            Updating visitor status...
          </Text>
          <Text style={{ 
            ...Fonts.Medium14grey, 
            marginTop: Default.fixPadding,
            textAlign: 'center'
          }}>
            Recording entry denial and sending notifications
          </Text>
        </View>
      ) : (
        <View
          style={{
            flex: 9,
            justifyContent: "center",
            alignItems: "center",
            marginHorizontal: Default.fixPadding * 2,
          }}
        >
          <View style={{
            width: ms(80),
            height: ms(80),
            borderRadius: ms(40),
            backgroundColor: Colors.red,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: Default.fixPadding * 2
          }}>
            <Ionicons 
              name="close" 
              size={ms(40)} 
              color={Colors.white} 
            />
          </View>
          <Text
            style={{
              ...Fonts.SemiBold24black,
              marginTop: Default.fixPadding * 2,
              color: Colors.red,
            }}
          >
            {tr("cancelled") || "Entry Cancelled"}
          </Text>
          <Text
            style={{ 
              ...Fonts.SemiBold16grey, 
              marginTop: Default.fixPadding,
              textAlign: 'center'
            }}
          >
            {tr("entryDenied") || "Guest entry has been denied"}
          </Text>
          
          {/* Guest Info */}
          <View style={{ 
            marginTop: Default.fixPadding * 2, 
            padding: Default.fixPadding * 1.5,
            backgroundColor: Colors.extraLightGrey,
            borderRadius: 10,
            width: '100%',
            alignItems: 'center'
          }}>
            <Text style={{ ...Fonts.Medium14grey }}>Guest: {guestName || "Unknown Guest"}</Text>
            <Text style={{ ...Fonts.Medium14grey }}>Phone: {visitorPhone || phoneNumber || "N/A"}</Text>
            <Text style={{ ...Fonts.Medium14grey }}>Flat: {selectedFlatNo || "N/A"}</Text>
            <Text style={{ ...Fonts.Medium14grey }}>Host: {hostName || "N/A"}</Text>
            <Text style={{ ...Fonts.Medium12grey, marginTop: Default.fixPadding * 0.5 }}>
              Denied at: {moment().format('MMM DD, YYYY - HH:mm')}
            </Text>
            <Text style={{ ...Fonts.Medium12grey }}>
              Pass ID: {visitorPassId || "N/A"}
            </Text>
          </View>

          {/* Status Information */}
          <View style={{ 
            marginTop: Default.fixPadding * 2,
            padding: Default.fixPadding * 1.5,
            backgroundColor: Colors.lightRed || '#FFE6E6',
            borderRadius: 10,
            width: '100%',
            alignItems: 'center'
          }}>
            <Text style={{ ...Fonts.Bold16red || {...Fonts.Bold16black, color: Colors.red} }}>
              Entry Status: REJECTED
            </Text>
            <Text style={{ ...Fonts.Medium12grey, textAlign: 'center', marginTop: Default.fixPadding * 0.5 }}>
              Visitor pass has been updated and notifications sent
            </Text>
          </View>
        </View>
      )}

      {!loading && (
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <TouchableOpacity
            onPress={() => navigation.navigate("homeScreen")}
            style={{ alignSelf: "center", padding: Default.fixPadding * 2 }}
          >
            <Text style={{ ...Fonts.SemiBold16primary }}>
              {tr("backToHome") || "Back to Home"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default CancelledScreen;
