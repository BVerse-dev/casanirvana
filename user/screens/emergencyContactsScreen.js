import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  Linking,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MyStatusBar from "../components/myStatusBar";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../utils/supabase";
import { getProfileByAuthId } from "../utils/profileResolver";

const DEFAULT_EMERGENCY_CONTACTS = [
  {
    id: "police-default",
    name: "Police Emergency",
    number: "999",
    type: "police",
    icon: "shield-check",
    color: Colors.blue,
    isOfficial: true,
  },
  {
    id: "fire-default",
    name: "Fire Department",
    number: "998",
    type: "fire",
    icon: "fire",
    color: Colors.red,
    isOfficial: true,
  },
  {
    id: "medical-default",
    name: "Medical Emergency",
    number: "997",
    type: "medical",
    icon: "medical-bag",
    color: Colors.green,
    isOfficial: true,
  },
];

const TYPE_ICON_MAP = {
  police: "shield-check",
  security: "security",
  fire: "fire",
  medical: "medical-bag",
  ambulance: "ambulance",
  management: "account-tie",
  maintenance: "tools",
  emergency: "phone-alert",
};

const TYPE_COLOR_MAP = {
  police: Colors.blue,
  security: Colors.primary,
  fire: Colors.red,
  medical: Colors.green,
  ambulance: Colors.green,
  management: Colors.orange,
  maintenance: Colors.purple,
  emergency: Colors.red,
};

const CUSTOM_CONTACT_TYPES = [
  { value: "family", label: "Family" },
  { value: "medical", label: "Medical" },
  { value: "security", label: "Security" },
  { value: "management", label: "Management" },
  { value: "emergency", label: "Other" },
];

const getIconForType = (type) =>
  TYPE_ICON_MAP[String(type || "emergency").toLowerCase()] || TYPE_ICON_MAP.emergency;

const getColorForType = (type) =>
  TYPE_COLOR_MAP[String(type || "emergency").toLowerCase()] || TYPE_COLOR_MAP.emergency;

const normalizePhoneNumber = (phoneNumber) =>
  String(phoneNumber || "").replace(/\s+/g, "").trim();

const normalizeContactObject = (contact, index) => {
  if (typeof contact === "string" || typeof contact === "number") {
    const number = String(contact).trim();
    if (!number) return null;
    return {
      id: `contact-${index}`,
      name: `Emergency Contact ${index + 1}`,
      number,
      type: "emergency",
      icon: getIconForType("emergency"),
      color: getColorForType("emergency"),
      isOfficial: false,
      isCustom: false,
    };
  }

  if (!contact || typeof contact !== "object") {
    return null;
  }

  const number = contact.number || contact.phone || contact.contact || contact.value;
  if (!number) {
    return null;
  }

  const type = contact.type || "emergency";
  return {
    id: contact.id || `contact-${index}`,
    name:
      contact.name ||
      contact.title ||
      contact.label ||
      `Emergency Contact ${index + 1}`,
    number: String(number).trim(),
    type,
    icon: contact.icon || getIconForType(type),
    color: contact.color || getColorForType(type),
    isOfficial: Boolean(contact.isOfficial || contact.is_official || contact.official),
    isCustom: Boolean(contact.isCustom || contact.is_custom),
  };
};

