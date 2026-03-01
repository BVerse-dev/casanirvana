import { adminSupabase } from '../lib/supabase';

type JsonRecord = Record<string, unknown>;

type ChargeCatalogItem = {
  key: string;
  label: string;
  category: string;
  defaultChargeType: 'fixed' | 'variable' | 'formula';
  defaultFrequency: 'monthly' | 'quarterly' | 'yearly' | 'one_time' | 'custom_period';
  description: string;
};

type PaymentChargeTemplateRow = {
  id: string;
  scope_level: 'agency' | 'community';
  agency_id: string | null;
  community_id: string | null;
  name: string;
  charge_code: string;
  catalog_key: string;
  category: string;
  charge_type: 'fixed' | 'variable' | 'formula';
  amount: number | string;
  currency_code: string | null;
  billing_frequency: 'monthly' | 'quarterly' | 'yearly' | 'one_time' | 'custom_period';
  billing_anchor_day: number | null;
  billing_anchor_month: number | null;
  start_date: string | null;
  due_offset_days: number | null;
  grace_period_days: number | null;
  late_fee_type: 'none' | 'fixed' | 'percentage' | null;
  late_fee_value: number | string | null;
  auto_issue: boolean | null;
  requires_approval: boolean | null;
  is_active: boolean | null;
  description: string | null;
  metadata: JsonRecord | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type PaymentChargeTemplateTargetRow = {
  id: string;
  template_id: string;
  target_type:
    | 'all_units'
    | 'unit_ids'
    | 'blocks'
    | 'unit_types'
    | 'occupied_only'
    | 'owner_only'
    | 'tenant_only'
    | 'exclude_unit_ids';
  target_value: JsonRecord | string[] | string | null;
  created_at: string | null;
  updated_at: string | null;
};

type PaymentChargeRunRow = {
  id: string;
  template_id: string;
  scope_level: 'agency' | 'community';
  agency_id: string | null;
  community_id: string;
  run_mode: 'manual' | 'scheduled';
  billing_period_start: string | null;
  billing_period_end: string | null;
  due_date: string;
  status: 'draft' | 'previewed' | 'issued' | 'cancelled';
  issued_by: string | null;
  issued_at: string | null;
  summary_counts: JsonRecord | null;
  summary_amounts: JsonRecord | null;
  created_at: string | null;
  updated_at: string | null;
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

type UnitRow = {
  id: string;
  community_id: string | null;
  number: string | null;
  unit_number: string | null;
  block: string | null;
  unit_type: string | null;
  owner_id: string | null;
  tenant_id?: string | null;
  area_sqft?: number | string | null;
  floor_area?: number | string | null;
  maintenance_amount?: number | string | null;
  rent_amount?: number | string | null;
};

type TemplateTargetInput = {
  target_type:
    | 'all_units'
    | 'unit_ids'
    | 'blocks'
    | 'unit_types'
    | 'occupied_only'
    | 'owner_only'
    | 'tenant_only'
    | 'exclude_unit_ids';
  target_value?: unknown;
};

type TemplateUpsertInput = {
  scope_level: 'agency' | 'community';
  agency_id?: string | null;
  community_id?: string | null;
  name: string;
  charge_code: string;
  catalog_key: string;
  category: string;
  charge_type: 'fixed' | 'variable' | 'formula';
  amount: number;
  currency_code?: string | null;
  billing_frequency: 'monthly' | 'quarterly' | 'yearly' | 'one_time' | 'custom_period';
  billing_anchor_day?: number | null;
  billing_anchor_month?: number | null;
  start_date?: string | null;
  due_offset_days?: number | null;
  grace_period_days?: number | null;
  late_fee_type?: 'none' | 'fixed' | 'percentage' | null;
  late_fee_value?: number | null;
  auto_issue?: boolean;
  requires_approval?: boolean;
  is_active?: boolean;
  description?: string | null;
  metadata?: JsonRecord | null;
  targets?: TemplateTargetInput[];
};

type PreviewIssueInput = {
  community_id?: string | null;
  unit_ids?: string[];
  billing_period_start?: string | null;
  billing_period_end?: string | null;
  due_date?: string | null;
  run_mode?: 'manual' | 'scheduled';
};

type ListTemplateFilters = {
  scope_level?: 'agency' | 'community';
  agency_id?: string;
  community_id?: string;
  include_inactive?: boolean;
};

type ListRunFilters = {
  community_id?: string;
  template_id?: string;
  status?: 'draft' | 'previewed' | 'issued' | 'cancelled';
};

type ResolvedPreviewItem = {
  unit_id: string;
  unit_label: string;
  block: string | null;
  unit_type: string | null;
  amount: number;
  amount_formatted: string;
  invoice_number: string;
  line_items: Array<Record<string, unknown>>;
  existing_obligation_id: string | null;
};

const DEFAULT_PAYMENT_CURRENCY_CODE = (process.env.DEFAULT_PAYMENT_CURRENCY || 'GHS').trim().toUpperCase() || 'GHS';
const DEFAULT_PAYMENT_CURRENCY_SYMBOL =
  process.env.DEFAULT_PAYMENT_CURRENCY_SYMBOL?.trim() ||
  (DEFAULT_PAYMENT_CURRENCY_CODE === 'GHS' ? 'GH₵' : DEFAULT_PAYMENT_CURRENCY_CODE);
const ACTIVE_OBLIGATION_STATUSES = ['unpaid', 'partially_paid', 'overdue', 'paid'];

const CHARGE_CATALOG: ChargeCatalogItem[] = [
  { key: 'hoa_dues', label: 'HOA Dues / Association Fees', category: 'HOA Dues', defaultChargeType: 'fixed', defaultFrequency: 'monthly', description: 'Recurring homeowner association dues.' },
  { key: 'maintenance_fee', label: 'Maintenance Fee', category: 'Maintenance', defaultChargeType: 'fixed', defaultFrequency: 'monthly', description: 'Routine community maintenance and repairs.' },
  { key: 'security_levy', label: 'Security Levy', category: 'Security', defaultChargeType: 'fixed', defaultFrequency: 'monthly', description: 'Security services and guard operations.' },
  { key: 'facility_management_fee', label: 'Facility Management Fee', category: 'Facility Management', defaultChargeType: 'fixed', defaultFrequency: 'monthly', description: 'Facility management service charge.' },
  { key: 'reserve_fund', label: 'Reserve / Sinking Fund', category: 'Reserve Fund', defaultChargeType: 'fixed', defaultFrequency: 'monthly', description: 'Reserve or sinking fund contributions.' },
  { key: 'parking_fee', label: 'Parking Fee', category: 'Parking Fee', defaultChargeType: 'fixed', defaultFrequency: 'monthly', description: 'Recurring parking and bay fees.' },
  { key: 'waste_sanitation_fee', label: 'Waste / Sanitation Fee', category: 'Sanitation', defaultChargeType: 'fixed', defaultFrequency: 'monthly', description: 'Waste management and sanitation fee.' },
  { key: 'common_area_utility', label: 'Common Area Utility Allocation', category: 'Utilities', defaultChargeType: 'fixed', defaultFrequency: 'monthly', description: 'Shared utility allocation for common areas.' },
  { key: 'water_bill', label: 'Water Bill', category: 'Water Bill', defaultChargeType: 'variable', defaultFrequency: 'monthly', description: 'Water and sewerage charges.' },
  { key: 'electricity_bill', label: 'Electricity Bill', category: 'Utilities', defaultChargeType: 'variable', defaultFrequency: 'monthly', description: 'Electricity or metered utility charges.' },
  { key: 'metered_utility', label: 'Metered Utility', category: 'Utilities', defaultChargeType: 'formula', defaultFrequency: 'monthly', description: 'Variable utility usage based charges.' },
  { key: 'generator_levy', label: 'Generator / Backup Power Levy', category: 'Utilities', defaultChargeType: 'fixed', defaultFrequency: 'monthly', description: 'Backup power or generator contribution.' },
  { key: 'security_deposit', label: 'Security Deposit', category: 'Security Deposit', defaultChargeType: 'fixed', defaultFrequency: 'one_time', description: 'Refundable or one-time security deposit.' },
  { key: 'move_in_fee', label: 'Move-In Fee', category: 'Move In Fee', defaultChargeType: 'fixed', defaultFrequency: 'one_time', description: 'One-time move-in administration fee.' },
  { key: 'move_out_fee', label: 'Move-Out Fee', category: 'Move Out Fee', defaultChargeType: 'fixed', defaultFrequency: 'one_time', description: 'One-time move-out administration fee.' },
  { key: 'access_card_replacement', label: 'Access Card / Tag Replacement', category: 'Access Control', defaultChargeType: 'fixed', defaultFrequency: 'one_time', description: 'Replacement fee for access tags or cards.' },
  { key: 'amenity_security_deposit', label: 'Amenity Security Deposit', category: 'Amenity Deposit', defaultChargeType: 'fixed', defaultFrequency: 'one_time', description: 'Deposit charged for paid amenities.' },
  { key: 'amenity_damage_charge', label: 'Amenity Damage Charge', category: 'Damage Charge', defaultChargeType: 'fixed', defaultFrequency: 'one_time', description: 'Recoverable damage costs for amenities.' },
  { key: 'documentation_fee', label: 'Documentation / Registration Fee', category: 'Documentation', defaultChargeType: 'fixed', defaultFrequency: 'one_time', description: 'Registration and documentation related charges.' },
  { key: 'late_payment_fee', label: 'Late Payment Fee', category: 'Late Fee', defaultChargeType: 'fixed', defaultFrequency: 'custom_period', description: 'Penalty for overdue obligations.' },
  { key: 'violation_fine', label: 'Violation Fine', category: 'Violation Fine', defaultChargeType: 'fixed', defaultFrequency: 'one_time', description: 'Rules and compliance violation fines.' },
  { key: 'guest_parking_penalty', label: 'Guest Parking Penalty', category: 'Parking Penalty', defaultChargeType: 'fixed', defaultFrequency: 'one_time', description: 'Guest parking misuse or overstay penalties.' },
  { key: 'welfare_fund', label: 'Welfare Fund', category: 'Welfare Fund', defaultChargeType: 'fixed', defaultFrequency: 'monthly', description: 'Community welfare or resident welfare fund.' },
  { key: 'special_assessment', label: 'Special Assessment', category: 'Special Assessment', defaultChargeType: 'fixed', defaultFrequency: 'custom_period', description: 'Ad-hoc project or repair contribution.' },
  { key: 'capital_project_levy', label: 'Capital Project Levy', category: 'Capital Project Levy', defaultChargeType: 'fixed', defaultFrequency: 'custom_period', description: 'Capital improvement or development levy.' },
];

const asNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const asObject = (value: unknown): JsonRecord => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as JsonRecord;
  }
  return {};
};

