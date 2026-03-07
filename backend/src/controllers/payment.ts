import { Request, Response } from 'express';
import * as PaymentService from '../services/payment';
import { getClientPaymentMethodPolicy } from '../services/paymentMethodPolicy';
import {
  DEFAULT_PAYMENT_DISPLAY,
  generatePaymentStatementForUnit,
  getAdminPaymentTransaction,
  listAdminPaymentObligations,
  listAdminPaymentStatements,
  listAdminPaymentTransactions,
  listPaymentHistoryForUnit,
  listPaymentObligationsForUnit,
  listPaymentStatementsForUnit,
} from '../services/paymentLedger';
import { adminSupabase } from '../lib/supabase';
import { resolveAdminScope } from '../services/adminScope';
import {
  createPaymentChargeTemplate,
  getPaymentChargeCatalog,
  getPaymentChargeRun,
  issuePaymentChargeTemplate,
  listPaymentChargeRuns,
  listPaymentChargeTemplates,
  previewPaymentChargeTemplate,
  runDuePaymentCharges,
  updatePaymentChargeTemplate,
} from '../services/paymentCharges';
import {
  createAdminPayoutDestination,
  createAdminPayoutRequest,
  getAdminPayoutSummary,
  listAdminPayoutDestinations,
  listAdminPayoutRequests,
  listAdminPayoutRules,
  listAdminPayoutTransactions,
  recomputePayoutBalances,
  releaseStalePayoutReservations,
  updateAdminPayoutDestination,
  updateAdminPayoutRequestStatus,
  upsertAdminPayoutRule,
} from '../services/payouts';

/**
 * Get payments by unit ID with filtering and pagination
 */
