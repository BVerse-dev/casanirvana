import { supabase } from "../utils/supabase";
import { buildApiUrl } from "../config/api";

const extractErrorMessage = (payload, fallback) => {
  if (!payload) return fallback;
  if (typeof payload.error === "string") return payload.error;
  if (payload.error?.message) return payload.error.message;
  if (typeof payload.message === "string") return payload.message;
  return fallback;
};

const authenticatedApiRequest = async ({
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
    throw new Error("Unable to authenticate payment request.");
  }

  const response = await fetch(buildApiUrl(path), {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(extractErrorMessage(payload, fallbackError));
  }

  return payload?.data ?? {};
};

export const fetchPaymentObligations = async () => {
  const data = await authenticatedApiRequest({
    path: "/payments/obligations",
    fallbackError: "Failed to load pending payments.",
  });

  return data?.items || [];
};

export const fetchPaymentHistory = async () => {
  const data = await authenticatedApiRequest({
    path: "/payments/history",
    fallbackError: "Failed to load payment history.",
  });

  return data?.items || [];
};

export const fetchPaymentStatements = async () => {
  const data = await authenticatedApiRequest({
    path: "/payments/statements",
    fallbackError: "Failed to load payment statements.",
  });

  const existingItems = data?.items || [];
  if (existingItems.length > 0) {
    return existingItems;
  }

  const generated = await generatePaymentStatement();
  if (generated?.statement) {
    return [generated.statement];
  }

  return [];
};

export const generatePaymentStatement = async (monthYear, unitId) => {
  const data = await authenticatedApiRequest({
    path: "/payments/statements/generate",
    method: "POST",
    body: {
      month_year: monthYear || undefined,
      unit_id: unitId || undefined,
    },
    fallbackError: "Failed to generate payment statement.",
  });

  return data;
};
