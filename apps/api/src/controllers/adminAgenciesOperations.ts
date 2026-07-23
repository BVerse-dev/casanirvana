import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';

import { createHttpError } from '../lib/httpError';
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

const toScopeError = (message: string) =>
  createHttpError(403, 'AGENCY_SCOPE_VIOLATION', message);

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

const buildAgencyProfilePayload = (payload: Record<string, any>) => ({
  id: normalizeOptionalString(payload.id),
  name: normalizeOptionalString(payload.name),
  address: normalizeOptionalString(payload.address),
  city: normalizeOptionalString(payload.city),
  state: normalizeOptionalString(payload.state),
  pincode: normalizeOptionalString(payload.pincode),
  agency_type: toAgencyProfileType(normalizeOptionalString(payload.agency_type)),
  category: normalizeOptionalString(payload.category),
  owner_name: normalizeOptionalString(payload.owner_name),
  manager_name: normalizeOptionalString(payload.manager_name),
  license_number: normalizeOptionalString(payload.license_number),
  website: normalizeOptionalString(payload.website),
  description: normalizeOptionalString(payload.description),
  email: normalizeOptionalString(payload.email),
  phone: normalizeOptionalString(payload.phone),
  status: normalizeOptionalString(payload.status),
  established_year: extractYear(payload.established_year),
  commission_rate: normalizeOptionalNumber(payload.commission_rate),
  total_agents: normalizeOptionalNumber(payload.total_agents),
  total_clients: normalizeOptionalNumber(payload.total_clients),
  total_properties: normalizeOptionalNumber(payload.total_properties),
  average_deal_value: normalizeOptionalNumber(payload.average_deal_value),
  account_holder_name: normalizeOptionalString(payload.account_holder_name),
  account_number: normalizeOptionalString(payload.account_number),
  bank_name: normalizeOptionalString(payload.bank_name),
  ifsc_code: normalizeOptionalString(payload.ifsc_code),
  specializations: normalizeStringArray(payload.specializations),
  services: normalizeStringArray(payload.services),
  contact_persons: Array.isArray(payload.contact_persons) ? payload.contact_persons : null,
  documents: Array.isArray(payload.documents) ? payload.documents : null,
});

async function rollbackCreatedAgency(agencyId: string) {
  if (!isUuid(agencyId)) return;

  await supabase.from('communities').delete().eq('agency_id', agencyId);
  await supabase.from('agency_profiles').delete().eq('id', agencyId);
  await supabase.from('agencies').delete().eq('id', agencyId);
}

const formatActivityTimestamp = (value: string | null | undefined) =>
  typeof value === 'string' && value.length > 0 ? value : new Date().toISOString();

