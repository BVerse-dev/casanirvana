import { adminSupabase } from '../lib/supabase';
import { syncPaymentToPayoutLedger } from './payouts';

type JsonRecord = Record<string, unknown>;
type SourceStatusConfig = {
  table: string;
  statusField: string;
  completed: string;
  failed: string;
  processing: string;
  touchUpdatedAt?: boolean;
};

type PaymentRow = {
  id: string;
  unit_id: string | null;
  payer_id: string | null;
  amount: number | string | null;
  due_date: string | null;
  paid_at: string | null;
  status: string | null;
  transaction_id: string | null;
  reference_number: string | null;
  payment_type: string | null;
  payment_date: string | null;
  description: string | null;
  payment_method: string | null;
  title: string | null;
  payment_gateway: string | null;
  initiated_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  receipt_url: string | null;
  metadata: JsonRecord | null;
  booking_id: string | null;
  source_type: string | null;
  source_id: string | null;
  obligation_id: string | null;
  currency_code: string | null;
  currency_symbol: string | null;
  provider_status_code: string | null;
  provider_status_message: string | null;
  provider_checked_at: string | null;
  completed_at?: string | null;
  failed_at?: string | null;
};

type PaymentObligationRow = {
  id: string;
  unit_id: string;
  community_id: string;
  source_type: string;
  source_id: string | null;
  title: string;
  description: string | null;
  category: string;
  amount: number | string;
  currency_code: string | null;
  due_date: string | null;
  status: string;
  statement_month: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type PaymentStatementRow = {
  id: string;
  unit_id: string;
  month_year: string;
  total_amount: number | string | null;
  items_count: number | null;
  status: string | null;
  statement_url: string | null;
  generated_date: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type UnitRow = {
  id: string;
  number?: string | null;
  unit_number?: string | null;
  block?: string | null;
  community_id?: string | null;
  owner_id?: string | null;
};

type ProfileRow = {
  id: string;
  user_id?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  community_id?: string | null;
};

type CommunityRow = {
  id: string;
  name?: string | null;
};

const DEFAULT_PAYMENT_CURRENCY_CODE = (process.env.DEFAULT_PAYMENT_CURRENCY || 'GHS').trim().toUpperCase() || 'GHS';
const DEFAULT_PAYMENT_CURRENCY_SYMBOL =
  process.env.DEFAULT_PAYMENT_CURRENCY_SYMBOL?.trim() ||
  (DEFAULT_PAYMENT_CURRENCY_CODE === 'GHS' ? 'GH₵' : DEFAULT_PAYMENT_CURRENCY_CODE);
const TERMINAL_TRANSACTION_STATUSES = new Set(['completed', 'failed', 'cancelled', 'expired']);
const HISTORY_STATUSES = new Set(['completed', 'failed', 'cancelled', 'expired']);
const PENDING_OBLIGATION_STATUSES = new Set(['unpaid', 'partially_paid', 'overdue']);
const MIGRATED_LEGACY_PAYMENT_MESSAGE = 'Migrated to payment_obligations';

const SOURCE_STATUS_TABLE_MAP: Record<string, SourceStatusConfig> = {
  amenity_booking: {
    table: 'amenity_bookings',
    statusField: 'payment_status',
    completed: 'paid',
    failed: 'failed',
    processing: 'pending',
    touchUpdatedAt: true,
  },
  service_booking: {
    table: 'service_bookings',
    statusField: 'payment_status',
    completed: 'paid',
    failed: 'failed',
    processing: 'pending',
    touchUpdatedAt: false,
  },
  service_request: {
    table: 'service_requests',
    statusField: 'payment_status',
    completed: 'paid',
    failed: 'failed',
    processing: 'pending',
    touchUpdatedAt: true,
  },
  airtime_purchase: {
    table: 'airtime_purchases',
    statusField: 'status',
    completed: 'completed',
    failed: 'failed',
    processing: 'pending',
    touchUpdatedAt: true,
  },
  data_purchase: {
    table: 'data_purchases',
    statusField: 'status',
    completed: 'completed',
    failed: 'failed',
    processing: 'pending',
    touchUpdatedAt: true,
  },
  money_transfer: {
    table: 'money_transfers',
    statusField: 'status',
    completed: 'completed',
    failed: 'failed',
    processing: 'pending',
    touchUpdatedAt: true,
  },
  bill_payment: {
    table: 'bill_payments',
    statusField: 'status',
    completed: 'completed',
    failed: 'failed',
    processing: 'pending',
    touchUpdatedAt: true,
  },
  insurance_payment: {
    table: 'insurance_payments',
    statusField: 'status',
    completed: 'completed',
    failed: 'failed',
    processing: 'pending',
    touchUpdatedAt: true,
  },
  shopping_order: {
    table: 'shopping_payments',
    statusField: 'status',
    completed: 'completed',
    failed: 'failed',
    processing: 'pending',
    touchUpdatedAt: true,
  },
};

const asNumber = (value: number | string | null | undefined) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatMoney = (
  amount: number | string | null | undefined,
  currencyCode = DEFAULT_PAYMENT_CURRENCY_CODE,
  currencySymbol = DEFAULT_PAYMENT_CURRENCY_SYMBOL
) => `${currencySymbol} ${asNumber(amount).toFixed(2)}`;

const ensureMonthKey = (value?: string | null) => {
  if (typeof value === 'string' && /^\d{4}-\d{2}$/.test(value.trim())) {
    return value.trim();
  }

  const now = new Date();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${now.getUTCFullYear()}-${month}`;
};

const getMonthRange = (monthYear?: string | null) => {
  const monthKey = ensureMonthKey(monthYear);
  const [year, month] = monthKey.split('-').map((part) => Number(part));
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  return {
    monthKey,
    startIso: start.toISOString(),
    endIso: end.toISOString(),
    statementDate: `${monthKey}-01`,
  };
};

const makeInClause = (values: string[]) => `(${values.map((value) => `"${value}"`).join(',')})`;

const chunk = <T>(items: T[], size = 50) => {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
};

const fetchUnits = async (unitIds: string[]) => {
  const map = new Map<string, UnitRow>();

  for (const batch of chunk(unitIds)) {
    const { data, error } = await adminSupabase
      .from('units')
      .select('id, number, unit_number, block, community_id, owner_id')
      .in('id', batch);

    if (error) {
      throw new Error(`Failed to load units: ${error.message}`);
    }

    for (const row of data || []) {
      map.set(row.id, row as UnitRow);
    }
  }

  return map;
};

const fetchCommunities = async (communityIds: string[]) => {
  const map = new Map<string, CommunityRow>();

  for (const batch of chunk(communityIds)) {
    const { data, error } = await adminSupabase
      .from('communities')
      .select('id, name')
      .in('id', batch);

    if (error) {
      throw new Error(`Failed to load communities: ${error.message}`);
    }

    for (const row of data || []) {
      map.set(row.id, row as CommunityRow);
    }
  }

  return map;
};

const fetchProfiles = async (userIds: string[]) => {
  const map = new Map<string, ProfileRow>();

  for (const batch of chunk(userIds)) {
    const { data, error } = await adminSupabase
      .from('profiles')
      .select('id, user_id, first_name, last_name, full_name, email, phone, role, community_id')
      .in('user_id', batch);

    if (error) {
      throw new Error(`Failed to load profiles: ${error.message}`);
    }

    for (const row of data || []) {
      const profile = row as ProfileRow;
      if (profile.user_id) {
        map.set(profile.user_id, profile);
      }
    }
  }

  return map;
};

const getDisplayName = (profile?: ProfileRow | null) => {
  if (!profile) return null;
  if (profile.full_name) return profile.full_name;
  const joined = [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim();
  return joined || profile.email || null;
};

const serializeObligation = (row: PaymentObligationRow, unit?: UnitRow, community?: CommunityRow) => {
  const currencyCode = row.currency_code || DEFAULT_PAYMENT_CURRENCY_CODE;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    amount: asNumber(row.amount),
    amount_formatted: formatMoney(row.amount, currencyCode),
    currency_code: currencyCode,
    currency_symbol: DEFAULT_PAYMENT_CURRENCY_SYMBOL,
    due_date: row.due_date,
    status: row.status,
    source_type: row.source_type,
    source_id: row.source_id,
    statement_month: row.statement_month,
    unit: unit
      ? {
          id: unit.id,
          number: unit.number || unit.unit_number || null,
          block: unit.block || null,
        }
      : null,
    community: community
      ? {
          id: community.id,
          name: community.name || null,
        }
      : null,
  };
};

const serializeTransaction = ({
  row,
  unit,
  community,
  payerProfile,
}: {
  row: PaymentRow;
  unit?: UnitRow;
  community?: CommunityRow;
  payerProfile?: ProfileRow | null;
}) => {
  const currencyCode = row.currency_code || DEFAULT_PAYMENT_CURRENCY_CODE;
  const status = String(row.status || '').toLowerCase() || 'initiated';
  return {
    id: row.id,
    title: row.title || row.payment_type || 'Payment',
    description: row.description,
    amount: asNumber(row.amount),
    amount_formatted: formatMoney(row.amount, currencyCode),
    currency_code: currencyCode,
    currency_symbol: row.currency_symbol || DEFAULT_PAYMENT_CURRENCY_SYMBOL,
    status,
    payment_type: row.payment_type,
    payment_method: row.payment_method,
    payment_gateway: row.payment_gateway,
    transaction_id: row.transaction_id,
    reference_number: row.reference_number,
    receipt_url: row.receipt_url,
    source_type: row.source_type || 'manual',
    source_id: row.source_id,
    obligation_id: row.obligation_id,
    provider_status_code: row.provider_status_code,
    provider_status_message: row.provider_status_message,
    provider_checked_at: row.provider_checked_at,
    created_at: row.created_at,
    initiated_at: row.initiated_at,
    paid_at: row.paid_at,
    completed_at: row.completed_at || null,
    failed_at: row.failed_at || null,
    metadata: row.metadata,
    unit: unit
      ? {
          id: unit.id,
          number: unit.number || unit.unit_number || null,
          block: unit.block || null,
        }
      : null,
    community: community
      ? {
          id: community.id,
          name: community.name || null,
        }
      : null,
    payer: payerProfile
      ? {
          id: payerProfile.id,
          user_id: payerProfile.user_id || null,
          name: getDisplayName(payerProfile),
          email: payerProfile.email || null,
          phone: payerProfile.phone || null,
          role: payerProfile.role || null,
        }
      : null,
  };
};

export const listPaymentObligationsForUnit = async (unitId: string) => {
  const { data, error } = await adminSupabase
    .from('payment_obligations')
    .select('*')
    .eq('unit_id', unitId)
    .in('status', Array.from(PENDING_OBLIGATION_STATUSES))
    .order('due_date', { ascending: true, nullsFirst: false });

  if (error) {
    throw new Error(`Failed to load payment obligations: ${error.message}`);
  }

  const rows = (data || []) as PaymentObligationRow[];
  const unitMap = await fetchUnits([unitId]);
  const communityIds = Array.from(new Set(rows.map((row) => row.community_id).filter(Boolean)));
  const communityMap = await fetchCommunities(communityIds);
  const unit = unitMap.get(unitId);

  return rows.map((row) => serializeObligation(row, unit, communityMap.get(row.community_id)));
};

export const listPaymentHistoryForUnit = async (unitId: string) => {
  const { data, error } = await adminSupabase
    .from('payments')
    .select('*')
    .eq('unit_id', unitId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to load payment history: ${error.message}`);
  }

  const rows = ((data || []) as PaymentRow[]).filter((row) => {
    const status = String(row.status || '').toLowerCase();
    if (!HISTORY_STATUSES.has(status)) {
      return false;
    }

    if (!row.payment_gateway && row.provider_status_message === MIGRATED_LEGACY_PAYMENT_MESSAGE) {
      return false;
    }

    return true;
  });

  const unitMap = await fetchUnits([unitId]);
  const payerIds = Array.from(new Set(rows.map((row) => row.payer_id).filter(Boolean) as string[]));
  const payerMap = await fetchProfiles(payerIds);
  const unit = unitMap.get(unitId);
  const communityIds = Array.from(new Set([unit?.community_id].filter(Boolean) as string[]));
  const communityMap = await fetchCommunities(communityIds);
  const community = unit?.community_id ? communityMap.get(unit.community_id) : undefined;

  return rows.map((row) =>
    serializeTransaction({
      row,
      unit,
      community,
      payerProfile: row.payer_id ? payerMap.get(row.payer_id) || null : null,
    })
  );
};

