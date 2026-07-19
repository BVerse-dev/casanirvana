import { NextFunction, Request, Response } from 'express';

import { createHttpError } from '../lib/httpError';
import { supabase } from '../lib/supabase';
import {
  canAccessAgency,
  canAccessCommunity,
  isUuid,
  resolveAdminScope,
} from '../services/adminScope';

const AGENCY_CONFIGURATION_COLUMNS = new Set([
  'agency_id',
  'agency_name',
  'default_rate',
  'residential_rate',
  'commercial_rate',
  'luxury_rate',
  'plot_rate',
  'junior_agent_split',
  'senior_agent_split',
  'team_leader_split',
  'manager_split',
  'split_policy',
  'payment_schedule',
  'auto_approval_required',
  'max_photos_per_listing',
  'listing_duration_days',
  'renewal_notification_days',
  'featured_listing_fee',
  'mandatory_fields',
  'auto_assignment',
  'lead_rotation',
  'follow_up_reminders',
  'max_leads_per_agent',
  'lead_expiry_days',
  'hot_lead_budget_range',
  'hot_lead_response_time_hours',
  'hot_lead_engagement_score',
  'sms_notifications',
  'email_notifications',
  'whatsapp_integration',
  'automated_follow_ups',
  'client_portal_access',
  'marketing_emails',
  'monthly_listing_target',
  'monthly_deal_target',
  'monthly_revenue_target',
  'track_response_time',
  'track_conversion_rate',
  'track_client_satisfaction',
  'track_repeat_business',
  'performance_bonus_enabled',
  'quarterly_incentives_enabled',
  'annual_awards_enabled',
  'client_payment_days',
  'commission_payment_days',
  'late_payment_penalty',
  'marketing_budget',
  'travel_allowance',
  'communication_allowance',
  'gst_applicable',
  'gst_percentage',
  'gst_number',
  'tds_applicable',
  'tds_percentage',
  'rera_registration_mandatory',
  'rera_document_verification',
  'rera_periodic_renewal',
  'client_data_encryption',
  'gdpr_compliance',
  'data_retention_months',
  'agreement_templates',
  'digital_signatures',
  'document_storage',
  'status',
]);

const COMMUNITY_CONFIGURATION_COLUMNS = new Set([
  'access_control_integration',
  'advance_payment_discount',
  'amenity_module_enabled',
  'auto_receipt_generation',
  'auto_reminders',
  'automatic_approval',
  'booking_advance_days',
  'brand_color_primary',
  'brand_color_secondary',
  'brand_logo_url',
  'cancellation_hours',
  'cash_payments_allowed',
  'cctv_integration',
  'cheque_payments_allowed',
  'complaints_module_enabled',
  'currency',
  'custom_css',
  'data_retention_months',
  'date_format',
  'email_notifications',
  'emergency_alert_enabled',
  'emergency_broadcast_enabled',
  'emergency_contacts',
  'grace_period_days',
  'group_booking_allowed',
  'id_verification_required',
  'language',
  'late_fee_percentage',
  'login_attempt_limit',
  'maintenance_charges_auto_calculate',
  'maintenance_due_day',
  'maintenance_module_enabled',
  'max_bookings_per_user_per_month',
  'max_visitors_per_day',
  'max_visitors_per_unit',
  'messaging_module_enabled',
  'notice_board_enabled',
  'online_payments_enabled',
  'panic_button_enabled',
  'password_expiry_days',
  'payment_gateways',
  'payment_module_enabled',
  'payment_reminder_days',
  'peak_hour_charges',
  'photo_mandatory',
  'pre_approval_required',
  'privacy_policy',
  'push_notifications',
  'security_deposit_required',
  'session_timeout_minutes',
  'sms_notifications',
  'terms_and_conditions',
  'time_format',
  'timezone',
  'two_factor_auth_required',
  'vehicle_registration_required',
  'visiting_hours_end',
  'visiting_hours_start',
  'visitor_module_enabled',
  'visitor_pass_duration_hours',
  'visitor_photography',
  'weekend_visiting_allowed',
  'welcome_message',
  'whatsapp_integration',
]);

