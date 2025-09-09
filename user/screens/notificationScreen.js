import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  Dimensions,
  Animated,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SwipeListView } from "react-native-swipe-list-view";
import SnackbarToast from "../components/snackbarToast";
import MyStatusBar from "../components/myStatusBar";
import { 
  useNotifications, 
  useMarkNotificationAsRead, 
  useDeleteNotification,
  useNotificationSubscription 
} from "../hooks/useNotifications";

const NotificationScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`notificationScreen:${key}`);
  }

  // Real notification hooks
  const { data: notificationList = [], isLoading } = useNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const deleteNotification = useDeleteNotification();
  
  // Set up real-time subscription
  useNotificationSubscription();

  const backAction = () => {
    navigation.pop();
    return true;
  };
  
  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => {
      subscription?.remove(); 
    };
  }, []);

  const [removeNotificationToast, setRemoveNotificationToast] = useState(false);
  const onDismissRemoveNotificationToast = () =>
    setRemoveNotificationToast(false);

  // Convert real notifications to display format
  const getDisplayNotifications = () => {
    return notificationList.map((notification, index) => ({
      key: notification.id,
      id: notification.id,
      title: notification.title,
      body: notification.body, // Real data uses 'body'
      time: getTimeAgo(notification.created_at),
      isRead: !!notification.read_at, // Real data uses 'read_at' timestamp
      notificationType: notification.notification_type, // Real data uses 'notification_type'
      priority: notification.priority || 'normal',
      image: getNotificationIcon(notification.notification_type),
      // Pass the full notification object for navigation
      ...notification
    }));
  };

  // Helper function to get time ago
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hr`;
    return `${Math.floor(diffInMinutes / 1440)} day${Math.floor(diffInMinutes / 1440) > 1 ? 's' : ''}`;
  };

  // Helper function to get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'join_request_approved':
        return require("../assets/images/community5.png"); // Admin/Success icon
      case 'maintenance':
        return require("../assets/images/community4.png");
      case 'notice':
        return require("../assets/images/community3.png");
      case 'amenity':
        return require("../assets/images/community5.png");
      default:
        return require("../assets/images/s7.png"); // Default user icon
    }
  };

  const [notification, setNotification] = useState([]);

  // Update local state when real notifications change
  useEffect(() => {
    const displayNotifications = getDisplayNotifications();
    setNotification(displayNotifications);
  }, [notificationList]);

  const rowTranslateAnimatedValues = {};
  notification.forEach((_, i) => {
    rowTranslateAnimatedValues[`${i}`] = new Animated.Value(1);
  });

  const onSwipeValueChange = (swipeData) => {
    const { key, value } = swipeData;
    if (
      value < -Dimensions.get("window").width ||
      value > Dimensions.get("window").width
    ) {
      Animated.timing(rowTranslateAnimatedValues[key], {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start(() => {
        // Delete the notification from database
        deleteNotification.mutateAsync(key).then(() => {
          const newData = [...notification];
          const prevIndex = notification.findIndex((item) => item.key === key);
          newData.splice(prevIndex, 1);
          setNotification(newData);
          setRemoveNotificationToast(true);
        }).catch((error) => {
          console.error('Failed to delete notification:', error);
        });
      });
    }
  };

  // Handle notification tap (mark as read and navigate to detail)
  const handleNotificationPress = (notificationItem) => {
    console.log('📱 Notification tapped:', notificationItem.id);
    
    // Navigate to notification detail screen
    navigation.navigate('notificationDetailScreen', {
      notification: notificationItem
    });
    
    // Mark as read if not already read (detail screen will also handle this)
    if (!notificationItem.read_at) {
      markAsRead.mutateAsync(notificationItem.id).catch((error) => {
        console.error('Failed to mark notification as read:', error);
      });
    }
  };

  const renderItem = ({ item }) => {
    return (
      <View style={{ backgroundColor: Colors.white }}>
        <TouchableOpacity
          onPress={() => handleNotificationPress(item)}
          style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            marginBottom: Default.fixPadding * 2,
            marginHorizontal: Default.fixPadding * 2,
            paddingVertical: Default.fixPadding * 1.1,
            paddingHorizontal: Default.fixPadding * 1.2,
            borderRadius: 10,
            backgroundColor: item.isRead ? Colors.white : Colors.extraLightGrey,
            ...Default.shadow,
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: isRtl ? "row-reverse" : "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                width: 45,
                height: 45,
                borderRadius: 5,
                backgroundColor: Colors.extraLightBlue,
              }}
            >
              <Image
                source={
                  typeof item.image === 'number' 
                    ? item.image 
                    : typeof item.image === 'string' && item.image.startsWith('http')
                      ? { uri: item.image }
                      : require("../assets/images/s7.png") // Fallback icon
                }
                style={{ width: 35, height: 35, resizeMode: "contain" }}
              />
            </View>

            <View
              style={{
                flex: 1,
                alignItems: isRtl ? "flex-end" : "flex-start",
                marginHorizontal: Default.fixPadding,
              }}
            >
              <Text
                numberOfLines={1}
                style={{ 
                  ...Fonts.SemiBold16black, 
                  overflow: "hidden",
                  fontWeight: item.isRead ? 'normal' : 'bold'
                }}
              >
                {item.title}
              </Text>
              <Text
                numberOfLines={2}
                style={{ 
                  ...Fonts.Medium14grey, 
                  overflow: "hidden",
                  fontWeight: item.isRead ? 'normal' : '500'
                }}
              >
                {item.body}
              </Text>
            </View>
          </View>

          <View
            style={{
              alignItems: isRtl ? "flex-start" : "flex-end",
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                ...Fonts.Medium14grey,
                overflow: "hidden",
                maxWidth: 70,
                textAlign: isRtl ? "left" : "right",
              }}
            >
              {item.time}
            </Text>
            {!item.isRead && (
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: Colors.primary,
                  marginTop: 4,
                }}
              />
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderHiddenItem = () => (
    <View
      style={{
        flex: 1,
        marginBottom: Default.fixPadding * 2,
        backgroundColor: Colors.red,
      }}
    />
  );

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
          style={{
            ...Fonts.SemiBold18black,
            marginHorizontal: Default.fixPadding,
          }}
        >
          {tr("notification")}
        </Text>
      </View>

      {notification.length === 0 ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Ionicons
            name="notifications-off-outline"
            size={48}
            color={Colors.grey}
          />
          <Text
            style={{
              ...Fonts.SemiBold16grey,
              marginTop: Default.fixPadding,
            }}
          >
            {tr("noNotification")}
          </Text>
        </View>
      ) : (
        <SwipeListView
          data={notification}
          renderItem={renderItem}
          renderHiddenItem={renderHiddenItem}
          onSwipeValueChange={onSwipeValueChange}
          useNativeDriver={false}
          showsVerticalScrollIndicator={false}
          rightOpenValue={-Dimensions.get("window").width}
          leftOpenValue={Dimensions.get("window").width}
          contentContainerStyle={{ paddingTop: Default.fixPadding * 0.8 }}
        />
      )}

      <SnackbarToast
        title={tr("remove")}
        visible={removeNotificationToast}
        onDismiss={onDismissRemoveNotificationToast}
      />
    </View>
  );
};

export default NotificationScreen;
