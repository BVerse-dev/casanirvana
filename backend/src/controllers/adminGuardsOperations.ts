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

type GuardIdentity = {
  id: string;
  user_id: string | null;
  community_id: string | null;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  status?: string | null;
  is_active?: boolean | null;
};

type GuardAssignmentScope = {
  id: string;
  guard_id: string;
  community_id: string;
  assignment_name: string | null;
  assigned_gate: string | null;
  shift_type: string | null;
};

const ACTIVE_GUARD_ASSIGNMENT_STATUS = 'active';
const DEFAULT_GUARD_WORK_DAYS = [0, 1, 2, 3, 4, 5, 6];

const buildGuardDisplayName = (guard: Partial<GuardIdentity>) => {
  const fullName = String(guard.full_name || '').trim();
  if (fullName) return fullName;

  const firstName = String(guard.first_name || '').trim();
  const lastName = String(guard.last_name || '').trim();
  const joined = `${firstName} ${lastName}`.trim();
  if (joined) return joined;

  return String(guard.email || guard.id || 'Guard');
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const buildAssignmentShiftType = (shiftType?: string | null) => {
  const normalized = String(shiftType || '').trim().toLowerCase();
  if (normalized === 'night') return 'night';
  if (normalized === 'rotating') return 'rotating';
  return 'day';
};

const buildShiftWindow = (shiftType?: string | null) => {
  const normalized = String(shiftType || '').trim().toLowerCase();
  if (normalized === 'night') {
    return { start: '22:00', end: '06:00' };
  }
  if (normalized === 'evening') {
    return { start: '14:00', end: '22:00' };
  }
  return { start: '06:00', end: '14:00' };
};

async function waitForUserRecord(userId: string, maxAttempts = 12, delayMs = 500) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const { data, error } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load invited user: ${error.message}`);
    }

    if (data) {
      return data;
    }

    await sleep(delayMs);
  }

  return null;
}

async function rollbackProvisionedGuard(authUserId: string | null) {
  if (!isUuid(authUserId)) return;

  const { data: guardRows } = await supabase.from('guards').select('id').eq('user_id', authUserId);
  const guardIds = (guardRows || [])
    .map((row) => (isUuid(row.id) ? row.id : null))
    .filter((value): value is string => Boolean(value));

  if (guardIds.length > 0) {
    await supabase.from('guard_assignments').delete().in('guard_id', guardIds);
  }
  await supabase.from('guards').delete().eq('user_id', authUserId);
  await supabase.from('profiles').delete().eq('id', authUserId);
  await supabase.from('users').delete().eq('id', authUserId);
  await supabase.auth.admin.deleteUser(authUserId).catch(() => undefined);
}

async function getGuardIdentity(guardId: string): Promise<GuardIdentity | null> {
  if (!isUuid(guardId)) return null;

  const { data, error } = await supabase
    .from('guards')
    .select('id, user_id, community_id, full_name, first_name, last_name, email, status, is_active')
    .eq('id', guardId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load guard profile: ${error.message}`);
  }

  return (data as GuardIdentity | null) || null;
}

