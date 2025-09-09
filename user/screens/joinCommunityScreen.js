import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  FlatList,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MyStatusBar from "../components/myStatusBar";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import { 
  useSearchCommunities, 
  useGetAllUnits, 
  useJoinCommunity,
  useGetCommunityByName,
  useCreateManualUnitRequest
} from "../hooks/useCommunityData";

const JoinCommunityScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() == "rtl";

  // Form state
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [comments, setComments] = useState("");
  
  // Search states
  const [communitySearchText, setCommunitySearchText] = useState("");
  const [unitDisplayText, setUnitDisplayText] = useState("");
  
  // Dropdown visibility
  const [showCommunityDropdown, setShowCommunityDropdown] = useState(false);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  
  // Manual entry states
  const [showManualUnitModal, setShowManualUnitModal] = useState(false);
  const [manualUnitText, setManualUnitText] = useState("");
  const [isManualEntry, setIsManualEntry] = useState(false);
  
  // Smart search hooks
  const { data: communitySuggestions = [], isLoading: communitiesLoading } = useSearchCommunities(communitySearchText);
  const { data: allUnits = [], isLoading: unitsLoading } = useGetAllUnits(selectedCommunity?.id);
  const { data: exactCommunity, isLoading: exactCommunityLoading } = useGetCommunityByName(communitySearchText);
  const joinCommunity = useJoinCommunity();
  const createManualRequest = useCreateManualUnitRequest();

  // Debug logging
  useEffect(() => {
    console.log('🔍 Community Selected:', selectedCommunity?.name, selectedCommunity?.id);
    console.log('📋 All Units:', allUnits.length, 'units');
    console.log('⌛ Units Loading:', unitsLoading);
    console.log('👀 Show Unit Dropdown:', showUnitDropdown);
    console.log('🔎 Exact Community Loading:', exactCommunityLoading);
    console.log('🔎 Exact Community Data:', exactCommunity);
    
    if (showUnitDropdown) {
      console.log('🚨 UNIT DROPDOWN IS BEING SHOWN - Check why!');
    }
  }, [selectedCommunity, allUnits, unitsLoading, showUnitDropdown, exactCommunityLoading, exactCommunity]);

  // Show community dropdown when there are suggestions
  useEffect(() => {
    setShowCommunityDropdown(communitySuggestions.length > 0);
  }, [communitySuggestions]);

  // Check if user typed a community name that doesn't exist in database
  useEffect(() => {
    const hasTypedText = communitySearchText.trim().length > 0;
    const hasNoSuggestions = communitySuggestions.length === 0 && !communitiesLoading;
    const hasNotSelectedFromDropdown = !selectedCommunity;
    const communityNotFoundInDB = exactCommunity === null && !exactCommunityLoading;
    
    // User typed something, no suggestions appeared, no selection made, and it's not in DB
    const isNonExistentCommunity = hasTypedText && hasNoSuggestions && hasNotSelectedFromDropdown && communityNotFoundInDB;
    
    setIsManualEntry(isNonExistentCommunity);
    console.log('🔎 Manual Entry Check:', {
      hasTypedText,
      hasNoSuggestions,
      hasNotSelectedFromDropdown, 
      communityNotFoundInDB,
      exactCommunityLoading,
      communitiesLoading,
      isNonExistentCommunity
    });
  }, [communitySearchText, communitySuggestions, communitiesLoading, selectedCommunity, exactCommunity, exactCommunityLoading]);

  // Reset unit selection when community changes
  useEffect(() => {
    if (selectedCommunity) {
      setSelectedUnit(null);
      setUnitDisplayText("");
      setIsManualEntry(false);
      setShowUnitDropdown(false); // Ensure unit dropdown is closed
    }
  }, [selectedCommunity]);

  const handleCommunitySelect = (community) => {
    setSelectedCommunity(community);
    setCommunitySearchText(community.name);
    setShowCommunityDropdown(false);
    
    // Reset unit selection when community changes
    setSelectedUnit(null);
    setUnitDisplayText("");
    
    // Make sure unit dropdown is closed when community is selected
    setShowUnitDropdown(false);
  };

  const handleUnitSelect = (unit) => {
    setSelectedUnit(unit);
    setUnitDisplayText(`${unit.block}-${unit.number}`);
    setShowUnitDropdown(false);
  };

  const handleUnitInputFocus = () => {
    console.log('🎯 Unit input focused');
    console.log('📝 Community search text:', communitySearchText);
    console.log('🏢 Selected community:', selectedCommunity?.name);
    console.log('📋 Is manual entry:', isManualEntry);
    
    if (!communitySearchText.trim()) {
      Alert.alert(
        "Community Required",
        "Please enter a community name first before choosing a property unit.",
        [{ text: "OK" }]
      );
      return;
    }
    
    // If user has selected a community from dropdown, show normal units
    if (selectedCommunity) {
      console.log('✅ Setting showUnitDropdown to true for selected community');
      setShowUnitDropdown(true);
      return;
    }
    
    // If user typed a community name that doesn't exist in database
    if (isManualEntry) {
      console.log('🔧 Manual entry mode - will show "No Units Found" with add option');
      setShowUnitDropdown(true);
      return;
    }
    
    // User typed something but hasn't selected from dropdown yet
    Alert.alert(
      "Community Selection",
      "Please select a community from the suggestions or continue with manual entry.",
      [{ text: "OK" }]
    );
  };

  const handleManualUnitAdd = () => {
    setShowManualUnitModal(true);
  };

  const handleManualUnitSubmit = () => {
    if (!manualUnitText.trim()) {
      Alert.alert("Error", "Please enter unit information.");
      return;
    }
    
    setUnitDisplayText(manualUnitText.trim());
    setShowManualUnitModal(false);
    setShowUnitDropdown(false);
    setSelectedUnit({ manual: true, displayText: manualUnitText.trim() });
  };

  const handleSubmit = async () => {
    // Validation for normal community selection
    if (selectedCommunity && !selectedUnit) {
      Alert.alert("Error", "Please select a property unit.");
      return;
    }
    
    // Validation for manual entry
    if (isManualEntry && !selectedUnit?.manual) {
      Alert.alert("Error", "Please add unit information for this community.");
      return;
    }
    
    if (!communitySearchText.trim()) {
      Alert.alert("Error", "Please enter a community name.");
      return;
    }

    try {
      if (isManualEntry) {
        // Submit manual entry request
        await createManualRequest.mutateAsync({
          communityName: communitySearchText.trim(),
          unitInfo: selectedUnit.displayText,
          comments: comments.trim(),
        });
        
        Alert.alert(
          "Request Submitted",
          "Your manual entry request has been submitted for admin review. You will be notified once it's processed.",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        // Submit normal join request
        await joinCommunity.mutateAsync({
          communityId: selectedCommunity.id,
          unitId: selectedUnit.id,
          comments: comments.trim(),
        });
        
        Alert.alert(
          "Request Submitted",
          "Your join request has been submitted successfully. You will be notified once it's approved.",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert("Error", "Failed to submit request. Please try again.");
    }
  };

  const renderCommunityItem = ({ item }) => (
    <TouchableOpacity
      style={{
        padding: Default.fixPadding,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGrey,
        backgroundColor: Colors.white,
      }}
      onPress={() => handleCommunitySelect(item)}
    >
      <Text style={{ ...Fonts.Medium14black }}>{item.name}</Text>
      <Text style={{ ...Fonts.Regular12grey, marginTop: 2 }}>
        {item.address}, {item.city}, {item.state}
      </Text>
    </TouchableOpacity>
  );

  const renderUnitItem = ({ item }) => (
    <TouchableOpacity
      style={{
        padding: Default.fixPadding,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGrey,
        backgroundColor: Colors.white,
      }}
      onPress={() => handleUnitSelect(item)}
    >
      <Text style={{ ...Fonts.Medium14black }}>{`${item.block}-${item.number}`}</Text>
      <Text style={{ ...Fonts.Regular12grey, marginTop: 2 }}>
        {item.unit_type} • Floor {item.floor}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.regularGrey }}>
      <MyStatusBar />
      
      {/* Header */}
      <View
        style={{
          flexDirection: isRtl ? "row-reverse" : "row",
          alignItems: "center",
          paddingHorizontal: Default.fixPadding * 2,
          paddingVertical: Default.fixPadding * 1.2,
          backgroundColor: Colors.white,
          ...Default.shadow,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            padding: Default.fixPadding * 0.5,
          }}
        >
          <Ionicons
            name={isRtl ? "chevron-forward" : "chevron-back"}
            size={24}
            color={Colors.black}
          />
        </TouchableOpacity>
        
        <Text
          style={{
            ...Fonts.SemiBold18black,
            flex: 1,
            marginHorizontal: Default.fixPadding,
            textAlign: isRtl ? "right" : "left",
          }}
        >
          Join a Community
        </Text>
        
        <TouchableOpacity
          style={{
            padding: Default.fixPadding * 0.5,
          }}
        >
          <Ionicons name="help-circle-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: Default.fixPadding * 2 }}>
          {/* Description */}
          <Text
            style={{
              ...Fonts.Medium14grey,
              lineHeight: 22,
              marginBottom: Default.fixPadding * 3,
              textAlign: isRtl ? "right" : "left",
            }}
          >
            Kindly provide the following information to help your manager verify your identity
          </Text>

          {/* Community Selection */}
          <View style={{ marginBottom: Default.fixPadding * 2 }}>
            <View
              style={{
                backgroundColor: Colors.white,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: Colors.lightGrey,
                ...Default.shadow,
              }}
            >
              <TextInput
                style={{
                  ...Fonts.Medium14black,
                  padding: Default.fixPadding * 1.5,
                  textAlign: isRtl ? "right" : "left",
                }}
                placeholder="Select Community"
                placeholderTextColor={Colors.grey}
                value={communitySearchText}
                onChangeText={setCommunitySearchText}
                onFocus={() => setShowCommunityDropdown(true)}
              />
              
              {showCommunityDropdown && communitySuggestions.length > 0 && (
                <View
                  style={{
                    maxHeight: 200,
                    borderTopWidth: 1,
                    borderTopColor: Colors.lightGrey,
                  }}
                >
                  <FlatList
                    data={communitySuggestions}
                    renderItem={renderCommunityItem}
                    keyExtractor={(item) => item.id.toString()}
                    nestedScrollEnabled
                  />
                </View>
              )}
            </View>
          </View>

          {/* Unit Selection */}
          <View style={{ marginBottom: Default.fixPadding * 2 }}>
            <TouchableOpacity
              style={{
                backgroundColor: Colors.white,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: (selectedCommunity || isManualEntry) ? Colors.lightGrey : Colors.extraLightGrey,
                opacity: (selectedCommunity || isManualEntry) ? 1 : 0.6,
                ...Default.shadow,
              }}
              onPress={handleUnitInputFocus}
              disabled={!selectedCommunity && !isManualEntry}
            >
              <View
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  alignItems: "center",
                  padding: Default.fixPadding * 1.5,
                }}
              >
                <Text
                  style={{
                    ...Fonts.Medium14black,
                    flex: 1,
                    textAlign: isRtl ? "right" : "left",
                    color: unitDisplayText ? Colors.black : Colors.grey,
                  }}
                >
                  {unitDisplayText || "Select Property Unit"}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={(selectedCommunity || isManualEntry) ? Colors.grey : Colors.extraLightGrey}
                />
              </View>
              
              {showUnitDropdown && allUnits.length > 0 && (
                <View
                  style={{
                    maxHeight: 200,
                    borderTopWidth: 1,
                    borderTopColor: Colors.lightGrey,
                  }}
                >
                  <FlatList
                    data={allUnits}
                    renderItem={renderUnitItem}
                    keyExtractor={(item) => item.id.toString()}
                    nestedScrollEnabled
                  />
                </View>
              )}
              {showUnitDropdown && allUnits.length === 0 && (
                <View
                  style={{
                    padding: Default.fixPadding,
                    borderTopWidth: 1,
                    borderTopColor: Colors.lightGrey,
                  }}
                >
                  {unitsLoading ? (
                    <Text style={{ ...Fonts.Regular12grey, textAlign: 'center' }}>
                      Loading units...
                    </Text>
                  ) : isManualEntry ? (
                    // Manual entry case - show "No Units Found" with Add option
                    <View>
                      <Text style={{ ...Fonts.Regular12grey, textAlign: 'center', marginBottom: Default.fixPadding }}>
                        No Units Found
                      </Text>
                      <TouchableOpacity
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: Colors.primary,
                          paddingVertical: Default.fixPadding * 0.8,
                          paddingHorizontal: Default.fixPadding * 1.5,
                          borderRadius: 8,
                        }}
                        onPress={handleManualUnitAdd}
                      >
                        <Ionicons name="add" size={16} color={Colors.white} style={{ marginRight: 5 }} />
                        <Text style={{ ...Fonts.SemiBold12white }}>
                          Add Unit
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    // Normal case - just no units
                    <Text style={{ ...Fonts.Regular12grey, textAlign: 'center' }}>
                      No units available
                    </Text>
                  )}
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Comments */}
          <View style={{ marginBottom: Default.fixPadding * 4 }}>
            <View
              style={{
                backgroundColor: Colors.white,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: Colors.lightGrey,
                minHeight: 120,
                ...Default.shadow,
              }}
            >
              <TextInput
                style={{
                  ...Fonts.Medium14black,
                  padding: Default.fixPadding * 1.5,
                  textAlign: isRtl ? "right" : "left",
                  textAlignVertical: "top",
                  flex: 1,
                }}
                placeholder="Comments"
                placeholderTextColor={Colors.grey}
                value={comments}
                onChangeText={setComments}
                multiline
                numberOfLines={4}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={joinCommunity.isPending || createManualRequest.isPending}
            style={{
              backgroundColor: (joinCommunity.isPending || createManualRequest.isPending) ? Colors.grey : Colors.primary,
              borderRadius: 12,
              paddingVertical: Default.fixPadding * 1.5,
              ...Default.shadow,
            }}
          >
            <Text
              style={{
                ...Fonts.SemiBold16white,
                textAlign: "center",
              }}
            >
              {(joinCommunity.isPending || createManualRequest.isPending) ? "Submitting..." : "Join Now"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Manual Unit Entry Modal */}
      <Modal
        visible={showManualUnitModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowManualUnitModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: Default.fixPadding * 2,
          }}
        >
          <View
            style={{
              backgroundColor: Colors.white,
              borderRadius: 12,
              padding: Default.fixPadding * 2,
              width: "100%",
              maxWidth: 400,
              ...Default.shadow,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: Default.fixPadding * 2,
              }}
            >
              <Text style={{ ...Fonts.SemiBold16black }}>Add Unit Information</Text>
              <TouchableOpacity onPress={() => setShowManualUnitModal(false)}>
                <Ionicons name="close" size={24} color={Colors.grey} />
              </TouchableOpacity>
            </View>
            
            <Text style={{ ...Fonts.Regular12grey, marginBottom: Default.fixPadding }}>
              Please enter your unit details (e.g., "A-301", "Block B Unit 205", etc.)
            </Text>
            
            <TextInput
              style={{
                backgroundColor: Colors.regularGrey,
                borderRadius: 8,
                padding: Default.fixPadding * 1.5,
                ...Fonts.Medium14black,
                marginBottom: Default.fixPadding * 2,
                textAlign: isRtl ? "right" : "left",
              }}
              placeholder="Enter unit information"
              placeholderTextColor={Colors.grey}
              value={manualUnitText}
              onChangeText={setManualUnitText}
              autoFocus={true}
            />
            
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: Colors.extraLightGrey,
                  borderRadius: 8,
                  paddingVertical: Default.fixPadding,
                  marginRight: Default.fixPadding,
                }}
                onPress={() => setShowManualUnitModal(false)}
              >
                <Text style={{ ...Fonts.Medium14grey, textAlign: "center" }}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: Colors.primary,
                  borderRadius: 8,
                  paddingVertical: Default.fixPadding,
                  marginLeft: Default.fixPadding,
                }}
                onPress={handleManualUnitSubmit}
              >
                <Text style={{ ...Fonts.Medium14white, textAlign: "center" }}>Add Unit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default JoinCommunityScreen; 