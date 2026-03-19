import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';
import { createHttpError } from '../lib/httpError';
import { resolveAdminScope } from '../services/adminScope';

const ALLOWED_ROLES = [
  'user',
  'guard',
  'admin',
  'superadmin',
  'agency_manager',
  'facility_manager',
] as const;

type AllowedRole = typeof ALLOWED_ROLES[number];

const isAllowedRole = (role: unknown): role is AllowedRole =>
  typeof role === 'string' && (ALLOWED_ROLES as readonly string[]).includes(role);

const isSupabaseNotFoundError = (error: { code?: string | null } | null | undefined) =>
  error?.code === 'PGRST116';

const parseStoredSettingValue = (value: string) => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const prettifyRoleName = (roleName: string) =>
  roleName
    .split('_')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ') || 'Custom role';

type ResolvedAdminScope = Awaited<ReturnType<typeof resolveAdminScope>>;

const normalizeString = (value: unknown) =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const dedupeStrings = (values: Array<string | null | undefined>) =>
  [...new Set(values.filter((value): value is string => typeof value === 'string' && value.trim().length > 0))];

const dedupeNumbers = (values: number[]) => [...new Set(values.filter((value) => Number.isInteger(value) && value > 0))];

const parseMaintenanceRequestIds = (values: unknown[]) => {
  const parsed = values.map((value) => Number(value));
  if (parsed.some((value) => !Number.isInteger(value) || value <= 0)) {
    throw createHttpError(
      400,
      'ADMIN_MAINTENANCE_BULK_UPDATE_INVALID',
      'Maintenance request ids must be positive integers'
    );
  }
  return dedupeNumbers(parsed);
};

const assertScopedCommunityAccess = (
  scope: ResolvedAdminScope,
  communityId: string | null,
  code: string,
  message: string
) => {
  if (scope.isGlobal) {
    return;
  }

  if (!communityId || !scope.communityIds.includes(communityId)) {
    throw createHttpError(403, code, message);
  }
};

async function loadUnitsByIds(unitIds: string[]) {
  const ids = dedupeStrings(unitIds);
  if (ids.length === 0) {
    return new Map<string, {
      id: string;
      community_id?: string | null;
      unit_number?: string | null;
      number?: string | null;
      tenant_id?: string | null;
      owner_id?: string | null;
    }>();
  }

  const { data, error } = await supabase
    .from('units')
    .select('id, community_id, unit_number, number, tenant_id, owner_id')
    .in('id', ids);

  if (error) {
    throw createHttpError(500, 'ADMIN_SCOPE_UNITS_FETCH_FAILED', 'Failed to load scoped units', error);
  }

  return new Map((data || []).map((row) => [row.id, row]));
}

async function loadProfilesByIds(profileIds: string[]) {
  const ids = dedupeStrings(profileIds);
  if (ids.length === 0) {
    return new Map<string, { id: string; community_id?: string | null }>();
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, community_id')
    .in('id', ids);

  if (error) {
    throw createHttpError(500, 'ADMIN_SCOPE_PROFILES_FETCH_FAILED', 'Failed to load scoped profiles', error);
  }

  return new Map((data || []).map((row) => [row.id, row]));
}

async function resolvePaymentCommunityIds(input: { unitId?: string | null; payerId?: string | null }) {
  const communityIds = new Set<string>();

  if (input.unitId) {
    const unitsById = await loadUnitsByIds([input.unitId]);
    const communityId = normalizeString(unitsById.get(input.unitId)?.community_id);
    if (!communityId) {
      throw createHttpError(400, 'ADMIN_PAYMENT_SCOPE_UNIT_INVALID', 'Selected payment unit could not be resolved');
    }
    communityIds.add(communityId);
  }

  if (input.payerId) {
    const profilesById = await loadProfilesByIds([input.payerId]);
    const communityId = normalizeString(profilesById.get(input.payerId)?.community_id);
    if (!communityId) {
      throw createHttpError(400, 'ADMIN_PAYMENT_SCOPE_PAYER_INVALID', 'Selected payment payer could not be resolved');
    }
    communityIds.add(communityId);
  }

  return [...communityIds];
}

async function assertScopedPaymentAccess(
  scope: ResolvedAdminScope,
  input: { unitId?: string | null; payerId?: string | null }
) {
  if (scope.isGlobal) {
    return;
  }

  if (!input.unitId && !input.payerId) {
    throw createHttpError(
      400,
      'ADMIN_PAYMENT_SCOPE_REFERENCE_REQUIRED',
      'Scoped admins must target a payment tied to an in-scope unit or payer'
    );
  }

  const communityIds = await resolvePaymentCommunityIds(input);

  if (communityIds.length === 0) {
    throw createHttpError(
      400,
      'ADMIN_PAYMENT_SCOPE_REFERENCE_REQUIRED',
      'Scoped admins must target a payment tied to an in-scope unit or payer'
    );
  }

  if (communityIds.length > 1) {
    throw createHttpError(
      400,
      'ADMIN_PAYMENT_SCOPE_MISMATCH',
      'The selected payment unit and payer belong to different communities'
    );
  }

  assertScopedCommunityAccess(
    scope,
    communityIds[0],
    'ADMIN_PAYMENT_SCOPE_VIOLATION',
    'You do not have access to the selected payment scope'
  );
}

// Analytics functions
export async function getAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const timeFrame = req.query.timeFrame || 'month';
    
    // Get user counts
    const { count: userCount, error: userError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    // Get maintenance request stats
    const { data: maintenanceStats, error: maintenanceError } = await supabase
      .from('maintenance_requests')
      .select('status, created_at')
      .gte('created_at', getTimeframeDate(timeFrame));
    
    // Get complaint stats
    const { data: complaintStats, error: complaintError } = await supabase
      .from('complaints')
      .select('status, created_at')
      .gte('created_at', getTimeframeDate(timeFrame));
    
    // Get payment stats
    const { data: paymentStats, error: paymentError } = await supabase
      .from('payments')
      .select('status, amount, created_at')
      .gte('created_at', getTimeframeDate(timeFrame));
    
    if (userError || maintenanceError || complaintError || paymentError) {
      return next(
        createHttpError(500, 'ADMIN_ANALYTICS_FETCH_FAILED', 'Failed to fetch analytics data', {
          userError,
          maintenanceError,
          complaintError,
          paymentError,
        })
      );
    }
    
    // Process maintenance request stats
    const maintenanceByStatus = maintenanceStats?.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};
    
    // Process complaint stats
    const complaintsByStatus = complaintStats?.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};
    
    // Process payment stats
    const paymentsTotal = paymentStats?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
    const paymentsByStatus = paymentStats?.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};
    
    // Group data by month/week for time series
    const maintenanceTimeSeries = processTimeSeries(maintenanceStats || [], timeFrame);
    const complaintsTimeSeries = processTimeSeries(complaintStats || [], timeFrame);
    const paymentsTimeSeries = processTimeSeries(paymentStats || [], timeFrame);
    
    res.json({
      users: {
        total: userCount || 0
      },
      maintenance: {
        byStatus: maintenanceByStatus,
        timeSeries: maintenanceTimeSeries
      },
      complaints: {
        byStatus: complaintsByStatus,
        timeSeries: complaintsTimeSeries
      },
      payments: {
        total: paymentsTotal,
        byStatus: paymentsByStatus,
        timeSeries: paymentsTimeSeries
      }
    });
  } catch (err) {
    next(err);
  }
}

