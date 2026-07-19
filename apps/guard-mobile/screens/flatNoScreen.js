import React, { useEffect } from "react";
import {
  Text,
  View,
  BackHandler,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import MyStatusBar from "../components/myStatusBar";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import FlatNoTab from "../components/flatNoTab";

const Tab = createMaterialTopTabNavigator();

const FlatNoScreen = ({ navigation, route }) => {
  const params = route.params || {};
  const {
    headerTitle,
    title,
    placeholderTitle,
    image,
    returnScreen,
    cabName,
    guestName,
    phoneNumber,
    cabData,
    insideTime,
  } = params;
  const { t, i18n } = useTranslation();

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`flatNoScreen:${key}`);
  }
  const backAction = () => {
    navigation.pop();
    return true;
  };
  useEffect(() => {
    const backSub = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backSub.remove();
  }, []);

  const title1 = isRtl ? tr("common") : tr("blockA");
  const title2 = isRtl ? tr("blockA") : tr("common");

  const title3 = isRtl ? tr("clubhouse") : tr("blockB");
  const title4 = isRtl ? tr("blockB") : tr("clubhouse");

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
            {tr("selectFlatUnit") || headerTitle}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          style={{
            paddingTop: Default.fixPadding * 2,
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
                  justifyContent: "center",
                  alignItems: "center",
                  paddingHorizontal: Default.fixPadding * 2,
                  borderBottomWidth: 2,
                  borderBottomColor: isFocused
                    ? Colors.primary
                    : Colors.lightGrey,
                }}
              >
                <Text
                  style={{
                    ...(isFocused
                      ? Fonts.SemiBold16black
                      : Fonts.SemiBold16grey),
                    overflow: "hidden",
                    paddingBottom: Default.fixPadding * 1.5,
                  }}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <MyStatusBar />

      <Tab.Navigator
        initialRouteName="blockATab"
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <Tab.Screen
          name={isRtl ? "commonTab" : "blockATab"}
          component={FlatNoTab}
          initialParams={{ ...params }}
          options={{
            title: title1,
          }}
        />

        <Tab.Screen
          name={isRtl ? "clubhouseTab" : "blockBTab"}
          component={FlatNoTab}
          initialParams={{ ...params }}
          options={{
            title: title3,
          }}
        />

        <Tab.Screen
          name={isRtl ? "blockBTab" : "clubhouseTab"}
          component={FlatNoTab}
          initialParams={{ ...params }}
          options={{
            title: title4,
          }}
        />

        <Tab.Screen
          name={isRtl ? "blockATab" : "commonTab"}
          component={FlatNoTab}
          initialParams={{ ...params }}
          options={{
            title: title2,
          }}
        />
      </Tab.Navigator>
    </View>
  );
};

export default FlatNoScreen;