export const listPaymentStatementsForUnit = async (unitId: string) => {
  const { data, error } = await adminSupabase
    .from('payment_statements')
    .select('*')
    .eq('unit_id', unitId)
    .order('month_year', { ascending: false });

  if (error) {
    throw new Error(`Failed to load payment statements: ${error.message}`);
  }

  return ((data || []) as PaymentStatementRow[]).map((row) => ({
    ...row,
    total_amount: asNumber(row.total_amount),
    total_amount_formatted: formatMoney(row.total_amount),
    currency_code: DEFAULT_PAYMENT_CURRENCY_CODE,
    currency_symbol: DEFAULT_PAYMENT_CURRENCY_SYMBOL,
  }));
};

export const generatePaymentStatementForUnit = async ({
  unitId,
  monthYear,
}: {
  unitId: string;
  monthYear?: string | null;
}) => {
  const { monthKey, startIso, endIso } = getMonthRange(monthYear);

  const { data: completedPayments, error: paymentsError } = await adminSupabase
    .from('payments')
    .select('id, amount')
    .eq('unit_id', unitId)
    .eq('status', 'completed')
    .gte('created_at', startIso)
    .lt('created_at', endIso);

  if (paymentsError) {
    throw new Error(`Failed to aggregate completed payments: ${paymentsError.message}`);
  }

  const { data: obligations, error: obligationsError } = await adminSupabase
    .from('payment_obligations')
    .select('id, amount, status')
    .eq('unit_id', unitId)
    .eq('statement_month', `${monthKey}-01`);

  if (obligationsError) {
    throw new Error(`Failed to aggregate payment obligations: ${obligationsError.message}`);
  }

  const paidTotal = (completedPayments || []).reduce((sum, row) => sum + asNumber(row.amount), 0);
  const obligationTotal = (obligations || []).reduce((sum, row) => sum + asNumber(row.amount), 0);
  const itemsCount = (completedPayments?.length || 0) + (obligations?.length || 0);
  const closingBalance = Math.max(obligationTotal - paidTotal, 0);
  const statementPayload = {
    unit_id: unitId,
    month_year: monthKey,
    total_amount: paidTotal,
    items_count: itemsCount,
    status: 'ready',
    generated_date: new Date().toISOString().slice(0, 10),
    updated_at: new Date().toISOString(),
  };

  const { data: existingStatement, error: existingError } = await adminSupabase
    .from('payment_statements')
    .select('*')
    .eq('unit_id', unitId)
    .eq('month_year', monthKey)
    .maybeSingle();

  if (existingError) {
    throw new Error(`Failed to load existing statement: ${existingError.message}`);
  }

  let statement: PaymentStatementRow | null = null;

  if (existingStatement) {
    const { data, error } = await adminSupabase
      .from('payment_statements')
      .update(statementPayload)
      .eq('id', existingStatement.id)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to update payment statement: ${error.message}`);
    }

    statement = data as PaymentStatementRow;
  } else {
    const { data, error } = await adminSupabase
      .from('payment_statements')
      .insert(statementPayload)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create payment statement: ${error.message}`);
    }

    statement = data as PaymentStatementRow;
  }

  return {
    statement: {
      ...statement,
      total_amount: asNumber(statement.total_amount),
      total_amount_formatted: formatMoney(statement.total_amount),
      currency_code: DEFAULT_PAYMENT_CURRENCY_CODE,
      currency_symbol: DEFAULT_PAYMENT_CURRENCY_SYMBOL,
    },
    summary: {
      month_year: monthKey,
      obligation_total: obligationTotal,
      obligation_total_formatted: formatMoney(obligationTotal),
      paid_total: paidTotal,
      paid_total_formatted: formatMoney(paidTotal),
      closing_balance: closingBalance,
      closing_balance_formatted: formatMoney(closingBalance),
      items_count: itemsCount,
    },
  };
};