export async function getPaymentsByUnit(req: Request, res: Response) {
  try {
    const unitId = req.params.unitId || req.query.unitId as string;

    if (!unitId) {
      return res.status(400).json({ error: 'Unit ID is required' });
    }

    const options = {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      sortBy: req.query.sortBy as string || 'payment_date',
      sortOrder: req.query.sortOrder as 'asc' | 'desc' || 'desc',
      status: req.query.status as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string
    };

    const result = await PaymentService.getPaymentsByUnit(unitId, options);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get payments by society ID with filtering and pagination
 */
export async function getPaymentsBySociety(req: Request, res: Response) {
  try {
    const societyId = req.params.societyId || req.query.societyId as string;

    if (!societyId) {
      return res.status(400).json({ error: 'Society ID is required' });
    }

    const options = {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      sortBy: req.query.sortBy as string || 'payment_date',
      sortOrder: req.query.sortOrder as 'asc' | 'desc' || 'desc',
      status: req.query.status as string,
      paymentType: req.query.paymentType as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      unitId: req.query.unitId as string
    };

    const result = await PaymentService.getPaymentsBySociety(societyId, options);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get payment by ID
 */
export async function getPaymentById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Payment ID is required' });
    }

    const payment = await PaymentService.getPaymentById(id);

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(payment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Create a new payment
 */
export async function createPayment(req: Request, res: Response) {
  try {
    const payment = await PaymentService.createPayment(req.body);
    res.status(201).json(payment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Update a payment
 */
export async function updatePayment(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const payment = await PaymentService.updatePayment(id, req.body);
    res.json(payment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = req.user?.id; // Assuming you have user info in the request

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const payment = await PaymentService.updatePaymentStatus(id, status, userId, notes);
    res.json(payment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Delete a payment
 */
export async function deletePayment(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await PaymentService.deletePayment(id);
    res.json({ id, success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get payment statistics
 */
export async function getPaymentStats(req: Request, res: Response) {
  try {
    const societyId = req.params.societyId || req.query.societyId as string;
    const timeFrame = (req.query.timeFrame as 'week' | 'month' | 'year') || 'month';

    const stats = await PaymentService.getPaymentStats(societyId, timeFrame);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get sanitized payment method policy for authenticated clients.
 */
export async function getPaymentMethodPolicy(req: Request, res: Response) {
  try {
    const policy = await getClientPaymentMethodPolicy();
    res.json({
      success: true,
      data: policy,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to load payment policy',
    });
  }
}

const getProfileUnitId = (req: Request) => {
  const profile = (req.userProfile || {}) as Record<string, unknown>;
  return typeof profile.unit_id === 'string' ? profile.unit_id : null;
};

const getActorUserId = (req: Request) => {
  if (typeof req.user?.id === 'string' && req.user.id) {
    return req.user.id;
  }

  if (typeof req.userProfile?.user_id === 'string' && req.userProfile.user_id) {
    return req.userProfile.user_id;
  }

  if (typeof req.userProfile?.id === 'string' && req.userProfile.id) {
    return req.userProfile.id;
  }

  return null;
};

const PERSONAL_HUB_SERVICE_LABELS: Record<string, string> = {
  airtime: 'Airtime',
  data: 'Data',
  money_transfer: 'Money Transfer',
  bill_payment: 'Bill Payment',
  insurance: 'Insurance',
  marketplace: 'Marketplace',
};

const PERSONAL_HUB_PERIOD_LABELS: Record<number, string> = {
  7: '7 days',
  30: '30 days',
  90: '90 days',
  365: '12 months',
};

const asNumber = (value: unknown) => {
  const parsed = typeof value === 'number' ? value : Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatDashboardMoney = (value: number) =>
  `${DEFAULT_PAYMENT_DISPLAY.currencySymbol}${value.toLocaleString('en-GH', {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;

const normalizePersonalHubStatus = (status?: string | null) => {
  const normalized = typeof status === 'string' ? status.trim().toLowerCase() : '';

  if (['completed', 'paid', 'success', 'successful', 'delivered'].includes(normalized)) {
    return 'completed' as const;
  }

  if (['failed', 'cancelled', 'canceled', 'expired', 'rejected'].includes(normalized)) {
    return 'failed' as const;
  }

  return 'pending' as const;
};

const getGrowthRate = (currentValue: number, previousValue: number) => {
  if (previousValue <= 0) {
    return null;
  }

  return ((currentValue - previousValue) / previousValue) * 100;
};

const getWindowRange = (periodDays: number) => {
  const now = new Date();
  const currentStart = new Date(now);
  currentStart.setUTCDate(currentStart.getUTCDate() - periodDays + 1);
  currentStart.setUTCHours(0, 0, 0, 0);

  const previousEnd = new Date(currentStart);
  previousEnd.setUTCDate(previousEnd.getUTCDate() - 1);
  previousEnd.setUTCHours(23, 59, 59, 999);

  const previousStart = new Date(previousEnd);
  previousStart.setUTCDate(previousStart.getUTCDate() - periodDays + 1);
  previousStart.setUTCHours(0, 0, 0, 0);

  return {
    now,
    currentStart,
    previousStart,
    previousEnd,
  };
};

const getBucketDate = (value: string | null | undefined, periodDays: number) => {
  if (!value) return null;

  const source = new Date(value);
  if (Number.isNaN(source.getTime())) return null;

  const bucket = new Date(Date.UTC(source.getUTCFullYear(), source.getUTCMonth(), source.getUTCDate()));

  if (periodDays > 90) {
    bucket.setUTCDate(1);
    return bucket;
  }

  if (periodDays > 31) {
    const day = bucket.getUTCDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    bucket.setUTCDate(bucket.getUTCDate() + mondayOffset);
  }

  return bucket;
};

const buildTrendBuckets = (transactions: Array<Record<string, any>>, periodDays: number) => {
  const buckets = new Map<string, { date: string; transactions: number; successful: number; volume: number }>();

  for (const transaction of transactions) {
    const bucketDate = getBucketDate(transaction.created_at, periodDays);
    if (!bucketDate) continue;

    const key = bucketDate.toISOString().slice(0, 10);
    const current = buckets.get(key) || {
      date: key,
      transactions: 0,
      successful: 0,
      volume: 0,
    };

    current.transactions += 1;
    current.volume += asNumber(transaction.total_amount ?? transaction.amount);
    if (normalizePersonalHubStatus(transaction.status) === 'completed') {
      current.successful += 1;
    }

    buckets.set(key, current);
  }

  return Array.from(buckets.values()).sort((left, right) => left.date.localeCompare(right.date));
};

const buildPersonalHubAlerts = ({
  transactions,
  periodDays,
}: {
  transactions: Array<Record<string, any>>;
  periodDays: number;
}) => {
  const failedTransactions = transactions.filter(
    (transaction) => normalizePersonalHubStatus(transaction.status) === 'failed'
  );
  const pendingTransactions = transactions.filter(
    (transaction) => normalizePersonalHubStatus(transaction.status) === 'pending'
  );
  const staleCutoff = Date.now() - 6 * 60 * 60 * 1000;
  const stalePendingTransactions = pendingTransactions.filter((transaction) => {
    const createdAt = transaction.created_at ? new Date(transaction.created_at).getTime() : NaN;
    return Number.isFinite(createdAt) && createdAt < staleCutoff;
  });

  const alerts: Array<Record<string, any>> = [];
  const failureRate = transactions.length > 0 ? (failedTransactions.length / transactions.length) * 100 : 0;

  if (failedTransactions.length > 0) {
    alerts.push({
      id: 'personal-hub-failed-transactions',
      title: 'Failed Personal Hub transactions detected',
      message: `${failedTransactions.length} transaction${failedTransactions.length === 1 ? '' : 's'} failed during the selected period.`,
      type: failureRate >= 10 ? 'danger' : 'warning',
      severity: failureRate >= 10 ? 'critical' : 'high',
      category: 'financial',
      timestamp: failedTransactions[0]?.created_at || new Date().toISOString(),
      affected_services: Array.from(
        new Set(
          failedTransactions
            .map((transaction) => PERSONAL_HUB_SERVICE_LABELS[transaction.transaction_type] || 'Unknown')
            .filter(Boolean)
        )
      ),
      recommended_actions: [
        'Review the failed transactions in the Personal Hub reports workspace.',
        'Confirm the provider and payment gateway status for the affected services.',
      ],
      technical_details: `Failure rate is ${failureRate.toFixed(1)}% for the selected ${PERSONAL_HUB_PERIOD_LABELS[periodDays] || `${periodDays} day`} window.`,
      status: 'active',
    });
  }

  if (stalePendingTransactions.length > 0) {
    alerts.push({
      id: 'personal-hub-stale-pending',
      title: 'Pending Personal Hub transactions need review',
      message: `${stalePendingTransactions.length} pending transaction${stalePendingTransactions.length === 1 ? '' : 's'} have been waiting longer than 6 hours.`,
      type: 'warning',
      severity: 'high',
      category: 'processing',
      timestamp: stalePendingTransactions[0]?.created_at || new Date().toISOString(),
      affected_services: Array.from(
        new Set(
          stalePendingTransactions
            .map((transaction) => PERSONAL_HUB_SERVICE_LABELS[transaction.transaction_type] || 'Unknown')
            .filter(Boolean)
        )
      ),
      recommended_actions: [
        'Verify provider callbacks and settlement status for the pending transactions.',
        'Escalate any stale provider responses before they become resident support tickets.',
      ],
      technical_details: 'This alert is generated from live transaction timestamps and current non-terminal statuses.',
      status: 'active',
    });
  }

  if (transactions.length === 0) {
    alerts.push({
      id: 'personal-hub-no-activity',
      title: 'No Personal Hub activity in the selected period',
      message: `No Personal Hub transactions were recorded in the last ${PERSONAL_HUB_PERIOD_LABELS[periodDays] || `${periodDays} day`}.`,
      type: 'info',
      severity: 'low',
      category: 'activity',
      timestamp: new Date().toISOString(),
      affected_services: [],
      recommended_actions: [
        'Confirm whether this is expected for the selected reporting window.',
      ],
      technical_details: 'This is an informational alert derived from the absence of transaction rows in the current window.',
      status: 'observed',
    });
  }

  return alerts.slice(0, 4);
};

const getAdminPayoutScope = (req: Request) => ({
  userProfile: req.userProfile,
  actorUserId: getActorUserId(req),
  agencyId:
    typeof req.query.agency_id === 'string'
      ? req.query.agency_id
      : typeof req.body?.agency_id === 'string'
        ? req.body.agency_id
        : null,
  communityId:
    typeof req.query.community_id === 'string'
      ? req.query.community_id
      : typeof req.body?.community_id === 'string'
        ? req.body.community_id
        : null,
});

export async function getPaymentObligations(req: Request, res: Response) {
  try {
    const unitId = getProfileUnitId(req);

    if (!unitId) {
      return res.status(400).json({
        success: false,
        error: 'Your profile is missing a unit assignment.',
      });
    }

    const obligations = await listPaymentObligationsForUnit(unitId);
    res.json({
      success: true,
      data: {
        unit_id: unitId,
        currency_code: DEFAULT_PAYMENT_DISPLAY.currencyCode,
        currency_symbol: DEFAULT_PAYMENT_DISPLAY.currencySymbol,
        items: obligations,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to load payment obligations',
    });
  }
}

export async function getPaymentHistoryFeed(req: Request, res: Response) {
  try {
    const unitId = getProfileUnitId(req);

    if (!unitId) {
      return res.status(400).json({
        success: false,
        error: 'Your profile is missing a unit assignment.',
      });
    }

    const history = await listPaymentHistoryForUnit(unitId);
    res.json({
      success: true,
      data: {
        unit_id: unitId,
        currency_code: DEFAULT_PAYMENT_DISPLAY.currencyCode,
        currency_symbol: DEFAULT_PAYMENT_DISPLAY.currencySymbol,
        items: history,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to load payment history',
    });
  }
}

export async function getPaymentStatementsFeed(req: Request, res: Response) {
  try {
    const unitId = getProfileUnitId(req);

    if (!unitId) {
      return res.status(400).json({
        success: false,
        error: 'Your profile is missing a unit assignment.',
      });
    }

    const statements = await listPaymentStatementsForUnit(unitId);
    res.json({
      success: true,
      data: {
        unit_id: unitId,
        currency_code: DEFAULT_PAYMENT_DISPLAY.currencyCode,
        currency_symbol: DEFAULT_PAYMENT_DISPLAY.currencySymbol,
        items: statements,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to load payment statements',
    });
  }
}

export async function generatePaymentStatement(req: Request, res: Response) {
  try {
    const profile = (req.userProfile || {}) as Record<string, unknown>;
    const unitId = getProfileUnitId(req);
    const requestedUnitId = typeof req.body?.unit_id === 'string' ? req.body.unit_id : null;
    const targetUnitId =
      typeof profile.role === 'string' && ['admin', 'superadmin', 'agency_manager', 'facility_manager'].includes(profile.role)
        ? requestedUnitId || unitId
        : unitId;

    if (!targetUnitId) {
      return res.status(400).json({
        success: false,
        error: 'A target unit is required to generate a statement.',
      });
    }

    const result = await generatePaymentStatementForUnit({
      unitId: targetUnitId,
      monthYear: typeof req.body?.month_year === 'string' ? req.body.month_year : null,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate payment statement',
    });
  }
}

export async function getAdminPersonalHubDashboard(req: Request, res: Response) {
  try {
    const scope = await resolveAdminScope(req);

    if (!scope.isGlobal) {
      return res.status(403).json({
        success: false,
        error: 'Personal Hub admin reporting is available to platform admins only.',
      });
    }

    const periodDays = Number(req.query.period || 30);
    const recentLimit = Math.min(Math.max(Number(req.query.recent_limit || 10), 1), 25);
    const { now, currentStart, previousStart, previousEnd } = getWindowRange(periodDays);

    const transactionFields = [
      'transaction_id',
      'payment_id',
      'profile_id',
      'user_id',
      'transaction_type',
      'provider',
      'recipient_name',
      'recipient_identifier',
      'amount',
      'total_amount',
      'status',
      'created_at',
      'updated_at',
    ].join(', ');
    const analyticsFields = [
      'date',
      'service_type',
      'total_transactions',
      'successful_transactions',
      'failed_transactions',
      'total_volume',
      'total_commission',
      'average_response_time',
    ].join(', ');

    const [
      currentTransactionsResponse,
      previousTransactionsResponse,
      currentAnalyticsResponse,
      previousAnalyticsResponse,
    ] = await Promise.all([
      adminSupabase
        .from('personal_hub_transactions')
        .select(transactionFields)
        .gte('created_at', currentStart.toISOString())
        .lte('created_at', now.toISOString())
        .order('created_at', { ascending: false }),
      adminSupabase
        .from('personal_hub_transactions')
        .select(transactionFields)
        .gte('created_at', previousStart.toISOString())
        .lte('created_at', previousEnd.toISOString()),
      adminSupabase
        .from('personal_hub_analytics')
        .select(analyticsFields)
        .gte('date', currentStart.toISOString().slice(0, 10))
        .lte('date', now.toISOString().slice(0, 10)),
      adminSupabase
        .from('personal_hub_analytics')
        .select(analyticsFields)
        .gte('date', previousStart.toISOString().slice(0, 10))
        .lte('date', previousEnd.toISOString().slice(0, 10)),
    ]);

    if (currentTransactionsResponse.error) {
      throw new Error(`Failed to load Personal Hub transactions: ${currentTransactionsResponse.error.message}`);
    }

    if (previousTransactionsResponse.error) {
      throw new Error(`Failed to load previous Personal Hub transactions: ${previousTransactionsResponse.error.message}`);
    }

    if (currentAnalyticsResponse.error) {
      throw new Error(`Failed to load Personal Hub analytics: ${currentAnalyticsResponse.error.message}`);
    }

    if (previousAnalyticsResponse.error) {
      throw new Error(`Failed to load previous Personal Hub analytics: ${previousAnalyticsResponse.error.message}`);
    }

    const currentTransactions = (currentTransactionsResponse.data || []) as Array<Record<string, any>>;
    const previousTransactions = (previousTransactionsResponse.data || []) as Array<Record<string, any>>;
    const currentAnalytics = (currentAnalyticsResponse.data || []) as Array<Record<string, any>>;
    const previousAnalytics = (previousAnalyticsResponse.data || []) as Array<Record<string, any>>;

    const profileIds = Array.from(
      new Set(currentTransactions.map((transaction) => transaction.profile_id).filter(Boolean) as string[])
    );
    const userIds = Array.from(
      new Set(currentTransactions.map((transaction) => transaction.user_id).filter(Boolean) as string[])
    );

    const profileMapById = new Map<string, Record<string, any>>();
    const profileMapByUserId = new Map<string, Record<string, any>>();

    const profileSelect =
      'id, user_id, first_name, last_name, full_name, email, phone, community_id, unit_id, avatar_url';

    if (profileIds.length > 0) {
      const { data, error } = await adminSupabase
        .from('profiles')
        .select(profileSelect)
        .in('id', profileIds);

      if (error) {
        throw new Error(`Failed to load Personal Hub profile context: ${error.message}`);
      }

      for (const row of data || []) {
        if (row.id) profileMapById.set(row.id, row as Record<string, any>);
        if (row.user_id) profileMapByUserId.set(row.user_id, row as Record<string, any>);
      }
    }

    const unresolvedUserIds = userIds.filter((userId) => !profileMapByUserId.has(userId));
    if (unresolvedUserIds.length > 0) {
      const { data, error } = await adminSupabase
        .from('profiles')
        .select(profileSelect)
        .in('user_id', unresolvedUserIds);

      if (error) {
        throw new Error(`Failed to load Personal Hub user context: ${error.message}`);
      }

      for (const row of data || []) {
        if (row.id) profileMapById.set(row.id, row as Record<string, any>);
        if (row.user_id) profileMapByUserId.set(row.user_id, row as Record<string, any>);
      }
    }

    const communityIds = Array.from(
      new Set(
        Array.from(profileMapById.values())
          .map((profile) => profile.community_id)
          .filter(Boolean) as string[]
      )
    );
    const unitIds = Array.from(
      new Set(
        Array.from(profileMapById.values())
          .map((profile) => profile.unit_id)
          .filter(Boolean) as string[]
      )
    );

    const [communityResponse, unitResponse] = await Promise.all([
      communityIds.length > 0
        ? adminSupabase.from('communities').select('id, name').in('id', communityIds)
        : Promise.resolve({ data: [], error: null } as any),
      unitIds.length > 0
        ? adminSupabase.from('units').select('id, number, unit_number, block').in('id', unitIds)
        : Promise.resolve({ data: [], error: null } as any),
    ]);

    if (communityResponse.error) {
      throw new Error(`Failed to load Personal Hub community context: ${communityResponse.error.message}`);
    }

    if (unitResponse.error) {
      throw new Error(`Failed to load Personal Hub unit context: ${unitResponse.error.message}`);
    }

    const communityMap = new Map<string, Record<string, any>>(
      ((communityResponse.data || []) as Array<Record<string, any>>).map((row) => [row.id, row])
    );
    const unitMap = new Map<string, Record<string, any>>(
      ((unitResponse.data || []) as Array<Record<string, any>>).map((row) => [row.id, row])
    );

    const totalTransactions = currentTransactions.length;
    const previousTotalTransactions = previousTransactions.length;
    const totalVolume = currentTransactions.reduce(
      (sum, transaction) => sum + asNumber(transaction.total_amount ?? transaction.amount),
      0
    );
    const previousTotalVolume = previousTransactions.reduce(
      (sum, transaction) => sum + asNumber(transaction.total_amount ?? transaction.amount),
      0
    );

    const currentCompletedCount = currentTransactions.filter(
      (transaction) => normalizePersonalHubStatus(transaction.status) === 'completed'
    ).length;
    const previousCompletedCount = previousTransactions.filter(
      (transaction) => normalizePersonalHubStatus(transaction.status) === 'completed'
    ).length;
    const averageSuccessRate = totalTransactions > 0 ? (currentCompletedCount / totalTransactions) * 100 : 0;
    const previousAverageSuccessRate =
      previousTotalTransactions > 0 ? (previousCompletedCount / previousTotalTransactions) * 100 : 0;
    const totalCommission = currentAnalytics.reduce(
      (sum, item) => sum + asNumber(item.total_commission),
      0
    );
    const previousTotalCommission = previousAnalytics.reduce(
      (sum, item) => sum + asNumber(item.total_commission),
      0
    );

    const previousAnalyticsByService = new Map<string, Record<string, any>>();
    for (const item of previousAnalytics) {
      const key = typeof item.service_type === 'string' ? item.service_type : 'unknown';
      const current =
        previousAnalyticsByService.get(key) || {
          total_transactions: 0,
        };
      current.total_transactions += asNumber(item.total_transactions);
      previousAnalyticsByService.set(key, current);
    }

    const serviceMetricsMap = new Map<string, Record<string, any>>();
    for (const item of currentAnalytics) {
      const key = typeof item.service_type === 'string' ? item.service_type : 'unknown';
      const current =
        serviceMetricsMap.get(key) || {
          service: key,
          totalTransactions: 0,
          successfulTransactions: 0,
          failedTransactions: 0,
          totalVolume: 0,
          totalCommission: 0,
          averageResponseTimeTotal: 0,
          averageResponseTimeCount: 0,
        };
      current.totalTransactions += asNumber(item.total_transactions);
      current.successfulTransactions += asNumber(item.successful_transactions);
      current.failedTransactions += asNumber(item.failed_transactions);
      current.totalVolume += asNumber(item.total_volume);
      current.totalCommission += asNumber(item.total_commission);
      if (item.average_response_time !== null && item.average_response_time !== undefined) {
        current.averageResponseTimeTotal += asNumber(item.average_response_time);
        current.averageResponseTimeCount += 1;
      }
      serviceMetricsMap.set(key, current);
    }

    const serviceMetrics = Array.from(serviceMetricsMap.values())
      .map((service) => {
        const previousService = previousAnalyticsByService.get(service.service);
        const previousTransactionsForService = asNumber(previousService?.total_transactions);
        const growthRate =
          previousTransactionsForService > 0
            ? ((service.totalTransactions - previousTransactionsForService) / previousTransactionsForService) * 100
            : null;

        return {
          service: service.service,
          label: PERSONAL_HUB_SERVICE_LABELS[service.service] || service.service,
          totalTransactions: service.totalTransactions,
          successfulTransactions: service.successfulTransactions,
          failedTransactions: service.failedTransactions,
          totalVolume: service.totalVolume,
          totalVolumeFormatted: formatDashboardMoney(service.totalVolume),
          totalCommission: service.totalCommission,
          totalCommissionFormatted: formatDashboardMoney(service.totalCommission),
          averageResponseTime:
            service.averageResponseTimeCount > 0
              ? service.averageResponseTimeTotal / service.averageResponseTimeCount
              : 0,
          successRate:
            service.totalTransactions > 0
              ? (service.successfulTransactions / service.totalTransactions) * 100
              : 0,
          growthRate,
        };
      })
      .sort((left, right) => right.totalTransactions - left.totalTransactions);

    const recentTransactions = currentTransactions
      .slice()
      .sort((left, right) => {
        const leftTime = left.created_at ? new Date(left.created_at).getTime() : 0;
        const rightTime = right.created_at ? new Date(right.created_at).getTime() : 0;
        return rightTime - leftTime;
      })
      .slice(0, recentLimit)
      .map((transaction) => {
        const profile =
          (transaction.profile_id && profileMapById.get(transaction.profile_id)) ||
          (transaction.user_id && profileMapByUserId.get(transaction.user_id)) ||
          null;
        const community = profile?.community_id ? communityMap.get(profile.community_id) || null : null;
        const unit = profile?.unit_id ? unitMap.get(profile.unit_id) || null : null;
        const fullName =
          profile?.full_name ||
          [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') ||
          profile?.email ||
          'Unknown user';

        return {
          id: transaction.transaction_id || transaction.payment_id || `${transaction.transaction_type}-${transaction.created_at}`,
          transaction_id: transaction.transaction_id || null,
          payment_id: transaction.payment_id || null,
          transaction_type: transaction.transaction_type || null,
          service: PERSONAL_HUB_SERVICE_LABELS[transaction.transaction_type] || 'Unknown',
          provider: transaction.provider || null,
          recipient_name: transaction.recipient_name || null,
          recipient_identifier: transaction.recipient_identifier || null,
          amount: asNumber(transaction.total_amount ?? transaction.amount),
          amount_formatted: formatDashboardMoney(asNumber(transaction.total_amount ?? transaction.amount)),
          status: normalizePersonalHubStatus(transaction.status),
          raw_status: transaction.status || null,
          created_at: transaction.created_at || null,
          updated_at: transaction.updated_at || null,
          user: {
            id: profile?.id || null,
            name: fullName,
            email: profile?.email || null,
            phone: profile?.phone || null,
            avatar_url: profile?.avatar_url || null,
          },
          community: community
            ? {
                id: community.id,
                name: community.name || null,
              }
            : null,
          unit: unit
            ? {
                id: unit.id,
                number: unit.number || unit.unit_number || null,
                block: unit.block || null,
              }
            : null,
        };
      });

    res.json({
      success: true,
      data: {
        period: String(periodDays),
        currency_code: DEFAULT_PAYMENT_DISPLAY.currencyCode,
        currency_symbol: DEFAULT_PAYMENT_DISPLAY.currencySymbol,
        metrics: {
          totalTransactions,
          totalTransactionsFormatted: totalTransactions.toLocaleString('en-GH'),
          totalVolume,
          totalVolumeFormatted: formatDashboardMoney(totalVolume),
          totalCommission,
          totalCommissionFormatted: formatDashboardMoney(totalCommission),
          averageSuccessRate,
          averageSuccessRateFormatted: `${averageSuccessRate.toFixed(1)}%`,
          growth: {
            totalTransactions: getGrowthRate(totalTransactions, previousTotalTransactions),
            totalVolume: getGrowthRate(totalVolume, previousTotalVolume),
            totalCommission: getGrowthRate(totalCommission, previousTotalCommission),
            averageSuccessRate: getGrowthRate(averageSuccessRate, previousAverageSuccessRate),
          },
          recentTransactions,
          dailyTrends: buildTrendBuckets(currentTransactions, periodDays),
          alerts: buildPersonalHubAlerts({
            transactions: currentTransactions,
            periodDays,
          }),
        },
        service_metrics: serviceMetrics,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to load Personal Hub dashboard',
    });
  }
}

export async function listAdminTransactions(req: Request, res: Response) {
  try {
    const items = await listAdminPaymentTransactions({
      status: typeof req.query.status === 'string' ? req.query.status : undefined,
      sourceType: typeof req.query.source_type === 'string' ? req.query.source_type : undefined,
      unitId: typeof req.query.unit_id === 'string' ? req.query.unit_id : undefined,
    });

    res.json({
      success: true,
      data: {
        currency_code: DEFAULT_PAYMENT_DISPLAY.currencyCode,
        currency_symbol: DEFAULT_PAYMENT_DISPLAY.currencySymbol,
        items,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to load payment transactions',
    });
  }
}

export async function getAdminTransaction(req: Request, res: Response) {
  try {
    const transaction = await getAdminPaymentTransaction(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Payment transaction not found.',
      });
    }

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to load payment transaction',
    });
  }
}

export async function listAdminObligations(req: Request, res: Response) {
  try {
    const items = await listAdminPaymentObligations({
      status: typeof req.query.status === 'string' ? req.query.status : undefined,
      unitId: typeof req.query.unit_id === 'string' ? req.query.unit_id : undefined,
    });

    res.json({
      success: true,
      data: {
        currency_code: DEFAULT_PAYMENT_DISPLAY.currencyCode,
        currency_symbol: DEFAULT_PAYMENT_DISPLAY.currencySymbol,
        items,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to load payment obligations',
    });
  }
}

export async function listAdminStatements(req: Request, res: Response) {
  try {
    const items = await listAdminPaymentStatements({
      unitId: typeof req.query.unit_id === 'string' ? req.query.unit_id : undefined,
    });

    res.json({
      success: true,
      data: {
        currency_code: DEFAULT_PAYMENT_DISPLAY.currencyCode,
        currency_symbol: DEFAULT_PAYMENT_DISPLAY.currencySymbol,
        items,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to load payment statements',
    });
  }
}

export async function listAdminPaymentChargeCatalog(req: Request, res: Response) {
  try {
    const items = await getPaymentChargeCatalog();
    res.json({
      success: true,
      data: {
        items,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to load payment charge catalog',
    });
  }
}

export async function listAdminPaymentChargeTemplates(req: Request, res: Response) {
  try {
    const items = await listPaymentChargeTemplates({
      scope_level: typeof req.query.scope_level === 'string' ? req.query.scope_level as 'agency' | 'community' : undefined,
      agency_id: typeof req.query.agency_id === 'string' ? req.query.agency_id : undefined,
      community_id: typeof req.query.community_id === 'string' ? req.query.community_id : undefined,
      include_inactive:
        req.query.include_inactive === true ||
        req.query.include_inactive === 'true',
    });

    res.json({
      success: true,
      data: {
        items,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to load payment charge templates',
    });
  }
}

export async function createAdminPaymentChargeTemplate(req: Request, res: Response) {
  try {
    const item = await createPaymentChargeTemplate(req.body, getActorUserId(req));
    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create payment charge template',
    });
  }
}

export async function updateAdminPaymentChargeTemplate(req: Request, res: Response) {
  try {
    const item = await updatePaymentChargeTemplate(req.params.id, req.body, getActorUserId(req));
    res.json({
      success: true,
      data: item,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update payment charge template',
    });
  }
}

export async function previewAdminPaymentChargeTemplate(req: Request, res: Response) {
  try {
    const preview = await previewPaymentChargeTemplate(req.params.id, req.body || {});
    res.json({
      success: true,
      data: preview,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to preview payment charge template',
    });
  }
}

export async function issueAdminPaymentChargeTemplate(req: Request, res: Response) {
  try {
    const issued = await issuePaymentChargeTemplate(req.params.id, req.body || {}, getActorUserId(req));
    res.json({
      success: true,
      data: issued,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to issue payment charges',
    });
  }
}

export async function listAdminPaymentChargeRuns(req: Request, res: Response) {
  try {
    const items = await listPaymentChargeRuns({
      community_id: typeof req.query.community_id === 'string' ? req.query.community_id : undefined,
      template_id: typeof req.query.template_id === 'string' ? req.query.template_id : undefined,
      status: typeof req.query.status === 'string' ? req.query.status as 'draft' | 'previewed' | 'issued' | 'cancelled' : undefined,
    });

    res.json({
      success: true,
      data: {
        items,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to load payment charge runs',
    });
  }
}

export async function getAdminPaymentChargeRunDetails(req: Request, res: Response) {
  try {
    const run = await getPaymentChargeRun(req.params.id);

    if (!run) {
      return res.status(404).json({
        success: false,
        error: 'Payment charge run not found.',
      });
    }

    res.json({
      success: true,
      data: run,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to load payment charge run',
    });
  }
}

export async function runDueAdminPaymentCharges(req: Request, res: Response) {
  try {
    const result = await runDuePaymentCharges({
      communityId: typeof req.body?.community_id === 'string' ? req.body.community_id : undefined,
      agencyId: typeof req.body?.agency_id === 'string' ? req.body.agency_id : undefined,
      actorUserId: getActorUserId(req),
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to run due payment charges',
    });
  }
}

export async function getAdminPayoutSummaryHandler(req: Request, res: Response) {
  try {
    const data = await getAdminPayoutSummary(getAdminPayoutScope(req));
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to load payout summary',
    });
  }
}

export async function listAdminPayoutTransactionsHandler(req: Request, res: Response) {
  try {
    const items = await listAdminPayoutTransactions(getAdminPayoutScope(req));
    res.json({
      success: true,
      data: {
        items,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to load payout transactions',
    });
  }
}

export async function listAdminPayoutDestinationsHandler(req: Request, res: Response) {
  try {
    const items = await listAdminPayoutDestinations(getAdminPayoutScope(req));
    res.json({
      success: true,
      data: {
        items,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to load payout destinations',
    });
  }
}

export async function createAdminPayoutDestinationHandler(req: Request, res: Response) {
  try {
    const item = await createAdminPayoutDestination(req.body, getAdminPayoutScope(req));
    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create payout destination',
    });
  }
}

export async function updateAdminPayoutDestinationHandler(req: Request, res: Response) {
  try {
    const item = await updateAdminPayoutDestination(req.params.id, req.body || {}, getAdminPayoutScope(req));
    res.json({
      success: true,
      data: item,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update payout destination',
    });
  }
}

export async function listAdminPayoutRulesHandler(req: Request, res: Response) {
  try {
    const items = await listAdminPayoutRules(getAdminPayoutScope(req));
    res.json({
      success: true,
      data: {
        items,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to load payout rules',
    });
  }
}

export async function upsertAdminPayoutRuleHandler(req: Request, res: Response) {
  try {
    const item = await upsertAdminPayoutRule(req.body, getAdminPayoutScope(req));
    res.status(req.body?.id ? 200 : 201).json({
      success: true,
      data: item,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to save payout rule',
    });
  }
}

export async function listAdminPayoutRequestsHandler(req: Request, res: Response) {
  try {
    const items = await listAdminPayoutRequests(getAdminPayoutScope(req));
    res.json({
      success: true,
      data: {
        items,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to load payout requests',
    });
  }
}

export async function createAdminPayoutRequestHandler(req: Request, res: Response) {
  try {
    const item = await createAdminPayoutRequest(req.body, getAdminPayoutScope(req));
    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create payout request',
    });
  }
}

export async function updateAdminPayoutRequestStatusHandler(req: Request, res: Response) {
  try {
    const item = await updateAdminPayoutRequestStatus(
      req.params.id,
      req.params.action as 'cancel' | 'approve' | 'reject' | 'mark_processing' | 'mark_paid' | 'fail',
      getAdminPayoutScope(req),
      req.body || {}
    );
    res.json({
      success: true,
      data: item,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update payout request',
    });
  }
}

export async function recomputeInternalPayoutBalancesHandler(req: Request, res: Response) {
  try {
    const data = await recomputePayoutBalances({
      agencyId: typeof req.body?.agency_id === 'string' ? req.body.agency_id : undefined,
      communityId: typeof req.body?.community_id === 'string' ? req.body.community_id : undefined,
      limit: typeof req.body?.limit === 'number' ? req.body.limit : undefined,
    });

    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to recompute payout balances',
    });
  }
}

export async function releaseInternalStalePayoutReservationsHandler(req: Request, res: Response) {
  try {
    const data = await releaseStalePayoutReservations({
      agencyId: typeof req.body?.agency_id === 'string' ? req.body.agency_id : undefined,
      communityId: typeof req.body?.community_id === 'string' ? req.body.community_id : undefined,
      staleHours: typeof req.body?.stale_hours === 'number' ? req.body.stale_hours : undefined,
      limit: typeof req.body?.limit === 'number' ? req.body.limit : undefined,
    });

    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to release stale payout reservations',
    });
  }
}
