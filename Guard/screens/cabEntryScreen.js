import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  ScrollView,
  StyleSheet,
  TextInput,
  Image,
  RefreshControl,
  Modal,
  FlatList,
  Dimensions,
  Alert,
} from "react-native";
import MyStatusBar from "../components/myStatusBar";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { ms } from "react-native-size-matters/extend";
import AwesomeButton from "react-native-really-awesome-button";
import DateTimePicker from '@react-native-community/datetimepicker';

// LESSON LEARNED: Import all necessary services from the start
import { useCabEntries } from '../hooks/useCabEntries';
import { useGuardAuth } from '../contexts/GuardAuthContext';
import { validateAndGetUnitId, getUnitResident } from '../services/unitValidationService';

const { width, height } = Dimensions.get("window");

const CabEntryScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  
  // LESSON LEARNED: Always get authentication context first
  const { guard, user, isAuthenticated } = useGuardAuth();
  const { createCabEntry } = useCabEntries();

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`cabEntryScreen:${key}`);
  }
  const backAction = () => {
    if (selectedFlatNo) {
      // If in confirmation mode, go back to flat selection
      navigation.push("flatNoScreen", {
        headerTitle: tr("selectFlatUnit") || "Select flat unit",
        title: tr("cabDriverName"),
        placeholderTitle: tr("enterName"),
        image: require("../assets/images/visitor2.png"),
        returnScreen: 'cabEntryScreen',
        cabName: cabDriverName
      });
    } else {
      // If in normal mode, go back to previous screen
      navigation.pop();
    }
    return true;
  };
  useEffect(() => {
    const backSub = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backSub.remove();
  }, []);

  const [cabDriverName, setCabDriverName] = useState("");
  const [capDigit, setCabDigit] = useState("");
  const [companyName, setCompanyName] = useState("Uber");
  const [pickupDropUp, setPickupDropUp] = useState("Pickup");
  const [arrivalTime, setArrivalTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hostName, setHostName] = useState("");
  const [selectedFlatNo, setSelectedFlatNo] = useState("");
  const [cabDetails, setCabDetails] = useState("");
  const [cabMessage, setCabMessage] = useState("");
  
  // LESSON LEARNED: Add state for tracking cab entry ID and submission
  const [submitting, setSubmitting] = useState(false);
  const [unitId, setUnitId] = useState(null);
  const [cabEntryId, setCabEntryId] = useState(null);

  // Dropdown states
  const [companyNameModal, setCompanyNameModal] = useState(false);
  const [selectedCompanyName, setSelectedCompanyName] = useState("Uber");
  const [confirmCompanyName, setConfirmCompanyName] = useState("Uber");
  
  const [pickupDropoffModal, setPickupDropoffModal] = useState(false);
  const [selectedPickupDropoff, setSelectedPickupDropoff] = useState("Pickup");
  const [confirmPickupDropoff, setConfirmPickupDropoff] = useState("Pickup");

  // Company list (same as user app)
  const companyNameList = [
    { key: "1", name: "Uber" },
    { key: "2", name: "Bolt" },
    { key: "3", name: "Yango" },
    { key: "4", name: "Taxi/Bike" },
    { key: "5", name: "Other" },
  ];

  // Pickup/Dropoff list
  const pickupDropoffList = [
    { key: "1", name: "Pickup" },
    { key: "2", name: "Dropoff" },
    { key: "3", name: "Pickup & Dropoff" },
  ];

  // LESSON LEARNED: Replace hardcoded mapping with database lookup
  // Load host name from database for the selected flat
  const loadHostName = async (flatNumber) => {
    if (!flatNumber || !guard?.community_id) {
      setHostName("");
      setUnitId(null);
      return;
    }

    try {
      const unitInfo = await validateAndGetUnitId(flatNumber, guard.community_id);
      const resident = await getUnitResident(unitInfo.unitId);
      setHostName(resident ? resident.name : "Unknown Resident");
      setUnitId(unitInfo.unitId);
    } catch (err) {
      console.error('Error loading host name:', err);
      setHostName("Unknown Resident");
      setUnitId(null);
    }
  };

  // Handle navigation return from flat selection
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Check route params for selectedFlat
      const currentRoute = navigation.getState()?.routes?.find(route => route.name === 'cabEntryScreen');
      const params = currentRoute?.params;
      
      if (params?.selectedFlat) {
        setSelectedFlatNo(params.selectedFlat);
        loadHostName(params.selectedFlat); // LESSON: Use database lookup
        
        // Clear the params to prevent re-triggering
        navigation.setParams({ selectedFlat: undefined });
      }
    });
    return unsubscribe;
  }, [navigation]);

  // Also check route params on component mount
  useEffect(() => {
    if (route.params?.selectedFlat) {
      setSelectedFlatNo(route.params.selectedFlat);
      loadHostName(route.params.selectedFlat); // LESSON: Use database lookup
    }
  }, [route.params]);

  const onRefresh = () => {
    setRefreshing(true);
    // Reset form or reload data
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const showTimeSelector = () => {
    setShowTimePicker(true);
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setArrivalTime(selectedTime);
    }
  };

  const formatTime = (time) => {
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // LESSON LEARNED: Create comprehensive cab entry function with proper error handling
  // Render function for company dropdown
  const renderCompanyItem = ({ item }) => {
    const isSelected = selectedCompanyName === item.name;
    return (
      <TouchableOpacity
        onPress={() => setSelectedCompanyName(item.name)}
        style={{
          flex: 1,
          flexDirection: isRtl ? "row-reverse" : "row",
          alignItems: "center",
          marginTop: Default.fixPadding * 2.5,
          marginHorizontal: Default.fixPadding * 2.6,
        }}
      >
        <MaterialCommunityIcons
          name={isSelected ? "record-circle" : "circle-outline"}
          size={22}
          color={isSelected ? Colors.primary : Colors.grey}
        />
        <Text
          numberOfLines={1}
          style={{
            ...Fonts.Medium16black,
            overflow: "hidden",
            marginHorizontal: Default.fixPadding,
          }}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  // Render function for pickup/dropoff dropdown
  const renderPickupDropoffItem = ({ item }) => {
    const isSelected = selectedPickupDropoff === item.name;
    return (
      <TouchableOpacity
        onPress={() => setSelectedPickupDropoff(item.name)}
        style={{
          flex: 1,
          flexDirection: isRtl ? "row-reverse" : "row",
          alignItems: "center",
          marginTop: Default.fixPadding * 2.5,
          marginHorizontal: Default.fixPadding * 2.6,
        }}
      >
        <MaterialCommunityIcons
          name={isSelected ? "record-circle" : "circle-outline"}
          size={22}
          color={isSelected ? Colors.primary : Colors.grey}
        />
        <Text
          numberOfLines={1}
          style={{
            ...Fonts.Medium16black,
            overflow: "hidden",
            marginHorizontal: Default.fixPadding,
          }}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <MyStatusBar />
      <View
        style={{
          flexDirection: isRtl ? "row-reverse" : "row",
          alignItems: "center",
          paddingVertical: Default.fixPadding * 1.2,
          paddingHorizontal: Default.fixPadding * 2,
        }}
      >
        <TouchableOpacity onPress={() => {
          if (selectedFlatNo) {
            // If in confirmation mode, go back to flat selection
            navigation.push("flatNoScreen", {
              headerTitle: tr("selectFlatUnit") || "Select flat unit",
              title: tr("cabDriverName"),
              placeholderTitle: tr("enterName"),
              image: require("../assets/images/visitor2.png"),
              returnScreen: 'cabEntryScreen',
              cabName: cabDriverName
            });
          } else {
            // If in normal mode, go back to previous screen
            navigation.pop();
          }
        }}>
          <Ionicons
            name={isRtl ? "arrow-forward-outline" : "arrow-back-outline"}
            size={25}
            color={Colors.black}
          />
        </TouchableOpacity>
        <Text
          style={{
            ...Fonts.SemiBold18black,
            marginHorizontal: Default.fixPadding,
          }}
        >
          {selectedFlatNo ? (tr("entryConfirmation") || "Entry Confirmation") : tr("cabEntry")}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: Default.fixPadding * 2.8,
          }}
        >
          <Image
            source={require("../assets/images/visitor2.png")}
            style={{ width: ms(110), height: ms(110), resizeMode: "contain" }}
          />
        </View>

        <View
          style={{
            marginTop: Default.fixPadding * 6,
            marginHorizontal: Default.fixPadding * 2,
          }}
        >
          <Text
            style={{
              ...Fonts.Medium16grey,
              textAlign: isRtl ? "right" : "left",
            }}
          >
            {tr("cabDriverName")}
          </Text>

          <View
            style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              ...styles.textInputView,
            }}
          >
            <TextInput
              value={cabDriverName}
              onChangeText={setCabDriverName}
              placeholder={tr("enterName")}
              placeholderTextColor={Colors.grey}
              selectionColor={Colors.primary}
              style={{
                ...Fonts.SemiBold16black,
                flex: 1,
                textAlign: isRtl ? "right" : "left",
              }}
            />
          </View>

          <Text
            style={{
              ...Fonts.Medium16grey,
              textAlign: isRtl ? "right" : "left",
            }}
          >
            {tr("enterLast")}
          </Text>

          <View
            style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              ...styles.textInputView,
            }}
          >
            <TextInput
              maxLength={4}
              value={capDigit}
              onChangeText={setCabDigit}
              keyboardType="number-pad"
              placeholder={tr("enterLast")}
              placeholderTextColor={Colors.grey}
              selectionColor={Colors.primary}
              style={{
                ...Fonts.SemiBold16black,
                flex: 1,
                textAlign: isRtl ? "right" : "left",
              }}
            />
          </View>

          <Text
            style={{
              ...Fonts.Medium16grey,
              textAlign: isRtl ? "right" : "left",
            }}
          >
            {tr("cabCompany")}
          </Text>

          <TouchableOpacity
            onPress={() => setCompanyNameModal(true)}
            style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              ...styles.textInputView,
            }}
          >
            <Text
              style={{
                ...(confirmCompanyName
                  ? Fonts.SemiBold16black
                  : Fonts.Medium16grey),
                flex: 1,
                textAlign: isRtl ? "right" : "left",
              }}
            >
              {confirmCompanyName || tr("enterCabCompany")}
            </Text>

            <Ionicons
              name="chevron-down"
              size={18}
              color={Colors.black}
            />
          </TouchableOpacity>

          <Text
            style={{
              ...Fonts.Medium16grey,
              textAlign: isRtl ? "right" : "left",
            }}
          >
            {tr("pickup")}
          </Text>

          <TouchableOpacity
            onPress={() => setPickupDropoffModal(true)}
            style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              ...styles.textInputView,
            }}
          >
            <Text
              style={{
                ...(confirmPickupDropoff
                  ? Fonts.SemiBold16black
                  : Fonts.Medium16grey),
                flex: 1,
                textAlign: isRtl ? "right" : "left",
              }}
            >
              {confirmPickupDropoff || tr("pickup")}
            </Text>

            <Ionicons
              name="chevron-down"
              size={18}
              color={Colors.black}
            />
          </TouchableOpacity>

          <Text
            style={{
              ...Fonts.Medium16grey,
              textAlign: isRtl ? "right" : "left",
            }}
          >
            {tr("timeOfArrival") || "Time of arrival"}
          </Text>

          <TouchableOpacity
            onPress={showTimeSelector}
            style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              ...styles.textInputView,
            }}
          >
            <Text
              style={{
                ...Fonts.SemiBold16black,
                flex: 1,
                textAlign: isRtl ? "right" : "left",
              }}
            >
              {formatTime(arrivalTime)}
            </Text>

            <Ionicons
              name="time-outline"
              size={20}
              color={Colors.primary}
            />
          </TouchableOpacity>

          {selectedFlatNo ? (
            <View>
              <Text
                style={{
                  ...Fonts.Medium16grey,
                  textAlign: isRtl ? "right" : "left",
                }}
              >
                {tr("hostName") || "Host Name"}
              </Text>

              <View
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  marginBottom: Default.fixPadding * 2,
                  ...styles.textInputView,
                }}
              >
                <Text
                  style={{
                    ...Fonts.SemiBold16black,
                    flex: 1,
                    textAlign: isRtl ? "right" : "left",
                    marginRight: isRtl ? 0 : Default.fixPadding,
                    marginLeft: isRtl ? Default.fixPadding : 0,
                    paddingVertical: Default.fixPadding * 0.8,
                  }}
                >
                  {hostName}
                </Text>
              </View>
            </View>
          ) : null}

          {selectedFlatNo ? (
            <>
              <Text
                style={{
                  ...Fonts.Medium16grey,
                  textAlign: isRtl ? "right" : "left",
                }}
              >
                {tr("visiting") || "Visiting"}
              </Text>

              <View
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  ...styles.textInputView,
                }}
              >
                <Text
                  style={{
                    ...Fonts.SemiBold16black,
                    flex: 1,
                    textAlign: isRtl ? "right" : "left",
                  }}
                >
                  {selectedFlatNo}
                </Text>

                <Ionicons
                  name="home-outline"
                  size={20}
                  color={Colors.primary}
                />
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>

      {showTimePicker && (
        <DateTimePicker
          value={arrivalTime}
          mode="time"
          is24Hour={false}
          onChange={onTimeChange}
        />
      )}

      <View
        style={{
          margin: Default.fixPadding * 2,
        }}
      >
        <AwesomeButton
          height={50}
          onPress={async () => {
            if (selectedFlatNo) {
              // Follow guest entry pattern: Go directly to entry confirmation screen
              // NO visitor pass creation here - that happens only after "Allow" in ringing screen
              navigation.push("entryConfirmationScreen", {
                name: cabDriverName,
                phoneNumber: '', // Cab drivers usually don't provide phone
                visiting: selectedFlatNo,
                hostName,
                insideTime: "4 hours", // Default for cabs
                selectedTime: new Date().toISOString(),
                entryType: 'cab',
                guestDetails: `${confirmCompanyName || 'Uber'} - Last 4 digits: ${capDigit}`,
                guestMessage: confirmPickupDropoff || 'Pickup'  // Just the service type, no extra text
              });
            } else {
              // Navigate to flat selection
              navigation.push("flatNoScreen", {
                headerTitle: tr("selectFlatUnit") || "Select flat unit",
                title: tr("cabDriverName"),
                placeholderTitle: tr("enterName"),
                image: require("../assets/images/visitor2.png"),
                returnScreen: 'cabEntryScreen',
                cabName: cabDriverName,
                // Pass all cab-specific data for later use
                cabData: {
                  driverName: cabDriverName,
                  companyName: confirmCompanyName || 'Uber',
                  serviceType: confirmPickupDropoff || 'Pickup',
                  vehicleDigits: capDigit
                }
              });
            }
          }}
          disabled={submitting}
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
            {submitting 
              ? "Creating..." 
              : (selectedFlatNo ? (tr("confirmNotification") || "Confirm and send notification") : tr("continue"))
            }
          </Text>
        </AwesomeButton>
      </View>

      {/* Company Name Modal */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={companyNameModal}
        onRequestClose={() => setCompanyNameModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPressOut={() => setCompanyNameModal(false)}
          style={{ flex: 1 }}
        >
          <View style={styles.mainModalView}>
            <TouchableOpacity
              activeOpacity={1}
              style={{ maxHeight: height / 2, ...styles.subModalView }}
            >
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  padding: Default.fixPadding * 1.6,
                }}
              >
                <Text style={{ ...Fonts.Medium18primary }}>
                  {tr("cabCompany")}
                </Text>
              </View>
              <View
                style={{
                  height: 1,
                  backgroundColor: Colors.lightGrey,
                  marginHorizontal: Default.fixPadding * 2,
                }}
              />

              <FlatList
                data={companyNameList}
                renderItem={renderCompanyItem}
                keyExtractor={(item) => item.key}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingBottom: Default.fixPadding * 1.2,
                }}
              />

              <View
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  alignItems: "center",
                  paddingHorizontal: Default.fixPadding * 2.6,
                  marginTop: Default.fixPadding * 1.3,
                  marginBottom: Default.fixPadding * 2.2,
                }}
              >
                <TouchableOpacity
                  onPress={() => setCompanyNameModal(false)}
                  style={{
                    marginRight: isRtl ? 0 : Default.fixPadding * 1.5,
                    marginLeft: isRtl ? Default.fixPadding * 1.5 : 0,
                    backgroundColor: Colors.white,
                    ...styles.cancelOkBtn,
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={{ ...Fonts.SemiBold18black, overflow: "hidden" }}
                  >
                    {tr("cancel") || "Cancel"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setConfirmCompanyName(selectedCompanyName);
                    setCompanyNameModal(false);
                  }}
                  style={{
                    backgroundColor: Colors.primary,
                    ...styles.cancelOkBtn,
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={{ ...Fonts.SemiBold18white, overflow: "hidden" }}
                  >
                    {tr("okay") || "Okay"}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Pickup/Dropoff Modal */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={pickupDropoffModal}
        onRequestClose={() => setPickupDropoffModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPressOut={() => setPickupDropoffModal(false)}
          style={{ flex: 1 }}
        >
          <View style={styles.mainModalView}>
            <TouchableOpacity
              activeOpacity={1}
              style={{ maxHeight: height / 2, ...styles.subModalView }}
            >
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  padding: Default.fixPadding * 1.6,
                }}
              >
                <Text style={{ ...Fonts.Medium18primary }}>
                  {tr("pickup")}
                </Text>
              </View>
              <View
                style={{
                  height: 1,
                  backgroundColor: Colors.lightGrey,
                  marginHorizontal: Default.fixPadding * 2,
                }}
              />

              <FlatList
                data={pickupDropoffList}
                renderItem={renderPickupDropoffItem}
                keyExtractor={(item) => item.key}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingBottom: Default.fixPadding * 1.2,
                }}
              />

              <View
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  alignItems: "center",
                  paddingHorizontal: Default.fixPadding * 2.6,
                  marginTop: Default.fixPadding * 1.3,
                  marginBottom: Default.fixPadding * 2.2,
                }}
              >
                <TouchableOpacity
                  onPress={() => setPickupDropoffModal(false)}
                  style={{
                    marginRight: isRtl ? 0 : Default.fixPadding * 1.5,
                    marginLeft: isRtl ? Default.fixPadding * 1.5 : 0,
                    backgroundColor: Colors.white,
                    ...styles.cancelOkBtn,
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={{ ...Fonts.SemiBold18black, overflow: "hidden" }}
                  >
                    {tr("cancel") || "Cancel"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setConfirmPickupDropoff(selectedPickupDropoff);
                    setPickupDropoffModal(false);
                  }}
                  style={{
                    backgroundColor: Colors.primary,
                    ...styles.cancelOkBtn,
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={{ ...Fonts.SemiBold18white, overflow: "hidden" }}
                  >
                    {tr("okay") || "Okay"}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default CabEntryScreen;

const styles = StyleSheet.create({
  textInputView: {
    alignItems: "center",
    paddingHorizontal: Default.fixPadding,
    paddingVertical: Default.fixPadding * 1.2,
    marginTop: Default.fixPadding,
    marginBottom: Default.fixPadding * 2,
    borderRadius: 10,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  mainModalView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.transparentBlack,
  },
  subModalView: {
    width: width * 0.9,
    borderRadius: 10,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  cancelOkBtn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Default.fixPadding * 1.4,
    borderRadius: 10,
    ...Default.shadow,
  },
});
