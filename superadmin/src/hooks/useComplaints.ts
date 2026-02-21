"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Database } from "../lib/database.types";

type Complaint = Database["public"]["Tables"]["complaints"]["Row"];
type ComplaintInsert = Database["public"]["Tables"]["complaints"]["Insert"];
type ComplaintUpdate = Database["public"]["Tables"]["complaints"]["Update"];
type ComplaintComment = Database["public"]["Tables"]["complaint_comments"]["Row"];

type ProfileSummary = {
  id: string;
  user_id: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name?: string | null;
  email: string | null;
  avatar_url: string | null;
  role?: string | null;
  community_id?: string | null;
};

type CommunitySummary = {
  id: string;
  name: string | null;
  agency_id: string | null;
};

type UnitSummary = {
  id: string;
  block: string | null;
  number: string;
  unit_number: string | null;
  community_id: string | null;
  community?: CommunitySummary | null;
  communities?: CommunitySummary | null;
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const COMPLAINT_SELECT = `
  *,
  raised_by_profile:profiles!fkey_complaints_raised_by (
    id,
    user_id,
    first_name,
    last_name,
    full_name,
    email,
    avatar_url,
    role,
    community_id
  ),
  created_by_profile:profiles!fk_complaints_created_by_profile (
    id,
    user_id,
    first_name,
    last_name,
    full_name,
    email,
    avatar_url,
    role,
    community_id
  ),
  resolved_by_profile:profiles!fk_complaints_resolved_by_profile (
    id,
    user_id,
    first_name,
    last_name,
    full_name,
    email,
    avatar_url,
    role,
    community_id
  ),
  unit:units!complaints_unit_id_fkey (
    id,
    block,
    number,
    unit_number,
    community_id,
    community:communities!units_community_id_fkey (
      id,
      name,
      agency_id
    )
  )
`;

const useAdminFetch = () => {
  const { data: session } = useSession();
  const token = session?.accessToken as string | undefined;

  const fetchAdmin = async (path: string, options: RequestInit = {}) => {
    if (!token) {
      throw new Error("Missing admin session. Please sign in again.");
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || payload.message || "Request failed");
    }
    return payload;
  };

  return { fetchAdmin };
};

const buildProfileName = (profile: ProfileSummary | null) => {
  if (!profile) return "Unknown";
  const full = `${profile.first_name || ""} ${profile.last_name || ""}`.trim();
  if (full) return full;
  if (profile.full_name) return profile.full_name;
  return "Unknown";
};

const buildProfileLookup = async (complaints: any[]) => {
  const profileIds = new Set<string>();
  const userIds = new Set<string>();

  complaints.forEach((complaint) => {
    if (!complaint.raised_by_profile && complaint.raised_by) {
      profileIds.add(complaint.raised_by);
    }
    if (!complaint.created_by_profile && complaint.created_by_profile_id) {
      profileIds.add(complaint.created_by_profile_id);
    }
    if (!complaint.created_by_profile && complaint.created_by) {
      userIds.add(complaint.created_by);
    }
    if (!complaint.resolved_by_profile && complaint.resolved_by_profile_id) {
      profileIds.add(complaint.resolved_by_profile_id);
    }
  });

  const profileById = new Map<string, ProfileSummary>();
  const profileByUserId = new Map<string, ProfileSummary>();

  if (profileIds.size > 0) {
    const { data } = await supabase
      .from("profiles")
      .select("id,user_id,first_name,last_name,full_name,email,avatar_url,role,community_id")
      .in("id", Array.from(profileIds));

    (data || []).forEach((profile) => {
      const typedProfile = profile as ProfileSummary;
      profileById.set(typedProfile.id, typedProfile);
      if (typedProfile.user_id) {
        profileByUserId.set(typedProfile.user_id, typedProfile);
      }
    });
  }

  if (userIds.size > 0) {
    const { data } = await supabase
      .from("profiles")
      .select("id,user_id,first_name,last_name,full_name,email,avatar_url,role,community_id")
      .in("user_id", Array.from(userIds));

    (data || []).forEach((profile) => {
      const typedProfile = profile as ProfileSummary;
      profileById.set(typedProfile.id, typedProfile);
      if (typedProfile.user_id) {
        profileByUserId.set(typedProfile.user_id, typedProfile);
      }
    });
  }

  return { profileById, profileByUserId };
};

