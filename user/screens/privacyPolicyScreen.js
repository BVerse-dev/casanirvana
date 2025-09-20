import React, { useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  ScrollView,
  Alert,
} from "react-native";
import MyStatusBar from "../components/myStatusBar";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

const PrivacyPolicyScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() == "rtl";

  // Current date for document versioning
  const lastUpdated = "December 15, 2024";
  const effectiveDate = "January 1, 2025";

  const backAction = () => {
    navigation.pop();
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => {
      const subscription = BackHandler.addEventListener("hardwareBackPress", backAction);
      return () => subscription?.remove();
    };
  }, []);

  const handlePrint = () => {
    Alert.alert(
      "Print Privacy Policy",
      "This will open the privacy policy in a printable format.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Print", onPress: () => console.log("Print privacy policy") }
      ]
    );
  };

  const handleExport = () => {
    Alert.alert(
      "Export Privacy Policy",
      "Export this privacy policy as PDF to your device.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Export", onPress: () => console.log("Export privacy policy") }
      ]
    );
  };

  // Privacy Policy content sections
  const privacyContent = [
    {
      title: "1. INTRODUCTION",
      content: `Welcome to Casa Nirvana Community Management App ("we," "our," or "us"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and related services.

We are committed to protecting your privacy and ensuring transparency about our data practices. This policy applies to all users of our community management platform, including residents, property managers, service providers, and community administrators.

By using our App, you agree to the collection and use of information in accordance with this Privacy Policy. If you do not agree with our policies and practices, please do not use our App.`
    },
    {
      title: "2. INFORMATION WE COLLECT",
      content: `We collect several types of information from and about users of our App:

**Personal Information:**
• Name, email address, phone number
• Residential address and unit information
• Government-issued ID for verification
• Emergency contact information
• Profile photos and documents

**Community Data:**
• Maintenance requests and service history
• Payment information and billing records
• Visitor logs and guest registrations
• Amenity bookings and usage patterns
• Communication logs and messages

**Technical Information:**
• Device information (model, OS, unique identifiers)
• IP address and location data
• App usage analytics and performance metrics
• Push notification tokens
• Camera and photo access (with permission)

**Financial Information:**
• Payment method details (encrypted)
• Transaction history and receipts
• Outstanding balances and payment status
• Service provider billing information`
    },
    {
      title: "3. HOW WE COLLECT INFORMATION",
      content: `We collect information through various methods:

**Direct Collection:**
• Information you provide during account registration
• Data entered when submitting maintenance requests
• Details shared in community communications
• Photos uploaded for service requests
• Payment information during transactions

**Automatic Collection:**
• Device and usage analytics
• Location data (with permission)
• App performance and crash reports
• Push notification interactions
• Camera and microphone access (when authorized)

**Third-Party Sources:**
• Property management systems integration
• Service provider platforms
• Payment processors (Stripe, PayPal)
• Identity verification services
• Public records for address verification`
    },
    {
      title: "4. HOW WE USE YOUR INFORMATION",
      content: `We use collected information for the following purposes:

**Service Delivery:**
• Facilitate community management operations
• Process maintenance requests and work orders
• Enable communication between residents and management
• Manage visitor access and security systems
• Process payments and billing

**Account Management:**
• Create and maintain user accounts
• Verify identity and residential status
• Provide customer support and assistance
• Send important service notifications
• Manage user preferences and settings

**Improvement and Analytics:**
• Analyze app usage and performance
• Develop new features and enhancements
• Conduct user experience research
• Generate community insights and reports
• Optimize service delivery processes

**Legal and Security:**
• Comply with legal obligations
• Prevent fraud and unauthorized access
• Enforce our Terms of Service
• Protect user safety and security
• Respond to legal requests and investigations`
    },
    {
      title: "5. INFORMATION SHARING AND DISCLOSURE",
      content: `We may share your information in the following circumstances:

**Within Your Community:**
• Basic contact information with property management
• Maintenance request details with service providers
• Emergency contact information with security personnel
• Community announcements and notifications
• Visitor information with front desk staff

**Service Providers:**
• Payment processors for transaction handling
• Cloud storage providers for data hosting
• Analytics services for app improvement
• Customer support platforms
• Identity verification services

**Legal Requirements:**
• Compliance with court orders or legal processes
• Response to government investigations
• Protection of our rights and property
• Prevention of illegal activities
• Emergency situations requiring disclosure

**Business Transfers:**
• Merger, acquisition, or sale of assets
• Bankruptcy or reorganization proceedings
• Due diligence processes (with confidentiality agreements)

We do not sell, rent, or trade your personal information to third parties for marketing purposes.`
    },
    {
      title: "6. DATA SECURITY",
      content: `We implement comprehensive security measures to protect your information:

**Technical Safeguards:**
• End-to-end encryption for sensitive data
• Secure SSL/TLS connections for all transmissions
• Regular security audits and penetration testing
• Multi-factor authentication options
• Automated backup and disaster recovery systems

**Operational Security:**
• Employee background checks and training
• Role-based access controls and permissions
• Regular security awareness programs
• Incident response and breach notification procedures
• Third-party security assessments

**Physical Security:**
• Secure data centers with 24/7 monitoring
• Biometric access controls
• Environmental controls and redundancies
• Visitor access logs and restrictions

Despite our efforts, no security system is impenetrable. We cannot guarantee absolute security of your information.`
    },
    {
      title: "7. DATA RETENTION",
      content: `We retain your information for different periods based on the type of data and legal requirements:

**Account Information:**
• Retained while your account is active
• Archived for 7 years after account closure
• Essential records kept for legal compliance
• Anonymized data may be retained indefinitely

**Transaction Records:**
• Financial records kept for 7 years minimum
• Payment information deleted after legal retention periods
• Tax-related documents retained per regulations
• Audit trails maintained for compliance

**Communication Data:**
• Messages and notifications kept for 2 years
• Emergency communications retained for 5 years
• Legal correspondence kept indefinitely
• Service requests archived for 3 years

**Technical Data:**
• Usage analytics retained for 2 years
• Security logs kept for 1 year
• Performance data retained for 6 months
• Crash reports deleted after resolution

You may request deletion of your personal information, subject to legal and operational requirements.`
    },
    {
      title: "8. YOUR PRIVACY RIGHTS",
      content: `You have several rights regarding your personal information:

**Access Rights:**
• Request copies of your personal data
• Obtain information about data processing
• Receive data in a portable format
• Review data sharing practices

**Control Rights:**
• Update or correct inaccurate information
• Delete personal data (subject to limitations)
• Restrict processing for specific purposes
• Object to certain data uses

**Communication Preferences:**
• Opt-out of marketing communications
• Control push notification settings
• Manage email preferences
• Choose communication channels

**California Residents (CCPA):**
• Right to know about data collection and use
• Right to delete personal information
• Right to opt-out of sale (we don't sell data)
• Right to non-discrimination for exercising rights

**European Residents (GDPR):**
• All rights listed above
• Right to data portability
• Right to lodge complaints with supervisory authorities
• Right to withdraw consent

To exercise these rights, contact us at privacy@casanirvana.com or through the App's settings.`
    },
    {
      title: "9. CHILDREN'S PRIVACY",
      content: `Our App is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.

**Child Safety Measures:**
• Age verification during registration
• Parental consent requirements for minors
• Limited data collection for family accounts
• Enhanced privacy protections for households with children

**Family Accounts:**
• Parents/guardians control minor's access
• Limited information sharing for minors
• Parental oversight of communications
• Age-appropriate content and features

If we discover that we have collected information from a child under 13 without parental consent, we will promptly delete such information. Parents who believe their child has provided information to us should contact us immediately.`
    },
    {
      title: "10. INTERNATIONAL DATA TRANSFERS",
      content: `Your information may be transferred to and processed in countries other than your country of residence:

**Transfer Safeguards:**
• Adequacy decisions by relevant authorities
• Standard contractual clauses for protection
• Privacy Shield certification (where applicable)
• Binding corporate rules for internal transfers

**Data Processing Locations:**
• Primary servers located in secure U.S. data centers
• Backup systems in multiple geographic regions
• Service providers may process data internationally
• Cloud storage with global redundancy

**Your Rights:**
• Information about transfer destinations
• Copies of safeguards in place
• Right to object to certain transfers
• Local representative contacts where required

We ensure that all international transfers comply with applicable privacy laws and provide adequate protection for your personal information.`
    },
    {
      title: "11. COOKIES AND TRACKING TECHNOLOGIES",
      content: `We use various technologies to collect and store information:

**Types of Technologies:**
• Session cookies for app functionality
• Persistent cookies for user preferences
• Local storage for offline capabilities
• Analytics tools for usage insights
• Crash reporting tools for app stability

**Purpose of Use:**
• Maintain user sessions and login status
• Remember user preferences and settings
• Analyze app performance and usage patterns
• Provide personalized content and features
• Improve security and prevent fraud

**Your Choices:**
• Control cookie settings in your device browser
• Opt-out of analytics tracking
• Disable location tracking
• Manage push notification preferences
• Clear stored data through app settings

Third-party analytics providers may use their own tracking technologies. Please review their privacy policies for more information.`
    },
    {
      title: "12. THIRD-PARTY LINKS AND SERVICES",
      content: `Our App may contain links to third-party websites and integrate with external services:

**Third-Party Services:**
• Payment processors (Stripe, PayPal, Square)
• Identity verification providers
• Cloud storage services
• Analytics and monitoring tools
• Social media platforms

**Data Sharing:**
• Limited to necessary operational data
• Governed by separate privacy policies
• Subject to your explicit consent
• Regularly reviewed for compliance

**Your Responsibility:**
• Review third-party privacy policies
• Understand data sharing implications
• Make informed choices about connections
• Report concerns about third-party practices

We are not responsible for the privacy practices of third-party services. We encourage you to review their privacy policies before providing any information.`
    },
    {
      title: "13. CHANGES TO THIS PRIVACY POLICY",
      content: `We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements:

**Notification of Changes:**
• Email notifications for material changes
• In-app notifications and announcements
• Posted updates on our website
• Version history available upon request

**Types of Changes:**
• Updates to data collection practices
• Changes in legal requirements
• New features or services
• Enhanced security measures
• Clarifications based on user feedback

**Your Options:**
• Review changes and ask questions
• Update your privacy preferences
• Exercise your rights under the new policy
• Discontinue use if you disagree with changes

Continued use of the App after changes constitutes acceptance of the updated Privacy Policy. We encourage regular review of this document.`
    },
    {
      title: "14. CONTACT INFORMATION",
      content: `For questions, concerns, or requests regarding this Privacy Policy or our data practices:

**Primary Contact:**
BVerse Privacy Team
Email: privacy@casanirvana.com
Phone: 1-800-CASA-HELP (1-800-227-2435)

**Mailing Address:**
BVerse Technologies
Attn: Privacy Officer
123 Community Drive, Suite 100
Tech City, CA 90210
United States

**Data Protection Officer:**
Email: dpo@casanirvana.com
Available Monday-Friday, 9 AM - 6 PM PST

**Response Times:**
• General inquiries: 2-3 business days
• Data access requests: 30 days maximum
• Security concerns: 24 hours
• Legal matters: As required by law

We are committed to addressing your privacy concerns promptly and transparently.`
    }
  ];

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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleExport} style={styles.actionButton}>
            <MaterialCommunityIcons name="download" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePrint} style={styles.printButton}>
            <MaterialCommunityIcons name="printer" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Document Info */}
      <View style={styles.documentInfo}>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="shield-account" size={20} color={Colors.primary} />
          <Text style={styles.documentTitle}>Privacy Policy</Text>
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
        {privacyContent.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <Text style={styles.footerText}>
            This Privacy Policy was last updated on {lastUpdated} and becomes effective on {effectiveDate}.
          </Text>
          <Text style={styles.footerSubtext}>
            For questions about this Privacy Policy, please contact us at privacy@casanirvana.com
          </Text>
          
          {/* Action Buttons */}
          <View style={styles.footerActions}>
            <TouchableOpacity style={styles.contactButton} onPress={() => console.log("Contact privacy team")}>
              <MaterialCommunityIcons name="email" size={18} color={Colors.white} />
              <Text style={styles.contactButtonText}>Contact Privacy Team</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: Colors.regularGrey,
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
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  actionButton: {
    padding: Default.fixPadding * 0.5,
    marginRight: Default.fixPadding * 0.5,
  },
  printButton: {
    padding: Default.fixPadding * 0.5,
  },
  documentInfo: {
    backgroundColor: Colors.white,
    marginHorizontal: Default.fixPadding * 2,
    marginTop: Default.fixPadding * 1.5,
    padding: Default.fixPadding * 2,
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
    marginBottom: Default.fixPadding * 1.5,
  },
  footerActions: {
    width: '100%',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Default.fixPadding * 1.2,
    paddingHorizontal: Default.fixPadding * 2,
    borderRadius: 10,
    ...Default.shadow,
  },
  contactButtonText: {
    ...Fonts.SemiBold16white,
    marginLeft: Default.fixPadding * 0.8,
  },
};

export default PrivacyPolicyScreen;