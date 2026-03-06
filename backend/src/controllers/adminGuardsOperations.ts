import { NextFunction, Request, Response } from 'express';

import { supabase } from '../lib/supabase';
import {
  canAccessCommunity,
  getScopedGuardIds,
  isUuid,
  resolveAdminScope,
  resolveGuardCommunityId,
} from '../services/adminScope';

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

async function ensureGuardScope(scope: Awaited<ReturnType<typeof resolveAdminScope>>, guardId: string) {
  const guardCommunityId = await resolveGuardCommunityId(guardId);
  if (!guardCommunityId) {
    return { ok: false, reason: 'Unable to resolve guard community scope.' as const };
  }
  if (!canAccessCommunity(scope, guardCommunityId)) {
    return { ok: false, reason: 'Access denied for the selected guard.' as const };
  }
  return { ok: true, communityId: guardCommunityId as string };
}

export async function listGuardProfiles(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const requestedCommunityId = parseUuidQueryParam(req, 'community_id');
    const requestedGuardId = parseUuidQueryParam(req, 'guard_id');
    const search = parseStringQueryParam(req, 'search');

    if (requestedCommunityId && !canAccessCommunity(scope, requestedCommunityId)) {
      return toScopeError(res, 'Access denied for the requested community.');
    }
    if (requestedGuardId && !scope.isGlobal) {
      const guardScope = await ensureGuardScope(scope, requestedGuardId);
      if (!guardScope.ok) return toScopeError(res, guardScope.reason);
    }

    let query = supabase
      .from('guards')
      .select(`
        *,
        communities!guards_society_id_fkey (
          id,
          name,
          address
        )
      `)
      .order('created_at', { ascending: false });

    if (requestedCommunityId) {
      query = query.eq('community_id', requestedCommunityId);
    } else if (!scope.isGlobal) {
      if (scope.communityIds.length === 0) {
        return res.json({ data: [] });
      }
      query = query.in('community_id', scope.communityIds);
    }
    if (requestedGuardId) {
      query = query.eq('id', requestedGuardId);
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch guard profiles', details: error.message });
    }

    return res.json({ data: data || [] });
  } catch (error) {
    next(error);
  }
}

export async function deleteGuardProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) {
      return res.status(400).json({ error: 'Invalid guard id' });
    }

    const scope = await resolveAdminScope(req);
    const { data: existing, error: existingError } = await supabase
      .from('guards')
      .select('id, community_id')
      .eq('id', id)
      .maybeSingle();

    if (existingError) {
      return res.status(500).json({ error: 'Failed to load guard profile', details: existingError.message });
    }
    if (!existing) {
      return res.status(404).json({ error: 'Guard profile not found' });
    }
    if (!isUuid(existing.community_id) || !canAccessCommunity(scope, existing.community_id)) {
      return toScopeError(res, 'Access denied for the selected guard.');
    }

    const { error } = await supabase.from('guards').delete().eq('id', id);
    if (error) {
      return res.status(500).json({ error: 'Failed to delete guard profile', details: error.message });
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function listGuardSchedules(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const requestedCommunityId = parseUuidQueryParam(req, 'community_id');
    const requestedGuardId = parseUuidQueryParam(req, 'guard_id');

    if (requestedCommunityId && !canAccessCommunity(scope, requestedCommunityId)) {
      return toScopeError(res, 'Access denied for the requested community.');
    }

    if (requestedGuardId && !scope.isGlobal) {
      const guardScope = await ensureGuardScope(scope, requestedGuardId);
      if (!guardScope.ok) return toScopeError(res, guardScope.reason);
    }

    let query = supabase
      .from('guard_schedules')
      .select('*')
      .order('assigned_date', { ascending: false })
      .order('start_time', { ascending: true });

    if (requestedCommunityId) {
      query = query.eq('community_id', requestedCommunityId);
    } else if (!scope.isGlobal) {
      if (scope.communityIds.length === 0) {
        return res.json({ data: [] });
      }
      query = query.in('community_id', scope.communityIds);
    }

    if (requestedGuardId) {
      query = query.eq('guard_id', requestedGuardId);
    }

    const { data, error } = await query;
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch guard schedules', details: error.message });
    }

    return res.json({ data: data || [] });
  } catch (error) {
    next(error);
  }
}

