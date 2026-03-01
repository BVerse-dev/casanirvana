import type { Request, Response } from 'express';
import {
  getExpressPayPaymentRecord,
  getExpressPayPaymentStatus,
  handleExpressPayCallback,
  initiateExpressPayPayment,
  verifyExpressPayPayment,
} from '../services/expresspay';
import { assertPaymentMethodAllowed } from '../services/paymentMethodPolicy';

const ADMIN_ROLES = new Set(['admin', 'superadmin', 'agency_manager', 'facility_manager']);
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isAdminRole = (role?: string | null) => {
  if (!role) return false;
  return ADMIN_ROLES.has(role);
};

const pickString = (source: unknown, keys: string[]): string | null => {
  if (!source || typeof source !== 'object') {
    return null;
  }

  const record = source as Record<string, unknown>;

  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
};

const canAccessPayment = ({
  role,
  authUserId,
  paymentPayerId,
}: {
  role?: string | null;
  authUserId?: string | null;
  paymentPayerId?: string | null;
}) => {
  if (isAdminRole(role)) {
    return true;
  }

  if (!authUserId || !paymentPayerId) {
    return false;
  }

  return authUserId === paymentPayerId;
};

const errorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};

const normalizeOptionalUuid = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const lowered = trimmed.toLowerCase();
  if (lowered === 'undefined' || lowered === 'null') {
    return null;
  }

  return UUID_REGEX.test(trimmed) ? trimmed : null;
};

export const initiatePayment = async (req: Request, res: Response) => {
  try {
    const authUserId = req.user?.id as string | undefined;

    if (!authUserId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const profile = (req.userProfile || {}) as Record<string, unknown>;
    const body = (req.body || {}) as Record<string, unknown>;

    const userRole = typeof profile.role === 'string' ? profile.role : null;
    const profileUnitId = typeof profile.unit_id === 'string' ? profile.unit_id : null;
    const requestUnitId = typeof body.unit_id === 'string' ? body.unit_id : null;

    if (!requestUnitId) {
      return res.status(400).json({ error: 'unit_id is required' });
    }

    if (!isAdminRole(userRole) && profileUnitId && profileUnitId !== requestUnitId) {
      return res.status(403).json({ error: 'You can only initiate payments for your assigned unit' });
    }

    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: 'amount must be a positive number' });
    }

    const paymentType = typeof body.payment_type === 'string' ? body.payment_type : 'general';
    const paymentMethod = typeof body.payment_method === 'string' ? body.payment_method : 'card';
    const sourceType = typeof body.source_type === 'string' ? body.source_type : null;
    const sourceId = normalizeOptionalUuid(body.source_id);
    const obligationId = normalizeOptionalUuid(body.obligation_id);

    try {
      await assertPaymentMethodAllowed({
        paymentMethod,
        amount,
        payerId: authUserId,
      });
    } catch (policyError: unknown) {
      return res.status(400).json({
        success: false,
        error: errorMessage(policyError, 'This payment method is unavailable for the current transaction.'),
      });
    }

    const result = await initiateExpressPayPayment({
      amount,
      currency:
        typeof body.currency_code === 'string'
          ? body.currency_code
          : typeof body.currency === 'string'
            ? body.currency
            : undefined,
      paymentType,
      paymentMethod,
      unitId: requestUnitId,
      payerId: authUserId,
      payerProfile: {
        first_name: typeof profile.first_name === 'string' ? profile.first_name : null,
        last_name: typeof profile.last_name === 'string' ? profile.last_name : null,
        email: typeof profile.email === 'string' ? profile.email : null,
        phone: typeof profile.phone === 'string' ? profile.phone : null,
      },
      description: typeof body.description === 'string' ? body.description : null,
      bookingId: normalizeOptionalUuid(body.booking_id),
      sourceType,
      sourceId,
      obligationId,
      communityId: typeof profile.community_id === 'string' ? profile.community_id : null,
      metadata:
        body.metadata && typeof body.metadata === 'object' && !Array.isArray(body.metadata)
          ? (body.metadata as Record<string, unknown>)
          : {},
      idempotencyKey: typeof body.idempotency_key === 'string' ? body.idempotency_key : null,
    });

    return res.status(201).json({
      success: true,
      data: {
        payment_id: result.paymentId,
        transaction_id: result.transactionId,
        checkout_url: result.checkoutUrl,
        provider_reference: result.providerReference,
        token: result.token,
        status: result.status,
        client_action: result.checkoutUrl ? 'open_url' : 'poll',
      },
    });
  } catch (error: unknown) {
    return res.status(500).json({
      success: false,
      error: errorMessage(error, 'Failed to initiate ExpressPay payment'),
    });
  }
};

