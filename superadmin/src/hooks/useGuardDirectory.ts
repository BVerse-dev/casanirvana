"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAdminApi } from "@/hooks/useAdminApi";

export type GuardCommunity = {
  id: string;
  name: string;
  address?: string | null;
};

type GuardDirectoryApiRecord = {
  id: string;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  display_name?: string | null;
  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
  avatar_url?: string | null;
  is_active?: boolean | null;
  shift_type?: string | null;
  employment_date?: string | null;
  created_at?: string | null;
  status?: string | null;
  community_id?: string | null;
  communities?: GuardCommunity | GuardCommunity[] | null;
  [key: string]: unknown;
};

export type GuardDirectoryItem = {
  id: string;
  full_name: string;
  first_name?: string | null;
  last_name?: string | null;
  display_name?: string | null;
  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
  avatar_url?: string | null;
  is_active?: boolean | null;
  shift_type?: string | null;
  employment_date?: string | null;
  created_at?: string | null;
  status?: string | null;
  community_id?: string | null;
  resolved_community_id?: string | null;
  resolved_community_name?: string | null;
  active_assignment_id?: string | null;
  active_assignment_name?: string | null;
  active_assignment_gate?: string | null;
  active_assignment_shift_type?: string | null;
  assignment_status?: string | null;
  assignment_status_label?: string | null;
  communities?: GuardCommunity | null;
  societies?: GuardCommunity | null;
  [key: string]: unknown;
};

type GuardDirectoryFilters = {
  communityId?: string;
  guardId?: string;
  search?: string;
};

const buildQuery = (filters?: GuardDirectoryFilters) => {
  const params = new URLSearchParams();
  if (filters?.communityId) params.set("community_id", filters.communityId);
  if (filters?.guardId) params.set("guard_id", filters.guardId);
  if (filters?.search) params.set("search", filters.search);
  const query = params.toString();
  return query ? `?${query}` : "";
};

const normalizeCommunity = (
  value: GuardDirectoryApiRecord["communities"]
): GuardCommunity | null => {
  if (Array.isArray(value)) return value[0] || null;
  return value || null;
};

const buildFullName = (guard: GuardDirectoryApiRecord) => {
  if (guard.full_name?.trim()) return guard.full_name.trim();
  const joinedName = [guard.first_name, guard.last_name].filter(Boolean).join(" ").trim();
  if (joinedName) return joinedName;
  if (guard.display_name?.trim()) return guard.display_name.trim();
  return "Unnamed Guard";
};

const mapGuardDirectoryRecord = (guard: GuardDirectoryApiRecord): GuardDirectoryItem => {
  const community = normalizeCommunity(guard.communities);
  const isActive = typeof guard.is_active === "boolean" ? guard.is_active : guard.status === "active";

  return {
    ...(guard as GuardDirectoryItem),
    full_name: buildFullName(guard),
    phone: guard.phone || guard.mobile || null,
    is_active: isActive,
    status: typeof guard.status === "string" ? guard.status : isActive ? "active" : "inactive",
    communities: community,
    societies: community,
  };
};

export const useListGuardsDirectory = (filters?: GuardDirectoryFilters) => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: ["guards-directory", filters || {}],
    enabled: hasToken,
    queryFn: async () => {
      const payload = await fetchAdmin<{ data: GuardDirectoryApiRecord[] }>(
        `/admin/guards/profiles${buildQuery(filters)}`
      );
      return (payload.data || []).map(mapGuardDirectoryRecord);
    },
  });
};

export const useGetGuardDirectory = (guardId: string) => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: ["guards-directory", "detail", guardId],
    enabled: hasToken && !!guardId,
    queryFn: async () => {
      const payload = await fetchAdmin<{ data: GuardDirectoryApiRecord[] }>(
        `/admin/guards/profiles${buildQuery({ guardId })}`
      );
      const guard = (payload.data || [])[0];
      if (!guard) throw new Error("Guard not found");
      return mapGuardDirectoryRecord(guard);
    },
  });
};

export const useDeleteGuardDirectory = () => {
  const { fetchAdmin } = useAdminApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (guardId: string) => {
      await fetchAdmin(`/admin/guards/profiles/${guardId}`, { method: "DELETE" });
      return guardId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guards-directory"] });
    },
  });
};