export async function createGuardSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const payload = { ...(req.body || {}) };

    const guardId = isUuid(payload.guard_id) ? payload.guard_id : null;
    if (!guardId) {
      return res.status(400).json({ error: 'guard_id is required' });
    }

    const derivedCommunityId =
      isUuid(payload.community_id) ? payload.community_id : await resolveGuardCommunityId(guardId);

    if (!derivedCommunityId) {
      return res.status(400).json({ error: 'community_id is required for schedule scope.' });
    }
    if (!canAccessCommunity(scope, derivedCommunityId)) {
      return toScopeError(res, 'Access denied for the selected community.');
    }

    payload.community_id = derivedCommunityId;

    const { data, error } = await supabase
      .from('guard_schedules')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to create guard schedule', details: error.message });
    }

    return res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
}

export async function updateGuardSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) {
      return res.status(400).json({ error: 'Invalid schedule id' });
    }

    const scope = await resolveAdminScope(req);
    const payload = { ...(req.body || {}) };

    const { data: existing, error: existingError } = await supabase
      .from('guard_schedules')
      .select('id, guard_id, community_id')
      .eq('id', id)
      .maybeSingle();

    if (existingError) {
      return res.status(500).json({ error: 'Failed to load guard schedule', details: existingError.message });
    }
    if (!existing) {
      return res.status(404).json({ error: 'Guard schedule not found' });
    }

    const scopeCommunityId =
      (isUuid(existing.community_id) ? existing.community_id : null) ||
      (isUuid(existing.guard_id) ? await resolveGuardCommunityId(existing.guard_id) : null);

    if (!scopeCommunityId || !canAccessCommunity(scope, scopeCommunityId)) {
      return toScopeError(res, 'Access denied for the selected schedule.');
    }

    if (isUuid(payload.guard_id) && !scope.isGlobal) {
      const guardScope = await ensureGuardScope(scope, payload.guard_id);
      if (!guardScope.ok) return toScopeError(res, guardScope.reason);
    }
    if (isUuid(payload.community_id) && !canAccessCommunity(scope, payload.community_id)) {
      return toScopeError(res, 'Access denied for the selected community.');
    }

    payload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('guard_schedules')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update guard schedule', details: error.message });
    }

    return res.json({ data });
  } catch (error) {
    next(error);
  }
}

export async function deleteGuardSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) {
      return res.status(400).json({ error: 'Invalid schedule id' });
    }

    const scope = await resolveAdminScope(req);
    const { data: existing, error: existingError } = await supabase
      .from('guard_schedules')
      .select('id, guard_id, community_id')
      .eq('id', id)
      .maybeSingle();

    if (existingError) {
      return res.status(500).json({ error: 'Failed to load guard schedule', details: existingError.message });
    }
    if (!existing) {
      return res.status(404).json({ error: 'Guard schedule not found' });
    }

    const scopeCommunityId =
      (isUuid(existing.community_id) ? existing.community_id : null) ||
      (isUuid(existing.guard_id) ? await resolveGuardCommunityId(existing.guard_id) : null);

    if (!scopeCommunityId || !canAccessCommunity(scope, scopeCommunityId)) {
      return toScopeError(res, 'Access denied for the selected schedule.');
    }

    const { error } = await supabase.from('guard_schedules').delete().eq('id', id);
    if (error) {
      return res.status(500).json({ error: 'Failed to delete guard schedule', details: error.message });
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function listGuardAssignments(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const requestedCommunityId = parseUuidQueryParam(req, 'community_id');
    const requestedGuardId = parseUuidQueryParam(req, 'guard_id');

    if (requestedCommunityId && !canAccessCommunity(scope, requestedCommunityId)) {
      return toScopeError(res, 'Access denied for the requested community.');
    }

    if (requestedGuardId && !scope.isGlobal) {
      const guardScope = await ensureGuardScope(scope, requestedGuardId);
      if (!guardScope.ok) return toScopeError(res, guardScope.reason);
    }

    let query = supabase
      .from('guard_assignments')
      .select('*')
      .order('start_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (requestedCommunityId) {
      query = query.eq('community_id', requestedCommunityId);
    } else if (!scope.isGlobal) {
      if (scope.communityIds.length === 0) {
        return res.json({ data: [] });
      }
      query = query.in('community_id', scope.communityIds);
    }

    if (requestedGuardId) {
      query = query.eq('guard_id', requestedGuardId);
    }

    const { data, error } = await query;
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch guard assignments', details: error.message });
    }

    return res.json({ data: data || [] });
  } catch (error) {
    next(error);
  }
}

