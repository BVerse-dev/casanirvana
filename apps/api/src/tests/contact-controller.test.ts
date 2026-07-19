import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';

import { createContactRequest } from '../controllers/contact';

const emailMocks = vi.hoisted(() => ({ sendAdminConfiguredEmail: vi.fn() }));

vi.mock('../services/adminSecureSettings', () => emailMocks);

function responseDouble() {
  const response = { statusCode: 200, body: null as unknown, status(code: number) { this.statusCode = code; return this; }, json(payload: unknown) { this.body = payload; return this; } };
  return response as unknown as Response & { statusCode: number; body: unknown };
}

describe('marketing contact controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.MARKETING_CONTACT_RECIPIENT_EMAIL = 'hello@casanirvana.com';
  });

  it('delivers validated enquiries through configured SMTP', async () => {
    emailMocks.sendAdminConfiguredEmail.mockResolvedValueOnce(undefined);
    const req = { body: { name: 'Ama Mensah', email: 'ama@example.com', phone: '+233200000000', reason: 'Book a demo', message: 'Please arrange a platform demonstration.', source: 'marketing_web' } } as Request;
    const res = responseDouble();
    const next = vi.fn() as NextFunction;

    await createContactRequest(req, res, next);

    expect(res.statusCode).toBe(202);
    expect(emailMocks.sendAdminConfiguredEmail).toHaveBeenCalledOnce();
    expect(next).not.toHaveBeenCalled();
  });

  it('fails closed when the recipient is missing', async () => {
    delete process.env.MARKETING_CONTACT_RECIPIENT_EMAIL;
    const req = { body: { name: 'Ama Mensah', email: 'ama@example.com', reason: 'Support', message: 'Please contact me about the platform.' } } as Request;
    const res = responseDouble();
    const next = vi.fn() as NextFunction;

    await createContactRequest(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(emailMocks.sendAdminConfiguredEmail).not.toHaveBeenCalled();
  });
});
