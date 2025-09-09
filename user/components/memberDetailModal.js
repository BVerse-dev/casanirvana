import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Modal,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ms } from "react-native-size-matters/extend";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Octicons from "react-native-vector-icons/Octicons";

const { width, height } = Dimensions.get("window");

const MemberDetailModal = (props) => {
  const { t, i18n } = useTranslation();

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`memberDetailModal:${key}`);
  }
  return (
    <Modal
      transparent={true}
      animationType="fade"
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
                maxHeight: height / 1.8,
                width: width * 0.9,
                borderRadius: 20,
                backgroundColor: Colors.white,
                ...Default.shadow,
              }}
            >
              <TouchableOpacity
                onPress={props.modalClose}
                style={{
                  alignSelf: isRtl ? "flex-start" : "flex-end",
                  paddingTop: Default.fixPadding,
                  paddingHorizontal: Default.fixPadding * 1.3,
                }}
              >
                <Ionicons name="close" size={18} color={Colors.grey} />
              </TouchableOpacity>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View>
                  <View
                    style={{ justifyContent: "center", alignItems: "center" }}
                  >
                    <Image
                      source={
                        typeof props.image === 'number' 
                          ? props.image 
                          : typeof props.image === 'string' && props.image.startsWith('http')
                            ? { uri: props.image }
                            : require("../assets/images/pic1.png") // Fallback member image
                      }
                      style={{
                        width: ms(79),
                        height: ms(79),
                        borderRadius: 5,
                      }}
                    />

                    <Text
                      style={{
                        ...Fonts.SemiBold16black,
                        marginTop: Default.fixPadding,
                      }}
                    >
                      {props.name}
                    </Text>
                    <Text
                      style={{
                        ...Fonts.Medium14grey,
                        marginTop: Default.fixPadding * 0.5,
                      }}
                    >
                      +91 1234567890
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: isRtl ? "row-reverse" : "row",
                      alignItems: "center",
                      marginVertical: Default.fixPadding * 3,
                      marginHorizontal: Default.fixPadding * 1.5,
                    }}
                  >
                    <View
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        paddingHorizontal: Default.fixPadding * 0.5,
                      }}
                    >
                      <View style={styles.circle}>
                        <Image
                          source={require("../assets/images/building.png")}
                          style={{
                            resizeMode: "contain",
                            width: 20,
                            height: 20,
                          }}
                        />
                      </View>

                      <Text
                        numberOfLines={2}
                        style={{
                          ...Fonts.Medium14black,
                          overflow: "hidden",
                          textAlign: "center",
                          marginTop: Default.fixPadding,
                        }}
                      >
                        {props.societyName}
                      </Text>
                    </View>

                    <View
                      style={{
                        flex: 1,
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <View
                        style={{
                          height: 60,
                          borderLeftWidth: 1,
                          borderLeftColor: Colors.grey,
                        }}
                      />
                      <View
                        style={{
                          justifyContent: "center",
                          alignItems: "center",
                          width: width / 3.8,
                          paddingHorizontal: Default.fixPadding * 0.5,
                        }}
                      >
                        <View style={styles.circle}>
                          <Octicons
                            name="home"
                            size={20}
                            color={Colors.primary}
                          />
                        </View>

                        <Text
                          numberOfLines={1}
                          style={{
                            ...Fonts.Medium14black,
                            overflow: "hidden",
                            marginTop: Default.fixPadding,
                          }}
                        >
                          {`${tr("flatNo")} : `}
                        </Text>
                        <Text
                          numberOfLines={1}
                          style={{
                            ...Fonts.Medium14black,
                          }}
                        >
                          {props.flatNo}
                        </Text>
                      </View>

                      <View
                        style={{
                          height: 60,
                          borderRightWidth: 1,
                          borderRightColor: Colors.grey,
                        }}
                      />
                    </View>

                    <View
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        paddingHorizontal: Default.fixPadding * 0.5,
                      }}
                    >
                      <View style={styles.circle}>
                        <MaterialCommunityIcons
                          name="home-city-outline"
                          size={22}
                          color={Colors.primary}
                        />
                      </View>

                      <Text
                        numberOfLines={1}
                        style={{
                          ...Fonts.Medium14black,
                          overflow: "hidden",
                          marginTop: Default.fixPadding,
                        }}
                      >
                        {`${tr("blockNo")} : `}
                      </Text>
                      <Text
                        style={{
                          ...Fonts.Medium14black,
                        }}
                      >
                        {props.blockNo}
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
              <View
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  alignItems: "center",
                  marginBottom: Default.fixPadding * 2.2,
                  marginHorizontal: Default.fixPadding * 1.3,
                }}
              >
                <TouchableOpacity
                  onPress={props.onCallHandle}
                  style={{
                    flexDirection: isRtl ? "row-reverse" : "row",
                    backgroundColor: Colors.blue,
                    ...styles.button,
                  }}
                >
                  <MaterialCommunityIcons
                    name="phone-outline"
                    size={20}
                    color={Colors.white}
                  />
                  <Text
                    numberOfLines={1}
                    style={{
                      ...Fonts.SemiBold18white,
                      overflow: "hidden",
                      marginLeft: isRtl ? 0 : Default.fixPadding,
                      marginRight: isRtl ? Default.fixPadding : 0,
                      maxWidth: 80,
                    }}
                  >
                    {tr("call")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={props.onChatHandle}
                  style={{
                    flexDirection: isRtl ? "row-reverse" : "row",
                    backgroundColor: Colors.lightGreen,
                    ...styles.button,
                  }}
                >
                  <MaterialCommunityIcons
                    name="message-processing-outline"
                    size={20}
                    color={Colors.white}
                  />
                  <Text
                    numberOfLines={1}
                    style={{
                      ...Fonts.SemiBold18white,
                      overflow: "hidden",
                      marginLeft: isRtl ? 0 : Default.fixPadding,
                      marginRight: isRtl ? Default.fixPadding : 0,
                      maxWidth: 80,
                    }}
                  >
                    {tr("chat")}
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

export default MemberDetailModal;
const styles = StyleSheet.create({
  circle: {
    justifyContent: "center",
    alignItems: "center",
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: Colors.regularSky,
  },
  button: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Default.fixPadding * 1.4,
    marginHorizontal: Default.fixPadding * 1.1,
    borderRadius: 10,
  },
});
