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
  FlatList,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import DashedLine from "react-native-dashed-line";
import AwesomeButton from "react-native-really-awesome-button";
import CameraModule from "./cameraModule";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as Contacts from 'expo-contacts';
import SnackbarToast from "./snackbarToast";
import AddImageBottomSheet from "./addImageBottomSheet";
import GatePassModal from "./gatePassModal";
import AppAvatar from "./AppAvatar";
import { useAuth } from "../contexts/AuthContext";
import { useCreateFamilyMember } from "../hooks/useFamilyMembers";
import { useCreateDailyHelp } from "../hooks/useDailyHelp";
import { useCreateFrequentEntry } from "../hooks/useFrequentEntries";
import { uploadDirectoryAvatarIfNeeded } from "../utils/directoryAvatarStorage";

const { width, height } = Dimensions.get("window");

const AddFamilyMemberModal = (props) => {
  const { t, i18n } = useTranslation();
  const { user, profile } = useAuth();
  const createFamilyMember = useCreateFamilyMember();
  const createDailyHelp = useCreateDailyHelp();
  const createFrequentEntry = useCreateFrequentEntry();

  const isRtl = i18n.dir() == "rtl";
  const activeUserId = user?.id || profile?.user_id || null;

  function tr(key) {
    return t(`addFamilyMemberModal:${key}`);
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

  const [name, setName] = useState();
  const [phoneNumber, setPhoneNumber] = useState();
  const [send, setSend] = useState(true);

  const [subModal, setSubModal] = useState(false);
  
  // Gate pass modal states
  const [openGatePassModal, setOpenGatePassModal] = useState(false);
  const [createdEntry, setCreatedEntry] = useState(null);
  
  // Contact picker states
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. EXPANDED FAMILY RELATIONS LIST
  const relationList = [
    {
      key: "1",
      other: tr("father"),
    },
    {
      key: "2",
      other: tr("mother"),
    },
    {
      key: "3",
      other: tr("son"),
    },
    {
      key: "4",
      other: tr("daughter"),
    },
    {
      key: "5",
      other: tr("wife"),
    },
    {
      key: "6",
      other: tr("husband"),
    },
    {
      key: "7",
      other: tr("brother"),
    },
    {
      key: "8",
      other: tr("sister"),
    },
    {
      key: "9",
      other: tr("grandfather"),
    },
    {
      key: "10",
      other: tr("grandmother"),
    },
    {
      key: "11",
      other: tr("uncle"),
    },
    {
      key: "12",
      other: tr("aunt"),
    },
    {
      key: "13",
      other: tr("cousin"),
    },
    {
      key: "14",
      other: tr("nephew"),
    },
    {
      key: "15",
      other: tr("niece"),
    },
    {
      key: "16",
      other: tr("father-in-law"),
    },
    {
      key: "17",
      other: tr("mother-in-law"),
    },
    {
      key: "18",
      other: tr("son-in-law"),
    },
    {
      key: "19",
      other: tr("daughter-in-law"),
    },
    {
      key: "20",
      other: tr("step-father"),
    },
    {
      key: "21",
      other: tr("step-mother"),
    },
    {
      key: "22",
      other: tr("step-son"),
    },
    {
      key: "23",
      other: tr("step-daughter"),
    },
  ];

  const helpTypeList = [
    {
      key: "1",
      other: tr("made"),
    },
    {
      key: "2",
      other: tr("laundryman"),
    },
    {
      key: "3",
      other: tr("gardner"),
    },
    {
      key: "4",
      other: tr("cook"),
    },
    {
      key: "5",
      other: tr("milkman"),
    },
    {
      key: "6",
      other: tr("driver"),
    },
    {
      key: "7",
      other: tr("security"),
    },
    {
      key: "8",
      other: tr("electrician"),
    },
    {
      key: "9",
      other: tr("plumber"),
    },
    {
      key: "10",
      other: tr("cleaner"),
    },
  ];

  const [selectedType, setSelectedType] = useState();
  const [confirmType, setConfirmType] = useState();

  // 4. CONTACT PICKER FUNCTIONALITY
  const requestContactsPermission = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      return status === 'granted';
    } catch (_error) {
      return false;
    }
  };

  const loadContacts = async () => {
    try {
      const hasPermission = await requestContactsPermission();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Please grant contacts permission to select from your contacts.');
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
      });

      if (data.length > 0) {
        // Filter contacts that have phone numbers and names
        const validContacts = data.filter(contact => 
          contact.name && 
          contact.phoneNumbers && 
          contact.phoneNumbers.length > 0
        ).map(contact => ({
          id: contact.id,
          name: contact.name,
          phoneNumber: contact.phoneNumbers[0].number
        }));
        
        setContacts(validContacts);
        setShowContactPicker(true);
      } else {
        Alert.alert('No Contacts', 'No contacts found on your device.');
      }
    } catch (_error) {
      Alert.alert('Error', 'Failed to load contacts. Please try again.');
    }
  };

  const selectContact = (contact) => {
    if (!contact) return;
    
    const safeName = contact.name || "";
    const safePhone = contact.phoneNumber || "";
    
    setName(safeName);
    setPhoneNumber(safePhone.replace(/[^\d]/g, '').slice(-10)); // Extract digits and take last 10
    setShowContactPicker(false);
    setSearchQuery('');
  };

  const filteredContacts = contacts.filter(contact =>
    (contact.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (contact.phoneNumber || "").includes(searchQuery)
  );

  const renderItem = ({ item }) => {
    const isSelected = selectedType === item.other;

    return (
      <TouchableOpacity
        onPress={() => setSelectedType(item.other)}
        style={{
          flex: 1,
          flexDirection: isRtl ? "row-reverse" : "row",
          alignItems: "center",
          marginTop: Default.fixPadding * 2.5,
          marginHorizontal: Default.fixPadding * 2.6,
        }}
      >
        <MaterialCommunityIcons
          name={isSelected ? "record-circle" : "circle-outline"}
          size={22}
          color={isSelected ? Colors.primary : Colors.grey}
        />
        <Text
          numberOfLines={1}
          style={{
            ...Fonts.Medium16black,
            overflow: "hidden",
            marginHorizontal: Default.fixPadding,
          }}
        >
          {item.other}
        </Text>
      </TouchableOpacity>
    );
  };

  const [relation, setRelation] = useState();

  // 3. IMPROVED MODAL FUNCTIONALITY WITH BETTER VALIDATION
  const handleSubmit = async () => {
    try {
      // Determine the type of data we're creating based on props.id
      const isFamily = props.id === "1";
      const isFrequentEntry = props.id === "2";
      const isDailyHelp = props.id === "3";

      // Enhanced validation
      if (!name || name.trim().length === 0) {
        Alert.alert('Validation Error', 'Please enter a valid name');
        return;
      }

      if (isFamily && (!selectedType || selectedType.trim().length === 0)) {
        Alert.alert('Validation Error', 'Please select a relationship');
        return;
      }
      
      if (isDailyHelp && (!selectedType || selectedType.trim().length === 0)) {
        Alert.alert('Validation Error', 'Please select a help type');
        return;
      }

      if (isFrequentEntry && (!relation || relation.trim().length === 0)) {
        Alert.alert('Validation Error', 'Please enter a relation/description');
        return;
      }

      // Phone number validation (optional but if provided, should be valid)
      if (phoneNumber && phoneNumber.length < 10) {
        Alert.alert('Validation Error', 'Please enter a valid phone number (minimum 10 digits)');
        return;
      }

      if (!activeUserId) {
        Alert.alert('Auth Error', 'Unable to resolve your account. Please sign in again.');
        return;
      }

      const uploadScope = isFamily
        ? 'family-members'
        : isDailyHelp
          ? 'daily-help'
          : 'frequent-entries';
      const avatarUrl = await uploadDirectoryAvatarIfNeeded({
        imageUri: pickedImage,
        ownerId: activeUserId,
        scope: uploadScope,
      });
      const commonData = {
        user_id: activeUserId,
        name: name.trim(),
        phone: phoneNumber?.trim() || null,
        avatar_url: avatarUrl,
      };

      let result;
      if (isFamily) {
        result = await createFamilyMember.mutateAsync({
          ...commonData,
          relation: selectedType,
        });
      } else if (isDailyHelp) {
        result = await createDailyHelp.mutateAsync({
          ...commonData,
          type: selectedType,
        });
      } else if (isFrequentEntry) {
        result = await createFrequentEntry.mutateAsync({
          ...commonData,
          relation: relation,
        });
      }

      if (result) {
        // Store the created entry data for gate pass modal
        setCreatedEntry(result);
        
        // Show success and open gate pass modal
        Alert.alert(
          'Success', 
          'Entry has been created successfully!',
          [
            {
              text: 'OK',
              onPress: () => setOpenGatePassModal(true)
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error adding entry:', error);
      Alert.alert('Error', `Failed to add: ${error.message}`);
    }
  };

  // 2. CONTEXT-SPECIFIC GATE PASS MESSAGE
  const getGatePassMessage = () => {
    switch (props.id) {
      case "1":
        return tr("sendGatePassToFamily");
      case "3":
        return tr("sendGatePassToGuest");
      case "2":
        return tr("sendGatePassToGuest");
      default:
        return tr("sendGateGuest");
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
                  maxHeight: height / 1.6,
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
                      name={name || relation || selectedType || "Entry"}
                      seed={`directory-create:${props.id}:${activeUserId || 'resident'}:${name || relation || selectedType || 'entry'}`}
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
                  {props.id === "1"
                    ? tr("addFamilyMember")
                    : props.id === "3"
                    ? tr("addDailyHelp")
                    : tr("addFrequentEntries")}
                </Text>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  automaticallyAdjustKeyboardInsets={true}
                >
                  <View
                    style={{
                      margin: Default.fixPadding * 2,
                    }}
                  >
                    <Text
                      style={{
                        ...Fonts.Medium16black,
                        textAlign: isRtl ? "right" : "left",
                      }}
                    >
                      {tr("name")}
                    </Text>
                    <View
                      style={{
                        marginBottom: Default.fixPadding * 1.5,
                        ...styles.textInputView,
                      }}
                    >
                      <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder={tr("enterName")}
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
                      {tr("phoneNumber")}
                    </Text>
                    <View
                      style={{
                        flexDirection: isRtl ? "row-reverse" : "row",
                        marginBottom: Default.fixPadding * 1.5,
                        ...styles.textInputView,
                      }}
                    >
                      <TextInput
                        maxLength={15}
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType="number-pad"
                        placeholder={tr("enterPhoneNumber")}
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

                    <Text
                      style={{
                        ...Fonts.Medium16black,
                        textAlign: isRtl ? "right" : "left",
                      }}
                    >
                      {props.id === "3" ? tr("helpType") : tr("relations")}
                    </Text>

                    {props.id === "1" || props.id === "3" ? (
                      <TouchableOpacity
                        onPress={() => setSubModal(true)}
                        style={{
                          flexDirection: isRtl ? "row-reverse" : "row",
                          alignItems: "center",
                          padding: Default.fixPadding * 1.4,
                          marginTop: Default.fixPadding * 0.5,
                          marginBottom: Default.fixPadding,
                          borderRadius: 10,
                          backgroundColor: Colors.white,
                          ...Default.shadow,
                        }}
                      >
                        <Text
                          numberOfLines={1}
                          style={{
                            ...(confirmType
                              ? Fonts.Medium14black
                              : Fonts.Medium14grey),
                            flex: 1,
                            textAlign: isRtl ? "right" : "left",
                            overflow: "hidden",
                            marginRight: isRtl ? 0 : Default.fixPadding,
                            marginLeft: isRtl ? Default.fixPadding : 0,
                          }}
                        >
                          {confirmType
                            ? confirmType
                            : props.id === "3"
                            ? tr("selectHelpType")
                            : tr("selectRelations")}
                        </Text>
                        <Ionicons
                          name="caret-down"
                          size={16}
                          color={Colors.grey}
                          style={{
                            alignItems: isRtl ? "flex-start" : "flex-end",
                          }}
                        />
                      </TouchableOpacity>
                    ) : (
                      <View
                        style={{
                          marginBottom: Default.fixPadding,
                          ...styles.textInputView,
                        }}
                      >
                        <TextInput
                          value={relation}
                          onChangeText={setRelation}
                          placeholder={tr("enterRelations")}
                          placeholderTextColor={Colors.grey}
                          selectionColor={Colors.primary}
                          style={{
                            ...Fonts.Medium14black,
                            textAlign: isRtl ? "right" : "left",
                          }}
                        />
                      </View>
                    )}

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
                        {getGatePassMessage()}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>

                <View
                  style={{
                    margin: Default.fixPadding * 2,
                  }}
                >                  <AwesomeButton
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
      <Modal
        transparent={true}
        animationType="fade"
        visible={subModal}
        onRequestClose={() => setSubModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPressOut={() => setSubModal(false)}
          style={{ flex: 1 }}
        >
          <View style={styles.mainModalView}>
            <TouchableOpacity
              activeOpacity={1}
              style={{ maxHeight: height / 1.6, ...styles.subModalView }}
            >
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  padding: Default.fixPadding * 1.6,
                }}
              >
                <Text style={{ ...Fonts.Medium18primary }}>
                  {props.id === "3" ? tr("helpType") : tr("relation")}
                </Text>
              </View>
              <DashedLine
                dashGap={2.5}
                dashLength={2.5}
                dashThickness={1.5}
                dashColor={Colors.grey}
              />

              <FlatList
                data={props.id === "3" ? helpTypeList : relationList}
                renderItem={renderItem}
                keyExtractor={(item) => item.key}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingBottom: Default.fixPadding * 1.2,
                }}
              />

              <View
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  alignItems: "center",
                  paddingHorizontal: Default.fixPadding * 2.6,
                  marginTop: Default.fixPadding * 1.3,
                  marginBottom: Default.fixPadding * 2.2,
                }}
              >
                <TouchableOpacity
                  onPress={() => setSubModal(false)}
                  style={{
                    marginRight: isRtl ? 0 : Default.fixPadding * 1.5,
                    marginLeft: isRtl ? Default.fixPadding * 1.5 : 0,
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
                    setConfirmType(selectedType);
                    setSubModal(false);
                  }}
                  style={{
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

      {/* Contact Picker Modal */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={showContactPicker}
        onRequestClose={() => setShowContactPicker(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPressOut={() => setShowContactPicker(false)}
          style={{ flex: 1 }}
        >
          <View style={styles.mainModalView}>
            <TouchableWithoutFeedback>
              <View style={{ ...styles.subModalView, maxHeight: height * 0.8, width: width * 0.9 }}>
                <View style={{
                  padding: Default.fixPadding * 1.6,
                  borderBottomWidth: 1,
                  borderBottomColor: Colors.lightGrey,
                }}>
                  <Text style={{ ...Fonts.Medium18primary, textAlign: 'center' }}>
                    Select Contact
                  </Text>
                </View>
                
                <View style={{
                  padding: Default.fixPadding,
                  borderBottomWidth: 1,
                  borderBottomColor: Colors.lightGrey,
                }}>
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search contacts..."
                    placeholderTextColor={Colors.grey}
                    style={{
                      ...Fonts.Medium14black,
                      padding: Default.fixPadding,
                      backgroundColor: Colors.lightGrey,
                      borderRadius: 8,
                    }}
                  />
                </View>

                <FlatList
                  data={filteredContacts}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  style={{ maxHeight: height * 0.5 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => selectContact(item)}
                      style={{
                        padding: Default.fixPadding * 1.2,
                        borderBottomWidth: 1,
                        borderBottomColor: Colors.extraLightGrey,
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
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
                        <Text style={{ ...Fonts.SemiBold16white }}>
                          {(item.name || "").charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ ...Fonts.Medium16black }}>
                          {item.name || "Unknown"}
                        </Text>
                        <Text style={{ ...Fonts.Regular14grey }}>
                          {item.phoneNumber || "No number"}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={() => (
                    <View style={{ 
                      padding: Default.fixPadding * 2,
                      alignItems: 'center' 
                    }}>
                      <Text style={{ ...Fonts.Medium16grey }}>
                        No contacts found
                      </Text>
                    </View>
                  )}
                />

                <View
                  style={{
                    flexDirection: isRtl ? "row-reverse" : "row",
                    alignItems: "center",
                    paddingHorizontal: Default.fixPadding * 2.6,
                    marginTop: Default.fixPadding * 1.3,
                    marginBottom: Default.fixPadding * 2.2,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setShowContactPicker(false)}
                    style={{
                      backgroundColor: Colors.primary,
                      ...styles.cancelOkBtn,
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      style={{ ...Fonts.SemiBold18white, overflow: "hidden" }}
                    >
                      Close
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableOpacity>
      </Modal>
      
      {/* Gate Pass Modal */}
      {openGatePassModal && createdEntry && (
        <GatePassModal
          visible={openGatePassModal}
          modalClose={() => {
            setOpenGatePassModal(false);
            setCreatedEntry(null);
            // Close the main modal and reset form
            props.modalClose();
            setConfirmType("");
            setName("");
            setRelation("");
            setSelectedType();
            setPickedImage();
            setPhoneNumber("");
          }}
          visitorData={{
            visitor_name: createdEntry.name,
            qr_code_data: createdEntry.qr_code,
            entry_code: createdEntry.entry_code
          }}
          onDownloadHandle={() => {
            setOpenGatePassModal(false);
            setCreatedEntry(null);
            props.modalClose();
          }}
          onShareClose={() => {
            setOpenGatePassModal(false);
            setCreatedEntry(null);
            props.modalClose();
          }}
        />
      )}
    </Modal>
  );
};

export default AddFamilyMemberModal;

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
  mainModalView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.transparentBlack,
  },
  subModalView: {
    width: width * 0.9,
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
});


