import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  StyleSheet,
  Image,
  Dimensions,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import MyStatusBar from "../components/myStatusBar";
import Ionicons from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";
import Octicons from "react-native-vector-icons/Octicons";
import moment from "moment";

const { width } = Dimensions.get("window");

const ChatScreen = ({ navigation, route }) => {
  const { image, name, key } = route.params;

  const { t, i18n } = useTranslation();

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`chatScreen:${key}`);
  }
  const backAction = () => {
    if (key === "2") {
      navigation.navigate("settingScreen");
    } else {
      navigation.pop();
    }
    return true;
  };
  useEffect(() => {
    const backSub = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backSub.remove();
  }, []);

  const [message, setMessage] = useState();

  const [chatData, setChatData] = useState([
    {
      key: 4,
      txtMsg: "Okay sir, i will try",
      msgTime: "1.30 pm",
      isMe: true,
    },
    {
      key: 3,
      txtMsg: "Keep street dog away from the gate.",
      msgTime: "1.30 pm",
      isMe: false,
    },
    {
      key: 2,
      txtMsg: "Hello",
      msgTime: "1.30 pm",
      isMe: true,
    },
    {
      key: 1,
      txtMsg: "Hello guard",
      msgTime: "1.30 pm",
      isMe: false,
    },
  ]);

  const handleMsgSend = () => {
    const currentTime = new Date().toLocaleTimeString();
    const convertedTime = moment(currentTime, "HH:mm:ss").format("hh:mm A");

    let temp = {
      txtMsg: message,
      msgTime: convertedTime,
      isMe: true,
    };

    setChatData((old) => [temp, ...old]);
    setMessage("");
  };

  const renderItem = ({ item, index }) => {
    return (
      <View style={{ marginHorizontal: Default.fixPadding * 2 }}>
        {item.isMe ? (
          <View
            key={index}
            style={{
              alignItems: isRtl ? "flex-start" : "flex-end",
              marginBottom: Default.fixPadding * 2,
            }}
          >
            <View
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
              }}
            >
              <View>
                <View
                  style={{
                    borderBottomLeftRadius: isRtl ? 0 : 10,
                    borderBottomRightRadius: isRtl ? 10 : 0,
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                    padding: Default.fixPadding,
                    backgroundColor: Colors.primary,
                    ...Default.shadow,
                    maxWidth: width * 0.5,
                  }}
                >
                  <Text
                    style={{
                      flex: 1,
                      ...Fonts.SemiBold14white,
                    }}
                  >
                    {item.txtMsg}
                  </Text>
                </View>

                <Text
                  style={{
                    ...Fonts.SemiBold12grey,
                    textAlign: isRtl ? "left" : "right",
                    marginTop: Default.fixPadding * 0.3,
                  }}
                >
                  {item.msgTime}
                </Text>
              </View>
              <Image
                source={require("../assets/images/guard.png")}
                style={{
                  marginLeft: isRtl ? 0 : Default.fixPadding * 0.5,
                  marginRight: isRtl ? Default.fixPadding * 0.5 : 0,
                  ...styles.messageCircleImgStyle,
                }}
              />
            </View>
          </View>
        ) : (
          <View
            key={index}
            style={{
              marginBottom: Default.fixPadding * 3,
              marginTop: Default.fixPadding * 2,
            }}
          >
            <View
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
              }}
            >
              <Image
                source={image}
                style={{
                  marginRight: isRtl ? 0 : Default.fixPadding * 0.5,
                  marginLeft: isRtl ? Default.fixPadding * 0.5 : 0,
                  ...styles.messageCircleImgStyle,
                }}
              />

              <View>
                <View
                  style={{
                    borderBottomRightRadius: isRtl ? 0 : 10,
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                    borderBottomLeftRadius: isRtl ? 10 : 0,
                    maxWidth: width * 0.5,
                    padding: Default.fixPadding,
                    backgroundColor: "rgba(14, 52, 76, 0.1)",
                  }}
                >
                  <Text style={{ ...Fonts.SemiBold14primary }}>
                    {item.txtMsg}
                  </Text>
                </View>

                <Text
                  style={{
                    textAlign: isRtl ? "right" : "left",
                    ...Fonts.SemiBold12grey,
                    marginTop: Default.fixPadding * 0.3,
                  }}
                >
                  {item.msgTime}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  const chatContainer = () => {
    return (
      <FlatList
        inverted
        data={chatData}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: Default.fixPadding }}
      />
    );
  };

  const bottomTextInputAndSend = () => {
    return (
      <View
        style={{
          flexDirection: isRtl ? "row-reverse" : "row",
          ...styles.bottomMainViewStyle,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: isRtl ? "row-reverse" : "row",
            alignItems: "center",
            marginRight: isRtl ? 0 : Default.fixPadding * 1.5,
            marginLeft: isRtl ? Default.fixPadding * 1.5 : 0,
          }}
        >
          <Octicons name="smiley" size={20} color={Colors.primary} />
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder={tr("typeHere")}
            placeholderTextColor={Colors.primary}
            selectionColor={Colors.primary}
            style={{
              flex: 1,
              ...Fonts.Regular14primary,
              textAlign: isRtl ? "right" : "left",
              marginHorizontal: Default.fixPadding,
            }}
          />
          <Feather name="paperclip" size={20} color={Colors.primary} />
          <Feather
            name="mic"
            size={20}
            color={Colors.primary}
            style={{
              marginLeft: isRtl ? 0 : Default.fixPadding,
              marginRight: isRtl ? Default.fixPadding : 0,
            }}
          />
        </View>
        <TouchableOpacity
          disabled={!message}
          onPress={handleMsgSend}
          style={styles.sendTouchableStyle}
        >
          <Ionicons name="send" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <MyStatusBar />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "height" : null}
        style={{ flex: 1 }}
      >
        <View
          style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            alignItems: "center",
            paddingHorizontal: Default.fixPadding * 2,
            paddingVertical: Default.fixPadding * 1.2,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              if (key === "2") {
                navigation.navigate("settingScreen");
              } else {
                navigation.pop();
              }
            }}
          >
            <Ionicons
              name={isRtl ? "arrow-forward-outline" : "arrow-back-outline"}
              size={25}
              color={Colors.black}
            />
          </TouchableOpacity>

          <View
            style={{
              flex: 1,
              flexDirection: isRtl ? "row-reverse" : "row",
              alignItems: "center",
            }}
          >
            <Image
              source={image}
              style={{
                resizeMode: "cover",
                width: 42,
                height: 42,
                borderRadius: 21,
                marginLeft: isRtl ? 0 : Default.fixPadding * 1.7,
                marginRight: isRtl ? Default.fixPadding * 1.7 : 0,
              }}
            />

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
                  marginBottom: Default.fixPadding * 0.3,
                }}
              >
                {name}
              </Text>
              <Text
                numberOfLines={1}
                style={{ ...Fonts.SemiBold14grey, overflow: "hidden" }}
              >{`${tr("block")} A - 302`}</Text>
            </View>
          </View>
        </View>

        {chatContainer()}
        {bottomTextInputAndSend()}
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  sendTouchableStyle: {
    justifyContent: "center",
    alignItems: "center",
    width: 37,
    height: 37,
    borderRadius: 18.5,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },

  bottomMainViewStyle: {
    alignItems: "center",
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 1.2,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  messageCircleImgStyle: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    alignSelf: "flex-end",
  },
});
