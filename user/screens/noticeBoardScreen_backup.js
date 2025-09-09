import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  FlatList,
} from "react-native";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MyStatusBar from "../components/myStatusBar";
import DashedLine from "react-native-dashed-line";
import { LinearGradient } from "expo-linear-gradient";

const NoticeBoardScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`noticeBoardScreen:${key}`);
  }
  const backAction = () => {
    navigation.pop();
    return true;
  };
  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => {
      const subscription = BackHandler.addEventListener("hardwareBackPress", backAction); return () => subscription?.remove(); }
  }, []);

  const noticeList = [
    {
      key: "1",
      title: "Announcement",
      notice:
        "Increasing maintenance to $20 from  next month due to security increments",
      dateTime: "19 AUG 05 : 300 PM",
      postBy: "Admin",
      new: true,
    },
    {
      key: "2",
      title: "New Year celebration",
      notice: "New year gathering in Seven gen society's hall on 3rd november ",
      dateTime: "20 AUG 05 : 30 PM",
      postBy: "Admin",
      new: true,
    },
    {
      key: "3",
      title: "Christmas party",
      notice:
        "It is hereby notified that Christmas will be celebrated on 23rd December, 2018 at our Society auditorium. ",
      dateTime: "22 Dec 08 : 30 PM",
      postBy: "Admin",
    },
    {
      key: "4",
      title: "New Year celebration",
      notice: "New year gathering in Seven gen society's hall on 3rd november ",
      dateTime: "20 AUG 05 : 30 PM",
      postBy: "Admin",
    },
  ];

  const renderItem = ({ item }) => {
    return (
      <View
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
          </View>          <Text
            style={{
              ...Fonts.Medium14grey,
              textAlign: isRtl ? "right" : "left",
              marginTop: Default.fixPadding * 0.6,
              paddingBottom: Default.fixPadding,
              paddingHorizontal: Default.fixPadding * 1.4,
            }}
          >
            {item.notice}
          </Text>          <DashedLine
            dashGap={2.5}
            dashLength={2.5}
            dashThickness={1.5}
            dashColor={Colors.grey}
          />
          <LinearGradient
            colors={isRtl ? ['#c92c24', '#008DB9', '#1E4799'] : ['#1E4799', '#008DB9', '#c92c24']}
            start={[0, 0]}
            end={[1, 1]}
            locations={[0, 0.3, 1]}
            style={{
              borderBottomLeftRadius: isRtl ? 0 : 10,
              borderBottomRightRadius: isRtl ? 10 : 0,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: Default.fixPadding,
                backgroundColor: 'transparent',
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  ...Fonts.Medium14black,
                  flex: 1,
                  overflow: "hidden",
                  textAlign: isRtl ? "right" : "left",
                  color: 'rgba(255, 255, 255, 0.95)',
                  fontWeight: '600',
                  textShadowColor: 'rgba(0, 0, 0, 0.3)',
                  textShadowOffset: {width: 0, height: 1},
                  textShadowRadius: 2,
                }}
              >
                {`${tr("postBy")} :${item.postBy}`}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  ...Fonts.Medium14grey,
                  flex: 1,
                  overflow: "hidden",
                  textAlign: isRtl ? "left" : "right",
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontWeight: '500',
                  textShadowColor: 'rgba(0, 0, 0, 0.25)',
                  textShadowOffset: {width: 0, height: 1},
                  textShadowRadius: 1,
                }}
              >
                {item.dateTime}
              </Text>
            </View>
          </LinearGradient>
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

      <FlatList
        data={noticeList}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: Default.fixPadding * 0.8 }}
      />
    </View>
  );
};

export default NoticeBoardScreen;
