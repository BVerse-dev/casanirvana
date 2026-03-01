import { adminSupabase } from '../lib/supabase';

type JsonRecord = Record<string, unknown>;
type AnyRecord = Record<string, any>;
type ActorProfile = {
  id?: string | null;
  user_id?: string | null;
  role?: string | null;
  email?: string | null;
  phone?: string | null;
  community_id?: string | null;
};

type PayoutScopeInput = {
  userProfile?: ActorProfile | null;
  actorUserId?: string | null;
  agencyId?: string | null;
  communityId?: string | null;
};

type ResolvedPayoutScope = {
  roleScope: 'platform' | 'agency' | 'community';
  actorRole: string;
  agencyId: string | null;
  communityId: string | null;
  allowedAgencyIds: string[];
  allowedCommunityIds: string[];
};

type PayoutRuleMode = 'fixed' | 'percentage' | 'remainder';
type PayoutRule = {
  id: string;
  agency_id: string | null;
  community_id: string | null;
  effective_from: string | null;
  community_share_mode: 'fixed' | 'percentage';
  community_share_value: number | string | null;
  agency_share_mode: PayoutRuleMode;
  agency_share_value: number | string | null;
  platform_fee_mode: 'fixed' | 'percentage';
  platform_fee_value: number | string | null;
  is_active: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type PayoutDestination = {
  id: string;
  agency_id: string;
  community_id: string | null;
  destination_type: 'bank_account' | 'mobile_money';
  label: string;
  account_name: string | null;
  account_number_masked: string | null;
  bank_name: string | null;
  bank_code: string | null;
  mobile_network: string | null;
  mobile_number_masked: string | null;
  currency_code: string | null;
  is_default: boolean | null;
  is_verified: boolean | null;
  status: 'active' | 'inactive' | 'disabled' | null;
  metadata: JsonRecord | null;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type PayoutRequest = {
  id: string;
  agency_id: string;
  community_id: string | null;
  destination_id: string;
  requested_amount: number | string;
  currency_code: string | null;
  status: 'pending_review' | 'approved' | 'processing' | 'paid' | 'rejected' | 'cancelled' | 'failed';
  requested_by: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  processed_at: string | null;
  reference_number: string | null;
  notes: string | null;
  failure_reason: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type PaymentRow = {
  id: string;
  title: string | null;
  amount: number | string | null;
  unit_id: string | null;
  status: string | null;
  source_type: string | null;
  source_id: string | null;
  obligation_id: string | null;
  payment_gateway: string | null;
  payment_type: string | null;
  transaction_id: string | null;
  reference_number: string | null;
  currency_code: string | null;
  currency_symbol: string | null;
  revenue_hub: string | null;
  distribution_class: string | null;
  gross_amount: number | string | null;
  platform_fee_amount: number | string | null;
  agency_share_amount: number | string | null;
  community_share_amount: number | string | null;
  payout_eligible_amount: number | string | null;
  payout_eligible_at: string | null;
  payout_status: string | null;
  payout_batch_id: string | null;
  payout_reserved_amount: number | string | null;
  payout_paid_out_amount: number | string | null;
  provider_checked_at?: string | null;
  completed_at?: string | null;
  paid_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type UnitRow = {
  id: string;
  number: string | null;
  unit_number: string | null;
  block: string | null;
  community_id: string | null;
};

type CommunityRow = {
  id: string;
  name: string | null;
  agency_id: string | null;
};

type AgencyRow = {
  id: string;
  name: string | null;
};

const db = adminSupabase as any;
const DEFAULT_CURRENCY_CODE = (process.env.DEFAULT_PAYMENT_CURRENCY || 'GHS').trim().toUpperCase() || 'GHS';
const DEFAULT_CURRENCY_SYMBOL =
  process.env.DEFAULT_PAYMENT_CURRENCY_SYMBOL?.trim() ||
  (DEFAULT_CURRENCY_CODE === 'GHS' ? 'GH₵' : DEFAULT_CURRENCY_CODE);
const PERSONAL_HUB_SOURCE_TYPES = new Set([
  'airtime_purchase',
  'data_purchase',
  'money_transfer',
  'bill_payment',
  'insurance_payment',
  'shopping_order',
]);
const COMMUNITY_DISTRIBUTABLE_SOURCE_TYPES = new Set(['payment_obligation']);
const RESERVED_REQUEST_STATUSES = new Set(['pending_review', 'approved', 'processing']);

const asNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toOptionalString = (value: unknown) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const clampMoney = (value: number) => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Number(value.toFixed(2)));
};

const formatMoney = (amount: number, currencyCode = DEFAULT_CURRENCY_CODE, currencySymbol = DEFAULT_CURRENCY_SYMBOL) => ({
  amount,
  currency_code: currencyCode,
  currency_symbol: currencySymbol,
  amount_formatted: `${currencySymbol} ${clampMoney(amount).toFixed(2)}`,
});

const maskNumber = (value?: string | null) => {
  const digits = String(value || '').replace(/\s+/g, '');
  if (!digits) return null;
  if (digits.length <= 4) return digits;
  return `${'*'.repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}`;
};

const unique = <T>(items: T[]) => [...new Set(items)];

const normalizeCommunityIds = async (communityIds: string[]) => {
  const ids = unique(communityIds.filter(Boolean));
  if (!ids.length) return new Map<string, CommunityRow>();
  const { data, error } = await db.from('communities').select('id, name, agency_id').in('id', ids);
  if (error) {
    throw new Error(`Failed to load communities: ${error.message}`);
  }
  return new Map<string, CommunityRow>((data || []).map((row: CommunityRow) => [row.id, row]));
};

const normalizeAgencyIds = async (agencyIds: string[]) => {
  const ids = unique(agencyIds.filter(Boolean));
  if (!ids.length) return new Map<string, AgencyRow>();
  const { data, error } = await db.from('agencies').select('id, name').in('id', ids);
  if (error) {
    throw new Error(`Failed to load agencies: ${error.message}`);
  }
  return new Map<string, AgencyRow>((data || []).map((row: AgencyRow) => [row.id, row]));
};

const normalizeUnitIds = async (unitIds: string[]) => {
  const ids = unique(unitIds.filter(Boolean));
  if (!ids.length) return new Map<string, UnitRow>();
  const { data, error } = await db.from('units').select('id, number, unit_number, block, community_id').in('id', ids);
  if (error) {
    throw new Error(`Failed to load units: ${error.message}`);
  }
  return new Map<string, UnitRow>((data || []).map((row: UnitRow) => [row.id, row]));
};

const loadAssignedCommunityIds = async (profile: ActorProfile, actorUserId?: string | null) => {
  const communityIds = new Set<string>();
  if (profile.community_id) {
    communityIds.add(profile.community_id);
  }

  const adminLookupIds = unique([toOptionalString(profile.id), toOptionalString(actorUserId)].filter(Boolean) as string[]);
  if (adminLookupIds.length > 0) {
    const { data, error } = await db
      .from('community_admins')
      .select('community_id')
      .in('user_id', adminLookupIds);

    if (error) {
      throw new Error(`Failed to resolve assigned communities: ${error.message}`);
    }

    for (const row of data || []) {
      const id = toOptionalString((row as AnyRecord).community_id);
      if (id) communityIds.add(id);
    }
  }

  return [...communityIds];
};

const loadAssignedAgencyIds = async (profile: ActorProfile, actorUserId?: string | null, communityMap?: Map<string, CommunityRow>) => {
  const agencyIds = new Set<string>();

  for (const community of communityMap?.values() || []) {
    if (community.agency_id) {
      agencyIds.add(community.agency_id);
    }
  }

  if (agencyIds.size > 0) {
    return [...agencyIds];
  }

  const email = toOptionalString(profile.email);
  const phone = toOptionalString(profile.phone);
  if (!email && !phone) {
    return [];
  }

  let query = db.from('agency_staff').select('agency_id');
  if (email) {
    query = query.eq('email', email);
  } else if (phone) {
    query = query.eq('phone', phone);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to resolve assigned agencies: ${error.message}`);
  }

  for (const row of data || []) {
    const agencyId = toOptionalString((row as AnyRecord).agency_id);
    if (agencyId) agencyIds.add(agencyId);
  }

  return [...agencyIds];
};

const resolvePayoutScope = async ({
  userProfile,
  actorUserId,
  agencyId,
  communityId,
}: PayoutScopeInput): Promise<ResolvedPayoutScope> => {
  const profile = (userProfile || {}) as ActorProfile;
  const actorRole = String(profile.role || '').trim() || 'user';
  const requestedAgencyId = toOptionalString(agencyId);
  const requestedCommunityId = toOptionalString(communityId);

  if (actorRole === 'superadmin') {
    let scopedCommunityId = requestedCommunityId;
    let scopedAgencyId = requestedAgencyId;

    if (scopedCommunityId && !scopedAgencyId) {
      const community = (await normalizeCommunityIds([scopedCommunityId])).get(scopedCommunityId) || null;
      scopedAgencyId = community?.agency_id || null;
    }

    if (!scopedAgencyId) {
      const { data: agencies, error } = await db.from('agencies').select('id').limit(2);
      if (error) {
        throw new Error(`Failed to resolve payout scope: ${error.message}`);
      }
      if ((agencies || []).length === 1) {
        scopedAgencyId = toOptionalString((agencies[0] as AnyRecord).id);
      }
    }

    return {
      roleScope: 'platform',
      actorRole,
      agencyId: scopedAgencyId,
      communityId: scopedCommunityId,
      allowedAgencyIds: [],
      allowedCommunityIds: [],
    };
  }

  const assignedCommunityIds = await loadAssignedCommunityIds(profile, actorUserId);
  const communityMap = await normalizeCommunityIds(assignedCommunityIds);
  const assignedAgencyIds = await loadAssignedAgencyIds(profile, actorUserId, communityMap);

  if (actorRole === 'agency_manager') {
    const scopedAgencyId = requestedAgencyId || assignedAgencyIds[0] || null;
    if (!scopedAgencyId) {
      throw new Error('Your account is missing an agency assignment.');
    }
    if (requestedAgencyId && !assignedAgencyIds.includes(requestedAgencyId)) {
      throw new Error('You can only access payouts for your assigned agency.');
    }

    if (requestedCommunityId) {
      const requestedCommunity = (await normalizeCommunityIds([requestedCommunityId])).get(requestedCommunityId);
      if (!requestedCommunity || requestedCommunity.agency_id !== scopedAgencyId) {
        throw new Error('The selected community does not belong to your assigned agency.');
      }
    }

    return {
      roleScope: 'agency',
      actorRole,
      agencyId: scopedAgencyId,
      communityId: requestedCommunityId,
      allowedAgencyIds: assignedAgencyIds,
      allowedCommunityIds: assignedCommunityIds,
    };
  }

  const scopedCommunityId = requestedCommunityId || assignedCommunityIds[0] || null;
  if (!scopedCommunityId) {
    throw new Error('Your account is missing a community assignment.');
  }
  if (requestedCommunityId && !assignedCommunityIds.includes(requestedCommunityId)) {
    throw new Error('You can only access payouts for your assigned community.');
  }

  const scopedCommunity = communityMap.get(scopedCommunityId) || (await normalizeCommunityIds([scopedCommunityId])).get(scopedCommunityId) || null;
  const scopedAgencyId = scopedCommunity?.agency_id || assignedAgencyIds[0] || null;

  return {
    roleScope: 'community',
    actorRole,
    agencyId: scopedAgencyId,
    communityId: scopedCommunityId,
    allowedAgencyIds: assignedAgencyIds,
    allowedCommunityIds: assignedCommunityIds,
  };
};

const resolveActiveRule = async (agencyId: string | null, communityId: string | null) => {
  if (communityId) {
    const { data } = await db
      .from('payout_rules')
      .select('*')
      .eq('community_id', communityId)
      .eq('is_active', true)
      .order('effective_from', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) {
      return data as PayoutRule;
    }
  }

  if (agencyId) {
    const { data } = await db
      .from('payout_rules')
      .select('*')
      .eq('agency_id', agencyId)
      .is('community_id', null)
      .eq('is_active', true)
      .order('effective_from', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) {
      return data as PayoutRule;
    }
  }

  return null;
};

const calculateShare = ({
  gross,
  mode,
  value,
}: {
  gross: number;
  mode: 'fixed' | 'percentage';
  value: number;
}) => {
  if (mode === 'percentage') {
    return clampMoney((gross * value) / 100);
  }
  return clampMoney(value);
};

const derivePaymentPayoutStatus = ({
  eligible,
  reserved,
  paid,
  distributable,
}: {
  eligible: number;
  reserved: number;
  paid: number;
  distributable: boolean;
}) => {
  if (!distributable || eligible <= 0) return 'released';
  if (paid >= eligible && eligible > 0) return 'paid_out';
  if (reserved > 0) return 'reserved';
  return 'available';
};

const getAvailableAmount = (payment: PaymentRow) => {
  const eligible = asNumber(payment.payout_eligible_amount);
  const reserved = asNumber(payment.payout_reserved_amount);
  const paid = asNumber(payment.payout_paid_out_amount);
  return clampMoney(eligible - reserved - paid);
};

const createPayoutEvent = async ({
  payoutRequestId,
  eventType,
  eventMessage,
  actorUserId,
  metadata,
}: {
  payoutRequestId: string;
  eventType: string;
  eventMessage: string;
  actorUserId?: string | null;
  metadata?: JsonRecord;
}) => {
  const { error } = await db.from('payout_request_events').insert({
    payout_request_id: payoutRequestId,
    event_type: eventType,
    event_message: eventMessage,
    actor_user_id: actorUserId || null,
    metadata: metadata || {},
  });

  if (error) {
    throw new Error(`Failed to create payout event: ${error.message}`);
  }
};

const listScopedCompletedPayments = async (scope: ResolvedPayoutScope) => {
  const { data, error } = await db
    .from('payments')
    .select(
      'id, title, amount, unit_id, status, source_type, source_id, obligation_id, payment_gateway, payment_type, transaction_id, reference_number, currency_code, currency_symbol, revenue_hub, distribution_class, gross_amount, platform_fee_amount, agency_share_amount, community_share_amount, payout_eligible_amount, payout_eligible_at, payout_status, payout_batch_id, payout_reserved_amount, payout_paid_out_amount, provider_checked_at, completed_at, paid_at, created_at, updated_at'
    )
    .eq('status', 'completed')
    .eq('revenue_hub', 'community')
    .eq('distribution_class', 'distributable')
    .order('payout_eligible_at', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to load payout-eligible payments: ${error.message}`);
  }

  const payments = (data || []) as PaymentRow[];
  const unitMap = await normalizeUnitIds(payments.map((payment) => payment.unit_id || ''));
  const communityMap = await normalizeCommunityIds(
    payments
      .map((payment) => (payment.unit_id ? unitMap.get(payment.unit_id)?.community_id || '' : ''))
      .filter(Boolean)
  );
  const agencyMap = await normalizeAgencyIds(
    payments
      .map((payment) => {
        const communityId = payment.unit_id ? unitMap.get(payment.unit_id)?.community_id || '' : '';
        return communityId ? communityMap.get(communityId)?.agency_id || '' : '';
      })
      .filter(Boolean)
  );

  const items = payments
    .map((payment) => {
      const unit = payment.unit_id ? unitMap.get(payment.unit_id) || null : null;
      const community = unit?.community_id ? communityMap.get(unit.community_id) || null : null;
      const agency = community?.agency_id ? agencyMap.get(community.agency_id) || null : null;
      return {
        payment,
        unit,
        community,
        agency,
      };
    })
    .filter((item) => {
      if (!item.community?.id) return false;
      if (scope.roleScope === 'platform') {
        if (scope.communityId && item.community.id !== scope.communityId) return false;
        if (scope.agencyId && item.agency?.id !== scope.agencyId) return false;
        return true;
      }

      if (scope.roleScope === 'agency') {
        if (item.agency?.id !== scope.agencyId) return false;
        if (scope.communityId && item.community.id !== scope.communityId) return false;
        return true;
      }

      return item.community.id === scope.communityId;
    });

  return items;
};

const computeScopeSummary = async (scope: ResolvedPayoutScope) => {
  const payments = await listScopedCompletedPayments(scope);

  let available = 0;
  let reserved = 0;
  let paidOut = 0;
  let eligibleRevenue = 0;

  for (const item of payments) {
    const eligible = asNumber(item.payment.payout_eligible_amount);
    const reservedAmount = asNumber(item.payment.payout_reserved_amount);
    const paidAmount = asNumber(item.payment.payout_paid_out_amount);
    available += clampMoney(eligible - reservedAmount - paidAmount);
    reserved += clampMoney(reservedAmount);
    paidOut += clampMoney(paidAmount);
    eligibleRevenue += clampMoney(eligible);
  }

  const requestQuery = db
    .from('payout_requests')
    .select('id, status, requested_amount, agency_id, community_id');

  const { data: requestRows, error: requestError } = await requestQuery;
  if (requestError) {
    throw new Error(`Failed to load payout requests: ${requestError.message}`);
  }

  const scopedRequests = (requestRows || []).filter((row: AnyRecord) => {
    const rowAgencyId = toOptionalString(row.agency_id);
    const rowCommunityId = toOptionalString(row.community_id);
    if (scope.roleScope === 'platform') {
      if (scope.communityId && rowCommunityId !== scope.communityId) return false;
      if (scope.agencyId && rowAgencyId !== scope.agencyId) return false;
      return true;
    }
    if (scope.roleScope === 'agency') {
      if (rowAgencyId !== scope.agencyId) return false;
      if (scope.communityId && rowCommunityId !== scope.communityId) return false;
      return true;
    }
    return rowCommunityId === scope.communityId;
  });

  const pendingRequests = scopedRequests.filter((row: AnyRecord) => RESERVED_REQUEST_STATUSES.has(String(row.status || ''))).length;

  const { data: destinationRows, error: destinationError } = await db
    .from('payout_destinations')
    .select('id, agency_id, community_id, status');
  if (destinationError) {
    throw new Error(`Failed to load payout destinations: ${destinationError.message}`);
  }

  const scopedDestinations = (destinationRows || []).filter((row: AnyRecord) => {
    const rowAgencyId = toOptionalString(row.agency_id);
    const rowCommunityId = toOptionalString(row.community_id);
    if (scope.roleScope === 'platform') {
      if (scope.communityId && rowCommunityId !== scope.communityId) return false;
      if (scope.agencyId && rowAgencyId !== scope.agencyId) return false;
      return true;
    }
    if (scope.roleScope === 'agency') {
      if (rowAgencyId !== scope.agencyId) return false;
      if (scope.communityId && rowCommunityId && rowCommunityId !== scope.communityId) return false;
      return true;
    }
    return rowCommunityId === scope.communityId || (!rowCommunityId && rowAgencyId === scope.agencyId);
  });

  const { data: ruleRows, error: ruleError } = await db
    .from('payout_rules')
    .select('id, agency_id, community_id, is_active');
  if (ruleError) {
    throw new Error(`Failed to load payout rules: ${ruleError.message}`);
  }

  const scopedRules = (ruleRows || []).filter((row: AnyRecord) => {
    const rowAgencyId = toOptionalString(row.agency_id);
    const rowCommunityId = toOptionalString(row.community_id);
    if (scope.roleScope === 'platform') {
      if (scope.communityId && rowCommunityId !== scope.communityId) return false;
      if (scope.agencyId && rowAgencyId !== scope.agencyId) return false;
      return true;
    }
    if (scope.roleScope === 'agency') {
      if (rowAgencyId !== scope.agencyId) return false;
      if (scope.communityId && rowCommunityId && rowCommunityId !== scope.communityId) return false;
      return true;
    }
    return rowCommunityId === scope.communityId || (!rowCommunityId && rowAgencyId === scope.agencyId);
  });

  return {
    balances: {
      ...formatMoney(available),
      available_amount: clampMoney(available),
      reserved_amount: clampMoney(reserved),
      paid_out_amount: clampMoney(paidOut),
      eligible_revenue_amount: clampMoney(eligibleRevenue),
    },
    counts: {
      pending_requests: pendingRequests,
      contributing_communities: unique(payments.map((item) => item.community?.id).filter(Boolean) as string[]).length,
      available_transactions: payments.filter((item) => getAvailableAmount(item.payment) > 0).length,
      destinations: scopedDestinations.length,
      rules: scopedRules.length,
    },
  };
};

const createLedgerEntry = async ({
  agencyId,
  communityId,
  paymentId,
  payoutRequestId,
  entryType,
  amount,
  description,
  createdBy,
  metadata,
  runningBalanceAfter,
}: {
  agencyId: string;
  communityId?: string | null;
  paymentId?: string | null;
  payoutRequestId?: string | null;
  entryType: 'credit_available' | 'reserve_for_request' | 'release_reserve' | 'payout_completed' | 'payout_reversed' | 'manual_adjustment';
  amount: number;
  description: string;
  createdBy?: string | null;
  metadata?: JsonRecord;
  runningBalanceAfter?: number;
}) => {
  const { error } = await db.from('payout_ledger_entries').insert({
    agency_id: agencyId,
    community_id: communityId || null,
    payment_id: paymentId || null,
    payout_request_id: payoutRequestId || null,
    entry_type: entryType,
    amount: clampMoney(amount),
    currency_code: DEFAULT_CURRENCY_CODE,
    running_balance_after: clampMoney(runningBalanceAfter ?? 0),
    description,
    metadata: metadata || {},
    created_by: createdBy || null,
  });

  if (error) {
    if (entryType === 'credit_available' && String(error.message || '').includes('payout_ledger_credit_payment_uniq')) {
      return;
    }
    throw new Error(`Failed to write payout ledger entry: ${error.message}`);
  }
};

export const syncPaymentToPayoutLedger = async (paymentId: string) => {
  const { data, error } = await db
    .from('payments')
    .select(
      'id, title, amount, unit_id, status, source_type, source_id, obligation_id, payment_gateway, payment_type, transaction_id, reference_number, currency_code, currency_symbol, revenue_hub, distribution_class, gross_amount, platform_fee_amount, agency_share_amount, community_share_amount, payout_eligible_amount, payout_eligible_at, payout_status, payout_batch_id, payout_reserved_amount, payout_paid_out_amount, provider_checked_at, completed_at, paid_at, created_at, updated_at'
    )
    .eq('id', paymentId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load payment for payout sync: ${error.message}`);
  }

  const payment = data as PaymentRow | null;
  if (!payment) return null;

  const unitId = toOptionalString(payment.unit_id);
  const unitMap = await normalizeUnitIds([unitId || '']);
  const unit = unitId ? unitMap.get(unitId) || null : null;
  const communityId = unit?.community_id || null;
  const communityMap = await normalizeCommunityIds([communityId || '']);
  const community = communityId ? communityMap.get(communityId) || null : null;
  const agencyId = community?.agency_id || null;

  const normalizedStatus = String(payment.status || '').toLowerCase();
  const sourceType = toOptionalString(payment.source_type) || (payment.obligation_id ? 'payment_obligation' : 'manual');
  const grossAmount = clampMoney(asNumber(payment.amount || payment.gross_amount));
  const reservedAmount = clampMoney(asNumber(payment.payout_reserved_amount));
  const paidAmount = clampMoney(asNumber(payment.payout_paid_out_amount));

  let revenueHub: 'community' | 'personal' = 'community';
  let distributionClass: 'distributable' | 'non_distributable' = 'non_distributable';

  if (PERSONAL_HUB_SOURCE_TYPES.has(sourceType)) {
    revenueHub = 'personal';
    distributionClass = 'non_distributable';
  } else if (COMMUNITY_DISTRIBUTABLE_SOURCE_TYPES.has(sourceType) || payment.obligation_id) {
    revenueHub = 'community';
    distributionClass = 'distributable';
  }

  let platformFeeAmount = 0;
  let communityShareAmount = 0;
  let agencyShareAmount = 0;
  let payoutEligibleAmount = 0;

  if (normalizedStatus === 'completed' && distributionClass === 'distributable') {
    const activeRule = await resolveActiveRule(agencyId, communityId);
    if (activeRule) {
      platformFeeAmount = calculateShare({
        gross: grossAmount,
        mode: activeRule.platform_fee_mode,
        value: asNumber(activeRule.platform_fee_value),
      });
      communityShareAmount = calculateShare({
        gross: grossAmount,
        mode: activeRule.community_share_mode,
        value: asNumber(activeRule.community_share_value),
      });

      if (activeRule.agency_share_mode === 'remainder') {
        agencyShareAmount = clampMoney(grossAmount - platformFeeAmount - communityShareAmount);
      } else if (activeRule.agency_share_mode === 'percentage') {
        agencyShareAmount = calculateShare({
          gross: grossAmount,
          mode: 'percentage',
          value: asNumber(activeRule.agency_share_value),
        });
      } else {
        agencyShareAmount = calculateShare({
          gross: grossAmount,
          mode: 'fixed',
          value: asNumber(activeRule.agency_share_value),
        });
      }
    } else {
      agencyShareAmount = grossAmount;
    }
    payoutEligibleAmount = agencyShareAmount;
  }

  const nextPayoutStatus =
    normalizedStatus === 'completed'
      ? derivePaymentPayoutStatus({
          eligible: payoutEligibleAmount,
          reserved: reservedAmount,
          paid: paidAmount,
          distributable: distributionClass === 'distributable',
        })
      : distributionClass === 'distributable'
        ? 'unallocated'
        : 'released';

  const payoutEligibleAt =
    normalizedStatus === 'completed'
      ? payment.payout_eligible_at || payment.provider_checked_at || payment.completed_at || payment.paid_at || payment.updated_at || payment.created_at || new Date().toISOString()
      : null;

  const { error: updateError } = await db
    .from('payments')
    .update({
      revenue_hub: revenueHub,
      distribution_class: distributionClass,
      gross_amount: grossAmount,
      platform_fee_amount: platformFeeAmount,
      community_share_amount: communityShareAmount,
      agency_share_amount: agencyShareAmount,
      payout_eligible_amount: payoutEligibleAmount,
      payout_eligible_at: payoutEligibleAt,
      payout_status: nextPayoutStatus,
      payout_reserved_amount: reservedAmount,
      payout_paid_out_amount: paidAmount,
    })
    .eq('id', payment.id);

  if (updateError) {
    throw new Error(`Failed to update payment payout classification: ${updateError.message}`);
  }

  if (normalizedStatus === 'completed' && payoutEligibleAmount > 0 && agencyId) {
    const scope = await resolvePayoutScope({
      userProfile: { role: 'superadmin' },
      agencyId,
      communityId,
    });
    const summary = await computeScopeSummary(scope);
    await createLedgerEntry({
      agencyId,
      communityId,
      paymentId: payment.id,
      entryType: 'credit_available',
      amount: payoutEligibleAmount,
      description: 'Community Hub settlement credited to agency payout balance.',
      metadata: {
        source_type: sourceType,
        title: payment.title || null,
      },
      runningBalanceAfter: summary.balances.available_amount,
    });
  }

  return {
    payment_id: payment.id,
    revenue_hub: revenueHub,
    distribution_class: distributionClass,
    payout_status: nextPayoutStatus,
    payout_eligible_amount: payoutEligibleAmount,
  };
};

export const getAdminPayoutSummary = async (input: PayoutScopeInput) => {
  const scope = await resolvePayoutScope(input);
  const summary = await computeScopeSummary(scope);

  return {
    scope: {
      role_scope: scope.roleScope,
      agency_id: scope.agencyId,
      community_id: scope.communityId,
    },
    ...summary,
  };
};

export const listAdminPayoutTransactions = async (input: PayoutScopeInput) => {
  const scope = await resolvePayoutScope(input);
  const rows = await listScopedCompletedPayments(scope);

  return rows.map((item) => {
    const eligibleAmount = clampMoney(asNumber(item.payment.payout_eligible_amount));
    const reservedAmount = clampMoney(asNumber(item.payment.payout_reserved_amount));
    const paidAmount = clampMoney(asNumber(item.payment.payout_paid_out_amount));
    const availableAmount = clampMoney(eligibleAmount - reservedAmount - paidAmount);

    return {
      id: item.payment.id,
      title: item.payment.title || item.payment.payment_type || 'Community Hub Payment',
      source_type: item.payment.source_type || 'manual',
      payment_gateway: item.payment.payment_gateway,
      reference_number: item.payment.reference_number,
      transaction_id: item.payment.transaction_id,
      settled_at:
        item.payment.payout_eligible_at ||
        item.payment.provider_checked_at ||
        item.payment.completed_at ||
        item.payment.paid_at ||
        item.payment.updated_at ||
        item.payment.created_at,
      payout_status: item.payment.payout_status || 'unallocated',
      community: item.community,
      agency: item.agency,
      unit: item.unit
        ? {
            id: item.unit.id,
            block: item.unit.block,
            unit_number: item.unit.unit_number || item.unit.number,
          }
        : null,
      gross: formatMoney(clampMoney(asNumber(item.payment.gross_amount || item.payment.amount))),
      platform_fee: formatMoney(clampMoney(asNumber(item.payment.platform_fee_amount))),
      community_share: formatMoney(clampMoney(asNumber(item.payment.community_share_amount))),
      agency_share: formatMoney(clampMoney(asNumber(item.payment.agency_share_amount))),
      payout_eligible: formatMoney(eligibleAmount),
      payout_reserved: formatMoney(reservedAmount),
      payout_paid_out: formatMoney(paidAmount),
      payout_available: formatMoney(availableAmount),
    };
  });
};

export const listAdminPayoutDestinations = async (input: PayoutScopeInput) => {
  const scope = await resolvePayoutScope(input);
  const { data, error } = await db
    .from('payout_destinations')
    .select('*')
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to load payout destinations: ${error.message}`);
  }

  const rows = (data || []) as PayoutDestination[];
  const scopedRows = rows.filter((row) => {
    if (scope.roleScope === 'platform') {
      if (scope.communityId && row.community_id !== scope.communityId) return false;
      if (scope.agencyId && row.agency_id !== scope.agencyId) return false;
      return true;
    }
    if (scope.roleScope === 'agency') {
      if (row.agency_id !== scope.agencyId) return false;
      if (scope.communityId && row.community_id && row.community_id !== scope.communityId) return false;
      return true;
    }
    return row.community_id === scope.communityId || (!row.community_id && row.agency_id === scope.agencyId);
  });

  const communityMap = await normalizeCommunityIds(scopedRows.map((row) => row.community_id || '').filter(Boolean));
  const agencyMap = await normalizeAgencyIds(scopedRows.map((row) => row.agency_id));

  return scopedRows.map((row) => ({
    ...row,
    agency: agencyMap.get(row.agency_id) || null,
    community: row.community_id ? communityMap.get(row.community_id) || null : null,
  }));
};

