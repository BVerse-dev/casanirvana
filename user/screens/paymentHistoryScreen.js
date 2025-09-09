import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  Image,
  FlatList,
} from "react-native";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MyStatusBar from "../components/myStatusBar";
import DashedLine from "react-native-dashed-line";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const PaymentScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`paymentScreen:${key}`);
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

  const paymentList = [
    {
      key: "1",
      title: "Maintenance charge June 2022",
      price: "$15.00",
      date: "5 June, 03.30 pm",
      paid: true,
      new: true,
    },
    {
      key: "2",
      title: "Security Deposite",
      price: "$15.00",
      date: "5 June, 03.30 pm",
      pending: true,
      new: true,
    },
    {
      key: "3",
      title: "Society welfare funs",
      price: "$15.00",
      date: "5 June, 03.30 pm",
      new: true,
    },
    {
      key: "4",
      title: "Maintenance charge May 2022",
      price: "$15.00",
      date: "5 June, 03.30 pm",
      paid: true,
    },
    {
      key: "5",
      title: "Maintenance charge June 2022",
      price: "$15.00",
      date: "5 June, 03.30 pm",
      paid: true,
    },
  ];

  const renderItem = ({ item }) => {
    return (
      <View
        style={{
          flex: 1,
          marginHorizontal: Default.fixPadding * 2,
          marginBottom: Default.fixPadding * 2,
          borderRadius: 10,
          backgroundColor: Colors.white,
          ...Default.shadow,
        }}
      >
        <View
          style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              flex: 8,
              alignItems: isRtl ? "flex-end" : "flex-start",
              padding: Default.fixPadding * 1.4,
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                ...Fonts.SemiBold16primary,
                overflow: "hidden",
              }}
            >
              {item.title}
            </Text>
          </View>
          <View
            style={{ flex: 2, alignItems: isRtl ? "flex-start" : "flex-end" }}
          >
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
          </View>
        </View>
        <DashedLine
          dashGap={2.5}
          dashLength={2.5}
          dashThickness={1.5}
          dashColor={Colors.grey}
        />

        <View
          style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: Default.fixPadding * 1.6,
            paddingHorizontal: Default.fixPadding * 1.4,
          }}
        >
          <View
            style={{ flex: 6.5, alignItems: isRtl ? "flex-end" : "flex-start" }}
          >
            <Text
              numberOfLines={1}
              style={{ ...Fonts.Medium16black, overflow: "hidden" }}
            >
              {item.price}
            </Text>
            <Text
              numberOfLines={1}
              style={{ ...Fonts.Medium14black, overflow: "hidden" }}
            >
              {`${tr("dueDate")} : ${item.price}`}
            </Text>
          </View>

          <View
            style={{
              flex: 3.5,
              alignItems: isRtl ? "flex-start" : "flex-end",
            }}
          >
            {item.paid ? (
              <View
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  alignItems: "center",
                }}
              >
                <MaterialIcons
                  name="list-alt"
                  size={16}
                  color={Colors.primary}
                />
                <Text
                  numberOfLines={1}
                  style={{
                    ...Fonts.SemiBold14primary,
                    overflow: "hidden",
                    marginLeft: isRtl ? 0 : Default.fixPadding * 0.5,
                    marginRight: isRtl ? Default.fixPadding * 0.5 : 0,
                  }}
                >
                  {tr("receipt")}
                </Text>
              </View>
            ) : (
              <View
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  alignItems: "center",
                }}
              >
                <Image
                  source={require("../assets/images/moneyIcon.png")}
                  style={{ width: 16, height: 16, resizeMode: "contain" }}
                />
                <Text
                  numberOfLines={1}
                  style={{
                    ...Fonts.SemiBold14primary,
                    overflow: "hidden",
                    marginLeft: isRtl ? 0 : Default.fixPadding * 0.5,
                    marginRight: isRtl ? Default.fixPadding * 0.5 : 0,
                  }}
                >
                  {tr("payNow")}
                </Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity
          onPress={() => {
            if (item.paid) {
              navigation.push("successScreen");
            } else {
              navigation.push("paymentMethodScreen");
            }
          }}
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: Default.fixPadding,
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
            backgroundColor: item.paid
              ? Colors.regularGreen
              : item.pending
              ? Colors.orange
              : Colors.red,
            ...Default.shadow,
          }}
        >
          <Text
            numberOfLines={1}
            style={{ ...Fonts.SemiBold16white, overflow: "hidden" }}
          >
            {item.paid
              ? tr("paid")
              : item.pending
              ? tr("pending")
              : tr("failed")}
          </Text>
        </TouchableOpacity>
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
          {tr("payment")}
        </Text>
      </View>

      <FlatList
        data={paymentList}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: Default.fixPadding * 0.8 }}
      />
    </View>
  );
};

export default PaymentScreen;
