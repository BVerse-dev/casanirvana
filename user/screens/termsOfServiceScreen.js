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

const TermsOfServiceScreen = ({ navigation }) => {
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
      "Print Terms of Service",
      "This will open the terms of service in a printable format.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Print", onPress: () => console.log("Print terms of service") }
      ]
    );
  };

  const handleExport = () => {
    Alert.alert(
      "Export Terms of Service",
      "Export these terms as PDF to your device.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Export", onPress: () => console.log("Export terms of service") }
      ]
    );
  };

  // Terms of Service content sections
  const termsContent = [
    {
      title: "1. ACCEPTANCE OF TERMS",
      content: `Welcome to Casa Nirvana Community Management App ("App"), provided by BVerse Technologies ("Company," "we," "us," or "our"). These Terms of Service ("Terms") constitute a legally binding agreement between you and BVerse Technologies.

By accessing or using our App, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree with any part of these Terms, you must not use our App.

**Scope of Agreement:**
• Applies to all users of the Casa Nirvana App
• Covers all features, services, and functionalities
• Includes future updates and modifications
• Governs your relationship with BVerse Technologies

**User Categories:**
• Residents and property owners
• Property managers and administrators
• Service providers and contractors
• Guests and authorized visitors

Your use of the App constitutes acceptance of these Terms as they may be modified from time to time.`
    },
    {
      title: "2. DESCRIPTION OF SERVICE",
      content: `Casa Nirvana is a comprehensive community management platform designed to streamline residential property operations and enhance resident experiences.

**Core Services:**
• Maintenance request management and tracking
• Community communication and announcements
• Visitor management and access control
• Amenity booking and reservation systems
• Payment processing and billing management
• Service provider coordination and scheduling

**Additional Features:**
• Document storage and sharing
• Emergency notification systems
• Community event management
• Complaint resolution workflows
• Resident directory and communication tools
• Integration with property management systems

**Service Availability:**
• 24/7 access to core functionalities
• Regular maintenance windows for updates
• Emergency support for critical issues
• Multi-platform compatibility (iOS, Android)

We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time, with or without notice, though we will make reasonable efforts to provide advance notice of significant changes.`
    },
    {
      title: "3. USER ACCOUNTS AND REGISTRATION",
      content: `To access certain features of the App, you must create an account and provide accurate, complete information.

**Registration Requirements:**
• Valid email address and phone number
• Proof of residency or authorized access
• Government-issued identification for verification
• Acceptance of these Terms and Privacy Policy

**Account Responsibilities:**
• Maintain the confidentiality of your login credentials
• Notify us immediately of any unauthorized account access
• Ensure all account information remains current and accurate
• Use your account only for lawful purposes

**Account Types:**
• Resident accounts for property occupants
• Owner accounts for property owners
• Manager accounts for property management staff
• Service provider accounts for contractors and vendors
• Guest accounts for temporary access

**Account Verification:**
We may require identity verification, proof of residency, or additional documentation to activate or maintain your account. Failure to provide required verification may result in account suspension or termination.

**Account Security:**
You are responsible for all activities that occur under your account. We recommend using strong passwords and enabling two-factor authentication when available.`
    },
    {
      title: "4. ACCEPTABLE USE POLICY",
      content: `You agree to use the App in compliance with all applicable laws and these Terms. Prohibited activities include, but are not limited to:

**Prohibited Content:**
• Harassing, threatening, or abusive communications
• Discriminatory language based on race, religion, gender, or other protected characteristics
• False, misleading, or fraudulent information
• Copyrighted material without proper authorization
• Spam, promotional content, or unsolicited advertisements

**Prohibited Activities:**
• Attempting to gain unauthorized access to other accounts or systems
• Interfering with the App's operation or security measures
• Using automated systems to access or interact with the App
• Reverse engineering, decompiling, or attempting to extract source code
• Creating multiple accounts to circumvent restrictions

**Community Guidelines:**
• Treat all community members with respect and courtesy
• Use appropriate language in all communications
• Respect privacy and confidentiality of other residents
• Follow building rules and community policies
• Report violations or security concerns promptly

**Consequences of Violations:**
• Warning and account restrictions
• Temporary or permanent account suspension
• Removal of content or communications
• Legal action for severe violations
• Cooperation with law enforcement when necessary

We reserve the right to investigate violations and take appropriate action at our sole discretion.`
    },
    {
      title: "5. PRIVACY AND DATA PROTECTION",
      content: `Your privacy is important to us. Our collection, use, and protection of your personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.

**Data Collection:**
• Personal information provided during registration
• Usage data and app interaction patterns
• Communication logs and message content
• Payment and billing information
• Device information and technical data

**Data Use:**
• Provide and improve our services
• Facilitate communication within your community
• Process payments and maintain billing records
• Ensure security and prevent fraud
• Comply with legal obligations

**Data Sharing:**
• With your property management company as necessary
• With service providers to fulfill requests
• With law enforcement when legally required
• With your consent for specific purposes
• In anonymized form for analytics and improvement

**Your Rights:**
• Access and review your personal data
• Request corrections to inaccurate information
• Delete your account and associated data
• Control communication preferences
• Opt-out of certain data uses

**Data Security:**
We implement industry-standard security measures to protect your information, including encryption, secure transmission protocols, and regular security audits.

Please review our complete Privacy Policy for detailed information about our data practices.`
    },
    {
      title: "6. PAYMENT TERMS AND BILLING",
      content: `If you use paid features or services through the App, the following payment terms apply:

**Billing and Payments:**
• Payments processed through secure third-party providers
• Multiple payment methods accepted (credit/debit cards, bank transfers)
• Automatic billing for recurring services
• Electronic receipts provided for all transactions
• Currency based on your location and property requirements

**Fees and Charges:**
• Service fees as disclosed at time of purchase
• Late payment fees for overdue amounts
• Processing fees for certain payment methods
• Refund processing fees where applicable
• Third-party service provider charges

**Subscription Services:**
• Monthly or annual billing cycles
• Automatic renewal unless cancelled
• Pro-rated charges for mid-cycle changes
• Grace period for payment failures
• Service suspension for non-payment

**Refunds and Cancellations:**
• Refund policy varies by service type
• Cancellation effective at end of billing period
• No refunds for partial months unless required by law
• Dispute resolution through payment processor
• Chargeback protection and fraud prevention

**Tax Responsibilities:**
You are responsible for any applicable taxes, duties, or government fees related to your use of paid services.

**Payment Security:**
We do not store complete payment card information. All payment processing is handled by PCI-compliant third-party processors.`
    },
    {
      title: "7. INTELLECTUAL PROPERTY RIGHTS",
      content: `The App and its content are protected by copyright, trademark, and other intellectual property laws.

**Our Intellectual Property:**
• Casa Nirvana name, logo, and branding
• App design, functionality, and user interface
• Software code, algorithms, and technical implementations
• Content, graphics, images, and multimedia elements
• Documentation, help materials, and user guides

**Your License to Use:**
We grant you a limited, non-exclusive, non-transferable license to use the App for its intended purposes, subject to these Terms.

**License Restrictions:**
• No right to copy, modify, or distribute the App
• No right to create derivative works
• No right to reverse engineer or decompile
• No right to remove copyright or proprietary notices
• No right to use our trademarks without permission

**User-Generated Content:**
• You retain ownership of content you create or upload
• You grant us a license to use your content to provide services
• You represent that you have rights to share your content
• You agree not to upload copyrighted material without permission
• We may remove content that violates these Terms

**Third-Party Content:**
• Third-party logos, trademarks, and content remain owned by their respective owners
• Use of third-party content subject to their terms and conditions
• We do not claim ownership of third-party intellectual property
• Report intellectual property violations to our legal team

**DMCA Compliance:**
We respond to valid Digital Millennium Copyright Act (DMCA) takedown notices and have a policy for repeat infringers.`
    },
    {
      title: "8. SERVICE AVAILABILITY AND MAINTENANCE",
      content: `We strive to provide reliable, continuous service, but cannot guarantee uninterrupted availability.

**Service Levels:**
• Target uptime of 99.5% excluding scheduled maintenance
• Regular maintenance windows with advance notice
• Emergency maintenance as needed for security or stability
• Performance monitoring and optimization
• Redundant systems and backup procedures

**Planned Maintenance:**
• Scheduled during low-usage periods when possible
• Advance notification through in-app messages and email
• Estimated duration and affected services disclosed
• Alternative access methods provided when available
• Updates on maintenance progress and completion

**Service Interruptions:**
• Temporary outages due to technical issues
• Third-party service provider disruptions
• Internet connectivity problems
• Force majeure events beyond our control
• Security incidents requiring service suspension

**Backup and Recovery:**
• Regular automated backups of user data
• Disaster recovery procedures and protocols
• Data restoration capabilities
• Geographic redundancy for critical systems
• Recovery time objectives for different service levels

**User Responsibilities:**
• Report service issues promptly
• Keep the App updated to the latest version
• Maintain stable internet connectivity
• Follow recommended device and browser requirements
• Backup important personal data independently

We are not liable for service interruptions beyond our reasonable control or for losses resulting from such interruptions.`
    },
    {
      title: "9. THIRD-PARTY SERVICES AND INTEGRATIONS",
      content: `The App may integrate with or provide access to third-party services and platforms.

**Third-Party Integrations:**
• Payment processors (Stripe, PayPal, Square)
• Cloud storage services (AWS, Google Cloud)
• Communication platforms (email, SMS providers)
• Identity verification services
• Analytics and monitoring tools

**Third-Party Terms:**
• Use of integrated services subject to their own terms
• We do not control third-party service availability
• Third-party privacy policies apply to their data collection
• Changes to third-party services may affect App functionality
• We are not responsible for third-party service failures

**Service Provider Network:**
• Vetted contractors and service professionals
• Independent businesses with their own terms
• Direct contractual relationships between users and providers
• We facilitate connections but do not employ service providers
• Dispute resolution primarily between users and service providers

**External Links:**
• Links to external websites for informational purposes
• We do not endorse or control external content
• External sites have their own privacy policies and terms
• Use caution when providing information to external sites
• Report broken or inappropriate links to our support team

**Data Sharing:**
• Limited data sharing necessary for service functionality
• User consent required for non-essential data sharing
• Compliance with privacy laws and regulations
• Regular review of third-party data practices
• Termination of partnerships for privacy violations

We regularly evaluate our third-party partnerships to ensure they meet our standards for security, privacy, and service quality.`
    },
    {
      title: "10. LIMITATION OF LIABILITY",
      content: `To the fullest extent permitted by law, BVerse Technologies' liability is limited as follows:

**Disclaimer of Warranties:**
• The App is provided "as is" without warranties of any kind
• No guarantee of uninterrupted or error-free service
• No warranty that the App will meet your specific requirements
• No warranty regarding the accuracy of information provided by other users
• No warranty for third-party services or integrations

**Types of Damages Excluded:**
• Indirect, incidental, or consequential damages
• Loss of profits, revenue, or business opportunities
• Loss of data or information
• Personal injury (except as required by law)
• Punitive or exemplary damages

**Limitation Amount:**
Our total liability for any claims arising from your use of the App shall not exceed the greater of:
• $100 USD
• The amount you paid us in the 12 months preceding the claim

**Exceptions to Limitations:**
• Gross negligence or willful misconduct
• Death or personal injury caused by our negligence
• Fraud or fraudulent misrepresentation
• Violations of applicable consumer protection laws
• Other exceptions required by applicable law

**User Responsibility:**
You acknowledge that:
• You use the App at your own risk
• You are responsible for backing up important data
• You should verify information received through the App
• You understand the limitations of digital communication
• You agree to these limitations as a condition of use

These limitations apply regardless of the legal theory under which liability is claimed and survive any termination of these Terms.`
    },
    {
      title: "11. INDEMNIFICATION",
      content: `You agree to defend, indemnify, and hold harmless BVerse Technologies, its officers, directors, employees, agents, and affiliates from and against any claims, liabilities, damages, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising from:

**Your Responsibilities:**
• Your use or misuse of the App
• Your violation of these Terms or applicable laws
• Your infringement of third-party rights
• Content you post or share through the App
• Your interactions with other users or service providers

**Covered Claims:**
• Intellectual property infringement claims
• Privacy or data protection violations
• Defamation or harassment claims
• Property damage or personal injury claims
• Regulatory or compliance violations

**Indemnification Process:**
• Prompt notification of claims
• Cooperation in defense of claims
• Right to participate in defense with counsel of your choice
• Settlement approval requirements
• Reimbursement of reasonable defense costs

**Limitations:**
• Indemnification does not apply to our gross negligence or willful misconduct
• We retain the right to assume defense of any claim
• Settlement negotiations must be conducted in good faith
• Indemnification obligations survive termination of these Terms
• Applicable law may limit or modify indemnification obligations

**Insurance:**
We maintain appropriate insurance coverage for our business operations, but this does not limit your indemnification obligations under these Terms.

This indemnification provision is in addition to, not in lieu of, any other remedies available to us under law or equity.`
    },
    {
      title: "12. TERMINATION",
      content: `These Terms remain in effect until terminated by either party in accordance with the provisions below.

**Termination by You:**
• Delete your account through the App settings
• Contact customer support to request account closure
• Stop using the App and uninstall from your devices
• Effective immediately upon account deletion
• Some obligations survive termination

**Termination by Us:**
• For violation of these Terms or acceptable use policies
• For fraudulent or illegal activities
• For non-payment of fees (after notice and opportunity to cure)
• At our discretion with or without cause (with notice)
• Immediately for serious violations or security threats

**Effect of Termination:**
• Your right to use the App ceases immediately
• Your account and associated data may be deleted
• Outstanding payment obligations remain due
• Certain provisions of these Terms survive termination
• You must uninstall the App from your devices

**Data Retention:**
• Personal data deleted in accordance with our Privacy Policy
• Some data retained for legal compliance purposes
• Backup copies may persist for limited periods
• Anonymous usage data may be retained indefinitely
• You may request expedited data deletion

**Survival of Terms:**
The following provisions survive termination:
• Intellectual property rights
• Limitation of liability
• Indemnification obligations
• Dispute resolution procedures
• Payment obligations

**Reactivation:**
Terminated accounts may be eligible for reactivation at our discretion, subject to verification and compliance with current Terms.`
    },
    {
      title: "13. DISPUTE RESOLUTION",
      content: `We prefer to resolve disputes amicably, but if formal resolution becomes necessary, the following procedures apply:

**Informal Resolution:**
• Contact our customer support team first
• Provide detailed description of the issue
• Allow 30 days for investigation and response
• Participate in good faith discussions
• Document all communications for reference

**Binding Arbitration:**
If informal resolution fails, disputes will be resolved through binding arbitration:
• Administered by the American Arbitration Association (AAA)
• Conducted under AAA Consumer Arbitration Rules
• Single arbitrator selected according to AAA procedures
• Location determined by AAA rules (generally your state of residence)
• Each party bears their own costs and attorney fees

**Arbitration Scope:**
• All disputes arising from or relating to these Terms
• Claims against our officers, directors, employees, or affiliates
• Disputes regarding the App's functionality or your account
• Privacy and data protection claims
• Intellectual property disputes

**Exceptions to Arbitration:**
• Small claims court matters (under jurisdictional limits)
• Injunctive relief for intellectual property violations
• Claims that cannot be arbitrated under applicable law
• Individual claims not brought as class actions
• Disputes requiring immediate court intervention

**Class Action Waiver:**
You agree not to participate in class action lawsuits, class-wide arbitrations, or representative actions against us. All disputes must be brought individually.

**Governing Law:**
These Terms are governed by the laws of California, United States, without regard to conflict of law principles.

**Severability:**
If any provision of this dispute resolution section is found unenforceable, the remainder shall remain in effect.`
    },
    {
      title: "14. CHANGES TO TERMS",
      content: `We may modify these Terms from time to time to reflect changes in our services, legal requirements, or business practices.

**Notification of Changes:**
• Email notification to registered users
• In-app notifications and announcements
• Posted updates on our website
• Version history available upon request
• Prominent notice for material changes

**Types of Changes:**
• Updates to service features and functionality
• Changes in legal or regulatory requirements
• Modifications to payment terms and pricing
• Updates to privacy and data handling practices
• Clarifications based on user feedback

**Effective Date:**
• Changes become effective 30 days after notification
• Immediate effect for legal compliance changes
• Extended notice period for material adverse changes
• Continued use constitutes acceptance
• Right to terminate if you disagree with changes

**Your Options:**
• Review changes and ask questions
• Update your account preferences
• Exercise your rights under the new terms
• Terminate your account if you disagree
• Seek legal advice if needed

**Version Control:**
• Current version always available in the App
• Previous versions archived for reference
• Change log maintained for transparency
• Effective dates clearly indicated
• Contact information for questions

We encourage you to review these Terms periodically to stay informed of any changes. Your continued use of the App following the posting of changes constitutes acceptance of those changes.`
    },
    {
      title: "15. GENERAL PROVISIONS",
      content: `**Entire Agreement:**
These Terms, together with our Privacy Policy and any additional terms for specific features, constitute the entire agreement between you and BVerse Technologies regarding your use of the App.

**Severability:**
If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that the remainder of these Terms remains in full force and effect.

**Assignment:**
You may not assign or transfer your rights or obligations under these Terms without our written consent. We may assign these Terms in connection with a merger, acquisition, or sale of assets.

**No Waiver:**
Our failure to enforce any provision of these Terms does not constitute a waiver of that provision or any other provision. Any waiver must be in writing and signed by an authorized representative.

**Force Majeure:**
We are not liable for any failure or delay in performance due to circumstances beyond our reasonable control, including acts of God, natural disasters, war, terrorism, labor disputes, or government actions.

**Relationship of Parties:**
These Terms do not create a partnership, joint venture, employment, or agency relationship between you and BVerse Technologies. You are an independent user of our services.

**Notices:**
Legal notices will be sent to the email address associated with your account. You are responsible for keeping your contact information current.

**Language:**
These Terms are written in English. Any translations are provided for convenience only, and the English version controls in case of conflicts.

**Contact Information:**
For questions about these Terms of Service:

BVerse Technologies
Email: legal@casanirvana.com
Phone: 1-800-CASA-HELP
Address: 123 Community Drive, Suite 100, Tech City, CA 90210

Thank you for using Casa Nirvana Community Management App. We're committed to providing excellent service while protecting your rights and privacy.`
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
        <Text style={styles.headerTitle}>Terms of Service</Text>
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
          <MaterialCommunityIcons name="file-document-outline" size={20} color={Colors.primary} />
          <Text style={styles.documentTitle}>Terms of Service</Text>
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
        {termsContent.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <Text style={styles.footerText}>
            These Terms of Service were last updated on {lastUpdated} and become effective on {effectiveDate}.
          </Text>
          <Text style={styles.footerSubtext}>
            For questions about these Terms, please contact us at legal@casanirvana.com
          </Text>
          
          {/* Action Buttons */}
          <View style={styles.footerActions}>
            <TouchableOpacity style={styles.contactButton} onPress={() => console.log("Contact legal team")}>
              <MaterialCommunityIcons name="gavel" size={18} color={Colors.white} />
              <Text style={styles.contactButtonText}>Contact Legal Team</Text>
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

export default TermsOfServiceScreen;