const mapLinkedSourceStatus = (status: string, sourceType: string) => {
  const config = SOURCE_STATUS_TABLE_MAP[sourceType];
  if (!config) {
    return null;
  }

  if (status === 'completed') {
    return { table: config.table, field: config.statusField, value: config.completed };
  }

  if (status === 'failed' || status === 'cancelled' || status === 'expired') {
    return { table: config.table, field: config.statusField, value: config.failed };
  }

  return { table: config.table, field: config.statusField, value: config.processing };
};

export const applyPaymentOutcomeSideEffects = async ({
  paymentId,
  status,
}: {
  paymentId: string;
  status: string;
}) => {
  const { data, error } = await adminSupabase
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to reload payment for settlement side effects: ${error.message}`);
  }

  const payment = data as PaymentRow | null;
  if (!payment) {
    return null;
  }

  const normalizedStatus = String(status || payment.status || '').toLowerCase();
  if (!normalizedStatus) {
    return payment;
  }

  if (payment.obligation_id) {
    const obligationStatus =
      normalizedStatus === 'completed'
        ? 'paid'
        : normalizedStatus === 'failed' || normalizedStatus === 'cancelled' || normalizedStatus === 'expired'
          ? 'unpaid'
          : null;

    if (obligationStatus) {
      const { error: obligationError } = await adminSupabase
        .from('payment_obligations')
        .update({
          status: obligationStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.obligation_id);

      if (obligationError) {
        throw new Error(`Failed to update linked obligation: ${obligationError.message}`);
      }
    }
  }

  const sourceType = String(payment.source_type || '').trim();
  const sourceId = payment.source_id;
  if (sourceType && sourceId) {
      const sourceUpdate = mapLinkedSourceStatus(normalizedStatus, sourceType);
      if (sourceUpdate) {
        const payload: Record<string, unknown> = {
          [sourceUpdate.field]: sourceUpdate.value,
        };
        if (sourceUpdate.touchUpdatedAt !== false) {
          payload.updated_at = new Date().toISOString();
        }
        const { error: sourceError } = await adminSupabase
          .from(sourceUpdate.table)
          .update(payload)
          .eq('id', sourceId);

      if (sourceError) {
        throw new Error(`Failed to update linked ${sourceType}: ${sourceError.message}`);
      }
    }
  }

  await syncPaymentToPayoutLedger(payment.id);

  return payment;
};

export const listAdminPaymentTransactions = async ({
  status,
  sourceType,
  unitId,
}: {
  status?: string;
  sourceType?: string;
  unitId?: string;
}) => {
  let query = adminSupabase
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  if (sourceType) {
    query = query.eq('source_type', sourceType);
  }

  if (unitId) {
    query = query.eq('unit_id', unitId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to load payment transactions: ${error.message}`);
  }

  const rows = (data || []) as PaymentRow[];
  const unitIds = Array.from(new Set(rows.map((row) => row.unit_id).filter(Boolean) as string[]));
  const payerIds = Array.from(new Set(rows.map((row) => row.payer_id).filter(Boolean) as string[]));
  const unitMap = await fetchUnits(unitIds);
  const payerMap = await fetchProfiles(payerIds);
  const communityIds = Array.from(
    new Set(unitIds.map((id) => unitMap.get(id)?.community_id).filter(Boolean) as string[])
  );
  const communityMap = await fetchCommunities(communityIds);

  return rows.map((row) => {
    const unit = row.unit_id ? unitMap.get(row.unit_id) : undefined;
    const community = unit?.community_id ? communityMap.get(unit.community_id) : undefined;
    return serializeTransaction({
      row,
      unit,
      community,
      payerProfile: row.payer_id ? payerMap.get(row.payer_id) || null : null,
    });
  });
};