// Normalize complaint records so UI can safely render reporter/unit/community fields.
const mapComplaint = (
  complaint: any,
  lookups?: {
    profileById: Map<string, ProfileSummary>;
    profileByUserId: Map<string, ProfileSummary>;
  },
): ComplaintWithContext => {
  const emptyLookups = {
    profileById: new Map<string, ProfileSummary>(),
    profileByUserId: new Map<string, ProfileSummary>(),
  };
  const activeLookups = lookups || emptyLookups;

  const raisedByProfile =
    (complaint.raised_by_profile as ProfileSummary | null) ||
    (complaint.raised_by ? activeLookups.profileById.get(complaint.raised_by) || null : null);
  const createdByProfile =
    (complaint.created_by_profile as ProfileSummary | null) ||
    (complaint.created_by_profile_id
      ? activeLookups.profileById.get(complaint.created_by_profile_id) || null
      : null) ||
    (complaint.created_by
      ? activeLookups.profileByUserId.get(complaint.created_by) || null
      : null);
  const resolvedByProfile =
    (complaint.resolved_by_profile as ProfileSummary | null) ||
    (complaint.resolved_by_profile_id
      ? activeLookups.profileById.get(complaint.resolved_by_profile_id) || null
      : null);

  const reporterProfile = raisedByProfile || createdByProfile || null;
  const unit = (complaint.unit || complaint.units || null) as UnitSummary | null;
  const community = (unit?.community || unit?.communities || null) as CommunitySummary | null;

  return {
    ...(complaint as Complaint),
    status: complaint.status || "pending",
    priority: complaint.priority || "medium",
    title: complaint.title || complaint.subject || "Untitled Complaint",
    description: complaint.description || complaint.details || "",
    subject: complaint.subject || complaint.title || "Untitled Complaint",
    details: complaint.details || complaint.description || "",
    reporter_profile: reporterProfile,
    raised_by_profile: raisedByProfile,
    created_by_profile: createdByProfile,
    resolved_by_profile: resolvedByProfile,
    unit,
    units: unit ? { ...unit, communities: community } : null,
    community,
    reporter_name: buildProfileName(reporterProfile),
    reporter_email: reporterProfile?.email || null,
  };
};

// Real-time subscription hook for complaints (singleton pattern)
let complaintsChannel: any = null;
let subscriberCount = 0;

export const useComplaintsRealTime = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    subscriberCount++;

    if (!complaintsChannel) {
      complaintsChannel = supabase
        .channel("public:complaints")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "complaints",
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ["complaints"] });
          },
        )
        .subscribe();
    }

    return () => {
      subscriberCount--;
      if (subscriberCount === 0 && complaintsChannel) {
        supabase.removeChannel(complaintsChannel);
        complaintsChannel = null;
      }
    };
  }, [queryClient]);
};

export const useListComplaints = (unitId?: string, status?: string) => {
  useComplaintsRealTime();

  return useQuery({
    queryKey: ["complaints", unitId, status],
    queryFn: async (): Promise<ComplaintWithContext[]> => {
      let query = supabase.from("complaints").select(COMPLAINT_SELECT).order("created_at", {
        ascending: false,
      });

      if (unitId) {
        query = query.eq("unit_id", unitId);
      }

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Failed to fetch complaints:", error);
        throw error;
      }

      const rows = (data || []) as any[];
      const lookups = await buildProfileLookup(rows);
      return rows.map((row) => mapComplaint(row, lookups));
    },
  });
};

export const useGetComplaint = (id: string) => {
  useComplaintsRealTime();

  return useQuery({
    queryKey: ["complaints", id],
    queryFn: async (): Promise<ComplaintWithContext> => {
      const { data, error } = await supabase
        .from("complaints")
        .select(COMPLAINT_SELECT)
        .eq("id", id)
        .single();

      if (error) {
        console.error("Failed to fetch complaint:", error);
        throw error;
      }

      const lookups = await buildProfileLookup([data]);
      return mapComplaint(data, lookups);
    },
    enabled: !!id,
  });
};

