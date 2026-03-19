import { Request, Response, NextFunction } from 'express';
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
import { canAccessAgency, canAccessCommunity, resolveAdminScope } from '../services/adminScope';
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
import {
  listCachedPersonalHubPackages,
  listCachedPersonalHubProviders,
  queryExpressPayCatalogProvider,
  syncExpressPayCatalogToCache,
  updateCachedPersonalHubProvider,
} from '../services/expresspayBillPay';
import {
  getPersonalHubTransactionStatus,
  initiatePersonalHubTransaction,
} from '../services/personalHubTransactions';
import { createHttpError } from '../lib/httpError';

/**
 * Get payments by unit ID with filtering and pagination
 */
export async function getPaymentsByUnit(req: Request, res: Response, next: NextFunction) {
  try {
    const unitId = req.params.unitId || req.query.unitId as string;

    if (!unitId) {
      return next(createHttpError(400, 'PAYMENT_UNIT_ID_REQUIRED', 'Unit ID is required'));
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
  } catch (error) {
    next(error);
  }
}

/**
 * Get payments by society ID with filtering and pagination
 */
export async function getPaymentsBySociety(req: Request, res: Response, next: NextFunction) {
  try {
    const societyId = req.params.societyId || req.query.societyId as string;

    if (!societyId) {
      return next(createHttpError(400, 'PAYMENT_COMMUNITY_ID_REQUIRED', 'Community ID is required'));
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
  } catch (error) {
    next(error);
  }
}

/**
 * Get payment by ID
 */
export async function getPaymentById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    if (!id) {
      return next(createHttpError(400, 'PAYMENT_ID_REQUIRED', 'Payment ID is required'));
    }

    const payment = await PaymentService.getPaymentById(id);

    if (!payment) {
      return next(createHttpError(404, 'PAYMENT_NOT_FOUND', 'Payment not found'));
    }

    res.json(payment);
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new payment
 */
export async function createPayment(req: Request, res: Response, next: NextFunction) {
  try {
    await assertScopedPaymentMutationAllowed(req, {
      unitId: typeof req.body?.unit_id === 'string' ? req.body.unit_id : null,
      payerId: typeof req.body?.payer_id === 'string' ? req.body.payer_id : null,
    });

    const payment = await PaymentService.createPayment(req.body);
    res.status(201).json(payment);
  } catch (error) {
    next(error);
  }
}

/**
 * Update a payment
 */
export async function updatePayment(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const existingPayment = await loadPaymentScopeRecord(id);

    await assertScopedPaymentMutationAllowed(req, {
      unitId: typeof req.body?.unit_id === 'string' ? req.body.unit_id : existingPayment.unit_id,
      payerId: typeof req.body?.payer_id === 'string' ? req.body.payer_id : existingPayment.payer_id,
    });

    const payment = await PaymentService.updatePayment(id, {
      ...req.body,
      updated_at: new Date().toISOString(),
    });
    res.json(payment);
  } catch (error) {
    next(error);
  }
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = req.user?.id; // Assuming you have user info in the request

    if (!status) {
      return next(createHttpError(400, 'PAYMENT_STATUS_REQUIRED', 'Status is required'));
    }

    const payment = await PaymentService.updatePaymentStatus(id, status, userId, notes);
    res.json(payment);
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a payment
 */
export async function deletePayment(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const existingPayment = await loadPaymentScopeRecord(id);

    await assertScopedPaymentMutationAllowed(req, {
      unitId: existingPayment.unit_id,
      payerId: existingPayment.payer_id,
    });

    await PaymentService.deletePayment(id);
    res.json({ id, success: true });
  } catch (error) {
    next(error);
  }
}

/**
 * Get payment statistics
 */
export async function getPaymentStats(req: Request, res: Response, next: NextFunction) {
  try {
    const societyId = req.params.societyId || req.query.societyId as string;
    const timeFrame = (req.query.timeFrame as 'week' | 'month' | 'year') || 'month';

    const stats = await PaymentService.getPaymentStats(societyId, timeFrame);
    res.json(stats);
  } catch (error) {
    next(error);
  }
}

/**
 * Get sanitized payment method policy for authenticated clients.
 */
export async function getPaymentMethodPolicy(req: Request, res: Response, next: NextFunction) {
  try {
    const policy = await getClientPaymentMethodPolicy();
    res.json({
      success: true,
      data: policy,
    });
  } catch (error) {
    next(error);
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

const resolvePaymentCommunityIds = async (input: {
  unitId?: string | null;
  payerId?: string | null;
}) => {
  const communityIds = new Set<string>();

  if (input.unitId) {
    const { data, error } = await adminSupabase
      .from('units')
      .select('community_id')
      .eq('id', input.unitId)
      .maybeSingle();

    if (error) {
      throw createHttpError(500, 'PAYMENT_SCOPE_UNIT_LOOKUP_FAILED', 'Failed to resolve payment unit scope', error);
    }

    if (!data?.community_id) {
      throw createHttpError(400, 'PAYMENT_SCOPE_UNIT_INVALID', 'Selected payment unit could not be resolved');
    }

    communityIds.add(data.community_id);
  }

  if (input.payerId) {
    const { data, error } = await adminSupabase
      .from('profiles')
      .select('community_id')
      .eq('id', input.payerId)
      .maybeSingle();

    if (error) {
      throw createHttpError(500, 'PAYMENT_SCOPE_PAYER_LOOKUP_FAILED', 'Failed to resolve payment payer scope', error);
    }

    if (!data?.community_id) {
      throw createHttpError(400, 'PAYMENT_SCOPE_PAYER_INVALID', 'Selected payment payer could not be resolved');
    }

    communityIds.add(data.community_id);
  }

  return [...communityIds];
};

const assertScopedPaymentMutationAllowed = async (
  req: Request,
  input: {
    unitId?: string | null;
    payerId?: string | null;
  }
) => {
  const scope = await resolveAdminScope(req);

  if (scope.isGlobal) {
    return;
  }

  if (scope.communityIds.length === 0) {
    throw createHttpError(403, 'PAYMENT_SCOPE_VIOLATION', 'You do not have access to manage payments');
  }

  if (!input.unitId && !input.payerId) {
    throw createHttpError(
      400,
      'PAYMENT_SCOPE_REFERENCE_REQUIRED',
      'Scoped admins must select a payer or unit within their tenant scope'
    );
  }

  const communityIds = await resolvePaymentCommunityIds(input);

  if (communityIds.length === 0) {
    throw createHttpError(
      400,
      'PAYMENT_SCOPE_REFERENCE_REQUIRED',
      'Scoped admins must select a payer or unit within their tenant scope'
    );
  }

  if (communityIds.some((communityId) => !scope.communityIds.includes(communityId))) {
    throw createHttpError(
      403,
      'PAYMENT_SCOPE_VIOLATION',
      'You do not have access to the selected payment scope'
    );
  }

  if (communityIds.length > 1) {
    throw createHttpError(
      400,
      'PAYMENT_SCOPE_MISMATCH',
      'The selected payer and unit belong to different communities'
    );
  }
};

const loadPaymentScopeRecord = async (id: string) => {
  const { data, error } = await adminSupabase
    .from('payments')
    .select('id, unit_id, payer_id')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw createHttpError(500, 'PAYMENT_LOOKUP_FAILED', 'Failed to load payment', error);
  }

  if (!data) {
    throw createHttpError(404, 'PAYMENT_NOT_FOUND', 'Payment not found');
  }

  return data;
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

const PERSONAL_HUB_TRANSACTION_FIELDS = [
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

const parseCsvFilter = (value: unknown) =>
  typeof value === 'string'
    ? value
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
    : [];

const fetchAllPersonalHubTransactions = async ({
  startIso,
  endIso,
}: {
  startIso: string;
  endIso: string;
}) => {
  const pageSize = 1000;
  const rows: Array<Record<string, any>> = [];

  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await adminSupabase
      .from('personal_hub_transactions')
      .select(PERSONAL_HUB_TRANSACTION_FIELDS)
      .gte('created_at', startIso)
      .lte('created_at', endIso)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      throw new Error(`Failed to load Personal Hub transactions: ${error.message}`);
    }

    const batch = (data || []) as Array<Record<string, any>>;
    rows.push(...batch);

    if (batch.length < pageSize) {
      break;
    }
  }

  return rows;
};

const loadPersonalHubProfileContext = async (transactions: Array<Record<string, any>>) => {
  const profileIds = Array.from(
    new Set(transactions.map((transaction) => transaction.profile_id).filter(Boolean) as string[])
  );
  const userIds = Array.from(
    new Set(transactions.map((transaction) => transaction.user_id).filter(Boolean) as string[])
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

  return {
    profileMapById,
    profileMapByUserId,
    communityMap: new Map<string, Record<string, any>>(
      ((communityResponse.data || []) as Array<Record<string, any>>).map((row) => [row.id, row])
    ),
    unitMap: new Map<string, Record<string, any>>(
      ((unitResponse.data || []) as Array<Record<string, any>>).map((row) => [row.id, row])
    ),
  };
};

const enrichPersonalHubTransactions = (
  transactions: Array<Record<string, any>>,
  context: {
    profileMapById: Map<string, Record<string, any>>;
    profileMapByUserId: Map<string, Record<string, any>>;
    communityMap: Map<string, Record<string, any>>;
    unitMap: Map<string, Record<string, any>>;
  }
) =>
  transactions.map((transaction) => {
    const profile =
      (transaction.profile_id && context.profileMapById.get(transaction.profile_id)) ||
      (transaction.user_id && context.profileMapByUserId.get(transaction.user_id)) ||
      null;
    const community = profile?.community_id ? context.communityMap.get(profile.community_id) || null : null;
    const unit = profile?.unit_id ? context.unitMap.get(profile.unit_id) || null : null;
    const fullName =
      profile?.full_name ||
      [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') ||
      profile?.email ||
      'Unknown user';
    const normalizedService = typeof transaction.transaction_type === 'string' ? transaction.transaction_type : 'unknown';
    const amount = asNumber(transaction.total_amount ?? transaction.amount);

    return {
      id: transaction.transaction_id || transaction.payment_id || `${normalizedService}-${transaction.created_at}`,
      transaction_id: transaction.transaction_id || null,
      payment_id: transaction.payment_id || null,
      transaction_type: normalizedService,
      service: PERSONAL_HUB_SERVICE_LABELS[normalizedService] || normalizedService,
      provider: transaction.provider || null,
      recipient_name: transaction.recipient_name || null,
      recipient_identifier: transaction.recipient_identifier || null,
      amount,
      amount_formatted: formatDashboardMoney(amount),
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

const filterPersonalHubTransactions = (
  transactions: Array<{
    transaction_type: string;
    status: string;
    provider: string | null;
    amount: number;
    transaction_id: string | null;
    payment_id: string | null;
    recipient_name: string | null;
    recipient_identifier: string | null;
    service: string;
    user: { name: string; email: string | null; phone: string | null };
    community: { name: string | null } | null;
    unit: { number: string | null; block: string | null } | null;
  }>,
  filters: {
    serviceTypes: string[];
    statuses: string[];
    providers: string[];
    search: string;
    minAmount: number | null;
    maxAmount: number | null;
  }
) => {
  const normalizedSearch = filters.search.trim().toLowerCase();

  return transactions.filter((transaction) => {
    if (filters.serviceTypes.length > 0 && !filters.serviceTypes.includes(transaction.transaction_type)) {
      return false;
    }

    if (filters.statuses.length > 0 && !filters.statuses.includes(transaction.status)) {
      return false;
    }

    if (filters.providers.length > 0 && !filters.providers.includes(transaction.provider || '')) {
      return false;
    }

    if (filters.minAmount !== null && transaction.amount < filters.minAmount) {
      return false;
    }

    if (filters.maxAmount !== null && transaction.amount > filters.maxAmount) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    const haystack = [
      transaction.transaction_id,
      transaction.payment_id,
      transaction.service,
      transaction.provider,
      transaction.recipient_name,
      transaction.recipient_identifier,
      transaction.user.name,
      transaction.user.email,
      transaction.user.phone,
      transaction.community?.name,
      transaction.unit?.number,
      transaction.unit?.block,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedSearch);
  });
};

const buildPersonalHubEngagementBuckets = (
  transactions: Array<{ created_at: string | null; user: { id: string | null; email: string | null }; status: string }>,
  periodDays: number
) => {
  const buckets = new Map<
    string,
    {
      date: string;
      transactions: number;
      successfulTransactions: number;
      activeUsers: Set<string>;
    }
  >();

  for (const transaction of transactions) {
    const bucketDate = getBucketDate(transaction.created_at, periodDays);
    if (!bucketDate) continue;

    const key = bucketDate.toISOString().slice(0, 10);
    const current = buckets.get(key) || {
      date: key,
      transactions: 0,
      successfulTransactions: 0,
      activeUsers: new Set<string>(),
    };

    current.transactions += 1;
    if (transaction.status === 'completed') {
      current.successfulTransactions += 1;
    }

    const actorKey = transaction.user.id || transaction.user.email;
    if (actorKey) {
      current.activeUsers.add(actorKey);
    }

    buckets.set(key, current);
  }

  return Array.from(buckets.values())
    .sort((left, right) => left.date.localeCompare(right.date))
    .map((bucket) => ({
      date: bucket.date,
      transactions: bucket.transactions,
      successful_transactions: bucket.successfulTransactions,
      active_users: bucket.activeUsers.size,
      success_rate: bucket.transactions > 0 ? (bucket.successfulTransactions / bucket.transactions) * 100 : 0,
    }));
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

type ResolvedAdminScope = Awaited<ReturnType<typeof resolveAdminScope>>;

const normalizeString = (value: unknown) =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const getScopedDefault = (values: string[]) => (values.length === 1 ? values[0] : null);

const getRecordCommunityId = (record: unknown) => {
  if (!isRecord(record)) return null;

  const directCommunityId = normalizeString(record.community_id);
  if (directCommunityId) {
    return directCommunityId;
  }

  if (isRecord(record.community)) {
    return normalizeString(record.community.id);
  }

  return null;
};

const getRecordAgencyId = (record: unknown) => {
  if (!isRecord(record)) return null;

  const directAgencyId = normalizeString(record.agency_id);
  if (directAgencyId) {
    return directAgencyId;
  }

  if (isRecord(record.agency)) {
    return normalizeString(record.agency.id);
  }

  return null;
};

const recordMatchesAdminScope = (scope: ResolvedAdminScope, record: unknown) => {
  if (scope.isGlobal) {
    return true;
  }

  const communityId = getRecordCommunityId(record);
  if (communityId) {
    return canAccessCommunity(scope, communityId);
  }

  const agencyId = getRecordAgencyId(record);
  if (agencyId) {
    return canAccessAgency(scope, agencyId);
  }

  return false;
};

const filterRecordsByAdminScope = <T>(scope: ResolvedAdminScope, records: T[]) =>
  scope.isGlobal ? records : records.filter((record) => recordMatchesAdminScope(scope, record));

const assertScopedCommunityAccess = (
  scope: ResolvedAdminScope,
  communityId: string | null,
  code: string,
  message: string
) => {
  if (scope.isGlobal) {
    return;
  }

  if (!communityId || !canAccessCommunity(scope, communityId)) {
    throw createHttpError(403, code, message);
  }
};

const assertScopedAgencyAccess = (
  scope: ResolvedAdminScope,
  agencyId: string | null,
  code: string,
  message: string
) => {
  if (scope.isGlobal) {
    return;
  }

  if (!agencyId || !canAccessAgency(scope, agencyId)) {
    throw createHttpError(403, code, message);
  }
};

const assertRecordAccess = (
  scope: ResolvedAdminScope,
  record: unknown,
  code: string,
  message: string
) => {
  if (scope.isGlobal) {
    return;
  }

  if (!recordMatchesAdminScope(scope, record)) {
    throw createHttpError(403, code, message);
  }
};

const applyScopedPaymentChargeDefaults = (scope: ResolvedAdminScope, payload: Record<string, unknown>) => {
  if (scope.isGlobal) {
    return;
  }

  const scopeLevel = normalizeString(payload.scope_level);

  if (scopeLevel === 'community' && !normalizeString(payload.community_id)) {
    const defaultCommunityId = getScopedDefault(scope.communityIds);
    if (defaultCommunityId) {
      payload.community_id = defaultCommunityId;
    }
  }

  if (scopeLevel === 'agency' && !normalizeString(payload.agency_id)) {
    const defaultAgencyId = getScopedDefault(scope.agencyIds);
    if (defaultAgencyId) {
      payload.agency_id = defaultAgencyId;
    }
  }
};

const assertScopedPaymentChargeTemplateInput = (
  scope: ResolvedAdminScope,
  payload: Record<string, unknown>
) => {
  if (scope.isGlobal) {
    return;
  }

  applyScopedPaymentChargeDefaults(scope, payload);

  const scopeLevel = normalizeString(payload.scope_level);
  const agencyId = normalizeString(payload.agency_id);
  const communityId = normalizeString(payload.community_id);

  if (scopeLevel === 'community') {
    if (!communityId) {
      throw createHttpError(
        400,
        'ADMIN_PAYMENT_CHARGE_COMMUNITY_REQUIRED',
        'community_id is required for community-scoped charge templates'
      );
    }

    assertScopedCommunityAccess(
      scope,
      communityId,
      'ADMIN_PAYMENT_CHARGE_SCOPE_VIOLATION',
      'Payment charge template is outside your tenant scope'
    );

    if (agencyId) {
      assertScopedAgencyAccess(
        scope,
        agencyId,
        'ADMIN_PAYMENT_CHARGE_SCOPE_VIOLATION',
        'Payment charge template agency is outside your tenant scope'
      );
    }

    return;
  }

  if (scopeLevel === 'agency') {
    if (!agencyId) {
      throw createHttpError(
        400,
        'ADMIN_PAYMENT_CHARGE_AGENCY_REQUIRED',
        'agency_id is required for agency-scoped charge templates'
      );
    }

    assertScopedAgencyAccess(
      scope,
      agencyId,
      'ADMIN_PAYMENT_CHARGE_SCOPE_VIOLATION',
      'Payment charge template agency is outside your tenant scope'
    );

    if (communityId) {
      assertScopedCommunityAccess(
        scope,
        communityId,
        'ADMIN_PAYMENT_CHARGE_SCOPE_VIOLATION',
        'Payment charge template community is outside your tenant scope'
      );
    }
  }
};

const loadPaymentChargeTemplateScopeRecord = async (id: string) => {
  const { data, error } = await adminSupabase
    .from('payment_charge_templates')
    .select('id, scope_level, agency_id, community_id')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw createHttpError(
      500,
      'ADMIN_PAYMENT_CHARGE_TEMPLATE_LOOKUP_FAILED',
      'Failed to load payment charge template scope',
      error
    );
  }

  if (!data) {
    throw createHttpError(404, 'ADMIN_PAYMENT_CHARGE_TEMPLATE_NOT_FOUND', 'Payment charge template not found.');
  }

  return data as {
    id: string;
    scope_level: 'agency' | 'community';
    agency_id: string | null;
    community_id: string | null;
  };
};

const PAYMENT_CONTROLLER_ERROR_MAP: Array<{
  message: string;
  status: number;
  code: string;
}> = [
  {
    message: 'Only superadmin and agency managers can access payouts.',
    status: 403,
    code: 'ADMIN_PAYOUT_SCOPE_VIOLATION',
  },
  {
    message: 'Your account is missing an agency assignment.',
    status: 400,
    code: 'ADMIN_PAYOUT_AGENCY_ASSIGNMENT_MISSING',
  },
  {
    message: 'You can only access payouts for your assigned agency.',
    status: 403,
    code: 'ADMIN_PAYOUT_SCOPE_VIOLATION',
  },
  {
    message: 'The selected community does not belong to your assigned agency.',
    status: 403,
    code: 'ADMIN_PAYOUT_SCOPE_VIOLATION',
  },
  {
    message: 'A valid agency scope is required to create a payout destination.',
    status: 400,
    code: 'ADMIN_PAYOUT_AGENCY_SCOPE_REQUIRED',
  },
  {
    message: 'A valid agency scope is required to save payout rules.',
    status: 400,
    code: 'ADMIN_PAYOUT_AGENCY_SCOPE_REQUIRED',
  },
  {
    message: 'A valid agency scope is required to create a payout request.',
    status: 400,
    code: 'ADMIN_PAYOUT_AGENCY_SCOPE_REQUIRED',
  },
  {
    message: 'Payout destination not found.',
    status: 404,
    code: 'ADMIN_PAYOUT_DESTINATION_NOT_FOUND',
  },
  {
    message: 'The selected payout destination is not available in this scope.',
    status: 403,
    code: 'ADMIN_PAYOUT_DESTINATION_SCOPE_VIOLATION',
  },
  {
    message: 'The selected payout destination is not active.',
    status: 400,
    code: 'ADMIN_PAYOUT_DESTINATION_INACTIVE',
  },
  {
    message: 'Requested amount must be greater than zero.',
    status: 400,
    code: 'ADMIN_PAYOUT_REQUEST_AMOUNT_INVALID',
  },
  {
    message: 'Requested amount exceeds the available payout balance.',
    status: 400,
    code: 'ADMIN_PAYOUT_REQUEST_BALANCE_EXCEEDED',
  },
  {
    message: 'Could not fully allocate the requested amount.',
    status: 409,
    code: 'ADMIN_PAYOUT_REQUEST_ALLOCATION_CONFLICT',
  },
  {
    message: 'Payout request not found.',
    status: 404,
    code: 'ADMIN_PAYOUT_REQUEST_NOT_FOUND',
  },
  {
    message: 'Payment charge template not found',
    status: 404,
    code: 'ADMIN_PAYMENT_CHARGE_TEMPLATE_NOT_FOUND',
  },
  {
    message: 'Payment charge template not found.',
    status: 404,
    code: 'ADMIN_PAYMENT_CHARGE_TEMPLATE_NOT_FOUND',
  },
  {
    message: 'A community must be selected before previewing or issuing this charge.',
    status: 400,
    code: 'ADMIN_PAYMENT_CHARGE_COMMUNITY_REQUIRED',
  },
  {
    message: 'Selected community could not be found.',
    status: 404,
    code: 'ADMIN_PAYMENT_CHARGE_COMMUNITY_NOT_FOUND',
  },
  {
    message: 'Selected community is outside the template agency scope.',
    status: 403,
    code: 'ADMIN_PAYMENT_CHARGE_SCOPE_VIOLATION',
  },
  {
    message: 'Selected community does not match the template community scope.',
    status: 403,
    code: 'ADMIN_PAYMENT_CHARGE_SCOPE_VIOLATION',
  },
  {
    message: 'A charge run has already been issued for this template, community, and billing period.',
    status: 409,
    code: 'ADMIN_PAYMENT_CHARGE_RUN_ALREADY_EXISTS',
  },
];

const forwardPaymentControllerError = (
  next: NextFunction,
  error: unknown,
  code: string,
  fallbackMessage: string
) => {
  if (error instanceof Error && 'statusCode' in error) {
    return next(error);
  }

  const message = error instanceof Error && error.message ? error.message : fallbackMessage;
  const mapped = PAYMENT_CONTROLLER_ERROR_MAP.find((item) => item.message === message);
  if (mapped) {
    return next(createHttpError(mapped.status, mapped.code, message, error));
  }
  return next(createHttpError(500, code, message, error));
};

export async function getPaymentObligations(req: Request, res: Response, next: NextFunction) {
  try {
    const unitId = getProfileUnitId(req);

    if (!unitId) {
      return next(createHttpError(400, 'PAYMENT_UNIT_ASSIGNMENT_MISSING', 'Your profile is missing a unit assignment.'));
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
  } catch (error) {
    return forwardPaymentControllerError(next, error, 'PAYMENT_OBLIGATIONS_LOAD_FAILED', 'Failed to load payment obligations');
  }
}

export async function getPaymentHistoryFeed(req: Request, res: Response, next: NextFunction) {
  try {
    const unitId = getProfileUnitId(req);

    if (!unitId) {
      return next(createHttpError(400, 'PAYMENT_UNIT_ASSIGNMENT_MISSING', 'Your profile is missing a unit assignment.'));
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
  } catch (error) {
    return forwardPaymentControllerError(next, error, 'PAYMENT_HISTORY_LOAD_FAILED', 'Failed to load payment history');
  }
}

export async function getPaymentStatementsFeed(req: Request, res: Response, next: NextFunction) {
  try {
    const unitId = getProfileUnitId(req);

    if (!unitId) {
      return next(createHttpError(400, 'PAYMENT_UNIT_ASSIGNMENT_MISSING', 'Your profile is missing a unit assignment.'));
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
  } catch (error) {
    return forwardPaymentControllerError(next, error, 'PAYMENT_STATEMENTS_LOAD_FAILED', 'Failed to load payment statements');
  }
}

export async function generatePaymentStatement(req: Request, res: Response, next: NextFunction) {
  try {
    const profile = (req.userProfile || {}) as Record<string, unknown>;
    const unitId = getProfileUnitId(req);
    const requestedUnitId = typeof req.body?.unit_id === 'string' ? req.body.unit_id : null;
    const targetUnitId =
      typeof profile.role === 'string' && ['admin', 'superadmin', 'agency_manager', 'facility_manager'].includes(profile.role)
        ? requestedUnitId || unitId
        : unitId;

    if (!targetUnitId) {
      return next(createHttpError(400, 'PAYMENT_STATEMENT_UNIT_REQUIRED', 'A target unit is required to generate a statement.'));
    }

    const result = await generatePaymentStatementForUnit({
      unitId: targetUnitId,
      monthYear: typeof req.body?.month_year === 'string' ? req.body.month_year : null,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return forwardPaymentControllerError(next, error, 'PAYMENT_STATEMENT_GENERATE_FAILED', 'Failed to generate payment statement');
  }
}

export async function listPersonalHubCatalogProviders(req: Request, res: Response, next: NextFunction) {
  try {
    const providers = await listCachedPersonalHubProviders({
      serviceType: typeof req.query.service_type === 'string' ? req.query.service_type : null,
      billCategory: typeof req.query.bill_category === 'string' ? req.query.bill_category : null,
      includeDisabled: false,
    });

    res.json({
      success: true,
      data: {
        items: providers,
      },
    });
  } catch (error) {
    return forwardPaymentControllerError(next, error, 'PERSONAL_HUB_PROVIDERS_LOAD_FAILED', 'Failed to load Personal Hub providers');
  }
}

export async function queryPersonalHubCatalog(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await queryExpressPayCatalogProvider({
      providerId: typeof req.body?.provider_id === 'string' ? req.body.provider_id : null,
      externalServiceCode:
        typeof req.body?.external_service_code === 'string' ? req.body.external_service_code : null,
      serviceType: typeof req.body?.service_type === 'string' ? (req.body.service_type as any) : null,
      billCategory: typeof req.body?.bill_category === 'string' ? (req.body.bill_category as any) : null,
      payload:
        req.body?.payload && typeof req.body.payload === 'object' && !Array.isArray(req.body.payload)
          ? req.body.payload
          : {},
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      return next(error);
    }
    const message = error instanceof Error && error.message ? error.message : 'Failed to query Personal Hub provider';
    return next(createHttpError(400, 'PERSONAL_HUB_PROVIDER_QUERY_FAILED', message, error));
  }
}

export async function initiatePersonalHubCheckout(req: Request, res: Response, next: NextFunction) {
  try {
    const actorUserId = getActorUserId(req);
    const profile = (req.userProfile || {}) as Record<string, unknown>;
    const unitId = getProfileUnitId(req);

    if (!actorUserId) {
      return next(createHttpError(401, 'PERSONAL_HUB_AUTH_REQUIRED', 'Authentication required.'));
    }

    if (!unitId) {
      return next(createHttpError(400, 'PERSONAL_HUB_UNIT_ASSIGNMENT_MISSING', 'Your profile is missing a unit assignment.'));
    }

    const amount = asNumber(req.body?.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return next(createHttpError(400, 'PERSONAL_HUB_AMOUNT_INVALID', 'amount must be a positive number.'));
    }

    const result = await initiatePersonalHubTransaction({
      actorUserId,
      profileId: typeof profile.id === 'string' ? profile.id : null,
      unitId,
      communityId: typeof profile.community_id === 'string' ? profile.community_id : null,
      payerProfile: {
        first_name: typeof profile.first_name === 'string' ? profile.first_name : null,
        last_name: typeof profile.last_name === 'string' ? profile.last_name : null,
        email: typeof profile.email === 'string' ? profile.email : null,
        phone: typeof profile.phone === 'string' ? profile.phone : null,
      },
      transactionType: req.body.transaction_type,
      paymentMethod: req.body.payment_method,
      amount,
      currencyCode: typeof req.body.currency_code === 'string' ? req.body.currency_code : 'GHS',
      description: typeof req.body.description === 'string' ? req.body.description : null,
      providerId: typeof req.body.provider_id === 'string' ? req.body.provider_id : null,
      externalServiceCode:
        typeof req.body.external_service_code === 'string' ? req.body.external_service_code : null,
      billCategory: typeof req.body.bill_category === 'string' ? req.body.bill_category : null,
      queryContext:
        req.body?.query_context && typeof req.body.query_context === 'object' && !Array.isArray(req.body.query_context)
          ? req.body.query_context
          : {},
      recipient:
        req.body?.recipient && typeof req.body.recipient === 'object' && !Array.isArray(req.body.recipient)
          ? req.body.recipient
          : {},
      selectedOption:
        req.body?.selected_option &&
        typeof req.body.selected_option === 'object' &&
        !Array.isArray(req.body.selected_option)
          ? req.body.selected_option
          : {},
      metadata:
        req.body?.metadata && typeof req.body.metadata === 'object' && !Array.isArray(req.body.metadata)
          ? req.body.metadata
          : {},
      idempotencyKey: typeof req.body.idempotency_key === 'string' ? req.body.idempotency_key : null,
    });

    res.status(201).json({
      success: true,
      data: {
        source_type: result.source_type,
        source_id: result.source_id,
        provider: result.provider,
        payment_id: result.payment.paymentId,
        transaction_id: result.payment.transactionId,
        checkout_url: result.payment.checkoutUrl,
        provider_reference: result.payment.providerReference,
        token: result.payment.token,
        status: result.payment.status,
        client_action: result.payment.checkoutUrl ? 'open_url' : 'poll',
      },
    });
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      return next(error);
    }
    const message = error instanceof Error && error.message ? error.message : 'Failed to initiate Personal Hub checkout';
    return next(createHttpError(400, 'PERSONAL_HUB_CHECKOUT_INITIATE_FAILED', message, error));
  }
}

export async function getPersonalHubTransactionStatusHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const actorUserId = getActorUserId(req);
    const role = typeof req.userProfile?.role === 'string' ? req.userProfile.role : '';

    if (!actorUserId) {
      return next(createHttpError(401, 'PERSONAL_HUB_AUTH_REQUIRED', 'Authentication required.'));
    }

    const result = await getPersonalHubTransactionStatus({
      transactionId: req.params.id,
      actorUserId,
      isAdmin: ['admin', 'superadmin', 'agency_manager', 'facility_manager'].includes(role),
    });

    if (!result) {
      return next(createHttpError(404, 'PERSONAL_HUB_TRANSACTION_NOT_FOUND', 'Personal Hub transaction not found.'));
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return forwardPaymentControllerError(
      next,
      error,
      'PERSONAL_HUB_TRANSACTION_STATUS_FAILED',
      'Failed to load Personal Hub transaction status'
    );
  }
}

export async function syncAdminPersonalHubCatalog(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);

    if (!scope.isGlobal) {
      return next(createHttpError(403, 'PERSONAL_HUB_CATALOG_SYNC_FORBIDDEN', 'Personal Hub catalog sync is available to platform admins only.'));
    }

    const result = await syncExpressPayCatalogToCache();
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      return next(error);
    }
    const message = error instanceof Error && error.message ? error.message : 'Failed to sync Personal Hub catalog';
    return next(createHttpError(400, 'PERSONAL_HUB_CATALOG_SYNC_FAILED', message, error));
  }
}

export async function listAdminPersonalHubCatalogProviders(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);

    if (!scope.isGlobal) {
      return next(createHttpError(403, 'PERSONAL_HUB_CATALOG_MANAGEMENT_FORBIDDEN', 'Personal Hub catalog management is available to platform admins only.'));
    }

    const providers = await listCachedPersonalHubProviders({
      serviceType: typeof req.query.service_type === 'string' ? req.query.service_type : null,
      billCategory: typeof req.query.bill_category === 'string' ? req.query.bill_category : null,
      includeDisabled: req.query.include_disabled === 'true',
    });

    res.json({
      success: true,
      data: {
        items: providers,
      },
    });
  } catch (error) {
    return forwardPaymentControllerError(next, error, 'ADMIN_PERSONAL_HUB_PROVIDERS_LOAD_FAILED', 'Failed to load admin Personal Hub providers');
  }
}

export async function updateAdminPersonalHubCatalogProvider(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);

    if (!scope.isGlobal) {
      return next(createHttpError(403, 'PERSONAL_HUB_CATALOG_MANAGEMENT_FORBIDDEN', 'Personal Hub catalog management is available to platform admins only.'));
    }

    const provider = await updateCachedPersonalHubProvider({
      id: req.params.id,
      updates: {
        provider_name: typeof req.body.provider_name === 'string' ? req.body.provider_name : undefined,
        logo_url:
          req.body.logo_url === null || typeof req.body.logo_url === 'string' ? req.body.logo_url : undefined,
        is_enabled_for_app:
          typeof req.body.is_enabled_for_app === 'boolean' ? req.body.is_enabled_for_app : undefined,
      },
    });

    res.json({
      success: true,
      data: provider,
    });
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      return next(error);
    }
    const message = error instanceof Error && error.message ? error.message : 'Failed to update admin Personal Hub provider';
    return next(createHttpError(400, 'ADMIN_PERSONAL_HUB_PROVIDER_UPDATE_FAILED', message, error));
  }
}

export async function listAdminPersonalHubCatalogPackages(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);

    if (!scope.isGlobal) {
      return next(createHttpError(403, 'PERSONAL_HUB_CATALOG_MANAGEMENT_FORBIDDEN', 'Personal Hub catalog management is available to platform admins only.'));
    }

    const packages = await listCachedPersonalHubPackages({
      serviceType: typeof req.query.service_type === 'string' ? req.query.service_type : null,
      providerId: typeof req.query.provider_id === 'string' ? req.query.provider_id : null,
      includeDisabled: req.query.include_disabled === 'true',
    });

    res.json({
      success: true,
      data: {
        items: packages,
      },
    });
  } catch (error) {
    return forwardPaymentControllerError(next, error, 'ADMIN_PERSONAL_HUB_PACKAGES_LOAD_FAILED', 'Failed to load admin Personal Hub packages');
  }
}

