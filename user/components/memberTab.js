import React, { useState } from "react";
import { Text, View, TouchableOpacity, Image, FlatList, ActivityIndicator } from "react-native";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import { ms } from "react-native-size-matters/extend";
import MemberDetailModal from "./memberDetailModal";
import { useCommunityMembers, useCommunityMembersSubscription } from "../hooks/useCommunityMembers";
import { useConversationTracker } from "../hooks/useConversationTracker";

const MemberTab = ({ navigation }) => {
  const { i18n } = useTranslation();

  const isRtl = i18n.dir() === "rtl";

  const [openMemberDetailModal, setOpenMemberDetailModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(0);

  // Use real data from Supabase
  const { data: memberList = [], isLoading, error } = useCommunityMembers();
  
  // Set up real-time subscription
  useCommunityMembersSubscription();

  // Use conversation tracker
  const { startConversation } = useConversationTracker();

  const renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedMember(index);
          setOpenMemberDetailModal(true);
        }}
        style={{
          flexDirection: isRtl ? "row-reverse" : "row",
          alignItems: "center",
          padding: Default.fixPadding * 0.8,
          marginHorizontal: Default.fixPadding * 2,
          marginBottom: Default.fixPadding * 2,
          borderRadius: 10,
          backgroundColor: Colors.white,
          ...Default.shadow,
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
              typeof item.image === 'number' 
                ? item.image 
                : typeof item.image === 'string' && item.image.startsWith('http')
                  ? { uri: item.image }
                  : require("../assets/images/pic1.png") // Fallback member avatar
            }
            style={{
              resizeMode: "cover",
              width: ms(58),
              height: ms(58),
              borderRadius: 5,
            }}
          />

          <View
            style={{
              flex: 1,
              alignItems: isRtl ? "flex-end" : "flex-start",
              marginHorizontal: Default.fixPadding,
            }}
          >
            <Text
              numberOfLines={1}
              style={{ ...Fonts.SemiBold16black, overflow: "hidden" }}
            >
              {item.name}
            </Text>

            <Text
              numberOfLines={1}
              style={{
                ...Fonts.Medium14grey,
                overflow: "hidden",
                marginTop: Default.fixPadding * 0.5,
              }}
            >
              {`Block ${item.block}-${item.flatNo} | ${item.communityName}`}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Show loading state
  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ 
          ...Fonts.Medium14grey,
          marginTop: Default.fixPadding,
          textAlign: 'center'
        }}>
          Loading community members...
        </Text>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Default.fixPadding * 2
      }}>
        <Text style={{ 
          ...Fonts.Medium16black,
          textAlign: 'center',
          marginBottom: Default.fixPadding
        }}>
          Unable to load members
        </Text>
        <Text style={{ 
          ...Fonts.Medium14grey,
          textAlign: 'center'
        }}>
          Please check your connection and try again
        </Text>
      </View>
    );
  }

  // Show empty state
  if (memberList.length === 0) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Default.fixPadding * 2
      }}>
        <Text style={{ 
          ...Fonts.Medium16black,
          textAlign: 'center',
          marginBottom: Default.fixPadding
        }}>
          No community members found
        </Text>
        <Text style={{ 
          ...Fonts.Medium14grey,
          textAlign: 'center'
        }}>
          Members will appear here once they join your community
        </Text>
      </View>
    );
  }

  const selectedItem = memberList[selectedMember] || memberList[0];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <FlatList
        data={memberList}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: Default.fixPadding * 2 }}
      />

      <MemberDetailModal
        visible={openMemberDetailModal}
        modalClose={() => setOpenMemberDetailModal(false)}
        image={selectedItem?.image}
        name={selectedItem?.name}
        communityName={selectedItem?.communityName}
        flatNo={selectedItem?.flatNo}
        blockNo={selectedItem?.block}
        onCallHandle={() => {
          setOpenMemberDetailModal(false);
          // Track this conversation before starting the call
          startConversation(selectedItem?.id, selectedItem?.name, selectedItem?.image);
          navigation.push("callScreen", {
            image: selectedItem?.image,
            name: selectedItem?.name,
            phone: selectedItem?.phone,
            id: selectedItem?.id,
            memberId: selectedItem?.id,
            memberPhone: selectedItem?.phone,
          });
        }}
        onChatHandle={async () => {
          setOpenMemberDetailModal(false);
          // Track this conversation before starting the chat
          await startConversation(selectedItem?.id, selectedItem?.name, selectedItem?.image);
          navigation.push("messageScreen", {
            image: selectedItem?.image,
            name: selectedItem?.name,
            key: selectedItem?.key || "1",
            phone: selectedItem?.phone,
            id: selectedItem?.id,
            memberId: selectedItem?.id,
            memberPhone: selectedItem?.phone,
            email: selectedItem?.email,
          });
        }}
      />
    </View>
  );
};

export default MemberTab;
