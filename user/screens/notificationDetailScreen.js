import React, { useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  BackHandler,
  Image,
  Dimensions,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MyStatusBar from "../components/myStatusBar";
import { useMarkNotificationAsRead } from "../hooks/useNotifications";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const NotificationDetailScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() == "rtl";
  const markAsRead = useMarkNotificationAsRead();
  
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

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'join_request_approved':
        return { name: 'check-circle', color: Colors.green, bg: Colors.lightGreen };
      case 'join_request_rejected':
        return { name: 'cancel', color: Colors.red, bg: Colors.lightRed };
      case 'payment_reminder':
        return { name: 'payment', color: Colors.orange, bg: Colors.extraLightSky };
      case 'maintenance_update':
        return { name: 'build', color: Colors.blue, bg: Colors.lightBlue };
      case 'announcement':
        return { name: 'campaign', color: Colors.primary, bg: Colors.extraLightPrimary };
      default:
        return { name: 'notifications', color: Colors.primary, bg: Colors.extraLightPrimary };
    }
  };

  const iconData = getNotificationIcon(notification.type);

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
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <MyStatusBar />
      
      {/* Header */}
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

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Notification Header Card */}
        <View style={{
          margin: Default.fixPadding * 2,
          padding: Default.fixPadding * 2,
          borderRadius: 15,
          backgroundColor: Colors.white,
          ...Default.shadow,
        }}>
          {/* Icon and Status */}
          <View style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            alignItems: "center",
            marginBottom: Default.fixPadding * 1.5,
          }}>
            <View style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: iconData.bg,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: isRtl ? 0 : Default.fixPadding * 1.5,
              marginLeft: isRtl ? Default.fixPadding * 1.5 : 0,
            }}>
              <MaterialIcons
                name={iconData.name}
                size={28}
                color={iconData.color}
              />
            </View>
            
            <View style={{ flex: 1 }}>
              <Text style={{
                ...Fonts.SemiBold18black,
                textAlign: isRtl ? "right" : "left",
                marginBottom: Default.fixPadding * 0.5,
              }}>
                {notification.title}
              </Text>
              
              {/* Timestamp and Read Status */}
              <View style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                alignItems: "center",
              }}>
                <Text style={{
                  ...Fonts.Medium14grey,
                  textAlign: isRtl ? "right" : "left",
                }}>
                  {formatDate(notification.created_at)}
                </Text>
                
                {!notification.read_at && (
                  <View style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: Colors.primary,
                    marginLeft: isRtl ? 0 : Default.fixPadding,
                    marginRight: isRtl ? Default.fixPadding : 0,
                  }} />
                )}
              </View>
            </View>
          </View>

          {/* Title Section */}
          <View style={{
            paddingVertical: Default.fixPadding,
            borderTopWidth: 1,
            borderTopColor: Colors.extraLightGrey,
          }}>
            <Text style={{
              ...Fonts.SemiBold16black,
              textAlign: isRtl ? "right" : "left",
              marginBottom: Default.fixPadding * 0.8,
            }}>
              {tr("title")}
            </Text>
            <Text style={{
              ...Fonts.Medium15black,
              textAlign: isRtl ? "right" : "left",
              lineHeight: 22,
            }}>
              {notification.title}
            </Text>
          </View>
        </View>

        {/* Message Content Card */}
        <View style={{
          marginHorizontal: Default.fixPadding * 2,
          marginBottom: Default.fixPadding * 2,
          padding: Default.fixPadding * 2,
          borderRadius: 15,
          backgroundColor: Colors.white,
          ...Default.shadow,
        }}>
          <Text style={{
            ...Fonts.SemiBold16black,
            textAlign: isRtl ? "right" : "left",
            marginBottom: Default.fixPadding * 1.2,
          }}>
            {tr("message")}
          </Text>
          
          <Text style={{
            ...Fonts.Medium15black,
            textAlign: isRtl ? "right" : "left",
            lineHeight: 24,
            color: Colors.darkGrey,
          }}>
            {notification.message}
          </Text>
        </View>

        {/* Notification Type Badge */}
        <View style={{
          marginHorizontal: Default.fixPadding * 2,
          marginBottom: Default.fixPadding * 2,
        }}>
          <LinearGradient
            colors={[iconData.color, iconData.color + '80']}
            style={{
              paddingVertical: Default.fixPadding,
              paddingHorizontal: Default.fixPadding * 1.5,
              borderRadius: 25,
              alignSelf: isRtl ? 'flex-end' : 'flex-start',
            }}
          >
            <Text style={{
              ...Fonts.Medium14white,
              textAlign: "center",
            }}>
              {notification.type?.replace(/_/g, ' ').toUpperCase() || 'NOTIFICATION'}
            </Text>
          </LinearGradient>
        </View>

        {/* Additional Details if available */}
        {notification.data && (
          <View style={{
            marginHorizontal: Default.fixPadding * 2,
            marginBottom: Default.fixPadding * 2,
            padding: Default.fixPadding * 2,
            borderRadius: 15,
            backgroundColor: Colors.extraLightGrey,
          }}>
            <Text style={{
              ...Fonts.SemiBold16black,
              textAlign: isRtl ? "right" : "left",
              marginBottom: Default.fixPadding,
            }}>
              {tr("additionalDetails")}
            </Text>
            
            <Text style={{
              ...Fonts.Medium14grey,
              textAlign: isRtl ? "right" : "left",
              lineHeight: 20,
            }}>
              {typeof notification.data === 'string' 
                ? notification.data 
                : JSON.stringify(notification.data, null, 2)
              }
            </Text>
          </View>
        )}

        {/* Bottom spacing */}
        <View style={{ height: Default.fixPadding * 3 }} />
      </ScrollView>
    </View>
  );
};

export default NotificationDetailScreen;
