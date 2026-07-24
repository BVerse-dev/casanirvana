'use client';

import { getSession, signOut, useSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
let sessionRecoveryInFlight: Promise<string | null> | null = null;

const extractErrorMessage = (payload: any) => {
  if (typeof payload?.error === 'string' && payload.error.trim().length > 0) {
    return payload.error.trim();
  }

  if (typeof payload?.message === 'string' && payload.message.trim().length > 0) {
    return payload.message.trim();
  }

  if (typeof payload?.error?.message === 'string' && payload.error.message.trim().length > 0) {
    return payload.error.message.trim();
  }

  if (typeof payload?.error?.code === 'string' && payload.error.code.trim().length > 0) {
    return payload.error.code.trim();
  }

  return 'Request failed';
};

export const useAdminApi = () => {
  const { data: session, status } = useSession();
  const token = session?.accessToken as string | undefined;

  const resolveToken = async () => {
    if (token) return token;

    const sessionResponse = await fetch('/api/auth/session', {
      credentials: 'same-origin',
    });

    if (!sessionResponse.ok) {
      throw new Error('Missing admin session. Please sign in again.');
    }

    const sessionPayload = await sessionResponse.json().catch(() => ({}));
    const resolvedToken =
      typeof sessionPayload?.accessToken === 'string' && sessionPayload.accessToken.length > 0
        ? sessionPayload.accessToken
        : null;

    if (!resolvedToken) {
      throw new Error('Missing admin session. Please sign in again.');
    }

    return resolvedToken;
  };

  const recoverSessionToken = async (expiredToken: string) => {
    if (!sessionRecoveryInFlight) {
      sessionRecoveryInFlight = getSession()
        .then((refreshedSession) => {
          const refreshedToken =
            typeof refreshedSession?.accessToken === 'string'
              ? refreshedSession.accessToken
              : null;

          return refreshedToken && refreshedToken !== expiredToken
            ? refreshedToken
            : null;
        })
        .finally(() => {
          sessionRecoveryInFlight = null;
        });
    }

    return sessionRecoveryInFlight;
  };

  const requestWithToken = async (
    path: string,
    options: RequestInit,
    resolvedToken: string,
  ) => {
    const headers = new Headers(options.headers || {});
    const isFormDataBody = typeof FormData !== 'undefined' && options.body instanceof FormData;

    if (!isFormDataBody && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    headers.set('Authorization', `Bearer ${resolvedToken}`);

    return fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  };

  const fetchAdmin = async <T = any>(path: string, options: RequestInit = {}): Promise<T> => {
    const resolvedToken = await resolveToken();
    let response = await requestWithToken(path, options, resolvedToken);
    let payload = await response.json().catch(() => ({}));

    if (response.status === 401) {
      const recoveredToken = await recoverSessionToken(resolvedToken);

      if (recoveredToken) {
        response = await requestWithToken(path, options, recoveredToken);
        payload = await response.json().catch(() => ({}));
      }

      if (response.status === 401 || !recoveredToken) {
        await signOut({ callbackUrl: '/auth/sign-in', redirect: true });
        throw new Error('Your session has expired. Please sign in again.');
      }
    }

    if (!response.ok) {
      throw new Error(extractErrorMessage(payload));
    }

    return payload as T;
  };

  return {
    fetchAdmin,
    hasToken: status === 'authenticated',
  };
};