export async function createGuardAssignment(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const payload = { ...(req.body || {}) };

    if (!isUuid(payload.community_id)) {
      return res.status(400).json({ error: 'community_id is required' });
    }
    if (!isUuid(payload.guard_id)) {
      return res.status(400).json({ error: 'guard_id is required' });
    }
    if (!canAccessCommunity(scope, payload.community_id)) {
      return toScopeError(res, 'Access denied for the selected community.');
    }

    if (!scope.isGlobal) {
      const guardScope = await ensureGuardScope(scope, payload.guard_id);
      if (!guardScope.ok) return toScopeError(res, guardScope.reason);
    }

    const { data, error } = await supabase
      .from('guard_assignments')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to create guard assignment', details: error.message });
    }

    return res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
}

export async function updateGuardAssignment(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) {
      return res.status(400).json({ error: 'Invalid assignment id' });
    }

    const scope = await resolveAdminScope(req);
    const payload = { ...(req.body || {}) };

    const { data: existing, error: existingError } = await supabase
      .from('guard_assignments')
      .select('id, guard_id, community_id')
      .eq('id', id)
      .maybeSingle();

    if (existingError) {
      return res.status(500).json({ error: 'Failed to load guard assignment', details: existingError.message });
    }
    if (!existing) {
      return res.status(404).json({ error: 'Guard assignment not found' });
    }
    if (!canAccessCommunity(scope, existing.community_id)) {
      return toScopeError(res, 'Access denied for the selected assignment.');
    }

    if (isUuid(payload.community_id) && !canAccessCommunity(scope, payload.community_id)) {
      return toScopeError(res, 'Access denied for the selected community.');
    }
    if (isUuid(payload.guard_id) && !scope.isGlobal) {
      const guardScope = await ensureGuardScope(scope, payload.guard_id);
      if (!guardScope.ok) return toScopeError(res, guardScope.reason);
    }

    payload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('guard_assignments')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update guard assignment', details: error.message });
    }

    return res.json({ data });
  } catch (error) {
    next(error);
  }
}

export async function deleteGuardAssignment(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) {
      return res.status(400).json({ error: 'Invalid assignment id' });
    }

    const scope = await resolveAdminScope(req);
    const { data: existing, error: existingError } = await supabase
      .from('guard_assignments')
      .select('id, community_id')
      .eq('id', id)
      .maybeSingle();

    if (existingError) {
      return res.status(500).json({ error: 'Failed to load guard assignment', details: existingError.message });
    }
    if (!existing) {
      return res.status(404).json({ error: 'Guard assignment not found' });
    }
    if (!canAccessCommunity(scope, existing.community_id)) {
      return toScopeError(res, 'Access denied for the selected assignment.');
    }

    const { error } = await supabase.from('guard_assignments').delete().eq('id', id);
    if (error) {
      return res.status(500).json({ error: 'Failed to delete guard assignment', details: error.message });
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function listGuardEquipment(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const requestedGuardId = parseUuidQueryParam(req, 'guard_id');

    if (requestedGuardId && !scope.isGlobal) {
      const guardScope = await ensureGuardScope(scope, requestedGuardId);
      if (!guardScope.ok) return toScopeError(res, guardScope.reason);
    }

    let query = supabase
      .from('guard_equipment')
      .select('*')
      .order('created_at', { ascending: false });

    if (requestedGuardId) {
      query = query.eq('assigned_to', requestedGuardId);
    } else if (!scope.isGlobal) {
      const scopedGuardIds = await getScopedGuardIds(scope);
      if (scopedGuardIds.length === 0) {
        return res.json({ data: [] });
      }
      query = query.in('assigned_to', scopedGuardIds);
    }

    const { data, error } = await query;
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch guard equipment', details: error.message });
    }

    return res.json({ data: data || [] });
  } catch (error) {
    next(error);
  }
}

