import { Request, Response, NextFunction } from 'express';
import { createHttpError } from '../lib/httpError';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string | null;
  phone?: string;
  profile_pic_url?: string;
}

const LEGACY_ROUTE_PERMISSIONS = [
  'create:complaints',
  'create:notices',
  'create:payments',
  'create:profiles',
  'delete:complaints',
  'delete:payments',
  'delete:profiles',
  'manage:roles',
  'manage:settings',
  'manage:users',
  'read:all_complaints',
  'read:all_maintenance_requests',
  'read:all_notifications',
  'read:all_payments',
  'read:all_profiles',
  'read:analytics',
  'read:units',
  'update:all_profiles',
  'update:complaints',
  'update:maintenance_requests',
  'update:payments',
  'update:units',
  'write:all_notifications',
] as const;

const PROFILE_ROLE_TO_USER_ROLE_NAMES: Record<string, string[]> = {
  superadmin: ['Super Admin', 'superadmin'],
  admin: ['Administrator', 'Admin', 'admin'],
  agency_manager: ['Management', 'Agency Manager', 'agency_manager'],
  facility_manager: ['Management', 'Facility Manager', 'facility_manager'],
  guard: ['Security Guard', 'Guard', 'guard'],
  user: ['Resident', 'User', 'user'],
};

const PROFILE_ROLE_FALLBACK_ALIASES: Record<string, string[]> = {
  resident: PROFILE_ROLE_TO_USER_ROLE_NAMES.user,
  member: PROFILE_ROLE_TO_USER_ROLE_NAMES.user,
  community_admin: PROFILE_ROLE_TO_USER_ROLE_NAMES.admin,
  committee_member: PROFILE_ROLE_TO_USER_ROLE_NAMES.admin,
  committee: PROFILE_ROLE_TO_USER_ROLE_NAMES.admin,
  security_guard: PROFILE_ROLE_TO_USER_ROLE_NAMES.guard,
  agency_admin: PROFILE_ROLE_TO_USER_ROLE_NAMES.agency_manager,
  facility_admin: PROFILE_ROLE_TO_USER_ROLE_NAMES.facility_manager,
};

const PERMISSION_KEY_ALIASES: Record<string, string[]> = {
  dashboard_view: ['read:analytics'],
  system_settings: ['manage:settings', 'manage:roles'],
  users_manage: ['manage:users', 'create:profiles', 'update:all_profiles', 'delete:profiles', 'update:units'],
  users_view: ['read:all_profiles', 'read:units'],
  reports_view: ['read:analytics', 'read:all_complaints', 'read:all_maintenance_requests', 'read:all_payments'],
  maintenance_manage: ['read:all_maintenance_requests', 'update:maintenance_requests'],
};

const MODULE_ALIASES: Record<string, string[]> = {
  all: [...LEGACY_ROUTE_PERMISSIONS],
  user_management: [
    'manage:users',
    'create:profiles',
    'read:all_profiles',
    'update:all_profiles',
    'delete:profiles',
    'read:units',
    'update:units',
    'create:complaints',
    'update:complaints',
    'delete:complaints',
    'create:payments',
    'update:payments',
    'delete:payments',
  ],
  system_settings: ['manage:settings', 'manage:roles'],
  reports: ['read:analytics', 'read:all_complaints', 'read:all_maintenance_requests', 'read:all_payments'],
  maintenance: ['read:all_maintenance_requests', 'update:maintenance_requests'],
  notices: ['create:notices', 'read:all_notifications', 'write:all_notifications'],
  complaints: ['create:complaints', 'update:complaints', 'delete:complaints', 'read:all_complaints'],
};

const isNotFoundError = (error?: { code?: string | null } | null) => error?.code === 'PGRST116';

const normalizeRoleName = (role?: string | null) =>
  typeof role === 'string' ? role.trim().toLowerCase().replace(/\s+/g, '_') : '';

const ADMIN_ROLE_NAMES = new Set([
  'superadmin',
  'super_admin',
  'admin',
  'administrator',
  'agency_manager',
  'facility_manager',
  'agency_admin',
  'facility_admin',
  'community_admin',
  'management',
]);

export const isAdminLikeRole = (role?: string | null) => ADMIN_ROLE_NAMES.has(normalizeRoleName(role));

