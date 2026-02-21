import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import { ms } from "react-native-size-matters/extend";
import { useListPersonalComplaints } from "../hooks/useSupabaseData";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../utils/supabase";
import { useQueryClient } from '@tanstack/react-query';
import { useFocusEffect } from '@react-navigation/native';
import { getAvatarSource } from "../utils/avatarMapping";

const ComplaintsPersonalTab = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const isRtl = i18n.dir() === "rtl";
  
  function tr(key) {
    return t(`complaintsPersonalTab:${key}`);
  }

  // Use only authenticated profile id in production (no hardcoded fallback ids).
  const { 
    data: supabaseComplaints = [], 
    isLoading, 
    error,
    refetch
  } = useListPersonalComplaints(profile?.id);

  // Force refetch when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('📱 Personal complaints tab focused, refetching data...');
      refetch();
    }, [refetch])
  );

  // Set up real-time subscription for complaints
  useEffect(() => {
    console.log('🔔 Setting up real-time subscription for personal complaints');
    if (!profile?.id) return;

    const channel = supabase
      .channel('personal-complaints-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'complaints',
          filter: `complaint_type=eq.personal AND raised_by=eq.${profile.id}`
        },
        (payload) => {
          console.log('🚀 Personal complaint change detected:', payload);
          // Invalidate queries when complaints table changes
          queryClient.invalidateQueries({ predicate: (query) => {
            const key = query.queryKey;
            return key.includes('personal-complaints');
          }});
        }
      )
      .subscribe();

    return () => {
      console.log('🔕 Removing personal complaints subscription');
      supabase.removeChannel(channel);
    };
  }, [profile, queryClient]);

  const renderItem = ({ item }) => {
    console.log('📱 Rendering complaint item:', {
      id: item.id,
      subject: item.subject,
      hasImages: item.images && item.images.length > 0,
      profile: item.raised_by_profile,
      avatarUrl: item.raised_by_profile?.avatar_url
    });
    
    const formatDateTime = (dateString) => {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return date.toLocaleDateString() + ", " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    return (
      <TouchableOpacity
        onPress={() => {
          navigation.push("complaintDetailScreen", {
            complaintId: item.id,
            headerTitle: tr("personal"),
          });
        }}
        style={{
          flexDirection: isRtl ? "row-reverse" : "row",
          ...styles.mainTouchOpacity,
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
              // Priority: 1) Complaint image if exists, 2) User's avatar, 3) Default fallback
              (item.images && item.images.length > 0) 
                ? { uri: item.images[0] } 
                : getAvatarSource(item.raised_by_profile?.avatar_url)
            }
            style={{
              width: ms(87),
              height: ms(87),
              borderRadius: 43.5, // Always use circular avatar display
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
              {item.title || item.subject}
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
                {formatDateTime(item.created_at)}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  ...Fonts.Medium14grey,
                  overflow: "hidden",
                  marginVertical: Default.fixPadding * 0.3,
                }}
              >
                {item.description || item.details || "No description"}
              </Text>

              <Text
                numberOfLines={1}
                style={{ ...Fonts.Medium14grey, overflow: "hidden" }}
              >
                {item.status === 'resolved' ? tr("resolvedBy") : tr("raisedBy")}
                <Text
                  style={{ ...Fonts.Medium14black }}
                >{` : ${item.raised_by_profile 
                  ? `${item.raised_by_profile.first_name} ${item.raised_by_profile.last_name}` 
                  : (item.submitted_by || "You")}`}</Text>
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
            backgroundColor: item.status === 'resolved' ? Colors.green : Colors.primary,
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
            {item.status === 'resolved' ? tr("resolved") : tr("pending")}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: Colors.red, textAlign: 'center' }}>
            Error loading complaints: {error.message}
          </Text>
        </View>
      ) : (
        <FlatList
          data={supabaseComplaints}
          renderItem={renderItem}
          keyExtractor={(item) => item.id?.toString() || item.key}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: Default.fixPadding }}
        />
      )}

      <View style={{ margin: Default.fixPadding * 2 }}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("addComplaintScreen");
          }}
          activeOpacity={0.85}
          style={styles.primaryActionButton}
        >
          <Text style={styles.primaryActionButtonText}>
            {tr("raiseNewComplaint")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ComplaintsPersonalTab;

const styles = StyleSheet.create({
  mainTouchOpacity: {
    flex: 1,
    justifyContent: "center",
    marginHorizontal: Default.fixPadding * 2,
    marginBottom: Default.fixPadding * 2,
    paddingLeft: Default.fixPadding * 1.5,
    paddingBottom: Default.fixPadding * 1.5,
    borderRadius: 10,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  primaryActionButton: {
    height: 50,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...Default.shadow,
  },
  primaryActionButtonText: {
    ...Fonts.SemiBold18white,
    textAlign: "center",
  },
});
