import * as Sentry from '@sentry/node';

import { logger } from './logger';

let initialized = false;
let sentryEnabled = false;

function parseTracesSampleRate(value?: string) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
    return undefined;
  }

  return parsed;
}

function toError(error: unknown) {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === 'string') {
    return new Error(error);
  }

  return new Error('Unknown error');
}

export function initObservability() {
  if (initialized) {
    return;
  }

  initialized = true;

  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    logger.info('observability.disabled', { provider: 'sentry', reason: 'missing_dsn' });
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
    release: process.env.SENTRY_RELEASE || undefined,
    tracesSampleRate: parseTracesSampleRate(process.env.SENTRY_TRACES_SAMPLE_RATE),
    sendDefaultPii: false,
  });

  sentryEnabled = true;
  logger.info('observability.enabled', { provider: 'sentry' });
}

export function captureException(error: unknown, context: Record<string, unknown> = {}) {
  const resolvedError = toError(error);

  logger.error('exception.captured', {
    ...context,
    error: resolvedError,
  });

  if (!sentryEnabled) {
    return;
  }

  Sentry.withScope((scope) => {
    for (const [key, value] of Object.entries(context)) {
      if (value === undefined) {
        continue;
      }

      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        scope.setTag(key, String(value));
        continue;
      }

      scope.setExtra(key, value);
    }

    Sentry.captureException(resolvedError);
  });
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context: Record<string, unknown> = {}) {
  logger[level === 'warning' ? 'warn' : level]('message.captured', {
    message,
    ...context,
  });

  if (!sentryEnabled) {
    return;
  }

  Sentry.withScope((scope) => {
    for (const [key, value] of Object.entries(context)) {
      if (value !== undefined) {
        scope.setExtra(key, value);
      }
    }

    Sentry.captureMessage(message, level);
  });
}

export function flushObservability(timeoutMs = 2_000) {
  if (!sentryEnabled) {
    return Promise.resolve(true);
  }

  return Sentry.flush(timeoutMs);
}

