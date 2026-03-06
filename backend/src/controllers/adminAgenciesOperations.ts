import { NextFunction, Request, Response } from 'express';

import { supabase } from '../lib/supabase';
import { canAccessAgency, isUuid, resolveAdminScope } from '../services/adminScope';

const parseUuidQueryParam = (req: Request, key: string): string | null => {
  const value = req.query[key];
  return typeof value === 'string' && isUuid(value) ? value : null;
};

const parseStringQueryParam = (req: Request, key: string): string | null => {
  const value = req.query[key];
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const toScopeError = (res: Response, message: string) =>
  res.status(403).json({ error: message });

async function ensureAgencyScope(
  scope: Awaited<ReturnType<typeof resolveAdminScope>>,
  agencyId: string | null | undefined
) {
  if (!isUuid(agencyId)) {
    return { ok: false, reason: 'agency_id is required for this operation.' as const };
  }
  if (!canAccessAgency(scope, agencyId)) {
    return { ok: false, reason: 'Access denied for the selected agency.' as const };
  }
  return { ok: true, agencyId };
}

const withScopeFallbackAgency = (
  scope: Awaited<ReturnType<typeof resolveAdminScope>>,
  payload: Record<string, unknown>
) => {
  if (isUuid(payload.agency_id)) return payload.agency_id;
  if (!scope.isGlobal && scope.agencyIds.length === 1) return scope.agencyIds[0];
  return null;
};

export async function listAgencyProfiles(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const requestedAgencyId = parseUuidQueryParam(req, 'agency_id');
    const search = parseStringQueryParam(req, 'search');

    if (requestedAgencyId && !canAccessAgency(scope, requestedAgencyId)) {
      return toScopeError(res, 'Access denied for the requested agency.');
    }

    let query = supabase.from('agency_profiles').select('*').order('created_at', { ascending: false });

    if (requestedAgencyId) {
      query = query.eq('id', requestedAgencyId);
    } else if (!scope.isGlobal) {
      if (scope.agencyIds.length === 0) {
        return res.json({ data: [] });
      }
      query = query.in('id', scope.agencyIds);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%,owner_name.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch agency profiles', details: error.message });
    }

    return res.json({ data: data || [] });
  } catch (error) {
    next(error);
  }
}

export async function listAgencyDirectory(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const requestedAgencyId = parseUuidQueryParam(req, 'agency_id');
    const search = parseStringQueryParam(req, 'search');

    if (requestedAgencyId && !canAccessAgency(scope, requestedAgencyId)) {
      return toScopeError(res, 'Access denied for the requested agency.');
    }

    let query = supabase.from('agencies').select('*').order('created_at', { ascending: false });

    if (requestedAgencyId) {
      query = query.eq('id', requestedAgencyId);
    } else if (!scope.isGlobal) {
      if (scope.agencyIds.length === 0) {
        return res.json({ data: [] });
      }
      query = query.in('id', scope.agencyIds);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,address.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch agency directory', details: error.message });
    }

    return res.json({ data: data || [] });
  } catch (error) {
    next(error);
  }
}

export async function deleteAgencyDirectory(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) return res.status(400).json({ error: 'Invalid agency id' });

    const scope = await resolveAdminScope(req);
    if (!canAccessAgency(scope, id)) {
      return toScopeError(res, 'Access denied for the selected agency.');
    }

    const { data: existing, error: existingError } = await supabase
      .from('agencies')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (existingError) {
      return res.status(500).json({ error: 'Failed to load agency directory record', details: existingError.message });
    }
    if (!existing) return res.status(404).json({ error: 'Agency not found' });

    const { error } = await supabase.from('agencies').delete().eq('id', id);
    if (error) {
      return res.status(500).json({ error: 'Failed to delete agency directory record', details: error.message });
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function listAgencyStaff(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const requestedAgencyId = parseUuidQueryParam(req, 'agency_id');

    if (requestedAgencyId && !canAccessAgency(scope, requestedAgencyId)) {
      return toScopeError(res, 'Access denied for the requested agency.');
    }

    let query = supabase.from('agency_staff').select('*').order('created_at', { ascending: false });

    if (requestedAgencyId) {
      query = query.eq('agency_id', requestedAgencyId);
    } else if (!scope.isGlobal) {
      if (scope.agencyIds.length === 0) return res.json({ data: [] });
      query = query.in('agency_id', scope.agencyIds);
    }

    const { data, error } = await query;
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch agency staff', details: error.message });
    }

    return res.json({ data: data || [] });
  } catch (error) {
    next(error);
  }
}