// User management functions
export async function getAllUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const role = req.query.role as string;
    const search = req.query.search as string;
    
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' });
    
    // Apply filters
    if (role) {
      query = query.eq('role', role);
    }
    
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    
    // Handle pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    const { data, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false });
    
    if (error) {
      return next(createHttpError(500, 'ADMIN_USERS_FETCH_FAILED', 'Failed to fetch users', error));
    }
    
    res.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: count ? Math.ceil(count / limit) : 0
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, first_name, last_name, role, phone } = req.body;

    if (!email || !password) {
      return next(
        createHttpError(400, 'ADMIN_USER_EMAIL_PASSWORD_REQUIRED', 'Email and password are required')
      );
    }

    if (role && !isAllowedRole(role)) {
      return next(createHttpError(400, 'ADMIN_USER_ROLE_INVALID', 'Invalid role provided'));
    }
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto confirm email
      user_metadata: { first_name, last_name }
    });
    
    if (authError || !authData.user) {
      return next(createHttpError(500, 'ADMIN_USER_CREATE_FAILED', 'Failed to create user', authError));
    }
    
    // Create profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        user_id: authData.user.id,
        first_name,
        last_name,
        full_name: [first_name, last_name].filter(Boolean).join(' ').trim() || null,
        email,
        role: role || 'user',
        phone,
        is_active: true,
      })
      .select()
      .single();
    
    if (profileError) {
      // Rollback: delete auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return next(
        createHttpError(500, 'ADMIN_USER_PROFILE_CREATE_FAILED', 'Failed to create user profile', profileError)
      );
    }
    
    res.status(201).json(profileData);
  } catch (err) {
    next(err);
  }
}

export async function inviteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, first_name, last_name, role, phone } = req.body;

    if (!email) {
      return next(createHttpError(400, 'ADMIN_INVITE_EMAIL_REQUIRED', 'Email is required'));
    }

    if (role && !isAllowedRole(role)) {
      return next(createHttpError(400, 'ADMIN_INVITE_ROLE_INVALID', 'Invalid role provided'));
    }

    const redirectTo =
      process.env.ADMIN_INVITE_REDIRECT_URL ||
      process.env.SUPABASE_INVITE_REDIRECT_URL ||
      undefined;

    const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
      email,
      {
        redirectTo,
        data: {
          first_name,
          last_name,
          role: role || 'user',
        },
      }
    );

    if (inviteError || !inviteData.user) {
      return next(createHttpError(500, 'ADMIN_INVITE_SEND_FAILED', 'Failed to send invite', inviteError));
    }

    // Create profile for invited user
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: inviteData.user.id,
        user_id: inviteData.user.id,
        first_name,
        last_name,
        full_name: [first_name, last_name].filter(Boolean).join(' ').trim() || null,
        email,
        role: role || 'user',
        phone,
        is_active: true,
      })
      .select()
      .single();

    if (profileError) {
      return next(
        createHttpError(
          500,
          'ADMIN_INVITE_PROFILE_CREATE_FAILED',
          'Invite sent, but profile creation failed',
          profileError
        )
      );
    }

    return res.status(201).json({
      invite: inviteData.user,
      profile: profileData,
    });
  } catch (err) {
    next(err);
  }
}

