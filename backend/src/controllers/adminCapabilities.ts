import { NextFunction, Request, Response } from 'express';

import { resolveAdminScope } from '../services/adminScope';

type CapabilityBuildInput = {
  role: string | null;
  permissions: string[];
};

const hasAnyPermission = (permissions: Set<string>, keys: string[]) =>
  keys.some((key) => permissions.has(key));

function buildMenuCapabilities({ role, permissions }: CapabilityBuildInput): string[] {
  const permissionSet = new Set(permissions);
  const capabilities = new Set<string>();

  const isAdminRole =
    role === 'superadmin' || role === 'admin' || role === 'agency_manager' || role === 'facility_manager';

  const canReadProfiles = hasAnyPermission(permissionSet, [
    'read:all_profiles',
    'manage:users',
    'update:all_profiles',
    'create:profiles',
  ]);
  const canReadPayments = hasAnyPermission(permissionSet, [
    'read:all_payments',
    'create:payments',
    'update:payments',
  ]);

  if (!isAdminRole) {
    return [];
  }

  if (canReadProfiles || role === 'superadmin' || role === 'admin') {
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

  if (canReadPayments || role === 'superadmin' || role === 'admin') {
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