const formatMoney = (amount: number, currencyCode = DEFAULT_PAYMENT_CURRENCY_CODE, currencySymbol = DEFAULT_PAYMENT_CURRENCY_SYMBOL) => {
  return `${currencySymbol} ${asNumber(amount).toFixed(2)}`;
};

const normalizeDateOnly = (value?: string | null) => {
  if (!value) return null;
  const normalized = new Date(value);
  if (Number.isNaN(normalized.getTime())) {
    return null;
  }
  return normalized.toISOString().slice(0, 10);
};

const endOfDayIso = (value: string) => `${value}T23:59:59.000Z`;

const getPeriodBounds = ({
  billingFrequency,
  billingPeriodStart,
  billingPeriodEnd,
}: {
  billingFrequency: PaymentChargeTemplateRow['billing_frequency'];
  billingPeriodStart?: string | null;
  billingPeriodEnd?: string | null;
}) => {
  const now = new Date();
  const normalizedStart = normalizeDateOnly(billingPeriodStart);
  const normalizedEnd = normalizeDateOnly(billingPeriodEnd);

  if (normalizedStart && normalizedEnd) {
    return {
      billing_period_start: normalizedStart,
      billing_period_end: normalizedEnd,
    };
  }

  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();

  if (billingFrequency === 'one_time') {
    const single = normalizedStart || now.toISOString().slice(0, 10);
    return {
      billing_period_start: single,
      billing_period_end: normalizedEnd || single,
    };
  }

  if (billingFrequency === 'yearly') {
    return {
      billing_period_start: `${year}-01-01`,
      billing_period_end: `${year}-12-31`,
    };
  }

  if (billingFrequency === 'quarterly') {
    const quarterStartMonth = Math.floor(month / 3) * 3;
    const start = new Date(Date.UTC(year, quarterStartMonth, 1));
    const end = new Date(Date.UTC(year, quarterStartMonth + 3, 0));
    return {
      billing_period_start: start.toISOString().slice(0, 10),
      billing_period_end: end.toISOString().slice(0, 10),
    };
  }

  if (billingFrequency === 'custom_period') {
    const start = normalizedStart || now.toISOString().slice(0, 10);
    const end = normalizedEnd || start;
    return {
      billing_period_start: start,
      billing_period_end: end,
    };
  }

  const start = new Date(Date.UTC(year, month, 1));
  const end = new Date(Date.UTC(year, month + 1, 0));
  return {
    billing_period_start: start.toISOString().slice(0, 10),
    billing_period_end: end.toISOString().slice(0, 10),
  };
};

