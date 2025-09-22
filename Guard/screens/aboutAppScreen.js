import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MyStatusBar from '../components/myStatusBar';
import { Colors, Default, Fonts } from '../constants/styles';

const AboutAppScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  const [appInfo] = useState({
    name: 'Casa Nirvana',
    version: '2.1.4',
    buildNumber: '214',
    releaseDate: 'July 28, 2024',
    developer: 'BVerse',
    description: 'Your complete community management solution for modern residential living.',
    features: [
      'Community member directory and communication',
      'Service provider management and booking',
      'Maintenance request tracking',
      'Payment and billing management',
      'Emergency contact system',
      'Real-time notifications and chat',
      'Visitor management system',
      'Document management and storage',
    ],
  });

  const [teamMembers] = useState([
    { name: 'Development Team', role: 'Mobile & Backend Development', icon: 'code-tags' },
    { name: 'Design Team', role: 'UI/UX Design & User Research', icon: 'palette' },
    { name: 'QA Team', role: 'Quality Assurance & Testing', icon: 'bug-check' },
    { name: 'Support Team', role: 'Customer Support & Success', icon: 'headset' },
  ]);

  const [technicalSpecs] = useState({
    platform: 'React Native 0.72',
    database: 'Supabase PostgreSQL',
    authentication: 'Supabase Auth',
    storage: 'Supabase Storage',
    payments: 'Stripe Integration',
    notifications: 'Expo Notifications',
    realtime: 'Supabase Realtime',
    deployment: 'Expo Application Services',
  });

  const [legalInfo] = useState([
    { 
      title: 'Privacy Policy', 
      description: 'How we collect, use, and protect your data', 
      screen: 'privacyPolicyScreen',
      icon: 'shield-account',
      color: Colors.blue
    },
    { 
      title: 'Terms of Service', 
      description: 'Terms and conditions for using our app', 
      screen: 'termsOfServiceScreen',
      icon: 'file-document-outline',
      color: Colors.green
    },
    { 
      title: 'License Agreement', 
      description: 'End User License Agreement (EULA)', 
      screen: 'licenseAgreementScreen',
      icon: 'certificate',
      color: Colors.orange
    },
    { 
      title: 'Open Source Licenses', 
      description: 'Third-party libraries and their licenses', 
      screen: 'openSourceLicensesScreen',
      icon: 'open-source-initiative',
      color: Colors.purple || '#9C27B0'
    },
  ]);

  const openWebsite = () => {
    Alert.alert('Visit Website', 'This will open our website in your browser.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open', onPress: () => {} },
    ]);
  };

  const contactSupport = () => {
    Alert.alert('Contact Support', "Choose how you'd like to contact our support team:", [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Email', onPress: () => {} },
      { text: 'Chat', onPress: () => {} },
    ]);
  };

  const shareApp = () => {
    Alert.alert('Share App', 'Share Casa Nirvana with your friends and neighbors!', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Share', onPress: () => {} },
    ]);
  };

  const rateApp = () => {
    Alert.alert('Rate Our App', 'Enjoying Casa Nirvana? Please rate us in the app store!', [
      { text: 'Later', style: 'cancel' },
      { text: 'Rate Now', onPress: () => {} },
    ]);
  };

  const viewChangelog = () => {
    navigation.push('appUpdatesScreen');
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.extraLightGrey }}>
      <MyStatusBar />
      <View style={{
        flexDirection: isRtl ? 'row-reverse' : 'row',
        alignItems: 'center',
        paddingVertical: Default.fixPadding * 1.2,
        paddingHorizontal: Default.fixPadding * 2,
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name={isRtl ? 'arrow-forward-outline' : 'arrow-back-outline'} size={25} color={Colors.black} />
        </TouchableOpacity>
        <Text style={{ ...Fonts.SemiBold18black, marginHorizontal: Default.fixPadding }}>
          About App
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: Default.fixPadding }}>
        <View style={styles.headerSection}>
          <View style={styles.appIcon}>
            <MaterialCommunityIcons name="home-city" size={50} color={Colors.white} />
          </View>
          <Text style={styles.appName}>{appInfo.name}</Text>
          <Text style={styles.appVersion}>Version {appInfo.version} ({appInfo.buildNumber})</Text>
          <Text style={styles.appDescription}>{appInfo.description}</Text>
        </View>

        <View style={styles.quickActionsSection}>
          <TouchableOpacity style={styles.quickAction} onPress={rateApp}>
            <MaterialCommunityIcons name="star" size={24} color={Colors.orange} />
            <Text style={styles.quickActionText}>Rate App</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={shareApp}>
            <MaterialCommunityIcons name="share" size={24} color={Colors.blue} />
            <Text style={styles.quickActionText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={contactSupport}>
            <MaterialCommunityIcons name="help-circle" size={24} color={Colors.green} />
            <Text style={styles.quickActionText}>Support</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={openWebsite}>
            <MaterialCommunityIcons name="web" size={24} color={Colors.primary} />
            <Text style={styles.quickActionText}>Website</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="information" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>App Information</Text>
          </View>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>{appInfo.version}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Build</Text>
              <Text style={styles.infoValue}>{appInfo.buildNumber}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Released</Text>
              <Text style={styles.infoValue}>{appInfo.releaseDate}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Developer</Text>
              <Text style={styles.infoValue}>{appInfo.developer}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.changelogButton} onPress={viewChangelog}>
            <MaterialCommunityIcons name="history" size={20} color={Colors.primary} />
            <Text style={styles.changelogButtonText}>View Changelog</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.featuresSection}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="star-four-points" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Key Features</Text>
          </View>
          {appInfo.features.map((feature, idx) => (
            <View key={idx} style={styles.featureItem}>
              <MaterialCommunityIcons name="check-circle" size={18} color={Colors.green} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <View style={styles.techSection}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="cog" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Technical Specifications</Text>
          </View>
          {Object.entries(technicalSpecs).map(([k, v]) => (
            <View key={k} style={styles.techItem}>
              <Text style={styles.techLabel}>{k.charAt(0).toUpperCase() + k.slice(1).replace('_', ' ')}:</Text>
              <Text style={styles.techValue}>{v}</Text>
            </View>
          ))}
        </View>

        <View style={styles.teamSection}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="account-group" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Development Team</Text>
          </View>
          {teamMembers.map((m, idx) => (
            <View key={idx} style={styles.teamMember}>
              <MaterialCommunityIcons name={m.icon} size={24} color={Colors.primary} />
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{m.name}</Text>
                <Text style={styles.memberRole}>{m.role}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.legalSection}>
          <View style={[styles.sectionHeader, styles.legalSectionHeader]}>
            <View style={styles.legalHeaderIconContainer}>
              <MaterialCommunityIcons name="shield-check" size={22} color={Colors.primary} />
            </View>
            <View style={styles.legalHeaderTextContainer}>
              <Text style={styles.sectionTitle}>Legal & Compliance</Text>
              <Text style={styles.legalSectionSubtitle}>Important documents and policies</Text>
            </View>
          </View>
          {legalInfo.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.legalItem}
              onPress={() => navigation.push(item.screen)}
            >
              <View style={[styles.legalIconContainer, { backgroundColor: item.color + '20' }]}>
                <MaterialCommunityIcons name={item.icon} size={22} color={item.color} />
              </View>
              <View style={styles.legalInfo}>
                <Text style={styles.legalTitle}>{item.title}</Text>
                <Text style={styles.legalDescription}>{item.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.grey} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.contactSection}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="phone-message" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Get in Touch</Text>
          </View>
          <TouchableOpacity style={styles.contactItem} onPress={contactSupport}>
            <MaterialCommunityIcons name="email" size={24} color={Colors.blue} />
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Support Email</Text>
              <Text style={styles.contactValue}>support@casanirvana.com</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.grey} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactItem} onPress={openWebsite}>
            <MaterialCommunityIcons name="web" size={24} color={Colors.green} />
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Website</Text>
              <Text style={styles.contactValue}>www.casanirvana.com</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.grey} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactItem}>
            <MaterialCommunityIcons name="phone" size={24} color={Colors.orange} />
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Support Phone</Text>
              <Text style={styles.contactValue}>+1 (555) 123-CASA</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.grey} />
          </TouchableOpacity>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity style={[styles.actionButton, styles.rateButton]} onPress={rateApp}>
            <MaterialCommunityIcons name="star" size={20} color={Colors.white} />
            <Text style={styles.buttonText}>Rate Our App</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.shareButton]} onPress={shareApp}>
            <MaterialCommunityIcons name="share" size={20} color={Colors.white} />
            <Text style={styles.buttonText}>Share with Friends</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.copyrightSection}>
          <Text style={styles.copyrightText}>© 2024 BVerse</Text>
          <Text style={styles.copyrightSubtext}>All rights reserved</Text>
          <Text style={styles.versionFooter}>Built with ❤️ for modern communities</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default AboutAppScreen;

