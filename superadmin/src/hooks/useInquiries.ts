"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Database } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";

type InquiryRow = Database["public"]["Tables"]["inquiries"]["Row"];
type InquiryUpdate = Database["public"]["Tables"]["inquiries"]["Update"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type CommunityRow = Database["public"]["Tables"]["communities"]["Row"];
type AgencyRow = Database["public"]["Tables"]["agencies"]["Row"];

type InquiryProfileSummary = Pick<
  ProfileRow,
  "id" | "user_id" | "full_name" | "email" | "phone" | "role" | "community_id"
>;

type InquiryCommunitySummary = Pick<CommunityRow, "id" | "name" | "agency_id">;
type InquiryAgencySummary = Pick<AgencyRow, "id" | "name">;

export type InquiryRecord = InquiryRow & {
  user_profile: InquiryProfileSummary | null;
  assignee_profile: InquiryProfileSummary | null;
  community: InquiryCommunitySummary | null;
  agency: InquiryAgencySummary | null;
};

export type InquiriesFilters = {
  status?: string;
  inquiryType?: string;
  priority?: string;
  communityId?: string;
};

const enrichInquiries = async (inquiries: InquiryRow[]): Promise<InquiryRecord[]> => {
  if (!inquiries.length) {
    return [];
  }

  const actorIds = Array.from(
    new Set(
      inquiries
        .flatMap((inquiry) => [inquiry.user_id, inquiry.assigned_to])
        .filter((value): value is string => Boolean(value)),
    ),
  );

  const communityIds = Array.from(
    new Set(
      inquiries
        .map((inquiry) => inquiry.community_id)
        .filter((value): value is string => Boolean(value)),
    ),
  );

  const [profilesResult, communitiesResult] = await Promise.all([
    actorIds.length
      ? supabase
          .from("profiles")
          .select("id,user_id,full_name,email,phone,role,community_id")
          .or(`id.in.(${actorIds.join(",")}),user_id.in.(${actorIds.join(",")})`)
      : Promise.resolve({ data: [], error: null }),
    communityIds.length
      ? supabase.from("communities").select("id,name,agency_id").in("id", communityIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (profilesResult.error) {
    throw profilesResult.error;
  }

  if (communitiesResult.error) {
    throw communitiesResult.error;
  }

  const profiles = (profilesResult.data ?? []) as InquiryProfileSummary[];
  const communities = (communitiesResult.data ?? []) as InquiryCommunitySummary[];

  const agencyIds = Array.from(
    new Set(
      communities
        .map((community) => community.agency_id)
        .filter((value): value is string => Boolean(value)),
    ),
  );

  const agenciesResult = agencyIds.length
    ? await supabase.from("agencies").select("id,name").in("id", agencyIds)
    : { data: [], error: null };

  if (agenciesResult.error) {
    throw agenciesResult.error;
  }

  const agencies = (agenciesResult.data ?? []) as InquiryAgencySummary[];

  const profileByIdentity = new Map<string, InquiryProfileSummary>();
  for (const profile of profiles) {
    profileByIdentity.set(profile.id, profile);
    if (profile.user_id) {
      profileByIdentity.set(profile.user_id, profile);
    }
  }

  const communityById = new Map<string, InquiryCommunitySummary>();
  for (const community of communities) {
    communityById.set(community.id, community);
  }

  const agencyById = new Map<string, InquiryAgencySummary>();
  for (const agency of agencies) {
    agencyById.set(agency.id, agency);
  }

  return inquiries.map((inquiry) => {
    const community = inquiry.community_id ? communityById.get(inquiry.community_id) ?? null : null;
    const agency = community?.agency_id ? agencyById.get(community.agency_id) ?? null : null;

    return {
      ...inquiry,
      user_profile: inquiry.user_id ? profileByIdentity.get(inquiry.user_id) ?? null : null,
      assignee_profile: inquiry.assigned_to ? profileByIdentity.get(inquiry.assigned_to) ?? null : null,
      community,
      agency,
    };
  });
};

export const useListInquiries = (filters?: InquiriesFilters) => {
  return useQuery({
    queryKey: ["inquiries", filters],
    queryFn: async () => {
      let query = supabase.from("inquiries").select("*").order("created_at", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      if (filters?.inquiryType) {
        query = query.eq("inquiry_type", filters.inquiryType);
      }

      if (filters?.priority) {
        query = query.eq("priority", filters.priority);
      }

      if (filters?.communityId) {
        query = query.eq("community_id", filters.communityId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return enrichInquiries((data ?? []) as InquiryRow[]);
    },
  });
};

export const useGetInquiry = (inquiryId?: string) => {
  return useQuery({
    queryKey: ["inquiry", inquiryId],
    enabled: Boolean(inquiryId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inquiries")
        .select("*")
        .eq("id", inquiryId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        return null;
      }

      const [inquiry] = await enrichInquiries([data as InquiryRow]);
      return inquiry;
    },
  });
};

export const useListAssignableInquiryAdmins = (communityId?: string | null) => {
  return useQuery({
    queryKey: ["inquiry-assignable-admins", communityId ?? "all"],
    queryFn: async () => {
      const scopedCommunityId = communityId ?? undefined;
      let query = supabase
        .from("profiles")
        .select("id,user_id,full_name,email,phone,role,community_id")
        .in("role", ["superadmin", "admin", "agency_manager", "facility_manager"])
        .order("full_name", { ascending: true });

      if (scopedCommunityId) {
        query = query.or(`community_id.eq.${scopedCommunityId},role.eq.superadmin`);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data ?? []) as InquiryProfileSummary[];
    },
  });
};

export const useUpdateInquiry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ inquiryId, updates }: { inquiryId: string; updates: InquiryUpdate }) => {
      const nowIso = new Date().toISOString();
      const payload: InquiryUpdate = {
        ...updates,
        updated_at: nowIso,
      };

      if (typeof updates.admin_response === "string" && updates.admin_response.trim().length > 0) {
        payload.responded_at = updates.responded_at ?? nowIso;
      }

      if (updates.status === "resolved") {
        payload.resolved_at = updates.resolved_at ?? nowIso;
      }

      const { data, error } = await supabase
        .from("inquiries")
        .update(payload)
        .eq("id", inquiryId)
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      const [enriched] = await enrichInquiries([data as InquiryRow]);
      return enriched;
    },
    onSuccess: (_updated, variables) => {
      queryClient.invalidateQueries({ queryKey: ["inquiries"] });
      queryClient.invalidateQueries({ queryKey: ["inquiry", variables.inquiryId] });
    },
  });
};
