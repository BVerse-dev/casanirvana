"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAdminApi } from "./useAdminApi";
import type { Database } from "../lib/database.types";

export type ServiceRequestCounts = {
  cancelled: number;
  completed: number;
  completedRevenue: number;
  inProgress: number;
  pending: number;
  total: number;
};

export type Service = Database["public"]["Tables"]["services"]["Row"] & {
  communities?: {
    agency_id?: string | null;
    id?: string | null;
    name?: string | null;
  } | null;
  communityName?: string | null;
  is_active?: boolean | null;
  name?: string | null;
  request_counts?: ServiceRequestCounts;
  service_name?: string | null;
  status?: string | null;
};

type ServiceInsert = Database["public"]["Tables"]["services"]["Insert"] & {
  features?: Record<string, unknown> | null;
};

type ServiceUpdate = Database["public"]["Tables"]["services"]["Update"] & {
  features?: Record<string, unknown> | null;
};

type ServiceListPayload = {
  data: Service[];
};

type ServiceRecordPayload = {
  data: Service;
};

const SERVICE_FEATURE_LABELS: Record<string, string> = {
  "24_7": "24/7 Available",
  booking_required: "Booking Required",
  emergency: "Emergency Service",
  is_24_7_available: "24/7 Available",
  is_booking_required: "Booking Required",
  is_emergency_service: "Emergency Service",
  is_premium_service: "Premium Service",
};

const buildServiceListQuery = (communityId?: string) => {
  const params = new URLSearchParams();
  if (communityId) {
    params.set("community_id", communityId);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
};

const listQueryKey = (communityId?: string) => ["admin-services", communityId || "all"] as const;
const detailQueryKey = (id: string | number) => ["admin-services", "detail", String(id)] as const;

const formatKeyLabel = (value: string) =>
  value
    .split("_")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");

export const getServiceDisplayName = (service?: Partial<Service> | null) => {
  return service?.name || service?.service_name || "Unnamed Service";
};

export const getServiceStatus = (service?: Partial<Service> | null) => {
  if (!service) return "inactive";
  if (typeof service.is_active === "boolean") {
    return service.is_active ? "active" : "inactive";
  }

  const normalized = String(service.status || "").trim().toLowerCase();
  if (["active", "enabled", "published"].includes(normalized)) {
    return "active";
  }
  if (["inactive", "disabled", "draft", "archived"].includes(normalized)) {
    return "inactive";
  }

  return "active";
};

export const isServiceActive = (service?: Partial<Service> | null) => getServiceStatus(service) === "active";

export const getServiceFeatureLabels = (service?: Partial<Service> | null) => {
  const rawFeatures = service?.features;

  if (Array.isArray(rawFeatures)) {
    return rawFeatures
      .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
      .filter(Boolean);
  }

  if (!rawFeatures || typeof rawFeatures !== "object") {
    return [];
  }

  return Object.entries(rawFeatures as Record<string, unknown>)
    .filter(([, value]) => value === true || value === "true" || value === 1)
    .map(([key]) => SERVICE_FEATURE_LABELS[key] || formatKeyLabel(key));
};

export const useServicesRealtime = () => {};

export const useListServices = (communityId?: string) => {
  const { fetchAdmin, hasToken } = useAdminApi();

  useServicesRealtime();

  return useQuery({
    queryKey: listQueryKey(communityId),
    enabled: hasToken,
    queryFn: async (): Promise<Service[]> => {
      const payload = await fetchAdmin<ServiceListPayload>(
        `/admin/services${buildServiceListQuery(communityId)}`
      );
      return payload.data || [];
    },
  });
};

export const useGetService = (id: string | number) => {
  const { fetchAdmin, hasToken } = useAdminApi();

  useServicesRealtime();

  return useQuery({
    queryKey: detailQueryKey(id),
    enabled: hasToken && Boolean(id),
    queryFn: async (): Promise<Service | null> => {
      const payload = await fetchAdmin<ServiceRecordPayload>(`/admin/services/${id}`);
      return payload.data || null;
    },
  });
};

export const useCreateService = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async (newService: ServiceInsert) => {
      const payload = await fetchAdmin<ServiceRecordPayload>("/admin/services", {
        method: "POST",
        body: JSON.stringify(newService),
      });
      return payload.data;
    },
    onSuccess: (service) => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      queryClient.setQueryData(detailQueryKey(service.id), service);
    },
  });
};

export const useUpdateService = (id: string | number) => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async (updates: ServiceUpdate) => {
      const payload = await fetchAdmin<ServiceRecordPayload>(`/admin/services/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
      return payload.data;
    },
    onSuccess: (service) => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      queryClient.setQueryData(detailQueryKey(id), service);
    },
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async (id: string | number) => {
      await fetchAdmin(`/admin/services/${id}`, { method: "DELETE" });
      return String(id);
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      queryClient.removeQueries({ queryKey: detailQueryKey(id) });
    },
  });
};
