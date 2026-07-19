import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';
import { createHttpError } from '../lib/httpError';

const normalizeNamespaceValue = (value: unknown) =>
  typeof value === 'string' ? value.trim() : '';

const parseSettingValue = (value: unknown, dataType?: string | null) => {
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

const inferDataType = (value: unknown): 'string' | 'boolean' | 'number' | 'json' => {
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'object' && value !== null) return 'json';
  return 'string';
};

export async function getSystemSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const { category, subcategory, raw } = req.query;
    const hasCategory = typeof category === 'string';
    const hasSubcategory = typeof subcategory === 'string';

    let query = supabase
      .from('system_settings')
      .select('*')
      .order('category')
      .order('subcategory')
      .order('key');

    if (hasCategory) {
      query = query.eq('category', normalizeNamespaceValue(category));
    }

    if (hasCategory || hasSubcategory) {
      query = query.eq('subcategory', normalizeNamespaceValue(subcategory));
    }

    const { data, error } = await query;

    if (error) {
      if (error.code === '42P01') {
        return res.json(raw ? [] : { data: [], settings: {} });
      }
      return next(createHttpError(500, 'SYSTEM_SETTINGS_FETCH_FAILED', 'Failed to fetch system settings', error));
    }

    if (raw === 'true') {
      return res.json(data || []);
    }

    const settings = (data || []).reduce((acc: Record<string, unknown>, item) => {
      acc[item.key] = parseSettingValue(item.value, item.data_type);
      return acc;
    }, {} as Record<string, unknown>);

    return res.json({ data: data || [], settings });
  } catch (err) {
    next(err);
  }
}

export async function systemSettingsExists(req: Request, res: Response, next: NextFunction) {
  try {
    const { category, subcategory } = req.query;
    const hasCategory = typeof category === 'string';
    const hasSubcategory = typeof subcategory === 'string';

    let query = supabase
      .from('system_settings')
      .select('id', { count: 'exact', head: true })
      .order('category');

    if (hasCategory) {
      query = query.eq('category', normalizeNamespaceValue(category));
    }

    if (hasCategory || hasSubcategory) {
      query = query.eq('subcategory', normalizeNamespaceValue(subcategory));
    }

    const { count, error } = await query;

    if (error) {
      if (error.code === '42P01') {
        return res.json({ exists: false });
      }
      return next(createHttpError(500, 'SYSTEM_SETTINGS_EXISTS_FAILED', 'Failed to check system settings', error));
    }

    return res.json({ exists: (count || 0) > 0 });
  } catch (err) {
    next(err);
  }
}

export async function upsertSystemSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const { category, subcategory, settings, descriptions, sensitivities } = req.body || {};
    const normalizedCategory = normalizeNamespaceValue(category);
    const normalizedSubcategory = normalizeNamespaceValue(subcategory);

    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
      return next(createHttpError(400, 'SYSTEM_SETTINGS_INVALID_BODY', 'settings object is required'));
    }

    const rows = Object.entries(settings).map(([key, value]) => ({
      category: normalizedCategory,
      subcategory: normalizedSubcategory,
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
        onConflict: 'category,subcategory,key',
      })
      .select();

    if (error) {
      return next(createHttpError(500, 'SYSTEM_SETTINGS_UPDATE_FAILED', 'Failed to update system settings', error));
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
    const hasCategory = typeof category === 'string';
    const hasSubcategory = typeof subcategory === 'string';

    if (!key) {
      return next(createHttpError(400, 'SYSTEM_SETTINGS_KEY_REQUIRED', 'settings key is required'));
    }

    let query = supabase
      .from('system_settings')
      .delete()
      .eq('key', key);

    if (hasCategory) {
      query = query.eq('category', normalizeNamespaceValue(category));
    }

    if (hasCategory || hasSubcategory) {
      query = query.eq('subcategory', normalizeNamespaceValue(subcategory));
    }

    const { error } = await query;

    if (error) {
      return next(createHttpError(500, 'SYSTEM_SETTINGS_DELETE_FAILED', 'Failed to delete system setting', error));
    }

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}
