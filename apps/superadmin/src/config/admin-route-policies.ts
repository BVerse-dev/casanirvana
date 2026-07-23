export type AdminRoutePolicy = {
  key: string;
  pathPrefix: string;
  capability: string;
};

type SearchParamsLike = {
  get(name: string): string | null;
};

const GUARD_TAB_CAPABILITIES: Record<string, string> = {
  profiles: "guards:profiles:view",
  schedules: "guards:schedules:view",
  assignments: "guards:assignments:view",
  equipment: "guards:equipment:view",
  performance: "guards:performance:view",
  training: "guards:training:view",
};

const AGENCY_TAB_CAPABILITIES: Record<string, string> = {
  profiles: "agency:profiles:view",
  staff: "agency:staff:view",
  services: "agency:services:view",
  finance: "agency:finance:view",
  documents: "agency:documents:view",
};

const ROUTE_POLICIES: AdminRoutePolicy[] = [
  { key: "guards-profiles", pathPrefix: "/guards/profiles", capability: "guards:profiles:view" },
  { key: "guards-schedules", pathPrefix: "/guards/schedules", capability: "guards:schedules:view" },
  { key: "guards-assignments", pathPrefix: "/guards/assignments", capability: "guards:assignments:view" },
  { key: "guards-equipment", pathPrefix: "/guards/equipment", capability: "guards:equipment:view" },
  { key: "guards-performance", pathPrefix: "/guards/performance", capability: "guards:performance:view" },
  { key: "guards-training", pathPrefix: "/guards/training", capability: "guards:training:view" },
  { key: "agency-profiles", pathPrefix: "/agency/profiles", capability: "agency:profiles:view" },
  { key: "agency-staff", pathPrefix: "/agency/staff", capability: "agency:staff:view" },
  { key: "agency-services", pathPrefix: "/agency/services", capability: "agency:services:view" },
  { key: "agency-finance", pathPrefix: "/agency/finance", capability: "agency:finance:view" },
  { key: "agency-documents", pathPrefix: "/agency/documents", capability: "agency:documents:view" },
  { key: "agencies-profiles", pathPrefix: "/agencies/profiles", capability: "agency:profiles:view" },
  { key: "agencies-staff", pathPrefix: "/agencies/staff", capability: "agency:staff:view" },
  { key: "agencies-services", pathPrefix: "/agencies/services", capability: "agency:services:view" },
  { key: "agencies-finance", pathPrefix: "/agencies/finance", capability: "agency:finance:view" },
  { key: "agencies-documents", pathPrefix: "/agencies/documents", capability: "agency:documents:view" },
  { key: "guards-workspace", pathPrefix: "/guards", capability: "guards:workspace:view" },
  { key: "agency-workspace", pathPrefix: "/agency", capability: "agency:workspace:view" },
  { key: "agencies-workspace", pathPrefix: "/agencies", capability: "agency:workspace:view" },
];

const matchesPrefix = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

export function resolveAdminRoutePolicy(
  pathname: string,
  searchParams?: SearchParamsLike | null
): AdminRoutePolicy | null {
  if (pathname === "/guards/manage") {
    const tab = searchParams?.get("tab") || "";
    const capability = GUARD_TAB_CAPABILITIES[tab] || "guards:workspace:view";
    return { key: tab ? `guards-manage-${tab}` : "guards-manage", pathPrefix: pathname, capability };
  }

  if (pathname === "/agency/manage" || pathname === "/agencies/manage") {
    const tab = searchParams?.get("tab") || "";
    const capability = AGENCY_TAB_CAPABILITIES[tab] || "agency:workspace:view";
    return { key: tab ? `agency-manage-${tab}` : "agency-manage", pathPrefix: pathname, capability };
  }

  return ROUTE_POLICIES.find((policy) => matchesPrefix(pathname, policy.pathPrefix)) || null;
}

export function isAdminRouteAuthorized(
  policy: AdminRoutePolicy | null,
  menuCapabilities: readonly string[] | null | undefined
) {
  if (!policy) return true;
  return new Set(menuCapabilities || []).has(policy.capability);
}

export const guardedRoutePolicyCount = ROUTE_POLICIES.length + 2;
