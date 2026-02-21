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
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MyStatusBar from "../components/myStatusBar";
import { ms } from "react-native-size-matters/extend";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AwesomeButton from "react-native-really-awesome-button";
import { useGetMaintenanceRequest, useListMaintenanceComments, useCreateMaintenanceComment, useUpdateMaintenanceRequest } from "../hooks/useSupabaseData";
import { useHasJoinedCommunity } from '../hooks/useCommunityData';
import { getAvatarSource } from "../utils/avatarMapping";
import { useQueryClient } from '@tanstack/react-query';

const MaintenanceDetailScreen = ({ navigation, route }) => {
  const maintenanceId = route?.params?.maintenanceId
    ? String(route.params.maintenanceId)
    : "";
  const headerTitle = route?.params?.headerTitle;

  const { i18n } = useTranslation();
  
  // maintenance_requests.id is bigint in DB
  const isValidId = (id) => {
    if (!id) return false;
    const intId = Number(id);
    return Number.isFinite(intId) && intId > 0;
  };
  
  // Fetch real maintenance data from Supabase
  const { 
    data: maintenance, 
    isLoading, 
    error 
  } = useGetMaintenanceRequest(maintenanceId);

  // Get current user from auth context (same pattern as complaint screen)
  const { profile } = useHasJoinedCommunity();
  const queryClient = useQueryClient();

  // Fetch comments for this maintenance
  const { 
    data: comments = [], 
    isLoading: commentsLoading,
    refetch: refetchComments 
  } = useListMaintenanceComments(maintenanceId);
  
  // Add a function to force refresh comments
  const handleRefreshComments = async () => {
    // Invalidate all maintenance comment queries to force fresh data
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        return query.queryKey[0] === 'maintenance-comments';
      }
    });
    
    // Also invalidate this specific query
    queryClient.invalidateQueries({ queryKey: ['maintenance-comments', maintenanceId] });
    
    await refetchComments();
  };

  // Create comment mutation
  const createCommentMutation = useCreateMaintenanceComment();
  
  // Update maintenance mutation for resolving/reopening
  const updateMaintenanceMutation = useUpdateMaintenanceRequest();

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
      return `${profile.units.block}-${profile.units.number}`;
    }

    return profile.unit_id ? 'Unit Info Missing' : 'N/A';
  };

  const isRtl = i18n.dir() === "rtl";

  const getStatusMeta = (rawStatus) => {
    const normalizedStatus = (rawStatus || "pending").toLowerCase();
    switch (normalizedStatus) {
      case "completed":
        return { label: "Completed", color: Colors.green };
      case "in_progress":
        return { label: "In Progress", color: Colors.orange };
      case "cancelled":
        return { label: "Cancelled", color: Colors.grey };
      default:
        return { label: "Pending", color: Colors.red };
    }
  };

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

  const backAction = useCallback(() => {
    navigation.pop();
    return true;
  }, [navigation]);
  
  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => subscription?.remove();
  }, [backAction]);

  // Format comment data for display - only show real comments, no mock data
  const commentList = comments.length > 0 ? comments.map((comment) => {
    return {
      key: comment.id,
      name: comment.created_by_profile ? 
        `${comment.created_by_profile.first_name} ${comment.created_by_profile.last_name}` : 
        'Unknown User',
      email: comment.created_by_profile?.email,
      time: formatRelativeTime(comment.created_at),
      flatNo: getCommenterFlatNo(comment.created_by_profile), // Fixed: Pass the profile object, not the entire comment
      comment: comment.comment,
      image: getAvatarSource(comment.created_by_profile?.avatar_url), // Use consistent avatar mapping
    };
  }) : [];

  const [writeComment, setWriteComment] = useState("");

  // Handle comment submission
  const handleSendComment = async () => {
    if (!writeComment?.trim() || !profile?.id) {
      Alert.alert('Error', 'Unable to post comment. Please ensure you are logged in.');
      return;
    }
    
    try {
      const maintenanceIdInt = parseInt(maintenanceId);
      if (isNaN(maintenanceIdInt)) {
        throw new Error('Invalid maintenance ID');
      }
      
      const commentData = {
        maintenance_id: maintenanceIdInt,
        comment: writeComment.trim(),
        created_by: profile.id,
      };

      await createCommentMutation.mutateAsync(commentData);
      
      setWriteComment("");
      Keyboard.dismiss();
      Alert.alert('Success', 'Comment posted successfully!');
      
    } catch (error) {
      if (error.code === '42501') {
        Alert.alert(
          'Permission Error', 
          'You do not have permission to comment on this maintenance request. Please ensure you are logged in with the correct account.'
        );
      } else {
        Alert.alert('Error', `Failed to send comment: ${error.message}`);
      }
    }
  };

  // Handle resolve/reopen maintenance
  const handleToggleMaintenanceStatus = async () => {
    if (!maintenanceId || !isValidId(maintenanceId)) {
      return;
    }
    
    try {
      const currentStatus = maintenance?.status || 'pending';
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';

      await updateMaintenanceMutation.mutateAsync({
        id: maintenanceId,
        data: {
          status: newStatus,
          updated_at: new Date().toISOString(),
          // Add resolved fields if marking as completed
          ...(newStatus === 'completed' && {
            resolved_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
            resolved_by_profile_id: profile?.id
          }),
          // Clear resolved fields if reopening
          ...(newStatus === 'pending' && {
            resolved_at: null,
            completed_at: null,
            resolved_by_profile_id: null
          })
        }
      });
      
      // Invalidate and refetch the maintenance data to update UI immediately
      queryClient.invalidateQueries({ queryKey: ['maintenance', maintenanceId] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
    } catch (error) {
      Alert.alert("Error", error?.message || "Failed to update maintenance status.");
    }
  };

  // Build data from the DB-backed maintenance row
  const getMaintenanceData = () => {
    if (!maintenance || !isValidId(maintenanceId)) {
      return null;
    }

    const submittedBy =
      maintenance.requested_by_profile?.full_name ||
      `${maintenance.requested_by_profile?.first_name || ""} ${maintenance.requested_by_profile?.last_name || ""}`.trim() ||
      "Unknown";
    const resolvedBy =
      maintenance.status === "completed" &&
      maintenance.resolved_by_profile_id === profile?.id
        ? "You"
        : maintenance.status === "completed"
          ? maintenance.resolved_by_profile?.full_name ||
            `${maintenance.resolved_by_profile?.first_name || ""} ${maintenance.resolved_by_profile?.last_name || ""}`.trim() ||
            "Admin"
          : "Unknown";

    const statusMeta = getStatusMeta(maintenance.status);

    return {
      title: maintenance.title,
      dateTime: formatDateTime(maintenance.created_at),
      description: maintenance.description,
      submittedBy,
      resolvedBy,
      status: maintenance.status,
      statusMeta,
      images: Array.isArray(maintenance.images)
        ? maintenance.images.filter((img) => typeof img === "string")
        : [],
      resolved: (maintenance.status || "pending").toLowerCase() === "completed",
    };
  };

  const maintenanceData = getMaintenanceData();

  if (!isValidId(maintenanceId)) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : null}
        style={{ flex: 1, backgroundColor: Colors.white }}
      >
        <MyStatusBar />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ ...Fonts.Medium16grey, textAlign: "center" }}>
            Invalid maintenance request reference.
          </Text>
        </View>
      </KeyboardAvoidingView>
    );
  }

  if (isLoading) {
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
              Loading maintenance details...
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  if (error) {
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
              Error loading maintenance details: {error.message}
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  if (!maintenanceData) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : null}
        style={{ flex: 1, backgroundColor: Colors.white }}
      >
        <MyStatusBar />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ ...Fonts.Medium16grey, textAlign: "center" }}>
            Maintenance request not found.
          </Text>
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
            >{`${headerTitle || "Request"} Maintenance`}</Text>

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
                    (maintenanceData.images && maintenanceData.images.length > 0 && typeof maintenanceData.images[0] === 'string') 
                      ? { uri: maintenanceData.images[0] } 
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
                    {maintenanceData.title}
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
                      {maintenanceData.dateTime}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={{
                        ...Fonts.Medium14grey,
                        overflow: "hidden",
                        marginVertical: Default.fixPadding * 0.3,
                      }}
                    >
                      {maintenanceData.description}
                    </Text>

                    <Text
                      numberOfLines={1}
                      style={{ ...Fonts.Medium14grey, overflow: "hidden" }}
                    >
                      {maintenanceData.resolved ? "Completed By" : "Raised By"}
                      <Text
                        style={{ ...Fonts.Medium14black }}
                      >{` : ${maintenanceData.resolved ? maintenanceData.resolvedBy : maintenanceData.submittedBy}`}</Text>
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
                  backgroundColor: maintenanceData.statusMeta.color,
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
                  {maintenanceData.statusMeta.label}
                </Text>
              </View>
            </View>

            <AwesomeButton
              height={50}
              onPress={handleToggleMaintenanceStatus}
              disabled={updateMaintenanceMutation.isLoading}
              raiseLevel={1}
              stretch={true}
              borderRadius={10}
              backgroundShadow={maintenanceData.resolved ? Colors.green : Colors.primary}
              backgroundDarker={maintenanceData.resolved ? Colors.green : Colors.primary}
              backgroundColor={maintenanceData.resolved ? Colors.green : Colors.primary}
            >
              <Text style={{ ...Fonts.SemiBold18white }}>
                {updateMaintenanceMutation.isLoading 
                  ? "Updating..." 
                  : (maintenanceData.resolved ? "Reopen" : "Mark Completed")
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
              Maintenance Images
            </Text>

            {/* Only show image section if maintenance has images */}
            {maintenanceData.images && maintenanceData.images.length > 0 && 
             Array.isArray(maintenanceData.images) && 
             maintenanceData.images.every(img => typeof img === 'string') ? (
              <View
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  alignItems: "center",
                  marginTop: Default.fixPadding,
                }}
              >
                {/* Dynamic layout based on number of images */}
                {maintenanceData.images.length === 1 ? (
                  // Single image - stretch across full width
                  <ImageBackground
                    source={{ uri: maintenanceData.images[0] }}
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
                      source={{ uri: maintenanceData.images[0] }}
                      style={{
                        flex: 1,
                        resizeMode: "stretch",
                        overflow: "hidden",
                        height: ms(120),
                        borderRadius: 10,
                      }}
                    />
                    {maintenanceData.images[1] && (
                      <ImageBackground
                        source={{ uri: maintenanceData.images[1] }}
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
                    )}
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
                  No images attached to this maintenance request
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
              {maintenanceData.description || "No description available for this maintenance request."}
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
                Recent Comments
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
                              : (typeof item.image === 'string' && item.image.startsWith('http'))
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
            placeholder="Write a comment..."
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

export default MaintenanceDetailScreen;

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
