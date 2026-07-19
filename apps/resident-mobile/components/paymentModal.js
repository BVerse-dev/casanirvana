import React, { useState } from "react";
import {
  Text,
  View,
  Modal,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Image,
  ScrollView,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Colors, Fonts, Default } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import AwesomeButton from "react-native-really-awesome-button";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const { width, height } = Dimensions.get("window");

const PaymentModal = (props) => {
  const { t, i18n } = useTranslation();

  const isRtl = i18n.dir() === "rtl";
  const [confirmPaymentDue, setConfirmPaymentDue] = useState();

  const paymentDueOptions = [
    { key: "1", title: t("paymentModal:january") },
    { key: "2", title: t("paymentModal:february") },
    { key: "3", title: t("paymentModal:march") },
    { key: "4", title: t("paymentModal:april") },
    { key: "5", title: t("paymentModal:may") },
  ];

  const renderPaymentDueOption = ({ item }) => {
    const isSelected = confirmPaymentDue === item.title;
    return (
      <TouchableOpacity
        onPress={() => setConfirmPaymentDue(item.title)}
        style={{
          flexDirection: isRtl ? "row-reverse" : "row",
          alignItems: "center",
          marginTop: Default.fixPadding * 2.5,
          marginHorizontal: Default.fixPadding * 2.6,
        }}
      >
        <MaterialCommunityIcons
          name={isSelected ? "record-circle" : "circle-outline"}
          size={22}
          color={isSelected ? Colors.primary : Colors.grey}
        />
        <Text
          numberOfLines={1}
          style={{
            ...Fonts.Medium16black,
            overflow: "hidden",
            marginHorizontal: Default.fixPadding,
          }}
        >
          {item.title}
        </Text>
      </TouchableOpacity>
    );
  };

  const totalAmount = confirmPaymentDue ? "$200" : "";

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={props.visible}
      onRequestClose={props.closePaymentModal}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressOut={props.closePaymentModal}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView behavior={"padding"} style={{ flex: 1 }}>
          <View style={styles.mainModalView}>
            <TouchableWithoutFeedback>
              <View style={styles.subModalView}>
                <View style={{ justifyContent: "center", alignItems: "center" }}>
                  <View style={styles.topImageView}>
                    <Image
                      source={
                        typeof props.image === 'number' 
                          ? props.image 
                          : typeof props.image === 'string' && props.image.startsWith('http')
                            ? { uri: props.image }
                            : require("../assets/images/s1.png") // Fallback payment image
                      }
                      style={{ width: 54, height: 54, resizeMode: "contain" }}
                    />
                  </View>
                </View>
                <TouchableOpacity
                  onPress={props.closePaymentModal}
                  style={{
                    position: "absolute",
                    right: isRtl ? null : 0,
                    marginTop: Default.fixPadding * 1.2,
                    marginHorizontal: Default.fixPadding * 1.1,
                  }}
                >
                  <Ionicons name="close" size={22} color={Colors.grey} />
                </TouchableOpacity>

                <Text
                  numberOfLines={1}
                  style={{
                    ...Fonts.SemiBold18black,
                    overflow: "hidden",
                    textAlign: "center",
                    marginTop: Default.fixPadding,
                    marginBottom: Default.fixPadding * 2,
                  }}
                >
                  {`${t("paymentModal:payFor")} ${props.title}`}
                </Text>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={{ marginHorizontal: Default.fixPadding * 2 }}>
                    <Text
                      style={{
                        ...Fonts.SemiBold16black,
                        textAlign: isRtl ? "right" : "left",
                      }}
                    >
                      {t("paymentModal:selectPaymentDue")}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {}}
                      style={styles.paymentTouchOpacity}
                    >
                      <Text
                        numberOfLines={1}
                        style={{
                          ...(confirmPaymentDue
                            ? Fonts.Medium15black
                            : Fonts.Medium15grey),
                          overflow: "hidden",
                          textAlign: isRtl ? "right" : "left",
                        }}
                      >
                        {confirmPaymentDue
                          ? confirmPaymentDue
                          : t("paymentModal:selectPaymentDue")}
                      </Text>
                      <Ionicons
                        name="caret-down-outline"
                        color={Colors.grey}
                        size={18}
                      />
                    </TouchableOpacity>

                    {totalAmount !== "" && (
                      <Text
                        style={{
                          ...Fonts.SemiBold16black,
                          marginTop: Default.fixPadding * 2,
                          textAlign: isRtl ? "right" : "left",
                        }}
                      >
                        {`${t("paymentModal:totalAmount")} ${totalAmount}`}
                      </Text>
                    )}
                  </View>
                </ScrollView>

                <View style={{ margin: Default.fixPadding * 2 }}>
                  <AwesomeButton
                    height={50}
                    onPress={() => {
                      props.closePaymentModal();
                      setConfirmPaymentDue(null);
                    }}
                    raiseLevel={1}
                    stretch={true}
                    borderRadius={10}
                    backgroundShadow={Colors.primary}
                    backgroundDarker={Colors.primary}
                    backgroundColor={Colors.primary}
                  >
                    <Text style={{ ...Fonts.SemiBold18white }}>
                      {t("paymentModal:proceedToPayment")}
                    </Text>
                  </AwesomeButton>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
};

export default PaymentModal;

const styles = StyleSheet.create({
  mainModalView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.transparentBlack,
  },
  subModalView: {
    width: width * 0.9,
    borderRadius: 10,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  topImageView: {
    justifyContent: "center",
    alignItems: "center",
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: Colors.white,
    backgroundColor: Colors.geyser,
    marginTop: -Default.fixPadding * 5,
    ...Default.shadow,
  },
  paymentTouchOpacity: {
    alignItems: "center",
    flexDirection: "row",
    paddingVertical: Default.fixPadding * 1.5,
    paddingHorizontal: Default.fixPadding,
    marginTop: Default.fixPadding,
    marginBottom: Default.fixPadding * 2.5,
    borderRadius: 10,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
});