import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, TextInput, Modal, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MyStatusBar from '../components/myStatusBar';
import { Colors, Default, Fonts } from '../constants/styles';

const DeleteAccountScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  function tr(key) {
    return t(`settingScreen:${key}`);
  }

  const [step, setStep] = useState(1); // 1: Warning, 2: Reason, 3: Final
  const [reasonSelected, setReasonSelected] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal states
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  // Export data settings
  const [exportSettings, setExportSettings] = useState({
    profile: true,
    communications: true,
    community: false,
    documents: true,
    logs: true,
    settings: false,
    format: 'json', // json, csv, pdf
    includeMedia: true,
    emailDelivery: true,
  });

  // Deactivation settings
  const [deactivateSettings, setDeactivateSettings] = useState({
    duration: '30', // 30, 90, 180, indefinite
    hideProfile: true,
    stopNotifications: true,
    pauseSubscriptions: true,
    keepData: true,
    autoReactivation: false,
  });

  // Support settings
  const [supportSettings, setSupportSettings] = useState({
    category: '', // account, technical, billing, feature, other
    priority: 'normal', // low, normal, high, urgent
    includeAccountInfo: true,
    includeLogs: false,
    contactMethod: 'email', // email, phone, chat
  });

  const deleteReasons = [
    { id: 'privacy', text: 'Privacy concerns', icon: 'shield-alert' },
    { id: 'not_using', text: 'Not using the app anymore', icon: 'clock-off' },
    { id: 'too_many_notifications', text: 'Too many notifications', icon: 'bell-off' },
    { id: 'found_alternative', text: 'Found a better alternative', icon: 'swap-horizontal' },
    { id: 'technical_issues', text: 'Technical issues', icon: 'bug' },
    { id: 'moving_out', text: 'Moving out of community', icon: 'home-export' },
    { id: 'other', text: 'Other reason', icon: 'dots-horizontal' },
  ];

  const [accountData] = useState({
    profile: 'Personal information, preferences',
    communications: 'Messages, notifications, chat history',
    community: 'Member directory access, society information',
    documents: 'Uploaded documents, verification files',
    logs: 'Visitor and entry activity logs',
    settings: 'App preferences and configuration',
  });

  const processDeletion = () => {
    setIsDeleting(true);
    setTimeout(() => {
      setIsDeleting(false);
      Alert.alert(
        'Account Deleted',
        "Your account has been permanently deleted. We're sorry to see you go!",
        [{ text: 'OK', onPress: () => navigation.navigate('loginScreen') }]
      );
    }, 3000);
  };

  const confirmDeletion = () => {
    if (confirmationText.toLowerCase() !== 'delete my account') {
      Alert.alert('Error', "Please type 'DELETE MY ACCOUNT' to confirm.");
      return;
    }
    Alert.alert(
      'Final Confirmation',
      'This is your last chance to cancel. Are you absolutely sure you want to permanently delete your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete Forever', style: 'destructive', onPress: processDeletion },
      ]
    );
  };

  // Modal handlers
  const handleExportData = () => {
    setShowExportModal(false);
    const selectedData = Object.entries(exportSettings)
      .filter(([key, value]) => value && !['format', 'includeMedia', 'emailDelivery'].includes(key))
      .map(([key]) => key)
      .join(', ');
    
    Alert.alert(
      'Export Request Submitted',
      `Your data export (${selectedData}) in ${exportSettings.format.toUpperCase()} format will be ${exportSettings.emailDelivery ? 'emailed to you' : 'prepared for download'} within 24 hours.`,
      [{ text: 'OK' }]
    );
  };

  const handleDeactivateAccount = () => {
    setShowDeactivateModal(false);
    const duration = deactivateSettings.duration === 'indefinite' ? 'indefinitely' : `for ${deactivateSettings.duration} days`;
    
    Alert.alert(
      'Account Deactivated',
      `Your account has been deactivated ${duration}. You can reactivate it anytime by logging back in.`,
      [{ text: 'OK', onPress: () => navigation.navigate('loginScreen') }]
    );
  };

  const handleContactSupport = () => {
    setShowSupportModal(false);
    const category = supportSettings.category || 'general';
    const method = supportSettings.contactMethod;
    
    Alert.alert(
      'Support Request Submitted',
      `Your ${category} support request has been submitted with ${supportSettings.priority} priority. Our team will contact you via ${method} within ${supportSettings.priority === 'urgent' ? '2 hours' : supportSettings.priority === 'high' ? '4 hours' : '24 hours'}.`,
      [{ text: 'OK' }]
    );
  };

  const handleFormatSelect = () => {
    const formatOptions = [
      { id: 'json', label: 'JSON', description: 'Machine-readable format' },
      { id: 'csv', label: 'CSV', description: 'Spreadsheet-compatible format' },
      { id: 'pdf', label: 'PDF', description: 'Human-readable document format' },
    ];

    Alert.alert(
      'Select Export Format',
      'Choose how you want your data formatted',
      [
        { text: 'Cancel', style: 'cancel' },
        ...formatOptions.map(format => ({
          text: `${format.label} - ${format.description}`,
          onPress: () => {
            setExportSettings(prev => ({ ...prev, format: format.id }));
            Alert.alert('Format Updated', `Export format changed to ${format.label}`);
          }
        }))
      ]
    );
  };

  const handleDurationSelect = () => {
    const durationOptions = [
      { id: '30', label: '30 Days', description: 'One month break' },
      { id: '90', label: '90 Days', description: 'Three month break' },
      { id: '180', label: '180 Days', description: 'Six month break' },
      { id: 'indefinite', label: 'Indefinite', description: 'Until you return' },
    ];

    Alert.alert(
      'Deactivation Duration',
      'How long would you like to deactivate your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        ...durationOptions.map(duration => ({
          text: `${duration.label} - ${duration.description}`,
          onPress: () => {
            setDeactivateSettings(prev => ({ ...prev, duration: duration.id }));
            Alert.alert('Duration Updated', `Deactivation period set to ${duration.label}`);
          }
        }))
      ]
    );
  };

  const handleCategorySelect = () => {
    const categoryOptions = [
      { id: 'account', label: 'Account Issues', description: 'Login, profile, settings' },
      { id: 'technical', label: 'Technical Problems', description: 'Bugs, crashes, performance' },
      { id: 'billing', label: 'Billing & Payments', description: 'Subscription, charges' },
      { id: 'feature', label: 'Feature Request', description: 'Suggestions, improvements' },
      { id: 'other', label: 'Other', description: 'General questions' },
    ];

    Alert.alert(
      'Support Category',
      'What type of help do you need?',
      [
        { text: 'Cancel', style: 'cancel' },
        ...categoryOptions.map(category => ({
          text: `${category.label} - ${category.description}`,
          onPress: () => {
            setSupportSettings(prev => ({ ...prev, category: category.id }));
            Alert.alert('Category Selected', `Support category set to ${category.label}`);
          }
        }))
      ]
    );
  };

  const renderStep1 = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.warningSection}>
        <MaterialCommunityIcons name="alert-circle" size={60} color={Colors.red} />
        <Text style={styles.warningTitle}>Delete Account</Text>
        <Text style={styles.warningText}>
          This action is permanent and cannot be undone. All your data will be permanently deleted.
        </Text>
      </View>

      <View style={styles.dataSection}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="database" size={20} color={Colors.red} />
          <Text style={styles.sectionTitle}>Data to be Deleted</Text>
        </View>
        {Object.entries(accountData).map(([key, description]) => (
          <View key={key} style={styles.dataItem}>
            <MaterialCommunityIcons name="close-circle" size={20} color={Colors.red} />
            <View style={styles.dataInfo}>
              <Text style={styles.dataTitle}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
              <Text style={styles.dataDescription}>{description}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.alternativesSection}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="lightbulb-on" size={20} color={Colors.orange} />
          <Text style={styles.sectionTitleAlt}>Consider These Alternatives</Text>
        </View>
        <TouchableOpacity 
          style={styles.alternativeItem} 
          onPress={() => setShowExportModal(true)}
        >
          <MaterialCommunityIcons name="download" size={24} color={Colors.blue} />
          <View style={styles.alternativeInfo}>
            <Text style={styles.alternativeTitle}>Export Your Data</Text>
            <Text style={styles.alternativeDescription}>Download a copy of your data before deleting</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.alternativeItem}
          onPress={() => setShowDeactivateModal(true)}
        >
          <MaterialCommunityIcons name="pause-circle" size={24} color={Colors.green} />
          <View style={styles.alternativeInfo}>
            <Text style={styles.alternativeTitle}>Deactivate Account</Text>
            <Text style={styles.alternativeDescription}>Temporarily disable your account instead</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.alternativeItem} 
          onPress={() => setShowSupportModal(true)}
        >
          <MaterialCommunityIcons name="help-circle" size={24} color={Colors.primary} />
          <View style={styles.alternativeInfo}>
            <Text style={styles.alternativeTitle}>Contact Support</Text>
            <Text style={styles.alternativeDescription}>Let us help resolve any issues you're facing</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
        </TouchableOpacity>
      </View>

      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => setStep(2)}
        >
          <Text style={styles.primaryButtonText}>Continue with Deletion</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Keep My Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.reasonSection}>
        <Text style={styles.reasonTitle}>Help us improve</Text>
        <Text style={styles.reasonSubtitle}>Why are you deleting your account? (Optional)</Text>
        {deleteReasons.map((reason) => (
          <TouchableOpacity
            key={reason.id}
            style={[styles.reasonItem, reasonSelected === reason.id && styles.reasonItemSelected]}
            onPress={() => setReasonSelected(reason.id)}
          >
            <MaterialCommunityIcons
              name={reason.icon}
              size={24}
              color={reasonSelected === reason.id ? Colors.white : Colors.grey}
            />
            <Text style={[styles.reasonText, reasonSelected === reason.id && styles.reasonTextSelected]}>
              {reason.text}
            </Text>
            {reasonSelected === reason.id && (
              <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
            )}
          </TouchableOpacity>
        ))}
        {reasonSelected === 'other' && (
          <TextInput
            style={styles.otherReasonInput}
            placeholder="Please tell us more..."
            placeholderTextColor={Colors.grey}
            value={otherReason}
            onChangeText={setOtherReason}
            multiline
            numberOfLines={3}
          />
        )}
      </View>
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => setStep(3)}
        >
          <Text style={styles.primaryButtonText}>Proceed to Final Step</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => setStep(1)}
        >
          <Text style={styles.primaryButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderStep3 = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.finalSection}>
        <MaterialCommunityIcons name="alert-octagon" size={80} color={Colors.red} />
        <Text style={styles.finalTitle}>Final Confirmation</Text>
        <Text style={styles.finalText}>
          This is your last chance to change your mind. Once you confirm, your account and all associated data will be permanently deleted within 24 hours.
        </Text>
      </View>
      <View style={styles.confirmationSection}>
        <Text style={styles.confirmationLabel}>Type "DELETE MY ACCOUNT" to confirm:</Text>
        <TextInput
          style={styles.confirmationInput}
          placeholder="DELETE MY ACCOUNT"
          placeholderTextColor={Colors.grey}
          value={confirmationText}
          onChangeText={setConfirmationText}
          autoCapitalize="characters"
        />
      </View>
      {isDeleting && (
        <View style={styles.deletingSection}>
          <MaterialCommunityIcons name="loading" size={30} color={Colors.red} />
          <Text style={styles.deletingText}>Deleting your account...</Text>
          <Text style={styles.deletingSubtext}>This may take a few moments</Text>
        </View>
      )}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={[styles.primaryButton, { opacity: (isDeleting || confirmationText.toLowerCase() !== 'delete my account') ? 0.6 : 1 }]}
          onPress={confirmDeletion}
          disabled={isDeleting || confirmationText.toLowerCase() !== 'delete my account'}
        >
          <Text style={styles.primaryButtonText}>{isDeleting ? 'Deleting...' : 'Delete My Account Forever'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryButton, { opacity: isDeleting ? 0.6 : 1 }]}
          onPress={() => setStep(2)}
          disabled={isDeleting}
        >
          <Text style={styles.primaryButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.cancelButton, { opacity: isDeleting ? 0.6 : 1 }]} onPress={() => navigation.goBack()} disabled={isDeleting}>
          <Text style={styles.cancelButtonText}>Cancel Deletion</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.extraLightGrey }}>
      <MyStatusBar />
      <View
        style={{
          flexDirection: isRtl ? 'row-reverse' : 'row',
          alignItems: 'center',
          paddingVertical: Default.fixPadding * 1.2,
          paddingHorizontal: Default.fixPadding * 2,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name={isRtl ? 'arrow-forward-outline' : 'arrow-back-outline'} size={25} color={Colors.black} />
        </TouchableOpacity>
        <Text style={{ ...Fonts.SemiBold18black, marginHorizontal: Default.fixPadding }}>
          {tr('deleteAccount')}
        </Text>
      </View>

      {/* Progress Steps */}
      <View style={styles.progressSection}>
        <View style={styles.progressSteps}>
          {[1, 2, 3].map((stepNum) => (
            <View key={stepNum} style={styles.stepContainer}>
              <View style={[styles.stepCircle, step >= stepNum && styles.stepCircleActive]}>
                <Text style={[styles.stepNumber, step >= stepNum && styles.stepNumberActive]}>{stepNum}</Text>
              </View>
              {stepNum < 3 && (
                <View style={[styles.stepLine, step > stepNum && styles.stepLineActive]} />
              )}
            </View>
          ))}
        </View>
        <View style={styles.stepLabels}>
          <Text style={styles.stepLabel}>Warning</Text>
          <Text style={styles.stepLabel}>Reason</Text>
          <Text style={styles.stepLabel}>Confirm</Text>
        </View>
      </View>

      <View style={styles.contentContainer}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </View>

      {/* Export Data Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showExportModal}
        onRequestClose={() => setShowExportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons name="download" size={30} color={Colors.blue} />
              <Text style={styles.modalTitle}>Export Your Data</Text>
              <TouchableOpacity 
                onPress={() => setShowExportModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={Colors.grey} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalDescription}>
                Download a copy of your data before deleting your account. Choose what information to include and how you'd like to receive it.
              </Text>

              <View style={styles.exportInfoCard}>
                <MaterialCommunityIcons name="information" size={20} color={Colors.blue} />
                <Text style={styles.exportInfoText}>
                  Your data export will be prepared within 24 hours and remain available for download for 30 days.
                </Text>
              </View>

              <View style={styles.settingSection}>
                <Text style={styles.settingSectionTitle}>Data to Export</Text>
                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <MaterialCommunityIcons name="account" size={24} color={Colors.primary} />
                    <View style={styles.settingTextInfo}>
                      <Text style={styles.settingTitle}>Profile Information</Text>
                      <Text style={styles.settingSubtitle}>Personal details, preferences, settings</Text>
                    </View>
                  </View>
                  <Switch
                    value={exportSettings.profile}
                    onValueChange={(value) => setExportSettings(prev => ({ ...prev, profile: value }))}
                    trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <MaterialCommunityIcons name="message-text" size={24} color={Colors.green} />
                    <View style={styles.settingTextInfo}>
                      <Text style={styles.settingTitle}>Communications</Text>
                      <Text style={styles.settingSubtitle}>Messages, notifications, chat history</Text>
                    </View>
                  </View>
                  <Switch
                    value={exportSettings.communications}
                    onValueChange={(value) => setExportSettings(prev => ({ ...prev, communications: value }))}
                    trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <MaterialCommunityIcons name="home-group" size={24} color={Colors.orange} />
                    <View style={styles.settingTextInfo}>
                      <Text style={styles.settingTitle}>Community Data</Text>
                      <Text style={styles.settingSubtitle}>Society information, member interactions</Text>
                    </View>
                  </View>
                  <Switch
                    value={exportSettings.community}
                    onValueChange={(value) => setExportSettings(prev => ({ ...prev, community: value }))}
                    trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <MaterialCommunityIcons name="file-document" size={24} color={Colors.purple} />
                    <View style={styles.settingTextInfo}>
                      <Text style={styles.settingTitle}>Documents</Text>
                      <Text style={styles.settingSubtitle}>Uploaded files, verification documents</Text>
                    </View>
                  </View>
                  <Switch
                    value={exportSettings.documents}
                    onValueChange={(value) => setExportSettings(prev => ({ ...prev, documents: value }))}
                    trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <MaterialCommunityIcons name="history" size={24} color={Colors.blue} />
                    <View style={styles.settingTextInfo}>
                      <Text style={styles.settingTitle}>Activity Logs</Text>
                      <Text style={styles.settingSubtitle}>Visitor logs, entry records, activity history</Text>
                    </View>
                  </View>
                  <Switch
                    value={exportSettings.logs}
                    onValueChange={(value) => setExportSettings(prev => ({ ...prev, logs: value }))}
                    trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                </View>
              </View>

              <View style={styles.exportOptions}>
                <Text style={styles.settingSectionTitle}>Export Options</Text>
                <TouchableOpacity 
                  style={styles.settingItem}
                  onPress={handleFormatSelect}
                >
                  <View style={styles.settingLeft}>
                    <MaterialCommunityIcons name="file-code" size={24} color={Colors.red} />
                    <View style={styles.settingTextInfo}>
                      <Text style={styles.settingTitle}>Export Format</Text>
                      <Text style={styles.settingSubtitle}>{exportSettings.format.toUpperCase()} format</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
                </TouchableOpacity>

                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <MaterialCommunityIcons name="image" size={24} color={Colors.green} />
                    <View style={styles.settingTextInfo}>
                      <Text style={styles.settingTitle}>Include Media</Text>
                      <Text style={styles.settingSubtitle}>Photos, videos, and attachments</Text>
                    </View>
                  </View>
                  <Switch
                    value={exportSettings.includeMedia}
                    onValueChange={(value) => setExportSettings(prev => ({ ...prev, includeMedia: value }))}
                    trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <MaterialCommunityIcons name="email" size={24} color={Colors.blue} />
                    <View style={styles.settingTextInfo}>
                      <Text style={styles.settingTitle}>Email Delivery</Text>
                      <Text style={styles.settingSubtitle}>Send download link to your email</Text>
                    </View>
                  </View>
                  <Switch
                    value={exportSettings.emailDelivery}
                    onValueChange={(value) => setExportSettings(prev => ({ ...prev, emailDelivery: value }))}
                    trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.modalActionButton}
                onPress={handleExportData}
              >
                <MaterialCommunityIcons name="download" size={18} color={Colors.white} />
                <Text style={styles.modalActionText}>Request Data Export</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Deactivate Account Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDeactivateModal}
        onRequestClose={() => setShowDeactivateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons name="pause-circle" size={30} color={Colors.green} />
              <Text style={styles.modalTitle}>Deactivate Account</Text>
              <TouchableOpacity 
                onPress={() => setShowDeactivateModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={Colors.grey} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalDescription}>
                Temporarily disable your account instead of permanently deleting it. You can reactivate anytime by logging back in.
              </Text>

              <View style={styles.deactivateWarningCard}>
                <MaterialCommunityIcons name="information" size={20} color={Colors.green} />
                <Text style={styles.warningText}>
                  Deactivation is reversible. Your data will be preserved and you can return anytime.
                </Text>
              </View>

              <View style={styles.settingSection}>
                <Text style={styles.settingSectionTitle}>Deactivation Settings</Text>
                <TouchableOpacity 
                  style={styles.settingItem}
                  onPress={handleDurationSelect}
                >
                  <View style={styles.settingLeft}>
                    <MaterialCommunityIcons name="calendar" size={24} color={Colors.orange} />
                    <View style={styles.settingTextInfo}>
                      <Text style={styles.settingTitle}>Duration</Text>
                      <Text style={styles.settingSubtitle}>
                        {deactivateSettings.duration === 'indefinite' 
                          ? 'Until you return' 
                          : `${deactivateSettings.duration} days`
                        }
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
                </TouchableOpacity>

                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <MaterialCommunityIcons name="eye-off" size={24} color={Colors.purple} />
                    <View style={styles.settingTextInfo}>
                      <Text style={styles.settingTitle}>Hide Profile</Text>
                      <Text style={styles.settingSubtitle}>Make your profile invisible to other users</Text>
                    </View>
                  </View>
                  <Switch
                    value={deactivateSettings.hideProfile}
                    onValueChange={(value) => setDeactivateSettings(prev => ({ ...prev, hideProfile: value }))}
                    trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <MaterialCommunityIcons name="bell-off" size={24} color={Colors.red} />
                    <View style={styles.settingTextInfo}>
                      <Text style={styles.settingTitle}>Stop Notifications</Text>
                      <Text style={styles.settingSubtitle}>Pause all app notifications</Text>
                    </View>
                  </View>
                  <Switch
                    value={deactivateSettings.stopNotifications}
                    onValueChange={(value) => setDeactivateSettings(prev => ({ ...prev, stopNotifications: value }))}
                    trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <MaterialCommunityIcons name="pause" size={24} color={Colors.blue} />
                    <View style={styles.settingTextInfo}>
                      <Text style={styles.settingTitle}>Pause Subscriptions</Text>
                      <Text style={styles.settingSubtitle}>Temporarily pause premium features</Text>
                    </View>
                  </View>
                  <Switch
                    value={deactivateSettings.pauseSubscriptions}
                    onValueChange={(value) => setDeactivateSettings(prev => ({ ...prev, pauseSubscriptions: value }))}
                    trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <MaterialCommunityIcons name="database-check" size={24} color={Colors.green} />
                    <View style={styles.settingTextInfo}>
                      <Text style={styles.settingTitle}>Keep Data</Text>
                      <Text style={styles.settingSubtitle}>Preserve all your data for when you return</Text>
                    </View>
                  </View>
                  <Switch
                    value={deactivateSettings.keepData}
                    onValueChange={(value) => setDeactivateSettings(prev => ({ ...prev, keepData: value }))}
                    trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
                    thumbColor={Colors.white}
                    disabled={true} // Always keep data for deactivation
                  />
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <MaterialCommunityIcons name="clock-check" size={24} color={Colors.primary} />
                    <View style={styles.settingTextInfo}>
                      <Text style={styles.settingTitle}>Auto Reactivation</Text>
                      <Text style={styles.settingSubtitle}>Automatically reactivate after duration</Text>
                    </View>
                  </View>
                  <Switch
                    value={deactivateSettings.autoReactivation}
                    onValueChange={(value) => setDeactivateSettings(prev => ({ ...prev, autoReactivation: value }))}
                    trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
                    thumbColor={Colors.white}
                    disabled={deactivateSettings.duration === 'indefinite'}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.modalActionButton}
                onPress={handleDeactivateAccount}
              >
                <MaterialCommunityIcons name="pause-circle" size={18} color={Colors.white} />
                <Text style={styles.modalActionText}>Deactivate Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Contact Support Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showSupportModal}
        onRequestClose={() => setShowSupportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons name="help-circle" size={30} color={Colors.primary} />
              <Text style={styles.modalTitle}>Contact Support</Text>
              <TouchableOpacity 
                onPress={() => setShowSupportModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={Colors.grey} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalDescription}>
                Before deleting your account, let our support team help resolve any issues you're experiencing. We're here to help!
              </Text>

              <View style={styles.supportInfoCard}>
                <MaterialCommunityIcons name="clock" size={20} color={Colors.primary} />
                <Text style={styles.supportInfoText}>
                  Our support team typically responds within 24 hours. Urgent issues are prioritized.
                </Text>
              </View>

              <View style={styles.settingSection}>
                <Text style={styles.settingSectionTitle}>Support Request</Text>
                <TouchableOpacity 
                  style={styles.settingItem}
                  onPress={handleCategorySelect}
                >
                  <View style={styles.settingLeft}>
                    <MaterialCommunityIcons name="tag" size={24} color={Colors.blue} />
                    <View style={styles.settingTextInfo}>
                      <Text style={styles.settingTitle}>Category</Text>
                      <Text style={styles.settingSubtitle}>
                        {supportSettings.category 
                          ? supportSettings.category.charAt(0).toUpperCase() + supportSettings.category.slice(1)
                          : 'Select a category'
                        }
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.settingItem}
                  onPress={() => {
                    const priorityOptions = [
                      { id: 'low', label: 'Low', description: 'General questions (2-3 days)' },
                      { id: 'normal', label: 'Normal', description: 'Standard issues (24 hours)' },
                      { id: 'high', label: 'High', description: 'Important problems (4 hours)' },
                      { id: 'urgent', label: 'Urgent', description: 'Critical issues (2 hours)' },
                    ];

                    Alert.alert(
                      'Select Priority',
                      'How urgent is your issue?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        ...priorityOptions.map(priority => ({
                          text: `${priority.label} - ${priority.description}`,
                          onPress: () => {
                            setSupportSettings(prev => ({ ...prev, priority: priority.id }));
                            Alert.alert('Priority Set', `Priority level set to ${priority.label}`);
                          }
                        }))
                      ]
                    );
                  }}
                >
                  <View style={styles.settingLeft}>
                    <MaterialCommunityIcons 
                      name={supportSettings.priority === 'urgent' ? 'alert' : 
                            supportSettings.priority === 'high' ? 'alert-circle' :
                            supportSettings.priority === 'normal' ? 'information' : 'help-circle'} 
                      size={24} 
                      color={supportSettings.priority === 'urgent' ? Colors.red :
                             supportSettings.priority === 'high' ? Colors.orange :
                             supportSettings.priority === 'normal' ? Colors.blue : Colors.grey} 
                    />
                    <View style={styles.settingTextInfo}>
                      <Text style={styles.settingTitle}>Priority</Text>
                      <Text style={styles.settingSubtitle}>
                        {supportSettings.priority.charAt(0).toUpperCase() + supportSettings.priority.slice(1)} priority
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
                </TouchableOpacity>

                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <MaterialCommunityIcons name="account-details" size={24} color={Colors.green} />
                    <View style={styles.settingTextInfo}>
                      <Text style={styles.settingTitle}>Include Account Info</Text>
                      <Text style={styles.settingSubtitle}>Help us identify your account quickly</Text>
                    </View>
                  </View>
                  <Switch
                    value={supportSettings.includeAccountInfo}
                    onValueChange={(value) => setSupportSettings(prev => ({ ...prev, includeAccountInfo: value }))}
                    trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <MaterialCommunityIcons name="file-chart" size={24} color={Colors.purple} />
                    <View style={styles.settingTextInfo}>
                      <Text style={styles.settingTitle}>Include Debug Logs</Text>
                      <Text style={styles.settingSubtitle}>Help us diagnose technical issues</Text>
                    </View>
                  </View>
                  <Switch
                    value={supportSettings.includeLogs}
                    onValueChange={(value) => setSupportSettings(prev => ({ ...prev, includeLogs: value }))}
                    trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                </View>
              </View>

              <View style={styles.contactMethods}>
                <Text style={styles.settingSectionTitle}>Contact Method</Text>
                <TouchableOpacity 
                  style={[styles.contactMethodItem, supportSettings.contactMethod === 'email' && styles.contactMethodSelected]}
                  onPress={() => setSupportSettings(prev => ({ ...prev, contactMethod: 'email' }))}
                >
                  <MaterialCommunityIcons name="email" size={24} color={supportSettings.contactMethod === 'email' ? Colors.white : Colors.blue} />
                  <View style={styles.contactMethodInfo}>
                    <Text style={[
                      styles.contactMethodTitle, 
                      supportSettings.contactMethod === 'email' && styles.contactMethodTitleSelected
                    ]}>
                      Email Support
                    </Text>
                    <Text style={[
                      styles.contactMethodDesc, 
                      supportSettings.contactMethod === 'email' && styles.contactMethodDescSelected
                    ]}>
                      Detailed responses via email
                    </Text>
                  </View>
                  {supportSettings.contactMethod === 'email' && (
                    <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.contactMethodItem, supportSettings.contactMethod === 'phone' && styles.contactMethodSelected]}
                  onPress={() => setSupportSettings(prev => ({ ...prev, contactMethod: 'phone' }))}
                >
                  <MaterialCommunityIcons name="phone" size={24} color={supportSettings.contactMethod === 'phone' ? Colors.white : Colors.green} />
                  <View style={styles.contactMethodInfo}>
                    <Text style={[styles.contactMethodTitle, supportSettings.contactMethod === 'phone' && styles.contactMethodTitleSelected]}>
                      Phone Support
                    </Text>
                    <Text style={[styles.contactMethodDesc, supportSettings.contactMethod === 'phone' && styles.contactMethodDescSelected]}>
                      Direct phone consultation
                    </Text>
                  </View>
                  {supportSettings.contactMethod === 'phone' && (
                    <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.contactMethodItem, supportSettings.contactMethod === 'chat' && styles.contactMethodSelected]}
                  onPress={() => setSupportSettings(prev => ({ ...prev, contactMethod: 'chat' }))}
                >
                  <MaterialCommunityIcons name="chat" size={24} color={supportSettings.contactMethod === 'chat' ? Colors.white : Colors.orange} />
                  <View style={styles.contactMethodInfo}>
                    <Text style={[styles.contactMethodTitle, supportSettings.contactMethod === 'chat' && styles.contactMethodTitleSelected]}>
                      Live Chat
                    </Text>
                    <Text style={[styles.contactMethodDesc, supportSettings.contactMethod === 'chat' && styles.contactMethodDescSelected]}>
                      Real-time chat support
                    </Text>
                  </View>
                  {supportSettings.contactMethod === 'chat' && (
                    <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalActionButton, { opacity: !supportSettings.category ? 0.6 : 1 }]}
                onPress={handleContactSupport}
                disabled={!supportSettings.category}
              >
                <MaterialCommunityIcons name="send" size={18} color={Colors.white} />
                <Text style={styles.modalActionText}>Submit Support Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DeleteAccountScreen;

const styles = StyleSheet.create({
  progressSection: {
    backgroundColor: Colors.white,
    marginHorizontal: Default.fixPadding * 2,
    marginBottom: Default.fixPadding * 2,
    padding: Default.fixPadding * 1.5,
    borderRadius: 10,
    ...Default.shadow,
  },
  progressSteps: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Default.fixPadding,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.lightGrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: Colors.red,
  },
  stepNumber: {
    ...Fonts.Medium14grey,
  },
  stepNumberActive: {
    ...Fonts.Medium14white,
  },
  stepLine: {
    width: 50,
    height: 2,
    backgroundColor: Colors.lightGrey,
  },
  stepLineActive: {
    backgroundColor: Colors.red,
  },
  stepLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stepLabel: {
    ...Fonts.Medium12grey,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: Default.fixPadding * 2,
  },
  warningSection: {
    backgroundColor: Colors.white,
    padding: Default.fixPadding * 2,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: Default.fixPadding * 2,
    ...Default.shadow,
  },
  warningTitle: {
    ...Fonts.SemiBold18black,
    color: Colors.red,
    marginTop: Default.fixPadding,
    marginBottom: Default.fixPadding * 0.5,
  },
  warningText: {
    ...Fonts.Medium14grey,
    textAlign: 'center',
    lineHeight: 22,
  },
  dataSection: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    marginBottom: Default.fixPadding * 2,
    ...Default.shadow,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Default.fixPadding * 1.5,
    borderBottomWidth: 1,
    borderBottomColor: Colors.extraLightGrey,
  },
  sectionTitle: {
    ...Fonts.SemiBold16black,
    color: Colors.red,
    marginLeft: Default.fixPadding * 0.5,
  },
  sectionTitleAlt: {
    ...Fonts.SemiBold16black,
    color: Colors.orange,
    marginLeft: Default.fixPadding * 0.5,
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Default.fixPadding * 1.5,
    borderBottomWidth: 1,
    borderBottomColor: Colors.extraLightGrey,
  },
  dataInfo: {
    flex: 1,
    marginLeft: Default.fixPadding,
  },
  dataTitle: {
    ...Fonts.Medium15black,
    marginBottom: 2,
  },
  dataDescription: {
    ...Fonts.Medium12grey,
  },
  alternativesSection: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    marginBottom: Default.fixPadding * 2,
    ...Default.shadow,
  },
  alternativeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Default.fixPadding * 1.5,
    borderBottomWidth: 1,
    borderBottomColor: Colors.extraLightGrey,
  },
  alternativeInfo: {
    flex: 1,
    marginLeft: Default.fixPadding,
  },
  alternativeTitle: {
    ...Fonts.Medium15black,
    marginBottom: 2,
  },
  alternativeDescription: {
    ...Fonts.Medium12grey,
  },
  reasonSection: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: Default.fixPadding * 1.5,
    marginBottom: Default.fixPadding * 2,
    ...Default.shadow,
  },
  reasonTitle: {
    ...Fonts.SemiBold18black,
    marginBottom: Default.fixPadding * 0.5,
  },
  reasonSubtitle: {
    ...Fonts.Medium14grey,
    marginBottom: Default.fixPadding * 1.5,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Default.fixPadding,
    borderRadius: 8,
    marginBottom: Default.fixPadding,
    backgroundColor: Colors.extraLightGrey,
  },
  reasonItemSelected: {
    backgroundColor: Colors.red,
  },
  reasonText: {
    ...Fonts.Medium14grey,
    flex: 1,
    marginLeft: Default.fixPadding,
  },
  reasonTextSelected: {
    ...Fonts.Medium14white,
  },
  otherReasonInput: {
    backgroundColor: Colors.extraLightGrey,
    borderRadius: 8,
    padding: Default.fixPadding,
    ...Fonts.Medium14black,
    textAlignVertical: 'top',
  },
  finalSection: {
    backgroundColor: Colors.white,
    padding: Default.fixPadding * 2,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: Default.fixPadding * 2,
    ...Default.shadow,
  },
  finalTitle: {
    ...Fonts.SemiBold18black,
    color: Colors.red,
    marginTop: Default.fixPadding,
    marginBottom: Default.fixPadding * 0.5,
  },
  finalText: {
    ...Fonts.Medium14grey,
    textAlign: 'center',
    lineHeight: 22,
  },
  confirmationSection: {
    backgroundColor: Colors.white,
    padding: Default.fixPadding * 1.5,
    borderRadius: 10,
    marginBottom: Default.fixPadding * 2,
    ...Default.shadow,
  },
  confirmationLabel: {
    ...Fonts.Medium14black,
    marginBottom: Default.fixPadding,
  },
  confirmationInput: {
    backgroundColor: Colors.extraLightGrey,
    borderRadius: 8,
    padding: Default.fixPadding,
    ...Fonts.Medium14black,
  },
  deletingSection: {
    backgroundColor: Colors.white,
    padding: Default.fixPadding * 2,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: Default.fixPadding * 2,
    ...Default.shadow,
  },
  deletingText: {
    ...Fonts.Medium16primary,
    color: Colors.red,
    marginTop: Default.fixPadding,
  },
  deletingSubtext: {
    ...Fonts.Medium12grey,
    marginTop: Default.fixPadding * 0.5,
  },
  actionsSection: {
    paddingBottom: Default.fixPadding * 2,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 1.2,
    borderRadius: 10,
    minHeight: 50,
    width: '100%',
    marginBottom: Default.fixPadding,
    justifyContent: 'center',
    alignItems: 'center',
    ...Default.shadow,
    elevation: 3,
  },
  primaryButtonText: {
    ...Fonts.SemiBold16white,
  },
  cancelButton: {
    backgroundColor: Colors.white,
    paddingVertical: Default.fixPadding,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
    marginBottom: Default.fixPadding * 0.5,
  },
  cancelButtonText: {
    ...Fonts.SemiBold14primary,
  },
  backButton: {
    backgroundColor: Colors.extraLightGrey,
    paddingVertical: Default.fixPadding,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: Default.fixPadding * 0.5,
  },
  backButtonText: {
    ...Fonts.SemiBold14grey,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    width: '90%',
    maxHeight: '85%',
    ...Default.shadow,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Default.fixPadding * 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.extraLightGrey,
  },
  modalTitle: {
    ...Fonts.SemiBold18primary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: Default.fixPadding,
  },
  modalCloseButton: {
    padding: Default.fixPadding * 0.5,
  },
  modalContent: {
    flexGrow: 1,
    padding: Default.fixPadding * 2,
  },
  modalDescription: {
    ...Fonts.Medium14grey,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Default.fixPadding * 2,
  },
  modalFooter: {
    padding: Default.fixPadding * 2,
    borderTopWidth: 1,
    borderTopColor: Colors.extraLightGrey,
  },
  modalActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Default.fixPadding * 1.2,
    borderRadius: 10,
    ...Default.shadow,
    elevation: 2,
  },
  modalActionText: {
    ...Fonts.SemiBold16white,
    marginLeft: Default.fixPadding * 0.5,
  },
  settingSection: {
    backgroundColor: Colors.extraLightGrey + '50',
    borderRadius: 10,
    marginBottom: Default.fixPadding * 1.5,
  },
  settingSectionTitle: {
    ...Fonts.SemiBold16primary,
    marginBottom: Default.fixPadding,
    paddingHorizontal: Default.fixPadding * 1.5,
    paddingTop: Default.fixPadding * 1.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Default.fixPadding * 1.5,
    paddingVertical: Default.fixPadding * 1.2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.extraLightGrey,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextInfo: {
    marginLeft: Default.fixPadding,
    flex: 1,
  },
  settingTitle: {
    ...Fonts.Medium15black,
    marginBottom: 2,
  },
  settingSubtitle: {
    ...Fonts.Medium12grey,
    lineHeight: 18,
  },
  // Export modal specific styles
  exportInfoCard: {
    backgroundColor: Colors.blue + '15',
    padding: Default.fixPadding * 1.5,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Default.fixPadding * 2,
    borderLeftWidth: 4,
    borderLeftColor: Colors.blue,
  },
  exportInfoText: {
    ...Fonts.Medium13grey,
    color: Colors.blue,
    marginLeft: Default.fixPadding,
    flex: 1,
    lineHeight: 20,
  },
  exportOptions: {
    marginTop: Default.fixPadding,
  },
  // Deactivate modal specific styles
  deactivateWarningCard: {
    backgroundColor: Colors.green + '15',
    padding: Default.fixPadding * 1.5,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Default.fixPadding * 2,
    borderLeftWidth: 4,
    borderLeftColor: Colors.green,
  },
  warningText: {
    ...Fonts.Medium13grey,
    color: Colors.green,
    marginLeft: Default.fixPadding,
    flex: 1,
    lineHeight: 20,
  },
  // Support modal specific styles
  supportInfoCard: {
    backgroundColor: Colors.primary + '15',
    padding: Default.fixPadding * 1.5,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Default.fixPadding * 2,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  supportInfoText: {
    ...Fonts.Medium13grey,
    color: Colors.primary,
    marginLeft: Default.fixPadding,
    flex: 1,
    lineHeight: 20,
  },
  contactMethods: {
    marginTop: Default.fixPadding * 1.5,
  },
  contactMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Default.fixPadding * 1.2,
    borderRadius: 10,
    marginBottom: Default.fixPadding,
    backgroundColor: Colors.extraLightGrey,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  contactMethodSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  contactMethodInfo: {
    flex: 1,
    marginLeft: Default.fixPadding,
  },
  contactMethodTitle: {
    ...Fonts.Medium15black,
    marginBottom: 2,
  },
  contactMethodTitleSelected: {
    ...Fonts.Medium15white,
    color: Colors.white,
  },
  contactMethodDesc: {
    ...Fonts.Medium12grey,
  },
  contactMethodDescSelected: {
    ...Fonts.Medium12white,
    color: Colors.white,
  },
});
