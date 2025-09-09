import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, Modal } from "react-native";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { ms } from "react-native-size-matters/extend";
import MyStatusBar from "../components/myStatusBar";
import { Colors, Default, Fonts } from "../constants/styles";
import { useVisitorPasses } from "../hooks/useVisitorPasses";

const VisitorDetailScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const { updatePassStatus, error, fetchPasses } = useVisitorPasses();
  const [updating, setUpdating] = useState(false);
  
  // Modal states
  const [callModalVisible, setCallModalVisible] = useState(false);
  const [markInModalVisible, setMarkInModalVisible] = useState(false);
  const [markOutModalVisible, setMarkOutModalVisible] = useState(false);

  function tr(key) {
    return t(`visitorDetailScreen:${key}`);
  }

  // Expect the route.params to contain a visitor object
  const visitor = route?.params?.visitor || {};
  const {
    image,
    name,
    phoneNumber,
    block,
    other1, // type: Guest / Delivery / Cab / Service
    other2, // duration or pickup/dropoff
    hostName,
    hostPhone,
    hostId, // Host profile ID (if available)
    flatNo,
    entryTime,
    exitTime,
    status, // 'inside' | 'waiting' | 'exited'
    vehicleNumber,
    company,
    notes,
    passId,
    originalPass,
    serviceType,
    purpose,
  } = visitor;

  // Determine visitor type from other1 or originalPass
  const visitorType = (other1 ? other1.toLowerCase() : '') || 
                     (originalPass?.visitor_type ? originalPass.visitor_type.toLowerCase() : 'guest');

  // Map to actual database fields from originalPass
  const dbFields = originalPass ? {
    visitorName: originalPass.visitor_name || name,
    visitorPhone: originalPass.visitor_phone || phoneNumber,
    visitorType: originalPass.visitor_type || visitorType,
    purpose: originalPass.purpose || purpose,
    vehicleNumber: originalPass.vehicle_number || vehicleNumber,
    companyName: originalPass.company_name || company,
    serviceType: originalPass.service_type || serviceType,
    vehicleType: originalPass.vehicle_type,
    driverName: originalPass.driver_name,
    deliveryDetails: originalPass.delivery_details,
    checkedInAt: originalPass.checked_in_at,
    checkedOutAt: originalPass.checked_out_at,
    fromDate: originalPass.from_date,
    toDate: originalPass.to_date,
    hostName: originalPass.host_name || hostName,
    hostPhone: originalPass.host_phone || hostPhone,
    flatNumber: originalPass.flat_number || flatNo,
  } : {};

  // Get proper pass ID for database operations
  const actualPassId = passId || originalPass?.id;

  // Handle calling the visitor or host
  const handleCall = () => {
    setCallModalVisible(true);
  };

  // Handle call visitor (external call)
  const handleCallVisitor = () => {
    setCallModalVisible(false);
    const visitorPhone = dbFields.visitorPhone || phoneNumber;
    if (visitorPhone) {
      Linking.openURL(`tel:${visitorPhone}`);
    } else {
      Alert.alert(tr("no_phone"), tr("no_phone_message"));
    }
  };

  // Handle call host (in-app call like WhatsApp/Ring screen)
  const handleCallHost = () => {
    console.log('=== Call Host Pressed ===');
    setCallModalVisible(false);
    
    // Get unit information for the call
    const unitId = originalPass?.unit_id;
    const unitInfo = originalPass?.units;
    const unitDisplay = unitInfo ? `${unitInfo.block}-${unitInfo.number}` : (flatNo || block);
    
    console.log('Calling unit:', unitDisplay, 'ID:', unitId);
    
    // Navigate to call screen - pass the EXACT host information from the visitor pass
    navigation.navigate('callScreen', {
      name: "", // Empty string so route.params?.name is falsy
      phone: null, // No direct phone - will find host through unit
      hostId: unitId, // Use unit ID to find the host
      hostPhone: dbFields.hostPhone || hostPhone,
      unitId: unitId,
      unitDisplay: unitDisplay,
      visitorName: dbFields.visitorName || name,
      actualHostName: dbFields.hostName || hostName, // Pass the EXACT host name from visitor pass
      passFlatNumber: dbFields.flatNumber || flatNo, // Pass the exact flat from the pass
      originalPass: originalPass, // Pass the complete pass data
      image: null,
      callType: 'host_call'
    });
  };

  // Handle marking visitor in
  const handleMarkIn = () => {
    console.log('Mark In clicked - status:', status);
    console.log('Mark In clicked - updating:', updating);
    console.log('Mark In clicked - disabled check:', updating || status === 'inside' || status === 'checked_in');
    setMarkInModalVisible(true);
  };

  // Confirm mark in action
  const confirmMarkIn = async () => {
    setMarkInModalVisible(false);
    setUpdating(true);
    try {
      await updatePassStatus(actualPassId, 'checked_in');
      setUpdating(false);
      Alert.alert(tr("success"), tr("visitor_marked_in"), [
        { 
          text: tr("ok"), 
          onPress: () => navigation.goBack()
        }
      ]);
    } catch (err) {
      setUpdating(false);
      Alert.alert(tr("error"), err.message || "Failed to update visitor status");
    }
  };

  // Handle marking visitor out
  const handleMarkOut = () => {
    if (!actualPassId || !originalPass) {
      Alert.alert(tr("error"), tr("invalid_pass_data"));
      return;
    }

    if (originalPass.status !== 'checked_in') {
      Alert.alert(tr("not_inside"), tr("visitor_not_inside"));
      return;
    }

    setMarkOutModalVisible(true);
  };

  // Confirm mark out action
  const confirmMarkOut = async () => {
    setMarkOutModalVisible(false);
    setUpdating(true);
    try {
      await updatePassStatus(actualPassId, 'checked_out');
      setUpdating(false);
      Alert.alert(tr("success"), tr("visitor_marked_out"), [
        { 
          text: tr("ok"), 
          onPress: () => navigation.goBack()
        }
      ]);
    } catch (err) {
      setUpdating(false);
      Alert.alert(tr("error"), err.message || "Failed to update visitor status");
    }
  };

  // Show error if update fails
  useEffect(() => {
    if (error) {
      Alert.alert(tr("error"), error);
    }
  }, [error]);

  const statusChip = () => {
    const map = {
      inside: { label: tr("status_inside"), color: Colors.green },
      waiting: { label: tr("status_waiting"), color: Colors.orange },
      outside: { label: tr("status_outside"), color: Colors.grey },
      checked_in: { label: tr("status_checked_in"), color: Colors.green },
      checked_out: { label: tr("status_checked_out"), color: Colors.red },
    };
    const s = map[status] || map.waiting;
    return (
      <View style={[styles.chip, { backgroundColor: s.color }]}> 
        <Text style={[Fonts.Medium12grey, { color: Colors.white }]}>{s.label}</Text>
      </View>
    );
  };

  const InfoRow = ({ icon, label, value }) => (
    <View style={{ flexDirection: isRtl ? "row-reverse" : "row", alignItems: "center", marginBottom: Default.fixPadding * 1.2 }}>
      {icon}
      <Text style={[Fonts.Medium14grey, { marginHorizontal: Default.fixPadding * 0.8 }]}>{label}</Text>
      <Text style={[Fonts.Medium14black, { flex: 1, textAlign: isRtl ? "right" : "left" }]} numberOfLines={2}>
        {value || "-"}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <MyStatusBar />
      <View style={{ flexDirection: isRtl ? "row-reverse" : "row", alignItems: "center", paddingVertical: Default.fixPadding * 1.2, paddingHorizontal: Default.fixPadding * 2 }}>
        <TouchableOpacity onPress={() => navigation.pop()}>
          <Ionicons name={isRtl ? "arrow-forward-outline" : "arrow-back-outline"} size={25} color={Colors.black} />
        </TouchableOpacity>
        <Text style={{ ...Fonts.SemiBold18black, marginHorizontal: Default.fixPadding }} numberOfLines={1}>
          {tr("title")}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <View style={styles.card}>
          <View style={{ flexDirection: isRtl ? "row-reverse" : "row", alignItems: "center" }}>
            <View style={styles.avatarWrap}>
              <Image source={image || require("../assets/images/visitor1.png")} style={{ width: ms(70), height: ms(70), resizeMode: "contain" }} />
            </View>
            <View style={{ flex: 1, marginHorizontal: Default.fixPadding }}>
              <Text style={Fonts.SemiBold16black} numberOfLines={1}>{dbFields.visitorName || name || tr("unknown")}</Text>
              <Text style={Fonts.Medium14grey} numberOfLines={1}>{dbFields.visitorType ? tr(`${dbFields.visitorType}_visitor`) : (other1 ? `${other1}` : tr("type_unknown"))}</Text>
              <View style={{ marginTop: Default.fixPadding * 0.8 }}>{statusChip()}</View>
            </View>
            <TouchableOpacity onPress={() => { /* Future: share pass or QR */ }} style={styles.iconBtn}>
              <MaterialCommunityIcons name="share-variant" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Identity & Visit Info */}
        <View style={styles.card}>
          <Text style={Fonts.SemiBold16black}>{tr("visit_details")}</Text>
          <View style={{ height: Default.fixPadding }} />
          <InfoRow
            icon={<MaterialIcons name="apartment" size={18} color={Colors.primary} />}
            label={tr("flat")}
            value={flatNo || block}
          />
          <InfoRow
            icon={<MaterialCommunityIcons name="account-tie-outline" size={18} color={Colors.primary} />}
            label={tr("host")}
            value={hostName}
          />
          <InfoRow
            icon={<MaterialCommunityIcons name="clock-time-three-outline" size={18} color={Colors.primary} />}
            label={tr("entry_time")}
            value={entryTime || other2}
          />
          <InfoRow
            icon={<MaterialCommunityIcons name="clock-outline" size={18} color={Colors.primary} />}
            label={tr("exit_time")}
            value={exitTime}
          />
        </View>

        {/* Entry Type Specific Details */}
        {/* Guest Details */}
        {visitorType === 'guest' && (
          <View style={styles.card}>
            <Text style={Fonts.SemiBold16black}>{tr("guest_details")}</Text>
            <View style={{ height: Default.fixPadding }} />
            <InfoRow
              icon={<MaterialCommunityIcons name="account" size={18} color={Colors.primary} />}
              label={tr("guest_name")}
              value={dbFields.visitorName || name}
            />
            <InfoRow
              icon={<MaterialCommunityIcons name="phone" size={18} color={Colors.primary} />}
              label={tr("phone")}
              value={dbFields.visitorPhone || phoneNumber}
            />
            {(dbFields.purpose || purpose) && (
              <InfoRow
                icon={<MaterialCommunityIcons name="information" size={18} color={Colors.primary} />}
                label={tr("details")}
                value={dbFields.purpose || purpose}
              />
            )}
            <InfoRow
              icon={<MaterialCommunityIcons name="clipboard-text" size={18} color={Colors.primary} />}
              label={tr("purpose")}
              value="Guest visit"
            />
          </View>
        )}

        {/* Cab Details */}
        {visitorType === 'cab' && (
          <View style={styles.card}>
            <Text style={Fonts.SemiBold16black}>{tr("cab_details")}</Text>
            <View style={{ height: Default.fixPadding }} />
            <InfoRow
              icon={<MaterialCommunityIcons name="account" size={18} color={Colors.primary} />}
              label={tr("driver")}
              value={dbFields.visitorName || name}
            />
            <InfoRow
              icon={<MaterialCommunityIcons name="phone" size={18} color={Colors.primary} />}
              label={tr("phone")}
              value={dbFields.visitorPhone || phoneNumber}
            />
            {(dbFields.companyName || company) && (
              <InfoRow
                icon={<MaterialCommunityIcons name="car" size={18} color={Colors.primary} />}
                label={tr("company")}
                value={dbFields.companyName || company}
              />
            )}
            {(dbFields.vehicleNumber || vehicleNumber) && (
              <InfoRow
                icon={<MaterialCommunityIcons name="card-text" size={18} color={Colors.primary} />}
                label={tr("last_4_digits")}
                value={dbFields.vehicleNumber || vehicleNumber}
              />
            )}
            <InfoRow
              icon={<MaterialCommunityIcons name="clipboard-text" size={18} color={Colors.primary} />}
              label={tr("purpose")}
              value="Cab ride"
            />
          </View>
        )}

        {/* Delivery Details */}
        {visitorType === 'delivery' && (
          <View style={styles.card}>
            <Text style={Fonts.SemiBold16black}>{tr("delivery_details")}</Text>
            <View style={{ height: Default.fixPadding }} />
            <InfoRow
              icon={<MaterialCommunityIcons name="account" size={18} color={Colors.primary} />}
              label={tr("name")}
              value={dbFields.visitorName || name}
            />
            <InfoRow
              icon={<MaterialCommunityIcons name="phone" size={18} color={Colors.primary} />}
              label={tr("phone")}
              value={dbFields.visitorPhone || phoneNumber}
            />
            {(dbFields.companyName || company) && (
              <InfoRow
                icon={<MaterialCommunityIcons name="store" size={18} color={Colors.primary} />}
                label={tr("company")}
                value={dbFields.companyName || company}
              />
            )}
            <InfoRow
              icon={<MaterialCommunityIcons name="clipboard-text" size={18} color={Colors.primary} />}
              label={tr("purpose")}
              value="Package delivery"
            />
          </View>
        )}

        {/* Service Details */}
        {visitorType === 'service' && (
          <View style={styles.card}>
            <Text style={Fonts.SemiBold16black}>{tr("service_details")}</Text>
            <View style={{ height: Default.fixPadding }} />
            <InfoRow
              icon={<MaterialCommunityIcons name="account" size={18} color={Colors.primary} />}
              label={tr("service_person")}
              value={dbFields.visitorName || name}
            />
            <InfoRow
              icon={<MaterialCommunityIcons name="phone" size={18} color={Colors.primary} />}
              label={tr("phone")}
              value={dbFields.visitorPhone || phoneNumber}
            />
            {(dbFields.serviceType || serviceType) && (
              <InfoRow
                icon={<MaterialCommunityIcons name="account-wrench" size={18} color={Colors.primary} />}
                label={tr("service_type")}
                value={dbFields.serviceType || serviceType}
              />
            )}
            <InfoRow
              icon={<MaterialCommunityIcons name="clipboard-text" size={18} color={Colors.primary} />}
              label={tr("purpose")}
              value="Service visit"
            />
          </View>
        )}

  {/* Notes section removed as per requirement */}

        {/* Actions */}
        <View style={[styles.card, { paddingVertical: Default.fixPadding * 1.2 }]}> 
          <View style={{ flexDirection: isRtl ? "row-reverse" : "row", justifyContent: "flex-start", gap: Default.fixPadding }}>
            {/* Call button - always visible */}
            <TouchableOpacity 
              style={[styles.actionBtn, { borderColor: Colors.lightBlue }]} 
              onPress={handleCall}
              disabled={updating}
            >
              <MaterialIcons name="call" size={18} color={Colors.lightBlue} />
              <Text style={[Fonts.SemiBold16primary, { fontSize: 14 }]}>{tr("call")}</Text>
            </TouchableOpacity>
            
            {/* Mark In button - only show if visitor is NOT checked in */}
            {(status !== 'inside' && status !== 'checked_in') && (
              <TouchableOpacity 
                style={[styles.actionBtn, { borderColor: Colors.green }]} 
                onPress={handleMarkIn}
                disabled={updating}
              >
                <MaterialCommunityIcons name="login" size={18} color={Colors.green} />
                <Text style={[Fonts.SemiBold16black, { fontSize: 14, color: Colors.green }]}>
                  {updating ? tr("updating") : tr("mark_in")}
                </Text>
              </TouchableOpacity>
            )}
            
            {/* Mark Out button - only show if visitor is checked in */}
            {(status === 'inside' || status === 'checked_in') && (
              <TouchableOpacity 
                style={[styles.actionBtn, { borderColor: Colors.red }]} 
                onPress={handleMarkOut}
                disabled={updating}
              >
                <MaterialCommunityIcons name="logout" size={18} color={Colors.red} />
                <Text style={[Fonts.SemiBold16black, { fontSize: 14, color: Colors.red }]}>
                  {updating ? tr("updating") : tr("mark_out")}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.card}>
          <Text style={Fonts.SemiBold16black}>{tr("timeline")}</Text>
          <View style={{ height: Default.fixPadding }} />
          <View>
            <View style={styles.timelineRow}>
              <View style={styles.timelineDot} />
              <Text style={Fonts.Medium14black}>{tr("pass_created")}</Text>
              <Text style={[Fonts.Medium12grey, { marginLeft: "auto" }]}>
                {dbFields.fromDate ? new Date(dbFields.fromDate).toLocaleDateString() : (entryTime || "--")}
              </Text>
            </View>
            {(status === "inside" || status === "checked_in" || dbFields.checkedInAt) && (
              <View style={styles.timelineRow}>
                <View style={[styles.timelineDot, { backgroundColor: Colors.green }]} />
                <Text style={Fonts.Medium14black}>{tr("visitor_entered")}</Text>
                <Text style={[Fonts.Medium12grey, { marginLeft: "auto" }]}>
                  {dbFields.checkedInAt ? new Date(dbFields.checkedInAt).toLocaleString() : (other2 || "--")}
                </Text>
              </View>
            )}
            {(status === "checked_out" || dbFields.checkedOutAt) && (
              <View style={styles.timelineRow}>
                <View style={[styles.timelineDot, { backgroundColor: Colors.red }]} />
                <Text style={Fonts.Medium14black}>{tr("visitor_exited")}</Text>
                <Text style={[Fonts.Medium12grey, { marginLeft: "auto" }]}>
                  {dbFields.checkedOutAt ? new Date(dbFields.checkedOutAt).toLocaleString() : (exitTime || "--")}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={{ height: Default.fixPadding * 4 }} />
      </ScrollView>

      {/* Call Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={callModalVisible}
        onRequestClose={() => setCallModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { minWidth: '90%', maxWidth: '100%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{tr("call_options")}</Text>
              <TouchableOpacity 
                onPress={() => setCallModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={Colors.grey} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <MaterialIcons name="call" size={48} color={Colors.lightBlue} />
              <Text style={styles.modalMessage}>
                {tr("select_contact")}
              </Text>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: Colors.lightBlue }]}
                onPress={handleCallVisitor}
                disabled={!(dbFields.visitorPhone || phoneNumber)}
              >
                <MaterialIcons name="call" size={20} color={Colors.white} />
                <Text style={styles.modalButtonText}>
                  {tr("call_visitor")}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: Colors.primary }]}
                onPress={handleCallHost}
              >
                <MaterialCommunityIcons 
                  name="phone-in-talk" 
                  size={20} 
                  color={Colors.white} 
                />
                <Text style={styles.modalButtonText}>
                  {tr("call_host")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Mark In Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={markInModalVisible}
        onRequestClose={() => setMarkInModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{tr("confirm_mark_in")}</Text>
              <TouchableOpacity 
                onPress={() => setMarkInModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={Colors.grey} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <MaterialCommunityIcons name="login" size={48} color={Colors.green} />
              <Text style={styles.modalMessage}>
                {tr("confirm_mark_in_message")} ({dbFields.visitorName || name})?
              </Text>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: Colors.grey }]}
                onPress={() => setMarkInModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: Colors.white }]}>
                  {tr("cancel")}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: Colors.primary }]}
                onPress={confirmMarkIn}
                disabled={updating}
              >
                <MaterialCommunityIcons name="login" size={20} color={Colors.white} />
                <Text style={styles.modalButtonText}>
                  {updating ? tr("updating") : tr("mark_in")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Mark Out Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={markOutModalVisible}
        onRequestClose={() => setMarkOutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{tr("confirm_mark_out")}</Text>
              <TouchableOpacity 
                onPress={() => setMarkOutModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={Colors.grey} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <MaterialCommunityIcons name="logout" size={48} color={Colors.red} />
              <Text style={styles.modalMessage}>
                {tr("confirm_mark_out_message")} ({dbFields.visitorName || name})?
              </Text>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: Colors.grey }]}
                onPress={() => setMarkOutModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: Colors.white }]}>
                  {tr("cancel")}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: Colors.primary }]}
                onPress={confirmMarkOut}
                disabled={updating}
              >
                <MaterialCommunityIcons name="logout" size={20} color={Colors.white} />
                <Text style={styles.modalButtonText}>
                  {updating ? tr("updating") : tr("mark_out")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default VisitorDetailScreen;

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Default.fixPadding * 2,
    marginTop: Default.fixPadding * 2,
    padding: Default.fixPadding * 1.4,
    borderRadius: 12,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  avatarWrap: {
    width: ms(84),
    height: ms(84),
    borderRadius: 8,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    ...Default.shadow,
  },
  chip: {
    alignSelf: "flex-start",
    paddingHorizontal: Default.fixPadding,
    paddingVertical: Default.fixPadding * 0.4,
    borderRadius: 20,
  },
  iconBtn: {
    padding: Default.fixPadding * 0.8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.extraLightGrey,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: Default.fixPadding * 1.5,
    paddingHorizontal: Default.fixPadding,
    borderRadius: 10,
    borderWidth: 1,
    gap: Default.fixPadding * 0.5,
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Default.fixPadding * 0.9,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Default.fixPadding,
    backgroundColor: Colors.orange,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Default.fixPadding * 2,
    margin: Default.fixPadding * 2,
    minWidth: '80%',
    maxWidth: '90%',
    ...Default.shadow,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Default.fixPadding * 1.5,
  },
  modalTitle: {
    ...Fonts.SemiBold18black,
    flex: 1,
  },
  modalSubtitle: {
    ...Fonts.Medium16black,
    marginBottom: Default.fixPadding * 1.5,
    textAlign: 'center',
  },
  modalContent: {
    alignItems: 'center',
    marginVertical: Default.fixPadding * 2,
  },
  modalMessage: {
    ...Fonts.Medium16black,
    textAlign: 'center',
    marginTop: Default.fixPadding,
  },
  closeButton: {
    padding: Default.fixPadding * 0.5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Default.fixPadding,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Default.fixPadding * 1.2,
    paddingHorizontal: Default.fixPadding,
    borderRadius: 12,
    gap: Default.fixPadding * 0.5,
  },
  modalButtonText: {
    ...Fonts.SemiBold18white,
    textAlign: 'center',
  },
});
