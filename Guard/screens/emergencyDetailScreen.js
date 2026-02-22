import React, { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
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

const toLabelCase = (value) =>
  String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const EmergencyDetailScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  const [alertDetails, setAlertDetails] = useState(route?.params?.alert || {});
  const { updateAlertStatus, isUpdating, notifyAdmins, isNotifyingAdmins } = useGuardEmergencyAlertActions();
  const actionHandlerRef = useRef(null);
  const [actionModal, setActionModal] = useState({
    visible: false,
    title: '',
    message: '',
    variant: 'info',
    showCancel: false,
    confirmText: 'Okay',
    cancelText: 'Cancel',
  });

  function tr(key) {
    return t(`emergencyDetailScreen:${key}`);
  }

  const trFallback = (key, fallback) => {
    const value = tr(key);
    return value === `emergencyDetailScreen:${key}` ? fallback : value;
  };

  const closeActionModal = () => {
    setActionModal((prev) => ({ ...prev, visible: false }));
    actionHandlerRef.current = null;
  };

  const openActionModal = ({
    title,
    message,
    variant = 'info',
    showCancel = false,
    confirmText = trFallback('ok', 'Okay'),
    cancelText = trFallback('cancel', 'Cancel'),
    onConfirm = null,
  }) => {
    actionHandlerRef.current = onConfirm;
    setActionModal({
      visible: true,
      title,
      message,
      variant,
      showCancel,
      confirmText,
      cancelText,
    });
  };

  const showInfoModal = (title, message, variant = 'info') => {
    openActionModal({
      title,
      message,
      variant,
      showCancel: false,
      confirmText: trFallback('ok', 'Okay'),
      onConfirm: null,
    });
  };

  const handleModalConfirm = () => {
    const modalAction = actionHandlerRef.current;
    closeActionModal();
    if (typeof modalAction === 'function') {
      setTimeout(() => {
        modalAction();
      }, 0);
    }
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
      case 'escalated':
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
      return {
        success: false,
        title: trFallback('update_failed_title', 'Update failed'),
        message: trFallback('missing_alert_id', 'Missing alert ID.'),
      };
    }

    if (normalizeStatus(currentStatus) === normalizeStatus(nextStatus)) {
      return {
        success: false,
        title: trFallback('already_up_to_date_title', 'No changes'),
        message: trFallback('already_up_to_date_message', 'This alert is already in the selected status.'),
      };
    }

    try {
      const updatedAlert = await updateAlertStatus({ alertId: id, nextStatus });
      applyLocalStatusUpdate(nextStatus, updatedAlert);
      return {
        success: true,
        title: trFallback('status_updated_title', 'Status updated'),
        message: trFallback('status_updated_message', 'Emergency alert status updated successfully.'),
      };
    } catch (error) {
      return {
        success: false,
        title: trFallback('update_failed_title', 'Update failed'),
        message: error?.message || trFallback('status_update_error', 'Unable to update alert status.'),
      };
    }
  };

  const confirmStatusChange = (nextStatus) => {
    const statusLabel = toLabelCase(nextStatus);
    openActionModal({
      title: trFallback('confirm_update_title', 'Confirm update'),
      message: trFallback('confirm_update_message', `Set this alert to ${statusLabel}?`),
      variant: 'warning',
      showCancel: true,
      confirmText: trFallback('confirm', 'Confirm'),
      cancelText: trFallback('cancel', 'Cancel'),
      onConfirm: async () => {
        const result = await runStatusChange(nextStatus);
        showInfoModal(
          result.title,
          result.message,
          result.success ? 'success' : 'error',
        );
      },
    });
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
  const canNotifyAdmins = !isNotifyingAdmins && !!id;

  const handleNotifyAdmins = () => {
    if (!id) {
      showInfoModal(
        trFallback('update_failed_title', 'Update failed'),
        trFallback('missing_alert_id', 'Missing alert ID.'),
        'error',
      );
      return;
    }

    openActionModal({
      title: trFallback('confirm_contact_admin_title', 'Notify admin'),
      message: trFallback('confirm_contact_admin_message', 'Notify all active admins in this community now?'),
      variant: 'warning',
      showCancel: true,
      confirmText: trFallback('confirm', 'Confirm'),
      cancelText: trFallback('cancel', 'Cancel'),
      onConfirm: async () => {
        try {
          const result = await notifyAdmins({
            alertId: id,
            incidentId: incidentId || id,
            alertType: type,
            alertTitle: title,
            alertDescription: description,
            alertPriority: priority || 'high',
            alertLocation: location,
            reporterName: reporter,
          });

          showInfoModal(
            trFallback('admin_notified_title', 'Admin notified'),
            trFallback(
              'admin_notified_message',
              `${result?.notifiedCount || 0} admin recipients have been notified.`,
            ),
            'success',
          );
        } catch (error) {
          showInfoModal(
            trFallback('update_failed_title', 'Update failed'),
            error?.message || trFallback('notify_admin_error', 'Unable to notify admins.'),
            'error',
          );
        }
      },
    });
  };

  const modalIcon = useMemo(() => {
    if (actionModal.variant === 'success') {
      return { name: 'checkmark-circle', color: Colors.green };
    }
    if (actionModal.variant === 'error') {
      return { name: 'alert-circle', color: Colors.red };
    }
    if (actionModal.variant === 'warning') {
      return { name: 'warning', color: Colors.orange };
    }
    return { name: 'information-circle', color: Colors.primary };
  }, [actionModal.variant]);

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
              disabled={!canNotifyAdmins}
              onPress={handleNotifyAdmins}
              style={[
                styles.actionBtn,
                styles.actionBtnSpacing,
                {
                  borderColor: Colors.blue,
                  opacity: canNotifyAdmins ? 1 : 0.5,
                },
              ]}
            >
              {isNotifyingAdmins ? (
                <ActivityIndicator size='small' color={Colors.blue} />
              ) : (
                <MaterialCommunityIcons name='account-cog-outline' size={18} color={Colors.blue} />
              )}
              <Text style={[styles.actionBtnText, { color: Colors.blue }]}>
                {isNotifyingAdmins ? trFallback('notifying_admins', 'Notifying admins...') : tr('contact_admin')}
              </Text>
            </TouchableOpacity>

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

      <Modal
        transparent
        visible={actionModal.visible}
        animationType='fade'
        onRequestClose={closeActionModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Ionicons name={modalIcon.name} size={42} color={modalIcon.color} />
            <Text style={[Fonts.SemiBold18black, styles.modalTitle]}>{actionModal.title}</Text>
            <Text style={[Fonts.Medium14grey, styles.modalMessage]}>{actionModal.message}</Text>

            <View
              style={[
                styles.modalButtonsRow,
                { flexDirection: isRtl ? 'row-reverse' : 'row' },
              ]}
            >
              {actionModal.showCancel ? (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={closeActionModal}
                  style={[
                    styles.modalBtn,
                    styles.modalCancelBtn,
                    {
                      marginRight: isRtl ? 0 : Default.fixPadding * 0.7,
                      marginLeft: isRtl ? Default.fixPadding * 0.7 : 0,
                    },
                  ]}
                >
                  <Text style={styles.modalCancelBtnText}>{actionModal.cancelText}</Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleModalConfirm}
                style={[
                  styles.modalBtn,
                  styles.modalConfirmBtn,
                  actionModal.showCancel ? styles.modalBtnWithCancel : styles.modalBtnSingle,
                ]}
              >
                <Text style={styles.modalConfirmBtnText}>{actionModal.confirmText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Default.fixPadding * 2,
    backgroundColor: Colors.transparentBlack,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 14,
    backgroundColor: Colors.white,
    paddingHorizontal: Default.fixPadding * 1.6,
    paddingTop: Default.fixPadding * 1.8,
    paddingBottom: Default.fixPadding * 1.4,
    alignItems: 'center',
    ...Default.shadow,
  },
  modalTitle: {
    marginTop: Default.fixPadding * 0.8,
    textAlign: 'center',
  },
  modalMessage: {
    marginTop: Default.fixPadding * 0.4,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalButtonsRow: {
    width: '100%',
    marginTop: Default.fixPadding * 1.5,
    alignItems: 'center',
  },
  modalBtn: {
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnWithCancel: {
    flex: 1,
  },
  modalBtnSingle: {
    width: '100%',
  },
  modalCancelBtn: {
    borderWidth: 1,
    borderColor: Colors.borderColor || '#E2E8F0',
    backgroundColor: Colors.white,
  },
  modalCancelBtnText: {
    ...Fonts.SemiBold16black,
    fontSize: 14,
    color: Colors.grey,
  },
  modalConfirmBtn: {
    backgroundColor: Colors.primary,
  },
  modalConfirmBtnText: {
    ...Fonts.SemiBold16white,
    fontSize: 14,
  },
});