export const createAdminPayoutDestination = async (
  input: {
    agency_id?: string | null;
    community_id?: string | null;
    destination_type: 'bank_account' | 'mobile_money';
    label: string;
    account_name?: string | null;
    account_number?: string | null;
    bank_name?: string | null;
    bank_code?: string | null;
    mobile_network?: string | null;
    mobile_number?: string | null;
    currency_code?: string | null;
    is_default?: boolean;
    is_verified?: boolean;
    status?: 'active' | 'inactive' | 'disabled';
    metadata?: JsonRecord | null;
  },
  context: PayoutScopeInput
) => {
  const scope = await resolvePayoutScope({
    ...context,
    agencyId: input.agency_id || context.agencyId,
    communityId: input.community_id || context.communityId,
  });

  const agencyId = scope.agencyId;
  if (!agencyId) {
    throw new Error('A valid agency scope is required to create a payout destination.');
  }

  if (input.is_default) {
    await db
      .from('payout_destinations')
      .update({ is_default: false })
      .eq('agency_id', agencyId)
      .eq('status', 'active');
  }

  const insertPayload = {
    agency_id: agencyId,
    community_id: scope.roleScope === 'community' ? scope.communityId : toOptionalString(input.community_id),
    destination_type: input.destination_type,
    label: input.label.trim(),
    account_name: toOptionalString(input.account_name),
    account_number_masked:
      input.destination_type === 'bank_account'
        ? maskNumber(input.account_number)
        : null,
    bank_name: toOptionalString(input.bank_name),
    bank_code: toOptionalString(input.bank_code),
    mobile_network: input.destination_type === 'mobile_money' ? toOptionalString(input.mobile_network) : null,
    mobile_number_masked:
      input.destination_type === 'mobile_money'
        ? maskNumber(input.mobile_number)
        : null,
    currency_code: toOptionalString(input.currency_code) || DEFAULT_CURRENCY_CODE,
    is_default: Boolean(input.is_default),
    is_verified: input.is_verified ?? false,
    status: input.status || 'active',
    metadata: input.metadata || {},
    created_by: toOptionalString(context.actorUserId) || toOptionalString(context.userProfile?.id),
  };

  const { data, error } = await db.from('payout_destinations').insert(insertPayload).select('*').maybeSingle();
  if (error) {
    throw new Error(`Failed to create payout destination: ${error.message}`);
  }

  return data as PayoutDestination;
};

