import { getPersonalHubCatalogProviders } from "./expressPayService";

const PROVIDER_THEMES = [
  { keywords: ["mtn"], logo: require("../assets/images/pay1.png"), color: "#FFB900" },
  { keywords: ["telecel", "vodafone"], logo: require("../assets/images/pay2.png"), color: "#E60000" },
  { keywords: ["airtel", "airteltigo", "glo", "data"], logo: require("../assets/images/pay3.png"), color: "#0057B8" },
  { keywords: ["bank", "firstbank", "gtbank", "ecg", "dstv"], logo: require("../assets/images/pay4.png"), color: "#00A651" },
  { keywords: ["insurance", "life", "mutual", "axa", "leadway"], logo: require("../assets/images/pay5.png"), color: "#6A1B9A" },
];

const TV_KEYWORDS = ["dstv", "gotv", "startimes", "showmax", "boxoffice", "entertainment", "tv"];
const UTILITY_KEYWORDS = ["ecg", "electric", "water", "waste", "power", "utility", "phcn", "zoomlion"];
const ALLOW_PROVIDER_FALLBACK =
  __DEV__ || process.env.EXPO_PUBLIC_ALLOW_PERSONAL_HUB_PROVIDER_FALLBACK === "true";

const FALLBACK_PROVIDERS = {
  airtime: [
    { id: "fallback_airtime_mtn", provider_name: "MTN Prepaid Topup", service_type: "airtime" },
    { id: "fallback_airtime_telecel", provider_name: "Telecel Prepaid Topup", service_type: "airtime" },
    { id: "fallback_airtime_airtel", provider_name: "AirtelTigo Prepaid Topup", service_type: "airtime" },
  ],
  data: [
    { id: "fallback_data_mtn", provider_name: "MTN 4G Data", service_type: "data" },
    { id: "fallback_data_telecel", provider_name: "Telecel Broadband", service_type: "data" },
    { id: "fallback_data_airtel", provider_name: "AirtelTigo Internet", service_type: "data" },
  ],
  money_transfer: [
    { id: "fallback_transfer_mtn", provider_name: "MTN Mobile Money", service_type: "money_transfer" },
    { id: "fallback_transfer_telecel", provider_name: "Telecel Cash", service_type: "money_transfer" },
    { id: "fallback_transfer_airtel", provider_name: "AirtelTigo Money", service_type: "money_transfer" },
    { id: "fallback_transfer_bank", provider_name: "Bank Transfer", service_type: "money_transfer" },
  ],
  bill_payment_utilities: [
    { id: "fallback_bill_ecg_postpaid", provider_name: "ECG Postpaid", service_type: "bill_payment" },
    { id: "fallback_bill_ecg_prepaid", provider_name: "ECG Smart Prepaid", service_type: "bill_payment" },
    { id: "fallback_bill_water", provider_name: "Ghana Water", service_type: "bill_payment" },
    { id: "fallback_bill_zoomlion", provider_name: "Zoomlion Waste Management", service_type: "bill_payment" },
  ],
  bill_payment_tv: [
    { id: "fallback_bill_dstv", provider_name: "DStv", service_type: "bill_payment" },
    { id: "fallback_bill_dstv_boxoffice", provider_name: "DStv BoxOffice", service_type: "bill_payment" },
    { id: "fallback_bill_gotv", provider_name: "GOtv", service_type: "bill_payment" },
  ],
  insurance: [
    { id: "fallback_ins_enterprise", provider_name: "Enterprise Life", service_type: "insurance" },
    { id: "fallback_ins_akwantupa", provider_name: "AkwantuPa", service_type: "insurance" },
    { id: "fallback_ins_hollard", provider_name: "Hollard Life", service_type: "insurance" },
    { id: "fallback_ins_metropolitan", provider_name: "Metropolitan Life Insurance", service_type: "insurance" },
    { id: "fallback_ins_old_mutual", provider_name: "Old Mutual", service_type: "insurance" },
  ],
};

const slugify = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const isUuid = (value = "") =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const inferBillCategory = (providerName = "") => {
  const normalized = providerName.toLowerCase();
  if (TV_KEYWORDS.some((keyword) => normalized.includes(keyword))) return "tv";
  if (UTILITY_KEYWORDS.some((keyword) => normalized.includes(keyword))) return "utilities";
  return "utilities";
};

const getThemeForProvider = (providerName = "") => {
  const normalized = providerName.toLowerCase();
  for (const theme of PROVIDER_THEMES) {
    if (theme.keywords.some((keyword) => normalized.includes(keyword))) {
      return theme;
    }
  }
  return { logo: require("../assets/images/pay4.png"), color: "#455A64" };
};

