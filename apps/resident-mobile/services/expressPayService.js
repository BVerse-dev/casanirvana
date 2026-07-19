import { supabase } from "../utils/supabase";
import { buildApiUrl } from "../config/api";

const TERMINAL_STATUSES = new Set(["completed", "failed", "cancelled", "expired"]);

const normalizeStatus = (value) => {
  if (!value) return "pending";
  const normalized = String(value).toLowerCase();
  if (normalized === "processing" || normalized === "initiated") return "pending";
  return normalized;
};

const derivePersonalHubFulfillmentState = ({ payment, transaction }) => {
  const paymentStatus = normalizeStatus(payment?.status);
  const transactionStatus = normalizeStatus(transaction?.status);

  if (paymentStatus === "failed" || paymentStatus === "cancelled" || paymentStatus === "expired") {
    return {
      paymentStatus,
      transactionStatus,
      fulfillmentState: "payment_failed",
    };
  }

  if (paymentStatus !== "completed") {
    return {
      paymentStatus,
      transactionStatus,
      fulfillmentState: "payment_pending",
    };
  }

  if (transactionStatus === "completed") {
    return {
      paymentStatus,
      transactionStatus,
      fulfillmentState: "completed",
    };
  }

  if (transactionStatus === "failed") {
    return {
      paymentStatus,
      transactionStatus,
      fulfillmentState: "fulfillment_failed",
    };
  }

  return {
    paymentStatus,
    transactionStatus,
    fulfillmentState: "fulfillment_pending",
  };
};

const extractErrorMessage = (payload, fallback) => {
  if (!payload) return fallback;
  if (typeof payload.error === "string") return payload.error;
  if (payload.error?.message) return payload.error.message;
  if (typeof payload.message === "string") return payload.message;
  return fallback;
};

const callExpressPayEndpoint = async ({
  path,
  method = "GET",
  body,
  fallbackError,
}) => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    return {
      success: false,
      error: "Unable to authenticate request. Please sign in again.",
      data: null,
    };
  }

  try {
    const response = await fetch(buildApiUrl(path), {
      // Use the resolved backend base URL from Expo config/env.
      // This avoids falling back to device-localhost on physical devices.
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        error: extractErrorMessage(payload, fallbackError),
        data: null,
      };
    }

    return {
      success: true,
      error: null,
      data: payload?.data ?? payload ?? null,
    };
  } catch (error) {
    return {
      success: false,
      error: error?.message || fallbackError,
      data: null,
    };
  }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const initiateExpressPayPayment = async (payload) =>
  callExpressPayEndpoint({
    path: "/payments/transactions/initiate",
    method: "POST",
    body: payload,
    fallbackError: "Failed to initiate payment. Please try again.",
  });

export const getPersonalHubCatalogProviders = async ({
  serviceType,
  billCategory,
}) => {
  const params = new URLSearchParams();
  if (serviceType) params.set("service_type", serviceType);
  if (billCategory) params.set("bill_category", billCategory);

  const query = params.toString();
  return callExpressPayEndpoint({
    path: `/personal-hub/catalog/providers${query ? `?${query}` : ""}`,
    method: "GET",
    fallbackError: "Failed to load Personal Hub providers.",
  });
};

export const queryPersonalHubCatalog = async (payload) =>
  callExpressPayEndpoint({
    path: "/personal-hub/catalog/query",
    method: "POST",
    body: payload,
    fallbackError: "Failed to validate the selected Personal Hub service.",
  });

export const initiatePersonalHubCheckout = async (payload) =>
  callExpressPayEndpoint({
    path: "/personal-hub/transactions/initiate",
    method: "POST",
    body: payload,
    fallbackError: "Failed to initiate Personal Hub checkout.",
  });

export const getPersonalHubTransactionStatus = async (transactionId) =>
  callExpressPayEndpoint({
    path: `/personal-hub/transactions/${transactionId}/status`,
    method: "GET",
    fallbackError: "Failed to load Personal Hub transaction status.",
  });

export const verifyExpressPayPayment = async ({ paymentId, token, orderId }) =>
  callExpressPayEndpoint({
    path: "/payments/expresspay/verify",
    method: "POST",
    body: {
      payment_id: paymentId || undefined,
      token: token || undefined,
      order_id: orderId || undefined,
    },
    fallbackError: "Failed to verify payment status.",
  });

export const getExpressPayPaymentStatus = async (paymentId) =>
  callExpressPayEndpoint({
    path: `/payments/expresspay/status/${paymentId}`,
    method: "GET",
    fallbackError: "Failed to fetch payment status.",
  });

export const reconcileExpressPayPayment = async ({
  paymentId,
  token,
  orderId,
  pollAttempts = 2,
  pollDelayMs = 1500,
}) => {
  const verifyResult = await verifyExpressPayPayment({ paymentId, token, orderId });

  if (!verifyResult.success) {
    const statusResult = paymentId ? await getExpressPayPaymentStatus(paymentId) : null;
    const fallbackStatus = normalizeStatus(statusResult?.data?.status);

    return {
      success: Boolean(statusResult?.success),
      error: verifyResult.error,
      status: fallbackStatus,
      payment: statusResult?.data || null,
      providerResult: null,
    };
  }

  let payment = verifyResult?.data?.payment || null;
  let status = normalizeStatus(payment?.status);
  let attempts = 0;

  while (!TERMINAL_STATUSES.has(status) && attempts < pollAttempts && paymentId) {
    await sleep(pollDelayMs);
    attempts += 1;
    const statusResult = await getExpressPayPaymentStatus(paymentId);
    if (!statusResult.success) {
      break;
    }
    payment = statusResult.data || payment;
    status = normalizeStatus(payment?.status);
  }

  return {
    success: true,
    error: null,
    status,
    payment,
    providerResult: verifyResult?.data?.provider_result || null,
  };
};

export const reconcilePersonalHubCheckout = async ({
  paymentId,
  token,
  orderId,
  sourceId,
  paymentPollAttempts = 2,
  fulfillmentPollAttempts = 4,
  pollDelayMs = 1500,
}) => {
  const paymentResult = await reconcileExpressPayPayment({
    paymentId,
    token,
    orderId,
    pollAttempts: paymentPollAttempts,
    pollDelayMs,
  });

  let transaction = null;
  let transactionError = null;

  const loadTransaction = async () => {
    if (!sourceId) {
      return null;
    }

    const result = await getPersonalHubTransactionStatus(sourceId);
    if (!result.success) {
      transactionError = result.error || "Failed to load Personal Hub transaction status.";
      return null;
    }

    transactionError = null;
    return result.data?.transaction || null;
  };

  transaction = await loadTransaction();

  let derived = derivePersonalHubFulfillmentState({
    payment: paymentResult.payment,
    transaction,
  });

  let attempts = 0;
  while (
    sourceId &&
    derived.fulfillmentState === "fulfillment_pending" &&
    attempts < fulfillmentPollAttempts
  ) {
    await sleep(pollDelayMs);
    attempts += 1;
    transaction = await loadTransaction();
    derived = derivePersonalHubFulfillmentState({
      payment: paymentResult.payment,
      transaction,
    });
  }

  return {
    success: paymentResult.success,
    error: paymentResult.error || transactionError,
    payment: paymentResult.payment,
    providerResult: paymentResult.providerResult,
    transaction,
    paymentStatus: derived.paymentStatus,
    transactionStatus: derived.transactionStatus,
    fulfillmentState: derived.fulfillmentState,
  };
};
