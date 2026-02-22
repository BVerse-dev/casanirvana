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
  Alert,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import SnackbarToast from "./snackbarToast";
import { useFocusEffect } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import Octicons from "react-native-vector-icons/Octicons";
import Feather from "react-native-vector-icons/Feather";
import HomeScreen from "../screens/homeScreen";
import ChatScreen from "../screens/chatScreen";
import ServiceScreen from "../screens/serviceScreen";
import ProfileScreen from "../screens/profileScreen";
import { Fonts, Colors, Default } from "../constants/styles";
import { useHasJoinedCommunity } from "../hooks/useCommunityData";
import {
  EMERGENCY_TYPES,
  createEmergencyAlert,
  getAllGuards,
  getCommunityAdmins,
} from "../services/emergencyService";

const Tab = createBottomTabNavigator();

const { width, height } = Dimensions.get("window");

const BottomTab = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { hasJoinedCommunity, profile } = useHasJoinedCommunity();

  const isRtl = i18n.dir() === "rtl";

  function tr(key, fallback, options = {}) {
    return t(`bottomTab:${key}`, {
      defaultValue: fallback,
      ...options,
    });
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
    }, [exitApp, navigation])
  );

  const title1 = isRtl ? tr("profile") : tr("home");
  const title2 = isRtl ? tr("home") : tr("profile");
  const title3 = isRtl ? tr("service") : tr("chats");
  const title4 = isRtl ? tr("chats") : tr("service");

  const SecurityAlertTab = () => {
    return null;
  };

  const [openModal, setOpenModal] = useState(false);
  const [isProcessingAlert, setIsProcessingAlert] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const selectedEmergencyInfo = selectedEmergency
    ? EMERGENCY_TYPES[selectedEmergency.type] || null
    : null;

  const securityAlertList = [
    {
      key: "1",
      image: require("../assets/images/s3.png"),
      title: tr("fireAlert"),
      emergencyType: "fire_alert"
    },
    {
      key: "2",
      image: require("../assets/images/s4.png"),
      title: tr("stuckLift"),
      emergencyType: "stuck_lift"
    },
    {
      key: "3",
      image: require("../assets/images/s5.png"),
      title: tr("animalThreat"),
      emergencyType: "animal_threat"
    },
    {
      key: "4",
      image: require("../assets/images/s6.png"),
      title: tr("visiterThreat"),
      emergencyType: "visitor_threat"
    },
  ];

  // Handle emergency alert
  const handleEmergencyAlert = (emergencyType) => {
    if (!hasJoinedCommunity || !profile?.community_id) {
      Alert.alert(
        tr("errorTitle", "Error"),
        tr("communityRequiredForEmergency", "You must be part of a community to send emergency alerts.")
      );
      return;
    }

    const emergencyInfo = EMERGENCY_TYPES[emergencyType];
    if (!emergencyInfo) {
      Alert.alert(
        tr("errorTitle", "Error"),
        tr("invalidEmergencyType", "Invalid emergency type selected.")
      );
      return;
    }

    setSelectedEmergency({ type: emergencyType, info: emergencyInfo });
    setShowEmergencyModal(true);
    setOpenModal(false);
  };

  // Send emergency alert
  const sendEmergencyAlert = async () => {
    if (!selectedEmergency) return;

    setIsProcessingAlert(true);
    setShowEmergencyModal(false);
    
            try {
              const result = await createEmergencyAlert(
                selectedEmergency.type,
                null, // Will use user's unit location
                profile, // Pass the profile data that's already working
                profile.community_id
              );

      if (result.success) {
        const successLines = [
          result.message,
          tr("notifiedCountMessage", "{{count}} people have been notified.", {
            count: result.notifiedCount || 0,
          }),
        ];

        if (result.locationData) {
          successLines.push(
            tr(
              "locationSharedWithResponders",
              "📍 Your location has been shared with responders."
            )
          );
        }

        Alert.alert(
          tr("emergencyAlertSentTitle", "Emergency Alert Sent! 🚨"),
          successLines.join("\n\n"),
          [{ text: tr("okButton", "OK") }]
        );
      } else {
        Alert.alert(
          tr("errorTitle", "Error"),
          result.error || tr("sendEmergencyFailed", "Failed to send emergency alert.")
        );
      }
    } catch (error) {
      console.error("Emergency alert error:", error);
      Alert.alert(
        tr("errorTitle", "Error"),
        tr("sendEmergencyTryAgain", "Failed to send emergency alert. Please try again.")
      );
    } finally {
      setIsProcessingAlert(false);
      setSelectedEmergency(null);
    }
  };

  // Handle admin chat - automatically connect to an admin
  const handleAdminChat = async () => {
    if (!hasJoinedCommunity || !profile?.community_id) {
      Alert.alert(
        tr("errorTitle", "Error"),
        tr("communityRequiredForAdminChat", "You must be part of a community to contact admin.")
      );
      return;
    }

    setOpenModal(false);
    
    try {
      // Get any admin from the community
      const admins = await getCommunityAdmins(profile.community_id);
      
      if (admins && admins.length > 0) {
        const admin = admins[0]; // Just pick the first admin
        navigation.push("messageScreen", {
          image: require("../assets/images/img14.png"), // Default admin image
          name: `${admin.first_name} ${admin.last_name} (Admin)`,
          key: "2",
          id: admin.id,
          memberId: admin.id,
          role: admin.role,
          isAdmin: true
        });
      } else {
        Alert.alert(
          tr("unavailableTitle", "Unavailable"),
          tr("noCommunityAdminAvailable", "No community admin is available for chat right now.")
        );
      }
    } catch (error) {
      console.error("Error getting admin for chat:", error);
      Alert.alert(
        tr("errorTitle", "Error"),
        tr("openAdminChatFailed", "Unable to open admin chat right now. Please try again.")
      );
    }
  };

  // Handle guard chat - automatically connect to a guard
  const handleGuardChat = async () => {
    if (!hasJoinedCommunity || !profile?.community_id) {
      Alert.alert(
        tr("errorTitle", "Error"),
        tr("communityRequiredForSecurityChat", "You must be part of a community to contact security.")
      );
      return;
    }

    setOpenModal(false);
    
    try {
      // Get any guard from the community
      const guards = await getAllGuards(profile.community_id);
      
      if (guards && guards.length > 0) {
        const guard = guards[0]; // Just pick the first guard
        navigation.push("messageScreen", {
          image: require("../assets/images/s2.png"), // Security guard image
          name: `${guard.first_name} ${guard.last_name} (Security)`,
          key: "2",
          id: guard.id,
          memberId: guard.id,
          role: "guard",
          isGuard: true
        });
      } else {
        Alert.alert(
          tr("unavailableTitle", "Unavailable"),
          tr("noSecurityGuardAvailable", "No security guard is available for chat right now.")
        );
      }
    } catch (error) {
      console.error("Error getting guard for chat:", error);
      Alert.alert(
        tr("errorTitle", "Error"),
        tr("openSecurityChatFailed", "Unable to open guard chat right now. Please try again.")
      );
    }
  };

  const renderItem = ({ item }) => {
    return (
      <TouchableWithoutFeedback
        onPress={() => handleEmergencyAlert(item.emergencyType)}
        disabled={isProcessingAlert}
      >
        <View
          style={{
            marginBottom: Default.fixPadding * 2,
            ...styles.commonBox,
            opacity: isProcessingAlert ? 0.6 : 1,
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
                        style={[styles.commonBox, isProcessingAlert && { opacity: 0.6 }]}
                        onPress={handleAdminChat}
                        disabled={isProcessingAlert}
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
                        style={[styles.commonBox, isProcessingAlert && { opacity: 0.6 }]}
                        onPress={handleGuardChat}
                        disabled={isProcessingAlert}
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

      {/* Emergency Alert Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showEmergencyModal}
        onRequestClose={() => setShowEmergencyModal(false)}
      >
        <TouchableOpacity
          style={styles.emergencyModalOverlay}
          activeOpacity={1}
          onPress={() => setShowEmergencyModal(false)}
        >
          <TouchableWithoutFeedback>
            <View style={styles.emergencyModalContainer}>
              <View style={styles.emergencyModalHeader}>
                <MaterialCommunityIcons
                  name="alert-circle"
                  size={60}
                  color={Colors.primary}
                />
                <Text style={styles.emergencyModalTitle}>
                  {selectedEmergencyInfo?.title || tr("emergencyAlertLabel", "Emergency Alert")}
                </Text>
                <Text style={styles.emergencyModalSubtitle}>
                  {tr("emergencyConfirmationTitle", "Emergency Alert Confirmation")}
                </Text>
              </View>

              <View style={styles.emergencyModalContent}>
                <Text style={styles.emergencyModalMessage}>
                  {tr("emergencyConfirmationPrompt", "Are you sure you want to send this emergency alert?")}
                </Text>
                
                <View style={styles.emergencyWarningBox}>
                  <MaterialCommunityIcons
                    name="information"
                    size={20}
                    color={Colors.primary}
                  />
                  <Text style={styles.emergencyWarningText}>
                    {tr(
                      "emergencyWarningAllRecipients",
                      "This will immediately notify all community members, admins, and security personnel."
                    )}
                  </Text>
                </View>

                <Text style={styles.emergencyDescriptionLabel}>
                  {tr("safetyInstructionsLabel", "Safety Instructions:")}
                </Text>
                <View style={styles.emergencyDescriptionContainer}>
                  <MaterialCommunityIcons
                    name="shield-check"
                    size={16}
                    color={Colors.primary}
                    style={styles.emergencyDescriptionIcon}
                  />
                  <Text style={styles.emergencyDescription}>
                    {selectedEmergencyInfo?.userMessage ||
                      tr("emergencyDefaultSafetyMessage", "Stay calm and wait for responders.")}
                  </Text>
                </View>
              </View>

              <View style={styles.emergencyModalButtons}>
                <TouchableOpacity
                  style={styles.emergencyCancelButton}
                  onPress={() => {
                    setShowEmergencyModal(false);
                    setSelectedEmergency(null);
                  }}
                  disabled={isProcessingAlert}
                >
                  <Text style={styles.emergencyCancelButtonText}>{tr("cancelButton", "Cancel")}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.emergencySendButton,
                    isProcessingAlert && { opacity: 0.6 }
                  ]}
                  onPress={sendEmergencyAlert}
                  disabled={isProcessingAlert}
                >
                  {isProcessingAlert ? (
                    <ActivityIndicator size="small" color={Colors.white} />
                  ) : (
                    <>
                      <MaterialCommunityIcons
                        name="alert-octagon"
                        size={18}
                        color={Colors.white}
                      />
                      <Text style={styles.emergencySendButtonText}>{tr("sendAlertButton", "Send Alert")}</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
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

  // Emergency Modal Styles
  emergencyModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Default.fixPadding * 2,
  },
  emergencyModalContainer: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    ...Default.shadow,
    elevation: 10,
  },
  emergencyModalHeader: {
    alignItems: 'center',
    paddingTop: Default.fixPadding * 3,
    paddingHorizontal: Default.fixPadding * 2,
    paddingBottom: Default.fixPadding * 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.extraLightGrey,
  },
  emergencyModalTitle: {
    ...Fonts.SemiBold20black,
    textAlign: 'center',
    marginTop: Default.fixPadding,
    marginBottom: Default.fixPadding * 0.5,
  },
  emergencyModalSubtitle: {
    ...Fonts.Medium14grey,
    textAlign: 'center',
  },
  emergencyModalContent: {
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 2,
  },
  emergencyModalMessage: {
    ...Fonts.Medium16black,
    textAlign: 'center',
    marginBottom: Default.fixPadding * 1.5,
  },
  emergencyWarningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.primary + '10',
    padding: Default.fixPadding * 1.2,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    marginBottom: Default.fixPadding * 1.5,
  },
  emergencyWarningText: {
    ...Fonts.Medium14black,
    marginLeft: Default.fixPadding,
    flex: 1,
    lineHeight: 20,
  },
  emergencyDescriptionLabel: {
    ...Fonts.SemiBold14black,
    marginBottom: Default.fixPadding * 0.8,
    marginTop: Default.fixPadding * 0.5,
  },
  emergencyDescriptionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.extraLightGrey,
    padding: Default.fixPadding * 1.2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.lightGrey,
  },
  emergencyDescriptionIcon: {
    marginRight: Default.fixPadding * 0.8,
    marginTop: 2,
  },
  emergencyDescription: {
    ...Fonts.Medium14black,
    lineHeight: 20,
    flex: 1,
    color: Colors.darkGrey,
  },
  emergencyModalButtons: {
    flexDirection: 'row',
    paddingHorizontal: Default.fixPadding * 2,
    paddingBottom: Default.fixPadding * 2,
    paddingTop: Default.fixPadding,
    borderTopWidth: 1,
    borderTopColor: Colors.extraLightGrey,
    gap: Default.fixPadding,
  },
  emergencyCancelButton: {
    flex: 1,
    paddingVertical: Default.fixPadding * 1.2,
    paddingHorizontal: Default.fixPadding * 1.5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.lightGrey,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyCancelButtonText: {
    ...Fonts.SemiBold16black,
    color: Colors.darkGrey,
  },
  emergencySendButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: Default.fixPadding * 1.2,
    paddingHorizontal: Default.fixPadding * 1.5,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Default.shadow,
    elevation: 3,
  },
  emergencySendButtonText: {
    ...Fonts.SemiBold16white,
    marginLeft: Default.fixPadding * 0.5,
  },
});
