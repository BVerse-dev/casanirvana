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

// Mock data has been replaced with real database integration

// List all payments  
export const useListPayments = (unitId?: string, status?: string) => {
  return useQuery({
    queryKey: ["payments", unitId, status],
    queryFn: async () => {
      let query = supabase
        .from("payments")
        .select("*")
        .order("due_date", { ascending: false });
      
      if (unitId) {
        query = query.eq("unit_id", unitId);
      }
      
      if (status) {
        query = query.eq("status", status);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Manually fetch unit and profile data for each payment
      const paymentsWithProfiles = await Promise.all(
        (data || []).map(async (payment) => {
          let unit = null;
          let payer_profile = null;
          
          // Fetch unit data if unit_id exists
          if (payment.unit_id) {
            const { data: unitData } = await supabase
              .from("units")
              .select("id, unit_number, block, floor_area, bedrooms, bathrooms, community_id, owner_id, tenant_id")
              .eq("id", payment.unit_id)
              .single();
            
            if (unitData) {
              unit = unitData;
              
              // Fetch profile data if owner_id exists
              if (unitData.owner_id) {
                const { data: ownerProfile } = await supabase
                  .from("profiles")
                  .select("id, first_name, last_name, full_name, email, avatar_url, phone, role")
                  .eq("id", unitData.owner_id)
                  .single();
                
                if (ownerProfile) {
                  payer_profile = ownerProfile;
                }
              }
            }
          }
          
          return {
            ...payment,
            unit,
            payer_profile
          };
        })
      );
      
      return paymentsWithProfiles;
    },
  });
};

// Get single payment
export const useGetPayment = (id: string) => {
  return useQuery({
    queryKey: ["payments", id],
    queryFn: async () => {
      try {
        console.log("Fetching payment with ID:", id);
        
        // First get the payment
        const { data: payment, error: paymentError } = await supabase
          .from("payments")
          .select("*")
          .eq("id", id)
          .single();

        if (paymentError) {
          console.error("Payment query error:", paymentError);
          throw new Error(`Payment query failed: ${paymentError.message}`);
        }
        if (!payment) {
          throw new Error("Payment not found");
        }
        
        console.log("Payment found:", payment);
        
        // Manually fetch unit data if unit_id exists
        let unit = null;
        if (payment.unit_id) {
          console.log("Fetching unit with ID:", payment.unit_id);
          const { data: unitData, error: unitError } = await supabase
            .from("units")
            .select("id, unit_number, block, floor_area, bedrooms, bathrooms, community_id, owner_id, tenant_id")
            .eq("id", payment.unit_id)
            .single();
          
          if (unitError) {
            console.error("Unit query error:", unitError);
            // Don't throw here, just log and continue without unit data
          } else if (unitData) {
            unit = unitData;
            console.log("Unit found:", unit);
          }
        }
        
        // Manually fetch profile data
        let payer_profile = null;
        if (unit?.owner_id) {
          console.log("Fetching profile with ID:", unit.owner_id);
          const { data: ownerProfile, error: profileError } = await supabase
            .from("profiles")
            .select("id, first_name, last_name, full_name, email, avatar_url, phone, role")
            .eq("id", unit.owner_id)
            .single();
          
          if (profileError) {
            console.error("Profile query error:", profileError);
            // Don't throw here, just log and continue without profile data
          } else if (ownerProfile) {
            payer_profile = ownerProfile;
            console.log("Profile found:", payer_profile);
          }
        }
        
        // Manually fetch community data if needed
        let community = null;
        if (unit?.community_id) {
          console.log("Fetching community with ID:", unit.community_id);
          const { data: communityData, error: communityError } = await supabase
            .from("communities")
            .select("id, name, address")
            .eq("id", unit.community_id)
            .single();
          
          if (communityError) {
            console.error("Community query error:", communityError);
            // Don't throw here, just log and continue without community data
          } else if (communityData) {
            community = communityData;
            console.log("Community found:", community);
          }
        }
        
        const result = {
          ...payment,
          unit,
          payer_profile,
          community
        };
        
        console.log("Final payment result:", result);
        return result;
        
      } catch (error) {
        console.error("useGetPayment error:", error);
        throw error;
      }
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
