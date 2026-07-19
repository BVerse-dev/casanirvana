"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Database } from "@/lib/database.types";

import { useAdminApi } from "./useAdminApi";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

type ResidentCommunity = {
  id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
};

type ResidentUnit = {
  id: string;
  block: string;
  number: string;
  unit_number?: string;
  community_id?: string | null;
  tenant_id?: string | null;
};

export type Resident = Omit<ProfileRow, "role" | "status" | "is_active"> & {
  communities?: ResidentCommunity | null;
  societies?: Pick<ResidentCommunity, "id" | "name"> | null;
  units?: ResidentUnit | null;
  full_name: string;
  unit_number?: string;
  mobile?: string | null;
  address?: string | null;
  date_of_birth?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  role: "resident" | "tenant";
  status: "active" | "inactive" | "suspended" | "pending";
  is_active: boolean;
};

export type CreateResidentData = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  mobile?: string;
  date_of_birth?: string;
  address?: string;
  avatar_url?: string;
  unit_number?: string;
  block_number?: string;
  unit_id?: string;
  community_id?: string;
  society_id?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  role: "resident" | "tenant";
  status?: "active" | "inactive" | "suspended" | "pending";
  is_active?: boolean;
};

export type UpdateResidentData = Partial<CreateResidentData>;

type ResidentListPayload = {
  data: Resident[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type ResidentRecordPayload = {
  data: Resident;
};

const buildResidentQuery = ({
  page,
  pageSize,
  search,
  status,
  communityId,
  unitId,
}: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  communityId?: string;
  unitId?: string;
}) => {
  const params = new URLSearchParams();

  if (page) params.set("page", String(page));
  if (pageSize) params.set("limit", String(pageSize));
  if (search?.trim()) params.set("search", search.trim());
  if (status?.trim()) params.set("status", status.trim());
  if (communityId?.trim()) params.set("community_id", communityId.trim());
  if (unitId?.trim()) params.set("unit_id", unitId.trim());

  const query = params.toString();
  return query ? `?${query}` : "";
};

const normalizeResidentWritePayload = (residentData: CreateResidentData | UpdateResidentData) => ({
  ...residentData,
  phone: residentData.phone || residentData.mobile || "",
  community_id: residentData.community_id || residentData.society_id || "",
  society_id: residentData.society_id || residentData.community_id || "",
});

export const useListResidents = (
  options: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    communityId?: string;
    unitId?: string;
  } = {}
) => {
  const { page = 1, pageSize = 100, search, status, communityId, unitId } = options;
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: ["residents", { page, pageSize, search, status, communityId, unitId }],
    queryFn: () =>
      fetchAdmin<ResidentListPayload>(
        `/admin/residents${buildResidentQuery({ page, pageSize, search, status, communityId, unitId })}`
      ),
    enabled: hasToken,
  });
};

export const useGetResident = (id: string) => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: ["residents", id],
    queryFn: async () => {
      const response = await fetchAdmin<ResidentRecordPayload>(`/admin/residents/${id}`);
      return response.data;
    },
    enabled: hasToken && !!id,
  });
};

export const useCreateResident = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async (residentData: CreateResidentData) => {
      const response = await fetchAdmin<ResidentRecordPayload>("/admin/residents", {
        method: "POST",
        body: JSON.stringify(normalizeResidentWritePayload(residentData)),
      });

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["residents"] });
    },
  });
};

export const useUpdateResident = (id: string) => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async (residentData: UpdateResidentData) => {
      const response = await fetchAdmin<ResidentRecordPayload>(`/admin/residents/${id}`, {
        method: "PUT",
        body: JSON.stringify(normalizeResidentWritePayload(residentData)),
      });

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["residents"] });
      queryClient.invalidateQueries({ queryKey: ["residents", id] });
      queryClient.invalidateQueries({ queryKey: ["resident-activity-snapshot", id] });
      queryClient.invalidateQueries({ queryKey: ["resident-directory-entries", id] });
    },
  });
};

export const useDeleteResident = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async (id: string) => {
      await fetchAdmin(`/admin/residents/${id}`, { method: "DELETE" });
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["residents"] });
      queryClient.removeQueries({ queryKey: ["residents", id] });
      queryClient.removeQueries({ queryKey: ["resident-activity-snapshot", id] });
      queryClient.removeQueries({ queryKey: ["resident-directory-entries", id] });
    },
  });
};

export const useResidentsByCommunity = (communityId: string) => {
  return useListResidents({
    communityId,
    pageSize: 100,
  });
};

export const useResidentsByUnit = (unitId: string) => {
  return useListResidents({
    unitId,
    pageSize: 100,
  });
};