export const getAdminPaymentTransaction = async (id: string) => {
  const { data, error } = await adminSupabase
    .from('payments')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load payment transaction: ${error.message}`);
  }

  const row = data as PaymentRow | null;
  if (!row) {
    return null;
  }

  const unitMap = await fetchUnits([row.unit_id].filter(Boolean) as string[]);
  const unit = row.unit_id ? unitMap.get(row.unit_id) : undefined;
  const payerMap = await fetchProfiles([row.payer_id].filter(Boolean) as string[]);
  const communityMap = await fetchCommunities([unit?.community_id].filter(Boolean) as string[]);
  const community = unit?.community_id ? communityMap.get(unit.community_id) : undefined;

  return serializeTransaction({
    row,
    unit,
    community,
    payerProfile: row.payer_id ? payerMap.get(row.payer_id) || null : null,
  });
};

export const listAdminPaymentObligations = async ({
  status,
  unitId,
}: {
  status?: string;
  unitId?: string;
}) => {
  let query = adminSupabase
    .from('payment_obligations')
    .select('*')
    .order('due_date', { ascending: true, nullsFirst: false });

  if (status) {
    query = query.eq('status', status);
  }

  if (unitId) {
    query = query.eq('unit_id', unitId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to load payment obligations: ${error.message}`);
  }

  const rows = (data || []) as PaymentObligationRow[];
  const unitIds = Array.from(new Set(rows.map((row) => row.unit_id)));
  const communityIds = Array.from(new Set(rows.map((row) => row.community_id)));
  const unitMap = await fetchUnits(unitIds);
  const communityMap = await fetchCommunities(communityIds);

  return rows.map((row) => serializeObligation(row, unitMap.get(row.unit_id), communityMap.get(row.community_id)));
};