const computeDueDate = ({
  template,
  explicitDueDate,
  billingPeriodStart,
}: {
  template: PaymentChargeTemplateRow;
  explicitDueDate?: string | null;
  billingPeriodStart: string;
}) => {
  const direct = normalizeDateOnly(explicitDueDate);
  if (direct) {
    return endOfDayIso(direct);
  }

  const [year, month] = billingPeriodStart.split('-').map((part) => Number(part));
  const baseDate = new Date(Date.UTC(year, month - 1, 1));

  if (template.billing_anchor_day) {
    const anchorDay = Math.min(Math.max(template.billing_anchor_day, 1), 28);
    baseDate.setUTCDate(anchorDay);
  }

  baseDate.setUTCDate(baseDate.getUTCDate() + asNumber(template.due_offset_days));
  return endOfDayIso(baseDate.toISOString().slice(0, 10));
};

const normalizeTargetValue = (targetType: TemplateTargetInput['target_type'], raw: unknown) => {
  if (targetType === 'all_units' || targetType === 'occupied_only' || targetType === 'owner_only' || targetType === 'tenant_only') {
    return {};
  }

  if (Array.isArray(raw)) {
    return raw.map((entry) => String(entry).trim()).filter(Boolean);
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((entry) => String(entry).trim()).filter(Boolean);
      }
    } catch {
      return trimmed.split(',').map((entry) => entry.trim()).filter(Boolean);
    }
    return [];
  }

  if (raw && typeof raw === 'object') {
    return raw as JsonRecord;
  }

  return [];
};

const serializeTarget = (target: PaymentChargeTemplateTargetRow) => ({
  id: target.id,
  template_id: target.template_id,
  target_type: target.target_type,
  target_value: target.target_value,
  created_at: target.created_at,
  updated_at: target.updated_at,
});

const getCatalogItem = (catalogKey: string) => CHARGE_CATALOG.find((item) => item.key === catalogKey) || null;

const fetchCommunitiesByIds = async (ids: string[]) => {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
  if (!uniqueIds.length) return new Map<string, CommunityRow>();

  const { data, error } = await adminSupabase
    .from('communities')
    .select('id, name, agency_id')
    .in('id', uniqueIds);

  if (error) {
    throw new Error(`Failed to load communities: ${error.message}`);
  }

  return new Map(((data || []) as CommunityRow[]).map((row) => [row.id, row]));
};

const fetchAgenciesByIds = async (ids: string[]) => {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
  if (!uniqueIds.length) return new Map<string, AgencyRow>();

  const { data, error } = await adminSupabase
    .from('agencies')
    .select('id, name')
    .in('id', uniqueIds);

  if (error) {
    throw new Error(`Failed to load agencies: ${error.message}`);
  }

  return new Map(((data || []) as AgencyRow[]).map((row) => [row.id, row]));
};

