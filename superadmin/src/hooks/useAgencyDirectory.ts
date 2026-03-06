"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { useAdminApi } from "@/hooks/useAdminApi";
import type { Agency as LegacyAgency } from "@/hooks/useAgencies";

type AgencyDirectoryApiRecord = {
  id: string;
  name: string;
  address?: string | null;
  agency_type?: string | null;
  annual_revenue?: number | null;
  bonding_amount?: number | null;
  certifications?: string[] | null;
  city?: string | null;
  commission_percentage?: number | null;
  contact_person_email?: string | null;
  contact_person_name?: string | null;
  contact_person_phone?: string | null;
  country?: string | null;
  created_at?: string | null;
  description?: string | null;
  email?: string | null;
  employee_count?: number | null;
  establishment_date?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  insurance_details?: string | null;
  is_active?: boolean | null;
  languages_spoken?: string[] | null;
  license_number?: string | null;
  linkedin_url?: string | null;
  managed_societies?: number | null;
  notification_preferences?: string[] | null;
  operating_hours?: string | null;
  phone?: string | null;
  postal_code?: string | null;
  registration_number?: string | null;
  specializations?: string[] | null;
  state?: string | null;
  twitter_url?: string | null;
  updated_at?: string | null;
  website?: string | null;
};

export type AgencyDirectoryItem = LegacyAgency;

type AgencyDirectoryFilters = {
  agencyId?: string;
  search?: string;
};

const buildQuery = (filters?: AgencyDirectoryFilters) => {
  const params = new URLSearchParams();
  if (filters?.agencyId) params.set("agency_id", filters.agencyId);
  if (filters?.search) params.set("search", filters.search);
  const query = params.toString();
  return query ? `?${query}` : "";
};

const mapAgencyDirectoryRecord = (agency: AgencyDirectoryApiRecord): AgencyDirectoryItem => ({
  ...(agency as LegacyAgency),
  contact_person: agency.contact_person_name || undefined,
  contact_email: agency.contact_person_email || undefined,
  contact_phone: agency.contact_person_phone || undefined,
  pin_code: agency.postal_code || undefined,
  staff_count: agency.employee_count || undefined,
  properties_count: agency.managed_societies || undefined,
  management_fee_percentage: agency.commission_percentage || undefined,
  social_media: {
    facebook: agency.facebook_url || undefined,
    twitter: agency.twitter_url || undefined,
    instagram: agency.instagram_url || undefined,
    linkedin: agency.linkedin_url || undefined,
  },
});

export const useListAgenciesDirectory = (filters?: AgencyDirectoryFilters) => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: ["agencies-directory", filters || {}],
    enabled: hasToken,
    queryFn: async () => {
      const payload = await fetchAdmin<{ data: AgencyDirectoryApiRecord[] }>(
        `/admin/agencies/directory${buildQuery(filters)}`
      );
      return (payload.data || []).map(mapAgencyDirectoryRecord);
    },
  });
};

export const useGetAgencyDirectory = (agencyId: string) => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: ["agencies-directory", "detail", agencyId],
    enabled: hasToken && !!agencyId,
    queryFn: async () => {
      const payload = await fetchAdmin<{ data: AgencyDirectoryApiRecord[] }>(
        `/admin/agencies/directory${buildQuery({ agencyId })}`
      );
      const agency = (payload.data || [])[0];
      if (!agency) throw new Error("Agency not found");
      return mapAgencyDirectoryRecord(agency);
    },
  });
};

export const useDeleteAgencyDirectory = () => {
  const { fetchAdmin } = useAdminApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agencyId: string) => {
      await fetchAdmin(`/admin/agencies/directory/${agencyId}`, { method: "DELETE" });
      return agencyId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agencies-directory"] });
      toast.success("Agency deleted successfully!");
    },
    onError: (error) => {
      console.error("Error deleting agency:", error);
      toast.error("Failed to delete agency");
    },
  });
};
