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
import { resolveUnitResidentInfo } from "../services/unitValidationService";

const CancelledScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useGuardAuth();
  const { updatePassStatus } = useVisitorPasses();
  
  const { 
    hostName, 
    selectedFlatNo, 
    guestName,
    phoneNumber,
    visitorPassId,    // Visitor pass ID from guest entry
    visitorPhone,     // Visitor phone from guest entry
    expectedTime,     // Expected time from guest entry
    unitId,
  } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [resolvedHost, setResolvedHost] = useState({
    name: hostName || "Resident",
    phone: null,
  });

  function tr(key) {
    return t(`cancelledScreen:${key}`);
  }

  useEffect(() => {
    updateVisitorPassStatus();
    
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      e.preventDefault();
      navigation.navigate("bottomTab", { screen: "homeScreen" });
    });

    return unsubscribe;
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

      // Update visitor pass status to 'denied'
      const guardNotes = `Guest entry denied by guard. Host: ${hostInfo.name}, Unit: ${selectedFlatNo}`;
      await updatePassStatus(visitorPassId, 'denied', guardNotes);

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
      // Fetch pass to resolve the notification recipient
      const { data: passRow, error: passError } = await supabase
        .from("visitor_passes")
        .select("id, created_by")
        .eq("id", visitorPassId)
        .maybeSingle();

      if (passError) throw passError;

      const recipientId = passRow?.created_by;
      if (!recipientId || recipientId === user?.id) {
        return;
      }

      // Send notification to resident/host about guest rejection
      const notificationData = {
        user_id: recipientId,
        title: 'Guest Entry Denied',
        body: `${guestName} was denied entry to ${selectedFlatNo}.`,
        notification_type: 'visitor_denied',
        reference_id: visitorPassId,
        priority: 'high',
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('notifications').insert([notificationData]);
      if (error) throw error;
      
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
            <Text style={{ ...Fonts.Medium14grey }}>Host: {resolvedHost.name || "N/A"}</Text>
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
            onPress={() => navigation.navigate("bottomTab", { screen: "homeScreen" })}
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