const fetchTemplateTargets = async (templateIds: string[]) => {
  const uniqueIds = Array.from(new Set(templateIds.filter(Boolean)));
  if (!uniqueIds.length) return new Map<string, PaymentChargeTemplateTargetRow[]>();

  const { data, error } = await adminSupabase
    .from('payment_charge_template_targets')
    .select('*')
    .in('template_id', uniqueIds)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to load charge template targets: ${error.message}`);
  }

  const targetMap = new Map<string, PaymentChargeTemplateTargetRow[]>();
  ((data || []) as PaymentChargeTemplateTargetRow[]).forEach((row) => {
    const items = targetMap.get(row.template_id) || [];
    items.push(row);
    targetMap.set(row.template_id, items);
  });

  return targetMap;
};

const serializeTemplate = ({
  template,
  community,
  agency,
  targets,
}: {
  template: PaymentChargeTemplateRow;
  community?: CommunityRow | null;
  agency?: AgencyRow | null;
  targets?: PaymentChargeTemplateTargetRow[];
}) => ({
  ...template,
  amount: asNumber(template.amount),
  currency_code: template.currency_code || DEFAULT_PAYMENT_CURRENCY_CODE,
  amount_formatted: formatMoney(asNumber(template.amount), template.currency_code || DEFAULT_PAYMENT_CURRENCY_CODE),
  catalog: getCatalogItem(template.catalog_key),
  community: community
    ? {
        id: community.id,
        name: community.name,
      }
    : null,
  agency: agency
    ? {
        id: agency.id,
        name: agency.name,
      }
    : null,
  targets: (targets || []).map(serializeTarget),
});

const serializeRun = ({
  run,
  template,
  community,
  agency,
}: {
  run: PaymentChargeRunRow;
  template?: PaymentChargeTemplateRow | null;
  community?: CommunityRow | null;
  agency?: AgencyRow | null;
}) => ({
  ...run,
  template: template
    ? {
        id: template.id,
        name: template.name,
        charge_code: template.charge_code,
        category: template.category,
      }
    : null,
  community: community
    ? {
        id: community.id,
        name: community.name,
      }
    : null,
  agency: agency
    ? {
        id: agency.id,
        name: agency.name,
      }
    : null,
});

const ensureTemplateExists = async (id: string) => {
  const { data, error } = await adminSupabase
    .from('payment_charge_templates')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load payment charge template: ${error.message}`);
  }

  const template = data as PaymentChargeTemplateRow | null;
  if (!template) {
    throw new Error('Payment charge template not found');
  }

  return template;
};

const ensureCommunityForTemplate = async (template: PaymentChargeTemplateRow, explicitCommunityId?: string | null) => {
  const communityId = explicitCommunityId || template.community_id;
  if (!communityId) {
    throw new Error('A community must be selected before previewing or issuing this charge.');
  }

  const communityMap = await fetchCommunitiesByIds([communityId]);
  const community = communityMap.get(communityId);
  if (!community) {
    throw new Error('Selected community could not be found.');
  }

  if (template.scope_level === 'agency' && template.agency_id && community.agency_id !== template.agency_id) {
    throw new Error('Selected community is outside the template agency scope.');
  }

  if (template.scope_level === 'community' && template.community_id && community.id !== template.community_id) {
    throw new Error('Selected community does not match the template community scope.');
  }

  return community;
};

const fetchUnitsForCommunity = async (communityId: string) => {
  const { data, error } = await adminSupabase
    .from('units')
    .select('id, community_id, number, unit_number, block, unit_type, owner_id, tenant_id, area_sqft, floor_area, maintenance_amount, rent_amount')
    .eq('community_id', communityId)
    .order('block', { ascending: true })
    .order('number', { ascending: true });

  if (error) {
    throw new Error(`Failed to load community units: ${error.message}`);
  }

  return (data || []) as UnitRow[];
};

const resolveTargetedUnits = ({
  units,
  targets,
  explicitUnitIds,
}: {
  units: UnitRow[];
  targets: PaymentChargeTemplateTargetRow[];
  explicitUnitIds?: string[];
}) => {
  let selected = [...units];
  const includeTargets = targets.filter((target) => target.target_type !== 'exclude_unit_ids');
  const excludeTargets = targets.filter((target) => target.target_type === 'exclude_unit_ids');

  const includeUnitIds = new Set<string>();
  const includeBlocks = new Set<string>();
  const includeUnitTypes = new Set<string>();
  let requiresOccupiedOnly = false;
  let requiresOwnerOnly = false;
  let requiresTenantOnly = false;
  let usesAllUnits = false;

  if (!includeTargets.length) {
    usesAllUnits = true;
  }

  includeTargets.forEach((target) => {
    if (target.target_type === 'all_units') {
      usesAllUnits = true;
      return;
    }

    if (target.target_type === 'unit_ids') {
      const ids = normalizeTargetValue('unit_ids', target.target_value) as string[];
      ids.forEach((id) => includeUnitIds.add(id));
      return;
    }

    if (target.target_type === 'blocks') {
      const values = normalizeTargetValue('blocks', target.target_value) as string[];
      values.forEach((value) => includeBlocks.add(value.toLowerCase()));
      return;
    }

    if (target.target_type === 'unit_types') {
      const values = normalizeTargetValue('unit_types', target.target_value) as string[];
      values.forEach((value) => includeUnitTypes.add(value.toLowerCase()));
      return;
    }

    if (target.target_type === 'occupied_only') {
      requiresOccupiedOnly = true;
      return;
    }

    if (target.target_type === 'owner_only') {
      requiresOwnerOnly = true;
      return;
    }

    if (target.target_type === 'tenant_only') {
      requiresTenantOnly = true;
    }
  });

  if (!usesAllUnits) {
    selected = selected.filter((unit) => {
      const inUnitIds = includeUnitIds.size ? includeUnitIds.has(unit.id) : false;
      const inBlocks = includeBlocks.size ? includeBlocks.has(String(unit.block || '').toLowerCase()) : false;
      const inUnitTypes = includeUnitTypes.size ? includeUnitTypes.has(String(unit.unit_type || '').toLowerCase()) : false;
      return inUnitIds || inBlocks || inUnitTypes;
    });
  }

  if (requiresOccupiedOnly) {
    selected = selected.filter((unit) => Boolean(unit.owner_id || unit.tenant_id));
  }

  if (requiresOwnerOnly) {
    selected = selected.filter((unit) => Boolean(unit.owner_id));
  }

  if (requiresTenantOnly) {
    selected = selected.filter((unit) => Boolean(unit.tenant_id));
  }

  const excludedIds = new Set<string>();
  excludeTargets.forEach((target) => {
    const ids = normalizeTargetValue('exclude_unit_ids', target.target_value) as string[];
    ids.forEach((id) => excludedIds.add(id));
  });

  if (excludedIds.size) {
    selected = selected.filter((unit) => !excludedIds.has(unit.id));
  }

  if (explicitUnitIds?.length) {
    const explicitSet = new Set(explicitUnitIds);
    selected = selected.filter((unit) => explicitSet.has(unit.id));
  }

  return selected;
};

