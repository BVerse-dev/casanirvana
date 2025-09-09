import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  Alert,
  Modal,
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
import AwesomeButton from "react-native-really-awesome-button";
import AddImageBottomSheet from "../components/addImageBottomSheet";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import DashedLine from "react-native-dashed-line";
import FromToCalendarPicker from "../components/fromToCalendarPicker";
const { width, height } = Dimensions.get("window");

const EditProfileScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();

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

  // Basic profile information (mirrored from user-app)
  const [firstName, setFirstName] = useState("Jacob");
  const [lastName, setLastName] = useState("Jones");
  const [email, setEmail] = useState("Jecob@mail.com");
  const [number, setNumber] = useState("1234567890");
  const [dateOfBirth, setDateOfBirth] = useState("1990-05-15");
  const [alternativeEmail, setAlternativeEmail] = useState("");

  const [openAddImageBottomSheet, setOpenAddImageBottomSheet] = useState(false);

  const closeBottomSheet = () => {
    setOpenAddImageBottomSheet(false);
  };

  const [pickedImage, setPickedImage] = useState();
  const [removeImage, setRemoveImage] = useState(false);
  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateCalendarModal, setDateCalendarModal] = useState(false);

  // Removed: gender, household, and privacy state

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateOfBirth(selectedDate.toISOString().split('T')[0]);
    }
  };
  const onCalendarDateChange = (selectedDate) => {
    if (selectedDate?.dateString) {
      setDateOfBirth(selectedDate.dateString);
      setDateCalendarModal(false);
    }
  };
  const today = new Date().toISOString().split('T')[0];

  // Removed: dropdown renderer and selection modal (no longer needed)

  const [removeImageToast, setRemoveImageToast] = useState(false);
  const onDismissRemoveImage = () => setRemoveImageToast(false);

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
            {firstName} {lastName}
          </Text>
          <Text
            style={{
              ...Fonts.Medium14grey,
              paddingHorizontal: Default.fixPadding * 0.5,
            }}
          >
            {`Gate A | Casa Nirvana Society`}
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
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder={tr("enterEmail")}
              placeholderTextColor={Colors.grey}
              selectionColor={Colors.primary}
              style={{ ...Fonts.Medium16black, textAlign: isRtl ? "right" : "left", flex: 1 }}
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
      <View
        style={{
          margin: Default.fixPadding * 2,
        }}
      >
        <AwesomeButton
          progress
          height={50}
          progressLoadingTime={1000}
          onPress={(next) => {
            setTimeout(() => {
              next();
              navigation.pop();
            }, 1000);
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