export async function getAdminPersonalHubDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);

    if (!scope.isGlobal) {
      return next(createHttpError(403, 'PERSONAL_HUB_REPORTS_FORBIDDEN', 'Personal Hub admin reporting is available to platform admins only.'));
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
  } catch (error) {
    return forwardPaymentControllerError(next, error, 'ADMIN_PERSONAL_HUB_DASHBOARD_FAILED', 'Failed to load Personal Hub dashboard');
  }
}

export async function getAdminPersonalHubReports(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);

    if (!scope.isGlobal) {
      return next(createHttpError(403, 'PERSONAL_HUB_REPORTS_FORBIDDEN', 'Personal Hub reports are available to platform admins only.'));
    }

    const periodDays = Number(req.query.period || 30);
    const resultLimit = Math.min(Math.max(Number(req.query.limit || 500), 50), 1000);
    const serviceTypes = parseCsvFilter(req.query.service_types);
    const statuses = parseCsvFilter(req.query.statuses).map((status) => normalizePersonalHubStatus(status));
    const providers = parseCsvFilter(req.query.providers);
    const search = typeof req.query.search === 'string' ? req.query.search : '';
    const minAmount =
      req.query.min_amount !== undefined && req.query.min_amount !== ''
        ? asNumber(req.query.min_amount)
        : null;
    const maxAmount =
      req.query.max_amount !== undefined && req.query.max_amount !== ''
        ? asNumber(req.query.max_amount)
        : null;

    const { now, currentStart, previousStart, previousEnd } = getWindowRange(periodDays);

    const [currentTransactions, previousTransactions] = await Promise.all([
      fetchAllPersonalHubTransactions({
        startIso: currentStart.toISOString(),
        endIso: now.toISOString(),
      }),
      fetchAllPersonalHubTransactions({
        startIso: previousStart.toISOString(),
        endIso: previousEnd.toISOString(),
      }),
    ]);

    const context = await loadPersonalHubProfileContext([...currentTransactions, ...previousTransactions]);
    const enrichedCurrentTransactions = enrichPersonalHubTransactions(currentTransactions, context);
    const enrichedPreviousTransactions = enrichPersonalHubTransactions(previousTransactions, context);

    const activeFilters = {
      serviceTypes,
      statuses,
      providers,
      search,
      minAmount,
      maxAmount,
    };

    const filteredCurrentTransactions = filterPersonalHubTransactions(enrichedCurrentTransactions, activeFilters);
    const filteredPreviousTransactions = filterPersonalHubTransactions(enrichedPreviousTransactions, activeFilters);

    const totalTransactions = filteredCurrentTransactions.length;
    const previousTotalTransactions = filteredPreviousTransactions.length;
    const totalVolume = filteredCurrentTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    const previousTotalVolume = filteredPreviousTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    const successfulTransactions = filteredCurrentTransactions.filter((transaction) => transaction.status === 'completed').length;
    const previousSuccessfulTransactions = filteredPreviousTransactions.filter(
      (transaction) => transaction.status === 'completed'
    ).length;
    const activeUserKeys = new Set(
      filteredCurrentTransactions
        .map((transaction) => transaction.user.id || transaction.user.email)
        .filter(Boolean) as string[]
    );
    const previousActiveUserKeys = new Set(
      filteredPreviousTransactions
        .map((transaction) => transaction.user.id || transaction.user.email)
        .filter(Boolean) as string[]
    );
    const averageSuccessRate = totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0;
    const previousAverageSuccessRate =
      previousTotalTransactions > 0 ? (previousSuccessfulTransactions / previousTotalTransactions) * 100 : 0;

    const serviceAggregateMap = new Map<
      string,
      {
        service: string;
        label: string;
        totalTransactions: number;
        successfulTransactions: number;
        failedTransactions: number;
        pendingTransactions: number;
        totalVolume: number;
        activeUsers: Set<string>;
      }
    >();

    for (const transaction of filteredCurrentTransactions) {
      const current = serviceAggregateMap.get(transaction.transaction_type) || {
        service: transaction.transaction_type,
        label: PERSONAL_HUB_SERVICE_LABELS[transaction.transaction_type] || transaction.transaction_type,
        totalTransactions: 0,
        successfulTransactions: 0,
        failedTransactions: 0,
        pendingTransactions: 0,
        totalVolume: 0,
        activeUsers: new Set<string>(),
      };

      current.totalTransactions += 1;
      current.totalVolume += transaction.amount;

      if (transaction.status === 'completed') {
        current.successfulTransactions += 1;
      } else if (transaction.status === 'failed') {
        current.failedTransactions += 1;
      } else {
        current.pendingTransactions += 1;
      }

      const actorKey = transaction.user.id || transaction.user.email;
      if (actorKey) {
        current.activeUsers.add(actorKey);
      }

      serviceAggregateMap.set(transaction.transaction_type, current);
    }

    const serviceAggregates = Array.from(serviceAggregateMap.values())
      .map((service) => ({
        service: service.service,
        label: service.label,
        total_transactions: service.totalTransactions,
        successful_transactions: service.successfulTransactions,
        failed_transactions: service.failedTransactions,
        pending_transactions: service.pendingTransactions,
        total_volume: service.totalVolume,
        total_volume_formatted: formatDashboardMoney(service.totalVolume),
        success_rate:
          service.totalTransactions > 0 ? (service.successfulTransactions / service.totalTransactions) * 100 : 0,
        error_rate: service.totalTransactions > 0 ? (service.failedTransactions / service.totalTransactions) * 100 : 0,
        active_users: service.activeUsers.size,
        adoption_rate: activeUserKeys.size > 0 ? (service.activeUsers.size / activeUserKeys.size) * 100 : 0,
      }))
      .sort((left, right) => right.total_volume - left.total_volume);

    const filterOptionsSource = enrichedCurrentTransactions;
    const serviceOptions = Array.from(
      filterOptionsSource.reduce((map, transaction) => {
        const key = transaction.transaction_type;
        const current = map.get(key) || {
          value: key,
          label: PERSONAL_HUB_SERVICE_LABELS[key] || key,
          count: 0,
        };
        current.count += 1;
        map.set(key, current);
        return map;
      }, new Map<string, { value: string; label: string; count: number }>())
        .values()
    ).sort((left, right) => left.label.localeCompare(right.label));

    const statusOptions = Array.from(
      filterOptionsSource.reduce((map, transaction) => {
        const key = transaction.status;
        const current = map.get(key) || {
          value: key,
          label: key.charAt(0).toUpperCase() + key.slice(1),
          count: 0,
        };
        current.count += 1;
        map.set(key, current);
        return map;
      }, new Map<string, { value: string; label: string; count: number }>())
        .values()
    ).sort((left, right) => left.label.localeCompare(right.label));

    const providerOptions = Array.from(
      filterOptionsSource.reduce((map, transaction) => {
        const key = transaction.provider?.trim();
        if (!key) {
          return map;
        }

        const current = map.get(key) || {
          value: key,
          label: key,
          count: 0,
        };
        current.count += 1;
        map.set(key, current);
        return map;
      }, new Map<string, { value: string; label: string; count: number }>())
        .values()
    ).sort((left, right) => left.label.localeCompare(right.label));

    res.json({
      success: true,
      data: {
        period: String(periodDays),
        currency_code: DEFAULT_PAYMENT_DISPLAY.currencyCode,
        currency_symbol: DEFAULT_PAYMENT_DISPLAY.currencySymbol,
        summary: {
          total_transactions: totalTransactions,
          total_transactions_formatted: totalTransactions.toLocaleString('en-GH'),
          total_volume: totalVolume,
          total_volume_formatted: formatDashboardMoney(totalVolume),
          successful_transactions: successfulTransactions,
          successful_transactions_formatted: successfulTransactions.toLocaleString('en-GH'),
          failed_transactions: filteredCurrentTransactions.filter((transaction) => transaction.status === 'failed').length,
          failed_transactions_formatted: filteredCurrentTransactions
            .filter((transaction) => transaction.status === 'failed')
            .length.toLocaleString('en-GH'),
          active_users: activeUserKeys.size,
          active_users_formatted: activeUserKeys.size.toLocaleString('en-GH'),
          average_success_rate: averageSuccessRate,
          average_success_rate_formatted: `${averageSuccessRate.toFixed(1)}%`,
          growth: {
            total_transactions: getGrowthRate(totalTransactions, previousTotalTransactions),
            total_volume: getGrowthRate(totalVolume, previousTotalVolume),
            active_users: getGrowthRate(activeUserKeys.size, previousActiveUserKeys.size),
            average_success_rate: getGrowthRate(averageSuccessRate, previousAverageSuccessRate),
          },
        },
        filters: {
          applied: {
            service_types: serviceTypes,
            statuses,
            providers,
            search,
            min_amount: minAmount,
            max_amount: maxAmount,
          },
          options: {
            services: serviceOptions,
            statuses: statusOptions,
            providers: providerOptions,
          },
        },
        transactions_total: totalTransactions,
        transactions_returned: Math.min(totalTransactions, resultLimit),
        transactions_truncated: totalTransactions > resultLimit,
        transactions: filteredCurrentTransactions.slice(0, resultLimit),
        charts: {
          revenue_by_service: serviceAggregates,
          user_engagement: buildPersonalHubEngagementBuckets(filteredCurrentTransactions, periodDays),
          service_performance: serviceAggregates.map((service) => ({
            service: service.service,
            label: service.label,
            success_rate: service.success_rate,
            error_rate: service.error_rate,
            pending_rate:
              service.total_transactions > 0
                ? (service.pending_transactions / service.total_transactions) * 100
                : 0,
            total_transactions: service.total_transactions,
          })),
          service_adoption: serviceAggregates.map((service) => ({
            service: service.service,
            label: service.label,
            active_users: service.active_users,
            adoption_rate: service.adoption_rate,
            total_transactions: service.total_transactions,
          })),
        },
      },
    });
  } catch (error) {
    return forwardPaymentControllerError(next, error, 'ADMIN_PERSONAL_HUB_REPORTS_FAILED', 'Failed to load Personal Hub reports');
  }
}

