import React from "react";
import { Text, View, TouchableOpacity, Image, FlatList } from "react-native";
import MyStatusBar from "../components/myStatusBar";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import { ms } from "react-native-size-matters/extend";
import { LinearGradient } from "expo-linear-gradient";
import { useHasJoinedCommunity, useProfileSubscription } from "../hooks/useCommunityData";
import { useUnreadNotificationsCount, useNotificationSubscription } from "../hooks/useNotifications";
import { useListNotices } from "../hooks/useListNotices";

const HomeScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();

  const isRtl = i18n.dir() == "rtl";

  // Real community status check from database
  const { hasJoinedCommunity, hasPendingRequest, isLoading: communityLoading, profile, userName, unitDisplay, pendingRequest } = useHasJoinedCommunity();

  // Debug logging for homescreen
  console.log('🏠 HomeScreen: Community status:', {
    hasJoinedCommunity,
    hasPendingRequest, 
    unitDisplay,
    communityLoading,
    profileCommunityId: profile?.community_id,
    profileUnitId: profile?.unit_id,
    profileEmail: profile?.email
  });

  // Real notification system
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();
  
  // Fetch latest notices for the banner
  const { data: noticesResponse } = useListNotices(profile?.community_id, 1, 1);
  const latestNotice = noticesResponse?.data?.[0];
  
  // Set up real-time subscriptions
  useNotificationSubscription();
  useProfileSubscription();

  // Safe translation function that ALWAYS returns a string
  function tr(key, fallback = "Missing Translation") {
    if (!key) return fallback || "";
    
    try {
      const translation = t(`homeScreen:${key}`);
      
      // Verify the translation is a valid string
      if (typeof translation !== 'string') {
        return fallback || key || "";
      }
      
      return (translation && typeof translation === 'string' && translation.trim() !== '') 
        ? translation 
        : fallback;
    } catch (error) {
      // If any error occurs during translation, return the fallback
      return fallback || key || "";
    }
  }

  const communityList = [
    {
      key: "1",
      image: require("../assets/images/community1.png"),
      title: tr("members"),
      other: tr("connectMember"),
      navigateTo: "communityMemberScreen",
    },
    {
      key: "2",
      image: require("../assets/images/community2.png"),
      title: tr("visitors"),
      other: tr("manageEntry"),
      navigateTo: "visitorsScreen",
    },
    {
      key: "3",
      image: require("../assets/images/community3.png"),
      title: tr("noticeBoard"),
      other: tr("societyAnnouncement"),
      navigateTo: "noticeBoardScreen",
    },
    {
      key: "4",
      image: require("../assets/images/community4.png"),
      title: tr("payment"),
      other: tr("directPayment"),
      navigateTo: "paymentScreen",
    },
    {
      key: "5",
      image: require("../assets/images/community5.png"),
      title: tr("bookAmenities"),
      other: tr("preBook"),
      navigateTo: "bookedAmenitiesScreen",
    },
    {
      key: "6",
      image: require("../assets/images/community6.png"),
      title: tr("helpDesk"),
      other: tr("complaint"),
      navigateTo: "helpDeskScreen",
    },
    {
      key: "7",
      image: require("../assets/images/community7.png"),
      title: tr("complaints"),
      other: tr("submitComplaint"),
      navigateTo: "complaintsScreen",
    },
    {
      key: "8",
      image: require("../assets/images/community8.png"),
      title: tr("maintenance"),
      other: tr("requestService"),
      navigateTo: "MaintenanceRequestsScreen",
    },
  ];

  const renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity
        onPress={() => navigation.push(item.navigateTo)}
        style={{
          flex: 1,
          justifyContent: "space-between",
          marginRight: Default.fixPadding * 2,
          marginLeft: index % 2 === 0 ? Default.fixPadding * 2 : 0,
          marginBottom: Default.fixPadding * 1.5,
          borderRadius: 20,
          backgroundColor: Colors.white,
          ...Default.shadow,
          height: ms(150),
        }}
      >
        <View
          style={{
            alignItems: isRtl ? "flex-end" : "flex-start",
            paddingTop: Default.fixPadding * 2,
            paddingHorizontal: Default.fixPadding * 1.4,
          }}
        >
          <Text
            numberOfLines={1}
            style={{ ...Fonts.SemiBold16black, overflow: "hidden" }}
          >
            {item.title}
          </Text>
          <Text
            numberOfLines={2}
            style={{
              ...Fonts.Medium12grey,
              overflow: "hidden",
              marginTop: Default.fixPadding * 0.2,
            }}
          >
            {item.other}
          </Text>
        </View>
        <View
          style={{
            alignSelf: isRtl ? "flex-start" : "flex-end",
            marginTop: Default.fixPadding * 2,
            paddingHorizontal: Default.fixPadding,
          }}
        >
          <Image
            source={
              typeof item.image === 'number' 
                ? item.image 
                : typeof item.image === 'string' && item.image.startsWith('http')
                  ? { uri: item.image }
                  : require("../assets/images/community1.png") // Fallback community icon
            }
            style={{
              resizeMode: "contain",
              width: ms(60),
              height: ms(60),
            }}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const NoticeBanner = () => {
    // Determine if the latest notice is "new" (posted within last 7 days)
    const isNewNotice = latestNotice && new Date(latestNotice.posted_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // Get notice preview (first 180 characters for 3 lines) or fallback to original translation
    // Clean up the text by removing extra whitespace and line breaks
    const noticePreview = latestNotice?.body 
      ? latestNotice.body
          .replace(/\s+/g, ' ') // Replace multiple spaces/newlines with single space
          .trim() // Remove leading/trailing whitespace
          .substring(0, 180) + (latestNotice.body.length > 180 ? "..." : "")
      : tr("description");

    return (
      <TouchableOpacity
        onPress={() => navigation.push("noticeBoardScreen")}
        style={{
          overflow: "hidden",
          borderRadius: 16,
          marginBottom: Default.fixPadding * 2,
          elevation: 8,
          shadowColor: Colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
        }}
      >
        <LinearGradient
          colors={isRtl ? ['#c92c24', '#008DB9', '#1E4799'] : ['#1E4799', '#008DB9', '#c92c24']}
          start={[0, 0]}
          end={[1, 1]}
          locations={[0, 0.4, 1]}
          style={{
            minHeight: 120,
            position: 'relative',
          }}
        >
          {/* Main content container - full width */}
          <View style={{ flexDirection: isRtl ? "row-reverse" : "row", flex: 1 }}>
            <View style={{ width: 6, backgroundColor: Colors.primary }} />
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: isRtl ? "flex-end" : "flex-start",
                paddingTop: Default.fixPadding * 1.8,
                paddingBottom: Default.fixPadding * 2.7,
                paddingHorizontal: Default.fixPadding * 0.9,
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  ...Fonts.SemiBold14white,
                  overflow: "hidden",
                  textShadowColor: 'rgba(0, 0, 0, 0.3)',
                  textShadowOffset: {width: 0, height: 1},
                  textShadowRadius: 2,
                  fontSize: 16,
                  fontWeight: '600',
                  width: '100%',
                }}
              >
                {tr("notice")}
              </Text>
              <View
                style={{
                  width: 53,
                  borderBottomWidth: 1.5,
                  borderBottomColor: 'rgba(255, 255, 255, 0.8)',
                  marginBottom: Default.fixPadding,
                  marginTop: Default.fixPadding * 0.3,
                }}
              />
              <View style={{ width: '100%' }}>
                <Text
                  numberOfLines={3}
                  style={{
                    ...Fonts.Medium14extraLightGrey,
                    textAlign: isRtl ? "right" : "left",
                    color: 'rgba(255, 255, 255, 0.95)',
                    textShadowColor: 'rgba(0, 0, 0, 0.2)',
                    textShadowOffset: {width: 0, height: 1},
                    textShadowRadius: 1,
                    lineHeight: 22,
                    fontSize: 13,
                    fontWeight: '400',
                  }}
                >
                  {noticePreview}
                  {latestNotice?.body && latestNotice.body.length > 180 && (
                    <Text
                      style={{
                        ...Fonts.Medium13white,
                        textDecorationLine: 'underline',
                        opacity: 0.9,
                        fontWeight: '500',
                      }}
                    >
                      {' '}read more...
                    </Text>
                  )}
                </Text>
              </View>
            </View>
          </View>

          {/* NEW badge overlay - top right */}
          {isNewNotice && (
            <View
              style={{
                position: "absolute",
                top: Default.fixPadding,
                right: isRtl ? undefined : Default.fixPadding,
                left: isRtl ? Default.fixPadding : undefined,
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: Default.fixPadding * 0.8,
                paddingVertical: Default.fixPadding * 0.4,
                borderRadius: 12,
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.3)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
                zIndex: 2,
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  ...Fonts.SemiBold12white,
                  overflow: "hidden",
                  paddingHorizontal: Default.fixPadding * 0.2,
                }}
              >
                {tr("new")}
              </Text>
            </View>
          )}

          {/* Family image overlay - bottom right */}
          <Image
            source={require("../assets/images/group.png")}
            style={{
              position: "absolute",
              bottom: 0,
              right: isRtl ? undefined : 0,
              left: isRtl ? 0 : undefined,
              resizeMode: "contain",
              width: ms(140),
              height: ms(65),
              opacity: 0.15,
              zIndex: 1,
            }}
          />
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const JoinCommunityCard = () => {
    // Determine content based on user state
    const getCardContent = () => {
      if (hasPendingRequest) {
        // Phase 2: User has pending request
        const requestInfo = pendingRequest?.is_manual_entry 
          ? pendingRequest.community_name
          : pendingRequest?.community?.[0]?.name || 'Community';
        
        return {
          title: "Request Submitted",
          description: `Your request to join ${requestInfo} has been submitted and is currently under review. You will receive a notification once the admin approves your request.`,
          buttonText: "Request Pending",
          buttonDisabled: true,
          onPress: null
        };
      } else {
        // Phase 1: New user
        return {
          title: "Request To Join A Community",
          description: "Is your community powered by Casa Nirvana? Request to join your community to begin enjoying the simplified living experience.",
          buttonText: "Join Now",
          buttonDisabled: false,
          onPress: () => navigation.push("joinCommunityScreen")
        };
      }
    };

    const content = getCardContent();

    return (
      <View
        style={{
          backgroundColor: Colors.white,
          borderRadius: 16,
          padding: Default.fixPadding * 2,
          marginHorizontal: Default.fixPadding * 2,
          marginBottom: Default.fixPadding * 2,
          ...Default.shadow,
        }}
      >
        <Text
          style={{
            ...Fonts.SemiBold18black,
            marginBottom: Default.fixPadding * 1.5,
            textAlign: isRtl ? "right" : "left",
          }}
        >
          {content.title}
        </Text>
        
        <Text
          style={{
            ...Fonts.Medium14grey,
            lineHeight: 22,
            marginBottom: Default.fixPadding * 2,
            textAlign: isRtl ? "right" : "left",
          }}
        >
          {content.description}
        </Text>

        <TouchableOpacity
          onPress={content.onPress}
          disabled={content.buttonDisabled}
          style={{
            backgroundColor: content.buttonDisabled ? Colors.grey : Colors.primary,
            borderRadius: 12,
            paddingVertical: Default.fixPadding * 1.2,
            marginBottom: Default.fixPadding * 1.5,
            ...Default.shadow,
            opacity: content.buttonDisabled ? 0.6 : 1,
          }}
        >
          <Text
            style={{
              ...Fonts.SemiBold16white,
              textAlign: "center",
            }}
          >
            {content.buttonText}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            // TODO: Navigate to setup community flow
            console.log("Set Up a Community pressed");
          }}
          style={{
            alignItems: "center",
          }}
        >
          <Text
            style={{
              ...Fonts.SemiBold14primary,
              textDecorationLine: "underline",
            }}
          >
            Set Up a Community
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.regularGrey }}>
      <MyStatusBar />
      <View
        style={{
          flexDirection: isRtl ? "row-reverse" : "row",
          alignItems: "center",
          paddingHorizontal: Default.fixPadding * 2,
          paddingVertical: Default.fixPadding * 1.2,
          backgroundColor: Colors.white,
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
              width: 50,
              height: 50,
              borderRadius: 25,
              ...Default.shadow,
            }}
          >
            <Image
              source={require("../assets/images/pic1.png")}
              style={{
                resizeMode: "cover",
                width: 50,
                height: 50,
                borderRadius: 25,
                borderWidth: 2,
                borderColor: Colors.white,
              }}
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
              style={{ ...Fonts.SemiBold18primary, overflow: "hidden" }}
            >{`${tr("hi")} ${userName}`}</Text>
            <TouchableOpacity 
              onPress={() => {
                if (!hasJoinedCommunity && !hasPendingRequest) {
                  navigation.push("joinCommunityScreen");
                }
              }}
              disabled={hasJoinedCommunity || hasPendingRequest}
            >
              <Text
                style={{
                  ...Fonts.Medium14grey,
                  marginTop: Default.fixPadding * 0.5,
                }}
              >{unitDisplay}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => navigation.push("notificationScreen")}
          style={{
            alignItems: isRtl ? "flex-start" : "flex-end",
            position: 'relative',
          }}
        >
          <Image
            source={require("../assets/images/notification.png")}
            style={{ width: 24, height: 24, resizeMode: "contain" }}
          />
          {unreadCount > 0 && (
            <View
              style={{
                position: 'absolute',
                top: -5,
                right: isRtl ? undefined : -5,
                left: isRtl ? -5 : undefined,
                backgroundColor: Colors.primary,
                borderRadius: 10,
                minWidth: 20,
                height: 20,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 4,
              }}
            >
              <Text
                style={{
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: 'bold',
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      {hasJoinedCommunity ? (
        <FlatList
          numColumns={2}
          data={communityList}
          renderItem={renderItem}
          keyExtractor={(item) => item.key}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: Default.fixPadding * 2 }}
          ListHeaderComponent={() => (
            <View
              style={{
                paddingTop: Default.fixPadding * 0.8,
                paddingHorizontal: Default.fixPadding * 2,
                marginBottom: Default.fixPadding * 2,
                backgroundColor: Colors.white,
              }}
            >
              <NoticeBanner />
              <Text
                numberOfLines={1}
                style={{
                  ...Fonts.SemiBold16primary,
                  overflow: "hidden",
                  textAlign: isRtl ? "right" : "left",
                  marginBottom: Default.fixPadding * 2,
                }}
              >
                {tr("community")}
              </Text>
            </View>
          )}
        />
      ) : (
        <View style={{ flex: 1 }}>
          <View
            style={{
              paddingTop: Default.fixPadding * 0.8,
              paddingHorizontal: Default.fixPadding * 2,
              marginBottom: Default.fixPadding * 2,
              backgroundColor: Colors.white,
            }}
          >
            <NoticeBanner />
            <Text
              numberOfLines={1}
              style={{
                ...Fonts.SemiBold16primary,
                overflow: "hidden",
                textAlign: isRtl ? "right" : "left",
                marginBottom: Default.fixPadding * 2,
              }}
            >
              {tr("community")}
            </Text>
          </View>
          <JoinCommunityCard />
        </View>
      )}
    </View>
  );
};

export default HomeScreen;