const buildInvoiceNumber = ({ runId, index, billingPeriodStart }: { runId: string; index: number; billingPeriodStart: string }) => {
  const periodKey = billingPeriodStart.replace(/-/g, '').slice(0, 6);
  const runKey = runId.replace(/-/g, '').slice(0, 6).toUpperCase();
  return `INV-${periodKey}-${runKey}-${String(index + 1).padStart(3, '0')}`;
};

const computeChargeAmount = ({
  template,
  unit,
}: {
  template: PaymentChargeTemplateRow;
  unit: UnitRow;
}) => {
  const baseAmount = asNumber(template.amount);
  const metadata = asObject(template.metadata);
  const unitField = typeof metadata.unit_field === 'string' ? metadata.unit_field : null;
  const multiplier = asNumber(metadata.multiplier || 1);

  if (template.charge_type === 'formula' && unitField) {
    const baseValue = asNumber((unit as Record<string, unknown>)[unitField]);
    const computed = baseValue * (baseAmount || multiplier);
    return computed > 0 ? computed : baseAmount;
  }

  if (template.charge_type === 'variable' && unitField) {
    const variableValue = asNumber((unit as Record<string, unknown>)[unitField]);
    return variableValue > 0 ? variableValue * multiplier : baseAmount;
  }

  return baseAmount;
};

const fetchExistingObligationMap = async ({
  templateId,
  communityId,
  unitIds,
  billingPeriodStart,
  billingPeriodEnd,
}: {
  templateId: string;
  communityId: string;
  unitIds: string[];
  billingPeriodStart: string;
  billingPeriodEnd: string;
}) => {
  if (!unitIds.length) {
    return new Map<string, string>();
  }

  const { data, error } = await adminSupabase
    .from('payment_obligations')
    .select('id, unit_id')
    .eq('template_id', templateId)
    .eq('community_id', communityId)
    .eq('billing_period_start', billingPeriodStart)
    .eq('billing_period_end', billingPeriodEnd)
    .in('unit_id', unitIds)
    .in('status', ACTIVE_OBLIGATION_STATUSES);

  if (error) {
    throw new Error(`Failed to check existing payment obligations: ${error.message}`);
  }

  return new Map(((data || []) as Array<{ id: string; unit_id: string }>).map((row) => [row.unit_id, row.id]));
};

const buildPreview = async (template: PaymentChargeTemplateRow, input: PreviewIssueInput) => {
  const community = await ensureCommunityForTemplate(template, input.community_id);
  const targets = (await fetchTemplateTargets([template.id])).get(template.id) || [];
  const units = await fetchUnitsForCommunity(community.id);
  const targetedUnits = resolveTargetedUnits({
    units,
    targets,
    explicitUnitIds: input.unit_ids,
  });

  const { billing_period_start, billing_period_end } = getPeriodBounds({
    billingFrequency: template.billing_frequency,
    billingPeriodStart: input.billing_period_start,
    billingPeriodEnd: input.billing_period_end,
  });
  const dueDateIso = computeDueDate({
    template,
    explicitDueDate: input.due_date,
    billingPeriodStart: billing_period_start,
  });

  const existingMap = await fetchExistingObligationMap({
    templateId: template.id,
    communityId: community.id,
    unitIds: targetedUnits.map((unit) => unit.id),
    billingPeriodStart: billing_period_start,
    billingPeriodEnd: billing_period_end,
  });

  const previewItems: ResolvedPreviewItem[] = targetedUnits.map((unit, index) => {
    const amount = computeChargeAmount({ template, unit });
    const unitLabel = [unit.block, unit.number || unit.unit_number].filter(Boolean).join('-') || unit.unit_number || unit.number || 'Unit';
    return {
      unit_id: unit.id,
      unit_label: unitLabel,
      block: unit.block || null,
      unit_type: unit.unit_type || null,
      amount,
      amount_formatted: formatMoney(amount, template.currency_code || DEFAULT_PAYMENT_CURRENCY_CODE),
      invoice_number: buildInvoiceNumber({ runId: template.id, index, billingPeriodStart: billing_period_start }),
      line_items: [
        {
          label: template.name,
          category: template.category,
          amount,
          currency_code: template.currency_code || DEFAULT_PAYMENT_CURRENCY_CODE,
        },
      ],
      existing_obligation_id: existingMap.get(unit.id) || null,
    };
  });

  const issuableItems = previewItems.filter((item) => !item.existing_obligation_id);
  const totalAmount = issuableItems.reduce((sum, item) => sum + item.amount, 0);

  return {
    template,
    community,
    targets,
    billing_period_start,
    billing_period_end,
    due_date: dueDateIso,
    run_mode: input.run_mode || 'manual',
    preview_items: previewItems,
    issuable_items: issuableItems,
    summary: {
      targeted_units: previewItems.length,
      existing_obligations: previewItems.length - issuableItems.length,
      units_to_issue: issuableItems.length,
      total_amount: totalAmount,
      total_amount_formatted: formatMoney(totalAmount, template.currency_code || DEFAULT_PAYMENT_CURRENCY_CODE),
      currency_code: template.currency_code || DEFAULT_PAYMENT_CURRENCY_CODE,
      currency_symbol: DEFAULT_PAYMENT_CURRENCY_SYMBOL,
    },
  };
};

