"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type ScopeFilters = {
  agency_id?: string;
  community_id?: string;
};

export type PayoutSummary = {
  scope: {
    role_scope: "platform" | "agency" | "community";
    agency_id: string | null;
    community_id: string | null;
  };
  balances: {
    amount: number;
    currency_code: string;
    currency_symbol: string;
    amount_formatted: string;
    available_amount: number;
    reserved_amount: number;
    paid_out_amount: number;
    eligible_revenue_amount: number;
  };
  counts: {
    pending_requests: number;
    contributing_communities: number;
    available_transactions: number;
    destinations: number;
    rules: number;
  };
};

export type PayoutTransaction = {
  id: string;
  title: string;
  source_type: string;
  payout_status: string;
  payment_gateway: string | null;
  reference_number: string | null;
  transaction_id: string | null;
  settled_at: string | null;
  community: { id: string; name: string | null } | null;
  agency: { id: string; name: string | null } | null;
  unit: { id: string; block: string | null; unit_number: string | null } | null;
  gross: { amount: number; currency_code: string; currency_symbol: string; amount_formatted: string };
  platform_fee: { amount: number; currency_code: string; currency_symbol: string; amount_formatted: string };
  community_share: { amount: number; currency_code: string; currency_symbol: string; amount_formatted: string };
  agency_share: { amount: number; currency_code: string; currency_symbol: string; amount_formatted: string };
  payout_eligible: { amount: number; currency_code: string; currency_symbol: string; amount_formatted: string };
  payout_reserved: { amount: number; currency_code: string; currency_symbol: string; amount_formatted: string };
  payout_paid_out: { amount: number; currency_code: string; currency_symbol: string; amount_formatted: string };
  payout_available: { amount: number; currency_code: string; currency_symbol: string; amount_formatted: string };
};

export type PayoutDestination = {
  id: string;
  agency_id: string;
  community_id: string | null;
  destination_type: "bank_account" | "mobile_money";
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
  status: "active" | "inactive" | "disabled" | null;
  agency?: { id: string; name: string | null } | null;
  community?: { id: string; name: string | null } | null;
};

export type PayoutRule = {
  id: string;
  agency_id: string | null;
  community_id: string | null;
  effective_from: string | null;
  community_share_mode: "fixed" | "percentage";
  community_share_value: number | string | null;
  agency_share_mode: "remainder" | "fixed" | "percentage";
  agency_share_value: number | string | null;
  platform_fee_mode: "fixed" | "percentage";
  platform_fee_value: number | string | null;
  is_active: boolean | null;
  agency?: { id: string; name: string | null } | null;
  community?: { id: string; name: string | null } | null;
};

export type PayoutRequest = {
  id: string;
  agency_id: string;
  community_id: string | null;
  destination_id: string;
  requested_amount: number | string;
  requested_amount_formatted: string;
  currency_code: string | null;
  status: string;
  requested_by: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  processed_at: string | null;
  reference_number: string | null;
  notes: string | null;
  failure_reason: string | null;
  created_at: string | null;
  updated_at: string | null;
  agency?: { id: string; name: string | null } | null;
  community?: { id: string; name: string | null } | null;
  destination?: Record<string, unknown> | null;
  item_count: number;
};

const useAdminFetch = () => {
  const { data: session } = useSession();
  const token = session?.accessToken as string | undefined;

  const fetchAdmin = async (path: string, options: RequestInit = {}) => {
    if (!token) {
      throw new Error("Missing admin session. Please sign in again.");
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || payload.message || "Request failed");
    }
    return payload;
  };

  return { fetchAdmin };
};

const buildScopeQuery = (filters: ScopeFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.agency_id) params.set("agency_id", filters.agency_id);
  if (filters.community_id) params.set("community_id", filters.community_id);
  return params.toString() ? `?${params.toString()}` : "";
};

