import React from "react";
import { Text, View, Image, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Colors, Default, Fonts } from "../constants/styles";
import { useTranslation } from "react-i18next";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { ms } from "react-native-size-matters/extend";
import { useVisitorPasses } from "../hooks/useVisitorPasses";

const OutTab = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { passes, loading, error } = useVisitorPasses('checked_out');

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`outTab:${key}`);
  }

  // Map database passes to UI format
  const mapPassToUIFormat = (pass) => {
    // Calculate duration of visit
    const checkInTime = new Date(pass.actual_entry_time || pass.checked_in_at);
    const checkOutTime = new Date(pass.actual_exit_time || pass.checked_out_at);
    const diffHours = Math.floor((checkOutTime - checkInTime) / (1000 * 60 * 60));
    const diffMins = Math.floor(((checkOutTime - checkInTime) % (1000 * 60 * 60)) / (1000 * 60));
    
    let duration;
    if (diffHours > 0) {
      duration = `${diffHours}hr${diffMins > 0 ? ` ${diffMins}min` : ''}`;
    } else {
      duration = `${diffMins}min`;
    }

    return {
      key: pass.id,
      image: require("../assets/images/visitor1.png"), // Default image
      name: pass.visitor_name,
      block: pass.units ? `${pass.units.block}-${pass.units.number}` : `Unit ${pass.unit_id?.slice(-3) || 'N/A'}`,
      other1: pass.visitor_type?.charAt(0).toUpperCase() + pass.visitor_type?.slice(1) || 'Guest',
      other2: duration,
      phoneNumber: pass.visitor_phone || '+91 1234567890',
      // Enhanced data for detail screen
      hostName: pass.host_resident?.full_name || 'Unknown Host',
      hostPhone: pass.host_resident?.phone,
      flatNo: pass.units ? `${pass.units.block}-${pass.units.number}` : 'N/A',
      entryTime: pass.actual_entry_time ? new Date(pass.actual_entry_time).toLocaleTimeString() : 'N/A',
      exitTime: pass.actual_exit_time ? new Date(pass.actual_exit_time).toLocaleTimeString() : null,
      status: 'exited',
      vehicleNumber: pass.vehicle_number,
      company: pass.company_name,
      notes: pass.guard_notes,
      // Pass the original pass data for actions
      passId: pass.id,
      originalPass: pass
    };
  };

  const mappedPasses = passes?.map(mapPassToUIFormat) || [];

  const renderItem = ({ item }) => {
    const visitorPayload = {
      image: item.image,
      name: item.name,
      phoneNumber: item.phoneNumber,
      block: item.block,
      other1: item.other1,
      other2: item.other2,
      hostName: item.hostName,
      hostPhone: item.hostPhone,
      flatNo: item.flatNo,
      entryTime: item.entryTime,
      exitTime: item.exitTime,
      status: item.status,
      vehicleNumber: item.vehicleNumber,
      company: item.company,
      notes: item.notes,
      // Pass the original pass data for actions
      passId: item.originalPass?.id,
      originalPass: item.originalPass
    };
    
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('visitorDetailScreen', { visitor: visitorPayload })}
        style={{
          flexDirection: isRtl ? "row-reverse" : "row",
          ...styles.mainView,
        }}
      >
        <View
          style={{
            width: ms(75),
            height: ms(75),
            ...Default.shadow,
            backgroundColor: Colors.white,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 10,
          }}
        >
          <Image source={item.image} style={{ width: ms(55), height: ms(55), borderRadius: 50 }} />
        </View>
        <View style={{ flex: 1, marginLeft: Default.fixPadding }}>
          <Text style={{ ...Fonts.SemiBold18black }} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={{ ...Fonts.Medium14grey, marginVertical: Default.fixPadding * 0.3 }}>
            {item.block}
          </Text>
          <View style={{ flexDirection: isRtl ? "row-reverse" : "row", alignItems: "center" }}>
            <View style={{ flexDirection: isRtl ? "row-reverse" : "row", alignItems: "center", flex: 1 }}>
              <Text style={{ ...Fonts.Medium14grey }}>{item.other1}</Text>
              <View style={{ width: 5, height: 5, backgroundColor: Colors.grey, borderRadius: 5, marginHorizontal: Default.fixPadding * 0.5 }} />
              <Text style={{ ...Fonts.Medium14grey, flex: 1 }} numberOfLines={1}>
                {item.other2}
              </Text>
            </View>
            <MaterialIcons name="check-circle" size={20} color={Colors.grey} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={[Fonts.Medium14grey, { marginTop: Default.fixPadding }]}>Loading checked out visitors...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="error-outline" size={48} color={Colors.red} />
        <Text style={[Fonts.Medium14grey, { marginTop: Default.fixPadding, textAlign: 'center' }]}>
          {error}
        </Text>
      </View>
    );
  }

  if (mappedPasses.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="exit-to-app" size={48} color={Colors.grey} />
        <Text style={[Fonts.Medium14grey, { marginTop: Default.fixPadding }]}>No visitors have checked out today</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.extraLightGrey }}>
      <FlatList
        data={mappedPasses}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: Default.fixPadding * 2 }}
      />
    </View>
  );
};

export default OutTab;

const styles = StyleSheet.create({
  mainView: {
    padding: Default.fixPadding * 2,
    marginHorizontal: Default.fixPadding * 2,
    marginBottom: Default.fixPadding * 2,
    backgroundColor: Colors.white,
    borderRadius: 10,
    ...Default.shadow,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.extraLightGrey,
    paddingHorizontal: Default.fixPadding * 2,
  },
});