const ensureUniqueIssuedRun = async ({
  templateId,
  communityId,
  billingPeriodStart,
  billingPeriodEnd,
}: {
  templateId: string;
  communityId: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
}) => {
  const { data, error } = await adminSupabase
    .from('payment_charge_runs')
    .select('id')
    .eq('template_id', templateId)
    .eq('community_id', communityId)
    .eq('billing_period_start', billingPeriodStart)
    .eq('billing_period_end', billingPeriodEnd)
    .neq('status', 'cancelled')
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to validate existing charge runs: ${error.message}`);
  }

  if (data) {
    throw new Error('A charge run has already been issued for this template, community, and billing period.');
  }
};

const issueFromPreview = async ({
  preview,
  actorUserId,
}: {
  preview: Awaited<ReturnType<typeof buildPreview>>;
  actorUserId?: string | null;
}) => {
  const { template, community, billing_period_start, billing_period_end, due_date, issuable_items, run_mode, summary } = preview;

  if (!issuable_items.length) {
    return {
      run: null,
      obligations: [],
      summary,
    };
  }

  await ensureUniqueIssuedRun({
    templateId: template.id,
    communityId: community.id,
    billingPeriodStart: billing_period_start,
    billingPeriodEnd: billing_period_end,
  });

  const runInsert = {
    template_id: template.id,
    scope_level: template.scope_level,
    agency_id: template.agency_id,
    community_id: community.id,
    run_mode,
    billing_period_start,
    billing_period_end,
    due_date,
    status: 'issued' as const,
    issued_by: actorUserId || null,
    issued_at: new Date().toISOString(),
    summary_counts: {
      targeted_units: summary.targeted_units,
      existing_obligations: summary.existing_obligations,
      issued_obligations: summary.units_to_issue,
    },
    summary_amounts: {
      total_amount: summary.total_amount,
      currency_code: summary.currency_code,
    },
  };

  const { data: runData, error: runError } = await adminSupabase
    .from('payment_charge_runs')
    .insert(runInsert)
    .select('*')
    .single();

  if (runError) {
    throw new Error(`Failed to create payment charge run: ${runError.message}`);
  }

  const run = runData as PaymentChargeRunRow;

  const obligationPayload = issuable_items.map((item, index) => ({
    unit_id: item.unit_id,
    community_id: community.id,
    source_type: 'payment_charge_template',
    source_id: template.id,
    title: template.name,
    description: template.description || getCatalogItem(template.catalog_key)?.description || `${template.name} charge`,
    category: template.category,
    amount: item.amount,
    currency_code: template.currency_code || DEFAULT_PAYMENT_CURRENCY_CODE,
    due_date,
    status: 'unpaid',
    statement_month: billing_period_start,
    template_id: template.id,
    charge_run_id: run.id,
    invoice_number: buildInvoiceNumber({ runId: run.id, index, billingPeriodStart: billing_period_start }),
    issued_at: run.issued_at,
    billing_period_start,
    billing_period_end,
    source_scope: template.scope_level,
    is_manual_issue: run_mode === 'manual',
    late_fee_snapshot: {
      type: template.late_fee_type || 'none',
      value: asNumber(template.late_fee_value),
      grace_period_days: asNumber(template.grace_period_days),
    },
    line_items: item.line_items,
  }));

  const { data: obligationData, error: obligationError } = await adminSupabase
    .from('payment_obligations')
    .insert(obligationPayload)
    .select('*');

  if (obligationError) {
    throw new Error(`Failed to issue payment obligations: ${obligationError.message}`);
  }

  const communityMap = await fetchCommunitiesByIds([community.id]);
  const agencyMap = await fetchAgenciesByIds([template.agency_id || community.agency_id].filter(Boolean) as string[]);

  return {
    run: serializeRun({
      run,
      template,
      community: communityMap.get(community.id) || community,
      agency: agencyMap.get(template.agency_id || community.agency_id || ''),
    }),
    obligations: obligationData || [],
    summary,
  };
};

const isTemplateDueToday = (template: PaymentChargeTemplateRow, today: Date) => {
  const day = today.getUTCDate();
  const month = today.getUTCMonth() + 1;

  if (template.start_date) {
    const start = new Date(template.start_date);
    if (!Number.isNaN(start.getTime()) && today < start) {
      return false;
    }
  }

  if (template.billing_frequency === 'monthly') {
    return day === (template.billing_anchor_day || 1);
  }

  if (template.billing_frequency === 'quarterly') {
    const quarterStartMonth = [1, 4, 7, 10];
    return quarterStartMonth.includes(month) && day === (template.billing_anchor_day || 1);
  }

  if (template.billing_frequency === 'yearly') {
    return month === (template.billing_anchor_month || 1) && day === (template.billing_anchor_day || 1);
  }

  if (template.billing_frequency === 'one_time') {
    const start = normalizeDateOnly(template.start_date);
    return start === today.toISOString().slice(0, 10);
  }

  return false;
};

export const getPaymentChargeCatalog = async () => {
  return CHARGE_CATALOG;
};

export const listPaymentChargeTemplates = async (filters: ListTemplateFilters = {}) => {
  let query = adminSupabase
    .from('payment_charge_templates')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.scope_level) {
    query = query.eq('scope_level', filters.scope_level);
  }
  if (filters.agency_id) {
    query = query.eq('agency_id', filters.agency_id);
  }
  if (filters.community_id) {
    query = query.eq('community_id', filters.community_id);
  }
  if (!filters.include_inactive) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to load payment charge templates: ${error.message}`);
  }

  const rows = (data || []) as PaymentChargeTemplateRow[];
  const targetMap = await fetchTemplateTargets(rows.map((row) => row.id));
  const communityMap = await fetchCommunitiesByIds(rows.map((row) => row.community_id || '').filter(Boolean));
  const agencyMap = await fetchAgenciesByIds(rows.map((row) => row.agency_id || '').filter(Boolean));

  return rows.map((row) =>
    serializeTemplate({
      template: row,
      community: row.community_id ? communityMap.get(row.community_id) || null : null,
      agency: row.agency_id ? agencyMap.get(row.agency_id) || null : null,
      targets: targetMap.get(row.id) || [],
    })
  );
};