const normalizeEmergencyContacts = (payload) => {
  if (Array.isArray(payload)) {
    return payload
      .map((contact, index) => normalizeContactObject(contact, index))
      .filter(Boolean);
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  if (Array.isArray(payload.contacts)) {
    return payload.contacts
      .map((contact, index) => normalizeContactObject(contact, index))
      .filter(Boolean);
  }

  return Object.entries(payload)
    .map(([key, value], index) => {
      if (typeof value === "string" || typeof value === "number") {
        return normalizeContactObject(
          {
            name: key.replace(/[_-]/g, " "),
            number: String(value),
            type: key,
          },
          index
        );
      }

      if (value && typeof value === "object") {
        return normalizeContactObject(
          {
            ...value,
            type: value.type || key,
          },
          index
        );
      }

      return null;
    })
    .filter(Boolean);
};

const EmergencyContactsScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { user, profile } = useAuth();
  const isRtl = i18n.dir() === "rtl";

  function tr(key) {
    return t(`settingScreen:${key}`);
  }

  const [emergencyContacts, setEmergencyContacts] = useState(DEFAULT_EMERGENCY_CONTACTS);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [isSavingCustomContact, setIsSavingCustomContact] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [customContactName, setCustomContactName] = useState("");
  const [customContactNumber, setCustomContactNumber] = useState("");
  const [customContactType, setCustomContactType] = useState("emergency");

  useEffect(() => {
    let isMounted = true;

    const loadEmergencyContacts = async () => {
      setIsLoadingContacts(true);
      try {
        const profileRecord = user?.id
          ? await getProfileByAuthId(user.id, "id, community_id, preferences")
          : null;

        const communityId = profile?.community_id || profileRecord?.community_id || null;
        const profilePreferences =
          profileRecord?.preferences && typeof profileRecord.preferences === "object"
            ? profileRecord.preferences
            : {};

        const parsedCustomContacts = normalizeEmergencyContacts(
          profilePreferences.custom_emergency_contacts
        ).map((contact, index) => ({
          ...contact,
          id: contact.id || `custom-contact-${index}`,
          isOfficial: false,
          isCustom: true,
          icon: contact.icon || getIconForType(contact.type),
          color: contact.color || getColorForType(contact.type),
        }));

        let parsedCommunityContacts = DEFAULT_EMERGENCY_CONTACTS;

        if (communityId) {
          const { data, error } = await supabase
            .from("community_configurations")
            .select("emergency_contacts")
            .eq("community_id", communityId)
            .maybeSingle();

          if (error) {
            throw error;
          }

          const communityContacts = normalizeEmergencyContacts(data?.emergency_contacts).map(
            (contact) => ({
              ...contact,
              isCustom: false,
              isOfficial: Boolean(contact.isOfficial),
            })
          );

          parsedCommunityContacts =
            communityContacts.length > 0 ? communityContacts : DEFAULT_EMERGENCY_CONTACTS;
        }

        const deduplicatedContacts = [...parsedCommunityContacts, ...parsedCustomContacts].reduce(
          (accumulator, contact) => {
            const uniqueKey = `${contact.name}-${normalizePhoneNumber(contact.number)}-${contact.type}`;
            if (!accumulator.some((entry) => entry.__key === uniqueKey)) {
              accumulator.push({ ...contact, __key: uniqueKey });
            }
            return accumulator;
          },
          []
        );

        if (isMounted) {
          setEmergencyContacts(
            deduplicatedContacts.map(({ __key, ...contact }) => contact)
          );
        }
      } catch (error) {
        console.error("Failed to load emergency contacts:", error);
        if (isMounted) {
          setEmergencyContacts(DEFAULT_EMERGENCY_CONTACTS);
        }
      } finally {
        if (isMounted) {
          setIsLoadingContacts(false);
        }
      }
    };

    loadEmergencyContacts();

    return () => {
      isMounted = false;
    };
  }, [profile?.community_id, refreshToken, user?.id]);

  const handleCallContact = (contact) => {
    const dialableNumber = normalizePhoneNumber(contact.number);
    if (!dialableNumber) {
      Alert.alert("Error", "This contact does not have a valid phone number.");
      return;
    }

    Alert.alert(
      "Call Emergency Contact",
      `Do you want to call ${contact.name} at ${contact.number}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Call",
          onPress: () => {
            Linking.openURL(`tel:${dialableNumber}`);
          },
        },
      ]
    );
  };

  const resetCustomContactForm = () => {
    setCustomContactName("");
    setCustomContactNumber("");
    setCustomContactType("emergency");
  };

  const persistCustomContacts = async (nextCustomContacts) => {
    if (!user?.id) {
      throw new Error("You must be signed in to manage custom contacts.");
    }

    const profileRecord = await getProfileByAuthId(user.id, "id, preferences");
    if (!profileRecord?.id) {
      throw new Error("Profile not found for authenticated user.");
    }

    const existingPreferences =
      profileRecord.preferences && typeof profileRecord.preferences === "object"
        ? profileRecord.preferences
        : {};

    const { error } = await supabase
      .from("profiles")
      .update({
        preferences: {
          ...existingPreferences,
          custom_emergency_contacts: nextCustomContacts,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", profileRecord.id);

    if (error) {
      throw error;
    }
  };

  const handleCreateCustomContact = async () => {
    const trimmedName = customContactName.trim();
    const trimmedNumber = normalizePhoneNumber(customContactNumber);

    if (!trimmedName) {
      Alert.alert("Validation Error", "Contact name is required.");
      return;
    }

    if (!trimmedNumber) {
      Alert.alert("Validation Error", "A valid contact number is required.");
      return;
    }

    setIsSavingCustomContact(true);
    try {
      const profileRecord = await getProfileByAuthId(user?.id, "id, preferences");
      const existingPreferences =
        profileRecord?.preferences && typeof profileRecord.preferences === "object"
          ? profileRecord.preferences
          : {};
      const existingCustomContacts = Array.isArray(existingPreferences.custom_emergency_contacts)
        ? existingPreferences.custom_emergency_contacts
        : [];

      const nextContact = {
        id: `custom-${Date.now()}`,
        name: trimmedName,
        number: trimmedNumber,
        type: customContactType,
        isCustom: true,
        isOfficial: false,
      };

      const nextCustomContacts = [nextContact, ...existingCustomContacts].slice(0, 20);
      await persistCustomContacts(nextCustomContacts);

      setShowAddContactModal(false);
      resetCustomContactForm();
      setRefreshToken((value) => value + 1);
      Alert.alert("Success", "Custom emergency contact saved.");
    } catch (error) {
      console.error("Failed to save custom emergency contact:", error);
      Alert.alert(
        "Error",
        error?.message || "Failed to save custom emergency contact."
      );
    } finally {
      setIsSavingCustomContact(false);
    }
  };

  const handleRemoveCustomContact = (contact) => {
    if (!contact?.isCustom) {
      return;
    }

    Alert.alert(
      "Remove Contact",
      `Remove ${contact.name} from your custom emergency contacts?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setIsSavingCustomContact(true);
            try {
              const profileRecord = await getProfileByAuthId(user?.id, "id, preferences");
              const existingPreferences =
                profileRecord?.preferences && typeof profileRecord.preferences === "object"
                  ? profileRecord.preferences
                  : {};
              const existingCustomContacts = Array.isArray(
                existingPreferences.custom_emergency_contacts
              )
                ? existingPreferences.custom_emergency_contacts
                : [];

              const filteredContacts = existingCustomContacts.filter((entry, index) => {
                const normalized = normalizeContactObject(entry, index);
                if (!normalized) return false;

                return !(
                  normalized.id === contact.id &&
                  normalizePhoneNumber(normalized.number) ===
                    normalizePhoneNumber(contact.number)
                );
              });

              await persistCustomContacts(filteredContacts);
              setRefreshToken((value) => value + 1);
            } catch (error) {
              console.error("Failed to remove custom emergency contact:", error);
              Alert.alert(
                "Error",
                error?.message || "Failed to remove custom emergency contact."
              );
            } finally {
              setIsSavingCustomContact(false);
            }
          },
        },
      ]
    );
  };

  const renderEmergencyContact = ({ item }) => (
    <TouchableOpacity
      style={styles.contactCard}
      onPress={() => handleCallContact(item)}
      onLongPress={() => handleRemoveCustomContact(item)}
      delayLongPress={300}
    >
      <View style={styles.contactLeft}>
        <View style={[styles.iconContainer, { backgroundColor: item.color + "15" }]}>
          <MaterialCommunityIcons
            name={item.icon}
            size={28}
            color={item.color}
          />
        </View>
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.contactNumber}>{item.number}</Text>
          {item.isOfficial && (
            <Text style={styles.officialBadge}>Emergency Service</Text>
          )}
          {item.isCustom && (
            <Text style={styles.customBadge}>Custom Contact</Text>
          )}
        </View>
      </View>
      <View style={styles.contactRight}>
        <TouchableOpacity
          style={[styles.callButton, { backgroundColor: item.color }]}
          onPress={() => handleCallContact(item)}
        >
          <Ionicons name="call" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.extraLightGrey }}>
      <MyStatusBar />
      <View
        style={{
          flexDirection: isRtl ? "row-reverse" : "row",
          alignItems: "center",
          paddingVertical: Default.fixPadding * 1.2,
          paddingHorizontal: Default.fixPadding * 2,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
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
          {tr("emergencyContacts")}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingVertical: Default.fixPadding,
        }}
      >
        <View style={styles.headerSection}>
          <MaterialCommunityIcons
            name="phone-alert"
            size={50}
            color={Colors.red}
          />
          <Text style={styles.title}>Emergency Contacts</Text>
          <Text style={styles.description}>
            Quick access to emergency services and important contacts for your safety and security.
          </Text>
        </View>

        <View style={styles.warningBanner}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={24}
            color={Colors.red}
          />
          <Text style={styles.warningText}>
            For immediate emergencies, call the national emergency numbers directly.
          </Text>
        </View>

        <FlatList
          data={emergencyContacts}
          renderItem={renderEmergencyContact}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: Default.fixPadding * 2,
          }}
        />

        {isLoadingContacts ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading emergency contacts...</Text>
          </View>
        ) : null}

        <View style={styles.addContactSection}>
          <TouchableOpacity
            style={styles.addContactButton}
            onPress={() => {
              resetCustomContactForm();
              setShowAddContactModal(true);
            }}
          >
            <MaterialCommunityIcons
              name="plus-circle"
              size={24}
              color={Colors.primary}
            />
            <Text style={styles.addContactText}>Add Custom Emergency Contact</Text>
          </TouchableOpacity>
          <Text style={styles.addContactHint}>
            Long press a custom contact to remove it from your list.
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Emergency Guidelines:</Text>
          <View style={styles.guidelineItem}>
            <Ionicons name="alert-circle" size={16} color={Colors.red} />
            <Text style={styles.guidelineText}>Stay calm and speak clearly</Text>
          </View>
          <View style={styles.guidelineItem}>
            <Ionicons name="location" size={16} color={Colors.red} />
            <Text style={styles.guidelineText}>Provide your exact location</Text>
          </View>
          <View style={styles.guidelineItem}>
            <Ionicons name="information-circle" size={16} color={Colors.red} />
            <Text style={styles.guidelineText}>Describe the emergency clearly</Text>
          </View>
          <View style={styles.guidelineItem}>
            <Ionicons name="time" size={16} color={Colors.red} />
            <Text style={styles.guidelineText}>Stay on the line until help arrives</Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showAddContactModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddContactModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Custom Contact</Text>
            <Text style={styles.modalDescription}>
              This contact will be visible only to your account.
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Contact name"
              placeholderTextColor={Colors.grey}
              value={customContactName}
              onChangeText={setCustomContactName}
              autoCapitalize="words"
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Phone number"
              placeholderTextColor={Colors.grey}
              value={customContactNumber}
              onChangeText={setCustomContactNumber}
              keyboardType="phone-pad"
            />

            <View style={styles.typeSelectorContainer}>
              {CUSTOM_CONTACT_TYPES.map((typeOption) => (
                <TouchableOpacity
                  key={typeOption.value}
                  style={[
                    styles.typeChip,
                    customContactType === typeOption.value && styles.typeChipSelected,
                  ]}
                  onPress={() => setCustomContactType(typeOption.value)}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      customContactType === typeOption.value && styles.typeChipTextSelected,
                    ]}
                  >
                    {typeOption.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowAddContactModal(false)}
                disabled={isSavingCustomContact}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleCreateCustomContact}
                disabled={isSavingCustomContact}
              >
                {isSavingCustomContact ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Text style={styles.modalSaveButtonText}>Save Contact</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default EmergencyContactsScreen;

const styles = StyleSheet.create({
  headerSection: {
    backgroundColor: Colors.white,
    padding: Default.fixPadding * 2,
    marginHorizontal: Default.fixPadding * 2,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: Default.fixPadding * 2,
    ...Default.shadow,
  },
  title: {
    ...Fonts.SemiBold18primary,
    marginTop: Default.fixPadding,
    marginBottom: Default.fixPadding * 0.5,
  },
  description: {
    ...Fonts.Medium14grey,
    textAlign: "center",
    lineHeight: 22,
  },
  warningBanner: {
    backgroundColor: Colors.red + "10",
    marginHorizontal: Default.fixPadding * 2,
    padding: Default.fixPadding * 1.5,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Default.fixPadding * 2,
    borderLeftWidth: 4,
    borderLeftColor: Colors.red,
  },
  warningText: {
    ...Fonts.Medium14red,
    marginLeft: Default.fixPadding,
    flex: 1,
  },
  contactCard: {
    backgroundColor: Colors.white,
    padding: Default.fixPadding * 1.5,
    borderRadius: 10,
    marginBottom: Default.fixPadding * 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...Default.shadow,
  },
  contactLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Default.fixPadding,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    ...Fonts.SemiBold16black,
    marginBottom: 2,
  },
  contactNumber: {
    ...Fonts.Medium14primary,
    marginBottom: 2,
  },
  officialBadge: {
    ...Fonts.Medium12grey,
    backgroundColor: Colors.green + "15",
    color: Colors.green,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  customBadge: {
    ...Fonts.Medium12grey,
    backgroundColor: Colors.primary + "15",
    color: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginTop: Default.fixPadding * 0.4,
  },
  contactRight: {
    alignItems: "center",
  },
  loadingContainer: {
    marginHorizontal: Default.fixPadding * 2,
    marginTop: Default.fixPadding * 0.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    ...Fonts.Medium13grey,
    marginLeft: Default.fixPadding * 0.6,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  addContactSection: {
    marginHorizontal: Default.fixPadding * 2,
    marginVertical: Default.fixPadding,
  },
  addContactButton: {
    backgroundColor: Colors.white,
    padding: Default.fixPadding * 1.5,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  addContactText: {
    ...Fonts.Medium14primary,
    marginLeft: Default.fixPadding * 0.5,
  },
  addContactHint: {
    ...Fonts.Medium12grey,
    marginTop: Default.fixPadding * 0.6,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    paddingHorizontal: Default.fixPadding * 2,
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Default.fixPadding * 1.5,
    ...Default.shadow,
  },
  modalTitle: {
    ...Fonts.SemiBold18black,
  },
  modalDescription: {
    ...Fonts.Medium13grey,
    marginTop: Default.fixPadding * 0.5,
    marginBottom: Default.fixPadding,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.extraLightGrey,
    borderRadius: 8,
    paddingHorizontal: Default.fixPadding,
    paddingVertical: Default.fixPadding * 0.9,
    marginTop: Default.fixPadding * 0.8,
    ...Fonts.Medium14black,
  },
  typeSelectorContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: Default.fixPadding,
    gap: Default.fixPadding * 0.5,
  },
  typeChip: {
    borderWidth: 1,
    borderColor: Colors.extraLightGrey,
    borderRadius: 16,
    paddingHorizontal: Default.fixPadding,
    paddingVertical: Default.fixPadding * 0.4,
  },
  typeChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "15",
  },
  typeChipText: {
    ...Fonts.Medium12grey,
  },
  typeChipTextSelected: {
    color: Colors.primary,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: Default.fixPadding * 1.5,
  },
  modalButton: {
    minWidth: 110,
    borderRadius: 8,
    paddingVertical: Default.fixPadding * 0.8,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelButton: {
    backgroundColor: Colors.extraLightGrey,
    marginRight: Default.fixPadding * 0.8,
  },
  modalCancelButtonText: {
    ...Fonts.Medium14black,
  },
  modalSaveButton: {
    backgroundColor: Colors.primary,
  },
  modalSaveButtonText: {
    ...Fonts.Medium14white,
    color: Colors.white,
  },
  infoSection: {
    backgroundColor: Colors.white,
    margin: Default.fixPadding * 2,
    padding: Default.fixPadding * 2,
    borderRadius: 10,
    ...Default.shadow,
  },
  infoTitle: {
    ...Fonts.SemiBold16black,
    marginBottom: Default.fixPadding,
  },
  guidelineItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Default.fixPadding * 0.5,
  },
  guidelineText: {
    ...Fonts.Medium14grey,
    marginLeft: Default.fixPadding * 0.5,
    flex: 1,
  },
});
