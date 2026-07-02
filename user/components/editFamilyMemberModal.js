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
  FlatList,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Alert,
  Platform,
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
import { useUpdateFamilyMember } from "../hooks/useFamilyMembers";
import { useUpdateDailyHelp } from "../hooks/useDailyHelp";
import { useUpdateFrequentEntry } from "../hooks/useFrequentEntries";
import { uploadDirectoryAvatarIfNeeded } from "../utils/directoryAvatarStorage";

const { width, height } = Dimensions.get("window");
const RELATION_LIST = [
  { id: 1, name: "Father" },
  { id: 2, name: "Mother" },
  { id: 3, name: "Son" },
  { id: 4, name: "Daughter" },
  { id: 5, name: "Brother" },
  { id: 6, name: "Sister" },
  { id: 7, name: "Husband" },
  { id: 8, name: "Wife" },
  { id: 9, name: "Grandfather" },
  { id: 10, name: "Grandmother" },
  { id: 11, name: "Uncle" },
  { id: 12, name: "Aunt" },
  { id: 13, name: "Cousin" },
  { id: 14, name: "Nephew" },
  { id: 15, name: "Niece" },
  { id: 16, name: "Son-in-law" },
  { id: 17, name: "Daughter-in-law" },
  { id: 18, name: "Father-in-law" },
  { id: 19, name: "Mother-in-law" },
  { id: 20, name: "Brother-in-law" },
  { id: 21, name: "Sister-in-law" },
  { id: 22, name: "Step-father" },
  { id: 23, name: "Step-mother" },
  { id: 24, name: "Step-son" },
  { id: 25, name: "Step-daughter" },
  { id: 26, name: "Step-brother" },
  { id: 27, name: "Step-sister" },
  { id: 28, name: "Guardian" },
  { id: 29, name: "Other" },
];

