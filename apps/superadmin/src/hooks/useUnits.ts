"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Database } from "../lib/database.types";
import { useAdminApi } from "./useAdminApi";

type Unit = Database["public"]["Tables"]["units"]["Row"];
type UnitInsert = Database["public"]["Tables"]["units"]["Insert"];
type UnitUpdate = Database["public"]["Tables"]["units"]["Update"];

type UnitCommunity = {
  id: string;
  name: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
};

type UnitOwnerProfile = {
  first_name: string | null;
  last_name: string | null;
  full_name?: string | null;
  email: string | null;
  phone?: string | null;
};

export type UnitRecord = Unit & {
  communities?: UnitCommunity | null;
  profiles?: UnitOwnerProfile | null;
};

type UnitsPayload = {
  data: UnitRecord[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const buildUnitsQuery = ({
  page,
  pageSize,
  communityId,
  search,
  status,
  type,
}: {
  page?: number;
  pageSize?: number;
  communityId?: string;
  search?: string;
  status?: string;
  type?: string;
}) => {
  const params = new URLSearchParams();

  if (page) params.set("page", String(page));
  if (pageSize) params.set("limit", String(pageSize));
  if (communityId?.trim()) params.set("community_id", communityId.trim());
  if (search?.trim()) params.set("search", search.trim());
  if (status?.trim()) params.set("status", status.trim());
  if (type?.trim()) params.set("type", type.trim());

  const query = params.toString();
  return query ? `?${query}` : "";
};

export const useListUnits = (
  options: {
    page?: number;
    pageSize?: number;
    communityId?: string;
    societyId?: string;
    search?: string;
    status?: string;
    type?: string;
  } = {}
) => {
  const {
    page = 1,
    pageSize = 50,
    communityId,
    societyId,
    search,
    status,
    type,
  } = options;
  const { fetchAdmin, hasToken } = useAdminApi();
  const resolvedCommunityId = communityId || societyId;

  return useQuery({
    queryKey: ["units", { page, pageSize, communityId: resolvedCommunityId, search, status, type }],
    queryFn: async () => {
      const response = await fetchAdmin<UnitsPayload | { data: UnitsPayload }>(
        `/admin/units${buildUnitsQuery({
          page,
          pageSize,
          communityId: resolvedCommunityId,
          search,
          status,
          type,
        })}`
      );

      return "data" in response && Array.isArray(response.data)
        ? (response as UnitsPayload)
        : (response as { data: UnitsPayload }).data;
    },
    enabled: hasToken,
  });
};

export const useGetUnit = (id: string) => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: ["units", id],
    queryFn: async () => {
      const response = await fetchAdmin<{ data: UnitRecord }>(`/admin/units/${id}`);
      return response.data;
    },
    enabled: hasToken && !!id,
  });
};

export const useCreateUnit = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async (newUnit: UnitInsert) =>
      fetchAdmin("/admin/units", {
        method: "POST",
        body: JSON.stringify(newUnit),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
    },
  });
};

export const useUpdateUnit = (id: string) => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async (updates: UnitUpdate) =>
      fetchAdmin(`/admin/units/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      queryClient.invalidateQueries({ queryKey: ["units", id] });
    },
  });
};

export const useDeleteUnit = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async (id: string) => {
      await fetchAdmin(`/admin/units/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
    },
  });
};