export const createPaymentChargeTemplate = async (input: TemplateUpsertInput, actorUserId?: string | null) => {
  const templateInsert = {
    scope_level: input.scope_level,
    agency_id: input.agency_id || null,
    community_id: input.community_id || null,
    name: input.name.trim(),
    charge_code: input.charge_code.trim().toUpperCase(),
    catalog_key: input.catalog_key.trim(),
    category: input.category.trim(),
    charge_type: input.charge_type,
    amount: asNumber(input.amount),
    currency_code: (input.currency_code || DEFAULT_PAYMENT_CURRENCY_CODE).trim().toUpperCase(),
    billing_frequency: input.billing_frequency,
    billing_anchor_day: input.billing_anchor_day ?? null,
    billing_anchor_month: input.billing_anchor_month ?? null,
    start_date: normalizeDateOnly(input.start_date),
    due_offset_days: input.due_offset_days ?? 0,
    grace_period_days: input.grace_period_days ?? 0,
    late_fee_type: input.late_fee_type || 'none',
    late_fee_value: input.late_fee_value ?? 0,
    auto_issue: input.auto_issue ?? false,
    requires_approval: input.requires_approval ?? false,
    is_active: input.is_active ?? true,
    description: input.description?.trim() || null,
    metadata: input.metadata || {},
    created_by: actorUserId || null,
    updated_by: actorUserId || null,
  };

  const { data, error } = await adminSupabase
    .from('payment_charge_templates')
    .insert(templateInsert)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create payment charge template: ${error.message}`);
  }

  const template = data as PaymentChargeTemplateRow;
  const targets = (input.targets && input.targets.length ? input.targets : [{ target_type: 'all_units' as const }]).map((target) => ({
    template_id: template.id,
    target_type: target.target_type,
    target_value: normalizeTargetValue(target.target_type, target.target_value),
  }));

  const { data: targetData, error: targetError } = await adminSupabase
    .from('payment_charge_template_targets')
    .insert(targets)
    .select('*');

  if (targetError) {
    throw new Error(`Failed to save payment charge targets: ${targetError.message}`);
  }

  const communityMap = await fetchCommunitiesByIds([template.community_id || ''].filter(Boolean));
  const agencyMap = await fetchAgenciesByIds([template.agency_id || ''].filter(Boolean));

  return serializeTemplate({
    template,
    community: template.community_id ? communityMap.get(template.community_id) || null : null,
    agency: template.agency_id ? agencyMap.get(template.agency_id) || null : null,
    targets: (targetData || []) as PaymentChargeTemplateTargetRow[],
  });
};

export const updatePaymentChargeTemplate = async (id: string, input: Partial<TemplateUpsertInput>, actorUserId?: string | null) => {
  const existing = await ensureTemplateExists(id);

  const updates: Record<string, unknown> = {
    updated_by: actorUserId || null,
    updated_at: new Date().toISOString(),
  };

  const assign = <K extends keyof TemplateUpsertInput>(field: K, mapper?: (value: NonNullable<TemplateUpsertInput[K]>) => unknown) => {
    const value = input[field];
    if (value !== undefined) {
      updates[field] = mapper ? mapper(value as NonNullable<TemplateUpsertInput[K]>) : value;
    }
  };

  assign('scope_level');
  assign('agency_id', (value) => value || null);
  assign('community_id', (value) => value || null);
  assign('name', (value) => String(value).trim());
  assign('charge_code', (value) => String(value).trim().toUpperCase());
  assign('catalog_key', (value) => String(value).trim());
  assign('category', (value) => String(value).trim());
  assign('charge_type');
  assign('amount', (value) => asNumber(value));
  assign('currency_code', (value) => String(value || DEFAULT_PAYMENT_CURRENCY_CODE).trim().toUpperCase());
  assign('billing_frequency');
  assign('billing_anchor_day', (value) => value ?? null);
  assign('billing_anchor_month', (value) => value ?? null);
  assign('start_date', (value) => normalizeDateOnly(value));
  assign('due_offset_days', (value) => value ?? 0);
  assign('grace_period_days', (value) => value ?? 0);
  assign('late_fee_type', (value) => value || 'none');
  assign('late_fee_value', (value) => value ?? 0);
  assign('auto_issue');
  assign('requires_approval');
  assign('is_active');
  assign('description', (value) => String(value || '').trim() || null);
  assign('metadata', (value) => value || {});

  const { data, error } = await adminSupabase
    .from('payment_charge_templates')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to update payment charge template: ${error.message}`);
  }

  if (input.targets) {
    const { error: deleteError } = await adminSupabase
      .from('payment_charge_template_targets')
      .delete()
      .eq('template_id', id);

    if (deleteError) {
      throw new Error(`Failed to replace payment charge targets: ${deleteError.message}`);
    }

    const targetRows = (input.targets.length ? input.targets : [{ target_type: 'all_units' as const }]).map((target) => ({
      template_id: id,
      target_type: target.target_type,
      target_value: normalizeTargetValue(target.target_type, target.target_value),
    }));

    const { error: insertError } = await adminSupabase
      .from('payment_charge_template_targets')
      .insert(targetRows);

    if (insertError) {
      throw new Error(`Failed to save updated payment charge targets: ${insertError.message}`);
    }
  }

  const updatedTemplate = data as PaymentChargeTemplateRow;
  const targetMap = await fetchTemplateTargets([id]);
  const communityMap = await fetchCommunitiesByIds([updatedTemplate.community_id || ''].filter(Boolean));
  const agencyMap = await fetchAgenciesByIds([updatedTemplate.agency_id || ''].filter(Boolean));

  return serializeTemplate({
    template: updatedTemplate,
    community: updatedTemplate.community_id ? communityMap.get(updatedTemplate.community_id) || null : null,
    agency: updatedTemplate.agency_id ? agencyMap.get(updatedTemplate.agency_id) || null : null,
    targets: targetMap.get(id) || [],
  });
};

