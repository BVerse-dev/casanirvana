"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type CommunityDirectoryRole = "member" | "admin" | "committee";

export interface CommunityDirectoryProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  unit_id: string | null;
  status: string | null;
  unit?: {
    block: string | null;
    number: string | null;
  } | null;
}

export interface CommunityDirectoryMember {
  id: string;
  community_id: string;
  profile_id: string;
  membership_role: CommunityDirectoryRole;
  committee_position: string | null;
  tenure_start: string | null;
  tenure_end: string | null;
  is_active: boolean;
  created_at: string;
  profile: CommunityDirectoryProfile;
}

export interface UpsertCommunityDirectoryInput {
  profileId: string;
  role: CommunityDirectoryRole;
  committeePosition?: string;
  tenureStart?: string;
  tenureEnd?: string;
}

const MEMBERSHIPS_TABLE = "community_memberships" as any;

const displayName = (profile: Partial<CommunityDirectoryProfile>) => {
  const fullName = profile.full_name?.trim();
  if (fullName) return fullName;
  const composed = `${profile.first_name || ""} ${profile.last_name || ""}`.trim();
  return composed || profile.email || "Unknown Member";
};

const fetchCommunityProfiles = async (communityId: string): Promise<CommunityDirectoryProfile[]> => {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
        id,
        first_name,
        last_name,
        full_name,
        email,
        phone,
        avatar_url,
        unit_id,
        status,
        unit:unit_id(block, number)
      `
    )
    .eq("community_id", communityId)
    .order("first_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as CommunityDirectoryProfile[];
};

const mapLegacyRole = (
  role: string | null | undefined,
  isCommunityAdmin: boolean
): CommunityDirectoryRole => {
  if (isCommunityAdmin || role === "admin") return "admin";
  if (role === "management") return "committee";
  return "member";
};

const fetchLegacyDirectoryMembers = async (communityId: string): Promise<CommunityDirectoryMember[]> => {
  const [profiles, communityAdmins] = await Promise.all([
    fetchCommunityProfiles(communityId),
    supabase
      .from("community_admins")
      .select("user_id")
      .eq("community_id", communityId),
  ]);

  if (communityAdmins.error) {
    throw new Error(communityAdmins.error.message);
  }

  const adminProfileIds = new Set((communityAdmins.data || []).map((row) => row.user_id));

  return profiles.map((profile) => ({
    id: `legacy-${profile.id}`,
    community_id: communityId,
    profile_id: profile.id,
    membership_role: mapLegacyRole((profile as any).role, adminProfileIds.has(profile.id)),
    committee_position: null,
    tenure_start: null,
    tenure_end: null,
    is_active: true,
    created_at: new Date(0).toISOString(),
    profile,
  }));
};

export const useCommunityDirectoryMembers = (communityId?: string | null) => {
  return useQuery({
    queryKey: ["communityDirectoryMembers", communityId],
    queryFn: async (): Promise<CommunityDirectoryMember[]> => {
      if (!communityId) return [];

      const { data: membershipRows, error: membershipsError } = await supabase
        .from(MEMBERSHIPS_TABLE)
        .select(
          "id, community_id, profile_id, membership_role, committee_position, tenure_start, tenure_end, is_active, created_at"
        )
        .eq("community_id", communityId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (membershipsError) {
        if ((membershipsError as any).code === "42P01") {
          return fetchLegacyDirectoryMembers(communityId);
        }
        throw new Error(membershipsError.message);
      }

      const profileIds = (membershipRows || []).map((row: any) => row.profile_id);
      if (profileIds.length === 0) return [];

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select(
          `
            id,
            first_name,
            last_name,
            full_name,
            email,
            phone,
            avatar_url,
            unit_id,
            status,
            unit:unit_id(block, number)
          `
        )
        .in("id", profileIds);

      if (profilesError) {
        throw new Error(profilesError.message);
      }

      const profileById = new Map((profiles || []).map((profile: any) => [profile.id, profile]));

      return (membershipRows || [])
        .map((membership: any) => {
          const profile = profileById.get(membership.profile_id);
          if (!profile) return null;
          return {
            id: membership.id,
            community_id: membership.community_id,
            profile_id: membership.profile_id,
            membership_role: membership.membership_role,
            committee_position: membership.committee_position,
            tenure_start: membership.tenure_start,
            tenure_end: membership.tenure_end,
            is_active: membership.is_active,
            created_at: membership.created_at,
            profile,
          } as CommunityDirectoryMember;
        })
        .filter((row): row is CommunityDirectoryMember => !!row)
        .sort((a, b) => displayName(a.profile).localeCompare(displayName(b.profile)));
    },
    enabled: !!communityId,
    staleTime: 60 * 1000,
  });
};

export const useCommunityProfilesForDirectory = (communityId?: string | null) => {
  return useQuery({
    queryKey: ["communityDirectoryProfiles", communityId],
    queryFn: async () => {
      if (!communityId) return [];
      const profiles = await fetchCommunityProfiles(communityId);
      return profiles.sort((a, b) => displayName(a).localeCompare(displayName(b)));
    },
    enabled: !!communityId,
    staleTime: 60 * 1000,
  });
};

export const useUpsertCommunityDirectoryMember = (communityId?: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpsertCommunityDirectoryInput) => {
      if (!communityId) {
        throw new Error("Community ID is required");
      }

      const payload = {
        community_id: communityId,
        profile_id: input.profileId,
        membership_role: input.role,
        committee_position: input.role === "committee" ? input.committeePosition || null : null,
        tenure_start: input.role === "committee" ? input.tenureStart || null : null,
        tenure_end: input.role === "committee" ? input.tenureEnd || null : null,
        is_active: true,
        updated_at: new Date().toISOString(),
      };

      const { error: upsertError } = await supabase
        .from(MEMBERSHIPS_TABLE)
        .upsert(payload, { onConflict: "community_id,profile_id" });

      if (upsertError) {
        throw new Error(upsertError.message);
      }

      if (input.role === "admin") {
        const { error: adminError } = await supabase
          .from("community_admins")
          .upsert(
            {
              community_id: communityId,
              user_id: input.profileId,
              created_at: new Date().toISOString(),
            },
            { onConflict: "community_id,user_id" }
          );

        if (adminError) {
          throw new Error(adminError.message);
        }
      } else {
        const { error: removeAdminError } = await supabase
          .from("community_admins")
          .delete()
          .eq("community_id", communityId)
          .eq("user_id", input.profileId);

        if (removeAdminError) {
          throw new Error(removeAdminError.message);
        }
      }

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityDirectoryMembers", communityId] });
      queryClient.invalidateQueries({ queryKey: ["communityDirectoryProfiles", communityId] });
    },
  });
};
