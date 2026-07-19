"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Database } from "../lib/database.types";
import { useAdminApi } from "./useAdminApi";

type Community = Database["public"]["Tables"]["communities"]["Row"];
type CommunityInsert = Database["public"]["Tables"]["communities"]["Insert"];
type CommunityUpdate = Database["public"]["Tables"]["communities"]["Update"];

type CommunityAgency = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
};

export type CommunityRecord = Community & {
  agencies?: CommunityAgency | null;
  unit_count?: number;
  occupied_unit_count?: number;
  vacancy_count?: number;
  occupancy_rate?: number;
  total_area_sqft?: number;
  amenity_names?: string[];
};

type CommunitiesPayload = {
  data: CommunityRecord[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export interface CommunityFilters {
  location?: string;
  status?: string;
  communityType?: string;
  unitsRange?: [number, number];
  minOccupancy?: number | null;
  maxOccupancy?: number | null;
  minArea?: number | null;
  maxArea?: number | null;
  amenities?: string[];
}

const buildCommunityQuery = ({
  page,
  pageSize,
  filters,
  search,
}: {
  page?: number;
  pageSize?: number;
  filters?: CommunityFilters;
  search?: string;
}) => {
  const params = new URLSearchParams();

  if (page) params.set("page", String(page));
  if (pageSize) params.set("limit", String(pageSize));
  if (search?.trim()) params.set("search", search.trim());
  if (filters?.location?.trim()) params.set("location", filters.location.trim());
  if (filters?.status?.trim()) params.set("status", filters.status.trim());
  if (filters?.communityType?.trim()) params.set("communityType", filters.communityType.trim());

  if (filters?.unitsRange) {
    params.set("minUnits", String(filters.unitsRange[0]));
    params.set("maxUnits", String(filters.unitsRange[1]));
  }

  if (typeof filters?.minOccupancy === "number") {
    params.set("minOccupancy", String(filters.minOccupancy));
  }
  if (typeof filters?.maxOccupancy === "number") {
    params.set("maxOccupancy", String(filters.maxOccupancy));
  }
  if (typeof filters?.minArea === "number") {
    params.set("minArea", String(filters.minArea));
  }
  if (typeof filters?.maxArea === "number") {
    params.set("maxArea", String(filters.maxArea));
  }

  for (const amenity of filters?.amenities || []) {
    if (amenity.trim()) {
      params.append("amenities", amenity.trim());
    }
  }

  const query = params.toString();
  return query ? `?${query}` : "";
};

export const useListCommunities = (
  options: {
    page?: number;
    pageSize?: number;
    filters?: CommunityFilters;
    search?: string;
  } = {}
) => {
  const { page = 1, pageSize = 50, filters, search } = options;
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: ["communities", { page, pageSize, filters, search }],
    queryFn: async () => {
      const response = await fetchAdmin<CommunitiesPayload | { data: CommunitiesPayload }>(
        `/admin/communities${buildCommunityQuery({ page, pageSize, filters, search })}`
      );

      return "data" in response && Array.isArray(response.data)
        ? (response as CommunitiesPayload)
        : (response as { data: CommunitiesPayload }).data;
    },
    enabled: hasToken,
  });
};

export const useGetCommunity = (id: string) => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: ["communities", id],
    queryFn: async () => {
      const response = await fetchAdmin<{ data: CommunityRecord }>(`/admin/communities/${id}`);
      return response.data;
    },
    enabled: hasToken && !!id,
  });
};

export const useCreateCommunity = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async (newCommunity: CommunityInsert) =>
      fetchAdmin("/admin/communities", {
        method: "POST",
        body: JSON.stringify(newCommunity),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
    },
  });
};

export const useUpdateCommunity = (id: string) => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async (updates: CommunityUpdate) =>
      fetchAdmin(`/admin/communities/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      queryClient.invalidateQueries({ queryKey: ["communities", id] });
    },
  });
};

export const useDeleteCommunity = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async (id: string) => {
      await fetchAdmin(`/admin/communities/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
    },
  });
};
