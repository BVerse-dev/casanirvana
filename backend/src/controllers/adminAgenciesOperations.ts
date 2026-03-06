import { randomUUID } from 'crypto';
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

const normalizeOptionalString = (value: unknown) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeStringArray = (value: unknown) =>
  Array.isArray(value)
    ? value
        .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
        .filter((entry) => entry.length > 0)
    : [];

const normalizeOptionalNumber = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const extractYear = (value: unknown) => {
  const normalized = normalizeOptionalString(value);
  if (!normalized) return null;
  const match = normalized.match(/^(\d{4})/);
  if (!match) return null;
  return Number(match[1]);
};

const toAgencyProfileType = (value: string | null) => {
  if (!value) return null;
  switch (value.toUpperCase()) {
    case 'RESIDENTIAL':
      return 'residential';
    case 'COMMERCIAL':
      return 'commercial';
    case 'MIXED':
      return 'mixed';
    default:
      return value.toLowerCase();
  }
};

async function rollbackCreatedAgency(agencyId: string) {
  if (!isUuid(agencyId)) return;

  await supabase.from('communities').delete().eq('agency_id', agencyId);
  await supabase.from('agency_profiles').delete().eq('id', agencyId);
  await supabase.from('agencies').delete().eq('id', agencyId);
}

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

