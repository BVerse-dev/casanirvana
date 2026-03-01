import { adminSupabase } from '../lib/supabase';

type PaymentMethodKey = 'card' | 'mobile_money' | 'paypal' | 'bank_transfer' | 'cash' | 'cheque';

export type PaymentMethodPolicy = {
  creditCardEnabled: boolean;
  mobileMoneyEnabled: boolean;
  payPalEnabled: boolean;
  bankTransferEnabled: boolean;
  cashEnabled: boolean;
  chequeEnabled: boolean;
  minPaymentAmount: number | null;
  maxPaymentAmount: number | null;
  dailyPaymentLimit: number | null;
  monthlyPaymentLimit: number | null;
};

export type ClientPaymentMethodPolicy = PaymentMethodPolicy & {
  defaultCurrencyCode: string;
  defaultCurrencySymbol: string;
};

type PaymentRow = {
  amount: number | string | null;
  status: string | null;
  created_at: string | null;
};

const INACTIVE_PAYMENT_STATUSES = new Set(['failed', 'cancelled', 'expired']);
const DEFAULT_PAYMENT_CURRENCY_CODE = (process.env.DEFAULT_PAYMENT_CURRENCY || 'GHS').trim().toUpperCase() || 'GHS';
const DEFAULT_PAYMENT_CURRENCY_SYMBOL =
  process.env.DEFAULT_PAYMENT_CURRENCY_SYMBOL?.trim() ||
  (DEFAULT_PAYMENT_CURRENCY_CODE === 'GHS' ? 'GH₵' : DEFAULT_PAYMENT_CURRENCY_CODE);

const parseSettingValue = (value: string | null | undefined) => {
  if (typeof value !== 'string') return '';

  const trimmed = value.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
};

const parseBooleanSetting = (value: string | null | undefined, fallback = true) => {
  const normalized = parseSettingValue(value).toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  return fallback;
};

