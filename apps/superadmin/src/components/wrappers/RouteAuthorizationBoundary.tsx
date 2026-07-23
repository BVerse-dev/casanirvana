"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import type { ChildrenType } from "@/types/component-props";
import { useAdminCapabilities } from "@/hooks/useAdminCapabilities";
import {
  isAdminRouteAuthorized,
  resolveAdminRoutePolicy,
} from "@/config/admin-route-policies";
import FallbackLoading from "@/components/FallbackLoading";
import ForbiddenState from "@/components/auth/ForbiddenState";

const RouteAuthorizationBoundary = ({ children }: ChildrenType) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const policy = useMemo(
    () => resolveAdminRoutePolicy(pathname, searchParams),
    [pathname, searchParams]
  );
  const capabilitiesQuery = useAdminCapabilities();

  if (!policy) return children;
  if (capabilitiesQuery.isLoading) return <FallbackLoading label="Checking workspace access" />;
  if (capabilitiesQuery.isError) {
    return <ForbiddenState unavailable onRetry={() => capabilitiesQuery.refetch()} />;
  }
  if (!isAdminRouteAuthorized(policy, capabilitiesQuery.data?.menu_capabilities)) {
    return <ForbiddenState />;
  }

  return children;
};

export default RouteAuthorizationBoundary;
