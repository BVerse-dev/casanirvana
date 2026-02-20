import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';

export async function createCommunity(req: Request, res: Response, next: NextFunction) {
  try {
    const { data, error } = await supabase
      .from('communities')
      .insert(req.body)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to create community', details: error });
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
      return res.status(500).json({ error: 'Failed to update community', details: error });
    }

    if (!data) {
      return res.status(404).json({ error: 'Community not found' });
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
      return res.status(500).json({ error: 'Failed to delete community', details: error });
    }

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}
