import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, BackHandler, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MyStatusBar from '../components/myStatusBar';
import { Colors, Default, Fonts } from '../constants/styles';

const UserGuideScreen = ({ navigation }) => {
  const { t } = useTranslation();

  const backAction = () => {
    navigation.goBack();
    return true;
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => sub.remove();
  }, []);

  const [selectedSection, setSelectedSection] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Guard-specific User Guide content (UI unchanged)
  const guideData = [
    {
      id: 1,
      title: 'Getting Started (Guard)',
      icon: 'shield-checkmark-outline',
      color: Colors.primary,
      sections: [
        {
          title: 'Welcome to Casa Nirvana Guard App',
          content:
            'This app helps you manage visitor entries, monitor who is inside or waiting, respond to emergencies, and stay on top of notifications — all from the gate.'
        },
        {
          title: 'Start Your Shift',
          content:
            'Make sure your profile is up to date and you are marked on duty at the top of Home and Settings screens.',
          steps: [
            'Open Home to view your gate and society name',
            'Go to Settings → Edit Profile to update your details',
            'Confirm you see “On Duty” status in Settings header',
          ],
        },
        {
          title: 'Quick Setup',
          content:
            'Set your language and enable security before handling entries.',
          steps: [
            'Settings → Language: choose your preferred language',
            'Settings → Notification Settings: keep alerts on',
            'Settings → PIN Code: set a secure lock (optional)',
            'Settings → Biometric Lock: enable if device supports it',
          ],
        },
      ],
    },
    {
      id: 2,
      title: 'Visitor Entry',
      icon: 'person-add-outline',
      color: '#4ECDC4',
      sections: [
        {
          title: 'Confirm Pass/OTP',
          content:
            'Residents can share a 6-digit pass with their visitors. Confirm it quickly from the Home banner.',
          steps: [
            'On Home, enter the 6-digit code under “Visitor Entry”',
            'Tap Confirm to verify',
            'If valid, follow on-screen instructions to allow entry',
          ],
        },
        {
          title: 'New Guest Entry',
          content:
            'Create a new entry when the visitor has no pass. Use appropriate entry type and collect details.',
          steps: [
            'From Home, choose Guest Entry',
            'Fill visitor name/phone; pick arrival time if needed',
            'Select the correct Flat/Unit from Flat No screen',
            'The app rings the resident (Ringing screen)',
            'On approval: visitor is marked Allowed and moved to Inside',
            'If declined: entry is Cancelled and visitor stays out',
          ],
        },
        {
          title: 'Cab / Delivery / Service',
          content:
            'Use the matching entry type for accurate logs and quicker approvals.',
          steps: [
            'Choose Cab Entry, Delivery Entry, or Service Entry on Home',
            'Enter needed details (vehicle/company if applicable)',
            'Select the Flat/Unit and proceed to ring the resident',
            'Follow the resident’s decision to allow or cancel',
          ],
        },
      ],
    },
    {
      id: 3,
      title: 'In-Out Dashboard',
      icon: 'newspaper-outline',
      color: '#45B7D1',
      sections: [
        {
          title: 'Inside Tab',
          content:
            'See all visitors currently inside the premises. Open any card to view details and actions.',
          steps: [
            'Go to In-Out screen',
            'Inside tab shows currently inside visitors',
            'Tap a visitor to view details (call, mark out, etc.)',
          ],
        },
        {
          title: 'Waiting Tab',
          content:
            'See visitors pending approval. They move to Inside after the resident allows entry.',
          steps: [
            'Open the Waiting tab',
            'Tap a visitor to open details and take actions',
            'Ring the resident again if needed or cancel entry',
          ],
        },
      ],
    },
    {
      id: 4,
      title: 'Ringing & Decisions',
      icon: 'call-outline',
      color: '#96CEB4',
      sections: [
        {
          title: 'Ringing the Resident',
          content:
            'The Ringing screen shows the call progress and the resident’s decision.',
          steps: [
            'After selecting a Flat, the app rings the resident',
            'Wait for Allow or Cancel',
            'If no response: retry or ask visitor to wait',
          ],
        },
        {
          title: 'Decision Outcomes',
          content:
            'The app navigates automatically based on the decision for a clear next step.',
          steps: [
            'Allowed: you’ll see Allowed screen; visitor appears in Inside',
            'Cancelled: you’ll see Cancelled screen; deny entry',
            'Escalate to admin if anything seems suspicious',
          ],
        },
      ],
    },
    {
      id: 5,
      title: 'Flats & Units',
      icon: 'home-outline',
      color: '#FFEAA7',
      sections: [
        {
          title: 'Selecting the Correct Flat',
          content:
            'Use the Flat No screen to pick the exact unit. Verify the host name before ringing.',
          steps: [
            'Choose Area/Block tab if available',
            'Search or scroll to find the flat number',
            'Confirm the resident/host name matches the visitor’s purpose',
          ],
        },
      ],
    },
    {
      id: 6,
      title: 'Emergency Handling',
      icon: 'alert-circle-outline',
      color: '#FF7675',
      sections: [
        {
          title: 'Emergency List & Detail',
          content:
            'View active alerts with priority and status chips. Open any alert to see location, reporter, and timeline.',
          steps: [
            'Open Emergency screen to see alerts',
            'Tap an alert to view details and actions',
            'Use priority/status chips to triage quickly',
          ],
        },
        {
          title: 'Take Action',
          content:
            'From the Emergency detail screen, contact admin, call emergency services, start investigation, or mark resolved.',
          steps: [
            'Contact Admin for coordination',
            'Call Emergency if needed',
            'Start Investigation and update status',
            'Mark Resolved once the situation is handled',
          ],
        },
      ],
    },
    {
      id: 7,
      title: 'Notifications',
      icon: 'notifications-outline',
      color: '#DDA0DD',
      sections: [
        {
          title: 'Stay Informed',
          content:
            'The bell icon on Home shows unread count. Open to view all notifications.',
          steps: [
            'Tap the bell on Home to open Notifications',
            'Tap a notification to open its detail (if available)',
            'Swipe left/right to remove older items if needed',
          ],
        },
      ],
    },
    {
      id: 8,
      title: 'Quick Contacts & Calls',
      icon: 'call-outline',
      color: '#45B7D1',
      sections: [
        {
          title: 'Call Admin/Secretary',
          content:
            'Use quick contacts in Settings to reach building admins fast.',
          steps: [
            'Open Settings',
            'Use Call Admin or Call Secretary shortcuts',
            'Or open Call screen for manual dialing if configured',
          ],
        },
      ],
    },
    {
      id: 9,
      title: 'Account & Security',
      icon: 'settings-outline',
      color: '#96CEB4',
      sections: [
        {
          title: 'Protect Your App',
          content:
            'Secure access and keep your data safe with built-in options.',
          steps: [
            'Settings → PIN Code: set or change your PIN',
            'Settings → Biometric Lock: toggle on/off',
            'Settings → Backup & Restore: manage local backups',
            'Settings → App Updates: review latest changes',
            'Settings → Delete Account: use with caution',
          ],
        },
      ],
    },
    {
      id: 10,
      title: 'Help & About',
      icon: 'help-circle-outline',
      color: '#FF6B6B',
      sections: [
        {
          title: 'Get Support',
          content:
            'If you need assistance, contact support from within the app.',
          steps: [
            'Settings → Get Support to open the support form',
            'Describe your issue and submit',
            'For policies, see Privacy Policy and Terms & Conditions',
          ],
        },
        {
          title: 'About This App',
          content:
            'Learn about features, technical info, and the team behind the app.',
          steps: [
            'Settings → About App',
            'View changelog via App Updates',
            'See legal and contact sections for more details',
          ],
        },
      ],
    },
  ];

  const renderSectionCard = (section, index) => (
    <TouchableOpacity
      key={index}
      style={[styles.sectionCard, { borderLeftColor: section.color }]}
      onPress={() => {
        setSelectedSection(section);
        setCurrentStep(0);
      }}
    >
      <View style={styles.sectionHeader}>
        <View style={[styles.iconContainer, { backgroundColor: section.color + '20' }]}>
          <Ionicons name={section.icon} size={24} color={section.color} />
        </View>
        <View style={styles.sectionInfo}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.sectionSubtitle}>
            {section.sections.length} topic{section.sections.length > 1 ? 's' : ''} covered
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
      </View>
    </TouchableOpacity>
  );

  const renderDetailedView = () => {
    if (!selectedSection) return null;
    const section = selectedSection.sections[currentStep];
    return (
      <ScrollView style={styles.detailContainer}>
        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={() => setSelectedSection(null)} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.detailTitle}>{selectedSection.title}</Text>
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Step {currentStep + 1} of {selectedSection.sections.length}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((currentStep + 1) / selectedSection.sections.length) * 100}%`,
                  backgroundColor: selectedSection.color,
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.contentCard}>
          <Text style={styles.contentTitle}>{section.title}</Text>
          <Text style={styles.contentDescription}>{section.content}</Text>

          {section.steps && (
            <View style={styles.stepsContainer}>
              <Text style={styles.stepsTitle}>Step-by-Step Guide:</Text>
              {section.steps.map((step, idx) => (
                <View key={idx} style={styles.stepItem}>
                  <View style={[styles.stepNumber, { backgroundColor: selectedSection.color }]}>
                    <Text style={styles.stepNumberText}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={[styles.navButton, currentStep === 0 && styles.navButtonDisabled]}
            onPress={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            <Ionicons name="chevron-back" size={20} color={currentStep === 0 ? Colors.grey : Colors.primary} />
            <Text style={[styles.navButtonText, currentStep === 0 && styles.navButtonTextDisabled]}>Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, currentStep === selectedSection.sections.length - 1 && styles.navButtonDisabled]}
            onPress={() => setCurrentStep(Math.min(selectedSection.sections.length - 1, currentStep + 1))}
            disabled={currentStep === selectedSection.sections.length - 1}
          >
            <Text style={[styles.navButtonText, currentStep === selectedSection.sections.length - 1 && styles.navButtonTextDisabled]}>Next</Text>
            <Ionicons name="chevron-forward" size={20} color={currentStep === selectedSection.sections.length - 1 ? Colors.grey : Colors.primary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderMainView = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>User Guide</Text>
        <Text style={styles.headerSubtitle}>Learn how to make the most of Casa Nirvana</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Welcome to Your Community App</Text>
          <Text style={styles.welcomeText}>
            This comprehensive guide will help you navigate through all the features of Casa Nirvana. Select any section below to get detailed step-by-step instructions.
          </Text>
        </View>

        <View style={styles.sectionsContainer}>
          {guideData.map((section, index) => renderSectionCard(section, index))}
        </View>

        <View style={styles.supportCard}>
          <MaterialIcons name="support-agent" size={32} color={Colors.primary} />
          <Text style={styles.supportTitle}>Need Additional Help?</Text>
          <Text style={styles.supportText}>
            If you can't find what you're looking for, our support team is always here to help.
          </Text>
          <TouchableOpacity style={styles.supportButton} onPress={() => navigation.navigate('getSupportScreen')}>
            <Text style={styles.supportButtonText}>Contact Support</Text>
            <MaterialIcons name="arrow-forward" size={16} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.screen}>
      <MyStatusBar />
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={backAction} style={styles.headerBackBtn}>
          <Ionicons name="arrow-back-outline" size={25} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitleText}>{selectedSection ? selectedSection.title : 'User Guide'}</Text>
      </View>

      {selectedSection ? renderDetailedView() : renderMainView()}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.extraLightGrey },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Default.fixPadding * 2,
    paddingTop: Default.fixPadding * 1.2,
    paddingBottom: Default.fixPadding * 0.8,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGrey,
  },
  headerBackBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  headerTitleText: {
    ...Fonts.SemiBold18black,
    letterSpacing: 0.2,
    color: Colors.black,
    marginLeft: Default.fixPadding,
    marginBottom: 2,
  },
  container: { flex: 1 },
  headerSection: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 3,
    alignItems: 'center',
  },
  headerTitle: { ...Fonts.SemiBold24black, marginBottom: Default.fixPadding * 0.5, color: Colors.white },
  headerSubtitle: { ...Fonts.Medium16white, opacity: 0.9, textAlign: 'center', color: Colors.white },
  content: { flex: 1, paddingHorizontal: Default.fixPadding * 2, paddingTop: Default.fixPadding * 2 },
  welcomeCard: { backgroundColor: Colors.white, padding: Default.fixPadding * 2, borderRadius: 16, marginBottom: Default.fixPadding * 2, ...Default.shadow },
  welcomeTitle: { ...Fonts.SemiBold18black, marginBottom: Default.fixPadding },
  welcomeText: { ...Fonts.Medium14grey, lineHeight: 22 },
  sectionsContainer: { marginBottom: Default.fixPadding * 2 },
  sectionCard: { backgroundColor: Colors.white, padding: Default.fixPadding * 2, marginBottom: Default.fixPadding * 1.5, borderRadius: 16, borderLeftWidth: 5, ...Default.shadow },
  sectionHeader: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: Default.fixPadding * 1.5 },
  sectionInfo: { flex: 1 },
  sectionTitle: { ...Fonts.SemiBold16black, marginBottom: Default.fixPadding * 0.3 },
  sectionSubtitle: { ...Fonts.Medium12grey },
  detailContainer: { flex: 1 },
  detailHeader: { flexDirection: 'row', alignItems: 'center', padding: Default.fixPadding * 2, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.lightGrey },
  backButton: { marginRight: Default.fixPadding * 1.5, padding: Default.fixPadding * 0.5 },
  detailTitle: { ...Fonts.SemiBold18black, flex: 1 },
  progressContainer: { padding: Default.fixPadding * 2, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.lightGrey },
  progressText: { ...Fonts.Medium14grey, textAlign: 'center', marginBottom: Default.fixPadding },
  progressBar: { height: 6, backgroundColor: Colors.lightGrey, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  contentCard: { backgroundColor: Colors.white, margin: Default.fixPadding * 2, padding: Default.fixPadding * 2, borderRadius: 16, ...Default.shadow },
  contentTitle: { ...Fonts.SemiBold18black, marginBottom: Default.fixPadding * 1.5 },
  contentDescription: { ...Fonts.Medium14grey, lineHeight: 22, marginBottom: Default.fixPadding * 2 },
  stepsContainer: { marginTop: Default.fixPadding },
  stepsTitle: { ...Fonts.SemiBold16black, marginBottom: Default.fixPadding * 1.5 },
  stepItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Default.fixPadding * 1.2 },
  stepNumber: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: Default.fixPadding * 1.2, marginTop: 2 },
  stepNumberText: { ...Fonts.SemiBold14white, fontSize: 12 },
  stepText: { ...Fonts.Medium14black, flex: 1, lineHeight: 20 },
  navigationButtons: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Default.fixPadding * 2, paddingVertical: Default.fixPadding * 1.5, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.lightGrey },
  navButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Default.fixPadding * 2, paddingVertical: Default.fixPadding * 1.2, borderRadius: 12, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.primary, minWidth: 120, justifyContent: 'center' },
  navButtonDisabled: { backgroundColor: Colors.lightGrey, borderColor: Colors.grey },
  navButtonText: { ...Fonts.Medium14primary, marginHorizontal: Default.fixPadding * 0.5 },
  navButtonTextDisabled: { color: Colors.grey },
  supportCard: { backgroundColor: Colors.white, padding: Default.fixPadding * 2.5, borderRadius: 16, alignItems: 'center', marginBottom: Default.fixPadding * 2, ...Default.shadow },
  supportTitle: { ...Fonts.SemiBold18black, marginTop: Default.fixPadding, marginBottom: Default.fixPadding },
  supportText: { ...Fonts.Medium14grey, textAlign: 'center', lineHeight: 22, marginBottom: Default.fixPadding * 2 },
  supportButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, paddingHorizontal: Default.fixPadding * 2, paddingVertical: Default.fixPadding * 1.2, borderRadius: 12, ...Default.shadow },
  supportButtonText: { ...Fonts.Medium14white, fontSize: 16, marginRight: Default.fixPadding * 0.8, color: Colors.white },
});

export default UserGuideScreen;
