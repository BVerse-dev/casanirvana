import { NextRequest } from 'next/server';

import { proxyAdminRequest } from '../_shared';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return proxyAdminRequest(request, '/admin/payment-gateways/expresspay/config', 'GET');
}

export async function PUT(request: NextRequest) {
  return proxyAdminRequest(request, '/admin/payment-gateways/expresspay/config', 'PUT');
}