export async function createAgencyStaff(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const payload = { ...(req.body || {}) };

    const effectiveAgencyId = withScopeFallbackAgency(scope, payload);
    const agencyScope = await ensureAgencyScope(scope, effectiveAgencyId);
    if (!agencyScope.ok) {
      return toScopeError(res, agencyScope.reason);
    }
    payload.agency_id = agencyScope.agencyId;

    payload.created_by = req.user?.id || req.userProfile?.id || null;
    payload.updated_by = req.user?.id || req.userProfile?.id || null;

    const { data, error } = await supabase
      .from('agency_staff')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to create agency staff record', details: error.message });
    }

    return res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
}

export async function updateAgencyStaff(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) return res.status(400).json({ error: 'Invalid staff id' });

    const scope = await resolveAdminScope(req);
    const payload = { ...(req.body || {}) };

    const { data: existing, error: existingError } = await supabase
      .from('agency_staff')
      .select('id, agency_id')
      .eq('id', id)
      .maybeSingle();

    if (existingError) {
      return res.status(500).json({ error: 'Failed to load agency staff record', details: existingError.message });
    }
    if (!existing) return res.status(404).json({ error: 'Agency staff record not found' });
    if (!isUuid(existing.agency_id) || !canAccessAgency(scope, existing.agency_id)) {
      return toScopeError(res, 'Access denied for the selected agency.');
    }

    if (isUuid(payload.agency_id) && !canAccessAgency(scope, payload.agency_id)) {
      return toScopeError(res, 'Access denied for the selected agency.');
    }

    payload.updated_by = req.user?.id || req.userProfile?.id || null;
    payload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('agency_staff')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update agency staff record', details: error.message });
    }

    return res.json({ data });
  } catch (error) {
    next(error);
  }
}

export async function deleteAgencyStaff(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) return res.status(400).json({ error: 'Invalid staff id' });

    const scope = await resolveAdminScope(req);
    const { data: existing, error: existingError } = await supabase
      .from('agency_staff')
      .select('id, agency_id')
      .eq('id', id)
      .maybeSingle();

    if (existingError) {
      return res.status(500).json({ error: 'Failed to load agency staff record', details: existingError.message });
    }
    if (!existing) return res.status(404).json({ error: 'Agency staff record not found' });
    if (!isUuid(existing.agency_id) || !canAccessAgency(scope, existing.agency_id)) {
      return toScopeError(res, 'Access denied for the selected agency.');
    }

    const { error } = await supabase.from('agency_staff').delete().eq('id', id);
    if (error) {
      return res.status(500).json({ error: 'Failed to delete agency staff record', details: error.message });
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function listAgencyServices(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const requestedAgencyId = parseUuidQueryParam(req, 'agency_id');

    if (requestedAgencyId && !canAccessAgency(scope, requestedAgencyId)) {
      return toScopeError(res, 'Access denied for the requested agency.');
    }

    let query = supabase.from('agency_services').select('*').order('created_at', { ascending: false });

    if (requestedAgencyId) {
      query = query.eq('agency_id', requestedAgencyId);
    } else if (!scope.isGlobal) {
      if (scope.agencyIds.length === 0) return res.json({ data: [] });
      query = query.in('agency_id', scope.agencyIds);
    }

    const { data, error } = await query;
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch agency services', details: error.message });
    }

    return res.json({ data: data || [] });
  } catch (error) {
    next(error);
  }
}

