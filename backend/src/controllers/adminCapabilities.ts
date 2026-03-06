import { NextFunction, Request, Response } from 'express';

import { isAdminLikeRole } from '../middleware/auth';
import { resolveAdminScope } from '../services/adminScope';

type CapabilityBuildInput = {
  role: string | null;
  permissions: string[];
};

const hasAnyPermission = (permissions: Set<string>, keys: string[]) =>
  keys.some((key) => permissions.has(key));

const normalizeRoleName = (role?: string | null) =>
  typeof role === 'string' ? role.trim().toLowerCase().replace(/\s+/g, '_') : '';

function buildMenuCapabilities({ role, permissions }: CapabilityBuildInput): string[] {
  const permissionSet = new Set(permissions);
  const capabilities = new Set<string>();
  const normalizedRole = normalizeRoleName(role);

  const isAdminRole = isAdminLikeRole(role);
  const isPlatformAdmin =
    normalizedRole === 'superadmin' ||
    normalizedRole === 'super_admin' ||
    normalizedRole === 'admin' ||
    normalizedRole === 'administrator';

  const canReadProfiles = hasAnyPermission(permissionSet, [
    'read:all_profiles',
    'manage:users',
    'update:all_profiles',
    'create:profiles',
  ]) || isAdminRole;
  const canReadPayments = hasAnyPermission(permissionSet, [
    'read:all_payments',
    'create:payments',
    'update:payments',
  ]);

  if (!isAdminRole) {
    return [];
  }

  if (canReadProfiles || isPlatformAdmin) {
    capabilities.add('guards:profiles:view');
    capabilities.add('guards:schedules:view');
    capabilities.add('guards:assignments:view');
    capabilities.add('guards:equipment:view');
    capabilities.add('guards:performance:view');
    capabilities.add('guards:training:view');

    capabilities.add('agency:profiles:view');
    capabilities.add('agency:staff:view');
    capabilities.add('agency:services:view');
    capabilities.add('agency:documents:view');
  }

  if (canReadPayments || isPlatformAdmin) {
    capabilities.add('agency:finance:view');
  }

  return [...capabilities];
}

export async function getAdminCapabilities(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const permissions = Array.isArray(req.permissions)
      ? req.permissions.filter((value): value is string => typeof value === 'string' && value.length > 0)
      : [];

    const role = scope.role || req.userProfile?.role || null;

    return res.json({
      data: {
        role,
        permissions,
        scope: {
          agency_ids: scope.isGlobal ? [] : scope.agencyIds,
          community_ids: scope.isGlobal ? [] : scope.communityIds,
        },
        menu_capabilities: buildMenuCapabilities({ role, permissions }),
      },
    });
  } catch (error) {
    next(error);
  }
}
