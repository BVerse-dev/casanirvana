import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  Dimensions,
  Image,
  FlatList,
  ScrollView,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MyStatusBar from "../components/myStatusBar";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import CameraModule from "../components/cameraModule";
import { Camera } from "expo-camera";
import SnackbarToast from "../components/snackbarToast";
import { useCreateMaintenanceRequest, useCreateMaintenanceRequestWithImages } from "../hooks/useSupabaseData";
import { useHasJoinedCommunity } from "../hooks/useCommunityData";

const { width } = Dimensions.get("window");

const AddMaintenanceRequestScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();  
  // Use the SAME authentication pattern as working screens
  const { profile } = useHasJoinedCommunity();
  const createMaintenanceRequest = useCreateMaintenanceRequest();
  const createMaintenanceRequestWithImages = useCreateMaintenanceRequestWithImages();

  const isRtl = i18n.dir() === "rtl";

  function tr(key) {
    return t(`addMaintenanceRequestScreen:${key}`);
  }

  const [pickedImages, setPickedImages] = useState([]);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [showSubmissionSuccessModal, setShowSubmissionSuccessModal] = useState(false);
  const [camera, setShowCamera] = useState(false);
  const [cameraNotGranted, setCameraNotGranted] = useState(false);

  useEffect(() => {
    const backAction = () => {
      navigation.pop();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [navigation]);

  const [selectedTab, setSelectedTab] = useState(tr("personal"));

  const [maintenanceTypeModal, setMaintenanceTypeModal] = useState(false);
  
  const typeList = [
    {
      key: "1",
      type: tr("plumbing"),
    },
    {
      key: "2", 
      type: tr("electrical"),
    },
    {
      key: "3",
      type: tr("carpentry"),
    },
    {
      key: "4",
      type: tr("painting"),
    },
    {
      key: "5",
      type: tr("appliance"),
    },
    {
      key: "6",
      type: tr("hvac"),
    },
    {
      key: "7",
      type: tr("flooring"),
    },
    {
      key: "8",
      type: tr("roofing"),
    },
    {
      key: "9",
      type: tr("cleaning"),
    },
    {
      key: "10",
      type: tr("landscaping"),
    },
    {
      key: "11",
      type: tr("security"),
    },
    {
      key: "12",
      type: tr("other"),
    },
  ];

  const [selectedType, setSelectedType] = useState("Plumbing");
  const [confirmMaintenanceType, setConfirmMaintenanceType] = useState();

  const priorityList = [
    {
      key: "1",
      priority: tr("low"),
      color: Colors.green,
    },
    {
      key: "2",
      priority: tr("medium"),
      color: Colors.orange,
    },
    {
      key: "3",
      priority: tr("high"),
      color: Colors.red,
    },
    {
      key: "4",
      priority: tr("urgent"),
      color: Colors.darkRed,
    },
  ];

  const [selectedPriority, setSelectedPriority] = useState("Medium");
  const [priorityModal, setPriorityModal] = useState(false);

  const tabList = [
    {
      key: "1",
      title: tr("personal"),
      icon: Ionicons,
      iconName: "person-outline",
    },
    {
      key: "2",
      title: tr("common"),
      icon: MaterialCommunityIcons,
      iconName: "home-city-outline",
    },
  ];

  const [briefRequest, setBriefRequest] = useState("");
  const [requestTitle, setRequestTitle] = useState("");

  const [submitRequestModal, setSubmitRequestModal] = useState(false);

  const resetMaintenanceForm = () => {
    setRequestTitle("");
    setBriefRequest("");
    setPickedImages([]);
    setSelectedType("Plumbing");
    setSelectedPriority("Medium");
    setSelectedTab(tr("personal"));
  };

  const handleImageUpload = (imageUri) => {
    if (pickedImages.length < 5) {
      setPickedImages((prev) => [...prev, imageUri]);
      return;
    }
    Alert.alert("Limit Reached", "You can only upload up to 5 images.");
  };

  const cameraHandler = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status === "granted") {
        setShowCamera(true);
      } else {
        setCameraNotGranted(true);
      }
    } catch (error) {
      console.error("Camera permission error:", error);
      setCameraNotGranted(true);
    }
  };

  const handleSubmitMaintenanceRequest = async () => {
    if (isSubmittingRequest) {
      return;
    }

    if (!requestTitle?.trim() || !briefRequest?.trim()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (!profile?.id) {
      Alert.alert("Error", "User profile not found. Please try again.");
      return;
    }

    if (!profile?.unit_id) {
      Alert.alert(
        "Unit Assignment Required",
        "Your account is missing a unit assignment. Please contact management before submitting a maintenance request."
      );
      return;
    }

    const handleSuccessfulSubmission = () => {
      setSubmitRequestModal(false);
      setShowSubmissionSuccessModal(true);
    };

    try {
      const requestData = {
        title: requestTitle.trim(),
        description: briefRequest.trim(),
        request_type: selectedType,
        priority: selectedPriority.toLowerCase(),
        requested_by: profile.id, // Use profile.id since that's what's stored in database
        status: 'pending',
        unit_id: profile.unit_id,
        // created_at will be set automatically by the database
      };
      setIsSubmittingRequest(true);
      if (pickedImages.length > 0) {
        await createMaintenanceRequestWithImages.mutateAsync({
          ...requestData,
          imageUris: pickedImages,
          storageOwnerId: profile.user_id || profile.id,
        });
      } else {
        await createMaintenanceRequest.mutateAsync(requestData);
      }
      handleSuccessfulSubmission();

    } catch (error) {
      // More specific error message
      let errorMessage = "Failed to submit maintenance request";
      if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert("Submission Error", errorMessage + "\n\nPlease check your connection and try again.");
    } finally {
      setIsSubmittingRequest(false);
    }
  };

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
          {tr("requestMaintenance")}
        </Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets={true}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic"
      >
        <View
          style={{
            marginHorizontal: Default.fixPadding * 2,
            marginTop: Default.fixPadding * 1.5,
          }}
        >
          {/* Request Type Selection */}
          <Text
            style={{
              ...Fonts.SemiBold16black,
              textAlign: isRtl ? "right" : "left",
            }}
          >
            {tr("requestType")}
          </Text>

          <TouchableOpacity
            onPress={() => setMaintenanceTypeModal(true)}
            style={{
              ...Default.shadow,
              borderRadius: 10,
              backgroundColor: Colors.white,
              paddingVertical: Default.fixPadding * 1.2,
              paddingHorizontal: Default.fixPadding * 1.5,
              marginTop: Default.fixPadding,
              flexDirection: isRtl ? "row-reverse" : "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                ...Fonts.Medium16black,
                flex: 1,
                overflow: "hidden",
                textAlign: isRtl ? "right" : "left",
                marginHorizontal: Default.fixPadding,
              }}
            >
              {selectedType || tr("selectType")}
            </Text>
            <Ionicons
              name={isRtl ? "chevron-back-outline" : "chevron-forward-outline"}
              size={20}
              color={Colors.grey}
            />
          </TouchableOpacity>

          {/* Priority Selection */}
          <Text
            style={{
              ...Fonts.SemiBold16black,
              textAlign: isRtl ? "right" : "left",
              marginTop: Default.fixPadding * 2,
            }}
          >
            {tr("priority")}
          </Text>

          <TouchableOpacity
            onPress={() => setPriorityModal(true)}
            style={{
              ...Default.shadow,
              borderRadius: 10,
              backgroundColor: Colors.white,
              paddingVertical: Default.fixPadding * 1.2,
              paddingHorizontal: Default.fixPadding * 1.5,
              marginTop: Default.fixPadding,
              flexDirection: isRtl ? "row-reverse" : "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                ...Fonts.Medium16black,
                flex: 1,
                overflow: "hidden",
                textAlign: isRtl ? "right" : "left",
                marginHorizontal: Default.fixPadding,
              }}
            >
              {selectedPriority || tr("selectPriority")}
            </Text>
            <Ionicons
              name={isRtl ? "chevron-back-outline" : "chevron-forward-outline"}
              size={20}
              color={Colors.grey}
            />
          </TouchableOpacity>

          {/* Category Selection */}
          <Text
            style={{
              ...Fonts.SemiBold16black,
              textAlign: isRtl ? "right" : "left",
              marginTop: Default.fixPadding * 2,
            }}
          >
            {tr("category")}
          </Text>

          <View
            style={{
              marginTop: Default.fixPadding,
              flexDirection: isRtl ? "row-reverse" : "row",
            }}
          >
            {tabList.map((item, index) => {
              const isSelected = item.title === selectedTab;
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedTab(item.title)}
                  style={{
                    flex: 1,
                    marginHorizontal: Default.fixPadding * 0.3,
                    paddingVertical: Default.fixPadding,
                    borderRadius: 5,
                    backgroundColor: isSelected ? Colors.primary : Colors.white,
                    ...Default.shadow,
                    flexDirection: isRtl ? "row-reverse" : "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <item.icon
                    name={item.iconName}
                    size={20}
                    color={isSelected ? Colors.white : Colors.black}
                  />
                  <Text
                    numberOfLines={1}
                    style={{
                      ...(isSelected
                        ? Fonts.SemiBold16white
                        : Fonts.SemiBold16grey),
                      overflow: "hidden",
                      textAlign: "center",
                      marginLeft: isRtl ? 0 : Default.fixPadding * 0.5,
                      marginRight: isRtl ? Default.fixPadding * 0.5 : 0,
                    }}
                  >
                    {item.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Request Title */}
          <Text
            style={{
              ...Fonts.SemiBold16black,
              textAlign: isRtl ? "right" : "left",
              marginTop: Default.fixPadding * 2,
            }}
          >
            {tr("requestTitle")}
          </Text>
          <View
            style={{
              ...Default.shadow,
              borderRadius: 10,
              backgroundColor: Colors.white,
              paddingHorizontal: Default.fixPadding * 1.5,
              marginTop: Default.fixPadding,
            }}
          >
            <TextInput
              placeholder={tr("enterTitle")}
              placeholderTextColor={Colors.grey}
              selectionColor={Colors.primary}
              value={requestTitle}
              onChangeText={setRequestTitle}
              style={{
                ...Fonts.Medium16black,
                paddingVertical: Default.fixPadding * 1.2,
                textAlign: isRtl ? "right" : "left",
              }}
            />
          </View>

          {/* Request Description */}
          <Text
            style={{
              ...Fonts.SemiBold16black,
              textAlign: isRtl ? "right" : "left",
              marginTop: Default.fixPadding * 2,
            }}
          >
            {tr("description")}
          </Text>
          <View
            style={{
              ...Default.shadow,
              borderRadius: 10,
              backgroundColor: Colors.white,
              paddingHorizontal: Default.fixPadding * 1.5,
              marginTop: Default.fixPadding,
            }}
          >
            <TextInput
              placeholder={tr("enterDescription")}
              placeholderTextColor={Colors.grey}
              selectionColor={Colors.primary}
              value={briefRequest}
              onChangeText={setBriefRequest}
              multiline={true}
              style={{
                ...Fonts.Medium16black,
                paddingVertical: Default.fixPadding * 1.2,
                textAlign: isRtl ? "right" : "left",
                height: 120,
                textAlignVertical: "top",
              }}
            />
          </View>

          {/* Image Upload Section */}
          <Text
            style={{
              ...Fonts.SemiBold16black,
              textAlign: isRtl ? "right" : "left",
              marginTop: Default.fixPadding * 1.5,
            }}
          >
            {tr("attachImages")}
          </Text>

          <View
            style={{
              ...Default.shadow,
              borderRadius: 10,
              backgroundColor: Colors.white,
              marginTop: Default.fixPadding,
              flexDirection: isRtl ? "row-reverse" : "row",
              flexWrap: "wrap",
              padding: Default.fixPadding,
            }}
          >
            {pickedImages.map((image, index) => (
              <View
                key={index}
                style={{
                  width: width * 0.25,
                  height: width * 0.25,
                  borderRadius: 10,
                  marginRight: isRtl ? 0 : Default.fixPadding,
                  marginLeft: isRtl ? Default.fixPadding : 0,
                  marginBottom: Default.fixPadding,
                }}
              >
                <Image
                  source={{ uri: image }}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 10,
                  }}
                />
                <TouchableOpacity
                  onPress={() => {
                    setPickedImages((prev) => prev.filter((_, i) => i !== index));
                  }}
                  style={{
                    position: "absolute",
                    top: -5,
                    right: -5,
                    backgroundColor: Colors.primary,
                    borderRadius: 10,
                    width: 20,
                    height: 20,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="close" size={14} color={Colors.white} />
                </TouchableOpacity>
              </View>
            ))}

            {pickedImages.length < 5 && (
              <TouchableOpacity
                onPress={cameraHandler}
                style={{
                  width: width * 0.25,
                  height: width * 0.25,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderStyle: "dashed",
                  borderColor: Colors.grey,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: isRtl ? 0 : Default.fixPadding,
                  marginLeft: isRtl ? Default.fixPadding : 0,
                  marginBottom: Default.fixPadding,
                }}
              >
                <MaterialCommunityIcons
                  name="camera-plus"
                  size={30}
                  color={Colors.grey}
                />
                <Text
                  style={{
                    ...Fonts.Medium12grey,
                    textAlign: "center",
                    marginTop: Default.fixPadding * 0.3,
                  }}
                >
                  {tr("addImage")}
                </Text>
              </TouchableOpacity>
            )}
          </View>

        </View>
      </ScrollView>
      
      {/* Floating Submit Button */}
      <View
        style={{
          margin: Default.fixPadding * 2,
        }}
      >
        <TouchableOpacity
          onPress={() => setSubmitRequestModal(true)}
          disabled={isSubmittingRequest}
          activeOpacity={0.85}
          style={{
            height: 50,
            borderRadius: 10,
            backgroundColor: isSubmittingRequest ? Colors.grey : Colors.primary,
            alignItems: "center",
            justifyContent: "center",
            ...Default.shadow,
          }}
        >
          <Text style={{ ...Fonts.SemiBold18white }}>
            {tr("submitRequest")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Maintenance Type Modal */}
      <Modal animationType="fade" transparent={true} visible={maintenanceTypeModal}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setMaintenanceTypeModal(false)}
          style={{ flex: 1, backgroundColor: Colors.transparentBlack }}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: width * 0.8,
                backgroundColor: Colors.white,
                borderRadius: 10,
                paddingHorizontal: Default.fixPadding * 2,
                paddingTop: Default.fixPadding * 2,
              }}
            >
              <Text
                style={{
                  ...Fonts.SemiBold18black,
                  textAlign: "center",
                  marginBottom: Default.fixPadding,
                }}
              >
                {tr("selectMaintenanceType")}
              </Text>

              <FlatList
                data={typeList}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item.key}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedType(item.type);
                      setConfirmMaintenanceType(item.type);
                    }}
                    style={{
                      paddingVertical: Default.fixPadding,
                      flexDirection: isRtl ? "row-reverse" : "row",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: Colors.primary,
                        alignItems: "center",
                        justifyContent: "center",
                        marginHorizontal: Default.fixPadding,
                      }}
                    >
                      {confirmMaintenanceType === item.type && (
                        <View
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: Colors.primary,
                          }}
                        />
                      )}
                    </View>
                    <Text
                      style={{
                        ...Fonts.Medium16black,
                        textAlign: isRtl ? "right" : "left",
                        flex: 1,
                      }}
                    >
                      {item.type}
                    </Text>
                  </TouchableOpacity>
                )}
              />

              <View
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  marginTop: Default.fixPadding,
                  marginBottom: Default.fixPadding * 2,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setMaintenanceTypeModal(false);
                    setConfirmMaintenanceType();
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: Colors.lightGrey,
                    borderRadius: 5,
                    justifyContent: "center",
                    alignItems: "center",
                    paddingVertical: Default.fixPadding,
                    marginHorizontal: Default.fixPadding * 0.5,
                  }}
                >
                  <Text style={{ ...Fonts.SemiBold16black }}>
                    {tr("cancel")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setMaintenanceTypeModal(false);
                    if (confirmMaintenanceType) {
                      setSelectedType(confirmMaintenanceType);
                    }
                    setConfirmMaintenanceType();
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: Colors.primary,
                    borderRadius: 5,
                    justifyContent: "center",
                    alignItems: "center",
                    paddingVertical: Default.fixPadding,
                    marginHorizontal: Default.fixPadding * 0.5,
                  }}
                >
                  <Text style={{ ...Fonts.SemiBold16white }}>
                    {tr("confirm")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Priority Modal */}
      <Modal animationType="fade" transparent={true} visible={priorityModal}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setPriorityModal(false)}
          style={{ flex: 1, backgroundColor: Colors.transparentBlack }}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: width * 0.8,
                backgroundColor: Colors.white,
                borderRadius: 10,
                paddingHorizontal: Default.fixPadding * 2,
                paddingTop: Default.fixPadding * 2,
              }}
            >
              <Text
                style={{
                  ...Fonts.SemiBold18black,
                  textAlign: "center",
                  marginBottom: Default.fixPadding,
                }}
              >
                {tr("selectPriority")}
              </Text>

              <FlatList
                data={priorityList}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item.key}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedPriority(item.priority);
                      setPriorityModal(false);
                    }}
                    style={{
                      paddingVertical: Default.fixPadding,
                      flexDirection: isRtl ? "row-reverse" : "row",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        backgroundColor: item.color,
                        marginHorizontal: Default.fixPadding,
                      }}
                    />
                    <Text
                      style={{
                        ...Fonts.Medium16black,
                        textAlign: isRtl ? "right" : "left",
                        flex: 1,
                      }}
                    >
                      {item.priority}
                    </Text>
                  </TouchableOpacity>
                )}
              />

              <View style={{ marginBottom: Default.fixPadding * 2 }}>
                <TouchableOpacity
                  onPress={() => setPriorityModal(false)}
                  style={{
                    backgroundColor: Colors.lightGrey,
                    borderRadius: 5,
                    justifyContent: "center",
                    alignItems: "center",
                    paddingVertical: Default.fixPadding,
                    marginTop: Default.fixPadding,
                  }}
                >
                  <Text style={{ ...Fonts.SemiBold16black }}>
                    {tr("cancel")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Submit Confirmation Modal */}
      <Modal animationType="fade" transparent={true} visible={submitRequestModal}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            if (!isSubmittingRequest) {
              setSubmitRequestModal(false);
            }
          }}
          style={{ flex: 1, backgroundColor: Colors.transparentBlack }}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: width * 0.8,
                backgroundColor: Colors.white,
                borderRadius: 10,
                paddingHorizontal: Default.fixPadding * 2,
                paddingVertical: Default.fixPadding * 2,
              }}
            >
              <Text
                style={{
                  ...Fonts.SemiBold18black,
                  textAlign: "center",
                  marginBottom: Default.fixPadding,
                }}
              >
                {tr("confirmSubmission")}
              </Text>

              <Text
                style={{
                  ...Fonts.Medium14grey,
                  textAlign: "center",
                  marginBottom: Default.fixPadding * 2,
                }}
              >
                {tr("confirmSubmissionMessage")}
              </Text>

              <View
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  marginTop: Default.fixPadding,
                }}
              >
                <TouchableOpacity
                  onPress={() => setSubmitRequestModal(false)}
                  disabled={isSubmittingRequest}
                  style={{
                    flex: 1,
                    backgroundColor: Colors.lightGrey,
                    borderRadius: 5,
                    justifyContent: "center",
                    alignItems: "center",
                    paddingVertical: Default.fixPadding,
                    marginHorizontal: Default.fixPadding * 0.5,
                  }}
                >
                  <Text style={{ ...Fonts.SemiBold16black }}>
                    {tr("cancel")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSubmitMaintenanceRequest}
                  disabled={isSubmittingRequest}
                  style={{
                    flex: 1,
                    backgroundColor: isSubmittingRequest ? Colors.grey : Colors.primary,
                    borderRadius: 5,
                    justifyContent: "center",
                    alignItems: "center",
                    paddingVertical: Default.fixPadding,
                    marginHorizontal: Default.fixPadding * 0.5,
                  }}
                >
                  <Text style={{ ...Fonts.SemiBold16white }}>
                    {isSubmittingRequest ? tr("submitting") : tr("submit")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Submission Success Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSubmissionSuccessModal}
        onRequestClose={() => setShowSubmissionSuccessModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowSubmissionSuccessModal(false)}
          style={{ flex: 1, backgroundColor: Colors.transparentBlack }}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: width * 0.82,
                backgroundColor: Colors.white,
                borderRadius: 12,
                paddingHorizontal: Default.fixPadding * 2,
                paddingVertical: Default.fixPadding * 2,
              }}
            >
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: Default.fixPadding,
                }}
              >
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    backgroundColor: Colors.green,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="checkmark" size={30} color={Colors.white} />
                </View>
              </View>

              <Text
                style={{
                  ...Fonts.SemiBold18black,
                  textAlign: "center",
                  marginBottom: Default.fixPadding * 0.6,
                }}
              >
                Request Submitted
              </Text>

              <Text
                style={{
                  ...Fonts.Medium14grey,
                  textAlign: "center",
                  marginBottom: Default.fixPadding * 1.8,
                }}
              >
                Your maintenance request was submitted successfully.
              </Text>

              <View
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    resetMaintenanceForm();
                    setShowSubmissionSuccessModal(false);
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: Colors.lightGrey,
                    borderRadius: 6,
                    justifyContent: "center",
                    alignItems: "center",
                    paddingVertical: Default.fixPadding,
                    marginHorizontal: Default.fixPadding * 0.4,
                  }}
                >
                  <Text style={{ ...Fonts.SemiBold16black }}>
                    New Request
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    resetMaintenanceForm();
                    setShowSubmissionSuccessModal(false);
                    navigation.navigate("MaintenanceRequestsScreen");
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: Colors.primary,
                    borderRadius: 6,
                    justifyContent: "center",
                    alignItems: "center",
                    paddingVertical: Default.fixPadding,
                    marginHorizontal: Default.fixPadding * 0.4,
                  }}
                >
                  <Text style={{ ...Fonts.SemiBold16white }}>
                    Back to Requests
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Camera Module */}
      {camera && (
        <CameraModule
          showModal={camera}
          setShowCamera={() => setShowCamera(false)}
          setPickedImage={(result) => {
            handleImageUpload(result.uri);
          }}
          closeBottomSheet={() => setShowCamera(false)}
        />
      )}

      {/* Camera Permission Alert */}
      <SnackbarToast
        visible={cameraNotGranted}
        onDismiss={() => setCameraNotGranted(false)}
        title={tr("cameraPermissionDenied")}
      />

    </View>
  );
};

export default AddMaintenanceRequestScreen;
