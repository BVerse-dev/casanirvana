import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { createHttpError } from '../lib/httpError';
import { errorHandler } from '../middleware/errorHandler';
import { validateRequest } from '../middleware/validate';
import type { NextFunction, Request, Response } from 'express';

const observabilityMocks = vi.hoisted(() => ({
  captureException: vi.fn(),
}));

const loggerMocks = vi.hoisted(() => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
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
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    method: 'GET',
    originalUrl: '/test',
    url: '/test',
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

describe('Error envelope', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the normalized error envelope for HttpError responses', async () => {
    const req = createMockRequest({
      headers: { 'x-request-id': 'req-123' },
      originalUrl: '/http-error',
      url: '/http-error',
    });
    const res = createMockResponse();

    errorHandler(
      createHttpError(422, 'ACCOUNT_INVALID', 'Bad account payload', { field: 'email' }),
      req,
      res,
      vi.fn() as NextFunction
    );

    expect(res.statusCode).toBe(422);
    expect(res.body).toEqual({
      error: {
        code: 'ACCOUNT_INVALID',
        message: 'Bad account payload',
        details: { field: 'email' },
        requestId: 'req-123',
      },
    });
  });

  it('preserves VALIDATION_ERROR details through validateRequest', async () => {
    const req = createMockRequest({
      body: {},
      method: 'POST',
      originalUrl: '/validation',
      url: '/validation',
    });
    const next = vi.fn();

    validateRequest({
      body: z.object({
        name: z.string().min(1),
      }),
    })(req, createMockResponse(), next);

    const err = next.mock.calls[0]?.[0];
    const res = createMockResponse();

    errorHandler(err, req, res, vi.fn() as NextFunction);

    expect(res.statusCode).toBe(400);
    expect((res.body as any).error.code).toBe('VALIDATION_ERROR');
    expect((res.body as any).error.message).toBe('Validation failed');
    expect((res.body as any).error.requestId).toBeNull();
    expect((res.body as any).error.details.fieldErrors.name).toBeTruthy();
  });
});
