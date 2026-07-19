import React from "react";
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
import AwesomeButton from "react-native-really-awesome-button";
import { useListCommunityComplaints } from "../hooks/useSupabaseData";
import { useAuth } from "../contexts/AuthContext";

const HelpDeskCommunityTab = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { user, profile } = useAuth();
  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`helpDeskCommunityTab:${key}`);
  }
  
  // Use Supabase hook for user's community complaints
  const { 
    data: supabaseComplaints = [], 
    isLoading, 
    error 
  } = useListCommunityComplaints(user?.id);
  // Sample/mock community complaints data
  const mockComplaints = [
    {
      id: 'community-1',
      title: 'Security Gate Malfunction',
      description: 'The automated security gate is not working properly. It gets stuck halfway and requires manual operation, causing delays for residents and visitors.',
      subject: 'Security Gate Malfunction',
      created_at: '2024-06-16T12:00:00Z',
      status: 'in_progress',
      priority: 'high',
      category: 'Security',
      complaint_type: 'community',      submitted_by: 'You',
      raised_by: 'demo@casanirvana.com',
      image_url: 'https://picsum.photos/400/300?random=7'
    },
    {
      id: 'community-2',
      title: 'Internet Connectivity Issues',
      description: 'WiFi in common areas has been extremely slow for the past week. Unable to work from the co-working space due to poor connectivity.',
      subject: 'Internet Connectivity Issues',
      created_at: '2024-06-17T10:15:00Z',
      status: 'open',
      priority: 'medium',
      category: 'Infrastructure',
      complaint_type: 'community',
      submitted_by: 'You',
      raised_by: 'demo@casanirvana.com',      image_url: 'https://picsum.photos/400/300?random=8'
    },
    {
      id: 'community-3',
      title: 'Tennis Court Lighting',
      description: 'Two of the floodlights on the tennis court are not working. Evening games are difficult due to poor lighting conditions.',
      subject: 'Tennis Court Lighting',
      created_at: '2024-06-18T19:30:00Z',
      status: 'open',
      priority: 'low',
      category: 'Amenities',
      complaint_type: 'community',
      submitted_by: 'You',
      raised_by: 'demo@casanirvana.com',
      image_url: 'https://picsum.photos/400/300?random=9'
    },
    {
      id: 'community-4',
      title: 'Parking Space Marking',
      description: 'Parking space markings have faded and are barely visible. This is causing confusion and disputes among residents.',
      subject: 'Parking Space Marking',
      created_at: '2024-06-05T14:00:00Z',
      status: 'resolved',
      priority: 'low',
      category: 'Infrastructure',
      complaint_type: 'community',
      submitted_by: 'You',
      raised_by: 'demo@casanirvana.com',
      image_url: 'https://picsum.photos/400/300?random=10'
    },
    {
      id: 'community-5',
      title: 'Gym Equipment Maintenance',
      description: 'Several gym equipment pieces need maintenance. The treadmill belt is slipping, and two weight machines have loose bolts.',
      subject: 'Gym Equipment Maintenance',
      created_at: '2024-06-13T08:30:00Z',
      status: 'in_progress',
      priority: 'medium',
      category: 'Amenities',
      complaint_type: 'community',
      submitted_by: 'You',
      raised_by: 'demo@casanirvana.com',
      image_url: 'https://picsum.photos/400/300?random=11'
    },
    {
      id: 'community-6',
      title: 'Children Play Area Safety',
      description: 'Some playground equipment in the children\'s play area has sharp edges and loose screws. This poses a safety risk for kids.',
      subject: 'Children Play Area Safety',
      created_at: '2024-06-12T16:45:00Z',
      status: 'open',
      priority: 'urgent',
      category: 'Safety',
      complaint_type: 'community',
      submitted_by: 'You',
      raised_by: 'demo@casanirvana.com',
      image_url: 'https://picsum.photos/400/300?random=12'
    }
  ];

  // Always show mock data for now (since this represents community complaints from various residents)
  const complaints = mockComplaints;

  const renderItem = ({ item }) => {
    const formatDateTime = (dateString) => {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return date.toLocaleDateString() + ", " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
      <TouchableOpacity
        onPress={() => {
          navigation.push("complaintDetailScreen", {
            headerTitle: tr("community"),
            image: item.image_url || item.image,            title: item.title || item.subject,
            dateTime: item.created_at ? formatDateTime(item.created_at) : item.dateTime,
            other: item.description || item.details || item.other,
            name: item.submitted_by || item.name,
            resolved: item.status === 'resolved' || item.resolved,
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
            source={item.image_url ? { uri: item.image_url } : item.image}
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
              {item.title || item.subject}
            </Text>

            <View
              style={{
                alignItems: isRtl ? "flex-end" : "flex-start",
                marginRight: isRtl ? 0 : Default.fixPadding,
                marginLeft: isRtl ? Default.fixPadding : 0,
              }}
            >              <Text
                numberOfLines={1}
                style={{
                  ...Fonts.Medium14grey,
                  overflow: "hidden",
                }}
              >
                {item.created_at ? formatDateTime(item.created_at) : item.dateTime || "N/A"}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  ...Fonts.Medium14grey,
                  overflow: "hidden",
                  marginVertical: Default.fixPadding * 0.3,
                }}
              >
                {item.description || item.other}
              </Text>

              <Text
                numberOfLines={1}
                style={{ ...Fonts.Medium14grey, overflow: "hidden" }}
              >
                {(item.status === 'resolved' || item.resolved) ? tr("resolvedBy") : tr("raisedBy")}
                <Text
                  style={{ ...Fonts.Medium14black }}
                >{` : ${item.submitted_by || item.name || "Unknown"}`}</Text>
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
            backgroundColor: (item.status === 'resolved' || item.resolved) ? Colors.green : Colors.red,
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
            {(item.status === 'resolved' || item.resolved) ? tr("resolved") : tr("pending")}
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
          data={complaints}
          renderItem={renderItem}
          keyExtractor={(item) => item.id?.toString() || item.key}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: Default.fixPadding }}
        />
      )}

      <View style={{ margin: Default.fixPadding * 2 }}>
        <AwesomeButton
          height={50}
          onPress={() => {
            navigation.navigate("addComplaintScreen");
          }}
          raiseLevel={1}
          stretch={true}
          borderRadius={10}
          backgroundShadow={Colors.primary}
          backgroundDarker={Colors.primary}
          backgroundColor={Colors.primary}
        >
          <Text style={{ ...Fonts.SemiBold18white }}>
            {tr("raiseNewComplaint")}
          </Text>
        </AwesomeButton>
      </View>
    </View>
  );
};

export default HelpDeskCommunityTab;

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
});
