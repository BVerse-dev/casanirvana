'use client';

import { usePersonalHubServiceMetrics } from './usePersonalHubServiceMetrics';

export const useMoneyTransferService = () => usePersonalHubServiceMetrics('money_transfer');
