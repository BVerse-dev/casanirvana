"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "../lib/supabase";
import type { Database } from "../lib/database.types";
import type { Service } from "./useServices";

type ServiceRequest = Database["public"]["Tables"]["service_requests"]["Row"] & {
  payment_status?: string | null;
};
type ServiceRequestInsert = Database["public"]["Tables"]["service_requests"]["Insert"];
type ServiceRequestUpdate = Database["public"]["Tables"]["service_requests"]["Update"] & {
  payment_status?: string | null;
};
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

type ServiceRequestWithRelations = ServiceRequest & {
  services?: (Service & { id?: string | number | null }) | null;
  units?: (Database["public"]["Tables"]["units"]["Row"] & {
    community?: Database["public"]["Tables"]["communities"]["Row"] | null;
  }) | null;
  user_profile?: Profile | null;
  assigned_profile?: Profile | null;
};

const SERVICE_REQUEST_SELECT = `
  *,
  services (
    *,
    communities:community_id(name)
  ),
  units (
    id,
    block,
    number,
    unit_number,
    community_id,
    community:communities!units_community_id_fkey (
      id,
      name,
      address
    )
  )
`;

let serviceRequestsChannel: ReturnType<typeof supabase.channel> | null = null;
let serviceRequestsSubscriberCount = 0;

export const formatServiceRequestStatusLabel = (value?: string | null) => {
  const normalized = value || "pending";
  return normalized
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

const fetchProfilesByActorIds = async (actorIds: string[]) => {
  if (!actorIds.length) {
    return new Map<string, Profile>();
  }

  const profileMap = new Map<string, Profile>();

  const { data: byUserIdProfiles } = await supabase
    .from("profiles")
    .select("id, user_id, first_name, last_name, email, phone, role, avatar_url")
    .in("user_id", actorIds);

  (byUserIdProfiles || []).forEach((profile) => {
    profileMap.set(profile.id, profile);
    if (profile.user_id) {
      profileMap.set(profile.user_id, profile);
    }
  });

  const unresolvedIds = actorIds.filter((id) => !profileMap.has(id));
  if (unresolvedIds.length > 0) {
    const { data: byIdProfiles } = await supabase
      .from("profiles")
      .select("id, user_id, first_name, last_name, email, phone, role, avatar_url")
      .in("id", unresolvedIds);

    (byIdProfiles || []).forEach((profile) => {
      profileMap.set(profile.id, profile);
      if (profile.user_id) {
        profileMap.set(profile.user_id, profile);
      }
    });
  }

  return profileMap;
};

const withRequesterProfiles = async (rows: ServiceRequestWithRelations[]) => {
  const actorIds = [
    ...new Set(rows.flatMap((row) => [row.user_id, row.created_by, row.assigned_to]).filter(Boolean)),
  ] as string[];
  const profileMap = await fetchProfilesByActorIds(actorIds);

  return rows.map((row) => ({
    ...row,
    user_profile:
      (row.user_id ? profileMap.get(row.user_id) : null) ||
      (row.created_by ? profileMap.get(row.created_by) : null) ||
      null,
    assigned_profile: row.assigned_to ? profileMap.get(row.assigned_to) || null : null,
  }));
};

const useServiceRequestsRealtime = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    serviceRequestsSubscriberCount += 1;

    if (!serviceRequestsChannel) {
      serviceRequestsChannel = supabase
        .channel("superadmin-service-requests")
        .on("postgres_changes", { event: "*", schema: "public", table: "service_requests" }, () => {
          queryClient.invalidateQueries({ queryKey: ["service_requests"] });
          queryClient.invalidateQueries({ queryKey: ["service_request"] });
        })
        .subscribe();
    }

    return () => {
      serviceRequestsSubscriberCount -= 1;

      if (serviceRequestsSubscriberCount <= 0 && serviceRequestsChannel) {
        supabase.removeChannel(serviceRequestsChannel);
        serviceRequestsChannel = null;
        serviceRequestsSubscriberCount = 0;
      }
    };
  }, [queryClient]);
};

export const useListServiceRequests = (serviceId?: string, status?: string, userId?: string) => {
  useServiceRequestsRealtime();

  return useQuery({
    queryKey: ["service_requests", serviceId || "all", status || "all", userId || "all"],
    queryFn: async (): Promise<ServiceRequestWithRelations[]> => {
      let query = supabase.from("service_requests").select(SERVICE_REQUEST_SELECT).order("created_at", { ascending: false });

      if (serviceId) {
        query = query.eq("service_id", serviceId);
      }
      if (status) {
        query = query.eq("status", status);
      }
      if (userId) {
        query = query.or(`user_id.eq.${userId},created_by.eq.${userId}`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return withRequesterProfiles((data || []) as ServiceRequestWithRelations[]);
    },
  });
};

export const useGetServiceRequest = (id: string) => {
  useServiceRequestsRealtime();

  return useQuery({
    queryKey: ["service_request", id],
    queryFn: async (): Promise<ServiceRequestWithRelations | null> => {
      const { data, error } = await supabase.from("service_requests").select(SERVICE_REQUEST_SELECT).eq("id", id).single();
      if (error) throw error;

      const rows = await withRequesterProfiles([data as ServiceRequestWithRelations]);
      return rows[0] || null;
    },
    enabled: Boolean(id),
  });
};

export const useCreateServiceRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ServiceRequestInsert) => {
      const { data: result, error } = await supabase.from("service_requests").insert(data).select().single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service_requests"] });
    },
  });
};

export const useUpdateServiceRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: ServiceRequestUpdate & { id: string }) => {
      const { data: result, error } = await supabase.from("service_requests").update(data).eq("id", id).select().single();
      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["service_requests"] });
      queryClient.invalidateQueries({ queryKey: ["service_request", variables.id] });
    },
  });
};

export const useDeleteServiceRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("service_requests").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service_requests"] });
    },
  });
};
