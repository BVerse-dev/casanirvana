"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

type ChargeScope = "agency" | "community";
type ChargeType = "fixed" | "variable" | "formula";
type ChargeFrequency = "monthly" | "quarterly" | "yearly" | "one_time" | "custom_period";
type LateFeeType = "none" | "fixed" | "percentage";
type TargetType =
  | "all_units"
  | "unit_ids"
  | "blocks"
  | "unit_types"
  | "occupied_only"
  | "owner_only"
  | "tenant_only"
  | "exclude_unit_ids";
type RunMode = "manual" | "scheduled";
type RunStatus = "draft" | "previewed" | "issued" | "cancelled";

export type PaymentChargeCatalogItem = {
  key: string;
  label: string;
  category: string;
  defaultChargeType: ChargeType;
  defaultFrequency: ChargeFrequency;
  description: string;
};

export type PaymentChargeTargetInput = {
  target_type: TargetType;
  target_value?: string | string[] | Record<string, unknown>;
};

export type PaymentChargeTemplateInput = {
  scope_level: ChargeScope;
  agency_id?: string | null;
  community_id?: string | null;
  name: string;
  charge_code: string;
  catalog_key: string;
  category: string;
  charge_type: ChargeType;
  amount: number;
  currency_code?: string | null;
  billing_frequency: ChargeFrequency;
  billing_anchor_day?: number | null;
  billing_anchor_month?: number | null;
  start_date?: string | null;
  due_offset_days?: number | null;
  grace_period_days?: number | null;
  late_fee_type?: LateFeeType | null;
  late_fee_value?: number | null;
  auto_issue?: boolean;
  requires_approval?: boolean;
  is_active?: boolean;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
  targets?: PaymentChargeTargetInput[];
};

export type PaymentChargeTemplate = PaymentChargeTemplateInput & {
  id: string;
  amount_formatted?: string;
  created_at?: string | null;
  updated_at?: string | null;
  catalog?: PaymentChargeCatalogItem | null;
  agency?: { id: string; name: string | null } | null;
  community?: { id: string; name: string | null } | null;
  targets?: Array<{
    id: string;
    template_id: string;
    target_type: TargetType;
    target_value: unknown;
    created_at?: string | null;
    updated_at?: string | null;
  }>;
};

export type PaymentChargePreviewRequest = {
  community_id?: string | null;
  unit_ids?: string[];
  billing_period_start?: string | null;
  billing_period_end?: string | null;
  due_date?: string | null;
  run_mode?: RunMode;
};

export type PaymentChargePreview = {
  template: PaymentChargeTemplate;
  community: { id: string; name: string | null };
  due_date: string;
  billing_period_start: string;
  billing_period_end: string;
  run_mode: RunMode;
  summary: {
    targeted_units: number;
    existing_obligations: number;
    units_to_issue: number;
    total_amount: number;
    total_amount_formatted: string;
    currency_code: string;
    currency_symbol: string;
  };
  items: Array<{
    unit_id: string;
    unit_label: string;
    block: string | null;
    unit_type: string | null;
    amount: number;
    amount_formatted: string;
    invoice_number: string;
    line_items: Array<Record<string, unknown>>;
    existing_obligation_id: string | null;
  }>;
};

export type PaymentChargeRun = {
  id: string;
  template_id: string;
  scope_level: ChargeScope;
  agency_id: string | null;
  community_id: string;
  run_mode: RunMode;
  billing_period_start: string | null;
  billing_period_end: string | null;
  due_date: string;
  status: RunStatus;
  issued_by: string | null;
  issued_at: string | null;
  summary_counts?: Record<string, unknown> | null;
  summary_amounts?: Record<string, unknown> | null;
  created_at?: string | null;
  updated_at?: string | null;
  template?: {
    id: string;
    name: string;
    charge_code: string;
    category: string;
  } | null;
  agency?: { id: string; name: string | null } | null;
  community?: { id: string; name: string | null } | null;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

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

export const usePaymentChargeCatalog = () => {
  const { fetchAdmin } = useAdminFetch();

  return useQuery({
    queryKey: ["payment-charge-catalog"],
    queryFn: async () => {
      const payload = await fetchAdmin("/admin/payment-charges/catalog");
      return (payload?.data?.items || []) as PaymentChargeCatalogItem[];
    },
  });
};

export const usePaymentChargeTemplates = (filters: {
  scope_level?: ChargeScope;
  agency_id?: string;
  community_id?: string;
  include_inactive?: boolean;
} = {}) => {
  const { fetchAdmin } = useAdminFetch();

  return useQuery({
    queryKey: ["payment-charge-templates", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.scope_level) params.set("scope_level", filters.scope_level);
      if (filters.agency_id) params.set("agency_id", filters.agency_id);
      if (filters.community_id) params.set("community_id", filters.community_id);
      if (filters.include_inactive) params.set("include_inactive", "true");

      const payload = await fetchAdmin(
        `/admin/payment-charges/templates${params.toString() ? `?${params.toString()}` : ""}`
      );
      return (payload?.data?.items || []) as PaymentChargeTemplate[];
    },
  });
};

