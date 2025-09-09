import React from "react";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import { BottomSheet } from "react-native-btr";

const AddImageBottomSheet = (props) => {
  const { t, i18n } = useTranslation();

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`addImageBottomSheet:${key}`);
  }
  return (
    <BottomSheet
      visible={props.visible}
      onBackButtonPress={props.closeBottomSheet}
      onBackdropPress={props.closeBottomSheet}
    >
      <View style={styles.bottomSheetMain}>
        <Text
          style={{
            ...Fonts.SemiBold18black,
            textAlign: isRtl ? "right" : "left",
            marginBottom: Default.fixPadding * 2.5,
          }}
        >
          {tr("addImage")}
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={props.cameraHandler}
          style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            alignItems: "center",
            marginBottom: Default.fixPadding * 2,
          }}
        >
          <View style={styles.round}>
            <Ionicons name="camera" size={22} color={Colors.darkBlue} />
          </View>
          <Text
            numberOfLines={1}
            style={{
              ...Fonts.Medium16black,
              overflow: "hidden",
              marginHorizontal: Default.fixPadding * 1.5,
            }}
          >
            {tr("camera")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={props.galleryHandler}
          style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            alignItems: "center",
            marginBottom: Default.fixPadding * 2,
          }}
        >
          <View style={styles.round}>
            <Ionicons name="image" size={22} color={Colors.lightGreen} />
          </View>
          <Text
            numberOfLines={1}
            style={{
              ...Fonts.Medium16black,
              overflow: "hidden",
              marginHorizontal: Default.fixPadding * 1.5,
            }}
          >
            {tr("gallery")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={props.removeImage}
          style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            alignItems: "center",
          }}
        >
          <View style={styles.round}>
            <Ionicons name="trash" size={22} color={Colors.lightRed} />
          </View>
          <Text
            numberOfLines={1}
            style={{
              ...Fonts.Medium16black,
              overflow: "hidden",
              marginHorizontal: Default.fixPadding * 1.5,
            }}
          >
            {tr("remove")}
          </Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
};

export default AddImageBottomSheet;

const styles = StyleSheet.create({
  bottomSheetMain: {
    paddingVertical: Default.fixPadding * 2.5,
    paddingHorizontal: Default.fixPadding * 2,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: Colors.white,
  },
  round: {
    justifyContent: "center",
    alignItems: "center",
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
});
