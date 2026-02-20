import { useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { useHasJoinedCommunity } from './useCommunityData';

const MEMBERSHIPS_TABLE = 'community_memberships' as any;

type CommunityDirectoryRole = 'member' | 'admin' | 'committee';

type DirectoryProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  status: string | null;
  unit?:
    | {
        block: string | null;
        number: string | null;
      }
    | {
        block: string | null;
        number: string | null;
      }[]
    | null;
};

type DirectoryMembershipRow = {
  id: string;
  profile_id: string;
  membership_role: CommunityDirectoryRole;
  committee_position: string | null;
  tenure_start: string | null;
  tenure_end: string | null;
  is_active: boolean;
};

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

export interface CommunityMember {
  key: string;
  id: string;
  name: string;
  flatNo: string;
  block: string;
  communityName: string;
  email: string;
  phone: string;
  role: CommunityDirectoryRole;
  status: string;
  avatar_url: string | null;
  image: any;
  committeePosition?: string | null;
  tenureStart?: string | null;
  tenureEnd?: string | null;
}

const getImageForProfile = (profileId: string) => {
  const suffix = profileId.slice(-2);
  const parsed = Number.parseInt(suffix, 16);
  const imageIndex = Number.isNaN(parsed) ? 1 : (parsed % 14) + 1;
  return memberImages[imageIndex as keyof typeof memberImages];
};

const toDisplayName = (profile: DirectoryProfile) => {
  const fullName = profile.full_name?.trim();
  if (fullName) return fullName;
  const composed = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
  return composed || profile.email || 'Unknown Member';
};

const toMember = (
  membership: DirectoryMembershipRow,
  profile: DirectoryProfile,
  communityName: string,
): CommunityMember => {
  const resolvedUnit = Array.isArray(profile.unit)
    ? (profile.unit[0] ?? null)
    : (profile.unit ?? null);

  return {
    key: profile.id,
    id: profile.id,
    name: toDisplayName(profile),
    flatNo: resolvedUnit?.number || 'N/A',
    block: resolvedUnit?.block || 'N/A',
    communityName,
    email: profile.email || 'N/A',
    phone: profile.phone || 'Not provided',
    role: membership.membership_role,
    status: membership.is_active ? 'active' : 'inactive',
    avatar_url: profile.avatar_url,
    image: getImageForProfile(profile.id),
    committeePosition: membership.committee_position,
    tenureStart: membership.tenure_start,
    tenureEnd: membership.tenure_end,
  };
};

const mapLegacyRole = (
  role: string | null | undefined,
  isCommunityAdmin: boolean,
): CommunityDirectoryRole => {
  if (isCommunityAdmin || role === 'admin') return 'admin';
  if (role === 'management' || role === 'committee') return 'committee';
  return 'member';
};

const fetchCommunityName = async (communityId: string): Promise<string> => {
  const { data, error } = await supabase
    .from('communities')
    .select('name')
    .eq('id', communityId)
    .single();

  if (error) return 'Community';
  return data?.name || 'Community';
};

const fetchProfilesByCommunity = async (communityId: string): Promise<DirectoryProfile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select(
      `
      id,
      first_name,
      last_name,
      full_name,
      email,
      phone,
      avatar_url,
      status,
      role,
      unit:unit_id(block, number)
      `,
    )
    .eq('community_id', communityId)
    .order('first_name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as DirectoryProfile[];
};

const fetchLegacyDirectoryMembers = async (communityId: string): Promise<CommunityMember[]> => {
  const [communityName, profiles, communityAdmins] = await Promise.all([
    fetchCommunityName(communityId),
    fetchProfilesByCommunity(communityId),
    supabase
      .from('community_admins')
      .select('user_id')
      .eq('community_id', communityId),
  ]);

  if (communityAdmins.error) {
    throw new Error(communityAdmins.error.message);
  }

  const adminProfileIds = new Set((communityAdmins.data || []).map((row) => row.user_id));

  return profiles
    .map((profile: any) => {
      const role = mapLegacyRole(profile.role, adminProfileIds.has(profile.id));
      const membership: DirectoryMembershipRow = {
        id: `legacy-${profile.id}`,
        profile_id: profile.id,
        membership_role: role,
        committee_position: null,
        tenure_start: null,
        tenure_end: null,
        is_active: true,
      };
      return toMember(membership, profile, communityName);
    })
    .sort((a, b) => a.name.localeCompare(b.name));
};

