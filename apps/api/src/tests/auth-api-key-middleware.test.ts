import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { requireMarketingContactApiKey, requireOnboardingApiKey, requirePaymentChargeCronApiKey, requirePayoutAutomationApiKey } from '../middleware/apiKey';
import { errorHandler } from '../middleware/errorHandler';
import { requireAuth } from '../middleware/auth';
import type { NextFunction, Request, Response } from 'express';

const authMocks = vi.hoisted(() => ({
  getUser: vi.fn(),
}));

const observabilityMocks = vi.hoisted(() => ({
  captureException: vi.fn(),
}));

const loggerMocks = vi.hoisted(() => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}));

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: authMocks.getUser,
    },
  },
}));

vi.mock('../lib/observability', () => ({
  captureException: observabilityMocks.captureException,
}));

vi.mock('../lib/logger', () => ({
  logger: {
    debug: loggerMocks.debug,
    info: loggerMocks.info,
    warn: loggerMocks.warn,
    error: loggerMocks.error,
    child: vi.fn(() => ({
      debug: loggerMocks.debug,
      info: loggerMocks.info,
      warn: loggerMocks.warn,
      error: loggerMocks.error,
    })),
  },
}));

function createMockRequest(overrides: Partial<Request> = {}) {
  const headers = (overrides.headers || {}) as Record<string, string | undefined>;

  return {
    body: {},
    params: {},
    query: {},
    headers,
    method: 'GET',
    originalUrl: '/test',
    url: '/test',
    header(name: string) {
      return headers[name.toLowerCase()] || headers[name];
    },
    ...overrides,
  } as Request;
}

function createMockResponse() {
  const response = {
    statusCode: 200,
    body: null as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };

  return response as unknown as Response & { statusCode: number; body: unknown };
}

async function runFailingMiddleware(
  middleware: (req: Request, res: Response, next: NextFunction) => unknown | Promise<unknown>,
  req: Request
) {
  const response = createMockResponse();
  const next = vi.fn();

  await middleware(req, response, next as NextFunction);

  const err = next.mock.calls[0]?.[0];
  errorHandler(err, req, response, vi.fn() as NextFunction);

  return response;
}

describe('Auth and API key middleware failures', () => {
  const originalOnboardingKey = process.env.ONBOARDING_REQUEST_API_KEY;
  const originalMarketingContactKey = process.env.MARKETING_CONTACT_API_KEY;
  const originalChargeKey = process.env.PAYMENT_CHARGE_CRON_API_KEY;
  const originalPayoutKey = process.env.PAYOUT_AUTOMATION_API_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ONBOARDING_REQUEST_API_KEY = 'onboarding-secret';
    process.env.MARKETING_CONTACT_API_KEY = 'marketing-contact-secret';
    process.env.PAYMENT_CHARGE_CRON_API_KEY = 'charge-secret';
    process.env.PAYOUT_AUTOMATION_API_KEY = 'payout-secret';
  });

  afterEach(() => {
    process.env.ONBOARDING_REQUEST_API_KEY = originalOnboardingKey;
    process.env.MARKETING_CONTACT_API_KEY = originalMarketingContactKey;
    process.env.PAYMENT_CHARGE_CRON_API_KEY = originalChargeKey;
    process.env.PAYOUT_AUTOMATION_API_KEY = originalPayoutKey;
  });

  it('rejects missing bearer tokens with the shared auth error code', async () => {
    const req = createMockRequest({
      originalUrl: '/protected',
      url: '/protected',
    });
    const res = await runFailingMiddleware(requireAuth, req);

    expect(res.statusCode).toBe(401);
    expect((res.body as any).error.code).toBe('AUTH_TOKEN_MISSING');
    expect(authMocks.getUser).not.toHaveBeenCalled();
  });

  it('rejects invalid bearer tokens with the shared auth error code', async () => {
    authMocks.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'expired token' },
    });

    const req = createMockRequest({
      headers: { authorization: 'Bearer expired-token' },
      originalUrl: '/protected',
      url: '/protected',
    });
    const res = await runFailingMiddleware(requireAuth, req);

    expect(res.statusCode).toBe(401);
    expect((res.body as any).error.code).toBe('AUTH_TOKEN_INVALID');
  });

  it('rejects invalid onboarding API keys with the normalized envelope', async () => {
    const req = createMockRequest({
      headers: { 'x-onboarding-api-key': 'wrong-key' },
      method: 'POST',
      originalUrl: '/onboarding',
      url: '/onboarding',
    });
    const res = await runFailingMiddleware(requireOnboardingApiKey, req);

    expect(res.statusCode).toBe(401);
    expect((res.body as any).error.code).toBe('ONBOARDING_API_KEY_INVALID');
  });

  it('rejects invalid marketing contact API keys with the normalized envelope', async () => {
    const req = createMockRequest({
      headers: { 'x-marketing-contact-key': 'wrong-key' },
      method: 'POST',
      originalUrl: '/contact/requests',
      url: '/contact/requests',
    });
    const res = await runFailingMiddleware(requireMarketingContactApiKey, req);

    expect(res.statusCode).toBe(401);
    expect((res.body as any).error.code).toBe('MARKETING_CONTACT_API_KEY_INVALID');
  });

  it('rejects invalid payment charge cron keys with the normalized envelope', async () => {
    const req = createMockRequest({
      headers: { 'x-payment-charge-cron-key': 'wrong-key' },
      method: 'POST',
      originalUrl: '/payment-charge',
      url: '/payment-charge',
    });
    const res = await runFailingMiddleware(requirePaymentChargeCronApiKey, req);

    expect(res.statusCode).toBe(401);
    expect((res.body as any).error.code).toBe('PAYMENT_CHARGE_CRON_KEY_INVALID');
  });

  it('fails closed when the payout automation key is not configured', async () => {
    delete process.env.PAYOUT_AUTOMATION_API_KEY;

    const req = createMockRequest({
      headers: { 'x-payout-automation-key': 'any-key' },
      method: 'POST',
      originalUrl: '/payout',
      url: '/payout',
    });
    const res = await runFailingMiddleware(requirePayoutAutomationApiKey, req);

    expect(res.statusCode).toBe(500);
    expect((res.body as any).error.code).toBe('PAYOUT_AUTOMATION_KEY_MISSING');
  });
});
