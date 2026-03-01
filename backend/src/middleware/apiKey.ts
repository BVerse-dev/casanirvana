import { Request, Response, NextFunction } from 'express';

export function requireOnboardingApiKey(req: Request, res: Response, next: NextFunction) {
  const expectedKey = process.env.ONBOARDING_REQUEST_API_KEY;
  const providedKey = req.header('x-onboarding-api-key');

  if (!expectedKey) {
    return res.status(500).json({ error: 'Onboarding API key is not configured' });
  }

  if (!providedKey || providedKey !== expectedKey) {
    return res.status(401).json({ error: 'Invalid onboarding API key' });
  }

  next();
}

export function requirePaymentChargeCronApiKey(req: Request, res: Response, next: NextFunction) {
  const expectedKey = process.env.PAYMENT_CHARGE_CRON_API_KEY;
  const providedKey = req.header('x-payment-charge-cron-key');

  if (!expectedKey) {
    return res.status(500).json({ error: 'Payment charge cron API key is not configured' });
  }

  if (!providedKey || providedKey !== expectedKey) {
    return res.status(401).json({ error: 'Invalid payment charge cron API key' });
  }

  next();
}
