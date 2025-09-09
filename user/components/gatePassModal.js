import React, { useState, useRef, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Modal,
  Image,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import DashedLine from "react-native-dashed-line";
import SnackbarToast from "./snackbarToast";
import * as Clipboard from "expo-clipboard";
import QRCode from "react-native-qrcode-svg";
import BarcodeMask from "react-native-barcode-mask";
import ViewShot from "react-native-view-shot";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

const { width, height } = Dimensions.get("window");

const GatePassModal = (props) => {
  const { t, i18n } = useTranslation();
  const viewShotRef = useRef();

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`gatePassModal:${key}`);
  }

  // Debug logging to see what visitor data is being passed
  console.log('🎫 GatePassModal - Received visitor data:', {
    visitorData: props.visitorData,
    hasVisitorData: !!props.visitorData,
    visitorName: props.visitorData?.visitor_name,
    visitorType: props.visitorData?.visitor_type,
    entryCode: props.visitorData?.entry_code,
    qrCodeData: props.visitorData?.qr_code_data
  });
  
  // Debug logging for QR code data parsing
  if (props.visitorData?.qr_code_data) {
    try {
      // Handle double-escaped JSON from Supabase
      let qrData;
      try {
        qrData = JSON.parse(props.visitorData.qr_code_data);
      } catch (parseError) {
        const unescaped = props.visitorData.qr_code_data.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        qrData = JSON.parse(unescaped);
      }
      console.log('🎫 GatePassModal - Successfully parsed QR data:', qrData);
      console.log('🎫 GatePassModal - QR data type:', qrData.type);
    } catch (error) {
      console.log('🎫 GatePassModal - Failed to parse QR data:', error);
      console.log('🎫 GatePassModal - Raw QR data string:', props.visitorData.qr_code_data);
    }
  }

  // Handle both modalClose and onClose props for backward compatibility
  const handleClose = props.modalClose || props.onClose;

  // Generate a unique entry code from the visitor pass data
  const generateEntryCode = () => {
    // Use stored entry code if available
    if (props.visitorData?.entry_code) {
      console.log('🎫 Using database entry code:', props.visitorData.entry_code);
      return props.visitorData.entry_code;
    }
    
    // Try to extract entry code from QR code data
    if (props.visitorData?.qr_code_data) {
      try {
        // Handle double-escaped JSON from Supabase
        let qrData;
        try {
          qrData = JSON.parse(props.visitorData.qr_code_data);
        } catch (parseError) {
          const unescaped = props.visitorData.qr_code_data.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
          qrData = JSON.parse(unescaped);
        }
        if (qrData.entry_code) {
          console.log('🎫 Using QR code entry code:', qrData.entry_code);
          return qrData.entry_code;
        }
      } catch (error) {
        console.warn('🎫 Failed to parse QR code data:', error);
      }
    }
    
    // Fallback: use visitor ID
    if (props.visitorData?.id) {
      const fallbackCode = props.visitorData.id.slice(-8).toUpperCase();
      console.log('🎫 Using visitor ID as entry code:', fallbackCode);
      return fallbackCode;
    }
    
    // Last resort: generate random code
    const randomCode = "VP" + Math.random().toString(36).substr(2, 6).toUpperCase();
    console.log('🎫 Generated random entry code:', randomCode);
    return randomCode;
  };

  // Use useEffect to update code when visitor data changes
  const [code, setCode] = useState(() => generateEntryCode());
  
  // Update entry code when visitor data changes
  useEffect(() => {
    const newCode = generateEntryCode();
    setCode(newCode);
  }, [props.visitorData?.entry_code, props.visitorData?.qr_code_data, props.visitorData?.id]);

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(code);
  };

  const [copyCodeToast, setCopyCodeToast] = useState(false);
  const onDismiss = () => setCopyCodeToast(false);

  // Use the QR code data from the created visitor pass, or fallback to visitor name
  const qrCodeValue = props.visitorData?.qr_code_data || props.name;

  // Function to capture the gate pass as image
  const captureGatePass = async () => {
    try {
      const uri = await viewShotRef.current.capture();
      return uri;
    } catch (error) {
      console.error('Error capturing gate pass:', error);
      Alert.alert('Error', 'Failed to capture gate pass');
      return null;
    }
  };

  // Function to download gate pass
  const handleDownload = async () => {
    try {
      const uri = await captureGatePass();
      if (!uri) return;

      const visitorName = props.visitorData?.visitor_name || props.name || 'visitor';
      const fileName = `GatePass_${visitorName.replace(/\s+/g, '_')}_${new Date().getTime()}.png`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.copyAsync({
        from: uri,
        to: fileUri,
      });

      Alert.alert(
        'Success', 
        `Gate pass saved as ${fileName}`,
        [
          { 
            text: 'OK', 
            onPress: () => props.onDownloadHandle && props.onDownloadHandle()
          }
        ]
      );
    } catch (error) {
      console.error('Error downloading gate pass:', error);
      Alert.alert('Error', 'Failed to download gate pass');
    }
  };

  // Function to share gate pass
  const handleShare = async () => {
    try {
      const uri = await captureGatePass();
      if (!uri) return;

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share Gate Pass',
        });
        
        // Call the original onShareClose after sharing
        if (props.onShareClose) {
          props.onShareClose();
        }
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Error sharing gate pass:', error);
      Alert.alert('Error', 'Failed to share gate pass');
    }
  };

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={props.visible}
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressOut={handleClose}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView behavior={"padding"} style={{ flex: 1 }}>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: Colors.transparentBlack,
            }}
          >
            <TouchableOpacity
              onPress={handleClose}
              style={{
                alignSelf: isRtl ? "flex-end" : "flex-start",
                marginVertical: Default.fixPadding * 1.4,
                marginHorizontal: Default.fixPadding * 2,
              }}
            >
              <Ionicons name="close" size={22} color={Colors.white} />
            </TouchableOpacity>

            <View
              style={{
                overflow: "hidden",
                maxHeight: height / 1.,
                width: width * 0.9,
                borderRadius: 10,
                backgroundColor: Colors.white,
                ...Default.shadow,
              }}
            >
              <ViewShot ref={viewShotRef} options={{ format: "png", quality: 0.9 }}>
                <TouchableWithoutFeedback>
                  <View
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      padding: Default.fixPadding * 1.3,
                      backgroundColor: Colors.primary,
                    }}
                  >
                    <Text style={{ ...Fonts.SemiBold18white }}>
                      {tr("gatePass")}
                    </Text>
                  </View>
                </TouchableWithoutFeedback>
              <ScrollView
                showsVerticalScrollIndicator={false}
                automaticallyAdjustKeyboardInsets={true}
              >
                <TouchableWithoutFeedback>
                  <View>
                    <View
                      style={{
                        flexDirection: isRtl ? "row-reverse" : "row",
                        justifyContent: "center",
                        alignItems: "center",
                        paddingBottom: Default.fixPadding * 2.6,
                        marginTop: Default.fixPadding * 2.3,
                        marginHorizontal: Default.fixPadding * 2,
                      }}
                    >
                      <View
                        style={{
                          flex: 3,
                          alignItems: isRtl ? "flex-start" : "flex-end",
                        }}
                      >
                        <View style={styles.topImageView}>
                          <Image
                            source={require("../assets/images/pre1.png")}
                            style={{
                              resizeMode: "contain",
                              width: 34,
                              height: 34,
                            }}
                          />
                        </View>
                      </View>

                      <View
                        style={{
                          flex: 7,
                          alignItems: isRtl ? "flex-end" : "flex-start",
                          marginHorizontal: Default.fixPadding * 2.4,
                        }}
                      >
                        <Text
                          numberOfLines={1}
                          style={{
                            ...Fonts.SemiBold16black,
                            overflow: "hidden",
                            marginBottom: Default.fixPadding * 0.3,
                          }}
                        >
                          {props.visitorData?.visitor_name || props.name || 'Visitor'}
                        </Text>
                        <Text style={{ ...Fonts.Medium16grey }}>
                          {(() => {
                            // Try to parse QR code data to get entry type
                            let entryType = '';
                            try {
                              if (props.visitorData?.qr_code_data) {
                                console.log('🎫 GatePassModal - Raw QR code data:', props.visitorData.qr_code_data);
                                // Handle double-escaped JSON from Supabase
                                let qrData;
                                try {
                                  // First try to parse as-is
                                  qrData = JSON.parse(props.visitorData.qr_code_data);
                                } catch (parseError) {
                                  console.log('🎫 GatePassModal - First parse failed, trying to unescape...');
                                  // If that fails, try to unescape first
                                  const unescaped = props.visitorData.qr_code_data.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
                                  qrData = JSON.parse(unescaped);
                                }
                                console.log('🎫 GatePassModal - Parsed QR data:', qrData);
                                console.log('🎫 GatePassModal - QR data type:', qrData.type);
                                
                                if (qrData.type === 'user_gate_pass') {
                                  entryType = `My Gate Pass`;
                                } else if (qrData.type === 'family_member') {
                                  entryType = `My Family Member`;
                                } else if (qrData.type === 'vehicle') {
                                  entryType = `My Vehicle`;
                                } else if (qrData.type === 'frequent_entry') {
                                  entryType = `My Frequent Entry`;
                                } else if (qrData.type_category === 'daily_help') {
                                  entryType = `My Daily Help`;
                               } else if (props.visitorData?.visitor_type === 'delivery') {
                                  entryType = `${props.visitorData?.company_name || 'Delivery'}`;
                                } else if (props.visitorData?.visitor_type === 'cab') {
                                  entryType = `${props.visitorData?.company_name || 'Cab'}`;
                                } else if (props.visitorData?.visitor_type === 'service') {
                                  entryType = `${props.visitorData?.service_type || 'Service'}`;
                                } else if (props.visitorData?.unit_number) {
                                  entryType = `${tr("guestAt")} ${props.visitorData.unit_number}`;
                                } else {
                                  entryType = `${tr("guestAt")} Unit`;
                                }
                              } else {
                                // Fallback for visitor types
                                if (props.visitorData?.visitor_type === 'delivery') {
                                  entryType = `${props.visitorData?.company_name || 'Delivery'}`;
                                } else if (props.visitorData?.visitor_type === 'cab') {
                                  entryType = `${props.visitorData?.company_name || 'Cab'}`;
                                } else if (props.visitorData?.visitor_type === 'service') {
                                  entryType = `${props.visitorData?.service_type || 'Service'}`;
                                } else if (props.visitorData?.unit_number) {
                                  entryType = `${tr("guestAt")} ${props.visitorData.unit_number}`;
                                } else {
                                  entryType = `${tr("guestAt")} Unit`;
                                }
                              }
                            } catch (error) {
                              console.log('🎫 GatePassModal - Error parsing QR data:', error);
                              console.log('🎫 GatePassModal - Raw QR data:', props.visitorData?.qr_code_data);
                              // Fallback for visitor types
                              if (props.visitorData?.visitor_type === 'delivery') {
                                entryType = `${props.visitorData?.company_name || 'Delivery'}`;
                              } else if (props.visitorData?.visitor_type === 'cab') {
                                entryType = `${props.visitorData?.company_name || 'Cab'}`;
                              } else if (props.visitorData?.visitor_type === 'service') {
                                entryType = `${props.visitorData?.service_type || 'Service'}`;
                              } else if (props.visitorData?.unit_number) {
                                entryType = `${tr("guestAt")} ${props.visitorData.unit_number}`;
                              } else {
                                entryType = `${tr("guestAt")} Unit`;
                              }
                            }
                            return entryType;
                          })()}
                        </Text>
                        
                        {/* Display visit date if available (only for visitors) */}
                        {(() => {
                          try {
                            if (props.visitorData?.qr_code_data) {
                              // Handle double-escaped JSON from Supabase
                              let qrData;
                              try {
                                qrData = JSON.parse(props.visitorData.qr_code_data);
                              } catch (parseError) {
                                const unescaped = props.visitorData.qr_code_data.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
                                qrData = JSON.parse(unescaped);
                              }
                              // Only show visit date for visitor passes, not for family/daily help/vehicles/frequent entries
                              if (qrData.type === 'visitor_pass' && (props.visitorData?.visit_date || props.visitorData?.from_date)) {
                                return (
                                  <Text style={{ ...Fonts.Regular14grey, marginTop: Default.fixPadding * 0.3 }}>
                                    {tr("visitDate")}: {
                                      props.visitorData?.from_date ? 
                                        new Date(props.visitorData.from_date).toLocaleDateString() :
                                        props.visitorData?.visit_date ? 
                                          new Date(props.visitorData.visit_date).toLocaleDateString() :
                                          'Not set'
                                    }
                                  </Text>
                                );
                              }
                            } else if (props.visitorData?.visit_date || props.visitorData?.from_date) {
                              // Fallback for visitor types
                              return (
                                <Text style={{ ...Fonts.Regular14grey, marginTop: Default.fixPadding * 0.3 }}>
                                  {tr("visitDate")}: {
                                    props.visitorData?.from_date ? 
                                      new Date(props.visitorData.from_date).toLocaleDateString() :
                                      props.visitorData?.visit_date ? 
                                        new Date(props.visitorData.visit_date).toLocaleDateString() :
                                        'Not set'
                                  }
                                </Text>
                              );
                            }
                          } catch (error) {
                            // Fallback for visitor types
                            if (props.visitorData?.visit_date || props.visitorData?.from_date) {
                              return (
                                <Text style={{ ...Fonts.Regular14grey, marginTop: Default.fixPadding * 0.3 }}>
                                  {tr("visitDate")}: {
                                    props.visitorData?.from_date ? 
                                      new Date(props.visitorData.from_date).toLocaleDateString() :
                                      props.visitorData?.visit_date ? 
                                        new Date(props.visitorData.visit_date).toLocaleDateString() :
                                        'Not set'
                                  }
                                </Text>
                              );
                            }
                          }
                          return null;
                        })()}
                        
                        {/* Display phone number if available */}
                        {(() => {
                          try {
                            if (props.visitorData?.qr_code_data) {
                              // Handle double-escaped JSON from Supabase
                              let qrData;
                              try {
                                qrData = JSON.parse(props.visitorData.qr_code_data);
                              } catch (parseError) {
                                const unescaped = props.visitorData.qr_code_data.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
                                qrData = JSON.parse(unescaped);
                              }
                              const phoneNumber = qrData.phone || props.visitorData?.visitor_phone;
                              if (phoneNumber) {
                                return (
                                  <Text style={{ ...Fonts.Regular14grey, marginTop: Default.fixPadding * 0.2 }}>
                                    {tr("phone")}: {phoneNumber}
                                  </Text>
                                );
                              }
                            } else if (props.visitorData?.visitor_phone) {
                              return (
                                <Text style={{ ...Fonts.Regular14grey, marginTop: Default.fixPadding * 0.2 }}>
                                  {tr("phone")}: {props.visitorData.visitor_phone}
                                </Text>
                              );
                            }
                          } catch (error) {
                            if (props.visitorData?.visitor_phone) {
                              return (
                                <Text style={{ ...Fonts.Regular14grey, marginTop: Default.fixPadding * 0.2 }}>
                                  {tr("phone")}: {props.visitorData.visitor_phone}
                                </Text>
                              );
                            }
                          }
                          return null;
                        })()}
                        
                        {/* Display purpose/relation/type if available */}
                        {(() => {
                          try {
                            if (props.visitorData?.qr_code_data) {
                              // Handle double-escaped JSON from Supabase
                              let qrData;
                              try {
                                qrData = JSON.parse(props.visitorData.qr_code_data);
                              } catch (parseError) {
                                const unescaped = props.visitorData.qr_code_data.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
                                qrData = JSON.parse(unescaped);
                              }
                              let displayText = '';
                              let label = '';
                              let societyName = '';
                              let unitBlock = '';
                              let unitNumber = '';
                              
                              if (qrData.type === 'user_gate_pass') {
                                // Get society and unit information from QR data
                                societyName = qrData.society_name || '';
                                unitBlock = qrData.unit_block || '';
                                unitNumber = qrData.unit_number || '';
                                
                                if (societyName && unitBlock && unitNumber) {
                                  displayText = societyName;
                                  label = `Unit: ${unitBlock}-${unitNumber}`;
                                } else if (unitBlock && unitNumber) {
                                  displayText = `Unit: ${unitBlock}-${unitNumber}`;
                                  label = '';
                                } else {
                                  displayText = 'Unit N/A';
                                  label = 'Unit';
                                }
                              } else if (qrData.type === 'family_member') {
                                displayText = qrData.relation;
                                label = 'Relation';
                              } else if (qrData.type === 'vehicle') {
                                displayText = `${qrData.model} (${qrData.color})`;
                                label = 'Vehicle';
                              } else if (qrData.type === 'frequent_entry') {
                                displayText = qrData.relation;
                                label = 'Relation';
                              } else if (qrData.type_category === 'daily_help') {
                                displayText = qrData.type;
                                label = 'Type';
                              } else if (props.visitorData?.purpose) {
                               displayText = props.visitorData.purpose;
                               label = tr("purpose");
                             }
                             
                             if (displayText) {
                               if (qrData.type === 'user_gate_pass' && societyName && unitBlock && unitNumber) {
                                 // Special display for user gate pass with society and unit
                                 return (
                                   <View style={{ marginTop: Default.fixPadding * 0.2 }}>
                                     <Text style={{ ...Fonts.SemiBold14grey }}>
                                       {societyName}
                                     </Text>
                                     <Text style={{ ...Fonts.Regular14grey, marginTop: Default.fixPadding * 0.1 }}>
                                       Unit: {unitBlock}-{unitNumber}
                                     </Text>
                                   </View>
                                 );
                               } else {
                                 // Regular display for other types
                                 return (
                                   <Text style={{ ...Fonts.Regular14grey, marginTop: Default.fixPadding * 0.2 }}>
                                     {label}: {displayText}
                                   </Text>
                                 );
                               }
                             }
                            } else if (props.visitorData?.purpose) {
                              return (
                                <Text style={{ ...Fonts.Regular14grey, marginTop: Default.fixPadding * 0.2 }}>
                                  {tr("purpose")}: {props.visitorData.purpose}
                                </Text>
                              );
                            }
                          } catch (error) {
                            if (props.visitorData?.purpose) {
                              return (
                                <Text style={{ ...Fonts.Regular14grey, marginTop: Default.fixPadding * 0.2 }}>
                                  {tr("purpose")}: {props.visitorData.purpose}
                                </Text>
                              );
                            }
                          }
                          return null;
                        })()}
                        
                        {/* Display vehicle number for cabs/deliveries */}
                        {props.visitorData?.vehicle_number && (
                          <Text style={{ ...Fonts.Regular14grey, marginTop: Default.fixPadding * 0.2 }}>
                            {tr("vehicle")}: {props.visitorData.vehicle_number}
                          </Text>
                        )}
                      </View>
                    </View>
                    <DashedLine
                      dashGap={2.5}
                      dashLength={2.5}
                      dashThickness={1.5}
                      dashColor={Colors.grey}
                      style={{ marginBottom: Default.fixPadding * 4.3 }}
                    />

                    <View
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: Default.fixPadding * 0,
                        marginBottom: Default.fixPadding * 3.5,
                      }}
                    >
                      <BarcodeMask
                        width={170}
                        height={170}
                        edgeWidth={40}
                        edgeHeight={40}
                        edgeColor={Colors.black}
                        edgeBorderWidth={5}
                        edgeRadius={5}
                        showAnimatedLine={false}
                        backgroundColor={Colors.transparent}
                      />
                      <QRCode value={qrCodeValue} size={144} />
                    </View>
                    <View style={{ marginHorizontal: Default.fixPadding * 2 }}>
                      <Text
                        style={{
                          ...Fonts.SemiBold16black,
                          textAlign: isRtl ? "right" : "left",
                        }}
                      >
                        {tr("entryCode")}
                      </Text>

                      <View
                        style={{
                          flexDirection: isRtl ? "row-reverse" : "row",
                          ...styles.textInputView,
                        }}
                      >
                        <TextInput
                          value={code}
                          onChangeText={setCode}
                          placeholder={tr("entryCode")}
                          placeholderTextColor={Colors.grey}
                          selectionColor={Colors.primary}
                          style={{
                            ...Fonts.Medium16black,
                            flex: 1,
                            textAlign: isRtl ? "right" : "left",
                            marginRight: isRtl ? 0 : Default.fixPadding,
                            marginLeft: isRtl ? Default.fixPadding : 0,
                          }}
                        />

                        <MaterialCommunityIcons
                          name="content-copy"
                          size={20}
                          color={Colors.grey}
                          onPress={() => {
                            copyToClipboard();
                            setCopyCodeToast(true);
                          }}
                        />
                      </View>

                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </ScrollView>
              </ViewShot>

              <View
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  alignItems: "center",
                  paddingHorizontal: Default.fixPadding * 2.6,
                  marginTop: Default.fixPadding * 1.5,
                  marginBottom: Default.fixPadding * 2.2,
                }}
              >
                <TouchableOpacity
                  onPress={handleShare}
                  style={{
                    marginRight: isRtl ? 0 : Default.fixPadding * 1.5,
                    marginLeft: isRtl ? Default.fixPadding * 1.5 : 0,
                    backgroundColor: Colors.white,
                    ...styles.shareDownloadBtn,
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={{ ...Fonts.SemiBold18black, overflow: "hidden" }}
                  >
                    {tr("share")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDownload}
                  style={{
                    backgroundColor: Colors.primary,
                    ...styles.shareDownloadBtn,
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={{ ...Fonts.SemiBold18white, overflow: "hidden" }}
                  >
                    {tr("download")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableOpacity>
      <SnackbarToast
        title={tr("copy")}
        visible={copyCodeToast}
        onDismiss={onDismiss}
      />
    </Modal>
  );
};

export default GatePassModal;

const styles = StyleSheet.create({
  textInputView: {
    alignItems: "center",
    paddingHorizontal: Default.fixPadding * 1.3,
    paddingVertical: Default.fixPadding * 1.2,
    marginVertical: Default.fixPadding,
    borderRadius: 10,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  shareDownloadBtn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Default.fixPadding * 1.4,
    borderRadius: 10,
    ...Default.shadow,
  },
  topImageView: {
    justifyContent: "center",
    alignItems: "center",
    width: 55,
    height: 55,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: Colors.white,
    backgroundColor: Colors.geyser,
    ...Default.shadow,
  },
});