const sanitizePayload = (input: Record<string, unknown>, allowList: Set<string>) => {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input || {})) {
    if (allowList.has(key)) {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

export async function listCommunityConfigurations(req: Request, res: Response, next: NextFunction) {
  try {
    const requestedCommunityId =
      typeof req.query.community_id === 'string' && isUuid(req.query.community_id)
        ? req.query.community_id
        : null;
    const scope = await resolveAdminScope(req);

    if (requestedCommunityId && !canAccessCommunity(scope, requestedCommunityId)) {
      return next(
        createHttpError(403, 'COMMUNITY_CONFIGURATION_SCOPE_VIOLATION', 'Access denied for the requested community.')
      );
    }

    let query = supabase
      .from('community_configurations')
      .select('*, communities(name)')
      .order('updated_at', { ascending: false });

    if (requestedCommunityId) {
      query = query.eq('community_id', requestedCommunityId);
    } else if (!scope.isGlobal) {
      if (scope.communityIds.length === 0) {
        return res.json({ data: [] });
      }
      query = query.in('community_id', scope.communityIds);
    }

    const { data, error } = await query;
    if (error) {
      return next(
        createHttpError(
          500,
          'COMMUNITY_CONFIGURATION_LIST_FAILED',
          'Failed to fetch community configurations',
          error
        )
      );
    }

    const normalized = (data || []).map((row: any) => ({
      ...row,
      community_name: row.communities?.name || null,
    }));

    return res.json({ data: normalized });
  } catch (error) {
    next(error);
  }
}

export async function updateCommunityConfiguration(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) {
      return next(createHttpError(400, 'CONFIGURATION_ID_INVALID', 'Invalid configuration id'));
    }

    const scope = await resolveAdminScope(req);
    const { data: existing, error: existingError } = await supabase
      .from('community_configurations')
      .select('id, community_id')
      .eq('id', id)
      .maybeSingle();

    if (existingError) {
      return next(
        createHttpError(
          500,
          'COMMUNITY_CONFIGURATION_LOOKUP_FAILED',
          'Failed to load community configuration',
          existingError
        )
      );
    }
    if (!existing) {
      return next(createHttpError(404, 'COMMUNITY_CONFIGURATION_NOT_FOUND', 'Community configuration not found'));
    }
    if (!canAccessCommunity(scope, existing.community_id)) {
      return next(
        createHttpError(403, 'COMMUNITY_CONFIGURATION_SCOPE_VIOLATION', 'Access denied for the requested community.')
      );
    }

    const payload = sanitizePayload(req.body || {}, COMMUNITY_CONFIGURATION_COLUMNS);
    if (Object.keys(payload).length === 0) {
      return next(
        createHttpError(
          400,
          'COMMUNITY_CONFIGURATION_UPDATE_EMPTY',
          'No supported community configuration fields were provided'
        )
      );
    }
    payload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('community_configurations')
      .update(payload)
      .eq('id', id)
      .select('*, communities(name)')
      .single();

    if (error) {
      return next(
        createHttpError(
          500,
          'COMMUNITY_CONFIGURATION_UPDATE_FAILED',
          'Failed to update community configuration',
          error
        )
      );
    }

    return res.json({
      data: {
        ...data,
        community_name: (data as any).communities?.name || null,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function listAgencyConfigurations(req: Request, res: Response, next: NextFunction) {
  try {
    const requestedAgencyId =
      typeof req.query.agency_id === 'string' && isUuid(req.query.agency_id)
        ? req.query.agency_id
        : null;
    const scope = await resolveAdminScope(req);

    if (requestedAgencyId && !canAccessAgency(scope, requestedAgencyId)) {
      return next(
        createHttpError(403, 'AGENCY_CONFIGURATION_SCOPE_VIOLATION', 'Access denied for the requested agency.')
      );
    }

    let query = supabase
      .from('agency_configurations')
      .select('*')
      .order('agency_name', { ascending: true });

    if (requestedAgencyId) {
      query = query.eq('agency_id', requestedAgencyId);
    } else if (!scope.isGlobal) {
      if (scope.agencyIds.length === 0) {
        return res.json({ data: [] });
      }
      query = query.in('agency_id', scope.agencyIds);
    }

    const { data, error } = await query;
    if (error) {
      return next(
        createHttpError(500, 'AGENCY_CONFIGURATION_LIST_FAILED', 'Failed to fetch agency configurations', error)
      );
    }

    return res.json({ data: data || [] });
  } catch (error) {
    next(error);
  }
}

export async function createAgencyConfiguration(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const payload = sanitizePayload(req.body || {}, AGENCY_CONFIGURATION_COLUMNS);

    if (!isUuid(payload.agency_id)) {
      return next(createHttpError(400, 'AGENCY_ID_REQUIRED', 'agency_id is required'));
    }
    if (typeof payload.agency_name !== 'string' || payload.agency_name.trim().length === 0) {
      return next(createHttpError(400, 'AGENCY_NAME_REQUIRED', 'agency_name is required'));
    }
    if (!canAccessAgency(scope, payload.agency_id)) {
      return next(
        createHttpError(403, 'AGENCY_CONFIGURATION_SCOPE_VIOLATION', 'Access denied for the requested agency.')
      );
    }

    payload.last_updated = new Date().toISOString();
    payload.updated_by = req.user?.id || req.userProfile?.id || null;

    const { data, error } = await supabase
      .from('agency_configurations')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      return next(
        createHttpError(500, 'AGENCY_CONFIGURATION_CREATE_FAILED', 'Failed to create agency configuration', error)
      );
    }

    return res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
}

export async function updateAgencyConfiguration(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) {
      return next(createHttpError(400, 'CONFIGURATION_ID_INVALID', 'Invalid configuration id'));
    }

    const scope = await resolveAdminScope(req);
    const { data: existing, error: existingError } = await supabase
      .from('agency_configurations')
      .select('id, agency_id')
      .eq('id', id)
      .maybeSingle();

    if (existingError) {
      return next(
        createHttpError(
          500,
          'AGENCY_CONFIGURATION_LOOKUP_FAILED',
          'Failed to load agency configuration',
          existingError
        )
      );
    }
    if (!existing) {
      return next(createHttpError(404, 'AGENCY_CONFIGURATION_NOT_FOUND', 'Agency configuration not found'));
    }
    if (!canAccessAgency(scope, existing.agency_id)) {
      return next(
        createHttpError(403, 'AGENCY_CONFIGURATION_SCOPE_VIOLATION', 'Access denied for the requested agency.')
      );
    }

    const payload = sanitizePayload(req.body || {}, AGENCY_CONFIGURATION_COLUMNS);
    delete payload.agency_id;

    if (Object.keys(payload).length === 0) {
      return next(
        createHttpError(
          400,
          'AGENCY_CONFIGURATION_UPDATE_EMPTY',
          'No supported agency configuration fields were provided'
        )
      );
    }

    payload.last_updated = new Date().toISOString();
    payload.updated_by = req.user?.id || req.userProfile?.id || null;

    const { data, error } = await supabase
      .from('agency_configurations')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return next(
        createHttpError(500, 'AGENCY_CONFIGURATION_UPDATE_FAILED', 'Failed to update agency configuration', error)
      );
    }

    return res.json({ data });
  } catch (error) {
    next(error);
  }
}

export async function deleteAgencyConfiguration(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) {
      return next(createHttpError(400, 'CONFIGURATION_ID_INVALID', 'Invalid configuration id'));
    }

    const scope = await resolveAdminScope(req);
    const { data: existing, error: existingError } = await supabase
      .from('agency_configurations')
      .select('id, agency_id')
      .eq('id', id)
      .maybeSingle();

    if (existingError) {
      return next(
        createHttpError(
          500,
          'AGENCY_CONFIGURATION_LOOKUP_FAILED',
          'Failed to load agency configuration',
          existingError
        )
      );
    }
    if (!existing) {
      return next(createHttpError(404, 'AGENCY_CONFIGURATION_NOT_FOUND', 'Agency configuration not found'));
    }
    if (!canAccessAgency(scope, existing.agency_id)) {
      return next(
        createHttpError(403, 'AGENCY_CONFIGURATION_SCOPE_VIOLATION', 'Access denied for the requested agency.')
      );
    }

    const { error } = await supabase.from('agency_configurations').delete().eq('id', id);
    if (error) {
      return next(
        createHttpError(500, 'AGENCY_CONFIGURATION_DELETE_FAILED', 'Failed to delete agency configuration', error)
      );
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function getAgencyConfigurationStats(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);

    let query = supabase
      .from('agency_configurations')
      .select('status, split_policy, payment_schedule, document_storage');

    if (!scope.isGlobal) {
      if (scope.agencyIds.length === 0) {
        return res.json({
          data: {
            total: 0,
            active: 0,
            inactive: 0,
            splitPolicyBreakdown: {
              agency_agent: 0,
              tiered: 0,
              performance_based: 0,
            },
            paymentScheduleBreakdown: {
              immediate: 0,
              monthly: 0,
              quarterly: 0,
            },
            documentStorageBreakdown: {
              local: 0,
              cloud: 0,
              hybrid: 0,
            },
          },
        });
      }
      query = query.in('agency_id', scope.agencyIds);
    }

    const { data, error } = await query;
    if (error) {
      return next(
        createHttpError(
          500,
          'AGENCY_CONFIGURATION_STATS_FAILED',
          'Failed to fetch agency configuration stats',
          error
        )
      );
    }

    const rows = data || [];
    return res.json({
      data: {
        total: rows.length,
        active: rows.filter((row: any) => row.status === 'active').length,
        inactive: rows.filter((row: any) => row.status === 'inactive').length,
        splitPolicyBreakdown: {
          agency_agent: rows.filter((row: any) => row.split_policy === 'agency_agent').length,
          tiered: rows.filter((row: any) => row.split_policy === 'tiered').length,
          performance_based: rows.filter((row: any) => row.split_policy === 'performance_based').length,
        },
        paymentScheduleBreakdown: {
          immediate: rows.filter((row: any) => row.payment_schedule === 'immediate').length,
          monthly: rows.filter((row: any) => row.payment_schedule === 'monthly').length,
          quarterly: rows.filter((row: any) => row.payment_schedule === 'quarterly').length,
        },
        documentStorageBreakdown: {
          local: rows.filter((row: any) => row.document_storage === 'local').length,
          cloud: rows.filter((row: any) => row.document_storage === 'cloud').length,
          hybrid: rows.filter((row: any) => row.document_storage === 'hybrid').length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
