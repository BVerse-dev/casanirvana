import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TextInput, ActivityIndicator, Alert, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MyStatusBar from '../components/myStatusBar';
import { Colors, Fonts, Default } from '../constants/styles';
import { useListMaintenanceRequests, useCreateMaintenanceRequest, useGetUserUnit } from '../hooks/useSupabaseData';
import { useHasJoinedCommunity } from '../hooks/useCommunityData';
import { useQueryClient } from '@tanstack/react-query';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../utils/supabase';
import { useTranslation } from "react-i18next";


const MaintenanceRequestsScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() == "rtl";
  
  const queryClient = useQueryClient();
  
  // Use the SAME authentication pattern as working screens (home, etc.)
  const { profile, isLoading: authLoading, hasJoinedCommunity, hasPendingRequest } = useHasJoinedCommunity();
  
  // Debug the hook result
  console.log('🔍 useHasJoinedCommunity result:', {
    profile: !!profile,
    profileId: profile?.id,
    profileUserId: profile?.user_id,
    authLoading,
    hasJoinedCommunity,
    hasPendingRequest
  });
  
  // Debug auth state using working pattern
  console.log('🔍 MaintenanceRequestsScreen Auth Debug (FIXED):', {
    authLoading,
    hasProfile: !!profile,
    profileId: profile?.id,
    profileUserId: profile?.user_id,
    profileUnitId: profile?.unit_id,
    profileCommunityId: profile?.community_id,
    firstName: profile?.first_name,
    lastName: profile?.last_name
  });
  
  // Get user's unit information using profile user_id
  const { data: userUnit, isLoading: unitLoading } = useGetUserUnit(profile?.user_id);
  
  // Fetch maintenance requests for the authenticated user
  const { 
    data: requests = [], 
    isLoading: requestsLoading, 
    error: requestsError,
    refetch: refetchRequests 
  } = useListMaintenanceRequests(profile?.id);
  
  // Debug logging
  console.log('🔍 MaintenanceRequestsScreen Debug (FIXED):', {
    authLoading,
    hasProfile: !!profile,
    profileId: profile?.id,
    profileUserId: profile?.user_id,
    profileUnitId: profile?.unit_id,
    requestsLoading,
    requestsLength: requests.length,
    error: requestsError?.message,
    userUnit: userUnit?.number,
    firstRequest: requests[0]?.title
  });

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

  // Force refetch when screen comes into focus (like complaints)
  useFocusEffect(
    React.useCallback(() => {
      console.log('📱 Maintenance requests screen focused, refetching data...');
      refetchRequests();
    }, [refetchRequests])
  );

  // Set up real-time subscription for maintenance requests (like complaints)
  useEffect(() => {
    console.log('🔔 Setting up real-time subscription for maintenance requests');
    const channel = supabase
      .channel('maintenance-requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'maintenance_requests'
        },
        (payload) => {
          console.log('🚀 Maintenance request change detected:', payload);
          // Invalidate queries when maintenance_requests table changes
          queryClient.invalidateQueries({ predicate: (query) => {
            const key = query.queryKey;
            return key.includes('maintenance-requests');
          }});
        }
      )
      .subscribe();

    return () => {
      console.log('🔕 Removing maintenance requests subscription');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
  
  // Create maintenance request mutation
  const createMaintenanceRequest = useCreateMaintenanceRequest();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'Medium', request_type: 'Plumbing' });
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Ref for search input
  const searchInputRef = useRef(null);

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

  // Submit new request
  const handleSubmit = async () => {
    if (!form.title || !form.description) {
      Alert.alert('Validation', 'Please enter both title and description.');
      return;
    }
    
    if (!profile?.id || !profile?.unit_id) {
      Alert.alert('Error', 'Unable to determine profile or unit information. Please ensure you are logged in and have joined a community.');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      await createMaintenanceRequest.mutateAsync({
        title: form.title,
        description: form.description,
        priority: form.priority,
        request_type: form.request_type,
        requested_by: profile.id, // Use profile ID instead of user ID
        unit_id: profile.unit_id, // Use profile's unit_id
        status: 'pending',
      });
      
      setForm({ title: '', description: '', priority: 'Medium', request_type: 'Plumbing' });
      setShowForm(false);
      Alert.alert('Success', 'Maintenance request submitted successfully.');
      
      // Invalidate queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
      
    } catch (err) {
      const errorMessage = err.message || 'Failed to submit request';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };


  // Format maintenance requests for display
  const formatMaintenanceRequests = () => {
    return requests.map((item) => ({
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
      resolved: item.status === 'resolved' || item.status === 'completed',
      name: item.requested_by_profile ? 
        `${item.requested_by_profile.first_name} ${item.requested_by_profile.last_name}` : 
        'You',
      priority: item.priority,
      status: item.status,
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
    const matchesStatus = !status || (status === 'resolved' ? item.resolved : !item.resolved);
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
          // Legacy props for fallback compatibility
          image: item.image,
          title: item.title,
          dateTime: item.dateTime,
          other: item.other,
          name: item.name,
          resolved: item.resolved
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
              <View style={[styles.inlineStatusBadge, { backgroundColor: item.resolved ? Colors.green : Colors.red }]}>
                <Text numberOfLines={1} style={styles.inlineStatusText}>
                  {item.resolved ? 'Resolved' : 'Pending'}
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
        <View style={styles.filterRow}>
          <TouchableOpacity onPress={() => setStatus('')} style={[styles.filterBtn, !status && styles.activeFilterBtn]}>
            <Text style={!status ? Fonts.Medium14white : Fonts.Medium14black}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setStatus('pending')} style={[styles.filterBtn, status === 'pending' && styles.activeFilterBtn]}>
            <Text style={status === 'pending' ? Fonts.Medium14white : Fonts.Medium14black}>Pending</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setStatus('resolved')} style={[styles.filterBtn, status === 'resolved' && styles.activeFilterBtn]}>
            <Text style={status === 'resolved' ? Fonts.Medium14white : Fonts.Medium14black}>Resolved</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* List */}
      {requestsLoading || unitLoading ? (
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

      {/* Add Request Modal (enhanced form) */}
      {showForm && (
        <View style={styles.formOverlay}>
          <View style={styles.formModal}>
            <Text style={Fonts.SemiBold18black}>New Maintenance Request</Text>
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={form.title}
              onChangeText={text => setForm(f => ({ ...f, title: text }))}
            />
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Description"
              value={form.description}
              multiline
              onChangeText={text => setForm(f => ({ ...f, description: text }))}
            />
            
            {/* Request Type Dropdown */}
            <View style={styles.dropdownRow}>
              <Text style={[Fonts.Medium14black, { marginBottom: 4, marginRight: 8 }]}>Type:</Text>
              <TouchableOpacity
                style={[styles.dropdownBtn, form.request_type === 'Plumbing' && styles.dropdownBtnActive]}
                onPress={() => setForm(f => ({ ...f, request_type: 'Plumbing' }))}
              >
                <Text style={form.request_type === 'Plumbing' ? Fonts.Medium14white : Fonts.Medium14black}>Plumbing</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dropdownBtn, form.request_type === 'Electricity' && styles.dropdownBtnActive]}
                onPress={() => setForm(f => ({ ...f, request_type: 'Electricity' }))}
              >
                <Text style={form.request_type === 'Electricity' ? Fonts.Medium14white : Fonts.Medium14black}>Electric</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dropdownBtn, form.request_type === 'HVAC' && styles.dropdownBtnActive]}
                onPress={() => setForm(f => ({ ...f, request_type: 'HVAC' }))}
              >
                <Text style={form.request_type === 'HVAC' ? Fonts.Medium14white : Fonts.Medium14black}>HVAC</Text>
              </TouchableOpacity>
            </View>
            
            {/* Priority Dropdown */}
            <View style={styles.dropdownRow}>
              <Text style={[Fonts.Medium14black, { marginBottom: 4, marginRight: 8 }]}>Priority:</Text>
              <TouchableOpacity
                style={[styles.dropdownBtn, form.priority === 'Low' && styles.dropdownBtnActive]}
                onPress={() => setForm(f => ({ ...f, priority: 'Low' }))}
              >
                <Text style={form.priority === 'Low' ? Fonts.Medium14white : Fonts.Medium14black}>Low</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dropdownBtn, form.priority === 'Medium' && styles.dropdownBtnActive]}
                onPress={() => setForm(f => ({ ...f, priority: 'Medium' }))}
              >
                <Text style={form.priority === 'Medium' ? Fonts.Medium14white : Fonts.Medium14black}>Medium</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dropdownBtn, form.priority === 'High' && styles.dropdownBtnActive]}
                onPress={() => setForm(f => ({ ...f, priority: 'High' }))}
              >
                <Text style={form.priority === 'High' ? Fonts.Medium14white : Fonts.Medium14black}>High</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 18 }}>
              <TouchableOpacity onPress={() => setShowForm(false)} style={[styles.button, { backgroundColor: Colors.grey, marginRight: 8 }] }>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={submitting}>
                <Text style={styles.buttonText}>{submitting ? 'Submitting...' : 'Submit'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginVertical: Default.fixPadding * 0.5,
  },
  filterBtn: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    marginHorizontal: 3,
    borderRadius: 20,
    backgroundColor: Colors.lightGrey,
    minWidth: 70,
    alignItems: 'center',
  },
  activeFilterBtn: {
    backgroundColor: Colors.primary,
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
