import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';

// Hook to search communities with real-time autocomplete
export const useSearchCommunities = (searchText: string) => {
  return useQuery({
    queryKey: ['communities', 'search', searchText],
    queryFn: async () => {
      if (!searchText || searchText.length < 1) return [];
      
      const { data, error } = await supabase
        .from('societies')
        .select('id, name, address, city, state')
        .ilike('name', `%${searchText}%`)
        .eq('status', 'active')
        .order('name')
        .limit(10);
      
      if (error) {
        console.error('Error searching communities:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: searchText.length > 0,
    staleTime: 30 * 1000, // 30 seconds for real-time feel
  });
};

// Hook to search units by community (only works AFTER community is selected)
export const useSearchUnits = (communityId: string | null, searchText: string) => {
  return useQuery({
    queryKey: ['units', communityId, 'search', searchText],
    queryFn: async () => {
      if (!communityId || !searchText || searchText.length < 1) return [];
      
      const { data, error } = await supabase
        .from('units')
        .select('id, block, number, unit_type, floor, status')
        .eq('society_id', communityId)
        .eq('status', 'available')
        .or(`block.ilike.%${searchText}%,number.ilike.%${searchText}%,unit_type.ilike.%${searchText}%`)
        .order('block, number')
        .limit(20);
      
      if (error) {
        console.error('Error searching units:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!communityId && searchText.length > 0,
    staleTime: 30 * 1000, // 30 seconds for real-time feel
  });
};

// Hook to get ALL units in a community (for dropdown selection)
export const useGetAllUnits = (communityId: string | null) => {
  return useQuery({
    queryKey: ['units', 'all', communityId],
    queryFn: async () => {
      console.log('🏠 useGetAllUnits: Fetching units for communityId:', communityId);
      if (!communityId) {
        console.log('❌ No communityId provided, returning empty array');
        return [];
      }
      
      const { data, error } = await supabase
        .from('units')
        .select('id, block, number, unit_type, floor, status')
        .eq('society_id', communityId)
        .eq('status', 'available')
        .order('block, number');
      
      if (error) {
        console.error('❌ Error fetching units:', error);
        throw error;
      }
      
      console.log('✅ useGetAllUnits: Fetched units:', data?.length || 0, 'units');
      console.log('📝 Units data:', data);
      return data || [];
    },
    enabled: !!communityId,
    staleTime: 1 * 60 * 1000, // 1 minute - shorter for debugging
    refetchOnWindowFocus: false,
  });
};

// Hook to search for a community by exact name (when user types non-existent community)
export const useGetCommunityByName = (communityName: string) => {
  return useQuery({
    queryKey: ['communities', 'byName', communityName],
    queryFn: async () => {
      if (!communityName || communityName.trim().length === 0) {
        return null;
      }
      
      console.log('🔍 useGetCommunityByName: Searching for:', communityName);
      
      const { data, error } = await supabase
        .from('societies')
        .select('id, name, address, city, state')
        .ilike('name', communityName.trim())
        .eq('status', 'active')
        .limit(1)
        .single();
      
      if (error) {
        console.log('❌ useGetCommunityByName: Community not found in database:', communityName);
        console.log('📝 Error details:', error);
        return null; // Community doesn't exist
      }
      
      console.log('✅ useGetCommunityByName: Found community:', data);
      return data;
    },
    enabled: !!communityName && communityName.trim().length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook to create a manual unit entry request
export const useCreateManualUnitRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (requestData: {
      communityName: string;
      unitInfo: string;
      comments?: string;
    }) => {
      console.log('🔄 useCreateManualUnitRequest: Starting manual request:', requestData);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('❌ Auth error:', userError);
        throw new Error('Authentication failed: ' + userError.message);
      }
      
      if (!user) {
        console.error('❌ No authenticated user');
        throw new Error('User not authenticated');
      }
      
      console.log('✅ Authenticated user:', user.id);
      
      // Get the profile to make sure user exists in profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, user_id')
        .eq('user_id', user.id)
        .single();
        
      if (profileError || !profile) {
        console.error('❌ Profile not found:', profileError);
        throw new Error('User profile not found');
      }
      
      console.log('✅ Found user profile:', profile.id);
      
      // Create manual unit request (store in join_requests with special flag)
      const insertData = {
        user_id: profile.id, // Use profile.id, not auth user.id
        community_name: requestData.communityName, // Store text name instead of ID
        manual_unit_info: requestData.unitInfo, // Store manual unit info
        comments: requestData.comments || '',
        status: 'pending_manual_review', // Special status for manual entries
        is_manual_entry: true
      };
      
      console.log('📝 Inserting manual request:', insertData);
      
      const { data, error } = await supabase
        .from('join_requests')
        .insert(insertData)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Error creating manual unit request:', error);
        throw new Error('Failed to submit manual request: ' + error.message);
      }
      
      console.log('✅ Manual request created successfully:', data);
      return data;
    },
    onSuccess: () => {
      // Refresh user profile and pending requests
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['pendingJoinRequest'] });
    },
    onError: (error) => {
      console.error('❌ Manual unit request mutation failed:', error);
    }
  });
};

// Hook to create a join request (save to database)
export const useJoinCommunity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (requestData: {
      communityId: string;
      unitId: string;
      comments?: string;
    }) => {
      console.log('🔄 useJoinCommunity: Starting join request:', requestData);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('❌ Auth error:', userError);
        throw new Error('Authentication failed: ' + userError.message);
      }
      
      if (!user) {
        console.error('❌ No authenticated user');
        throw new Error('User not authenticated');
      }
      
      console.log('✅ Authenticated user:', user.id);
      
      // Get the profile to make sure user exists in profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, user_id')
        .eq('user_id', user.id)
        .single();
        
      if (profileError || !profile) {
        console.error('❌ Profile not found:', profileError);
        throw new Error('User profile not found');
      }
      
      console.log('✅ Found user profile:', profile.id);
      
      // Create join request using profile id
      const insertData = {
        user_id: profile.id, // Use profile.id, not auth user.id
        community_id: requestData.communityId,
        unit_id: requestData.unitId,
        comments: requestData.comments || '',
        status: 'pending'
      };
      
      console.log('📝 Inserting join request:', insertData);
      
      const { data, error } = await supabase
        .from('join_requests')
        .insert(insertData)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Error creating join request:', error);
        throw new Error('Failed to submit join request: ' + error.message);
      }
      
      console.log('✅ Join request created successfully:', data);
      return data;
    },
    onSuccess: () => {
      // Refresh user profile and pending requests to check community status
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['pendingJoinRequest'] });
    },
    onError: (error) => {
      console.error('❌ Join community mutation failed:', error);
    }
  });
};