export async function createAgencyService(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const payload = { ...(req.body || {}) };

    const effectiveAgencyId = withScopeFallbackAgency(scope, payload);
    const agencyScope = await ensureAgencyScope(scope, effectiveAgencyId);
    if (!agencyScope.ok) return toScopeError(res, agencyScope.reason);
    payload.agency_id = agencyScope.agencyId;

    const { data, error } = await supabase
      .from('agency_services')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to create agency service', details: error.message });
    }

    return res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
}

export async function updateAgencyService(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) return res.status(400).json({ error: 'Invalid service id' });

    const scope = await resolveAdminScope(req);
    const payload = { ...(req.body || {}) };

    const { data: existing, error: existingError } = await supabase
      .from('agency_services')
      .select('id, agency_id')
      .eq('id', id)
      .maybeSingle();

    if (existingError) {
      return res.status(500).json({ error: 'Failed to load agency service', details: existingError.message });
    }
    if (!existing) return res.status(404).json({ error: 'Agency service not found' });
    if (!isUuid(existing.agency_id) || !canAccessAgency(scope, existing.agency_id)) {
      return toScopeError(res, 'Access denied for the selected agency.');
    }

    if (isUuid(payload.agency_id) && !canAccessAgency(scope, payload.agency_id)) {
      return toScopeError(res, 'Access denied for the selected agency.');
    }

    payload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('agency_services')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update agency service', details: error.message });
    }

    return res.json({ data });
  } catch (error) {
    next(error);
  }
}

export async function deleteAgencyService(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) return res.status(400).json({ error: 'Invalid service id' });

    const scope = await resolveAdminScope(req);
    const { data: existing, error: existingError } = await supabase
      .from('agency_services')
      .select('id, agency_id')
      .eq('id', id)
      .maybeSingle();

    if (existingError) {
      return res.status(500).json({ error: 'Failed to load agency service', details: existingError.message });
    }
    if (!existing) return res.status(404).json({ error: 'Agency service not found' });
    if (!isUuid(existing.agency_id) || !canAccessAgency(scope, existing.agency_id)) {
      return toScopeError(res, 'Access denied for the selected agency.');
    }

    const { error } = await supabase.from('agency_services').delete().eq('id', id);
    if (error) {
      return res.status(500).json({ error: 'Failed to delete agency service', details: error.message });
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function listAgencyFinance(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const requestedAgencyId = parseUuidQueryParam(req, 'agency_id');

    if (requestedAgencyId && !canAccessAgency(scope, requestedAgencyId)) {
      return toScopeError(res, 'Access denied for the requested agency.');
    }

    let query = supabase
      .from('agency_transactions')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (requestedAgencyId) {
      query = query.eq('agency_id', requestedAgencyId);
    } else if (!scope.isGlobal) {
      if (scope.agencyIds.length === 0) return res.json({ data: [] });
      query = query.in('agency_id', scope.agencyIds);
    }

    const { data, error } = await query;
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch agency finance transactions', details: error.message });
    }

    return res.json({ data: data || [] });
  } catch (error) {
    next(error);
  }
}

export async function createAgencyFinance(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const payload = { ...(req.body || {}) };

    const effectiveAgencyId = withScopeFallbackAgency(scope, payload);
    const agencyScope = await ensureAgencyScope(scope, effectiveAgencyId);
    if (!agencyScope.ok) return toScopeError(res, agencyScope.reason);
    payload.agency_id = agencyScope.agencyId;

    const { data, error } = await supabase
      .from('agency_transactions')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to create agency finance transaction', details: error.message });
    }

    return res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
}

