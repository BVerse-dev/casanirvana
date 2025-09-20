import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { useHasJoinedCommunity } from './useCommunityData';
import { sampleMembers, sampleAdmins, sampleCommittee } from '../data/sampleMemberData';

// Static imports for member images (React Native requirement)
const memberImages = {
  1: require('../assets/images/member1.png'),
  2: require('../assets/images/member2.png'),
  3: require('../assets/images/member3.png'),
  4: require('../assets/images/member4.png'),
  5: require('../assets/images/member5.png'),
  6: require('../assets/images/member6.png'),
  7: require('../assets/images/member7.png'),
  8: require('../assets/images/member8.png'),
  9: require('../assets/images/member9.png'),
  10: require('../assets/images/member10.png'),
  11: require('../assets/images/member11.png'),
  12: require('../assets/images/member12.png'),
  13: require('../assets/images/member13.png'),
  14: require('../assets/images/member14.png'),
};

// Define the types based on database schema (profiles table)
export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: string;
  society_id: string | null;
  unit_id: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
  is_active: boolean | null;
  current_society_id: string | null;
  user_id: string | null;
};

// Extended user type for UI compatibility
export interface CommunityMember {
  key: string;
  id: string;
  name: string;
  flatNo: string;
  block: string;
  societyName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  avatar_url: string | null;
  // For UI compatibility - will use placeholder images
  image: any;
}

// Transform database member/admin to UI format
const transformUserToMember = (record: any, societyName: string = 'Community'): CommunityMember => {
  // Generate placeholder image based on record ID for consistency
  const imageIndex = (parseInt(record.id?.slice(-2) || '01', 16) % 14) + 1;
  const placeholderImage = memberImages[imageIndex as keyof typeof memberImages];

  // Handle different record structures
  let userInfo, unit, firstName, lastName, email, phone, userId;
  
  if (record.users) {
    // For society_admins table: user data is nested in 'users'
    userInfo = record.users;
    unit = userInfo.units; // units is nested within users for admins
    firstName = userInfo.first_name;
    lastName = userInfo.last_name;
    email = userInfo.email;
    phone = userInfo.phone;
    userId = userInfo.id;
  } else if (record.user_id) {
    // For members table: user data is direct but joined from users table
    firstName = record.first_name;
    lastName = record.last_name;
    email = record.users?.email || record.email;
    phone = record.users?.phone || record.phone;
    unit = record.units; // units is at the same level for members
    userId = record.user_id;
  } else {
    // Fallback for direct user records
    firstName = record.first_name;
    lastName = record.last_name;
    email = record.email;
    phone = record.phone;
    unit = record.units;
    userId = record.id;
  }
  
  const blockNumber = unit?.block || 'N/A';
  const unitNumber = unit?.number || unit?.unit_number || 'N/A';

  return {
    key: record.id || userId,
    id: record.id || userId,
    name: `${firstName || ''} ${lastName || ''}`.trim() || record.full_name || 'Unknown',
    flatNo: unitNumber,
    block: blockNumber,
    societyName,
    email: email || 'N/A',
    phone: phone || 'Not provided',
    role: record.role || 'member',
    status: 'active',
    avatar_url: record.avatar_url,
    image: placeholderImage,
  };
};

