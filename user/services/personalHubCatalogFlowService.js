import { formatMoney } from "../utils/money";

const asObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value) ? value : {};

const asNumber = (value) => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const buildCatalogQueryPayload = ({ transactionType, identifier }) => {
  const trimmed = String(identifier || "").trim();

  if (!trimmed) {
    return {};
  }

  switch (transactionType) {
    case "airtime":
    case "data":
      return {
        phone_number: trimmed,
        phone: trimmed,
        msisdn: trimmed,
        account_number: trimmed,
      };
    case "bill_payment":
      return {
        account_number: trimmed,
        meter_number: trimmed,
        smartcard_number: trimmed,
        customer_id: trimmed,
      };
    case "insurance":
      return {
        policy_number: trimmed,
        member_number: trimmed,
        account_number: trimmed,
      };
    default:
      return {
        account_number: trimmed,
      };
  }
};

export const normalizeCatalogOptions = ({ options = [], queryContext = {} }) => {
  const safeOptions = Array.isArray(options) ? options.map(asObject) : [];

  if (!safeOptions.length) {
    const fallbackAmount = asNumber(queryContext.amount);
    if (fallbackAmount === null) {
      return [];
    }

    return [
      {
        id: "default_query_amount",
        name: "Provider Amount",
        amount: fallbackAmount,
        amountLabel: formatMoney(fallbackAmount),
        dataAmount: queryContext.data_amount || null,
        validityDays: asNumber(queryContext.validity_days),
        validityLabel: queryContext.validity_days ? `${queryContext.validity_days} days` : null,
        description: queryContext.customer_name || queryContext.account_number || null,
        code: null,
        raw: {},
      },
    ];
  }

  return safeOptions.map((option, index) => {
    const amount = asNumber(option.amount);
    const validityDays = asNumber(option.validity_days);
    return {
      id: option.id || option.code || `option_${index + 1}`,
      name: option.name || option.description || `Option ${index + 1}`,
      amount,
      amountLabel: amount === null ? null : formatMoney(amount),
      dataAmount: option.data_amount || null,
      validityDays,
      validityLabel: validityDays === null ? null : `${validityDays} days`,
      description: option.description || null,
      code: option.code || null,
      raw: option.raw || {},
    };
  });
};

export const getQueryContextLabel = (queryContext, fallback) => {
  const safe = asObject(queryContext);
  return (
    safe.customer_name ||
    safe.account_number ||
    safe.phone_number ||
    safe.policy_number ||
    fallback ||
    null
  );
};
