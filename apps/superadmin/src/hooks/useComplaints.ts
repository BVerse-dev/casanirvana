"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAdminApi } from "@/hooks/useAdminApi";
import type { Database } from "@/lib/database.types";

type Complaint = Database["public"]["Tables"]["complaints"]["Row"];
type ComplaintInsert = Database["public"]["Tables"]["complaints"]["Insert"];

type ComplaintUpdate = {
  status?: "pending" | "in_progress" | "resolved";
  priority?: "low" | "medium" | "high";
  category?: string | null;
  subject?: string | null;
  details?: string | null;
  title?: string | null;
  description?: string | null;
  assigned_to?: string | null;
  resolution?: string | null;
  resolution_notes?: string | null;
};

export type ProfileSummary = {
  id: string;
  user_id?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  role?: string | null;
  community_id?: string | null;
};

export type CommunitySummary = {
  id: string;
  name?: string | null;
  agency_id?: string | null;
};

export type UnitSummary = {
  id: string;
  block?: string | null;
  number?: string | null;
  unit_number?: string | null;
  community_id?: string | null;
};

export type ComplaintWithContext = Complaint & {
  title: string;
  description: string;
  subject: string;
  details: string;
  reporter_profile: ProfileSummary | null;
  raised_by_profile: ProfileSummary | null;
  created_by_profile: ProfileSummary | null;
  resolved_by_profile: ProfileSummary | null;
  unit: UnitSummary | null;
  units: (UnitSummary & { communities: CommunitySummary | null }) | null;
  community: CommunitySummary | null;
  reporter_name: string;
  reporter_email: string | null;
  unit_label?: string;
};

export type ComplaintCommentWithProfile = {
  id: string;
  complaint_id: string | null;
  comment: string;
  created_by: string | null;
  created_at: string | null;
  created_by_profile: {
    id: string | null;
    first_name: string | null;
    last_name: string | null;
    full_name?: string | null;
    avatar_url: string | null;
    email: string | null;
    role?: string | null;
    unit_id?: string | null;
    units?: {
      id: string | null;
      block: string | null;
      number: string | null;
      unit_number: string | null;
    } | null;
  } | null;
};

export type ComplaintMetrics = {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  high: number;
  medium: number;
  low: number;
  categories: Record<string, number>;
  recentComplaints: number;
  resolutionRate: number;
};

type ComplaintRecordPayload = {
  data: ComplaintWithContext;
};

type ComplaintListPayload = {
  data: ComplaintWithContext[];
};

type ComplaintCommentListPayload = {
  data: ComplaintCommentWithProfile[];
};

type ComplaintMetricsPayload = {
  data: ComplaintMetrics;
};

const buildListQuery = (unitId?: string, status?: string) => {
  const params = new URLSearchParams();
  if (unitId) params.set("unit_id", unitId);
  if (status) params.set("status", status);
  const query = params.toString();
  return query ? `?${query}` : "";
};

const listQueryKey = (unitId?: string, status?: string) =>
  ["admin-complaints", unitId || "", status || ""] as const;
const detailQueryKey = (id: string) => ["admin-complaints", "detail", id] as const;
const commentsQueryKey = (complaintId?: string) =>
  ["admin-complaints", "comments", complaintId || ""] as const;

export const useComplaintsRealTime = () => {};

export const useListComplaints = (unitId?: string, status?: string) => {
  const { fetchAdmin, hasToken } = useAdminApi();

  useComplaintsRealTime();

  return useQuery({
    queryKey: listQueryKey(unitId, status),
    enabled: hasToken,
    queryFn: async (): Promise<ComplaintWithContext[]> => {
      const payload = await fetchAdmin<ComplaintListPayload>(
        `/admin/complaints${buildListQuery(unitId, status)}`
      );
      return payload.data || [];
    },
  });
};

export const useGetComplaint = (id: string) => {
  const { fetchAdmin, hasToken } = useAdminApi();

  useComplaintsRealTime();

  return useQuery({
    queryKey: detailQueryKey(id),
    enabled: hasToken && !!id,
    queryFn: async (): Promise<ComplaintWithContext> => {
      const payload = await fetchAdmin<ComplaintRecordPayload>(`/admin/complaints/${id}`);
      return payload.data;
    },
  });
};

