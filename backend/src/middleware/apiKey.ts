import { Request, Response, NextFunction } from 'express';
import { createHttpError } from '../lib/httpError';

export function requireOnboardingApiKey(req: Request, res: Response, next: NextFunction) {
  const expectedKey = process.env.ONBOARDING_REQUEST_API_KEY;
  const providedKey = req.header('x-onboarding-api-key');

  if (!expectedKey) {
    return next(createHttpError(500, 'ONBOARDING_API_KEY_MISSING', 'Onboarding API key is not configured'));
  }

  if (!providedKey || providedKey !== expectedKey) {
    return next(createHttpError(401, 'ONBOARDING_API_KEY_INVALID', 'Invalid onboarding API key'));
  }

  next();
}

export function requirePaymentChargeCronApiKey(req: Request, res: Response, next: NextFunction) {
  const expectedKey = process.env.PAYMENT_CHARGE_CRON_API_KEY;
  const providedKey = req.header('x-payment-charge-cron-key');

  if (!expectedKey) {
    return next(createHttpError(500, 'PAYMENT_CHARGE_CRON_KEY_MISSING', 'Payment charge cron API key is not configured'));
  }

  if (!providedKey || providedKey !== expectedKey) {
    return next(createHttpError(401, 'PAYMENT_CHARGE_CRON_KEY_INVALID', 'Invalid payment charge cron API key'));
  }

  next();
}

export function requirePayoutAutomationApiKey(req: Request, res: Response, next: NextFunction) {
  const expectedKey = process.env.PAYOUT_AUTOMATION_API_KEY;
  const providedKey = req.header('x-payout-automation-key');

  if (!expectedKey) {
    return next(createHttpError(500, 'PAYOUT_AUTOMATION_KEY_MISSING', 'Payout automation API key is not configured'));
  }

  if (!providedKey || providedKey !== expectedKey) {
    return next(createHttpError(401, 'PAYOUT_AUTOMATION_KEY_INVALID', 'Invalid payout automation API key'));
  }

  next();
}