const buildAgencyActivityFeed = ({
  communities,
  staff,
  services,
  documents,
  finance,
}: {
  communities: Array<Record<string, any>>;
  staff: Array<Record<string, any>>;
  services: Array<Record<string, any>>;
  documents: Array<Record<string, any>>;
  finance: Array<Record<string, any>>;
}) => {
  const activities = [
    ...communities.map((community) => ({
      id: `community:${community.id}`,
      type: 'community',
      title: community.name || 'Community onboarded',
      description: community.address || community.city || 'Community assigned to agency portfolio.',
      status: community.status || 'active',
      occurred_at: formatActivityTimestamp(community.updated_at || community.created_at),
      href: isUuid(community.id) ? `/communities/details?id=${community.id}` : null,
    })),
    ...staff.map((member) => ({
      id: `staff:${member.id}`,
      type: 'staff',
      title:
        [member.first_name, member.last_name].filter(Boolean).join(' ').trim() || member.email || 'Agency staff record',
      description: member.role ? `${member.role} added to agency staff.` : 'Agency staff record updated.',
      status: member.status || (member.is_active ? 'active' : 'inactive') || 'active',
      occurred_at: formatActivityTimestamp(member.updated_at || member.created_at),
      href: null,
    })),
    ...services.map((service) => ({
      id: `service:${service.id}`,
      type: 'service',
      title: service.service_name || 'Agency service',
      description: service.category ? `${service.category} service catalog entry.` : 'Agency service catalog updated.',
      status: service.status || 'active',
      occurred_at: formatActivityTimestamp(service.updated_at || service.created_at),
      href: null,
    })),
    ...documents.map((document) => ({
      id: `document:${document.id}`,
      type: 'document',
      title: document.name || 'Agency document',
      description: document.category ? `${document.category} document uploaded.` : 'Agency document updated.',
      status: document.status || 'active',
      occurred_at: formatActivityTimestamp(document.updated_at || document.created_at),
      href: null,
    })),
    ...finance.map((entry) => ({
      id: `finance:${entry.id}`,
      type: 'finance',
      title: entry.category || entry.type || 'Finance entry',
      description: entry.description || entry.reference || 'Agency finance ledger updated.',
      status: entry.status || 'completed',
      occurred_at: formatActivityTimestamp(entry.date || entry.created_at),
      href: null,
    })),
  ];

  return activities
    .sort((left, right) => new Date(right.occurred_at).getTime() - new Date(left.occurred_at).getTime())
    .slice(0, 12);
};

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
      return next(toScopeError('Access denied for the requested agency.'));
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
      return next(createHttpError(500, 'AGENCY_PROFILES_LIST_FAILED', 'Failed to fetch agency profiles', error));
    }

    return res.json({ data: data || [] });
  } catch (error) {
    next(error);
  }
}

export async function createAgencyProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const payload = buildAgencyProfilePayload({ ...(req.body || {}) });

    if (!isUuid(payload.id)) {
      return next(createHttpError(400, 'AGENCY_PROFILE_ID_REQUIRED', 'Agency ID is required to create a profile.'));
    }

    const agencyScope = await ensureAgencyScope(scope, payload.id);
    if (!agencyScope.ok) {
      return next(toScopeError(agencyScope.reason));
    }

    const [{ data: agency, error: agencyError }, { data: existing, error: existingError }] = await Promise.all([
      supabase.from('agencies').select('id').eq('id', payload.id).maybeSingle(),
      supabase.from('agency_profiles').select('id').eq('id', payload.id).maybeSingle(),
    ]);

    if (agencyError) {
      return next(createHttpError(500, 'AGENCY_LOOKUP_FAILED', 'Failed to load agency record', agencyError));
    }
    if (!agency) {
      return next(createHttpError(404, 'AGENCY_NOT_FOUND', 'Agency not found for the selected profile id.'));
    }
    if (existingError) {
      return next(
        createHttpError(500, 'AGENCY_PROFILE_STATE_CHECK_FAILED', 'Failed to validate agency profile state', existingError)
      );
    }
    if (existing) {
      return next(createHttpError(409, 'AGENCY_PROFILE_ALREADY_EXISTS', 'Agency profile already exists for this agency.'));
    }

    const { data, error } = await supabase
      .from('agency_profiles')
      .insert({
        ...payload,
        id: payload.id,
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) {
      return next(createHttpError(500, 'AGENCY_PROFILE_CREATE_FAILED', 'Failed to create agency profile', error));
    }

    return res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
}

export async function updateAgencyProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) return next(createHttpError(400, 'AGENCY_PROFILE_ID_INVALID', 'Invalid agency profile id'));

    const scope = await resolveAdminScope(req);
    if (!canAccessAgency(scope, id)) {
      return next(toScopeError('Access denied for the selected agency.'));
    }

    const { data: existing, error: existingError } = await supabase
      .from('agency_profiles')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (existingError) {
      return next(createHttpError(500, 'AGENCY_PROFILE_LOOKUP_FAILED', 'Failed to load agency profile', existingError));
    }
    if (!existing) {
      return next(createHttpError(404, 'AGENCY_PROFILE_NOT_FOUND', 'Agency profile not found'));
    }

    const payload = buildAgencyProfilePayload({ ...(req.body || {}) });
    delete (payload as Record<string, unknown>).id;

    const { data, error } = await supabase
      .from('agency_profiles')
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return next(createHttpError(500, 'AGENCY_PROFILE_UPDATE_FAILED', 'Failed to update agency profile', error));
    }

    return res.json({ data });
  } catch (error) {
    next(error);
  }
}

