import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  const requestId = (req as any).requestId || req.headers['x-request-id'] || null;

  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
  }

  if (err?.name === 'MulterError') {
    statusCode = 400;
    message = err.message || 'Invalid upload request';
  }

  if (err?.message === 'Unsupported file type') {
    statusCode = 400;
    message = err.message;
  }

  if (err?.message === 'Not allowed by CORS') {
    statusCode = 403;
    message = err.message;
  }

  res.status(statusCode).json({
    error: {
      message,
      details: err instanceof ZodError ? err.flatten() : err.details || null,
      requestId,
    },
  });
}
