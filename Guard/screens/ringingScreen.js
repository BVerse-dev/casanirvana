import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, BackHandler, TouchableOpacity, Alert, Image, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ms } from 'react-native-size-matters/extend';
import { Colors, Default, Fonts } from '../constants/styles';
import MyStatusBar from "../components/myStatusBar";
import { supabase } from '../utils/supabase';
import { useVisitorPasses } from '../hooks/useVisitorPasses';
import { useCabEntries } from '../hooks/useCabEntries';
import { useDeliveryEntries } from '../hooks/useDeliveryEntries';
import { useServiceEntries } from '../hooks/useServiceEntries';
import { useGuardAuth } from '../contexts/GuardAuthContext';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

// Professional Ring animation component (based on callScreen pattern)
const Ring = ({ index }) => {
  const opacityValue = useSharedValue(0.9);
  const scaleValue = useSharedValue(1);

  useEffect(() => {
    opacityValue.value = withDelay(
      index * 200,
      withRepeat(
        withTiming(0, {
          duration: 2000,
        }),
        -1,
        false
      )
    );
    scaleValue.value = withDelay(
      index * 200,
      withRepeat(
        withTiming(2, {
          duration: 2000,
        }),
        -1,
        false
      )
    );
  }, [opacityValue, scaleValue, index]);

  const rStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: scaleValue.value,
        },
      ],
      opacity: opacityValue.value,
    };
  });
  
  return <Animated.View style={[styles.ring, rStyle]} />;
};

const RingingScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { createVisitorPass } = useVisitorPasses(); // Add visitor pass creation hook
  const { createCabEntry } = useCabEntries(); // Add cab entry hook
  const { createDeliveryEntry } = useDeliveryEntries(); // Add delivery entry hook
  const { createServiceEntry } = useServiceEntries(); // Add service entry hook
  const { guard, user, isAuthenticated } = useGuardAuth(); // Add guard context
  const { 
    hostName, 
    selectedFlatNo, 
    guestName, 
    guestCount, 
    phoneNumber, 
    arrivalTime, 
    guestDetails, 
    guestMessage,
    companyName,        // FIXED: Add company name for delivery entries
    visitorPassId,      // NEW: visitor pass ID from guest entry creation
    visitorPhone,       // NEW: visitor phone from guest entry
    expectedTime,       // NEW: expected time from guest entry
    entryType = 'guest', // NEW: entry type (guest, cab, delivery, service)
    unitId,             // NEW: unit ID for database operations
    cabData,            // NEW: cab-specific data
    deliveryData,       // NEW: delivery-specific data
    visitorType,        // NEW: visitor type parameter (delivery, cab, guest)
    guestData           // FIXED: Add guestData parameter
  } = route.params || {};

  function tr(key) {
    return t(`ringingScreen:${key}`);
  }

  const [mic, setMic] = useState(false);
  const [mute, setMute] = useState(false);
  const [callStatus, setCallStatus] = useState('connecting'); // connecting, ringing, connected
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    // Disable back button
    const backAction = () => {
      return true; // Prevent going back
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    // Simulate call progression
    const timer1 = setTimeout(() => {
      setCallStatus('ringing');
    }, 2000);

    const timer2 = setTimeout(() => {
      setCallStatus('connected');
      startCallTimer();
    }, 5000);

    const timer3 = setTimeout(() => {
      setShowDecisionModal(true);
    }, 8000);

    return () => {
      backHandler.remove();
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const startCallTimer = () => {
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    // Clean up interval after decision modal shows
    setTimeout(() => {
      clearInterval(interval);
    }, 3000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAllow = async () => {
    setShowDecisionModal(false);
    
    try {
      // Get unit information based on flat number
      const unitId = await getUnitIdFromFlat(selectedFlatNo);
      
      // If unit not found, we cannot proceed - show error
      if (!unitId) {
        console.error('Cannot proceed without valid unit ID for flat:', selectedFlatNo);
        Alert.alert('Error', `Unit not found for flat ${selectedFlatNo}. Please contact administrator.`);
        return;
      }

      // Create visitor pass for the guest entry
      let createdVisitorPassId = visitorPassId; // Use existing ID if available
      
      if (!visitorPassId) {
        // Create visitor pass based on entry type or visitorType
        const currentEntryType = visitorType || entryType;
        
        if (currentEntryType === 'cab') {
          // Parse cab details from guestDetails: "Uber - Last 4 digits: 1234"
          const cabDetailsParts = guestDetails ? guestDetails.split(' - Last 4 digits: ') : ['Cab', 'N/A'];
          const companyName = cabDetailsParts[0] || 'Cab';
          const vehicleDigits = cabDetailsParts[1] || 'N/A';
          
          // Extract service type from guestMessage: "Pickup service for John"
          const serviceType = guestMessage && guestMessage.toLowerCase().includes('pickup') && guestMessage.toLowerCase().includes('dropoff') 
            ? 'Pickup & Dropoff'
            : guestMessage && guestMessage.toLowerCase().includes('pickup')
            ? 'Pickup'
            : guestMessage && guestMessage.toLowerCase().includes('dropoff')
            ? 'Dropoff'
            : 'Pickup';

          console.log('Creating cab entry with data:', {
            driver_name: guestName,
            company_name: companyName,
            service_type: serviceType,
            vehicle_number: vehicleDigits,
            unit_id: unitId,
            from_date: expectedTime || new Date().toISOString(),
            to_date: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
            guard_notes: `${serviceType} for ${guestName} - ${companyName} - Last 4: ${vehicleDigits}`,
          });

          const cabEntryData = {
            driver_name: guestName,
            company_name: companyName,
            service_type: serviceType,
            vehicle_number: vehicleDigits,
            unit_id: unitId,
            from_date: expectedTime || new Date().toISOString(),
            to_date: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
            guard_notes: `${serviceType} for ${guestName} - ${companyName} - Last 4: ${vehicleDigits}`,
          };

          createdVisitorPassId = await createCabEntry(cabEntryData);
        } else if (currentEntryType === 'delivery') {
          // Handle delivery entry creation - Use companyName directly from params
          const deliveryCompanyName = companyName || guestDetails || 'Delivery Service';
          
          const deliveryEntryData = {
            driver_name: guestName, // Use driver_name to match hook expectation  
            company_name: deliveryCompanyName,
            unit_id: unitId,
            from_date: new Date().toISOString(),
            to_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours for delivery
            guard_notes: `Delivery from ${deliveryCompanyName} for ${hostName} - ${selectedFlatNo}`,
          };

          createdVisitorPassId = await createDeliveryEntry(deliveryEntryData);
        } else if (currentEntryType === 'service') {
          // Handle service entry creation
          const serviceName = guestDetails || guestMessage || 'Service Provider';
          
          const serviceEntryData = {
            service_provider_name: guestName,
            provider_phone: visitorPhone || phoneNumber || '',
            unit_id: unitId,
            service_type: serviceName,
            company_name: serviceName, // Use service type as company name for consistency
            from_date: new Date().toISOString(),
            to_date: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours for service
            service_purpose: `${serviceName} service requested`,
            guard_notes: `${serviceName} provider ${guestName} approved for ${hostName} - ${selectedFlatNo}`,
          };

          createdVisitorPassId = await createServiceEntry(serviceEntryData);
        } else {
          // Create regular guest visitor pass
          console.log('Creating visitor pass with data:', {
            visitor_name: guestName,
            visitor_phone: visitorPhone || phoneNumber,
            unit_id: unitId,
            purpose: guestDetails || 'Guest visit',
            from_date: expectedTime || new Date().toISOString(),
            to_date: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
            guard_notes: guestMessage || 'Walk-in visitor approved by guard',
          });
          
          const visitorPassData = {
            visitor_name: guestName,
            visitor_phone: visitorPhone || phoneNumber,
            unit_id: unitId,
            purpose: guestDetails || 'Guest visit',
            from_date: expectedTime || new Date().toISOString(),
            to_date: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
            guard_notes: guestMessage || 'Walk-in visitor approved by guard',
          };

          createdVisitorPassId = await createVisitorPass(visitorPassData);
        }
        
        if (!createdVisitorPassId) {
          Alert.alert('Error', `Failed to create ${entryType} entry`);
          return;
        }
      }
      
      // Extract proper name and phone based on entry type
      const currentEntryType = visitorType || entryType;
      let displayName = guestName;
      let displayPhone = visitorPhone || phoneNumber;
      
      if (currentEntryType === 'delivery' && deliveryData) {
        displayName = deliveryData.deliverymanName || guestName;
        displayPhone = deliveryData.phoneNumber || phoneNumber;
      } else if (currentEntryType === 'cab' && cabData) {
        displayName = cabData.driverName || guestName;
        displayPhone = cabData.phoneNumber || phoneNumber;
      } else if (currentEntryType === 'service') {
        // For service entries, keep the guestName as service provider name
        displayName = guestName;
        displayPhone = visitorPhone || phoneNumber || '';
      }
      
      navigation.navigate('allowedScreen', {
        guestName: displayName,
        hostName,
        guestCount,
        phoneNumber: displayPhone,
        arrivalTime: arrivalTime || new Date().toISOString(),
        selectedFlatNo,
        guestDetails,
        guestMessage,
        companyName,      // FIXED: Pass company name for delivery
        unitId,
        visitorPassId: createdVisitorPassId,    // Pass visitor pass ID for status update
        visitorPhone,     // Pass visitor phone  
        expectedTime,     // Pass expected time
        entryType,        // Pass entry type for dynamic display
        cabData,          // Pass cab data
        deliveryData,     // Pass delivery data
        serviceData: currentEntryType === 'service' ? {
          serviceType: guestDetails || guestMessage || 'Service Provider',
          providerName: guestName,
          phoneNumber: displayPhone
        } : undefined,    // Pass service data for service entries
        visitorType,      // Pass visitor type parameter
        guestData         // FIXED: Pass guest data for all entry types
      });
    } catch (error) {
      console.error('Error in handleAllow:', error);
      Alert.alert('Error', 'Failed to process visitor approval');
    }
  };

  const handleCancel = async () => {
    setShowDecisionModal(false);
    
    try {
      // Send cancellation notification to host
      await sendCancellationNotification();
      
      navigation.navigate('cancelledScreen', {
        guestName,
        hostName,
        guestCount,
        phoneNumber,
        arrivalTime,
        selectedFlatNo,
        guestDetails,
        guestMessage,
        visitorPassId,    // Pass visitor pass ID for status update
        visitorPhone,     // Pass visitor phone
        expectedTime      // Pass expected time
      });
    } catch (error) {
      console.error('Error in handleCancel:', error);
      // Still navigate even if notification fails
      navigation.navigate('cancelledScreen', {
        guestName,
        hostName,
        guestCount,
        phoneNumber,
        arrivalTime,
        selectedFlatNo,
        guestDetails,
        guestMessage,
        visitorPassId,    // Pass visitor pass ID for status update
        visitorPhone,     // Pass visitor phone
        expectedTime      // Pass expected time
      });
    }
  };

  const getUnitIdFromFlat = async (flatNo) => {
    console.log('Guard context:', { guard: guard?.id, society: guard?.society_id, isAuthenticated });
    
    if (!guard?.society_id) {
      console.error('Guard society ID not available');
      return null;
    }

    try {
      console.log('Looking for unit:', flatNo, 'in society:', guard.society_id);
      
      // First try to find unit by unit_number (exact match) in guard's society
      const { data: exactMatches, error: exactError } = await supabase
        .from('units')
        .select('id')
        .eq('unit_number', flatNo)
        .eq('society_id', guard.society_id) // Filter by guard's society
        .limit(1);

      if (exactMatches && exactMatches.length > 0 && !exactError) {
        console.log('Found unit by unit_number:', exactMatches[0].id);
        return exactMatches[0].id;
      }

      // If no exact match, try to parse flatNo and search by block + number in guard's society
      // Handle formats like "A-101", "B-205", etc.
      const flatMatch = flatNo.match(/^([A-Z]+)-?(\d+)$/);
      if (flatMatch) {
        const [, block, number] = flatMatch;
        console.log('Parsed flat:', { block, number });
        
        const { data: parsedMatches, error: parsedError } = await supabase
          .from('units')
          .select('id')
          .eq('block', block)
          .eq('number', number)
          .eq('society_id', guard.society_id) // Filter by guard's society
          .limit(1);

        if (parsedMatches && parsedMatches.length > 0 && !parsedError) {
          console.log('Found unit by block+number:', parsedMatches[0].id);
          return parsedMatches[0].id;
        }
      }

      console.warn('Unit not found for flat:', flatNo, 'in society:', guard.society_id);
      return null;
    } catch (error) {
      console.error('Error getting unit ID:', error);
      return null;
    }
  };

  const sendCancellationNotification = async () => {
    try {
      const unitId = await getUnitIdFromFlat(selectedFlatNo);
      
      if (!unitId) {
        console.warn('Cannot send notification - unit not found for flat:', selectedFlatNo);
        return; // Skip notification if unit not found
      }
      
      const notificationData = {
        title: 'Visitor Entry Declined',
        message: `Your visitor ${guestName} was declined entry to ${selectedFlatNo}. Please contact the guard for more information.`,
        type: 'visitor_declined',
        recipient_id: unitId,
        data: {
          visitor_name: guestName,
          flat_no: selectedFlatNo,
          host_name: hostName,
          declined_at: new Date().toISOString()
        }
      };

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([notificationData]);

      if (notificationError) {
        console.error('Error sending cancellation notification:', notificationError);
      } else {
        console.log('✅ Cancellation notification sent successfully');
      }
    } catch (error) {
      console.error('Error sending cancellation notification:', error);
    }
  };

  const getStatusText = () => {
    switch (callStatus) {
      case 'connecting':
        return tr('connecting') || 'Connecting...';
      case 'ringing':
        return tr('calling') || 'Calling...';
      case 'connected':
        return formatTime(callDuration);
      default:
        return '';
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <MyStatusBar />
      
      {/* Top section with call status and host info */}
      <View style={{ flex: 1.2 }}>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: Default.fixPadding * 2,
          }}
        >
          <Text
            style={{ ...Fonts.Medium18grey, marginBottom: Default.fixPadding }}
          >
            {getStatusText()}
          </Text>
          <Text style={{ ...Fonts.SemiBold18black }}>
            {hostName}
          </Text>
          <Text style={{ ...Fonts.Medium16grey, marginTop: 5 }}>
            Flat {selectedFlatNo}
          </Text>
        </View>
      </View>

      {/* Middle section with animated rings and profile */}
      <View
        style={{
          flex: 6,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          source={require("../assets/images/call.png")}
          style={{
            zIndex: 1,
            width: ms(259),
            height: ms(259),
            borderRadius: 130,
          }}
        />
        {(callStatus === 'connecting' || callStatus === 'ringing') && [...Array(3).keys()].map((index) => (
          <Ring key={index} index={index} />
        ))}
      </View>

      {/* Bottom section with call controls */}
      <View
        style={{
          flex: 2.8,
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginHorizontal: Default.fixPadding * 7,
          }}
        >
          <TouchableOpacity 
            style={{ ...styles.bottomBtn, backgroundColor: Colors.silver }}
            onPress={() => setMic(!mic)}
          >
            <Ionicons
              name={mic ? "mic-outline" : "mic-off-outline"}
              size={28}
              color={Colors.white}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              marginHorizontal: Default.fixPadding * 2,
              backgroundColor: Colors.silver,
              ...styles.bottomBtn,
            }}
            onPress={() => setMute(!mute)}
          >
            <Ionicons
              name={mute ? "volume-mute-outline" : "volume-medium-outline"}
              size={28}
              color={Colors.white}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={{ ...styles.bottomBtn, backgroundColor: Colors.silver }}
          >
            <Ionicons
              name={"chatbox-ellipses-outline"}
              size={24}
              color={Colors.white}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => navigation.pop()}
          style={{
            alignSelf: "center",
            marginVertical: Default.fixPadding * 4,
            backgroundColor: Colors.darkRed,
            ...styles.bottomBtn,
          }}
        >
          <MaterialIcons name="call-end" size={28} color={Colors.white} />
        </TouchableOpacity>
      </View>

        {/* Decision Modal */}
        <Modal
          visible={showDecisionModal}
          transparent={true}
          animationType="fade"
        >
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <View style={{
              backgroundColor: Colors.white,
              borderRadius: ms(20),
              padding: ms(30),
              alignItems: 'center',
              width: '80%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}>
              <Text style={{
                fontSize: ms(20),
                fontWeight: 'bold',
                color: Colors.black,
                marginBottom: ms(15),
                textAlign: 'center',
              }}>
                {tr('call_ended') || 'Call Ended'}
              </Text>
              <Text style={{
                fontSize: ms(16),
                color: Colors.grey,
                marginBottom: ms(15),
                textAlign: 'center',
              }}>
                {tr('host_decision_message') || 'What did the resident decide about the visitor entry?'}
              </Text>
              <Text style={{
                fontSize: ms(16),
                color: Colors.grey,
                marginBottom: ms(30),
                textAlign: 'center',
              }}>
                {tr('allow_guest_entry') || `Allow ${guestName} to enter?`}
              </Text>
              
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%',
              }}>
                <TouchableOpacity
                  onPress={handleCancel}
                  style={{
                    backgroundColor: Colors.primary,
                    paddingVertical: ms(12),
                    paddingHorizontal: ms(30),
                    borderRadius: ms(25),
                    marginRight: ms(10),
                    flex: 1,
                  }}
                >
                  <Text style={{
                    color: Colors.white,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    fontSize: ms(16),
                  }}>
                    {tr('cancel') || 'Cancel'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={handleAllow}
                  style={{
                    backgroundColor: Colors.green,
                    paddingVertical: ms(12),
                    paddingHorizontal: ms(30),
                    borderRadius: ms(25),
                    marginLeft: ms(10),
                    flex: 1,
                  }}
                >
                  <Text style={{
                    color: Colors.white,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    fontSize: ms(16),
                  }}>
                    {tr('allow') || 'Allow'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
    </View>
  );
};

export default RingingScreen;

const styles = StyleSheet.create({
  bottomBtn: {
    justifyContent: "center",
    alignItems: "center",
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  ring: {
    position: "absolute",
    width: ms(200),
    height: ms(200),
    borderRadius: 100,
    backgroundColor: Colors.regularBlue,
  },
});