const EditFamilyMemberModal = (props) => {
  const { i18n } = useTranslation();
  const { user, profile } = useAuth();
  const updateFamilyMember = useUpdateFamilyMember();
  const updateDailyHelp = useUpdateDailyHelp();
  const updateFrequentEntry = useUpdateFrequentEntry();

  const isRtl = i18n.dir() === "rtl";
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
  const [send, setSend] = useState(true);

  // Initialize form with existing data when modal opens
  useEffect(() => {
    if (props.entryData) {
      setName(props.entryData.name || '');
      setPhoneNumber(props.entryData.phone || '');
      setPickedImage(props.entryData.image || null);
    }
  }, [props.entryData]);

  const [selectedRelation, setSelectedRelation] = useState();
  const [relationText, setRelationText] = useState('');

  // Set selected relation from existing data
  useEffect(() => {
    if (props.entryData && props.entryData.other) {
      if (props.entryType === 'frequent_entry') {
        // For frequent entries, use the text directly
        setRelationText(props.entryData.other);
      } else {
        // For family members and daily help, find in dropdown list
        const relation = RELATION_LIST.find(r => r.name === props.entryData.other);
        if (relation) {
          setSelectedRelation(relation);
        }
      }
    }
  }, [props.entryData, props.entryType]);

  const [showRelationDropdown, setShowRelationDropdown] = useState(false);

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

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: Default.fixPadding,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGrey,
      }}
      onPress={() => selectContact(item)}
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
          {item.name ? item.name.charAt(0).toUpperCase() : '?'}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ ...Fonts.Medium14black }}>{item.name || 'Unknown'}</Text>
        {item.phoneNumbers && item.phoneNumbers.length > 0 && (
          <Text style={{ ...Fonts.Regular12grey }}>{item.phoneNumbers[0].number}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const handleSubmit = async () => {
    if (!name || !phoneNumber) {
      Alert.alert('Error', 'Please fill in name and phone number');
      return;
    }

    if (props.entryType === 'frequent_entry') {
      if (!relationText || relationText.trim().length === 0) {
        Alert.alert('Error', 'Please enter a relation/description');
        return;
      }
    } else {
      if (!selectedRelation) {
        Alert.alert('Error', 'Please select a relation');
        return;
      }
    }

    try {
      if (!activeUserId) {
        Alert.alert('Auth Error', 'Unable to resolve your account. Please sign in again.');
        return;
      }

      const uploadScope = props.entryType === 'family_member'
        ? 'family-members'
        : props.entryType === 'daily_help'
          ? 'daily-help'
          : 'frequent-entries';
      const avatarUrl = await uploadDirectoryAvatarIfNeeded({
        imageUri: pickedImage,
        ownerId: activeUserId,
        scope: uploadScope,
        existingAvatarUrl: props.entryData?.image || null,
      });
      const commonData = {
        name: name.trim(),
        phone: phoneNumber.trim(),
        avatar_url: avatarUrl,
        user_id: activeUserId,
      };

      // Add relation based on entry type
      if (props.entryType === 'frequent_entry') {
        commonData.relation = relationText.trim();
      } else {
        commonData.relation = selectedRelation.name;
      }

      // Update based on entry type
      switch (props.entryType) {
        case 'family_member':
          await updateFamilyMember.mutateAsync({
            id: props.entryData.key,
            updates: commonData
          });
          break;
        case 'daily_help':
          await updateDailyHelp.mutateAsync({
            id: props.entryData.key,
            updates: commonData
          });
          break;
        case 'frequent_entry':
          await updateFrequentEntry.mutateAsync({
            id: props.entryData.key,
            updates: commonData
          });
          break;
        default:
          console.error('Unknown entry type:', props.entryType);
          return;
      }

      Alert.alert('Success', 'Entry updated successfully');
      props.onClose();
    } catch (error) {
      console.error('Error updating entry:', error);
      Alert.alert('Error', 'Failed to update entry. Please try again.');
    }
  };

  const getGatePassMessage = () => {
    switch (props.entryType) {
      case 'family_member':
        return 'Send Gate Pass to Family Member';
      case 'daily_help':
        return 'Send Gate Pass to Guest';
      case 'frequent_entry':
        return 'Send Gate Pass to Guest';
      default:
        return 'Send Gate Pass';
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
                  <Text style={styles.headerTitle}>Edit {props.entryType === 'family_member' ? 'Family Member' : props.entryType === 'daily_help' ? 'Daily Help' : 'Frequent Entry'}</Text>
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
                        name={name || relationText || selectedRelation?.name || "Entry"}
                        seed={`${props.entryType || 'entry'}:${props.entryData?.key || activeUserId || 'resident'}`}
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
                    <Text style={styles.inputLabel}>
                      {props.entryType === 'frequent_entry' ? 'Enter relation/description' : 'Select relation'}
                    </Text>
                    {props.entryType === 'frequent_entry' ? (
                      <TextInput
                        style={styles.textInput}
                        value={relationText}
                        onChangeText={setRelationText}
                        placeholder="Enter relation/description"
                        placeholderTextColor={Colors.grey}
                      />
                    ) : (
                      <>
                        <TouchableOpacity
                          style={styles.dropdownButton}
                          onPress={() => setShowRelationDropdown(!showRelationDropdown)}
                        >
                          <Text style={styles.dropdownText}>
                            {selectedRelation ? selectedRelation.name : "Select relation"}
                          </Text>
                          <Ionicons
                            name={showRelationDropdown ? "chevron-up" : "chevron-down"}
                            size={20}
                            color={Colors.grey}
                          />
                        </TouchableOpacity>
                        {showRelationDropdown && (
                          <View style={styles.dropdownList}>
                            <FlatList
                              data={RELATION_LIST}
                              keyExtractor={(item) => item.id.toString()}
                              showsVerticalScrollIndicator={true}
                              nestedScrollEnabled={true}
                              renderItem={({ item }) => (
                                <TouchableOpacity
                                  style={styles.dropdownItem}
                                  onPress={() => {
                                    setSelectedRelation(item);
                                    setShowRelationDropdown(false);
                                  }}
                                >
                                  <Text style={styles.dropdownItemText}>{item.name}</Text>
                                </TouchableOpacity>
                              )}
                            />
                          </View>
                        )}
                      </>
                    )}
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
                        Update Entry
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
            <FlatList
              data={contacts}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
            />
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

  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.lightGrey,
    borderRadius: 10,
    padding: Default.fixPadding,
  },
  dropdownText: {
    ...Fonts.Regular14black,
  },
  dropdownList: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: Colors.lightGrey,
    borderRadius: 10,
    marginTop: Default.fixPadding * 0.5,
  },
  dropdownItem: {
    padding: Default.fixPadding,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGrey,
  },
  dropdownItemText: {
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
  },
  contactsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Default.fixPadding * 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGrey,
  },
  contactsHeaderTitle: {
    ...Fonts.Bold18black,
  },
});

export default EditFamilyMemberModal; 
