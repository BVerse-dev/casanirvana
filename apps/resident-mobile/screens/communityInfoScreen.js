import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MyStatusBar from "../components/myStatusBar";
import { useQuery } from "@tanstack/react-query";
import { useUserProfile } from "../hooks/useCommunityData";
import { supabase } from "../utils/supabase";

const resolveAmenityIcon = (amenity) => {
  const content = `${amenity?.name || ""} ${amenity?.type || ""} ${amenity?.category || ""}`
    .toLowerCase()
    .trim();

  if (content.includes("pool")) return "pool";
  if (content.includes("gym") || content.includes("fitness")) return "dumbbell";
  if (content.includes("park") || content.includes("parking")) return "car";
  if (content.includes("security")) return "security";
  if (content.includes("play")) return "playground";
  if (content.includes("wifi") || content.includes("internet")) return "wifi";
  if (content.includes("club")) return "account-group";
  if (content.includes("court")) return "tennis";
  if (content.includes("hall")) return "home-city";
  return "star-circle";
};

const CommunityInfoScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  const { data: userProfile, isLoading: profileLoading } = useUserProfile();
  const community = userProfile?.community;
  const communityId = userProfile?.community_id;

  const { data: communityDetails, isLoading: communityLoading } = useQuery({
    queryKey: ["community-details", communityId],
    queryFn: async () => {
      if (!communityId) return null;

      const { data, error } = await supabase
        .from("communities")
        .select(
          "id, name, address, city, state, description, email, phone, website, established_year, total_units"
        )
        .eq("id", communityId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data;
    },
    enabled: !!communityId,
    staleTime: 2 * 60 * 1000,
  });

  const { data: communityConfig, isLoading: configLoading } = useQuery({
    queryKey: ["community-config", communityId],
    queryFn: async () => {
      if (!communityId) return null;

      const { data, error } = await supabase
        .from("community_configurations")
        .select(
          "welcome_message, amenity_module_enabled, messaging_module_enabled, visitor_module_enabled, emergency_alert_enabled, emergency_broadcast_enabled, cctv_integration, access_control_integration, panic_button_enabled, online_payments_enabled"
        )
        .eq("community_id", communityId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data;
    },
    enabled: !!communityId,
    staleTime: 2 * 60 * 1000,
  });

  const { data: amenities = [], isLoading: amenitiesLoading } = useQuery({
    queryKey: ["community-amenities", communityId],
    queryFn: async () => {
      if (!communityId) return [];

      const { data, error } = await supabase
        .from("amenities")
        .select("id, name, type, category, is_active")
        .eq("community_id", communityId)
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    },
    enabled: !!communityId,
    staleTime: 2 * 60 * 1000,
  });

  const { data: totalUnits = 0, isLoading: unitsLoading } = useQuery({
    queryKey: ["community-unit-count", communityId],
    queryFn: async () => {
      if (!communityId) return 0;

      const { count, error } = await supabase
        .from("units")
        .select("id", { count: "exact", head: true })
        .eq("community_id", communityId);

      if (error) {
        throw error;
      }

      return count || 0;
    },
    enabled: !!communityId,
    staleTime: 2 * 60 * 1000,
  });

  const communityData = useMemo(() => {
    const source = communityDetails || community;
    const cityState = [source?.city, source?.state].filter(Boolean).join(", ");
    const resolvedTotalUnits =
      source?.total_units != null && source?.total_units !== ""
        ? String(source.total_units)
        : String(totalUnits);

    return {
      name: source?.name || "Community",
      address: source?.address || cityState || "Not available",
      phone: source?.phone || "Not available",
      email: source?.email || "Not available",
      website: source?.website || "Not available",
      totalUnits: resolvedTotalUnits,
      establishedYear: source?.established_year || "N/A",
      description:
        source?.description ||
        communityConfig?.welcome_message ||
        "Community information managed by admin.",
    };
  }, [community, communityConfig?.welcome_message, communityDetails, totalUnits]);

  const amenityItems = useMemo(() => {
    const fromAmenitiesTable = (amenities || []).map((amenity) => ({
      id: amenity.id,
      icon: resolveAmenityIcon(amenity),
      name: amenity.name,
    }));

    const featureItems = [
      {
        id: "feature-amenities",
        enabled: communityConfig?.amenity_module_enabled,
        icon: "home-city",
        name: "Amenity Booking",
      },
      {
        id: "feature-messaging",
        enabled: communityConfig?.messaging_module_enabled,
        icon: "chat",
        name: "Community Messaging",
      },
      {
        id: "feature-visitors",
        enabled: communityConfig?.visitor_module_enabled,
        icon: "account-group",
        name: "Visitor Management",
      },
      {
        id: "feature-emergency",
        enabled:
          communityConfig?.emergency_alert_enabled ||
          communityConfig?.emergency_broadcast_enabled,
        icon: "alert-circle",
        name: "Emergency Alerts",
      },
      {
        id: "feature-cctv",
        enabled: communityConfig?.cctv_integration,
        icon: "cctv",
        name: "CCTV Integration",
      },
      {
        id: "feature-access-control",
        enabled: communityConfig?.access_control_integration,
        icon: "lock-outline",
        name: "Access Control",
      },
      {
        id: "feature-panic-button",
        enabled: communityConfig?.panic_button_enabled,
        icon: "alarm-light",
        name: "Panic Button",
      },
      {
        id: "feature-online-payments",
        enabled: communityConfig?.online_payments_enabled,
        icon: "credit-card",
        name: "Online Payments",
      },
    ]
      .filter((item) => item.enabled)
      .map((item) => ({ id: item.id, icon: item.icon, name: item.name }));

    return [...fromAmenitiesTable, ...featureItems].slice(0, 8);
  }, [amenities, communityConfig]);

  function tr(key) {
    return t(`communityInfoScreen:${key}`);
  }

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
      
      {(profileLoading || unitsLoading || communityLoading || configLoading || amenitiesLoading) ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading community information...</Text>
        </View>
      ) : (
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
            {amenityItems.length > 0 ? (
              amenityItems.map((amenity) => (
                <View key={amenity.id} style={styles.amenityItem}>
                  <MaterialCommunityIcons
                    name={amenity.icon}
                    size={24}
                    color={Colors.primary}
                  />
                  <Text style={styles.amenityText}>{amenity.name}</Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyAmenitiesContainer}>
                <MaterialCommunityIcons
                  name="information-outline"
                  size={24}
                  color={Colors.grey}
                />
                <Text style={styles.emptyAmenitiesText}>
                  No amenities have been configured yet.
                </Text>
              </View>
            )}
          </View>
        </View>

      </ScrollView>
      )}
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
  emptyAmenitiesContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.extraLightGrey,
    borderRadius: 8,
    padding: Default.fixPadding,
  },
  emptyAmenitiesText: {
    ...Fonts.Medium12grey,
    marginTop: Default.fixPadding * 0.4,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...Fonts.Medium14grey,
    marginTop: Default.fixPadding,
  },
});
