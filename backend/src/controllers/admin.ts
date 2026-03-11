import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';
import { createHttpError } from '../lib/httpError';

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
      .select('*');
    
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
        first_name,
        last_name,
        email,
        role: role || 'user',
        phone
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
        first_name,
        last_name,
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
    // Get counts by status
    const { data: statusCounts, error: statusError } = await supabase
      .from('maintenance_requests')
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
      .from('maintenance_requests')
      .select('created_at, updated_at, status')
      .eq('status', 'completed');
    
    if (statusError || resolutionError) {
      return next(
        createHttpError(500, 'ADMIN_MAINTENANCE_STATS_FETCH_FAILED', 'Failed to fetch maintenance stats', {
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

export async function bulkUpdateMaintenanceRequests(req: Request, res: Response, next: NextFunction) {
  try {
    const { requestIds, updates } = req.body;
    
    if (!requestIds || !requestIds.length || !updates) {
      return next(
        createHttpError(400, 'ADMIN_MAINTENANCE_BULK_UPDATE_INVALID', 'Missing requestIds or updates')
      );
    }
    
    const { data, error } = await supabase
      .from('maintenance_requests')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .in('id', requestIds)
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
    
    const { data, error } = await supabase
      .from('complaints')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .in('id', complaintIds)
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
    // Get payments by status
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('status, amount');
    
    if (paymentsError) {
      return next(
        createHttpError(500, 'ADMIN_PAYMENT_STATS_FETCH_FAILED', 'Failed to fetch payment stats', paymentsError)
      );
    }
    
    // Process payment data
    const byStatus = payments?.reduce((acc, item) => {
      acc[item.status] = {
        count: (acc[item.status]?.count || 0) + 1,
        total: (acc[item.status]?.total || 0) + Number(item.amount)
      };
      return acc;
    }, {} as Record<string, { count: number, total: number }>);
    
    // Calculate totals
    const totalAmount = payments?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
    const totalCount = payments?.length || 0;
    
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
    const { societyId, unitIds, amount, dueDate, description } = req.body;
    
    if (!societyId || !amount || !dueDate) {
      return next(
        createHttpError(
          400,
          'ADMIN_PAYMENTS_GENERATE_INVALID',
          'Missing required fields: societyId, amount, dueDate'
        )
      );
    }
    
    // Get units to generate payments for
    let unitsQuery = supabase.from('units').select('id, unit_number, user_id');
    
    if (societyId) {
      unitsQuery = unitsQuery.eq('society_id', societyId);
    }
    
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
    const payments = units.map(unit => ({
      unit_id: unit.id,
      user_id: unit.user_id,
      amount,
      due_date: dueDate,
      description: description || `Monthly maintenance for unit ${unit.unit_number}`,
      status: 'pending'
    }));
    
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
    
    const { data, error } = await supabase
      .from('payments')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .in('id', paymentIds)
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
    const { data, error } = await supabase
      .from('settings')
      .select('*');
    
    if (error) {
      return next(createHttpError(500, 'ADMIN_SETTINGS_FETCH_FAILED', 'Failed to fetch settings', error));
    }
    
    // Convert to key-value format
    const settings = data?.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {} as Record<string, any>) || {};
    
    res.json(settings);
  } catch (err) {
    next(err);
  }
}

export async function updateSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = req.body;
    
    if (!settings || Object.keys(settings).length === 0) {
      return next(createHttpError(400, 'ADMIN_SETTINGS_UPDATE_INVALID', 'No settings provided'));
    }
    
    // Convert object to array of key-value pairs
    const settingsArray = Object.entries(settings).map(([key, value]) => ({
      key,
      value: JSON.stringify(value),
      updated_at: new Date().toISOString()
    }));
    
    // Upsert settings
    const { data, error } = await supabase
      .from('settings')
      .upsert(settingsArray, { onConflict: 'key' })
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

    if (!key) {
      return next(createHttpError(400, 'ADMIN_SETTING_KEY_REQUIRED', 'Setting key is required'));
    }

    const { error } = await supabase
      .from('settings')
      .delete()
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
    const { data, error } = await supabase
      .from('role_permissions')
      .select('*');
    
    if (error) {
      return next(createHttpError(500, 'ADMIN_ROLES_FETCH_FAILED', 'Failed to fetch roles', error));
    }
    
    // Group by role
    const roles = data?.reduce((acc, item) => {
      if (!acc[item.role]) {
        acc[item.role] = { role: item.role, permissions: [] };
      }
      acc[item.role].permissions.push(item.permission);
      return acc;
    }, {} as Record<string, { role: string, permissions: string[] }>) || {};
    
    res.json(Object.values(roles));
  } catch (err) {
    next(err);
  }
}

export async function updateRolePermissions(req: Request, res: Response, next: NextFunction) {
  try {
    const { role } = req.params;
    const { permissions } = req.body;
    
    if (!permissions || !Array.isArray(permissions)) {
      return next(createHttpError(400, 'ADMIN_ROLE_PERMISSIONS_INVALID', 'Permissions must be an array'));
    }
    
    // Start a transaction
    // 1. Delete all existing permissions for this role
    const { error: deleteError } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role', role);
    
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
    
    // 2. Insert new permissions
    const permissionsToInsert = permissions.map(permission => ({
      role,
      permission,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    const { data, error: insertError } = await supabase
      .from('role_permissions')
      .insert(permissionsToInsert)
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
      permissions: data?.map(item => item.permission) || [],
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

    const { error } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role', role);

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
