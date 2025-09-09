import React, { useEffect } from "react";
import { Text, View, BackHandler, TouchableOpacity } from "react-native";
import MyStatusBar from "../components/myStatusBar";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import ComplaintsPersonalTab from "../components/complaintsPersonalTab";
import ComplaintsCommunityTab from "../components/complaintsCommunityTab";

const Tab = createMaterialTopTabNavigator();

const ComplaintsScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`complaintsScreen:${key}`);
  }
  const backAction = () => {
    navigation.goBack();
    return true;
  };
  
  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => subscription?.remove();
  }, []);

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
        <TouchableOpacity onPress={() => navigation.goBack()}> 
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
            {tr("complaints")}
          </Text>
        </View>

        <View
          style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            marginTop: Default.fixPadding * 2,
            marginHorizontal: Default.fixPadding,
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
                  padding: Default.fixPadding * 1.3,
                  marginBottom: Default.fixPadding,
                  marginHorizontal: Default.fixPadding,
                  borderRadius: 5,
                  backgroundColor: isFocused ? Colors.primary : Colors.white,
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
        initialRouteName="complaintsPersonalTab"
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <Tab.Screen
          name={"complaintsPersonalTab"}
          component={ComplaintsPersonalTab}
          options={{
            title: tr("personal"),
          }}
        />
        <Tab.Screen
          name={"complaintsCommunityTab"}
          component={ComplaintsCommunityTab}
          options={{
            title: tr("community"),
          }}
        />
      </Tab.Navigator>
    </View>
  );
};

export default ComplaintsScreen;
