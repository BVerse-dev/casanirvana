import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import MyStatusBar from "../components/myStatusBar";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

const TermsOfServiceScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`termsOfServiceScreen:${key}`);
  }

  const [documentInfo] = useState({
    title: "Terms of Service",
    version: "2.1",
    effectiveDate: "July 28, 2024",
    lastUpdated: "July 28, 2024",
    jurisdiction: "United States",
  });
  const backAction = () => {
    navigation.pop();
    return true;
  };
  useEffect(() => {
    const backSub = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backSub.remove();
  }, []);
  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <MyStatusBar />
      <View
        style={{
          flexDirection: isRtl ? "row-reverse" : "row",
          alignItems: "center",
          paddingVertical: Default.fixPadding * 1.2,
          paddingHorizontal: Default.fixPadding * 2,
        }}
      >
        <TouchableOpacity onPress={() => navigation.pop()}>
          <Ionicons
            name={isRtl ? "arrow-forward-outline" : "arrow-back-outline"}
            size={25}
            color={Colors.black}
          />
        </TouchableOpacity>
        <Text
          style={[
            styles.headerTitle,
            { marginHorizontal: Default.fixPadding * 0.8 },
          ]}
        >
          Terms of Service
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {/* Document Info Card */}
        <View style={styles.documentInfoCard}>
          <View style={styles.documentHeader}>
            <MaterialCommunityIcons name="file-document-outline" size={24} color={Colors.primary} />
            <Text style={styles.documentTitle}>Terms of Service</Text>
          </View>
          <View style={styles.documentMeta}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Version:</Text>
              <Text style={styles.metaValue}>{documentInfo.version}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Effective Date:</Text>
              <Text style={styles.metaValue}>{documentInfo.effectiveDate}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Last Updated:</Text>
              <Text style={styles.metaValue}>{documentInfo.lastUpdated}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Jurisdiction:</Text>
              <Text style={styles.metaValue}>{documentInfo.jurisdiction}</Text>
            </View>
          </View>
        </View>

        {/* Terms Content */}
        <View style={styles.contentCard}>
          {/* Section 1 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
            <Text style={styles.sectionContent}>
              By accessing and using the Casa Nirvana Guard application ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </Text>
          </View>

          {/* Section 2 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Service Description</Text>
            <Text style={styles.sectionContent}>
              Casa Nirvana Guard is a mobile application designed to facilitate security management and visitor control for residential communities. The service includes but is not limited to visitor management, emergency alerts, communication tools, and administrative functions for security personnel.
            </Text>
          </View>

          {/* Section 3 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. User Accounts and Responsibilities</Text>
            <Text style={styles.sectionContent}>
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account. Users must provide accurate, current, and complete information during registration and maintain updated information.
            </Text>
          </View>

          {/* Section 4 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Acceptable Use Policy</Text>
            <Text style={styles.sectionContent}>
              You agree not to use the Service to: (a) violate any applicable laws or regulations; (b) infringe on intellectual property rights; (c) transmit harmful, offensive, or inappropriate content; (d) interfere with or disrupt the Service; (e) attempt unauthorized access to systems or data; (f) impersonate others or provide false information.
            </Text>
          </View>

          {/* Section 5 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Privacy and Data Protection</Text>
            <Text style={styles.sectionContent}>
              Your privacy is important to us. Our collection, use, and protection of your personal information is governed by our Privacy Policy, which is incorporated by reference into these Terms. By using the Service, you consent to the collection and use of your information as outlined in our Privacy Policy.
            </Text>
          </View>

          {/* Section 6 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Service Availability</Text>
            <Text style={styles.sectionContent}>
              While we strive to provide continuous service availability, we do not guarantee that the Service will be available at all times. The Service may be subject to maintenance, updates, or interruptions beyond our control. We reserve the right to modify, suspend, or discontinue the Service at any time.
            </Text>
          </View>

          {/* Section 7 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Intellectual Property</Text>
            <Text style={styles.sectionContent}>
              The Service and its original content, features, and functionality are owned by BVerse and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. You may not reproduce, distribute, modify, or create derivative works of our content without express written permission.
            </Text>
          </View>

          {/* Section 8 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Limitation of Liability</Text>
            <Text style={styles.sectionContent}>
              In no event shall BVerse, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.
            </Text>
          </View>

          {/* Section 9 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Indemnification</Text>
            <Text style={styles.sectionContent}>
              You agree to defend, indemnify, and hold harmless BVerse and its licensee and licensors, and their employees, contractors, agents, officers and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees).
            </Text>
          </View>

          {/* Section 10 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. Termination</Text>
            <Text style={styles.sectionContent}>
              We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
            </Text>
          </View>

          {/* Section 11 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>11. Governing Law</Text>
            <Text style={styles.sectionContent}>
              These Terms shall be interpreted and governed by the laws of the United States, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
            </Text>
          </View>

          {/* Section 12 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>12. Changes to Terms</Text>
            <Text style={styles.sectionContent}>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </Text>
          </View>

          {/* Section 13 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>13. Contact Information</Text>
            <Text style={styles.sectionContent}>
              If you have any questions about these Terms of Service, please contact us at:
              {'\n\n'}Email: legal@casanirvana.com
              {'\n'}Phone: +1 (555) 123-CASA
              {'\n'}Address: 123 Community Lane, Suite 100, City, State 12345
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.printButton}
            onPress={() => Alert.alert('Print', 'Print functionality would be implemented here.')}
          >
            <MaterialCommunityIcons name="printer" size={18} color={Colors.primary} />
            <Text style={styles.printButtonText}>Print Document</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => {
              Alert.alert(
                'Terms Acknowledged',
                'Thank you for reviewing our Terms of Service.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            }}
          >
            <MaterialCommunityIcons name="check-circle" size={18} color={Colors.white} />
            <Text style={styles.acceptButtonText}>I Understand</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footerSection}>
          <Text style={styles.footerText}>© 2024 BVerse. All rights reserved.</Text>
          <Text style={styles.footerSubtext}>
            These terms are effective as of {documentInfo.effectiveDate}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default TermsOfServiceScreen;

const styles = StyleSheet.create({
  headerTitle: {
    ...Fonts.SemiBold18black,
    flex: 1,
  },
  scrollContainer: {
    paddingVertical: Default.fixPadding,
  },
  documentInfoCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Default.fixPadding * 2,
    marginBottom: Default.fixPadding * 2,
    borderRadius: 12,
    padding: Default.fixPadding * 1.5,
    ...Default.shadow,
    elevation: 2,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Default.fixPadding,
  },
  documentTitle: {
    ...Fonts.SemiBold18primary,
    marginLeft: Default.fixPadding,
  },
  documentMeta: {
    borderTopWidth: 1,
    borderTopColor: Colors.extraLightGrey,
    paddingTop: Default.fixPadding,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Default.fixPadding * 0.5,
  },
  metaLabel: {
    ...Fonts.Medium14grey,
    flex: 1,
  },
  metaValue: {
    ...Fonts.Medium14black,
    flex: 1,
    textAlign: 'right',
  },
  contentCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Default.fixPadding * 2,
    marginBottom: Default.fixPadding * 2,
    borderRadius: 12,
    padding: Default.fixPadding * 1.5,
    ...Default.shadow,
    elevation: 2,
  },
  section: {
    marginBottom: Default.fixPadding * 2,
  },
  sectionTitle: {
    ...Fonts.SemiBold16primary,
    marginBottom: Default.fixPadding,
    lineHeight: 24,
  },
  sectionContent: {
    ...Fonts.Medium14grey,
    lineHeight: 22,
    textAlign: 'justify',
  },
  actionSection: {
    paddingHorizontal: Default.fixPadding * 2,
    marginBottom: Default.fixPadding * 2,
  },
  printButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: Default.fixPadding,
    borderRadius: 8,
    marginBottom: Default.fixPadding,
    ...Default.shadow,
    elevation: 1,
  },
  printButtonText: {
    ...Fonts.Medium14primary,
    marginLeft: Default.fixPadding * 0.5,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Default.fixPadding * 1.2,
    borderRadius: 8,
    ...Default.shadow,
    elevation: 2,
  },
  acceptButtonText: {
    ...Fonts.SemiBold14white,
    marginLeft: Default.fixPadding * 0.5,
  },
  footerSection: {
    alignItems: 'center',
    paddingHorizontal: Default.fixPadding * 2,
    paddingBottom: Default.fixPadding * 3,
  },
  footerText: {
    ...Fonts.Medium12grey,
    marginBottom: Default.fixPadding * 0.5,
  },
  footerSubtext: {
    ...Fonts.Medium11grey,
    textAlign: 'center',
  },
});
