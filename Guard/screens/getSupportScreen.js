import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  ScrollView,
  Image,
  StyleSheet,
  TextInput,
} from "react-native";
import MyStatusBar from "../components/myStatusBar";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { ms } from "react-native-size-matters/extend";
import AwesomeButton from "react-native-really-awesome-button";

const GetSupportScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`getSupportScreen:${key}`);
  }
  const backAction = () => {
    navigation.pop();
    return true;
  };
  useEffect(() => {
    const backSub = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backSub.remove();
  }, []);

  const [issueType, setIssueType] = useState();
  const [message, setMessage] = useState();

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
          {tr("getSupport")}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets={true}
      >
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: Default.fixPadding * 0.8,
            marginBottom: Default.fixPadding * 5,
            marginHorizontal: Default.fixPadding * 2,
          }}
        >
          <Image
            source={require("../assets/images/customerCare.png")}
            style={{ width: ms(120), height: ms(120), resizeMode: "contain" }}
          />
          <Text
            style={{
              ...Fonts.SemiBold18black,
              marginTop: Default.fixPadding * 1.5,
            }}
          >
            {tr("getSupport")}
          </Text>
          <Text
            style={{
              ...Fonts.Medium16grey,
              textAlign: "center",
              marginTop: Default.fixPadding,
            }}
          >
            {tr("askSuggestImprove")}
          </Text>
        </View>

        <View style={{ marginHorizontal: Default.fixPadding * 2 }}>
          <Text
            style={{
              ...Fonts.Medium16black,
              textAlign: isRtl ? "right" : "left",
            }}
          >
            {tr("issueType")}
          </Text>

          <View style={styles.textInputView}>
            <TextInput
              value={issueType}
              onChangeText={setIssueType}
              placeholder={tr("enterTopic")}
              placeholderTextColor={Colors.grey}
              selectionColor={Colors.primary}
              style={{
                ...Fonts.Medium14black,
                textAlign: isRtl ? "right" : "left",
              }}
            />
          </View>

          <Text
            style={{
              ...Fonts.Medium16black,
              textAlign: isRtl ? "right" : "left",
            }}
          >
            {tr("message")}
          </Text>
          <View style={styles.textInputView}>
            <TextInput
              multiline={true}
              value={message}
              onChangeText={setMessage}
              numberOfLines={7}
              textAlignVertical="top"
              placeholder={tr("enterYourMessage")}
              placeholderTextColor={Colors.grey}
              selectionColor={Colors.primary}
              style={{
                ...Fonts.Medium14black,
                textAlign: isRtl ? "right" : "left",
                height: ms(160),
              }}
            />
          </View>
        </View>
      </ScrollView>

      <View
        style={{
          margin: Default.fixPadding * 2,
        }}
      >
        <AwesomeButton
          progress
          height={50}
          progressLoadingTime={1000}
          onPress={(next) => {
            setTimeout(() => {
              next();
              navigation.pop();
            }, 1000);
          }}
          raiseLevel={1}
          stretch={true}
          borderRadius={10}
          backgroundShadow={Colors.primary}
          backgroundDarker={Colors.primary}
          backgroundColor={Colors.primary}
        >
          <Text style={{ ...Fonts.SemiBold18white }}>
            {tr("submitMessage")}
          </Text>
        </AwesomeButton>
      </View>
    </View>
  );
};

export default GetSupportScreen;

const styles = StyleSheet.create({
  textInputView: {
    paddingHorizontal: Default.fixPadding * 1.4,
    paddingVertical: Default.fixPadding * 1.2,
    marginTop: Default.fixPadding * 0.5,
    marginBottom: Default.fixPadding * 2,
    borderRadius: 10,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
});