export const updateAdminPayoutDestination = async (
  id: string,
  input: Partial<{
    label: string;
    account_name: string | null;
    account_number: string | null;
    bank_name: string | null;
    bank_code: string | null;
    mobile_network: string | null;
    mobile_number: string | null;
    is_default: boolean;
    is_verified: boolean;
    status: 'active' | 'inactive' | 'disabled';
    metadata: JsonRecord | null;
  }>,
  context: PayoutScopeInput
) => {
  const destinations = await listAdminPayoutDestinations(context);
  const existing = destinations.find((row) => row.id === id);
  if (!existing) {
    throw new Error('Payout destination not found.');
  }

  if (input.is_default) {
    await db
      .from('payout_destinations')
      .update({ is_default: false })
      .eq('agency_id', existing.agency_id)
      .eq('status', 'active');
  }

  const payload: AnyRecord = {};
  if (input.label !== undefined) payload.label = input.label.trim();
  if (input.account_name !== undefined) payload.account_name = toOptionalString(input.account_name);
  if (input.account_number !== undefined) payload.account_number_masked = maskNumber(input.account_number);
  if (input.bank_name !== undefined) payload.bank_name = toOptionalString(input.bank_name);
  if (input.bank_code !== undefined) payload.bank_code = toOptionalString(input.bank_code);
  if (input.mobile_network !== undefined) payload.mobile_network = toOptionalString(input.mobile_network);
  if (input.mobile_number !== undefined) payload.mobile_number_masked = maskNumber(input.mobile_number);
  if (input.is_default !== undefined) payload.is_default = input.is_default;
  if (input.is_verified !== undefined) payload.is_verified = input.is_verified;
  if (input.status !== undefined) payload.status = input.status;
  if (input.metadata !== undefined) payload.metadata = input.metadata || {};

  const { data, error } = await db.from('payout_destinations').update(payload).eq('id', id).select('*').maybeSingle();
  if (error) {
    throw new Error(`Failed to update payout destination: ${error.message}`);
  }
  return data as PayoutDestination;
};

