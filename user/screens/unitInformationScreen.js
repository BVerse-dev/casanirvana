import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MyStatusBar from "../components/myStatusBar";

const UnitInformationScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`settingScreen:${key}`);
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.extraLightGrey }}>
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
        <Text
          style={{
            ...Fonts.SemiBold18black,
            marginHorizontal: Default.fixPadding,
          }}
        >
          {tr("unitInformation")}
        </Text>
      </View>
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingVertical: Default.fixPadding * 2,
        }}
      >
        <View style={styles.container}>
          <Text style={styles.title}>{tr("unitInformation")}</Text>
          <Text style={styles.description}>
            Unit information, maintenance schedules, and property details will be displayed here.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default UnitInformationScreen;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Default.fixPadding * 2,
    padding: Default.fixPadding * 2,
    backgroundColor: Colors.white,
    borderRadius: 10,
    ...Default.shadow,
  },
  title: {
    ...Fonts.SemiBold18primary,
    marginBottom: Default.fixPadding,
  },
  description: {
    ...Fonts.Medium14grey,
    lineHeight: 22,
  },
});
