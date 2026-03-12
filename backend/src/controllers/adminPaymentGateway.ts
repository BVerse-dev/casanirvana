import type { NextFunction, Request, Response } from 'express';
import { createHttpError } from '../lib/httpError';
import {
  getExpressPayConfig,
  testExpressPayConfig,
  upsertExpressPayConfig,
} from '../services/adminPaymentGateway';

const errorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};

export const getExpressPayGatewayConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query as Record<string, string | undefined>;
    const result = await getExpressPayConfig({
      mode: query.mode,
      scope: query.scope,
      communityId: query.community_id,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error: unknown) {
    return next(
      createHttpError(500, 'EXPRESSPAY_CONFIG_FETCH_FAILED', errorMessage(error, 'Failed to fetch ExpressPay config'), error)
    );
  }
};

export const updateExpressPayGatewayConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as Record<string, unknown>;

    const result = await upsertExpressPayConfig({
      mode: String(body.mode || 'test') as 'test' | 'live',
      scope: String(body.scope || 'global') as 'global' | 'community',
      community_id: (body.community_id as string | null | undefined) || null,
      is_enabled: Boolean(body.is_enabled),
      currency: (body.currency as string | undefined) || undefined,
      callback_path: (body.callback_path as string | undefined) || undefined,
      webhook_url: (body.webhook_url as string | null | undefined) ?? null,
      submit_url: (body.submit_url as string | null | undefined) ?? null,
      query_url: (body.query_url as string | null | undefined) ?? null,
      checkout_url: (body.checkout_url as string | null | undefined) ?? null,
      merchant_id: (body.merchant_id as string | null | undefined) ?? null,
      api_key: (body.api_key as string | null | undefined) ?? null,
      actor_profile_id: (req.userProfile?.id as string | undefined) || null,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error: unknown) {
    return next(
      createHttpError(
        500,
        'EXPRESSPAY_CONFIG_UPDATE_FAILED',
        errorMessage(error, 'Failed to update ExpressPay config'),
        error
      )
    );
  }
};

export const testExpressPayGatewayConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as Record<string, unknown>;
    const result = await testExpressPayConfig({
      mode: String(body.mode || 'test'),
      scope: String(body.scope || 'global'),
      communityId: (body.community_id as string | null | undefined) || null,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error: unknown) {
    return next(
      createHttpError(
        500,
        'EXPRESSPAY_CONFIG_TEST_FAILED',
        errorMessage(error, 'Failed to test ExpressPay connection'),
        error
      )
    );
  }
};