export const listAdminPayoutRules = async (input: PayoutScopeInput) => {
  const scope = await resolvePayoutScope(input);
  const { data, error } = await db
    .from('payout_rules')
    .select('*')
    .order('effective_from', { ascending: false });

  if (error) {
    throw new Error(`Failed to load payout rules: ${error.message}`);
  }

  const rows = (data || []) as PayoutRule[];
  const scopedRows = rows.filter((row) => {
    if (scope.roleScope === 'platform') {
      if (scope.communityId && row.community_id !== scope.communityId) return false;
      if (scope.agencyId && row.agency_id !== scope.agencyId) return false;
      return true;
    }
    if (scope.roleScope === 'agency') {
      if (row.agency_id !== scope.agencyId) return false;
      if (scope.communityId && row.community_id && row.community_id !== scope.communityId) return false;
      return true;
    }
    return row.community_id === scope.communityId || (!row.community_id && row.agency_id === scope.agencyId);
  });

  const communityMap = await normalizeCommunityIds(scopedRows.map((row) => row.community_id || '').filter(Boolean));
  const agencyMap = await normalizeAgencyIds(scopedRows.map((row) => row.agency_id || '').filter(Boolean));

  return scopedRows.map((row) => ({
    ...row,
    agency: row.agency_id ? agencyMap.get(row.agency_id) || null : null,
    community: row.community_id ? communityMap.get(row.community_id) || null : null,
  }));
};

