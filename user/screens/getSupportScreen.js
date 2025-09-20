import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  ScrollView,
  Image,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import MyStatusBar from "../components/myStatusBar";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { ms } from "react-native-size-matters/extend";

const GetSupportScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`getSupportScreen:${key}`);
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

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [customIssue, setCustomIssue] = useState("");
  const [message, setMessage] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const supportCategories = [
    {
      id: "technical",
      title: "Technical Issues",
      description: "App bugs, login problems, crashes",
      icon: "bug",
      color: Colors.red,
    },
    {
      id: "account",
      title: "Account & Profile",
      description: "Profile settings, account management",
      icon: "account-circle",
      color: Colors.blue,
    },
    {
      id: "payment",
      title: "Payment & Billing",
      description: "Payment methods, billing issues",
      icon: "credit-card",
      color: Colors.green,
    },
    {
      id: "community",
      title: "Community Issues",
      description: "Society management, member issues",
      icon: "home-group",
      color: Colors.orange,
    },
    {
      id: "services",
      title: "Service Providers",
      description: "Booking issues, service complaints",
      icon: "tools",
      color: Colors.purple || Colors.primary,
    },
    {
      id: "notifications",
      title: "Notifications",
      description: "Push notifications, alerts settings",
      icon: "bell",
      color: Colors.teal || Colors.primary,
    },
    {
      id: "privacy",
      title: "Privacy & Security",
      description: "Data privacy, security concerns",
      icon: "shield-check",
      color: Colors.darkGreen || Colors.primary,
    },
    {
      id: "other",
      title: "Other",
      description: "Something else not listed above",
      icon: "dots-horizontal",
      color: Colors.grey,
    },
  ];

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowCategoryModal(false);
    
    if (category.id === "other") {
      setShowCustomInput(true);
    } else {
      setShowCustomInput(false);
      setCustomIssue("");
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
          {tr("getSupport")}
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
            marginTop: Default.fixPadding * 0.8,
            marginBottom: Default.fixPadding * 5,
            marginHorizontal: Default.fixPadding * 2,
          }}
        >
          <Image
            source={require("../assets/images/customerCare.png")}
            style={{ width: ms(120), height: ms(120), resizeMode: "contain" }}
          />
          <Text
            style={{
              ...Fonts.SemiBold18black,
              marginTop: Default.fixPadding * 1.5,
            }}
          >
            {tr("getSupport")}
          </Text>
          <Text
            style={{
              ...Fonts.Medium16grey,
              textAlign: "center",
              marginTop: Default.fixPadding,
            }}
          >
            {tr("askSuggestImprove")}
          </Text>
        </View>

        <View style={{ marginHorizontal: Default.fixPadding * 2 }}>
          {/* Support Category Selection */}
          <Text style={styles.sectionTitle}>
            What can we help you with?
          </Text>
          
          <TouchableOpacity
            style={styles.categorySelector}
            onPress={() => setShowCategoryModal(true)}
          >
            <View style={styles.categorySelectorContent}>
              {selectedCategory ? (
                <>
                  <View style={styles.selectedCategoryIcon}>
                    <MaterialCommunityIcons
                      name={selectedCategory.icon}
                      size={24}
                      color={selectedCategory.color}
                    />
                  </View>
                  <View style={styles.selectedCategoryText}>
                    <Text style={styles.selectedCategoryTitle}>
                      {selectedCategory.title}
                    </Text>
                    <Text style={styles.selectedCategoryDescription}>
                      {selectedCategory.description}
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.placeholderIcon}>
                    <MaterialCommunityIcons
                      name="hand-pointing-right"
                      size={24}
                      color={Colors.grey}
                    />
                  </View>
                  <View style={styles.placeholderText}>
                    <Text style={styles.placeholderTitle}>
                      Select support category
                    </Text>
                    <Text style={styles.placeholderDescription}>
                      Choose the type of help you need
                    </Text>
                  </View>
                </>
              )}
            </View>
            <MaterialCommunityIcons
              name="chevron-down"
              size={20}
              color={Colors.grey}
            />
          </TouchableOpacity>

          {/* Custom Issue Input (for "Other" category) */}
          {showCustomInput && (
            <>
              <Text style={styles.sectionTitle}>
                Please specify your issue
              </Text>
              <View style={styles.textInputView}>
                <TextInput
                  value={customIssue}
                  onChangeText={setCustomIssue}
                  placeholder="Describe the type of support you need..."
                  placeholderTextColor={Colors.grey}
                  selectionColor={Colors.primary}
                  style={{
                    ...Fonts.Medium14black,
                    textAlign: isRtl ? "right" : "left",
                  }}
                />
              </View>
            </>
          )}

          {/* Message Section */}
          <Text style={styles.sectionTitle}>
            {tr("message")}
          </Text>
          <View style={styles.textInputView}>
            <TextInput
              multiline={true}
              numberOfLines={7}
              value={message}
              textAlignVertical="top"
              onChangeText={setMessage}
              placeholder={tr("enterYourMessage")}
              placeholderTextColor={Colors.grey}
              selectionColor={Colors.primary}
              style={{
                ...Fonts.Medium14black,
                textAlign: isRtl ? "right" : "left",
                height: ms(160),
              }}
            />
          </View>
        </View>
      </ScrollView>

      <View
        style={{
          margin: Default.fixPadding * 2,
        }}
      >
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!selectedCategory || !message.trim()) && styles.disabledButton
          ]}
          disabled={!selectedCategory || !message.trim()}
          onPress={() => {
            const issueType = selectedCategory.id === 'other' ? customIssue : selectedCategory.title;
            Alert.alert(
              'Support Request Submitted',
              `Your ${issueType} request has been submitted successfully. Our support team will get back to you within 24 hours.`,
              [{ text: 'OK', onPress: () => navigation.pop() }]
            );
          }}
        >
          <Text style={styles.submitButtonText}>
            {tr("submitMessage")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCategoryModal}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Support Category</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowCategoryModal(false)}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={Colors.grey}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.categoriesList}
              showsVerticalScrollIndicator={false}
            >
              {supportCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryOption,
                    selectedCategory?.id === category.id && styles.selectedCategoryOption
                  ]}
                  onPress={() => handleCategorySelect(category)}
                >
                  <View style={[styles.categoryIconContainer, { backgroundColor: `${category.color}20` }]}>
                    <MaterialCommunityIcons
                      name={category.icon}
                      size={28}
                      color={category.color}
                    />
                  </View>
                  <View style={styles.categoryDetails}>
                    <Text style={styles.categoryTitle}>{category.title}</Text>
                    <Text style={styles.categoryDescription}>{category.description}</Text>
                  </View>
                  {selectedCategory?.id === category.id && (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={24}
                      color={Colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default GetSupportScreen;

const styles = StyleSheet.create({
  textInputView: {
    paddingHorizontal: Default.fixPadding * 1.4,
    paddingVertical: Default.fixPadding * 1.2,
    marginTop: Default.fixPadding * 0.5,
    marginBottom: Default.fixPadding * 2,
    borderRadius: 10,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  sectionTitle: {
    ...Fonts.SemiBold16black,
    marginBottom: Default.fixPadding * 0.8,
    marginTop: Default.fixPadding,
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Default.fixPadding * 1.4,
    paddingVertical: Default.fixPadding * 1.2,
    marginBottom: Default.fixPadding * 2,
    borderRadius: 10,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.extraLightGrey,
    ...Default.shadow,
  },
  categorySelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedCategoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.extraLightGrey,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Default.fixPadding,
  },
  selectedCategoryText: {
    flex: 1,
  },
  selectedCategoryTitle: {
    ...Fonts.SemiBold14black,
    marginBottom: 2,
  },
  selectedCategoryDescription: {
    ...Fonts.Medium12grey,
  },
  placeholderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.extraLightGrey,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Default.fixPadding,
  },
  placeholderText: {
    flex: 1,
  },
  placeholderTitle: {
    ...Fonts.Medium14grey,
    marginBottom: 2,
  },
  placeholderDescription: {
    ...Fonts.Medium12grey,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 1.2,
    borderRadius: 10,
    minHeight: 50,
    width: "100%",
    backgroundColor: Colors.primary,
    ...Default.shadow,
    elevation: 3,
  },
  submitButtonText: {
    ...Fonts.SemiBold16white,
  },
  disabledButton: {
    backgroundColor: Colors.lightGrey,
    opacity: 0.6,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: Default.fixPadding,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Default.fixPadding * 2,
    paddingBottom: Default.fixPadding,
    borderBottomWidth: 1,
    borderBottomColor: Colors.extraLightGrey,
  },
  modalTitle: {
    ...Fonts.SemiBold18black,
  },
  modalCloseButton: {
    padding: Default.fixPadding * 0.5,
  },
  categoriesList: {
    paddingHorizontal: Default.fixPadding * 2,
    paddingTop: Default.fixPadding,
    paddingBottom: Default.fixPadding * 2,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Default.fixPadding * 1.2,
    paddingHorizontal: Default.fixPadding,
    marginBottom: Default.fixPadding,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.extraLightGrey,
    ...Default.shadow,
    elevation: 2,
  },
  selectedCategoryOption: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}05`,
  },
  categoryIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Default.fixPadding * 1.2,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryTitle: {
    ...Fonts.SemiBold16black,
    marginBottom: 4,
  },
  categoryDescription: {
    ...Fonts.Medium14grey,
    lineHeight: 18,
  },
});
