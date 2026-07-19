import type { Request, Response } from 'express';

import { supabase } from '../lib/supabase';
import { captureException, captureMessage } from '../lib/observability';
import { logger } from '../lib/logger';

const toBearerToken = (authorizationHeader?: string | string[]) => {
  const value = Array.isArray(authorizationHeader) ? authorizationHeader[0] : authorizationHeader;
  if (!value) {
    return null;
  }

  const [scheme, token] = value.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token;
};

async function resolveAuthenticatedUserId(req: Request) {
  const token = toBearerToken(req.headers.authorization);
  if (!token) {
    return null;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  return user.id;
}

export async function ingestClientEvent(req: Request, res: Response) {
  const authUserId = await resolveAuthenticatedUserId(req);
  const {
    app,
    source,
    level,
    message,
    errorName,
    stack,
    route,
    release,
    environment,
    metadata,
  } = req.body;

  const context = {
    app,
    source,
    route: route || null,
    release: release || null,
    environment: environment || null,
    requestId: req.requestId || null,
    authUserId,
    metadata: metadata || null,
  };

  if (level === 'error') {
    const error = new Error(message);
    if (errorName) {
      error.name = errorName;
    }
    if (stack) {
      error.stack = stack;
    }

    captureException(error, context);
  } else {
    captureMessage(message, level === 'warn' ? 'warning' : 'info', context);
  }

  logger.info('client.observability.ingested', {
    ...context,
    level,
  });

  res.status(202).json({
    success: true,
    requestId: req.requestId || null,
  });
}