export const upsertAdminPayoutRule = async (
  input: {
    id?: string | null;
    agency_id?: string | null;
    community_id?: string | null;
    effective_from?: string | null;
    community_share_mode: 'fixed' | 'percentage';
    community_share_value: number;
    agency_share_mode: 'remainder' | 'fixed' | 'percentage';
    agency_share_value?: number | null;
    platform_fee_mode: 'fixed' | 'percentage';
    platform_fee_value?: number | null;
    is_active?: boolean;
  },
  context: PayoutScopeInput
) => {
  const scope = await resolvePayoutScope({
    ...context,
    agencyId: input.agency_id || context.agencyId,
    communityId: input.community_id || context.communityId,
  });

  if (!scope.agencyId) {
    throw new Error('A valid agency scope is required to save payout rules.');
  }

  const communityId = scope.roleScope === 'community' ? scope.communityId : toOptionalString(input.community_id);
  const payload = {
    agency_id: scope.agencyId,
    community_id: communityId,
    effective_from: toOptionalString(input.effective_from) || new Date().toISOString(),
    community_share_mode: input.community_share_mode,
    community_share_value: clampMoney(asNumber(input.community_share_value)),
    agency_share_mode: input.agency_share_mode,
    agency_share_value: clampMoney(asNumber(input.agency_share_value)),
    platform_fee_mode: input.platform_fee_mode,
    platform_fee_value: clampMoney(asNumber(input.platform_fee_value)),
    is_active: input.is_active ?? true,
    created_by: toOptionalString(context.actorUserId) || toOptionalString(context.userProfile?.id),
  };

  if (payload.is_active) {
    let deactivateQuery = db
      .from('payout_rules')
      .update({ is_active: false })
      .eq('agency_id', scope.agencyId);

    deactivateQuery = communityId
      ? deactivateQuery.eq('community_id', communityId)
      : deactivateQuery.is('community_id', null);

    if (input.id) {
      deactivateQuery = deactivateQuery.neq('id', input.id);
    }

    const { error: deactivateError } = await deactivateQuery;
    if (deactivateError) {
      throw new Error(`Failed to update existing payout rules: ${deactivateError.message}`);
    }
  }

  if (input.id) {
    const { data, error } = await db.from('payout_rules').update(payload).eq('id', input.id).select('*').maybeSingle();
    if (error) {
      throw new Error(`Failed to update payout rule: ${error.message}`);
    }
    return data as PayoutRule;
  }

  const { data, error } = await db.from('payout_rules').insert(payload).select('*').maybeSingle();
  if (error) {
    throw new Error(`Failed to create payout rule: ${error.message}`);
  }
  return data as PayoutRule;
};