const fetchDirectoryMembers = async (communityId: string): Promise<CommunityMember[]> => {
  const communityNamePromise = fetchCommunityName(communityId);

  const { data: membershipRows, error: membershipError } = await supabase
    .from(MEMBERSHIPS_TABLE)
    .select(
      'id, profile_id, membership_role, committee_position, tenure_start, tenure_end, is_active',
    )
    .eq('community_id', communityId)
    .eq('is_active', true);

  if (membershipError) {
    if ((membershipError as any).code === '42P01') {
      return fetchLegacyDirectoryMembers(communityId);
    }
    throw new Error(membershipError.message);
  }

  const memberships = (membershipRows || []) as DirectoryMembershipRow[];
  if (memberships.length === 0) {
    return [];
  }

  const profileIds = memberships.map((membership) => membership.profile_id);
  const [communityName, profileResult] = await Promise.all([
    communityNamePromise,
    supabase
      .from('profiles')
      .select(
        `
        id,
        first_name,
        last_name,
        full_name,
        email,
        phone,
        avatar_url,
        status,
        unit:unit_id(block, number)
        `,
      )
      .in('id', profileIds),
  ]);

  if (profileResult.error) {
    throw new Error(profileResult.error.message);
  }

  const profileById = new Map(
    ((profileResult.data || []) as DirectoryProfile[]).map((profile) => [profile.id, profile]),
  );

  return memberships
    .map((membership) => {
      const profile = profileById.get(membership.profile_id);
      if (!profile) return null;
      return toMember(membership, profile, communityName);
    })
    .filter((member): member is CommunityMember => !!member)
    .sort((a, b) => a.name.localeCompare(b.name));
};

const useCommunityDirectoryMembers = () => {
  const { profile } = useHasJoinedCommunity();

  return useQuery({
    queryKey: ['communityDirectoryMembers', profile?.community_id],
    queryFn: async () => {
      if (!profile?.community_id) return [];
      return fetchDirectoryMembers(profile.community_id);
    },
    enabled: !!profile?.community_id,
    staleTime: 2 * 60 * 1000,
  });
};

const useFilteredDirectoryMembers = (role: CommunityDirectoryRole) => {
  const directoryQuery = useCommunityDirectoryMembers();

  const filteredData = useMemo(
    () => (directoryQuery.data || []).filter((member) => member.role === role),
    [directoryQuery.data, role],
  );

  return {
    ...directoryQuery,
    data: filteredData,
  };
};

// Hook to get community members (residents)
export const useCommunityMembers = () => useFilteredDirectoryMembers('member');

// Hook to get community admins
export const useCommunityAdmins = () => useFilteredDirectoryMembers('admin');

// Hook to get community committee members
export const useCommunityCommittee = () => useFilteredDirectoryMembers('committee');

// Real-time subscription for community directory member changes
export const useCommunityMembersSubscription = () => {
  const { profile } = useHasJoinedCommunity();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!profile?.community_id) return;

    const communityId = profile.community_id;
    const channel = supabase
      .channel(`community-directory-${communityId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_memberships',
          filter: `community_id=eq.${communityId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['communityDirectoryMembers', communityId] });
          queryClient.invalidateQueries({ queryKey: ['communityMembers'] });
          queryClient.invalidateQueries({ queryKey: ['communityAdmins'] });
          queryClient.invalidateQueries({ queryKey: ['communityCommittee'] });
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `community_id=eq.${communityId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['communityDirectoryMembers', communityId] });
          queryClient.invalidateQueries({ queryKey: ['communityMembers'] });
          queryClient.invalidateQueries({ queryKey: ['communityAdmins'] });
          queryClient.invalidateQueries({ queryKey: ['communityCommittee'] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.community_id, queryClient]);
};
