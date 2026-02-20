import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import MyStatusBar from "../components/myStatusBar";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import AwesomeButton from "react-native-really-awesome-button";
import { useAuth } from "../contexts/AuthContext";
import { useSubmitTechnicalSupport, useUploadAttachment } from "../hooks/useTechnicalSupport";

const TechnicalSupportScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { profile } = useAuth();
  const { submitTechnicalSupport, isSubmitting: isSubmittingToSupabase, error: submitError } = useSubmitTechnicalSupport();
  const { uploadAttachment, isUploading, error: uploadError } = useUploadAttachment();
  const isRtl = i18n.dir() == "rtl";

  const [formData, setFormData] = useState({
    issueType: '',
    priority: '',
    subject: '',
    description: '',
    deviceType: '',
    operatingSystem: '',
    appVersion: '',
    browserVersion: '',
    internetProvider: '',
    errorMessage: '',
    reproductionSteps: '',
    hasOccurredBefore: '',
    allowRemoteAccess: false,
    allowContact: true,
  });

  const [attachments, setAttachments] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Request permissions for camera and media library
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        console.log('Media library permission denied');
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled) {
        const newAttachment = {
          id: Date.now().toString(),
          uri: result.assets[0].uri,
          type: 'image',
          name: `screenshot_${Date.now()}.jpg`,
        };
        setAttachments([...attachments, newAttachment]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
      });

      if (!result.canceled) {
        const newAttachment = {
          id: Date.now().toString(),
          uri: result.assets[0].uri,
          type: 'image',
          name: `photo_${Date.now()}.jpg`,
        };
        setAttachments([...attachments, newAttachment]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const removeAttachment = (id) => {
    setAttachments(attachments.filter(attachment => attachment.id !== id));
  };

  const showAttachmentOptions = () => {
    Alert.alert(
      'Upload a Screenshot',
      'How would you like to upload a screenshot?',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Photo Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  function tr(key) {
    return t(`technicalSupportScreen:${key}`);
  }

  const backAction = () => {
    navigation.navigate('helpDeskScreen');
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => BackHandler.removeEventListener("hardwareBackPress", backAction);
  }, []);

  const issueTypes = [
    { value: 'login', label: 'Login Issues' },
    { value: 'app_crash', label: 'App Crashes' },
    { value: 'slow_performance', label: 'Slow Performance' },
    { value: 'features_not_working', label: 'Features Not Working' },
    { value: 'notifications', label: 'Notification Issues' },
    { value: 'payment_errors', label: 'Payment Errors' },
    { value: 'sync_issues', label: 'Data Sync Issues' },
    { value: 'other', label: 'Other Technical Issue' },
  ];

  const deviceTypes = [
    { value: 'smartphone', label: 'Smartphone' },
    { value: 'tablet', label: 'Tablet' },
    { value: 'web_browser', label: 'Web Browser' },
    { value: 'other', label: 'Other Device' },
  ];

  const operatingSystems = [
    { value: 'ios', label: 'iOS' },
    { value: 'android', label: 'Android' },
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: Colors.green },
    { value: 'medium', label: 'Medium', color: Colors.orange },
    { value: 'high', label: 'High', color: Colors.red },
    { value: 'critical', label: 'Critical', color: Colors.red },
  ];

  const contactMethods = [
    { value: 'email', label: 'Email', icon: 'email' },
    { value: 'phone', label: 'Phone Call', icon: 'phone' },
    { value: 'remote_support', label: 'Remote Support', icon: 'computer' },
    { value: 'app', label: 'In-App Notification', icon: 'notifications' },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.issueType) {
      newErrors.issueType = 'Please select an issue type';
    }

    if (!formData.deviceType) {
      newErrors.deviceType = 'Please select your device type';
    }

    if (!formData.operatingSystem) {
      newErrors.operatingSystem = 'Please select your operating system';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Please fill in all required fields correctly');
      return;
    }

    setIsSubmitting(true);

    try {
      const supportData = {
        ...formData,
        attachments: attachments,
        user_id: profile?.id,
        user_name: profile?.full_name,
        user_email: profile?.email,
        user_phone: profile?.phone_number,
        unit_number: profile?.unit_number,
        community_id: profile?.community_id,
        inquiry_type: 'technical_support',
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Upload attachments first if any
      let attachmentUrls = [];
      if (attachments.length > 0) {
        for (const attachment of attachments) {
          const uploadResult = await uploadAttachment(attachment, attachment.name);
          if (uploadResult.success) {
            attachmentUrls.push(uploadResult.data?.publicUrl || uploadResult.url);
          } else {
            Alert.alert('Error', 'Failed to upload attachment. Please try again.');
            return;
          }
        }
        supportData.attachments = attachmentUrls;
      }

      // Submit to Supabase
      const result = await submitTechnicalSupport(supportData);
      
      if (result.success) {
        Alert.alert(
          'Success',
          'Your technical support request has been submitted successfully. Our technical team will respond within 4 hours.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setFormData({
                  issueType: '',
                  priority: '',
                  subject: '',
                  description: '',
                  deviceType: '',
                  operatingSystem: '',
                  appVersion: '',
                  browserVersion: '',
                  internetProvider: '',
                  errorMessage: '',
                  reproductionSteps: '',
                  hasOccurredBefore: '',
                  allowRemoteAccess: false,
                  allowContact: true,
                });
                setAttachments([]);
                navigation.navigate('helpDeskScreen');
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to submit support request. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting technical support:', error);
      Alert.alert('Error', 'Failed to submit support request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.headerRow}>
      <TouchableOpacity
        style={styles.headerBackBtn}
        onPress={() => navigation.navigate('helpDeskScreen')}
      >
        <Ionicons name="arrow-back-outline" size={25} color={Colors.black} />
      </TouchableOpacity>
      <Text style={styles.headerTitleText}>Technical Support</Text>
    </View>
  );

    const renderInputField = (label, key, placeholder, multiline = false, keyboardType = 'default') => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label} {['subject', 'description', 'issueType', 'deviceType', 'operatingSystem'].includes(key) && '*'}
      </Text>
      <TextInput
        style={[
          styles.textInput,
          multiline && { height: 100, textAlignVertical: 'top' },
          errors[key] && styles.inputError,
        ]}
        value={formData[key]}
        onChangeText={(text) => {
          setFormData({ ...formData, [key]: text });
          if (errors[key]) {
            setErrors({ ...errors, [key]: null });
          }
        }}
        placeholder={placeholder}
        placeholderTextColor={Colors.grey}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        keyboardType={keyboardType}
        textAlign={isRtl ? 'right' : 'left'}
      />
      {errors[key] && (
        <Text style={styles.errorText}>{errors[key]}</Text>
      )}
    </View>
  );

  const renderPicker = (label, key, options, required = false) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label} {required && '*'}
      </Text>
      <View style={styles.pickerContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.categoryOption,
              formData[key] === option.value && styles.categoryOptionSelected,
            ]}
            onPress={() => {
              setFormData({ ...formData, [key]: option.value });
              if (errors[key]) {
                setErrors({ ...errors, [key]: null });
              }
            }}
          >
            <Text
              style={[
                styles.categoryOptionText,
                formData[key] === option.value && styles.categoryOptionTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors[key] && (
        <Text style={styles.errorText}>{errors[key]}</Text>
      )}
    </View>
  );

  const renderPriorityPicker = () => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>Priority Level</Text>
      <View style={styles.priorityContainer}>
        {priorities.map((priority) => (
          <TouchableOpacity
            key={priority.value}
            style={[
              styles.priorityOption,
              { borderColor: priority.color },
              formData.priority === priority.value && { backgroundColor: priority.color },
            ]}
            onPress={() => setFormData({ ...formData, priority: priority.value })}
          >
            <Text
              style={[
                styles.priorityOptionText,
                formData.priority === priority.value && styles.priorityOptionTextSelected,
              ]}
            >
              {priority.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderContactMethodPicker = () => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>Preferred Contact Method</Text>
      <View style={styles.contactMethodContainer}>
        {contactMethods.map((method) => (
          <TouchableOpacity
            key={method.value}
            style={[
              styles.contactMethodOption,
              formData.preferredContact === method.value && styles.contactMethodOptionSelected,
            ]}
            onPress={() => setFormData({ ...formData, preferredContact: method.value })}
          >
            <MaterialIcons
              name={method.icon}
              size={20}
              color={formData.preferredContact === method.value ? Colors.white : Colors.primary}
            />
            <Text
              style={[
                styles.contactMethodOptionText,
                formData.preferredContact === method.value && styles.contactMethodOptionTextSelected,
              ]}
            >
              {method.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.white }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <MyStatusBar />
      {renderHeader()}
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.infoCard}>
            <MaterialIcons name="computer" size={24} color={Colors.primary} />
            <Text style={styles.infoText}>
              Please provide detailed technical information to help us diagnose and resolve your issue quickly.
            </Text>
          </View>

          {/* Technical Information */}
          <Text style={styles.sectionTitle}>Technical Information</Text>
          {renderPicker('Issue Type', 'issueType', issueTypes, true)}
          {renderPicker('Device Type', 'deviceType', deviceTypes, true)}
          {renderPicker('Operating System', 'operatingSystem', operatingSystems, true)}
          {renderInputField('App Version', 'appVersion', 'Enter app version (e.g., 1.2.3)')}

          {/* Issue Details */}
          <Text style={styles.sectionTitle}>Issue Details</Text>
          {renderInputField('Subject', 'subject', 'Brief description of the issue')}
          {renderInputField('Detailed Description', 'description', 'Describe the technical issue in detail, including what you were trying to do when it occurred...', true)}
          {renderInputField('Steps to Reproduce', 'stepsToReproduce', 'List the steps that led to this issue (optional)...', true)}
          
          {renderPriorityPicker()}
          {renderContactMethodPicker()}

          {/* Screenshots & Attachments */}
          <View style={styles.attachmentSection}>
            <Text style={styles.sectionTitle}>Screenshots & Attachments</Text>
            
            <View style={styles.infoCard}>
              <MaterialIcons name="camera-alt" size={24} color={Colors.primary} />
              <Text style={styles.infoText}>
                Screenshots help us understand your issue better. Please capture relevant screens showing the problem.
              </Text>
            </View>

            {attachments.length > 0 && (
              <View style={styles.attachmentsList}>
                {attachments.map((attachment) => (
                  <View key={attachment.id} style={styles.attachmentItem}>
                    <Image source={{ uri: attachment.uri }} style={styles.attachmentImage} />
                    <Text style={styles.attachmentName}>{attachment.name}</Text>
                    <TouchableOpacity 
                      style={styles.removeAttachmentButton}
                      onPress={() => removeAttachment(attachment.id)}
                    >
                      <MaterialIcons name="close" size={20} color={Colors.red} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity style={styles.addAttachmentButton} onPress={showAttachmentOptions}>
              <MaterialIcons name="add-photo-alternate" size={24} color={Colors.primary} />
              <Text style={styles.addAttachmentText}>Upload a Screenshot</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.submitContainer}>
            <AwesomeButton
              progress
              disabled={isSubmitting || isSubmittingToSupabase || isUploading}
              height={50}
              progressLoadingTime={2000}
              onPress={(next) => {
                handleSubmit().then(() => next());
              }}
              raiseLevel={1}
              stretch={true}
              borderRadius={10}
              backgroundShadow={Colors.primary}
              backgroundDarker={Colors.primary}
              backgroundColor={Colors.primary}
            >
              <Text style={styles.submitButtonText}>
                {isUploading ? 'Uploading...' : isSubmitting || isSubmittingToSupabase ? 'Submitting...' : 'Submit Support Request'}
              </Text>
            </AwesomeButton>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Default.fixPadding * 2,
    paddingTop: Default.fixPadding * 1.2,
    paddingBottom: Default.fixPadding * 0.8,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGrey,
  },
  headerBackBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleText: {
    ...Fonts.SemiBold18black,
    letterSpacing: 0.2,
    color: Colors.black,
    marginLeft: Default.fixPadding,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    padding: Default.fixPadding * 2,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '10',
    borderRadius: 12,
    padding: Default.fixPadding * 1.5,
    marginBottom: Default.fixPadding * 2,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  infoText: {
    ...Fonts.Regular14black,
    flex: 1,
    marginLeft: Default.fixPadding,
    lineHeight: 20,
  },
  sectionTitle: {
    ...Fonts.SemiBold18black,
    marginBottom: Default.fixPadding,
    marginTop: Default.fixPadding,
    color: Colors.primary,
  },
  inputGroup: {
    marginBottom: Default.fixPadding * 1.5,
  },
  inputLabel: {
    ...Fonts.SemiBold16black,
    marginBottom: Default.fixPadding * 0.5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.lightGrey,
    borderRadius: 10,
    padding: Default.fixPadding * 1.2,
    backgroundColor: Colors.white,
    ...Fonts.Regular14black,
    ...Default.shadow,
  },
  inputError: {
    borderColor: Colors.red,
  },
  errorText: {
    ...Fonts.Regular12red,
    marginTop: Default.fixPadding * 0.3,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Default.fixPadding * 0.5,
  },
  categoryOption: {
    paddingHorizontal: Default.fixPadding * 1.2,
    paddingVertical: Default.fixPadding * 0.8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.lightGrey,
    backgroundColor: Colors.white,
    marginBottom: Default.fixPadding * 0.5,
  },
  categoryOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryOptionText: {
    ...Fonts.Medium14black,
  },
  categoryOptionTextSelected: {
    ...Fonts.Medium14white,
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Default.fixPadding,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: Default.fixPadding * 0.8,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  priorityOptionText: {
    ...Fonts.Medium14black,
  },
  priorityOptionTextSelected: {
    ...Fonts.Medium14white,
  },
  contactMethodContainer: {
    gap: Default.fixPadding * 0.5,
  },
  contactMethodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Default.fixPadding * 1.2,
    paddingVertical: Default.fixPadding * 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.lightGrey,
    backgroundColor: Colors.white,
  },
  contactMethodOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  contactMethodOptionText: {
    ...Fonts.Medium14black,
    marginLeft: Default.fixPadding * 0.8,
  },
  contactMethodOptionTextSelected: {
    ...Fonts.Medium14white,
  },
  screenshotInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.blue + '10',
    borderRadius: 12,
    padding: Default.fixPadding * 1.5,
    marginBottom: Default.fixPadding * 2,
    borderLeftWidth: 4,
    borderLeftColor: Colors.blue,
  },
  screenshotText: {
    ...Fonts.Regular14black,
    flex: 1,
    marginLeft: Default.fixPadding,
    lineHeight: 20,
  },
  attachmentSection: {
    marginBottom: Default.fixPadding * 2,
  },
  addAttachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Default.fixPadding * 1.2,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    marginBottom: Default.fixPadding,
  },
  addAttachmentText: {
    ...Fonts.SemiBold16black,
    color: Colors.primary,
    marginLeft: Default.fixPadding * 0.8,
  },
  attachmentsList: {
    marginBottom: Default.fixPadding,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: Default.fixPadding,
    marginBottom: Default.fixPadding * 0.5,
    borderWidth: 1,
    borderColor: Colors.lightGrey,
    ...Default.shadow,
  },
  attachmentImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: Default.fixPadding,
  },
  attachmentName: {
    ...Fonts.Regular14black,
    flex: 1,
  },
  removeAttachmentButton: {
    padding: Default.fixPadding * 0.5,
  },
  submitContainer: {
    marginTop: Default.fixPadding * 2,
  },
  submitButtonText: {
    ...Fonts.SemiBold18white,
  },
});

export default TechnicalSupportScreen;
