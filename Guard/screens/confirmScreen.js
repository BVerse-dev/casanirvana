import React, { useEffect, useMemo, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  ScrollView,
  StyleSheet,
  Image,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import AwesomeButton from "react-native-really-awesome-button";
import MyStatusBar from "../components/myStatusBar";
import { Colors, Default, Fonts } from "../constants/styles";
import { useGuardAuth } from "../contexts/GuardAuthContext";
import {
  getVisitorPassByEntryCode,
  getVisitorPassById,
  getVisitorPassByQrPayload,
  isPassEntryActionable,
  mapVisitorPassToNavigationParams,
  parseQrPayload,
} from "../services/visitorEntryService";
import { resolveUnitResidentInfo } from "../services/unitValidationService";

const formatDateTime = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleString();
};

const ConfirmScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const { guard } = useGuardAuth();
  const isRtl = i18n.dir() === "rtl";
  const params = route?.params || {};

  function tr(key) {
    return t(`confirmScreen:${key}`);
  }

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [resolvedPass, setResolvedPass] = useState(params.visitorPass || null);
  const [loadingPass, setLoadingPass] = useState(false);
  const [resolvedHostName, setResolvedHostName] = useState(
    params.hostName || params.visitorPass?.host_name || null
  );

  useEffect(() => {
    const backSub = BackHandler.addEventListener("hardwareBackPress", () => {
      navigation.pop();
      return true;
    });

    return () => backSub.remove();
  }, [navigation]);

  useEffect(() => {
    const resolveVisitorPass = async () => {
      const hasPassIntent =
        !!params.visitorPass ||
        !!params.visitorPassId ||
        !!params.scannedQr ||
        !!params.enteredEntryCode;

      if (!hasPassIntent || resolvedPass) return;
      if (!guard?.community_id) return;

      try {
        setLoadingPass(true);

        let pass = null;
        if (params.visitorPassId) {
          pass = await getVisitorPassById({
            passId: params.visitorPassId,
            communityId: guard.community_id,
          });
        }

        if (!pass && params.scannedQr) {
          pass = await getVisitorPassByQrPayload({
            rawPayload: params.scannedQr,
            communityId: guard.community_id,
          });
        }

        if (!pass && params.enteredEntryCode) {
          pass = await getVisitorPassByEntryCode({
            entryCode: params.enteredEntryCode,
            communityId: guard.community_id,
          });
        }

        if (!pass) {
          Alert.alert("Pass Not Found", "Unable to resolve this visitor pass.");
          navigation.goBack();
          return;
        }

        setResolvedPass(pass);
      } catch (error) {
        console.error("Failed to resolve visitor pass:", error);
        Alert.alert(
          "Lookup Failed",
          error.message || "Unable to load visitor pass details."
        );
        navigation.goBack();
      } finally {
        setLoadingPass(false);
      }
    };

    resolveVisitorPass();
  }, [
    guard?.community_id,
    navigation,
    params.enteredEntryCode,
    params.scannedQr,
    params.visitorPass,
    params.visitorPassId,
    resolvedPass,
  ]);

  const scannedPayload = useMemo(() => parseQrPayload(params.scannedQr), [params.scannedQr]);
  const passNavParams = useMemo(
    () => mapVisitorPassToNavigationParams(resolvedPass),
    [resolvedPass]
  );

  useEffect(() => {
    const currentHostName =
      params.hostName || scannedPayload?.host_name || passNavParams?.hostName || null;
    const normalizedHostName = String(currentHostName || "").trim().toLowerCase();
    const needsResolution =
      !currentHostName ||
      normalizedHostName === "resident" ||
      normalizedHostName === "unknown resident" ||
      normalizedHostName === "unknown host";

    if (!needsResolution) {
      setResolvedHostName(currentHostName);
      return;
    }

    const targetUnitId = resolvedPass?.unit_id || passNavParams?.unitId || null;
    if (!targetUnitId) {
      setResolvedHostName(currentHostName || "Resident");
      return;
    }

    let cancelled = false;

    const hydrateHost = async () => {
      const resident = await resolveUnitResidentInfo(targetUnitId, {
        name: currentHostName || "Resident",
      });
      if (!cancelled) {
        setResolvedHostName(resident.name);
      }
    };

    hydrateHost();

    return () => {
      cancelled = true;
    };
  }, [
    params.hostName,
    passNavParams?.hostName,
    passNavParams?.unitId,
    resolvedPass?.unit_id,
    scannedPayload?.host_name,
  ]);

  const displayGuestName =
    passNavParams?.guestName || params.guestName || scannedPayload?.visitor_name || "Visitor";
  const displayHostName =
    resolvedHostName ||
    params.hostName ||
    scannedPayload?.host_name ||
    passNavParams?.hostName ||
    "Resident";
  const displayPhone =
    passNavParams?.visitorPhone ||
    params.visitorPhone ||
    params.phoneNumber ||
    scannedPayload?.visitor_phone ||
    "N/A";
  const visitingValue =
    passNavParams?.selectedFlatNo ||
    params.selectedFlatNo ||
    (scannedPayload?.unit_block && scannedPayload?.unit_number
      ? `${scannedPayload.unit_block}-${scannedPayload.unit_number}`
      : "N/A");
  const entryCodeValue =
    resolvedPass?.entry_code ||
    scannedPayload?.entry_code ||
    scannedPayload?.code ||
    params.enteredEntryCode ||
    "N/A";
  const purposeValue =
    resolvedPass?.purpose ||
    params.guestDetails ||
    scannedPayload?.purpose ||
    "Visitor entry";
  const timeValue =
    formatDateTime(resolvedPass?.from_date || params.arrivalTime || params.expectedTime);

  const qrValue =
    params.scannedQr ||
    resolvedPass?.qr_code_data ||
    JSON.stringify({
      type: "visitor_pass",
      id: resolvedPass?.id || params.visitorPassId || "N/A",
      entry_code: entryCodeValue,
      unit: visitingValue,
    });

  const isGuestEntryFlow = !!params.guestName && !!params.visitorPhone && !resolvedPass;

  const handlePrimaryAction = async () => {
    if (resolvedPass) {
      if (!isPassEntryActionable(resolvedPass.status)) {
        Alert.alert(
          "Pass Not Eligible",
          `This visitor pass is currently '${resolvedPass.status}'.`
        );
        return;
      }

      const normalizedHostName = String(displayHostName || "").trim().toLowerCase();
      const needsHostResolution =
        !!resolvedPass.unit_id &&
        (!displayHostName ||
          normalizedHostName === "resident" ||
          normalizedHostName === "unknown resident" ||
          normalizedHostName === "unknown host");

      let nextHostName = displayHostName;
      if (needsHostResolution) {
        const resident = await resolveUnitResidentInfo(resolvedPass.unit_id, {
          name: displayHostName || "Resident",
        });
        nextHostName = resident.name;
        setResolvedHostName(resident.name);
      }

      navigation.push("allowedScreen", {
        ...(passNavParams || {}),
        visitorPassId: resolvedPass.id,
        guestName: displayGuestName,
        hostName: nextHostName,
        selectedFlatNo: visitingValue,
        visitorPhone: displayPhone,
        phoneNumber: displayPhone,
        arrivalTime: resolvedPass.from_date,
        expectedTime: resolvedPass.from_date,
        guestDetails: purposeValue,
        guestMessage: purposeValue,
      });
      return;
    }

    if (isGuestEntryFlow) {
      navigation.push("ringingScreen", {
        hostName: params.hostName,
        selectedFlatNo: params.selectedFlatNo,
        guestName: params.guestName,
        visitorPhone: params.visitorPhone,
        expectedTime: params.arrivalTime,
        visitorPassId: params.visitorPassId,
        guestDetails: params.guestDetails,
        guestMessage: params.guestMessage,
      });
      return;
    }

    setShowConfirmModal(true);
  };

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

      {loadingPass ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={[Fonts.Medium14grey, { marginTop: Default.fixPadding }]}>Loading pass details...</Text>
        </View>
      ) : (
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
            <View style={[styles.boxView, styles.qrCard]}>
              <QRCode value={qrValue} size={80} />
            </View>

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

          <View style={styles.detailCard}>
            <Text style={{ ...Fonts.SemiBold16black, marginBottom: Default.fixPadding * 1.2 }}>
              Visit Details
            </Text>

            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={18} color={Colors.primary} />
              <Text style={styles.label}>Guest:</Text>
              <Text style={styles.value} numberOfLines={1}>{displayGuestName}</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="home-outline" size={18} color={Colors.primary} />
              <Text style={styles.label}>Visiting:</Text>
              <Text style={styles.value} numberOfLines={1}>{visitingValue}</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={18} color={Colors.primary} />
              <Text style={styles.label}>Host:</Text>
              <Text style={styles.value} numberOfLines={1}>{displayHostName}</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="call-outline" size={18} color={Colors.primary} />
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value} numberOfLines={1}>{displayPhone}</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="clipboard-outline" size={18} color={Colors.primary} />
              <Text style={styles.label}>Purpose:</Text>
              <Text style={styles.value} numberOfLines={1}>{purposeValue}</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={18} color={Colors.primary} />
              <Text style={styles.label}>Time:</Text>
              <Text style={styles.value} numberOfLines={1}>{timeValue}</Text>
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
              onPress={handlePrimaryAction}
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
                {resolvedPass
                  ? "Allow Entry"
                  : isGuestEntryFlow
                  ? "Call Host"
                  : tr("confirmSendIn")}
              </Text>
            </AwesomeButton>

            {resolvedPass && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  navigation.push("cancelledScreen", {
                    visitorPassId: resolvedPass.id,
                    guestName: displayGuestName,
                    hostName: displayHostName,
                    selectedFlatNo: visitingValue,
                    visitorPhone: displayPhone,
                    phoneNumber: displayPhone,
                  })
                }
                style={styles.denyButton}
              >
                <Text style={styles.denyButtonText}>Deny Entry</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      )}

      <Modal
        transparent
        visible={showConfirmModal}
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Ionicons name="checkmark-circle" size={48} color={Colors.green} />
            <Text style={[Fonts.SemiBold18black, { marginTop: Default.fixPadding }]}>Entry Confirmed</Text>
            <Text
              style={[
                Fonts.Medium14grey,
                { marginTop: Default.fixPadding * 0.5, textAlign: "center" },
              ]}
            >
              The visitor has been sent in successfully.
            </Text>

            <View style={{ marginTop: Default.fixPadding * 1.6, alignSelf: "stretch" }}>
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

            <View style={{ marginTop: Default.fixPadding * 2, alignSelf: "stretch" }}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setShowConfirmModal(false);
                  navigation.pop();
                }}
                style={styles.doneButton}
              >
                <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 16, color: Colors.white }}>
                  Done
                </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Default.fixPadding * 2,
  },
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
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Default.fixPadding,
  },
  label: {
    ...Fonts.Medium14grey,
    marginHorizontal: Default.fixPadding * 0.8,
  },
  value: {
    ...Fonts.Medium14black,
    flex: 1,
    textAlign: "left",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.transparentBlack,
    padding: Default.fixPadding * 2,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
    padding: Default.fixPadding * 2,
    borderRadius: 12,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  modalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Default.fixPadding * 0.8,
  },
  doneButton: {
    height: 46,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  denyButton: {
    marginTop: Default.fixPadding,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.red,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
  },
  denyButtonText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
    color: Colors.red,
  },
});
