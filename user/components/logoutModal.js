import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import Feather from "react-native-vector-icons/Feather";

const { width } = Dimensions.get("window");

const LogoutModal = (props) => {
  const { t, i18n } = useTranslation();

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`logoutModal:${key}`);
  }
  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={props.visible}
      onRequestClose={props.modalClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressOut={props.modalClose}
        style={{ flex: 1 }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: Colors.transparentBlack,
          }}
        >
          <TouchableWithoutFeedback>
            <View
              style={{
                overflow: "hidden",
                width: width * 0.8,
                borderRadius: 10,
                backgroundColor: Colors.white,
                ...Default.shadow,
              }}
            >
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  paddingTop: Default.fixPadding * 1.7,
                  paddingHorizontal: Default.fixPadding * 2,
                }}
              >
                <Feather name="log-out" size={40} color={Colors.primary} />
                <Text
                  style={{
                    ...Fonts.SemiBold18primary,
                    marginTop: Default.fixPadding * 0.9,
                    marginBottom: Default.fixPadding * 1.5,
                  }}
                >
                  {tr("logout")}
                </Text>
                <Text
                  style={{
                    ...Fonts.SemiBold16black,
                    textAlign: "center",
                    marginBottom: Default.fixPadding * 1.9,
                  }}
                >
                  {tr("areYouSureLogout")}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  alignItems: "center",
                }}
              >
                <TouchableOpacity
                  onPress={props.modalClose}
                  style={{
                    backgroundColor: Colors.white,
                    ...styles.bottomBtn,
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={{ ...Fonts.SemiBold18black, overflow: "hidden" }}
                  >
                    {tr("no")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={props.onLogoutHandle}
                  style={{
                    backgroundColor: Colors.primary,
                    ...styles.bottomBtn,
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={{ ...Fonts.SemiBold18white, overflow: "hidden" }}
                  >
                    {tr("yes")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default LogoutModal;

const styles = StyleSheet.create({
  bottomBtn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Default.fixPadding * 1.2,
    ...Default.shadow,
  },
});