export async function createAgencyDirectory(req: Request, res: Response, next: NextFunction) {
  let agencyId: string | null = null;

  try {
    const scope = await resolveAdminScope(req);
    if (!scope.isGlobal) {
      return toScopeError(res, 'Only platform administrators can create agencies.');
    }

    const payload = { ...(req.body || {}) };
    const agencyName = normalizeOptionalString(payload.agency_name);
    const agencyEmail = normalizeOptionalString(payload.email)?.toLowerCase() || null;
    const agencyPhone = normalizeOptionalString(payload.phone);
    const agencyType = normalizeOptionalString(payload.agency_type);
    const address = normalizeOptionalString(payload.address);
    const city = normalizeOptionalString(payload.city);
    const state = normalizeOptionalString(payload.state);
    const country = normalizeOptionalString(payload.country);
    const postalCode = normalizeOptionalString(payload.postal_code);
    const contactPersonName = normalizeOptionalString(payload.contact_person_name);
    const contactPersonEmail = normalizeOptionalString(payload.contact_person_email)?.toLowerCase() || null;
    const contactPersonPhone = normalizeOptionalString(payload.contact_person_phone);
    const isActive = payload.is_active !== false;
    const specializations = normalizeStringArray(payload.specializations);
    const languagesSpoken = normalizeStringArray(payload.languages_spoken);
    const certifications = normalizeStringArray(payload.certifications);
    const notificationPreferences = normalizeStringArray(payload.notification_preferences);
    const managedCommunities = Array.isArray(payload.managed_communities) ? payload.managed_communities : [];
    const timestamp = new Date().toISOString();
    const employeeCount = normalizeOptionalNumber(payload.employee_count);

    if (!agencyName || !agencyEmail || !agencyPhone) {
      return res.status(400).json({ error: 'agency_name, email, and phone are required.' });
    }

    const { data: existingByEmail, error: existingByEmailError } = await supabase
      .from('agencies')
      .select('id, name, email')
      .eq('email', agencyEmail)
      .limit(1)
      .maybeSingle();

    if (existingByEmailError) {
      return res.status(500).json({ error: 'Failed to validate existing agency email', details: existingByEmailError.message });
    }

    const { data: existingByName, error: existingByNameError } = await supabase
      .from('agencies')
      .select('id, name, email')
      .eq('name', agencyName)
      .limit(1)
      .maybeSingle();

    if (existingByNameError) {
      return res.status(500).json({ error: 'Failed to validate existing agency name', details: existingByNameError.message });
    }

    if (existingByEmail?.id || existingByName?.id) {
      return res.status(409).json({
        error: 'An agency already exists with this name or email address.',
      });
    }

    agencyId = randomUUID();

    const agencyInsert = {
      id: agencyId,
      name: agencyName,
      email: agencyEmail,
      phone: agencyPhone,
      website: normalizeOptionalString(payload.website),
      description: normalizeOptionalString(payload.description),
      address,
      city,
      state,
      country,
      postal_code: postalCode,
      contact_person_name: contactPersonName,
      contact_person_email: contactPersonEmail,
      contact_person_phone: contactPersonPhone,
      contact_person_position: normalizeOptionalString(payload.contact_person_position),
      establishment_date: normalizeOptionalString(payload.establishment_date),
      agency_type: agencyType,
      facebook_url: normalizeOptionalString(payload.facebook_url),
      instagram_url: normalizeOptionalString(payload.instagram_url),
      twitter_url: normalizeOptionalString(payload.twitter_url),
      linkedin_url: normalizeOptionalString(payload.linkedin_url),
      operating_hours: normalizeOptionalString(payload.operating_hours),
      languages_spoken: languagesSpoken.length > 0 ? languagesSpoken : null,
      specializations: specializations.length > 0 ? specializations : null,
      certifications: certifications.length > 0 ? certifications : null,
      employee_count: employeeCount,
      is_active: isActive,
      notification_preferences: notificationPreferences.length > 0 ? notificationPreferences : null,
      managed_societies: managedCommunities.length,
      updated_at: timestamp,
    };

    const { data: agencyRecord, error: agencyError } = await supabase
      .from('agencies')
      .insert(agencyInsert)
      .select('*')
      .single();

    if (agencyError || !agencyRecord) {
      return res.status(500).json({ error: 'Failed to create agency directory record', details: agencyError?.message || 'Unknown error' });
    }

    const { data: agencyProfile, error: profileError } = await supabase
      .from('agency_profiles')
      .insert({
        id: agencyId,
        name: agencyName,
        address: address || '',
        city: city || '',
        state: state || '',
        pincode: postalCode || '',
        agency_type: toAgencyProfileType(agencyType),
        description: normalizeOptionalString(payload.description),
        email: agencyEmail,
        established_year: extractYear(payload.establishment_date),
        phone: agencyPhone,
        website: normalizeOptionalString(payload.website),
        owner_name: contactPersonName,
        manager_name: contactPersonName,
        contact_persons:
          contactPersonName || contactPersonEmail || contactPersonPhone
            ? [
                {
                  name: contactPersonName,
                  email: contactPersonEmail,
                  phone: contactPersonPhone,
                  position: normalizeOptionalString(payload.contact_person_position),
                  is_primary: true,
                },
              ]
            : null,
        specializations: specializations.length > 0 ? specializations : null,
        total_agents: employeeCount,
        total_properties: managedCommunities.length,
        status: isActive ? 'active' : 'inactive',
        updated_at: timestamp,
      })
      .select('*')
      .single();

    if (profileError || !agencyProfile) {
      await rollbackCreatedAgency(agencyId);
      return res.status(500).json({ error: 'Failed to create agency profile record', details: profileError?.message || 'Unknown error' });
    }

    const communityRows = managedCommunities.map((community) => {
      const row = community as Record<string, unknown>;
      return {
        name: normalizeOptionalString(row.community_name),
        address: normalizeOptionalString(row.address),
        city: normalizeOptionalString(row.city),
        state: normalizeOptionalString(row.state),
        country: normalizeOptionalString(row.country),
        description: normalizeOptionalString(row.description),
        established_year: normalizeOptionalString(row.established_date),
      };
    });

    const populatedCommunities = communityRows.filter((community) => community.name);
    let createdCommunities: Array<Record<string, unknown>> = [];

    if (populatedCommunities.length > 0) {
      const { data, error } = await supabase
        .from('communities')
        .insert(
          populatedCommunities.map((community) => ({
            agency_id: agencyId,
            name: community.name as string,
            address: community.address,
            city: community.city,
            state: community.state,
            country: community.country,
            description: community.description,
            established_year: community.established_year,
            status: isActive ? 'active' : 'inactive',
          }))
        )
        .select('id, name, agency_id');

      if (error) {
        await rollbackCreatedAgency(agencyId);
        return res.status(500).json({ error: 'Failed to create managed communities', details: error.message });
      }

      createdCommunities = (data || []) as Array<Record<string, unknown>>;
    }

    return res.status(201).json({
      data: {
        agency: agencyRecord,
        profile: agencyProfile,
        communities: createdCommunities,
      },
      message: 'Agency created successfully.',
    });
  } catch (error) {
    if (agencyId) {
      await rollbackCreatedAgency(agencyId);
    }
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
