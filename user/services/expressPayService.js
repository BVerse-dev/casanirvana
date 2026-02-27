import Constants from "expo-constants";
import { supabase } from "../utils/supabase";

const API_BASE_URL =
  Constants.expoConfig?.extra?.API_BASE_URL ||
  process.env.API_BASE_URL ||
  "http://localhost:8080";

const TERMINAL_STATUSES = new Set(["completed", "failed", "cancelled"]);

const buildUrl = (path) => `${API_BASE_URL}${path}`;

const normalizeStatus = (value) => {
  if (!value) return "pending";
  const normalized = String(value).toLowerCase();
  if (normalized === "processing" || normalized === "initiated") return "pending";
  return normalized;
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
    const response = await fetch(buildUrl(path), {
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
    path: "/payments/expresspay/initiate",
    method: "POST",
    body: payload,
    fallbackError: "Failed to initiate payment. Please try again.",
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