// Hook to get user profile with community/unit data (REAL DATA)
export const useUserProfile = () => {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return null;
      }
      
      console.log('🔍 useUserProfile: Fetching profile for auth user:', user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          email,
          first_name,
          last_name,
          phone,
          role,
          society_id,
          unit_id,
          status,
          society:societies!profiles_society_id_fkey(id, name, address, city, state),
          unit:units!profiles_unit_id_fkey(id, block, number, unit_type, floor)
        `)
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('❌ Error fetching user profile:', error);
        throw error;
      }
      
      console.log('✅ useUserProfile: Fetched profile:', data);
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook to check for pending join requests
export const usePendingJoinRequest = () => {
  return useQuery({
    queryKey: ['pendingJoinRequest'],
    queryFn: async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return null;
      }
      
      // Get the profile first
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
        
      if (profileError || !profile) {
        return null;
      }
      
      console.log('🔍 usePendingJoinRequest: Checking for pending/rejected requests for profile:', profile.id);
      
      const { data, error } = await supabase
        .from('join_requests')
        .select(`
          id,
          status,
          created_at,
          community_name,
          manual_unit_info,
          is_manual_entry,
          community:societies!join_requests_community_id_fkey(name),
          unit:units!join_requests_unit_id_fkey(block, number)
        `)
        .eq('user_id', profile.id)
        .in('status', ['pending', 'pending_manual_review', 'rejected'])
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('❌ Error fetching pending join requests:', error);
        return null;
      }
      
      console.log('✅ usePendingJoinRequest: Found pending/rejected requests:', data);
      return data?.[0] || null;
    },
    staleTime: 30 * 1000, // 30 seconds for real-time feel
  });
};

// Hook to check if user has joined a community (EXACT LOGIC YOU SPECIFIED)
export const useHasJoinedCommunity = () => {
  const { data: profile, isLoading } = useUserProfile();
  const { data: pendingRequest, isLoading: pendingLoading } = usePendingJoinRequest();
  
  // Determine the appropriate message based on user state
  const getUnitDisplay = () => {
    console.log('🔍 getUnitDisplay: Checking profile data:', {
      society_id: profile?.society_id,
      unit_id: profile?.unit_id,
      society: profile?.society,
      unit: profile?.unit,
      pendingRequest: pendingRequest?.status
    });
    
    // Phase 3: User has joined a community (has society_id and unit) - HIGHEST PRIORITY
    // This means their request was approved and they are now a member
    // If user is approved, we NEVER show pending/rejected messages
    if (profile?.society_id && profile?.unit_id) {
      // Try different ways to access the society and unit data
      const society = profile.society?.[0] || profile.society;
      const unit = profile.unit?.[0] || profile.unit;
      
      console.log('✅ User is approved! Society:', society, 'Unit:', unit);
      
      if (society && unit) {
        const result = `${unit.block}-${unit.number} | ${society.name}`;
        console.log('✅ Returning approved user display:', result);
        return result;
      }
      
      // Fallback if society/unit data is missing but IDs exist
      const fallback = `Unit ${profile.unit_id} | Community ${profile.society_id}`;
      console.log('✅ Returning fallback display:', fallback);
      return fallback;
    }
    
    // Only check for rejected/pending requests if user is NOT approved (no society_id)
    if (!profile?.society_id && pendingRequest) {
      console.log('🔍 Checking pending request status:', pendingRequest.status);
      
      // Check for rejected requests
      if (pendingRequest.status === 'rejected') {
        if (pendingRequest.is_manual_entry) {
          return `Request Rejected - Please contact admin. ${pendingRequest.community_name}`;
        } else {
          const communityName = pendingRequest.community?.[0]?.name || 'Community';
          const unitInfo = pendingRequest.unit?.[0]
            ? `${pendingRequest.unit[0].block}-${pendingRequest.unit[0].number}`
            : 'Unit';
          return `Request Rejected - Please contact admin. ${unitInfo} | ${communityName}`;
        }
      }
      
      // Check for pending requests
      if (pendingRequest.status === 'pending' || pendingRequest.status === 'pending_manual_review') {
        if (pendingRequest.is_manual_entry) {
          return `Request Sent - Awaiting Admin Approval. ${pendingRequest.community_name}`;
        } else {
          const communityName = pendingRequest.community?.[0]?.name || 'Community';
          const unitInfo = pendingRequest.unit?.[0]
            ? `${pendingRequest.unit[0].block}-${pendingRequest.unit[0].number}`
            : 'Unit';
          return `Request Sent - Awaiting Admin Approval. ${unitInfo} | ${communityName}`;
        }
      }
    }
    
    // Phase 1: New user who hasn't submitted any request yet
    console.log('🆕 New user - showing join community option');
    return 'Join a Community Now';
  };
  
  return {
    // Phase 1: user.society_id = null (New User)
    // Phase 2: user has pending request (Request Sent)
    // Phase 3: user.society_id = exists (Returning User)  
    hasJoinedCommunity: !isLoading && !!profile?.society_id,
    hasPendingRequest: !pendingLoading && !!pendingRequest && !profile?.society_id && (pendingRequest.status === 'pending' || pendingRequest.status === 'pending_manual_review'),
    hasRejectedRequest: !pendingLoading && !!pendingRequest && !profile?.society_id && pendingRequest.status === 'rejected',
    isLoading: isLoading || pendingLoading,
    profile,
    pendingRequest,
    // Real user data for homescreen display
    userName: profile ? `${profile.first_name} ${profile.last_name}` : 'User',
    unitDisplay: getUnitDisplay(),
  };
};

// Hook for real-time subscription to profile changes
export const useProfileSubscription = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['profileSubscription'],
    queryFn: async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return null;
      }

      // Get the profile to get the correct user_id reference
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
        
      if (profileError || !profile) {
        return null;
      }

      console.log('🔔 Setting up profile subscription for profile:', profile.id);

      // Set up real-time subscription for profile changes
      const channel = supabase
        .channel('user-profile')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${profile.id}`,
          },
          (payload) => {
            console.log('🔔 Real-time profile update:', payload);
            
            // Invalidate and refetch user profile when changes occur
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            queryClient.invalidateQueries({ queryKey: ['pendingJoinRequest'] });
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'join_requests',
            filter: `user_id=eq.${profile.id}`,
          },
          (payload) => {
            console.log('🔔 Real-time join request update:', payload);
            
            // Invalidate and refetch when join requests change
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            queryClient.invalidateQueries({ queryKey: ['pendingJoinRequest'] });
          }
        )
        .subscribe();

      return channel;
    },
    staleTime: Infinity, // Keep the subscription alive
  });
};
