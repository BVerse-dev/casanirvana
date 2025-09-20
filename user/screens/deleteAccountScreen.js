import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MyStatusBar from "../components/myStatusBar";

const DeleteAccountScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`settingScreen:${key}`);
  }

  const [step, setStep] = useState(1); // 1: Warning, 2: Confirmation, 3: Final Confirmation
  const [reasonSelected, setReasonSelected] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Alternative modals state
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // Alternative handlers
  const exportData = () => setShowExportModal(true);
  const deactivateAccount = () => setShowDeactivateModal(true);
  const contactSupport = () => setShowContactModal(true);

  const deleteReasons = [
    { id: "privacy", text: "Privacy concerns", icon: "shield-alert" },
    { id: "not_using", text: "Not using the app anymore", icon: "clock-outline" },
    { id: "too_many_notifications", text: "Too many notifications", icon: "bell-off-outline" },
    { id: "found_alternative", text: "Found a better alternative", icon: "swap-horizontal" },
    { id: "technical_issues", text: "Technical issues", icon: "bug" },
    { id: "moving_out", text: "Moving out of community", icon: "home-minus" },
    { id: "other", text: "Other reason", icon: "dots-horizontal" },
  ];

  const [accountData] = useState({
    profile: "Personal information, preferences",
    payments: "Payment methods, billing history",
    bookings: "Service bookings, maintenance requests", 
    communications: "Messages, notifications, chat history",
    community: "Member directory access, society information",
    documents: "Uploaded documents, verification files",
  });

  const confirmDeletion = () => {
    if (confirmationText.toLowerCase() !== "delete my account") {
      Alert.alert("Error", "Please type 'DELETE MY ACCOUNT' to confirm.");
      return;
    }

    Alert.alert(
      "Final Confirmation",
      "This is your last chance to cancel. Are you absolutely sure you want to permanently delete your account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Forever",
          style: "destructive",
          onPress: processDeletion,
        },
      ]
    );
  };

  const processDeletion = () => {
    setIsDeleting(true);
    // Simulate deletion process
    setTimeout(() => {
      setIsDeleting(false);
      Alert.alert(
        "Account Deleted",
        "Your account has been permanently deleted. We're sorry to see you go!",
        [{ text: "OK", onPress: () => navigation.navigate("loginScreen") }]
      );
    }, 3000);
  };


  const renderStep1 = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.warningSection}>
        <MaterialCommunityIcons
          name="alert-circle"
          size={60}
          color={Colors.red}
        />
        <Text style={styles.warningTitle}>Delete Account</Text>
        <Text style={styles.warningText}>
          This action is permanent and cannot be undone. All your data will be permanently deleted.
        </Text>
      </View>

      <View style={styles.dataSection}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="database" size={20} color={Colors.red} />
          <Text style={styles.sectionTitle}>Data to be Deleted</Text>
        </View>
        
        {Object.entries(accountData).map(([key, description]) => (
          <View key={key} style={styles.dataItem}>
            <MaterialCommunityIcons name="close-circle" size={20} color={Colors.red} />
            <View style={styles.dataInfo}>
              <Text style={styles.dataTitle}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
              <Text style={styles.dataDescription}>{description}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.alternativesSection}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="lightbulb-on" size={20} color={Colors.orange} />
          <Text style={styles.sectionTitle}>Consider These Alternatives</Text>
        </View>
        
        <TouchableOpacity style={styles.alternativeItem} onPress={exportData}>
          <MaterialCommunityIcons name="download" size={24} color={Colors.blue} />
          <View style={styles.alternativeInfo}>
            <Text style={styles.alternativeTitle}>Export Your Data</Text>
            <Text style={styles.alternativeDescription}>
              Download a copy of your data before deleting
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.alternativeItem} onPress={deactivateAccount}>
          <MaterialCommunityIcons name="pause-circle" size={24} color={Colors.green} />
          <View style={styles.alternativeInfo}>
            <Text style={styles.alternativeTitle}>Deactivate Account</Text>
            <Text style={styles.alternativeDescription}>
              Temporarily disable your account instead
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.alternativeItem} onPress={contactSupport}>
          <MaterialCommunityIcons name="help-circle" size={24} color={Colors.primary} />
          <View style={styles.alternativeInfo}>
            <Text style={styles.alternativeTitle}>Contact Support</Text>
            <Text style={styles.alternativeDescription}>
              Let us help resolve any issues you're facing
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
        </TouchableOpacity>
      </View>

      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => setStep(2)}
        >
          <Text style={styles.deleteButtonText}>Continue with Deletion</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Keep My Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.reasonSection}>
        <Text style={styles.reasonTitle}>Help us improve</Text>
        <Text style={styles.reasonSubtitle}>
          Why are you deleting your account? (Optional)
        </Text>
        
        {deleteReasons.map((reason) => (
          <TouchableOpacity
            key={reason.id}
            style={[
              styles.reasonItem,
              reasonSelected === reason.id && styles.reasonItemSelected,
            ]}
            onPress={() => setReasonSelected(reason.id)}
          >
            <MaterialCommunityIcons
              name={reason.icon}
              size={24}
              color={reasonSelected === reason.id ? Colors.white : Colors.grey}
            />
            <Text
              style={[
                styles.reasonText,
                reasonSelected === reason.id && styles.reasonTextSelected,
              ]}
            >
              {reason.text}
            </Text>
            {reasonSelected === reason.id && (
              <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
            )}
          </TouchableOpacity>
        ))}
        
        {reasonSelected === "other" && (
          <TextInput
            style={styles.otherReasonInput}
            placeholder="Please tell us more..."
            placeholderTextColor={Colors.grey}
            value={otherReason}
            onChangeText={setOtherReason}
            multiline={true}
            numberOfLines={3}
          />
        )}
      </View>

      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => setStep(3)}
        >
          <Text style={styles.deleteButtonText}>Proceed to Final Step</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setStep(1)}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderStep3 = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.finalSection}>
        <MaterialCommunityIcons
          name="alert-octagon"
          size={80}
          color={Colors.red}
        />
        <Text style={styles.finalTitle}>Final Confirmation</Text>
        <Text style={styles.finalText}>
          This is your last chance to change your mind. Once you confirm, your account and all associated data will be permanently deleted within 24 hours.
        </Text>
      </View>

      <View style={styles.confirmationSection}>
        <Text style={styles.confirmationLabel}>
          Type "DELETE MY ACCOUNT" to confirm:
        </Text>
        <TextInput
          style={styles.confirmationInput}
          placeholder="DELETE MY ACCOUNT"
          placeholderTextColor={Colors.grey}
          value={confirmationText}
          onChangeText={setConfirmationText}
          autoCapitalize="characters"
        />
      </View>

      {isDeleting && (
        <View style={styles.deletingSection}>
          <MaterialCommunityIcons name="loading" size={30} color={Colors.red} />
          <Text style={styles.deletingText}>Deleting your account...</Text>
          <Text style={styles.deletingSubtext}>This may take a few moments</Text>
        </View>
      )}

      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={[
            styles.actionButton, 
            styles.deleteButton,
            (isDeleting || confirmationText.toLowerCase() !== "delete my account") && styles.disabledButton
          ]}
          onPress={confirmDeletion}
          disabled={isDeleting || confirmationText.toLowerCase() !== "delete my account"}
        >
          <Text style={styles.deleteButtonText}>
            {isDeleting ? "Deleting..." : "Delete My Account Forever"}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setStep(2)}
          disabled={isDeleting}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={isDeleting}
        >
          <Text style={styles.cancelButtonText}>Cancel Deletion</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
          {tr("deleteAccount")}
        </Text>
      </View>

      {/* Progress Steps */}
      <View style={styles.progressSection}>
        <View style={styles.progressSteps}>
          {[1, 2, 3].map((stepNum) => (
            <View key={stepNum} style={styles.stepContainer}>
              <View
                style={[
                  styles.stepCircle,
                  step >= stepNum && styles.stepCircleActive,
                ]}
              >
                <Text
                  style={[
                    styles.stepNumber,
                    step >= stepNum && styles.stepNumberActive,
                  ]}
                >
                  {stepNum}
                </Text>
              </View>
              {stepNum < 3 && (
                <View
                  style={[
                    styles.stepLine,
                    step > stepNum && styles.stepLineActive,
                  ]}
                />
              )}
            </View>
          ))}
        </View>
        <View style={styles.stepLabels}>
          <Text style={styles.stepLabel}>Warning</Text>
          <Text style={styles.stepLabel}>Reason</Text>
          <Text style={styles.stepLabel}>Confirm</Text>
        </View>
      </View>

      <View style={styles.contentContainer}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </View>

      {/* Export Data Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showExportModal}
        onRequestClose={() => setShowExportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons 
                name="download" 
                size={50} 
                color={Colors.blue} 
              />
              <Text style={styles.modalTitle}>Export Your Data</Text>
            </View>
            
            <Text style={styles.modalMessage}>
              We'll prepare a comprehensive export of your data including:
              {'\n\n'}• Profile information and preferences{'\n'}
              • Payment methods and billing history{'\n'}
              • Service bookings and maintenance requests{'\n'}
              • Messages and communication history{'\n'}
              • Community interactions and notifications
              {'\n\n'}
              The export will be sent to your registered email address within 24 hours.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setShowExportModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={() => {
                  setShowExportModal(false);
                  Alert.alert('Export Requested', 'Your data export has been initiated. You will receive an email with download instructions within 24 hours.');
                }}
              >
                <Text style={styles.confirmButtonText}>Export</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Deactivate Account Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showDeactivateModal}
        onRequestClose={() => setShowDeactivateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons 
                name="pause-circle" 
                size={50} 
                color={Colors.green} 
              />
              <Text style={styles.modalTitle}>Deactivate Account</Text>
            </View>
            
            <Text style={styles.modalMessage}>
              Deactivating your account will:
              {'\n\n'}• Hide your profile from other community members{'\n'}
              • Pause all notifications and communications{'\n'}
              • Preserve all your data and settings{'\n'}
              • Allow you to reactivate anytime by logging in
              {'\n\n'}
              This is a reversible alternative to permanent deletion.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setShowDeactivateModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={() => {
                  setShowDeactivateModal(false);
                  Alert.alert('Account Deactivated', 'Your account has been deactivated. You can reactivate it anytime by logging in.');
                  navigation.goBack();
                }}
              >
                <Text style={styles.confirmButtonText}>Deactivate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Contact Support Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showContactModal}
        onRequestClose={() => setShowContactModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons 
                name="help-circle" 
                size={50} 
                color={Colors.primary} 
              />
              <Text style={styles.modalTitle}>Contact Support</Text>
            </View>
            
            <Text style={styles.modalMessage}>
              Our support team is here to help! We can assist with:
              {'\n\n'}• Technical issues and bug reports{'\n'}
              • Account and privacy concerns{'\n'}
              • Feature requests and feedback{'\n'}
              • Community and building management{'\n'}
              • Payment and billing questions
              {'\n\n'}
              Choose how you'd like to reach us:
            </Text>

            <View style={styles.contactOptions}>
              <TouchableOpacity 
                style={styles.contactOption}
                onPress={() => {
                  setShowContactModal(false);
                  Alert.alert('Email Support', 'Opening your email app to contact support@casanirvana.com');
                }}
              >
                <MaterialCommunityIcons name="email" size={24} color={Colors.primary} />
                <Text style={styles.contactOptionText}>Email Support</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.contactOption}
                onPress={() => {
                  setShowContactModal(false);
                  Alert.alert('Live Chat', 'Connecting you to our live chat support...');
                }}
              >
                <MaterialCommunityIcons name="chat" size={24} color={Colors.green} />
                <Text style={styles.contactOptionText}>Live Chat</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowContactModal(false)}
            >
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DeleteAccountScreen;

const styles = StyleSheet.create({
  progressSection: {
    backgroundColor: Colors.white,
    marginHorizontal: Default.fixPadding * 2,
    marginBottom: Default.fixPadding * 2,
    padding: Default.fixPadding * 1.5,
    borderRadius: 10,
    ...Default.shadow,
  },
  progressSteps: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Default.fixPadding,
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.lightGrey,
    justifyContent: "center",
    alignItems: "center",
  },
  stepCircleActive: {
    backgroundColor: Colors.red,
  },
  stepNumber: {
    ...Fonts.Medium14grey,
  },
  stepNumberActive: {
    ...Fonts.Medium14white,
  },
  stepLine: {
    width: 50,
    height: 2,
    backgroundColor: Colors.lightGrey,
  },
  stepLineActive: {
    backgroundColor: Colors.red,
  },
  stepLabels: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  stepLabel: {
    ...Fonts.Medium12grey,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: Default.fixPadding * 2,
  },
  warningSection: {
    backgroundColor: Colors.white,
    padding: Default.fixPadding * 2,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: Default.fixPadding * 2,
    ...Default.shadow,
  },
  warningTitle: {
    ...Fonts.SemiBold20red,
    marginTop: Default.fixPadding,
    marginBottom: Default.fixPadding * 0.5,
  },
  warningText: {
    ...Fonts.Medium14grey,
    textAlign: "center",
    lineHeight: 22,
  },
  dataSection: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    marginBottom: Default.fixPadding * 2,
    ...Default.shadow,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: Default.fixPadding * 1.5,
    borderBottomWidth: 1,
    borderBottomColor: Colors.extraLightGrey,
  },
  sectionTitle: {
    ...Fonts.SemiBold16red,
    marginLeft: Default.fixPadding * 0.5,
  },
  dataItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Default.fixPadding * 1.5,
    borderBottomWidth: 1,
    borderBottomColor: Colors.extraLightGrey,
  },
  dataInfo: {
    flex: 1,
    marginLeft: Default.fixPadding,
  },
  dataTitle: {
    ...Fonts.Medium15black,
    marginBottom: 2,
  },
  dataDescription: {
    ...Fonts.Medium12grey,
  },
  alternativesSection: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    marginBottom: Default.fixPadding * 2,
    ...Default.shadow,
  },
  alternativeItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Default.fixPadding * 1.5,
    borderBottomWidth: 1,
    borderBottomColor: Colors.extraLightGrey,
  },
  alternativeInfo: {
    flex: 1,
    marginLeft: Default.fixPadding,
  },
  alternativeTitle: {
    ...Fonts.Medium15black,
    marginBottom: 2,
  },
  alternativeDescription: {
    ...Fonts.Medium12grey,
  },
  reasonSection: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: Default.fixPadding * 1.5,
    marginBottom: Default.fixPadding * 2,
    ...Default.shadow,
  },
  reasonTitle: {
    ...Fonts.SemiBold18black,
    marginBottom: Default.fixPadding * 0.5,
  },
  reasonSubtitle: {
    ...Fonts.Medium14grey,
    marginBottom: Default.fixPadding * 1.5,
  },
  reasonItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Default.fixPadding,
    borderRadius: 8,
    marginBottom: Default.fixPadding,
    backgroundColor: Colors.extraLightGrey,
  },
  reasonItemSelected: {
    backgroundColor: Colors.red,
  },
  reasonText: {
    ...Fonts.Medium14grey,
    flex: 1,
    marginLeft: Default.fixPadding,
  },
  reasonTextSelected: {
    ...Fonts.Medium14white,
  },
  otherReasonInput: {
    backgroundColor: Colors.extraLightGrey,
    borderRadius: 8,
    padding: Default.fixPadding,
    marginTop: Default.fixPadding,
    ...Fonts.Medium14black,
    textAlignVertical: "top",
  },
  finalSection: {
    backgroundColor: Colors.white,
    padding: Default.fixPadding * 2,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: Default.fixPadding * 2,
    ...Default.shadow,
  },
  finalTitle: {
    ...Fonts.SemiBold20red,
    marginTop: Default.fixPadding,
    marginBottom: Default.fixPadding * 0.5,
  },
  finalText: {
    ...Fonts.Medium14grey,
    textAlign: "center",
    lineHeight: 22,
  },
  confirmationSection: {
    backgroundColor: Colors.white,
    padding: Default.fixPadding * 1.5,
    borderRadius: 10,
    marginBottom: Default.fixPadding * 2,
    ...Default.shadow,
  },
  confirmationLabel: {
    ...Fonts.Medium14black,
    marginBottom: Default.fixPadding,
  },
  confirmationInput: {
    backgroundColor: Colors.extraLightGrey,
    borderRadius: 8,
    padding: Default.fixPadding,
    ...Fonts.Medium14black,
  },
  deletingSection: {
    backgroundColor: Colors.white,
    padding: Default.fixPadding * 2,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: Default.fixPadding * 2,
    ...Default.shadow,
  },
  deletingText: {
    ...Fonts.Medium16red,
    marginTop: Default.fixPadding,
  },
  deletingSubtext: {
    ...Fonts.Medium12grey,
    marginTop: Default.fixPadding * 0.5,
  },
  actionsSection: {
    paddingBottom: Default.fixPadding * 2,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 1.2,
    borderRadius: 10,
    minHeight: 50,
    width: "100%",
    marginBottom: Default.fixPadding,
    ...Default.shadow,
    elevation: 3,
  },
  deleteButton: {
    backgroundColor: Colors.primary,
  },
  disabledButton: {
    backgroundColor: Colors.lightGrey,
    opacity: 0.6,
  },
  deleteButtonText: {
    ...Fonts.SemiBold16white,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 1.2,
    borderRadius: 10,
    minHeight: 50,
    width: "100%",
    marginBottom: Default.fixPadding * 0.5,
    backgroundColor: Colors.lightGrey,
    borderWidth: 1,
    borderColor: Colors.grey,
    ...Default.shadow,
    elevation: 2,
  },
  cancelButtonText: {
    ...Fonts.SemiBold16black,
    color: Colors.darkGrey,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 1.2,
    borderRadius: 10,
    minHeight: 50,
    width: "100%",
    marginBottom: Default.fixPadding * 0.5,
    backgroundColor: Colors.lightGrey,
    borderWidth: 1,
    borderColor: Colors.grey,
    ...Default.shadow,
    elevation: 2,
  },
  backButtonText: {
    ...Fonts.SemiBold16black,
    color: Colors.darkGrey,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Default.fixPadding * 2,
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: Default.fixPadding * 2,
    maxWidth: '100%',
    width: '100%',
    ...Default.shadow,
    elevation: 10,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: Default.fixPadding * 1.5,
  },
  modalTitle: {
    ...Fonts.SemiBold18black,
    marginTop: Default.fixPadding,
    textAlign: 'center',
  },
  modalMessage: {
    ...Fonts.Medium14grey,
    textAlign: 'left',
    lineHeight: 22,
    marginBottom: Default.fixPadding * 2,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Default.fixPadding,
  },
  modalButton: {
    flex: 1,
    paddingVertical: Default.fixPadding * 1.2,
    paddingHorizontal: Default.fixPadding,
    borderRadius: 10,
    alignItems: 'center',
    minHeight: 50,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: Default.fixPadding * 1.2,
    paddingHorizontal: Default.fixPadding,
    borderRadius: 10,
    alignItems: 'center',
    minHeight: 50,
    ...Default.shadow,
    elevation: 3,
  },
  confirmButtonText: {
    ...Fonts.SemiBold16white,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: Colors.lightGrey,
    paddingVertical: Default.fixPadding * 1.2,
    paddingHorizontal: Default.fixPadding,
    borderRadius: 10,
    alignItems: 'center',
    minHeight: 50,
    borderWidth: 1,
    borderColor: Colors.grey,
    ...Default.shadow,
    elevation: 2,
  },
  modalCancelButtonText: {
    ...Fonts.SemiBold16black,
    color: Colors.darkGrey,
  },
  contactOptions: {
    marginBottom: Default.fixPadding * 1.5,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Default.fixPadding * 1.2,
    backgroundColor: Colors.extraLightGrey,
    borderRadius: 10,
    marginBottom: Default.fixPadding,
    borderWidth: 1,
    borderColor: Colors.lightGrey,
  },
  contactOptionText: {
    ...Fonts.Medium16black,
    marginLeft: Default.fixPadding,
  },
});
