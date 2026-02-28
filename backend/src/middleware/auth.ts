import { Request, Response, NextFunction } from 'express';
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
  notices: ['create:notices', 'write:all_notifications'],
  complaints: ['create:complaints', 'update:complaints', 'delete:complaints', 'read:all_complaints'],
};

const isNotFoundError = (error?: { code?: string | null } | null) => error?.code === 'PGRST116';

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
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Resolve the canonical profile the same way the mobile/web apps do:
    // prefer profiles.user_id, then fall back to legacy profiles.id.
    const profileByUserId = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileByUserId.error && !isNotFoundError(profileByUserId.error)) {
      return res.status(500).json({ error: 'Failed to load user profile' });
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
      return res.status(500).json({ error: 'Failed to load user profile' });
    }

    const profile = profileByUserId.data || profileById.data;

    if (!profile) {
      return res.status(401).json({ error: 'User profile not found' });
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
      return res.status(500).json({ error: 'Failed to fetch user permissions' });
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
      return res.status(403).json({ error: 'Permission denied' });
    }
    next();
  };
}

// Middleware to check if user is an admin
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.userProfile || !['admin', 'superadmin', 'agency_manager', 'facility_manager'].includes(req.userProfile.role)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// Middleware to check if user is a superadmin
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.userProfile || req.userProfile.role !== 'superadmin') {
    return res.status(403).json({ error: 'Super admin access required' });
  }
  next();
}