export async function createGuardEquipment(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const payload = { ...(req.body || {}) };

    const assignedGuardId = isUuid(payload.assigned_to) ? payload.assigned_to : null;
    if (!scope.isGlobal && !assignedGuardId) {
      return res.status(400).json({ error: 'assigned_to is required for scoped admins.' });
    }

    if (assignedGuardId && !scope.isGlobal) {
      const guardScope = await ensureGuardScope(scope, assignedGuardId);
      if (!guardScope.ok) return toScopeError(res, guardScope.reason);
    }

    const { data, error } = await supabase
      .from('guard_equipment')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to create guard equipment', details: error.message });
    }

    return res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
}

export async function updateGuardEquipment(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) {
      return res.status(400).json({ error: 'Invalid equipment id' });
    }

    const scope = await resolveAdminScope(req);
    const payload = { ...(req.body || {}) };

    const { data: existing, error: existingError } = await supabase
      .from('guard_equipment')
      .select('id, assigned_to')
      .eq('id', id)
      .maybeSingle();

    if (existingError) {
      return res.status(500).json({ error: 'Failed to load guard equipment', details: existingError.message });
    }
    if (!existing) {
      return res.status(404).json({ error: 'Guard equipment not found' });
    }

    if (!scope.isGlobal) {
      const existingAssigned = isUuid(existing.assigned_to) ? existing.assigned_to : null;
      if (existingAssigned) {
        const guardScope = await ensureGuardScope(scope, existingAssigned);
        if (!guardScope.ok) return toScopeError(res, guardScope.reason);
      }
    }

    if (isUuid(payload.assigned_to) && !scope.isGlobal) {
      const guardScope = await ensureGuardScope(scope, payload.assigned_to);
      if (!guardScope.ok) return toScopeError(res, guardScope.reason);
    }

    payload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('guard_equipment')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update guard equipment', details: error.message });
    }

    return res.json({ data });
  } catch (error) {
    next(error);
  }
}

export async function deleteGuardEquipment(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) {
      return res.status(400).json({ error: 'Invalid equipment id' });
    }

    const scope = await resolveAdminScope(req);
    const { data: existing, error: existingError } = await supabase
      .from('guard_equipment')
      .select('id, assigned_to')
      .eq('id', id)
      .maybeSingle();

    if (existingError) {
      return res.status(500).json({ error: 'Failed to load guard equipment', details: existingError.message });
    }
    if (!existing) {
      return res.status(404).json({ error: 'Guard equipment not found' });
    }

    if (!scope.isGlobal && isUuid(existing.assigned_to)) {
      const guardScope = await ensureGuardScope(scope, existing.assigned_to);
      if (!guardScope.ok) return toScopeError(res, guardScope.reason);
    }

    const { error } = await supabase.from('guard_equipment').delete().eq('id', id);
    if (error) {
      return res.status(500).json({ error: 'Failed to delete guard equipment', details: error.message });
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function listGuardPerformance(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const requestedGuardId = parseUuidQueryParam(req, 'guard_id');

    if (requestedGuardId && !scope.isGlobal) {
      const guardScope = await ensureGuardScope(scope, requestedGuardId);
      if (!guardScope.ok) return toScopeError(res, guardScope.reason);
    }

    let query = supabase
      .from('guard_performance')
      .select('*')
      .order('evaluation_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (requestedGuardId) {
      query = query.eq('guard_id', requestedGuardId);
    } else if (!scope.isGlobal) {
      const scopedGuardIds = await getScopedGuardIds(scope);
      if (scopedGuardIds.length === 0) {
        return res.json({ data: [] });
      }
      query = query.in('guard_id', scopedGuardIds);
    }

    const { data, error } = await query;
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch guard performance', details: error.message });
    }

    return res.json({ data: data || [] });
  } catch (error) {
    next(error);
  }
}

