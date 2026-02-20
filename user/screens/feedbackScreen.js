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
import { useSubmitFeedback } from "../hooks/useFeedback";

const FeedbackScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { profile } = useAuth();
  const { submitFeedback, isSubmitting: isSubmittingToSupabase, error: submitError } = useSubmitFeedback();
  const isRtl = i18n.dir() == "rtl";

  const [formData, setFormData] = useState({
    feedbackType: '',
    category: '',
    overallSatisfaction: 0,
    specificFeature: '',
    subject: '',
    feedback: '',
    improvements: '',
    wouldRecommend: '',
    allowContact: true,
    isAnonymous: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function tr(key) {
    return t(`feedbackScreen:${key}`);
  }

  const backAction = () => {
    navigation.navigate('helpDeskScreen');
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => BackHandler.removeEventListener("hardwareBackPress", backAction);
  }, []);

  const feedbackTypes = [
    { value: 'positive', label: 'Positive Feedback', icon: 'thumb-up', color: Colors.green },
    { value: 'negative', label: 'Negative Feedback', icon: 'thumb-down', color: Colors.red },
    { value: 'neutral', label: 'General Feedback', icon: 'comment', color: Colors.blue },
    { value: 'bug_report', label: 'Bug Report', icon: 'bug-report', color: Colors.orange },
  ];

  const categories = [
    { value: 'app_performance', label: 'App Performance' },
    { value: 'user_interface', label: 'User Interface/Design' },
    { value: 'features', label: 'Features & Functionality' },
    { value: 'customer_service', label: 'Customer Service' },
    { value: 'community_management', label: 'Community Management' },
    { value: 'maintenance_services', label: 'Maintenance Services' },
    { value: 'amenities', label: 'Amenities & Facilities' },
    { value: 'security', label: 'Security & Safety' },
    { value: 'communication', label: 'Communication' },
    { value: 'billing', label: 'Billing & Payments' },
    { value: 'other', label: 'Other' },
  ];

  const features = [
    { value: 'booking_system', label: 'Booking System' },
    { value: 'payment_gateway', label: 'Payment Gateway' },
    { value: 'notifications', label: 'Notifications' },
    { value: 'visitor_management', label: 'Visitor Management' },
    { value: 'complaint_system', label: 'Complaint System' },
    { value: 'notice_board', label: 'Notice Board' },
    { value: 'community_chat', label: 'Community Chat' },
    { value: 'maintenance_requests', label: 'Maintenance Requests' },
    { value: 'member_directory', label: 'Member Directory' },
    { value: 'emergency_contacts', label: 'Emergency Contacts' },
    { value: 'overall_app', label: 'Overall App Experience' },
  ];

  const recommendationOptions = [
    { value: 'definitely', label: 'Definitely', color: Colors.green },
    { value: 'probably', label: 'Probably', color: Colors.lightGreen },
    { value: 'maybe', label: 'Maybe', color: Colors.orange },
    { value: 'probably_not', label: 'Probably Not', color: Colors.red },
    { value: 'definitely_not', label: 'Definitely Not', color: Colors.red },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.feedbackType) {
      newErrors.feedbackType = 'Please select a feedback type';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.feedback.trim()) {
      newErrors.feedback = 'Feedback is required';
    } else if (formData.feedback.trim().length < 10) {
      newErrors.feedback = 'Feedback must be at least 10 characters long';
    }

    if (formData.overallSatisfaction === 0) {
      newErrors.overallSatisfaction = 'Please rate your overall satisfaction';
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
      const feedbackData = {
        ...formData,
        user_id: formData.isAnonymous ? null : profile?.id,
        user_name: formData.isAnonymous ? null : profile?.full_name,
        user_email: formData.isAnonymous ? null : profile?.email,
        user_phone: formData.isAnonymous ? null : profile?.phone_number,
        unit_number: formData.isAnonymous ? null : profile?.unit_number,
        community_id: profile?.community_id,
        inquiry_type: 'feedback',
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Submit to Supabase
      const result = await submitFeedback(feedbackData);
      
      if (result.success) {
        Alert.alert(
          'Success',
          'Thank you for your feedback! Your input helps us improve our services.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setFormData({
                  feedbackType: '',
                  category: '',
                  overallSatisfaction: 0,
                  specificFeature: '',
                  subject: '',
                  feedback: '',
                  improvements: '',
                  wouldRecommend: '',
                  allowContact: true,
                  isAnonymous: false,
                });
                navigation.navigate('helpDeskScreen');
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
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
      <Text style={styles.headerTitleText}>Feedback</Text>
    </View>
  );

  const renderInputField = (label, key, placeholder, multiline = false, keyboardType = 'default') => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label} {['subject', 'feedback', 'feedbackType', 'category'].includes(key) && '*'}
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

  const renderFeedbackTypePicker = () => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>Feedback Type *</Text>
      <View style={styles.feedbackTypeContainer}>
        {feedbackTypes.map((type) => (
          <TouchableOpacity
            key={type.value}
            style={[
              styles.feedbackTypeOption,
              { borderColor: type.color },
              formData.feedbackType === type.value && { backgroundColor: type.color },
            ]}
            onPress={() => {
              setFormData({ ...formData, feedbackType: type.value });
              if (errors.feedbackType) {
                setErrors({ ...errors, feedbackType: null });
              }
            }}
          >
            <MaterialIcons
              name={type.icon}
              size={20}
              color={formData.feedbackType === type.value ? Colors.white : type.color}
            />
            <Text
              style={[
                styles.feedbackTypeText,
                formData.feedbackType === type.value && { color: Colors.white },
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.feedbackType && (
        <Text style={styles.errorText}>{errors.feedbackType}</Text>
      )}
    </View>
  );

  const renderStarRating = () => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>Overall Satisfaction *</Text>
      <View style={styles.starRatingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            style={styles.starButton}
            onPress={() => {
              setFormData({ ...formData, overallSatisfaction: star });
              if (errors.overallSatisfaction) {
                setErrors({ ...errors, overallSatisfaction: null });
              }
            }}
          >
            <MaterialIcons
              name={star <= formData.overallSatisfaction ? 'star' : 'star-border'}
              size={32}
              color={star <= formData.overallSatisfaction ? Colors.orange : Colors.grey}
            />
          </TouchableOpacity>
        ))}
        <Text style={styles.ratingText}>
          {formData.overallSatisfaction > 0 ? `${formData.overallSatisfaction}/5` : 'Tap to rate'}
        </Text>
      </View>
      {errors.overallSatisfaction && (
        <Text style={styles.errorText}>{errors.overallSatisfaction}</Text>
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

  const renderRecommendationPicker = () => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>Would you recommend our services?</Text>
      <View style={styles.recommendationContainer}>
        {recommendationOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.recommendationOption,
              { borderColor: option.color },
              formData.wouldRecommend === option.value && { backgroundColor: option.color },
            ]}
            onPress={() => setFormData({ ...formData, wouldRecommend: option.value })}
          >
            <Text
              style={[
                styles.recommendationOptionText,
                formData.wouldRecommend === option.value && { color: Colors.white },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderToggleOptions = () => (
    <View style={styles.toggleOptionsContainer}>
      <TouchableOpacity
        style={styles.toggleOption}
        onPress={() => setFormData({ ...formData, isAnonymous: !formData.isAnonymous })}
      >
        <MaterialIcons
          name={formData.isAnonymous ? 'check-box' : 'check-box-outline-blank'}
          size={24}
          color={Colors.primary}
        />
        <Text style={styles.toggleOptionText}>Submit feedback anonymously</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.toggleOption}
        onPress={() => setFormData({ ...formData, allowContact: !formData.allowContact })}
      >
        <MaterialIcons
          name={formData.allowContact ? 'check-box' : 'check-box-outline-blank'}
          size={24}
          color={Colors.primary}
        />
        <Text style={styles.toggleOptionText}>Allow us to contact you about this feedback</Text>
      </TouchableOpacity>
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
            <MaterialIcons name="feedback" size={24} color={Colors.primary} />
            <Text style={styles.infoText}>
              Your feedback is valuable to us! Help us improve our services and community experience.
            </Text>
          </View>

          {renderFeedbackTypePicker()}
          {renderPicker('Category', 'category', categories, true)}
          {renderStarRating()}
          {renderPicker('Specific Feature (Optional)', 'specificFeature', features)}

          {/* Feedback Details */}
          <Text style={styles.sectionTitle}>Feedback Details</Text>
          {renderInputField('Subject', 'subject', 'Brief summary of your feedback')}
          {renderInputField('Detailed Feedback', 'feedback', 'Please share your detailed feedback...', true)}
          {renderInputField('Suggestions for Improvement', 'improvements', 'What improvements would you like to see? (Optional)', true)}
          
          {renderRecommendationPicker()}
          {renderToggleOptions()}

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
                {isSubmitting || isSubmittingToSupabase ? 'Submitting...' : 'Submit Feedback'}
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
  feedbackTypeContainer: {
    gap: Default.fixPadding * 0.5,
  },
  feedbackTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Default.fixPadding * 1.2,
    paddingVertical: Default.fixPadding * 1,
    borderRadius: 10,
    borderWidth: 2,
    backgroundColor: Colors.white,
  },
  feedbackTypeText: {
    ...Fonts.Medium14black,
    marginLeft: Default.fixPadding * 0.8,
  },
  starRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Default.fixPadding * 0.5,
  },
  starButton: {
    padding: Default.fixPadding * 0.3,
  },
  ratingText: {
    ...Fonts.Medium14black,
    marginLeft: Default.fixPadding,
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
  recommendationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Default.fixPadding * 0.5,
  },
  recommendationOption: {
    paddingHorizontal: Default.fixPadding * 1.2,
    paddingVertical: Default.fixPadding * 0.8,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: Colors.white,
    marginBottom: Default.fixPadding * 0.5,
  },
  recommendationOptionText: {
    ...Fonts.Medium14black,
  },
  toggleOptionsContainer: {
    marginTop: Default.fixPadding,
    marginBottom: Default.fixPadding,
  },
  toggleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Default.fixPadding * 0.8,
  },
  toggleOptionText: {
    ...Fonts.Medium14black,
    marginLeft: Default.fixPadding * 0.8,
    flex: 1,
  },
  submitContainer: {
    marginTop: Default.fixPadding * 2,
  },
  submitButtonText: {
    ...Fonts.SemiBold18white,
  },
});

export default FeedbackScreen;