export async function listAgencyDirectory(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const requestedAgencyId = parseUuidQueryParam(req, 'agency_id');
    const search = parseStringQueryParam(req, 'search');
    const requestedPage = Number(req.query.page || 1);
    const requestedLimit = Number(req.query.limit || 12);
    const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const pageSize = Number.isInteger(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 100) : 12;
    const status = req.query.status === 'active' || req.query.status === 'inactive' ? req.query.status : null;

    if (requestedAgencyId && !canAccessAgency(scope, requestedAgencyId)) {
      return next(toScopeError('Access denied for the requested agency.'));
    }

    let query = supabase.from('agencies').select('*', { count: 'exact' }).order('created_at', { ascending: false });

    if (requestedAgencyId) {
      query = query.eq('id', requestedAgencyId);
    } else if (!scope.isGlobal) {
      if (scope.agencyIds.length === 0) {
        return res.json({ data: [], count: 0, page, pageSize, totalPages: 0 });
      }
      query = query.in('id', scope.agencyIds);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,address.ilike.%${search}%`);
    }

    if (status) {
      query = query.eq('is_active', status === 'active');
    }

    const { data, error, count } = await query.range((page - 1) * pageSize, page * pageSize - 1);
    if (error) {
      return next(createHttpError(500, 'AGENCY_DIRECTORY_LIST_FAILED', 'Failed to fetch agency directory', error));
    }

    const total = count ?? data?.length ?? 0;
    return res.json({ data: data || [], count: total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (error) {
    next(error);
  }
}

export async function createAgencyDirectory(req: Request, res: Response, next: NextFunction) {
  let agencyId: string | null = null;

  try {
    const scope = await resolveAdminScope(req);
    if (!scope.isGlobal) {
      return next(toScopeError('Only platform administrators can create agencies.'));
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
      return next(createHttpError(400, 'AGENCY_DIRECTORY_REQUIRED_FIELDS', 'agency_name, email, and phone are required.'));
    }

    const { data: existingByEmail, error: existingByEmailError } = await supabase
      .from('agencies')
      .select('id, name, email')
      .eq('email', agencyEmail)
      .limit(1)
      .maybeSingle();

    if (existingByEmailError) {
      return next(
        createHttpError(500, 'AGENCY_DIRECTORY_EMAIL_CHECK_FAILED', 'Failed to validate existing agency email', existingByEmailError)
      );
    }

    const { data: existingByName, error: existingByNameError } = await supabase
      .from('agencies')
      .select('id, name, email')
      .eq('name', agencyName)
      .limit(1)
      .maybeSingle();

    if (existingByNameError) {
      return next(
        createHttpError(500, 'AGENCY_DIRECTORY_NAME_CHECK_FAILED', 'Failed to validate existing agency name', existingByNameError)
      );
    }

    if (existingByEmail?.id || existingByName?.id) {
      return next(
        createHttpError(409, 'AGENCY_DIRECTORY_DUPLICATE', 'An agency already exists with this name or email address.')
      );
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
      return next(
        createHttpError(
          500,
          'AGENCY_DIRECTORY_CREATE_FAILED',
          'Failed to create agency directory record',
          agencyError || 'Unknown error'
        )
      );
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
      return next(
        createHttpError(
          500,
          'AGENCY_PROFILE_CREATE_FAILED',
          'Failed to create agency profile record',
          profileError || 'Unknown error'
        )
      );
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
        return next(
          createHttpError(500, 'AGENCY_COMMUNITIES_CREATE_FAILED', 'Failed to create managed communities', error)
        );
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

export async function getAgencyDirectorySummary(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) return next(createHttpError(400, 'AGENCY_ID_INVALID', 'Invalid agency id'));

    const scope = await resolveAdminScope(req);
    if (!canAccessAgency(scope, id)) {
      return next(toScopeError('Access denied for the selected agency.'));
    }

    const [
      agencyResult,
      profileResult,
      communitiesResult,
      staffResult,
      servicesResult,
      documentsResult,
      financeResult,
      amountResult,
    ] = await Promise.all([
      supabase.from('agencies').select('*').eq('id', id).maybeSingle(),
      supabase.from('agency_profiles').select('*').eq('id', id).maybeSingle(),
      supabase
        .from('communities')
        .select('id,name,address,city,state,country,status,created_at,updated_at')
        .eq('agency_id', id)
        .order('created_at', { ascending: false }),
      supabase
        .from('agency_staff')
        .select('id,first_name,last_name,email,role,status,is_active,created_at,updated_at')
        .eq('agency_id', id)
        .order('created_at', { ascending: false }),
      supabase
        .from('agency_services')
        .select('id,service_name,category,status,base_price,rate_type,created_at,updated_at')
        .eq('agency_id', id)
        .order('created_at', { ascending: false }),
      supabase
        .from('agency_documents')
        .select('id,name,category,type,status,uploaded_by_name,created_at,updated_at')
        .eq('agency_id', id)
        .order('created_at', { ascending: false }),
      supabase
        .from('agency_transactions')
        .select('id,date,type,category,amount,status,payment_method,reference,description,created_at')
        .eq('agency_id', id)
        .order('date', { ascending: false }),
      supabase.from('agency_transactions').select('amount').eq('agency_id', id),
    ]);

    if (agencyResult.error) {
      return next(createHttpError(500, 'AGENCY_LOOKUP_FAILED', 'Failed to load agency record', agencyResult.error));
    }
    if (!agencyResult.data) {
      return next(createHttpError(404, 'AGENCY_NOT_FOUND', 'Agency not found'));
    }
    if (profileResult.error) {
      return next(createHttpError(500, 'AGENCY_PROFILE_LOOKUP_FAILED', 'Failed to load agency profile', profileResult.error));
    }
    if (communitiesResult.error) {
      return next(createHttpError(500, 'AGENCY_COMMUNITIES_LOOKUP_FAILED', 'Failed to load agency communities', communitiesResult.error));
    }
    if (staffResult.error) {
      return next(createHttpError(500, 'AGENCY_STAFF_LOOKUP_FAILED', 'Failed to load agency staff', staffResult.error));
    }
    if (servicesResult.error) {
      return next(createHttpError(500, 'AGENCY_SERVICES_LOOKUP_FAILED', 'Failed to load agency services', servicesResult.error));
    }
    if (documentsResult.error) {
      return next(createHttpError(500, 'AGENCY_DOCUMENTS_LOOKUP_FAILED', 'Failed to load agency documents', documentsResult.error));
    }
    if (financeResult.error) {
      return next(createHttpError(500, 'AGENCY_FINANCE_LOOKUP_FAILED', 'Failed to load agency finance entries', financeResult.error));
    }
    if (amountResult.error) {
      return next(createHttpError(500, 'AGENCY_FINANCE_TOTALS_LOOKUP_FAILED', 'Failed to load agency finance totals', amountResult.error));
    }

    const communities = (communitiesResult.data || []) as Array<Record<string, any>>;
    const staff = (staffResult.data || []) as Array<Record<string, any>>;
    const services = (servicesResult.data || []) as Array<Record<string, any>>;
    const documents = (documentsResult.data || []) as Array<Record<string, any>>;
    const finance = (financeResult.data || []) as Array<Record<string, any>>;
    const amounts = (amountResult.data || []) as Array<{ amount: number | string | null }>;

    const unitsCount = communities.length
      ? (
          await supabase
            .from('units')
            .select('id', { head: true, count: 'exact' })
            .in(
              'community_id',
              communities
                .map((community) => community.id)
                .filter((communityId): communityId is string => isUuid(communityId))
            )
        ).count || 0
      : 0;

    const financeTotalAmount = amounts.reduce((total, entry) => {
      const parsed = normalizeOptionalNumber(entry.amount);
      return total + (parsed || 0);
    }, 0);

    return res.json({
      data: {
        agency: agencyResult.data,
        profile: profileResult.data,
        communities,
        staff: staff.slice(0, 10),
        services: services.slice(0, 10),
        documents: documents.slice(0, 10),
        finance: finance.slice(0, 10),
        stats: {
          communities_count: communities.length,
          active_communities_count: communities.filter((community) => community.status === 'active').length,
          inactive_communities_count: communities.filter((community) => community.status && community.status !== 'active').length,
          units_count: unitsCount,
          staff_count: staff.length,
          services_count: services.length,
          documents_count: documents.length,
          finance_entries_count: finance.length,
          finance_total_amount: financeTotalAmount,
        },
        activities: buildAgencyActivityFeed({
          communities,
          staff: staff.slice(0, 5),
          services: services.slice(0, 5),
          documents: documents.slice(0, 5),
          finance: finance.slice(0, 5),
        }),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAgencyDirectory(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) return next(createHttpError(400, 'AGENCY_ID_INVALID', 'Invalid agency id'));

    const scope = await resolveAdminScope(req);
    if (!canAccessAgency(scope, id)) {
      return next(toScopeError('Access denied for the selected agency.'));
    }

    const { data: existing, error: existingError } = await supabase
      .from('agencies')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (existingError) {
      return next(createHttpError(500, 'AGENCY_DIRECTORY_LOOKUP_FAILED', 'Failed to load agency directory record', existingError));
    }
    if (!existing) return next(createHttpError(404, 'AGENCY_NOT_FOUND', 'Agency not found'));

    const { error } = await supabase.from('agencies').delete().eq('id', id);
    if (error) {
      return next(createHttpError(500, 'AGENCY_DIRECTORY_DELETE_FAILED', 'Failed to delete agency directory record', error));
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
      return next(toScopeError('Access denied for the requested agency.'));
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
      return next(createHttpError(500, 'AGENCY_STAFF_LIST_FAILED', 'Failed to fetch agency staff', error));
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
      return next(toScopeError(agencyScope.reason));
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
      return next(createHttpError(500, 'AGENCY_STAFF_CREATE_FAILED', 'Failed to create agency staff record', error));
    }

    return res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
}

export async function updateAgencyStaff(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) return next(createHttpError(400, 'AGENCY_STAFF_ID_INVALID', 'Invalid staff id'));

    const scope = await resolveAdminScope(req);
    const payload = { ...(req.body || {}) };

    const { data: existing, error: existingError } = await supabase
      .from('agency_staff')
      .select('id, agency_id')
      .eq('id', id)
      .maybeSingle();

    if (existingError) {
      return next(createHttpError(500, 'AGENCY_STAFF_LOOKUP_FAILED', 'Failed to load agency staff record', existingError));
    }
    if (!existing) return next(createHttpError(404, 'AGENCY_STAFF_NOT_FOUND', 'Agency staff record not found'));
    if (!isUuid(existing.agency_id) || !canAccessAgency(scope, existing.agency_id)) {
      return next(toScopeError('Access denied for the selected agency.'));
    }

    if (isUuid(payload.agency_id) && !canAccessAgency(scope, payload.agency_id)) {
      return next(toScopeError('Access denied for the selected agency.'));
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
      return next(createHttpError(500, 'AGENCY_STAFF_UPDATE_FAILED', 'Failed to update agency staff record', error));
    }

    return res.json({ data });
  } catch (error) {
    next(error);
  }
}

export async function deleteAgencyStaff(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) return next(createHttpError(400, 'AGENCY_STAFF_ID_INVALID', 'Invalid staff id'));

    const scope = await resolveAdminScope(req);
    const { data: existing, error: existingError } = await supabase
      .from('agency_staff')
      .select('id, agency_id')
      .eq('id', id)
      .maybeSingle();

    if (existingError) {
      return next(createHttpError(500, 'AGENCY_STAFF_LOOKUP_FAILED', 'Failed to load agency staff record', existingError));
    }
    if (!existing) return next(createHttpError(404, 'AGENCY_STAFF_NOT_FOUND', 'Agency staff record not found'));
    if (!isUuid(existing.agency_id) || !canAccessAgency(scope, existing.agency_id)) {
      return next(toScopeError('Access denied for the selected agency.'));
    }

    const { error } = await supabase.from('agency_staff').delete().eq('id', id);
    if (error) {
      return next(createHttpError(500, 'AGENCY_STAFF_DELETE_FAILED', 'Failed to delete agency staff record', error));
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
      return next(toScopeError('Access denied for the requested agency.'));
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
      return next(createHttpError(500, 'AGENCY_SERVICES_LIST_FAILED', 'Failed to fetch agency services', error));
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
    if (!agencyScope.ok) return next(toScopeError(agencyScope.reason));
    payload.agency_id = agencyScope.agencyId;

    const { data, error } = await supabase
      .from('agency_services')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      return next(createHttpError(500, 'AGENCY_SERVICE_CREATE_FAILED', 'Failed to create agency service', error));
    }

    return res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
}

export async function updateAgencyService(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) return next(createHttpError(400, 'AGENCY_SERVICE_ID_INVALID', 'Invalid service id'));

    const scope = await resolveAdminScope(req);
    const payload = { ...(req.body || {}) };

    const { data: existing, error: existingError } = await supabase
      .from('agency_services')
      .select('id, agency_id')
      .eq('id', id)
      .maybeSingle();

    if (existingError) {
      return next(createHttpError(500, 'AGENCY_SERVICE_LOOKUP_FAILED', 'Failed to load agency service', existingError));
    }
    if (!existing) return next(createHttpError(404, 'AGENCY_SERVICE_NOT_FOUND', 'Agency service not found'));
    if (!isUuid(existing.agency_id) || !canAccessAgency(scope, existing.agency_id)) {
      return next(toScopeError('Access denied for the selected agency.'));
    }

    if (isUuid(payload.agency_id) && !canAccessAgency(scope, payload.agency_id)) {
      return next(toScopeError('Access denied for the selected agency.'));
    }

    payload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('agency_services')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return next(createHttpError(500, 'AGENCY_SERVICE_UPDATE_FAILED', 'Failed to update agency service', error));
    }

    return res.json({ data });
  } catch (error) {
    next(error);
  }
}

export async function deleteAgencyService(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) return next(createHttpError(400, 'AGENCY_SERVICE_ID_INVALID', 'Invalid service id'));

    const scope = await resolveAdminScope(req);
    const { data: existing, error: existingError } = await supabase
      .from('agency_services')
      .select('id, agency_id')
      .eq('id', id)
      .maybeSingle();

    if (existingError) {
      return next(createHttpError(500, 'AGENCY_SERVICE_LOOKUP_FAILED', 'Failed to load agency service', existingError));
    }
    if (!existing) return next(createHttpError(404, 'AGENCY_SERVICE_NOT_FOUND', 'Agency service not found'));
    if (!isUuid(existing.agency_id) || !canAccessAgency(scope, existing.agency_id)) {
      return next(toScopeError('Access denied for the selected agency.'));
    }

    const { error } = await supabase.from('agency_services').delete().eq('id', id);
    if (error) {
      return next(createHttpError(500, 'AGENCY_SERVICE_DELETE_FAILED', 'Failed to delete agency service', error));
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
      return next(toScopeError('Access denied for the requested agency.'));
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
      return next(createHttpError(500, 'AGENCY_FINANCE_LIST_FAILED', 'Failed to fetch agency finance transactions', error));
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
    if (!agencyScope.ok) return next(toScopeError(agencyScope.reason));
    payload.agency_id = agencyScope.agencyId;

    const { data, error } = await supabase
      .from('agency_transactions')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      return next(
        createHttpError(500, 'AGENCY_FINANCE_CREATE_FAILED', 'Failed to create agency finance transaction', error)
      );
    }

    return res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
}

export async function updateAgencyFinance(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) return next(createHttpError(400, 'AGENCY_FINANCE_ID_INVALID', 'Invalid finance record id'));

    const scope = await resolveAdminScope(req);
    const payload = { ...(req.body || {}) };

    const { data: existing, error: existingError } = await supabase
      .from('agency_transactions')
      .select('id, agency_id')
      .eq('id', id)
      .maybeSingle();

    if (existingError) {
      return next(
        createHttpError(500, 'AGENCY_FINANCE_LOOKUP_FAILED', 'Failed to load agency finance transaction', existingError)
      );
    }
    if (!existing) return next(createHttpError(404, 'AGENCY_FINANCE_NOT_FOUND', 'Agency finance transaction not found'));
    if (!isUuid(existing.agency_id) || !canAccessAgency(scope, existing.agency_id)) {
      return next(toScopeError('Access denied for the selected agency.'));
    }
    if (isUuid(payload.agency_id) && !canAccessAgency(scope, payload.agency_id)) {
      return next(toScopeError('Access denied for the selected agency.'));
    }

    const { data, error } = await supabase
      .from('agency_transactions')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return next(
        createHttpError(500, 'AGENCY_FINANCE_UPDATE_FAILED', 'Failed to update agency finance transaction', error)
      );
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
      return next(toScopeError('Access denied for the requested agency.'));
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
      return next(createHttpError(500, 'AGENCY_DOCUMENTS_LIST_FAILED', 'Failed to fetch agency documents', error));
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
    if (!agencyScope.ok) return next(toScopeError(agencyScope.reason));
    payload.agency_id = agencyScope.agencyId;
    payload.uploaded_by = req.user?.id || req.userProfile?.id || null;
    payload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('agency_documents')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      return next(createHttpError(500, 'AGENCY_DOCUMENT_CREATE_FAILED', 'Failed to create agency document', error));
    }

    return res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
}

export async function updateAgencyDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) return next(createHttpError(400, 'AGENCY_DOCUMENT_ID_INVALID', 'Invalid document id'));

    const scope = await resolveAdminScope(req);
    const payload = { ...(req.body || {}) };

    const { data: existing, error: existingError } = await supabase
      .from('agency_documents')
      .select('id, agency_id')
      .eq('id', id)
      .maybeSingle();

    if (existingError) {
      return next(createHttpError(500, 'AGENCY_DOCUMENT_LOOKUP_FAILED', 'Failed to load agency document', existingError));
    }
    if (!existing) return next(createHttpError(404, 'AGENCY_DOCUMENT_NOT_FOUND', 'Agency document not found'));
    if (!isUuid(existing.agency_id) || !canAccessAgency(scope, existing.agency_id)) {
      return next(toScopeError('Access denied for the selected agency.'));
    }
    if (isUuid(payload.agency_id) && !canAccessAgency(scope, payload.agency_id)) {
      return next(toScopeError('Access denied for the selected agency.'));
    }

    payload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('agency_documents')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return next(createHttpError(500, 'AGENCY_DOCUMENT_UPDATE_FAILED', 'Failed to update agency document', error));
    }

    return res.json({ data });
  } catch (error) {
    next(error);
  }
}

export async function deleteAgencyDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) return next(createHttpError(400, 'AGENCY_DOCUMENT_ID_INVALID', 'Invalid document id'));

    const scope = await resolveAdminScope(req);
    const { data: existing, error: existingError } = await supabase
      .from('agency_documents')
      .select('id, agency_id')
      .eq('id', id)
      .maybeSingle();

    if (existingError) {
      return next(createHttpError(500, 'AGENCY_DOCUMENT_LOOKUP_FAILED', 'Failed to load agency document', existingError));
    }
    if (!existing) return next(createHttpError(404, 'AGENCY_DOCUMENT_NOT_FOUND', 'Agency document not found'));
    if (!isUuid(existing.agency_id) || !canAccessAgency(scope, existing.agency_id)) {
      return next(toScopeError('Access denied for the selected agency.'));
    }

    const { error } = await supabase.from('agency_documents').delete().eq('id', id);
    if (error) {
      return next(createHttpError(500, 'AGENCY_DOCUMENT_DELETE_FAILED', 'Failed to delete agency document', error));
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}
