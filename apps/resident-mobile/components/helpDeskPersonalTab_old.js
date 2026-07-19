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
import { useListPersonalComplaints } from "../hooks/useSupabaseData";
import { useAuth } from "../contexts/AuthContext";

const HelpDeskPersonalTab = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { user, profile } = useAuth();
  const isRtl = i18n.dir() == "rtl";
  function tr(key) {
    return t(`helpDeskPersonalTab:${key}`);
  }

  // Use Supabase hook for user's personal complaints
  const { 
    data: supabaseComplaints = [], 
    isLoading, 
    error 
  } = useListPersonalComplaints(user?.id);

  // Sample/mock complaints data to show in the app
  const mockComplaints = [    {
      id: 'personal-1',
      subject: 'Water Leakage in Parking Area',
      details: 'There is a significant water leakage in the basement parking area near slot B-15. Water is accumulating and creating safety hazards that could damage vehicles.',
      created_at: '2024-06-15T10:30:00Z',
      status: 'open',
      priority: 'high',
      category: 'Infrastructure',
      complaint_type: 'personal',
      raised_by: 'demo@casanirvana.com',
      images: ['https://picsum.photos/400/300?random=1']
    },    {
      id: 'personal-2',
      subject: 'Elevator Not Working - Block A',
      details: 'The elevator in Block A has been out of order since yesterday morning. Residents on higher floors are facing difficulty, especially elderly people and families with small children.',
      created_at: '2024-06-16T08:45:00Z',
      status: 'in_progress',
      priority: 'urgent',
      category: 'Infrastructure',
      complaint_type: 'personal',
      raised_by: 'demo@casanirvana.com',
      images: ['https://picsum.photos/400/300?random=2']
    },    {
      id: 'personal-3',
      title: 'Garbage Collection Issue',
      description: 'Garbage has not been collected from our floor for the past 2 days. The accumulation is causing bad smell and attracting pests.',
      created_at: '2024-06-18T07:30:00Z',
      status: 'open',
      priority: 'high',
      category: 'Sanitation',
      complaint_type: 'personal',
      raised_by: 'demo@casanirvana.com',
      images: ['https://picsum.photos/400/300?random=3']
    },
    {
      id: 'personal-4',
      title: 'Swimming Pool Water Quality',
      description: 'The swimming pool water appeared cloudy and had an unusual smell. Suspected chemical imbalance that could be harmful for swimmers.',
      created_at: '2024-06-10T16:00:00Z',
      status: 'resolved',      priority: 'medium',
      category: 'Amenities',
      complaint_type: 'personal',
      raised_by: 'demo@casanirvana.com',
      images: ['https://picsum.photos/400/300?random=4']
    },
    {
      id: 'personal-5',
      title: 'Air Conditioning Not Working',
      description: 'The AC unit in my apartment has stopped working completely. With the summer heat, this is becoming unbearable. Need urgent repair or replacement.',
      created_at: '2024-06-17T15:20:00Z',
      status: 'open',
      priority: 'urgent',
      category: 'Maintenance',
      complaint_type: 'personal',
      raised_by: 'demo@casanirvana.com',
      images: ['https://picsum.photos/400/300?random=5']
    },
    {
      id: 'personal-6',
      title: 'Balcony Door Lock Broken',      description: 'The lock on my balcony door is broken and won\'t close properly. This is a security concern as anyone could potentially enter from the balcony.',
      created_at: '2024-06-14T09:15:00Z',
      status: 'in_progress',
      priority: 'medium',
      category: 'Security',
      complaint_type: 'personal',
      raised_by: 'demo@casanirvana.com',
      images: ['https://picsum.photos/400/300?random=6']
    }
  ];

  // Always show mock data for now (since Supabase data filtering needs to be fixed)
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
            headerTitle: tr("personal"),
            image: item.image_url,            title: item.title || item.subject,
            dateTime: formatDateTime(item.created_at),
            other: item.description || item.details,
            name: item.submitted_by || "You",
            resolved: item.status === 'resolved',
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
              item.image_url ? { uri: item.image_url } : require("../assets/images/pic1.png")
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
              {item.title || item.subject}
            </Text>            <View
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
                {item.description}
              </Text>

              <Text
                numberOfLines={1}
                style={{ ...Fonts.Medium14grey, overflow: "hidden" }}
              >
                {item.status === 'resolved' ? tr("resolvedBy") : tr("raisedBy")}
                <Text
                  style={{ ...Fonts.Medium14black }}
                >{` : ${item.submitted_by || "You"}`}</Text>
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
            backgroundColor: item.status === 'resolved' ? Colors.green : Colors.red,
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
  };return (
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
            navigation.push("addComplaintScreen");
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

export default HelpDeskPersonalTab;

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
