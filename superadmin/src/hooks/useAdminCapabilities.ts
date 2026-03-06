"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
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

const normalizeRoleName = (role?: string | null) =>
  typeof role === "string" ? role.trim().toLowerCase().replace(/\s+/g, "_") : "";

const PLATFORM_ADMIN_ROLES = new Set(["superadmin", "super_admin", "admin", "administrator"]);

const PLATFORM_ADMIN_MENU_CAPABILITIES = [
  "guards:workspace:view",
  "guards:profiles:view",
  "guards:schedules:view",
  "guards:assignments:view",
  "guards:equipment:view",
  "guards:performance:view",
  "guards:training:view",
  "agency:workspace:view",
  "agency:profiles:view",
  "agency:staff:view",
  "agency:services:view",
  "agency:finance:view",
  "agency:documents:view",
];

export const useAdminCapabilities = () => {
  const { fetchAdmin, hasToken } = useAdminApi();
  const { data: session } = useSession();

  const query = useQuery({
    queryKey: ["admin-capabilities"],
    enabled: hasToken,
    queryFn: async () => {
      const payload = await fetchAdmin<AdminCapabilitiesPayload>("/admin/me/capabilities");
      return payload.data;
    },
    staleTime: 60_000,
    retry: 1,
  });

  const fallbackRole = session?.user?.role ?? null;
  const fallbackMenuCapabilities = useMemo(() => {
    if (PLATFORM_ADMIN_ROLES.has(normalizeRoleName(fallbackRole))) {
      return PLATFORM_ADMIN_MENU_CAPABILITIES;
    }
    return [];
  }, [fallbackRole]);

  const data = useMemo(() => {
    if (query.data) {
      return {
        ...query.data,
        role: query.data.role ?? fallbackRole,
        menu_capabilities:
          query.data.menu_capabilities.length > 0
            ? query.data.menu_capabilities
            : fallbackMenuCapabilities,
      };
    }

    if (!fallbackRole || fallbackMenuCapabilities.length === 0) {
      return query.data;
    }

    return {
      role: fallbackRole,
      permissions: [],
      scope: {
        agency_ids: [],
        community_ids: [],
      },
      menu_capabilities: fallbackMenuCapabilities,
    };
  }, [fallbackMenuCapabilities, fallbackRole, query.data]);

  return {
    ...query,
    data,
  };
};
