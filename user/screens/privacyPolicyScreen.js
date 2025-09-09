import React, { useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  ScrollView,
  Image,
} from "react-native";
import MyStatusBar from "../components/myStatusBar";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTranslation } from "react-i18next";

const PrivacyPolicyScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`privacyPolicyScreen:${key}`);
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
          {tr("privacyPolicy")}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: Default.fixPadding * 1.8,
          }}
        >
          <Image
            source={require("../assets/images/appIcon.png")}
            style={{ width: 54, height: 54, resizeMode: "contain" }}
          />
          <Text
            style={{
              ...Fonts.SemiBold28primary,
              marginTop: Default.fixPadding * 1.1,
            }}
          >
            CASA NIRVANA
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 30,
                borderTopWidth: 2,
                borderTopColor: Colors.primary,
              }}
            />
            <Text
              style={{
                ...Fonts.Medium18primary,
                paddingHorizontal: Default.fixPadding * 0.5,
              }}
            >
              Society
            </Text>
            <View
              style={{
                width: 30,
                borderTopWidth: 2,
                borderTopColor: Colors.primary,
              }}
            />
          </View>
        </View>
        <View
          style={{
            marginTop: Default.fixPadding * 3,
            marginHorizontal: Default.fixPadding * 2,
          }}
        >
          <Text
            style={{
              ...Fonts.Medium15grey,
              textAlign: isRtl ? "right" : "left",
              marginBottom: Default.fixPadding * 1.5,
            }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscindf elitj. Eu
            scelerisque neque neque vestibulumaugued enullalkll quis mauris. Ac
            solliciegestapellentesqueg adipiscing. Leo aliquam, aliquam non sit
            valaoreethg Morbi felis volutpat eu vestibulum, ornare purus ath the
            puruse. Pretium maecenas in eget sapien odioh.
          </Text>
          <Text
            style={{
              ...Fonts.Medium15grey,
              textAlign: isRtl ? "right" : "left",
              marginBottom: Default.fixPadding * 1.5,
            }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Imperdiet
            accumsan nec, enim viverra.Interdum massa diam. Pellentesque ornare
            ornare lobortis sit. Utpulvinar tincidunt amet mi elit rutrum.
            Liberolorem acommodof. Egestas vel duis ut a ivenenatisLectuss Lorem
            ipsum dolor sit amet, consectetur adipiscing elit. Imperdiet
            accumsan nec, enim viverra.Interdum massa diam. Pellentesque ornare
            ornare lobortis sit. Utpulvinar tincidunt amet mi elit rutrum.
            Liberolorem acommodof. Egestas vel duis ut a ivenenatisLectuss
          </Text>
          <Text
            style={{
              ...Fonts.Medium15grey,
              textAlign: isRtl ? "right" : "left",
              marginBottom: Default.fixPadding * 1.5,
            }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Imperdiet
            accumsan nec, enim viverra.Interdum massa diam. Pellentesque ornare
            ornare lobortis sit. Utpulvinar tincidunt amet mi elit rutrum.
            Liberolorem acommodof. Egestas vel duis ut a ivenenatisLectuss Lorem
            ipsum dolor sit amet, consectetur adipiscing elit. Imperdiet
            accumsan nec, enim viverra.Interdum massa diam. Pellentesque ornare
            ornare lobortis sit. Utpulvinar tincidunt amet mi elit rutrum.
            Liberolorem acommodof. Egestas vel duis ut a ivenenatisLectuss
          </Text>
          <Text
            style={{
              ...Fonts.Medium15grey,
              textAlign: isRtl ? "right" : "left",
              marginBottom: Default.fixPadding * 1.5,
            }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscindf elitj. Eu
            scelerisque neque neque vestibulumaugued enullalkll quis mauris. Ac
            solliciegestapellentesqueg adipiscing. Leo aliquam, aliquam non sit
            valaoreethg Morbi felis volutpat eu vestibulum, ornare purus ath the
            puruse. Pretium maecenas in eget sapien odioh.
          </Text>
          <Text
            style={{
              ...Fonts.Medium15grey,
              textAlign: isRtl ? "right" : "left",
              marginBottom: Default.fixPadding * 1.5,
            }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscindf elitj. Eu
            scelerisque neque neque vestibulumaugued enullalkll quis mauris. Ac
            solliciegestapellentesqueg adipiscing. Leo aliquam, aliquam non sit
            valaoreethg Morbi felis volutpat eu vestibulum, ornare purus ath the
            puruse. Pretium maecenas in eget sapien odioh.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default PrivacyPolicyScreen;
