import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  StyleSheet,
  Image,
  ScrollView,
  ImageBackground,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MyStatusBar from "../components/myStatusBar";
import { ms } from "react-native-size-matters/extend";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AwesomeButton from "react-native-really-awesome-button";
import { useGetComplaint, useListComplaintComments, useCreateComplaintComment, useGetUserUnit, useUpdateComplaint } from "../hooks/useSupabaseData";
import { useHasJoinedCommunity } from '../hooks/useCommunityData';
import { useAuth } from '../contexts/AuthContext';
import { getAvatarSource } from "../utils/avatarMapping";
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';

const ComplaintDetailScreen = ({ navigation, route }) => {
  const { 
    complaintId, 
    headerTitle, 
    // Legacy props for fallback
    image, title, dateTime, other, name, resolved 
  } = route.params;

  const { t, i18n } = useTranslation();
  
  // Fetch real complaint data from Supabase
  const { 
    data: complaint, 
    isLoading, 
    error 
  } = useGetComplaint(complaintId);

  // Get current user from auth context (same pattern as maintenance screen)
  const { user } = useAuth();
  const { profile } = useHasJoinedCommunity();
  const queryClient = useQueryClient();

  // Get user's unit information using profile ID (not user_id)
  const { data: userUnit } = useGetUserUnit(profile?.id);

  // Fetch comments for this complaint
  const { 
    data: comments = [], 
    isLoading: commentsLoading,
    error: commentsError,
    refetch: refetchComments 
  } = useListComplaintComments(complaintId);

  // Add a function to force refresh comments
  const handleRefreshComments = async () => {
    // Invalidate all complaint comment queries to force fresh data
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        return query.queryKey[0] === 'complaint-comments';
      }
    });
    
    // Also invalidate this specific query
    queryClient.invalidateQueries({ queryKey: ['complaint-comments', complaintId] });
    
    await refetchComments();
  };

  // Create comment mutation
  const createCommentMutation = useCreateComplaintComment();
  
  // Update complaint mutation for resolving/reopening
  const updateComplaintMutation = useUpdateComplaint();

  // Get user's unit information for flatNo display
  const getUserFlatNo = () => {
    if (userUnit?.block && userUnit?.number) {
      return `${userUnit.block}-${userUnit.number}`;
    }
    return "N/A";
  };

  // Helper function to get unit information for any commenter
  const getCommenterFlatNo = (profile) => {
    if (!profile) {
      return 'N/A';
    }

    // Check if user is admin - show "Admin" only for admin role
    if (profile.role && profile.role.toLowerCase() === 'admin') {
      return 'Admin';
    }

    // For all other users (including staff), show their unit information
    if (profile.units && profile.units.block && profile.units.number) {
      const unitDisplay = `${profile.units.block}-${profile.units.number}`;
      return unitDisplay;
    }

    // Fallback - check if there's unit_id and try to get unit info another way
    if (profile.unit_id) {
      return 'Unit Info Missing';
    }

    return 'N/A';
  };

  // Check if this is a valid UUID to determine if we should try fetching from Supabase
  const isValidUUID = (id) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return id && uuidRegex.test(id);
  };

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`complaintDetailScreen:${key}`);
  }

  // Helper functions for data display - define these first
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString() + ", " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return "N/A";
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}min ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return formatDateTime(dateString);
  };

  const backAction = () => {
    navigation.pop();
    return true;
  };
  
  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => subscription?.remove();
  }, []);

  // Format comment data for display - only show real comments, no mock data
  const commentList = comments.length > 0 ? comments.map((comment) => {
    return {
      key: comment.id,
      name: comment.created_by_profile ? 
        `${comment.created_by_profile.first_name} ${comment.created_by_profile.last_name}` : 
        'Unknown User',
      email: comment.created_by_profile?.email,
      time: formatRelativeTime(comment.created_at),
      flatNo: getCommenterFlatNo(comment.created_by_profile), // Fixed: Pass the profile object and show unit for all commenters
      comment: comment.comment,
      image: getAvatarSource(comment.created_by_profile?.avatar_url), // Use consistent avatar mapping
    };
  }) : [];

  const [writeComment, setWriteComment] = useState("");

  // Handle comment submission with comprehensive authentication debugging
  const handleSendComment = async () => {
    // Check basic requirements - we need writeComment and profile, user from context might be different from session
    if (!writeComment?.trim() || !profile?.id) {
      Alert.alert('Error', 'Unable to post comment. Please ensure you are logged in and have entered a comment.');
      return;
    }
    
    try {
      // 1. Check current Supabase session to get the real auth user
      const { data: { user: sessionUser }, error: sessionError } = await supabase.auth.getUser();
      
      if (!sessionUser) {
        Alert.alert('Authentication Error', 'No active session found. Please log in again.');
        return;
      }
      
      // 2. Verify profile matches session
      if (profile.user_id !== sessionUser.id) {
        Alert.alert('Authentication Error', 'Profile mismatch detected. Please log in again.');
        return;
      }
      
      // 3. Create comment data
      const commentData = {
        complaint_id: complaintId,
        comment: writeComment.trim(),
        created_by: sessionUser.id, // Use session user ID for RLS policy
      };
      
      // 4. Attempt to create comment
      await createCommentMutation.mutateAsync(commentData);
      
      setWriteComment("");
      Keyboard.dismiss();
      Alert.alert('Success', 'Comment posted successfully!');
      
    } catch (error) {
      console.error('❌ Error creating comment:', error);
      
      // Provide specific error messages based on error type
      if (error.code === '42501') {
        Alert.alert(
          'Permission Error', 
          'You do not have permission to comment on this complaint. Please ensure you are logged in with the correct account.'
        );
      } else {
        Alert.alert('Error', `Failed to send comment: ${error.message}`);
      }
    }
  };

  // Handle resolve/reopen complaint
  const handleToggleComplaintStatus = async () => {
    if (!complaintId || !isValidUUID(complaintId)) return;
    
    try {
      const currentStatus = complaint?.status || 'pending';
      const newStatus = currentStatus === 'resolved' ? 'pending' : 'resolved';
      
      await updateComplaintMutation.mutateAsync({
        id: complaintId,
        data: {
          status: newStatus,
          updated_at: new Date().toISOString(),
          // Add resolved fields if marking as resolved
          ...(newStatus === 'resolved' && {
            resolved_at: new Date().toISOString(),
            resolved_by_profile_id: profile?.id
          }),
          // Clear resolved fields if reopening
          ...(newStatus === 'pending' && {
            resolved_at: null,
            resolved_by_profile_id: null
          })
        }
      });
      
      // Invalidate and refetch the complaint data to update UI immediately
      queryClient.invalidateQueries({ queryKey: ['complaint', complaintId] });
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['community-complaints'] });
      
      console.log(`Complaint ${newStatus === 'resolved' ? 'resolved' : 'reopened'} successfully`);
    } catch (error) {
      console.error('Error updating complaint status:', error);
      // You can add error toast/alert here
    }
  };

  // Get data either from Supabase or fallback to legacy route params
  const getComplaintData = () => {
    // If we have real complaint data from Supabase, use it
    if (complaint && isValidUUID(complaintId)) {
      return {
        title: complaint.title || complaint.subject,
        dateTime: formatDateTime(complaint.created_at),
        description: complaint.description || complaint.details,
        submittedBy: complaint.submitted_by || "Unknown",
        status: complaint.status,
        images: complaint.images || [],
        resolved: complaint.status === 'resolved'
      };
    }
    // Fallback to legacy route params for mock data
    return {
      title: title,
      dateTime: dateTime,
      description: other,
      submittedBy: name,
      status: resolved ? 'resolved' : 'pending',
      images: image ? [image] : [],
      resolved: resolved
    };
  };

  const complaintData = getComplaintData();

  // Show loading state only for valid UUIDs
  if (isLoading && isValidUUID(complaintId)) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : null}
        style={{ flex: 1, backgroundColor: Colors.white }}
      >
        <MyStatusBar />
        <View style={{ flex: 1 }}>
          <View
            style={{
              alignSelf: isRtl ? "flex-end" : "flex-start",
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
          </View>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={{ ...Fonts.Medium16grey, marginTop: Default.fixPadding }}>
              Loading complaint details...
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // Show error state only for valid UUIDs and real errors
  if (error && isValidUUID(complaintId)) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : null}
        style={{ flex: 1, backgroundColor: Colors.white }}
      >
        <MyStatusBar />
        <View style={{ flex: 1 }}>
          <View
            style={{
              alignSelf: isRtl ? "flex-end" : "flex-start",
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
          </View>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ ...Fonts.Medium16grey, textAlign: 'center' }}>
              Error loading complaint details: {error.message}
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <MyStatusBar />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <View
          style={{
            alignSelf: isRtl ? "flex-end" : "flex-start",
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
        </View>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={{
              marginTop: Default.fixPadding * 0.8,
              marginHorizontal: Default.fixPadding * 2,
            }}
          >
            <Text
              style={{
                ...Fonts.SemiBold16black,
                textAlign: isRtl ? "right" : "left",
              }}
            >{`${headerTitle} ${tr("complaint")}`}</Text>

            <View
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                paddingLeft: Default.fixPadding * 1.5,
                ...styles.mainViewBox,
              }}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: isRtl ? "row-reverse" : "row",
                  alignItems: "center",
                }}
              >
                <Image
                  source={
                    (complaintData.images && complaintData.images.length > 0) 
                      ? { uri: complaintData.images[0] } 
                      : require("../assets/images/pic1.png")
                  }
                  style={{
                    width: ms(87),
                    height: ms(87),
                    borderRadius: 5,
                    marginTop: Default.fixPadding * 1.5,
                  }}
                />

                <View
                  style={{
                    flex: 1,
                    alignItems: isRtl ? "flex-end" : "flex-start",
                    marginLeft: isRtl ? 0 : Default.fixPadding,
                    marginRight: isRtl ? Default.fixPadding : 0,
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={{
                      ...Fonts.SemiBold16black,
                      overflow: "hidden",
                      textAlign: isRtl ? "right" : "left",
                      paddingTop: Default.fixPadding,
                      marginRight: isRtl ? 0 : Default.fixPadding * 10,
                      marginLeft: isRtl ? Default.fixPadding * 10 : 0,
                    }}
                  >
                    {complaintData.title}
                  </Text>

                  <View
                    style={{
                      alignItems: isRtl ? "flex-end" : "flex-start",
                      marginRight: isRtl ? 0 : Default.fixPadding,
                      marginLeft: isRtl ? Default.fixPadding : 0,
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      style={{
                        ...Fonts.Medium14grey,
                        overflow: "hidden",
                      }}
                    >
                      {complaintData.dateTime}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={{
                        ...Fonts.Medium14grey,
                        overflow: "hidden",
                        marginVertical: Default.fixPadding * 0.3,
                      }}
                    >
                      {complaintData.description}
                    </Text>

                    <Text
                      numberOfLines={1}
                      style={{ ...Fonts.Medium14grey, overflow: "hidden" }}
                    >
                      {complaintData.resolved ? tr("resolvedBy") : tr("raisedBy")}
                      <Text
                        style={{ ...Fonts.Medium14black }}
                      >{` : ${complaintData.submittedBy}`}</Text>
                    </Text>
                  </View>
                </View>
              </View>

              <View
                style={{
                  position: "absolute",
                  right: isRtl ? null : 0,
                  left: isRtl ? 0 : null,
                  justifyContent: "center",
                  alignItems: "center",
                  width: 90,
                  paddingVertical: Default.fixPadding * 0.3,
                  backgroundColor: complaintData.resolved ? Colors.green : Colors.primary,
                  borderTopRightRadius: isRtl ? 0 : 10,
                  borderTopLeftRadius: isRtl ? 10 : 0,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    ...Fonts.SemiBold16white,
                    overflow: "hidden",
                    paddingHorizontal: Default.fixPadding * 0.5,
                  }}
                >
                  {complaintData.resolved ? tr("resolved") : tr("pending")}
                </Text>
              </View>
            </View>

            <AwesomeButton
              height={50}
              onPress={handleToggleComplaintStatus}
              disabled={updateComplaintMutation.isLoading}
              raiseLevel={1}
              stretch={true}
              borderRadius={10}
              backgroundShadow={complaintData.resolved ? Colors.green : Colors.primary}
              backgroundDarker={complaintData.resolved ? Colors.green : Colors.primary}
              backgroundColor={complaintData.resolved ? Colors.green : Colors.primary}
            >
              <Text style={{ ...Fonts.SemiBold18white }}>
                {updateComplaintMutation.isLoading 
                  ? "Updating..." 
                  : (complaintData.resolved ? tr("reopen") : tr("markResolved"))
                }
              </Text>
            </AwesomeButton>

            <Text
              style={{
                ...Fonts.SemiBold16black,
                textAlign: isRtl ? "right" : "left",
                marginTop: Default.fixPadding * 2.5,
              }}
            >
              {tr("complaintImage")}
            </Text>

            {/* Only show image section if complaint has images */}
            {complaintData.images && complaintData.images.length > 0 ? (
              <View
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  alignItems: "center",
                  marginTop: Default.fixPadding,
                }}
              >
                {/* Dynamic layout based on number of images */}
                {complaintData.images.length === 1 ? (
                  // Single image - stretch across full width
                  <ImageBackground
                    source={{ uri: complaintData.images[0] }}
                    style={{
                      width: "100%",
                      resizeMode: "stretch",
                      overflow: "hidden",
                      height: ms(120),
                      borderRadius: 10,
                    }}
                  />
                ) : (
                  // Multiple images - side by side layout
                  <>
                    <ImageBackground
                      source={{ uri: complaintData.images[0] }}
                      style={{
                        flex: 1,
                        resizeMode: "stretch",
                        overflow: "hidden",
                        height: ms(120),
                        borderRadius: 10,
                      }}
                    />
                    <ImageBackground
                      source={{ uri: complaintData.images[1] }}
                      style={{
                        flex: 1,
                        resizeMode: "stretch",
                        overflow: "hidden",
                        height: ms(120),
                        borderRadius: 10,
                        marginLeft: isRtl ? 0 : Default.fixPadding * 2,
                        marginRight: isRtl ? Default.fixPadding * 2 : 0,
                      }}
                    />
                  </>
                )}
              </View>
            ) : (
              // No images - show "No images attached" message
              <View
                style={{
                  marginTop: Default.fixPadding,
                  padding: Default.fixPadding * 1.5,
                  backgroundColor: Colors.lightGrey,
                  borderRadius: 10,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    ...Fonts.Medium14grey,
                    textAlign: "center",
                  }}
                >
                  No images attached to this complaint
                </Text>
              </View>
            )}

            <Text
              style={{
                ...Fonts.Medium14grey,
                textAlign: isRtl ? "right" : "left",
                marginTop: Default.fixPadding,
                marginBottom: Default.fixPadding * 2.5,
              }}
            >
              {complaintData.description || "No description available for this complaint."}
            </Text>

            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: Default.fixPadding * 2.5,
            }}>
              <Text
                style={{
                  ...Fonts.SemiBold16black,
                  textAlign: isRtl ? "right" : "left",
                }}
              >
                {tr("recentComments")}
              </Text>
              <TouchableOpacity 
                onPress={handleRefreshComments}
                style={{
                  backgroundColor: Colors.primary,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 6,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
              >
                <Ionicons name="refresh-outline" size={16} color={Colors.white} style={{ marginRight: 4 }} />
                <Text style={{ ...Fonts.Medium12white, color: Colors.white }}>Refresh</Text>
              </TouchableOpacity>
            </View>

            {commentsLoading ? (
              <View style={{ padding: Default.fixPadding * 2, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={{ ...Fonts.Medium14grey, marginTop: Default.fixPadding }}>
                  Loading comments...
                </Text>
              </View>
            ) : commentList.length === 0 ? (
              <View style={{ 
                padding: Default.fixPadding * 3, 
                alignItems: 'center',
                backgroundColor: Colors.lightGrey,
                borderRadius: 15,
                marginTop: Default.fixPadding,
                marginBottom: Default.fixPadding * 2,
              }}>
                <Ionicons 
                  name="chatbubbles-outline" 
                  size={48} 
                  color={Colors.grey} 
                  style={{ marginBottom: Default.fixPadding }}
                />
                <Text style={{ 
                  ...Fonts.SemiBold16black, 
                  textAlign: 'center',
                  marginBottom: Default.fixPadding * 0.5 
                }}>
                  No Comments Yet
                </Text>
                <Text style={{ 
                  ...Fonts.Medium14grey, 
                  textAlign: 'center',
                  lineHeight: 20
                }}>
                  Be the first to share your thoughts!{'\n'}
                  Leave a comment below to start the conversation.
                </Text>
              </View>
            ) : (
              commentList.map((item, index) => {
              const firstIndex = index === 0;
              return (
                <View
                  key={item.key}
                  style={{
                    flex: 1,
                    paddingBottom: Default.fixPadding * 2.3,
                    paddingTop: firstIndex
                      ? Default.fixPadding
                      : Default.fixPadding * 2.3,
                    borderTopWidth: firstIndex ? null : 1,
                    borderTopColor: firstIndex ? null : Colors.lightGrey,
                  }}
                >
                  <View
                    style={{ flexDirection: isRtl ? "row-reverse" : "row", alignItems: "flex-start" }}
                  >
                    <View
                      style={{
                        flex: 1,
                        flexDirection: isRtl ? "row-reverse" : "row",
                        alignItems: "center",
                      }}
                    >
                      <View style={{ flex: 1.5 }}>
                        <Image
                          source={
                            typeof item.image === 'number' 
                              ? item.image 
                              : typeof item.image === 'string' && item.image.startsWith('http')
                                ? { uri: item.image }
                                : require("../assets/images/pic1.png") // Fallback avatar
                          }
                          style={{ width: 47, height: 47, borderRadius: 24 }}
                        />
                      </View>
                      <View
                        style={{
                          flex: 6.5,
                          alignItems: isRtl ? "flex-end" : "flex-start",
                          marginHorizontal: Default.fixPadding,
                        }}
                      >
                        <Text
                          numberOfLines={1}
                          style={{
                            ...Fonts.Medium16black,
                            overflow: "hidden",
                          }}
                        >
                          {item.name}
                        </Text>

                        <Text
                          style={{
                            ...Fonts.Medium14grey,
                            marginTop: Default.fixPadding * 0.5,
                          }}
                        >
                          {item.flatNo}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        position: "absolute",
                        right: isRtl ? null : 0,
                        left: isRtl ? 0 : null,
                        top: 0,
                      }}
                    >
                      <Text
                        style={{
                          ...Fonts.Medium14grey,
                          textAlign: isRtl ? "left" : "right",
                        }}
                      >
                        {item.time}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{
                      ...Fonts.Medium14grey,
                      textAlign: isRtl ? "right" : "left",
                      marginTop: Default.fixPadding * 1.7,
                    }}
                  >
                    {item.comment}
                  </Text>
                </View>
              );
            }))}
          </View>
        </ScrollView>
        
        <View
          style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            alignItems: "center",
            paddingVertical: Default.fixPadding * 1.2,
            backgroundColor: Colors.primary,
          }}
        >
          <TextInput
            value={writeComment}
            onChangeText={setWriteComment}
            placeholder={tr("writeComment")}
            placeholderTextColor={Colors.white}
            selectionColor={Colors.white}
            style={{
              ...Fonts.Medium14white,
              flex: 8.7,
              textAlign: isRtl ? "right" : "left",
              paddingLeft: isRtl ? 0 : Default.fixPadding * 1.8,
              paddingRight: isRtl ? Default.fixPadding * 1.8 : 0,
            }}
          />

          <View
            style={{
              flex: 1.3,
              alignItems: isRtl ? "flex-start" : "flex-end",
              marginHorizontal: Default.fixPadding * 2,
            }}
          >
            <TouchableOpacity
              disabled={!writeComment?.trim() || createCommentMutation.isLoading}
              onPress={handleSendComment}
              style={styles.sendBtn}
            >
              {createCommentMutation.isLoading ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <MaterialCommunityIcons
                  name="send"
                  size={20}
                  color={Colors.primary}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ComplaintDetailScreen;

const styles = StyleSheet.create({
  mainViewBox: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: Default.fixPadding * 1.5,
    marginVertical: Default.fixPadding * 1.5,
    borderRadius: 10,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  sendBtn: {
    justifyContent: "center",
    alignItems: "center",
    width: 37,
    height: 37,
    borderRadius: 19,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
});
