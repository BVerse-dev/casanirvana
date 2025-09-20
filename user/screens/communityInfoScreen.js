import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MyStatusBar from "../components/myStatusBar";

const CommunityInfoScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() == "rtl";

  // Community information (will be fetched from admin dashboard)
  const [communityData, setCommunityData] = useState({
    name: "Ayi Mensah Park Community",
    address: "123 Ayi Mensah Street, Accra, Ghana",
    phone: "+233 24 123 4567",
    email: "info@ayimensahpark.com",
    website: "www.ayimensahpark.com",
    totalUnits: "150",
    establishedYear: "2018",
    description: "A modern residential community with world-class amenities and facilities for comfortable living.",
  });

  function tr(key) {
    return t(`communityInfoScreen:${key}`);
  }

  // TODO: Fetch community data from API/admin dashboard
  useEffect(() => {
    // fetchCommunityData();
  }, []);

  const renderInfoItem = (icon, label, value) => (
    <View style={styles.infoItem}>
      <View style={styles.infoHeader}>
        <MaterialCommunityIcons name={icon} size={24} color={Colors.primary} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.extraLightGrey }}>
      <MyStatusBar />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name={isRtl ? "arrow-forward-outline" : "arrow-back-outline"}
            size={25}
            color={Colors.black}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{tr("communityInfo")}</Text>
      </View>
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Community Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.communityImageContainer}>
            <Image
              source={require("../assets/images/community1.png")}
              style={styles.communityImage}
            />
          </View>
          <View style={styles.communityHeaderInfo}>
            <Text style={styles.communityName}>
              {communityData.name}
            </Text>
            <Text style={styles.establishedText}>
              {tr("establishedIn")} {communityData.establishedYear}
            </Text>
            <View style={styles.unitsContainer}>
              <MaterialCommunityIcons name="home-group" size={16} color={Colors.primary} />
              <Text style={styles.unitsText}>
                {communityData.totalUnits} {tr("units")}
              </Text>
            </View>
          </View>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{tr("basicInformation")}</Text>
          {renderInfoItem("home-city", tr("communityName"), communityData.name)}
          {renderInfoItem("map-marker", tr("address"), communityData.address)}
          {renderInfoItem("text-box-outline", tr("description"), communityData.description)}
          {renderInfoItem("calendar", tr("establishedYear"), communityData.establishedYear)}
          {renderInfoItem("home-group", tr("totalUnits"), communityData.totalUnits)}
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{tr("contactInformation")}</Text>
          {renderInfoItem("phone", tr("phoneNumber"), communityData.phone)}
          {renderInfoItem("email", tr("emailAddress"), communityData.email)}
          {renderInfoItem("web", tr("website"), communityData.website)}
        </View>

        {/* Amenities & Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{tr("amenitiesFeatures")}</Text>
          <View style={styles.amenitiesGrid}>
            {[
              { icon: "pool", name: tr("swimmingPool") },
              { icon: "dumbbell", name: tr("gymnasium") },
              { icon: "car", name: tr("parking") },
              { icon: "security", name: tr("security24x7") },
              { icon: "playground", name: tr("playground") },
              { icon: "wifi", name: tr("wifiInternet") },
            ].map((amenity, index) => (
              <View key={index} style={styles.amenityItem}>
                <MaterialCommunityIcons
                  name={amenity.icon}
                  size={24}
                  color={Colors.primary}
                />
                <Text style={styles.amenityText}>{amenity.name}</Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

export default CommunityInfoScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Default.fixPadding * 1.2,
    paddingHorizontal: Default.fixPadding * 2,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  headerTitle: {
    ...Fonts.SemiBold18black,
    marginHorizontal: Default.fixPadding,
  },
  scrollContent: {
    paddingVertical: Default.fixPadding * 2,
  },
  headerCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Default.fixPadding * 2,
    marginBottom: Default.fixPadding * 2,
    borderRadius: 15,
    padding: Default.fixPadding * 2,
    ...Default.shadow,
  },
  communityImageContainer: {
    alignItems: "center",
    marginBottom: Default.fixPadding * 1.5,
  },
  communityImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  communityHeaderInfo: {
    alignItems: "center",
  },
  communityName: {
    ...Fonts.SemiBold20primary,
    textAlign: "center",
    marginBottom: Default.fixPadding * 0.5,
  },
  establishedText: {
    ...Fonts.Medium14grey,
    marginBottom: Default.fixPadding * 0.5,
  },
  unitsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  unitsText: {
    ...Fonts.Medium14grey,
    marginLeft: Default.fixPadding * 0.5,
  },
  section: {
    backgroundColor: Colors.white,
    marginHorizontal: Default.fixPadding * 2,
    marginBottom: Default.fixPadding * 2,
    borderRadius: 15,
    padding: Default.fixPadding * 2,
    ...Default.shadow,
  },
  sectionTitle: {
    ...Fonts.SemiBold18primary,
    marginBottom: Default.fixPadding * 1.5,
  },
  infoItem: {
    marginBottom: Default.fixPadding * 1.5,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Default.fixPadding * 0.5,
  },
  infoLabel: {
    ...Fonts.SemiBold14black,
    marginLeft: Default.fixPadding,
  },
  infoValue: {
    ...Fonts.Medium14grey,
    lineHeight: 20,
    paddingLeft: Default.fixPadding * 2.5,
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  amenityItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.extraLightGrey,
    padding: Default.fixPadding,
    borderRadius: 8,
    marginBottom: Default.fixPadding,
  },
  amenityText: {
    ...Fonts.Medium12black,
    marginLeft: Default.fixPadding * 0.5,
    flex: 1,
  },
});