export async function listAdminTransactions(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const items = await listAdminPaymentTransactions({
      status: typeof req.query.status === 'string' ? req.query.status : undefined,
      sourceType: typeof req.query.source_type === 'string' ? req.query.source_type : undefined,
      unitId: typeof req.query.unit_id === 'string' ? req.query.unit_id : undefined,
    });
    const scopedItems = filterRecordsByAdminScope(scope, items);

    res.json({
      success: true,
      data: {
        currency_code: DEFAULT_PAYMENT_DISPLAY.currencyCode,
        currency_symbol: DEFAULT_PAYMENT_DISPLAY.currencySymbol,
        items: scopedItems,
      },
    });
  } catch (error) {
    return forwardPaymentControllerError(next, error, 'ADMIN_PAYMENT_TRANSACTIONS_LOAD_FAILED', 'Failed to load payment transactions');
  }
}

export async function getAdminTransaction(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const transaction = await getAdminPaymentTransaction(req.params.id);

    if (!transaction) {
      return next(createHttpError(404, 'ADMIN_PAYMENT_TRANSACTION_NOT_FOUND', 'Payment transaction not found.'));
    }

    assertRecordAccess(
      scope,
      transaction,
      'ADMIN_PAYMENT_SCOPE_VIOLATION',
      'Payment transaction is outside your tenant scope'
    );

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    return forwardPaymentControllerError(next, error, 'ADMIN_PAYMENT_TRANSACTION_LOAD_FAILED', 'Failed to load payment transaction');
  }
}

