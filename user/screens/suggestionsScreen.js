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
import { useSubmitSuggestion } from "../hooks/useSuggestions";

const SuggestionsScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { profile } = useAuth();
  const { submitSuggestion, isSubmitting: isSubmittingToSupabase, error: submitError } = useSubmitSuggestion();
  const isRtl = i18n.dir() == "rtl";

  const [formData, setFormData] = useState({
    suggestionType: '',
    category: '',
    priority: '',
    subject: '',
    description: '',
    benefits: '',
    implementation: '',
    timeline: '',
    budget: '',
    supportingDocuments: '',
    willingToHelp: false,
    allowContact: true,
    isAnonymous: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function tr(key) {
    return t(`suggestionsScreen:${key}`);
  }

  const backAction = () => {
    navigation.navigate('helpDeskScreen');
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => BackHandler.removeEventListener("hardwareBackPress", backAction);
  }, []);

  const suggestionTypes = [
    { value: 'new_feature', label: 'New Feature/Service', icon: 'add-circle', color: Colors.green },
    { value: 'improvement', label: 'Improvement', icon: 'trending-up', color: Colors.blue },
    { value: 'community_initiative', label: 'Community Initiative', icon: 'group', color: Colors.purple },
    { value: 'cost_saving', label: 'Cost Saving Idea', icon: 'savings', color: Colors.orange },
    { value: 'sustainability', label: 'Sustainability', icon: 'eco', color: Colors.green },
    { value: 'technology', label: 'Technology Enhancement', icon: 'computer', color: Colors.blue },
  ];

  const categories = [
    { value: 'amenities', label: 'Amenities & Facilities' },
    { value: 'security', label: 'Security & Safety' },
    { value: 'maintenance', label: 'Maintenance & Repairs' },
    { value: 'community_events', label: 'Community Events' },
    { value: 'communication', label: 'Communication' },
    { value: 'parking', label: 'Parking & Transportation' },
    { value: 'landscaping', label: 'Landscaping & Environment' },
    { value: 'waste_management', label: 'Waste Management' },
    { value: 'energy_efficiency', label: 'Energy Efficiency' },
    { value: 'technology', label: 'Technology & Digital Services' },
    { value: 'health_wellness', label: 'Health & Wellness' },
    { value: 'children_activities', label: 'Children & Family Activities' },
    { value: 'senior_services', label: 'Senior Services' },
    { value: 'pet_services', label: 'Pet Services' },
    { value: 'other', label: 'Other' },
  ];

  const priorities = [
    { value: 'high', label: 'High Priority', color: Colors.red },
    { value: 'medium', label: 'Medium Priority', color: Colors.orange },
    { value: 'low', label: 'Low Priority', color: Colors.green },
  ];

  const timelines = [
    { value: 'immediate', label: 'Immediate (0-1 month)' },
    { value: 'short_term', label: 'Short Term (1-3 months)' },
    { value: 'medium_term', label: 'Medium Term (3-6 months)' },
    { value: 'long_term', label: 'Long Term (6+ months)' },
    { value: 'no_timeline', label: 'No Specific Timeline' },
  ];

  const budgetRanges = [
    { value: 'under_1000', label: 'Under $1,000' },
    { value: '1000_5000', label: '$1,000 - $5,000' },
    { value: '5000_10000', label: '$5,000 - $10,000' },
    { value: '10000_25000', label: '$10,000 - $25,000' },
    { value: 'over_25000', label: 'Over $25,000' },
    { value: 'no_cost', label: 'No Cost/Free' },
    { value: 'unknown', label: 'Unknown/Not Sure' },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.suggestionType) {
      newErrors.suggestionType = 'Please select a suggestion type';
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
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters long';
    }

    if (!formData.benefits.trim()) {
      newErrors.benefits = 'Benefits description is required';
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
      const suggestionData = {
        ...formData,
        user_id: formData.isAnonymous ? null : profile?.id,
        user_name: formData.isAnonymous ? null : profile?.full_name,
        user_email: formData.isAnonymous ? null : profile?.email,
        user_phone: formData.isAnonymous ? null : profile?.phone_number,
        unit_number: formData.isAnonymous ? null : profile?.unit_number,
        community_id: profile?.community_id,
        inquiry_type: 'suggestion',
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Submit to Supabase
      const result = await submitSuggestion(suggestionData);
      
      if (result.success) {
        Alert.alert(
          'Success',
          'Thank you for your suggestion! We appreciate your ideas for improving our community.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setFormData({
                  suggestionType: '',
                  category: '',
                  priority: '',
                  subject: '',
                  description: '',
                  benefits: '',
                  implementation: '',
                  timeline: '',
                  budget: '',
                  supportingDocuments: '',
                  willingToHelp: false,
                  allowContact: true,
                  isAnonymous: false,
                });
                navigation.navigate('helpDeskScreen');
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to submit suggestion. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      Alert.alert('Error', 'Failed to submit suggestion. Please try again.');
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
      <Text style={styles.headerTitleText}>Suggestions</Text>
    </View>
  );

  const renderInputField = (label, key, placeholder, multiline = false, keyboardType = 'default') => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label} {['subject', 'description', 'benefits', 'suggestionType', 'category', 'priority'].includes(key) && '*'}
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

  const renderSuggestionTypePicker = () => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>Suggestion Type *</Text>
      <View style={styles.suggestionTypeContainer}>
        {suggestionTypes.map((type) => (
          <TouchableOpacity
            key={type.value}
            style={[
              styles.suggestionTypeOption,
              { borderColor: type.color },
              formData.suggestionType === type.value && { backgroundColor: type.color },
            ]}
            onPress={() => {
              setFormData({ ...formData, suggestionType: type.value });
              if (errors.suggestionType) {
                setErrors({ ...errors, suggestionType: null });
              }
            }}
          >
            <MaterialIcons
              name={type.icon}
              size={20}
              color={formData.suggestionType === type.value ? Colors.white : type.color}
            />
            <Text
              style={[
                styles.suggestionTypeText,
                formData.suggestionType === type.value && { color: Colors.white },
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.suggestionType && (
        <Text style={styles.errorText}>{errors.suggestionType}</Text>
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
      <Text style={styles.inputLabel}>Priority Level *</Text>
      <View style={styles.priorityContainer}>
        {priorities.map((priority) => (
          <TouchableOpacity
            key={priority.value}
            style={[
              styles.priorityOption,
              { borderColor: priority.color },
              formData.priority === priority.value && { backgroundColor: priority.color },
            ]}
            onPress={() => {
              setFormData({ ...formData, priority: priority.value });
              if (errors.priority) {
                setErrors({ ...errors, priority: null });
              }
            }}
          >
            <Text
              style={[
                styles.priorityOptionText,
                formData.priority === priority.value && { color: Colors.white },
              ]}
            >
              {priority.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.priority && (
        <Text style={styles.errorText}>{errors.priority}</Text>
      )}
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
        <Text style={styles.toggleOptionText}>Submit suggestion anonymously</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.toggleOption}
        onPress={() => setFormData({ ...formData, willingToHelp: !formData.willingToHelp })}
      >
        <MaterialIcons
          name={formData.willingToHelp ? 'check-box' : 'check-box-outline-blank'}
          size={24}
          color={Colors.primary}
        />
        <Text style={styles.toggleOptionText}>I'm willing to help implement this suggestion</Text>
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
        <Text style={styles.toggleOptionText}>Allow us to contact you about this suggestion</Text>
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
            <MaterialIcons name="lightbulb-outline" size={24} color={Colors.primary} />
            <Text style={styles.infoText}>
              Share your innovative ideas to help improve our community! Your suggestions matter.
            </Text>
          </View>

          {renderSuggestionTypePicker()}
          {renderPicker('Category', 'category', categories, true)}
          {renderPriorityPicker()}

          {/* Suggestion Details */}
          <Text style={styles.sectionTitle}>Suggestion Details</Text>
          {renderInputField('Subject', 'subject', 'Brief title for your suggestion')}
          {renderInputField('Detailed Description', 'description', 'Provide a detailed description of your suggestion...', true)}
          {renderInputField('Benefits & Value', 'benefits', 'How will this benefit our community? What value will it add?', true)}
          {renderInputField('Implementation Ideas', 'implementation', 'How do you think this could be implemented? (Optional)', true)}
          
          {/* Additional Information */}
          <Text style={styles.sectionTitle}>Additional Information</Text>
          {renderPicker('Preferred Timeline', 'timeline', timelines)}
          {renderPicker('Estimated Budget (Optional)', 'budget', budgetRanges)}
          {renderInputField('Supporting Documents/Links', 'supportingDocuments', 'Links to relevant documents, websites, or resources (Optional)', true)}
          
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
                {isSubmitting || isSubmittingToSupabase ? 'Submitting...' : 'Submit Suggestion'}
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
  suggestionTypeContainer: {
    gap: Default.fixPadding * 0.5,
  },
  suggestionTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Default.fixPadding * 1.2,
    paddingVertical: Default.fixPadding * 1,
    borderRadius: 10,
    borderWidth: 2,
    backgroundColor: Colors.white,
    marginBottom: Default.fixPadding * 0.5,
  },
  suggestionTypeText: {
    ...Fonts.Medium14black,
    marginLeft: Default.fixPadding * 0.8,
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
    gap: Default.fixPadding * 0.5,
  },
  priorityOption: {
    flex: 1,
    paddingHorizontal: Default.fixPadding * 1.2,
    paddingVertical: Default.fixPadding * 1,
    borderRadius: 10,
    borderWidth: 2,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  priorityOptionText: {
    ...Fonts.Medium14black,
    textAlign: 'center',
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

export default SuggestionsScreen;
