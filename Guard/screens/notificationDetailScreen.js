import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  BackHandler,
  StyleSheet,
  Dimensions,
  Alert,
  Share,
  Animated,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MyStatusBar from "../components/myStatusBar";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

const NotificationDetailScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() == "rtl";
  const notification = route?.params?.notification;

  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isArchived, setIsArchived] = useState(false);

  function tr(key) {
    // Reuse notificationDetailScreen namespace from user-app shape
    return t(`notificationDetailScreen:${key}`) || key;
  }

  const backAction = () => {
    navigation.goBack();
    return true;
  };

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", backAction);
    
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
    
    return () => subscription?.remove();
  }, []);

  if (!notification) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.white }}>
        <MyStatusBar />
        <View
          style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            alignItems: "center",
            paddingVertical: Default.fixPadding * 1.2,
            paddingHorizontal: Default.fixPadding * 2,
            backgroundColor: Colors.white,
            ...Default.shadow,
          }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons
              name={isRtl ? "chevron-forward" : "chevron-back"}
              size={25}
              color={Colors.black}
            />
          </TouchableOpacity>
          <Text
            style={{
              ...Fonts.SemiBold18black,
              textAlign: isRtl ? "right" : "left",
              marginHorizontal: Default.fixPadding * 1.2,
              flex: 1,
            }}
          >
            {tr("notificationDetails")}
          </Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <MaterialIcons name="error-outline" size={64} color={Colors.grey} />
          <Text style={{...Fonts.Medium16black, marginTop: Default.fixPadding, textAlign: 'center'}}>
            Notification not found
          </Text>
          <Text style={{...Fonts.Medium14grey, marginTop: Default.fixPadding * 0.5, textAlign: 'center'}}>
            This notification may have been deleted
          </Text>
        </View>
      </View>
    );
  }

  const getIcon = (type) => {
    switch (type) {
      case 'join_request_approved':
        return { name: 'check-circle', color: Colors.green, bg: Colors.green + '15', gradient: ['#4CAF50', '#66BB6A'] };
      case 'join_request_rejected':
        return { name: 'cancel', color: Colors.orange, bg: Colors.orange + '15', gradient: ['#FF9800', '#FFB74D'] };
      case 'payment_reminder':
        return { name: 'payment', color: Colors.orange, bg: Colors.orange + '15', gradient: ['#FF9800', '#FFB74D'] };
      case 'maintenance_update':
      case 'maintenance':
        return { name: 'build', color: Colors.blue, bg: Colors.blue + '15', gradient: ['#2196F3', '#42A5F5'] };
      case 'announcement':
        return { name: 'campaign', color: Colors.primary, bg: Colors.primary + '15', gradient: [Colors.primary, '#64B5F6'] };
      case 'emergency':
        return { name: 'warning', color: Colors.orange, bg: Colors.orange + '15', gradient: ['#FF9800', '#FFB74D'] };
      case 'visitor':
        return { name: 'person', color: '#9C27B0', bg: '#9C27B0' + '15', gradient: ['#9C27B0', '#BA68C8'] };
      case 'security':
        return { name: 'security', color: '#795548', bg: '#795548' + '15', gradient: ['#795548', '#8D6E63'] };
      default:
        return { name: 'notifications', color: Colors.primary, bg: Colors.primary + '15', gradient: [Colors.primary, '#64B5F6'] };
    }
  };

  const renderDetailedMessage = (notification) => {
    const type = notification.notification_type || notification.type || notification.category;
    const title = notification.title || 'Notification';
    const originalMessage = notification.message || notification.body || '';
    
    switch (type) {
      case 'join_request_approved':
        return (
          <View style={styles.messageContent}>
            <Text style={styles.messageHeader}>🎉 Congratulations! Your community membership request has been approved!</Text>
            
            <Text style={styles.messageText}>
              Welcome to our vibrant community! You can now enjoy all the exclusive benefits and amenities we offer, including:
            </Text>
            
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Full access to all community facilities and amenities</Text>
              <Text style={styles.bulletItem}>• Participation in community events and activities</Text>
              <Text style={styles.bulletItem}>• Access to maintenance request system</Text>
              <Text style={styles.bulletItem}>• Community announcements and updates</Text>
              <Text style={styles.bulletItem}>• Visitor management and guest passes</Text>
              <Text style={styles.bulletItem}>• Online payment portal for dues and fees</Text>
            </View>
            
            <Text style={styles.messageText}>
              We're excited to have you as part of our community family. If you have any questions or need assistance getting started, please don't hesitate to reach out to our management team.
            </Text>
            
            <Text style={styles.messageFooter}>Once again, welcome home! 🏡</Text>
          </View>
        );
      
      case 'join_request_rejected':
        return (
          <View style={styles.messageContent}>
            <Text style={styles.messageText}>
              We appreciate your interest in joining our community. After careful review, we are unable to approve your membership request at this time.
            </Text>
            
            <Text style={styles.messageText}>This decision may be based on various factors such as:</Text>
            
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Current capacity limitations</Text>
              <Text style={styles.bulletItem}>• Incomplete documentation</Text>
              <Text style={styles.bulletItem}>• Community guidelines alignment</Text>
            </View>
            
            <Text style={styles.messageText}>
              If you believe this decision was made in error or if you'd like to reapply in the future, please contact our management office. We'll be happy to discuss your application and provide guidance on next steps.
            </Text>
            
            <Text style={styles.messageFooter}>
              Thank you for your understanding, and we wish you the best in finding the perfect community for your needs.
            </Text>
          </View>
        );
      
      case 'payment_reminder':
        return (
          <View style={styles.messageContent}>
            <Text style={styles.messageHeader}>💰 Friendly Payment Reminder</Text>
            
            <Text style={styles.messageText}>
              This is a gentle reminder about your upcoming community dues payment. Keeping your account current helps us maintain the high-quality services and amenities you enjoy.
            </Text>
            
            <Text style={styles.sectionSubHeader}>📋 Payment Details:</Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Amount Due: As per your account statement</Text>
              <Text style={styles.bulletItem}>• Due Date: Please check your payment portal</Text>
              <Text style={styles.bulletItem}>• Payment Methods: Online portal, bank transfer, or management office</Text>
            </View>
            
            <Text style={styles.sectionSubHeader}>🔗 Easy Payment Options:</Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Log into your resident portal for instant payment</Text>
              <Text style={styles.bulletItem}>• Set up automatic payments to never miss a due date</Text>
              <Text style={styles.bulletItem}>• Contact our office for payment assistance programs</Text>
            </View>
            
            <Text style={styles.messageFooter}>
              Thank you for being a valued member of our community. Your timely payments help us continue providing excellent services and maintaining our beautiful facilities.
            </Text>
          </View>
        );
      
      case 'maintenance_update':
      case 'maintenance':
        return (
          <View style={styles.messageContent}>
            <Text style={styles.messageHeader}>🔧 Maintenance Update</Text>
            
            <Text style={styles.messageText}>
              We want to keep you informed about ongoing maintenance activities in our community.
            </Text>
            
            <Text style={styles.sectionSubHeader}>📋 Current Status:</Text>
            <Text style={styles.originalMessage}>{originalMessage}</Text>
            
            <Text style={styles.sectionSubHeader}>🛠️ Our Commitment:</Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• We strive to complete all maintenance with minimal disruption</Text>
              <Text style={styles.bulletItem}>• Safety is our top priority during all maintenance activities</Text>
              <Text style={styles.bulletItem}>• Regular updates will be provided for major projects</Text>
              <Text style={styles.bulletItem}>• Emergency maintenance is handled 24/7</Text>
            </View>
            
            <Text style={styles.sectionSubHeader}>📞 Need to Report an Issue?</Text>
            <Text style={styles.messageText}>
              Use your resident app or contact our maintenance team directly. We're here to ensure your comfort and safety.
            </Text>
            
            <Text style={styles.messageFooter}>
              Thank you for your patience and understanding as we work to maintain our community's high standards.
            </Text>
          </View>
        );
      
      case 'announcement':
        return (
          <View style={styles.messageContent}>
            <Text style={styles.messageHeader}>📢 Community Announcement</Text>
            
            <Text style={styles.originalMessage}>{originalMessage}</Text>
            
            <Text style={styles.sectionSubHeader}>🏘️ Stay Connected:</Text>
            <Text style={styles.messageText}>
              This announcement is part of our commitment to keeping you informed about important community matters, events, and updates that affect your daily life.
            </Text>
            
            <Text style={styles.sectionSubHeader}>📱 Don't Miss Out:</Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Check your resident app regularly for updates</Text>
              <Text style={styles.bulletItem}>• Follow our community bulletin board</Text>
              <Text style={styles.bulletItem}>• Attend community meetings for more details</Text>
            </View>
            
            <Text style={styles.messageFooter}>
              Your active participation helps make our community a better place for everyone. Thank you for being an engaged resident!
            </Text>
          </View>
        );
      
      case 'emergency':
        return (
          <View style={styles.messageContent}>
            <Text style={styles.messageHeader}>🚨 Emergency Alert</Text>
            
            <Text style={styles.originalMessage}>{originalMessage}</Text>
            
            <Text style={styles.sectionSubHeader}>⚠️ Immediate Actions:</Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Follow all safety protocols and instructions</Text>
              <Text style={styles.bulletItem}>• Stay calm and assist others if safe to do so</Text>
              <Text style={styles.bulletItem}>• Keep emergency contact numbers handy</Text>
              <Text style={styles.bulletItem}>• Monitor official channels for updates</Text>
            </View>
            
            <Text style={styles.sectionSubHeader}>📞 Emergency Contacts:</Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Community Security: Available 24/7</Text>
              <Text style={styles.bulletItem}>• Management Office: Emergency line active</Text>
              <Text style={styles.bulletItem}>• Local Emergency Services: 911</Text>
            </View>
            
            <Text style={styles.messageFooter}>
              🛡️ Your Safety Matters: We take all emergency situations seriously and have comprehensive protocols in place. Please follow all official guidance and stay safe.
            </Text>
          </View>
        );
      
      case 'visitor':
        return (
          <View style={styles.messageContent}>
            <Text style={styles.messageHeader}>👥 Visitor Notification</Text>
            
            <Text style={styles.originalMessage}>{originalMessage}</Text>
            
            <Text style={styles.sectionSubHeader}>🎯 Visitor Management:</Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• All visitors must be pre-registered for security</Text>
              <Text style={styles.bulletItem}>• Guest passes are available through your resident portal</Text>
              <Text style={styles.bulletItem}>• Visitors should carry valid identification</Text>
              <Text style={styles.bulletItem}>• Security will verify all guest arrivals</Text>
            </View>
            
            <Text style={styles.sectionSubHeader}>📱 Easy Guest Registration:</Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Use your resident app to pre-register visitors</Text>
              <Text style={styles.bulletItem}>• Set up recurring passes for regular guests</Text>
              <Text style={styles.bulletItem}>• Receive notifications when guests arrive</Text>
            </View>
            
            <Text style={styles.messageFooter}>
              🏡 Community Guidelines: Our visitor policies help maintain security while ensuring your guests feel welcome. Thank you for following our community guidelines.
            </Text>
          </View>
        );
      
      case 'security':
        return (
          <View style={styles.messageContent}>
            <Text style={styles.messageHeader}>🛡️ Security Notice</Text>
            
            <Text style={styles.originalMessage}>{originalMessage}</Text>
            
            <Text style={styles.sectionSubHeader}>🔐 Your Safety & Security:</Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Our security team monitors the community 24/7</Text>
              <Text style={styles.bulletItem}>• All incidents are thoroughly investigated</Text>
              <Text style={styles.bulletItem}>• Regular security patrols ensure community safety</Text>
              <Text style={styles.bulletItem}>• Emergency response protocols are always active</Text>
            </View>
            
            <Text style={styles.sectionSubHeader}>📞 Report Security Concerns:</Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Contact security immediately for urgent matters</Text>
              <Text style={styles.bulletItem}>• Use the resident app to report non-emergency issues</Text>
              <Text style={styles.bulletItem}>• Anonymous reporting options are available</Text>
            </View>
            
            <Text style={styles.messageFooter}>
              👮 Community Watch: We encourage all residents to be vigilant and report any suspicious activities. Together, we maintain a safe and secure environment for everyone.
            </Text>
          </View>
        );
      
      default:
        return (
          <View style={styles.messageContent}>
            <Text style={styles.messageHeader}>📱 Community Notification</Text>
            
            <Text style={styles.messageText}>{title}</Text>
            
            <Text style={styles.originalMessage}>{originalMessage}</Text>
            
            <Text style={styles.messageText}>
              We wanted to make sure you received this important update. Stay connected with your community through our resident app for the latest news, announcements, and services.
            </Text>
            
            <Text style={styles.sectionSubHeader}>🏘️ Community Benefits:</Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Real-time notifications and updates</Text>
              <Text style={styles.bulletItem}>• Easy access to community services</Text>
              <Text style={styles.bulletItem}>• Direct communication with management</Text>
              <Text style={styles.bulletItem}>• Convenient payment and request systems</Text>
            </View>
            
            <Text style={styles.messageFooter}>Thank you for being a valued member of our community!</Text>
          </View>
        );
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    Alert.alert(
      isBookmarked ? "Removed from Bookmarks" : "Added to Bookmarks",
      isBookmarked ? "This notification has been removed from your bookmarks." : "This notification has been saved to your bookmarks.",
      [{ text: "OK" }]
    );
  };

  const handleArchive = () => {
    setIsArchived(!isArchived);
    Alert.alert(
      isArchived ? "Unarchived" : "Archived",
      isArchived ? "This notification has been unarchived." : "This notification has been archived.",
      [{ text: "OK" }]
    );
  };

  const handleShare = async () => {
    try {
      // Create a simple text version for sharing
      const type = notification.notification_type || notification.type || notification.category;
      const originalMessage = notification.message || notification.body || '';
      let shareMessage = `${notification.title}\n\n${originalMessage}`;
      
      // Add basic formatted content for sharing
      switch (type) {
        case 'join_request_approved':
          shareMessage = `🎉 ${notification.title}\n\nWelcome to our vibrant community! You can now enjoy all the exclusive benefits and amenities we offer.\n\nWe're excited to have you as part of our community family!`;
          break;
        case 'payment_reminder':
          shareMessage = `💰 ${notification.title}\n\n${originalMessage}\n\nThank you for being a valued member of our community.`;
          break;
        case 'maintenance':
        case 'maintenance_update':
          shareMessage = `🔧 ${notification.title}\n\n${originalMessage}\n\nThank you for your patience and understanding.`;
          break;
        case 'security':
          shareMessage = `🛡️ ${notification.title}\n\n${originalMessage}\n\nYour safety and security are our top priority.`;
          break;
        case 'announcement':
          shareMessage = `📢 ${notification.title}\n\n${originalMessage}\n\nStay connected with your community!`;
          break;
        default:
          shareMessage = `${notification.title}\n\n${originalMessage}`;
      }
      
      await Share.share({
        message: shareMessage,
        title: notification.title,
      });
    } catch (error) {
      console.error('Error sharing notification:', error);
    }
  };

  const handleMarkAsRead = () => {
    Alert.alert(
      "Mark as Read",
      "This notification has been marked as read.",
      [{ text: "OK" }]
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return Colors.orange;
      case 'medium':
        return '#FFB74D';
      case 'low':
        return Colors.green;
      default:
        return Colors.primary;
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'alert-circle';
      case 'medium':
        return 'alert';
      case 'low':
        return 'information';
      default:
        return 'flag';
    }
  };

  const iconData = getIcon(notification.notification_type || notification.type);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 43200) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      <MyStatusBar />
      
      {/* Standard Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons
            name={isRtl ? "arrow-forward-outline" : "arrow-back-outline"}
            size={25}
            color={Colors.black}
          />
        </TouchableOpacity>
        <Text style={{ ...Fonts.SemiBold18black, marginHorizontal: Default.fixPadding, flex: 1 }}>
          Notification Details
        </Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <MaterialCommunityIcons name="share-variant" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Main Notification Card */}
          <View style={styles.mainCard}>
            <View style={styles.notificationHeader}>
              <LinearGradient
                colors={iconData.gradient}
                style={styles.iconContainer}
              >
                <MaterialIcons name={iconData.name} size={32} color={Colors.white} />
              </LinearGradient>
              
              <View style={styles.headerInfo}>
                <View style={styles.titleRow}>
                  <Text style={styles.notificationTitle} numberOfLines={2}>
                    {notification.title}
                  </Text>
                  {!notification.read_at && <View style={styles.unreadDot} />}
                </View>
                
                <View style={styles.metaRow}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color={Colors.grey} />
                  <Text style={styles.timestamp}>
                    {formatDate(notification.created_at)}
                  </Text>
                </View>
                
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>
                    {(notification.type || notification.notification_type || 'notification')
                      .toString()
                      .replace(/_/g, ' ')
                      .toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Priority Indicator */}
            {notification.priority && (
              <View style={[styles.priorityBand, { backgroundColor: getPriorityColor(notification.priority) }]}>
                <MaterialCommunityIcons 
                  name={getPriorityIcon(notification.priority)} 
                  size={16} 
                  color={Colors.white} 
                />
                <Text style={styles.priorityText}>
                  {notification.priority.toUpperCase()} PRIORITY
                </Text>
              </View>
            )}
          </View>

          {/* Message Content Card */}
          <View style={styles.messageCard}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="message-text" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Message</Text>
            </View>
                  {renderDetailedMessage(notification)}
          </View>

          {/* Additional Details */}
          {notification.data && (
            <View style={styles.detailsCard}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="information" size={20} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Additional Details</Text>
              </View>
              <View style={styles.detailsContent}>
                <Text style={styles.detailsText}>
                  {typeof notification.data === 'string' 
                    ? notification.data 
                    : JSON.stringify(notification.data, null, 2)
                  }
                </Text>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryAction]} 
              onPress={handleMarkAsRead}
            >
              <MaterialCommunityIcons name="check" size={20} color={Colors.white} />
              <Text style={styles.actionButtonText}>Mark as Read</Text>
            </TouchableOpacity>
            
            <View style={styles.secondaryActions}>
              <TouchableOpacity 
                style={[styles.secondaryButton, isBookmarked && styles.activeSecondary]} 
                onPress={handleBookmark}
              >
                <MaterialCommunityIcons 
                  name={isBookmarked ? "bookmark" : "bookmark-outline"} 
                  size={20} 
                  color={isBookmarked ? Colors.orange : Colors.grey} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.secondaryButton, isArchived && styles.activeSecondary]} 
                onPress={handleArchive}
              >
                <MaterialCommunityIcons 
                  name={isArchived ? "archive" : "archive-outline"} 
                  size={20} 
                  color={isArchived ? Colors.blue : Colors.grey} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.secondaryButton} onPress={handleShare}>
                <MaterialCommunityIcons name="share-variant" size={20} color={Colors.grey} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Default.fixPadding * 1.2,
    paddingHorizontal: Default.fixPadding * 2,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  backButton: {
    padding: Default.fixPadding * 0.5,
  },
  shareButton: {
    padding: Default.fixPadding * 0.5,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: Colors.extraLightGrey,
  },
  scrollContent: {
    paddingTop: Default.fixPadding * 2,
    paddingHorizontal: Default.fixPadding * 2,
  },
  mainCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: Default.fixPadding * 2,
    marginBottom: Default.fixPadding * 2,
    ...Default.shadow,
    elevation: 4,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Default.fixPadding * 1.5,
    ...Default.shadow,
    elevation: 3,
  },
  headerInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Default.fixPadding * 0.8,
  },
  notificationTitle: {
    ...Fonts.SemiBold18black,
    flex: 1,
    lineHeight: 24,
    marginRight: Default.fixPadding,
  },
  unreadDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    marginTop: Default.fixPadding * 0.3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Default.fixPadding,
  },
  timestamp: {
    ...Fonts.Medium14grey,
    marginLeft: Default.fixPadding * 0.5,
  },
  categoryBadge: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: Default.fixPadding * 1.2,
    paddingVertical: Default.fixPadding * 0.5,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  categoryText: {
    ...Fonts.SemiBold12primary,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  priorityBand: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Default.fixPadding * 1.5,
    paddingVertical: Default.fixPadding * 0.8,
    borderRadius: 10,
  },
  priorityText: {
    ...Fonts.SemiBold14white,
    marginLeft: Default.fixPadding * 0.5,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  messageCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Default.fixPadding * 2,
    marginBottom: Default.fixPadding * 2,
    ...Default.shadow,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Default.fixPadding * 1.2,
    paddingBottom: Default.fixPadding * 0.8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.extraLightGrey,
  },
  sectionTitle: {
    ...Fonts.SemiBold16black,
    marginLeft: Default.fixPadding * 0.8,
    color: Colors.primary,
  },
  messageContent: {
    paddingTop: Default.fixPadding,
  },
  messageHeader: {
    ...Fonts.SemiBold18black,
    lineHeight: 26,
    color: Colors.black,
    marginBottom: Default.fixPadding * 1.5,
  },
  messageText: {
    ...Fonts.Medium15black,
    lineHeight: 24,
    textAlign: 'left',
    color: Colors.darkGrey,
    marginBottom: Default.fixPadding * 1.2,
  },
  messageFooter: {
    ...Fonts.Medium15black,
    lineHeight: 24,
    textAlign: 'left',
    color: Colors.darkGrey,
    marginTop: Default.fixPadding,
    fontStyle: 'italic',
  },
  sectionSubHeader: {
    ...Fonts.SemiBold16black,
    lineHeight: 22,
    color: Colors.black,
    marginTop: Default.fixPadding * 1.5,
    marginBottom: Default.fixPadding * 0.8,
  },
  originalMessage: {
    ...Fonts.Medium15black,
    lineHeight: 24,
    textAlign: 'left',
    color: Colors.primary,
    backgroundColor: Colors.primary + '08',
    padding: Default.fixPadding * 1.2,
    borderRadius: 10,
    marginBottom: Default.fixPadding * 1.2,
    fontWeight: '500',
  },
  bulletList: {
    marginBottom: Default.fixPadding * 1.2,
    marginLeft: Default.fixPadding * 0.5,
  },
  bulletItem: {
    ...Fonts.Medium14black,
    lineHeight: 22,
    color: Colors.darkGrey,
    marginBottom: Default.fixPadding * 0.5,
  },
  detailsCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Default.fixPadding * 2,
    marginBottom: Default.fixPadding * 2,
    ...Default.shadow,
    elevation: 2,
  },
  detailsContent: {
    backgroundColor: Colors.extraLightGrey,
    borderRadius: 12,
    padding: Default.fixPadding * 1.5,
  },
  detailsText: {
    ...Fonts.Medium14grey,
    lineHeight: 20,
    fontFamily: 'monospace',
  },
  actionSection: {
    marginBottom: Default.fixPadding * 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Default.fixPadding * 1.5,
    borderRadius: 12,
    marginBottom: Default.fixPadding * 1.5,
    ...Default.shadow,
    elevation: 3,
  },
  primaryAction: {
    backgroundColor: Colors.primary,
  },
  actionButtonText: {
    ...Fonts.SemiBold16white,
    marginLeft: Default.fixPadding * 0.8,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  secondaryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Default.shadow,
    elevation: 2,
  },
  activeSecondary: {
    backgroundColor: Colors.extraLightPrimary,
  },
  bottomSpacer: {
    height: Default.fixPadding * 2,
  },
});

export default NotificationDetailScreen;