export const listAdminPaymentStatements = async ({ unitId }: { unitId?: string }) => {
  let query = adminSupabase
    .from('payment_statements')
    .select('*')
    .order('month_year', { ascending: false });

  if (unitId) {
    query = query.eq('unit_id', unitId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to load payment statements: ${error.message}`);
  }

  const rows = (data || []) as PaymentStatementRow[];
  const unitIds = Array.from(new Set(rows.map((row) => row.unit_id)));
  const unitMap = await fetchUnits(unitIds);

  return rows.map((row) => ({
    ...row,
    total_amount: asNumber(row.total_amount),
    total_amount_formatted: formatMoney(row.total_amount),
    currency_code: DEFAULT_PAYMENT_CURRENCY_CODE,
    currency_symbol: DEFAULT_PAYMENT_CURRENCY_SYMBOL,
    unit: row.unit_id
      ? {
          id: row.unit_id,
          number: unitMap.get(row.unit_id)?.number || unitMap.get(row.unit_id)?.unit_number || null,
          block: unitMap.get(row.unit_id)?.block || null,
        }
      : null,
  }));
};

export const DEFAULT_PAYMENT_DISPLAY = {
  currencyCode: DEFAULT_PAYMENT_CURRENCY_CODE,
  currencySymbol: DEFAULT_PAYMENT_CURRENCY_SYMBOL,
};
