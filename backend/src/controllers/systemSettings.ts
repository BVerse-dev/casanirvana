import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';

const parseSettingValue = (value: any, dataType?: string | null) => {
  try {
    if (dataType === 'boolean') {
      return value === true || value === 'true';
    }
    if (dataType === 'number') {
      return Number(value);
    }
    if (dataType === 'json') {
      if (typeof value === 'string') {
        return JSON.parse(value);
      }
      return value;
    }
    return value;
  } catch {
    return value;
  }
};

const inferDataType = (value: any): 'string' | 'boolean' | 'number' | 'json' => {
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'object' && value !== null) return 'json';
  return 'string';
};

export async function getSystemSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const { category, subcategory, raw } = req.query;

    let query = supabase
      .from('system_settings')
      .select('*')
      .order('category')
      .order('key');

    if (category && typeof category === 'string') {
      query = query.eq('category', category);
    }

    if (subcategory && typeof subcategory === 'string') {
      query = query.eq('subcategory', subcategory);
    }

    const { data, error } = await query;

    if (error) {
      if (error.code === '42P01') {
        return res.json(raw ? [] : { data: [], settings: {} });
      }
      return res.status(500).json({ error: 'Failed to fetch system settings', details: error });
    }

    if (raw === 'true') {
      return res.json(data || []);
    }

    const settings = (data || []).reduce((acc: Record<string, any>, item: any) => {
      acc[item.key] = parseSettingValue(item.value, item.data_type);
      return acc;
    }, {});

    return res.json({ data: data || [], settings });
  } catch (err) {
    next(err);
  }
}

export async function systemSettingsExists(req: Request, res: Response, next: NextFunction) {
  try {
    const { category, subcategory } = req.query;

    let query = supabase
      .from('system_settings')
      .select('id', { count: 'exact', head: true })
      .order('category');

    if (category && typeof category === 'string') {
      query = query.eq('category', category);
    }

    if (subcategory && typeof subcategory === 'string') {
      query = query.eq('subcategory', subcategory);
    }

    const { count, error } = await query;

    if (error) {
      if (error.code === '42P01') {
        return res.json({ exists: false });
      }
      return res.status(500).json({ error: 'Failed to check system settings', details: error });
    }

    return res.json({ exists: (count || 0) > 0 });
  } catch (err) {
    next(err);
  }
}

export async function upsertSystemSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const { category, subcategory, settings, descriptions, sensitivities } = req.body || {};

    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
      return res.status(400).json({ error: 'settings object is required' });
    }

    const rows = Object.entries(settings).map(([key, value]) => ({
      category: category || null,
      subcategory: subcategory || null,
      key,
      value: typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value),
      data_type: inferDataType(value),
      description: descriptions?.[key] ?? null,
      is_sensitive: sensitivities?.[key] ?? null,
      updated_by: req.user?.id ?? null,
      updated_at: new Date().toISOString(),
    }));

    if (rows.length === 0) {
      return res.json({ updated: 0, data: [] });
    }

    const { data, error } = await supabase
      .from('system_settings')
      .upsert(rows, {
        onConflict: 'key',
      })
      .select();

    if (error) {
      return res.status(500).json({ error: 'Failed to update system settings', details: error });
    }

    return res.json({ updated: data?.length || 0, data });
  } catch (err) {
    next(err);
  }
}

export async function deleteSystemSetting(req: Request, res: Response, next: NextFunction) {
  try {
    const { key } = req.params;
    const { category, subcategory } = req.query;

    if (!key) {
      return res.status(400).json({ error: 'settings key is required' });
    }

    let query = supabase
      .from('system_settings')
      .delete()
      .eq('key', key);

    if (category && typeof category === 'string') {
      query = query.eq('category', category);
    }

    if (subcategory && typeof subcategory === 'string') {
      query = query.eq('subcategory', subcategory);
    }

    const { error } = await query;

    if (error) {
      return res.status(500).json({ error: 'Failed to delete system setting', details: error });
    }

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}
