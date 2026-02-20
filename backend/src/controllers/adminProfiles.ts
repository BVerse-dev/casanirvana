import { Request, Response, NextFunction } from 'express';
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
      return res.status(400).json({ error: 'Invalid role provided' });
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert(req.body)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to create profile', details: error });
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
      return res.status(400).json({ error: 'Invalid role provided' });
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update profile', details: error });
    }

    if (!data) {
      return res.status(404).json({ error: 'Profile not found' });
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
      return res.status(500).json({ error: 'Failed to delete profile', details: error });
    }

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}
