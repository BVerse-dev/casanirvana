import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MyStatusBar from '../components/myStatusBar';
import { Colors, Default, Fonts } from '../constants/styles';
import AwesomeButton from 'react-native-really-awesome-button';

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

  const exportData = () => {
    Alert.alert(
      'Export Data',
      'Your data will be prepared and sent to your registered email address within 24 hours.',
      [{ text: 'OK' }]
    );
  };

  const contactSupport = () => {
    Alert.alert(
      'Contact Support',
      "Need help before deleting your account? Our support team is here to assist you.",
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Contact Support', onPress: () => console.log('Opening support...') },
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
        <TouchableOpacity style={styles.alternativeItem} onPress={exportData}>
          <MaterialCommunityIcons name="download" size={24} color={Colors.blue} />
          <View style={styles.alternativeInfo}>
            <Text style={styles.alternativeTitle}>Export Your Data</Text>
            <Text style={styles.alternativeDescription}>Download a copy of your data before deleting</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.alternativeItem}>
          <MaterialCommunityIcons name="pause-circle" size={24} color={Colors.green} />
          <View style={styles.alternativeInfo}>
            <Text style={styles.alternativeTitle}>Deactivate Account</Text>
            <Text style={styles.alternativeDescription}>Temporarily disable your account instead</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.alternativeItem} onPress={contactSupport}>
          <MaterialCommunityIcons name="help-circle" size={24} color={Colors.primary} />
          <View style={styles.alternativeInfo}>
            <Text style={styles.alternativeTitle}>Contact Support</Text>
            <Text style={styles.alternativeDescription}>Let us help resolve any issues you're facing</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
        </TouchableOpacity>
      </View>

      <View style={styles.actionsSection}>
        <AwesomeButton
          style={styles.actionButton}
          height={50}
          onPress={() => setStep(2)}
          backgroundColor={Colors.primary}
          borderRadius={10}
          stretch
        >
          <Text style={styles.primaryButtonText}>Continue with Deletion</Text>
        </AwesomeButton>
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
        <AwesomeButton
          style={styles.actionButton}
          height={50}
          onPress={() => setStep(3)}
          backgroundColor={Colors.primary}
          borderRadius={10}
          stretch
        >
          <Text style={styles.primaryButtonText}>Proceed to Final Step</Text>
        </AwesomeButton>
        <AwesomeButton
          style={styles.actionButton}
          height={50}
          onPress={() => setStep(1)}
          backgroundColor={Colors.primary}
          borderRadius={10}
          stretch
        >
          <Text style={styles.primaryButtonText}>Back</Text>
        </AwesomeButton>
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
        <AwesomeButton
          style={styles.actionButton}
          height={50}
          onPress={confirmDeletion}
          backgroundColor={Colors.primary}
          borderRadius={10}
          disabled={isDeleting || confirmationText.toLowerCase() !== 'delete my account'}
          stretch
        >
          <Text style={styles.primaryButtonText}>{isDeleting ? 'Deleting...' : 'Delete My Account Forever'}</Text>
        </AwesomeButton>
        <AwesomeButton
          style={styles.actionButton}
          height={50}
          onPress={() => setStep(2)}
          backgroundColor={Colors.primary}
          borderRadius={10}
          disabled={isDeleting}
          stretch
        >
          <Text style={styles.primaryButtonText}>Back</Text>
        </AwesomeButton>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()} disabled={isDeleting}>
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
  actionButton: {
    width: '100%',
    marginBottom: Default.fixPadding,
  },
  primaryButtonText: {
    ...Fonts.SemiBold18white,
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
});
