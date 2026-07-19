import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MyStatusBar from "../components/myStatusBar";

const LicenseAgreementScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() == "rtl";

  const [lastUpdated] = useState("December 15, 2024");
  const [effectiveDate] = useState("January 1, 2025");

  const licenseContent = [
    {
      title: "1. ACCEPTANCE OF TERMS",
      content: `By downloading, installing, or using the Casa Nirvana mobile application ("App"), you agree to be bound by this End User License Agreement ("EULA"). If you do not agree to these terms, do not install or use the App.

This EULA is a legal agreement between you ("User" or "you") and BVerse ("Company," "we," or "us") for the use of the Casa Nirvana community management application.`
    },
    {
      title: "2. GRANT OF LICENSE",
      content: `Subject to your compliance with this EULA, BVerse grants you a limited, non-exclusive, non-transferable, revocable license to:

• Download and install the App on devices you own or control
• Use the App for personal, non-commercial purposes in connection with community management
• Access features and services provided through the App

This license does not grant you any rights to:
• Modify, distribute, or create derivative works of the App
• Reverse engineer, decompile, or disassemble the App
• Remove or alter any proprietary notices or labels`
    },
    {
      title: "3. USER ACCOUNTS AND DATA",
      content: `To use the App, you must create an account and provide accurate information. You are responsible for:

• Maintaining the confidentiality of your account credentials
• All activities that occur under your account
• Ensuring information you provide is accurate and current
• Complying with community guidelines and policies

We reserve the right to suspend or terminate accounts that violate these terms or engage in prohibited activities.`
    },
    {
      title: "4. PERMITTED USES",
      content: `You may use the App for legitimate community management purposes, including:

• Managing visitor access and approvals
• Communicating with community members and management
• Booking amenities and facilities
• Making payments for community services
• Accessing community notices and announcements
• Reporting maintenance issues and complaints
• Managing family member profiles and permissions`
    },
    {
      title: "5. PROHIBITED ACTIVITIES",
      content: `You agree NOT to use the App for:

• Any unlawful purpose or in violation of applicable laws
• Harassment, abuse, or threatening behavior toward other users
• Sharing false, misleading, or defamatory information
• Attempting to gain unauthorized access to systems or data
• Interfering with the App's functionality or security
• Commercial activities without explicit authorization
• Violating the privacy or rights of other community members`
    },
    {
      title: "6. PRIVACY AND DATA PROTECTION",
      content: `Your privacy is important to us. Our collection, use, and protection of your personal information is governed by our Privacy Policy, which is incorporated into this EULA by reference.

Key privacy commitments:
• We collect only necessary information for service provision
• Your data is encrypted and securely stored
• We do not sell personal information to third parties
• You have rights to access, modify, and delete your data
• We comply with applicable data protection regulations`
    },
    {
      title: "7. INTELLECTUAL PROPERTY",
      content: `The App and all related content, features, and functionality are owned by BVerse and protected by intellectual property laws. This includes:

• Software code, algorithms, and architecture
• User interface design and graphics
• Trademarks, logos, and branding
• Documentation and help materials

You acknowledge that no ownership rights are transferred to you under this EULA.`
    },
    {
      title: "8. THIRD-PARTY SERVICES",
      content: `The App may integrate with third-party services including:

• Payment processors (Stripe)
• Cloud storage providers (Supabase)
• Notification services (Expo)
• Maps and location services

Your use of these services is subject to their respective terms and privacy policies. We are not responsible for third-party service availability or performance.`
    },
    {
      title: "9. DISCLAIMERS AND WARRANTIES",
      content: `THE APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM:

• Warranties of merchantability and fitness for a particular purpose
• Guarantees of uninterrupted or error-free operation
• Warranties regarding data accuracy or completeness
• Liability for third-party content or services

We do not warrant that the App will meet your requirements or be compatible with all devices.`
    },
    {
      title: "10. LIMITATION OF LIABILITY",
      content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, BVERSE SHALL NOT BE LIABLE FOR:

• Indirect, incidental, special, or consequential damages
• Loss of profits, data, or business opportunities
• Damages resulting from third-party actions
• Service interruptions or technical failures

Our total liability shall not exceed the amount paid by you for the App in the twelve months preceding the claim.`
    },
    {
      title: "11. UPDATES AND MODIFICATIONS",
      content: `We may update the App and this EULA from time to time. Updates may include:

• New features and functionality
• Security improvements and bug fixes
• Changes to terms and conditions
• Modifications to service offerings

Continued use of the App after updates constitutes acceptance of any changes. We will notify you of material changes through the App or email.`
    },
    {
      title: "12. TERMINATION",
      content: `This EULA remains in effect until terminated. Termination may occur:

• By you, by uninstalling the App and ceasing use
• By us, for violation of terms or discontinuation of service
• Automatically, if you fail to comply with any provision

Upon termination:
• Your license to use the App ceases immediately
• You must delete all copies of the App
• Certain provisions survive termination (limitations, disclaimers)`
    },
    {
      title: "13. GOVERNING LAW AND DISPUTES",
      content: `This EULA is governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to conflict of law principles.

Any disputes arising from this EULA shall be resolved through:
1. Good faith negotiation between parties
2. Binding arbitration if negotiation fails
3. Courts of competent jurisdiction in [Your Jurisdiction]

You waive any right to participate in class action lawsuits.`
    },
    {
      title: "14. CONTACT INFORMATION",
      content: `For questions about this EULA or the App, contact us:

Email: legal@casanirvana.com
Address: BVerse Legal Department
Phone: +1 (555) 123-CASA

We will respond to inquiries within 5 business days.`
    }
  ];

  const handleAccept = () => {
    Alert.alert(
      "License Agreement",
      "Thank you for reviewing our License Agreement. Your continued use of Casa Nirvana indicates acceptance of these terms.",
      [{ text: "OK", onPress: () => navigation.goBack() }]
    );
  };

  const handlePrint = () => {
    Alert.alert(
      "Print License",
      "This will open the license agreement in your browser for printing or saving as PDF.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Open", onPress: () => console.log("Opening license for print...") }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <MyStatusBar />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons
            name={isRtl ? "arrow-forward-outline" : "arrow-back-outline"}
            size={25}
            color={Colors.black}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>License Agreement</Text>
        <TouchableOpacity onPress={handlePrint} style={styles.printButton}>
          <MaterialCommunityIcons name="printer" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Document Info */}
      <View style={styles.documentInfo}>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="file-document" size={20} color={Colors.primary} />
          <Text style={styles.documentTitle}>End User License Agreement (EULA)</Text>
        </View>
        <Text style={styles.documentSubtitle}>Casa Nirvana Community Management App</Text>
        <View style={styles.dateInfo}>
          <Text style={styles.dateText}>Last Updated: {lastUpdated}</Text>
          <Text style={styles.dateText}>Effective: {effectiveDate}</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {licenseContent.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <Text style={styles.footerText}>
            This End User License Agreement was last updated on {lastUpdated} and becomes effective on {effectiveDate}.
          </Text>
          <Text style={styles.footerSubtext}>
            © 2024 BVerse. All rights reserved.
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
          <MaterialCommunityIcons name="check-circle" size={20} color={Colors.white} />
          <Text style={styles.acceptButtonText}>I Understand</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.extraLightGrey,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 1.2,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGrey,
  },
  backButton: {
    padding: Default.fixPadding * 0.5,
  },
  headerTitle: {
    ...Fonts.SemiBold18black,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: Default.fixPadding,
  },
  printButton: {
    padding: Default.fixPadding * 0.5,
  },
  documentInfo: {
    backgroundColor: Colors.white,
    padding: Default.fixPadding * 2,
    marginHorizontal: Default.fixPadding * 2,
    marginTop: Default.fixPadding * 1.5,
    borderRadius: 12,
    ...Default.shadow,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Default.fixPadding * 0.5,
  },
  documentTitle: {
    ...Fonts.SemiBold16primary,
    marginLeft: Default.fixPadding * 0.8,
  },
  documentSubtitle: {
    ...Fonts.Medium14grey,
    marginBottom: Default.fixPadding,
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
  content: {
    flex: 1,
    marginTop: Default.fixPadding * 1.5,
  },
  contentContainer: {
    paddingHorizontal: Default.fixPadding * 2,
    paddingBottom: Default.fixPadding * 2,
  },
  section: {
    backgroundColor: Colors.white,
    padding: Default.fixPadding * 2,
    marginBottom: Default.fixPadding * 1.5,
    borderRadius: 12,
    ...Default.shadow,
  },
  sectionTitle: {
    ...Fonts.SemiBold16black,
    marginBottom: Default.fixPadding,
    color: Colors.primary,
  },
  sectionContent: {
    ...Fonts.Medium14grey,
    lineHeight: 22,
    textAlign: 'justify',
  },
  footer: {
    backgroundColor: Colors.white,
    padding: Default.fixPadding * 2,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: Default.fixPadding,
    ...Default.shadow,
  },
  footerDivider: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.lightGrey,
    marginBottom: Default.fixPadding * 1.5,
  },
  footerText: {
    ...Fonts.Medium14grey,
    textAlign: 'center',
    marginBottom: Default.fixPadding,
    lineHeight: 20,
  },
  footerSubtext: {
    ...Fonts.Medium12grey,
    textAlign: 'center',
  },
  actionButtons: {
    backgroundColor: Colors.white,
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 1.5,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGrey,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Default.fixPadding * 1.2,
    borderRadius: 12,
    ...Default.shadow,
    elevation: 3,
  },
  acceptButtonText: {
    ...Fonts.SemiBold16white,
    marginLeft: Default.fixPadding * 0.8,
  },
});

export default LicenseAgreementScreen;