export const useCreateComplaint = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async (newComplaint: ComplaintInsert) => {
      const complaintData = {
        ...newComplaint,
        subject: newComplaint.subject || newComplaint.title || "",
        details: newComplaint.details || newComplaint.description || "",
        title: newComplaint.title || newComplaint.subject,
        description: newComplaint.description || newComplaint.details,
      };

      const created = await fetchAdmin("/admin/complaints", {
        method: "POST",
        body: JSON.stringify(complaintData),
      });
      return mapComplaint(created);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
    },
  });
};

type ComplaintUpdatePayload =
  | ComplaintUpdate
  | {
      id: string;
      data: ComplaintUpdate;
    };

const resolveUpdatePayload = (fixedId: string | undefined, payload: ComplaintUpdatePayload) => {
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
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async (payload: ComplaintUpdatePayload) => {
      const { id, updates } = resolveUpdatePayload(fixedId, payload);

      const updateData = { ...updates };
      if (updates.title && !updates.subject) {
        updateData.subject = updates.title;
      }
      if (updates.description && !updates.details) {
        updateData.details = updates.description;
      }

      const updated = await fetchAdmin(`/admin/complaints/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updateData),
      });

      return {
        complaint: mapComplaint(updated),
        complaintId: id,
      };
    },
    onSuccess: ({ complaintId }) => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      queryClient.invalidateQueries({ queryKey: ["complaints", complaintId] });
    },
  });
};

export const useDeleteComplaint = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async (id: string) => {
      await fetchAdmin(`/admin/complaints/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
    },
  });
};

export const useListComplaintComments = (complaintId?: string) => {
  return useQuery({
    queryKey: ["complaint-comments", complaintId],
    queryFn: async (): Promise<ComplaintCommentWithProfile[]> => {
      if (!complaintId) return [];

      const { data, error } = await supabase.rpc("get_complaint_comments_with_profiles", {
        complaint_uuid: complaintId,
      });

      if (error) {
        console.error("Failed to fetch complaint comments via rpc:", error);
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("complaint_comments")
          .select("*")
          .eq("complaint_id", complaintId)
          .order("created_at", { ascending: true });

        if (fallbackError) {
          throw fallbackError;
        }

        return ((fallbackData || []) as ComplaintComment[]).map((comment) => ({
          ...comment,
          created_by_profile: null,
        }));
      }

      return (data || []) as ComplaintCommentWithProfile[];
    },
    enabled: !!complaintId,
  });
};

export const useCreateComplaintComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      complaintId,
      comment,
    }: {
      complaintId: string;
      comment: string;
    }) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error("Unable to identify authenticated user for comment posting.");
      }

      const { data, error } = await supabase
        .from("complaint_comments")
        .insert({
          complaint_id: complaintId,
          comment: comment.trim(),
          created_by: userData.user.id,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as ComplaintComment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["complaint-comments", data.complaint_id] });
      queryClient.invalidateQueries({ queryKey: ["complaints", data.complaint_id] });
    },
  });
};

export const useComplaintMetrics = () => {
  return useQuery({
    queryKey: ["complaints", "metrics"],
    queryFn: async () => {
      const { data: complaints, error } = await supabase
        .from("complaints")
        .select("status, priority, category, created_at");

      if (error) {
        console.error("Error fetching complaint metrics:", error);
        throw error;
      }

      const total = complaints.length;
      const pending = complaints.filter((c) => c.status === "pending").length;
      const inProgress = complaints.filter((c) => c.status === "in_progress").length;
      const resolved = complaints.filter((c) => c.status === "resolved").length;
      const high = complaints.filter((c) => c.priority === "high").length;
      const medium = complaints.filter((c) => c.priority === "medium").length;
      const low = complaints.filter((c) => c.priority === "low").length;

      const categories = complaints.reduce((acc: Record<string, number>, complaint) => {
        const category = complaint.category || "Other";
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentComplaints = complaints.filter((c) => new Date(c.created_at || "") > sevenDaysAgo).length;

      return {
        total,
        pending,
        inProgress,
        resolved,
        high,
        medium,
        low,
        categories,
        recentComplaints,
        resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
      };
    },
  });
};
