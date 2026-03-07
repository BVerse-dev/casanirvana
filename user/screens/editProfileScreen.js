import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  StyleSheet,
  ScrollView,
  TextInput,
  Switch,
  Alert,
  Modal,
  FlatList,
  Dimensions,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MyStatusBar from "../components/myStatusBar";
import SnackbarToast from "../components/snackbarToast";
import CameraModule from "../components/cameraModule";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import AwesomeButton from "react-native-really-awesome-button";
import AddImageBottomSheet from "../components/addImageBottomSheet";
import DashedLine from "react-native-dashed-line";
import FromToCalendarPicker from "../components/fromToCalendarPicker";
import AppAvatar from "../components/AppAvatar";
import { useAuth } from "../contexts/AuthContext";
import { useUpdateProfile } from "../hooks/useSupabaseData";
import { supabase } from "../utils/supabase";

const { width, height } = Dimensions.get("window");

const EditProfileScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { profile } = useAuth();
  const updateProfileMutation = useUpdateProfile();

  const isRtl = i18n.dir() === "rtl";

  function tr(key) {
    return t(`editProfileScreen:${key}`);
  }
  const backAction = useCallback(() => {
    navigation.pop();
    return true;
  }, [navigation]);
  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => subscription.remove();
  }, [backAction]);

  // Basic profile information
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("1990-05-15");
  const [gender, setGender] = useState("male");
  const [alternativeEmail, setAlternativeEmail] = useState("");
  
  // Household information
  const [totalFamilyMembers, setTotalFamilyMembers] = useState(2);
  const [hasPets, setHasPets] = useState(false);
  const [vehicleCount, setVehicleCount] = useState(1);
  
  // Privacy settings
  const [profileVisibility, setProfileVisibility] = useState("community");
  const [showContactInfo, setShowContactInfo] = useState("community");
  const [contactSharing, setContactSharing] = useState("community");
  const [profilePicturePrivacy, setProfilePicturePrivacy] = useState("community");
  const [activityStatus, setActivityStatus] = useState(true);

  const [openAddImageBottomSheet, setOpenAddImageBottomSheet] = useState(false);

  const closeBottomSheet = () => {
    setOpenAddImageBottomSheet(false);
  };

  const [pickedImage, setPickedImage] = useState();
  const [removeImage, setRemoveImage] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(null);

  const [removeImageToast, setRemoveImageToast] = useState(false);
  const onDismissRemoveImage = () => setRemoveImageToast(false);

  // Date picker state
  const [dateCalendarModal, setDateCalendarModal] = useState(false);

  // Modal states for beautiful dropdowns
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showProfileVisibilityModal, setShowProfileVisibilityModal] = useState(false);
  const [showContactSharingModal, setShowContactSharingModal] = useState(false);
  const [showContactInfoModal, setShowContactInfoModal] = useState(false);
  const [showPicturePrivacyModal, setShowPicturePrivacyModal] = useState(false);

  // Temporary selections for modals
  const [tempGender, setTempGender] = useState(gender);
  const [tempProfileVisibility, setTempProfileVisibility] = useState(profileVisibility);
  const [tempContactSharing, setTempContactSharing] = useState(contactSharing);
  const [tempContactInfo, setTempContactInfo] = useState(showContactInfo);
  const [tempPicturePrivacy, setTempPicturePrivacy] = useState(profilePicturePrivacy);

  useEffect(() => {
    if (!profile) return;

    const preferenceData =
      profile.preferences && typeof profile.preferences === "object"
        ? profile.preferences
        : {};

    setFirstName(profile.first_name || "");
    setLastName(profile.last_name || "");
    setEmail(profile.email || "");
    setNumber(profile.phone || "");
    setDateOfBirth(preferenceData.date_of_birth || "1990-05-15");
    setGender(preferenceData.gender || "male");
    setAlternativeEmail(preferenceData.alternative_email || "");
    setTotalFamilyMembers(
      Number.isFinite(preferenceData.total_family_members)
        ? preferenceData.total_family_members
        : 2
    );
    setHasPets(Boolean(preferenceData.has_pets));
    setVehicleCount(
      Number.isFinite(preferenceData.vehicle_count) ? preferenceData.vehicle_count : 1
    );
    setProfileVisibility(preferenceData.profile_visibility || "community");
    setShowContactInfo(preferenceData.show_contact_info || "community");
    setContactSharing(preferenceData.contact_sharing || "community");
    setProfilePicturePrivacy(preferenceData.profile_picture_privacy || "community");
    setActivityStatus(
      typeof preferenceData.activity_status === "boolean"
        ? preferenceData.activity_status
        : true
    );
    setTempGender(preferenceData.gender || "male");
    setTempProfileVisibility(preferenceData.profile_visibility || "community");
    setTempContactSharing(preferenceData.contact_sharing || "community");
    setTempContactInfo(preferenceData.show_contact_info || "community");
    setTempPicturePrivacy(preferenceData.profile_picture_privacy || "community");
    setPickedImage(null);
    setRemoveImage(false);
    setProfileImageUrl(profile.avatar_url || null);
  }, [profile]);

  // Gender options
  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
    { value: "prefer_not_to_say", label: "Prefer not to say" },
  ];

  // Privacy options
  const privacyOptions = [
    { value: "public", label: "Public" },
    { value: "community", label: "Community Only" },
    { value: "private", label: "Private" },
  ];

  const contactSharingOptions = [
    { value: "everyone", label: "Everyone" },
    { value: "community", label: "Community Members" },
    { value: "friends", label: "Friends Only" },
    { value: "private", label: "Private" },
  ];

  const galleryHandler = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setPickedImage(result.assets[0].uri);
      setRemoveImage(false);
      closeBottomSheet();
    }
  };

  const [camera, setShowCamera] = useState(false);

  const [cameraNotGranted, setCameraNotGranted] = useState(false);
  const onDismissCameraNotGranted = () => setCameraNotGranted(false);

  const cameraHandler = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status === "granted") {
      closeBottomSheet();
      setTimeout(() => {
        setShowCamera(true);
      }, 500);
    } else {
      setCameraNotGranted(true);
      closeBottomSheet();
    }
  };

  // Calendar picker handlers
  const onCalendarDateChange = (selectedDate) => {
    if (selectedDate?.dateString) {
      setDateOfBirth(selectedDate.dateString);
      setDateCalendarModal(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const renderDropdown = (value, options, onSelect, placeholder, modalVisible, setModalVisible) => (
    <TouchableOpacity
      style={styles.dropdownContainer}
      onPress={() => setModalVisible(true)}
    >
      <Text style={[styles.dropdownText, !value && { color: Colors.grey }]}>
        {options.find(opt => opt.value === value)?.label || placeholder}
      </Text>
      <Ionicons name="chevron-down" size={20} color={Colors.grey} />
    </TouchableOpacity>
  );

  const renderModal = (title, options, selectedValue, tempValue, setTempValue, onConfirm, visible, setVisible) => (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={() => setVisible(false)}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressOut={() => setVisible(false)}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity
                onPress={() => setVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={22} color={Colors.grey} />
              </TouchableOpacity>
            </View>
            
            <DashedLine
              dashGap={2.5}
              dashLength={2.5}
              dashThickness={1.5}
              dashColor={Colors.grey}
            />

            <FlatList
              data={options}
              renderItem={({ item }) => {
                const isSelected = tempValue === item.value;
                return (
                  <TouchableOpacity
                    onPress={() => setTempValue(item.value)}
                    style={styles.modalOptionItem}
                  >
                    <MaterialCommunityIcons
                      name={isSelected ? "record-circle" : "circle-outline"}
                      size={22}
                      color={isSelected ? Colors.primary : Colors.grey}
                    />
                    <Text style={styles.modalOptionText}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: Default.fixPadding * 1.2 }}
            />

            <View style={styles.modalFooter}>
              <TouchableOpacity
                onPress={() => setVisible(false)}
                style={[styles.modalButton, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>{tr("cancel") || "Cancel"}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  onConfirm(tempValue);
                  setVisible(false);
                }}
                style={[styles.modalButton, styles.confirmButton]}
              >
                <Text style={styles.confirmButtonText}>{tr("okay") || "OK"}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const uploadProfileImageIfNeeded = async () => {
    if (removeImage) {
      return null;
    }

    if (!pickedImage) {
      return profileImageUrl || null;
    }

    if (typeof pickedImage === "string" && pickedImage.startsWith("http")) {
      return pickedImage;
    }

    if (!profile?.id) {
      throw new Error("Profile not available for image upload.");
    }

    const response = await fetch(pickedImage);
    const imageBlob = await response.blob();
    const extensionCandidate = pickedImage.split(".").pop() || "jpg";
    const extension = extensionCandidate.split("?")[0].toLowerCase();
    const filePath = `profile-avatars/${profile.id}/${Date.now()}.${extension}`;

    const { data, error } = await supabase.storage
      .from("attachments")
      .upload(filePath, imageBlob, {
        contentType: imageBlob.type || `image/${extension}`,
        upsert: true,
      });

    if (error) {
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from("attachments")
      .getPublicUrl(data.path);

    return publicUrlData?.publicUrl || null;
  };

  const handleUpdateProfile = async () => {
    if (!profile?.id) {
      Alert.alert("Error", "Profile not available.");
      return;
    }

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      Alert.alert("Error", "First name, last name, and email are required.");
      return;
    }

    const existingPreferences =
      profile?.preferences && typeof profile.preferences === "object"
        ? profile.preferences
        : {};

    try {
      const nextAvatarUrl = await uploadProfileImageIfNeeded();

      await updateProfileMutation.mutateAsync({
        id: profile.id,
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          full_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          email: email.trim().toLowerCase(),
          phone: number.trim() || null,
          avatar_url: nextAvatarUrl,
          preferences: {
            ...existingPreferences,
            date_of_birth: dateOfBirth || null,
            gender: gender || null,
            alternative_email: alternativeEmail || null,
            total_family_members: totalFamilyMembers,
            has_pets: hasPets,
            vehicle_count: vehicleCount,
            profile_visibility: profileVisibility,
            show_contact_info: showContactInfo,
            contact_sharing: contactSharing,
            profile_picture_privacy: profilePicturePrivacy,
            activity_status: activityStatus,
          },
        },
      });

      navigation.pop();
    } catch (error) {
      console.error("Failed to update profile:", error);
      Alert.alert("Error", "Unable to update profile. Please try again.");
    }
  };

  const profileAvatarName =
    `${firstName || ''} ${lastName || ''}`.trim() ||
    profile?.full_name ||
    email ||
    'User';
  const profileAvatarSeed =
    profile?.user_id || profile?.id || email || profileAvatarName;
  const profileAvatarPreview = removeImage ? null : pickedImage || profileImageUrl;

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
          {tr("editProfile")}
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
            alignSelf: "center",
            marginTop: Default.fixPadding * 2.8,
          }}
        >
          <View style={{ ...styles.imageView, backgroundColor: Colors.white }}>
            <AppAvatar
              avatarUrl={profileAvatarPreview}
              name={profileAvatarName}
              seed={`profile:${profileAvatarSeed}`}
              size={106}
              borderRadius={53}
              style={styles.image}
              imageStyle={styles.image}
            />
          </View>

          <TouchableOpacity
            onPress={() => setOpenAddImageBottomSheet(true)}
            style={{
              bottom: 0,
              left: isRtl ? 0 : null,
              right: isRtl ? null : 0,
              ...styles.cameraTouchOpacity,
            }}
          >
            <Ionicons name="camera-outline" size={22} color={Colors.black} />
          </TouchableOpacity>
        </View>

        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginBottom: Default.fixPadding * 2,
            marginTop: Default.fixPadding * 0.5,
          }}
        >
          <Text
            style={{
              ...Fonts.SemiBold18primary,
              marginVertical: Default.fixPadding * 0.5,
            }}
          >
            {firstName} {lastName}
          </Text>
          <Text style={{ ...Fonts.Medium14grey }}>A-420, Casa Nirvana</Text>
        </View>

        {/* Personal Information Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{tr("personalInformation")}</Text>
          
          <Text style={styles.fieldLabel}>{tr("firstName")}</Text>
          <TouchableOpacity style={[styles.textInputCard, styles.inputContainer]}>
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder={tr("enterFirstName")}
              placeholderTextColor={Colors.grey}
              selectionColor={Colors.primary}
              style={{
                ...Fonts.Medium16black,
                textAlign: isRtl ? "right" : "left",
                flex: 1,
              }}
            />
          </TouchableOpacity>

          <Text style={styles.fieldLabel}>{tr("lastName")}</Text>
          <TouchableOpacity style={[styles.textInputCard, styles.inputContainer]}>
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              placeholder={tr("enterLastName")}
              placeholderTextColor={Colors.grey}
              selectionColor={Colors.primary}
              style={{
                ...Fonts.Medium16black,
                textAlign: isRtl ? "right" : "left",
                flex: 1,
              }}
            />
          </TouchableOpacity>

          <Text style={styles.fieldLabel}>{tr("dateOfBirth")}</Text>
          <TouchableOpacity
            style={[styles.dobTextInputCard, styles.datePickerContainer]}
            onPress={() => setDateCalendarModal(true)}
          >
            <Text style={{ ...Fonts.Medium16black, flex: 1 }}>
              {dateOfBirth || tr("selectDateOfBirth")}
            </Text>
            <MaterialCommunityIcons name="calendar-range-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>

          <Text style={styles.fieldLabel}>{tr("gender")}</Text>
          {renderDropdown(gender, genderOptions, setGender, tr("selectGender"), showGenderModal, setShowGenderModal)}

          <Text style={styles.fieldLabel}>{tr("emailAddress")}</Text>
          <TouchableOpacity style={[styles.textInputCard, styles.inputContainer]}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder={tr("enterEmail")}
              placeholderTextColor={Colors.grey}
              selectionColor={Colors.primary}
              style={{
                ...Fonts.Medium16black,
                textAlign: isRtl ? "right" : "left",
                flex: 1,
              }}
            />
          </TouchableOpacity>

          <Text style={styles.fieldLabel}>{tr("alternativeEmail")}</Text>
          <TouchableOpacity style={[styles.textInputCard, styles.inputContainer]}>
            <TextInput
              value={alternativeEmail}
              onChangeText={setAlternativeEmail}
              keyboardType="email-address"
              placeholder={tr("enterAlternativeEmail")}
              placeholderTextColor={Colors.grey}
              selectionColor={Colors.primary}
              style={{
                ...Fonts.Medium16black,
                textAlign: isRtl ? "right" : "left",
                flex: 1,
              }}
            />
          </TouchableOpacity>

          <Text style={styles.fieldLabel}>{tr("phoneNumber")}</Text>
          <TouchableOpacity style={[styles.textInputCard, styles.inputContainer]}>
            <TextInput
              maxLength={10}
              value={number}
              onChangeText={setNumber}
              keyboardType={"number-pad"}
              selectionColor={Colors.primary}
              placeholder={tr("enterPhoneNumber")}
              placeholderTextColor={Colors.grey}
              style={{
                ...Fonts.Medium16black,
                textAlign: isRtl ? "right" : "left",
                flex: 1,
              }}
            />
          </TouchableOpacity>
        </View>

        {/* Household Information Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{tr("householdInformation")}</Text>
          
          <Text style={styles.fieldLabel}>{tr("totalFamilyMembers")}</Text>
          <View style={styles.numberInputContainer}>
            <TouchableOpacity
              style={styles.numberButton}
              onPress={() => setTotalFamilyMembers(Math.max(1, totalFamilyMembers - 1))}
            >
              <MaterialCommunityIcons name="minus" size={20} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.numberValue}>{totalFamilyMembers}</Text>
            <TouchableOpacity
              style={styles.numberButton}
              onPress={() => setTotalFamilyMembers(totalFamilyMembers + 1)}
            >
              <MaterialCommunityIcons name="plus" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.fieldLabel}>{tr("hasPets")}</Text>
            <Switch
              value={hasPets}
              onValueChange={setHasPets}
              trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>

          <Text style={styles.fieldLabel}>{tr("vehicleCount")}</Text>
          <View style={styles.numberInputContainer}>
            <TouchableOpacity
              style={styles.numberButton}
              onPress={() => setVehicleCount(Math.max(0, vehicleCount - 1))}
            >
              <MaterialCommunityIcons name="minus" size={20} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.numberValue}>{vehicleCount}</Text>
            <TouchableOpacity
              style={styles.numberButton}
              onPress={() => setVehicleCount(vehicleCount + 1)}
            >
              <MaterialCommunityIcons name="plus" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Privacy Settings Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{tr("privacySettings")}</Text>
          
          <Text style={styles.fieldLabel}>{tr("profileVisibility")}</Text>
          {renderDropdown(profileVisibility, privacyOptions, setProfileVisibility, tr("selectVisibility"), showProfileVisibilityModal, setShowProfileVisibilityModal)}

          <Text style={styles.fieldLabel}>{tr("contactSharing")}</Text>
          {renderDropdown(contactSharing, contactSharingOptions, setContactSharing, tr("selectContactSharing"), showContactSharingModal, setShowContactSharingModal)}

          <Text style={styles.fieldLabel}>{tr("showContactInfo")}</Text>
          {renderDropdown(showContactInfo, contactSharingOptions, setShowContactInfo, tr("selectContactVisibility"), showContactInfoModal, setShowContactInfoModal)}

          <Text style={styles.fieldLabel}>{tr("profilePicturePrivacy")}</Text>
          {renderDropdown(profilePicturePrivacy, privacyOptions.filter(opt => opt.value !== "private"), setProfilePicturePrivacy, tr("selectPicturePrivacy"), showPicturePrivacyModal, setShowPicturePrivacyModal)}

          <View style={styles.switchContainer}>
            <Text style={styles.fieldLabel}>{tr("activityStatus")}</Text>
            <Switch
              value={activityStatus}
              onValueChange={setActivityStatus}
              trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
        </View>
      </ScrollView>

      {/* Calendar Picker Modal */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={dateCalendarModal}
        onRequestClose={() => setDateCalendarModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPressOut={() => setDateCalendarModal(false)}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { borderRadius: 20, overflow: 'hidden' }]}>
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  margin: Default.fixPadding,
                  paddingVertical: Default.fixPadding,
                  backgroundColor: Colors.white,
                  borderBottomWidth: 1,
                  borderBottomColor: Colors.lightGrey,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    textAlign: "center",
                    overflow: "hidden",
                    ...Fonts.SemiBold18primary,
                  }}
                >
                  {tr("selectDateOfBirth")}
                </Text>
                <TouchableOpacity
                  onPress={() => setDateCalendarModal(false)}
                  style={{
                    position: "absolute",
                    alignSelf: isRtl ? "flex-start" : "flex-end",
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: Colors.lightGrey + '20',
                  }}
                >
                  <Ionicons name="close" size={20} color={Colors.grey} />
                </TouchableOpacity>
              </View>
              
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: Default.fixPadding * 1.5,
                }}
              >
                <FromToCalendarPicker
                  maxDate={today}
                  current={dateOfBirth || today}
                  onDayPress={onCalendarDateChange}
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Gender Selection Modal */}
      {renderModal(
        tr("selectGender"),
        genderOptions,
        gender,
        tempGender,
        setTempGender,
        setGender,
        showGenderModal,
        setShowGenderModal
      )}

      {/* Profile Visibility Modal */}
      {renderModal(
        tr("selectVisibility"),
        privacyOptions,
        profileVisibility,
        tempProfileVisibility,
        setTempProfileVisibility,
        setProfileVisibility,
        showProfileVisibilityModal,
        setShowProfileVisibilityModal
      )}

      {/* Contact Sharing Modal */}
      {renderModal(
        tr("selectContactSharing"),
        contactSharingOptions,
        contactSharing,
        tempContactSharing,
        setTempContactSharing,
        setContactSharing,
        showContactSharingModal,
        setShowContactSharingModal
      )}

      {/* Contact Info Modal */}
      {renderModal(
        tr("selectContactVisibility"),
        contactSharingOptions,
        showContactInfo,
        tempContactInfo,
        setTempContactInfo,
        setShowContactInfo,
        showContactInfoModal,
        setShowContactInfoModal
      )}

      {/* Picture Privacy Modal */}
      {renderModal(
        tr("selectPicturePrivacy"),
        privacyOptions.filter(opt => opt.value !== "private"),
        profilePicturePrivacy,
        tempPicturePrivacy,
        setTempPicturePrivacy,
        setProfilePicturePrivacy,
        showPicturePrivacyModal,
        setShowPicturePrivacyModal
      )}

      <View
        style={{
          margin: Default.fixPadding * 2,
        }}
      >
        <AwesomeButton
          progress
          height={50}
          progressLoadingTime={500}
          onPress={async (next) => {
            await handleUpdateProfile();
            next();
          }}
          raiseLevel={1}
          stretch={true}
          borderRadius={10}
          backgroundShadow={Colors.primary}
          backgroundDarker={Colors.primary}
          backgroundColor={Colors.primary}
        >
          <Text style={{ ...Fonts.SemiBold18white }}>{tr("update")}</Text>
        </AwesomeButton>
      </View>

      <AddImageBottomSheet
        visible={openAddImageBottomSheet}
        closeBottomSheet={closeBottomSheet}
        cameraHandler={cameraHandler}
        galleryHandler={galleryHandler}
        removeImage={() => {
          closeBottomSheet();
          setRemoveImageToast(!removeImageToast);
          setRemoveImage(true);
          setPickedImage(null);
        }}
      />
      {camera && (
        <CameraModule
          showModal={camera}
          setShowCamera={() => setShowCamera(false)}
          setPickedImage={(result) => {
            setPickedImage(result.uri);
            setRemoveImage(false);
          }}
          closeBottomSheet={() => closeBottomSheet()}
        />
      )}
      <SnackbarToast
        visible={removeImageToast}
        onDismiss={onDismissRemoveImage}
        title={tr("removeImage")}
      />

      <SnackbarToast
        visible={cameraNotGranted}
        onDismiss={onDismissCameraNotGranted}
        title={tr("deny")}
      />
    </View>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  bottomSheetMain: {
    paddingVertical: Default.fixPadding * 2.5,
    paddingHorizontal: Default.fixPadding * 2,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: Colors.white,
  },
  round: {
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  textInputCard: {
    paddingVertical: Default.fixPadding * 0.5, // Reduced from 1.2 to match dropdown height
    paddingHorizontal: Default.fixPadding * 1.5,
    marginTop: Default.fixPadding,
    marginBottom: Default.fixPadding * 1.5,
    borderRadius: 10,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  dobTextInputCard: {
    paddingVertical: Default.fixPadding * 1.5, // Restore to original DOB height that looked perfect
    paddingHorizontal: Default.fixPadding * 1.5,
    marginTop: Default.fixPadding,
    marginBottom: Default.fixPadding * 1.5,
    borderRadius: 10,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // Remove minHeight - let textInputCard padding control the size like dropdown
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // Remove paddingVertical - let dobTextInputCard handle all padding
  },
  sectionContainer: {
    marginHorizontal: Default.fixPadding * 2,
    marginVertical: Default.fixPadding,
    padding: Default.fixPadding * 1.5,
    borderRadius: 10,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  sectionTitle: {
    ...Fonts.SemiBold18primary,
    marginBottom: Default.fixPadding * 1.5,
  },
  fieldLabel: {
    ...Fonts.Medium14black,
    marginBottom: Default.fixPadding * 0.5,
    marginTop: Default.fixPadding,
  },
  dropdownContainer: {
    paddingVertical: Default.fixPadding * 1.2,
    paddingHorizontal: Default.fixPadding * 1.5,
    marginTop: Default.fixPadding,
    marginBottom: Default.fixPadding * 1.5,
    borderRadius: 10,
    backgroundColor: Colors.extraLightGrey,
    borderWidth: 1,
    borderColor: Colors.lightGrey,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    ...Fonts.Medium16black,
    flex: 1,
  },
  numberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Default.fixPadding,
    marginBottom: Default.fixPadding * 1.5,
  },
  numberButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.extraLightGrey,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  numberValue: {
    ...Fonts.SemiBold16black,
    marginHorizontal: Default.fixPadding * 2,
    minWidth: 40,
    textAlign: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Default.fixPadding,
    marginVertical: Default.fixPadding * 0.5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.transparentBlack,
  },
  modalContainer: {
    width: width * 0.9,
    maxHeight: height * 0.7,
  },
  modalContent: {
    borderRadius: 10,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  modalHeader: {
    justifyContent: "center",
    alignItems: "center",
    padding: Default.fixPadding * 1.6,
    position: 'relative',
  },
  modalTitle: {
    ...Fonts.Medium18primary,
    textAlign: "center",
  },
  closeButton: {
    position: "absolute",
    right: Default.fixPadding * 1.6,
    top: Default.fixPadding * 1.6,
  },
  modalOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Default.fixPadding * 2.5,
    marginHorizontal: Default.fixPadding * 2.6,
  },
  modalOptionText: {
    ...Fonts.Medium16black,
    overflow: "hidden",
    marginHorizontal: Default.fixPadding,
    flex: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Default.fixPadding * 2.6,
    marginTop: Default.fixPadding * 1.3,
    marginBottom: Default.fixPadding * 2.2,
  },
  modalButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Default.fixPadding * 1.4,
    borderRadius: 10,
    ...Default.shadow,
  },
  cancelButton: {
    backgroundColor: Colors.white,
    marginRight: Default.fixPadding * 1.5,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
  },
  cancelButtonText: {
    ...Fonts.SemiBold18black,
    overflow: "hidden",
  },
  confirmButtonText: {
    ...Fonts.SemiBold18white,
    overflow: "hidden",
  },
  image: {
    height: 106,
    width: 106,
    borderRadius: 53,
  },
  imageView: {
    justifyContent: "center",
    alignItems: "center",
    width: 110,
    height: 110,
    borderRadius: 55,
    ...Default.shadow,
  },
  cameraTouchOpacity: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: Colors.white,
  },
});
