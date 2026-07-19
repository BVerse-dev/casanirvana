'use client';

import { usePersonalHubServiceMetrics } from './usePersonalHubServiceMetrics';

export const useBillPaymentService = () => usePersonalHubServiceMetrics('bill_payment');
