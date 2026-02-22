import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import MyStatusBar from "../components/myStatusBar";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import CheckedInTab from "../components/checkedInTab";
import CheckedOutTab from "../components/checkedOutTab";
import { useVisitorPassCounts } from "../hooks/useVisitorPassCounts";

const Tab = createMaterialTopTabNavigator();

const InOutScreen = () => {
  const { t, i18n } = useTranslation();
  
  const { insideCount, outsideCount } = useVisitorPassCounts();

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`inOutScreen:${key}`);
  }

  const CustomTabBar = ({ state, descriptors, navigation }) => {
    return (
      <View>
        <View
          style={{
            paddingTop: Default.fixPadding * 1.2,
            paddingHorizontal: Default.fixPadding * 2,
          }}
        >
          <Text
            style={{
              ...Fonts.SemiBold18black,
              textAlign: isRtl ? "right" : "left",
              marginHorizontal: Default.fixPadding,
            }}
          >
            {tr("inOut")}
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
                  paddingHorizontal: Default.fixPadding * 0.5,
                  borderBottomColor: isFocused
                    ? Colors.primary
                    : Colors.extraLightGrey,
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
        initialRouteName="checkedInTab"
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <Tab.Screen
          name={"checkedInTab"}
          component={CheckedInTab}
          options={{
            title: `${tr("checkedIn")}(${insideCount})`,
          }}
        />

        <Tab.Screen
          name={"checkedOutTab"}
          component={CheckedOutTab}
          options={{
            title: `${tr("checkedOut")}(${outsideCount})`,
          }}
        />
      </Tab.Navigator>
    </View>
  );
};

export default InOutScreen;
