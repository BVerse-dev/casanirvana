"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAdminApi } from "@/hooks/useAdminApi";
import type { Database } from "@/lib/database.types";

type VisitorPassInsert = Database["public"]["Tables"]["visitor_passes"]["Insert"];

type VisitorPassUpdate = {
  status?: "approved" | "denied" | "checked_in" | "checked_out";
  guard_notes?: string | null;
};

export type VisitorPassRecord = Database["public"]["Tables"]["visitor_passes"]["Row"] & {
  unit_label?: string;
  community_name?: string | null;
  agency_id?: string | null;
  agency_name?: string | null;
  visitor_profile?: {
    avatar_url?: string | null;
    full_name?: string | null;
  };
  host_profile?: {
    full_name?: string | null;
  };
  created_by_display?: string;
  approved_by_display?: string;
  checked_in_by_display?: string;
  checked_out_by_display?: string;
  created_by_profile?: {
    first_name?: string | null;
    last_name?: string | null;
    full_name?: string | null;
    email?: string | null;
    phone?: string | null;
    avatar_url?: string | null;
  };
  approved_by_profile?: {
    first_name?: string | null;
    last_name?: string | null;
    full_name?: string | null;
    email?: string | null;
    phone?: string | null;
    avatar_url?: string | null;
  };
  checked_in_by_profile?: {
    first_name?: string | null;
    last_name?: string | null;
    full_name?: string | null;
    email?: string | null;
    phone?: string | null;
    avatar_url?: string | null;
  };
  checked_out_by_profile?: {
    first_name?: string | null;
    last_name?: string | null;
    full_name?: string | null;
    email?: string | null;
    phone?: string | null;
    avatar_url?: string | null;
  };
};

const buildListQuery = (unitId?: string, status?: string) => {
  const params = new URLSearchParams();
  if (unitId) params.set("unit_id", unitId);
  if (status) params.set("status", status);
  const query = params.toString();
  return query ? `?${query}` : "";
};

const listQueryKey = (unitId?: string, status?: string) => ["admin-visitor-passes", unitId || "", status || ""] as const;
const detailQueryKey = (id: string) => ["admin-visitor-passes", "detail", id] as const;

export const useListVisitorPasses = (unitId?: string, status?: string) => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: listQueryKey(unitId, status),
    enabled: hasToken,
    queryFn: async () => {
      const payload = await fetchAdmin<{ data: VisitorPassRecord[] }>(
        `/admin/visitor-passes${buildListQuery(unitId, status)}`
      );
      return payload.data || [];
    },
  });
};

export const useGetVisitorPass = (id: string) => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: detailQueryKey(id),
    enabled: hasToken && !!id,
    queryFn: async () => {
      const payload = await fetchAdmin<{ data: VisitorPassRecord }>(`/admin/visitor-passes/${id}`);
      return payload.data;
    },
  });
};

export const useCreateVisitorPass = () => {
  const { fetchAdmin } = useAdminApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: VisitorPassInsert) => {
      const response = await fetchAdmin<{ data: VisitorPassRecord }>(`/admin/visitor-passes`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-visitor-passes"] });
    },
  });
};

export const useUpdateVisitorPass = (id: string) => {
  const { fetchAdmin } = useAdminApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: VisitorPassUpdate) => {
      const response = await fetchAdmin<{ data: VisitorPassRecord }>(`/admin/visitor-passes/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-visitor-passes"] });
      queryClient.invalidateQueries({ queryKey: detailQueryKey(id) });
    },
  });
};

export const useDeleteVisitorPass = () => {
  const { fetchAdmin } = useAdminApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await fetchAdmin(`/admin/visitor-passes/${id}`, { method: "DELETE" });
      return id;
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["admin-visitor-passes"] });
      queryClient.removeQueries({ queryKey: detailQueryKey(deletedId) });
    },
  });
};

export const useVisitorPassLifecycleActions = (id: string) => {
  const updateVisitorPass = useUpdateVisitorPass(id);
  const deleteVisitorPass = useDeleteVisitorPass();

  return {
    approve: () => updateVisitorPass.mutateAsync({ status: "approved" }),
    deny: () => updateVisitorPass.mutateAsync({ status: "denied" }),
    checkIn: () => updateVisitorPass.mutateAsync({ status: "checked_in" }),
    checkOut: () => updateVisitorPass.mutateAsync({ status: "checked_out" }),
    remove: () => deleteVisitorPass.mutateAsync(id),
    isUpdating: updateVisitorPass.isPending,
    isDeleting: deleteVisitorPass.isPending,
    isPending: updateVisitorPass.isPending || deleteVisitorPass.isPending,
  };
};
