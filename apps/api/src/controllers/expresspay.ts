import type { NextFunction, Request, Response } from 'express';
import {
  getExpressPayPaymentRecord,
  getExpressPayPaymentStatus,
  handleExpressPayCallback,
  initiateExpressPayPayment,
  verifyExpressPayPayment,
} from '../services/expresspay';
import { createHttpError } from '../lib/httpError';
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

const buildSafeAppReturnUrl = ({
  returnUrl,
  paymentId,
}: {
  returnUrl?: string | null;
  paymentId?: string | null;
}) => {
  if (!returnUrl || !/^(myapp|exp):\/\//i.test(returnUrl)) {
    return null;
  }

  try {
    const url = new URL(returnUrl);
    if (paymentId && !url.searchParams.has('payment_id')) {
      url.searchParams.set('payment_id', paymentId);
    }
    return url.toString();
  } catch {
    return null;
  }
};

export const initiatePayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = req.user?.id as string | undefined;
    const authUser = (req.user || {}) as Record<string, unknown>;

    if (!authUserId) {
      return next(createHttpError(401, 'AUTH_REQUIRED', 'Authentication required'));
    }

    const profile = (req.userProfile || {}) as Record<string, unknown>;
    const body = (req.body || {}) as Record<string, unknown>;

    const userRole = typeof profile.role === 'string' ? profile.role : null;
    const profileUnitId = typeof profile.unit_id === 'string' ? profile.unit_id : null;
    const requestUnitId = typeof body.unit_id === 'string' ? body.unit_id : null;

    if (!requestUnitId) {
      return next(createHttpError(400, 'UNIT_ID_REQUIRED', 'unit_id is required'));
    }

    if (!isAdminRole(userRole) && profileUnitId && profileUnitId !== requestUnitId) {
      return next(
        createHttpError(403, 'PAYMENT_UNIT_SCOPE_VIOLATION', 'You can only initiate payments for your assigned unit')
      );
    }

    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return next(createHttpError(400, 'AMOUNT_INVALID', 'amount must be a positive number'));
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
      return next(
        createHttpError(
          400,
          'PAYMENT_METHOD_NOT_ALLOWED',
          errorMessage(policyError, 'This payment method is unavailable for the current transaction.'),
          policyError
        )
      );
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
        email:
          typeof profile.email === 'string'
            ? profile.email
            : typeof authUser.email === 'string'
              ? authUser.email
              : null,
        phone:
          typeof profile.phone === 'string'
            ? profile.phone
            : typeof authUser.phone === 'string'
              ? authUser.phone
              : typeof authUser.phone_number === 'string'
                ? authUser.phone_number
                : null,
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
    return next(
      createHttpError(500, 'EXPRESSPAY_INITIATE_FAILED', errorMessage(error, 'Failed to initiate ExpressPay payment'), error)
    );
  }
};

export const callback = async (req: Request, res: Response, next: NextFunction) => {
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
    return next(
      createHttpError(
        500,
        'EXPRESSPAY_CALLBACK_FAILED',
        errorMessage(error, 'ExpressPay callback processing failed'),
        error
      )
    );
  }
};

export const redirectToApp = async (req: Request, res: Response) => {
  const returnUrl = pickString(req.query, ['return_url']);
  const paymentId = pickString(req.query, ['payment_id']);
  const targetUrl = buildSafeAppReturnUrl({ returnUrl, paymentId });

  if (!targetUrl) {
    return res
      .status(200)
      .type('html')
      .send(
        '<!doctype html><html><head><meta charset="utf-8"><title>Return to Casa Nirvana</title></head><body style="font-family:Arial,sans-serif;padding:24px;"><h2>Payment completed</h2><p>You can now return to the Casa Nirvana app.</p></body></html>'
      );
  }

  return res
    .status(200)
    .type('html')
    .send(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Return to Casa Nirvana</title>
  </head>
  <body style="font-family: Arial, sans-serif; padding: 24px;">
    <h2>Returning to Casa Nirvana…</h2>
    <p>If the app does not open automatically, tap the button below.</p>
    <p><a href="${targetUrl}" style="display:inline-block;padding:12px 16px;background:#d32f2f;color:#fff;text-decoration:none;border-radius:8px;">Open App</a></p>
    <script>
      window.location.replace(${JSON.stringify(targetUrl)});
      setTimeout(function () {
        window.location.href = ${JSON.stringify(targetUrl)};
      }, 300);
    </script>
  </body>
</html>`);
};

export const getStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const paymentId = req.params.paymentId;
    const authUserId = req.user?.id as string | undefined;
    const userRole = (req.userProfile?.role as string | undefined) || null;

    if (!paymentId) {
      return next(createHttpError(400, 'PAYMENT_ID_REQUIRED', 'paymentId is required'));
    }

    const paymentRecord = await getExpressPayPaymentRecord(paymentId);
    if (!paymentRecord) {
      return next(createHttpError(404, 'PAYMENT_NOT_FOUND', 'Payment not found'));
    }

    if (!canAccessPayment({ role: userRole, authUserId, paymentPayerId: paymentRecord.payer_id })) {
      return next(createHttpError(403, 'PAYMENT_ACCESS_DENIED', 'You do not have access to this payment'));
    }

    const status = await getExpressPayPaymentStatus(paymentId);

    return res.status(200).json({ success: true, data: status });
  } catch (error: unknown) {
    return next(
      createHttpError(
        500,
        'EXPRESSPAY_STATUS_FETCH_FAILED',
        errorMessage(error, 'Failed to fetch ExpressPay payment status'),
        error
      )
    );
  }
};

export const verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
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
        return next(createHttpError(404, 'PAYMENT_NOT_FOUND', 'Payment not found'));
      }

      if (!canAccessPayment({ role: userRole, authUserId, paymentPayerId: paymentRecord.payer_id })) {
        return next(createHttpError(403, 'PAYMENT_ACCESS_DENIED', 'You do not have access to this payment'));
      }
    }

    const result = await verifyExpressPayPayment({ paymentId, token, orderId });

    if (!result.ok) {
      return next(
        createHttpError(
          404,
          'PAYMENT_VERIFY_RESOLUTION_FAILED',
          'Unable to resolve payment for verification',
          { reason: result.reason }
        )
      );
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
    return next(
      createHttpError(500, 'EXPRESSPAY_VERIFY_FAILED', errorMessage(error, 'Failed to verify ExpressPay payment'), error)
    );
  }
};