const parseNumberSetting = (value: string | null | undefined) => {
  const normalized = parseSettingValue(value);
  if (!normalized) return null;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeMethodKey = (method: string): PaymentMethodKey => {
  const normalized = String(method || 'card').trim().toLowerCase();

  switch (normalized) {
    case 'mobile_money':
    case 'mobile-money':
    case 'mobile money':
    case 'expresspay':
      return 'mobile_money';
    case 'paypal':
      return 'paypal';
    case 'bank_transfer':
    case 'bank-transfer':
    case 'bank transfer':
      return 'bank_transfer';
    case 'cash':
      return 'cash';
    case 'cheque':
    case 'check':
      return 'cheque';
    case 'card':
    case 'credit_card':
    case 'credit-card':
    case 'credit card':
    case 'debit_card':
    case 'debit-card':
    case 'debit card':
    default:
      return 'card';
  }
};

const sumPaymentAmounts = (rows: PaymentRow[], thresholdIso: string) =>
  rows.reduce((total, row) => {
    if (!row || !row.created_at) return total;
    if (row.created_at < thresholdIso) return total;

    const status = String(row.status || '').toLowerCase();
    if (INACTIVE_PAYMENT_STATUSES.has(status)) {
      return total;
    }

    const amount = Number(row.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return total;
    }

    return total + amount;
  }, 0);

export const getPaymentMethodPolicy = async (): Promise<PaymentMethodPolicy> => {
  const { data, error } = await adminSupabase
    .from('app_settings')
    .select('key, value')
    .eq('category', 'payment_methods');

  if (error) {
    throw new Error(`Failed to load payment method settings: ${error.message}`);
  }

  const settingsMap = new Map<string, string | null>();
  for (const row of data || []) {
    settingsMap.set(String(row.key), row.value ?? null);
  }

  return {
    creditCardEnabled: parseBooleanSetting(settingsMap.get('credit_card_enabled'), true),
    mobileMoneyEnabled: parseBooleanSetting(settingsMap.get('expresspay_enabled'), true),
    payPalEnabled: parseBooleanSetting(settingsMap.get('wallet_enabled'), true),
    bankTransferEnabled: parseBooleanSetting(settingsMap.get('bank_transfer_enabled'), true),
    cashEnabled: parseBooleanSetting(settingsMap.get('cash_enabled'), true),
    chequeEnabled: parseBooleanSetting(settingsMap.get('cheque_enabled'), true),
    minPaymentAmount: parseNumberSetting(settingsMap.get('min_payment_amount')),
    maxPaymentAmount: parseNumberSetting(settingsMap.get('max_payment_amount')),
    dailyPaymentLimit: parseNumberSetting(settingsMap.get('daily_payment_limit')),
    monthlyPaymentLimit: parseNumberSetting(settingsMap.get('monthly_payment_limit')),
  };
};

export const getClientPaymentMethodPolicy = async (): Promise<ClientPaymentMethodPolicy> => {
  const policy = await getPaymentMethodPolicy();

  return {
    ...policy,
    defaultCurrencyCode: DEFAULT_PAYMENT_CURRENCY_CODE,
    defaultCurrencySymbol: DEFAULT_PAYMENT_CURRENCY_SYMBOL,
  };
};

const isMethodEnabled = (policy: PaymentMethodPolicy, method: PaymentMethodKey) => {
  switch (method) {
    case 'mobile_money':
      return policy.mobileMoneyEnabled;
    case 'paypal':
      return policy.payPalEnabled;
    case 'bank_transfer':
      return policy.bankTransferEnabled;
    case 'cash':
      return policy.cashEnabled;
    case 'cheque':
      return policy.chequeEnabled;
    case 'card':
    default:
      return policy.creditCardEnabled;
  }
};

export const assertPaymentMethodAllowed = async ({
  paymentMethod,
  amount,
  payerId,
}: {
  paymentMethod: string;
  amount: number;
  payerId: string;
}) => {
  const policy = await getPaymentMethodPolicy();
  const normalizedMethod = normalizeMethodKey(paymentMethod);

  if (!isMethodEnabled(policy, normalizedMethod)) {
    throw new Error('This payment method is currently unavailable. Please select a different payment method.');
  }

  if (policy.minPaymentAmount !== null && amount < policy.minPaymentAmount) {
    throw new Error(`The minimum payment amount is GHS ${policy.minPaymentAmount.toFixed(2)}.`);
  }

  if (policy.maxPaymentAmount !== null && amount > policy.maxPaymentAmount) {
    throw new Error(`The maximum payment amount is GHS ${policy.maxPaymentAmount.toFixed(2)}.`);
  }

  if (!policy.dailyPaymentLimit && !policy.monthlyPaymentLimit) {
    return policy;
  }

  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const dayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  const { data, error } = await adminSupabase
    .from('payments')
    .select('amount, status, created_at')
    .eq('payer_id', payerId)
    .gte('created_at', monthStart.toISOString())
    .lt('created_at', monthEnd.toISOString());

  if (error) {
    throw new Error(`Failed to evaluate payment limits: ${error.message}`);
  }

  const relevantRows = Array.isArray(data) ? (data as PaymentRow[]) : [];

  const monthlyTotal = sumPaymentAmounts(relevantRows, monthStart.toISOString());
  const dailyTotal = sumPaymentAmounts(relevantRows, dayStart.toISOString());

  if (policy.dailyPaymentLimit !== null && dailyTotal + amount > policy.dailyPaymentLimit) {
    throw new Error(`This payment exceeds the daily limit of GHS ${policy.dailyPaymentLimit.toFixed(2)}.`);
  }

  if (policy.monthlyPaymentLimit !== null && monthlyTotal + amount > policy.monthlyPaymentLimit) {
    throw new Error(`This payment exceeds the monthly limit of GHS ${policy.monthlyPaymentLimit.toFixed(2)}.`);
  }

  return policy;
};
