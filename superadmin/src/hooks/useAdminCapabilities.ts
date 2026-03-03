"use client";

import { useQuery } from "@tanstack/react-query";

import { useAdminApi } from "@/hooks/useAdminApi";

export type AdminCapabilitiesPayload = {
  data: {
    role: string | null;
    permissions: string[];
    scope: {
      agency_ids: string[];
      community_ids: string[];
    };
    menu_capabilities: string[];
  };
};

export const useAdminCapabilities = () => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: ["admin-capabilities"],
    enabled: hasToken,
    queryFn: async () => {
      const payload = await fetchAdmin<AdminCapabilitiesPayload>("/admin/me/capabilities");
      return payload.data;
    },
    staleTime: 60_000,
    retry: 1,
  });
};

