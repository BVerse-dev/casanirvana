import React, { useState, useCallback } from "react";
import {
  BackHandler,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  Modal,
  Dimensions,
  Text,
  FlatList,
  Image,
  TouchableWithoutFeedback,
} from "react-native";
import { useTranslation } from "react-i18next";
import SnackbarToast from "./snackbarToast";
import { useFocusEffect } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import Octicons from "react-native-vector-icons/Octicons";
import Feather from "react-native-vector-icons/Feather";
import HomeScreen from "../screens/homeScreen";
import ChatScreen from "../screens/chatScreen";
import ServiceScreen from "../screens/serviceScreen";
import ProfileScreen from "../screens/profileScreen";
import { Fonts, Colors, Default } from "../constants/styles";

const Tab = createBottomTabNavigator();

const { width, height } = Dimensions.get("window");

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
      const backSubscription = BackHandler.addEventListener("hardwareBackPress", backAction);
      navigation.addListener("gestureEnd", backAction);
      return () => {
        backSubscription?.remove();
        navigation.removeListener("gestureEnd", backAction);
      };
    }, [exitApp])
  );

  const title1 = isRtl ? tr("profile") : tr("home");
  const title2 = isRtl ? tr("home") : tr("profile");
  const title3 = isRtl ? tr("service") : tr("chats");
  const title4 = isRtl ? tr("chats") : tr("service");

  const SecurityAlertTab = () => {
    return null;
  };

  const [openModal, setOpenModal] = useState(false);

  const securityAlertList = [
    {
      key: "1",
      image: require("../assets/images/s3.png"),
      title: tr("fireAlert"),
    },
    {
      key: "2",
      image: require("../assets/images/s4.png"),
      title: tr("stuckLift"),
    },
    {
      key: "3",
      image: require("../assets/images/s5.png"),
      title: tr("animalThreat"),
    },
    {
      key: "4",
      image: require("../assets/images/s6.png"),
      title: tr("visiterThreat"),
    },
  ];

  const renderItem = ({ item }) => {
    return (
      <TouchableWithoutFeedback>
        <View
          style={{
            marginBottom: Default.fixPadding * 2,
            ...styles.commonBox,
          }}
        >
          <Image 
            source={
              typeof item.image === 'number' 
                ? item.image 
                : typeof item.image === 'string' && item.image.startsWith('http')
                  ? { uri: item.image }
                  : require("../assets/images/s1.png") // Fallback tab icon
            }
            style={styles.image} 
          />
          <Text
            numberOfLines={1}
            style={{
              ...Fonts.Medium15primary,
              overflow: "hidden",
              marginTop: Default.fixPadding,
            }}
          >
            {item.title}
          </Text>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  const CustomTabBarButton = () => (
    <TouchableOpacity
      onPress={() => setOpenModal(true)}
      style={{
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        height: 65,
        width: 65,
        borderRadius: 33,
        bottom: Default.fixPadding * 3.3,
      }}
    >
      <View style={styles.circle}>
        <Octicons name={"shield-check"} size={26} color={Colors.white} />
      </View>
    </TouchableOpacity>
  );

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
            ...Default.shadow
          },
          tabBarLabelStyle: {
            fontFamily: "Inter-SemiBold",
            fontSize: 14,
            paddingBottom: Default.fixPadding * 0.5,
          },
          tabBarItemStyle: {
            height: 60,
          },
          tabBarIcon: ({ focused }) => {
            if (route.name === "homeScreen") {
              return (
                <SimpleLineIcons
                  name={"home"}
                  size={19}
                  color={focused ? Colors.primary : Colors.grey}
                />
              );
            } else if (route.name === "chatScreen") {
              return (
                <MaterialIcons
                  name={"chat-bubble-outline"}
                  size={20}
                  color={focused ? Colors.primary : Colors.grey}
                />
              );
            } else if (route.name === "serviceScreen") {
              return (
                <SimpleLineIcons
                  name={"wrench"}
                  size={20}
                  color={focused ? Colors.primary : Colors.grey}
                />
              );
            } else if (route.name === "profileScreen") {
              return (
                <Feather
                  name={"user"}
                  size={20}
                  color={focused ? Colors.primary : Colors.grey}
                />
              );
            }
          },
        })}
      >
        <Tab.Screen
          name={isRtl ? "profileScreen" : "homeScreen"}
          component={isRtl ? ProfileScreen : HomeScreen}
          options={{
            title: title1,
            tabBarActiveTintColor: Colors.primary,
          }}
        />
        <Tab.Screen
          name={isRtl ? "serviceScreen" : "chatScreen"}
          component={isRtl ? ServiceScreen : ChatScreen}
          options={{
            title: title3,
            tabBarActiveTintColor: Colors.primary,
          }}
        />
        <Tab.Screen
          name="securityAlertTab"
          component={SecurityAlertTab}
          options={{
            tabBarButton: (props) => <CustomTabBarButton {...props} />,
          }}
        />

        <Tab.Screen
          name={isRtl ? "chatScreen" : "serviceScreen"}
          component={isRtl ? ChatScreen : ServiceScreen}
          options={{
            title: title4,
            tabBarActiveTintColor: Colors.primary,
          }}
        />
        <Tab.Screen
          name={isRtl ? "homeScreen" : "profileScreen"}
          component={isRtl ? HomeScreen : ProfileScreen}
          options={{
            title: title2,
            tabBarActiveTintColor: Colors.primary,
          }}
        />
      </Tab.Navigator>

      <SnackbarToast
        visible={visibleToast}
        title={tr("tapBack")}
        onDismiss={onDismissVisibleToast}
      />

      <Modal
        transparent={true}
        animationType="fade"
        visible={openModal}
        onRequestClose={() => setOpenModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPressOut={() => setOpenModal(false)}
          style={{ flex: 1 }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "flex-end",
              alignItems: "center",
              paddingTop: Default.fixPadding * 2,
              paddingBottom: 90,
              backgroundColor: Colors.transparentBlack,
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={{
                width: width * 0.8,
                borderRadius: 10,
                backgroundColor: Colors.extraLightSky,
                ...Default.shadow,
              }}
            >
              <FlatList
                numColumns={2}
                data={securityAlertList}
                renderItem={renderItem}
                keyExtractor={(item) => item.key}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: Default.fixPadding,
                }}
                style={{ maxHeight: height / 1.7 }}
                ListHeaderComponent={() => (
                  <View>
                    <Text
                      numberOfLines={1}
                      style={{
                        ...Fonts.SemiBold16primary,
                        overflow: "hidden",
                        textAlign: isRtl ? "right" : "left",
                        marginTop: Default.fixPadding * 2,
                        marginBottom: Default.fixPadding,
                        marginHorizontal: Default.fixPadding,
                      }}
                    >
                      {tr("sendMessage")}
                    </Text>

                    <View
                      style={{
                        flexDirection: isRtl ? "row-reverse" : "row",
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: Default.fixPadding * 2.5,
                      }}
                    >
                      <TouchableOpacity
                        style={styles.commonBox}
                        onPress={() => {
                          setOpenModal(false);
                          navigation.push("messageScreen", {
                            image: require("../assets/images/img14.png"),
                            name: "Wade warren",
                            key: "1",
                          });
                        }}
                      >
                        <Image
                          source={require("../assets/images/s1.png")}
                          style={styles.image}
                        />

                        <Text
                          numberOfLines={1}
                          style={{
                            ...Fonts.Medium15primary,
                            overflow: "hidden",
                            marginTop: Default.fixPadding,
                          }}
                        >
                          {tr("admin")}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.commonBox}
                        onPress={() => {
                          setOpenModal(false);
                          navigation.push("messageScreen", {
                            image: require("../assets/images/img14.png"),
                            name: "Wade warren",
                            key: "1",
                          });
                        }}
                      >
                        <Image
                          source={require("../assets/images/s2.png")}
                          style={styles.image}
                        />

                        <Text
                          numberOfLines={1}
                          style={{
                            ...Fonts.Medium15primary,
                            overflow: "hidden",
                            marginTop: Default.fixPadding,
                          }}
                        >
                          {tr("security")}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <Text
                      numberOfLines={1}
                      style={{
                        ...Fonts.SemiBold16primary,
                        overflow: "hidden",
                        textAlign: isRtl ? "right" : "left",
                        marginBottom: Default.fixPadding,
                        marginHorizontal: Default.fixPadding,
                      }}
                    >
                      {tr("securityAlert")}
                    </Text>
                  </View>
                )}
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default BottomTab;

const styles = StyleSheet.create({
  circle: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    height: 54,
    width: 54,
    borderRadius: 27,
    backgroundColor: Colors.primary,
    shadowColor: Colors.grey,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },

  commonBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Default.fixPadding * 1.5,
    paddingHorizontal: Default.fixPadding,
    marginHorizontal: Default.fixPadding,
    borderRadius: 10,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  image: {
    resizeMode: "contain",
    width: 40,
    height: 40,
  },
});
