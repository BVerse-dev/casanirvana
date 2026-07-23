"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAdminApi } from "./useAdminApi";

export type JoinRequestStatus = "pending" | "approved" | "rejected" | "pending_manual_review";

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
  review_notes?: string | null;
};

export type JoinRequestsPayload = {
  data: JoinRequest[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type JoinRequestListOptions = {
  status?: JoinRequestStatus;
  search?: string;
  page?: number;
  pageSize?: number;
};

const buildJoinRequestsQuery = ({ status, search, page, pageSize }: JoinRequestListOptions) => {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (search?.trim()) params.set("search", search.trim());
  if (page) params.set("page", String(page));
  if (pageSize) params.set("limit", String(pageSize));
  const query = params.toString();
  return query ? `?${query}` : "";
};

const normalizePayload = (response: JoinRequestsPayload | { data: JoinRequestsPayload }) =>
  "data" in response && Array.isArray(response.data) ? response as JoinRequestsPayload : (response as { data: JoinRequestsPayload }).data;

export const useListJoinRequests = (options: JoinRequestListOptions = {}) => {
  const { page = 1, pageSize = 20, status, search } = options;
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: ["join-requests", { page, pageSize, status, search }],
    queryFn: async () => normalizePayload(await fetchAdmin<JoinRequestsPayload | { data: JoinRequestsPayload }>(
      `/admin/join-requests${buildJoinRequestsQuery({ page, pageSize, status, search })}`
    )),
    enabled: hasToken,
    staleTime: 60 * 1000,
  });
};

export const useGetJoinRequest = (id: string) => {
  const query = useListJoinRequests({ pageSize: 200 });
  return { ...query, data: query.data?.data.find((request) => request.id === id) };
};

export const useUpdateJoinRequest = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateJoinRequestData) =>
      fetchAdmin(`/admin/join-requests/${id}`, { method: "PATCH", body: JSON.stringify(updateData) }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["join-requests"] });
      queryClient.invalidateQueries({ queryKey: ["join-request", variables.id] });
    },
  });
};

export const useJoinRequestsByStatus = (status: JoinRequestStatus) => {
  const query = useListJoinRequests({ status, pageSize: 200 });
  return { ...query, data: query.data?.data || [] };
};

export const usePendingJoinRequestsCount = () => {
  const { fetchAdmin, hasToken } = useAdminApi();
  return useQuery({
    queryKey: ["join-requests", "pending-count"],
    queryFn: async () => normalizePayload(await fetchAdmin<JoinRequestsPayload | { data: JoinRequestsPayload }>(
      `/admin/join-requests${buildJoinRequestsQuery({ status: "pending", pageSize: 1 })}`
    )).count,
    enabled: hasToken,
    staleTime: 60 * 1000,
    refetchInterval: 30 * 1000,
  });
};
