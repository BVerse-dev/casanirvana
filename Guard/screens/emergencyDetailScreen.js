import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Colors, Default, Fonts } from "../constants/styles";
import MyStatusBar from "../components/myStatusBar";

const EmergencyDetailScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  function tr(key) {
    return t(`emergencyDetailScreen:${key}`);
  }

  const alert = route?.params?.alert || {};
  const { id, type, title, description, time, priority, status, location, reporter, contact, incidentId } = alert;

  const getPriorityColor = (p) => {
    switch (p) {
      case "critical": return Colors.red;
      case "high": return Colors.orange || Colors.red;
      case "medium": return Colors.primary;
      default: return Colors.grey;
    }
  };

  const getStatusColor = (s) => {
    switch (s) {
      case "active": return Colors.red;
      case "investigating": return Colors.primary;
      case "resolved": return Colors.green;
      default: return Colors.grey;
    }
  };

  const getIcon = (t) => {
    switch (t) {
      case "fire": return "flame";
      case "medical": return "medical";
      case "security": return "shield-checkmark";
      default: return "warning";
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.lightGrey }}>
      <MyStatusBar />

      {/* Header */}
      <View style={{ flexDirection: isRtl ? "row-reverse" : "row", alignItems: "center", paddingVertical: Default.fixPadding * 1.2, paddingHorizontal: Default.fixPadding * 2, backgroundColor: Colors.white }}>
        <TouchableOpacity onPress={() => navigation.pop()}>
          <Ionicons name={isRtl ? "arrow-forward-outline" : "arrow-back-outline"} size={25} color={Colors.black} />
        </TouchableOpacity>
        <Text style={{ ...Fonts.SemiBold18black, marginHorizontal: Default.fixPadding, flex: 1 }} numberOfLines={1}>{tr("title")}</Text>
        <View style={{ flexDirection: isRtl ? "row-reverse" : "row", alignItems: "center" }}>
          <View style={[styles.chip, { backgroundColor: getPriorityColor(priority) }]}>
            <Text style={[Fonts.Medium12grey, { color: Colors.white, textTransform: 'capitalize' }]}>{priority || '-'}</Text>
          </View>
          <View style={{ width: Default.fixPadding * 0.8 }} />
          <View style={[styles.chip, { backgroundColor: getStatusColor(status) }]}>
            <Text style={[Fonts.Medium12grey, { color: Colors.white, textTransform: 'capitalize' }]}>{status || '-'}</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <View style={styles.card}>
          <View style={{ flexDirection: isRtl ? "row-reverse" : "row", alignItems: 'center' }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: getPriorityColor(priority), justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name={getIcon(type)} size={24} color={Colors.white} />
            </View>
            <View style={{ flex: 1, marginHorizontal: Default.fixPadding }}>
              <Text style={Fonts.SemiBold16black} numberOfLines={1}>{title || tr('unknown')}</Text>
              <Text style={[Fonts.Medium14grey, { marginTop: Default.fixPadding * 0.3 }]} numberOfLines={2}>{description || tr('no_description')}</Text>
            </View>
          </View>
        </View>

        {/* Details Card */}
        <View style={styles.card}>
          <Text style={Fonts.SemiBold16black}>{tr('details')}</Text>
          <View style={{ height: Default.fixPadding }} />
          <View style={{ flexDirection: isRtl ? 'row-reverse' : 'row', marginBottom: Default.fixPadding * 0.9, alignItems: 'center' }}>
            <View style={styles.detailIconBox}>
              <MaterialCommunityIcons name="map-marker-outline" size={18} color={Colors.primary} />
            </View>
            <Text style={[Fonts.Medium14grey, { marginHorizontal: Default.fixPadding * 0.8 }]}>{tr('location')}</Text>
            <Text style={[Fonts.Medium14black, { flex: 1, textAlign: isRtl ? 'right' : 'left' }]} numberOfLines={2}>{location || '-'}</Text>
          </View>
          <View style={{ flexDirection: isRtl ? 'row-reverse' : 'row', marginBottom: Default.fixPadding * 0.9, alignItems: 'center' }}>
            <View style={styles.detailIconBox}>
              <MaterialCommunityIcons name="account-badge-outline" size={18} color={Colors.primary} />
            </View>
            <Text style={[Fonts.Medium14grey, { marginHorizontal: Default.fixPadding * 0.8 }]}>{tr('reporter')}</Text>
            <Text style={[Fonts.Medium14black, { flex: 1, textAlign: isRtl ? 'right' : 'left' }]} numberOfLines={2}>{reporter || '-'}</Text>
          </View>
          <View style={{ flexDirection: isRtl ? 'row-reverse' : 'row', marginBottom: Default.fixPadding * 0.9, alignItems: 'center' }}>
            <View style={styles.detailIconBox}>
              <MaterialCommunityIcons name="clock-time-three-outline" size={18} color={Colors.primary} />
            </View>
            <Text style={[Fonts.Medium14grey, { marginHorizontal: Default.fixPadding * 0.8 }]}>{tr('reported')}</Text>
            <Text style={[Fonts.Medium14black, { flex: 1, textAlign: isRtl ? 'right' : 'left' }]} numberOfLines={1}>{time || '-'}</Text>
          </View>
          <View style={{ flexDirection: isRtl ? 'row-reverse' : 'row', marginBottom: Default.fixPadding * 0.9, alignItems: 'center' }}>
            <View style={styles.detailIconBox}>
              <MaterialCommunityIcons name="identifier" size={18} color={Colors.primary} />
            </View>
            <Text style={[Fonts.Medium14grey, { marginHorizontal: Default.fixPadding * 0.8 }]}>{tr('incident_id')}</Text>
            <Text style={[Fonts.Medium14black, { flex: 1, textAlign: isRtl ? 'right' : 'left' }]} numberOfLines={1}>{incidentId || id || '-'}</Text>
          </View>
          {contact ? (
            <View style={{ flexDirection: isRtl ? 'row-reverse' : 'row', marginBottom: Default.fixPadding * 0.9, alignItems: 'center' }}>
              <View style={styles.detailIconBox}>
                <MaterialCommunityIcons name="phone-outline" size={18} color={Colors.primary} />
              </View>
              <Text style={[Fonts.Medium14grey, { marginHorizontal: Default.fixPadding * 0.8 }]}>{tr('contact')}</Text>
              <Text style={[Fonts.Medium14black, { flex: 1, textAlign: isRtl ? 'right' : 'left' }]} numberOfLines={1}>{contact}</Text>
            </View>
          ) : null}
        </View>

        {/* Actions */}
        <View style={[styles.card, { paddingVertical: Default.fixPadding * 1.2 }]}>
          <View style={{ flexDirection: 'column' }}>
            <TouchableOpacity style={[styles.actionBtn, { borderColor: Colors.blue, marginBottom: Default.fixPadding }]} onPress={() => { /* TODO: contact admin */ }}>
              <MaterialCommunityIcons name="account-cog-outline" size={18} color={Colors.blue} />
              <Text style={[Fonts.SemiBold16black, { fontSize: 14, color: Colors.blue, marginLeft: Default.fixPadding * 0.5 }]}>{tr('contact_admin')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { borderColor: Colors.red, marginBottom: Default.fixPadding }]} onPress={() => { /* TODO: call emergency */ }}>
              <Ionicons name="call" size={18} color={Colors.red} />
              <Text style={[Fonts.SemiBold16black, { fontSize: 14, color: Colors.red, marginLeft: Default.fixPadding * 0.5 }]}>{tr('call_emergency')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { borderColor: Colors.primary, marginBottom: Default.fixPadding }]} onPress={() => { /* TODO: start investigation */ }}>
              <MaterialCommunityIcons name="magnify" size={18} color={Colors.primary} />
              <Text style={[Fonts.SemiBold16primary, { fontSize: 14, marginLeft: Default.fixPadding * 0.5 }]}>{tr('start_investigation')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { borderColor: Colors.green }]} onPress={() => { /* TODO: mark resolved */ }}>
              <MaterialCommunityIcons name="check-decagram-outline" size={18} color={Colors.green} />
              <Text style={[Fonts.SemiBold16black, { fontSize: 14, color: Colors.green, marginLeft: Default.fixPadding * 0.5 }]}>{tr('mark_resolved')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.card}>
          <Text style={Fonts.SemiBold16black}>{tr('timeline')}</Text>
          <View style={{ height: Default.fixPadding }} />
          <View>
            <View style={styles.timelineRow}>
              <View style={[styles.timelineDot, { backgroundColor: getPriorityColor(priority) }]} />
              <Text style={Fonts.Medium14black}>{tr('reported_at')}</Text>
              <Text style={[Fonts.Medium12grey, { marginLeft: 'auto' }]}>{time || '--'}</Text>
            </View>
            {status === 'investigating' && (
              <View style={styles.timelineRow}>
                <View style={[styles.timelineDot, { backgroundColor: Colors.primary }]} />
                <Text style={Fonts.Medium14black}>{tr('investigation_started')}</Text>
                <Text style={[Fonts.Medium12grey, { marginLeft: 'auto' }]}>--</Text>
              </View>
            )}
            {status === 'resolved' && (
              <View style={styles.timelineRow}>
                <View style={[styles.timelineDot, { backgroundColor: Colors.green }]} />
                <Text style={Fonts.Medium14black}>{tr('resolved_at')}</Text>
                <Text style={[Fonts.Medium12grey, { marginLeft: 'auto' }]}>--</Text>
              </View>
            )}
          </View>
        </View>

        <View style={{ height: Default.fixPadding * 4 }} />
      </ScrollView>
    </View>
  );
};

export default EmergencyDetailScreen;

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Default.fixPadding * 2,
    marginTop: Default.fixPadding * 2,
    padding: Default.fixPadding * 1.4,
    borderRadius: 12,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  chip: {
    alignSelf: 'flex-start',
    paddingHorizontal: Default.fixPadding,
    paddingVertical: Default.fixPadding * 0.4,
    borderRadius: 20,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: Default.fixPadding * 0.9,
    paddingHorizontal: Default.fixPadding,
    borderRadius: 10,
    borderWidth: 1,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Default.fixPadding * 0.9,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Default.fixPadding,
    backgroundColor: Colors.orange,
  },
  detailIconBox: {
    width: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
