import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import MyStatusBar from "../components/myStatusBar";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import ChatsTab from "../components/chatsTab";
import ResidentsTab from "../components/residentsTab";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useGuardModuleAccess, MODULE_SLUGS } from "../hooks/useGuardModuleAccess";

const Tab = createMaterialTopTabNavigator();

const ChatScreen = () => {
  const { t, i18n } = useTranslation();
  const { enabled: residentDirectoryEnabled, modulesLoaded } = useGuardModuleAccess(
    MODULE_SLUGS.RESIDENT_DIRECTORY
  );

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`chatScreen:${key}`);
  }

  const CustomTabBar = ({ state, descriptors, navigation }) => {
    const totalTabs = state.routes.length;

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
          {modulesLoaded && residentDirectoryEnabled ? (
            <TouchableOpacity
              onPress={() => navigation.push("searchScreen")}
              style={{ alignItems: isRtl ? "flex-start" : "flex-end" }}
            >
              <Ionicons name="search-sharp" size={22} color={Colors.primary} />
            </TouchableOpacity>
          ) : null}
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
                    ? index === totalTabs - 1
                      ? 5
                      : 0
                    : index === 0
                    ? 5
                    : 0,
                  borderBottomLeftRadius: isRtl
                    ? index === totalTabs - 1
                      ? 5
                      : 0
                    : index === 0
                    ? 5
                    : 0,
                  borderTopRightRadius: isRtl
                    ? index === 0
                      ? 5
                      : 0
                    : index === totalTabs - 1
                    ? 5
                    : 0,
                  borderBottomRightRadius: isRtl
                    ? index === 0
                      ? 5
                      : 0
                    : index === totalTabs - 1
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
        {residentDirectoryEnabled ? (
          <Tab.Screen
            name={"residentsTab"}
            component={ResidentsTab}
            options={{
              title: tr("residents"),
            }}
          />
        ) : null}
      </Tab.Navigator>
    </View>
  );
};

export default ChatScreen;
