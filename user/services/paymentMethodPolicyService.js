import { supabase } from "../utils/supabase";

const CACHE_TTL_MS = 30 * 1000;

let cachedPolicy = null;
let cachedAt = 0;

const DEFAULT_POLICY = {
  creditCardEnabled: true,
  mobileMoneyEnabled: true,
  payPalEnabled: true,
  bankTransferEnabled: true,
  minPaymentAmount: null,
  maxPaymentAmount: null,
  dailyPaymentLimit: null,
  monthlyPaymentLimit: null,
};

const parseSettingValue = (value) => {
  if (typeof value !== "string") return "";

  const trimmed = value.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
};

const parseBooleanSetting = (value, fallback = true) => {
  const normalized = parseSettingValue(value).toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return fallback;
};

const parseNumberSetting = (value) => {
  const normalized = parseSettingValue(value);
  if (!normalized) return null;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const shouldUseCache = (forceRefresh) =>
  !forceRefresh && cachedPolicy && Date.now() - cachedAt < CACHE_TTL_MS;

export async function getPaymentMethodPolicy(forceRefresh = false) {
  if (shouldUseCache(forceRefresh)) {
    return cachedPolicy;
  }

  try {
    const { data, error } = await supabase
      .from("app_settings")
      .select("key, value")
      .eq("category", "payment_methods");

    if (error) {
      throw error;
    }

    const settingsMap = new Map();
    (data || []).forEach((row) => {
      settingsMap.set(String(row.key), row.value ?? null);
    });

    cachedPolicy = {
      creditCardEnabled: parseBooleanSetting(settingsMap.get("credit_card_enabled"), true),
      mobileMoneyEnabled: parseBooleanSetting(settingsMap.get("expresspay_enabled"), true),
      payPalEnabled: parseBooleanSetting(settingsMap.get("wallet_enabled"), true),
      bankTransferEnabled: parseBooleanSetting(settingsMap.get("bank_transfer_enabled"), true),
      minPaymentAmount: parseNumberSetting(settingsMap.get("min_payment_amount")),
      maxPaymentAmount: parseNumberSetting(settingsMap.get("max_payment_amount")),
      dailyPaymentLimit: parseNumberSetting(settingsMap.get("daily_payment_limit")),
      monthlyPaymentLimit: parseNumberSetting(settingsMap.get("monthly_payment_limit")),
    };
    cachedAt = Date.now();

    return cachedPolicy;
  } catch (error) {
    console.error("[PaymentPolicy] Failed to load payment method settings:", error);
    cachedPolicy = { ...DEFAULT_POLICY };
    cachedAt = Date.now();
    return cachedPolicy;
  }
}

export const isPaymentMethodEnabled = (policy, methodTitle) => {
  if (!policy) return true;

  switch (methodTitle) {
    case "Credit Card":
      return policy.creditCardEnabled;
    case "Mobile Money":
      return policy.mobileMoneyEnabled;
    case "PayPal":
      return policy.payPalEnabled;
    default:
      return true;
  }
};

export const getPaymentAmountValidationMessage = (policy, amount) => {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return "Invalid payment amount.";
  }

  if (policy?.minPaymentAmount !== null && policy?.minPaymentAmount !== undefined && numericAmount < policy.minPaymentAmount) {
    return `The minimum payment amount is GHS ${policy.minPaymentAmount.toFixed(2)}.`;
  }

  if (policy?.maxPaymentAmount !== null && policy?.maxPaymentAmount !== undefined && numericAmount > policy.maxPaymentAmount) {
    return `The maximum payment amount is GHS ${policy.maxPaymentAmount.toFixed(2)}.`;
  }

  return null;
};

export const validatePaymentSelection = ({ policy, methodTitle, amount }) => {
  if (!isPaymentMethodEnabled(policy, methodTitle)) {
    return "This payment method is currently unavailable. Please choose a different payment method.";
  }

  return getPaymentAmountValidationMessage(policy, amount);
};