export const callback = async (req: Request, res: Response) => {
  try {
    const token = pickString(req.body, ['token']) || pickString(req.query, ['token']);
    const orderId =
      pickString(req.body, ['order-id', 'order_id']) || pickString(req.query, ['order-id', 'order_id']);

    const result = await handleExpressPayCallback({
      token,
      orderId,
      rawPayload: {
        body: (req.body || {}) as Record<string, unknown>,
        query: (req.query || {}) as Record<string, unknown>,
      },
    });

    return res.status(200).json({
      success: result.ok,
      reason: result.reason,
      data: result.payment
        ? {
            payment_id: result.payment.id,
            status: result.payment.status,
            transaction_id: result.payment.transaction_id,
            reference_number: result.payment.reference_number,
          }
        : null,
    });
  } catch (error: unknown) {
    return res.status(500).json({
      success: false,
      error: errorMessage(error, 'ExpressPay callback processing failed'),
    });
  }
};

export const getStatus = async (req: Request, res: Response) => {
  try {
    const paymentId = req.params.paymentId;
    const authUserId = req.user?.id as string | undefined;
    const userRole = (req.userProfile?.role as string | undefined) || null;

    if (!paymentId) {
      return res.status(400).json({ error: 'paymentId is required' });
    }

    const paymentRecord = await getExpressPayPaymentRecord(paymentId);
    if (!paymentRecord) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (!canAccessPayment({ role: userRole, authUserId, paymentPayerId: paymentRecord.payer_id })) {
      return res.status(403).json({ error: 'You do not have access to this payment' });
    }

    const status = await getExpressPayPaymentStatus(paymentId);

    return res.status(200).json({ success: true, data: status });
  } catch (error: unknown) {
    return res.status(500).json({
      success: false,
      error: errorMessage(error, 'Failed to fetch ExpressPay payment status'),
    });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const body = (req.body || {}) as Record<string, unknown>;
    const authUserId = req.user?.id as string | undefined;
    const userRole = (req.userProfile?.role as string | undefined) || null;

    const paymentId = typeof body.payment_id === 'string' ? body.payment_id : null;
    const token = typeof body.token === 'string' ? body.token : null;
    const orderId = typeof body.order_id === 'string' ? body.order_id : null;

    if (paymentId) {
      const paymentRecord = await getExpressPayPaymentRecord(paymentId);

      if (!paymentRecord) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      if (!canAccessPayment({ role: userRole, authUserId, paymentPayerId: paymentRecord.payer_id })) {
        return res.status(403).json({ error: 'You do not have access to this payment' });
      }
    }

    const result = await verifyExpressPayPayment({ paymentId, token, orderId });

    if (!result.ok) {
      return res.status(404).json({
        success: false,
        reason: result.reason,
        error: 'Unable to resolve payment for verification',
      });
    }

    return res.status(200).json({
      success: true,
      reason: result.reason,
      data: {
        payment: result.payment,
        provider_result: result.providerResult,
      },
    });
  } catch (error: unknown) {
    return res.status(500).json({
      success: false,
      error: errorMessage(error, 'Failed to verify ExpressPay payment'),
    });
  }
};