async function getPrimaryGuardAssignment(guardId: string): Promise<GuardAssignmentScope | null> {
  if (!isUuid(guardId)) return null;

  const { data, error } = await supabase
    .from('guard_assignments')
    .select('id, guard_id, community_id, assignment_name, assigned_gate, shift_type')
    .eq('guard_id', guardId)
    .eq('status', ACTIVE_GUARD_ASSIGNMENT_STATUS)
    .order('start_date', { ascending: false })
    .order('updated_at', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load guard assignment scope: ${error.message}`);
  }

  return (data as GuardAssignmentScope | null) || null;
}

async function syncGuardAssignmentScope(guardId: string) {
  const guard = await getGuardIdentity(guardId);
  if (!guard) return;

  const primaryAssignment = await getPrimaryGuardAssignment(guardId);
  const nextCommunityId = isUuid(primaryAssignment?.community_id) ? primaryAssignment.community_id : null;
  const nextAssignmentName = primaryAssignment?.assignment_name || null;

  const { error: guardError } = await supabase
    .from('guards')
    .update({
      community_id: nextCommunityId,
      community_assignment: nextAssignmentName,
      updated_at: new Date().toISOString(),
    })
    .eq('id', guardId);

  if (guardError) {
    throw new Error(`Failed to sync guard scope: ${guardError.message}`);
  }

  if (isUuid(guard.user_id)) {
    const { error: userError } = await supabase
      .from('users')
      .update({
        community_id: nextCommunityId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', guard.user_id);

    if (userError) {
      throw new Error(`Failed to sync user scope: ${userError.message}`);
    }
  }
}

async function canAssignGuardToCommunity(
  scope: Awaited<ReturnType<typeof resolveAdminScope>>,
  guardId: string,
  communityId: string
) {
  if (!isUuid(guardId)) {
    return { ok: false, reason: 'guard_id is required.' as const };
  }
  if (!isUuid(communityId)) {
    return { ok: false, reason: 'community_id is required.' as const };
  }
  if (!canAccessCommunity(scope, communityId)) {
    return { ok: false, reason: 'Access denied for the selected community.' as const };
  }

  const guard = await getGuardIdentity(guardId);
  if (!guard) {
    return { ok: false, reason: 'Guard profile not found.' as const };
  }

  if (!scope.isGlobal && isUuid(guard.community_id) && !canAccessCommunity(scope, guard.community_id)) {
    return { ok: false, reason: 'Access denied for the selected guard.' as const };
  }

  return { ok: true, guard };
}

export async function createGuardProfile(req: Request, res: Response, next: NextFunction) {
  let invitedAuthUserId: string | null = null;

  try {
    const scope = await resolveAdminScope(req);
    const payload = { ...(req.body || {}) };

    const firstName = String(payload.first_name || '').trim();
    const lastName = String(payload.last_name || '').trim();
    const email = String(payload.email || '').trim().toLowerCase();
    const communityId = isUuid(payload.community_id) ? payload.community_id : null;
    const phone = String(payload.phone || '').trim() || null;
    const mobile = String(payload.guard_phone || '').trim() || phone;
    const shiftType = String(payload.shift_type || 'morning').trim().toLowerCase();
    const employmentDate = String(payload.employment_date || '').trim() || new Date().toISOString().slice(0, 10);
    const status = String(payload.status || 'active').trim().toLowerCase();

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: 'first_name, last_name, and email are required.' });
    }
    if (!communityId) {
      return res.status(400).json({ error: 'community_id is required for guard provisioning.' });
    }
    if (!canAccessCommunity(scope, communityId)) {
      return toScopeError(res, 'Access denied for the selected community.');
    }

    const { data: existingUser, error: existingUserError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .maybeSingle();

    if (existingUserError) {
      return res.status(500).json({ error: 'Failed to validate existing guard users', details: existingUserError.message });
    }

    if (existingUser?.id) {
      return res.status(409).json({
        error:
          'A guard account already exists for this email. Use Manage Guards to assign or update the existing record instead.',
      });
    }

    const { data: communityRow, error: communityError } = await supabase
      .from('communities')
      .select('id, name')
      .eq('id', communityId)
      .maybeSingle();

    if (communityError) {
      return res.status(500).json({ error: 'Failed to load selected community', details: communityError.message });
    }
    if (!communityRow) {
      return res.status(404).json({ error: 'Selected community not found.' });
    }

    const redirectTo =
      process.env.GUARD_INVITE_REDIRECT_URL ||
      process.env.ADMIN_INVITE_REDIRECT_URL ||
      process.env.SUPABASE_INVITE_REDIRECT_URL ||
      undefined;

    const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: {
        first_name: firstName,
        last_name: lastName,
        role: 'guard',
      },
    });

    if (inviteError || !inviteData.user) {
      const inviteMessage = inviteError?.message || 'Supabase invite flow did not return a user.';
      const duplicateInvite =
        inviteError &&
        /already exists|already registered|email address has already been registered/i.test(inviteMessage);

      return res.status(duplicateInvite ? 409 : 500).json({
        error: 'Failed to send guard invite',
        details: inviteMessage,
      });
    }

    invitedAuthUserId = inviteData.user.id;

    if (!(await waitForUserRecord(invitedAuthUserId))) {
      throw new Error('Invited auth user was created, but public.users sync did not complete.');
    }

    const fullName = `${firstName} ${lastName}`.trim();
    const phoneNumber = mobile || phone;

    const { error: userUpdateError } = await supabase
      .from('users')
      .update({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        phone_number: phoneNumber,
        role: 'guard',
        community_id: communityId,
        address: payload.address || null,
        date_of_birth: payload.date_of_birth || null,
      })
      .eq('id', invitedAuthUserId);

    if (userUpdateError) {
      throw new Error(`Failed to update invited user record: ${userUpdateError.message}`);
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(
        {
          id: invitedAuthUserId,
          user_id: invitedAuthUserId,
          first_name: firstName,
          last_name: lastName,
          full_name: fullName,
          email,
          phone,
          role: 'guard',
          status,
          is_active: status === 'active',
          community_id: communityId,
          address: payload.address || '',
          city: '',
          state: '',
          pincode: '',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (profileError) {
      throw new Error(`Failed to upsert guard profile: ${profileError.message}`);
    }

    const { data: existingGuard, error: existingGuardError } = await supabase
      .from('guards')
      .select('id, user_id')
      .eq('user_id', invitedAuthUserId)
      .maybeSingle();

    if (existingGuardError) {
      throw new Error(`Failed to load existing guard row: ${existingGuardError.message}`);
    }

    const guardPayload = {
      user_id: invitedAuthUserId,
      first_name: firstName,
      last_name: lastName,
      full_name: fullName,
      display_name: fullName,
      email,
      phone,
      mobile,
      address: payload.address || null,
      date_of_birth: payload.date_of_birth || null,
      license_number: payload.license_number || null,
      employment_date: employmentDate,
      shift_type: shiftType,
      shift_start_time: payload.shift_start_time || null,
      shift_end_time: payload.shift_end_time || null,
      gate_assignment: payload.gate_assignment || null,
      salary: payload.salary ?? null,
      emergency_contact_name: payload.emergency_contact_name || null,
      emergency_contact_phone: payload.emergency_contact_phone || null,
      status,
      is_active: status === 'active',
      role: 'GUARD',
      community_id: communityId,
      updated_at: new Date().toISOString(),
    };

    const guardResponse = existingGuard?.id
      ? await supabase.from('guards').update(guardPayload).eq('id', existingGuard.id).select('*').single()
      : await supabase.from('guards').insert(guardPayload).select('*').single();

    if (guardResponse.error || !guardResponse.data) {
      throw new Error(`Failed to provision guard record: ${guardResponse.error?.message || 'Unknown error'}`);
    }

    const guardRecord = guardResponse.data;
    const defaultShiftWindow = buildShiftWindow(shiftType);
    const assignmentName =
      String(payload.assignment_name || '').trim() ||
      [payload.gate_assignment || null, communityRow.name || null].filter(Boolean).join(' - ') ||
      `${communityRow.name} Guard Assignment`;

    const assignmentPayload = {
      guard_id: guardRecord.id,
      community_id: communityId,
      assignment_name: assignmentName,
      shift_type: buildAssignmentShiftType(shiftType),
      start_time: payload.shift_start_time || defaultShiftWindow.start,
      end_time: payload.shift_end_time || defaultShiftWindow.end,
      days_of_week: DEFAULT_GUARD_WORK_DAYS,
      start_date: employmentDate,
      end_date: null,
      assigned_gate: payload.gate_assignment || null,
      assigned_location: payload.gate_assignment || null,
      status: ACTIVE_GUARD_ASSIGNMENT_STATUS,
      current_status: 'off_duty',
      is_permanent: true,
      is_temporary: false,
      special_instructions: payload.special_instructions || null,
    };

    const { data: existingAssignment } = await supabase
      .from('guard_assignments')
      .select('id')
      .eq('guard_id', guardRecord.id)
      .eq('status', ACTIVE_GUARD_ASSIGNMENT_STATUS)
      .eq('community_id', communityId)
      .order('start_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    const assignmentResponse = existingAssignment?.id
      ? await supabase
          .from('guard_assignments')
          .update({ ...assignmentPayload, updated_at: new Date().toISOString() })
          .eq('id', existingAssignment.id)
          .select('*')
          .single()
      : await supabase.from('guard_assignments').insert(assignmentPayload).select('*').single();

    if (assignmentResponse.error || !assignmentResponse.data) {
      throw new Error(
        `Failed to provision initial guard assignment: ${assignmentResponse.error?.message || 'Unknown error'}`
      );
    }

    await syncGuardAssignmentScope(guardRecord.id);

    return res.status(201).json({
      data: {
        invite: inviteData.user,
        guard: guardRecord,
        assignment: assignmentResponse.data,
      },
      message: 'Guard invited and assigned successfully.',
    });
  } catch (error) {
    if (invitedAuthUserId) {
      await rollbackProvisionedGuard(invitedAuthUserId);
    }
    next(error);
  }
}

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
      const scopedGuardIds = await getScopedGuardIds(scope);
      if (scopedGuardIds.length === 0) {
        return res.json({ data: [] });
      }
      query = query.in('id', scopedGuardIds);
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

    const rows = data || [];
    if (rows.length === 0) {
      return res.json({ data: [] });
    }

    const guardIds = rows
      .map((row) => (isUuid(row.id) ? row.id : null))
      .filter((value): value is string => Boolean(value));

    const { data: assignmentRows, error: assignmentError } = await supabase
      .from('guard_assignments')
      .select('id, guard_id, community_id, assignment_name, assigned_gate, shift_type')
      .in('guard_id', guardIds)
      .eq('status', ACTIVE_GUARD_ASSIGNMENT_STATUS)
      .order('start_date', { ascending: false })
      .order('updated_at', { ascending: false })
      .order('created_at', { ascending: false });

    if (assignmentError) {
      return res.status(500).json({ error: 'Failed to fetch guard assignment summary', details: assignmentError.message });
    }

    const activeAssignmentByGuard = new Map<string, GuardAssignmentScope>();
    for (const assignment of assignmentRows || []) {
      if (isUuid(assignment.guard_id) && !activeAssignmentByGuard.has(assignment.guard_id)) {
        activeAssignmentByGuard.set(assignment.guard_id, assignment as GuardAssignmentScope);
      }
    }

    const communityIds = Array.from(
      new Set(
        rows
          .map((row) => row.community_id)
          .concat((assignmentRows || []).map((assignment) => assignment.community_id))
          .filter((value): value is string => isUuid(value))
      )
    );

    const { data: communityRows, error: communityError } =
      communityIds.length > 0
        ? await supabase.from('communities').select('id, name').in('id', communityIds)
        : { data: [], error: null };

    if (communityError) {
      return res.status(500).json({ error: 'Failed to fetch guard communities', details: communityError.message });
    }

    const communityMap = new Map((communityRows || []).map((community) => [community.id, community.name]));

    const mappedRows = rows.map((row) => {
      const activeAssignment = activeAssignmentByGuard.get(row.id);
      const resolvedCommunityId = isUuid(row.community_id)
        ? row.community_id
        : isUuid(activeAssignment?.community_id)
          ? activeAssignment.community_id
          : null;
      const resolvedCommunityName =
        (resolvedCommunityId ? communityMap.get(resolvedCommunityId) : null) ||
        row.communities?.name ||
        null;
      const isActive =
        row.is_active !== false && String(row.status || 'active').toLowerCase() === 'active';
      const assignmentStatus = !isActive
        ? 'inactive'
        : resolvedCommunityId
          ? 'assigned'
          : 'awaiting_assignment';

      return {
        ...row,
        full_name: buildGuardDisplayName(row),
        resolved_community_id: resolvedCommunityId,
        resolved_community_name: resolvedCommunityName,
        active_assignment_id: activeAssignment?.id || null,
        active_assignment_name: activeAssignment?.assignment_name || null,
        active_assignment_gate: activeAssignment?.assigned_gate || null,
        active_assignment_shift_type: activeAssignment?.shift_type || null,
        assignment_status: assignmentStatus,
        assignment_status_label:
          assignmentStatus === 'awaiting_assignment'
            ? 'Awaiting Assignment'
            : assignmentStatus === 'inactive'
              ? 'Inactive'
              : 'Assigned',
      };
    });

    return res.json({ data: mappedRows });
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
    const assignmentScope = await canAssignGuardToCommunity(scope, payload.guard_id, payload.community_id);
    if (!assignmentScope.ok) {
      return toScopeError(res, assignmentScope.reason);
    }

    const { data, error } = await supabase
      .from('guard_assignments')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to create guard assignment', details: error.message });
    }

    await syncGuardAssignmentScope(payload.guard_id);

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

    const nextGuardId = isUuid(payload.guard_id) ? payload.guard_id : existing.guard_id;
    const nextCommunityId = isUuid(payload.community_id) ? payload.community_id : existing.community_id;

    const assignmentScope = await canAssignGuardToCommunity(scope, nextGuardId, nextCommunityId);
    if (!assignmentScope.ok) {
      return toScopeError(res, assignmentScope.reason);
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

    if (isUuid(existing.guard_id)) {
      await syncGuardAssignmentScope(existing.guard_id);
    }
    if (isUuid(data?.guard_id) && data.guard_id !== existing.guard_id) {
      await syncGuardAssignmentScope(data.guard_id);
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
      .select('id, community_id, guard_id')
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

    const guardId = existing.guard_id;

    const { error } = await supabase.from('guard_assignments').delete().eq('id', id);
    if (error) {
      return res.status(500).json({ error: 'Failed to delete guard assignment', details: error.message });
    }

    if (isUuid(guardId)) {
      await syncGuardAssignmentScope(guardId);
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
