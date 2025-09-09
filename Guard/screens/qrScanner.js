import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Colors, Default, Fonts } from "../constants/styles";
import MyStatusBar from "../components/myStatusBar";
import Ionicons from "react-native-vector-icons/Ionicons";

const QRScanner = ({ navigation }) => {
  const [isScanning, setIsScanning] = useState(false);

  const handleScanResult = (data) => {
    try {
      // Parse QR code data
      const qrData = JSON.parse(data);
      
      // Navigate back with scanned data
      navigation.goBack();
      
      // You can also navigate to a specific screen with the data
      // navigation.navigate('confirmScreen', { scannedData: qrData });
      
    } catch (error) {
      Alert.alert('Invalid QR Code', 'The scanned QR code is not valid.');
    }
  };

  const mockScan = () => {
    // Mock QR scan for testing
    const mockData = JSON.stringify({
      type: 'visitor_pass',
      id: 'mock-visitor-pass-id',
      visitor_name: 'John Doe',
      unit_number: 'A-101',
      timestamp: new Date().toISOString()
    });
    
    handleScanResult(mockData);
  };

  return (
    <View style={styles.container}>
      <MyStatusBar />
      
      {/* Header */}
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

      {/* Scanner Area */}
      <View style={styles.scannerContainer}>
        <View style={styles.scannerFrame}>
          <Text style={styles.instructionText}>
            Position QR code within the frame to scan
          </Text>
          
          {/* Scanner overlay corners */}
          <View style={styles.cornerTopLeft} />
          <View style={styles.cornerTopRight} />
          <View style={styles.cornerBottomLeft} />
          <View style={styles.cornerBottomRight} />
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionTitle}>How to scan:</Text>
        <Text style={styles.instructionItem}>• Hold your device steady</Text>
        <Text style={styles.instructionItem}>• Make sure QR code is clearly visible</Text>
        <Text style={styles.instructionItem}>• Ensure good lighting</Text>
      </View>

      {/* Mock Scan Button (for testing) */}
      <TouchableOpacity 
        style={styles.mockButton}
        onPress={mockScan}
      >
        <Text style={styles.mockButtonText}>Mock Scan (Testing)</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Default.fixPadding * 2,
  },
  scannerFrame: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  instructionText: {
    ...Fonts.Medium14white,
    textAlign: 'center',
    marginBottom: Default.fixPadding * 2,
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: Colors.white,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.white,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: Colors.white,
  },
  cornerBottomRight: {
    position: 'absolute',
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
  mockButton: {
    backgroundColor: Colors.primary,
    marginHorizontal: Default.fixPadding * 2,
    marginVertical: Default.fixPadding,
    paddingVertical: Default.fixPadding * 1.5,
    borderRadius: 8,
    alignItems: 'center',
  },
  mockButtonText: {
    ...Fonts.Bold16white,
  },
});

export default QRScanner;
