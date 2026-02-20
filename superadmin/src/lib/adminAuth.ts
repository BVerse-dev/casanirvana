import type { Session } from "next-auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { options as authOptions } from "@/app/api/auth/[...nextauth]/options";

export const ADMIN_ROLES = ["superadmin", "agency_manager", "facility_manager", "admin"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export type AdminSessionScope = {
  userId: string;
  role: AdminRole;
  agencyId: string | null;
  communityId: string | null;
  scopedAgencyIds: string[];
  scopedCommunityIds: string[];
  isSuperadmin: boolean;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string | null | undefined): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

export function normalizeUuidList(values: Array<string | null | undefined>): string[] {
  return [...new Set(values.filter(isUuid))];
}

function normalizeAdminRole(value: string | null | undefined): AdminRole | null {
  if (!value) return null;
  return (ADMIN_ROLES as readonly string[]).includes(value) ? (value as AdminRole) : null;
}

export function buildScopeFromSession(session: Session | null): AdminSessionScope | null {
  const user = session?.user;
  const role = normalizeAdminRole(user?.role);
  if (!role || !isUuid(user?.id)) {
    return null;
  }

  const scopedAgencyIds = normalizeUuidList([...(user.scopedAgencyIds || []), user.agencyId]);
  const scopedCommunityIds = normalizeUuidList([
    ...(user.scopedCommunityIds || []),
    user.communityId,
  ]);

  return {
    userId: user.id,
    role,
    agencyId: isUuid(user.agencyId) ? user.agencyId : null,
    communityId: isUuid(user.communityId) ? user.communityId : null,
    scopedAgencyIds,
    scopedCommunityIds,
    isSuperadmin: role === "superadmin",
  };
}

export async function getAdminSessionScope(): Promise<AdminSessionScope | null> {
  const session = await getServerSession(authOptions);
  return buildScopeFromSession(session);
}

export function hasCommunityAccess(scope: AdminSessionScope, communityId: string): boolean {
  if (!isUuid(communityId)) return false;
  if (scope.isSuperadmin) return true;
  return scope.scopedCommunityIds.includes(communityId);
}

export function hasAgencyAccess(scope: AdminSessionScope, agencyId: string): boolean {
  if (!isUuid(agencyId)) return false;
  if (scope.isSuperadmin) return true;
  return scope.scopedAgencyIds.includes(agencyId);
}

export function apiError(
  remark: string,
  message: string[],
  status = 403
): NextResponse {
  return NextResponse.json(
    {
      status: "error",
      remark,
      message,
    },
    { status }
  );
}

type RequireAdminScopeResult =
  | { scope: AdminSessionScope; error: null }
  | { scope: null; error: NextResponse };

export async function requireAdminScope(
  allowedRoles: readonly AdminRole[] = ADMIN_ROLES
): Promise<RequireAdminScopeResult> {
  const scope = await getAdminSessionScope();
  if (!scope) {
    return {
      scope: null,
      error: apiError("unauthorized", ["Admin access required"], 401),
    };
  }

  if (!allowedRoles.includes(scope.role)) {
    return {
      scope: null,
      error: apiError("forbidden", ["You do not have permission to access this resource."], 403),
    };
  }

  return { scope, error: null };
}