const getProviderCode = (serviceType, providerName = "") => {
  const normalized = providerName.toLowerCase();

  const explicitCodes = {
    "ecg postpaid": "ecg_postpaid",
    "ecg smart prepaid": "ecg_prepaid",
    "ecg prepaid": "ecg_prepaid",
    "ghana water": "ghana_water",
    "zoomlion waste management": "zoomlion",
    dstv: "dstv",
    "dstv boxoffice": "dstv_boxoffice",
    gotv: "gotv",
    "enterprise life": "enterprise_life",
    akwantupa: "akwantupa",
    "hollard life": "hollard_life",
    "metropolitan life insurance": "metropolitan_life",
    "old mutual": "old_mutual",
    "mtn mobile money": "mtn",
    "telecel cash": "telecel",
    "vodafone cash": "telecel",
    "airteltigo money": "airtel",
    "bank transfer": "bank",
  };

  if (explicitCodes[normalized]) return explicitCodes[normalized];

  if (serviceType === "airtime" || serviceType === "data") {
    if (normalized.includes("mtn")) return "mtn";
    if (normalized.includes("telecel") || normalized.includes("vodafone")) return "telecel";
    if (normalized.includes("airtel")) return "airtel";
  }

  if (serviceType === "money_transfer") {
    if (normalized.includes("bank")) return "bank";
    if (normalized.includes("mtn")) return "mtn";
    if (normalized.includes("telecel") || normalized.includes("vodafone")) return "telecel";
    if (normalized.includes("airtel")) return "airtel";
  }

  return slugify(providerName) || slugify(serviceType) || "provider";
};

const getSubtitle = (serviceType, providerName) => {
  switch (serviceType) {
    case "airtime":
      return `Buy airtime for ${providerName} numbers`;
    case "data":
      return `Buy data bundles for ${providerName} numbers`;
    case "money_transfer":
      return providerName.toLowerCase().includes("bank")
        ? `Send money to ${providerName} accounts`
        : `Send money to ${providerName} users`;
    case "bill_payment":
      return `Pay bills with ${providerName}`;
    case "insurance":
      return `Pay insurance premiums with ${providerName}`;
    default:
      return providerName;
  }
};

const getIcon = (serviceType) => {
  switch (serviceType) {
    case "airtime":
      return "phone-android";
    case "data":
      return "wifi";
    case "money_transfer":
      return "cash";
    case "insurance":
      return "shield-outline";
    default:
      return "receipt";
  }
};

const mapProviderRow = (row) => {
  const serviceType = (row.service_type || "").toLowerCase();
  const providerName = row.provider_name || "Provider";
  const theme = getThemeForProvider(providerName);

  return {
    id: row.id || getProviderCode(serviceType, providerName),
    providerId: isUuid(row.id) ? row.id : null,
    providerCode: row.external_service_code || getProviderCode(serviceType, providerName),
    externalServiceCode: row.external_service_code || null,
    name: providerName,
    serviceType,
    subtitle: getSubtitle(serviceType, providerName),
    logo: theme.logo,
    color: theme.color,
    icon: getIcon(serviceType),
    billCategory:
      serviceType === "bill_payment"
        ? row.bill_category || inferBillCategory(providerName)
        : null,
    supportsQuery: Boolean(row.supports_query),
    supportsPay: row.supports_pay !== false,
    supportsStatus: row.supports_status !== false,
    providerMetadata: row.provider_metadata || {},
  };
};

const getFallbackProviders = (serviceType, billCategory) => {
  if (serviceType === "bill_payment") {
    const key = billCategory === "tv" ? "bill_payment_tv" : "bill_payment_utilities";
    return (FALLBACK_PROVIDERS[key] || []).map(mapProviderRow);
  }

  return (FALLBACK_PROVIDERS[serviceType] || []).map(mapProviderRow);
};

const filterForBillCategory = (providers, billCategory) => {
  if (!billCategory) return providers;
  return providers.filter((provider) => provider.billCategory === billCategory);
};

export const getActiveServiceProviders = async ({ serviceType, billCategory = null }) => {
  const fallbackMessage =
    "Live ExpressPay catalog data is unavailable. The app is using fallback provider data.";
  const unavailableMessage =
    "Live ExpressPay catalog data is unavailable and fallback providers are disabled in this build.";

  try {
    const { data, error } = await getPersonalHubCatalogProviders({
      serviceType,
      billCategory: serviceType === "bill_payment" ? billCategory : null,
    });

    if (error) {
      if (ALLOW_PROVIDER_FALLBACK) {
        const fallback = getFallbackProviders(serviceType, billCategory);
        return {
          data: fallback,
          error,
          warning: fallbackMessage,
          usedFallback: true,
        };
      }

      return {
        data: [],
        error: new Error(error?.message || unavailableMessage),
        warning: unavailableMessage,
        usedFallback: false,
      };
    }

    const mapped = (data?.items || []).map(mapProviderRow);
    const filtered = serviceType === "bill_payment"
      ? filterForBillCategory(mapped, billCategory)
      : mapped;

    if (!filtered.length) {
      if (ALLOW_PROVIDER_FALLBACK) {
        const fallback = getFallbackProviders(serviceType, billCategory);
        return {
          data: fallback,
          error: null,
          warning: fallbackMessage,
          usedFallback: true,
        };
      }

      return {
        data: [],
        error: new Error("No live providers are currently configured for this service."),
        warning: "No live providers are currently configured for this service.",
        usedFallback: false,
      };
    }

    return { data: filtered, error: null, warning: null, usedFallback: false };
  } catch (error) {
    if (ALLOW_PROVIDER_FALLBACK) {
      const fallback = getFallbackProviders(serviceType, billCategory);
      return {
        data: fallback,
        error,
        warning: fallbackMessage,
        usedFallback: true,
      };
    }

    return {
      data: [],
      error: error instanceof Error ? error : new Error(unavailableMessage),
      warning: unavailableMessage,
      usedFallback: false,
    };
  }
};