export const previewPaymentChargeTemplate = async (templateId: string, input: PreviewIssueInput = {}) => {
  const template = await ensureTemplateExists(templateId);
  const preview = await buildPreview(template, input);

  return {
    template: serializeTemplate({ template, targets: preview.targets }),
    community: {
      id: preview.community.id,
      name: preview.community.name,
    },
    due_date: preview.due_date,
    billing_period_start: preview.billing_period_start,
    billing_period_end: preview.billing_period_end,
    run_mode: preview.run_mode,
    summary: preview.summary,
    items: preview.preview_items,
  };
};

export const issuePaymentChargeTemplate = async (templateId: string, input: PreviewIssueInput = {}, actorUserId?: string | null) => {
  const template = await ensureTemplateExists(templateId);
  const preview = await buildPreview(template, input);
  const result = await issueFromPreview({ preview, actorUserId });

  return {
    template: serializeTemplate({ template, targets: preview.targets }),
    community: {
      id: preview.community.id,
      name: preview.community.name,
    },
    due_date: preview.due_date,
    billing_period_start: preview.billing_period_start,
    billing_period_end: preview.billing_period_end,
    run: result.run,
    summary: preview.summary,
    obligations_created: result.obligations.length,
    obligations: result.obligations,
  };
};

export const listPaymentChargeRuns = async (filters: ListRunFilters = {}) => {
  let query = adminSupabase
    .from('payment_charge_runs')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.community_id) {
    query = query.eq('community_id', filters.community_id);
  }
  if (filters.template_id) {
    query = query.eq('template_id', filters.template_id);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to load payment charge runs: ${error.message}`);
  }

  const rows = (data || []) as PaymentChargeRunRow[];
  const templateIds = rows.map((row) => row.template_id);
  const communityIds = rows.map((row) => row.community_id);
  const agencyIds = rows.map((row) => row.agency_id || '').filter(Boolean);

  const [templateData, communityMap, agencyMap] = await Promise.all([
    adminSupabase.from('payment_charge_templates').select('*').in('id', Array.from(new Set(templateIds.filter(Boolean)))),
    fetchCommunitiesByIds(communityIds),
    fetchAgenciesByIds(agencyIds),
  ]);

  if (templateData.error) {
    throw new Error(`Failed to load templates for charge runs: ${templateData.error.message}`);
  }

  const templateMap = new Map(((templateData.data || []) as PaymentChargeTemplateRow[]).map((row) => [row.id, row]));

  return rows.map((row) =>
    serializeRun({
      run: row,
      template: templateMap.get(row.template_id) || null,
      community: communityMap.get(row.community_id) || null,
      agency: row.agency_id ? agencyMap.get(row.agency_id) || null : null,
    })
  );
};

export const getPaymentChargeRun = async (runId: string) => {
  const { data, error } = await adminSupabase
    .from('payment_charge_runs')
    .select('*')
    .eq('id', runId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load payment charge run: ${error.message}`);
  }

  const run = data as PaymentChargeRunRow | null;
  if (!run) {
    return null;
  }

  const template = await ensureTemplateExists(run.template_id);
  const communityMap = await fetchCommunitiesByIds([run.community_id]);
  const agencyMap = await fetchAgenciesByIds([run.agency_id || ''].filter(Boolean));
  const { data: obligations, error: obligationsError } = await adminSupabase
    .from('payment_obligations')
    .select('*')
    .eq('charge_run_id', run.id)
    .order('created_at', { ascending: false });

  if (obligationsError) {
    throw new Error(`Failed to load run obligations: ${obligationsError.message}`);
  }

  return {
    run: serializeRun({
      run,
      template,
      community: communityMap.get(run.community_id) || null,
      agency: run.agency_id ? agencyMap.get(run.agency_id) || null : null,
    }),
    obligations: obligations || [],
  };
};

export const runDuePaymentCharges = async ({
  communityId,
  agencyId,
  actorUserId,
}: {
  communityId?: string;
  agencyId?: string;
  actorUserId?: string | null;
}) => {
  let query = adminSupabase
    .from('payment_charge_templates')
    .select('*')
    .eq('is_active', true)
    .eq('auto_issue', true);

  if (communityId) {
    query = query.eq('community_id', communityId);
  }
  if (agencyId) {
    query = query.eq('agency_id', agencyId);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to load due payment charge templates: ${error.message}`);
  }

  const today = new Date();
  const templates = ((data || []) as PaymentChargeTemplateRow[]).filter((template) => isTemplateDueToday(template, today));
  const createdRuns: Array<Record<string, unknown>> = [];

  for (const template of templates) {
    if (template.scope_level === 'community') {
      try {
        const issued = await issuePaymentChargeTemplate(template.id, { run_mode: 'scheduled' }, actorUserId);
        if (issued.run) {
          createdRuns.push(issued.run);
        }
      } catch (error: any) {
        if (!String(error.message || '').includes('already been issued')) {
          throw error;
        }
      }
      continue;
    }

    const { data: communities, error: communitiesError } = await adminSupabase
      .from('communities')
      .select('id')
      .eq('agency_id', template.agency_id);

    if (communitiesError) {
      throw new Error(`Failed to load agency communities for scheduled charge run: ${communitiesError.message}`);
    }

    for (const community of communities || []) {
      try {
        const issued = await issuePaymentChargeTemplate(template.id, {
          community_id: community.id,
          run_mode: 'scheduled',
        }, actorUserId);
        if (issued.run) {
          createdRuns.push(issued.run);
        }
      } catch (error: any) {
        if (!String(error.message || '').includes('already been issued')) {
          throw error;
        }
      }
    }
  }

  return {
    processed_templates: templates.length,
    created_runs: createdRuns.length,
    runs: createdRuns,
  };
};
