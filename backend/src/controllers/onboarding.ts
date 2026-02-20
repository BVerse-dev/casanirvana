import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';

const ALLOWED_ONBOARDING_ROLES = ['agency_manager', 'facility_manager'] as const;
const ALLOWED_STATUSES = ['pending', 'approved', 'rejected'] as const;

type AllowedOnboardingRole = typeof ALLOWED_ONBOARDING_ROLES[number];
type AllowedStatus = typeof ALLOWED_STATUSES[number];

const isAllowedOnboardingRole = (role: unknown): role is AllowedOnboardingRole =>
  typeof role === 'string' && (ALLOWED_ONBOARDING_ROLES as readonly string[]).includes(role);

const isAllowedStatus = (status: unknown): status is AllowedStatus =>
  typeof status === 'string' && (ALLOWED_STATUSES as readonly string[]).includes(status);

export async function createOnboardingRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      requested_role,
      first_name,
      last_name,
      email,
      phone,
      organization_name,
      community_name,
      country,
      city,
      address,
      referral_code,
      source,
      metadata,
    } = req.body || {};

    if (!requested_role || !isAllowedOnboardingRole(requested_role)) {
      return res.status(400).json({ error: 'Invalid requested_role' });
    }

    if (!first_name || !last_name || !email) {
      return res.status(400).json({ error: 'first_name, last_name, and email are required' });
    }

    if (typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const { data: existing, error: existingError } = await supabase
      .from('admin_onboarding_requests')
      .select('id, status')
      .eq('email', email)
      .eq('status', 'pending');

    if (existingError) {
      return res.status(500).json({ error: 'Failed to check existing requests', details: existingError });
    }

    if (existing && existing.length > 0) {
      return res.status(409).json({ error: 'An onboarding request is already pending for this email' });
    }

    const { data, error } = await supabase
      .from('admin_onboarding_requests')
      .insert({
        requested_role,
        first_name,
        last_name,
        email,
        phone: phone || null,
        organization_name: organization_name || null,
        community_name: community_name || null,
        country: country || null,
        city: city || null,
        address: address || null,
        referral_code: referral_code || null,
        source: source || null,
        metadata: metadata || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to create onboarding request', details: error });
    }

    return res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function listOnboardingRequests(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, requested_role, search, limit, offset } = req.query;

    if (status && !isAllowedStatus(status)) {
      return res.status(400).json({ error: 'Invalid status filter' });
    }

    if (requested_role && !isAllowedOnboardingRole(requested_role)) {
      return res.status(400).json({ error: 'Invalid requested_role filter' });
    }

    const limitValue = Math.min(parseInt(limit as string, 10) || 50, 200);
    const offsetValue = Math.max(parseInt(offset as string, 10) || 0, 0);

    let query = supabase
      .from('admin_onboarding_requests')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status as string);
    }

    if (requested_role) {
      query = query.eq('requested_role', requested_role as string);
    }

    if (search && typeof search === 'string') {
      const like = `%${search}%`;
      query = query.or(
        [
          `email.ilike.${like}`,
          `first_name.ilike.${like}`,
          `last_name.ilike.${like}`,
          `organization_name.ilike.${like}`,
          `community_name.ilike.${like}`,
        ].join(',')
      );
    }

    const { data, error, count } = await query.range(offsetValue, offsetValue + limitValue - 1);

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch onboarding requests', details: error });
    }

    return res.json({ data, count, limit: limitValue, offset: offsetValue });
  } catch (err) {
    next(err);
  }
}

export async function updateOnboardingRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { status, review_notes, invited_user_id } = req.body || {};

    if (!id) {
      return res.status(400).json({ error: 'Missing onboarding request id' });
    }

    if (status && !isAllowedStatus(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (status) {
      updates.status = status;
      if (status !== 'pending') {
        updates.reviewed_by = req.user?.id || null;
        updates.reviewed_at = new Date().toISOString();
      }
    }

    if (review_notes !== undefined) {
      updates.review_notes = review_notes;
    }

    if (invited_user_id !== undefined) {
      updates.invited_user_id = invited_user_id;
    }

    if (Object.keys(updates).length === 1) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    const { data, error } = await supabase
      .from('admin_onboarding_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update onboarding request', details: error });
    }

    return res.json(data);
  } catch (err) {
    next(err);
  }
}
