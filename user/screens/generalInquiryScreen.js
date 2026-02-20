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
} from "react-native";
import MyStatusBar from "../components/myStatusBar";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import AwesomeButton from "react-native-really-awesome-button";
import { useAuth } from "../contexts/AuthContext";
import { useSubmitGeneralInquiry } from "../hooks/useGeneralInquiry";

const GeneralInquiryScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { profile } = useAuth();
  const { submitGeneralInquiry, isSubmitting: isSubmittingToSupabase, error: submitError } = useSubmitGeneralInquiry();
  const isRtl = i18n.dir() == "rtl";

  const [formData, setFormData] = useState({
    inquiryType: '',
    category: '',
    priority: '',
    subject: '',
    description: '',
    urgency: '',
    preferredContactMethod: '',
    bestTimeToContact: '',
    attachments: '',
    allowContact: true,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function tr(key) {
    return t(`generalInquiryScreen:${key}`);
  }

  const backAction = () => {
    navigation.navigate('helpDeskScreen');
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => BackHandler.removeEventListener("hardwareBackPress", backAction);
  }, []);

  const categories = [
    { value: 'billing', label: 'Billing & Payments' },
    { value: 'maintenance', label: 'Maintenance Request' },
    { value: 'community', label: 'Community Services' },
    { value: 'amenities', label: 'Amenities & Facilities' },
    { value: 'security', label: 'Security & Safety' },
    { value: 'administration', label: 'Administration' },
    { value: 'other', label: 'Other' },
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: Colors.green },
    { value: 'medium', label: 'Medium', color: Colors.orange },
    { value: 'high', label: 'High', color: Colors.red },
    { value: 'urgent', label: 'Urgent', color: Colors.red },
  ];

  const contactMethods = [
    { value: 'email', label: 'Email', icon: 'email' },
    { value: 'phone', label: 'Phone Call', icon: 'phone' },
    { value: 'sms', label: 'SMS', icon: 'message' },
    { value: 'app', label: 'In-App Notification', icon: 'notifications' },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.inquiryType) {
      newErrors.inquiryType = 'Please select an inquiry type';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.priority) {
      newErrors.priority = 'Please select a priority level';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters long';
    }

    if (!formData.urgency) {
      newErrors.urgency = 'Please select an urgency level';
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
      const inquiryData = {
        ...formData,
        user_id: profile?.id,
        user_name: profile?.full_name,
        user_email: profile?.email,
        user_phone: profile?.phone_number,
        unit_number: profile?.unit_number,
        community_id: profile?.community_id,
        inquiry_type: 'general',
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Submit to Supabase
      const result = await submitGeneralInquiry(inquiryData);
      
      if (result.success) {
        Alert.alert(
          'Success',
          'Your general inquiry has been submitted successfully. Our team will respond within 24 hours.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setFormData({
                  inquiryType: '',
                  category: '',
                  priority: '',
                  subject: '',
                  description: '',
                  urgency: '',
                  preferredContactMethod: '',
                  bestTimeToContact: '',
                  attachments: '',
                  allowContact: true,
                });
                navigation.navigate('helpDeskScreen');
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to submit inquiry. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      Alert.alert('Error', 'Failed to submit inquiry. Please try again.');
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
      <Text style={styles.headerTitleText}>General Inquiry</Text>
    </View>
  );

    const renderInputField = (label, key, placeholder, multiline = false, keyboardType = 'default') => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label} {['subject', 'description', 'inquiryType', 'category', 'priority', 'urgency'].includes(key) && '*'}
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

  const renderCategoryPicker = () => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>Category *</Text>
      <View style={styles.pickerContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.value}
            style={[
              styles.categoryOption,
              formData.category === category.value && styles.categoryOptionSelected,
            ]}
            onPress={() => {
              setFormData({ ...formData, category: category.value });
              if (errors.category) {
                setErrors({ ...errors, category: null });
              }
            }}
          >
            <Text
              style={[
                styles.categoryOptionText,
                formData.category === category.value && styles.categoryOptionTextSelected,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.category && (
        <Text style={styles.errorText}>{errors.category}</Text>
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
            <MaterialIcons name="info-outline" size={24} color={Colors.primary} />
            <Text style={styles.infoText}>
              Please provide detailed information about your inquiry. Our team will review and respond within 24 hours.
            </Text>
          </View>

          {renderInputField('Subject', 'subject', 'Enter inquiry subject')}
          
          {renderCategoryPicker()}
          {renderPriorityPicker()}
          {renderContactMethodPicker()}
          
          {renderInputField('Description', 'description', 'Please describe your inquiry in detail...', true)}

          <View style={styles.submitContainer}>
            <AwesomeButton
              progress
              disabled={isSubmitting}
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
                {isSubmitting || isSubmittingToSupabase ? 'Submitting...' : 'Submit Inquiry'}
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
  submitContainer: {
    marginTop: Default.fixPadding * 2,
  },
  submitButtonText: {
    ...Fonts.SemiBold18white,
  },
});

export default GeneralInquiryScreen;
