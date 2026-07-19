"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAdminApi } from "@/hooks/useAdminApi";
import type { Database } from "@/lib/database.types";

type InquiryRow = Database["public"]["Tables"]["inquiries"]["Row"];

type InquiryUpdate = {
  status?: "open" | "in_progress" | "resolved" | "closed";
  assigned_to?: string | null;
  admin_response?: string | null;
  resolution_notes?: string | null;
};

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

type InquiryListPayload = {
  data: InquiryRecord[];
};

type InquiryRecordPayload = {
  data: InquiryRecord | null;
};

type InquiryAssignableAdminsPayload = {
  data: InquiryProfileSummary[];
};

const buildListQuery = (filters?: InquiriesFilters) => {
  const params = new URLSearchParams();

  if (filters?.status) {
    params.set("status", filters.status);
  }

  if (filters?.inquiryType) {
    params.set("inquiry_type", filters.inquiryType);
  }

  if (filters?.priority) {
    params.set("priority", filters.priority);
  }

  if (filters?.communityId) {
    params.set("community_id", filters.communityId);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
};

const buildAssignableAdminsQuery = (communityId?: string | null) => {
  if (!communityId) return "";

  const params = new URLSearchParams();
  params.set("community_id", communityId);
  return `?${params.toString()}`;
};

const listQueryKey = (filters?: InquiriesFilters) =>
  ["admin-inquiries", filters?.status || "", filters?.inquiryType || "", filters?.priority || "", filters?.communityId || ""] as const;
const detailQueryKey = (inquiryId?: string) => ["admin-inquiries", "detail", inquiryId || ""] as const;
const assignableAdminsQueryKey = (communityId?: string | null) =>
  ["admin-inquiries", "assignable-admins", communityId || "all"] as const;

export const useInquiriesRealTime = () => {};

export const useListInquiries = (filters?: InquiriesFilters) => {
  const { fetchAdmin, hasToken } = useAdminApi();

  useInquiriesRealTime();

  return useQuery({
    queryKey: listQueryKey(filters),
    enabled: hasToken,
    queryFn: async () => {
      const payload = await fetchAdmin<InquiryListPayload>(
        `/admin/inquiries${buildListQuery(filters)}`
      );
      return payload.data || [];
    },
  });
};

export const useGetInquiry = (inquiryId?: string) => {
  const { fetchAdmin, hasToken } = useAdminApi();

  useInquiriesRealTime();

  return useQuery({
    queryKey: detailQueryKey(inquiryId),
    enabled: hasToken && Boolean(inquiryId),
    queryFn: async () => {
      if (!inquiryId) {
        return null;
      }

      const payload = await fetchAdmin<InquiryRecordPayload>(`/admin/inquiries/${inquiryId}`);
      return payload.data;
    },
  });
};

export const useListAssignableInquiryAdmins = (communityId?: string | null) => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: assignableAdminsQueryKey(communityId),
    enabled: hasToken,
    queryFn: async () => {
      const payload = await fetchAdmin<InquiryAssignableAdminsPayload>(
        `/admin/inquiries/assignable-admins${buildAssignableAdminsQuery(communityId)}`
      );
      return payload.data || [];
    },
  });
};

export const useUpdateInquiry = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async ({ inquiryId, updates }: { inquiryId: string; updates: InquiryUpdate }) => {
      const payload = await fetchAdmin<{ data: InquiryRecord }>(`/admin/inquiries/${inquiryId}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });

      return payload.data;
    },
    onSuccess: (updated, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-inquiries"] });
      queryClient.invalidateQueries({ queryKey: detailQueryKey(variables.inquiryId) });
      queryClient.invalidateQueries({ queryKey: assignableAdminsQueryKey(updated.community_id) });
    },
  });
};
