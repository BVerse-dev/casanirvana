import { Request, Response, NextFunction } from 'express';

import { createHttpError } from '../lib/httpError';
import { supabase } from '../lib/supabase';

const ALLOWED_ROLES = [
  'user',
  'guard',
  'admin',
  'superadmin',
  'agency_manager',
  'facility_manager',
] as const;

type AllowedRole = typeof ALLOWED_ROLES[number];

const isAllowedRole = (role: unknown): role is AllowedRole =>
  typeof role === 'string' && (ALLOWED_ROLES as readonly string[]).includes(role);

export async function createProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const { role } = req.body || {};

    if (role && !isAllowedRole(role)) {
      return next(createHttpError(400, 'PROFILE_ROLE_INVALID', 'Invalid role provided'));
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert(req.body)
      .select()
      .single();

    if (error) {
      return next(createHttpError(500, 'PROFILE_CREATE_FAILED', 'Failed to create profile', error));
    }

    return res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { role } = req.body || {};

    if (role && !isAllowedRole(role)) {
      return next(createHttpError(400, 'PROFILE_ROLE_INVALID', 'Invalid role provided'));
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return next(createHttpError(500, 'PROFILE_UPDATE_FAILED', 'Failed to update profile', error));
    }

    if (!data) {
      return next(createHttpError(404, 'PROFILE_NOT_FOUND', 'Profile not found'));
    }

    return res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function deleteProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) {
      return next(createHttpError(500, 'PROFILE_DELETE_FAILED', 'Failed to delete profile', error));
    }

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}