export const useCreateComplaint = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async (newComplaint: ComplaintInsert) => {
      const complaintData = {
        ...newComplaint,
        subject: newComplaint.subject || newComplaint.title || "",
        details: newComplaint.details || newComplaint.description || "",
        title: newComplaint.title || newComplaint.subject,
        description: newComplaint.description || newComplaint.details,
      };

      const response = await fetchAdmin<ComplaintRecordPayload>("/admin/complaints", {
        method: "POST",
        body: JSON.stringify(complaintData),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-complaints"] });
    },
  });
};

type ComplaintUpdateMutationPayload =
  | ComplaintUpdate
  | {
      id: string;
      data: ComplaintUpdate;
    };

const resolveUpdatePayload = (fixedId: string | undefined, payload: ComplaintUpdateMutationPayload) => {
  if (fixedId) {
    const updates =
      typeof payload === "object" && payload !== null && "data" in payload
        ? payload.data
        : (payload as ComplaintUpdate);
    return { id: fixedId, updates };
  }

  if (
    typeof payload === "object" &&
    payload !== null &&
    "id" in payload &&
    "data" in payload &&
    payload.id
  ) {
    return { id: payload.id, updates: payload.data };
  }

  throw new Error("Complaint id is required for update mutation.");
};

export const useUpdateComplaint = (fixedId?: string) => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async (payload: ComplaintUpdateMutationPayload) => {
      const { id, updates } = resolveUpdatePayload(fixedId, payload);

      const updateData = { ...updates };
      if (updates.title && !updates.subject) {
        updateData.subject = updates.title;
      }
      if (updates.description && !updates.details) {
        updateData.details = updates.description;
      }

      const response = await fetchAdmin<ComplaintRecordPayload>(`/admin/complaints/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updateData),
      });

      return {
        complaint: response.data,
        complaintId: id,
      };
    },
    onSuccess: ({ complaintId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-complaints"] });
      queryClient.invalidateQueries({ queryKey: detailQueryKey(complaintId) });
      queryClient.invalidateQueries({ queryKey: ["admin-complaints", "metrics"] });
    },
  });
};

export const useDeleteComplaint = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async (id: string) => {
      await fetchAdmin(`/admin/complaints/${id}`, { method: "DELETE" });
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["admin-complaints"] });
      queryClient.invalidateQueries({ queryKey: ["admin-complaints", "metrics"] });
      queryClient.removeQueries({ queryKey: detailQueryKey(id) });
      queryClient.removeQueries({ queryKey: commentsQueryKey(id) });
    },
  });
};

export const useListComplaintComments = (complaintId?: string) => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: commentsQueryKey(complaintId),
    enabled: hasToken && !!complaintId,
    queryFn: async (): Promise<ComplaintCommentWithProfile[]> => {
      if (!complaintId) return [];

      const payload = await fetchAdmin<ComplaintCommentListPayload>(
        `/admin/complaints/${complaintId}/comments`
      );
      return payload.data || [];
    },
  });
};

export const useCreateComplaintComment = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async ({
      complaintId,
      comment,
    }: {
      complaintId: string;
      comment: string;
    }) => {
      const payload = await fetchAdmin<{ data: ComplaintCommentWithProfile }>(
        `/admin/complaints/${complaintId}/comments`,
        {
          method: "POST",
          body: JSON.stringify({ comment: comment.trim() }),
        }
      );

      return payload.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: commentsQueryKey(data.complaint_id || undefined) });
      queryClient.invalidateQueries({ queryKey: ["admin-complaints"] });
      if (data.complaint_id) {
        queryClient.invalidateQueries({ queryKey: detailQueryKey(data.complaint_id) });
      }
    },
  });
};

export const useComplaintMetrics = () => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: ["admin-complaints", "metrics"],
    enabled: hasToken,
    queryFn: async () => {
      const payload = await fetchAdmin<ComplaintMetricsPayload>("/admin/complaints/stats");
      return payload.data;
    },
  });
};