function getRoleNameCandidates(role: UserProfile['role']) {
  const normalizedRole = typeof role === 'string' && role.trim().length > 0 ? role.trim() : 'user';
  const mappedRoleNames =
    PROFILE_ROLE_TO_USER_ROLE_NAMES[normalizedRole] ||
    PROFILE_ROLE_FALLBACK_ALIASES[normalizedRole] ||
    [];

  const candidates = new Set<string>([normalizedRole, ...mappedRoleNames]);
  return [...candidates];
}

function addAliasPermissions(target: Set<string>, sourceValues: Iterable<string>, aliases: Record<string, string[]>) {
  for (const value of sourceValues) {
    target.add(value);

    const mapped = aliases[value];
    if (mapped) {
      for (const permission of mapped) {
        target.add(permission);
      }
    }
  }
}

// Attach user types to Express Request
declare global {
  namespace Express {
    interface Request {
      user?: any;
      userProfile?: UserProfile;
      permissions?: string[];
      requestId?: string;
    }
  }
}

// Middleware to validate Supabase session and attach user to req
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return next(createHttpError(401, 'AUTH_TOKEN_MISSING', 'Missing authorization token'));
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return next(createHttpError(401, 'AUTH_TOKEN_INVALID', 'Invalid or expired token'));
    }

    // Resolve the canonical profile the same way the mobile/web apps do:
    // prefer profiles.user_id, then fall back to legacy profiles.id.
    const profileByUserId = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileByUserId.error && !isNotFoundError(profileByUserId.error)) {
      return next(createHttpError(500, 'AUTH_PROFILE_LOOKUP_FAILED', 'Failed to load user profile', profileByUserId.error));
    }

    const profileById =
      profileByUserId.data
        ? { data: null, error: null }
        : await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

    if (profileById.error && !isNotFoundError(profileById.error)) {
      return next(createHttpError(500, 'AUTH_PROFILE_LOOKUP_FAILED', 'Failed to load user profile', profileById.error));
    }

    const profile = profileByUserId.data || profileById.data;

    if (!profile) {
      return next(createHttpError(401, 'AUTH_PROFILE_NOT_FOUND', 'User profile not found'));
    }

    const roleNameCandidates = getRoleNameCandidates(profile.role);

    const [
      { data: rolePermissions, error: rolePermissionsError },
      { data: roleRows, error: roleRowsError },
    ] = await Promise.all([
      supabase
        .from('role_permissions_detailed')
        .select('permission_key')
        .in('role_name', roleNameCandidates),
      supabase
        .from('user_roles')
        .select('permissions')
        .in('name', roleNameCandidates),
    ]);

    if (rolePermissionsError && roleRowsError) {
      console.error('Failed to fetch user permissions', {
        role: profile.role,
        rolePermissionsError: rolePermissionsError.message,
        roleRowsError: roleRowsError.message,
      });
      return next(
        createHttpError(500, 'AUTH_PERMISSIONS_LOOKUP_FAILED', 'Failed to fetch user permissions', {
          rolePermissionsError,
          roleRowsError,
        })
      );
    }

    const effectivePermissions = new Set<string>();

    addAliasPermissions(
      effectivePermissions,
      (rolePermissions || [])
        .map((row) => row.permission_key)
        .filter((permissionKey): permissionKey is string => typeof permissionKey === 'string' && permissionKey.length > 0),
      PERMISSION_KEY_ALIASES
    );

    const roleModules = (roleRows || []).flatMap((row) => {
      if (!Array.isArray(row.permissions)) {
        return [];
      }

      return row.permissions.filter((value): value is string => typeof value === 'string' && value.length > 0);
    });

    addAliasPermissions(effectivePermissions, roleModules, MODULE_ALIASES);

    req.user = user;
    req.userProfile = profile as UserProfile;
    req.permissions = [...effectivePermissions];

    next();
  } catch (err) {
    next(err);
  }
}

// Middleware to check if user has specific permission
export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.permissions || !req.permissions.includes(permission)) {
      return next(createHttpError(403, 'AUTH_PERMISSION_DENIED', 'Permission denied'));
    }
    next();
  };
}

// Middleware to check if user is an admin
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.userProfile || !isAdminLikeRole(req.userProfile.role)) {
    return next(createHttpError(403, 'AUTH_ADMIN_REQUIRED', 'Admin access required'));
  }
  next();
}

// Middleware to check if user is a superadmin
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  const normalizedRole = normalizeRoleName(req.userProfile?.role);
  if (!req.userProfile || (normalizedRole !== 'superadmin' && normalizedRole !== 'super_admin')) {
    return next(createHttpError(403, 'AUTH_SUPERADMIN_REQUIRED', 'Super admin access required'));
  }
  next();
}
