import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import MyStatusBar from "../components/myStatusBar";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import ChatsTab from "../components/chatsTab";
import ResidentsTab from "../components/residentsTab";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

const Tab = createMaterialTopTabNavigator();

const ChatScreen = () => {
  const { t, i18n } = useTranslation();

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`chatScreen:${key}`);
  }

  const CustomTabBar = ({ state, descriptors, navigation }) => {
    return (
      <View>
        <View
          style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            alignItems: "center",
            marginTop: Default.fixPadding * 1.2,
            marginHorizontal: Default.fixPadding * 2,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              numberOfLines={1}
              style={{
                ...Fonts.SemiBold22black,
                overflow: "hidden",
                textAlign: isRtl ? "right" : "left",
              }}
            >
              {tr("chats")}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.push("searchScreen")}
            style={{ alignItems: isRtl ? "flex-start" : "flex-end" }}
          >
            <Ionicons name="search-sharp" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <View
          style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            marginTop: Default.fixPadding * 2,
            marginHorizontal: Default.fixPadding * 2,
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
                  marginBottom: Default.fixPadding,
                  padding: Default.fixPadding * 1.1,
                  borderTopLeftRadius: isRtl
                    ? index === 1
                      ? 5
                      : 0
                    : index === 0
                    ? 5
                    : 0,
                  borderBottomLeftRadius: isRtl
                    ? index === 1
                      ? 5
                      : 0
                    : index === 0
                    ? 5
                    : 0,
                  borderTopRightRadius: isRtl
                    ? index === 0
                      ? 5
                      : 0
                    : index === 1
                    ? 5
                    : 0,
                  borderBottomRightRadius: isRtl
                    ? index === 0
                      ? 5
                      : 0
                    : index === 1
                    ? 5
                    : 0,
                  backgroundColor: isFocused
                    ? Colors.primary
                    : Colors.regularGrey,
                  ...Default.shadow,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    ...(isFocused
                      ? Fonts.SemiBold16white
                      : Fonts.SemiBold16grey),
                    overflow: "hidden",
                    textAlign: "center",
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
        initialRouteName="chatsTab"
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <Tab.Screen
          name={"chatsTab"}
          component={ChatsTab}
          options={{
            title: tr("chats"),
          }}
        />
        <Tab.Screen
          name={"residentsTab"}
          component={ResidentsTab}
          options={{
            title: tr("residents"),
          }}
        />
      </Tab.Navigator>
    </View>
  );
};

export default ChatScreen;
