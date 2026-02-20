import type { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

const DEFAULT_WINDOW_MS = 15 * 60 * 1000;

const envNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const isRateLimitEnabled = process.env.RATE_LIMIT_ENABLED !== 'false';

const responseBody = {
  error: 'Too many requests',
  message: 'Please slow down and try again later.',
};

const createLimiter = (options: { windowMs: number; max: number }) => {
  if (!isRateLimitEnabled) {
    return (_req: Request, _res: Response, next: NextFunction) => next();
  }

  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    skip: req => req.method === 'OPTIONS',
    handler: (req, res) => {
      res.status(429).json({
        ...responseBody,
        requestId: req.requestId || null,
      });
    },
  });
};

export const apiRateLimiter = createLimiter({
  windowMs: envNumber(process.env.RATE_LIMIT_WINDOW_MS, DEFAULT_WINDOW_MS),
  max: envNumber(process.env.RATE_LIMIT_MAX, 300),
});

export const adminRateLimiter = createLimiter({
  windowMs: envNumber(process.env.ADMIN_RATE_LIMIT_WINDOW_MS, DEFAULT_WINDOW_MS),
  max: envNumber(process.env.ADMIN_RATE_LIMIT_MAX, 120),
});

export const authRateLimiter = createLimiter({
  windowMs: envNumber(process.env.AUTH_RATE_LIMIT_WINDOW_MS, DEFAULT_WINDOW_MS),
  max: envNumber(process.env.AUTH_RATE_LIMIT_MAX, 10),
});

export const onboardingRateLimiter = createLimiter({
  windowMs: envNumber(process.env.ONBOARDING_RATE_LIMIT_WINDOW_MS, DEFAULT_WINDOW_MS),
  max: envNumber(process.env.ONBOARDING_RATE_LIMIT_MAX, 5),
});

export const uploadRateLimiter = createLimiter({
  windowMs: envNumber(process.env.UPLOAD_RATE_LIMIT_WINDOW_MS, DEFAULT_WINDOW_MS),
  max: envNumber(process.env.UPLOAD_RATE_LIMIT_MAX, 30),
});