export async function updateAgencyFinance(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) return res.status(400).json({ error: 'Invalid finance record id' });

    const scope = await resolveAdminScope(req);
    const payload = { ...(req.body || {}) };

    const { data: existing, error: existingError } = await supabase
      .from('agency_transactions')
      .select('id, agency_id')
      .eq('id', id)
      .maybeSingle();

    if (existingError) {
      return res.status(500).json({ error: 'Failed to load agency finance transaction', details: existingError.message });
    }
    if (!existing) return res.status(404).json({ error: 'Agency finance transaction not found' });
    if (!isUuid(existing.agency_id) || !canAccessAgency(scope, existing.agency_id)) {
      return toScopeError(res, 'Access denied for the selected agency.');
    }
    if (isUuid(payload.agency_id) && !canAccessAgency(scope, payload.agency_id)) {
      return toScopeError(res, 'Access denied for the selected agency.');
    }

    const { data, error } = await supabase
      .from('agency_transactions')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update agency finance transaction', details: error.message });
    }

    return res.json({ data });
  } catch (error) {
    next(error);
  }
}

export async function listAgencyDocuments(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const requestedAgencyId = parseUuidQueryParam(req, 'agency_id');

    if (requestedAgencyId && !canAccessAgency(scope, requestedAgencyId)) {
      return toScopeError(res, 'Access denied for the requested agency.');
    }

    let query = supabase
      .from('agency_documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (requestedAgencyId) {
      query = query.eq('agency_id', requestedAgencyId);
    } else if (!scope.isGlobal) {
      if (scope.agencyIds.length === 0) return res.json({ data: [] });
      query = query.in('agency_id', scope.agencyIds);
    }

    const { data, error } = await query;
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch agency documents', details: error.message });
    }

    return res.json({ data: data || [] });
  } catch (error) {
    next(error);
  }
}

export async function createAgencyDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const payload = { ...(req.body || {}) };

    const effectiveAgencyId = withScopeFallbackAgency(scope, payload);
    const agencyScope = await ensureAgencyScope(scope, effectiveAgencyId);
    if (!agencyScope.ok) return toScopeError(res, agencyScope.reason);
    payload.agency_id = agencyScope.agencyId;
    payload.uploaded_by = req.user?.id || req.userProfile?.id || null;
    payload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('agency_documents')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to create agency document', details: error.message });
    }

    return res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
}

export async function updateAgencyDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) return res.status(400).json({ error: 'Invalid document id' });

    const scope = await resolveAdminScope(req);
    const payload = { ...(req.body || {}) };

    const { data: existing, error: existingError } = await supabase
      .from('agency_documents')
      .select('id, agency_id')
      .eq('id', id)
      .maybeSingle();

    if (existingError) {
      return res.status(500).json({ error: 'Failed to load agency document', details: existingError.message });
    }
    if (!existing) return res.status(404).json({ error: 'Agency document not found' });
    if (!isUuid(existing.agency_id) || !canAccessAgency(scope, existing.agency_id)) {
      return toScopeError(res, 'Access denied for the selected agency.');
    }
    if (isUuid(payload.agency_id) && !canAccessAgency(scope, payload.agency_id)) {
      return toScopeError(res, 'Access denied for the selected agency.');
    }

    payload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('agency_documents')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update agency document', details: error.message });
    }

    return res.json({ data });
  } catch (error) {
    next(error);
  }
}

export async function deleteAgencyDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) return res.status(400).json({ error: 'Invalid document id' });

    const scope = await resolveAdminScope(req);
    const { data: existing, error: existingError } = await supabase
      .from('agency_documents')
      .select('id, agency_id')
      .eq('id', id)
      .maybeSingle();

    if (existingError) {
      return res.status(500).json({ error: 'Failed to load agency document', details: existingError.message });
    }
    if (!existing) return res.status(404).json({ error: 'Agency document not found' });
    if (!isUuid(existing.agency_id) || !canAccessAgency(scope, existing.agency_id)) {
      return toScopeError(res, 'Access denied for the selected agency.');
    }

    const { error } = await supabase.from('agency_documents').delete().eq('id', id);
    if (error) {
      return res.status(500).json({ error: 'Failed to delete agency document', details: error.message });
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}
