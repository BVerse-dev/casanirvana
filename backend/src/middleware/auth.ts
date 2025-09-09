import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'user' | 'guard' | 'admin' | 'superadmin';
  phone?: string;
  profile_pic_url?: string;
}

// Attach user types to Express Request
declare global {
  namespace Express {
    interface Request {
      user?: any;
      userProfile?: UserProfile;
      permissions?: string[];
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

    // Get user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(401).json({ error: 'User profile not found' });
    }

    // Get user permissions
    const { data: permissions, error: permissionsError } = await supabase
      .from('role_permissions')
      .select('permission')
      .eq('role', profile.role);

    if (permissionsError) {
      return res.status(500).json({ error: 'Failed to fetch user permissions' });
    }

    req.user = user;
    req.userProfile = profile as UserProfile;
    req.permissions = permissions?.map(p => p.permission) || [];

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
  if (!req.userProfile || (req.userProfile.role !== 'admin' && req.userProfile.role !== 'superadmin')) {
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
