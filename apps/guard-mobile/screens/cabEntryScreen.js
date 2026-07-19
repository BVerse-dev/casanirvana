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

const { width, height } = Dimensions.get("window");

const CabEntryScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`cabEntryScreen:${key}`);
  }
  const backAction = () => {
    navigation.pop();
    return true;
  };
  useEffect(() => {
    const backSub = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backSub.remove();
  }, []);

  const [cabDriverName, setCabDriverName] = useState("");
  const [capDigit, setCabDigit] = useState("");
  const [refreshing, setRefreshing] = useState(false);

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

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

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
        <TouchableOpacity onPress={() => navigation.pop()}>
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
          {tr("cabEntry")}
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
              onChangeText={(value) =>
                setCabDigit(String(value || "").replace(/[^\d]/g, ""))
              }
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

        </View>
      </ScrollView>

      <View
        style={{
          margin: Default.fixPadding * 2,
        }}
      >
        <AwesomeButton
          height={50}
          onPress={async () => {
            const cleanedDriverName = String(cabDriverName || "").trim();
            const cleanedVehicleDigits = String(capDigit || "").replace(/[^\d]/g, "");

            if (!cleanedDriverName || cleanedVehicleDigits.length !== 4) {
              Alert.alert(
                tr("missingFields") || "Missing Fields",
                tr("fillAllFields") || "Please provide driver name and 4 vehicle digits"
              );
              return;
            }

            navigation.push("flatNoScreen", {
              headerTitle: tr("selectFlatUnit") || "Select flat unit",
              title: tr("cabDriverName"),
              placeholderTitle: tr("enterName"),
              image: require("../assets/images/visitor2.png"),
              returnScreen: 'cabEntryScreen',
              cabName: cleanedDriverName,
              cabData: {
                driverName: cleanedDriverName,
                companyName: confirmCompanyName || 'Uber',
                serviceType: confirmPickupDropoff || 'Pickup',
                vehicleDigits: cleanedVehicleDigits
              }
            });
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
            {tr("continue")}
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
