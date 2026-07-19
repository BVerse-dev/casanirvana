"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAdminApi } from "@/hooks/useAdminApi";

type AgencyOperationsFilters = {
  agencyId?: string;
  search?: string;
};

const buildQuery = (filters?: AgencyOperationsFilters) => {
  const params = new URLSearchParams();
  if (filters?.agencyId) params.set("agency_id", filters.agencyId);
  if (filters?.search) params.set("search", filters.search);
  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

const useAgencyOperationsResource = <TData = any>(
  path: string,
  filters?: AgencyOperationsFilters
) => {
  const { fetchAdmin, hasToken } = useAdminApi();
  return useQuery({
    queryKey: ["agency-operations", path, filters || {}],
    enabled: hasToken,
    queryFn: async () => {
      const payload = await fetchAdmin<{ data: TData[] }>(`${path}${buildQuery(filters)}`);
      return payload.data || [];
    },
  });
};

const useCreateMutation = (resourceKey: string, path: string) => {
  const { fetchAdmin } = useAdminApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const response = await fetchAdmin<{ data: any }>(path, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency-operations", resourceKey] });
    },
  });
};

const useUpdateMutation = (resourceKey: string, path: string) => {
  const { fetchAdmin } = useAdminApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Record<string, unknown>;
    }) => {
      const response = await fetchAdmin<{ data: any }>(`${path}/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency-operations", resourceKey] });
    },
  });
};

const useDeleteMutation = (resourceKey: string, path: string) => {
  const { fetchAdmin } = useAdminApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await fetchAdmin(`${path}/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency-operations", resourceKey] });
    },
  });
};

export const useAgencyProfilesOperations = (filters?: AgencyOperationsFilters) =>
  useAgencyOperationsResource("/admin/agencies/profiles", filters);
export const useCreateAgencyProfileOperation = () =>
  useCreateMutation("/admin/agencies/profiles", "/admin/agencies/profiles");
export const useUpdateAgencyProfileOperation = () =>
  useUpdateMutation("/admin/agencies/profiles", "/admin/agencies/profiles");

export const useAgencyStaffOperations = (filters?: AgencyOperationsFilters) =>
  useAgencyOperationsResource("/admin/agencies/staff", filters);
export const useCreateAgencyStaffOperation = () =>
  useCreateMutation("/admin/agencies/staff", "/admin/agencies/staff");
export const useUpdateAgencyStaffOperation = () =>
  useUpdateMutation("/admin/agencies/staff", "/admin/agencies/staff");
export const useDeleteAgencyStaffOperation = () =>
  useDeleteMutation("/admin/agencies/staff", "/admin/agencies/staff");

export const useAgencyServicesOperations = (filters?: AgencyOperationsFilters) =>
  useAgencyOperationsResource("/admin/agencies/services", filters);
export const useCreateAgencyServiceOperation = () =>
  useCreateMutation("/admin/agencies/services", "/admin/agencies/services");
export const useUpdateAgencyServiceOperation = () =>
  useUpdateMutation("/admin/agencies/services", "/admin/agencies/services");
export const useDeleteAgencyServiceOperation = () =>
  useDeleteMutation("/admin/agencies/services", "/admin/agencies/services");

export const useAgencyFinanceOperations = (filters?: AgencyOperationsFilters) =>
  useAgencyOperationsResource("/admin/agencies/finance", filters);
export const useCreateAgencyFinanceOperation = () =>
  useCreateMutation("/admin/agencies/finance", "/admin/agencies/finance");
export const useUpdateAgencyFinanceOperation = () =>
  useUpdateMutation("/admin/agencies/finance", "/admin/agencies/finance");

export const useAgencyDocumentsOperations = (filters?: AgencyOperationsFilters) =>
  useAgencyOperationsResource("/admin/agencies/documents", filters);
export const useCreateAgencyDocumentOperation = () =>
  useCreateMutation("/admin/agencies/documents", "/admin/agencies/documents");
export const useUpdateAgencyDocumentOperation = () =>
  useUpdateMutation("/admin/agencies/documents", "/admin/agencies/documents");
export const useDeleteAgencyDocumentOperation = () =>
  useDeleteMutation("/admin/agencies/documents", "/admin/agencies/documents");