export const usePayoutSummary = (filters: ScopeFilters = {}) => {
  const { fetchAdmin } = useAdminFetch();

  return useQuery({
    queryKey: ["payout-summary", filters],
    queryFn: async () => {
      const payload = await fetchAdmin(`/admin/payouts/summary${buildScopeQuery(filters)}`);
      return payload?.data as PayoutSummary;
    },
  });
};

export const usePayoutTransactions = (filters: ScopeFilters = {}) => {
  const { fetchAdmin } = useAdminFetch();

  return useQuery({
    queryKey: ["payout-transactions", filters],
    queryFn: async () => {
      const payload = await fetchAdmin(`/admin/payouts/transactions${buildScopeQuery(filters)}`);
      return (payload?.data?.items || []) as PayoutTransaction[];
    },
  });
};

export const usePayoutDestinations = (filters: ScopeFilters = {}) => {
  const { fetchAdmin } = useAdminFetch();

  return useQuery({
    queryKey: ["payout-destinations", filters],
    queryFn: async () => {
      const payload = await fetchAdmin(`/admin/payouts/destinations${buildScopeQuery(filters)}`);
      return (payload?.data?.items || []) as PayoutDestination[];
    },
  });
};

export const usePayoutRules = (filters: ScopeFilters = {}) => {
  const { fetchAdmin } = useAdminFetch();

  return useQuery({
    queryKey: ["payout-rules", filters],
    queryFn: async () => {
      const payload = await fetchAdmin(`/admin/payouts/rules${buildScopeQuery(filters)}`);
      return (payload?.data?.items || []) as PayoutRule[];
    },
  });
};

export const usePayoutRequests = (filters: ScopeFilters = {}) => {
  const { fetchAdmin } = useAdminFetch();

  return useQuery({
    queryKey: ["payout-requests", filters],
    queryFn: async () => {
      const payload = await fetchAdmin(`/admin/payouts/requests${buildScopeQuery(filters)}`);
      return (payload?.data?.items || []) as PayoutRequest[];
    },
  });
};

export const useCreatePayoutDestination = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async (input: Record<string, unknown>) => {
      const payload = await fetchAdmin("/admin/payouts/destinations", {
        method: "POST",
        body: JSON.stringify(input),
      });
      return payload?.data as PayoutDestination;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payout-destinations"] });
      queryClient.invalidateQueries({ queryKey: ["payout-summary"] });
    },
  });
};

export const useUpdatePayoutDestination = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Record<string, unknown> }) => {
      const payload = await fetchAdmin(`/admin/payouts/destinations/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      });
      return payload?.data as PayoutDestination;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payout-destinations"] });
      queryClient.invalidateQueries({ queryKey: ["payout-summary"] });
    },
  });
};

export const useUpsertPayoutRule = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async (input: Record<string, unknown>) => {
      const payload = await fetchAdmin("/admin/payouts/rules", {
        method: "POST",
        body: JSON.stringify(input),
      });
      return payload?.data as PayoutRule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payout-rules"] });
      queryClient.invalidateQueries({ queryKey: ["payout-transactions"] });
    },
  });
};

export const useCreatePayoutRequest = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async (input: Record<string, unknown>) => {
      const payload = await fetchAdmin("/admin/payouts/requests", {
        method: "POST",
        body: JSON.stringify(input),
      });
      return payload?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payout-requests"] });
      queryClient.invalidateQueries({ queryKey: ["payout-summary"] });
      queryClient.invalidateQueries({ queryKey: ["payout-transactions"] });
    },
  });
};

export const useUpdatePayoutRequestStatus = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async ({
      id,
      action,
      input,
    }: {
      id: string;
      action: "cancel" | "approve" | "reject" | "mark_processing" | "mark_paid" | "fail";
      input?: Record<string, unknown>;
    }) => {
      const payload = await fetchAdmin(`/admin/payouts/requests/${id}/${action}`, {
        method: "POST",
        body: JSON.stringify(input || {}),
      });
      return payload?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payout-requests"] });
      queryClient.invalidateQueries({ queryKey: ["payout-summary"] });
      queryClient.invalidateQueries({ queryKey: ["payout-transactions"] });
    },
  });
};