export const listAdminPayoutRequests = async (input: PayoutScopeInput) => {
  const scope = await resolvePayoutScope(input);
  const { data, error } = await db
    .from('payout_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to load payout requests: ${error.message}`);
  }

  const rows = (data || []) as PayoutRequest[];
  const scopedRows = rows.filter((row) => {
    if (scope.roleScope === 'platform') {
      if (scope.communityId && row.community_id !== scope.communityId) return false;
      if (scope.agencyId && row.agency_id !== scope.agencyId) return false;
      return true;
    }
    if (scope.roleScope === 'agency') {
      if (row.agency_id !== scope.agencyId) return false;
      if (scope.communityId && row.community_id && row.community_id !== scope.communityId) return false;
      return true;
    }
    return row.community_id === scope.communityId;
  });

  const destinationMap = new Map<string, AnyRecord>();
  const destinationIds = scopedRows.map((row) => row.destination_id).filter(Boolean);
  if (destinationIds.length) {
    const { data: destinations } = await db
      .from('payout_destinations')
      .select('id, label, destination_type, bank_name, mobile_network')
      .in('id', unique(destinationIds));
    for (const row of destinations || []) {
      destinationMap.set((row as AnyRecord).id, row);
    }
  }

  const communityMap = await normalizeCommunityIds(scopedRows.map((row) => row.community_id || '').filter(Boolean));
  const agencyMap = await normalizeAgencyIds(scopedRows.map((row) => row.agency_id));

  const itemCounts = new Map<string, number>();
  const requestIds = scopedRows.map((row) => row.id);
  if (requestIds.length) {
    const { data: requestItems } = await db
      .from('payout_request_items')
      .select('payout_request_id')
      .in('payout_request_id', requestIds);
    for (const row of requestItems || []) {
      const key = (row as AnyRecord).payout_request_id;
      itemCounts.set(key, (itemCounts.get(key) || 0) + 1);
    }
  }

  return scopedRows.map((row) => ({
    ...row,
    requested_amount_formatted: `${DEFAULT_CURRENCY_SYMBOL} ${clampMoney(asNumber(row.requested_amount)).toFixed(2)}`,
    agency: agencyMap.get(row.agency_id) || null,
    community: row.community_id ? communityMap.get(row.community_id) || null : null,
    destination: destinationMap.get(row.destination_id) || null,
    item_count: itemCounts.get(row.id) || 0,
  }));
};

