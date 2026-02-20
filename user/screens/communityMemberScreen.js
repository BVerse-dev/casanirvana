import React, { useCallback, useEffect } from "react";
import { Text, View, BackHandler, TouchableOpacity } from "react-native";
import MyStatusBar from "../components/myStatusBar";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import MemberTab from "../components/memberTab";
import AdminTab from "../components/adminTab";
import CommitteeTab from "../components/committeeTab";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";

const Tab = createMaterialTopTabNavigator();

const CommunityMemberScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();

  const isRtl = i18n.dir() === "rtl";

  function tr(key) {
    return t(`communityMemberScreen:${key}`);
  }
  const backAction = useCallback(() => {
    navigation.pop();
    return true;
  }, [navigation]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );

    return () => {
      subscription?.remove();
    };
  }, [backAction]);

  const CustomTabBar = ({ state, descriptors, navigation }) => {
    return (
      <View>
        <View
          style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            alignItems: "center",
            paddingTop: Default.fixPadding * 1.2,
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
            {tr("members")}
          </Text>
        </View>

        <View
          style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            marginTop: Default.fixPadding * 2,
          }}
        >
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;

            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: "tabLongPress",
                target: route.key,
              });
            };

            return (
              <TouchableOpacity
                key={index}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={{
                  flex: 1,
                  borderBottomWidth: 2,
                  borderBottomColor: isFocused
                    ? Colors.primary
                    : Colors.lightGrey,
                  paddingHorizontal: Default.fixPadding * 0.5,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    ...(isFocused
                      ? Fonts.SemiBold16primary
                      : Fonts.SemiBold16grey),
                    overflow: "hidden",
                    textAlign: "center",
                    paddingBottom: Default.fixPadding,
                  }}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <MyStatusBar />

      <Tab.Navigator
        initialRouteName="memberTab"
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <Tab.Screen
          name={"memberTab"}
          component={MemberTab}
          options={{
            title: tr("member"),
          }}
        />
        <Tab.Screen
          name={"adminTab"}
          component={AdminTab}
          options={{
            title: tr("admin"),
          }}
        />

        <Tab.Screen
          name={"committeeTab"}
          component={CommitteeTab}
          options={{
            title: tr("committee"),
          }}
        />
      </Tab.Navigator>
    </View>
  );
};

export default CommunityMemberScreen;
