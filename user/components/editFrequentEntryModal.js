import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Modal,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
} from "react-native";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";

import CameraModule from "./cameraModule";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as Contacts from 'expo-contacts';
import SnackbarToast from "./snackbarToast";
import AddImageBottomSheet from "./addImageBottomSheet";
import AppAvatar from "./AppAvatar";
import { useAuth } from "../contexts/AuthContext";
import { useUpdateFrequentEntry } from "../hooks/useFrequentEntries";
import { uploadDirectoryAvatarIfNeeded } from "../utils/directoryAvatarStorage";

const { width, height } = Dimensions.get("window");

const EditFrequentEntryModal = (props) => {
  const { i18n } = useTranslation();
  const { user, profile } = useAuth();
  const updateFrequentEntry = useUpdateFrequentEntry();

  const isRtl = i18n.dir() == "rtl";
  const activeUserId = user?.id || profile?.user_id || null;

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

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [relationText, setRelationText] = useState('');
  const [send, setSend] = useState(true);

  // Initialize form with existing data when modal opens
  useEffect(() => {
    if (props.entryData) {
      setName(props.entryData.name || '');
      setPhoneNumber(props.entryData.phone || '');
      setPickedImage(props.entryData.image || null);
      setRelationText(props.entryData.other || '');
    }
  }, [props.entryData]);

  const [contacts, setContacts] = useState([]);
  const [showContacts, setShowContacts] = useState(false);
  const [hasContactsPermission, setHasContactsPermission] = useState(false);

  const requestContactsPermission = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    setHasContactsPermission(status === 'granted');
    return status === 'granted';
  };

  const loadContacts = async () => {
    if (!hasContactsPermission) {
      const granted = await requestContactsPermission();
      if (!granted) return;
    }

    try {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
      });

      if (data.length > 0) {
        setContacts(data);
        setShowContacts(true);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const selectContact = (contact) => {
    if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
      setPhoneNumber(contact.phoneNumbers[0].number);
      setName(contact.name || '');
    }
    setShowContacts(false);
  };

  const handleSubmit = async () => {
    if (!name || !phoneNumber) {
      Alert.alert('Error', 'Please fill in name and phone number');
      return;
    }

    if (!relationText || relationText.trim().length === 0) {
      Alert.alert('Error', 'Please enter a relation/description');
      return;
    }

    try {
      if (!activeUserId) {
        Alert.alert('Auth Error', 'Unable to resolve your account. Please sign in again.');
        return;
      }

      const avatarUrl = await uploadDirectoryAvatarIfNeeded({
        imageUri: pickedImage,
        ownerId: activeUserId,
        scope: 'frequent-entries',
        existingAvatarUrl: props.entryData?.image || null,
      });
      const frequentEntryData = {
        name: name.trim(),
        phone: phoneNumber.trim(),
        relation: relationText.trim(),
        avatar_url: avatarUrl,
        user_id: activeUserId,
      };

      await updateFrequentEntry.mutateAsync({
        id: props.entryData.key,
        updates: frequentEntryData
      });

      Alert.alert('Success', 'Frequent entry updated successfully');
      props.onClose();
    } catch (error) {
      console.error('Error updating frequent entry:', error);
      Alert.alert('Error', 'Failed to update frequent entry. Please try again.');
    }
  };

  const getGatePassMessage = () => {
    return 'Send Gate Pass to Guest';
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
              <Text style={styles.headerTitle}>Edit Frequent Entry</Text>
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
                  <AppAvatar
                    avatarUrl={pickedImage}
                    name={name || relationText || "Frequent Entry"}
                    seed={`frequent-entry:${props.entryData?.key || activeUserId || 'resident'}`}
                    size={120}
                    borderRadius={20}
                    style={styles.selectedImage}
                    imageStyle={styles.selectedImage}
                  />
                </TouchableOpacity>
              </View>

              {/* Name Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Enter name</Text>
                <TextInput
                  style={styles.textInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter name"
                  placeholderTextColor={Colors.grey}
                />
              </View>

              {/* Phone Number Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Enter phone number</Text>
                <View
                  style={{
                    flexDirection: isRtl ? "row-reverse" : "row",
                    marginBottom: Default.fixPadding * 1.5,
                    borderWidth: 1,
                    borderColor: Colors.lightGrey,
                    borderRadius: 10,
                    padding: Default.fixPadding,
                  }}
                >
                  <TextInput
                    maxLength={15}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="number-pad"
                    placeholder="Enter phone number"
                    placeholderTextColor={Colors.grey}
                    selectionColor={Colors.primary}
                    style={{
                      ...Fonts.Medium14black,
                      flex: 1,
                      textAlign: isRtl ? "right" : "left",
                      marginRight: isRtl ? 0 : Default.fixPadding,
                      marginLeft: isRtl ? Default.fixPadding : 0,
                    }}
                  />
                  <TouchableOpacity
                    onPress={loadContacts}
                    style={{
                      marginLeft: Default.fixPadding * 0.5,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name="person-circle-outline"
                      size={24}
                      color={Colors.primary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Relation Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Enter relation/description</Text>
                <TextInput
                  style={styles.textInput}
                  value={relationText}
                  onChangeText={setRelationText}
                  placeholder="Enter relation/description"
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
                <Text style={styles.checkboxText}>{getGatePassMessage()}</Text>
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
                    Update Frequent Entry
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

      {/* Contacts Modal */}
      <Modal
        visible={showContacts}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowContacts(false)}
      >
        <View style={styles.contactsModalOverlay}>
          <View style={styles.contactsModalContent}>
            <View style={styles.contactsHeader}>
              <Text style={styles.contactsHeaderTitle}>Select Contact</Text>
              <TouchableOpacity onPress={() => setShowContacts(false)}>
                <Ionicons name="close" size={24} color={Colors.black} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {contacts.map((contact, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: Default.fixPadding,
                    borderBottomWidth: 1,
                    borderBottomColor: Colors.lightGrey,
                  }}
                  onPress={() => selectContact(contact)}
                >
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: Colors.primary,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: Default.fixPadding,
                  }}>
                    <Text style={{ ...Fonts.Bold14white }}>
                      {contact.name ? contact.name.charAt(0).toUpperCase() : '?'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ ...Fonts.Medium14black }}>{contact.name || 'Unknown'}</Text>
                    {contact.phoneNumbers && contact.phoneNumbers.length > 0 && (
                      <Text style={{ ...Fonts.Regular12grey }}>{contact.phoneNumbers[0].number}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

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
    ...Fonts.Medium12grey,
    marginTop: Default.fixPadding * 0.5,
  },
  inputContainer: {
    marginBottom: Default.fixPadding * 1.5,
  },
  inputLabel: {
    ...Fonts.Medium16black,
    marginBottom: Default.fixPadding * 0.5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.lightGrey,
    borderRadius: 10,
    padding: Default.fixPadding,
    ...Fonts.Medium14black,
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
    borderWidth: 1,
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Default.fixPadding,
  },
  checkboxText: {
    ...Fonts.Medium14grey,
    flex: 1,
  },
  contactsModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  contactsModalContent: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    width: width - Default.fixPadding * 2,
    maxHeight: height * 0.6,
    padding: Default.fixPadding * 2,
  },
  contactsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Default.fixPadding * 2,
  },
  contactsHeaderTitle: {
    ...Fonts.Bold18black,
  },
});

export default EditFrequentEntryModal; 
