"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAdminApi } from "./useAdminApi";
import type { Database } from "../lib/database.types";
import type { Service } from "./useServices";

type ServiceRequest = Database["public"]["Tables"]["service_requests"]["Row"] & {
  assigned_display_name?: string | null;
  payment_status?: string | null;
};

type ServiceRequestUpdate = {
  assigned_to?: string | null;
  notes?: string | null;
  priority?: "low" | "medium" | "high" | "urgent" | null;
  scheduled_date?: string | null;
  status?: "pending" | "in_progress" | "completed" | "cancelled";
  total_amount?: number | null;
};

type Profile = {
  avatar_url?: string | null;
  email?: string | null;
  first_name?: string | null;
  full_name?: string | null;
  id: string;
  last_name?: string | null;
  phone?: string | null;
  role?: string | null;
  user_id?: string | null;
};

type CommunitySummary = {
  address?: string | null;
  agency_id?: string | null;
  id: string;
  name?: string | null;
};

type UnitSummary = Database["public"]["Tables"]["units"]["Row"] & {
  community?: CommunitySummary | null;
};

export type ServiceRequestWithRelations = ServiceRequest & {
  community?: CommunitySummary | null;
  services?: (Service & { id?: string | number | null }) | null;
  units?: UnitSummary | null;
  user_profile?: Profile | null;
  assigned_profile?: Profile | null;
  unit_label?: string | null;
};

type ServiceRequestListPayload = {
  data: ServiceRequestWithRelations[];
};

type ServiceRequestRecordPayload = {
  data: ServiceRequestWithRelations;
};

const buildListQuery = (serviceId?: string, status?: string, userId?: string) => {
  const params = new URLSearchParams();
  if (serviceId) params.set("service_id", serviceId);
  if (status) params.set("status", status);
  if (userId) params.set("user_id", userId);
  const query = params.toString();
  return query ? `?${query}` : "";
};

const listQueryKey = (serviceId?: string, status?: string, userId?: string) =>
  ["admin-service-requests", serviceId || "all", status || "all", userId || "all"] as const;
const detailQueryKey = (id: string) => ["admin-service-requests", "detail", id] as const;

export const formatServiceRequestStatusLabel = (value?: string | null) => {
  const normalized = value || "pending";
  return normalized
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

export const useServiceRequestsRealtime = () => {};

export const useListServiceRequests = (serviceId?: string, status?: string, userId?: string) => {
  const { fetchAdmin, hasToken } = useAdminApi();

  useServiceRequestsRealtime();

  return useQuery({
    queryKey: listQueryKey(serviceId, status, userId),
    enabled: hasToken,
    queryFn: async (): Promise<ServiceRequestWithRelations[]> => {
      const payload = await fetchAdmin<ServiceRequestListPayload>(
        `/admin/service-requests${buildListQuery(serviceId, status, userId)}`
      );
      return payload.data || [];
    },
  });
};

export const useGetServiceRequest = (id: string) => {
  const { fetchAdmin, hasToken } = useAdminApi();

  useServiceRequestsRealtime();

  return useQuery({
    queryKey: detailQueryKey(id),
    enabled: hasToken && Boolean(id),
    queryFn: async (): Promise<ServiceRequestWithRelations | null> => {
      const payload = await fetchAdmin<ServiceRequestRecordPayload>(`/admin/service-requests/${id}`);
      return payload.data || null;
    },
  });
};

type ServiceRequestUpdateMutationPayload =
  | ServiceRequestUpdate
  | {
      id: string;
      data: ServiceRequestUpdate;
    };

const resolveUpdatePayload = (fixedId: string | undefined, payload: ServiceRequestUpdateMutationPayload) => {
  if (fixedId) {
    const updates =
      typeof payload === "object" && payload !== null && "data" in payload
        ? payload.data
        : (payload as ServiceRequestUpdate);
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

  throw new Error("Service request id is required for update mutation.");
};

export const useUpdateServiceRequest = (fixedId?: string) => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async (payload: ServiceRequestUpdateMutationPayload) => {
      const { id, updates } = resolveUpdatePayload(fixedId, payload);
      const response = await fetchAdmin<ServiceRequestRecordPayload>(`/admin/service-requests/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });

      return {
        request: response.data,
        requestId: id,
      };
    },
    onSuccess: ({ requestId, request }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-service-requests"] });
      queryClient.setQueryData(detailQueryKey(requestId), request);
    },
  });
};
