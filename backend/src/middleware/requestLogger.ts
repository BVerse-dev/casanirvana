import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime.bigint();
  const existingId = req.headers['x-request-id'];
  const requestId =
    (typeof existingId === 'string' && existingId) ||
    (Array.isArray(existingId) && existingId[0]) ||
    crypto.randomUUID();

  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    const log = {
      level: 'info',
      msg: 'request',
      requestId,
      method: req.method,
      path: req.originalUrl || req.url,
      status: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
      ip: req.ip,
      userId: req.user?.id ?? null,
    };
    console.log(JSON.stringify(log));
  });

  next();
}
