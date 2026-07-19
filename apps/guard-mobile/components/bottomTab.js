import React, { useState, useCallback } from "react";
import { BackHandler, Platform } from "react-native";
import { useTranslation } from "react-i18next";
import SnackbarToast from "./snackbarToast";
import { useFocusEffect } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import HomeScreen from "../screens/homeScreen";
import InOutScreen from "../screens/inOutScreen";
import ChatScreen from "../screens/chatScreen";
import EmergencyScreen from "../screens/emergencyScreen";
import SettingScreen from "../screens/settingScreen";
import { Default, Colors } from "../constants/styles";

const Tab = createBottomTabNavigator();

const BottomTab = ({ navigation }) => {
  const { t, i18n } = useTranslation();

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`bottomTab:${key}`);
  }

  const [visibleToast, setVisibleToast] = useState(false);
  const onDismissVisibleToast = () => setVisibleToast(false);

  const [exitApp, setExitApp] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        if (Platform.OS === "ios") {
          navigation.addListener("beforeRemove", (e) => {
            e.preventDefault();
          });
        } else {
          setTimeout(() => {
            setExitApp(0);
          }, 2000);

          if (exitApp === 0) {
            setExitApp(exitApp + 1);
            setVisibleToast(true);
          } else if (exitApp === 1) {
            BackHandler.exitApp();
          }
          return true;
        }
      };
      const backSub = BackHandler.addEventListener("hardwareBackPress", backAction);
      const unsubscribeGesture = navigation.addListener("gestureEnd", backAction);
      return () => {
        backSub.remove();
        unsubscribeGesture();
      };
    }, [exitApp])
  );

  const title1 = isRtl ? tr("settings") : tr("home");
  const title2 = isRtl ? tr("home") : tr("settings");
  const title3 = isRtl ? tr("alerts") : tr("inOut");
  const title4 = isRtl ? tr("inOut") : tr("chats");
  const title5 = isRtl ? tr("chats") : tr("alerts");

  return (
    <>
      <Tab.Navigator
        initialRouteName="homeScreen"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            justifyContent: "center",
            alignItems: "center",
            height: 65,
            borderTopColor: Colors.transparent,
            backgroundColor: Colors.white,
            paddingHorizontal: Default.fixPadding,
            ...Default.shadow
          },
          tabBarLabelStyle: {
            fontFamily: "Inter-SemiBold",
            fontSize: 14,
            paddingBottom: Default.fixPadding * 0.5,
          },
          tabBarItemStyle: {
            height: 60,
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          },
          tabBarIcon: ({ focused }) => {
            if (route.name === "homeScreen") {
              return (
                <SimpleLineIcons
                  name={"home"}
                  size={20}
                  color={focused ? Colors.primary : Colors.grey}
                />
              );
            } else if (route.name === "inOutScreen") {
              return (
                <Ionicons
                  name={"swap-vertical"}
                  size={20}
                  color={focused ? Colors.primary : Colors.grey}
                />
              );
            } else if (route.name === "chatScreen") {
              return (
                <Ionicons
                  name={"chatbubbles-outline"}
                  size={20}
                  color={focused ? Colors.primary : Colors.grey}
                />
              );
            } else if (route.name === "emergencyScreen") {
              return (
                <Ionicons
                  name={"warning-outline"}
                  size={20}
                  color={focused ? Colors.primary : Colors.grey}
                />
              );
            } else if (route.name === "settingScreen") {
              return (
                <Ionicons
                  name={"settings-outline"}
                  size={20}
                  color={focused ? Colors.primary : Colors.grey}
                />
              );
            }
          },
        })}
      >
        <Tab.Screen
          name={isRtl ? "settingScreen" : "homeScreen"}
          component={isRtl ? SettingScreen : HomeScreen}
          options={{
            title: title1,
            tabBarActiveTintColor: Colors.primary,
          }}
        />
        <Tab.Screen
          name={isRtl ? "chatScreen" : "inOutScreen"}
          component={isRtl ? ChatScreen : InOutScreen}
          options={{
            title: title3,
            tabBarActiveTintColor: Colors.primary,
          }}
        />

        <Tab.Screen
          name={isRtl ? "inOutScreen" : "chatScreen"}
          component={isRtl ? InOutScreen : ChatScreen}
          options={{
            title: title4,
            tabBarActiveTintColor: Colors.primary,
          }}
        />

        <Tab.Screen
          name={isRtl ? "chatScreen" : "emergencyScreen"}
          component={isRtl ? ChatScreen : EmergencyScreen}
          options={{
            title: title5,
            tabBarActiveTintColor: Colors.primary,
          }}
        />

        <Tab.Screen
          name={isRtl ? "emergencyScreen" : "settingScreen"}
          component={isRtl ? EmergencyScreen : SettingScreen}
          options={{
            title: isRtl ? tr("alerts") : tr("settings"),
            tabBarActiveTintColor: Colors.primary,
          }}
        />
      </Tab.Navigator>

      <SnackbarToast
        visible={visibleToast}
        title={tr("tapBack")}
        onDismiss={onDismissVisibleToast}
      />
    </>
  );
};

export default BottomTab;
