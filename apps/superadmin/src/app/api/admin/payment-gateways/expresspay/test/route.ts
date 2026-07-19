import { NextRequest } from 'next/server';

import { proxyAdminRequest } from '../_shared';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  return proxyAdminRequest(request, '/admin/payment-gateways/expresspay/test', 'POST');
}
