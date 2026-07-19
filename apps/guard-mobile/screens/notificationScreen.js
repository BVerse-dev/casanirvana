import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  BackHandler,
  Image,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SwipeListView } from "react-native-swipe-list-view";
import MyStatusBar from "../components/myStatusBar";
import SnackbarToast from "../components/snackbarToast";
import { Colors, Default, Fonts } from "../constants/styles";
import { useGuardAuth } from "../contexts/GuardAuthContext";
import { useNotifications } from "../hooks/useNotifications";

const NotificationScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const { user } = useGuardAuth();

  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const {
    notifications,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications(user?.id);

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

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const handleMarkAllAsRead = async () => {
    if (markingAll) return;
    try {
      setMarkingAll(true);
      await markAllAsRead();
      showToast("All notifications marked as read.");
    } catch (markError) {
      showToast(markError?.message || "Could not update notifications.");
    } finally {
      setMarkingAll(false);
    }
  };

  const handleNotificationPress = async (item) => {
    navigation.navigate("notificationDetailScreen", {
      notificationId: item.id,
      notification: item,
    });
    if (!item.isRead) {
      try {
        await markAsRead(item.id);
      } catch (markError) {
        showToast(markError?.message || "Could not mark notification as read.");
      }
    }
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return "";
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hr`;
    const days = Math.floor(diffInMinutes / 1440);
    return `${days} day${days > 1 ? "s" : ""}`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "guest_approved":
      case "visitor_approved":
      case "visitor_denied":
      case "visitor_checked_in":
      case "visitor_checked_out":
        return require("../assets/images/visitor1.png");
      case "emergency":
      case "emergency_alert":
        return require("../assets/images/visitor4.png");
      case "assignment":
        return require("../assets/images/visitor3.png");
      case "maintenance":
      case "maintenance_scheduled":
      case "maintenance_completed":
        return require("../assets/images/community4.png");
      case "payment_reminder":
      case "payment_overdue":
      case "payment_confirmed":
        return require("../assets/images/community5.png");
      case "notice":
      case "announcement":
        return require("../assets/images/community3.png");
      default:
        return require("../assets/images/s7.png");
    }
  };

  const displayNotifications = useMemo(
    () =>
      (notifications || []).map((notification) => {
        const isRead =
          Boolean(notification.read_at) ||
          Boolean(notification.is_read) ||
          Boolean(notification.read);
        return {
          key: notification.id,
          id: notification.id,
          title: notification.title || "Notification",
          body: notification.body || "",
          time: getTimeAgo(notification.created_at),
          isRead,
          image: getNotificationIcon(notification.notification_type),
          ...notification,
        };
      }),
    [notifications]
  );

  const unreadCount = displayNotifications.filter((item) => !item.isRead).length;

  const renderItem = ({ item }) => (
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
            <Image source={item.image} style={{ width: 35, height: 35, resizeMode: "contain" }} />
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
                fontWeight: item.isRead ? "normal" : "bold",
              }}
            >
              {item.title}
            </Text>
            <Text
              numberOfLines={2}
              style={{
                ...Fonts.Medium14grey,
                overflow: "hidden",
                fontWeight: item.isRead ? "normal" : "500",
              }}
            >
              {item.body}
            </Text>
          </View>
        </View>

        <View style={{ alignItems: isRtl ? "flex-start" : "flex-end" }}>
          <Text
            numberOfLines={1}
            style={{
              ...Fonts.Medium14grey,
              overflow: "hidden",
              maxWidth: 80,
              textAlign: isRtl ? "left" : "right",
            }}
          >
            {item.time}
          </Text>
          {!item.isRead ? (
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: Colors.primary,
                marginTop: 4,
              }}
            />
          ) : null}
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderHiddenItem = (rowData, rowMap) => {
    const item = rowData.item;
    const canMarkRead = !item.isRead;
    return (
      <View
        style={{
          flex: 1,
          marginBottom: Default.fixPadding * 2,
          marginHorizontal: Default.fixPadding * 2,
          borderRadius: 10,
          backgroundColor: canMarkRead ? Colors.primary : Colors.grey,
          justifyContent: "center",
          alignItems: "flex-end",
          paddingRight: Default.fixPadding * 1.6,
        }}
      >
        <TouchableOpacity
          disabled={!canMarkRead}
          onPress={async () => {
            if (!canMarkRead) return;
            try {
              await markAsRead(item.id);
              showToast("Notification marked as read.");
            } catch (markError) {
              showToast(markError?.message || "Could not mark notification as read.");
            } finally {
              rowMap[item.key]?.closeRow();
            }
          }}
        >
          <Text style={{ ...Fonts.SemiBold14white }}>
            {canMarkRead ? "Mark Read" : "Read"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

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
            flex: 1,
          }}
        >
          {tr("notification")}
        </Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={handleMarkAllAsRead} disabled={markingAll}>
            <Text
              style={{
                ...Fonts.SemiBold14primary,
                opacity: markingAll ? 0.6 : 1,
              }}
            >
              {markingAll ? "Updating..." : "Mark all read"}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {loading && displayNotifications.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={{ ...Fonts.Medium14grey, marginTop: Default.fixPadding }}>
            Loading notifications...
          </Text>
        </View>
      ) : displayNotifications.length === 0 ? (
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
          rightOpenValue={-100}
          disableRightSwipe
          useNativeDriver={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: Default.fixPadding * 0.8 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        />
      )}

      {error ? (
        <View
          style={{
            marginHorizontal: Default.fixPadding * 2,
            marginBottom: Default.fixPadding * 1.6,
            padding: Default.fixPadding,
            borderRadius: 8,
            backgroundColor: Colors.orange + "20",
          }}
        >
          <Text style={{ ...Fonts.Medium14black, color: Colors.orange }}>{error}</Text>
        </View>
      ) : null}

      <SnackbarToast
        title={toastMessage || tr("remove")}
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />
    </View>
  );
};

export default NotificationScreen;
