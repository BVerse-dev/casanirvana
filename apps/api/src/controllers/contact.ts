import type { NextFunction, Request, Response } from 'express';

import { createHttpError } from '../lib/httpError';
import { sendAdminConfiguredEmail } from '../services/adminSecureSettings';

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;',
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>'"]/g, (character) => HTML_ENTITIES[character] || character);

export async function createContactRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, phone, reason, message, source } = req.body as {
      name: string;
      email: string;
      phone?: string;
      reason: string;
      message: string;
      source?: string;
    };
    const recipient = process.env.MARKETING_CONTACT_RECIPIENT_EMAIL;
    if (!recipient) {
      return next(
        createHttpError(503, 'MARKETING_CONTACT_RECIPIENT_MISSING', 'Marketing contact recipient is not configured')
      );
    }

    const safe = {
      name: escapeHtml(name),
      email: escapeHtml(email),
      phone: escapeHtml(phone || 'Not provided'),
      reason: escapeHtml(reason),
      message: escapeHtml(message).replace(/\n/g, '<br />'),
      source: escapeHtml(source || 'marketing_web'),
    };

    await sendAdminConfiguredEmail({
      to: recipient,
      replyTo: email,
      subject: `Casa Nirvana enquiry: ${reason}`,
      text: [`Name: ${name}`, `Email: ${email}`, `Phone: ${phone || 'Not provided'}`, `Reason: ${reason}`, `Source: ${source || 'marketing_web'}`, '', message].join('\n'),
      html: `<h2>Casa Nirvana marketing enquiry</h2><p><strong>Name:</strong> ${safe.name}</p><p><strong>Email:</strong> ${safe.email}</p><p><strong>Phone:</strong> ${safe.phone}</p><p><strong>Reason:</strong> ${safe.reason}</p><p><strong>Source:</strong> ${safe.source}</p><hr /><p>${safe.message}</p>`,
    });

    return res.status(202).json({ message: 'Contact request accepted' });
  } catch (error) {
    return next(createHttpError(503, 'MARKETING_CONTACT_DELIVERY_FAILED', 'Contact service is temporarily unavailable', error));
  }
}
