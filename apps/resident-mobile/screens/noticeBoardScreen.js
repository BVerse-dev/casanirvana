import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  FlatList,
  ActivityIndicator,
  Image,
  Alert,
  Share,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MyStatusBar from "../components/myStatusBar";
import DashedLine from "react-native-dashed-line";
import { ms } from "react-native-size-matters/extend";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useAuth } from "../contexts/AuthContext";
import { useListNotices } from "../hooks/useListNotices";
import { useNotificationContext } from "../contexts/NotificationContext";
import { isPushNotificationsSupported } from "../utils/notificationRuntime";

const NoticeBoardScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const { profile } = useAuth();
  const { isGranted, setupNotifications } = useNotificationContext();

  // State for favorites and refresh
  const [favoriteNotices, setFavoriteNotices] = useState(new Set());
  const [refreshing, setRefreshing] = useState(false);

  function tr(key) {
    return t(`noticeBoardScreen:${key}`);
  }

  // Initialize push notifications on mount
  useEffect(() => {
    if (profile && !isGranted && isPushNotificationsSupported) {
      setupNotifications();
    }
  }, [profile, isGranted, setupNotifications]);

  // Get notices for user's community
  const { data: noticesResponse, isLoading, error, refetch } = useListNotices(profile?.community_id, 1, 50);
  
  // Transform database notices to match UI format
  const noticeList = noticesResponse?.data?.map(notice => ({
    key: notice.id.toString(),
    id: notice.id,
    community_id: notice.community_id,
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

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      navigation.pop();
      return true;
    });
    return () => {
      subscription?.remove();
    };
  }, [navigation]);

  // Helper function to handle sharing
  const handleShare = async (notice) => {
    try {
      const shareContent = {
        title: notice.title,
        message: `${notice.title}\n\n${notice.fullNotice || notice.notice}\n\nPosted by: ${notice.postBy}\nDate: ${notice.dateTime}\n\n- Casa Nirvana Community`,
        url: notice.image_url || undefined,
      };

      await Share.share(shareContent);
    } catch (error) {
      console.error('Error sharing notice:', error);
      Alert.alert('Error', 'Failed to share notice');
    }
  };

  // Helper function to toggle favorite
  const handleFavorite = (noticeId) => {
    setFavoriteNotices(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(noticeId)) {
        newFavorites.delete(noticeId);
      } else {
        newFavorites.add(noticeId);
      }
      return newFavorites;
    });
  };

  // Helper function to get notice image
  const getNoticeImage = (notice) => {
    if (notice.image_url) {
      return { uri: notice.image_url };
    }
    // Default notice icon - using notification image
    return require("../assets/images/notification.png");
  };

  // Handle pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Error refreshing notices:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const renderItem = ({ item, index }) => {
    const lastIndex = noticeList.length - 1 === index;
    const isFavorited = favoriteNotices.has(item.id);

    return (
      <View
        style={{
          marginBottom: lastIndex ? Default.fixPadding : Default.fixPadding * 2,
          marginHorizontal: Default.fixPadding * 2,
          borderRadius: 10,
          backgroundColor: Colors.white,
          ...Default.shadow,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.push("noticeDetailScreen", { notice: item })}
          style={{
            flex: 1,
            flexDirection: isRtl ? "row-reverse" : "row",
            alignItems: "center",
            padding: Default.fixPadding,
          }}
        >
          <Image
            source={getNoticeImage(item)}
            style={{ 
              width: ms(75), 
              height: ms(75), 
              borderRadius: 5,
              backgroundColor: Colors.lightGrey 
            }}
            defaultSource={require("../assets/images/notification.png")}
          />

          <View
            style={{
              flex: 1,
              alignItems: isRtl ? "flex-end" : "flex-start",
              marginHorizontal: Default.fixPadding * 1.6,
            }}
          >
            <View
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Text
                numberOfLines={1}
                style={{ 
                  ...Fonts.Medium16black, 
                  overflow: "hidden",
                  flex: 1,
                  marginRight: item.new ? Default.fixPadding : 0,
                }}
              >
                {item.title}
              </Text>
              {item.new && (
                <View
                  style={{
                    backgroundColor: Colors.primary,
                    paddingHorizontal: Default.fixPadding * 0.8,
                    paddingVertical: Default.fixPadding * 0.3,
                    borderRadius: 12,
                  }}
                >
                  <Text style={{ ...Fonts.SemiBold10white }}>
                    {tr("new")}
                  </Text>
                </View>
              )}
            </View>
            
            <Text
              numberOfLines={1}
              style={{
                ...Fonts.Medium14grey,
                overflow: "hidden",
                marginVertical: Default.fixPadding * 0.2,
              }}
            >
              {item.dateTime}
            </Text>

            <Text
              numberOfLines={1}
              style={{
                ...Fonts.Medium14grey,
                overflow: "hidden",
                marginTop: Default.fixPadding * 0.3,
              }}
            >
              {item.notice}
            </Text>
          </View>
        </TouchableOpacity>

        <DashedLine
          dashGap={2.5}
          dashLength={2.5}
          dashThickness={1.5}
          dashColor={Colors.grey}
        />

        <View
          style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: Default.fixPadding,
          }}
        >
          <TouchableOpacity
            onPress={() => handleShare(item)}
            style={{
              flex: 1,
              flexDirection: isRtl ? "row-reverse" : "row",
              alignItems: "center",
            }}
          >
            <MaterialCommunityIcons
              name="share-variant"
              size={20}
              color={Colors.grey}
            />
            <Text
              numberOfLines={1}
              style={{
                ...Fonts.Medium14grey,
                overflow: "hidden",
                marginHorizontal: Default.fixPadding * 0.5,
              }}
            >
              {tr("share")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleFavorite(item.id)}
            style={{
              flex: 1,
              flexDirection: isRtl ? "row-reverse" : "row",
              justifyContent: "center",
              alignItems: "center",
              marginHorizontal: Default.fixPadding * 1.5,
            }}
          >
            <MaterialCommunityIcons
              name={isFavorited ? "heart" : "heart-outline"}
              size={20}
              color={isFavorited ? Colors.red : Colors.grey}
            />
            <Text
              numberOfLines={1}
              style={{
                ...Fonts.Medium14grey,
                overflow: "hidden",
                marginHorizontal: Default.fixPadding * 0.5,
                color: isFavorited ? Colors.red : Colors.grey,
              }}
            >
              {tr("favorite")}
            </Text>
          </TouchableOpacity>

        </View>
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
            Check back later for updates from your community
          </Text>
        </View>
      ) : (
        <FlatList
          data={noticeList}
          renderItem={renderItem}
          keyExtractor={(item) => item.key}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: Default.fixPadding * 0.8 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
              title="Pull to refresh notices..."
              titleColor={Colors.grey}
            />
          }
        />
      )}
    </View>
  );
};

export default NoticeBoardScreen;
