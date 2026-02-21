import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Modal,
  Image,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Alert,
  Platform,
} from "react-native";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import CameraModule from "./cameraModule";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import SnackbarToast from "./snackbarToast";
import AddImageBottomSheet from "./addImageBottomSheet";
import { useAuth } from "../contexts/AuthContext";
import { useUpdateVehicle } from "../hooks/useVehicles";

const { width, height } = Dimensions.get("window");

const EditVehicleModal = (props) => {
  const { t, i18n } = useTranslation();
  const { user, profile } = useAuth();
  const updateVehicle = useUpdateVehicle();

  const isRtl = i18n.dir() == "rtl";
  const activeUserId = user?.id || profile?.user_id || null;

  function tr(key) {
    return t(`myVehiclesModal:${key}`);
  }

  const [openAddImageBottomSheet, setOpenAddImageBottomSheet] = useState(false);

  const closeBottomSheet = () => {
    setOpenAddImageBottomSheet(false);
  };

  const [pickedImage, setPickedImage] = useState(null);

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

  const [vehicleNumber, setVehicleNumber] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [send, setSend] = useState(true);

  // Initialize form with existing data when modal opens
  useEffect(() => {
    console.log('EditVehicleModal - props.entryData:', props.entryData);
    console.log('EditVehicleModal - props.visible:', props.visible);
    if (props.entryData) {
      setVehicleNumber(props.entryData.name || ''); // vehicle_number is mapped to name
      setModel(props.entryData.model || '');
      setColor(props.entryData.color || '');
      setPlateNumber(props.entryData.plate_number || '');
      setPickedImage(props.entryData.image || null);
      console.log('EditVehicleModal - Form initialized with data');
    }
  }, [props.entryData]);

  const handleSubmit = async () => {
    if (!vehicleNumber || !model || !color || !plateNumber) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      if (!activeUserId) {
        Alert.alert('Auth Error', 'Unable to resolve your account. Please sign in again.');
        return;
      }

      const vehicleData = {
        vehicle_number: vehicleNumber,
        model: model,
        color: color,
        plate_number: plateNumber,
        avatar_url: pickedImage,
        user_id: activeUserId,
      };

      await updateVehicle.mutateAsync({
        id: props.entryData.key,
        updates: vehicleData
      });

      Alert.alert('Success', 'Vehicle updated successfully');
      props.onClose();
    } catch (error) {
      console.error('Error updating vehicle:', error);
      Alert.alert('Error', 'Failed to update vehicle. Please try again.');
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={props.visible}
      onRequestClose={props.onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={props.onClose}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <View style={styles.header}>
                  <Text style={styles.headerTitle}>Edit Vehicle</Text>
                  <TouchableOpacity onPress={props.onClose}>
                    <Ionicons name="close" size={24} color={Colors.black} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Image Section */}
                  <View style={styles.imageSection}>
                    <TouchableOpacity
                      style={styles.imageContainer}
                      onPress={() => setOpenAddImageBottomSheet(true)}
                    >
                      {pickedImage ? (
                        <Image source={{ uri: pickedImage }} style={styles.selectedImage} />
                      ) : (
                        <View style={styles.placeholderImage}>
                          <MaterialCommunityIcons name="car" size={30} color={Colors.grey} />
                          <Text style={styles.placeholderText}>Add Vehicle Photo</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Vehicle Number Input */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Vehicle Number</Text>
                    <TextInput
                      style={styles.textInput}
                      value={vehicleNumber}
                      onChangeText={setVehicleNumber}
                      placeholder="Enter vehicle number"
                      placeholderTextColor={Colors.grey}
                    />
                  </View>

                  {/* Model Input */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Model</Text>
                    <TextInput
                      style={styles.textInput}
                      value={model}
                      onChangeText={setModel}
                      placeholder="Enter vehicle model"
                      placeholderTextColor={Colors.grey}
                    />
                  </View>

                  {/* Color Input */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Color</Text>
                    <TextInput
                      style={styles.textInput}
                      value={color}
                      onChangeText={setColor}
                      placeholder="Enter vehicle color"
                      placeholderTextColor={Colors.grey}
                    />
                  </View>

                  {/* Plate Number Input */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Plate Number</Text>
                    <TextInput
                      style={styles.textInput}
                      value={plateNumber}
                      onChangeText={setPlateNumber}
                      placeholder="Enter plate number"
                      placeholderTextColor={Colors.grey}
                    />
                  </View>

                  {/* Send Gate Pass Checkbox */}
                  <View style={styles.checkboxContainer}>
                    <TouchableOpacity
                      style={[
                        styles.checkbox,
                        { backgroundColor: send ? Colors.primary : Colors.white }
                      ]}
                      onPress={() => setSend(!send)}
                    >
                      {send && <Ionicons name="checkmark" size={16} color={Colors.white} />}
                    </TouchableOpacity>
                    <Text style={styles.checkboxText}>Send Gate Pass to Guard</Text>
                  </View>

                  {/* Submit Button */}
                  <View
                    style={{
                      marginBottom: Default.fixPadding * 2,
                    }}
                  >
                    <TouchableOpacity
                      onPress={handleSubmit}
                      style={{
                        height: 50,
                        backgroundColor: Colors.primary,
                        borderRadius: 10,
                        justifyContent: 'center',
                        alignItems: 'center',
                        shadowColor: Colors.primary,
                        shadowOffset: {
                          width: 0,
                          height: 2,
                        },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        elevation: 5,
                      }}
                    >
                      <Text style={{ ...Fonts.SemiBold18white }}>
                        Update Vehicle
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Add Image Bottom Sheet */}
      <AddImageBottomSheet
        visible={openAddImageBottomSheet}
        closeBottomSheet={closeBottomSheet}
        cameraHandler={cameraHandler}
        galleryHandler={galleryHandler}
        removeImage={() => {
          setPickedImage(null);
          closeBottomSheet();
        }}
      />

      {/* Camera Module */}
      {camera && (
        <CameraModule
          visible={camera}
          onClose={() => setShowCamera(false)}
          onImageCaptured={(uri) => {
            setPickedImage(uri);
            setShowCamera(false);
          }}
        />
      )}

      {/* Camera Permission Toast */}
      <SnackbarToast
        visible={cameraNotGranted}
        onDismiss={onDismissCameraNotGranted}
        message="Camera permission is required to take photos"
        type="error"
      />

      {/* Remove Image Toast */}
      <SnackbarToast
        visible={removeImageToast}
        onDismiss={onDismissRemoveImage}
        message="Image removed successfully"
        type="success"
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    width: width - Default.fixPadding * 2,
    maxHeight: height * 0.8,
    padding: Default.fixPadding * 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Default.fixPadding * 2,
  },
  headerTitle: {
    ...Fonts.Bold18black,
  },
  imageSection: {
    alignItems: "center",
    marginBottom: Default.fixPadding * 2,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: "dashed",
  },
  selectedImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.lightGrey,
  },
  placeholderText: {
    ...Fonts.Regular12grey,
    marginTop: Default.fixPadding * 0.5,
  },
  inputContainer: {
    marginBottom: Default.fixPadding * 2,
  },
  inputLabel: {
    ...Fonts.Medium14black,
    marginBottom: Default.fixPadding * 0.5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.lightGrey,
    borderRadius: 10,
    padding: Default.fixPadding,
    ...Fonts.Regular14black,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Default.fixPadding * 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Default.fixPadding,
  },
  checkboxText: {
    ...Fonts.Regular14black,
  },

});

export default EditVehicleModal; 
