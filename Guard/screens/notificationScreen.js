import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, BackHandler, Dimensions, Animated, Image } from "react-native";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import MyStatusBar from "../components/myStatusBar";
import { Colors, Default, Fonts } from "../constants/styles";
import SnackbarToast from "../components/snackbarToast";
import { SwipeListView } from "react-native-swipe-list-view";

const NotificationScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`notificationScreen:${key}`);
  }

  useEffect(() => {
    const backAction = () => {
      navigation.pop();
      return true;
    };
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => subscription?.remove();
  }, [navigation]);

  // Mock data in the same shape as user-app list items
  // Each item must include id, title, body, created_at, read_at, notification_type
  const [notificationList, setNotificationList] = useState([
    {
      id: "mock-1",
      title: "Join Request Approved",
      body: "Your request to join Casa Nirvana has been approved.",
      created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      read_at: null,
      notification_type: "join_request_approved",
      priority: "normal",
    },
    {
      id: "mock-2",
      title: "Maintenance Update",
      body: "Elevator maintenance scheduled for 3 PM today.",
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      notification_type: "maintenance",
      priority: "normal",
    },
  ]);
  const [removeNotificationToast, setRemoveNotificationToast] = useState(false);
  const onDismissRemoveNotificationToast = () => setRemoveNotificationToast(false);

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hr`;
    return `${Math.floor(diffInMinutes / 1440)} day${Math.floor(diffInMinutes / 1440) > 1 ? 's' : ''}`;
  };

  // Match user-app mapping for icons
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'join_request_approved':
        return require("../assets/images/community5.png");
      case 'maintenance':
        return require("../assets/images/community4.png");
      case 'notice':
        return require("../assets/images/community3.png");
      case 'amenity':
        return require("../assets/images/community5.png");
      default:
        return require("../assets/images/s7.png");
    }
  };

  const displayNotifications = notificationList.map((notification) => ({
    key: notification.id,
    id: notification.id,
    title: notification.title,
    body: notification.body,
    time: getTimeAgo(notification.created_at),
    isRead: !!notification.read_at,
    notificationType: notification.notification_type,
    priority: notification.priority || 'normal',
    image: getNotificationIcon(notification.notification_type),
    ...notification,
  }));

  const rowTranslateAnimatedValues = {};
  displayNotifications.forEach((item) => {
    rowTranslateAnimatedValues[item.key] = new Animated.Value(1);
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
        setNotificationList((list) => list.filter((n) => n.id !== key));
        setRemoveNotificationToast(true);
      });
    }
  };

  const handleNotificationPress = (item) => {
    navigation.navigate('notificationDetailScreen', { notification: item });
    if (!item.read_at) {
      setNotificationList((list) => list.map((n) => n.id === item.id ? { ...n, read_at: new Date().toISOString() } : n));
    }
  };

  const renderItem = ({ item }) => (
    <Animated.View style={{ backgroundColor: Colors.white, opacity: rowTranslateAnimatedValues[item.key] }}>
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
    </Animated.View>
  );

  const renderHiddenItem = () => (
    <View style={{ flex: 1, marginBottom: Default.fixPadding * 2, backgroundColor: Colors.red }} />
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

      {displayNotifications.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Ionicons name="notifications-off-outline" size={48} color={Colors.grey} />
          <Text style={{ ...Fonts.SemiBold16grey, marginTop: Default.fixPadding }}>
            {tr("noNotification")}
          </Text>
        </View>
      ) : (
        <SwipeListView
          data={displayNotifications}
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
