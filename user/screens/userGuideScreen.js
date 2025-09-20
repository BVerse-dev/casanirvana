import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";
import MyStatusBar from "../components/myStatusBar";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const UserGuideScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() == "rtl";
  const [selectedSection, setSelectedSection] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  function tr(key) {
    return t(`userGuideScreen:${key}`) || key;
  }

  const backAction = () => {
    navigation.goBack();
    return true;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, []);

  const guideData = [
    {
      id: 1,
      title: "Getting Started",
      icon: "rocket-outline",
      color: Colors.primary,
      sections: [
        {
          title: "Welcome to Casa Nirvana",
          content: "Casa Nirvana is your comprehensive community management app that helps you connect with neighbors, manage visitors, stay updated with notices, and access various community services.",
        },
        {
          title: "Creating Your Profile",
          content: "Complete your profile with accurate information including your unit details, contact information, and family members. This helps in better community management.",
          steps: [
            "Go to Profile section",
            "Add your personal information",
            "Add family members",
            "Upload profile picture",
            "Verify your unit details"
          ]
        },
        {
          title: "Joining Your Community",
          content: "Connect with your society by sending a join request. Admin approval is required for security.",
          steps: [
            "Search for your society",
            "Select your unit",
            "Submit join request",
            "Wait for admin approval",
            "Start using community features"
          ]
        }
      ]
    },
    {
      id: 2,
      title: "Members & Community",
      icon: "people-outline",
      color: "#FF6B6B",
      sections: [
        {
          title: "Connect with Neighbors",
          content: "View and connect with other society members. See who lives in your community and build relationships.",
          steps: [
            "Navigate to Members section",
            "Browse member directory",
            "View member profiles",
            "Send connection requests",
            "Chat with approved members"
          ]
        },
        {
          title: "Family Management",
          content: "Add family members to your account for better visitor management and community access.",
          steps: [
            "Go to Profile → Family Members",
            "Add family member details",
            "Upload their photos",
            "Set permissions",
            "Generate family member passes"
          ]
        }
      ]
    },
    {
      id: 3,
      title: "Visitor Management",
      icon: "person-add-outline",
      color: "#4ECDC4",
      sections: [
        {
          title: "Pre-approve Visitors",
          content: "Create visitor passes in advance for smooth entry experience.",
          steps: [
            "Go to Visitors section",
            "Select 'New Visitor Pass'",
            "Enter visitor details",
            "Set visit date and time",
            "Add purpose of visit",
            "Send pass to visitor"
          ]
        },
        {
          title: "Frequent Visitors",
          content: "Add regular visitors like domestic help, delivery persons, and service providers.",
          steps: [
            "Go to Visitors → Frequent Visitors",
            "Add visitor details",
            "Set visit schedule",
            "Upload visitor photo",
            "Approve recurring visits"
          ]
        }
      ]
    },
    {
      id: 4,
      title: "Notice Board",
      icon: "newspaper-outline",
      color: "#45B7D1",
      sections: [
        {
          title: "Stay Updated",
          content: "Keep track of important society announcements, events, and notifications.",
          steps: [
            "Check Notice Board regularly",
            "Read society announcements",
            "View event details",
            "Like and comment on notices",
            "Share important updates"
          ]
        }
      ]
    },
    {
      id: 5,
      title: "Payments & Billing",
      icon: "card-outline",
      color: "#96CEB4",
      sections: [
        {
          title: "Online Payments",
          content: "Pay maintenance fees, utility bills, and other charges conveniently.",
          steps: [
            "Go to Payment section",
            "View pending bills",
            "Select payment method",
            "Complete payment",
            "Download receipt"
          ]
        }
      ]
    },
    {
      id: 6,
      title: "Amenities Booking",
      icon: "basketball-outline",
      color: "#FFEAA7",
      sections: [
        {
          title: "Book Facilities",
          content: "Reserve community amenities like gym, swimming pool, club house, and sports facilities.",
          steps: [
            "Go to Amenities section",
            "Select desired facility",
            "Choose date and time",
            "Check availability",
            "Complete booking",
            "Pay booking fee if required"
          ]
        }
      ]
    },
    {
      id: 7,
      title: "Help Desk & Support",
      icon: "help-circle-outline",
      color: "#DDA0DD",
      sections: [
        {
          title: "Get Help",
          content: "Access customer support, report issues, and get assistance with the app.",
          steps: [
            "Go to Help Desk",
            "Choose inquiry type",
            "Describe your issue",
            "Attach screenshots if needed",
            "Submit request",
            "Track response status"
          ]
        }
      ]
    },
    {
      id: 8,
      title: "Complaints & Feedback",
      icon: "chatbubbles-outline",
      color: "#FF7675",
      sections: [
        {
          title: "Submit Complaints",
          content: "Report issues and problems within the society for quick resolution.",
          steps: [
            "Go to Complaints section",
            "Select complaint category",
            "Describe the issue",
            "Add photos if relevant",
            "Set priority level",
            "Submit complaint",
            "Track resolution status"
          ]
        }
      ]
    }
  ];

  const renderSectionCard = (section, index) => (
    <TouchableOpacity
      key={index}
      style={[styles.sectionCard, { borderLeftColor: section.color }]}
      onPress={() => setSelectedSection(section)}
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
                  backgroundColor: selectedSection.color
                }
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
              {section.steps.map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  <View style={[styles.stepNumber, { backgroundColor: selectedSection.color }]}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
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
            <Text style={[styles.navButtonText, currentStep === 0 && styles.navButtonTextDisabled]}>
              Previous
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, currentStep === selectedSection.sections.length - 1 && styles.navButtonDisabled]}
            onPress={() => setCurrentStep(Math.min(selectedSection.sections.length - 1, currentStep + 1))}
            disabled={currentStep === selectedSection.sections.length - 1}
          >
            <Text style={[styles.navButtonText, currentStep === selectedSection.sections.length - 1 && styles.navButtonTextDisabled]}>
              Next
            </Text>
            <Ionicons name="chevron-forward" size={20} color={currentStep === selectedSection.sections.length - 1 ? Colors.grey : Colors.primary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderMainView = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>User Guide</Text>
        <Text style={styles.headerSubtitle}>
          Learn how to make the most of Casa Nirvana
        </Text>
      </View>

      <View style={styles.content}>
        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Welcome to Your Community App</Text>
          <Text style={styles.welcomeText}>
            This comprehensive guide will help you navigate through all the features of Casa Nirvana. 
            Select any section below to get detailed step-by-step instructions.
          </Text>
        </View>

        {/* Guide Sections */}
        <View style={styles.sectionsContainer}>
          {guideData.map((section, index) => renderSectionCard(section, index))}
        </View>

        {/* Support Section */}
        <View style={styles.supportCard}>
          <MaterialIcons name="support-agent" size={32} color={Colors.primary} />
          <Text style={styles.supportTitle}>Need Additional Help?</Text>
          <Text style={styles.supportText}>
            If you can't find what you're looking for, our support team is always here to help.
          </Text>
          <TouchableOpacity 
            style={styles.supportButton}
            onPress={() => navigation.navigate('helpDeskScreen')}
          >
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
        <TouchableOpacity 
          onPress={selectedSection ? () => setSelectedSection(null) : backAction} 
          style={styles.headerBackBtn}
        >
          <Ionicons name="arrow-back-outline" size={25} color={Colors.black} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitleText}>
            {selectedSection ? selectedSection.title : "User Guide"}
          </Text>
        </View>
        {selectedSection && (
          <TouchableOpacity onPress={backAction} style={styles.settingsBackBtn}>
            <Ionicons name="close-outline" size={25} color={Colors.grey} />
          </TouchableOpacity>
        )}
      </View>
      
      {selectedSection ? renderDetailedView() : renderMainView()}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.extraLightGrey,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Default.fixPadding * 2,
    paddingTop: Default.fixPadding * 1.2,
    paddingBottom: Default.fixPadding * 0.8,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGrey,
    minHeight: 60,
  },
  headerBackBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: Default.fixPadding,
    justifyContent: 'center',
  },
  headerTitleText: {
    ...Fonts.SemiBold18black,
    letterSpacing: 0.2,
    color: Colors.black,
  },
  settingsBackBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Default.fixPadding,
  },
  container: {
    flex: 1,
  },
  headerSection: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 3,
    alignItems: 'center',
  },
  headerTitle: {
    ...Fonts.Bold24white,
    marginBottom: Default.fixPadding * 0.5,
    color: Colors.white,
  },
  headerSubtitle: {
    ...Fonts.Medium16white,
    opacity: 0.9,
    textAlign: 'center',
    color: Colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: Default.fixPadding * 2,
    paddingTop: Default.fixPadding * 2,
  },
  welcomeCard: {
    backgroundColor: Colors.white,
    padding: Default.fixPadding * 2,
    borderRadius: 16,
    marginBottom: Default.fixPadding * 2,
    ...Default.shadow,
  },
  welcomeTitle: {
    ...Fonts.SemiBold18black,
    marginBottom: Default.fixPadding,
  },
  welcomeText: {
    ...Fonts.Medium14grey,
    lineHeight: 22,
  },
  sectionsContainer: {
    marginBottom: Default.fixPadding * 2,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    padding: Default.fixPadding * 2,
    marginBottom: Default.fixPadding * 1.5,
    borderRadius: 16,
    borderLeftWidth: 5,
    ...Default.shadow,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Default.fixPadding * 1.5,
  },
  sectionInfo: {
    flex: 1,
  },
  sectionTitle: {
    ...Fonts.SemiBold16black,
    marginBottom: Default.fixPadding * 0.3,
  },
  sectionSubtitle: {
    ...Fonts.Medium12grey,
  },
  detailContainer: {
    flex: 1,
  },
  progressContainer: {
    padding: Default.fixPadding * 2,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGrey,
  },
  progressText: {
    ...Fonts.Medium14grey,
    textAlign: 'center',
    marginBottom: Default.fixPadding,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.lightGrey,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  contentCard: {
    backgroundColor: Colors.white,
    margin: Default.fixPadding * 2,
    padding: Default.fixPadding * 2,
    borderRadius: 16,
    ...Default.shadow,
  },
  contentTitle: {
    ...Fonts.SemiBold18black,
    marginBottom: Default.fixPadding * 1.5,
  },
  contentDescription: {
    ...Fonts.Medium14grey,
    lineHeight: 22,
    marginBottom: Default.fixPadding * 2,
  },
  stepsContainer: {
    marginTop: Default.fixPadding,
  },
  stepsTitle: {
    ...Fonts.SemiBold16black,
    marginBottom: Default.fixPadding * 1.5,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Default.fixPadding * 1.2,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Default.fixPadding * 1.2,
    marginTop: 2,
  },
  stepNumberText: {
    ...Fonts.Bold12white,
  },
  stepText: {
    ...Fonts.Medium14black,
    flex: 1,
    lineHeight: 20,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 1.5,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGrey,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 1.2,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
    minWidth: 120,
    justifyContent: 'center',
  },
  navButtonDisabled: {
    backgroundColor: Colors.lightGrey,
    borderColor: Colors.grey,
  },
  navButtonText: {
    ...Fonts.Medium14primary,
    marginHorizontal: Default.fixPadding * 0.5,
  },
  navButtonTextDisabled: {
    color: Colors.grey,
  },
  supportCard: {
    backgroundColor: Colors.white,
    padding: Default.fixPadding * 2.5,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: Default.fixPadding * 2,
    ...Default.shadow,
  },
  supportTitle: {
    ...Fonts.SemiBold18black,
    marginTop: Default.fixPadding,
    marginBottom: Default.fixPadding,
  },
  supportText: {
    ...Fonts.Medium14grey,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Default.fixPadding * 2,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 1.2,
    borderRadius: 12,
    ...Default.shadow,
  },
  supportButtonText: {
    ...Fonts.Medium16white,
    marginRight: Default.fixPadding * 0.8,
    color: Colors.white,
  },
});

export default UserGuideScreen;
