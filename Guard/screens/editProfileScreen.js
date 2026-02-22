import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MyStatusBar from "../components/myStatusBar";
import SnackbarToast from "../components/snackbarToast";
import CameraModule from "../components/cameraModule";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as LegacyFileSystem from "expo-file-system/legacy";
import AwesomeButton from "react-native-really-awesome-button";
import AddImageBottomSheet from "../components/addImageBottomSheet";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import DashedLine from "react-native-dashed-line";
import FromToCalendarPicker from "../components/fromToCalendarPicker";
import { useGuardAuth } from "../contexts/GuardAuthContext";
import { supabase } from "../utils/supabase";

const { width, height } = Dimensions.get("window");

const EditProfileScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { authUser, user, guard, community, refreshGuardProfile } = useGuardAuth();

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`editProfileScreen:${key}`);
  }
  const backAction = () => {
    navigation.pop();
    return true;
  };
  useEffect(() => {
    const backSub = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backSub.remove();
  }, []);

  const authUserId = authUser?.id || user?.id || null;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [alternativeEmail, setAlternativeEmail] = useState("");
  const [isHydrating, setIsHydrating] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [openAddImageBottomSheet, setOpenAddImageBottomSheet] = useState(false);

  const closeBottomSheet = () => {
    setOpenAddImageBottomSheet(false);
  };

  const [pickedImage, setPickedImage] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [dateCalendarModal, setDateCalendarModal] = useState(false);

  const profileName = `${firstName} ${lastName}`.trim() || "Guard";

  useEffect(() => {
    let active = true;

    const hydrateProfile = async () => {
      if (!authUserId) {
        if (active) {
          setIsHydrating(false);
        }
        return;
      }

      try {
        const [{ data: userRow }, { data: guardRow }] = await Promise.all([
          supabase
            .from("users")
            .select("id, first_name, last_name, email, phone, date_of_birth")
            .eq("id", authUserId)
            .maybeSingle(),
          supabase
            .from("guards")
            .select(
              "id, first_name, last_name, full_name, display_name, phone, mobile, email, date_of_birth, avatar_url"
            )
            .eq("user_id", authUserId)
            .maybeSingle(),
        ]);

        if (!active) return;

        const sourceFirstName =
          guardRow?.first_name ||
          userRow?.first_name ||
          guard?.first_name ||
          user?.first_name ||
          "";
        const sourceLastName =
          guardRow?.last_name ||
          userRow?.last_name ||
          guard?.last_name ||
          user?.last_name ||
          "";
        const sourceEmail = userRow?.email || authUser?.email || "";
        const altEmail =
          guardRow?.email && guardRow.email !== sourceEmail ? guardRow.email : "";

        setFirstName(sourceFirstName);
        setLastName(sourceLastName);
        setEmail(sourceEmail);
        setAlternativeEmail(altEmail);
        setNumber(guardRow?.phone || userRow?.phone || guard?.phone || user?.phone || "");
        setDateOfBirth(
          guardRow?.date_of_birth ||
            userRow?.date_of_birth ||
            guard?.date_of_birth ||
            user?.date_of_birth ||
            ""
        );
        setPickedImage(guardRow?.avatar_url || guard?.avatar_url || null);
        setRemoveImage(false);
      } catch (error) {
        console.error("Failed to hydrate guard edit profile:", error);
      } finally {
        if (active) {
          setIsHydrating(false);
        }
      }
    };

    hydrateProfile();

    return () => {
      active = false;
    };
  }, [
    authUser?.email,
    authUserId,
    guard?.avatar_url,
    guard?.date_of_birth,
    guard?.first_name,
    guard?.last_name,
    guard?.phone,
    user?.date_of_birth,
    user?.first_name,
    user?.last_name,
    user?.phone,
  ]);

  const onCalendarDateChange = (selectedDate) => {
    if (selectedDate?.dateString) {
      setDateOfBirth(selectedDate.dateString);
      setDateCalendarModal(false);
    }
  };
  const today = new Date().toISOString().split("T")[0];

  const [removeImageToast, setRemoveImageToast] = useState(false);
  const onDismissRemoveImage = () => setRemoveImageToast(false);

  const inferImageMeta = (uri) => {
    const lower = String(uri || "").toLowerCase();
    if (lower.endsWith(".png")) {
      return { extension: "png", mimeType: "image/png" };
    }
    if (lower.endsWith(".webp")) {
      return { extension: "webp", mimeType: "image/webp" };
    }
    return { extension: "jpg", mimeType: "image/jpeg" };
  };

  const uploadProfileImageIfNeeded = async () => {
    if (removeImage) {
      return null;
    }

    if (!pickedImage) {
      return null;
    }

    if (typeof pickedImage === "string" && /^https?:\/\//i.test(pickedImage)) {
      return pickedImage;
    }

    if (!authUserId) {
      return null;
    }

    const readAsStringAsync = LegacyFileSystem.readAsStringAsync;
    const base64Encoding = LegacyFileSystem.EncodingType?.Base64 || "base64";
    if (!readAsStringAsync) {
      throw new Error("File reader is unavailable in this runtime.");
    }

    const fileBase64 = await readAsStringAsync(pickedImage, {
      encoding: base64Encoding,
    });
    const binaryString = atob(fileBase64);
    const arrayBuffer = new ArrayBuffer(binaryString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < binaryString.length; i += 1) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }

    const { extension, mimeType } = inferImageMeta(pickedImage);
    const filePath = `${authUserId}/profile/avatar-${Date.now()}.${extension}`;

    const { error } = await supabase.storage
      .from("attachments")
      .upload(filePath, arrayBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      throw new Error(error.message || "Could not upload profile image.");
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("attachments").getPublicUrl(filePath);

    return publicUrl || null;
  };

  const handleSaveProfile = async (next) => {
    if (!authUserId) {
      next();
      return;
    }

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();

    if (!trimmedFirst || !trimmedLast) {
      next();
      Alert.alert("Validation error", "First name and last name are required.");
      return;
    }

    setIsSaving(true);
    try {
      const avatarUrl = await uploadProfileImageIfNeeded();

      const userPatch = {
        first_name: trimmedFirst,
        last_name: trimmedLast,
        phone: number.trim() || null,
        date_of_birth: dateOfBirth || null,
      };

      const { error: usersUpdateError } = await supabase
        .from("users")
        .update(userPatch)
        .eq("id", authUserId);

      if (usersUpdateError) {
        throw usersUpdateError;
      }

      if (guard?.id) {
        const guardPatch = {
          first_name: trimmedFirst,
          last_name: trimmedLast,
          full_name: `${trimmedFirst} ${trimmedLast}`.trim(),
          display_name: `${trimmedFirst} ${trimmedLast}`.trim(),
          phone: number.trim() || null,
          mobile: number.trim() || null,
          email: alternativeEmail.trim() || guard?.email || null,
          date_of_birth: dateOfBirth || null,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        };

        const { error: guardsUpdateError } = await supabase
          .from("guards")
          .update(guardPatch)
          .eq("id", guard.id);

        if (guardsUpdateError) {
          throw guardsUpdateError;
        }
      }

      await refreshGuardProfile();
      navigation.pop();
    } catch (error) {
      console.error("Failed to update guard profile:", error);
      Alert.alert("Update failed", error?.message || "Could not update profile.");
    } finally {
      setIsSaving(false);
      next();
    }
  };

  const galleryHandler = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setPickedImage(result.assets[0].uri);
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

      {isHydrating ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={{ ...Fonts.Medium14grey, marginTop: Default.fixPadding }}>
            Loading profile...
          </Text>
        </View>
      ) : (
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
          {!pickedImage ? (
            <View>
              {removeImage ? (
                <View
                  style={{
                    borderWidth: 2,
                    borderColor: Colors.white,
                    backgroundColor: Colors.grey,
                    ...styles.imageView,
                  }}
                >
                  <Ionicons name="person" size={45} color={Colors.white} />
                </View>
              ) : (
                <View
                  style={{ ...styles.imageView, backgroundColor: Colors.white }}
                >
                  <Image
                    source={require("../assets/images/img1.png")}
                    style={styles.image}
                  />
                </View>
              )}
            </View>
          ) : (
            <View
              style={{ ...styles.imageView, backgroundColor: Colors.white }}
            >
              <Image style={styles.image} source={{ uri: pickedImage }} />
            </View>
          )}
          <TouchableOpacity
            onPress={() => setOpenAddImageBottomSheet(true)}
            style={{
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
            marginHorizontal: Default.fixPadding * 2,
            marginBottom: Default.fixPadding * 2,
          }}
        >
          <Text style={{ ...Fonts.SemiBold18primary, marginVertical: Default.fixPadding * 0.5 }}>
            {profileName}
          </Text>
          <Text
            style={{
              ...Fonts.Medium14grey,
              paddingHorizontal: Default.fixPadding * 0.5,
            }}
          >
            {`${guard?.gate_assignment || "Gate not assigned"} | ${
              community?.name || "Community not assigned"
            }`}
          </Text>
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
              style={{ ...Fonts.Medium16black, textAlign: isRtl ? "right" : "left", flex: 1 }}
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
              style={{ ...Fonts.Medium16black, textAlign: isRtl ? "right" : "left", flex: 1 }}
            />
          </TouchableOpacity>

          <Text style={styles.fieldLabel}>{tr("dateOfBirth")}</Text>
          <TouchableOpacity style={[styles.dobTextInputCard, styles.datePickerContainer]} onPress={() => setDateCalendarModal(true)}>
            <Text style={{ ...Fonts.Medium16black, flex: 1 }}>{dateOfBirth || tr("selectDateOfBirth")}</Text>
            <MaterialCommunityIcons name="calendar-range-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>

          {/* Gender removed */}

          <Text style={styles.fieldLabel}>{tr("emailAddress")}</Text>
          <TouchableOpacity style={[styles.textInputCard, styles.inputContainer]}>
            <TextInput
              value={email}
              editable={false}
              placeholder={tr("enterEmail")}
              placeholderTextColor={Colors.grey}
              selectionColor={Colors.primary}
              style={{
                ...Fonts.Medium16grey,
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
              style={{ ...Fonts.Medium16black, textAlign: isRtl ? "right" : "left", flex: 1 }}
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
              style={{ ...Fonts.Medium16black, textAlign: isRtl ? "right" : "left", flex: 1 }}
            />
          </TouchableOpacity>
        </View>

  {/* Household Information removed */}

  {/* Privacy Settings removed */}
      </ScrollView>
      )}
      <View
        style={{
          margin: Default.fixPadding * 2,
        }}
      >
        <AwesomeButton
          disabled={isHydrating || isSaving || !authUserId}
          progress
          height={50}
          progressLoadingTime={1000}
          onPress={handleSaveProfile}
          raiseLevel={1}
          stretch={true}
          borderRadius={10}
          backgroundShadow={Colors.primary}
          backgroundDarker={Colors.primary}
          backgroundColor={Colors.primary}
        >
          <Text style={{ ...Fonts.SemiBold18white }}>
            {isSaving ? "Saving..." : tr("update")}
          </Text>
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
          setPickedImage={(result) => setPickedImage(result.uri)}
          closeBottomSheet={() => closeBottomSheet()}
        />
      )}
  {/* All dropdown/radio modals removed */}

      {/* Date Calendar Modal */}
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
            <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{tr("selectDateOfBirth")}</Text>
                <TouchableOpacity
                  onPress={() => setDateCalendarModal(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={22} color={Colors.grey} />
                </TouchableOpacity>
              </View>
              <DashedLine dashGap={2.5} dashLength={2.5} dashThickness={1.5} dashColor={Colors.grey} />
              <View style={{ alignItems: 'center', paddingVertical: Default.fixPadding }}>
                <FromToCalendarPicker
                  current={dateOfBirth}
                  maxDate={today}
                  onDayPress={onCalendarDateChange}
                />
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  loadingState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  textInputCard: {
    paddingVertical: Default.fixPadding * 0.5,
    paddingHorizontal: Default.fixPadding * 1.5,
    marginTop: Default.fixPadding,
    marginBottom: Default.fixPadding * 1.5,
    borderRadius: 10,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  dobTextInputCard: {
    paddingVertical: Default.fixPadding * 1.5,
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
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    bottom: 0,
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: Colors.white,
  },
});

