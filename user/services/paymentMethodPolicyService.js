import { supabase } from "../utils/supabase";
import { buildApiUrl } from "../config/api";

const CACHE_TTL_MS = 30 * 1000;

let cachedPolicy = null;
let cachedAt = 0;

const DEFAULT_POLICY = {
  creditCardEnabled: true,
  mobileMoneyEnabled: true,
  payPalEnabled: false,
  bankTransferEnabled: false,
  minPaymentAmount: null,
  maxPaymentAmount: null,
  dailyPaymentLimit: null,
  monthlyPaymentLimit: null,
  defaultCurrencyCode: "GHS",
  defaultCurrencySymbol: "GH₵",
};

const parseSettingValue = (value) => {
  if (typeof value !== "string") return "";

  const trimmed = value.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
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
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      throw new Error("Unable to authenticate payment settings request.");
    }

    const response = await fetch(buildApiUrl("/payments/policy"), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        payload?.error || payload?.message || "Failed to load payment method settings."
      );
    }

    const policy = payload?.data ?? {};

    cachedPolicy = {
      creditCardEnabled:
        typeof policy.creditCardEnabled === "boolean"
          ? policy.creditCardEnabled
          : DEFAULT_POLICY.creditCardEnabled,
      mobileMoneyEnabled:
        typeof policy.mobileMoneyEnabled === "boolean"
          ? policy.mobileMoneyEnabled
          : DEFAULT_POLICY.mobileMoneyEnabled,
      payPalEnabled:
        typeof policy.payPalEnabled === "boolean"
          ? policy.payPalEnabled
          : DEFAULT_POLICY.payPalEnabled,
      bankTransferEnabled:
        typeof policy.bankTransferEnabled === "boolean"
          ? policy.bankTransferEnabled
          : DEFAULT_POLICY.bankTransferEnabled,
      minPaymentAmount:
        typeof policy.minPaymentAmount === "number"
          ? policy.minPaymentAmount
          : parseNumberSetting(policy.minPaymentAmount),
      maxPaymentAmount:
        typeof policy.maxPaymentAmount === "number"
          ? policy.maxPaymentAmount
          : parseNumberSetting(policy.maxPaymentAmount),
      dailyPaymentLimit:
        typeof policy.dailyPaymentLimit === "number"
          ? policy.dailyPaymentLimit
          : parseNumberSetting(policy.dailyPaymentLimit),
      monthlyPaymentLimit:
        typeof policy.monthlyPaymentLimit === "number"
          ? policy.monthlyPaymentLimit
          : parseNumberSetting(policy.monthlyPaymentLimit),
      defaultCurrencyCode:
        typeof policy.defaultCurrencyCode === "string" && policy.defaultCurrencyCode.trim()
          ? policy.defaultCurrencyCode.trim().toUpperCase()
          : DEFAULT_POLICY.defaultCurrencyCode,
      defaultCurrencySymbol:
        typeof policy.defaultCurrencySymbol === "string" && policy.defaultCurrencySymbol.trim()
          ? policy.defaultCurrencySymbol.trim()
          : DEFAULT_POLICY.defaultCurrencySymbol,
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
  if (!policy) return false;

  switch (methodTitle) {
    case "Credit Card":
      return policy.creditCardEnabled;
    case "Mobile Money":
      return policy.mobileMoneyEnabled;
    case "PayPal":
      return policy.payPalEnabled;
    default:
      return false;
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
