import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';

export async function createMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert(req.body)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to create message', details: error });
    }

    return res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function updateMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('messages')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update message', details: error });
    }

    if (!data) {
      return res.status(404).json({ error: 'Message not found' });
    }

    return res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function deleteMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: 'Failed to delete message', details: error });
    }

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}