const styles = StyleSheet.create({
  headerSection: {
    backgroundColor: Colors.white,
    padding: Default.fixPadding * 2.5,
    marginHorizontal: Default.fixPadding * 2,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: Default.fixPadding * 2,
    ...Default.shadow,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Default.fixPadding,
  },
  appName: { ...Fonts.SemiBold24primary, marginBottom: Default.fixPadding * 0.5 },
  appVersion: { ...Fonts.Medium14grey, marginBottom: Default.fixPadding },
  appDescription: { ...Fonts.Medium14grey, textAlign: 'center', lineHeight: 22 },
  quickActionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.white,
    marginHorizontal: Default.fixPadding * 2,
    marginBottom: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 1.5,
    borderRadius: 10,
    ...Default.shadow,
  },
  quickAction: { alignItems: 'center', flex: 1 },
  quickActionText: { ...Fonts.Medium12grey, marginTop: Default.fixPadding * 0.5 },
  infoSection: { backgroundColor: Colors.white, marginHorizontal: Default.fixPadding * 2, marginBottom: Default.fixPadding * 2, borderRadius: 10, ...Default.shadow },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', padding: Default.fixPadding * 1.5, borderBottomWidth: 1, borderBottomColor: Colors.extraLightGrey },
  sectionTitle: { ...Fonts.SemiBold16primary, marginLeft: Default.fixPadding * 0.5 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: Default.fixPadding },
  infoItem: { width: '50%', padding: Default.fixPadding * 0.5 },
  infoLabel: { ...Fonts.Medium12grey, marginBottom: 2 },
  infoValue: { ...Fonts.Medium14black },
  changelogButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', margin: Default.fixPadding, padding: Default.fixPadding, backgroundColor: Colors.primary + '10', borderRadius: 8 },
  changelogButtonText: { ...Fonts.Medium14primary, marginHorizontal: Default.fixPadding * 0.5 },
  featuresSection: { backgroundColor: Colors.white, marginHorizontal: Default.fixPadding * 2, marginBottom: Default.fixPadding * 2, borderRadius: 10, ...Default.shadow },
  featureItem: { flexDirection: 'row', alignItems: 'flex-start', padding: Default.fixPadding * 1.5, borderBottomWidth: 1, borderBottomColor: Colors.extraLightGrey },
  featureText: { ...Fonts.Medium14grey, marginLeft: Default.fixPadding, flex: 1, lineHeight: 20 },
  techSection: { backgroundColor: Colors.white, marginHorizontal: Default.fixPadding * 2, marginBottom: Default.fixPadding * 2, borderRadius: 10, ...Default.shadow },
  techItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Default.fixPadding * 1.5, borderBottomWidth: 1, borderBottomColor: Colors.extraLightGrey },
  techLabel: { ...Fonts.Medium14grey, flex: 1 },
  techValue: { ...Fonts.Medium14black, flex: 1.5, textAlign: 'right' },
  teamSection: { backgroundColor: Colors.white, marginHorizontal: Default.fixPadding * 2, marginBottom: Default.fixPadding * 2, borderRadius: 10, ...Default.shadow },
  teamMember: { flexDirection: 'row', alignItems: 'center', padding: Default.fixPadding * 1.5, borderBottomWidth: 1, borderBottomColor: Colors.extraLightGrey },
  memberInfo: { flex: 1, marginLeft: Default.fixPadding },
  memberName: { ...Fonts.Medium15black, marginBottom: 2 },
  memberRole: { ...Fonts.Medium12grey },
  legalSection: { backgroundColor: Colors.white, marginHorizontal: Default.fixPadding * 2, marginBottom: Default.fixPadding * 2, borderRadius: 10, ...Default.shadow },
  legalSectionHeader: {
    backgroundColor: Colors.primary + '08',
    paddingVertical: Default.fixPadding * 1.8,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  legalHeaderIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Default.fixPadding,
  },
  legalHeaderTextContainer: {
    flex: 1,
  },
  legalSectionSubtitle: {
    ...Fonts.Medium12grey,
    marginTop: 2,
    opacity: 0.8,
  },
  legalItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: Default.fixPadding * 1.5, 
    borderBottomWidth: 1, 
    borderBottomColor: Colors.extraLightGrey,
  },
  legalIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Default.fixPadding * 1.2,
  },
  legalInfo: { flex: 1 },
  legalTitle: { ...Fonts.Medium15black, marginBottom: 2 },
  legalDescription: { ...Fonts.Medium12grey },
  contactSection: { backgroundColor: Colors.white, marginHorizontal: Default.fixPadding * 2, marginBottom: Default.fixPadding * 2, borderRadius: 10, ...Default.shadow },
  contactItem: { flexDirection: 'row', alignItems: 'center', padding: Default.fixPadding * 1.5, borderBottomWidth: 1, borderBottomColor: Colors.extraLightGrey },
  contactInfo: { flex: 1, marginLeft: Default.fixPadding },
  contactTitle: { ...Fonts.Medium15black, marginBottom: 2 },
  contactValue: { ...Fonts.Medium12primary },
  actionsSection: { paddingHorizontal: Default.fixPadding * 2, marginBottom: Default.fixPadding * 2 },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 1.2,
    borderRadius: 10,
    minHeight: 50,
    width: '100%',
    marginBottom: Default.fixPadding,
    ...Default.shadow,
    elevation: 3,
  },
  rateButton: {
    backgroundColor: Colors.primary,
  },
  shareButton: {
    backgroundColor: Colors.primary,
  },
  buttonText: { 
    ...Fonts.SemiBold16white, 
    marginLeft: Default.fixPadding * 0.5,
    color: Colors.white,
  },
  copyrightSection: { alignItems: 'center', paddingVertical: Default.fixPadding * 2, paddingHorizontal: Default.fixPadding * 2 },
  copyrightText: { ...Fonts.Medium14grey, marginBottom: Default.fixPadding * 0.5 },
  copyrightSubtext: { ...Fonts.Medium12grey, marginBottom: Default.fixPadding },
  versionFooter: { ...Fonts.Medium12grey, fontStyle: 'italic' },
});
