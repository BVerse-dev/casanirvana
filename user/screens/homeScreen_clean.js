import React from "react";
import { Text, View, TouchableOpacity, Image, FlatList } from "react-native";
import MyStatusBar from "../components/myStatusBar";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import { ms } from "react-native-size-matters/extend";
import { LinearGradient } from "expo-linear-gradient";

const HomeScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`homeScreen:${key}`);
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
      other: tr("communityAnnouncement"),
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
            source={item.image}
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

  const NoticeBanner = () => (
    <TouchableOpacity
      onPress={() => navigation.push("guardCallingScreen")}
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
        colors={isRtl ? ['#667eea', '#764ba2', '#f093fb'] : ['#4facfe', '#00f2fe', '#667eea']}
        start={[0, 0]}
        end={[1, 1]}
        locations={[0, 0.5, 1]}
        style={{
          flexDirection: isRtl ? "row-reverse" : "row",
          minHeight: 120,
        }}
      >
        <View style={{ flex: 1, flexDirection: isRtl ? "row-reverse" : "row" }}>
          <View style={{ width: 6, backgroundColor: Colors.primary }} />
          <View
            style={{
              justifyContent: "center",
              alignItems: isRtl ? "flex-end" : "flex-start",
              paddingTop: Default.fixPadding * 1.8,
              paddingBottom: Default.fixPadding * 2.7,
              marginHorizontal: Default.fixPadding * 0.9,
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
            <Text
              numberOfLines={3}
              style={{
                ...Fonts.Medium14extraLightGrey,
                overflow: "hidden",
                textAlign: isRtl ? "right" : "left",
                color: 'rgba(255, 255, 255, 0.95)',
                textShadowColor: 'rgba(0, 0, 0, 0.2)',
                textShadowOffset: {width: 0, height: 1},
                textShadowRadius: 1,
                lineHeight: 20,
              }}
            >
              {tr("description")}
            </Text>
          </View>
        </View>
        <View
          style={{
            flex: 1,
            justifyContent: "space-between",
            alignItems: isRtl ? "flex-start" : "flex-end",
          }}
        >
          <View
            style={{
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
          <Image
            source={require("../assets/images/group.png")}
            style={{
              resizeMode: "contain",
              width: ms(172),
              height: ms(79),
            }}
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

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
            >{`${tr("hi")} Jacob Jones`}</Text>
            <Text
              style={{
                ...Fonts.Medium14grey,
                marginTop: Default.fixPadding * 0.5,
              }}
            >{`A-420 | Casa Nirvana`}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => navigation.push("notificationScreen")}
          style={{
            alignItems: isRtl ? "flex-start" : "flex-end",
          }}
        >
          <Image
            source={require("../assets/images/notification.png")}
            style={{ width: 24, height: 24, resizeMode: "contain" }}
          />
        </TouchableOpacity>
      </View>
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
    </View>
  );
};

export default HomeScreen;
