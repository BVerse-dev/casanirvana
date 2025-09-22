import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Colors, Fonts, Default } from "../constants/styles";
import AwesomeButton from "react-native-really-awesome-button";
import { useGuardAuth } from '../contexts/GuardAuthContext';
import { getValidUnitsForGuard, getUnitResident } from '../services/unitValidationService';

const FlatNoTab = ({ navigation, route }) => {
  const { 
    headerTitle, 
    title, 
    placeholderTitle, 
    image, 
    returnScreen, 
    cabName, 
    guestName,
    phoneNumber,
    serviceType,
    entryTime,
    cabData,
    deliveryCompany,
    companyName,
    navigationSource
  } = route.params;

  // FIXED: Decode company name from title field since navigation params are broken
  let actualDeliveryCompany = deliveryCompany || companyName || 'Unknown Company';
  
  if (returnScreen === 'deliveryEntryScreen' && title && title.includes('|')) {
    const [companyFromTitle] = title.split('|');
    actualDeliveryCompany = companyFromTitle || 'Unknown Company';
  }

  // FIXED: Decode service type from title field for service entries
  let actualServiceType = serviceType || 'Service Provider';
  
  if (returnScreen === 'serviceEntryScreen' && title && title.includes('|')) {
    const [serviceTypeFromTitle] = title.split('|');
    actualServiceType = serviceTypeFromTitle || 'Service Provider';
  }

  // Debug logging for delivery parameters
  if (returnScreen === 'deliveryEntryScreen') {
    // Removed debug logs for clean code
  }

  // Get current tab name to determine which block to filter
  const currentTabName = route.name;
  
  // Determine which block to show based on tab name
  const getBlockFilter = (tabName) => {
    switch(tabName) {
      case 'blockATab':
        return 'A';
      case 'blockBTab':
        return 'B';
      case 'blockCTab':
        return 'C';
      case 'blockDTab':
        return 'D';
      case 'commonTab':
        return null; // Show all blocks for common areas
      case 'clubhouseTab':
        return null; // Show all blocks for clubhouse
      default:
        return null; // Show all if unknown tab
    }
  };

  const currentBlockFilter = getBlockFilter(currentTabName);

  const { t, i18n } = useTranslation();
  const { guard, user, isAuthenticated } = useGuardAuth();

  const isRtl = i18n.dir() == "rtl";
  function tr(key) {
    return t(`flatNoTab:${key}`);
  }

  // State for database-driven unit list
  const [flatNoList, setFlatNoList] = useState([]);
  const [selectedFlatNo, setSelectedFlatNo] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hostNames, setHostNames] = useState({});

  // Load units from database for guard's assigned society
  const loadUnitsFromDatabase = async () => {
    if (!isAuthenticated || !guard?.community_id) {
      Alert.alert("Error", "Guard authentication required");
      return;
    }

    try {
      setLoading(true);
      const validUnits = await getValidUnitsForGuard(guard.community_id);
      
      // Filter by current block if specified
      let filteredUnits = validUnits;
      if (currentBlockFilter) {
        filteredUnits = validUnits.filter(unit => unit.block === currentBlockFilter);
      }
      
      // Remove duplicates based on flatNumber to ensure single selection works
      const uniqueUnits = filteredUnits.filter((unit, index, arr) => 
        index === arr.findIndex(u => u.flatNumber === unit.flatNumber)
      );
      
      // Transform to FlatList format
      const unitList = uniqueUnits.map((unit, index) => ({
        key: (index + 1).toString(),
        flatNo: unit.flatNumber,
        unitId: unit.unitId,
        block: unit.block,
        number: unit.number,
        unitType: unit.unitType,
        floor: unit.floor
      }));

      setFlatNoList(unitList);
      
      // Set default selection to first unit
      if (unitList.length > 0) {
        setSelectedFlatNo(unitList[0].flatNo);
      }

      // Load resident names for all unique units
      await loadResidentNames(uniqueUnits);
      
    } catch (err) {
      console.error('Error loading units:', err);
      Alert.alert("Error", "Failed to load units: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load resident information for all units
  const loadResidentNames = async (units) => {
    const nameMapping = {};
    
    for (const unit of units) {
      try {
        const resident = await getUnitResident(unit.unitId);
        nameMapping[unit.flatNumber] = resident ? resident.name : "Unknown Resident";
      } catch (err) {
        nameMapping[unit.flatNumber] = "Unknown Resident";
      }
    }
    
    setHostNames(nameMapping);
  };

  // Get host name for a flat (from database lookup)
  const getHostName = (flatNo) => {
    return hostNames[flatNo] || "Unknown Resident";
  };

  // Load units on component mount and when guard context or block filter changes
  useEffect(() => {
    if (isAuthenticated && guard?.community_id) {
      loadUnitsFromDatabase();
    }
  }, [isAuthenticated, guard?.community_id, currentBlockFilter]);

  // Pull to refresh functionality
  const onRefresh = async () => {
    setRefreshing(true);
    await loadUnitsFromDatabase();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => {
    const isSelected = selectedFlatNo === item.flatNo;
    return (
      <TouchableOpacity
        onPress={() => setSelectedFlatNo(item.flatNo)}
        style={{
          borderColor: isSelected ? Colors.primary : Colors.lightGrey,
          ...style.flatNoTouchable,
        }}
      >
        <Text style={{ ...Fonts.SemiBold16black }}>{item.flatNo}</Text>
      </TouchableOpacity>
    );
  };
  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      {loading ? (
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          paddingVertical: Default.fixPadding * 3
        }}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={{ 
            ...Fonts.Medium14grey, 
            marginTop: Default.fixPadding,
            textAlign: 'center'
          }}>
            Loading units from database...
          </Text>
        </View>
      ) : flatNoList.length === 0 ? (
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          paddingVertical: Default.fixPadding * 3
        }}>
          <Text style={{ ...Fonts.Medium16grey, textAlign: 'center' }}>
            No units found in your assigned society
          </Text>
          <TouchableOpacity 
            onPress={loadUnitsFromDatabase}
            style={{
              marginTop: Default.fixPadding * 2,
              paddingVertical: Default.fixPadding,
              paddingHorizontal: Default.fixPadding * 2,
              backgroundColor: Colors.primary,
              borderRadius: 8
            }}
          >
            <Text style={{ ...Fonts.SemiBold14white }}>Reload Units</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={flatNoList}
          renderItem={renderItem}
          keyExtractor={(item) => item.key}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
            />
          }
          ListHeaderComponent={() => (
            <View
              style={{
                marginTop: Default.fixPadding * 1.5,
                marginBottom: Default.fixPadding * 1.2,
                marginHorizontal: Default.fixPadding * 2,
              }}
            >
              <Text
                style={{
                  ...Fonts.SemiBold16grey,
                  textAlign: isRtl ? "right" : "left",
                }}
              >
                {tr("selectFlatUnitNumber") || "Select Flat/Unit Number"}
              </Text>
              <Text
                style={{
                  ...Fonts.Medium12grey,
                  textAlign: isRtl ? "right" : "left",
                  marginTop: Default.fixPadding * 0.5,
                }}
              >
                {flatNoList.length} units available in your society
              </Text>
            </View>
          )}
        />
      )}
      {!loading && flatNoList.length > 0 && (
        <View
          style={{
            margin: Default.fixPadding * 2,
          }}
        >
        <AwesomeButton
          height={50}
          onPress={() => {
            // Determine which screen to return to based on returnScreen parameter
            if (returnScreen === 'cabEntryScreen') {
              // Follow guest entry pattern: Go to entry confirmation screen with cab data
              navigation.push("entryConfirmationScreen", {
                name: cabData?.driverName || cabName,
                phoneNumber: '', // Cab drivers usually don't provide phone
                visiting: selectedFlatNo,
                hostName: getHostName(selectedFlatNo),
                insideTime: "4 hours", // Default for cabs
                selectedTime: new Date().toISOString(),
                entryType: 'cab',
                guestDetails: `${cabData?.companyName || 'Cab'} - Last 4 digits: ${cabData?.vehicleDigits || 'N/A'}`,
                guestMessage: cabData?.serviceType || 'Pickup'  // Just the service type, no extra text
              });
            } else if (returnScreen === 'deliveryEntryScreen') {
              // Follow delivery entry pattern: Go directly to entry confirmation screen
              navigation.push("entryConfirmationScreen", {
                name: guestName,
                phoneNumber: phoneNumber,
                visiting: selectedFlatNo,
                hostName: getHostName(selectedFlatNo),
                insideTime: "2 hours", // Default for deliveries
                selectedTime: new Date().toISOString(),
                entryType: 'delivery',
                companyName: actualDeliveryCompany, // FIXED: Use the actual company name
                guestMessage: 'Package delivery' // Simple purpose, no extra text
              });
            } else if (returnScreen === 'serviceEntryScreen') {
              // Service entry should go to entryConfirmationScreen like all other entries
              navigation.push("entryConfirmationScreen", {
                name: guestName,
                phoneNumber: phoneNumber,
                visiting: selectedFlatNo,
                hostName: getHostName(selectedFlatNo),
                insideTime: "3 hours", // Service visits typically take longer
                selectedTime: new Date().toISOString(),
                entryType: 'service',      // Entry type for service
                guestDetails: actualServiceType, // Service type as guest details
                guestMessage: actualServiceType  // Service type as message
              });
            } else {
              // Default behavior - go to entry confirmation screen
              navigation.push("entryConfirmationScreen", {
                name: guestName,
                phoneNumber: phoneNumber, // FIXED: Use phoneNumber consistently
                visiting: selectedFlatNo,
                hostName: getHostName(selectedFlatNo),
                insideTime: "1 hour", // Default value
                selectedTime: new Date().toISOString() // Convert to serializable string
              });
            }
          }}
          raiseLevel={1}
          stretch={true}
          borderRadius={10}
          backgroundShadow={Colors.primary}
          backgroundDarker={Colors.primary}
          backgroundColor={Colors.primary}
        >
          <Text style={{ ...Fonts.SemiBold18white }}>{tr("continue")}</Text>
        </AwesomeButton>
        </View>
      )}
    </View>
  );
};

export default FlatNoTab;

const style = StyleSheet.create({
  flatNoTouchable: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Default.fixPadding * 1.3,
    marginBottom: Default.fixPadding * 2,
    marginHorizontal: Default.fixPadding * 2,
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
});
