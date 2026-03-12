import { Request, Response, NextFunction } from 'express';

import { createHttpError } from '../lib/httpError';
import { supabase } from '../lib/supabase';
import { resolveAdminScope } from '../services/adminScope';

export async function listCommunities(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);

    let query = supabase
      .from('communities')
      .select('id, name, agency_id, address, city, state, status')
      .order('name', { ascending: true });

    if (!scope.isGlobal) {
      if (scope.communityIds.length === 0) {
        return res.json({ data: [] });
      }
      query = query.in('id', scope.communityIds);
    }

    const { data, error } = await query;
    if (error) {
      return next(createHttpError(500, 'COMMUNITIES_LIST_FAILED', 'Failed to load communities', error));
    }

    return res.json({ data: data || [] });
  } catch (err) {
    next(err);
  }
}

export async function createCommunity(req: Request, res: Response, next: NextFunction) {
  try {
    const { data, error } = await supabase
      .from('communities')
      .insert(req.body)
      .select()
      .single();

    if (error) {
      return next(createHttpError(500, 'COMMUNITY_CREATE_FAILED', 'Failed to create community', error));
    }

    return res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function updateCommunity(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('communities')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return next(createHttpError(500, 'COMMUNITY_UPDATE_FAILED', 'Failed to update community', error));
    }

    if (!data) {
      return next(createHttpError(404, 'COMMUNITY_NOT_FOUND', 'Community not found'));
    }

    return res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function deleteCommunity(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('communities')
      .delete()
      .eq('id', id);

    if (error) {
      return next(createHttpError(500, 'COMMUNITY_DELETE_FAILED', 'Failed to delete community', error));
    }

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}
