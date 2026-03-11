'use client';

import { useSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

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

  const fetchAdmin = async <T = any>(path: string, options: RequestInit = {}): Promise<T> => {
    const resolvedToken = await resolveToken();

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resolvedToken}`,
        ...options.headers,
      },
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(extractErrorMessage(payload));
    }

    return payload as T;
  };

  return {
    fetchAdmin,
    hasToken: status !== 'loading',
  };
};
