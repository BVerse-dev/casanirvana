import { Request, Response, NextFunction } from 'express';

import { createHttpError } from '../lib/httpError';
import { supabase } from '../lib/supabase';

export async function createUnit(req: Request, res: Response, next: NextFunction) {
  try {
    const { data, error } = await supabase
      .from('units')
      .insert(req.body)
      .select()
      .single();

    if (error) {
      return next(createHttpError(500, 'UNIT_CREATE_FAILED', 'Failed to create unit', error));
    }

    return res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function updateUnit(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('units')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return next(createHttpError(500, 'UNIT_UPDATE_FAILED', 'Failed to update unit', error));
    }

    if (!data) {
      return next(createHttpError(404, 'UNIT_NOT_FOUND', 'Unit not found'));
    }

    return res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function deleteUnit(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('units')
      .delete()
      .eq('id', id);

    if (error) {
      return next(createHttpError(500, 'UNIT_DELETE_FAILED', 'Failed to delete unit', error));
    }

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}
