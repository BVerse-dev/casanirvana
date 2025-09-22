import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  BackHandler,
  Image,
  Dimensions,
  Animated,
  Share,
  Alert,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MyStatusBar from "../components/myStatusBar";
import { useMarkNotificationAsRead } from "../hooks/useNotifications";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const NotificationDetailScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() == "rtl";
  const markAsRead = useMarkNotificationAsRead();
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  
  // Get notification data from route params
  const notification = route?.params?.notification;

  function tr(key) {
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

    return () => {
      subscription?.remove();
    };
  }, []);

  // Mark notification as read when screen opens
  useEffect(() => {
    if (notification && !notification.read_at) {
      console.log('📖 Marking notification as read:', notification.id);
      markAsRead.mutateAsync(notification.id).catch((error) => {
        console.error('Failed to mark notification as read:', error);
      });
    }
  }, [notification?.id, notification?.read_at]);

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

  // Enhanced notification icon and priority system
  const getIcon = (notification) => {
    const type = notification.notification_type || notification.type || notification.category;
    const priority = notification.priority || 'medium';
    
    const icons = {
      join_request_approved: { name: 'check-circle', color: Colors.green },
      join_request_rejected: { name: 'cancel', color: Colors.orange }, // Changed from red
      payment_reminder: { name: 'payment', color: Colors.blue },
      payment_overdue: { name: 'warning', color: Colors.orange },
      maintenance_scheduled: { name: 'build', color: Colors.blue },
      maintenance_completed: { name: 'check-circle', color: Colors.green },
      security: { name: 'security', color: Colors.orange }, // Changed from red
      announcement: { name: 'campaign', color: Colors.primary },
      community_update: { name: 'info', color: Colors.blue },
      event_reminder: { name: 'event', color: Colors.purple || Colors.primary },
      visitor_approved: { name: 'person-add', color: Colors.green },
      visitor_denied: { name: 'person-remove', color: Colors.orange }, // Changed from red
      emergency: { name: 'warning', color: '#FFB74D' }, // Changed from red to orange
    };

    const priorityColors = {
      low: Colors.grey,
      medium: Colors.blue,
      high: '#FFB74D', // Changed from red to orange
      urgent: Colors.orange
    };

    const icon = icons[type] || { name: 'notifications', color: Colors.primary };
    const finalColor = priorityColors[priority] || icon.color;
    
    return {
      ...icon,
      color: finalColor,
      bg: finalColor + '20'
    };
  };

  // Get detailed message content
  const getDetailedMessage = (notification) => {
    const type = notification.notification_type || notification.type || notification.category;
    
    switch (type) {
      case 'join_request_approved':
        return {
          header: '🎉 Welcome to the Community!',
          content: 'Your membership request has been approved. You can now enjoy all the benefits and services our community has to offer.',
          sections: [
            'Access to all community amenities',
            'Participate in community events and activities', 
            'Use the visitor management system',
            'Receive important community updates',
            'Connect with your neighbors'
          ],
          footer: 'We\'re excited to have you as part of our community family!'
        };
        
      case 'join_request_rejected':
        return {
          header: '📋 Membership Application Update',
          content: 'After careful review, we are unable to approve your membership application at this time.',
          sections: [
            'Please ensure all required documents are submitted',
            'Verify that all information provided is accurate and complete',
            'Contact the management office for specific feedback',
            'You may reapply after addressing any outstanding requirements'
          ],
          footer: 'Thank you for your interest in joining our community.'
        };
        
      case 'payment_reminder':
        return {
          header: '💳 Payment Due Reminder',
          content: 'This is a friendly reminder that your monthly maintenance fee is due soon.',
          sections: [
            'Payment due date: Within the next 7 days',
            'Multiple payment methods available (online, bank transfer, cash)',
            'Set up auto-pay to never miss a payment',
            'Contact the accounts department for any payment queries'
          ],
          footer: 'Thank you for keeping your account current!'
        };
        
      case 'maintenance_scheduled':
        return {
          header: '🔧 Scheduled Maintenance Notice',
          content: 'Maintenance work has been scheduled in your area to improve our facilities and services.',
          sections: [
            'Please plan accordingly for any temporary inconveniences',
            'Our maintenance team will work efficiently to minimize disruption',
            'Emergency contact information will be provided if needed',
            'Updates will be shared as work progresses'
          ],
          footer: 'We appreciate your patience during this improvement process.'
        };
        
      case 'security':
        return {
          header: '🛡️ Security Alert',
          content: 'This is an important security notification for your safety and awareness.',
          sections: [
            'Please remain vigilant and report any suspicious activities',
            'Ensure all entry points to your unit are properly secured',
            'Do not share access codes or keys with unauthorized individuals',
            'Contact security immediately if you notice anything unusual',
            'Review and follow all community safety guidelines'
          ],
          footer: 'Your safety and security are our top priorities.'
        };
        
      case 'announcement':
        return {
          header: '📢 Community Announcement',
          content: 'We have an important update to share with all community members.',
          sections: [
            'This announcement affects all residents and stakeholders',
            'Please read the details carefully and take note of any action items',
            'Share this information with other members of your household',
            'Contact the management office if you have any questions'
          ],
          footer: 'Thank you for staying informed and engaged with our community.'
        };
        
      default:
        return {
          header: '📋 Notification Details',
          content: notification.message || 'You have received a new notification from the community management.',
          sections: [
            'Please review the notification details above',
            'Take any necessary actions as mentioned',
            'Contact support if you need assistance',
            'Keep this notification for your records if needed'
          ],
          footer: 'Thank you for staying connected with your community.'
        };
    }
  };

  // Share functionality
  const handleShare = async () => {
    try {
      const detailedMsg = getDetailedMessage(notification);
      const shareText = `${notification.title}\n\n${detailedMsg.content}\n\nShared from Casa Nirvana Community App`;
      
      await Share.share({
        message: shareText,
        title: notification.title,
      });
    } catch (error) {
      console.error('Error sharing notification:', error);
      Alert.alert('Error', 'Unable to share notification');
    }
  };

  // Render detailed message with proper React Native components
  const renderDetailedMessage = (notification) => {
    const messageData = getDetailedMessage(notification);
    
    return (
      <View>
        {/* Message Header */}
        <Text style={styles.messageHeader}>
          {messageData.header}
        </Text>
        
        {/* Main Content */}
        <Text style={styles.messageText}>
          {messageData.content}
        </Text>
        
        {/* Bullet Points */}
        {messageData.sections && messageData.sections.length > 0 && (
          <View style={styles.bulletContainer}>
            <Text style={styles.sectionSubHeader}>Key Points:</Text>
            {messageData.sections.map((item, index) => (
              <View key={index} style={styles.bulletItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
        )}
        
        {/* Footer Message */}
        <Text style={styles.messageFooter}>
          {messageData.footer}
        </Text>
        
        {/* Original Message if different */}
        {notification.message && notification.message !== messageData.content && (
          <View style={styles.originalMessageContainer}>
            <Text style={styles.sectionSubHeader}>Original Message:</Text>
            <Text style={styles.originalMessage}>{notification.message}</Text>
          </View>
        )}
      </View>
    );
  };

  const iconData = getIcon(notification);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 43200) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View style={styles.container}>
      <MyStatusBar />
      
      {/* Modern Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons
            name={isRtl ? "arrow-forward-outline" : "arrow-back-outline"}
            size={25}
            color={Colors.black}
          />
        </TouchableOpacity>
        <Text style={{ ...Fonts.SemiBold18black, marginHorizontal: Default.fixPadding }}>
          Notification Details
        </Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <MaterialCommunityIcons name="share-variant" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <Animated.ScrollView 
        style={{ opacity: fadeAnim }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Default.fixPadding * 3 }}
      >
        <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
          {/* Notification Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.notificationHeader}>
              {/* Icon Container */}
              <View style={[styles.iconContainer, { backgroundColor: iconData.bg }]}>
                <MaterialCommunityIcons
                  name={iconData.name}
                  size={32}
                  color={iconData.color}
                />
              </View>
              
              {/* Notification Info */}
              <View style={styles.headerInfo}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                <View style={styles.metaInfo}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color={Colors.grey} />
                  <Text style={styles.timestamp}>
                    {formatDate(notification.created_at || notification.timestamp)}
                  </Text>
                  {!notification.read_at && (
                    <View style={styles.unreadDot} />
                  )}
                </View>
              </View>
            </View>

            {/* Priority Badge */}
            <View style={[styles.priorityBadge, { backgroundColor: iconData.color + '20' }]}>
              <MaterialCommunityIcons 
                name="flag" 
                size={16} 
                color={iconData.color} 
              />
              <Text style={[styles.priorityText, { color: iconData.color }]}>
                {(notification.priority || 'medium').toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Message Card */}
          <View style={styles.messageCard}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="message-text" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Message</Text>
            </View>
            {renderDetailedMessage(notification)}
          </View>

          {/* Type & Category Card */}
          <View style={styles.categoryCard}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="tag" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Category</Text>
            </View>
            
            <View style={styles.categoryBadgeContainer}>
              <LinearGradient
                colors={[iconData.color, iconData.color + '80']}
                style={styles.categoryBadge}
              >
                <MaterialCommunityIcons
                  name={iconData.name}
                  size={18}
                  color={Colors.white}
                />
                <Text style={styles.categoryBadgeText}>
                  {(notification.notification_type || notification.type || 'notification')
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, l => l.toUpperCase())}
                </Text>
              </LinearGradient>
            </View>
            
            <Text style={styles.categoryDescription}>
              {getDetailedMessage(notification).header}
            </Text>
          </View>

          {/* Actions Card */}
          <View style={styles.actionsCard}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="gesture-tap" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Actions</Text>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                <MaterialCommunityIcons name="share-variant" size={20} color={Colors.primary} />
                <Text style={styles.actionButtonText}>Share</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.secondaryButton]} 
                onPress={() => navigation.goBack()}
              >
                <MaterialCommunityIcons name="check" size={20} color={Colors.green} />
                <Text style={[styles.actionButtonText, { color: Colors.green }]}>Mark as Read</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: Colors.extraLightGrey,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  infoCard: {
    margin: Default.fixPadding * 2,
    padding: Default.fixPadding * 2,
    borderRadius: 16,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Default.fixPadding * 1.5,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Default.fixPadding * 1.5,
  },
  headerInfo: {
    flex: 1,
  },
  notificationTitle: {
    ...Fonts.SemiBold18black,
    marginBottom: Default.fixPadding * 0.8,
    lineHeight: 24,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    ...Fonts.Medium14grey,
    marginLeft: Default.fixPadding * 0.5,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginLeft: Default.fixPadding,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Default.fixPadding * 1.2,
    paddingVertical: Default.fixPadding * 0.6,
    borderRadius: 20,
  },
  priorityText: {
    ...Fonts.Medium12black,
    fontWeight: '600',
    marginLeft: Default.fixPadding * 0.5,
  },
  messageCard: {
    marginHorizontal: Default.fixPadding * 2,
    marginBottom: Default.fixPadding * 2,
    padding: Default.fixPadding * 2,
    borderRadius: 16,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  categoryCard: {
    marginHorizontal: Default.fixPadding * 2,
    marginBottom: Default.fixPadding * 2,
    padding: Default.fixPadding * 2,
    borderRadius: 16,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  actionsCard: {
    marginHorizontal: Default.fixPadding * 2,
    marginBottom: Default.fixPadding * 2,
    padding: Default.fixPadding * 2,
    borderRadius: 16,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Default.fixPadding * 1.5,
  },
  sectionTitle: {
    ...Fonts.SemiBold16black,
    marginLeft: Default.fixPadding,
  },
  messageHeader: {
    ...Fonts.SemiBold16black,
    color: Colors.primary,
    marginBottom: Default.fixPadding,
    lineHeight: 24,
  },
  messageText: {
    ...Fonts.Medium15black,
    lineHeight: 24,
    textAlign: 'left',
    color: Colors.darkGrey,
    marginBottom: Default.fixPadding * 1.2,
  },
  sectionSubHeader: {
    ...Fonts.SemiBold14black,
    color: Colors.primary,
    marginBottom: Default.fixPadding * 0.8,
    marginTop: Default.fixPadding,
  },
  bulletContainer: {
    marginBottom: Default.fixPadding * 1.2,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Default.fixPadding * 0.6,
  },
  bulletPoint: {
    ...Fonts.Medium14black,
    color: Colors.primary,
    marginRight: Default.fixPadding * 0.8,
    marginTop: 2,
    lineHeight: 20,
  },
  bulletText: {
    ...Fonts.Medium14black,
    flex: 1,
    lineHeight: 20,
    textAlign: 'left',
    color: Colors.darkGrey,
  },
  messageFooter: {
    ...Fonts.Medium14black,
    color: Colors.primary,
    fontStyle: 'italic',
    textAlign: 'left',
    lineHeight: 20,
    marginTop: Default.fixPadding,
  },
  originalMessageContainer: {
    marginTop: Default.fixPadding * 1.5,
    paddingTop: Default.fixPadding * 1.5,
    borderTopWidth: 1,
    borderTopColor: Colors.extraLightGrey,
  },
  originalMessage: {
    ...Fonts.Medium14grey,
    lineHeight: 20,
    textAlign: 'left',
    fontStyle: 'italic',
  },
  categoryBadgeContainer: {
    marginBottom: Default.fixPadding * 1.2,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Default.fixPadding * 1.5,
    paddingVertical: Default.fixPadding * 0.8,
    borderRadius: 25,
  },
  categoryBadgeText: {
    ...Fonts.Medium14white,
    marginLeft: Default.fixPadding * 0.8,
    fontWeight: '600',
  },
  categoryDescription: {
    ...Fonts.Medium14grey,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.48,
    paddingVertical: Default.fixPadding * 1.2,
    borderRadius: 12,
    backgroundColor: Colors.primary + '10',
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  secondaryButton: {
    backgroundColor: Colors.green + '10',
    borderColor: Colors.green + '20',
  },
  actionButtonText: {
    ...Fonts.Medium14black,
    color: Colors.primary,
    marginLeft: Default.fixPadding * 0.5,
    fontWeight: '600',
  },
};

export default NotificationDetailScreen;
