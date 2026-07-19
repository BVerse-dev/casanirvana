"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAdminApi } from "./useAdminApi";

export type JoinRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "pending_manual_review";

export type JoinRequest = {
  id: string;
  user_id: string;
  community_id?: string | null;
  unit_id?: string | null;
  comments?: string | null;
  status: JoinRequestStatus;
  created_at: string;
  updated_at?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  review_notes?: string | null;
  community_name?: string | null;
  manual_unit_info?: string | null;
  is_manual_entry: boolean;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  reviewer_name?: string | null;
  unit_number?: string | null;
  unit_block?: string | null;
};

export type UpdateJoinRequestData = {
  id: string;
  status?: JoinRequestStatus;
  review_notes?: string;
};

type JoinRequestsPayload = {
  data: JoinRequest[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const buildJoinRequestsQuery = ({
  status,
  search,
  page,
  limit,
}: {
  status?: JoinRequestStatus;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const params = new URLSearchParams();

  if (status) params.set("status", status);
  if (search?.trim()) params.set("search", search.trim());
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));

  const query = params.toString();
  return query ? `?${query}` : "";
};

export const useListJoinRequests = () => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: ["join-requests"],
    queryFn: async () => {
      const response = await fetchAdmin<{ data: JoinRequestsPayload }>("/admin/join-requests?limit=1000");
      return response.data.data;
    },
    enabled: hasToken,
    staleTime: 5 * 60 * 1000,
  });
};

export const useGetJoinRequest = (id: string) => {
  const { data: joinRequests = [], ...query } = useListJoinRequests();

  return {
    ...query,
    data: joinRequests.find((request) => request.id === id),
  };
};

export const useUpdateJoinRequest = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateJoinRequestData) =>
      fetchAdmin(`/admin/join-requests/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updateData),
      }),
    onSuccess: (data: any, variables) => {
      queryClient.invalidateQueries({ queryKey: ["join-requests"] });
      queryClient.invalidateQueries({ queryKey: ["join-request", variables.id] });
    },
  });
};

export const useJoinRequestsByStatus = (status: JoinRequestStatus) => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: ["join-requests", "status", status],
    queryFn: async () => {
      const response = await fetchAdmin<{ data: JoinRequestsPayload }>(
        `/admin/join-requests${buildJoinRequestsQuery({ status, limit: 1000 })}`
      );

      return response.data.data;
    },
    enabled: hasToken,
    staleTime: 5 * 60 * 1000,
  });
};

export const usePendingJoinRequestsCount = () => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: ["join-requests", "pending-count"],
    queryFn: async () => {
      const response = await fetchAdmin<{ data: JoinRequestsPayload }>(
        `/admin/join-requests${buildJoinRequestsQuery({ status: "pending", limit: 1 })}`
      );

      return response.data.count || 0;
    },
    enabled: hasToken,
    staleTime: 60 * 1000,
    refetchInterval: 30 * 1000,
  });
};