export async function createGuardPerformance(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const payload = { ...(req.body || {}) };

    if (!isUuid(payload.guard_id)) {
      return res.status(400).json({ error: 'guard_id is required' });
    }

    if (!scope.isGlobal) {
      const guardScope = await ensureGuardScope(scope, payload.guard_id);
      if (!guardScope.ok) return toScopeError(res, guardScope.reason);
    }

    const { data, error } = await supabase
      .from('guard_performance')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to create guard performance record', details: error.message });
    }

    return res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
}

export async function updateGuardPerformance(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) {
      return res.status(400).json({ error: 'Invalid performance id' });
    }

    const scope = await resolveAdminScope(req);
    const payload = { ...(req.body || {}) };

    const { data: existing, error: existingError } = await supabase
      .from('guard_performance')
      .select('id, guard_id')
      .eq('id', id)
      .maybeSingle();

    if (existingError) {
      return res.status(500).json({ error: 'Failed to load guard performance record', details: existingError.message });
    }
    if (!existing) {
      return res.status(404).json({ error: 'Guard performance record not found' });
    }

    if (!scope.isGlobal && isUuid(existing.guard_id)) {
      const guardScope = await ensureGuardScope(scope, existing.guard_id);
      if (!guardScope.ok) return toScopeError(res, guardScope.reason);
    }

    if (isUuid(payload.guard_id) && !scope.isGlobal) {
      const guardScope = await ensureGuardScope(scope, payload.guard_id);
      if (!guardScope.ok) return toScopeError(res, guardScope.reason);
    }

    payload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('guard_performance')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update guard performance record', details: error.message });
    }

    return res.json({ data });
  } catch (error) {
    next(error);
  }
}

export async function listGuardTraining(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const requestedGuardId = parseUuidQueryParam(req, 'guard_id');

    if (requestedGuardId && !scope.isGlobal) {
      const guardScope = await ensureGuardScope(scope, requestedGuardId);
      if (!guardScope.ok) return toScopeError(res, guardScope.reason);
    }

    let query = supabase
      .from('guard_training')
      .select('*')
      .order('start_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (requestedGuardId) {
      query = query.eq('guard_id', requestedGuardId);
    } else if (!scope.isGlobal) {
      const scopedGuardIds = await getScopedGuardIds(scope);
      if (scopedGuardIds.length === 0) {
        return res.json({ data: [] });
      }
      query = query.in('guard_id', scopedGuardIds);
    }

    const { data, error } = await query;
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch guard training records', details: error.message });
    }

    return res.json({ data: data || [] });
  } catch (error) {
    next(error);
  }
}

export async function createGuardTraining(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const payload = { ...(req.body || {}) };

    if (!isUuid(payload.guard_id)) {
      return res.status(400).json({ error: 'guard_id is required' });
    }

    if (!scope.isGlobal) {
      const guardScope = await ensureGuardScope(scope, payload.guard_id);
      if (!guardScope.ok) return toScopeError(res, guardScope.reason);
    }

    const { data, error } = await supabase
      .from('guard_training')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to create guard training record', details: error.message });
    }

    return res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
}

export async function updateGuardTraining(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) {
      return res.status(400).json({ error: 'Invalid training id' });
    }

    const scope = await resolveAdminScope(req);
    const payload = { ...(req.body || {}) };

    const { data: existing, error: existingError } = await supabase
      .from('guard_training')
      .select('id, guard_id')
      .eq('id', id)
      .maybeSingle();

    if (existingError) {
      return res.status(500).json({ error: 'Failed to load guard training record', details: existingError.message });
    }
    if (!existing) {
      return res.status(404).json({ error: 'Guard training record not found' });
    }

    if (!scope.isGlobal && isUuid(existing.guard_id)) {
      const guardScope = await ensureGuardScope(scope, existing.guard_id);
      if (!guardScope.ok) return toScopeError(res, guardScope.reason);
    }

    if (isUuid(payload.guard_id) && !scope.isGlobal) {
      const guardScope = await ensureGuardScope(scope, payload.guard_id);
      if (!guardScope.ok) return toScopeError(res, guardScope.reason);
    }

    payload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('guard_training')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update guard training record', details: error.message });
    }

    return res.json({ data });
  } catch (error) {
    next(error);
  }
}
