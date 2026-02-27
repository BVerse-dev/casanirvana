import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { options } from '@/app/api/auth/[...nextauth]/options';

const getApiBaseUrl = () => {
  const baseUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error('Missing API base URL for admin proxy.');
  }

  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
};

const getAccessToken = async () => {
  const session = await getServerSession(options);
  const token = session?.accessToken;

  if (!token) {
    return null;
  }

  return token;
};

export const proxyAdminRequest = async (
  request: NextRequest,
  backendPath: string,
  method: 'GET' | 'PUT' | 'POST'
) => {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return NextResponse.json({ error: 'Missing admin session. Please sign in again.' }, { status: 401 });
    }

    const apiBaseUrl = getApiBaseUrl();
    const targetUrl = new URL(`${apiBaseUrl}${backendPath}`);
    targetUrl.search = request.nextUrl.search;

    const init: RequestInit = {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    };

    if (method !== 'GET') {
      init.body = await request.text();
    }

    const response = await fetch(targetUrl.toString(), init);
    const rawBody = await response.text();
    const contentType = response.headers.get('content-type') || 'application/json; charset=utf-8';

    return new NextResponse(rawBody, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Admin proxy request failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
};
