import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MyStatusBar from "../components/myStatusBar";
import { ms } from "react-native-size-matters/extend";
import MemberDetailModal from "../components/memberDetailModal";
import { useSocietyMembers, useSocietyAdmins, useSocietyCommittee } from "../hooks/useSocietyMembers";
import { useConversationTracker } from "../hooks/useConversationTracker";

const MemberDirectoryScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() == "rtl";

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all"); // all, members, admins, committee
  const [selectedMember, setSelectedMember] = useState(null);
  const [openMemberDetailModal, setOpenMemberDetailModal] = useState(false);

  // Hooks for data fetching
  const { data: members = [], isLoading: loadingMembers } = useSocietyMembers();
  const { data: admins = [], isLoading: loadingAdmins } = useSocietyAdmins();
  const { data: committee = [], isLoading: loadingCommittee } = useSocietyCommittee();
  const { startConversation } = useConversationTracker();

  function tr(key) {
    return t(`memberDirectoryScreen:${key}`);
  }

  // Combine all data with role indicators
  const allMembers = useMemo(() => {
    const combinedData = [
      ...admins.map(member => ({ ...member, role: 'admin', roleIcon: 'shield-crown', roleColor: Colors.red })),
      ...committee.map(member => ({ ...member, role: 'committee', roleIcon: 'account-tie', roleColor: Colors.orange })),
      ...members.map(member => ({ ...member, role: 'member', roleIcon: 'account', roleColor: Colors.primary })),
    ];
    return combinedData;
  }, [members, admins, committee]);

  // Filter and search functionality
  const filteredMembers = useMemo(() => {
    let filtered = allMembers;

    // Apply role filter
    if (selectedFilter !== "all") {
      filtered = filtered.filter(member => member.role === selectedFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(member =>
        member.name?.toLowerCase().includes(query) ||
        member.block?.toLowerCase().includes(query) ||
        member.flatNo?.toLowerCase().includes(query) ||
        member.societyName?.toLowerCase().includes(query)
      );
    }

    // Sort by role priority (admin, committee, members) then by name
    return filtered.sort((a, b) => {
      const roleOrder = { admin: 0, committee: 1, member: 2 };
      const roleComparison = roleOrder[a.role] - roleOrder[b.role];
      if (roleComparison !== 0) return roleComparison;
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [allMembers, selectedFilter, searchQuery]);

  const isLoading = loadingMembers || loadingAdmins || loadingCommittee;

  const renderFilterButton = (filter, label, count) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.filterButtonActive
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text
        style={[
          styles.filterButtonText,
          selectedFilter === filter && styles.filterButtonTextActive
        ]}
      >
        {label} {count > 0 && `(${count})`}
      </Text>
    </TouchableOpacity>
  );

  const renderMemberItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.memberCard}
      onPress={() => {
        setSelectedMember(item);
        setOpenMemberDetailModal(true);
      }}
    >
      <View style={styles.memberCardContent}>
        <Image
          source={
            typeof item.image === 'number' 
              ? item.image 
              : typeof item.image === 'string' && item.image.startsWith('http')
                ? { uri: item.image }
                : require("../assets/images/pic1.png")
          }
          style={styles.memberAvatar}
        />
        
        <View style={styles.memberInfo}>
          <View style={styles.memberNameRow}>
            <Text style={styles.memberName}>{item.name}</Text>
            <MaterialCommunityIcons
              name={item.roleIcon}
              size={18}
              color={item.roleColor}
            />
          </View>
          
          <Text style={styles.memberAddress}>
            {`Block ${item.block}-${item.flatNo}`}
          </Text>
          
          <View style={styles.memberRoleContainer}>
            <View style={[styles.roleBadge, { backgroundColor: item.roleColor + '20' }]}>
              <Text style={[styles.roleText, { color: item.roleColor }]}>
                {tr(item.role)}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.memberActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              // Handle call
              startConversation(item?.id, item?.name, item?.image);
              navigation.push("callScreen", {
                image: item?.image,
                name: item?.name,
                phone: item?.phone,
                id: item?.id,
                memberId: item?.id,
                memberPhone: item?.phone,
              });
            }}
          >
            <MaterialCommunityIcons name="phone" size={20} color={Colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={async () => {
              // Handle chat
              await startConversation(item?.id, item?.name, item?.image);
              navigation.push("messageScreen", {
                image: item?.image,
                name: item?.name,
                key: item?.key || "1",
                phone: item?.phone,
                id: item?.id,
                memberId: item?.id,
                memberPhone: item?.phone,
                email: item?.email,
              });
            }}
          >
            <MaterialCommunityIcons name="chat" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons 
        name="account-search" 
        size={64} 
        color={Colors.lightGrey} 
      />
      <Text style={styles.emptyStateTitle}>
        {searchQuery ? tr("noSearchResults") : tr("noMembersFound")}
      </Text>
      <Text style={styles.emptyStateDescription}>
        {searchQuery 
          ? tr("tryDifferentSearch") 
          : tr("membersWillAppearHere")
        }
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingState}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.loadingText}>{tr("loadingMembers")}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <MyStatusBar />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons
            name={isRtl ? "arrow-forward-outline" : "arrow-back-outline"}
            size={25}
            color={Colors.black}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{tr("memberDirectory")}</Text>
      </View>

      {/* Content Container */}
      <View style={styles.contentContainer}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color={Colors.grey} />
          <TextInput
            style={styles.searchInput}
            placeholder={tr("searchMembers")}
            placeholderTextColor={Colors.grey}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearButton}>
              <MaterialCommunityIcons name="close" size={20} color={Colors.grey} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Buttons */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContentContainer}
        >
          {renderFilterButton("all", tr("all"), allMembers.length)}
          {renderFilterButton("admin", tr("admins"), admins.length)}
          {renderFilterButton("committee", tr("committee"), committee.length)}
          {renderFilterButton("member", tr("members"), members.length)}
        </ScrollView>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {tr("showing")} {filteredMembers.length} {tr("of")} {allMembers.length} {tr("totalMembers")}
          </Text>
        </View>

        {/* Members List */}
        <View style={styles.listWrapper}>
          {isLoading ? (
            renderLoadingState()
          ) : filteredMembers.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={filteredMembers}
              renderItem={renderMemberItem}
              keyExtractor={(item) => `${item.role}-${item.id || item.key}`}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          )}
        </View>
      </View>

      {/* Member Detail Modal */}
      {selectedMember && (
        <MemberDetailModal
          visible={openMemberDetailModal}
          modalClose={() => setOpenMemberDetailModal(false)}
          image={selectedMember?.image}
          name={selectedMember?.name}
          societyName={selectedMember?.societyName}
          flatNo={selectedMember?.flatNo}
          blockNo={selectedMember?.block}
          onCallHandle={() => {
            setOpenMemberDetailModal(false);
            startConversation(selectedMember?.id, selectedMember?.name, selectedMember?.image);
            navigation.push("callScreen", {
              image: selectedMember?.image,
              name: selectedMember?.name,
              phone: selectedMember?.phone,
              id: selectedMember?.id,
              memberId: selectedMember?.id,
              memberPhone: selectedMember?.phone,
            });
          }}
          onChatHandle={async () => {
            setOpenMemberDetailModal(false);
            await startConversation(selectedMember?.id, selectedMember?.name, selectedMember?.image);
            navigation.push("messageScreen", {
              image: selectedMember?.image,
              name: selectedMember?.name,
              key: selectedMember?.key || "1",
              phone: selectedMember?.phone,
              id: selectedMember?.id,
              memberId: selectedMember?.id,
              memberPhone: selectedMember?.phone,
              email: selectedMember?.email,
            });
          }}
        />
      )}
    </View>
  );
};

