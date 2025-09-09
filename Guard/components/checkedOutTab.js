import React from "react";
import { Text, View, Image, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Colors, Default, Fonts } from "../constants/styles";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { ms } from "react-native-size-matters/extend";
import { useVisitorPasses } from "../hooks/useVisitorPasses";

const CheckedOutTab = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { passes, loading, error, fetchPasses } = useVisitorPasses('checked_out');
  
  const isRtl = i18n.dir() == "rtl";

  // Refresh data when the tab comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchPasses();
    }, [fetchPasses])
  );  function tr(key) {
    return t(`checkedOutTab:${key}`);
  }

  // Map database passes to UI format
  const mapPassToUIFormat = (pass) => {
    // Calculate duration of visit (from entry to exit)
    const entryTime = new Date(pass.actual_entry_time || pass.checked_in_at);
    const exitTime = new Date(pass.actual_exit_time || pass.checked_out_at);
    const diffHours = Math.floor((exitTime - entryTime) / (1000 * 60 * 60));
    const diffMins = Math.floor(((exitTime - entryTime) % (1000 * 60 * 60)) / (1000 * 60));
    
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
      status: 'checked_out',
      vehicleNumber: pass.vehicle_number,
      company: pass.company_name,
      notes: pass.guard_notes,
      serviceType: pass.service_type,
      purpose: pass.purpose,
      // Pass through original data for detail screen
      originalPass: pass
    };
  };

  const mappedPasses = passes?.map(mapPassToUIFormat) || [];

  const renderItem = ({ item }) => {
    // Enhanced visitor payload with all the mapped data
    const visitorPayload = {
      image: item.image,
      name: item.name,
      phoneNumber: item.phoneNumber,
      block: item.block,
      other1: item.other1,
      other2: item.other2,
      hostName: item.hostName,
      flatNo: item.flatNo,
      entryTime: item.entryTime,
      exitTime: item.exitTime,
      status: item.status,
      vehicleNumber: item.vehicleNumber,
      company: item.company,
      notes: item.notes,
      serviceType: item.serviceType,
      purpose: item.purpose,
      // Pass the original pass data for actions
      passId: item.originalPass?.id,
      originalPass: item.originalPass,
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
            flex: 1,
            flexDirection: isRtl ? "row-reverse" : "row",
            alignItems: "center",
          }}
        >
          <View style={styles.imageView}>
            <Image
              source={item.image}
              style={{ width: 45, height: 45, resizeMode: "contain" }}
            />
          </View>

          <View
            style={{
              flex: 1,
              alignItems: isRtl ? "flex-end" : "flex-start",
              marginHorizontal: Default.fixPadding,
            }}
          >
            <Text
              numberOfLines={1}
              style={{ ...Fonts.SemiBold16black, overflow: "hidden" }}
            >
              {item.name}
            </Text>

            <Text
              numberOfLines={1}
              style={{ ...Fonts.Medium14grey, overflow: "hidden" }}
            >
              {`${tr("block")} ${item.block} | ${item.other1} | ${item.other2}`}
            </Text>
            <View
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                alignItems: "center",
              }}
            >
              <MaterialIcons name="call" size={15} color={Colors.lightBlue} />
              <Text
                numberOfLines={1}
                style={{
                  ...Fonts.Medium14black,
                  overflow: "hidden",
                  marginHorizontal: Default.fixPadding * 0.2,
                }}
              >
                {item.phoneNumber}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            alignItems: isRtl ? "flex-start" : "flex-end",
          }}
        >
          <View style={styles.outView}>
            <Text
              numberOfLines={1}
              style={{ ...Fonts.Medium14white, overflow: "hidden" }}
            >
              {tr("out")}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.green} />
          <Text style={{ ...Fonts.Medium16black, marginTop: Default.fixPadding }}>
            {tr("loading")}
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={{ ...Fonts.Medium16black, color: Colors.red }}>
            Error: {error.message}
          </Text>
        </View>
      ) : mappedPasses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ ...Fonts.Medium16black, textAlign: 'center' }}>
            No visitors have checked out today
          </Text>
        </View>
      ) : (
        <FlatList
          data={mappedPasses}
          renderItem={renderItem}
          keyExtractor={(item) => item.key}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: Default.fixPadding * 2 }}
        />
      )}
    </View>
  );
};

export default CheckedOutTab;

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    alignItems: "center",
    padding: Default.fixPadding * 0.8,
    marginBottom: Default.fixPadding * 2,
    marginHorizontal: Default.fixPadding * 2,
    borderRadius: 10,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  imageView: {
    justifyContent: "center",
    alignItems: "center",
    width: ms(58),
    height: ms(58),
    borderRadius: 5,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  outView: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Default.fixPadding * 0.7,
    paddingHorizontal: Default.fixPadding,
    width: ms(60),
    borderRadius: 5,
    backgroundColor: Colors.red,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Default.fixPadding * 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Default.fixPadding * 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Default.fixPadding * 2,
  },
});
