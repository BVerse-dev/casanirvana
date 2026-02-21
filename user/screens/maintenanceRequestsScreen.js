import React, { useState, useRef } from 'react';
import { View, Text, FlatList, TextInput, ActivityIndicator, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MyStatusBar from '../components/myStatusBar';
import { Colors, Fonts, Default } from '../constants/styles';
import { useListMaintenanceRequests } from '../hooks/useSupabaseData';
import { useHasJoinedCommunity } from '../hooks/useCommunityData';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from "react-i18next";


const MaintenanceRequestsScreen = ({ navigation }) => {
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  
  // Use the SAME authentication pattern as working screens (home, etc.)
  const { profile, isLoading: authLoading } = useHasJoinedCommunity();
  
  // Fetch maintenance requests for the authenticated user
  const { 
    data: requests = [], 
    isLoading: requestsLoading, 
    error: requestsError,
    refetch: refetchRequests 
  } = useListMaintenanceRequests(profile?.id);
  
  // Force refetch when screen comes into focus (like complaints)
  useFocusEffect(
    React.useCallback(() => {
      refetchRequests();
    }, [refetchRequests])
  );

  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const searchInputRef = useRef(null);
  const statusFilters = [
    { key: 'all', value: '', label: 'All' },
    { key: 'pending', value: 'pending', label: 'Pending' },
    { key: 'in_progress', value: 'in_progress', label: 'In Progress' },
    { key: 'completed', value: 'completed', label: 'Completed' },
    { key: 'cancelled', value: 'cancelled', label: 'Cancelled' },
  ];

  const getStatusMeta = (rawStatus) => {
    const normalizedStatus = (rawStatus || 'pending').toLowerCase();
    switch (normalizedStatus) {
      case 'completed':
        return { label: 'Completed', color: Colors.green };
      case 'in_progress':
        return { label: 'In Progress', color: Colors.orange };
      case 'cancelled':
        return { label: 'Cancelled', color: Colors.grey };
      default:
        return { label: 'Pending', color: Colors.red };
    }
  };

  // Show friendly message if user isn't fully set up yet
  if (authLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.regularGrey }}>
        <MyStatusBar />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={{ ...Fonts.Medium16black, marginTop: 10 }}>Loading your profile...</Text>
        </View>
      </View>
    );
  }

  // Handle search button press
  const handleSearchPress = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Refresh function for pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchRequests();
    } catch (error) {
      console.error('Error refreshing requests:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Helper function to truncate title to two words
  const truncateTitle = (title) => {
    if (!title) return '';
    const words = title.trim().split(' ');
    if (words.length <= 2) {
      return title;
    }
    return words.slice(0, 2).join(' ') + '...';
  };

  // Format maintenance requests for display
  const formatMaintenanceRequests = () => {
    return requests.map((item) => ({
      status: (item.status || 'pending').toLowerCase(),
      statusMeta: getStatusMeta(item.status),
      key: String(item.id),
      id: item.id,
      image: require('../assets/images/pic1.png'), // Default image for all maintenance requests
      title: item.title,
      dateTime: item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { 
        day: 'numeric', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
      }) : 'N/A',
      other: item.description,
      resolved: (item.status || 'pending').toLowerCase() === 'completed',
      name: item.requested_by_profile ? 
        `${item.requested_by_profile.first_name} ${item.requested_by_profile.last_name}` : 
        'You',
      priority: item.priority,
      request_type: item.request_type,
      unit_id: item.unit_id,
      requested_by: item.requested_by,
      assigned_to: item.assigned_to,
      estimated_cost: item.estimated_cost,
      actual_cost: item.actual_cost,
      completed_at: item.completed_at,
    }));
  };

  // Get formatted requests
  const formattedRequests = formatMaintenanceRequests();

  // Filtered data
  const filteredRequests = formattedRequests.filter(item => {
    const matchesStatus = !status || item.status === status;
    const matchesSearch = search === '' || 
      (item.title && item.title.toLowerCase().includes(search.toLowerCase())) || 
      (item.other && item.other.toLowerCase().includes(search.toLowerCase())) ||
      (item.request_type && item.request_type.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  // Render each maintenance request
  const renderRequest = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        navigation.push("maintenanceDetailScreen", {
          maintenanceId: item.id,
          headerTitle: item.request_type || item.title,
        });
      }}
      style={styles.mainTouchOpacity}
    >
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        <Image
          source={
            typeof item.image === 'number' 
              ? item.image 
              : typeof item.image === 'string' && item.image.startsWith('http')
                ? { uri: item.image }
                : require("../assets/images/pic1.png") // Fallback maintenance image
          }
          style={{
            width: 87,
            height: 87,
            borderRadius: 43.5, // Circular avatar like complaints screen
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
              marginRight: isRtl ? 0 : Default.fixPadding * 2,
              marginLeft: isRtl ? Default.fixPadding * 2 : 0,
            }}
          >
            {truncateTitle(item.title)}
          </Text>
          
          <View
            style={{
              alignItems: isRtl ? "flex-end" : "flex-start",
              marginRight: isRtl ? 0 : Default.fixPadding,
              marginLeft: isRtl ? Default.fixPadding : 0,
            }}
          >
            {/* Date/Time row with status badge */}
            <View style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              alignItems: "center",
              width: "100%",
              justifyContent: "space-between"
            }}>
              <Text numberOfLines={1} style={{ ...Fonts.Medium14grey, overflow: 'hidden', flex: 1 }}>
                {item.dateTime}
              </Text>
              <View style={[styles.inlineStatusBadge, { backgroundColor: item.statusMeta.color }]}>
                <Text numberOfLines={1} style={styles.inlineStatusText}>
                  {item.statusMeta.label}
                </Text>
              </View>
            </View>
            
            <Text numberOfLines={1} style={{ ...Fonts.Medium14grey, overflow: 'hidden', marginVertical: Default.fixPadding * 0.3 }}>{item.other}</Text>
            <Text numberOfLines={1} style={{ ...Fonts.Medium14grey, overflow: 'hidden' }}>
              {item.resolved ? 'Resolved by' : 'Raised by'}
              <Text style={{ ...Fonts.Medium14black }}>{` : ${item.name}`}</Text>
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <MyStatusBar />
      <View style={styles.redBar} />
      {/* Header Row */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.headerBackBtn}
          onPress={() => {
            if (navigation && navigation.canGoBack && navigation.canGoBack()) {
              navigation.goBack();
            } else if (navigation && navigation.navigate) {
              navigation.navigate('ServiceScreen');
            }
          }}>
          <Ionicons name="arrow-back-outline" size={25} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitleText}>Maintenance Requests</Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          ref={searchInputRef}
          style={styles.searchInput}
          placeholder="Search requests..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={Colors.grey}
        />
        <TouchableOpacity style={styles.addBtn} onPress={handleSearchPress}>
          <Ionicons name="search" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Filter Row: Status */}
      <View style={styles.filterRowWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.filterScrollContent,
            isRtl && styles.filterScrollContentRtl,
          ]}
        >
          {statusFilters.map((filter) => {
            const isActive =
              filter.value === ''
                ? status === ''
                : status === filter.value;

            return (
              <TouchableOpacity
                key={filter.key}
                onPress={() => setStatus(filter.value)}
                style={[styles.filterChip, isActive && styles.activeFilterChip]}
              >
                <Text style={isActive ? styles.activeFilterChipText : styles.filterChipText}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* List */}
      {requestsLoading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : requestsError ? (
        <Text style={styles.error}>Error loading requests: {requestsError.message}</Text>
      ) : (
        <FlatList
          data={filteredRequests}
          keyExtractor={item => String(item.key)}
          renderItem={renderRequest}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.empty}>No maintenance requests found.</Text>
              <Text style={styles.emptySubtext}>Create your first maintenance request using the button below.</Text>
            </View>
          }
        />
      )}



      {/* Request New Maintenance Button */}
      <View style={{ margin: Default.fixPadding * 2 }}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("addMaintenanceRequestScreen");
          }}
          activeOpacity={0.85}
          style={styles.primaryActionButton}
        >
          <Text style={styles.primaryActionButtonText}>
            Request New Maintenance
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  redBar: {
    backgroundColor: Colors.primary,
    height: 0.1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Default.fixPadding * 2,
    paddingTop: Default.fixPadding * 1.2,
    paddingBottom: Default.fixPadding * 0.8,
    backgroundColor: Colors.white,
  },
  headerBackBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  headerTitleText: {
    ...Fonts.SemiBold18black,
    letterSpacing: 0.2,
    color: Colors.black,
    marginLeft: 1,
    marginBottom: 2,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Default.fixPadding * 2,
    paddingTop: Default.fixPadding,
    paddingBottom: Default.fixPadding,
    backgroundColor: Colors.white,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Default.fixPadding * 1.1,
    paddingHorizontal: Default.fixPadding * 1.2,
    borderRadius: 10,
    backgroundColor: Colors.lightGrey,
    ...Fonts.Medium14black,
  },
  addBtn: {
    marginLeft: 14,
    backgroundColor: Colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  filterRowWrapper: {
    paddingHorizontal: Default.fixPadding * 2,
    paddingBottom: Default.fixPadding,
    backgroundColor: Colors.white,
  },
  filterScrollContent: {
    flexDirection: 'row',
    marginVertical: Default.fixPadding * 0.5,
    paddingRight: Default.fixPadding * 0.4,
  },
  filterScrollContentRtl: {
    flexDirection: 'row-reverse',
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    marginEnd: 8,
    borderRadius: 20,
    backgroundColor: Colors.lightGrey,
    minWidth: 84,
    alignItems: 'center',
  },
  filterChipText: {
    ...Fonts.Medium14black,
  },
  activeFilterChip: {
    backgroundColor: Colors.primary,
  },
  activeFilterChipText: {
    ...Fonts.Medium14white,
  },
  listContent: {
    paddingHorizontal: Default.fixPadding * 2,
    paddingBottom: Default.fixPadding * 2,
    paddingTop: 2,
    flexGrow: 1,
  },
  mainTouchOpacity: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 1,
    marginBottom: Default.fixPadding * 2,
    paddingLeft: Default.fixPadding * 1.5,
    paddingBottom: Default.fixPadding * 1.5,
    borderRadius: 10,
    backgroundColor: Colors.white,
    ...Default.shadow,
    overflow: 'visible',
  },
  inlineStatusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  inlineStatusText: {
    ...Fonts.SemiBold12white,
    fontSize: 11,
  },
  error: { color: Colors.red, marginTop: 20, textAlign: 'center' },
  empty: { color: Colors.grey, textAlign: 'center', marginTop: 40 },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  emptySubtext: {
    color: Colors.grey,
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
  },

  formOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: Colors.transparentBlack,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  formModal: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 24,
    width: '90%',
    ...Default.shadow,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.lightGrey,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    ...Fonts.Medium14black,
    backgroundColor: Colors.extraLightGrey,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  dropdownBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Colors.lightGrey,
    marginHorizontal: 2,
    minWidth: 60,
    alignItems: 'center',
  },
  dropdownBtnActive: {
    backgroundColor: Colors.primary,
  },
  primaryActionButton: {
    height: 50,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Default.shadow,
  },
  primaryActionButtonText: {
    ...Fonts.SemiBold18white,
    textAlign: 'center',
  },
});

export default MaintenanceRequestsScreen;
