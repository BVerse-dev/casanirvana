import React from "react";
import { Text, View, Image, TouchableOpacity, FlatList } from "react-native";
import MyStatusBar from "../components/myStatusBar";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import { ms } from "react-native-size-matters/extend";

const MessageScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`messageScreen:${key}`);
  }

  const messageList = [
    {
      key: "1",
      image: require("../assets/images/image1.png"),
      name: "Cody Fisher (A-202)",
      message: "Keep street dog away from..",
      time: "2.00am",
    },
    {
      key: "2",
      image: require("../assets/images/image2.png"),
      name: "Kofi Addo (B-101)",
      message: "Keep kids away from cars...",
      time: "2.00am",
    },
    {
      key: "3",
      image: require("../assets/images/image3.png"),
      name: "Devon Lane (A-402)",
      message: "Keep street dog away from..",
      time: "2.00am",
    },
    {
      key: "4",
      image: require("../assets/images/image4.png"),
      name: "Akua Bennett (C-302)",
      message: "Keep street dog away from..",
      time: "2.00am",
    },
    {
      key: "5",
      image: require("../assets/images/image5.png"),
      name: "Marvin McKinney (A-105)",
      message: "Keep kids away from cars...",
      time: "2.00am",
    },
    {
      key: "6",
      image: require("../assets/images/image6.png"),
      name: "Jerome Bell (B-202)",
      message: "Keep kids away from cars...",
      time: "2.00am",
    },
    {
      key: "7",
      image: require("../assets/images/image7.png"),
      name: "Robert Fox (A-601)",
      message: "Keep street dog away from..",
      time: "2.00am",
    },
    {
      key: "8",
      image: require("../assets/images/image8.png"),
      name: "Annette Black(A-105)",
      message: "Keep kids away from cars...",
      time: "2.00am",
    },
    {
      key: "9",
      image: require("../assets/images/image9.png"),
      name: "Jerome Bell (B-505)",
      message: "Keep street dog away from..",
      time: "2.00am",
    },
    {
      key: "10",
      image: require("../assets/images/image10.png"),
      name: "Guy Hawkins (A-602)",
      message: "Keep kids away from cars...",
      time: "2.00am",
    },
    {
      key: "11",
      image: require("../assets/images/image11.png"),
      name: "Annette Black (B-104)",
      message: "Keep kids away from cars...",
      time: "2.00am",
    },
    {
      key: "12",
      image: require("../assets/images/image12.png"),
      name: "Darrell Steward (A-506)",
      message: "Keep kids away from cars...",
      time: "2.00am",
    },
  ];

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() =>
          navigation.push("chatScreen", {
            image: item.image,
            name: item.name,
            key: "1",
          })
        }
        style={{
          flex: 1,
          flexDirection: isRtl ? "row-reverse" : "row",
          marginBottom: Default.fixPadding * 2,
          marginHorizontal: Default.fixPadding * 2,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: isRtl ? "row-reverse" : "row",
            alignItems: "center",
          }}
        >
          <Image
            source={item.image}
            style={{
              resizeMode: "contain",
              width: 50,
              height: 50,
              borderRadius: 25,
            }}
          />

          <View
            style={{
              flex: 1,
              alignItems: isRtl ? "flex-end" : "flex-start",
              marginHorizontal: Default.fixPadding * 1.5,
            }}
          >
            <Text
              numberOfLines={1}
              style={{ ...Fonts.Medium16primary, overflow: "hidden" }}
            >
              {item.name}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                ...Fonts.Medium14grey,
                overflow: "hidden",
                marginTop: Default.fixPadding * 0.5,
              }}
            >
              {item.message}
            </Text>
          </View>
        </View>

        <View style={{ alignItems: isRtl ? "flex-start" : "flex-end" }}>
          <Text
            numberOfLines={1}
            style={{
              ...Fonts.Medium14grey,
              overflow: "hidden",
              width: ms(80),
              textAlign: isRtl ? "left" : "right",
            }}
          >
            {item.time}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <MyStatusBar />
      <View
        style={{
          marginHorizontal: Default.fixPadding * 2,
          marginVertical: Default.fixPadding * 1.2,
        }}
      >
        <Text
          style={{
            ...Fonts.SemiBold18black,
            textAlign: isRtl ? "right" : "left",
          }}
        >
          {tr("message")}
        </Text>
      </View>

      <FlatList
        data={messageList}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: Default.fixPadding * 0.8 }}
      />
    </View>
  );
};

export default MessageScreen;