// Hook to get society members (residents and tenants)
export const useSocietyMembers = () => {
  const { profile } = useHasJoinedCommunity();
  
  return useQuery({
    queryKey: ['societyMembers', profile?.community_id],
    queryFn: async () => {
      if (!profile?.community_id) {
        console.log('❌ useSocietyMembers: No community_id found');
        return [];
      }
      
      console.log('🔍 useSocietyMembers: Fetching members for community:', profile.community_id);

      // Get community info first
      const { data: community, error: communityError } = await supabase
        .from('communities')
        .select('name')
        .eq('id', profile.community_id)
        .single();

      if (communityError) {
        console.error('❌ Error fetching community:', communityError);
      }

      console.log('🔍 useSocietyMembers: About to fetch from profiles table...');

      // Fetch users who are members from the profiles table (original working approach)
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          units:unit_id(
            id,
            block,
            number,
            unit_type
          )
        `)
        .eq('community_id', profile.community_id)
        .in('role', ['user', 'management']) // Regular members and management/committee
        .order('first_name');

      console.log('🔍 useSocietyMembers: Query completed. Data:', data, 'Error:', error);

      if (error) {
        console.error('❌ Error fetching society members:', error);
        throw error;
      }

      console.log('✅ useSocietyMembers: Fetched', data?.length || 0, 'members');
      console.log('🔍 useSocietyMembers: Raw data sample:', data?.[0]);
      
      const communityName = community?.name || 'Community';
      const transformedData = data?.map(user => transformUserToMember(user, communityName)) || [];
      console.log('🔍 useSocietyMembers: Transformed data sample:', transformedData?.[0]);
      
      // If no real data, return sample data for development/testing
      if (transformedData.length === 0) {
        console.log('📝 useSocietyMembers: No real data found, returning sample data');
        return sampleMembers;
      }
      
      return transformedData;
    },
    enabled: !!profile?.community_id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook to get society admins (admin role)
export const useSocietyAdmins = () => {
  const { profile } = useHasJoinedCommunity();
  
  return useQuery({
    queryKey: ['societyAdmins', profile?.community_id],
    queryFn: async () => {
      if (!profile?.community_id) {
        console.log('❌ useSocietyAdmins: No community_id found');
        return [];
      }
      
      console.log('🔍 useSocietyAdmins: Fetching admins for community:', profile.community_id);

      // Get community info first
      const { data: community, error: communityError } = await supabase
        .from('communities')
        .select('name')
        .eq('id', profile.community_id)
        .single();

      if (communityError) {
        console.error('❌ Error fetching community:', communityError);
      }

      // Fetch users who are admins from profiles table (original working approach)
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          units:unit_id(
            id,
            block,
            number,
            unit_type
          )
        `)
        .eq('community_id', profile.community_id)
        .eq('role', 'admin') // Admin role
        .order('first_name');

      if (error) {
        console.error('❌ Error fetching society admins:', error);
        throw error;
      }

      console.log('✅ useSocietyAdmins: Fetched', data?.length || 0, 'admins');
      
      const communityName = community?.name || 'Community';
      const transformedData = data?.map(user => transformUserToMember(user, communityName)) || [];
      
      // If no real data, return sample data for development/testing
      if (transformedData.length === 0) {
        console.log('📝 useSocietyAdmins: No real data found, returning sample data');
        return sampleAdmins;
      }
      
      return transformedData;
    },
    enabled: !!profile?.community_id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook to get society committee members 
// Note: This assumes committee members are marked with a specific role or metadata
// You may need to adjust this based on how the super-admin sets up committee members
export const useSocietyCommittee = () => {
  const { profile } = useHasJoinedCommunity();
  
  return useQuery({
    queryKey: ['societyCommittee', profile?.community_id],
    queryFn: async () => {
      if (!profile?.community_id) {
        console.log('❌ useSocietyCommittee: No community_id found');
        return [];
      }

      console.log('🔍 useSocietyCommittee: Fetching committee for community:', profile.community_id);

      // Get community info first
      const { data: community, error: communityError } = await supabase
        .from('communities')
        .select('name')
        .eq('id', profile.community_id)
        .single();

      if (communityError) {
        console.error('❌ Error fetching community:', communityError);
      }

      // For committee members, get from profiles table with management role (original working approach)
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          units:unit_id(
            id,
            block,
            number,
            unit_type
          )
        `)
        .eq('community_id', profile.community_id)
        .eq('role', 'management') // Management/committee members
        .order('first_name');

      if (error) {
        console.error('❌ Error fetching society committee:', error);
        throw error;
      }

      console.log('✅ useSocietyCommittee: Fetched', data?.length || 0, 'committee members');
      console.log('🔍 useSocietyCommittee: Raw data sample:', data?.[0]);
      
      const communityName = community?.name || 'Community';
      const transformedData = data?.map(user => transformUserToMember(user, communityName)) || [];
      console.log('🔍 useSocietyCommittee: Transformed data sample:', transformedData?.[0]);
      
      // If no real data, return sample data for development/testing
      if (transformedData.length === 0) {
        console.log('📝 useSocietyCommittee: No real data found, returning sample data');
        return sampleCommittee;
      }
      
      return transformedData;
    },
    enabled: !!profile?.community_id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Real-time subscription for society members
export const useSocietyMembersSubscription = () => {
  const { profile } = useHasJoinedCommunity();
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['societyMembersSubscription', profile?.community_id],
    queryFn: async () => {
      if (!profile?.community_id) {
        return null;
      }

      console.log('🔔 Setting up community members subscription for:', profile.community_id);

      // Set up real-time subscriptions for the profiles table
      const membersChannel = supabase
        .channel(`community-members-${profile.community_id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
            filter: `community_id=eq.${profile.community_id}`,
          },
          (payload) => {
            console.log('🔔 Real-time profiles update:', payload);
            queryClient.invalidateQueries({ queryKey: ['societyMembers'] });
            queryClient.invalidateQueries({ queryKey: ['societyAdmins'] });
            queryClient.invalidateQueries({ queryKey: ['societyCommittee'] });
          }
        )
        .subscribe();

      return membersChannel;
    },
    enabled: !!profile?.community_id,
    staleTime: Infinity, // Keep the subscription alive
  });
};