export async function listAdminObligations(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const items = await listAdminPaymentObligations({
      status: typeof req.query.status === 'string' ? req.query.status : undefined,
      unitId: typeof req.query.unit_id === 'string' ? req.query.unit_id : undefined,
    });
    const scopedItems = filterRecordsByAdminScope(scope, items);

    res.json({
      success: true,
      data: {
        currency_code: DEFAULT_PAYMENT_DISPLAY.currencyCode,
        currency_symbol: DEFAULT_PAYMENT_DISPLAY.currencySymbol,
        items: scopedItems,
      },
    });
  } catch (error) {
    return forwardPaymentControllerError(next, error, 'ADMIN_PAYMENT_OBLIGATIONS_LOAD_FAILED', 'Failed to load payment obligations');
  }
}

export async function listAdminStatements(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const items = await listAdminPaymentStatements({
      unitId: typeof req.query.unit_id === 'string' ? req.query.unit_id : undefined,
    });
    const scopedItems = filterRecordsByAdminScope(scope, items);

    res.json({
      success: true,
      data: {
        currency_code: DEFAULT_PAYMENT_DISPLAY.currencyCode,
        currency_symbol: DEFAULT_PAYMENT_DISPLAY.currencySymbol,
        items: scopedItems,
      },
    });
  } catch (error) {
    return forwardPaymentControllerError(next, error, 'ADMIN_PAYMENT_STATEMENTS_LOAD_FAILED', 'Failed to load payment statements');
  }
}