export async function getUserById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (isSupabaseNotFoundError(error)) {
        return next(createHttpError(404, 'ADMIN_USER_NOT_FOUND', 'User not found', error));
      }
      return next(createHttpError(500, 'ADMIN_USER_FETCH_FAILED', 'Failed to fetch user', error));
    }
    
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { first_name, last_name, role, phone, profile_pic_url, is_active } = req.body;

    if (role && !isAllowedRole(role)) {
      return next(createHttpError(400, 'ADMIN_USER_ROLE_INVALID', 'Invalid role provided'));
    }
    
    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingUser) {
      return next(createHttpError(404, 'ADMIN_USER_NOT_FOUND', 'User not found', fetchError));
    }
    
    // Update profile
    const { data, error } = await supabase
      .from('profiles')
      .update({
        first_name,
        last_name,
        role,
        phone,
        profile_pic_url,
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return next(createHttpError(500, 'ADMIN_USER_UPDATE_FAILED', 'Failed to update user', error));
    }
    
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingUser) {
      return next(createHttpError(404, 'ADMIN_USER_NOT_FOUND', 'User not found', fetchError));
    }
    
    // Delete auth user (cascade will delete profile)
    const { error } = await supabase.auth.admin.deleteUser(id);
    
    if (error) {
      return next(createHttpError(500, 'ADMIN_USER_DELETE_FAILED', 'Failed to delete user', error));
    }
    
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function bulkUpdateUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const { userIds, updates } = req.body;
    
    if (!userIds || !userIds.length || !updates) {
      return next(createHttpError(400, 'ADMIN_USERS_BULK_UPDATE_INVALID', 'Missing userIds or updates'));
    }

    if (updates.role && !isAllowedRole(updates.role)) {
      return next(createHttpError(400, 'ADMIN_USER_ROLE_INVALID', 'Invalid role provided'));
    }
    
    // Update profiles
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .in('id', userIds)
      .select();
    
    if (error) {
      return next(createHttpError(500, 'ADMIN_USERS_BULK_UPDATE_FAILED', 'Failed to update users', error));
    }
    
    res.json({ updated: data?.length || 0, data });
  } catch (err) {
    next(err);
  }
}

