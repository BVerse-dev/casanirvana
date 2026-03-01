"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { supabase } from '../lib/supabase';
import type { Database } from "../lib/database.types";
import { useEffect } from "react";

type Payment = Database["public"]["Tables"]["payments"]["Row"];
type PaymentInsert = Database["public"]["Tables"]["payments"]["Insert"];
type PaymentUpdate = Database["public"]["Tables"]["payments"]["Update"];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const useAdminFetch = () => {
  const { data: session } = useSession();
  const token = session?.accessToken as string | undefined;

  const fetchAdmin = async (path: string, options: RequestInit = {}) => {
    if (!token) {
      throw new Error('Missing admin session. Please sign in again.');
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || payload.message || 'Request failed');
    }
    return payload;
  };

  return { fetchAdmin };
};

const normalizePaymentRecord = (payment: Record<string, any>) => {
  const unit = payment?.unit
    ? {
        ...payment.unit,
        unit_number: payment.unit?.unit_number || payment.unit?.number || null,
      }
    : null;

  const payer_profile = payment?.payer
    ? {
        ...payment.payer,
        full_name: payment.payer?.name || payment.payer?.full_name || null,
        avatar_url: payment.payer?.avatar_url || null,
      }
    : payment?.payer_profile || null;

  const society = payment?.community
    ? {
        ...payment.community,
        address: payment.community?.address || null,
      }
    : payment?.society || null;

  return {
    ...payment,
    unit,
    payer_profile,
    society,
  };
};

const normalizePaymentObligationRecord = (obligation: Record<string, any>) => {
  const unit = obligation?.unit
    ? {
        ...obligation.unit,
        unit_number: obligation.unit?.unit_number || obligation.unit?.number || null,
      }
    : null;

  return {
    ...obligation,
    unit,
  };
};

// Mock data has been replaced with real database integration

// List all payments  
export const useListPayments = (unitId?: string, status?: string) => {
  const { fetchAdmin } = useAdminFetch();

  return useQuery({
    queryKey: ["payments", unitId, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (unitId) params.set("unit_id", unitId);
      if (status) params.set("status", status);

      const payload = await fetchAdmin(
        `/admin/payments/transactions${params.toString() ? `?${params.toString()}` : ""}`
      );

      return (payload?.data?.items || []).map((payment: Record<string, any>) =>
        normalizePaymentRecord(payment)
      );
    },
  });
};

export const useListPaymentObligations = (unitId?: string, status?: string) => {
  const { fetchAdmin } = useAdminFetch();

  return useQuery({
    queryKey: ["payment-obligations", unitId, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (unitId) params.set("unit_id", unitId);
      if (status) params.set("status", status);

      const payload = await fetchAdmin(
        `/admin/payments/obligations${params.toString() ? `?${params.toString()}` : ""}`
      );

      return (payload?.data?.items || []).map((obligation: Record<string, any>) =>
        normalizePaymentObligationRecord(obligation)
      );
    },
  });
};

export const useListPaymentStatements = (unitId?: string) => {
  const { fetchAdmin } = useAdminFetch();

  return useQuery({
    queryKey: ["payment-statements", unitId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (unitId) params.set("unit_id", unitId);

      const payload = await fetchAdmin(
        `/admin/payments/statements${params.toString() ? `?${params.toString()}` : ""}`
      );

      return payload?.data?.items || [];
    },
  });
};

// Get single payment
export const useGetPayment = (id: string) => {
  const { fetchAdmin } = useAdminFetch();

  return useQuery({
    queryKey: ["payments", id],
    queryFn: async () => {
      const payload = await fetchAdmin(`/admin/payments/transactions/${id}`);
      return normalizePaymentRecord(payload?.data || {});
    },
    enabled: !!id,
  });
};

// Create payment
export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async (newPayment: PaymentInsert) => {
      return fetchAdmin('/admin/payments', {
        method: 'POST',
        body: JSON.stringify(newPayment),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
};

// Update payment
export const useUpdatePayment = (id: string) => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async (updates: PaymentUpdate) => {
      return fetchAdmin(`/admin/payments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payments", id] });
    },
  });
};

// Delete payment
export const useDeletePayment = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async (id: string) => {
      await fetchAdmin(`/admin/payments/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
};

// Real-time subscription for payments
export const usePaymentsSubscription = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('payments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["payments"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
