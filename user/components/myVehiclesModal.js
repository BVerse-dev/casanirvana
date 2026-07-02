import React, { useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Modal,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import AwesomeButton from "react-native-really-awesome-button";
import CameraModule from "./cameraModule";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import SnackbarToast from "./snackbarToast";
import AddImageBottomSheet from "./addImageBottomSheet";
import GatePassModal from "./gatePassModal";
import AppAvatar from "./AppAvatar";
import { useAuth } from "../contexts/AuthContext";
import { useCreateVehicle } from "../hooks/useVehicles";
import { uploadDirectoryAvatarIfNeeded } from "../utils/directoryAvatarStorage";

const { width, height } = Dimensions.get("window");

const MyVehiclesModal = (props) => {
  const { t, i18n } = useTranslation();
  const { user, profile } = useAuth();
  const createVehicle = useCreateVehicle();

  const isRtl = i18n.dir() === "rtl";
  const activeUserId = user?.id || profile?.user_id || null;

  function tr(key) {
    return t(`myVehiclesModal:${key}`);
  }

  const [openAddImageBottomSheet, setOpenAddImageBottomSheet] = useState(false);

  const closeBottomSheet = () => {
    setOpenAddImageBottomSheet(false);
  };

  const [pickedImage, setPickedImage] = useState();

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

  const [vehicleNumber, setVehicleNumber] = useState();
  const [vehicleModel, setVehicleModel] = useState();
  const [vehicleColor, setVehicleColor] = useState();
  const [send, setSend] = useState(true);
  
  // Gate pass modal states
  const [openGatePassModal, setOpenGatePassModal] = useState(false);
  const [createdVehicle, setCreatedVehicle] = useState(null);

  const handleSubmit = async () => {
    try {
      // Validation
      if (!vehicleNumber || vehicleNumber.trim().length === 0) {
        Alert.alert('Validation Error', 'Please enter a valid vehicle number');
        return;
      }

      if (!vehicleModel || vehicleModel.trim().length === 0) {
        Alert.alert('Validation Error', 'Please enter a valid vehicle model');
        return;
      }

      if (!vehicleColor || vehicleColor.trim().length === 0) {
        Alert.alert('Validation Error', 'Please enter a valid vehicle color');
        return;
      }

      if (!activeUserId) {
        Alert.alert('Auth Error', 'Unable to resolve your account. Please sign in again.');
        return;
      }

      const avatarUrl = await uploadDirectoryAvatarIfNeeded({
        imageUri: pickedImage,
        ownerId: activeUserId,
        scope: 'vehicles',
      });
      const vehicleData = {
        user_id: activeUserId,
        vehicle_number: vehicleNumber.trim(),
        model: vehicleModel.trim(),
        color: vehicleColor.trim(),
        avatar_url: avatarUrl,
      };

      const result = await createVehicle.mutateAsync(vehicleData);

      if (result) {
        // Store the created vehicle data for gate pass modal
        setCreatedVehicle(result);
        
        // Show success and open gate pass modal
        Alert.alert(
          'Success', 
          'Vehicle has been added successfully!',
          [
            {
              text: 'OK',
              onPress: () => setOpenGatePassModal(true)
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error adding vehicle:', error);
      Alert.alert('Error', `Failed to add vehicle: ${error.message}`);
    }
  };

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={props.visible}
      onRequestClose={props.modalClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressOut={props.modalClose}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView behavior={"padding"} style={{ flex: 1 }}>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: Colors.transparentBlack,
            }}
          >
            <TouchableWithoutFeedback>
              <View
                style={{
                  maxHeight: height / 1.7,
                  width: width * 0.9,
                  borderRadius: 10,
                  backgroundColor: Colors.white,
                  ...Default.shadow,
                }}
              >
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setOpenAddImageBottomSheet(true)}
                    style={styles.imageTouchOpacity}
                  >
                    <AppAvatar
                      avatarUrl={pickedImage}
                      name={vehicleNumber || vehicleModel || "Vehicle"}
                      seed={`vehicle-create:${activeUserId || 'resident'}:${vehicleNumber || vehicleModel || 'vehicle'}`}
                      size={84}
                      borderRadius={42}
                    />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  onPress={props.modalClose}
                  style={{
                    position: "absolute",
                    right: isRtl ? null : 0,
                    marginTop: Default.fixPadding * 1.2,
                    marginHorizontal: Default.fixPadding * 1.1,
                  }}
                >
                  <Ionicons name="close" size={22} color={Colors.grey} />
                </TouchableOpacity>

                <Text
                  style={{
                    ...Fonts.SemiBold16black,
                    textAlign: "center",
                    marginHorizontal: Default.fixPadding * 2,
                    marginVertical: Default.fixPadding * 1.5,
                  }}
                >
                  {tr("addVehicles")}
                </Text>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  automaticallyAdjustKeyboardInsets={true}
                >
                  <View
                    style={{
                      marginTop: Default.fixPadding * 2.5,
                      marginBottom: Default.fixPadding * 2,
                      marginHorizontal: Default.fixPadding * 2,
                    }}
                  >
                    <Text
                      style={{
                        ...Fonts.Medium16black,
                        textAlign: isRtl ? "right" : "left",
                      }}
                    >
                      {tr("vehicleNumber")}
                    </Text>

                    <View
                      style={{
                        marginBottom: Default.fixPadding * 1.5,
                        ...styles.textInputView,
                      }}
                    >
                      <TextInput
                        value={vehicleNumber}
                        onChangeText={setVehicleNumber}
                        placeholder={tr("enterVehicleNumber")}
                        placeholderTextColor={Colors.grey}
                        selectionColor={Colors.primary}
                        style={{
                          ...Fonts.Medium14black,
                          textAlign: isRtl ? "right" : "left",
                        }}
                      />
                    </View>

                    <Text
                      style={{
                        ...Fonts.Medium16black,
                        textAlign: isRtl ? "right" : "left",
                      }}
                    >
                      {tr("vehicleModel")}
                    </Text>

                    <View
                      style={{
                        marginBottom: Default.fixPadding * 1.5,
                        ...styles.textInputView,
                      }}
                    >
                      <TextInput
                        value={vehicleModel}
                        onChangeText={setVehicleModel}
                        placeholder={tr("enterVehicleModel")}
                        placeholderTextColor={Colors.grey}
                        selectionColor={Colors.primary}
                        style={{
                          ...Fonts.Medium14black,
                          textAlign: isRtl ? "right" : "left",
                        }}
                      />
                    </View>

                    <Text
                      style={{
                        ...Fonts.Medium16black,
                        textAlign: isRtl ? "right" : "left",
                      }}
                    >
                      {tr("vehicleColor")}
                    </Text>

                    <View
                      style={{
                        marginBottom: Default.fixPadding,
                        ...styles.textInputView,
                      }}
                    >
                      <TextInput
                        value={vehicleColor}
                        onChangeText={setVehicleColor}
                        placeholder={tr("enterVehicleColor")}
                        placeholderTextColor={Colors.grey}
                        selectionColor={Colors.primary}
                        style={{
                          ...Fonts.Medium14black,
                          textAlign: isRtl ? "right" : "left",
                        }}
                      />
                    </View>

                    <TouchableOpacity
                      onPress={() => setSend((prev) => !prev)}
                      style={{
                        flexDirection: isRtl ? "row-reverse" : "row",
                        alignItems: "center",
                      }}
                    >
                      <Ionicons
                        name={send ? "checkbox-outline" : "square-outline"}
                        size={16}
                        color={send ? Colors.primary : Colors.grey}
                      />
                      <Text
                        numberOfLines={1}
                        style={{
                          ...Fonts.Medium14grey,
                          overflow: "hidden",
                          marginHorizontal: Default.fixPadding,
                        }}
                      >
                        {tr("sendGateGuest")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
                <View
                  style={{
                    margin: Default.fixPadding * 2,
                  }}
                >
                  <AwesomeButton
                    height={50}
                    onPress={handleSubmit}
                    raiseLevel={1}
                    stretch={true}
                    borderRadius={10}
                    backgroundShadow={Colors.primary}
                    backgroundDarker={Colors.primary}
                    backgroundColor={Colors.primary}
                  >
                    <Text style={{ ...Fonts.SemiBold18white }}>
                      {tr("submit")}
                    </Text>
                  </AwesomeButton>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </KeyboardAvoidingView>
      </TouchableOpacity>

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
      <AddImageBottomSheet
        visible={openAddImageBottomSheet}
        closeBottomSheet={closeBottomSheet}
        cameraHandler={cameraHandler}
        galleryHandler={galleryHandler}
        removeImage={() => {
          closeBottomSheet();
          setRemoveImageToast(true);
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
      
      {/* Gate Pass Modal */}
      {openGatePassModal && createdVehicle && (
        <GatePassModal
          visible={openGatePassModal}
          modalClose={() => {
            setOpenGatePassModal(false);
            setCreatedVehicle(null);
            // Close the main modal and reset form
            props.modalClose();
            setVehicleNumber("");
            setVehicleModel("");
            setVehicleColor("");
            setPickedImage();
          }}
          visitorData={{
            visitor_name: createdVehicle.vehicle_number,
            qr_code_data: createdVehicle.qr_code,
            entry_code: createdVehicle.entry_code
          }}
          onDownloadHandle={() => {
            setOpenGatePassModal(false);
            setCreatedVehicle(null);
            props.modalClose();
          }}
          onShareClose={() => {
            setOpenGatePassModal(false);
            setCreatedVehicle(null);
            props.modalClose();
          }}
        />
      )}
    </Modal>
  );
};

export default MyVehiclesModal;

const styles = StyleSheet.create({
  imageTouchOpacity: {
    justifyContent: "center",
    alignItems: "center",
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: Colors.white,
    backgroundColor: Colors.geyser,
    marginTop: -Default.fixPadding * 5,
    ...Default.shadow,
  },
  textInputView: {
    paddingHorizontal: Default.fixPadding * 1.4,
    paddingVertical: Default.fixPadding * 1.2,
    marginTop: Default.fixPadding * 0.5,
    borderRadius: 10,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
});
