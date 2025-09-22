import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  FlatList,
  ActivityIndicator,
} from "react-native";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MyStatusBar from "../components/myStatusBar";
import DashedLine from "react-native-dashed-line";
import { useAuth } from "../contexts/AuthContext";
import { useListNotices } from "../hooks/useListNotices";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../utils/supabase";
import { useNotificationContext } from "../contexts/NotificationContext";

const NoticeBoardScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() == "rtl";
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { isGranted, setupNotifications } = useNotificationContext();

  function tr(key) {
    return t(`noticeBoardScreen:${key}`);
  }

  // Initialize push notifications on mount
  useEffect(() => {
    if (profile && !isGranted) {
      setupNotifications();
    }
  }, [profile, isGranted]);

  // Get notices for user's community
  const { data: noticesResponse, isLoading, error } = useListNotices(profile?.community_id, 1, 50);
  
  // Transform database notices to match UI format
  const noticeList = noticesResponse?.data?.map(notice => ({
    key: notice.id.toString(),
    id: notice.id,
    title: notice.title,
    notice: notice.body ? notice.body.substring(0, 300) + (notice.body.length > 300 ? "..." : "") : "",
    fullNotice: notice.body,
    image_url: notice.image_url, // Include image URL from database
    dateTime: new Date(notice.posted_at).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short', 
      year: 'numeric'
    }) + ', ' + new Date(notice.posted_at).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }),
    postBy: notice.author_name ? notice.author_name.split(' ')[0] : "Admin", // Get first name only
    new: new Date(notice.posted_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // New if posted within last 7 days
  })) || [];

  const backAction = () => {
    navigation.pop();
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => {
      const subscription = BackHandler.addEventListener("hardwareBackPress", backAction); return () => subscription?.remove(); }
  }, []);

  // Set up real-time subscription for notice updates
  useEffect(() => {
    if (!profile?.community_id) return;
    
    const channel = supabase
      .channel('public:notices')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notices',
        filter: `community_id=eq.${profile.community_id}`
      }, () => {
        queryClient.invalidateQueries(['notices', profile.community_id]);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [profile?.community_id, queryClient]);

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => navigation.push("noticeDetailScreen", { notice: item })}
        style={{
          flex: 1,
          flexDirection: isRtl ? "row-reverse" : "row",
          marginHorizontal: Default.fixPadding * 2,
          marginBottom: Default.fixPadding * 2,
          borderRadius: 10,
          backgroundColor: Colors.white,
          ...Default.shadow,
        }}
      >
        <View
          style={{
            flex: 0.2,
            backgroundColor: Colors.primary,
            borderTopLeftRadius: isRtl ? 0 : 10,
            borderBottomLeftRadius: isRtl ? 0 : 10,
            borderTopRightRadius: isRtl ? 10 : 0,
            borderBottomRightRadius: isRtl ? 10 : 0,
          }}
        />
        <View style={{ flex: 9.8 }}>
          <View
            style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              justifyContent: "space-between",
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                ...Fonts.SemiBold16black,
                flex: 1,
                overflow: "hidden",
                textAlign: isRtl ? "right" : "left",
                marginTop: Default.fixPadding * 0.9,
                marginHorizontal: Default.fixPadding * 1.4,
              }}
            >
              {item.title}
            </Text>
            {item.new && (
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  width: 52,
                  height: 22,
                  backgroundColor: Colors.primary,
                  borderTopRightRadius: isRtl ? 0 : 10,
                  borderTopLeftRadius: isRtl ? 10 : 0,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    ...Fonts.SemiBold12white,
                    overflow: "hidden",
                    paddingHorizontal: Default.fixPadding * 0.5,
                  }}
                >
                  {tr("new")}
                </Text>
              </View>
            )}
          </View>
          <Text
            numberOfLines={3}
            style={{
              ...Fonts.Medium14grey,
              textAlign: isRtl ? "right" : "left",
              marginTop: Default.fixPadding * 0.6,
              paddingBottom: Default.fixPadding,
              paddingHorizontal: Default.fixPadding * 1.4,
              lineHeight: 20,
            }}
          >
            {item.notice}
          </Text>
          <DashedLine
            dashGap={2.5}
            dashLength={2.5}
            dashThickness={1.5}
            dashColor={Colors.grey}
          />
          <View
            style={{
              overflow: "hidden",
            }}
          >
            <View
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                justifyContent: "flex-start",
                alignItems: "center",
                padding: Default.fixPadding,
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  ...Fonts.Medium14black,
                  flex: 1,
                  overflow: "hidden",
                  textAlign: isRtl ? "right" : "left",
                }}
              >
                {`Posted by: Admin | ${item.dateTime}`}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
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
          }}
        >
          {tr("noticeBoard")}
        </Text>
      </View>
      
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={{ ...Fonts.Medium16grey, marginTop: Default.fixPadding }}>
            Loading notices...
          </Text>
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Default.fixPadding * 2 }}>
          <Ionicons name="alert-circle" size={50} color={Colors.red} />
          <Text style={{ ...Fonts.Medium16black, textAlign: 'center', marginTop: Default.fixPadding }}>
            Failed to load notices
          </Text>
          <Text style={{ ...Fonts.Regular14grey, textAlign: 'center', marginTop: Default.fixPadding * 0.5 }}>
            Please check your connection and try again
          </Text>
        </View>
      ) : noticeList.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Default.fixPadding * 2 }}>
          <Ionicons name="document-text-outline" size={50} color={Colors.grey} />
          <Text style={{ ...Fonts.Medium16black, textAlign: 'center', marginTop: Default.fixPadding }}>
            No notices available
          </Text>
          <Text style={{ ...Fonts.Regular14grey, textAlign: 'center', marginTop: Default.fixPadding * 0.5 }}>
            Check back later for updates from your society
          </Text>
        </View>
      ) : (
        <FlatList
          data={noticeList}
          renderItem={renderItem}
          keyExtractor={(item) => item.key}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: Default.fixPadding * 0.8 }}
        />
      )}
    </View>
  );
};

export default NoticeBoardScreen;