export async function listAdminPaymentChargeCatalog(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await getPaymentChargeCatalog();
    res.json({
      success: true,
      data: {
        items,
      },
    });
  } catch (error) {
    return forwardPaymentControllerError(next, error, 'ADMIN_PAYMENT_CHARGE_CATALOG_LOAD_FAILED', 'Failed to load payment charge catalog');
  }
}

export async function listAdminPaymentChargeTemplates(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const items = await listPaymentChargeTemplates({
      scope_level: typeof req.query.scope_level === 'string' ? req.query.scope_level as 'agency' | 'community' : undefined,
      agency_id: typeof req.query.agency_id === 'string' ? req.query.agency_id : undefined,
      community_id: typeof req.query.community_id === 'string' ? req.query.community_id : undefined,
      include_inactive:
        req.query.include_inactive === true ||
        req.query.include_inactive === 'true',
    });
    const scopedItems = filterRecordsByAdminScope(scope, items);

    res.json({
      success: true,
      data: {
        items: scopedItems,
      },
    });
  } catch (error) {
    return forwardPaymentControllerError(next, error, 'ADMIN_PAYMENT_CHARGE_TEMPLATES_LOAD_FAILED', 'Failed to load payment charge templates');
  }
}

export async function createAdminPaymentChargeTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    if (isRecord(req.body)) {
      assertScopedPaymentChargeTemplateInput(scope, req.body);
    }

    const item = await createPaymentChargeTemplate(req.body, getActorUserId(req));
    assertRecordAccess(
      scope,
      item,
      'ADMIN_PAYMENT_CHARGE_SCOPE_VIOLATION',
      'Payment charge template is outside your tenant scope'
    );
    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error) {
    return forwardPaymentControllerError(next, error, 'ADMIN_PAYMENT_CHARGE_TEMPLATE_CREATE_FAILED', 'Failed to create payment charge template');
  }
}

export async function updateAdminPaymentChargeTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const existingTemplate = await loadPaymentChargeTemplateScopeRecord(req.params.id);
    assertRecordAccess(
      scope,
      existingTemplate,
      'ADMIN_PAYMENT_CHARGE_SCOPE_VIOLATION',
      'Payment charge template is outside your tenant scope'
    );

    if (isRecord(req.body)) {
      assertScopedPaymentChargeTemplateInput(scope, {
        ...existingTemplate,
        ...req.body,
      });
    }

    const item = await updatePaymentChargeTemplate(req.params.id, req.body, getActorUserId(req));
    assertRecordAccess(
      scope,
      item,
      'ADMIN_PAYMENT_CHARGE_SCOPE_VIOLATION',
      'Payment charge template is outside your tenant scope'
    );
    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    return forwardPaymentControllerError(next, error, 'ADMIN_PAYMENT_CHARGE_TEMPLATE_UPDATE_FAILED', 'Failed to update payment charge template');
  }
}

export async function previewAdminPaymentChargeTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const existingTemplate = await loadPaymentChargeTemplateScopeRecord(req.params.id);
    assertRecordAccess(
      scope,
      existingTemplate,
      'ADMIN_PAYMENT_CHARGE_SCOPE_VIOLATION',
      'Payment charge template is outside your tenant scope'
    );

    if (isRecord(req.body)) {
      if (!normalizeString(req.body.community_id) && existingTemplate.scope_level === 'agency') {
        const defaultCommunityId = getScopedDefault(scope.communityIds);
        if (defaultCommunityId) {
          req.body.community_id = defaultCommunityId;
        }
      }

      const requestedCommunityId = normalizeString(req.body.community_id) || normalizeString(existingTemplate.community_id);
      if (requestedCommunityId) {
        assertScopedCommunityAccess(
          scope,
          requestedCommunityId,
          'ADMIN_PAYMENT_CHARGE_SCOPE_VIOLATION',
          'Payment charge preview is outside your tenant scope'
        );
      }
    }

    const preview = await previewPaymentChargeTemplate(req.params.id, req.body || {});
    assertRecordAccess(
      scope,
      preview,
      'ADMIN_PAYMENT_CHARGE_SCOPE_VIOLATION',
      'Payment charge preview is outside your tenant scope'
    );
    res.json({
      success: true,
      data: preview,
    });
  } catch (error) {
    return forwardPaymentControllerError(next, error, 'ADMIN_PAYMENT_CHARGE_TEMPLATE_PREVIEW_FAILED', 'Failed to preview payment charge template');
  }
}

export async function issueAdminPaymentChargeTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const existingTemplate = await loadPaymentChargeTemplateScopeRecord(req.params.id);
    assertRecordAccess(
      scope,
      existingTemplate,
      'ADMIN_PAYMENT_CHARGE_SCOPE_VIOLATION',
      'Payment charge template is outside your tenant scope'
    );

    if (isRecord(req.body)) {
      if (!normalizeString(req.body.community_id) && existingTemplate.scope_level === 'agency') {
        const defaultCommunityId = getScopedDefault(scope.communityIds);
        if (defaultCommunityId) {
          req.body.community_id = defaultCommunityId;
        }
      }

      const requestedCommunityId = normalizeString(req.body.community_id) || normalizeString(existingTemplate.community_id);
      if (requestedCommunityId) {
        assertScopedCommunityAccess(
          scope,
          requestedCommunityId,
          'ADMIN_PAYMENT_CHARGE_SCOPE_VIOLATION',
          'Payment charge issue request is outside your tenant scope'
        );
      }
    }

    const issued = await issuePaymentChargeTemplate(req.params.id, req.body || {}, getActorUserId(req));
    assertRecordAccess(
      scope,
      issued?.run || issued,
      'ADMIN_PAYMENT_CHARGE_SCOPE_VIOLATION',
      'Payment charge issue result is outside your tenant scope'
    );
    res.json({
      success: true,
      data: issued,
    });
  } catch (error) {
    return forwardPaymentControllerError(next, error, 'ADMIN_PAYMENT_CHARGE_ISSUE_FAILED', 'Failed to issue payment charges');
  }
}

