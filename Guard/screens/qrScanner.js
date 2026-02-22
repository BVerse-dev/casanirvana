import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Colors, Default, Fonts } from "../constants/styles";
import MyStatusBar from "../components/myStatusBar";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useGuardAuth } from "../contexts/GuardAuthContext";
import {
  getVisitorPassByQrPayload,
  isPassEntryActionable,
} from "../services/visitorEntryService";

const QRScanner = ({ navigation }) => {
  const { guard, isAuthenticated } = useGuardAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleScanResult = useCallback(
    async (rawPayload) => {
      if (resolving) return;
      if (!isAuthenticated || !guard?.community_id) {
        Alert.alert("Authentication Required", "Guard session is not ready.");
        setScanned(false);
        return;
      }

      try {
        setResolving(true);
        const pass = await getVisitorPassByQrPayload({
          rawPayload,
          communityId: guard.community_id,
        });

        if (!pass) {
          Alert.alert(
            "Pass Not Found",
            "No active visitor pass was found for this QR code in your community."
          );
          setScanned(false);
          return;
        }

        if (!isPassEntryActionable(pass.status)) {
          Alert.alert(
            "Pass Not Eligible",
            `This visitor pass is currently '${pass.status}'.`
          );
          setScanned(false);
          return;
        }

        navigation.replace("confirmScreen", {
          entrySource: "qr_scan",
          scannedQr: rawPayload,
          visitorPassId: pass.id,
          visitorPass: pass,
        });
      } catch (error) {
        console.error("QR scan lookup error:", error);
        Alert.alert(
          "Scan Failed",
          error.message || "Unable to validate QR code. Please try again."
        );
        setScanned(false);
      } finally {
        setResolving(false);
      }
    },
    [guard?.community_id, isAuthenticated, navigation, resolving]
  );

  const onBarcodeScanned = ({ data }) => {
    if (scanned || resolving) return;
    setScanned(true);
    handleScanResult(data);
  };

  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <MyStatusBar />
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <MyStatusBar />
        <Text style={styles.permissionText}>
          Camera access is required to scan visitor QR codes.
        </Text>
        <TouchableOpacity style={styles.actionButton} onPress={requestPermission}>
          <Text style={styles.actionButtonText}>Allow Camera Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MyStatusBar />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>QR Scanner</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.scannerContainer}>
        <CameraView
          style={styles.camera}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={onBarcodeScanned}
        />

        <View style={styles.scannerOverlay}>
          <View style={styles.scannerFrame}>
            <Text style={styles.instructionText}>
              Position QR code within the frame to scan
            </Text>
            <View style={styles.cornerTopLeft} />
            <View style={styles.cornerTopRight} />
            <View style={styles.cornerBottomLeft} />
            <View style={styles.cornerBottomRight} />
          </View>
        </View>
      </View>

      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionTitle}>How to scan:</Text>
        <Text style={styles.instructionItem}>• Hold your device steady</Text>
        <Text style={styles.instructionItem}>• Make sure QR code is clearly visible</Text>
        <Text style={styles.instructionItem}>• Ensure good lighting</Text>
        {resolving && (
          <Text style={[styles.instructionItem, styles.resolvingText]}>
            Validating visitor pass...
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.actionButton, resolving ? styles.disabledButton : null]}
        onPress={() => setScanned(false)}
        disabled={resolving}
      >
        <Text style={styles.actionButtonText}>Scan Again</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Default.fixPadding * 2,
  },
  permissionText: {
    ...Fonts.Medium14grey,
    textAlign: "center",
    marginBottom: Default.fixPadding * 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 1.5,
    backgroundColor: Colors.primary,
  },
  backButton: {
    padding: Default.fixPadding * 0.5,
  },
  headerTitle: {
    ...Fonts.Bold18white,
  },
  placeholder: {
    width: 32,
  },
  scannerContainer: {
    flex: 1,
    marginHorizontal: Default.fixPadding * 2,
    marginTop: Default.fixPadding * 1.5,
    borderRadius: 16,
    overflow: "hidden",
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  scannerFrame: {
    width: 250,
    height: 250,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  instructionText: {
    ...Fonts.Medium14white,
    textAlign: "center",
    marginBottom: Default.fixPadding * 2,
    paddingHorizontal: Default.fixPadding,
  },
  cornerTopLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: Colors.white,
  },
  cornerTopRight: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.white,
  },
  cornerBottomLeft: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: Colors.white,
  },
  cornerBottomRight: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.white,
  },
  instructionsContainer: {
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 1.5,
    backgroundColor: Colors.darkGrey,
  },
  instructionTitle: {
    ...Fonts.Bold16white,
    marginBottom: Default.fixPadding,
  },
  instructionItem: {
    ...Fonts.Medium14white,
    marginBottom: Default.fixPadding * 0.5,
  },
  resolvingText: {
    marginTop: Default.fixPadding * 0.4,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    marginHorizontal: Default.fixPadding * 2,
    marginVertical: Default.fixPadding,
    paddingVertical: Default.fixPadding * 1.5,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  actionButtonText: {
    ...Fonts.Bold16white,
  },
});

export default QRScanner;
