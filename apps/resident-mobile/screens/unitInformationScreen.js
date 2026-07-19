import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MyStatusBar from "../components/myStatusBar";
import { useHasJoinedCommunity } from "../hooks/useCommunityData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../utils/supabase";

const UnitInformationScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { profile, isLoading: profileLoading } = useHasJoinedCommunity();
  
  const isRtl = i18n.dir() == "rtl";

  // Safe translation function
  function tr(key, fallback = "Missing Translation") {
    try {
      const translation = t(`unitInformationScreen:${key}`);
      return (translation && typeof translation === 'string' && translation.trim() !== '') 
        ? translation 
        : fallback;
    } catch (error) {
      return fallback;
    }
  }

  const hasValue = (value) => value !== null && value !== undefined && value !== "";

  const normalizeSectionChildren = (children) =>
    React.Children.toArray(children).filter((child) => {
      if (typeof child === "string") {
        return child.trim().length > 0;
      }
      return true;
    });

  // Fetch detailed unit information
  const { data: unitData, isLoading: unitLoading, error: unitError } = useQuery({
    queryKey: ['unitInformation', profile?.unit_id],
    queryFn: async () => {
      if (!profile?.unit_id) {
        throw new Error('No unit ID found');
      }

      console.log('🏠 Fetching unit information for:', profile.unit_id);

      // First get the basic unit information
      const { data: unitBasicData, error: unitError } = await supabase
        .from('units')
        .select(`
          *,
          community:communities!units_community_id_fkey(id, name, address, city, state)
        `)
        .eq('id', profile.unit_id)
        .single();

      if (unitError) {
        console.error('❌ Error fetching basic unit information:', unitError);
        throw unitError;
      }

      // Get owner information if owner_id exists
      let ownerData = null;
      if (unitBasicData.owner_id) {
        const { data: owner, error: ownerError } = await supabase
          .from('users')
          .select('id, first_name, last_name, email, phone')
          .eq('id', unitBasicData.owner_id)
          .single();
        
        if (!ownerError && owner) {
          ownerData = owner;
        }
      }

      // Get tenant information if tenant_id exists
      let tenantData = null;
      if (unitBasicData.tenant_id) {
        const { data: tenant, error: tenantError } = await supabase
          .from('users')
          .select('id, first_name, last_name, email, phone')
          .eq('id', unitBasicData.tenant_id)
          .single();
        
        if (!tenantError && tenant) {
          tenantData = tenant;
        }
      }

      // Combine all data
      const data = {
        ...unitBasicData,
        owner: ownerData,
        tenant: tenantData
      };

      console.log('✅ Unit information fetched:', data);
      return data;
    },
    enabled: !!profile?.unit_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const renderInfoSection = (title, icon, children) => (
    <View style={styles.infoSection}>
      <View style={styles.sectionHeader}>
        {hasValue(icon) && (
          <MaterialCommunityIcons name={icon} size={24} color={Colors.primary} />
        )}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionContent}>
        {normalizeSectionChildren(children).map((child, index) =>
          typeof child === "string" || typeof child === "number" ? (
            <Text key={`section-child-${index}`} style={styles.sectionInlineText}>
              {String(child)}
            </Text>
          ) : (
            child
          )
        )}
      </View>
    </View>
  );

  const renderInfoItem = (label, value, icon = null) => (
    <View style={styles.infoItem}>
      <View style={styles.infoItemLeft}>
        {hasValue(icon) && (
          <MaterialCommunityIcons 
            name={icon} 
            size={20} 
            color={Colors.grey} 
            style={styles.infoItemIcon}
          />
        )}
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value || 'Not specified'}</Text>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.loadingText}>{tr("loadingUnitInfo", "Loading unit information...")}</Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <MaterialCommunityIcons name="alert-circle" size={48} color={Colors.red} />
      <Text style={styles.errorTitle}>{tr("errorTitle", "Unable to Load Unit Information")}</Text>
      <Text style={styles.errorMessage}>
        {unitError?.message || tr("errorMessage", "There was an error loading your unit information. Please try again later.")}
      </Text>
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={() => {
          // Retry by navigating back and forth to refresh the screen
          navigation.goBack();
          setTimeout(() => navigation.navigate('unitInformationScreen'), 100);
        }}
      >
        <Text style={styles.retryButtonText}>{tr("retry", "Retry")}</Text>
      </TouchableOpacity>
    </View>
  );

  const isLoading = profileLoading || unitLoading;

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.extraLightGrey }}>
        <MyStatusBar />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons
              name={isRtl ? "arrow-forward-outline" : "arrow-back-outline"}
              size={25}
              color={Colors.black}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{tr("unitInformation", "Unit Information")}</Text>
        </View>
        {renderLoadingState()}
      </View>
    );
  }

  if (unitError || !unitData) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.extraLightGrey }}>
        <MyStatusBar />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons
              name={isRtl ? "arrow-forward-outline" : "arrow-back-outline"}
              size={25}
              color={Colors.black}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{tr("unitInformation", "Unit Information")}</Text>
        </View>
        {renderErrorState()}
      </View>
    );
  }

  const community = unitData.community?.[0] || unitData.community;
  const owner = unitData.owner; // Now a direct object, not an array
  const tenant = unitData.tenant; // Now a direct object, not an array

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
        <Text style={styles.headerTitle}>{tr("unitInformation", "Unit Information")}</Text>
      </View>
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Unit Overview */}
        <View style={styles.unitOverview}>
          <View style={styles.unitHeader}>
            <MaterialCommunityIcons name="home" size={32} color={Colors.primary} />
            <View style={styles.unitHeaderText}>
              <Text style={styles.unitNumber}>
                {unitData.block}-{unitData.number}
              </Text>
              <Text style={styles.unitCommunity}>
                {community?.name || tr("unknownCommunity", "Unknown Community")}
              </Text>
            </View>
          </View>
          <View style={styles.statusBadge}>
            <Text style={[
              styles.statusText,
              { color: unitData.status === 'occupied' ? Colors.green : Colors.orange }
            ]}>
              {unitData.status?.toUpperCase() || 'UNKNOWN'}
            </Text>
          </View>
        </View>

        {/* Basic Information */}
        {renderInfoSection(tr("basicInfo", "Basic Information"), "information", (
          <>
            {renderInfoItem(tr("unitType", "Unit Type"), unitData.unit_type, "floor-plan")}
            {renderInfoItem(tr("floor", "Floor"), unitData.floor?.toString(), "stairs")}
            {renderInfoItem(tr("block", "Block"), unitData.block, "domain")}
            {renderInfoItem(tr("unitNumber", "Unit Number"), unitData.number, "numeric")}
            {renderInfoItem(tr("status", "Status"), unitData.status ? unitData.status.charAt(0).toUpperCase() + unitData.status.slice(1) : 'Unknown', "check-circle")}
          </>
        ))}

        {/* Property Details */}
        {renderInfoSection(tr("propertyDetails", "Property Details"), "home-variant", (
          <>
            {renderInfoItem(tr("bedrooms", "Bedrooms"), unitData.bedrooms?.toString(), "bed")}
            {renderInfoItem(tr("bathrooms", "Bathrooms"), (unitData.bathrooms || unitData.bathroom_count)?.toString(), "shower")}
            {renderInfoItem(tr("balconies", "Balconies"), unitData.balcony_count?.toString(), "balcony")}
            {renderInfoItem(tr("area", "Area (sq ft)"), unitData.area_sqft?.toString() || unitData.area?.toString(), "ruler-square")}
            {renderInfoItem(tr("floorArea", "Floor Area"), unitData.floor_area?.toString(), "floor-plan")}
            {renderInfoItem(tr("furnished", "Furnished"), unitData.is_furnished ? tr("yes", "Yes") : tr("no", "No"), "sofa")}
            {renderInfoItem(tr("parkingSlot", "Parking Slot"), unitData.parking_slot, "car")}
          </>
        ))}

        {/* Financial Information */}
        {renderInfoSection(tr("financialInfo", "Financial Information"), "currency-usd", (
          <>
            {renderInfoItem(tr("rentAmount", "Rent Amount"), unitData.rent_amount ? `₹${parseFloat(unitData.rent_amount).toLocaleString()}` : tr("notApplicable", "N/A"), "cash")}
            {renderInfoItem(tr("maintenanceAmount", "Maintenance Amount"), unitData.maintenance_amount ? `₹${parseFloat(unitData.maintenance_amount).toLocaleString()}` : tr("notApplicable", "N/A"), "wrench")}
          </>
        ))}

        {/* Owner Information */}
        {hasValue(owner) && renderInfoSection(tr("ownerInfo", "Owner Information"), "account", (
          <>
            {renderInfoItem(tr("ownerName", "Owner Name"), `${owner.first_name || ''} ${owner.last_name || ''}`.trim(), "account")}
            {renderInfoItem(tr("ownerEmail", "Email"), owner.email, "email")}
            {renderInfoItem(tr("ownerPhone", "Phone"), owner.phone, "phone")}
          </>
        ))}

        {/* Tenant Information */}
        {hasValue(tenant) && renderInfoSection(tr("tenantInfo", "Tenant Information"), "account-group", (
          <>
            {renderInfoItem(tr("tenantName", "Tenant Name"), `${tenant.first_name || ''} ${tenant.last_name || ''}`.trim(), "account")}
            {renderInfoItem(tr("tenantEmail", "Email"), tenant.email, "email")}
            {renderInfoItem(tr("tenantPhone", "Phone"), tenant.phone, "phone")}
          </>
        ))}

        {/* Amenities */}
        {Array.isArray(unitData.amenities) && unitData.amenities.length > 0 &&
          renderInfoSection(tr("amenities", "Unit Amenities"), "star", (
            <View style={styles.amenitiesList}>
              {unitData.amenities.map((amenity, index) => (
                <View key={index} style={styles.amenityItem}>
                  <MaterialCommunityIcons name="check-circle" size={16} color={Colors.green} />
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          ))
        }

        {/* Community Information */}
        {hasValue(community) && renderInfoSection(tr("communityInfo", "Community Information"), "city", (
          <>
            {renderInfoItem(tr("communityName", "Community Name"), community.name, "home-city")}
            {renderInfoItem(tr("address", "Address"), community.address, "map-marker")}
            {renderInfoItem(tr("city", "City"), community.city, "city")}
            {renderInfoItem(tr("state", "State"), community.state, "map")}
          </>
        ))}

        {/* Additional Information */}
        {renderInfoSection(tr("additionalInfo", "Additional Information"), "information-outline", (
          <>
            {renderInfoItem(tr("createdAt", "Created"), unitData.created_at ? new Date(unitData.created_at).toLocaleDateString() : tr("unknown", "Unknown"), "calendar")}
            {renderInfoItem(tr("lastUpdated", "Last Updated"), unitData.updated_at ? new Date(unitData.updated_at).toLocaleDateString() : tr("unknown", "Unknown"), "update")}
          </>
        ))}
      </ScrollView>
    </View>
  );
};

export default UnitInformationScreen;

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
    flex: 1,
  },
  scrollContent: {
    paddingVertical: Default.fixPadding * 2,
    paddingBottom: Default.fixPadding * 4,
  },
  
  // Unit Overview Styles
  unitOverview: {
    backgroundColor: Colors.white,
    marginHorizontal: Default.fixPadding * 2,
    marginBottom: Default.fixPadding * 2,
    borderRadius: 16,
    padding: Default.fixPadding * 2,
    ...Default.shadow,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  unitHeader: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  unitHeaderText: {
    marginLeft: Default.fixPadding * 1.5,
    flex: 1,
  },
  unitNumber: {
    ...Fonts.SemiBold20primary,
    marginBottom: Default.fixPadding * 0.3,
  },
  unitCommunity: {
    ...Fonts.Medium14grey,
  },
  statusBadge: {
    backgroundColor: Colors.extraLightGrey,
    paddingHorizontal: Default.fixPadding * 1.2,
    paddingVertical: Default.fixPadding * 0.6,
    borderRadius: 20,
  },
  statusText: {
    ...Fonts.SemiBold12primary,
    fontWeight: "600",
  },

  // Info Section Styles
  infoSection: {
    backgroundColor: Colors.white,
    marginHorizontal: Default.fixPadding * 2,
    marginBottom: Default.fixPadding * 1.5,
    borderRadius: 12,
    overflow: "hidden",
    ...Default.shadow,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: Default.fixPadding * 1.5,
    backgroundColor: Colors.extraLightGrey,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGrey,
  },
  sectionTitle: {
    ...Fonts.SemiBold16black,
    marginLeft: Default.fixPadding,
    flex: 1,
  },
  sectionContent: {
    padding: Default.fixPadding * 1.5,
  },
  sectionInlineText: {
    ...Fonts.Medium14black,
    paddingVertical: Default.fixPadding * 0.4,
  },

  // Info Item Styles
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Default.fixPadding * 0.8,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.extraLightGrey,
  },
  infoItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  infoItemIcon: {
    marginRight: Default.fixPadding,
  },
  infoLabel: {
    ...Fonts.Medium14black,
    flex: 1,
  },
  infoValue: {
    ...Fonts.SemiBold14primary,
    textAlign: "right",
    maxWidth: "50%",
  },

  // Amenities Styles
  amenitiesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: Default.fixPadding * 0.5,
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.extraLightGrey,
    paddingHorizontal: Default.fixPadding,
    paddingVertical: Default.fixPadding * 0.5,
    borderRadius: 20,
    marginRight: Default.fixPadding,
    marginBottom: Default.fixPadding * 0.5,
  },
  amenityText: {
    ...Fonts.Medium12black,
    marginLeft: Default.fixPadding * 0.5,
  },

  // Loading State Styles
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Default.fixPadding * 4,
  },
  loadingText: {
    ...Fonts.Medium14grey,
    marginTop: Default.fixPadding * 1.5,
    textAlign: "center",
  },

  // Error State Styles
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Default.fixPadding * 3,
    paddingVertical: Default.fixPadding * 4,
  },
  errorTitle: {
    ...Fonts.SemiBold18black,
    textAlign: "center",
    marginTop: Default.fixPadding * 2,
    marginBottom: Default.fixPadding,
  },
  errorMessage: {
    ...Fonts.Medium14grey,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Default.fixPadding * 2,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 1.2,
    borderRadius: 8,
    ...Default.shadow,
  },
  retryButtonText: {
    ...Fonts.SemiBold14white,
  },
});
