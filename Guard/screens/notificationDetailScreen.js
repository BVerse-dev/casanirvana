import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MyStatusBar from "../components/myStatusBar";
import { Colors, Default, Fonts } from "../constants/styles";
import { supabase } from "../utils/supabase";
import { useGuardAuth } from "../contexts/GuardAuthContext";

const NotificationDetailScreen = ({ navigation, route }) => {
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const { user } = useGuardAuth();

  const initialNotification = route?.params?.notification || null;
  const notificationId = route?.params?.notificationId || initialNotification?.id || null;
  const autoMarkRef = useRef(false);

  const [notification, setNotification] = useState(initialNotification);
  const [loading, setLoading] = useState(!initialNotification && Boolean(notificationId));
  const [actionLoading, setActionLoading] = useState(false);

  const isRead = useMemo(
    () =>
      Boolean(notification?.read_at) ||
      Boolean(notification?.is_read) ||
      Boolean(notification?.read),
    [notification?.is_read, notification?.read, notification?.read_at]
  );

  const backAction = useCallback(() => {
    navigation.goBack();
    return true;
  }, [navigation]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => subscription?.remove();
  }, [backAction]);

  const fetchNotification = useCallback(async () => {
    if (!notificationId || !user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("id", notificationId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      setNotification(data || null);
    } catch (error) {
      Alert.alert("Load failed", error?.message || "Could not load notification details.");
    } finally {
      setLoading(false);
    }
  }, [notificationId, user?.id]);

  useEffect(() => {
    fetchNotification();
  }, [fetchNotification]);

  const updateReadState = useCallback(
    async (nextRead, { silent = false } = {}) => {
      if (!notification?.id || !user?.id) return;
      const nextReadAt = nextRead ? new Date().toISOString() : null;

      setActionLoading(true);
      const prev = notification;
      setNotification((current) =>
        current
          ? {
              ...current,
              read_at: nextReadAt,
              is_read: nextRead,
              read: nextRead,
            }
          : current
      );

      const { error } = await supabase
        .from("notifications")
        .update({
          read_at: nextReadAt,
          is_read: nextRead,
          read: nextRead,
        })
        .eq("id", notification.id)
        .eq("user_id", user.id);

      setActionLoading(false);

      if (error) {
        setNotification(prev);
        if (!silent) {
          Alert.alert("Update failed", error.message || "Could not update notification.");
        }
      }
    },
    [notification, user?.id]
  );

  useEffect(() => {
    if (!notification?.id || isRead || autoMarkRef.current) return;
    autoMarkRef.current = true;
    updateReadState(true, { silent: true });
  }, [isRead, notification?.id, updateReadState]);

  const formatDateTime = (value) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeLabel = (value) =>
    String(value || "general")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const handleShare = async () => {
    if (!notification) return;
    try {
      await Share.share({
        title: notification.title || "Notification",
        message: `${notification.title || "Notification"}\n\n${notification.body || ""}`,
      });
    } catch (error) {
      Alert.alert("Share failed", error?.message || "Could not share notification.");
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.white }}>
        <MyStatusBar />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={{ ...Fonts.Medium14grey, marginTop: Default.fixPadding }}>
            Loading details...
          </Text>
        </View>
      </View>
    );
  }

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
          }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons
              name={isRtl ? "arrow-forward-outline" : "arrow-back-outline"}
              size={25}
              color={Colors.black}
            />
          </TouchableOpacity>
          <Text style={{ ...Fonts.SemiBold18black, marginHorizontal: Default.fixPadding }}>
            Notification Details
          </Text>
        </View>

        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Ionicons name="notifications-off-outline" size={48} color={Colors.grey} />
          <Text style={{ ...Fonts.SemiBold16grey, marginTop: Default.fixPadding }}>
            Notification not found.
          </Text>
        </View>
      </View>
    );
  }

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
          Notification Details
        </Text>
        <TouchableOpacity onPress={handleShare}>
          <MaterialCommunityIcons name="share-variant" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: Default.fixPadding * 2,
          paddingVertical: Default.fixPadding * 2,
        }}
      >
        <View
          style={{
            borderRadius: 14,
            padding: Default.fixPadding * 1.6,
            backgroundColor: Colors.extraLightGrey,
            borderWidth: 1,
            borderColor: Colors.lightSky,
            marginBottom: Default.fixPadding * 1.6,
          }}
        >
          <Text style={{ ...Fonts.SemiBold18black, marginBottom: Default.fixPadding * 0.6 }}>
            {notification.title || "Notification"}
          </Text>
          <Text style={{ ...Fonts.Medium14grey, marginBottom: Default.fixPadding * 0.9 }}>
            {getTypeLabel(notification.notification_type)}
          </Text>
          <Text style={{ ...Fonts.Medium14black, lineHeight: 22 }}>
            {notification.body || "No message body available."}
          </Text>
        </View>

        <View
          style={{
            borderRadius: 14,
            padding: Default.fixPadding * 1.4,
            backgroundColor: Colors.white,
            borderWidth: 1,
            borderColor: Colors.lightSky,
            marginBottom: Default.fixPadding * 1.6,
          }}
        >
          <Text style={{ ...Fonts.SemiBold16black, marginBottom: Default.fixPadding }}>
            Details
          </Text>
          <Text style={{ ...Fonts.Medium14grey, marginBottom: Default.fixPadding * 0.6 }}>
            Created: {formatDateTime(notification.created_at)}
          </Text>
          <Text style={{ ...Fonts.Medium14grey, marginBottom: Default.fixPadding * 0.6 }}>
            Status: {isRead ? "Read" : "Unread"}
          </Text>
          <Text style={{ ...Fonts.Medium14grey, marginBottom: Default.fixPadding * 0.6 }}>
            Priority: {getTypeLabel(notification.priority || "normal")}
          </Text>
          <Text style={{ ...Fonts.Medium14grey }}>
            Reference ID: {notification.reference_id || "N/A"}
          </Text>
        </View>

        <TouchableOpacity
          disabled={actionLoading}
          onPress={() => updateReadState(!isRead)}
          style={{
            backgroundColor: Colors.primary,
            borderRadius: 10,
            paddingVertical: Default.fixPadding * 1.2,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: Default.fixPadding,
            opacity: actionLoading ? 0.6 : 1,
          }}
        >
          <Text style={{ ...Fonts.SemiBold16white }}>
            {actionLoading ? "Updating..." : isRead ? "Mark as Unread" : "Mark as Read"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default NotificationDetailScreen;
