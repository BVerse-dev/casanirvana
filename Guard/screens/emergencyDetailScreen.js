import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Default, Fonts } from '../constants/styles';
import MyStatusBar from '../components/myStatusBar';
import { useGuardEmergencyAlertActions } from '../hooks/useEmergencyAlerts';

const normalizeStatus = (value) => String(value || 'active').toLowerCase();

const formatTimestamp = (value) => {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleString();
};

const EmergencyDetailScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  const [alertDetails, setAlertDetails] = useState(route?.params?.alert || {});
  const { updateAlertStatus, isUpdating } = useGuardEmergencyAlertActions();

  function tr(key) {
    return t(`emergencyDetailScreen:${key}`);
  }

  const trFallback = (key, fallback) => {
    const value = tr(key);
    return value === `emergencyDetailScreen:${key}` ? fallback : value;
  };

  const {
    id,
    type,
    title,
    description,
    time,
    priority,
    status,
    location,
    reporter,
    contact,
    incidentId,
    created_at: createdAt,
    updated_at: updatedAt,
    resolved_at: resolvedAt,
  } = alertDetails;

  const currentStatus = normalizeStatus(status);

  const getPriorityColor = (value) => {
    const normalizedValue = String(value || '').toLowerCase();
    switch (normalizedValue) {
      case 'critical':
        return Colors.red;
      case 'high':
        return Colors.orange || Colors.red;
      case 'medium':
        return Colors.primary;
      default:
        return Colors.grey;
    }
  };

  const getStatusColor = (value) => {
    const normalizedValue = String(value || '').toLowerCase();
    switch (normalizedValue) {
      case 'active':
        return Colors.red;
      case 'investigating':
        return Colors.primary;
      case 'resolved':
        return Colors.green;
      case 'pending':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  };

  const getIcon = (value) => {
    const normalizedValue = String(value || '').toLowerCase();
    switch (normalizedValue) {
      case 'fire':
        return 'flame';
      case 'medical':
        return 'medical';
      case 'security':
        return 'shield-checkmark';
      default:
        return 'warning';
    }
  };

  const applyLocalStatusUpdate = (nextStatus, updateRow) => {
    const nowIso = new Date().toISOString();
    setAlertDetails((prev) => ({
      ...prev,
      status: updateRow?.status || nextStatus,
      updated_at: updateRow?.updated_at || nowIso,
      resolved_at: nextStatus === 'resolved' ? updateRow?.resolved_at || nowIso : null,
    }));
  };

  const runStatusChange = async (nextStatus) => {
    if (!id) {
      Alert.alert(trFallback('update_failed_title', 'Update failed'), trFallback('missing_alert_id', 'Missing alert ID.'));
      return;
    }

    if (normalizeStatus(currentStatus) === normalizeStatus(nextStatus)) {
      Alert.alert(
        trFallback('already_up_to_date_title', 'No changes'),
        trFallback('already_up_to_date_message', 'This alert is already in the selected status.'),
      );
      return;
    }

    try {
      const updatedAlert = await updateAlertStatus({ alertId: id, nextStatus });
      applyLocalStatusUpdate(nextStatus, updatedAlert);
      Alert.alert(
        trFallback('status_updated_title', 'Status updated'),
        trFallback('status_updated_message', 'Emergency alert status updated successfully.'),
      );
    } catch (error) {
      Alert.alert(
        trFallback('update_failed_title', 'Update failed'),
        error?.message || trFallback('status_update_error', 'Unable to update alert status.'),
      );
    }
  };

  const confirmStatusChange = (nextStatus) => {
    const statusLabel = nextStatus.replace(/_/g, ' ');
    Alert.alert(
      trFallback('confirm_update_title', 'Confirm update'),
      trFallback('confirm_update_message', `Set this alert to ${statusLabel}?`),
      [
        { text: trFallback('cancel', 'Cancel'), style: 'cancel' },
        {
          text: trFallback('confirm', 'Confirm'),
          onPress: () => {
            runStatusChange(nextStatus);
          },
        },
      ],
    );
  };

  const reportedTime = useMemo(() => {
    if (time && time !== '-') return time;
    return formatTimestamp(createdAt);
  }, [createdAt, time]);

  const investigationTime = useMemo(() => {
    if (currentStatus !== 'investigating') return '--';
    return formatTimestamp(updatedAt);
  }, [currentStatus, updatedAt]);

  const resolvedTime = useMemo(() => {
    if (currentStatus !== 'resolved') return '--';
    return formatTimestamp(resolvedAt || updatedAt);
  }, [currentStatus, resolvedAt, updatedAt]);

  const canAcknowledge =
    !isUpdating &&
    !!id &&
    (currentStatus === 'pending' || currentStatus === 'escalated');
  const canInvestigate = !isUpdating && !!id && currentStatus !== 'investigating' && currentStatus !== 'resolved';
  const canResolve = !isUpdating && !!id && currentStatus !== 'resolved';

  return (
    <View style={{ flex: 1, backgroundColor: Colors.lightGrey }}>
      <MyStatusBar />

      <View
        style={{
          flexDirection: isRtl ? 'row-reverse' : 'row',
          alignItems: 'center',
          paddingVertical: Default.fixPadding * 1.2,
          paddingHorizontal: Default.fixPadding * 2,
          backgroundColor: Colors.white,
        }}
      >
        <TouchableOpacity onPress={() => navigation.pop()}>
          <Ionicons
            name={isRtl ? 'arrow-forward-outline' : 'arrow-back-outline'}
            size={25}
            color={Colors.black}
          />
        </TouchableOpacity>
        <Text
          style={{
            ...Fonts.SemiBold18black,
            marginHorizontal: Default.fixPadding,
            flex: 1,
          }}
          numberOfLines={1}
        >
          {tr('title')}
        </Text>
        <View style={{ flexDirection: isRtl ? 'row-reverse' : 'row', alignItems: 'center' }}>
          <View style={[styles.chip, { backgroundColor: getPriorityColor(priority) }]}>
            <Text style={[Fonts.Medium12grey, { color: Colors.white, textTransform: 'capitalize' }]}>
              {priority || '-'}
            </Text>
          </View>
          <View style={{ width: Default.fixPadding * 0.8 }} />
          <View style={[styles.chip, { backgroundColor: getStatusColor(currentStatus) }]}>
            <Text style={[Fonts.Medium12grey, { color: Colors.white, textTransform: 'capitalize' }]}>
              {currentStatus}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={{ flexDirection: isRtl ? 'row-reverse' : 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: getPriorityColor(priority),
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name={getIcon(type)} size={24} color={Colors.white} />
            </View>
            <View style={{ flex: 1, marginHorizontal: Default.fixPadding }}>
              <Text style={Fonts.SemiBold16black} numberOfLines={1}>
                {title || tr('unknown')}
              </Text>
              <Text style={[Fonts.Medium14grey, { marginTop: Default.fixPadding * 0.3 }]} numberOfLines={2}>
                {description || tr('no_description')}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={Fonts.SemiBold16black}>{tr('details')}</Text>
          <View style={{ height: Default.fixPadding }} />

          <View style={[styles.detailRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <View style={styles.detailIconBox}>
              <MaterialCommunityIcons name='map-marker-outline' size={18} color={Colors.primary} />
            </View>
            <Text style={styles.detailLabel}>{tr('location')}</Text>
            <Text style={[styles.detailValue, { textAlign: isRtl ? 'right' : 'left' }]} numberOfLines={2}>
              {location || '-'}
            </Text>
          </View>

          <View style={[styles.detailRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <View style={styles.detailIconBox}>
              <MaterialCommunityIcons name='account-badge-outline' size={18} color={Colors.primary} />
            </View>
            <Text style={styles.detailLabel}>{tr('reporter')}</Text>
            <Text style={[styles.detailValue, { textAlign: isRtl ? 'right' : 'left' }]} numberOfLines={2}>
              {reporter || '-'}
            </Text>
          </View>

          <View style={[styles.detailRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <View style={styles.detailIconBox}>
              <MaterialCommunityIcons name='clock-time-three-outline' size={18} color={Colors.primary} />
            </View>
            <Text style={styles.detailLabel}>{tr('reported')}</Text>
            <Text style={[styles.detailValue, { textAlign: isRtl ? 'right' : 'left' }]} numberOfLines={1}>
              {reportedTime}
            </Text>
          </View>

          <View style={[styles.detailRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <View style={styles.detailIconBox}>
              <MaterialCommunityIcons name='identifier' size={18} color={Colors.primary} />
            </View>
            <Text style={styles.detailLabel}>{tr('incident_id')}</Text>
            <Text style={[styles.detailValue, { textAlign: isRtl ? 'right' : 'left' }]} numberOfLines={1}>
              {incidentId || id || '-'}
            </Text>
          </View>

          {contact ? (
            <View style={[styles.detailRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <View style={styles.detailIconBox}>
                <MaterialCommunityIcons name='phone-outline' size={18} color={Colors.primary} />
              </View>
              <Text style={styles.detailLabel}>{tr('contact')}</Text>
              <Text style={[styles.detailValue, { textAlign: isRtl ? 'right' : 'left' }]} numberOfLines={1}>
                {contact}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={[styles.card, { paddingVertical: Default.fixPadding * 1.2 }]}>
          <View style={{ flexDirection: 'column' }}>
            <TouchableOpacity
              disabled={!canAcknowledge}
              onPress={() => confirmStatusChange('active')}
              style={[
                styles.actionBtn,
                styles.actionBtnSpacing,
                {
                  borderColor: Colors.orange,
                  opacity: canAcknowledge ? 1 : 0.5,
                },
              ]}
            >
              <MaterialCommunityIcons name='check-circle-outline' size={18} color={Colors.orange} />
              <Text style={[styles.actionBtnText, { color: Colors.orange }]}>
                {trFallback('acknowledge', 'Acknowledge')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={!canInvestigate}
              onPress={() => confirmStatusChange('investigating')}
              style={[
                styles.actionBtn,
                styles.actionBtnSpacing,
                {
                  borderColor: Colors.primary,
                  opacity: canInvestigate ? 1 : 0.5,
                },
              ]}
            >
              <MaterialCommunityIcons name='magnify' size={18} color={Colors.primary} />
              <Text style={[styles.actionBtnText, { color: Colors.primary }]}>
                {tr('start_investigation')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={!canResolve}
              onPress={() => confirmStatusChange('resolved')}
              style={[
                styles.actionBtn,
                {
                  borderColor: Colors.green,
                  opacity: canResolve ? 1 : 0.5,
                },
              ]}
            >
              {isUpdating ? (
                <ActivityIndicator size='small' color={Colors.green} />
              ) : (
                <MaterialCommunityIcons name='check-decagram-outline' size={18} color={Colors.green} />
              )}
              <Text style={[styles.actionBtnText, { color: Colors.green }]}>
                {isUpdating ? trFallback('updating', 'Updating...') : tr('mark_resolved')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={Fonts.SemiBold16black}>{tr('timeline')}</Text>
          <View style={{ height: Default.fixPadding }} />
          <View>
            <View style={[styles.timelineRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <View
                style={[
                  styles.timelineDot,
                  {
                    backgroundColor: getPriorityColor(priority),
                    marginRight: isRtl ? 0 : Default.fixPadding,
                    marginLeft: isRtl ? Default.fixPadding : 0,
                  },
                ]}
              />
              <Text style={Fonts.Medium14black}>{tr('reported_at')}</Text>
              <Text
                style={[
                  Fonts.Medium12grey,
                  {
                    marginLeft: isRtl ? 0 : 'auto',
                    marginRight: isRtl ? 'auto' : 0,
                  },
                ]}
              >
                {reportedTime || '--'}
              </Text>
            </View>
            {currentStatus === 'investigating' && (
              <View style={[styles.timelineRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <View
                  style={[
                    styles.timelineDot,
                    {
                      backgroundColor: Colors.primary,
                      marginRight: isRtl ? 0 : Default.fixPadding,
                      marginLeft: isRtl ? Default.fixPadding : 0,
                    },
                  ]}
                />
                <Text style={Fonts.Medium14black}>{tr('investigation_started')}</Text>
                <Text
                  style={[
                    Fonts.Medium12grey,
                    {
                      marginLeft: isRtl ? 0 : 'auto',
                      marginRight: isRtl ? 'auto' : 0,
                    },
                  ]}
                >
                  {investigationTime}
                </Text>
              </View>
            )}
            {currentStatus === 'resolved' && (
              <View style={[styles.timelineRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <View
                  style={[
                    styles.timelineDot,
                    {
                      backgroundColor: Colors.green,
                      marginRight: isRtl ? 0 : Default.fixPadding,
                      marginLeft: isRtl ? Default.fixPadding : 0,
                    },
                  ]}
                />
                <Text style={Fonts.Medium14black}>{tr('resolved_at')}</Text>
                <Text
                  style={[
                    Fonts.Medium12grey,
                    {
                      marginLeft: isRtl ? 0 : 'auto',
                      marginRight: isRtl ? 'auto' : 0,
                    },
                  ]}
                >
                  {resolvedTime}
                </Text>
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
  actionBtnSpacing: {
    marginBottom: Default.fixPadding,
  },
  actionBtnText: {
    ...Fonts.SemiBold16black,
    fontSize: 14,
    marginLeft: Default.fixPadding * 0.5,
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
  detailRow: {
    flexDirection: 'row',
    marginBottom: Default.fixPadding * 0.9,
    alignItems: 'center',
  },
  detailLabel: {
    ...Fonts.Medium14grey,
    marginHorizontal: Default.fixPadding * 0.8,
  },
  detailValue: {
    ...Fonts.Medium14black,
    flex: 1,
  },
});