export default MemberDirectoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.extraLightGrey,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Default.fixPadding * 1.2,
    paddingHorizontal: Default.fixPadding * 2,
    backgroundColor: Colors.white,
    ...Default.shadow,
    elevation: 2,
  },
  backButton: {
    padding: Default.fixPadding * 0.5,
    marginRight: Default.fixPadding * 0.5,
  },
  headerTitle: {
    ...Fonts.SemiBold18black,
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingTop: Default.fixPadding * 1.5,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    marginHorizontal: Default.fixPadding * 2,
    marginBottom: Default.fixPadding * 1.5,
    paddingHorizontal: Default.fixPadding * 1.5,
    paddingVertical: Default.fixPadding * 0.5,
    borderRadius: 12,
    ...Default.shadow,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    ...Fonts.Medium14black,
    paddingVertical: Default.fixPadding,
    marginHorizontal: Default.fixPadding,
    minHeight: 40,
  },
  clearButton: {
    padding: Default.fixPadding * 0.5,
  },
  filterContainer: {
    maxHeight: 50,
    marginBottom: Default.fixPadding,
  },
  filterContentContainer: {
    paddingHorizontal: Default.fixPadding * 2,
    alignItems: 'center',
  },
  filterButton: {
    paddingHorizontal: Default.fixPadding * 1.5,
    paddingVertical: Default.fixPadding * 0.8,
    borderRadius: 25,
    backgroundColor: Colors.white,
    marginRight: Default.fixPadding,
    borderWidth: 1,
    borderColor: Colors.lightGrey,
    ...Default.shadow,
    elevation: 1,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    elevation: 2,
  },
  filterButtonText: {
    ...Fonts.Medium14grey,
    textAlign: 'center',
  },
  filterButtonTextActive: {
    ...Fonts.Medium14white,
    textAlign: 'center',
  },
  statsContainer: {
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 0.8,
    marginBottom: Default.fixPadding * 0.5,
  },
  statsText: {
    ...Fonts.Medium12grey,
    textAlign: "center",
  },
  listWrapper: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: Default.fixPadding * 2,
    paddingBottom: Default.fixPadding * 3,
  },
  memberCard: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    marginBottom: Default.fixPadding * 1.2,
    ...Default.shadow,
    elevation: 2,
  },
  memberCardContent: {
    flexDirection: "row",
    padding: Default.fixPadding * 1.5,
    alignItems: "flex-start",
  },
  memberAvatar: {
    width: ms(58),
    height: ms(58),
    borderRadius: 12,
    resizeMode: "cover",
  },
  memberInfo: {
    flex: 1,
    marginLeft: Default.fixPadding * 1.2,
    marginRight: Default.fixPadding * 0.5,
  },
  memberNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Default.fixPadding * 0.5,
  },
  memberName: {
    ...Fonts.SemiBold16black,
    flex: 1,
    marginRight: Default.fixPadding * 0.5,
  },
  memberAddress: {
    ...Fonts.Medium13grey,
    marginBottom: Default.fixPadding * 0.8,
    lineHeight: 18,
  },
  memberRoleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  roleBadge: {
    paddingHorizontal: Default.fixPadding * 0.8,
    paddingVertical: Default.fixPadding * 0.3,
    borderRadius: 15,
    alignSelf: "flex-start",
  },
  roleText: {
    ...Fonts.Medium11black,
    textTransform: "capitalize",
    fontWeight: "600",
  },
  memberActions: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  actionButton: {
    padding: Default.fixPadding * 0.8,
    marginBottom: Default.fixPadding * 0.5,
    borderRadius: 10,
    backgroundColor: Colors.extraLightGrey,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Default.fixPadding * 3,
    paddingVertical: Default.fixPadding * 4,
  },
  emptyStateTitle: {
    ...Fonts.SemiBold18black,
    textAlign: "center",
    marginTop: Default.fixPadding * 2,
    marginBottom: Default.fixPadding,
  },
  emptyStateDescription: {
    ...Fonts.Medium14grey,
    textAlign: "center",
    lineHeight: 22,
    opacity: 0.8,
  },
  loadingState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Default.fixPadding * 4,
  },
  loadingText: {
    ...Fonts.Medium14grey,
    marginTop: Default.fixPadding * 1.5,
    textAlign: "center",
    opacity: 0.8,
  },
});