// Society management functions
export async function getAllSocieties(req: Request, res: Response, next: NextFunction) {
  try {
    const { data, error } = await supabase
      .from('societies')
      .select('*');
    
    if (error) {
      return next(createHttpError(500, 'ADMIN_COMMUNITIES_FETCH_FAILED', 'Failed to fetch communities', error));
    }
    
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function createSociety(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, address, description } = req.body;
    
    const { data, error } = await supabase
      .from('societies')
      .insert({ name, address, description })
      .select()
      .single();
    
    if (error) {
      return next(createHttpError(500, 'ADMIN_COMMUNITY_CREATE_FAILED', 'Failed to create community', error));
    }
    
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function updateSociety(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { name, address, description } = req.body;
    
    const { data, error } = await supabase
      .from('societies')
      .update({ name, address, description, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (isSupabaseNotFoundError(error)) {
        return next(createHttpError(404, 'ADMIN_COMMUNITY_NOT_FOUND', 'Community not found', error));
      }
      return next(createHttpError(500, 'ADMIN_COMMUNITY_UPDATE_FAILED', 'Failed to update community', error));
    }
    
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function deleteSociety(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('societies')
      .delete()
      .eq('id', id);
    
    if (error) {
      return next(createHttpError(500, 'ADMIN_COMMUNITY_DELETE_FAILED', 'Failed to delete community', error));
    }
    
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// Maintenance management functions
export async function getMaintenanceStats(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);

    let rows: Array<{
      id: number;
      status?: string | null;
      created_at?: string | null;
      updated_at?: string | null;
      unit_id?: string | null;
    }> = [];

    if (scope.isGlobal) {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select('id, status, created_at, updated_at, unit_id');

      if (error) {
        return next(
          createHttpError(500, 'ADMIN_MAINTENANCE_STATS_FETCH_FAILED', 'Failed to fetch maintenance stats', error)
        );
      }

      rows = data || [];
    } else if (scope.communityIds.length > 0) {
      const { data: scopedUnits, error: scopedUnitsError } = await supabase
        .from('units')
        .select('id')
        .in('community_id', scope.communityIds);

      if (scopedUnitsError) {
        return next(
          createHttpError(500, 'ADMIN_MAINTENANCE_SCOPE_FETCH_FAILED', 'Failed to resolve maintenance scope', scopedUnitsError)
        );
      }

      const scopedUnitIds = dedupeStrings((scopedUnits || []).map((row) => row.id));

      if (scopedUnitIds.length > 0) {
        const { data, error } = await supabase
          .from('maintenance_requests')
          .select('id, status, created_at, updated_at, unit_id')
          .in('unit_id', scopedUnitIds);

        if (error) {
          return next(
            createHttpError(500, 'ADMIN_MAINTENANCE_STATS_FETCH_FAILED', 'Failed to fetch maintenance stats', error)
          );
        }

        rows = data || [];
      }
    }

    const statusCounts = rows.reduce((acc, item) => {
      const key = typeof item.status === 'string' && item.status.trim().length > 0 ? item.status : 'unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const resolutionRows = rows.filter(
      (item) => item.status === 'completed' && item.created_at && item.updated_at
    );

    const avgResolutionTime = resolutionRows.length
      ? resolutionRows.reduce((sum, item) => {
          const created = new Date(item.created_at as string);
          const updated = new Date(item.updated_at as string);
          const hours = (updated.getTime() - created.getTime()) / (1000 * 60 * 60);
          return sum + hours;
        }, 0) / resolutionRows.length
      : 0;

    res.json({
      statusCounts,
      avgResolutionTime: Math.round(avgResolutionTime * 10) / 10, // Round to 1 decimal place
      total: Object.values(statusCounts || {}).reduce((sum, count) => sum + count, 0)
    });
  } catch (err) {
    next(err);
  }
}

export async function bulkUpdateMaintenanceRequests(req: Request, res: Response, next: NextFunction) {
  try {
    const { requestIds, updates } = req.body;
    
    if (!requestIds || !requestIds.length || !updates) {
      return next(
        createHttpError(400, 'ADMIN_MAINTENANCE_BULK_UPDATE_INVALID', 'Missing requestIds or updates')
      );
    }

    const parsedRequestIds = parseMaintenanceRequestIds(requestIds);
    const scope = await resolveAdminScope(req);

    let scopedRequestIds = parsedRequestIds;

    if (!scope.isGlobal) {
      const { data: maintenanceRows, error: maintenanceError } = await supabase
        .from('maintenance_requests')
        .select('id, unit_id')
        .in('id', parsedRequestIds);

      if (maintenanceError) {
        return next(
          createHttpError(
            500,
            'ADMIN_MAINTENANCE_SCOPE_FETCH_FAILED',
            'Failed to resolve maintenance request scope',
            maintenanceError
          )
        );
      }

      const unitsById = await loadUnitsByIds((maintenanceRows || []).map((row) => row.unit_id));

      for (const row of maintenanceRows || []) {
        const communityId = normalizeString(unitsById.get(row.unit_id)?.community_id);
        assertScopedCommunityAccess(
          scope,
          communityId,
          'ADMIN_MAINTENANCE_SCOPE_VIOLATION',
          'You do not have access to one or more selected maintenance requests'
        );
      }

      scopedRequestIds = (maintenanceRows || []).map((row) => row.id);
    }

    if (scopedRequestIds.length === 0) {
      return res.json({ updated: 0, data: [] });
    }
    
    const { data, error } = await supabase
      .from('maintenance_requests')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .in('id', scopedRequestIds)
      .select();
    
    if (error) {
      return next(
        createHttpError(
          500,
          'ADMIN_MAINTENANCE_BULK_UPDATE_FAILED',
          'Failed to update maintenance requests',
          error
        )
      );
    }
    
    res.json({ updated: data?.length || 0, data });
  } catch (err) {
    next(err);
  }
}

// Complaint management functions
export async function getComplaintStats(req: Request, res: Response, next: NextFunction) {
  try {
    // Get counts by status
    const { data: statusCounts, error: statusError } = await supabase
      .from('complaints')
      .select('status')
      .then(result => {
        if (result.error) throw result.error;
        return {
          data: result.data.reduce((acc, item) => {
            acc[item.status] = (acc[item.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          error: null
        };
      });
    
    // Get average resolution time
    const { data: resolutionData, error: resolutionError } = await supabase
      .from('complaints')
      .select('created_at, updated_at, status')
      .eq('status', 'resolved');
    
    if (statusError || resolutionError) {
      return next(
        createHttpError(500, 'ADMIN_COMPLAINT_STATS_FETCH_FAILED', 'Failed to fetch complaint stats', {
          statusError,
          resolutionError,
        })
      );
    }
    
    // Calculate average resolution time in hours
    const avgResolutionTime = resolutionData?.length 
      ? resolutionData.reduce((sum, item) => {
        const created = new Date(item.created_at);
        const updated = new Date(item.updated_at);
        const hours = (updated.getTime() - created.getTime()) / (1000 * 60 * 60);
        return sum + hours;
      }, 0) / resolutionData.length
      : 0;
    
    res.json({
      statusCounts,
      avgResolutionTime: Math.round(avgResolutionTime * 10) / 10, // Round to 1 decimal place
      total: Object.values(statusCounts || {}).reduce((sum, count) => sum + count, 0)
    });
  } catch (err) {
    next(err);
  }
}

export async function bulkUpdateComplaints(req: Request, res: Response, next: NextFunction) {
  try {
    const { complaintIds, updates } = req.body;
    
    if (!complaintIds || !complaintIds.length || !updates) {
      return next(
        createHttpError(400, 'ADMIN_COMPLAINTS_BULK_UPDATE_INVALID', 'Missing complaintIds or updates')
      );
    }

    const scope = await resolveAdminScope(req);
    let scopedComplaintIds = dedupeStrings(complaintIds);

    if (!scope.isGlobal) {
      const { data: complaintRows, error: complaintError } = await supabase
        .from('complaints')
        .select('id, community_id, unit_id')
        .in('id', scopedComplaintIds);

      if (complaintError) {
        return next(
          createHttpError(
            500,
            'ADMIN_COMPLAINTS_SCOPE_FETCH_FAILED',
            'Failed to resolve complaint scope',
            complaintError
          )
        );
      }

      const unitsById = await loadUnitsByIds((complaintRows || []).map((row) => row.unit_id));

      for (const row of complaintRows || []) {
        const communityId =
          normalizeString(row.community_id) || normalizeString(unitsById.get(row.unit_id)?.community_id);
        assertScopedCommunityAccess(
          scope,
          communityId,
          'ADMIN_COMPLAINT_SCOPE_VIOLATION',
          'You do not have access to one or more selected complaints'
        );
      }

      scopedComplaintIds = dedupeStrings((complaintRows || []).map((row) => row.id));
    }

    if (scopedComplaintIds.length === 0) {
      return res.json({ updated: 0, data: [] });
    }
    
    const { data, error } = await supabase
      .from('complaints')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .in('id', scopedComplaintIds)
      .select();
    
    if (error) {
      return next(
        createHttpError(500, 'ADMIN_COMPLAINTS_BULK_UPDATE_FAILED', 'Failed to update complaints', error)
      );
    }
    
    res.json({ updated: data?.length || 0, data });
  } catch (err) {
    next(err);
  }
}

// Payment management functions
export async function getPaymentStats(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);

    let payments: Array<{ id?: string | null; status?: string | null; amount?: number | string | null }> = [];

    if (scope.isGlobal) {
      const { data, error } = await supabase.from('payments').select('id, status, amount');

      if (error) {
        return next(
          createHttpError(500, 'ADMIN_PAYMENT_STATS_FETCH_FAILED', 'Failed to fetch payment stats', error)
        );
      }

      payments = data || [];
    } else if (scope.communityIds.length === 0) {
      payments = [];
    } else {
      const [unitsResult, scopedProfilesResult] = await Promise.all([
        supabase.from('units').select('id').in('community_id', scope.communityIds),
        supabase.from('profiles').select('id').in('community_id', scope.communityIds),
      ]);

      if (unitsResult.error || scopedProfilesResult.error) {
        return next(
          createHttpError(500, 'ADMIN_PAYMENT_SCOPE_FETCH_FAILED', 'Failed to resolve payment scope', {
            unitsError: unitsResult.error,
            profilesError: scopedProfilesResult.error,
          })
        );
      }

      const unitIds = (unitsResult.data || []).map((row) => row.id).filter(Boolean);
      const payerIds = (scopedProfilesResult.data || []).map((row) => row.id).filter(Boolean);
      const paymentRowsById = new Map<string, { id?: string | null; status?: string | null; amount?: number | string | null }>();

      if (unitIds.length > 0) {
        const { data, error } = await supabase.from('payments').select('id, status, amount').in('unit_id', unitIds);

        if (error) {
          return next(
            createHttpError(500, 'ADMIN_PAYMENT_STATS_FETCH_FAILED', 'Failed to fetch payment stats', error)
          );
        }

        for (const row of data || []) {
          if (typeof row.id === 'string') {
            paymentRowsById.set(row.id, row);
          }
        }
      }

      if (payerIds.length > 0) {
        const { data, error } = await supabase.from('payments').select('id, status, amount').in('payer_id', payerIds);

        if (error) {
          return next(
            createHttpError(500, 'ADMIN_PAYMENT_STATS_FETCH_FAILED', 'Failed to fetch payment stats', error)
          );
        }

        for (const row of data || []) {
          if (typeof row.id === 'string') {
            paymentRowsById.set(row.id, row);
          }
        }
      }

      payments = [...paymentRowsById.values()];
    }

    if (!Array.isArray(payments)) {
      return next(
        createHttpError(500, 'ADMIN_PAYMENT_STATS_FETCH_FAILED', 'Failed to fetch payment stats')
      );
    }

    const byStatus = payments.reduce((acc, item) => {
      const statusKey =
        typeof item.status === 'string' && item.status.trim().length > 0 ? item.status : 'unknown';
      acc[statusKey] = {
        count: (acc[statusKey]?.count || 0) + 1,
        total: (acc[statusKey]?.total || 0) + Number(item.amount || 0),
      };
      return acc;
    }, {} as Record<string, { count: number, total: number }>);

    const totalAmount = payments.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalCount = payments.length;

    res.json({
      byStatus,
      total: {
        amount: totalAmount,
        count: totalCount
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function generatePayments(req: Request, res: Response, next: NextFunction) {
  try {
    const { societyId, communityId, unitIds, amount, dueDate, description } = req.body;
    const targetCommunityId = normalizeString(communityId) || normalizeString(societyId);
    
    if (!targetCommunityId || !amount || !dueDate) {
      return next(
        createHttpError(
          400,
          'ADMIN_PAYMENTS_GENERATE_INVALID',
          'Missing required fields: communityId, amount, dueDate'
        )
      );
    }

    const scope = await resolveAdminScope(req);
    assertScopedCommunityAccess(
      scope,
      targetCommunityId,
      'ADMIN_PAYMENT_SCOPE_VIOLATION',
      'You do not have access to generate payments for the selected community'
    );
    
    // Get units to generate payments for
    let unitsQuery = supabase
      .from('units')
      .select('id, community_id, unit_number, number, tenant_id, owner_id')
      .eq('community_id', targetCommunityId);
    
    if (unitIds && unitIds.length) {
      unitsQuery = unitsQuery.in('id', unitIds);
    }
    
    const { data: units, error: unitsError } = await unitsQuery;
    
    if (unitsError) {
      return next(createHttpError(500, 'ADMIN_PAYMENTS_UNITS_FETCH_FAILED', 'Failed to fetch units', unitsError));
    }

    if (!units || !units.length) {
      return next(
        createHttpError(400, 'ADMIN_PAYMENTS_UNITS_EMPTY', 'No units found for the specified criteria')
      );
    }
    
    // Generate payment records
    const payments = units.map(unit => {
      const unitLabel = unit.unit_number || unit.number || unit.id;
      const payerId = normalizeString(unit.tenant_id) || normalizeString(unit.owner_id);
      const resolvedDescription = description || `Monthly maintenance for unit ${unitLabel}`;

      return {
        unit_id: unit.id,
        payer_id: payerId,
        amount,
        due_date: dueDate,
        title: resolvedDescription,
        description: resolvedDescription,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    });
    
    const { data: createdPayments, error: paymentsError } = await supabase
      .from('payments')
      .insert(payments)
      .select();
    
    if (paymentsError) {
      return next(
        createHttpError(500, 'ADMIN_PAYMENTS_GENERATE_FAILED', 'Failed to generate payments', paymentsError)
      );
    }
    
    res.status(201).json({
      created: createdPayments?.length || 0,
      data: createdPayments
    });
  } catch (err) {
    next(err);
  }
}

export async function bulkUpdatePayments(req: Request, res: Response, next: NextFunction) {
  try {
    const { paymentIds, updates } = req.body;
    
    if (!paymentIds || !paymentIds.length || !updates) {
      return next(createHttpError(400, 'ADMIN_PAYMENTS_BULK_UPDATE_INVALID', 'Missing paymentIds or updates'));
    }

    const scope = await resolveAdminScope(req);
    let scopedPaymentIds = dedupeStrings(paymentIds);

    if (!scope.isGlobal) {
      const { data: paymentRows, error: paymentRowsError } = await supabase
        .from('payments')
        .select('id, unit_id, payer_id')
        .in('id', scopedPaymentIds);

      if (paymentRowsError) {
        return next(
          createHttpError(500, 'ADMIN_PAYMENTS_SCOPE_FETCH_FAILED', 'Failed to resolve payment scope', paymentRowsError)
        );
      }

      for (const row of paymentRows || []) {
        await assertScopedPaymentAccess(scope, {
          unitId: normalizeString((updates || {}).unit_id) || normalizeString(row.unit_id),
          payerId: normalizeString((updates || {}).payer_id) || normalizeString(row.payer_id),
        });
      }

      scopedPaymentIds = dedupeStrings((paymentRows || []).map((row) => row.id));
    }

    if (scopedPaymentIds.length === 0) {
      return res.json({ updated: 0, data: [] });
    }
    
    const { data, error } = await supabase
      .from('payments')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .in('id', scopedPaymentIds)
      .select();
    
    if (error) {
      return next(createHttpError(500, 'ADMIN_PAYMENTS_BULK_UPDATE_FAILED', 'Failed to update payments', error));
    }
    
    res.json({ updated: data?.length || 0, data });
  } catch (err) {
    next(err);
  }
}

// Notice management functions
export async function bulkCreateNotices(req: Request, res: Response, next: NextFunction) {
  try {
    const { notices } = req.body;
    
    if (!notices || !notices.length) {
      return next(createHttpError(400, 'ADMIN_NOTICES_BULK_CREATE_INVALID', 'Missing notices array'));
    }

    const scope = await resolveAdminScope(req);

    if (!scope.isGlobal) {
      for (const notice of notices) {
        assertScopedCommunityAccess(
          scope,
          normalizeString(notice.community_id),
          'ADMIN_NOTICE_SCOPE_VIOLATION',
          'Cannot create notices outside your tenant scope'
        );
      }
    }
    
    // Add timestamps to each notice
    const noticesWithTimestamps = notices.map(notice => ({
      ...notice,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    const { data, error } = await supabase
      .from('notices')
      .insert(noticesWithTimestamps)
      .select();
    
    if (error) {
      return next(createHttpError(500, 'ADMIN_NOTICES_BULK_CREATE_FAILED', 'Failed to create notices', error));
    }
    
    res.status(201).json({
      created: data?.length || 0,
      data
    });
  } catch (err) {
    next(err);
  }
}

// Settings management functions
export async function getSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return next(createHttpError(401, 'AUTH_USER_MISSING', 'Authenticated user context is required'));
    }

    const { data, error } = await supabase
      .from('settings')
      .select('key, value')
      .eq('user_id', userId);
    
    if (error) {
      return next(createHttpError(500, 'ADMIN_SETTINGS_FETCH_FAILED', 'Failed to fetch settings', error));
    }
    
    // Convert to key-value format
    const settings = data?.reduce((acc, item) => {
      acc[item.key] = parseStoredSettingValue(item.value);
      return acc;
    }, {} as Record<string, any>) || {};
    
    res.json(settings);
  } catch (err) {
    next(err);
  }
}

export async function updateSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    const settings = req.body;

    if (!userId) {
      return next(createHttpError(401, 'AUTH_USER_MISSING', 'Authenticated user context is required'));
    }
    
    if (!settings || Object.keys(settings).length === 0) {
      return next(createHttpError(400, 'ADMIN_SETTINGS_UPDATE_INVALID', 'No settings provided'));
    }
    
    // Convert object to array of key-value pairs
    const settingsArray = Object.entries(settings).map(([key, value]) => ({
      user_id: userId,
      key,
      value: JSON.stringify(value),
      updated_at: new Date().toISOString()
    }));
    
    // Upsert settings
    const { data, error } = await supabase
      .from('settings')
      .upsert(settingsArray, { onConflict: 'user_id,key' })
      .select();
    
    if (error) {
      return next(createHttpError(500, 'ADMIN_SETTINGS_UPDATE_FAILED', 'Failed to update settings', error));
    }
    
    res.json({
      updated: data?.length || 0,
      data
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteSetting(req: Request, res: Response, next: NextFunction) {
  try {
    const { key } = req.params;
    const userId = req.user?.id;

    if (!key) {
      return next(createHttpError(400, 'ADMIN_SETTING_KEY_REQUIRED', 'Setting key is required'));
    }

    if (!userId) {
      return next(createHttpError(401, 'AUTH_USER_MISSING', 'Authenticated user context is required'));
    }

    const { error } = await supabase
      .from('settings')
      .delete()
      .eq('user_id', userId)
      .eq('key', key);

    if (error) {
      return next(createHttpError(500, 'ADMIN_SETTING_DELETE_FAILED', 'Failed to delete setting', error));
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// Role management functions
export async function getRoles(req: Request, res: Response, next: NextFunction) {
  try {
    const [rolesResult, permissionsResult] = await Promise.all([
      supabase.from('user_roles').select('id, name, description').order('name', { ascending: true }),
      supabase
        .from('role_permissions_detailed')
        .select('role_name, permission_key')
        .order('role_name', { ascending: true }),
    ]);

    if (rolesResult.error || permissionsResult.error) {
      return next(
        createHttpError(500, 'ADMIN_ROLES_FETCH_FAILED', 'Failed to fetch roles', {
          rolesError: rolesResult.error,
          permissionsError: permissionsResult.error,
        })
      );
    }

    const permissionsByRole = new Map<string, string[]>();
    for (const item of permissionsResult.data || []) {
      if (!item.role_name || !item.permission_key) continue;
      const current = permissionsByRole.get(item.role_name) || [];
      current.push(item.permission_key);
      permissionsByRole.set(item.role_name, current);
    }

    res.json(
      (rolesResult.data || []).map((role) => ({
        role: role.name,
        description: role.description,
        permissions: permissionsByRole.get(role.name) || [],
      }))
    );
  } catch (err) {
    next(err);
  }
}

export async function updateRolePermissions(req: Request, res: Response, next: NextFunction) {
  try {
    const { role } = req.params;
    const { permissions, description } = req.body;
    const actorId = req.user?.id ?? null;
    
    if (!permissions || !Array.isArray(permissions)) {
      return next(createHttpError(400, 'ADMIN_ROLE_PERMISSIONS_INVALID', 'Permissions must be an array'));
    }

    const normalizedPermissions = [...new Set(permissions.map((permission) => String(permission).trim()).filter(Boolean))];

    if (normalizedPermissions.length === 0) {
      return next(createHttpError(400, 'ADMIN_ROLE_PERMISSIONS_INVALID', 'Permissions must be an array'));
    }

    const [roleResult, permissionResult] = await Promise.all([
      supabase
        .from('user_roles')
        .select('id, name, description, is_system_role, is_default')
        .eq('name', role)
        .maybeSingle(),
      supabase.from('permissions').select('id, key').in('key', normalizedPermissions),
    ]);

    if (roleResult.error) {
      return next(
        createHttpError(
          500,
          'ADMIN_ROLE_LOOKUP_FAILED',
          'Failed to update role permissions',
          roleResult.error
        )
      );
    }

    if (permissionResult.error) {
      return next(
        createHttpError(
          500,
          'ADMIN_ROLE_PERMISSIONS_LOOKUP_FAILED',
          'Failed to update role permissions',
          permissionResult.error
        )
      );
    }

    const permissionRows = permissionResult.data || [];
    const permissionIdsByKey = new Map(permissionRows.map((item) => [item.key, item.id]));
    const missingPermissions = normalizedPermissions.filter((permission) => !permissionIdsByKey.has(permission));

    if (missingPermissions.length > 0) {
      return next(
        createHttpError(
          400,
          'ADMIN_ROLE_PERMISSIONS_INVALID_KEYS',
          `Unknown permissions: ${missingPermissions.join(', ')}`
        )
      );
    }

    const roleDescription =
      typeof description === 'string' && description.trim().length > 0
        ? description.trim()
        : roleResult.data?.description || prettifyRoleName(role);

    const now = new Date().toISOString();
    let roleId = roleResult.data?.id || null;

    if (!roleId) {
      const { data: createdRole, error: createRoleError } = await supabase
        .from('user_roles')
        .insert({
          name: role,
          description: roleDescription,
          permissions: normalizedPermissions,
          updated_at: now,
        })
        .select('id, name, description')
        .single();

      if (createRoleError || !createdRole) {
        return next(
          createHttpError(
            500,
            'ADMIN_ROLE_CREATE_FAILED',
            'Failed to create role',
            createRoleError
          )
        );
      }

      roleId = createdRole.id;
    } else {
      const { error: updateRoleError } = await supabase
        .from('user_roles')
        .update({
          description: roleDescription,
          permissions: normalizedPermissions,
          updated_at: now,
        })
        .eq('id', roleId);

      if (updateRoleError) {
        return next(
          createHttpError(
            500,
            'ADMIN_ROLE_UPDATE_FAILED',
            'Failed to update role',
            updateRoleError
          )
        );
      }
    }

    const { error: deleteError } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', roleId);

    if (deleteError) {
      return next(
        createHttpError(
          500,
          'ADMIN_ROLE_PERMISSIONS_DELETE_FAILED',
          'Failed to update role permissions',
          deleteError
        )
      );
    }

    const permissionInserts = normalizedPermissions.map((permissionKey) => ({
      role_id: roleId,
      permission_id: permissionIdsByKey.get(permissionKey)!,
      granted_at: now,
      granted_by: actorId,
    }));

    const { data, error: insertError } = await supabase
      .from('role_permissions')
      .insert(permissionInserts)
      .select();

    if (insertError) {
      return next(
        createHttpError(
          500,
          'ADMIN_ROLE_PERMISSIONS_INSERT_FAILED',
          'Failed to update role permissions',
          insertError
        )
      );
    }

    res.json({
      role,
      description: roleDescription,
      permissions: normalizedPermissions,
      updated: data?.length || 0
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteRole(req: Request, res: Response, next: NextFunction) {
  try {
    const { role } = req.params;

    if (!role) {
      return next(createHttpError(400, 'ADMIN_ROLE_REQUIRED', 'Role is required'));
    }

    const { data: existingRole, error: lookupError } = await supabase
      .from('user_roles')
      .select('id, is_system_role, is_default')
      .eq('name', role)
      .maybeSingle();

    if (lookupError) {
      return next(createHttpError(500, 'ADMIN_ROLE_LOOKUP_FAILED', 'Failed to delete role', lookupError));
    }

    if (!existingRole) {
      return next(createHttpError(404, 'ADMIN_ROLE_NOT_FOUND', 'Role not found'));
    }

    if (existingRole.is_system_role || existingRole.is_default) {
      return next(createHttpError(403, 'ADMIN_ROLE_DELETE_FORBIDDEN', 'System roles cannot be deleted'));
    }

    const { error: permissionsError } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', existingRole.id);

    if (permissionsError) {
      return next(createHttpError(500, 'ADMIN_ROLE_DELETE_FAILED', 'Failed to delete role', permissionsError));
    }

    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('id', existingRole.id);

    if (error) {
      return next(createHttpError(500, 'ADMIN_ROLE_DELETE_FAILED', 'Failed to delete role', error));
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// Helper functions
function getTimeframeDate(timeFrame: string | any): string {
  const date = new Date();
  switch(timeFrame) {
    case 'week':
      date.setDate(date.getDate() - 7);
      break;
    case 'month':
      date.setMonth(date.getMonth() - 1);
      break;
    case 'quarter':
      date.setMonth(date.getMonth() - 3);
      break;
    case 'year':
      date.setFullYear(date.getFullYear() - 1);
      break;
    default:
      date.setMonth(date.getMonth() - 1); // Default to month
  }
  return date.toISOString();
}

function processTimeSeries(data: any[], timeFrame: string | any): any[] {
  const groupedData: Record<string, number> = {};
  
  data.forEach(item => {
    let key: string;
    const date = new Date(item.created_at);
    
    switch(timeFrame) {
      case 'week':
        // Group by day of week
        key = date.toLocaleString('en-US', { weekday: 'short' });
        break;
      case 'month':
        // Group by day of month
        key = date.getDate().toString();
        break;
      case 'quarter':
      case 'year':
        // Group by month
        key = date.toLocaleString('en-US', { month: 'short' });
        break;
      default:
        key = date.getDate().toString();
    }
    
    groupedData[key] = (groupedData[key] || 0) + 1;
  });
  
  // Convert to array for charting
  return Object.entries(groupedData).map(([label, value]) => ({ label, value }));
}
