import React, { useEffect, useState } from "react";
import { Text, View, BackHandler, TouchableOpacity, ScrollView, StyleSheet, Linking, Alert } from "react-native";
import MyStatusBar from "../components/myStatusBar";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useAuth } from "../contexts/AuthContext";
import { useStartSupportChat } from "../hooks/useSupportChat";

// Static imports for member images (React Native requirement)
const memberImages = {
  1: require('../assets/images/member1.png'),
  2: require('../assets/images/member2.png'),
  3: require('../assets/images/member3.png'),
  4: require('../assets/images/member4.png'),
  5: require('../assets/images/member5.png'),
  6: require('../assets/images/member6.png'),
  7: require('../assets/images/member7.png'),
  8: require('../assets/images/member8.png'),
  9: require('../assets/images/member9.png'),
  10: require('../assets/images/member10.png'),
  11: require('../assets/images/member11.png'),
  12: require('../assets/images/member12.png'),
  13: require('../assets/images/member13.png'),
  14: require('../assets/images/member14.png'),
};

const HelpDeskScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { profile } = useAuth();
  const { startSupportChat, isCreating, error } = useStartSupportChat();

  const isRtl = i18n.dir() == "rtl";
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  function tr(key) {
    return t(`helpDeskScreen:${key}`);
  }

  const goBackSafely = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
      return;
    }
    navigation.navigate("bottomTab");
  };

  const backAction = () => {
    goBackSafely();
    return true;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, []);

  const handleCall = (number) => {
    Linking.openURL(`tel:${number}`);
  };

  const handleEmail = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleStartLiveChat = async () => {
    if (!profile?.id || !profile?.community_id) {
      Alert.alert('Error', 'Please ensure you are logged in and have a valid profile to start a chat.');
      return;
    }

    try {
      const result = await startSupportChat(profile.id, profile.community_id);
      
      console.log('🔍 Support chat result:', result);
      
      if (result.success) {
        console.log('✅ Admin found:', result.adminUser);
        
        // Generate placeholder image based on admin ID (same as working admin chat)
        const imageIndex = (parseInt(result.adminUser.id.slice(-2), 16) % 14) + 1;
        const placeholderImage = memberImages[imageIndex];
        
        // Navigate to the message screen with chat details
        navigation.navigate('messageScreen', {
          id: result.adminUser.id,              // Admin user ID for messaging
          name: result.adminUser.full_name || 'Support Team',
          email: result.adminUser.email,
          image: placeholderImage,
          key: result.chatId,                   // Chat ID as key
          phone: result.adminUser.phone || null,
          memberId: result.adminUser.id,        // Admin user ID as member ID
          memberPhone: result.adminUser.phone || null,
          isSupport: true,
          isNew: result.isNew
        });
      } else {
        Alert.alert('Error', result.error || 'Failed to start support chat. Please try again.');
      }
    } catch (error) {
      console.error('Error starting live chat:', error);
      Alert.alert('Error', 'Unable to start live chat. Please try again later.');
    }
  };

  const faqData = [
    {
      question: "How do I book amenities?",
      answer: "Go to the Amenities section and select your desired amenity. Choose your preferred date and time, then confirm your booking."
    },
    {
      question: "How do I report a maintenance issue?",
      answer: "Navigate to the Complaints section, select Personal tab, and create a new complaint with details about the maintenance issue."
    },
    {
      question: "What are the community guidelines?",
      answer: "Please respect quiet hours (10 PM - 6 AM), keep common areas clean, and be considerate of your neighbors."
    },
    {
      question: "How do I pay my bills?",
      answer: "Go to the Payments section where you can view and pay your monthly bills securely through the app."
    },
    {
      question: "How do I contact security?",
      answer: "Use the emergency contact numbers below or visit the Guard App for immediate assistance."
    }
  ];

  const emergencyContacts = [
    {
      title: "Security",
      number: "+233 XX XXX XXXX",
      icon: "security",
      color: Colors.red
    },
    {
      title: "Maintenance",
      number: "+233 XX XXX XXXX", 
      icon: "build",
      color: Colors.orange
    },
    {
      title: "Management",
      number: "+233 XX XXX XXXX",
      icon: "business",
      color: Colors.primary
    },
    {
      title: "Emergency Services",
      number: "911",
      icon: "local-hospital",
      color: Colors.red
    }
  ];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <MyStatusBar />
      
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.headerBackBtn}
          onPress={goBackSafely}>
          <Ionicons name="arrow-back-outline" size={25} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitleText}>Help Desk</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Live Chat Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Live Support</Text>
          <TouchableOpacity 
            style={[styles.chatButton, isCreating && styles.chatButtonDisabled]} 
            onPress={handleStartLiveChat}
            disabled={isCreating}
          >
            <View style={styles.chatButtonContent}>
              <MaterialIcons name="chat" size={24} color={Colors.white} />
              <Text style={styles.chatButtonText}>
                {isCreating ? 'Connecting...' : 'Start Live Chat'}
              </Text>
            </View>
            <MaterialIcons name="arrow-forward" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Contact Forms Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Forms</Text>
          <View style={styles.formGrid}>
            <TouchableOpacity style={styles.formButton} onPress={() => navigation.navigate('generalInquiryScreen')}>
              <MaterialIcons name="help-outline" size={24} color={Colors.primary} />
              <Text style={styles.formButtonTextFirst}>General</Text>
              <Text style={styles.formButtonTextSecond}>Inquiry</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.formButton} onPress={() => navigation.navigate('technicalSupportScreen')}>
              <MaterialIcons name="computer" size={24} color={Colors.primary} />
              <Text style={styles.formButtonText}>Technical Support</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.formButton} onPress={() => navigation.navigate('feedbackScreen')}>
              <MaterialIcons name="feedback" size={24} color={Colors.primary} />
              <Text style={styles.formButtonText}>Feedback</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.formButton} onPress={() => navigation.navigate('suggestionsScreen')}>
              <MaterialIcons name="lightbulb-outline" size={24} color={Colors.primary} />
              <Text style={styles.formButtonText}>Suggestions</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqData.map((faq, index) => (
            <View key={index} style={styles.faqItem}>
              <TouchableOpacity 
                style={styles.faqHeader}
                onPress={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
              >
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <MaterialIcons 
                  name={expandedFAQ === index ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                  size={24} 
                  color={Colors.primary} 
                />
              </TouchableOpacity>
              {expandedFAQ === index && (
                <View style={styles.faqAnswerContainer}>
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Emergency Contacts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          <View style={styles.contactGrid}>
            {emergencyContacts.map((contact, index) => (
              <TouchableOpacity 
                key={index} 
                style={[styles.contactCard, { borderLeftColor: contact.color }]}
                onPress={() => handleCall(contact.number)}
              >
                <MaterialIcons name={contact.icon} size={24} color={contact.color} />
                <View style={styles.contactInfo}>
                  <Text style={styles.contactTitle}>{contact.title}</Text>
                  <Text style={styles.contactNumber}>{contact.number}</Text>
                </View>
                <MaterialIcons name="phone" size={20} color={Colors.grey} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Additional Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Resources</Text>
          <TouchableOpacity style={styles.resourceButton} onPress={() => handleEmail('support@casanirvana.com')}>
            <MaterialIcons name="email" size={24} color={Colors.primary} />
            <View style={styles.resourceInfo}>
              <Text style={styles.resourceTitle}>Email Support</Text>
              <Text style={styles.resourceDescription}>support@casanirvana.com</Text>
            </View>
            <MaterialIcons name="arrow-forward" size={20} color={Colors.grey} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.resourceButton} onPress={() => navigation.navigate('userGuideScreen')}>
            <MaterialIcons name="book" size={24} color={Colors.primary} />
            <View style={styles.resourceInfo}>
              <Text style={styles.resourceTitle}>User Guide</Text>
              <Text style={styles.resourceDescription}>Learn how to use the app</Text>
            </View>
            <MaterialIcons name="arrow-forward" size={20} color={Colors.grey} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.resourceButton} onPress={() => navigation.navigate('privacyPolicyScreen')}>
            <MaterialIcons name="privacy-tip" size={24} color={Colors.primary} />
            <View style={styles.resourceInfo}>
              <Text style={styles.resourceTitle}>Privacy Policy</Text>
              <Text style={styles.resourceDescription}>Review our privacy policy</Text>
            </View>
            <MaterialIcons name="arrow-forward" size={20} color={Colors.grey} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
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
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 1.5,
  },
  sectionTitle: {
    ...Fonts.SemiBold18black,
    marginBottom: Default.fixPadding * 1.5,
    color: Colors.black,
  },
  chatButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: Default.fixPadding * 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Default.shadow,
  },
  chatButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatButtonText: {
    ...Fonts.SemiBold16white,
    marginLeft: Default.fixPadding,
  },
  chatButtonDisabled: {
    opacity: 0.6,
  },
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  formButton: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Default.fixPadding * 1.5,
    alignItems: 'center',
    marginBottom: Default.fixPadding,
    ...Default.shadow,
    borderWidth: 1,
    borderColor: Colors.lightGrey,
  },
  formButtonText: {
    ...Fonts.Medium14black,
    marginTop: Default.fixPadding * 0.5,
    textAlign: 'center',
  },
  formButtonTextFirst: {
    ...Fonts.Medium14black,
    marginTop: Default.fixPadding * 0.5,
    textAlign: 'center',
  },
  formButtonTextSecond: {
    ...Fonts.Medium14black,
    marginTop: Default.fixPadding * 0.1,
    textAlign: 'center',
  },
  faqItem: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: Default.fixPadding,
    ...Default.shadow,
    borderWidth: 1,
    borderColor: Colors.lightGrey,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Default.fixPadding * 1.5,
  },
  faqQuestion: {
    ...Fonts.SemiBold16black,
    flex: 1,
    marginRight: Default.fixPadding,
  },
  faqAnswerContainer: {
    paddingHorizontal: Default.fixPadding * 1.5,
    paddingBottom: Default.fixPadding * 1.5,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGrey,
  },
  faqAnswer: {
    ...Fonts.Regular14grey,
    lineHeight: 20,
    marginTop: Default.fixPadding * 0.5,
  },
  contactGrid: {
    gap: Default.fixPadding,
  },
  contactCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Default.fixPadding * 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    ...Default.shadow,
    borderWidth: 1,
    borderColor: Colors.lightGrey,
    borderLeftWidth: 4,
  },
  contactInfo: {
    flex: 1,
    marginLeft: Default.fixPadding,
  },
  contactTitle: {
    ...Fonts.SemiBold16black,
    marginBottom: Default.fixPadding * 0.2,
  },
  contactNumber: {
    ...Fonts.Medium14grey,
  },
  resourceButton: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Default.fixPadding * 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Default.fixPadding,
    ...Default.shadow,
    borderWidth: 1,
    borderColor: Colors.lightGrey,
  },
  resourceInfo: {
    flex: 1,
    marginLeft: Default.fixPadding,
  },
  resourceTitle: {
    ...Fonts.SemiBold16black,
    marginBottom: Default.fixPadding * 0.2,
  },
  resourceDescription: {
    ...Fonts.Regular14grey,
  },
});

export default HelpDeskScreen;
