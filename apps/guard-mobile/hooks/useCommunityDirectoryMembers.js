import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { useGuardAuth } from '../contexts/GuardAuthContext';

const MEMBERSHIPS_TABLE = 'community_memberships';

const mapLegacyRole = (role, isCommunityAdmin) => {
  if (isCommunityAdmin || role === 'admin') return 'admin';
  if (role === 'management' || role === 'committee') return 'committee';
  return 'member';
};

const toDisplayName = (profile) => {
  if (profile?.full_name?.trim()) return profile.full_name.trim();
  const composed = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim();
  return composed || profile?.email || 'Unknown Resident';
};

const toDirectoryMember = (membership, profile) => {
  const unit = Array.isArray(profile?.unit) ? profile.unit[0] : profile?.unit;
  const block = unit?.block || 'N/A';
  const flatNo = unit?.number || 'N/A';

  return {
    key: profile.id,
    id: profile.id,
    name: toDisplayName(profile),
    block,
    flatNo,
    role: membership.membership_role,
    email: profile?.email || null,
    phone: profile?.phone || null,
    avatarUrl: profile?.avatar_url || null,
    committeePosition: membership?.committee_position || null,
  };
};

const fetchLegacyDirectoryMembers = async (communityId) => {
  const [profilesResult, adminsResult] = await Promise.all([
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
        role,
        unit:unit_id(block, number)
        `,
      )
      .eq('community_id', communityId),
    supabase
      .from('community_admins')
      .select('user_id')
      .eq('community_id', communityId),
  ]);

  if (profilesResult.error) {
    throw new Error(profilesResult.error.message);
  }
  if (adminsResult.error) {
    throw new Error(adminsResult.error.message);
  }

  const adminIds = new Set((adminsResult.data || []).map((row) => row.user_id));

  return (profilesResult.data || [])
    .map((profile) => {
      const role = mapLegacyRole(profile.role, adminIds.has(profile.id));
      return toDirectoryMember(
        {
          membership_role: role,
          committee_position: null,
        },
        profile,
      );
    })
    .sort((a, b) => a.name.localeCompare(b.name));
};

const fetchDirectoryMembers = async (communityId) => {
  const { data: membershipRows, error: membershipError } = await supabase
    .from(MEMBERSHIPS_TABLE)
    .select('id, profile_id, membership_role, committee_position, is_active')
    .eq('community_id', communityId)
    .eq('is_active', true);

  if (membershipError) {
    if (membershipError.code === '42P01') {
      return fetchLegacyDirectoryMembers(communityId);
    }
    throw new Error(membershipError.message);
  }

  const memberships = membershipRows || [];
  if (memberships.length === 0) {
    return [];
  }

  const profileIds = memberships.map((membership) => membership.profile_id);
  const { data: profiles, error: profilesError } = await supabase
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
      unit:unit_id(block, number)
      `,
    )
    .in('id', profileIds);

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  const profileById = new Map((profiles || []).map((profile) => [profile.id, profile]));

  return memberships
    .map((membership) => {
      const profile = profileById.get(membership.profile_id);
      if (!profile) return null;
      return toDirectoryMember(membership, profile);
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const useGuardCommunityDirectoryMembers = ({ enabled = true } = {}) => {
  const { guard, isAuthenticated } = useGuardAuth();

  return useQuery({
    queryKey: ['guardCommunityDirectoryMembers', guard?.community_id],
    queryFn: async () => {
      if (!guard?.community_id) return [];
      return fetchDirectoryMembers(guard.community_id);
    },
    enabled: enabled && isAuthenticated && !!guard?.community_id,
    staleTime: 2 * 60 * 1000,
  });
};

export const useGuardCommunityDirectorySubscription = ({ enabled = true } = {}) => {
  const { guard, isAuthenticated } = useGuardAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || !isAuthenticated || !guard?.community_id) return undefined;

    const communityId = guard.community_id;
    const channel = supabase
      .channel(`guard-community-directory-${communityId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_memberships',
          filter: `community_id=eq.${communityId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ['guardCommunityDirectoryMembers', communityId],
          });
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
          queryClient.invalidateQueries({
            queryKey: ['guardCommunityDirectoryMembers', communityId],
          });
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'units',
          filter: `community_id=eq.${communityId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ['guardCommunityDirectoryMembers', communityId],
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, guard?.community_id, isAuthenticated, queryClient]);
};
