import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MyStatusBar from '../components/myStatusBar';
import { Colors, Default, Fonts } from '../constants/styles';

const LicenseAgreementScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  const [hasAccepted, setHasAccepted] = useState(false);

  const documentInfo = {
    title: "End User License Agreement (EULA)",
    version: "1.2",
    effectiveDate: "January 1, 2024",
    lastUpdated: "July 15, 2024",
    applicableRegions: "Ghana, West Africa"
  };

  const handleAcceptance = () => {
    setHasAccepted(true);
    Alert.alert(
      'Agreement Acknowledged',
      'You have acknowledged the End User License Agreement. This does not constitute a binding legal agreement.',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const handlePrint = () => {
    Alert.alert('Print/Export', 'This feature will be available in a future update.');
  };

  return (
    <View style={styles.container}>
      <MyStatusBar />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons
            name={isRtl ? 'arrow-forward-outline' : 'arrow-back-outline'}
            size={25}
            color={Colors.black}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>License Agreement</Text>
        <TouchableOpacity onPress={handlePrint} style={styles.printButton}>
          <MaterialCommunityIcons name="printer" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Document Info */}
        <View style={styles.documentCard}>
          <View style={styles.documentHeader}>
            <MaterialCommunityIcons name="file-document" size={40} color={Colors.primary} />
            <View style={styles.documentInfo}>
              <Text style={styles.documentTitle}>{documentInfo.title}</Text>
              <View style={styles.dateInfo}>
                <Text style={styles.dateText}>Version {documentInfo.version}</Text>
                <Text style={styles.dateText}>Effective: {documentInfo.effectiveDate}</Text>
              </View>
              <View style={styles.dateInfo}>
                <Text style={styles.dateText}>Last Updated: {documentInfo.lastUpdated}</Text>
                <Text style={styles.dateText}>Region: {documentInfo.applicableRegions}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Agreement Content */}
        <View style={styles.contentCard}>
          <Text style={styles.sectionTitle}>1. ACCEPTANCE OF TERMS</Text>
          <Text style={styles.contentText}>
            By downloading, installing, or using the Casa Nirvana Guard application ("App"), you agree to be bound by the terms of this End User License Agreement ("Agreement"). If you do not agree to these terms, do not use the App.
          </Text>

          <Text style={styles.sectionTitle}>2. LICENSE GRANT</Text>
          <Text style={styles.contentText}>
            Subject to your compliance with this Agreement, Casa Nirvana grants you a limited, non-exclusive, non-transferable, revocable license to use the App on your mobile device for security and property management purposes within authorized communities.
          </Text>

          <Text style={styles.sectionTitle}>3. RESTRICTIONS</Text>
          <Text style={styles.contentText}>
            You may not:{'\n'}
            • Reverse engineer, decompile, or disassemble the App{'\n'}
            • Modify, adapt, or create derivative works{'\n'}
            • Distribute, sublicense, or transfer the App{'\n'}
            • Use the App for illegal or unauthorized purposes{'\n'}
            • Interfere with security features or access controls
          </Text>

          <Text style={styles.sectionTitle}>4. DATA AND PRIVACY</Text>
          <Text style={styles.contentText}>
            The App processes sensitive security data including visitor logs, entry records, and community information. You acknowledge that:{'\n'}
            • All data belongs to the property management company{'\n'}
            • You will maintain confidentiality of resident information{'\n'}
            • Data may be monitored for security purposes{'\n'}
            • Privacy practices are governed by our Privacy Policy
          </Text>

          <Text style={styles.sectionTitle}>5. SECURITY RESPONSIBILITIES</Text>
          <Text style={styles.contentText}>
            As a security guard user, you agree to:{'\n'}
            • Maintain the confidentiality of your login credentials{'\n'}
            • Report security incidents promptly{'\n'}
            • Use the App only during authorized work hours{'\n'}
            • Follow all community security protocols{'\n'}
            • Protect resident privacy and safety
          </Text>

          <Text style={styles.sectionTitle}>6. INTELLECTUAL PROPERTY</Text>
          <Text style={styles.contentText}>
            The App and all related materials are protected by intellectual property laws. Casa Nirvana retains all rights, title, and interest in the App, including all copyrights, trademarks, and trade secrets.
          </Text>

          <Text style={styles.sectionTitle}>7. TERMINATION</Text>
          <Text style={styles.contentText}>
            This license terminates automatically upon:{'\n'}
            • Termination of your employment as a security guard{'\n'}
            • Violation of this Agreement{'\n'}
            • Uninstallation of the App{'\n'}
            Upon termination, you must cease all use and delete the App.
          </Text>

          <Text style={styles.sectionTitle}>8. DISCLAIMERS</Text>
          <Text style={styles.contentText}>
            THE APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. CASA NIRVANA DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </Text>

          <Text style={styles.sectionTitle}>9. LIMITATION OF LIABILITY</Text>
          <Text style={styles.contentText}>
            IN NO EVENT SHALL CASA NIRVANA BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE APP, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
          </Text>

          <Text style={styles.sectionTitle}>10. GOVERNING LAW</Text>
          <Text style={styles.contentText}>
            This Agreement is governed by the laws of Ghana. Any disputes shall be resolved in the courts of Accra, Ghana.
          </Text>

          <Text style={styles.sectionTitle}>11. CONTACT INFORMATION</Text>
          <Text style={styles.contentText}>
            For questions about this Agreement, contact:{'\n'}
            Casa Nirvana Legal Department{'\n'}
            Email: legal@casanirvana.com{'\n'}
            Phone: +233 24 000 0000{'\n'}
            Address: Accra, Ghana
          </Text>
        </View>

        {/* Acceptance Section */}
        <View style={styles.acceptanceCard}>
          <View style={styles.acceptanceHeader}>
            <MaterialCommunityIcons 
              name={hasAccepted ? "check-circle" : "information"} 
              size={24} 
              color={hasAccepted ? Colors.green : Colors.primary} 
            />
            <Text style={styles.acceptanceTitle}>
              {hasAccepted ? "Agreement Acknowledged" : "Acknowledgment Required"}
            </Text>
          </View>
          <Text style={styles.acceptanceText}>
            {hasAccepted 
              ? "You have acknowledged this End User License Agreement."
              : "By using the Casa Nirvana Guard app, you acknowledge that you have read and understood this agreement."
            }
          </Text>
          {!hasAccepted && (
            <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptance}>
              <MaterialCommunityIcons name="check-circle" size={20} color={Colors.white} />
              <Text style={styles.acceptButtonText}>I Understand</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default LicenseAgreementScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.extraLightGrey,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 1.2,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  backButton: {
    padding: Default.fixPadding * 0.5,
  },
  headerTitle: {
    ...Fonts.SemiBold18black,
    marginHorizontal: Default.fixPadding,
    flex: 1,
  },
  printButton: {
    padding: Default.fixPadding * 0.5,
  },
  scrollView: {
    flex: 1,
  },
  documentCard: {
    backgroundColor: Colors.white,
    margin: Default.fixPadding * 2,
    borderRadius: 15,
    padding: Default.fixPadding * 2,
    ...Default.shadow,
    elevation: 3,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  documentInfo: {
    flex: 1,
    marginLeft: Default.fixPadding,
  },
  documentTitle: {
    ...Fonts.SemiBold16black,
    marginBottom: Default.fixPadding * 0.5,
  },
  dateInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginTop: Default.fixPadding * 0.5,
  },
  dateText: {
    ...Fonts.Medium12grey,
    flex: 1,
    marginRight: Default.fixPadding * 0.5,
    flexShrink: 1,
  },
  contentCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Default.fixPadding * 2,
    marginBottom: Default.fixPadding * 2,
    borderRadius: 15,
    padding: Default.fixPadding * 2,
    ...Default.shadow,
    elevation: 2,
  },
  sectionTitle: {
    ...Fonts.SemiBold14black,
    color: Colors.primary,
    marginTop: Default.fixPadding * 1.5,
    marginBottom: Default.fixPadding,
  },
  contentText: {
    ...Fonts.Medium14grey,
    lineHeight: 22,
    textAlign: 'justify',
    marginBottom: Default.fixPadding,
  },
  acceptanceCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Default.fixPadding * 2,
    marginBottom: Default.fixPadding * 3,
    borderRadius: 15,
    padding: Default.fixPadding * 2,
    ...Default.shadow,
    elevation: 3,
  },
  acceptanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Default.fixPadding,
  },
  acceptanceTitle: {
    ...Fonts.SemiBold16black,
    marginLeft: Default.fixPadding,
  },
  acceptanceText: {
    ...Fonts.Medium14grey,
    lineHeight: 20,
    marginBottom: Default.fixPadding * 1.5,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Default.fixPadding,
    borderRadius: 10,
    ...Default.shadow,
  },
  acceptButtonText: {
    ...Fonts.SemiBold14white,
    marginLeft: Default.fixPadding * 0.5,
  },
});