const updatePaymentPayoutReservation = async ({
  paymentId,
  reserveDelta = 0,
  paidDelta = 0,
  batchId,
}: {
  paymentId: string;
  reserveDelta?: number;
  paidDelta?: number;
  batchId?: string | null;
}) => {
  const { data, error } = await db
    .from('payments')
    .select('id, payout_eligible_amount, payout_reserved_amount, payout_paid_out_amount, distribution_class')
    .eq('id', paymentId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load payment allocation state: ${error.message}`);
  }

  const payment = data as PaymentRow | null;
  if (!payment) {
    throw new Error('Linked payment could not be found.');
  }

  const eligible = clampMoney(asNumber(payment.payout_eligible_amount));
  const nextReserved = clampMoney(asNumber(payment.payout_reserved_amount) + reserveDelta);
  const nextPaid = clampMoney(asNumber(payment.payout_paid_out_amount) + paidDelta);
  if (nextReserved < -0.001 || nextPaid < -0.001 || nextReserved + nextPaid - eligible > 0.01) {
    throw new Error('Payout allocation would overrun the available payment balance.');
  }

  const nextStatus = derivePaymentPayoutStatus({
    eligible,
    reserved: nextReserved,
    paid: nextPaid,
    distributable: String(payment.distribution_class || '') === 'distributable',
  });

  const { error: updateError } = await db
    .from('payments')
    .update({
      payout_reserved_amount: nextReserved,
      payout_paid_out_amount: nextPaid,
      payout_status: nextStatus,
      payout_batch_id: nextReserved > 0 ? batchId || null : null,
    })
    .eq('id', paymentId);

  if (updateError) {
    throw new Error(`Failed to update payment payout reservation: ${updateError.message}`);
  }
};

export const createAdminPayoutRequest = async (
  input: {
    agency_id?: string | null;
    community_id?: string | null;
    destination_id: string;
    requested_amount: number;
    notes?: string | null;
  },
  context: PayoutScopeInput
) => {
  const scope = await resolvePayoutScope({
    ...context,
    agencyId: input.agency_id || context.agencyId,
    communityId: input.community_id || context.communityId,
  });

  if (!scope.agencyId) {
    throw new Error('A valid agency scope is required to create a payout request.');
  }

  const destinations = await listAdminPayoutDestinations({
    ...context,
    agencyId: scope.agencyId,
    communityId: scope.communityId,
  });
  const destination = destinations.find((row) => row.id === input.destination_id);
  if (!destination) {
    throw new Error('The selected payout destination is not available in this scope.');
  }
  if (destination.status !== 'active') {
    throw new Error('The selected payout destination is not active.');
  }

  const requestedAmount = clampMoney(asNumber(input.requested_amount));
  if (requestedAmount <= 0) {
    throw new Error('Requested amount must be greater than zero.');
  }

  const eligiblePayments = (await listScopedCompletedPayments(scope))
    .map((item) => ({
      ...item,
      available_amount: getAvailableAmount(item.payment),
    }))
    .filter((item) => item.available_amount > 0)
    .sort((a, b) => {
      const aTime = new Date(a.payment.payout_eligible_at || a.payment.created_at || 0).getTime();
      const bTime = new Date(b.payment.payout_eligible_at || b.payment.created_at || 0).getTime();
      return aTime - bTime;
    });

  const totalAvailable = eligiblePayments.reduce((sum, item) => sum + item.available_amount, 0);
  if (requestedAmount - totalAvailable > 0.01) {
    throw new Error('Requested amount exceeds the available payout balance.');
  }

  let remaining = requestedAmount;
  const allocations: Array<{ payment_id: string; amount_allocated: number; community_id: string | null }> = [];
  for (const item of eligiblePayments) {
    if (remaining <= 0.009) break;
    const amountAllocated = Math.min(item.available_amount, remaining);
    allocations.push({
      payment_id: item.payment.id,
      amount_allocated: clampMoney(amountAllocated),
      community_id: item.community?.id || null,
    });
    remaining = clampMoney(remaining - amountAllocated);
  }

  if (remaining > 0.01) {
    throw new Error('Could not fully allocate the requested amount.');
  }

  const now = new Date().toISOString();
  const referenceNumber = `PAYOUT-${Date.now()}`;
  const { data: createdRequest, error: requestError } = await db
    .from('payout_requests')
    .insert({
      agency_id: scope.agencyId,
      community_id: scope.communityId,
      destination_id: input.destination_id,
      requested_amount: requestedAmount,
      currency_code: DEFAULT_CURRENCY_CODE,
      status: 'pending_review',
      requested_by: toOptionalString(context.actorUserId) || toOptionalString(context.userProfile?.id),
      reference_number: referenceNumber,
      notes: toOptionalString(input.notes),
      created_at: now,
      updated_at: now,
    })
    .select('*')
    .maybeSingle();

  if (requestError || !createdRequest) {
    throw new Error(`Failed to create payout request: ${requestError?.message || 'Unknown error'}`);
  }

  const requestId = String((createdRequest as AnyRecord).id);

  const { error: itemError } = await db.from('payout_request_items').insert(
    allocations.map((allocation) => ({
      payout_request_id: requestId,
      payment_id: allocation.payment_id,
      amount_allocated: allocation.amount_allocated,
      currency_code: DEFAULT_CURRENCY_CODE,
    }))
  );

  if (itemError) {
    throw new Error(`Failed to create payout request items: ${itemError.message}`);
  }

  for (const allocation of allocations) {
    await updatePaymentPayoutReservation({
      paymentId: allocation.payment_id,
      reserveDelta: allocation.amount_allocated,
      batchId: requestId,
    });
  }

  const summary = await computeScopeSummary(scope);
  await createLedgerEntry({
    agencyId: scope.agencyId,
    communityId: scope.communityId,
    payoutRequestId: requestId,
    entryType: 'reserve_for_request',
    amount: requestedAmount,
    description: 'Funds reserved for payout request.',
    createdBy: toOptionalString(context.actorUserId) || toOptionalString(context.userProfile?.id),
    metadata: { allocation_count: allocations.length },
    runningBalanceAfter: summary.balances.available_amount,
  });

  await createPayoutEvent({
    payoutRequestId: requestId,
    eventType: 'created',
    eventMessage: 'Payout request submitted for review.',
    actorUserId: toOptionalString(context.actorUserId) || toOptionalString(context.userProfile?.id),
    metadata: { requested_amount: requestedAmount, destination_id: input.destination_id },
  });

  return {
    request: createdRequest,
    allocations,
  };
};

export const updateAdminPayoutRequestStatus = async (
  id: string,
  action: 'cancel' | 'approve' | 'reject' | 'mark_processing' | 'mark_paid' | 'fail',
  context: PayoutScopeInput,
  input: {
    notes?: string | null;
    failure_reason?: string | null;
  } = {}
) => {
  const requests = await listAdminPayoutRequests(context);
  const request = requests.find((row) => row.id === id);
  if (!request) {
    throw new Error('Payout request not found.');
  }

  const actorId = toOptionalString(context.actorUserId) || toOptionalString(context.userProfile?.id);
  const now = new Date().toISOString();
  const { data: itemRows, error: itemError } = await db
    .from('payout_request_items')
    .select('payment_id, amount_allocated')
    .eq('payout_request_id', id);
  if (itemError) {
    throw new Error(`Failed to load payout request items: ${itemError.message}`);
  }

  const items = (itemRows || []) as Array<{ payment_id: string; amount_allocated: number | string }>;
  const scope = await resolvePayoutScope({
    ...context,
    agencyId: request.agency_id,
    communityId: request.community_id,
  });

  const requestAmount = clampMoney(asNumber(request.requested_amount));
  let nextStatus = request.status;
  let eventType = action;
  let eventMessage = '';

  if (action === 'approve') {
    nextStatus = 'approved';
    eventMessage = 'Payout request approved.';
  } else if (action === 'mark_processing') {
    nextStatus = 'processing';
    eventMessage = 'Payout request marked as processing.';
  } else if (action === 'mark_paid') {
    nextStatus = 'paid';
    eventMessage = 'Payout request marked as paid.';
    for (const item of items) {
      const allocated = clampMoney(asNumber(item.amount_allocated));
      await updatePaymentPayoutReservation({
        paymentId: item.payment_id,
        reserveDelta: -allocated,
        paidDelta: allocated,
        batchId: null,
      });
    }
    const summary = await computeScopeSummary(scope);
    await createLedgerEntry({
      agencyId: request.agency_id,
      communityId: request.community_id,
      payoutRequestId: request.id,
      entryType: 'payout_completed',
      amount: requestAmount,
      description: 'Payout request settled successfully.',
      createdBy: actorId,
      runningBalanceAfter: summary.balances.available_amount,
    });
  } else if (action === 'cancel' || action === 'reject' || action === 'fail') {
    nextStatus = action === 'cancel' ? 'cancelled' : action === 'reject' ? 'rejected' : 'failed';
    eventMessage =
      action === 'cancel'
        ? 'Payout request cancelled.'
        : action === 'reject'
          ? 'Payout request rejected.'
          : 'Payout request failed.';
    for (const item of items) {
      await updatePaymentPayoutReservation({
        paymentId: item.payment_id,
        reserveDelta: -clampMoney(asNumber(item.amount_allocated)),
        batchId: null,
      });
    }
    const summary = await computeScopeSummary(scope);
    await createLedgerEntry({
      agencyId: request.agency_id,
      communityId: request.community_id,
      payoutRequestId: request.id,
      entryType: 'release_reserve',
      amount: requestAmount,
      description: 'Reserved funds released back to available balance.',
      createdBy: actorId,
      metadata: { release_reason: nextStatus },
      runningBalanceAfter: summary.balances.available_amount,
    });
  }

  const payload: AnyRecord = {
    status: nextStatus,
    updated_at: now,
    notes: input.notes !== undefined ? toOptionalString(input.notes) : request.notes,
  };

  if (action === 'approve' || action === 'reject') {
    payload.reviewed_by = actorId;
    payload.reviewed_at = now;
  }
  if (action === 'mark_paid') {
    payload.reviewed_by = actorId;
    payload.reviewed_at = request.reviewed_at || now;
    payload.processed_at = now;
  }
  if (action === 'fail') {
    payload.failure_reason = toOptionalString(input.failure_reason) || 'Payout processing failed.';
    payload.processed_at = now;
  }

  const { data: updated, error: updateError } = await db
    .from('payout_requests')
    .update(payload)
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (updateError) {
    throw new Error(`Failed to update payout request: ${updateError.message}`);
  }

  await createPayoutEvent({
    payoutRequestId: id,
    eventType,
    eventMessage,
    actorUserId: actorId,
    metadata: input.failure_reason ? { failure_reason: input.failure_reason } : {},
  });

  return updated as PayoutRequest;
};
