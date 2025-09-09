import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  Dimensions,
  StyleSheet,
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
import { ms } from "react-native-size-matters/extend";
import DashedLine from "react-native-dashed-line";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AwesomeButton from "react-native-really-awesome-button";
import CameraModule from "../components/cameraModule";
import { Camera } from "expo-camera";
import SnackbarToast from "../components/snackbarToast";
import { useCreateComplaint, useCreateComplaintWithImage } from "../hooks/useSupabaseData";
import { useAuth } from "../contexts/AuthContext";

const { width } = Dimensions.get("window");

const AddComplaintScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();  
  const { user, profile } = useAuth();
  const createComplaint = useCreateComplaint();
  const createComplaintWithImage = useCreateComplaintWithImage();
  
  // Add a manual refresh mechanism for testing
  const [refreshProfile, setRefreshProfile] = useState(0);
  
  // Manual profile refresh function for testing
  const handleRefreshProfile = () => {
    console.log('Manually refreshing profile...');
    setRefreshProfile(prev => prev + 1);
  };

  // Debug: log current profile to see what's available
  useEffect(() => {
    console.log('Current user:', user?.id, user?.email);
    console.log('Current profile:', profile);
    console.log('Profile unit_id:', profile?.unit_id);
    console.log('Profile society_id:', profile?.society_id);
  }, [user, profile]);

  const isRtl = i18n.dir() == "rtl";
  function tr(key) {
    return t(`addComplaintScreen:${key}`);
  }  
  const backAction = () => {
    navigation.pop();
    return true;
  };
  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => {
      const subscription = BackHandler.addEventListener("hardwareBackPress", backAction); return () => subscription?.remove(); }
  }, []);
  const [pickedImages, setPickedImages] = useState([]);
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);

  const [camera, setShowCamera] = useState(false);

  const [cameraNotGranted, setCameraNotGranted] = useState(false);
  const onDismissCameraNotGranted = () => setCameraNotGranted(false);

  const cameraHandler = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status === "granted") {
      setShowCamera(true);
    } else {
      setCameraNotGranted(true);
    }
  };

  const tab = [
    {
      key: "1",
      name: tr("personal"),
      icon: Ionicons,
      iconName: "person-outline",
    },
    {
      key: "2",
      name: tr("community"),
      icon: MaterialCommunityIcons,
      iconName: "home-city-outline",
    },
  ];

  const [selectedTab, setSelectedTab] = useState(tr("personal"));

  const [complaintTypeModal, setComplaintTypeModal] = useState(false);  const typeList = [
    {
      key: "1",
      title: "Maintenance",
      description: "General maintenance and repair issues"
    },
    {
      key: "2", 
      title: "Plumbing",
      description: "Water leaks, pipe issues, drainage problems"
    },
    {
      key: "3",
      title: "Electrical",
      description: "Power issues, wiring, electrical appliances"
    },
    {
      key: "4",
      title: "Security",
      description: "Gate issues, guard concerns, safety matters"
    },
    {
      key: "5",
      title: "Sanitation",
      description: "Garbage collection, cleaning, pest control"
    },
    {
      key: "6",
      title: "Amenities",
      description: "Gym, pool, playground, clubhouse facilities"
    },
    {
      key: "7",
      title: "Parking",
      description: "Parking space issues, vehicle concerns"
    },
    {
      key: "8",
      title: "Noise Complaint",
      description: "Loud music, construction, disturbances"
    },
    {
      key: "9",
      title: "Technology",
      description: "Internet, WiFi, intercom, smart systems"
    },
  ];
  const [selectedType, setSelectedType] = useState("Maintenance");
  const [confirmComplaintType, setConfirmComplaintType] = useState();
  const renderItemType = ({ item }) => {
    const isSelected = selectedType === item.title;
    return (
      <TouchableOpacity
        onPress={() => setSelectedType(item.title)}
        style={{
          flex: 1,
          flexDirection: isRtl ? "row-reverse" : "row",
          alignItems: "flex-start",
          marginBottom: Default.fixPadding * 2.5,
          marginHorizontal: Default.fixPadding * 2.6,
        }}
      >
        <MaterialCommunityIcons
          name={isSelected ? "record-circle" : "circle-outline"}
          size={22}
          color={isSelected ? Colors.primary : Colors.grey}
          style={{ marginTop: 2 }}
        />
        <View
          style={{
            flex: 1,
            marginHorizontal: Default.fixPadding,
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              ...Fonts.Medium16black,
              overflow: "hidden",
            }}
          >
            {item.title}
          </Text>
          {item.description && (
            <Text
              numberOfLines={2}
              style={{
                ...Fonts.Medium12grey,
                overflow: "hidden",
                marginTop: Default.fixPadding * 0.2,
              }}
            >
              {item.description}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };
  const [briefComplaint, setBriefComplaint] = useState();
  const [complaintTitle, setComplaintTitle] = useState();

  const [submitComplaintModal, setSubmitComplaintModal] = useState(false);
    // Function to handle complaint submission
  const handleSubmitComplaint = async () => {
    if (!briefComplaint || !briefComplaint.trim()) {
      // Show error toast for empty description
      return;
    }
    
    if (!selectedType) {
      // Show error toast for no category selected
      return;
    }
      try {      // Validate required fields - but allow submission without unit_id for testing
      if (!profile?.unit_id) {
        console.warn('User profile missing unit_id - continuing with fallback');
        // Show info but continue with submission
        Alert.alert(
          'Unit Info Missing',
          'Your unit information is missing. The complaint will be submitted without unit assignment. Please contact admin to assign your unit.',
          [{ text: 'Continue', onPress: () => submitWithFallback() }]
        );
        return;
      }

      await submitComplaint();
    } catch (error) {
      console.error('Error submitting complaint:', error);
      // Handle error - could show an error toast
    }
  };

  // Function to submit complaint with fallback values for testing
  const submitWithFallback = async () => {    
    setIsSubmittingComplaint(true);
    try {      
      // Determine the correct profile ID to use
      const actualProfileId = profile?.unit_id ? profile.id : user?.id;
      console.log('Using profile ID for complaint:', actualProfileId, 'Profile has unit_id:', !!profile?.unit_id);
      
      const complaintData = {
        subject: complaintTitle?.trim() || `${selectedType} Issue`, // Use 'subject' not 'title'
        details: briefComplaint.trim(), // Use 'details' not 'description'
        category: selectedType,        
        complaint_type: selectedTab.toLowerCase(), // 'personal' or 'community'        
        priority: 'medium', // Default priority
        status: 'pending', // Use 'pending' instead of 'open'
        raised_by: actualProfileId, // Use the profile that has unit_id data
        unit_id: profile?.unit_id || null, // Allow null for testing
        // Add image URIs if available
        imageUris: pickedImages.length > 0 ? pickedImages : null
      };
      
      // Use the appropriate hook based on whether there are images
      if (pickedImages.length > 0) {
        console.log('Submitting complaint with images...');
        await createComplaintWithImage.mutateAsync(complaintData);
      } else {
        // Remove imageUris from data when using regular hook
        const { imageUris, ...dataWithoutImage } = complaintData;
        console.log('Submitting complaint without images...');
        await createComplaint.mutateAsync(dataWithoutImage);
      }
      
      setSubmitComplaintModal(true);
    } catch (error) {
      console.error('Error submitting complaint with fallback:', error);
      Alert.alert('Error', 'Failed to submit complaint. Please try again.');
    } finally {
      setIsSubmittingComplaint(false);
    }
  };

  // Function to submit complaint with full validation
  const submitComplaint = async () => {    
    setIsSubmittingComplaint(true);
    try {
      // Determine the correct profile ID to use
      const actualProfileId = profile?.unit_id ? profile.id : user?.id;
      console.log('Using profile ID for complaint:', actualProfileId, 'Profile has unit_id:', !!profile?.unit_id);
             
      const complaintData = {
        subject: complaintTitle?.trim() || `${selectedType} Issue`, // Use 'subject' not 'title'
        details: briefComplaint.trim(), // Use 'details' not 'description'
        category: selectedType,        
        complaint_type: selectedTab.toLowerCase(), // 'personal' or 'community'        
        priority: 'medium', // Default priority
        status: 'pending', // Use 'pending' instead of 'open'
        raised_by: actualProfileId, // Use the profile that has unit_id data
        unit_id: profile?.unit_id, // Essential for SuperAdmin tracking
        // Add image URIs if available
        imageUris: pickedImages.length > 0 ? pickedImages : null
      };
      
      console.log('Submitting complaint with data:', complaintData);
      
      // Use the appropriate hook based on whether there are images
      if (pickedImages.length > 0) {
        console.log('Submitting complaint with images...');
        await createComplaintWithImage.mutateAsync(complaintData);
      } else {
        // Remove imageUris from data when using regular hook
        const { imageUris, ...dataWithoutImage } = complaintData;
        console.log('Submitting complaint without images...');
        await createComplaint.mutateAsync(dataWithoutImage);
      }
      
      setSubmitComplaintModal(true);
    } catch (error) {
      console.error('Error submitting complaint:', error);
      Alert.alert('Error', 'Failed to submit complaint. Please try again.');
    } finally {
      setIsSubmittingComplaint(false);
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
          {tr("addComplaint")}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets={true}
      >
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: Default.fixPadding * 2,
            marginHorizontal: Default.fixPadding * 2,
          }}
        >
          <TouchableOpacity
            onPress={() => cameraHandler()}
            style={{
              justifyContent: "center",
              alignItems: "center",
              width: ms(114),
              height: ms(114),
              borderRadius: 5,
              backgroundColor: Colors.concrete,
            }}
          >
            <Ionicons
              name="camera-outline"
              size={28}
              color={Colors.primary}
            />
          </TouchableOpacity>

          {camera && (
            <CameraModule
              showModal={camera}
              setShowCamera={() => setShowCamera(false)}
              setPickedImage={(result) => {
                // Add new image to the array
                setPickedImages(prev => [...prev, result.uri]);
              }}
              closeBottomSheet={() => setShowCamera()}
            />
          )}

          <Text
            style={{
              ...Fonts.SemiBold16black,
              marginTop: Default.fixPadding * 2,
            }}
          >
            {tr("attachPhoto")}
          </Text>

          {/* Display captured images below the camera */}
          {pickedImages.length > 0 && (
            <View style={{
              marginTop: Default.fixPadding * 2,
              width: "100%",
            }}>
              <View style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: Default.fixPadding,
              }}>
                <Text
                  style={{
                    ...Fonts.Medium14black,
                    textAlign: "center",
                  }}
                >
                  Attached Images ({pickedImages.length})
                </Text>
                <TouchableOpacity
                  onPress={() => setPickedImages([])}
                  style={{
                    backgroundColor: Colors.lightGrey,
                    paddingHorizontal: Default.fixPadding,
                    paddingVertical: Default.fixPadding * 0.5,
                    borderRadius: 5,
                  }}
                >
                  <Text style={{ ...Fonts.Medium12black }}>
                    Clear All
                  </Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: Default.fixPadding,
                }}
              >
                {pickedImages.map((imageUri, index) => (
                  <View
                    key={index}
                    style={{
                      marginRight: Default.fixPadding,
                      position: "relative",
                    }}
                  >
                    <Image
                      source={{ uri: imageUri }}
                      style={{
                        width: ms(80),
                        height: ms(80),
                        borderRadius: 5,
                        resizeMode: "cover",
                      }}
                    />
                    {/* Remove button */}
                    <TouchableOpacity
                      onPress={() => {
                        setPickedImages(prev => prev.filter((_, i) => i !== index));
                      }}
                      style={{
                        position: "absolute",
                        top: -5,
                        right: -5,
                        backgroundColor: Colors.red,
                        borderRadius: 10,
                        width: 20,
                        height: 20,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Ionicons
                        name="close"
                        size={12}
                        color={Colors.white}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        <View
          style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            alignItems: "center",
            marginVertical: Default.fixPadding * 3,
            marginHorizontal: Default.fixPadding,
          }}
        >
          {tab.map((item) => {
            const isSelected = selectedTab === item.name;
            return (
              <TouchableOpacity
                key={item.key}
                onPress={() => setSelectedTab(item.name)}
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  backgroundColor: isSelected ? Colors.primary : Colors.white,
                  ...styles.tabTouchOpacity,
                }}
              >
                <item.icon
                  name={item.iconName}
                  size={24}
                  color={isSelected ? Colors.white : Colors.black}
                />
                <Text
                  numberOfLines={1}
                  style={{
                    ...(isSelected
                      ? Fonts.SemiBold16white
                      : Fonts.SemiBold16black),
                    marginLeft: isRtl ? 0 : Default.fixPadding * 0.5,
                    marginRight: isRtl ? Default.fixPadding * 0.5 : 0,
                    maxWidth: 110,
                  }}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ marginHorizontal: Default.fixPadding * 2 }}>          <Text
            style={{
              ...Fonts.Medium16black,
              textAlign: isRtl ? "right" : "left",
            }}
          >
            {"Complaint Type"}
          </Text>          <TouchableOpacity
            onPress={() => setComplaintTypeModal(true)}
            style={{
              marginBottom: Default.fixPadding * 3,
              ...styles.textInputView,
              justifyContent: "flex-start",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                ...(confirmComplaintType
                  ? Fonts.Medium15black
                  : Fonts.Medium15grey),
                textAlign: isRtl ? "right" : "left",
                alignSelf: "flex-start",
              }}
            >{confirmComplaintType
                ? confirmComplaintType
                : "Select Complaint Type"}
            </Text>          </TouchableOpacity>

          <Text
            style={{
              ...Fonts.Medium16black,
              textAlign: isRtl ? "right" : "left",
              marginTop: Default.fixPadding * 2,
            }}          >
            {"Complaint Title"}
          </Text>
          <View
            style={{
              marginBottom: Default.fixPadding * 2,
              ...styles.textInputView,
            }}
          >
            <TextInput
              value={complaintTitle}
              onChangeText={setComplaintTitle}
              placeholder={"Enter a brief title for your complaint"}
              placeholderTextColor={Colors.grey}
              selectionColor={Colors.primary}
              style={{
                ...Fonts.Medium15black,
                textAlign: isRtl ? "right" : "left",
                paddingVertical: Default.fixPadding,
              }}
            />
          </View>

          <Text
            style={{
              ...Fonts.Medium16black,
              textAlign: isRtl ? "right" : "left",
            }}
          >
            {tr("briefYourComplaint")}
          </Text>
          <View
            style={{
              marginBottom: Default.fixPadding * 2,
              ...styles.textInputView,
            }}
          >
            <TextInput
              multiline={true}
              numberOfLines={7}
              textAlignVertical="top"
              value={briefComplaint}
              onChangeText={setBriefComplaint}
              placeholder={tr("briefYourComplaint")}
              placeholderTextColor={Colors.grey}
              selectionColor={Colors.primary}
              style={{
                ...Fonts.Medium15black,
                height: ms(126),
                textAlign: isRtl ? "right" : "left",
              }}
            />
          </View>
        </View>
      </ScrollView>
      <View
        style={{
          margin: Default.fixPadding * 2,
        }}
      >        <AwesomeButton
          height={50}
          onPress={handleSubmitComplaint}
          raiseLevel={1}
          stretch={true}
          borderRadius={10}
          backgroundShadow={Colors.primary}
          backgroundDarker={Colors.primary}
          backgroundColor={Colors.primary}
          disabled={isSubmittingComplaint}
        >
          <Text style={{ ...Fonts.SemiBold18white }}>
            {isSubmittingComplaint ? (tr("submittingComplaint") || "Submitting...") : tr("submitComplaint")}
          </Text>
        </AwesomeButton>
      </View>

      <SnackbarToast
        visible={cameraNotGranted}
        onDismiss={onDismissCameraNotGranted}
        title={tr("deny")}
      />

      <Modal
        transparent={true}
        animationType="fade"
        visible={complaintTypeModal}
        onRequestClose={() => setComplaintTypeModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPressOut={() => setComplaintTypeModal(false)}
          style={{ flex: 1 }}
        >          <View style={styles.mainModalView}>
            <TouchableOpacity activeOpacity={1} style={styles.subModalView}>
              <Text
                style={{
                  ...Fonts.Medium18primary,
                  textAlign: "center",
                  marginVertical: Default.fixPadding * 1.6,
                }}
              >
                {"Select Complaint Category"}
              </Text>
              <DashedLine
                dashGap={2.5}
                dashLength={2.5}
                dashThickness={1.5}
                dashColor={Colors.grey}
              />

              <ScrollView
                style={{ maxHeight: ms(300) }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: Default.fixPadding * 2.5 }}
              >
                {typeList.map((item) => (
                  <View key={item.key}>
                    {renderItemType({ item })}
                  </View>
                ))}
              </ScrollView>

              <View
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  alignItems: "center",
                  marginBottom: Default.fixPadding * 2.6,
                  marginHorizontal: Default.fixPadding * 2.6,
                }}
              >
                <TouchableOpacity
                  onPress={() => setComplaintTypeModal(false)}
                  style={{
                    backgroundColor: Colors.white,
                    ...styles.cancelOkBtn,
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={{ ...Fonts.SemiBold18black, overflow: "hidden" }}
                  >
                    {tr("cancel")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setComplaintTypeModal(false);
                    setConfirmComplaintType(selectedType);
                  }}
                  style={{
                    marginLeft: isRtl ? 0 : Default.fixPadding * 1.5,
                    marginRight: isRtl ? Default.fixPadding * 1.5 : 0,
                    backgroundColor: Colors.primary,
                    ...styles.cancelOkBtn,
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={{ ...Fonts.SemiBold18white, overflow: "hidden" }}
                  >
                    {tr("okay")}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        transparent={true}
        animationType="slide"
        visible={submitComplaintModal}
        onRequestClose={() => setSubmitComplaintModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPressOut={() => setSubmitComplaintModal(false)}
          style={{ flex: 1 }}
        >
          <View style={styles.mainModalView}>
            <TouchableOpacity
              activeOpacity={1}
              style={{
                justifyContent: "center",
                alignItems: "center",
                width: width * 0.6,
                padding: Default.fixPadding * 2,
                borderRadius: 10,
                backgroundColor: Colors.white,
                ...Default.shadow,
              }}
            >
              <Text style={{ ...Fonts.SemiBold16black }}>
                {tr("complaintRaised")}
              </Text>
              <Text
                style={{
                  ...Fonts.SemiBold14grey,
                  textAlign: "center",
                  marginTop: Default.fixPadding,
                }}
              >
                {tr("adminWill")}
              </Text>

              <TouchableOpacity
                onPress={() => {
                  // Reset form fields
                  setPickedImages([]);
                  setComplaintTitle('');
                  setBriefComplaint('');
                  setConfirmComplaintType('');
                  setSelectedType('Maintenance');
                  setSelectedTab(tr("personal"));
                  
                  setSubmitComplaintModal(false);
                  // Navigate back to complaints screen instead of home
                  navigation.navigate("complaintsScreen");
                }}
                style={styles.okayButton}
              >
                <Text
                  numberOfLines={1}
                  style={{ ...Fonts.SemiBold16white, overflow: "hidden" }}
                >
                  {tr("okay")}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default AddComplaintScreen;

const styles = StyleSheet.create({
  tabTouchOpacity: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Default.fixPadding * 1.1,
    marginHorizontal: Default.fixPadding,
    borderRadius: 5,
    ...Default.shadow,
  },
  textInputView: {
    marginTop: Default.fixPadding * 0.5,
    paddingHorizontal: Default.fixPadding * 1.4,
    paddingVertical: Default.fixPadding * 1.4,
    borderRadius: 10,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  mainModalView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.transparentBlack,
  },  subModalView: {
    width: width * 0.85,
    maxHeight: width * 1.1, // Limit height to make it more responsive
    borderRadius: 10,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  cancelOkBtn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Default.fixPadding * 1.4,
    borderRadius: 10,
    ...Default.shadow,
  },
  okayButton: {
    justifyContent: "center",
    alignItems: "center",
    width: ms(145),
    padding: Default.fixPadding,
    marginTop: Default.fixPadding * 2,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    ...Default.shadow,
  },
});
