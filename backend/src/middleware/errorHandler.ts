import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { captureException } from '../lib/observability';
import { logger } from '../lib/logger';

type KnownError = Error & {
  statusCode?: number;
  code?: string;
  details?: unknown;
};

function asKnownError(error: unknown): KnownError {
  if (error instanceof Error) {
    return error as KnownError;
  }

  return new Error('Internal Server Error');
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const knownError = asKnownError(err);

  let statusCode = knownError.statusCode || 500;
  let message = knownError.message || 'Internal Server Error';
  let code = knownError.code || 'INTERNAL_SERVER_ERROR';
  const requestId = req.requestId || req.headers['x-request-id'] || null;

  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    code = 'VALIDATION_ERROR';
  }

  if (knownError.name === 'MulterError') {
    statusCode = 400;
    message = knownError.message || 'Invalid upload request';
    code = knownError.code || 'UPLOAD_ERROR';
  }

  if (knownError.message === 'Unsupported file type') {
    statusCode = 400;
    message = knownError.message;
    code = 'UNSUPPORTED_FILE_TYPE';
  }

  if (knownError.message === 'Not allowed by CORS') {
    statusCode = 403;
    message = knownError.message;
    code = 'CORS_NOT_ALLOWED';
  }

  const context = {
    requestId,
    method: req.method,
    path: req.originalUrl || req.url,
    statusCode,
    userId: req.user?.id ?? null,
  };

  if (statusCode >= 500) {
    captureException(knownError, context);
  } else {
    logger.warn('http.request.failed', {
      ...context,
      code,
      error: knownError,
    });
  }

  res.status(statusCode).json({
    error: {
      code,
      message,
      details: err instanceof ZodError ? err.flatten() : knownError.details || null,
      requestId,
    },
  });
}
