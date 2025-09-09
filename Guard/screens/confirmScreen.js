import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  ScrollView,
  StyleSheet,
  Image,
  Modal,
} from "react-native";
import MyStatusBar from "../components/myStatusBar";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import QRCode from "react-native-qrcode-svg";
import { useTranslation } from "react-i18next";
import AwesomeButton from "react-native-really-awesome-button";

const ConfirmScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`confirmScreen:${key}`);
  }
  const backAction = () => {
    navigation.pop();
    return true;
  };
  useEffect(() => {
    const backSub = BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => {
      backSub.remove();
    };
  }, []);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Pull scanned QR from navigation (when coming from QRScannerScreen)
  const scannedQr = route?.params?.scannedQr;
  
  // Get data from navigation parameters (when coming from guest entry flow)
  const { 
    hostName, 
    selectedFlatNo, 
    guestName,
    visitorPhone,
    arrivalTime,
    guestDetails,
    guestMessage
  } = route?.params || {};

  // Try to parse QR JSON if provided; handle double-escaped cases as in user app
  const parseQr = (raw) => {
    if (!raw || typeof raw !== 'string') return null;
    try {
      return JSON.parse(raw);
    } catch (_) {
      try {
        const unescaped = raw.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        return JSON.parse(unescaped);
      } catch (__){
        return null;
      }
    }
  };

  const qrData = parseQr(scannedQr);
  const qrValue = scannedQr || "{\"type\":\"user_gate_pass\",\"society_name\":\"Casa Nirvana\",\"unit_block\":\"A\",\"unit_number\":\"102\",\"entry_code\":\"125456\"}";
  const entryCodeValue = (qrData && (qrData.entry_code || qrData.code)) ? String(qrData.entry_code || qrData.code) : '125456';
  const visitingValue = (qrData && qrData.unit_block && qrData.unit_number)
    ? `${qrData.unit_block}-${qrData.unit_number}`
    : (selectedFlatNo || 'A-102');
  
  // Use data from navigation params or fallback to hardcoded values
  const displayGuestName = guestName || 'jeklin shah';
  const displayHostName = hostName || 'Mr. Sharma';
  const displayPhone = visitorPhone || '+91 98765 43210';

  // Debug logging
  console.log('ConfirmScreen - Route params:', route?.params);
  console.log('ConfirmScreen - visitorPhone:', visitorPhone);
  console.log('ConfirmScreen - displayPhone:', displayPhone);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <MyStatusBar />
      <View
        style={{
          alignSelf: isRtl ? "flex-end" : "flex-start",
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
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: Default.fixPadding * 2.8,
          }}
        >
          <Image
            source={require("../assets/images/img2.png")}
            style={styles.image}
          />
        </View>

        <View
          style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            alignItems: "center",
            marginTop: Default.fixPadding * 4,
            marginBottom: Default.fixPadding * 2,
            marginHorizontal: Default.fixPadding,
          }}
        >
          {/* QR Code Card (no title) */}
          <View style={[styles.boxView, styles.qrCard]}>
            <QRCode value={qrValue} size={80} />
          </View>

          {/* Entry Code Card (renamed from Gate Pass) */}
          <View style={[styles.boxView, styles.qrCard]}> 
            <Text
              numberOfLines={1}
              style={{
                ...Fonts.Medium16grey,
                overflow: "hidden",
                marginBottom: Default.fixPadding,
              }}
            >
              Entry Code
            </Text>
            <Text
              numberOfLines={1}
              style={{ ...Fonts.SemiBold16black, overflow: "hidden" }}
            >
              {entryCodeValue}
            </Text>
          </View>
        </View>

        {/* Visit Details Card */}
        <View style={styles.detailCard}>
          <Text style={{ ...Fonts.SemiBold16black, marginBottom: Default.fixPadding * 1.2 }}>
            Visit Details
          </Text>

          {/* Moved from top summary: Guest & Visiting */}
          <View style={{ flexDirection: isRtl ? "row-reverse" : "row", alignItems: "center", marginBottom: Default.fixPadding }}>
            <Ionicons name="person-outline" size={18} color={Colors.primary} />
            <Text style={{ ...Fonts.Medium14grey, marginHorizontal: Default.fixPadding * 0.8 }}>Guest:</Text>
            <Text style={{ ...Fonts.Medium14black, flex: 1, textAlign: isRtl ? 'right' : 'left' }} numberOfLines={1}>
              {displayGuestName}
            </Text>
          </View>

          <View style={{ flexDirection: isRtl ? "row-reverse" : "row", alignItems: "center", marginBottom: Default.fixPadding }}>
            <Ionicons name="home-outline" size={18} color={Colors.primary} />
            <Text style={{ ...Fonts.Medium14grey, marginHorizontal: Default.fixPadding * 0.8 }}>Visiting:</Text>
            <Text style={{ ...Fonts.Medium14black, flex: 1, textAlign: isRtl ? 'right' : 'left' }} numberOfLines={1}>
              {visitingValue}
            </Text>
          </View>

          <View style={{ flexDirection: isRtl ? "row-reverse" : "row", alignItems: "center", marginBottom: Default.fixPadding }}>
            <Ionicons name="person-outline" size={18} color={Colors.primary} />
            <Text style={{ ...Fonts.Medium14grey, marginHorizontal: Default.fixPadding * 0.8 }}>Host:</Text>
            <Text style={{ ...Fonts.Medium14black, flex: 1, textAlign: isRtl ? 'right' : 'left' }} numberOfLines={1}>
              {displayHostName}
            </Text>
          </View>

          <View style={{ flexDirection: isRtl ? "row-reverse" : "row", alignItems: "center", marginBottom: Default.fixPadding }}>
            <Ionicons name="call-outline" size={18} color={Colors.primary} />
            <Text style={{ ...Fonts.Medium14grey, marginHorizontal: Default.fixPadding * 0.8 }}>Phone:</Text>
            <Text style={{ ...Fonts.Medium14black, flex: 1, textAlign: isRtl ? 'right' : 'left' }} numberOfLines={1}>
              {displayPhone}
            </Text>
          </View>

          <View style={{ flexDirection: isRtl ? "row-reverse" : "row", alignItems: "center", marginBottom: Default.fixPadding }}>
            <Ionicons name="clipboard-outline" size={18} color={Colors.primary} />
            <Text style={{ ...Fonts.Medium14grey, marginHorizontal: Default.fixPadding * 0.8 }}>Purpose:</Text>
            <Text style={{ ...Fonts.Medium14black, flex: 1, textAlign: isRtl ? 'right' : 'left' }} numberOfLines={1}>
              Personal Visit
            </Text>
          </View>

          <View style={{ flexDirection: isRtl ? "row-reverse" : "row", alignItems: "center" }}>
            <Ionicons name="time-outline" size={18} color={Colors.primary} />
            <Text style={{ ...Fonts.Medium14grey, marginHorizontal: Default.fixPadding * 0.8 }}>Time:</Text>
            <Text style={{ ...Fonts.Medium14black, flex: 1, textAlign: isRtl ? 'right' : 'left' }} numberOfLines={1}>
              Today, 03:30 PM
            </Text>
          </View>
        </View>

        <View
          style={{
            marginBottom: Default.fixPadding * 2,
            marginHorizontal: Default.fixPadding * 2,
          }}
        >
          <AwesomeButton
            height={50}
            onPress={() => {
              // If we have guest entry data, navigate to ringing screen
              if (guestName && visitorPhone) {
                navigation.push("ringingScreen", {
                  hostName,
                  selectedFlatNo,
                  guestName,
                  visitorPhone,
                  expectedTime: arrivalTime,
                  visitorPassId: route?.params?.visitorPassId,
                  guestDetails,
                  guestMessage
                });
              } else {
                // For QR scanning flow, show modal
                setShowConfirmModal(true);
              }
            }}
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
              {guestName && visitorPhone ? "Call Host" : tr("confirmSendIn")}
            </Text>
          </AwesomeButton>
        </View>
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        transparent
        visible={showConfirmModal}
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Ionicons name="checkmark-circle" size={48} color={Colors.green} />
            <Text style={[Fonts.SemiBold18black, { marginTop: Default.fixPadding }]}>
              Entry Confirmed
            </Text>
            <Text style={[Fonts.Medium14grey, { marginTop: Default.fixPadding * 0.5, textAlign: 'center' }]}> 
              The visitor has been sent in successfully.
            </Text>

            <View style={{ marginTop: Default.fixPadding * 1.6, alignSelf: 'stretch' }}>
              <View style={styles.modalRow}>
                <Text style={Fonts.Medium14grey}>Guest:</Text>
                <Text style={Fonts.Medium14black}>{displayGuestName}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={Fonts.Medium14grey}>Visiting:</Text>
                <Text style={Fonts.Medium14black}>{visitingValue}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={Fonts.Medium14grey}>Entry Code:</Text>
                <Text style={Fonts.Medium14black}>{entryCodeValue}</Text>
              </View>
            </View>

            <View style={{ marginTop: Default.fixPadding * 2, alignSelf: 'stretch' }}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => { 
                  setShowConfirmModal(false); 
                  // For QR scanning flow, just go back
                  navigation.pop(); 
                }}
                style={{
                  height: 46,
                  borderRadius: 10,
                  backgroundColor: Colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 16, color: Colors.white }}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ConfirmScreen;

const styles = StyleSheet.create({
  image: {
    resizeMode: "cover",
    width: 111,
    height: 111,
    borderRadius: 56,
  },
  boxView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Default.fixPadding * 2.8,
    paddingHorizontal: Default.fixPadding * 0.5,
    marginHorizontal: Default.fixPadding,
    borderRadius: 10,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  qrCard: {
    minHeight: 140,
  },
  detailCard: {
    marginHorizontal: Default.fixPadding * 2,
    marginBottom: Default.fixPadding * 3,
    padding: Default.fixPadding * 1.6,
    borderRadius: 12,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.transparentBlack,
    padding: Default.fixPadding * 2,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    padding: Default.fixPadding * 2,
    borderRadius: 12,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Default.fixPadding * 0.6,
  },
});
