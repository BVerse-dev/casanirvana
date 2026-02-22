import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MyStatusBar from '../components/myStatusBar';
import { Colors, Default, Fonts } from '../constants/styles';
import {
  useGuardEmergencyAlerts,
  useGuardEmergencyAlertsSubscription,
} from '../hooks/useEmergencyAlerts';

const STATUS_FILTERS = ['all', 'active', 'investigating', 'resolved'];

const toTypeLabel = (type) => {
  if (!type) return 'General';
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'Just now';

  const date = new Date(timestamp);
  const ms = date.getTime();
  if (Number.isNaN(ms)) return 'Just now';

  const diffMinutes = Math.floor((Date.now() - ms) / 60000);
  if (diffMinutes <= 0) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
};

const formatAbsoluteTime = (timestamp) => {
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
};

const formatUnitLabel = (unit) => {
  if (!unit) return 'Community-wide';
  if (unit.unit_number) return unit.unit_number;
  const block = unit.block || '';
  const number = unit.number || '';
  const label = `${block}-${number}`.replace(/^-|-$/g, '').trim();
  return label || 'Community-wide';
};

const getPriorityColor = (priority) => {
  switch ((priority || '').toLowerCase()) {
    case 'critical':
      return Colors.darkRed;
    case 'high':
      return Colors.red;
    case 'medium':
      return Colors.orange;
    case 'low':
      return Colors.lightBlue;
    default:
      return Colors.grey;
  }
};

const getStatusColor = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'active':
      return Colors.darkRed;
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

const getEmergencyIcon = (type) => {
  switch ((type || '').toLowerCase()) {
    case 'fire':
      return 'flame';
    case 'medical':
      return 'medical';
    case 'security':
      return 'shield-checkmark';
    case 'maintenance':
      return 'construct';
    case 'weather':
      return 'rainy';
    case 'utility':
      return 'flash';
    case 'drill':
      return 'megaphone';
    default:
      return 'warning';
  }
};

const EmergencyScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  const [selectedStatus, setSelectedStatus] = useState('all');

  const { data: emergencyAlerts = [], isLoading, error, refetch } = useGuardEmergencyAlerts(selectedStatus);
  useGuardEmergencyAlertsSubscription();

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch]),
  );

  function tr(key) {
    return t(`emergencyScreen:${key}`);
  }

  const handleOpenAlert = (item) => {
    const reporterName =
      item?.reporter?.full_name ||
      `${item?.reporter?.first_name || ''} ${item?.reporter?.last_name || ''}`.trim() ||
      'Community Resident';
    const reporterPhone = item?.reporter?.phone || null;
    const unitLabel = formatUnitLabel(item?.units);

    navigation.navigate('emergencyDetailScreen', {
      alert: {
        id: item.id,
        type: item.alert_type,
        title: item.title,
        description: item.description,
        time: formatAbsoluteTime(item.created_at),
        priority: item.priority || 'medium',
        status: item.status || 'active',
        location: `${unitLabel}${item?.communities?.name ? ` • ${item.communities.name}` : ''}`,
        reporter: reporterName,
        contact: reporterPhone,
        incidentId: item.id ? item.id.split('-')[0].toUpperCase() : '-',
        created_at: item.created_at,
        updated_at: item.updated_at,
        resolved_at: item.resolved_at,
        resolved_by: item.resolved_by,
      },
    });
  };

  const renderStatusFilter = (status) => {
    const isSelected = selectedStatus === status;
    const label = status === 'all' ? 'All' : toTypeLabel(status);

    return (
      <TouchableOpacity
        onPress={() => setSelectedStatus(status)}
        style={[
          styles.filterChip,
          {
            backgroundColor: isSelected ? Colors.primary : Colors.white,
            borderColor: isSelected ? Colors.primary : Colors.porcelain,
          },
        ]}
      >
        <Text
          style={[
            Fonts.Medium14grey,
            {
              color: isSelected ? Colors.white : Colors.black,
            },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEmergencyAlert = ({ item }) => {
    const priority = (item.priority || 'medium').toLowerCase();
    const status = (item.status || 'active').toLowerCase();
    const unitLabel = formatUnitLabel(item?.units);
    const typeLabel = toTypeLabel(item.alert_type);
    const reporterName =
      item?.reporter?.full_name ||
      `${item?.reporter?.first_name || ''} ${item?.reporter?.last_name || ''}`.trim() ||
      'Community Resident';

    return (
      <TouchableOpacity
        onPress={() => handleOpenAlert(item)}
        style={{
          flexDirection: isRtl ? 'row-reverse' : 'row',
          ...styles.mainCard,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: isRtl ? 'row-reverse' : 'row',
            alignItems: 'center',
          }}
        >
          <View style={styles.iconBox}>
            <View
              style={[
                styles.iconCircle,
                {
                  backgroundColor: getPriorityColor(priority),
                },
              ]}
            >
              <Ionicons name={getEmergencyIcon(item.alert_type)} size={20} color={Colors.white} />
            </View>
          </View>

          <View
            style={{
              flex: 1,
              alignItems: isRtl ? 'flex-end' : 'flex-start',
              marginHorizontal: Default.fixPadding,
            }}
          >
            <Text numberOfLines={1} style={{ ...Fonts.SemiBold16black, overflow: 'hidden' }}>
              {item.title || `${typeLabel} Alert`}
            </Text>

            <Text numberOfLines={1} style={{ ...Fonts.Medium14grey, overflow: 'hidden' }}>
              {`${unitLabel} | ${typeLabel}`}
            </Text>

            <Text
              numberOfLines={2}
              style={{
                ...Fonts.Medium14black,
                overflow: 'hidden',
                marginTop: Default.fixPadding * 0.3,
              }}
            >
              {item.description || 'No additional details provided.'}
            </Text>

            <View
              style={{
                flexDirection: isRtl ? 'row-reverse' : 'row',
                alignItems: 'center',
                marginTop: Default.fixPadding * 0.5,
              }}
            >
              <MaterialCommunityIcons name='clock-time-three-outline' size={14} color={Colors.grey} />
              <Text
                numberOfLines={1}
                style={{
                  ...Fonts.Medium12grey,
                  marginHorizontal: Default.fixPadding * 0.3,
                }}
              >
                {formatRelativeTime(item.created_at)}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  ...Fonts.Medium12grey,
                }}
              >
                {` • ${reporterName}`}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ alignItems: isRtl ? 'flex-start' : 'flex-end', justifyContent: 'space-between' }}>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: getStatusColor(status),
              },
            ]}
          >
            <Text style={{ ...Fonts.Medium12grey, color: Colors.white, textTransform: 'capitalize' }}>
              {status}
            </Text>
          </View>

          <Text
            numberOfLines={1}
            style={{
              ...Fonts.Medium12grey,
              color: getPriorityColor(priority),
              textTransform: 'capitalize',
              marginTop: Default.fixPadding * 0.6,
            }}
          >
            {priority}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <MyStatusBar />

      <View
        style={{
          paddingHorizontal: Default.fixPadding * 2,
          marginVertical: Default.fixPadding * 1.2,
        }}
      >
        <Text
          style={{
            ...Fonts.SemiBold18black,
            textAlign: isRtl ? 'right' : 'left',
          }}
          numberOfLines={1}
        >
          {tr('emergencyAlerts')}
        </Text>
      </View>

      <View style={styles.filtersRow}>
        {STATUS_FILTERS.map((status, index) => (
          <View key={status} style={index < STATUS_FILTERS.length - 1 ? styles.filterChipSpacing : null}>
            {renderStatusFilter(status)}
          </View>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.stateContainer}>
          <ActivityIndicator size='large' color={Colors.primary} />
          <Text style={{ ...Fonts.Medium14grey, marginTop: Default.fixPadding }}>Loading alerts...</Text>
        </View>
      ) : error ? (
        <View style={styles.stateContainer}>
          <Ionicons name='alert-circle-outline' size={48} color={Colors.grey} />
          <Text
            style={{
              ...Fonts.Medium14grey,
              marginTop: Default.fixPadding,
              textAlign: 'center',
            }}
          >
            {error.message || 'Unable to load alerts'}
          </Text>
        </View>
      ) : emergencyAlerts.length === 0 ? (
        <View style={styles.stateContainer}>
          <Ionicons name='shield-checkmark-outline' size={56} color={Colors.grey} />
          <Text style={{ ...Fonts.SemiBold16grey, marginTop: Default.fixPadding }}>
            {tr('noEmergencies')}
          </Text>
          <Text style={{ ...Fonts.Medium14grey, marginTop: Default.fixPadding * 0.4 }}>
            {tr('allClear')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={emergencyAlerts}
          renderItem={renderEmergencyAlert}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: Default.fixPadding,
            paddingBottom: Default.fixPadding * 2,
          }}
          onRefresh={refetch}
          refreshing={isLoading}
        />
      )}
    </View>
  );
};

export default EmergencyScreen;

const styles = StyleSheet.create({
  filtersRow: {
    flexDirection: 'row',
    marginHorizontal: Default.fixPadding * 2,
    marginTop: Default.fixPadding * 0.2,
    marginBottom: Default.fixPadding * 0.6,
  },
  filterChipSpacing: {
    marginRight: Default.fixPadding * 0.7,
  },
  filterChip: {
    paddingVertical: Default.fixPadding * 0.55,
    paddingHorizontal: Default.fixPadding,
    borderRadius: 18,
    borderWidth: 1,
  },
  mainCard: {
    alignItems: 'center',
    padding: Default.fixPadding * 0.8,
    marginHorizontal: Default.fixPadding * 2,
    marginBottom: Default.fixPadding * 1.4,
    borderRadius: 10,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  iconBox: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 58,
    height: 58,
    borderRadius: 6,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Default.fixPadding * 0.45,
    paddingHorizontal: Default.fixPadding * 0.8,
    minWidth: 72,
    borderRadius: 14,
  },
  stateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Default.fixPadding * 2,
  },
});
