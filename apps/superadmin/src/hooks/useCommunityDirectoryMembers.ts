"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAdminApi } from "@/hooks/useAdminApi";

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
    unit_number?: string | null;
  } | null;
}

export interface CommunityResident extends CommunityDirectoryProfile {
  user_id: string | null;
  role: string | null;
  is_active: boolean | null;
  created_at: string | null;
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

export interface CommunityStaffMember {
  id: string;
  first_name: string | null;
  last_name: string | null;
  position: string | null;
  shift: string | null;
  status: string | null;
  email: string | null;
  phone: string | null;
  hire_date: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface CommunityManagementPayload {
  residents: CommunityResident[];
  directoryMembers: CommunityDirectoryMember[];
  directoryProfiles: CommunityDirectoryProfile[];
  staff: CommunityStaffMember[];
}

export interface UpsertCommunityDirectoryInput {
  profileId: string;
  role: CommunityDirectoryRole;
  committeePosition?: string;
  tenureStart?: string;
  tenureEnd?: string;
}

const EMPTY_MANAGEMENT_DATA: CommunityManagementPayload = {
  residents: [],
  directoryMembers: [],
  directoryProfiles: [],
  staff: [],
};

const useCommunityManagementData = (communityId?: string | null) => {
  const { fetchAdmin } = useAdminApi();

  return useQuery({
    queryKey: ["communityManagementData", communityId],
    queryFn: async (): Promise<CommunityManagementPayload> => {
      if (!communityId) {
        return EMPTY_MANAGEMENT_DATA;
      }

      const response = await fetchAdmin<{ data?: CommunityManagementPayload }>(
        `/admin/communities/${communityId}/management`
      );

      return response.data || EMPTY_MANAGEMENT_DATA;
    },
    enabled: !!communityId,
    staleTime: 60 * 1000,
  });
};

export const useCommunityResidents = (communityId?: string | null) => {
  const query = useCommunityManagementData(communityId);
  return {
    ...query,
    data: query.data?.residents || [],
  };
};

export const useCommunityDirectoryMembers = (communityId?: string | null) => {
  const query = useCommunityManagementData(communityId);
  return {
    ...query,
    data: query.data?.directoryMembers || [],
  };
};

export const useCommunityProfilesForDirectory = (communityId?: string | null) => {
  const query = useCommunityManagementData(communityId);
  return {
    ...query,
    data: query.data?.directoryProfiles || [],
  };
};

export const useCommunityStaff = (communityId?: string | null) => {
  const query = useCommunityManagementData(communityId);
  return {
    ...query,
    data: query.data?.staff || [],
  };
};

export const useUpsertCommunityDirectoryMember = (communityId?: string | null) => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async (input: UpsertCommunityDirectoryInput) => {
      if (!communityId) {
        throw new Error("Community ID is required");
      }

      await fetchAdmin(`/admin/communities/${communityId}/directory-members`, {
        method: "PUT",
        body: JSON.stringify({
          profileId: input.profileId,
          role: input.role,
          committeePosition: input.committeePosition || null,
          tenureStart: input.tenureStart || null,
          tenureEnd: input.tenureEnd || null,
        }),
      });

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityManagementData", communityId] });
    },
  });
};
