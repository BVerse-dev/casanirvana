import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';

export async function createUnit(req: Request, res: Response, next: NextFunction) {
  try {
    const { data, error } = await supabase
      .from('units')
      .insert(req.body)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to create unit', details: error });
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
      return res.status(500).json({ error: 'Failed to update unit', details: error });
    }

    if (!data) {
      return res.status(404).json({ error: 'Unit not found' });
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
      return res.status(500).json({ error: 'Failed to delete unit', details: error });
    }

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}