export const useCreatePaymentChargeTemplate = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async (input: PaymentChargeTemplateInput) => {
      const payload = await fetchAdmin("/admin/payment-charges/templates", {
        method: "POST",
        body: JSON.stringify(input),
      });
      return payload?.data as PaymentChargeTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-charge-templates"] });
      queryClient.invalidateQueries({ queryKey: ["payment-charge-runs"] });
      queryClient.invalidateQueries({ queryKey: ["payment-obligations"] });
    },
  });
};

export const useUpdatePaymentChargeTemplate = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: Partial<PaymentChargeTemplateInput>;
    }) => {
      const payload = await fetchAdmin(`/admin/payment-charges/templates/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      });
      return payload?.data as PaymentChargeTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-charge-templates"] });
      queryClient.invalidateQueries({ queryKey: ["payment-charge-runs"] });
      queryClient.invalidateQueries({ queryKey: ["payment-obligations"] });
    },
  });
};

export const usePreviewPaymentChargeTemplate = () => {
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: PaymentChargePreviewRequest }) => {
      const payload = await fetchAdmin(`/admin/payment-charges/templates/${id}/preview`, {
        method: "POST",
        body: JSON.stringify(input),
      });
      return payload?.data as PaymentChargePreview;
    },
  });
};

export const useIssuePaymentChargeTemplate = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: PaymentChargePreviewRequest }) => {
      const payload = await fetchAdmin(`/admin/payment-charges/templates/${id}/issue`, {
        method: "POST",
        body: JSON.stringify(input),
      });
      return payload?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-charge-runs"] });
      queryClient.invalidateQueries({ queryKey: ["payment-charge-templates"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payment-obligations"] });
    },
  });
};

export const usePaymentChargeRuns = (filters: {
  community_id?: string;
  template_id?: string;
  status?: RunStatus;
} = {}) => {
  const { fetchAdmin } = useAdminFetch();

  return useQuery({
    queryKey: ["payment-charge-runs", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.community_id) params.set("community_id", filters.community_id);
      if (filters.template_id) params.set("template_id", filters.template_id);
      if (filters.status) params.set("status", filters.status);

      const payload = await fetchAdmin(
        `/admin/payment-charges/runs${params.toString() ? `?${params.toString()}` : ""}`
      );
      return (payload?.data?.items || []) as PaymentChargeRun[];
    },
  });
};

export const usePaymentChargeRun = (id?: string | null) => {
  const { fetchAdmin } = useAdminFetch();

  return useQuery({
    queryKey: ["payment-charge-runs", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const payload = await fetchAdmin(`/admin/payment-charges/runs/${id}`);
      return payload?.data as {
        run: PaymentChargeRun;
        obligations: Array<Record<string, unknown>>;
      };
    },
  });
};

export const useRunDuePaymentCharges = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async (input: { community_id?: string | null; agency_id?: string | null } = {}) => {
      const payload = await fetchAdmin("/admin/payment-charges/run-due", {
        method: "POST",
        body: JSON.stringify(input),
      });
      return payload?.data as {
        processed_templates: number;
        created_runs: number;
        runs: Array<Record<string, unknown>>;
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-charge-runs"] });
      queryClient.invalidateQueries({ queryKey: ["payment-charge-templates"] });
      queryClient.invalidateQueries({ queryKey: ["payment-obligations"] });
    },
  });
};