export async function listAdminPaymentChargeRuns(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const items = await listPaymentChargeRuns({
      community_id: typeof req.query.community_id === 'string' ? req.query.community_id : undefined,
      template_id: typeof req.query.template_id === 'string' ? req.query.template_id : undefined,
      status: typeof req.query.status === 'string' ? req.query.status as 'draft' | 'previewed' | 'issued' | 'cancelled' : undefined,
    });
    const scopedItems = filterRecordsByAdminScope(scope, items);

    res.json({
      success: true,
      data: {
        items: scopedItems,
      },
    });
  } catch (error) {
    return forwardPaymentControllerError(next, error, 'ADMIN_PAYMENT_CHARGE_RUNS_LOAD_FAILED', 'Failed to load payment charge runs');
  }
}

export async function getAdminPaymentChargeRunDetails(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const run = await getPaymentChargeRun(req.params.id);

    if (!run) {
      return next(createHttpError(404, 'ADMIN_PAYMENT_CHARGE_RUN_NOT_FOUND', 'Payment charge run not found.'));
    }

    assertRecordAccess(
      scope,
      run,
      'ADMIN_PAYMENT_CHARGE_SCOPE_VIOLATION',
      'Payment charge run is outside your tenant scope'
    );

    res.json({
      success: true,
      data: run,
    });
  } catch (error) {
    return forwardPaymentControllerError(next, error, 'ADMIN_PAYMENT_CHARGE_RUN_LOAD_FAILED', 'Failed to load payment charge run');
  }
}

export async function runDueAdminPaymentCharges(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);

    if (isRecord(req.body)) {
      if (!scope.isGlobal && !normalizeString(req.body.community_id) && scope.communityIds.length === 1) {
        req.body.community_id = scope.communityIds[0];
      }

      if (
        !scope.isGlobal &&
        !normalizeString(req.body.agency_id) &&
        scope.communityIds.length === 0 &&
        scope.agencyIds.length === 1
      ) {
        req.body.agency_id = scope.agencyIds[0];
      }

      const requestedCommunityId = normalizeString(req.body.community_id);
      const requestedAgencyId = normalizeString(req.body.agency_id);

      if (!scope.isGlobal && !requestedCommunityId && !requestedAgencyId) {
        throw createHttpError(
          400,
          'ADMIN_PAYMENT_CHARGE_SCOPE_REFERENCE_REQUIRED',
          'Scoped admins must target an in-scope community or agency when running due charges'
        );
      }

      if (requestedCommunityId) {
        assertScopedCommunityAccess(
          scope,
          requestedCommunityId,
          'ADMIN_PAYMENT_CHARGE_SCOPE_VIOLATION',
          'Payment charge run is outside your tenant scope'
        );
      }

      if (requestedAgencyId) {
        assertScopedAgencyAccess(
          scope,
          requestedAgencyId,
          'ADMIN_PAYMENT_CHARGE_SCOPE_VIOLATION',
          'Payment charge run is outside your tenant agency scope'
        );
      }
    }

    const result = await runDuePaymentCharges({
      communityId: typeof req.body?.community_id === 'string' ? req.body.community_id : undefined,
      agencyId: typeof req.body?.agency_id === 'string' ? req.body.agency_id : undefined,
      actorUserId: getActorUserId(req),
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return forwardPaymentControllerError(next, error, 'ADMIN_PAYMENT_CHARGES_RUN_FAILED', 'Failed to run due payment charges');
  }
}

export async function getAdminPayoutSummaryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getAdminPayoutSummary(getAdminPayoutScope(req));
    res.json({ success: true, data });
  } catch (error) {
    return forwardPaymentControllerError(next, error, 'ADMIN_PAYOUT_SUMMARY_LOAD_FAILED', 'Failed to load payout summary');
  }
}

export async function listAdminPayoutTransactionsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await listAdminPayoutTransactions(getAdminPayoutScope(req));
    res.json({
      success: true,
      data: {
        items,
      },
    });
  } catch (error) {
    return forwardPaymentControllerError(next, error, 'ADMIN_PAYOUT_TRANSACTIONS_LOAD_FAILED', 'Failed to load payout transactions');
  }
}

export async function listAdminPayoutDestinationsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await listAdminPayoutDestinations(getAdminPayoutScope(req));
    res.json({
      success: true,
      data: {
        items,
      },
    });
  } catch (error) {
    return forwardPaymentControllerError(next, error, 'ADMIN_PAYOUT_DESTINATIONS_LOAD_FAILED', 'Failed to load payout destinations');
  }
}

export async function createAdminPayoutDestinationHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await createAdminPayoutDestination(req.body, getAdminPayoutScope(req));
    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error) {
    return forwardPaymentControllerError(next, error, 'ADMIN_PAYOUT_DESTINATION_CREATE_FAILED', 'Failed to create payout destination');
  }
}

export async function updateAdminPayoutDestinationHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await updateAdminPayoutDestination(req.params.id, req.body || {}, getAdminPayoutScope(req));
    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    return forwardPaymentControllerError(next, error, 'ADMIN_PAYOUT_DESTINATION_UPDATE_FAILED', 'Failed to update payout destination');
  }
}

export async function listAdminPayoutRulesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await listAdminPayoutRules(getAdminPayoutScope(req));
    res.json({
      success: true,
      data: {
        items,
      },
    });
  } catch (error) {
    return forwardPaymentControllerError(next, error, 'ADMIN_PAYOUT_RULES_LOAD_FAILED', 'Failed to load payout rules');
  }
}

export async function upsertAdminPayoutRuleHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await upsertAdminPayoutRule(req.body, getAdminPayoutScope(req));
    res.status(req.body?.id ? 200 : 201).json({
      success: true,
      data: item,
    });
  } catch (error) {
    return forwardPaymentControllerError(next, error, 'ADMIN_PAYOUT_RULE_SAVE_FAILED', 'Failed to save payout rule');
  }
}

export async function listAdminPayoutRequestsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await listAdminPayoutRequests(getAdminPayoutScope(req));
    res.json({
      success: true,
      data: {
        items,
      },
    });
  } catch (error) {
    return forwardPaymentControllerError(next, error, 'ADMIN_PAYOUT_REQUESTS_LOAD_FAILED', 'Failed to load payout requests');
  }
}

export async function createAdminPayoutRequestHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await createAdminPayoutRequest(req.body, getAdminPayoutScope(req));
    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error) {
    return forwardPaymentControllerError(next, error, 'ADMIN_PAYOUT_REQUEST_CREATE_FAILED', 'Failed to create payout request');
  }
}

export async function updateAdminPayoutRequestStatusHandler(req: Request, res: Response, next: NextFunction) {
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
  } catch (error) {
    return forwardPaymentControllerError(next, error, 'ADMIN_PAYOUT_REQUEST_UPDATE_FAILED', 'Failed to update payout request');
  }
}

export async function recomputeInternalPayoutBalancesHandler(req: Request, res: Response, next: NextFunction) {
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
  } catch (error) {
    return forwardPaymentControllerError(next, error, 'ADMIN_PAYOUT_RECOMPUTE_FAILED', 'Failed to recompute payout balances');
  }
}

export async function releaseInternalStalePayoutReservationsHandler(req: Request, res: Response, next: NextFunction) {
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
  } catch (error) {
    return forwardPaymentControllerError(
      next,
      error,
      'ADMIN_PAYOUT_RESERVATIONS_RELEASE_FAILED',
      'Failed to release stale payout reservations'
    );
  }
}
