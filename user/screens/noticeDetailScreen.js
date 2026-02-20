import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  ScrollView,
  Image,
  Dimensions,
  Share,
  Alert,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MyStatusBar from "../components/myStatusBar";
import { LinearGradient } from "expo-linear-gradient";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import CommentSection from "../components/CommentSection";
import { useUserProfile } from "../hooks/useCommunityData";
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get("window");

const NoticeDetailScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const { notice } = route.params;
  const { data: userProfile } = useUserProfile();
  const [isSaved, setIsSaved] = useState(false);

  const isRtl = i18n.dir() === "rtl";

  function tr(key) {
    return t(`noticeBoardScreen:${key}`);
  }

  // Check if notice is already saved
  useEffect(() => {
    const checkSavedStatus = async () => {
      try {
        const savedNotices = await AsyncStorage.getItem('savedNotices');
        if (savedNotices) {
          const parsed = JSON.parse(savedNotices);
          setIsSaved(parsed.includes(notice.id));
        }
      } catch (error) {
        console.error('Error checking saved status:', error);
      }
    };
    checkSavedStatus();
  }, [notice.id]);

  const handleShare = async () => {
    try {
      const shareContent = {
        message: `${notice.title}\n\n${notice.fullNotice || notice.notice}\n\nPosted by: ${notice.postBy}\nDate: ${notice.dateTime}`,
        title: notice.title,
      };

      const result = await Share.share(shareContent);
      
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Shared with activity type of result.activityType
          Alert.alert('Success', 'Notice shared successfully!');
        } else {
          // Shared
          Alert.alert('Success', 'Notice shared successfully!');
        }
      } else if (result.action === Share.dismissedAction) {
        // Dismissed
      }
    } catch (_error) {
      Alert.alert('Error', 'Failed to share notice. Please try again.');
    }
  };

  const handleSave = async () => {
    try {
      const savedNotices = await AsyncStorage.getItem('savedNotices');
      let savedArray = savedNotices ? JSON.parse(savedNotices) : [];

      if (isSaved) {
        // Remove from saved
        savedArray = savedArray.filter(id => id !== notice.id);
        setIsSaved(false);
        Alert.alert('Success', 'Notice removed from saved notices!');
      } else {
        // Add to saved
        savedArray.push(notice.id);
        setIsSaved(true);
        Alert.alert('Success', 'Notice saved successfully!');
      }

      await AsyncStorage.setItem('savedNotices', JSON.stringify(savedArray));
    } catch (_error) {
      Alert.alert('Error', 'Failed to save notice. Please try again.');
    }
  };

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      navigation.pop();
      return true;
    });
    return () => {
      subscription?.remove();
    };
  }, [navigation]);

  useEffect(() => {
    if (!notice?.community_id || !userProfile?.community_id) {
      return;
    }

    if (String(notice.community_id) !== String(userProfile.community_id)) {
      Alert.alert("Access restricted", "This notice is not available for your community.", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    }
  }, [notice?.community_id, userProfile?.community_id, navigation]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.regularGrey }}>
      <MyStatusBar />
      
      {/* Header Image with Gradient Overlay */}
      <View style={{ position: "relative" }}>
        <Image
          source={
            notice.image_url 
              ? { uri: notice.image_url } 
              : require("../assets/images/community3.png")
          }
          style={{
            width: width,
            height: height * 0.3,
            resizeMode: "cover",
          }}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
        
        {/* Header Navigation */}
        <View
          style={{
            position: "absolute",
            top: Default.fixPadding * 2,
            left: 0,
            right: 0,
            flexDirection: isRtl ? "row-reverse" : "row",
            alignItems: "center",
            paddingHorizontal: Default.fixPadding * 2,
            paddingVertical: Default.fixPadding * 1.2,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.pop()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: 'rgba(255,255,255,0.16)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 2,
            }}
          >
            <Ionicons
              name={isRtl ? "arrow-forward-outline" : "arrow-back-outline"}
              size={25}
              color={Colors.white}
            />
          </TouchableOpacity>
          <Text
            style={{
              ...Fonts.SemiBold18white,
              marginHorizontal: Default.fixPadding,
              flex: 1,
              letterSpacing: 0.2,
              textShadowColor: 'rgba(0, 0, 0, 0.3)',
              textShadowOffset: {width: 0, height: 1},
              textShadowRadius: 2,
            }}
          >
            {tr("noticeDetails")}
          </Text>
          
          {/* NEW Badge if applicable - moved inside header navigation */}
          {notice.new && (
            <View
              style={{
                backgroundColor: Colors.primary,
                paddingHorizontal: Default.fixPadding * 0.8,
                paddingVertical: Default.fixPadding * 0.4,
                borderRadius: 12,
                elevation: 4,
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
              }}
            >
              <Text
                style={{
                  ...Fonts.SemiBold12white,
                  letterSpacing: 0.5,
                }}
              >
                {tr("new")}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: Default.fixPadding * 3 }}
      >
        {/* Title Card */}
        <View
          style={{
            marginTop: Default.fixPadding * 2,
            marginHorizontal: Default.fixPadding * 2,
            borderRadius: 16,
            backgroundColor: Colors.white,
            ...Default.shadow,
            elevation: 8,
          }}
        >
          <View style={{ padding: Default.fixPadding * 2 }}>
            <Text
              style={{
                ...Fonts.SemiBold22black,
                textAlign: isRtl ? "right" : "left",
                lineHeight: 30,
                letterSpacing: 0.3,
              }}
            >
              {notice.title}
            </Text>
            
            {/* Posted by and Date Info */}
            <View
              style={{
                marginTop: Default.fixPadding * 1.5,
                paddingTop: Default.fixPadding,
                borderTopWidth: 1,
                borderTopColor: Colors.lightGrey,
              }}
            >
              {/* Posted by line */}
              <View
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  alignItems: "center",
                  marginBottom: Default.fixPadding * 0.8,
                }}
              >
                <MaterialCommunityIcons
                  name="account-circle"
                  size={20}
                  color={Colors.primary}
                />
                <Text
                  style={{
                    ...Fonts.Medium14grey,
                    marginHorizontal: Default.fixPadding * 0.5,
                    flex: 1,
                  }}
                >
                  {`Posted by: ${notice.postBy}`}
                </Text>
              </View>
              
              {/* Date and time line */}
              <View
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={18}
                  color={Colors.grey}
                />
                <Text
                  style={{
                    ...Fonts.Medium14grey,
                    marginLeft: Default.fixPadding * 0.3,
                  }}
                >
                  {notice.dateTime}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Notice Content */}
        <View
          style={{
            marginTop: Default.fixPadding * 2,
            marginHorizontal: Default.fixPadding * 2,
            borderRadius: 16,
            backgroundColor: Colors.white,
            ...Default.shadow,
            elevation: 4,
          }}
        >
          <LinearGradient
            colors={['#f8f9fa', '#ffffff']}
            style={{
              borderRadius: 16,
              padding: Default.fixPadding * 2,
            }}
          >
            <View
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                alignItems: "center",
                marginBottom: Default.fixPadding * 1.5,
              }}
            >
              <MaterialCommunityIcons
                name="text-box"
                size={24}
                color={Colors.primary}
              />
              <Text
                style={{
                  ...Fonts.SemiBold18black,
                  marginHorizontal: Default.fixPadding,
                  letterSpacing: 0.2,
                }}
              >
                Notice Content
              </Text>
            </View>
            
            <Text
              style={{
                ...Fonts.Medium16black,
                lineHeight: 24,
                textAlign: isRtl ? "right" : "left",
                color: Colors.black,
                fontSize: 15,
                fontWeight: '400',
              }}
            >
              {notice.fullNotice || notice.notice}
            </Text>
          </LinearGradient>
        </View>

        {/* Action Buttons */}
        <View
          style={{
            marginTop: Default.fixPadding * 2,
            marginHorizontal: Default.fixPadding * 2,
          }}
        >
          <View
            style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              onPress={handleShare}
              style={{
                flex: 1,
                flexDirection: isRtl ? "row-reverse" : "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: Default.fixPadding * 1.2,
                marginRight: isRtl ? 0 : Default.fixPadding,
                marginLeft: isRtl ? Default.fixPadding : 0,
                borderRadius: 12,
                backgroundColor: Colors.white,
                borderWidth: 1,
                borderColor: Colors.primary,
                ...Default.shadow,
              }}
            >
              <MaterialCommunityIcons
                name="share-variant"
                size={20}
                color={Colors.primary}
              />
              <Text
                style={{
                  ...Fonts.SemiBold14primary,
                  marginHorizontal: Default.fixPadding * 0.5,
                }}
              >
                Share
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              style={{
                flex: 1,
                flexDirection: isRtl ? "row-reverse" : "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: Default.fixPadding * 1.2,
                marginLeft: isRtl ? 0 : Default.fixPadding,
                marginRight: isRtl ? Default.fixPadding : 0,
                borderRadius: 12,
                backgroundColor: Colors.primary,
                ...Default.shadow,
                elevation: 4,
              }}
            >
              <MaterialCommunityIcons
                name={isSaved ? "bookmark-check" : "bookmark-plus"}
                size={20}
                color={Colors.white}
              />
              <Text
                style={{
                  ...Fonts.SemiBold14white,
                  marginHorizontal: Default.fixPadding * 0.5,
                }}
              >
                {isSaved ? 'Saved' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Additional Info Card */}
        <View
          style={{
            marginTop: Default.fixPadding * 2,
            marginHorizontal: Default.fixPadding * 2,
            borderRadius: 16,
            backgroundColor: Colors.white,
            ...Default.shadow,
            elevation: 2,
          }}
        >
          <LinearGradient
            colors={isRtl ? ['#c92c24', '#008DB9', '#1E4799'] : ['#1E4799', '#008DB9', '#c92c24']}
            start={[0, 0]}
            end={[1, 1]}
            locations={[0, 0.5, 1]}
            style={{
              borderRadius: 16,
              padding: Default.fixPadding * 2,
            }}
          >
            <View
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                alignItems: "center",
              }}
            >
              <MaterialCommunityIcons
                name="information"
                size={24}
                color={Colors.white}
              />
              <Text
                style={{
                  ...Fonts.SemiBold16white,
                  marginHorizontal: Default.fixPadding,
                  flex: 1,
                  textShadowColor: 'rgba(0, 0, 0, 0.3)',
                  textShadowOffset: {width: 0, height: 1},
                  textShadowRadius: 2,
                }}
              >
                For any queries regarding this notice, please leave a comment below or contact management office.
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Comments Section */}
        <CommentSection noticeId={notice.id} userProfile={userProfile} />
      </ScrollView>
    </View>
  );
};

export default NoticeDetailScreen;
